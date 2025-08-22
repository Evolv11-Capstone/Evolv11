const express = require('express');
const router = express.Router();
const controller = require('../controllers/authControllers');

router.post('/register', controller.registerUser);
router.post('/login', controller.loginUser);
router.get('/me', controller.showMe);
router.delete('/logout', controller.logoutUser);

module.exports = router;