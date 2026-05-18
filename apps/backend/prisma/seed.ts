import { getPrisma } from './db';
import { Argon2id } from "oslo/password";

const prisma = getPrisma();
const argon2 = new Argon2id();

async function main() {
  const hash = async (pw: string) => await argon2.hash(pw);

  const user1 = await prisma.user.upsert({
    where: { email: "aisyah@example.com" },
    update: { password: await hash("password123") },
    create: { name: "Aisyah", email: "aisyah@example.com", password: await hash("password123") }
  });

  const user2 = await prisma.user.upsert({
    where: { email: "chalysta@example.com" },
    update: { password: await hash("password123") },
    create: { name: "Chalysta", email: "chalysta@example.com", password: await hash("password123") }
  });

  const user3 = await prisma.user.upsert({
    where: { email: "adhelia@example.com" },
    update: { password: await hash("password123") },
    create: { name: "Adhelia", email: "adhelia@example.com", password: await hash("password123") }
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