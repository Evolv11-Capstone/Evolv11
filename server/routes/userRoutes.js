const express = require('express');
const router = express.Router();
const controller = require('../controllers/userControllers');

router.get('/', controller.listUsers);
router.get('/:id', controller.showUser);
router.patch('/:id', controller.updateUser);

module.exports = router;
