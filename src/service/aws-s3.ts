import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { s3Client } from "../config/aws-s3";

export class S3Service {
  static async uploadImage(
    file: Express.Multer.File,
    folder: "avatars" | "docs",
  ) {
    const key = `${folder}/${randomUUID()}-${file.originalname}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return {
      key,
      url: `${process.env.CDN_DOMAIN}/${key}`, // e.g. https://d123abc.cloudfront.net
    };
  }

  static async deleteImage(key: string) {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: key,
      }),
    );
  }
}
