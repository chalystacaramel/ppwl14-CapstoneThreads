import { Elysia, t } from 'elysia';
import type { DbClient } from "../types";
import { deleteS3File, uploadS3File } from '../lib/s3';
import { authMiddleware } from './authMiddleware';

const { NotificationType } = await import(`../generated/prisma${process.env.NODE_ENV === "dev" ? '' : 'pg'}/client`);

export const postRoutes = (getPrisma: () => DbClient) =>
    new Elysia({ prefix: '/post' })
        .use(authMiddleware) // middleware verifikasi token & ambil user
        // ==========================================
        // 1. BUAT POSTINGAN BARU
        // ==========================================
        .post('/', async ({ user, body, set }) => { // user dari middleware
            const { content, image } = body;
            try {
                const newPost = await getPrisma().post.create({
                    data: {
                        user_id: Number(user.id),
                        content,
                        image_url: image ? await uploadS3File(image) : null
                    }
                });
                return { success: true, message: "Postingan berhasil dibuat", data: newPost };
            } catch (error) {
                set.status = 500;
                return { success: false, message: "Gagal membuat postingan", detail: (error as Error).message };
            }
        }, {
            body: t.Object({
                content: t.String(),
                image: t.Optional(t.File())
            })
        })

        // ==========================================
        // 2. EDIT POSTINGAN
        // ==========================================
        .patch('/:id', async ({ params, body, set }) => {
            const { id } = params;
            const { content, image_new, remove_image } = body;
            let message = "";

            try {
                const prisma = getPrisma();

                const oldPost = await prisma.post.findUnique({
                    where: { id: Number(id) },
                });

                if (!oldPost) {
                    throw new Error("Post not found");
                }

                let newImageUrl: string | null | undefined = undefined;


                // 1. HAPUS IMAGE SAJA (tanpa upload baru)
                if (remove_image === 'yes' && oldPost.image_url) {
                    message += " [DELETE IMAGE]";
                    await deleteS3File(oldPost.image_url);
                    newImageUrl = null;
                }

                // 2. UPLOAD IMAGE BARU (overwrite lama)
                if (image_new) {
                    message += " [NEW IMAGE]";
                    if (oldPost.image_url) {
                        await deleteS3File(oldPost.image_url);
                    }

                    newImageUrl = await uploadS3File(image_new);
                }

                const updatedPost = await prisma.post.update({
                    where: { id: Number(id) },
                    data: {
                        content,
                        ...(newImageUrl !== undefined && {
                            image_url: newImageUrl,
                        }),
                    },
                });

                return {
                    success: true,
                    message: "Postingan berhasil diperbarui" + message,
                    data: updatedPost,
                };
            } catch (error) {
                set.status = 500;

                return {
                    success: false,
                    message: "Gagal memperbarui postingan" + message,
                    detail: (error as Error).message,
                };
            }
        }, {
            params: t.Object({ id: t.String() }),
            body: t.Object({
                content: t.String(),
                image_new: t.Optional(t.File()),
                remove_image: t.Optional(t.Literal('yes')) // jika sekadar hapus img lama 
                // (pakai FormData jadi tidak bisa boolean)
            })
        })
        .delete('/:id', async ({ params, set }) => {
            const { id } = params;
            try {
                await getPrisma().post.delete({
                    where: { id: Number(id) }
                });
                return { success: true, message: "Post Deleted" };
            } catch (error) {
                set.status = 500;
                return { success: false, message: (error as Error).message };
            }
        }, {
            params: t.Object({ id: t.String() })
        })
        // ==========================================
        // 5. CREATE LIKE (BERI LIKE)
        // ==========================================
        .post('/:id/like', async ({ user, params, set }) => {
            const { id } = params;
            const post_id = Number(id);
            try {
                const targetPost = await getPrisma().post.findUnique({
                    where: { id: post_id }
                });

                if (!targetPost) {
                    set.status = 404;
                    return { success: false, message: "Postingan tidak ditemukan" };
                }

                // Gunakan upsert untuk mencegah double-like error jika user nge-spam klik
                const newLike = await getPrisma().postLike.upsert({
                    where: {
                        post_id_user_id: { post_id, user_id: user.id }
                    },
                    update: {}, // Jika sudah dilike, abaikan (tidak terjadi apa-apa)
                    create: { post_id, user_id: user.id }
                });

                // Kirim notifikasi jika pencet like ke postingan orang lain
                if (targetPost.user_id !== user.id) {
                    await getPrisma().notification.create({
                        data: {
                            user_id: targetPost.user_id,
                            actor_id: user.id,
                            type: NotificationType.like, // atau 'like' jika string literal
                            post_id: targetPost.id
                        }
                    });
                }

                return { success: true, message: "Postingan disukai", data: newLike };
            } catch (error) {
                set.status = 500;
                return { success: false, message: "Gagal menyukai postingan", detail: (error as Error).message };
            }
        }, {
            params: t.Object({ id: t.String() })
        })

        // ==========================================
        // 6. REMOVE LIKE (BATAL LIKE / UNLIKE BY ID LIKE)
        // ==========================================
        .delete('/like/:id', async ({ params, set }) => {
            const { id } = params;
            try {
                await getPrisma().postLike.delete({
                    where: { id: Number(id) }
                });
                return { success: true, message: "Batal menyukai postingan (Unlike sukses)" };
            } catch (error) {
                set.status = 500;
                return { success: false, message: "Gagal membatalkan like", detail: (error as Error).message };
            }
        }, {
            params: t.Object({ id: t.String() })
        });