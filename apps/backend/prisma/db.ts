// apps/backend/prisma/db.ts
import { PrismaClient } from "../src/generated/prisma/client.ts"

export const getDbUrl = () => process.env.DATABASE_URL || "file:./dev.db"

let prisma: PrismaClient

export const getPrisma = () => {
  if (!prisma) {
    const url = getDbUrl()
    console.log("[DB] Connecting to:", url.startsWith("postgresql") ? "PostgreSQL (RDS)" : url)

    if (url.startsWith("postgresql") || url.startsWith("postgres")) {
      // Production: PostgreSQL via adapter-pg
      const { PrismaPg } = require("@prisma/adapter-pg")
      const { Pool } = require("pg")
      const pool = new Pool({
        connectionString: url,
        ssl: { rejectUnauthorized: false },
      })
      const adapter = new PrismaPg(pool)
      prisma = new PrismaClient({ adapter } as any)
    } else {
      // Local dev: LibSQL/SQLite
      const { PrismaLibSql } = require("@prisma/adapter-libsql/web")
      const adapter = new PrismaLibSql({
        url,
        authToken: process.env.DB_AUTH_TOKEN,
      })
      prisma = new PrismaClient({ adapter } as any)
    }
  }
  return prisma
}