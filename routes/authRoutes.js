const express = require('express');
const { loginUser, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', loginUser);
router.put('/change-password', protect, changePassword);

module.exports = router;
