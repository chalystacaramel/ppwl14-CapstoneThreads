import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

s3.send(new ListBucketsCommand({})).then(res => {
  res.Buckets?.forEach(b => console.log(b.Name));
}).catch(console.error);


