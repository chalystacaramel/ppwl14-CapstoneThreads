// apps/backend/src/posts.routes.ts
import { Elysia, t } from "elysia"
import { jwt } from "@elysiajs/jwt"
import type { DbClient } from "./types"
import { uploadImageToS3 } from "./s3"

async function getUser(headers: any, jwtInstance: any, set: any) {
  console.log("\n=== AUTH CHECK ===")
  console.log("AUTH HEADER:", headers.authorization)

  const authHeader = headers.authorization

  if (!authHeader) {
    console.log("NO AUTH HEADER")
    set.status = 401
    return null
  }

  const token = authHeader.replace("Bearer ", "")

  console.log("TOKEN:", token)

  const payload = await jwtInstance.verify(token)

  console.log("PAYLOAD:", payload)

  if (!payload) {
    console.log("JWT VERIFY FAILED")
    set.status = 401
    return null
  }

  return payload
}

export const postRoutes = (getPrisma: () => DbClient) =>
  new Elysia({ prefix: "/posts" })
    .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET!, exp: "1d" }))

    // ── POST /posts/upload-image ────────────────────────────────
    .post("/upload-image", async ({ body, headers, jwt, set }) => {
      const me = await getUser(headers, jwt, set)
      if (!me) return { message: "Unauthorized" }

      const { file } = body as any
      if (!file) { set.status = 400; return { message: "File tidak ditemukan" } }

      try {
        const buffer = Buffer.from(await file.arrayBuffer())
        const mimeType = file.type || "image/jpeg"
        const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"]
        if (!allowed.includes(mimeType)) {
          set.status = 400
          return { message: "Tipe file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP." }
        }
        if (buffer.length > 5 * 1024 * 1024) {
          set.status = 400
          return { message: "Ukuran gambar maksimal 5MB" }
        }
        const imageUrl = await uploadImageToS3(buffer, mimeType)
        return { imageUrl }
      } catch (e) {
        console.error("[UPLOAD_IMAGE]", e)
        set.status = 500
        return { message: "Gagal upload gambar: " + String(e) }
      }
    }, {
      body: t.Object({ file: t.File() }),
    })

    // ── DELETE /posts/comments/:id — hapus komentar (owner only) ── HARUS SEBELUM /:id
    .delete("/comments/:id", async ({ params, headers, jwt, set }) => {
      const me = await getUser(headers, jwt, set)
      if (!me) return { message: "Unauthorized" }

      const db = getPrisma() as any
      const commentId = parseInt(params.id)

      const comment = await db.comment.findUnique({ where: { id: commentId } })
      if (!comment) { set.status = 404; return { message: "Komentar tidak ditemukan" } }
      if (comment.userId !== me.userId) { set.status = 403; return { message: "Bukan milik kamu" } }

      await db.notification.deleteMany({ where: { commentId } })
      await db.comment.delete({ where: { id: commentId } })

      return { message: "Komentar dihapus" }
    })

    // ── PUT /posts/comments/:id — edit komentar (owner only) ── HARUS SEBELUM /:id
    .put(
      "/comments/:id",
      async ({ params, body, headers, jwt, set }) => {
        const me = await getUser(headers, jwt, set)
        if (!me) return { message: "Unauthorized" }

        const db = getPrisma() as any
        const commentId = parseInt(params.id)

        const comment = await db.comment.findUnique({ where: { id: commentId } })
        if (!comment) { set.status = 404; return { message: "Komentar tidak ditemukan" } }
        if (comment.userId !== me.userId) { set.status = 403; return { message: "Bukan milik kamu" } }

        const { content } = body as any
        const updated = await db.comment.update({
          where: { id: commentId },
          data: { content },
          include: { user: { select: { id: true, name: true, avatar_url: true } } },
        })

        return {
          id: String(updated.id),
          content: updated.content,
          createdAt: updated.createdAt,
          user: {
            id: String((updated as any).user.id),
            name: (updated as any).user.name,
            avatarUrl: (updated as any).user.avatar_url ?? null,
          },
        }
      },
      { body: t.Object({ content: t.String({ minLength: 1 }) }) }
    )

    // ── GET /posts ──────────────────────────────────────────────
    .get("/", async ({ headers, jwt, set }) => {
      const db = getPrisma() as any

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
          user: { select: { id: true, name: true, email: true, avatar_url: true } },
          _count: { select: { likes: true, comments: true } },
          ...(userId ? { likes: { where: { userId }, select: { id: true } } } : {}),
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

    // ── GET /posts/:id ──────────────────────────────────────────
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
            include: { user: { select: { id: true, name: true, avatar_url: true } } },
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

    // ── POST /posts ─────────────────────────────────────────────
    .post(
      "/",
      async ({ body, headers, jwt, set }) => {
        const me = await getUser(headers, jwt, set)
        if (!me) return { message: "Unauthorized" }

        const db = getPrisma() as any
        const postCount = await db.post.count({ where: { userId: me.userId } })
        if (postCount >= 2) {
          set.status = 403
          return { message: "Batas maksimal 2 postingan per user" }
        }

        const { content, imageUrl } = body as any
        const post = await db.post.create({
          data: { content, image_url: imageUrl ?? null, userId: me.userId },
          include: { user: { select: { id: true, name: true, avatar_url: true } } },
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

      await db.notification.deleteMany({ where: { postId } })
      await db.comment.deleteMany({ where: { postId } })
      await db.postLike.deleteMany({ where: { postId } })
      await db.post.delete({ where: { id: postId } })

      return { message: "Post dihapus" }
    })

    // ── POST /posts/:id/like ────────────────────────────────────
    .post("/:id/like", async ({ params, headers, jwt, set }) => {
      const me = await getUser(headers, jwt, set)
      if (!me) return { message: "Unauthorized" }

      const db = getPrisma() as any
      const postId = parseInt(params.id)

      const post = await db.post.findUnique({ where: { id: postId } })
      if (!post) { set.status = 404; return { message: "Post tidak ditemukan" } }

      const existing = await db.postLike.findUnique({
        where: { userId_postId: { userId: me.userId, postId } },
      })

      if (existing) {
        await db.postLike.delete({ where: { id: existing.id } })
        return { liked: false }
      } else {
        await db.postLike.create({ data: { postId, userId: me.userId } })
        if (post.userId !== me.userId) {
          await db.notification.create({
            data: { userId: post.userId, actorId: me.userId, type: "like", postId },
          })
        }
        return { liked: true }
      }
    })

    // ── POST /posts/:id/comment ─────────────────────────────────
    .post(
      "/:id/comment",
      async ({ params, body, headers, jwt, set }) => {
        const me = await getUser(headers, jwt, set)
        if (!me) return { message: "Unauthorized" }

        const db = getPrisma() as any
        const postId = parseInt(params.id)

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
          include: { user: { select: { id: true, name: true, avatar_url: true } } },
        })

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