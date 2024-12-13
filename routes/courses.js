const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const {checkToken,checkTeacher} = require('../middleware/checkToken');

router.post('/create',checkToken, courseController.createCourse);
router.post('/all', courseController.getAllCourses);
router.post('/getCourseById', courseController.getCourseById);
router.post('/updateCourse',checkToken, checkTeacher, courseController.updateCourse);
router.post('/deleteCourse',checkToken, checkTeacher, courseController.deleteCourse);


module.exports = router;
