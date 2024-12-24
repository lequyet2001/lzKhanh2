const express = require('express');
const router = express.Router();

// List all routes
router.get('/', (req, res) => {
    const abouts = [
        "/api/student_course/joinCourseWithTeacher",
        "/api/student_course/listUser",
        "/api/student_course/listStudentCourse",
        "/api/student_course/deleteStudentCourse",
        "/api/student_course/updateProgress",
    ];
    res.status(200).json(abouts);
});


module.exports = router;
