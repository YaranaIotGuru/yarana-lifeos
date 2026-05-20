const express = require('express');
const router = express.Router();
const { register, login, updateFcmToken, getProfile, updateProfile } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.put('/fcm-token', authMiddleware, updateFcmToken);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);

module.exports = router;
