import { getPrisma } from './db';
const prisma = getPrisma();

async function main() {
  const user1 = await prisma.user.upsert({
    where: { email: "aisyah@example.com" },
    update: {},
    create: { name: "Aisyah", email: "aisyah@example.com", password: "password123" }
  });

  const user2 = await prisma.user.upsert({
    where: { email: "chalysta@example.com" },
    update: {},
    create: { name: "Chalysta", email: "chalysta@example.com", password: "password123" }
  });

  const user3 = await prisma.user.upsert({
    where: { email: "adhelia@example.com" },
    update: {},
    create: { name: "Adhelia", email: "adhelia@example.com", password: "password123" }
  });

  const post1 = await prisma.post.create({
    data: { content: "Ini postingan pertama di Threads Clone! 🙏", userId: user1.id }
  });

  const post2 = await prisma.post.create({
    data: { content: "Halo semua! Selamat datang di Threads Clone PPWL 2026 🎉", userId: user2.id }
  });

  const comment1 = await prisma.comment.create({
    data: { content: "Wah keren banget ini!", postId: post1.id, userId: user3.id }
  });

  await prisma.comment.create({
    data: { content: "Semangat timnya!", postId: post1.id, userId: user2.id }
  });

  await prisma.notification.create({
    data: { userId: user1.id, actorId: user3.id, type: "comment", postId: post1.id, commentId: comment1.id }
  });

  console.log("✅ Seed data berhasil dibuat!");
}

main().finally(() => prisma.$disconnect());