const express = require('express');
const router = express.Router();
const controller = require('../controllers/coachTeamRequestControllers');

router.get('/', controller.listCoachRequests);
router.post('/', controller.createCoachRequest);
// Approve a coach join request
router.patch('/:id/approve', controller.approveCoachRequest);
// Reject a coach join request
router.patch('/:id/reject', controller.rejectRequest);


module.exports = router;
