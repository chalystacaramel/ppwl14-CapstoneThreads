import { create } from "zustand";
import { devtools, persist, subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { UploadedImage } from "@/components/ImageUpload";

export interface Comment {
  id: string;
  postId: string;
  author: string;
  text: string;
  createdAt: number;
}

export interface Post {
  id: string;
  text: string;
  images: UploadedImage[];
  author: string;
  createdAt: number;
  likes: number;
  comments: Comment[];
  isEdited: boolean;
}

interface PostState {
  posts: Post[];
  draft: { text: string; images: UploadedImage[] };
  lastAction: string;
  addPost: (text: string, images: UploadedImage[], author: string) => void;
  deletePost: (id: string) => void;
  likePost: (id: string) => void;
  addComment: (postId: string, text: string, author: string) => void;
  deleteComment: (postId: string, commentId: string) => void;
  updatePost: (id: string, text: string) => void;
  setDraft: (text: string, images: UploadedImage[]) => void;
  clearDraft: () => void;
}

export const usePostStore = create<PostState>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set) => ({
          posts: [],
          draft: { text: "", images: [] },
          lastAction: "",

          addPost: (text, images, author) =>
            set((state) => {
              state.posts.unshift({
                id: crypto.randomUUID(),
                text, images, author,
                createdAt: Date.now(),
                likes: 0,
                comments: [],
                isEdited: false,
              });
              state.lastAction = "addPost";
            }, false, "addPost"),

          deletePost: (id) =>
            set((state) => {
              state.posts = state.posts.filter((p) => p.id !== id);
              state.lastAction = "deletePost";
            }, false, "deletePost"),

          likePost: (id) =>
            set((state) => {
              const post = state.posts.find((p) => p.id === id);
              if (post) post.likes += 1;
              state.lastAction = "likePost";
            }, false, "likePost"),

          addComment: (postId, text, author) =>
            set((state) => {
              const post = state.posts.find((p) => p.id === postId);
              if (post) {
                post.comments.push({
                  id: crypto.randomUUID(),
                  postId,
                  text,
                  author,
                  createdAt: Date.now(),
                });
              }
              state.lastAction = "addComment";
            }, false, "addComment"),

          updatePost: (id, text) =>
            set((state) => {
              const post = state.posts.find((p) => p.id === id);
              if (post) { post.text = text; post.isEdited = true; }
              state.lastAction = 'updatePost';
            }, false, 'updatePost'),

          deleteComment: (postId, commentId) =>
            set((state) => {
              const post = state.posts.find((p) => p.id === postId);
              if (post) {
                post.comments = post.comments.filter((c) => c.id !== commentId);
              }
              state.lastAction = "deleteComment";
            }, false, "deleteComment"),

          setDraft: (text, images) =>
            set((state) => {
              state.draft.text = text;
              state.draft.images = images;
            }, false, "setDraft"),

          clearDraft: () =>
            set((state) => {
              state.draft.text = "";
              state.draft.images = [];
            }, false, "clearDraft"),
        }))
      ),
      {
        name: "threads-post-store",
        partialize: (state) => ({ posts: state.posts }),
        merge: (persisted: any, current) => ({
          ...current,
          ...persisted,
          posts: (persisted?.posts ?? []).map((p: any) => ({
            likes: 0, comments: [], isEdited: false,
            ...p,
          })),
        }),
      }
    ),
    { name: "PostStore" }
  )
);
