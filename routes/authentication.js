const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { checkToken } = require('../middleware/checkToken');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/change-password', checkToken,authController.changePassword);
router.post('/forgot-password',authController.forgotPassword);
router.post('/reset-password',authController.resetPassword);



module.exports = router;
