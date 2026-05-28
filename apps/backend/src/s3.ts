// apps/backend/src/s3.ts
// Helper upload gambar ke S3 bucket

import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { randomUUID } from "crypto"

const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: process.env.AWS_ACCESS_KEY_ID ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  } : undefined, // pakai IAM role Lambda kalau tidak ada env
})

// Bucket khusus untuk gambar postingan (BEDA dari bucket frontend)
const IMAGE_BUCKET = process.env.IMAGE_BUCKET || "ppwl11-images"
const IMAGE_BASE_URL = `https://${IMAGE_BUCKET}.s3.amazonaws.com`

/**
 * Upload buffer gambar ke S3
 * @returns URL permanen gambar
 */
export async function uploadImageToS3(
  buffer: Buffer,
  mimeType: string,
  folder = "posts"
): Promise<string> {
  const ext = mimeType.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg"
  const key = `${folder}/${randomUUID()}.${ext}`

  await s3.send(new PutObjectCommand({
    Bucket: IMAGE_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
    // Public read supaya bisa diakses langsung
    ACL: "public-read",
  }))

  return `${IMAGE_BASE_URL}/${key}`
}

/**
 * Hapus gambar dari S3 (opsional, saat post dihapus)
 */
export async function deleteImageFromS3(imageUrl: string): Promise<void> {
  try {
    const key = imageUrl.replace(`${IMAGE_BASE_URL}/`, "")
    await s3.send(new DeleteObjectCommand({ Bucket: IMAGE_BUCKET, Key: key }))
  } catch {
    // Tidak perlu throw — gambar yang gagal dihapus tidak kritis
  }
}