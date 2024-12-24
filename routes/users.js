const express = require('express');
const router = express.Router();
const {detailUser,buyCourse} = require('../controllers/userController');
const { checkToken, checkAdmin } = require('../middleware/checkToken');


// ?router.get('/', detailUser);











module.exports = router;
