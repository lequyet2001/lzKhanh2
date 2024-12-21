const express = require('express');
const router = express.Router();
const { joinCourseWithCoin, joinCourseWithCode, updateRechargeStatus, rechargeAccount, Invoicing } = require('../controllers/studentCourseController');
const { checkToken, checkAdmin } = require('../middleware/checkToken');



router.post('/joinCourseWithCoin', checkToken, joinCourseWithCoin);
router.post('/joinCourseWithCode', checkToken, joinCourseWithCode);
router.post('/rechargeAccount', checkToken, rechargeAccount);
router.post('/updateRechargeStatus', checkToken,checkAdmin ,updateRechargeStatus);
router.post('/Invoicing', checkToken, Invoicing);

module.exports = router;