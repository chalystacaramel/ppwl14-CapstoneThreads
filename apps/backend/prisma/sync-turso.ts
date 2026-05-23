import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DB_AUTH_TOKEN!,
});

// Get existing tables
const tables = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%' AND name NOT LIKE '_litestream_%'");
console.log("Existing tables:", tables.rows.map(r => r.name));

// Full schema DDL matching schema.prisma
const ddl: string[] = [
  // User table
  `CREATE TABLE IF NOT EXISTS "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "avatar" TEXT
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`,

  // Post table
  `CREATE TABLE IF NOT EXISTS "Post" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" INTEGER NOT NULL,
    "image" TEXT,
    "likes" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
  )`,

  // Comment table
  `CREATE TABLE IF NOT EXISTS "Comment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "postId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" INTEGER NOT NULL,
    CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
  )`,

  // Notification table
  `CREATE TABLE IF NOT EXISTS "Notification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "actorId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "postId" INTEGER,
    "commentId" INTEGER,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message" TEXT NOT NULL,
    CONSTRAINT "Notification_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Notification_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
  )`,

  // PostLike table
  `CREATE TABLE IF NOT EXISTS "PostLike" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "postId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "PostLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PostLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "PostLike_userId_postId_key" ON "PostLike"("userId", "postId")`,
];

// Columns to add if table already exists but missing columns
const alterStatements: string[] = [
  // User columns that might be missing
  `ALTER TABLE "User" ADD COLUMN "avatar" TEXT`,
  `ALTER TABLE "User" ADD COLUMN "password" TEXT`,
  `ALTER TABLE "User" ADD COLUMN "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP`,
  // Post columns that might be missing
  `ALTER TABLE "Post" ADD COLUMN "image" TEXT`,
  `ALTER TABLE "Post" ADD COLUMN "likes" INTEGER NOT NULL DEFAULT 0`,
];

console.log("\n--- Creating tables (IF NOT EXISTS) ---");
for (const stmt of ddl) {
  try {
    await db.execute(stmt);
    console.log("OK:", stmt.slice(0, 60) + "...");
  } catch (e: any) {
    console.error("SKIP:", e.message?.slice(0, 80));
  }
}

console.log("\n--- Adding missing columns (ALTER TABLE) ---");
for (const stmt of alterStatements) {
  try {
    await db.execute(stmt);
    console.log("OK:", stmt);
  } catch (e: any) {
    // "duplicate column name" is expected if column already exists
    if (e.message?.includes("duplicate column")) {
      console.log("SKIP (already exists):", stmt.slice(0, 60));
    } else {
      console.error("ERROR:", e.message?.slice(0, 80), "→", stmt.slice(0, 60));
    }
  }
}

// Verify final state
console.log("\n--- Final table info ---");
for (const tbl of ["User", "Post", "Comment", "Notification", "PostLike"]) {
  const info = await db.execute(`PRAGMA table_info("${tbl}")`);
  console.log(`\n${tbl}:`, info.rows.map(r => `${r.name} (${r.type})`).join(", "));
}

db.close();
console.log("\nDone!");
