const express = require('express');
const auth = require('../../middleware/auth');
const { registerUser, loginUser, getMe } = require('./userController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', auth, getMe);

module.exports = router;
