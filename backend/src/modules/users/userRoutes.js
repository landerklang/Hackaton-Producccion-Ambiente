const express = require('express');
const auth = require('../../middleware/auth');
const { registerUser, loginUser, getMe, updateMe } = require('./userController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', auth, getMe);
router.put('/me', auth, updateMe);

module.exports = router;
