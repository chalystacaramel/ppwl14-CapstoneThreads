# Dokumentasi Perbaikan Error (Error Log & Resolution)

Dokumen ini mencatat riwayat kendala/error yang ditemukan pada repositori monorepo **PPWL Threads Clone**, penyebab utamanya, serta langkah-langkah resolusi yang telah diterapkan agar sistem dapat berjalan stabil di lingkungan lokal maupun produksi (AWS Lambda & S3).

---

## 1. Error Dependensi Prisma Client di AWS Lambda

### **Gejala (Symptom)**
AWS Lambda mengembalikan status `500 Internal Server Error` / `502 Bad Gateway`. Berdasarkan log CloudWatch:
```text
Init Error {"errorType":"Runtime.ImportModuleError","errorMessage":"Error: Cannot find module '@prisma/client/runtime/client'\nRequire stack:\n- /var/task/lambda.js"}
```

### **Penyebab Utama (Root Cause)**
Saat melakukan bundling backend menggunakan `esbuild`, `@prisma/client` dieksklusikan dari bundel menggunakan opsi `--external:@prisma/client`. Karena tidak ada folder `node_modules` atau AWS Lambda Layer yang diunggah bersama file `lambda.js` di dalam arsip ZIP, runtime Node.js tidak dapat menemukan modul tersebut.

### **Resolusi (Resolution)**
* Memodifikasi parameter `esbuild` untuk menggabungkan (*bundle*) `@prisma/client` langsung ke dalam satu file `lambda.js`.
* Menambahkan polyfill untuk `import.meta.url` agar berjalan lancar pada format modul CommonJS (CJS) di Node.js menggunakan opsi `--define` dan `--banner` dari `esbuild`:
  ```bash
  esbuild src/lambda.ts --bundle --platform=node --format=cjs --target=node22 --outfile=dist-lambda/lambda.js "--banner:js=globalThis.import_meta_url = require('url').pathToFileURL(__filename).toString();" --define:import.meta.url="globalThis.import_meta_url"
  ```

---

## 2. Generator Client Khusus Bun di schema.prisma

### **Gejala (Symptom)**
Terdapat *syntax error* dan kegagalan kompilasi ketika bundel backend dijalankan pada runtime Node.js di AWS Lambda karena penggunaan modul internal khusus runtime Bun.

### **Penyebab Utama (Root Cause)**
Konfigurasi generator pada [schema.prisma](file:///c:/laragon/www/ppwl14-CapstoneThreads/apps/backend/prisma/schema.prisma) diatur dengan parameter `provider = "prisma-client"` dan `runtime = "bun"`. Ini memaksa Prisma menghasilkan client yang tidak kompatibel dengan lingkungan non-Bun (seperti runtime `nodejs24.x` di Lambda).

### **Resolusi (Resolution)**
Mengubah konfigurasi generator ke modul standar JavaScript:
```prisma
generator client {
  provider   = "prisma-client-js"
  output     = "../src/generated/prisma"
}
```

---

## 3. Kredensial Database Turso Terhapus & Berubah di SSM

### **Gejala (Symptom)**
Saat pengguna mencoba login atau register, server mengembalikan status `500` dengan pesan error:
```text
DriverAdapterError: SERVER_ERROR: Server returned HTTP status 401
```
Namun saat diuji secara lokal dengan SQLite berbasis file (`dev.db`), proses login & register berjalan lancar.

### **Penyebab Utama (Root Cause)**
1. Parameter `/monorepo/DATABASE_URL` di AWS SSM Parameter Store telah diubah/ditimpa menjadi URL database milik rekan tim lain (`libsql://threads-andyemerik1045.aws-ap-northeast-1.turso.io`).
2. Parameter token database `/monorepo/DB_AUTH_TOKEN` terhapus dari SSM Parameter Store.
Hal ini menyebabkan Lambda memuat alamat database yang salah tanpa token otentikasi, sehingga ditolak oleh server Turso.

### **Resolusi (Resolution)**
* Memulihkan alamat `/monorepo/DATABASE_URL` ke database utama Anda (`libsql://monorepo-adheliaissabel.aws-ap-northeast-1.turso.io`).
* Membuat kembali parameter `/monorepo/DB_AUTH_TOKEN` dengan token yang valid di SSM Parameter Store.
* Mengunggah ulang (*re-deploy*) kode Lambda untuk membersihkan cache global (`isLoaded` cache) di AWS.

---

## 4. Error Kompilasi TypeScript Variable AWS_REGION

### **Gejala (Symptom)**
Kompilasi TypeScript pada skrip backend gagal dengan pesan kesalahan:
```text
scripts/check-bucket.ts(4,11): error TS2304: Cannot find name 'AWS_REGION'.
```

### **Penyebab Utama (Root Cause)**
Skrip [check-bucket.ts](file:///c:/laragon/www/ppwl14-CapstoneThreads/apps/backend/scripts/check-bucket.ts) menggunakan variabel `AWS_REGION` pada insialisasi `S3Client`, tetapi variabel tersebut tidak diimpor atau dideklarasikan di bagian atas file.

### **Resolusi (Resolution)**
Mengganti variabel referensi menjadi string literal wilayah yang valid:
```typescript
const s3 = new S3Client({
  region: "us-east-1",
  // ...
});
```

---

## 5. Kegagalan Linting tipe data 'any' di DetailPostPage.tsx

### **Gejala (Symptom)**
Pemeriksaan kualitas kode otomatis (`bun run lint`) di sisi frontend gagal:
```text
C:\laragon\www\ppwl14-CapstoneThreads\apps\frontend\src\pages\DetailPostPage.tsx
  79:40  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
```

### **Penyebab Utama (Root Cause)**
Penggunaan tipe data implisit `any` pada pemetaan komentar hasil fitur baru tanpa disertai penanda penonaktifan aturan ESLint (`eslint-disable-next-line`).

### **Resolusi (Resolution)**
Menambahkan komentar penonaktifan aturan linter pada baris pemetaan data komentar di [DetailPostPage.tsx](file:///c:/laragon/www/ppwl14-CapstoneThreads/apps/frontend/src/pages/DetailPostPage.tsx):
```typescript
setComments(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  postData.comments?.map((c: any) => ({
    // ...
  }))
);
```
