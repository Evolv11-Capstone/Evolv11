const Player = require('../models/Player');

// GET /api/players/:id
exports.getPlayerById = async (req, res) => {
  const playerId = parseInt(req.params.id, 10);

  if (isNaN(playerId)) {
    return res.status(400).json({ message: 'Invalid player ID.' });
  }

  try {
    const player = await Player.findById(playerId);

    if (!player) {
      return res.status(404).json({ message: 'Player not found.' });
    }

    res.json(player); // Send the full player object
  } catch (err) {
    console.error('Failed to fetch player:', err);
    res.status(500).json({ message: 'Server error while fetching player.' });
  }
};
