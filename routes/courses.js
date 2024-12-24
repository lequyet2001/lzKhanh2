const express = require('express');
const router = express.Router();
const { createCourse, getAllCourses, getCourseById,getCourse, updateCourse, deleteCourse, createQuestion, getQuestions, getNameAndIdCourse, createQuestions, updateQuestion, deleteQuestion, getTestById, createTest, updateTest, deleteTest, getAllCourses2 } = require('../controllers/courseController');
const {checkToken,checkTeacher} = require('../middleware/checkToken');

router.post('/getCourse',checkToken,checkTeacher,getCourse)




router.post('/create',checkToken, createCourse);
router.post('/all', getAllCourses);
router.post('/all2', checkToken,getAllCourses2);
router.post('/getCourseById', checkToken ,getCourseById);



router.post('/updateCourse',checkToken, checkTeacher, updateCourse);
router.post('/deleteCourse',checkToken, checkTeacher, deleteCourse);
router.post('/createQuestion',checkToken, checkTeacher, createQuestion);
router.post('/createQuestions',checkToken, checkTeacher, createQuestions);
router.post('/getNameAndIdCourse', getNameAndIdCourse);
router.post('/getQuestions', getQuestions);
router.post('/updateQuestion',checkToken, checkTeacher, updateQuestion);
router.post('/deleteQuestion',checkToken, checkTeacher, deleteQuestion);
router.post('/createTest',checkToken, checkTeacher, createTest);
router.post('/updateTest',checkToken, checkTeacher, updateTest);
router.post('/deleteTest',checkToken, checkTeacher, deleteTest);
router.post('/getTestById', getTestById);

module.exports = router;
