import { Elysia, t } from 'elysia';
import type { DbClient } from "../types";
import { authMiddleware } from './authMiddleware';

const { NotificationType } = await import(`../generated/prisma${process.env.NODE_ENV === "dev" ? '' : 'pg'}/client`);

export const commentRoutes = (getPrisma: () => DbClient) =>
    new Elysia({ prefix: '/comments' })
        .use(authMiddleware) // verifikasi & ambil data user session (id, email)
        // new comment 
        .post('/post/:post_id', async ({ user, params, body, set }) => { // user diambil dari middleware

            const { post_id } = params;
            const { comment: content, parent_comment_id } = body;

            try {
                // 1. Cari tahu siapa pemilik asli post untuk dikirimi notifikasi
                const targetPost = await getPrisma().post.findUnique({
                    where: { id: Number(post_id) }
                });

                if (!targetPost) {
                    set.status = 404;
                    return { success: false, message: "Postingan tidak ditemukan" };
                }

                // 2. Simpan komentar ke database
                const newComment = await getPrisma().comment.create({
                    data: {
                        post_id: Number(post_id),
                        user_id: user.id,
                        content,
                        parent_comment_id: parent_comment_id ? Number(parent_comment_id) : null
                    }
                });

                // 3. Trigger Notifikasi otomatis jika yang berkomentar bukan pemilik post itu sendiri
                if (targetPost.user_id !== user.id) {
                    await getPrisma().notification.create({
                        data: {
                            user_id: targetPost.user_id, // Penerima
                            actor_id: user.id,           // Pelaku
                            type: NotificationType.comment, // atau 'comment' jika string literal
                            post_id: targetPost.id,
                            comment_id: newComment.id
                        }
                    });
                }

                return { success: true, message: "Komentar berhasil ditambahkan", data: newComment };
            } catch (error) {
                set.status = 500;
                return { success: false, data: { post_id, user_id: user.id, comment: content, parent_comment_id }, message: (error as Error).message };
            }
        }, {
            params: t.Object({ post_id: t.String() }),
            body: t.Object({
                user_id: t.Number(),
                comment: t.String(),
                parent_comment_id: t.Optional(t.Number()) // Untuk fitur reply komentar jika dibutuhkan
            })
        })

        // ==========================================
        // 4. EDIT KOMENTAR
        // ==========================================
        .patch('/:id', async ({ user, params, body, set }) => { // user dari authMiddleware
            const { id } = params;
            const { new_comment } = body;
            try {
                // Validasi apakah benar ini komentar milik si user sebelum diedit
                const comment = await getPrisma().comment.findUnique({
                    where: { id: Number(id) }
                });

                if (!comment || comment.user_id !== user.id) {
                    set.status = 403;
                    return { success: false, message: "Kamu tidak berhak mengedit komentar ini" };
                }

                const updatedComment = await getPrisma().comment.update({
                    where: { id: Number(id) },
                    data: { content: new_comment }
                });

                return { success: true, message: "Komentar berhasil diubah", data: updatedComment };
            } catch (error) {
                set.status = 500;
                return { success: false, message: "Gagal mengubah komentar", detail: (error as Error).message };
            }
        }, {
            params: t.Object({ id: t.String() }),
            body: t.Object({
                new_comment: t.String()
            })
        })
        .delete('/:id', async ({ params, set }) => {
            const { id } = params;
            try {
                await getPrisma().comment.delete({
                    where: { id: Number(id) }
                });
                return { success: true, message: "Comment Deleted" };
            } catch (error) {
                set.status = 500;
                return { success: false, message: (error as Error).message };
            }
        }, {
            params: t.Object({ id: t.String() })
        })