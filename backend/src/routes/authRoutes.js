const express = require('express');
const router = express.Router();
const { authUser, registerUser, mockSSOLogin } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/sso-mock', mockSSOLogin);

module.exports = router;