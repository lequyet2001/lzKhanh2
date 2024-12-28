const express = require('express');
const { checkToken, checkTeacher } = require('../middleware/checkToken');
const { sendMessageFromStudent, getMessageToTeacher, sendMessageFromTeacher, getMessageToStudent } = require('../controllers/chat');
const router = express.Router();

router.post('/sendMessageFromStudent', checkToken, sendMessageFromStudent);
router.post('/sendMessageFromTeacher', checkToken, checkTeacher, sendMessageFromTeacher);


router.post('/getMessageToTeacher', checkToken, checkTeacher, getMessageToTeacher);
router.post('/getMessageToStudent', checkToken, getMessageToStudent);
module.exports = router;