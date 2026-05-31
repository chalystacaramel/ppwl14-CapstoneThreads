import { S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

const bucket_name = "ppwl11-images";
const region_name = "us-east-1";

const s3 = new S3Client({
    region: region_name,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export const uploadS3File = async (image: File) => {
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${randomUUID()}-${image.name}`;

    await s3.send(
        new PutObjectCommand({
            Bucket: bucket_name,
            Key: fileName,
            Body: buffer,
            ContentType: image.type,
        })
    );

    const imageUrl =
        `https://${bucket_name}.s3.${region_name}.amazonaws.com/${fileName}`;

    return imageUrl;
}

export const deleteS3File = async (imageUrl: string) => {
    const key = imageUrl.split("/").pop();

    if (!key) return false;

    await s3.send(
        new DeleteObjectCommand({
            Bucket: bucket_name,
            Key: key,
        })
    );

    return true;
};