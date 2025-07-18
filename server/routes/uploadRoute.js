const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = require('../config/s3');
const router = express.Router();

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: BUCKET_NAME,
    acl: 'public-read', // optional: gives public access
    metadata: (req, file, cb) => cb(null, { fieldName: file.fieldname }),
    key: (req, file, cb) => {
      const filename = `players/${Date.now()}-${file.originalname}`;
      cb(null, filename);
    },
  }),
});

// POST /api/upload/player-image
router.post('/player-image', upload.single('image'), (req, res) => {
  res.send({
    imageUrl: req.file.location,
    key: req.file.key,
  });
});

module.exports = router;
