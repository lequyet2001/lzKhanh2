const express = require('express');
const router = express.Router();

// List all routes
router.get('/', (req, res) => {
    const abouts = [
        {
            "_id": "67719baf60bdd1fdba6b19d7",
            "sender": {
                "user_id": "675d289913d195acb747e123",
                "full_name": "John Doe2",
                "email": "admin@gmail.com"
            },
            "course_id": "676e18281f0c68f91918f7c5",
            "receiver": {
                "user_id": "6770180614e2251724fa5336",
                "full_name": "Học sinh",
                "email": "student@gmail.com"
            },
            "message": "123",
            "replyTo": {
                "_id": "67719ba760bdd1fdba6b19cf",
                "message": "test 1"
            },
            "isQuestion": false,
            "timestamp": "2024-12-29T18:57:51.567Z",
            "__v": 0
        },
        {
            "_id": "67719be260bdd1fdba6b1a04",
            "sender": {
                "user_id": "675d289913d195acb747e123",
                "full_name": "John Doe2",
                "email": "admin@gmail.com"
            },
            "course_id": "676e18281f0c68f91918f7c5",
            "receiver": {
                "user_id": "6770180614e2251724fa5336",
                "full_name": "Học sinh",
                "email": "student@gmail.com"
            },
            "message": "312",
            "replyTo": {
                "_id": "67719ba760bdd1fdba6b19cf",
                "message": "test 1"
            },
            "isQuestion": false,
            "timestamp": "2024-12-29T18:58:42.925Z",
            "__v": 0
        }
    ]
    res.status(200).json(abouts);
});


module.exports = router;


