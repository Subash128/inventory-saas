import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_KEY,
  },
});

export const uploadToCloudflare = async (file) => {
  const fileKey = `inventory/${Date.now()}-${file.originalname}`;

  const command = new PutObjectCommand({
    Bucket: process.env.CLOUDFLARE_BUCKET,
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3.send(command);

  return `${process.env.CLOUDFLARE_PUBLIC_URL}/${fileKey}`;
};