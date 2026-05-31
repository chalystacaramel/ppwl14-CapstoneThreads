import { Post } from "@/types";
import { create } from "zustand";

interface PostForm { // data Post Update & Create (add/edit before submit)
  id?: number;
  content: string;
  image: File | null; // Untuk menghandle file upload asli
  image_url?: string; // Untuk preview gambar atau data url dari backend
}

type PostStore = {
  posts: Post[];
  form: PostForm;
  post: Post | null; // ada detail comments[]

  // Actions
  setPosts: (
    posts: Post[] | ((prev: Post[]) => Post[]) // bisa tambah data baru
  ) => void;
  setPost: (post: Post | null) => void;
  addPostLocal: (post: Post) => void;
  updatePost: (id: number, text: string) => void;

  setForm: (
    fields:
      | Partial<PostForm>
      | ((prev: PostForm) => PostForm)
  ) => void;
  resetForm: () => void;
  updatePostData: (
    postId: number,
    updater: (post: Post) => Post
  ) => Post | null; // dipakai jika ada like baru
  rollbackPostData: (snapshot: Post) => void;
};

const initialForm: PostForm = {
  content: '',
  image: null,
  image_url: ''
};

export const usePostStore = create<PostStore>((set, get) => ({
  posts: [],
  form: initialForm,
  post: null,

  // 🔥 NEW: set dari backend
  setPosts: (posts) =>
        set((state) => ({
            posts:
                typeof posts === "function"
                    ? posts(state.posts)
                    : posts,
        })),
    setPost: (post) => set({ post: post }),

  // 🔥 NEW: add hasil backend (REAL POST)
  addPostLocal: (post) =>
    set((state) => ({
      posts: [post, ...state.posts],
    })),

  updatePost: (id, text) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === id ? { ...p, text } : p
      ),
    })),

  setForm: (
    updater: Partial<PostForm> | ((prev: PostForm) => PostForm)
  ) =>
    set((state) => ({
      form:
        typeof updater === "function"
          ? updater(state.form)
          : { ...state.form, ...updater },
    })),

  resetForm: () => set({ form: initialForm }),

  // LIKE
  updatePostData: (postId, updater) => {
    const currentPost =
      get().posts.find((p) => p.id === postId) ??
      (get().post?.id === postId ? get().post : null);

    if (!currentPost) return null;

    const updatedPost = updater(currentPost);

    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId ? updatedPost : p
      ),

      post:
        state.post?.id === postId
          ? updatedPost
          : state.post,
    }));

    // return snapshot untuk rollback
    return currentPost;
  },

  rollbackPostData: (snapshot) => {
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === snapshot.id ? snapshot : p
      ),

      post:
        state.post?.id === snapshot.id
          ? snapshot
          : state.post,
    }));
  },
}));