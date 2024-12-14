const express = require('express');
const router = express.Router();
const {detailUser,buyCourse} = require('../controllers/userController');


router.get('/', detailUser);


router.post('/buyCourse', buyCourse);




module.exports = router;
