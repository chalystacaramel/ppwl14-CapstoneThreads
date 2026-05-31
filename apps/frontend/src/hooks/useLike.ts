import { useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../stores/useAuthStore';
import { usePostStore } from '../stores/usePostStore';
import { BACKEND_URL } from '@/constants';
import type { PostLike } from '@/types';
import { elysiaErr } from '@/lib/elysiaErr';

export const useLike = () => {
    const user = useAuthStore((state) => state.user);
    const token = useAuthStore((s) => s.token);
    const updatePostData = usePostStore((s) => s.updatePostData); // change count like (add, delete)
    const rollbackPostData = usePostStore((s) => s.rollbackPostData); // change count like (add, delete)

    const [loading, setLoading] = useState(false);

    const toggleLike = async (postId: number, isCurrentlyLiked: boolean) => {
        if (!user) {
            alert("Silakan login terlebih dahulu!");
            return;
        }

        setLoading(true);

        const snapshot = updatePostData(postId, (post) => ({ // update post dan posts
            ...post,
            // ✅ DISAMAKAN: Mengubah l.user_id menjadi l.userId sesuai interface PostLike
            likes: isCurrentlyLiked
                ? post.likes?.filter((l) => l.userId !== user.id) ?? []
                : [
                    ...(post.likes ?? []),
                    {
                        id: -1, // placeholder
                        postId: postId, // ✅ DISAMAKAN: post_id ➡️ postId
                        userId: user.id, // ✅ DISAMAKAN: user_id ➡️ userId
                        createdAt: new Date(),
                    } as PostLike,
                ],
            _count: {
                ...post._count,
                likes: (post._count?.likes ?? 0) + (isCurrentlyLiked ? -1 : 1),
            }
        }));

        // ✅ DISAMAKAN: Mengubah l.user_id menjadi l.userId
        const existingLike = snapshot?.likes?.find(
            (l) => (l.userId === user.id) && l.id !== -1
        );
        console.log({ user, isCurrentlyLiked, existingLike, snapshot }); 

        try {
            // unlike
            if (isCurrentlyLiked && existingLike) {
                // Catatan: Pastikan endpoint di backend cocok dengan struktur /post/like/:id atau /data/posts/:id/like
                await axios.delete(
                    `${BACKEND_URL}/posts/${postId}/like`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            }

            // like
            else {
                // Catatan: Pastikan prefix endpoint (/post atau /data/posts) sinkron dengan dataRoutes backend
                await axios.post(
                    `${BACKEND_URL}/posts/${postId}/like`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            }
        } catch (error) {
            elysiaErr(error);
            if (snapshot) {
                rollbackPostData(snapshot);
            }
        } finally {
            setLoading(false);
        }
    };

    return { loading, toggleLike };
};