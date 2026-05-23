// apps/backend/src/posts.routes.ts
// Routes: Posts (CRUD), Like, Comment, Notification

import { Elysia, t } from "elysia"
import { jwt } from "@elysiajs/jwt"
import type { DbClient } from "./types"

// ─── Auth helper ───────────────────────────────────────────────
async function getUser(headers: any, jwtInstance: any, set: any) {
  const authHeader = headers.authorization
  if (!authHeader) { set.status = 401; return null }
  const token = authHeader.replace("Bearer ", "")
  const payload = await jwtInstance.verify(token)
  if (!payload) { set.status = 401; return null }
  return payload as { userId: number; email: string }
}

export const postRoutes = (getPrisma: () => DbClient) =>
  new Elysia({ prefix: "/posts" })
    .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET!, exp: "1d" }))

    // ── GET /posts — feed semua postingan (public) ─────────────
    .get("/", async ({ headers, jwt, set }) => {
      const db = getPrisma() as any

      // Cek apakah user login (untuk isLiked)
      let userId: number | null = null
      try {
        const authHeader = headers.authorization
        if (authHeader) {
          const token = authHeader.replace("Bearer ", "")
          const payload = await jwt.verify(token) as any
          if (payload?.userId) userId = payload.userId
        }
      } catch {}

      const posts = await db.post.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar_url: true },
          },
          _count: {
            select: { likes: true, comments: true },
          },
          ...(userId ? {
            likes: {
              where: { userId },
              select: { id: true },
            },
          } : {}),
        },
      })

      return posts.map((p: any) => ({
        id: String(p.id),
        content: p.content,
        imageUrl: p.image_url ?? null,
        createdAt: p.createdAt,
        likeCount: p._count.likes,
        commentCount: p._count.comments,
        isLiked: userId ? (p.likes?.length > 0) : false,
        user: {
          id: String(p.user.id),
          name: p.user.name,
          email: p.user.email,
          avatarUrl: p.user.avatar_url ?? null,
          username: p.user.name.toLowerCase().replace(/\s+/g, "_"),
        },
      }))
    })

    // ── GET /posts/:id — detail post ───────────────────────────
    .get("/:id", async ({ params, headers, jwt, set }) => {
      const db = getPrisma() as any
      const postId = parseInt(params.id)
      if (isNaN(postId)) { set.status = 400; return { message: "ID tidak valid" } }

      let userId: number | null = null
      try {
        const authHeader = headers.authorization
        if (authHeader) {
          const token = authHeader.replace("Bearer ", "")
          const payload = await jwt.verify(token) as any
          if (payload?.userId) userId = payload.userId
        }
      } catch {}

      const post = await db.post.findUnique({
        where: { id: postId },
        include: {
          user: { select: { id: true, name: true, avatar_url: true } },
          _count: { select: { likes: true, comments: true } },
          comments: {
            orderBy: { createdAt: "asc" },
            include: {
              user: { select: { id: true, name: true, avatar_url: true } },
            },
          },
          ...(userId ? { likes: { where: { userId }, select: { id: true } } } : {}),
        },
      })

      if (!post) { set.status = 404; return { message: "Post tidak ditemukan" } }

      return {
        id: String(post.id),
        content: post.content,
        imageUrl: (post as any).image_url ?? null,
        createdAt: post.createdAt,
        likeCount: (post as any)._count.likes,
        commentCount: (post as any)._count.comments,
        isLiked: userId ? ((post as any).likes?.length > 0) : false,
        user: {
          id: String((post as any).user.id),
          name: (post as any).user.name,
          avatarUrl: (post as any).user.avatar_url ?? null,
          username: (post as any).user.name.toLowerCase().replace(/\s+/g, "_"),
        },
        comments: (post as any).comments.map((c: any) => ({
          id: String(c.id),
          content: c.content,
          createdAt: c.createdAt,
          user: {
            id: String(c.user.id),
            name: c.user.name,
            avatarUrl: c.user.avatar_url ?? null,
            username: c.user.name.toLowerCase().replace(/\s+/g, "_"),
          },
        })),
      }
    })

    // ── POST /posts — buat postingan baru (auth required) ──────
    .post(
      "/",
      async ({ body, headers, jwt, set }) => {
        const me = await getUser(headers, jwt, set)
        if (!me) return { message: "Unauthorized" }

        const db = getPrisma() as any

        // Limit: 1 user max 2 postingan
        const postCount = await db.post.count({ where: { userId: me.userId } })
        if (postCount >= 2) {
          set.status = 403
          return { message: "Batas maksimal 2 postingan per user" }
        }

        // Tidak boleh upload video (cek imageUrl)
        const { content, imageUrl } = body as any
        if (imageUrl) {
          const isVideo = /\.(mp4|mov|avi|webm|mkv)$/i.test(imageUrl)
          if (isVideo) {
            set.status = 400
            return { message: "Upload video tidak diizinkan" }
          }
        }

        const post = await db.post.create({
          data: {
            content,
            image_url: imageUrl ?? null,
            userId: me.userId,
          },
          include: {
            user: { select: { id: true, name: true, avatar_url: true } },
          },
        })

        return {
          id: String(post.id),
          content: post.content,
          imageUrl: (post as any).image_url ?? null,
          createdAt: post.createdAt,
          likeCount: 0,
          commentCount: 0,
          isLiked: false,
          user: {
            id: String((post as any).user.id),
            name: (post as any).user.name,
            avatarUrl: (post as any).user.avatar_url ?? null,
            username: (post as any).user.name.toLowerCase().replace(/\s+/g, "_"),
          },
        }
      },
      {
        body: t.Object({
          content: t.String({ minLength: 1 }),
          imageUrl: t.Optional(t.String()),
        }),
      }
    )

    // ── PUT /posts/:id — edit post (owner only) ─────────────────
    .put(
      "/:id",
      async ({ params, body, headers, jwt, set }) => {
        const me = await getUser(headers, jwt, set)
        if (!me) return { message: "Unauthorized" }

        const db = getPrisma() as any
        const postId = parseInt(params.id)

        const post = await db.post.findUnique({ where: { id: postId } })
        if (!post) { set.status = 404; return { message: "Post tidak ditemukan" } }
        if (post.userId !== me.userId) { set.status = 403; return { message: "Bukan milik kamu" } }

        const { content, imageUrl } = body as any
        const updated = await db.post.update({
          where: { id: postId },
          data: { content, image_url: imageUrl ?? post.image_url },
        })

        return { id: String(updated.id), content: updated.content, imageUrl: (updated as any).image_url }
      },
      {
        body: t.Object({
          content: t.String({ minLength: 1 }),
          imageUrl: t.Optional(t.String()),
        }),
      }
    )

    // ── DELETE /posts/:id — hapus post (owner only) ─────────────
    .delete("/:id", async ({ params, headers, jwt, set }) => {
      const me = await getUser(headers, jwt, set)
      if (!me) return { message: "Unauthorized" }

      const db = getPrisma() as any
      const postId = parseInt(params.id)

      const post = await db.post.findUnique({ where: { id: postId } })
      if (!post) { set.status = 404; return { message: "Post tidak ditemukan" } }
      if (post.userId !== me.userId) { set.status = 403; return { message: "Bukan milik kamu" } }

      // Hapus relasi dulu
      await db.notification.deleteMany({ where: { postId } })
      await db.comment.deleteMany({ where: { postId } })
      await db.postLike.deleteMany({ where: { postId } })
      await db.post.delete({ where: { id: postId } })

      return { message: "Post dihapus" }
    })

    // ── POST /posts/:id/like — toggle like ──────────────────────
    .post("/:id/like", async ({ params, headers, jwt, set }) => {
      const me = await getUser(headers, jwt, set)
      if (!me) return { message: "Unauthorized" }

      const db = getPrisma() as any
      const postId = parseInt(params.id)

      const post = await db.post.findUnique({ where: { id: postId } })
      if (!post) { set.status = 404; return { message: "Post tidak ditemukan" } }

      const existing = await db.postLike.findUnique({
        where: { postId_userId: { postId, userId: me.userId } },
      })

      if (existing) {
        // Unlike
        await db.postLike.delete({ where: { id: existing.id } })
        return { liked: false }
      } else {
        // Like + buat notifikasi ke pemilik post (kalau bukan diri sendiri)
        await db.postLike.create({ data: { postId, userId: me.userId } })

        if (post.userId !== me.userId) {
          await db.notification.create({
            data: {
              userId: post.userId,
              actorId: me.userId,
              type: "like",
              postId,
            },
          })
        }

        return { liked: true }
      }
    })

    // ── POST /posts/:id/comment — beri komentar ─────────────────
    .post(
      "/:id/comment",
      async ({ params, body, headers, jwt, set }) => {
        const me = await getUser(headers, jwt, set)
        if (!me) return { message: "Unauthorized" }

        const db = getPrisma() as any
        const postId = parseInt(params.id)

        // Limit: 1 user max 5 komentar
        const commentCount = await db.comment.count({ where: { userId: me.userId } })
        if (commentCount >= 5) {
          set.status = 403
          return { message: "Batas maksimal 5 komentar per user" }
        }

        const post = await db.post.findUnique({ where: { id: postId } })
        if (!post) { set.status = 404; return { message: "Post tidak ditemukan" } }

        const { content } = body as any
        const comment = await db.comment.create({
          data: { content, postId, userId: me.userId },
          include: {
            user: { select: { id: true, name: true, avatar_url: true } },
          },
        })

        // Notifikasi ke pemilik post
        if (post.userId !== me.userId) {
          await db.notification.create({
            data: {
              userId: post.userId,
              actorId: me.userId,
              type: "comment",
              postId,
              commentId: comment.id,
            },
          })
        }

        return {
          id: String(comment.id),
          content: comment.content,
          createdAt: comment.createdAt,
          user: {
            id: String((comment as any).user.id),
            name: (comment as any).user.name,
            avatarUrl: (comment as any).user.avatar_url ?? null,
            username: (comment as any).user.name.toLowerCase().replace(/\s+/g, "_"),
          },
        }
      },
      {
        body: t.Object({
          content: t.String({ minLength: 1 }),
        }),
      }
    )