import { create } from "zustand";

export type ImageItem = {
  id: string;
  file?: File;
  previewUrl: string;
};

export type Post = {
  id: string;
  text: string;
  images: ImageItem[];
};

type PostStore = {
  draft: { text: string; images: ImageItem[] };
  posts: Post[];

  setDraft: (text: string, images: ImageItem[]) => void;
  clearDraft: () => void;

  setPosts: (posts: Post[]) => void;
  addPostLocal: (post: Post) => void;

  updatePost: (id: string, text: string) => void;
};

export const usePostStore = create<PostStore>((set) => ({
  draft: { text: "", images: [] },
  posts: [],

  setDraft: (text, images) =>
    set({ draft: { text, images } }),

  clearDraft: () =>
    set({ draft: { text: "", images: [] } }),

  // 🔥 NEW: set dari backend
  setPosts: (posts) =>
    set({ posts }),

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
}));