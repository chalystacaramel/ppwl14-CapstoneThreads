import { create } from "zustand";

type PostStore = {
  posts: unknown[];
  setPosts: (posts: unknown[]) => void;
};

export const usePostStore = create<PostStore>((set) => ({
  posts: [],
  setPosts: (posts) => set({ posts }),
}));