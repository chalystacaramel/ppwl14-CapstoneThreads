import { useState } from 'react';
import axios from 'axios';
import { usePostStore } from '../stores/usePostStore';
import { useAuthStore } from '../stores/useAuthStore'; // Sesuaikan path store auth kamu
import { BACKEND_URL } from '@/constants';
import { elysiaErr } from '@/lib/elysiaErr';

export const useComment = () => {
    // 1. Ambil state dari global store yang diminta
    const post = usePostStore((state) => state.post);
    const user = useAuthStore((state) => state.user); // Asumsi useAuthStore menyediakan state user

    // 2. Local State untuk Loading, Error, dan Success
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const [activeParentId, setActiveParentId] = useState<number | undefined>(undefined);
    const updatePostData = usePostStore((s) => s.updatePostData); // change count comments (add, delete)
    const rollbackPostData = usePostStore((s) => s.rollbackPostData); // rollabck jika change count gagal

    // 1. Ambil token dari localStorage
    const token = useAuthStore((s) => s.token);

    // 2. Buat object config berisi headers
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };

    // =========================================================
    // METHOD 1: CREATE COMMENT
    // =========================================================
    const createComment = async (content: {
        user_id: number,
        comment: string
    }, callbackOnSuccess?: (post_id: number) => void) => {
        if (!post) return setError('Post tidak ditemukan');
        if (!content.comment.trim()) return;

        // setLoading(true);
        setError(null);
        setSuccess(false);

        const snapshot = updatePostData(post.id, (post) => ({ // update post dan posts
            ...post,
            _count: {
                ...post._count,
                comments: (post._count?.comments ?? 0) + 1,
            },
        }));

        try {
            // GABUNGKAN DATA: Ambil semua isi content, lalu timpa/tambahkan parent_comment_id jika ada
            const payload = {
                ...content,
                ...(activeParentId && { parent_comment_id: activeParentId })
            };

            console.log("payload", payload);
            const resCreateComment = await axios.post(
                `${BACKEND_URL}/comments/post/${post.id}`,
                payload, // Argumen kedua: Data Body
                config   // Argumen ketiga: Konfigurasi Headers
            );
            console.log("resCreateComment.data", resCreateComment.data);
            if (resCreateComment.data.success) {
                setSuccess(true);
                if (callbackOnSuccess) callbackOnSuccess(
                    resCreateComment.data.data.post_id); // Mengosongkan form input di UI jika sukses
            }
        } catch (err: any) {
            elysiaErr(err);
            if (snapshot) {
                rollbackPostData(snapshot);
            }
            setError(err.response?.data?.message || 'Gagal mengirim komentar');
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // METHOD 2: EDIT COMMENT BY ID
    // =========================================================
    const editComment = async (commentId: number, content: string, callbackOnSuccess?: () => void) => {
        if (!content.trim()) return;

        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await axios.patch(
                `${BACKEND_URL}/comments/${commentId}`,
                {
                    new_comment: content
                },
                config
            );
            console.log(response.data);

            if (response.data.success) {
                setSuccess(true);
                if (callbackOnSuccess) callbackOnSuccess(); // Menutup mode edit di UI jika sukses
            }
        } catch (err: any) {
            elysiaErr(err);
            setError(err.response?.data?.message || 'Gagal memperbarui komentar');
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // METHOD 3: DELETE COMMENT BY ID
    // =========================================================
    const deleteComment = async (commentId: number) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await axios.delete(`${BACKEND_URL}/comments/${commentId}`,
                config
            );

            if (response.data.success) {
                setSuccess(true);
            }
        } catch (err: any) {
            elysiaErr(err);
            setError(err.response?.data?.message || 'Gagal menghapus komentar');
        } finally {
            setLoading(false);
        }
    };

    return {
        user,
        loading,
        error,
        success,
        activeParentId,
        // Methods
        setSuccess,
        setError,
        setActiveParentId,
        createComment,
        editComment,
        deleteComment
    };
};