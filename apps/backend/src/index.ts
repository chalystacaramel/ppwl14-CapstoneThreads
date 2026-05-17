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