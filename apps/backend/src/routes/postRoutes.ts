import { Elysia, t } from 'elysia';
import type { DbClient } from "../types";
import { deleteS3File, uploadS3File } from '../lib/s3';
import { authMiddleware } from './authMiddleware';

const { NotificationType } = await import(`../generated/prisma${process.env.NODE_ENV === "dev" ? '' : 'pg'}/client`);

export const postRoutes = (getPrisma: () => DbClient) =>
    new Elysia({ prefix: '/posts' })
        .use(authMiddleware) // middleware verifikasi token & ambil user

        // ==========================================
        // 1. BUAT POSTINGAN BARU
        // ==========================================
        .post('/', async ({ user, body, set }) => {
            const { content, image } = body;

            try {
                const newPost = await getPrisma().post.create({
                    data: {
                        userId: Number(user.id),
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
                remove_image: t.Optional(t.Literal('yes'))
            })
        })

        // ==========================================
        // 3. HAPUS POSTINGAN
        // ==========================================
        .delete('/:id', async ({ params, set }) => {
            const { id } = params;
            try {
                const postId = Number(id);
                const db = getPrisma() as any;

                // Hapus relasi manual (untuk SQLite yang kadang tidak enforce cascade)
                await db.notification.deleteMany({ where: { postId } });
                await db.postLike.deleteMany({ where: { postId } });
                await db.comment.deleteMany({ where: { postId } });
                await db.post.delete({ where: { id: postId } });

                return { success: true, message: "Post Deleted" };
            } catch (error) {
                set.status = 500;
                return { success: false, message: (error as Error).message };
            }
        }, {
            params: t.Object({ id: t.String() })
        })

        // ==========================================
        // 4. LIKE POSTINGAN
        // ==========================================
        .post('/:id/like', async ({ user, params, set }) => {
            const postId = Number(params.id);
            const userId = Number(user.id);
            try {
                const targetPost = await getPrisma().post.findUnique({
                    where: { id: postId }
                });

                if (!targetPost) {
                    set.status = 404;
                    return { success: false, message: "Postingan tidak ditemukan" };
                }

                const newLike = await getPrisma().postLike.upsert({
                    where: {
                        userId_postId: { userId, postId }  // ✅ camelCase
                    },
                    update: {},
                    create: { postId, userId }              // ✅ camelCase
                });

                if (targetPost.userId !== userId) {         // ✅ userId bukan user_id
                    await getPrisma().notification.create({
                        data: {
                            userId: targetPost.userId,     // sesuaikan dengan schema Notification
                            actorId: userId,
                            type: NotificationType.like,
                            postId: targetPost.id
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
        // 5. UNLIKE POSTINGAN (HAPUS LIKE BY ID LIKE)
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