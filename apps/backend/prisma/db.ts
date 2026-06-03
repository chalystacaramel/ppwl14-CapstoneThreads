<<<<<<< HEAD
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";
=======
// apps/backend/prisma/db.ts
import { PrismaClient } from "../src/generated/prisma/client.js"
>>>>>>> e6c330b

export const dbUrl = process.env.DATABASE_URL || `file:${path.resolve(__dirname, "../dev.db")}`;

<<<<<<< HEAD
const adapter = new PrismaLibSql({ url: dbUrl, authToken: process.env.DB_TOKEN });

let prisma: PrismaClient;
=======
let prisma: PrismaClient | undefined
let lastUrl: string | undefined
>>>>>>> e6c330b

export const getPrisma = () => {
  const url = getDbUrl()

  // Reset singleton if URL changed (e.g. SSM loaded after first call)
  if (prisma && lastUrl !== url) {
    prisma = undefined
  }

  if (!prisma) {
<<<<<<< HEAD
    prisma = new PrismaClient({ adapter });
  }
  return prisma;
};
=======
    lastUrl = url
    console.log("[DB] Connecting to:", url.startsWith("postgresql") ? "PostgreSQL (RDS)" : url)

    if (url.startsWith("postgresql") || url.startsWith("postgres")) {
      const { PrismaPg } = require("@prisma/adapter-pg")
      const adapter = new PrismaPg({ connectionString: url, ssl: { rejectUnauthorized: false } })
      prisma = new PrismaClient({ adapter } as any)
    } else if (url.startsWith("file:")) {
      const { PrismaLibSql } = require("@prisma/adapter-libsql")
      const adapter = new PrismaLibSql({ url })
      prisma = new PrismaClient({ adapter } as any)
    } else {
      const { PrismaLibSql } = require("@prisma/adapter-libsql/web")
      const adapter = new PrismaLibSql({ url, authToken: process.env.DB_AUTH_TOKEN })
      prisma = new PrismaClient({ adapter } as any)
    }
  }

  return prisma
}
>>>>>>> e6c330b
