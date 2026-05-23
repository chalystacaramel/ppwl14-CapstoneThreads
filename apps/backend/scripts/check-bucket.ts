import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: "REDACTED",
    secretAccessKey: "10iW1c2u62VKds9RWZrLIbZxAOIRAdKXyMY3G0pn",
  },
});

async function checkBucket(name: string) {
  try {
    const res = await s3.send(new ListObjectsV2Command({ Bucket: name, MaxKeys: 5 }));
    console.log(`Bucket ${name}:`, res.Contents?.map(c => c.Key).join(", ") || "empty");
  } catch (e) {
    console.log(`Bucket ${name} error:`, e.message);
  }
}

checkBucket("ppwl11.store");
checkBucket("www.ppwl11.store");
checkBucket("s3-monorepo-frontend-pro");

