import { getPrisma } from "./db";
import bcrypt from "bcryptjs";

const prisma = getPrisma();

async function main() {
  const hash = async (pw: string) => await bcrypt.hash(pw, 10);

  const passwordHash = await hash("password123");

  const user1 = await prisma.user.upsert({
    where: { email: "aisyah@example.com" },
    update: {
      password: passwordHash,
    },
    create: {
      name: "Aisyah",
      email: "aisyah@example.com",
      password: passwordHash,
      provider: "email",
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "chalysta@example.com" },
    update: {
      password: passwordHash,
    },
    create: {
      name: "Chalysta",
      email: "chalysta@example.com",
      password: passwordHash,
      provider: "email",
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: "adhelia@example.com" },
    update: {
      password: passwordHash,
    },
    create: {
      name: "Adhelia",
      email: "adhelia@example.com",
      password: passwordHash,
      provider: "email",
    },
  });

  const post1 = await prisma.post.create({
    data: {
      content: "Ini postingan pertama di Threadster Clone! 🙏",
      userId: user1.id,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      content:
        "Halo semua! Selamat datang di Threadster Clone PPWL 2026 🎉",
      userId: user2.id,
    },
  });

  const comment1 = await prisma.comment.create({
    data: {
      content: "Wah keren banget ini!",
      postId: post1.id,
      userId: user3.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: "Semangat timnya!",
      postId: post1.id,
      userId: user2.id,
    },
  });

  await prisma.notification.create({
    data: {
      userId: user1.id,
      actorId: user3.id,
      type: "comment",
      postId: post1.id,
      commentId: comment1.id,
      message: "Adhelia mengomentari postingan Anda",
    },
  });

  console.log("✅ Seed data berhasil dibuat!");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });