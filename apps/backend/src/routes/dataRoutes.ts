import { Elysia, t } from "elysia";
import type { DbClient } from "../types";
import { jwtConfig } from '../lib/jwt';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Inisialisasi AWS S3 Client dengan fallback wilayah jika .env belum dimuat
const s3 = new S3Client({ region: process.env.AWS_REGION || "us-east-1" });

// Helper tunggal untuk mengambil ID User dari JWT Token
async function getUserId(jwt: any, headers: Record<string, string | undefined>) {
    let currentUserId: number | null = null;

    const authHeader = headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];

        const payload = await jwt.verify(token);
        if (payload) {
            currentUserId = Number(payload.id);
        }
    }
    return currentUserId;
}

export const dataRoutes = (getPrisma: () => DbClient) =>
    new Elysia({ prefix: "/data" }) 
        .use(jwtConfig)
        .guard({
            beforeHandle: ({ request, set }) => {
                const url = new URL(request.url);
                console.log(`[DEBUG] [${request.method}] ${url.pathname}`);

                if (request.method === "OPTIONS") return;

                const origin = request.headers.get("origin");
                const frontendUrl = process.env.FRONTEND_URL!;
                const key = url.searchParams.get("key");

                // Jika request datang dari Frontend resmi, izinkan lewat
                if (origin === frontendUrl) return;

                // Validasi API Key untuk request non-frontend (misal: Insomnia, Postman, service lain)
                const apiKey = process.env.API_KEY!;
                if (key !== apiKey) {
                    set.status = 401;
                    return { message: "Unauthorized: Access denied without valid API Key" };
                }
            }
        }, (app) =>
            // 👇 Semua rute di dalam callback ini otomatis terlindungi oleh beforeHandle di atas
            app

        // ── 1. GET ALL POSTS ──────────────────────────────────────────
        .get("/posts", async ({ jwt, headers, set }) => {
            try {
                const userId = await getUserId(jwt, headers);
                const data = await getPrisma().post.findMany({
                    include: {
                        user: true, 
                        likes: userId ? { where: { userId: userId } } : false,
                        _count: { select: { likes: true, comments: true } }
                    },
                    orderBy: { createdAt: 'desc' }
                });
                return { success: true, data };
            } catch (err) {
                set.status = 500;
                return { success: false, message: (err as Error).message }
            }
        })

        // ── 2. SINGLE POST BY ID ──────────────────────────────────────
        .get("/posts/:id", async ({ params, jwt, headers, set }) => {
            const { id } = params;
            try {
                const userId = await getUserId(jwt, headers);
                const data = await getPrisma().post.findUnique({
                    where: { id: Number(id) },
                    include: {
                        user: true,
                        comments: { include: { user: { select: { id: true, name: true, avatar_url: true } } } },
                        likes: userId ? { where: { userId } } : false,
                        _count: { select: { likes: true, comments: true } }
                    }
                });
                return { data, message: "Posts retrieved successfully" };
            } catch (err) {
                set.status = 500;
                return { success: false, message: (err as Error).message }
            }
        })

        // ── 3. UPDATE POST (PUT) ──────────────────────────────────────
        .put(
            "/posts/:id", 
            async ({ params, body, headers, jwt, set }) => {
                const currentUserId = await getUserId(jwt, headers);
                if (!currentUserId) { set.status = 401; return { message: "Unauthorized" } }

                const db = getPrisma() as any;
                const postId = parseInt(params.id);

                const post = await db.post.findUnique({ where: { id: postId } });
                if (!post) { set.status = 404; return { message: "Post tidak ditemukan" } }
                
                if (post.userId !== currentUserId) { set.status = 403; return { message: "Bukan milik kamu" } }

                const { content, image, remove_image } = body as any;
                let image_url: string | null = post.image_url ?? null;

                // Tentukan nama bucket & region cadangan secara eksplisit agar aman dari undefined
                const bucketName = process.env.AWS_BUCKET_NAME || "ppwl11-images";
                const regionName = process.env.AWS_REGION || "us-east-1";

                // Logika Upload Gambar Baru ke S3
                if (image && image instanceof File && image.size > 0) {
                    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
                    if (!allowed.includes(image.type)) {
                        set.status = 400;
                        return { message: "Tipe file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP." };
                    }
                    if (image.size > 5 * 1024 * 1024) {
                        set.status = 400;
                        return { message: "Ukuran gambar maksimal 5MB" };
                    }

                    const buffer = Buffer.from(await image.arrayBuffer());
                    const ext = image.type.split("/")[1];
                    const key = `posts/${currentUserId}-${Date.now()}.${ext}`;

                    if (post.image_url) {
                        try {
                            const oldKey = post.image_url.split(".amazonaws.com/")[1];
                            await s3.send(new DeleteObjectCommand({
                                Bucket: bucketName,
                                Key: oldKey,
                            }));
                        } catch (e) {
                            console.warn("[POST_EDIT] Gagal hapus gambar lama:", e);
                        }
                    }

                    await s3.send(new PutObjectCommand({
                        Bucket: bucketName,
                        Key: key,
                        Body: buffer,
                        ContentType: image.type,
                    }));
                    
                    image_url = `https://${bucketName}.s3.${regionName}.amazonaws.com/${key}`;

                // Logika Hapus Gambar Tersemat
                } else if (remove_image === "yes") {
                    if (post.image_url) {
                        try {
                            const oldKey = post.image_url.split(".amazonaws.com/")[1];
                            await s3.send(new DeleteObjectCommand({
                                Bucket: bucketName,
                                Key: oldKey,
                            }));
                        } catch (e) {
                            console.warn("[POST_EDIT] Gagal hapus gambar:", e);
                        }
                    }
                    image_url = null;
                }

                const updated = await db.post.update({
                    where: { id: postId },
                    data: { content, image_url },
                });

                return {
                    id: String(updated.id),
                    content: updated.content,
                    imageUrl: updated.image_url ?? null
                };
            },
            {
                body: t.Object({
                    content: t.String({ minLength: 1 }),
                    image: t.Optional(t.File()),
                    remove_image: t.Optional(t.String()),
                }),
            }
        )

        // ── 4. NOTIFICATION BY USER ID ────────────────────────────────
        .get("/users/:userId/notif", async ({ params, set }) => {
            try {
                const { userId } = params;
                const userExists = await getPrisma().user.findUnique({
                    where: { id: userId },
                    select: { id: true }
                });

                if (!userExists) {
                    set.status = 404;
                    return { success: false, message: "User tidak ditemukan" };
                }

                const notifications = await getPrisma().notification.findMany({
                    where: { user_id: userId },
                    include: {
                        actor: { select: { id: true, name: true, username: true, avatar_url: true } },
                        post: { select: { id: true, content: true, image_url: true } },
                        comment: { select: { id: true, content: true } }
                    },
                    orderBy: { created_at: 'desc' }
                });

                return { success: true, message: "Berhasil mengambil data notifikasi", data: notifications };
            } catch (error) {
                set.status = 500;
                return { success: false, message: (error as Error).message };
            }
        }, {
            params: t.Object({ userId: t.Numeric({ error: "User ID harus berupa angka" }) })
        })

        // ── 5. NOTIF UNREAD COUNT ─────────────────────────────────────
        .get('/users/:userId/notif-unread-count', async ({ params, set }) => {
            try {
                const { userId } = params;
                const unreadCount = await getPrisma().notification.count({
                    where: { user_id: userId, is_read: false }
                });
                return { success: true, count: unreadCount };
            } catch (err) {
                set.status = 500;
                return { success: false, message: (err as Error).message };
            }
        }, {
            params: t.Object({ userId: t.Numeric({ error: "User ID harus berupa angka" }) })
        })

        // ── 6. DEBUG ROUTE (USERS, LIKES, COMMENTS, NOTIFS) ───────────
        .get("/users", async () => {
            const data = await getPrisma().user.findMany();
            return { data, message: "Users retrieved successfully" };
        })
        .get("/postlikes", async () => {
            const data = await getPrisma().postLike.findMany();
            return { data, message: "Post likes retrieved successfully" };
        })
        .get("/comments", async () => {
            const data = await getPrisma().comment.findMany();
            return { data, message: "Comments retrieved successfully" };
        })
        .get("/notifications", async () => {
            const data = await getPrisma().notification.findMany();
            return { data, message: "Notifications retrieved successfully" };
        })
    );