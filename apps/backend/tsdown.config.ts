import { defineConfig } from 'tsdown'
export default defineConfig({
  deps: {
    alwaysBundle: ['shared', '@prisma/adapter-pg', 'pg', '@prisma/client']
  }
})