const express = require('express');
const { registerUser, getUserInfo, changePassword } = require('../controllers/userController');
const {authenticateToken} = require("../middleware/authMiddleware");

const router = express.Router();




router.post('/register', registerUser);
router.get('/profile', authenticateToken, getUserInfo);
router.put('/profile/changePassword', authenticateToken, changePassword);

module.exports = router;
