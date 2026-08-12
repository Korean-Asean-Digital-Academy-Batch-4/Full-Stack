const { Router } = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const { authenticate } = require('../../middleware/auth');
const { changePassword, login } = require('./auth.controller');

const router = Router();

router.post('/login', asyncHandler(login));
router.post('/change-password', authenticate, asyncHandler(changePassword));

module.exports = router;
