'use server'

import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  },
});

const BUCKET = process.env.AWS_BUCKET_NAME!;

export async function getS3UploadUrl(
  fileKey: string,
  mimeType: string,
  expiresInSeconds = 60 * 5, // 5 minutes
  fileName?: string,
): Promise<string> {


  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: fileKey,
    ContentType: mimeType,
    ContentDisposition: `attachment${fileName ? `; filename="${fileName}"` : ""}`,
  });

  const signedUrl = await getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
  return signedUrl;
}


export async function deleteS3File(fileKey: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: fileKey,
    });
    await s3.send(command);
    return true;
  } catch (error) {
    console.log("S3 delete error:", error);
    return false;
  }
}