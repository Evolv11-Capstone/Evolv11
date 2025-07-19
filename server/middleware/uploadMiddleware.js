import multer from 'multer';

const storage = multer.memoryStorage(); // use memoryStorage for uploading to S3

const upload = multer({ storage });

export default upload;