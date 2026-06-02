import { defineConfig } from 'tsdown'

export default defineConfig({
  // Menandai @libsql sebagai external agar tidak ikut di-bundle
  external: [
    '@libsql',
    '/^@libsql\/.*/' // Menggunakan regex untuk mencakup sub-package seperti @libsql/linux-x64-gnu
  ],
  deps: {
    alwaysBundle: ['shared']
  }
})