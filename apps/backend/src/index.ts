import { Elysia } from "elysia";
import type { PrismaClient } from "./generated/prisma/client";

export const createApp = (getPrisma: () => PrismaClient) => {
  const prisma = getPrisma();

  const app = new Elysia()
    .get("/", () => ({
      message: "Threads Clone API is running!",
    }))
    .get("/users", async () => {
      const users = await prisma.user.findMany();
      return { data: users };
    })
    .post("/auth/login", async ({ body }) => {
      const { email, password } = body as { email: string; password: string };

      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return new Response(
          JSON.stringify({ message: "Email tidak ditemukan" }),
          { status: 404 }
        );
      }

      if (user.password !== password) {
        return new Response(
          JSON.stringify({ message: "Password salah" }),
          { status: 401 }
        );
      }

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        message: "Login berhasil"
      };
    })
    .get("/posts", async () => {
      const posts = await prisma.post.findMany({
        include: {
          author: true,
          comments: true,
        },
        orderBy: { createdAt: "desc" },
      });
      return { data: posts };
    })
    .get("/posts/:id", async ({ params }) => {
      const post = await prisma.post.findUnique({
        where: { id: Number(params.id) },
        include: {
          author: true,
          comments: {
            include: { author: true },
            orderBy: { createdAt: "desc" },
          },
        },
      });
      return { data: post };
    })
    .get("/posts/:id/comments", async ({ params }) => {
      const comments = await prisma.comment.findMany({
        where: { postId: Number(params.id) },
        include: { author: true },
        orderBy: { createdAt: "desc" },
      });
      return { data: comments };
    })
    .get("/notifications/:userId", async ({ params }) => {
      const notifications = await prisma.notification.findMany({
        where: { userId: Number(params.userId) },
        orderBy: { createdAt: "desc" },
      });
      return { data: notifications };
    });

  return app;
};