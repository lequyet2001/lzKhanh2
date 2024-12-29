const express = require('express');
const router = express.Router();
const {detailUser,buyCourse, getAllUsers22} = require('../controllers/userController');
const { checkToken, checkAdmin } = require('../middleware/checkToken');


// ?router.get('/', detailUser);



router.post('/allusers', checkToken, checkAdmin, getAllUsers22);







module.exports = router;
