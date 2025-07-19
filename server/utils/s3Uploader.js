// s3Uploader.js
const multer = require('multer');
const storage = multer.memoryStorage(); // Stores image in memory (buffer)

const upload = multer({ storage }); // ✅ this is your .single() uploader

const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
require('dotenv').config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// ✅ Utility function to upload image buffer to S3
async function uploadImageToS3(fileBuffer, filename, mimetype) {
  const upload = new Upload({
    client: s3,
    params: {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `players/${Date.now()}-${filename}`,
      Body: fileBuffer,
      ContentType: mimetype,
    },
  });

  const result = await upload.done();
  return result.Location;
}

// ✅ Export both upload middleware and upload logic
module.exports = { upload, uploadImageToS3 };
