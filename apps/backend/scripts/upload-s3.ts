import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import mime from "mime-types";

const s3 = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

const uploadDir = async (dir: string, bucket: string, prefix = "") => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const key = prefix + file;
    
    if (fs.statSync(filePath).isDirectory()) {
      await uploadDir(filePath, bucket, key + "/");
    } else {
      const contentType = mime.lookup(filePath) || "application/octet-stream";
      await s3.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: fs.readFileSync(filePath),
        ContentType: contentType,
      }));
      console.log(`Uploaded ${key} to ${bucket}`);
    }
  }
};

(async () => {
  console.log("Uploading to www.ppwl11.store...");
  await uploadDir("../frontend/dist", "www.ppwl11.store");
  console.log("Uploading to s3-monorepo-frontend-pro...");
  await uploadDir("../frontend/dist", "s3-monorepo-frontend-pro");
  console.log("Upload complete!");
})().catch(console.error);

