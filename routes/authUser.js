const express = require('express');
const router = express.Router();
const { getDetails, postSignin, postSignup } = require('../controllers/auth');

router.post('/api/auth/signup', postSignup);
router.post('/api/auth/login', postSignin);
router.get('/api/auth/me', getDetails);

module.exports = router;
