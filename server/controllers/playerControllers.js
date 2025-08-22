const Player = require('../models/Player'); 
const ModerateReview = require('../models/ModerateReview')             // Player model
const User = require('../models/User');                  // Import User to enrich with image
const { uploadImageToS3 } = require('../utils/s3Uploader'); // S3 utility
const multer = require('multer');                        // Middleware for multipart uploads
const upload = multer();                                 // Parse image from form-data

/**
 * GET /api/players/:id
 * Fetch a player profile by ID, and enrich it with image_url from their user record
 */
exports.getPlayerById = async (req, res) => {
  const playerId = parseInt(req.params.playerId, 10); // <-- use playerId
  if (isNaN(playerId)) {
    return res.status(400).json({ message: 'Invalid player ID.' });
  }

  try {
    const player = await Player.findById(playerId); // Core player info from players table
    if (!player) return res.status(404).json({ message: 'Player not found.' });

    const user = await User.find(player.id); // Assume player.id === user.id (linked by user_id)
    if (user && user.image_url) {
      player.image_url = user.image_url; // Attach image from users table
    }

    res.json(player); // Return enriched player object
  } catch (err) {
    console.error('Failed to fetch player:', err);
    res.status(500).json({ message: 'Server error while fetching player.' });
  }
};

/**
 * POST /api/players/upload-image
 * Upload image to S3 and return image URL — used during registration
 */
exports.uploadImageOnly = [
  upload.single('image'), // Multer middleware to parse the image
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

      const imageUrl = await uploadImageToS3(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      return res.status(200).json({ imageUrl }); // Return the S3 public URL
    } catch (err) {
      console.error('Image upload failed:', err);
      return res.status(500).json({ message: 'Upload failed' });
    }
  },
];

/// GET /api/players/full-fifa-card/:playerId
exports.getFullFifaCardById = async (req, res) => {
  const { playerId } = req.params;

  try {
    console.log('Looking up player with ID:', playerId);
    const player = await Player.findByIdWithFullStats(playerId);
    console.log('Player found:', player);

    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    res.json(player);
  } catch (error) {
    console.error('Error in getFullFifaCardById:', error);
    res.status(500).json({ message: 'Failed to retrieve player data' });
  }
};

// Controller: GET /api/players/:playerId/moderate-summary
// Fetches a summary of moderate reviews for a player
exports.getModerateStatsSummary = async (req, res) => {
  const { playerId } = req.params;

  try {
    const stats = await ModerateReview.getSummaryForPlayer(playerId); // you must have this method
    res.json(stats);
  } catch (error) {
    console.error('Failed to fetch moderate stats summary:', error);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
};

// Controller: PUT /api/players/:id/position
// Updates a player's position
exports.updatePlayerPosition = async (req, res) => {
  const playerId = parseInt(req.params.id, 10);
  const { position } = req.body;

  if (!position) {
    return res.status(400).json({ message: 'Position is required.' });
  }

  try {
    const updatedPlayer = await Player.updateStats(playerId, { position });
    if (!updatedPlayer) {
      return res.status(404).json({ message: 'Player not found.' });
    }
    res.status(200).json({ message: 'Position updated successfully.' });
  } catch (err) {
    console.error('Failed to update player position:', err);
    res.status(500).json({ message: 'Server error' });
  }
};