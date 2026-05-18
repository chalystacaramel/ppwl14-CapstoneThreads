import { create } from "zustand";

type ImageItem = {
  id: string;
  previewUrl: string;
};

type Post = {
  id: string;
  text: string;
  images: ImageItem[];
};

type PostStore = {
  draft: { text: string; images: ImageItem[] };
  posts: Post[];
  setDraft: (text: string, images: ImageItem[]) => void;
  clearDraft: () => void;
  addPost: (text: string, images: ImageItem[], username: string) => void;
  updatePost: (id: string, text: string) => void;
};

export const usePostStore = create<PostStore>((set) => ({
  draft: { text: "", images: [] },
  posts: [],
  setDraft: (text, images) => set({ draft: { text, images } }),
  clearDraft: () => set({ draft: { text: "", images: [] } }),
  addPost: (text, images, username) =>
    set((state) => ({
      posts: [...state.posts, { id: Date.now().toString(), text, images }],
    })),
  updatePost: (id, text) =>
    set((state) => ({
      posts: state.posts.map((p) => (p.id === id ? { ...p, text } : p)),
    })),
}));