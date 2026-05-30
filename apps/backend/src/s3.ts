import "dotenv/config"

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetBucketLocationCommand,
} from "@aws-sdk/client-s3"
import { randomUUID } from "crypto"

// ===============================
// ENV CONFIG
// ===============================

const AWS_REGION = "us-east-1"

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || ""
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || ""

const IMAGE_BUCKET = process.env.IMAGE_BUCKET || "ppwl11-images"

// ===============================
// VALIDATION (SAFETY CHECK)
// ===============================

if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
  throw new Error("AWS credentials are missing in environment variables")
}

// ===============================
// DEBUG (DEV ONLY)
// ===============================

console.log("\n========== S3 CONFIG ==========")
console.log("AWS_REGION =", AWS_REGION)
console.log("IMAGE_BUCKET =", IMAGE_BUCKET)
console.log("================================\n")

// ===============================
// S3 CLIENT
// ===============================

const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

// ===============================
// BASE URL (PRODUCTION SAFE)
// ===============================

const IMAGE_BASE_URL = `https://${IMAGE_BUCKET}.s3.amazonaws.com`

// ===============================
// BUCKET REGION CHECK (DEV ONLY)
// ===============================

async function checkBucketRegion() {
  try {
    const result = await s3.send(
      new GetBucketLocationCommand({
        Bucket: IMAGE_BUCKET,
      })
    )

    console.log("BUCKET REGION (ENV):", AWS_REGION)
    console.log(
      "BUCKET REGION (AWS):",
      result.LocationConstraint ?? "us-east-1"
    )
  } catch (err) {
    console.error("CHECK BUCKET ERROR:", err)
  }
}

if (process.env.NODE_ENV !== "production") {
  checkBucketRegion()
}

// ===============================
// UPLOAD IMAGE
// ===============================

export async function uploadImageToS3(
  buffer: Buffer,
  mimeType: string,
  folder = "posts"
): Promise<string> {
  try {
    if (!buffer || buffer.length === 0) {
      throw new Error("File buffer is empty")
    }

    if (!mimeType) {
      throw new Error("MimeType is missing")
    }

    const ext =
      mimeType.split("/")?.[1]?.replace("jpeg", "jpg") || "jpg"

    const key = `${folder}/${randomUUID()}.${ext}`

    console.log("\n========== S3 UPLOAD ==========")
    console.log("Bucket:", IMAGE_BUCKET)
    console.log("Region:", AWS_REGION)
    console.log("Key:", key)
    console.log("Mime:", mimeType)
    console.log("Size:", buffer.length, "bytes")
    console.log("===============================\n")

    await s3.send(
      new PutObjectCommand({
        Bucket: IMAGE_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      })
    )

    const imageUrl = `${IMAGE_BASE_URL}/${key}`

    console.log("✅ Upload successful:", imageUrl)

    return imageUrl
  } catch (error: any) {
    console.error("\n========== S3 UPLOAD ERROR ==========")
    console.error("Message:", error?.message)
    console.error("Name:", error?.name)
    console.error("Code:", error?.Code)
    console.error("Status:", error?.$metadata?.httpStatusCode)
    console.error("=====================================\n")

    throw new Error(
      `Gagal upload gambar ke S3: ${error?.message || "Unknown error"}`
    )
  }
}

// ===============================
// DELETE IMAGE
// ===============================

export async function deleteImageFromS3(
  imageUrl: string
): Promise<void> {
  try {
    if (!imageUrl) {
      throw new Error("Image URL is missing")
    }

    const key = imageUrl.replace(`${IMAGE_BASE_URL}/`, "")

    console.log("\n========== DELETE IMAGE ==========")
    console.log("Bucket:", IMAGE_BUCKET)
    console.log("Key:", key)
    console.log("==================================\n")

    await s3.send(
      new DeleteObjectCommand({
        Bucket: IMAGE_BUCKET,
        Key: key,
      })
    )

    console.log("✅ Image deleted:", key)
  } catch (error) {
    console.error("\n========== DELETE ERROR ==========")
    console.error(error)
    console.error("==================================\n")

    throw error
  }
}