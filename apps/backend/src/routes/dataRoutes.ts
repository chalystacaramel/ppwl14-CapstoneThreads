// seluruh route GET, dikelompokkan agar dapat diakses di browser (cek data ada atau terisi) 
import { Elysia, t } from "elysia";
import type { DbClient } from "../types";
import { jwtConfig } from '../lib/jwt';

async function getUserId(jwt: any, headers: Record<string, string | undefined>) {
    let currentUserId: number | null = null;

    // 1. Ambil token dari header Authorization (Format: Bearer <token>)
    const authHeader = headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];

        // Verifikasi token JWT
        const payload = await jwt.verify(token);
        if (payload && payload) {
            currentUserId = Number(payload.id);
        }
    }
    return currentUserId;
}

export const dataRoutes = (getPrisma: () => DbClient) =>
    new Elysia({ prefix: "/data" }) // Otomatis menambahkan prefix /data di semua rute di dalam file ini
        .use(jwtConfig)
        // Middleware khusus untuk grup /data
        .onRequest(({ request, set }) => {
            const url = new URL(request.url);
            console.log(`[DEBUG] [${request.method}] ${url.pathname}`);

            // [?] AWS_LAMBDA_FUNCTION_NAME adalah variabel yang otomatis ada di Lambda
            console.log("[DEBUG] AWS_LAMBDA_FUNCTION_NAME ", process.env.AWS_LAMBDA_FUNCTION_NAME);
            if (!process.env.AWS_LAMBDA_FUNCTION_NAME) return; // di local auto skip

            // Lewati preflight OPTIONS
            if (request.method === "OPTIONS") return;

            // Sisa pengecekan origin dan API Key
            const origin = request.headers.get("origin");
            const frontendUrl = process.env.FRONTEND_URL!;
            const key = url.searchParams.get("key");

            if (origin === frontendUrl) return;

            const apiKey = process.env.API_KEY!;
            if (key !== apiKey) {
                set.status = 401;
                return { message: "Unauthorized: Access denied without valid API Key" };
            }
        })
        // Rute-rute /data (tidak perlu menuliskan "/data" lagi karena sudah memakai prefix)
        // 2. [Beranda] GET ALL POSTS atau Jika user sudah login (tambahkan status post like)
        .get("/posts", async ({ jwt, headers, set }) => {
            try {
                const userId = await getUserId(jwt, headers);

                // 2. Query ke Prisma menggunakan userId yang didapat (jika ada)
                const data = await getPrisma().post.findMany({
                    include: {
                        user: true, // Relasi ke pembuat post

                        // Ambil 1 detail like dari saya jika ada
                        likes: userId ? {
                            where: {
                                user_id: userId
                            }
                        } : false,

                        // Tambahkan properti _count untuk menghitung TOTAL LIKE asli dari database
                        // Ini menjaga performa database tetap kencang!
                        _count: {
                            select: {
                                likes: true,   // Menghitung total semua yang me-like post ini
                                comments: true // Menghitung total semua komentar di post ini
                            }
                        }
                    },
                    orderBy: {
                        created_at: 'desc' // Urutkan dari yang terbaru
                    }
                });

                return {
                    success: true,
                    data
                };
            } catch (err) {
                set.status = 500;

                return {
                    success: false,
                    message: (err as Error).message,
                }
            }
        })
        // [ketika comment di click] SINGLE POST by Id
        .get("/post/:id", async ({ params, jwt, headers, set }) => {
            const { id } = params;

            try {
                const userId = await getUserId(jwt, headers);

                const data = await getPrisma().post.findUnique({
                    where: {
                        id: Number(id),
                    },
                    include: {
                        user: true,
                        comments: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        username: true,
                                        avatar_url: true,
                                    },
                                },
                            },
                        },
                        likes: userId ? {
                            where: { user_id: userId }
                        } : false,
                        _count: {
                            select: {
                                likes: true,
                                comments: true,
                            }
                        }
                    }
                });
                return { data, message: "Posts retrieved successfully" };

            } catch (err) {
                set.status = 500;

                return {
                    success: false,
                    message: (err as Error).message,
                }
            }
        })

        // Notification By User Id
        .get("/user/:userId/notif", async ({ params, set }) => {
            try {
                const { userId } = params;

                // 1. Cek apakah user yang dicari datanya ada
                const userExists = await getPrisma().user.findUnique({
                    where: { id: userId },
                    select: { id: true }
                });

                if (!userExists) {
                    set.status = 404;
                    return {
                        success: false,
                        message: "User tidak ditemukan"
                    };
                }

                // 2. Mengambil data notifikasi milik user tersebut
                const notifications = await getPrisma().notification.findMany({
                    where: {
                        user_id: userId
                    },
                    include: {
                        // Mengambil info user yang melakukan aksi (like/comment/follow)
                        actor: {
                            select: {
                                id: true,
                                name: true,
                                username: true,
                                avatar_url: true
                            }
                        },
                        // Jika notifikasi terkait post, ambil sedikit infonya
                        post: {
                            select: {
                                id: true,
                                content: true,
                                image_url: true
                            }
                        },
                        // Jika notifikasi terkait comment, ambil isi komentarnya
                        comment: {
                            select: {
                                id: true,
                                content: true
                            }
                        }
                    },
                    orderBy: {
                        created_at: 'desc' // Notifikasi terbaru muncul di atas
                    }
                });

                return {
                    success: true,
                    message: "Berhasil mengambil data notifikasi",
                    data: notifications
                };

            } catch (error) {
                set.status = 500;
                return {
                    success: false,
                    message: (error as Error).message
                };
            }
        }, {
            // Validasi parameter URL menggunakan TypeBox bawaan Elysia
            params: t.Object({
                userId: t.Numeric({ error: "User ID harus berupa angka" })
            })
        })
        .get('/user/:userId/notif-unread-count', async ({ params, set }) => {
            try {
                const { userId } = params;

                // Menghitung jumlah notifikasi yang memenuhi kriteria
                const unreadCount = await getPrisma().notification.count({
                    where: {
                        user_id: userId,
                        is_read: false
                    }
                });

                return {
                    success: true,
                    count: unreadCount
                };

            } catch (err) {
                set.status = 500;
                return {
                    success: false,
                    message: (err as Error).message
                };
            }
        }, {
            // Validasi parameter URL agar wajib berupa angka
            params: t.Object({
                userId: t.Numeric({ error: "User ID harus berupa angka" })
            })
        })
        // GET ALL USERS [Debug]
        .get("/users", async () => {
            const data = await getPrisma().user.findMany();
            return { data, message: "Users retrieved successfully" };
        })

        // GET ALL POST LIKES
        .get("/postlikes", async () => {
            const data = await getPrisma().postLike.findMany();
            return { data, message: "Post likes retrieved successfully" };
        })

        // GET ALL COMMENTS
        .get("/comments", async () => {
            const data = await getPrisma().comment.findMany();
            return { data, message: "Comments retrieved successfully" };
        })

        // GET ALL NOTIFICATIONS
        .get("/notifications", async () => {
            const data = await getPrisma().notification.findMany();
            return { data, message: "Notifications retrieved successfully" };
        });