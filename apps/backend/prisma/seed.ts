import bcrypt from "bcryptjs";

let prisma: any;
let Provider: any;

// ==========================================
// INITIALIZE DATABASE (CONDITIONAL LOADING)
// ==========================================
async function initializeDatabase() {
  if (process.env.NODE_ENV === "dev") {
    const { getPrisma: localDb, dbUrl } = await import("./db");
    const { Provider: prof } = await import("../src/generated/prisma/client");
    
    Provider = prof;
    prisma = localDb();
    console.log("🌱 Connected to Local Database (SQLite):", dbUrl);
  } else {
    const { getPrisma: prodDb } = await import("./dbPostgres");
    const { Provider: prof } = await import("../src/generated/prisma-pg/client");
    
    Provider = prof;
    prisma = prodDb();
    console.log("🚀 Connected to Production Database (PostgreSQL)");
  }
}

// ==========================================
// MAIN SEED FUNCTION WITH LOGGING
// ==========================================
async function main() {
  await initializeDatabase();
  console.log("\n--------------------------------------------------");
  console.log("⏳ Memulai proses seeding data dummy...");
  console.log("--------------------------------------------------");

  try {
    // ------------------------------------------------
    // CLEAR OLD DATA LOGGER
    // ------------------------------------------------
    console.log("🧹 Membersihkan data lama di database...");
    const deletedNotifications = await prisma.notification.deleteMany({});
    const deletedComments = await prisma.comment.deleteMany({});
    const deletedLikes = await prisma.postLike.deleteMany({});
    const deletedPosts = await prisma.post.deleteMany({});
    const deletedUsers = await prisma.user.deleteMany({});
    
    console.log(`   ↳ Terhapus: ${deletedNotifications.count} Notifikasi, ${deletedComments.count} Komentar, ${deletedLikes.count} Likes, ${deletedPosts.count} Postingan, ${deletedUsers.count} User.`);

    // Hashing password
    const passwordHash = await bcrypt.hash("password123", 10);

    // ------------------------------------------------
    // 1. USERS SEEDING & LOG
    // ------------------------------------------------
    console.log("\n👤 Seeding tabel 'User'...");
    const user1 = await prisma.user.upsert({
      where: { email: "aisyah@example.com" },
      update: { password: passwordHash },
      create: {
        name: "Aisyah",
        email: "aisyah@example.com",
        password: passwordHash,
        provider: Provider.email,
      },
    });
    console.log(`   ✅ Created User: ${user1.name} (ID: ${user1.id})`);

    const user2 = await prisma.user.upsert({
      where: { email: "chalysta@example.com" },
      update: { password: passwordHash },
      create: {
        name: "Chalysta",
        email: "chalysta@example.com",
        password: passwordHash,
        provider: Provider.email,
      },
    });
    console.log(`   ✅ Created User: ${user2.name} (ID: ${user2.id})`);

    const user3 = await prisma.user.upsert({
      where: { email: "adhelia@example.com" },
      update: { password: passwordHash },
      create: {
        name: "Adhelia",
        email: "adhelia@example.com",
        password: passwordHash,
        provider: Provider.email,
      },
    });
    console.log(`   ✅ Created User: ${user3.name} (ID: ${user3.id})`);


    // ------------------------------------------------
    // 2. POSTS SEEDING & LOG
    // ------------------------------------------------
    console.log("\n📝 Seeding tabel 'Post'...");
    const post1 = await prisma.post.create({
      data: {
        content: "Ini postingan pertama di Threadster Clone! 🙏",
        userId: user1.id,
      },
    });
    console.log(`   ✅ Created Post ID: ${post1.id} by User ID: ${post1.userId}`);

    const post2 = await prisma.post.create({
      data: {
        content: "Halo semua! Selamat datang di Threadster Clone PPWL 2026 🎉",
        userId: user2.id,
        image_url: "https://example.com/image.jpg",
      },
    });
    console.log(`   ✅ Created Post ID: ${post2.id} by User ID: ${post2.userId}`);


    // ------------------------------------------------
    // 3. POST LIKES SEEDING & LOG
    // ------------------------------------------------
    console.log("\n❤️ Seeding tabel 'PostLike'...");
    const like1 = await prisma.postLike.create({
      data: {
        postId: post1.id,
        userId: user2.id,
      },
    });
    console.log(`   ✅ User ID: ${like1.userId} menyukai Post ID: ${like1.postId}`);


    // ------------------------------------------------
    // 4. COMMENTS SEEDING & LOG
    // ------------------------------------------------
    console.log("\n💬 Seeding tabel 'Comment'...");
    const comment1 = await prisma.comment.create({
      data: {
        content: "Wah keren banget ini!",
        postId: post1.id,
        userId: user3.id,
      },
    });
    console.log(`   ✅ Created Comment ID: ${comment1.id} on Post ID: ${comment1.postId}`);

    const comment2 = await prisma.comment.create({
      data: {
        content: "Semangat timnya!",
        postId: post1.id,
        userId: user2.id,
      },
    });
    console.log(`   ✅ Created Comment ID: ${comment2.id} on Post ID: ${comment2.postId}`);


    // ------------------------------------------------
    // 5. NOTIFICATIONS SEEDING & LOG
    // ------------------------------------------------
    console.log("\n🔔 Seeding tabel 'Notification'...");
    const notification1 = await prisma.notification.create({
      data: {
        userId: user1.id,
        actorId: user3.id,
        type: "comment",
        postId: post1.id,
        commentId: comment1.id,
        message: "Adhelia mengomentari postingan Anda",
        isRead: false,
      },
    });
    console.log(`   ✅ Created Notification ID: ${notification1.id} to User ID: ${notification1.userId}`);

    console.log("\n--------------------------------------------------");
    console.log("🎉 SEEDING SELESAI & SUKSES!");
    console.log("--------------------------------------------------\n");

  } catch (error: any) {
    console.log("\n--------------------------------------------------");
    console.error("❌ PROSES SEEDING GAGAL!");
    console.log("--------------------------------------------------");
    console.error("Detail Error Message :", error.message);
    console.error("Error Code           :", error.code ?? "N/A");
    console.error("Prisma Meta          :", error.meta ?? "None");
    console.log("--------------------------------------------------\n");
    
    // Meneruskan error ke handler utama agar proses keluar dengan code 1
    throw error;
  }
}

// RUN SEED
main()
  .catch((err) => {
    // Sembunyikan tumpukan stack trace bawaan yang terlalu panjang agar log tetap rapi
    process.exit(1);
  })
  .finally(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
  });