const express = require('express');
const { checkToken, checkTeacher } = require('../middleware/checkToken');
const { studentSendMessage, replyMessage, getMessages } = require('../controllers/chat');
const router = express.Router();

router.post('/student/send', checkToken, studentSendMessage);
router.post('/student/reply', checkToken, replyMessage);
router.post('/teacher/reply', checkToken, checkTeacher, replyMessage);
router.post('/getMessages', checkToken, getMessages);

module.exports = router;