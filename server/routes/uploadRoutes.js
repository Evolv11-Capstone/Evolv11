const express = require('express');
const router = express.Router();
const { upload, uploadImageToS3 } = require('../utils/s3Uploader'); // ✅ updated import

router.post('/player-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send({ message: 'No file uploaded' });

    const imageUrl = await uploadImageToS3(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    res.send({ imageUrl });
  } catch (err) {
    console.error('Image upload failed:', err);
    res.status(500).send({ message: 'Upload failed' });
  }
});

module.exports = router;
