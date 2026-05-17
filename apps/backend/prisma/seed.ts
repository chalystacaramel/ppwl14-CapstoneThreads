import { getPrisma } from './db';
const prisma = getPrisma();

async function main() {
  // Buat dummy users
  const user1 = await prisma.user.create({
    data: {
      name: "Aisyah",
      email: "aisyah@example.com",
      password: "password123",
    }
  });

  const user2 = await prisma.user.create({
    data: {
      name: "Chalysta",
      email: "chalysta@example.com",
      password: "password123",
    }
  });

  const user3 = await prisma.user.create({
    data: {
      name: "Adhelia",
      email: "adhelia@example.com",
      password: "password123",
    }
  });

  // Buat dummy posts
  const post1 = await prisma.post.create({
    data: {
      content: "Ini adalah postingan pertama di Threads clone kita! Semoga tugasnya lancar semua 🙏",
      authorId: user1.id,
      likes: 3,
    }
  });

  const post2 = await prisma.post.create({
    data: {
      content: "Halo semua! Selamat datang di Threads Clone PPWL 2026 🎉",
      authorId: user2.id,
      likes: 5,
    }
  });

  // Buat dummy comments
  const comment1 = await prisma.comment.create({
    data: {
      content: "Wah keren banget ini!",
      postId: post1.id,
      authorId: user3.id,
    }
  });

  const comment2 = await prisma.comment.create({
    data: {
      content: "Semangat timnya!",
      postId: post1.id,
      authorId: user2.id,
    }
  });

  // Buat dummy notifications
  await prisma.notification.create({
    data: {
      userId: user1.id,
      actorId: user3.id,
      message: "Adhelia mengomentari postingan kamu",
      type: "comment",
      postId: post1.id,
      commentId: comment1.id,
    }
  });

  await prisma.notification.create({
    data: {
      userId: user1.id,
      actorId: user2.id,
      message: "Chalysta mengomentari postingan kamu",
      type: "comment",
      postId: post1.id,
      commentId: comment2.id,
    }
  });

  console.log("✅ Seed data berhasil dibuat!");
}

main().finally(() => prisma.$disconnect());