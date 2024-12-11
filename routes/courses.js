const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const {checkToken,checkTeacher} = require('../middleware/checkToken');



router.post('/create',checkToken, courseController.createCourse);
router.post('/all', courseController.getAllCourses);
router.post('/getCourseById', courseController.getCourseById);
router.post('/updateCourse',checkToken, checkTeacher, courseController.updateCourse);
router.post('/deleteCourse',checkToken, checkTeacher, courseController.deleteCourse);

router.post('/getCategories', courseController.getCategories);
router.post('/createCategory',checkToken, courseController.createCategory);

router.post('/createSections',checkToken,checkTeacher, courseController.createSections);
router.post('/getSections',checkToken, courseController.getSections);
router.post('/deleteSection',checkToken,checkTeacher, courseController.deleteSection);
router.post('/updateSection',checkToken,checkTeacher, courseController.updateSection);

module.exports = router;
