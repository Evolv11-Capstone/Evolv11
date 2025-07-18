const express = require('express');
const router = express.Router();
const controller = require('../controllers/playerTeamRequestControllers');

router.get('/', controller.listPlayerRequests);
router.post('/', controller.createPlayerRequest);
// Approve a player join request
router.patch('/:id/approve', controller.approvePlayerRequest);
// Reject a player join request
router.patch('/:id/reject', controller.rejectRequest);


module.exports = router;
