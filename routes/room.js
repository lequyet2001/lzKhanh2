const express = require('express');
const router = express.Router();
const { createCourse, getAllCourses, getCourseById,getCourse, updateCourse, deleteCourse, createQuestion, getQuestions, getNameAndIdCourse, createQuestions, updateQuestion, deleteQuestion, getTestById, createTest, updateTest, deleteTest, getAllCourses2, generateQuestionsSet, result, getResults, getResultByIdQuestionSet, getAllCoursesAtHome, getAllCourses3 } = require('../controllers/courseController');
const {checkToken,checkTeacher, checkToken2} = require('../middleware/checkToken');
const { RoomManager, getListRoom, createRoom, deleteRoom } = require('../controllers/roomController');





router.post('/RoomManager',  RoomManager);

router.get('/getListRoom',  getListRoom);

router.post('/createRoom', createRoom);

router.post('/deleteRoom', deleteRoom);


module.exports = router;