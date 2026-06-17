import "dotenv/config";
import {
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const s3 = new S3Client({ region: process.env.AWS_REGION! });

async function main() {
  const res2 = await s3.send(
    new GetObjectCommand({ Bucket: process.env.AWS_BUCKET_NAME, Key: "0" }),
  );
  console.log(await res2.Body?.transformToString());
}

main();
