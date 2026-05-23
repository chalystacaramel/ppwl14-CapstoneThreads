import { PrismaClient } from "../src/generated/prisma/client.ts"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

let prisma: PrismaClient

export const getPrisma = () => {
  if (!prisma) {
    console.log("[DB] Connecting to:", process.env.DATABASE_URL)
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL!,
      ssl: { rejectUnauthorized: false },
    })
    const adapter = new PrismaPg(pool)
    prisma = new PrismaClient({ adapter })
  }
  return prisma
}