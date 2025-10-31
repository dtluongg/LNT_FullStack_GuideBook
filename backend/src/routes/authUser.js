const express = require('express');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { register, login, refresh, me, changePassword, logout } = require('../controllers/authUserController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// rate-limit riêng cho auth
const authLimiter = rateLimit({ windowMs: 60 * 1000, max: 20 });
router.use(cookieParser());
router.use(authLimiter);

router.post('/register', register);          // seed nhanh; production: chỉ admin dùng
router.post('/login', login);
router.post('/refresh', refresh);
router.get('/me', requireAuth, me);
router.post('/change-password', requireAuth, changePassword);
router.post('/logout', logout);

module.exports = router;
