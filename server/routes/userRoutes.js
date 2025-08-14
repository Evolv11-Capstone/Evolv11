const express = require('express');
const router = express.Router();
const controller = require('../controllers/userControllers');

router.get('/', controller.listUsers);
router.get('/:id', controller.showUser);
router.patch('/:id', controller.updateUser);
router.patch('/:id/password', controller.updatePassword);

module.exports = router;
