import { useState, useCallback } from 'react';
import axios from 'axios';
import { usePostStore } from '../stores/usePostStore';
import { BACKEND_URL } from '@/constants';
import { useAuthStore } from '@/stores/useAuthStore';
import { elysiaErr } from '@/lib/elysiaErr';
import type { Post } from '@/types';

export const usePost = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    const form = usePostStore((s) => s.form);
    const setPost = usePostStore((s) => s.setPost);
    const setPosts = usePostStore((s) => s.setPosts);
    const user = useAuthStore((s) => s.user);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const token = useAuthStore((s) => s.token);

    // 1. Ambil Semua Postingan
    const fetchPosts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const resFetchPosts = await axios.get(`${BACKEND_URL}/data/posts`, {
                headers: {
                    ...(isAuthenticated && { Authorization: `Bearer ${token}` })
                }
            });
            console.log("resFetchPosts.data", resFetchPosts.data);
            setPosts(resFetchPosts.data.data);
        } catch (err: any) {
            elysiaErr(err);
            setError(err.response?.data?.message || 'Gagal memuat postingan');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, token, setPosts]);

    // 2. Ambil Single Post
    const fetchPost = async (id: number) => {
        setLoading(true);
        try {
            const resPost = await axios.get(
                `${BACKEND_URL}/data/posts/${id}`,
                {
                    headers: {
                        ...(isAuthenticated && { Authorization: `Bearer ${token}` })
                    }
                }
            );
            console.log("resPost", resPost);
            const dataPost: Post | null = resPost.data.data;
            setPost(dataPost || null);
        } catch (error) {
            elysiaErr(error);
        } finally {
            setLoading(false);
        }
    };

    // 3. Buat Postingan Baru
    const createPost = async (content: string, image: File | null) => {
        setError(null);
        setSuccess(false);

        const formData = new FormData();
        formData.append("user_id", String(user!.id));
        formData.append('content', content);
        if (image) {
            formData.append('image', image);
        }

        try {
            const resCreatePost = await axios.post(`${BACKEND_URL}/post`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log({ ...resCreatePost.data.data, user });
            setSuccess(true);
            if (resCreatePost.data.data) {
                setPosts((prev) => [{ ...resCreatePost.data.data, user }, ...prev]);
                return resCreatePost.data.data.id;
            }
        } catch (err: any) {
            elysiaErr(err);
            setError(err.response?.data?.message || 'Gagal membuat postingan');
        }
    };

    // 4. Update Postingan Berdasarkan ID
    const updatePost = async (id: number, content: string, image: File | null) => {
        setError(null);
        setSuccess(false);

        const formData = new FormData();
        formData.append('content', content);
        
        // ✅ DISAMAKAN: Mengubah 'image_new' menjadi 'image' agar lolos validasi skema Elysia
        if (image) {
            formData.append('image', image); 
        }
        if (!form.image_url) formData.append('remove_image', 'yes');

        try {
            console.log("updatePost", { form, id, image });
            
            // ✅ DIPERBAIKI: Menambahkan sub-path `/data` agar rute mengarah ke endpoint yang benar
            const resUpPost = await axios.put(`${BACKEND_URL}/data/posts/${id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log("resUpPost", resUpPost);

            // Karena format response `.put` backend mengembalikan { id, content, imageUrl }, 
            // kita bungkus lagi agar strukturnya cocok dengan state posts frontend (menjaga relasi user tetap ada)
            const updatedData = resUpPost.data; 

            setPosts((prev) =>
                prev.map((p) => p.id === id ? { ...p, content: updatedData.content, image_url: updatedData.imageUrl } : p)
            );
            
            // ✅ SINKRONISASI AVATAR: Mengirimkan objek gabungan langsung (bukan arrow function) agar tidak memicu error 'not assignable to parameter of type Post'
            setPost({ ...form, content: updatedData.content, image_url: updatedData.imageUrl } as any);
            
            setSuccess(true);

            // 🔥 RECOVERY UTAMA: Wajib mengembalikan (return) objek data baru agar tidak dibaca sebagai 'void' di DetailPostPage.tsx
            return { ...form, content: updatedData.content, image_url: updatedData.imageUrl };

        } catch (err: any) {
            elysiaErr(err);
            setError(err.response?.data?.message || 'Gagal memperbarui postingan');
        }
    };

    return {
        error,
        success,
        loading,
        setSuccess,
        fetchPosts,
        fetchPost,
        createPost,
        updatePost
    };
};