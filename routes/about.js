const express = require('express');
const router = express.Router();

// List all routes
router.get('/', (req, res) => {
    const abouts = [
        {
            path: '/api/auth/register', method: 'POST',
            howToCall: 'Send full_name, dob, email, password, avatar_url, status, role in the request body',
            description: 'Registers a new user with the provided details. No token required.'
        },
        {
            path: '/api/auth/login', method: 'POST',
            howToCall: 'Send email and password in the request body',
            description: 'Logs in a user and returns a JWT token and refresh token. No token required.'
        },
        {
            path: '/api/auth/refresh-token', method: 'POST',
            howToCall: 'Send refreshToken in the request body',
            description: 'Generates a new JWT token using the provided refresh token. No token required.'
        },
        {
            path: '/api/auth/logout', method: 'POST',
            howToCall: 'Send refreshToken in the request body',
            description: 'Logs out a user by invalidating the refresh token. Requires token in the header.'
        },
        {
            path: '/api/auth/change-password', method: 'POST',
            howToCall: 'Send oldPassword and newPassword in the request body',
            description: 'Changes the password of the logged-in user. Requires token in the header.'
        },
        {
            path: '/api/auth/forgot-password', method: 'POST',
            howToCall: 'Send email in the request body',
            description: 'Sends a reset password token to the user\'s email. No token required.'
        },
        {
            path: '/api/auth/reset-password', method: 'POST',
            howToCall: 'Send token and newPassword in the request body',
            description: 'Resets the password using the provided token. No token required.'
        },
        {
            path: '/api/users/allusers', method: 'POST',
            howToCall: 'No parameters required',
            description: 'Fetches all users. Requires admin role and token in the header.'
        },
        {
            path: '/api/admin/delete', method: 'POST',
            howToCall: 'Send user_id in the request body',
            description: 'Deletes a user with the provided user_id. Requires admin role and token in the header.'
        },
        {
            path: '/api/admin/setrole', method: 'POST',
            howToCall: 'Send user_id, role, and status in the request body',
            description: 'Sets the role and status of a user with the provided user_id. Requires admin role and token in the header.'
        },
        {
            path: '/api/courses/create', method: 'POST',
            howToCall: 'Send course details in the request body',
            description: 'Creates a new course. Requires admin role and token in the header.'
        },
        {
            path: '/api/courses/all', method: 'POST',
            howToCall: 'No parameters required',
            description: 'Fetches all courses. No token required.'
        },
        {
            path: '/api/courses/getCourseById', method: 'POST',
            howToCall: 'Send courseId in the request body',
            description: 'Fetches a course by its ID. No token required.'
        },
        {
            path: '/api/courses/updateCourse', method: 'POST',
            howToCall: 'Send courseId and updated details in the request body',
            description: 'Updates a course by its ID. Requires admin role and token in the header.'
        },
        {
            path: '/api/courses/deleteCourse', method: 'POST',
            howToCall: 'Send courseId in the request body',
            description: 'Deletes a course by its ID. Requires admin role and token in the header.'
        },
        {
            path: '/api/users/profile', method: 'POST',
            howToCall: 'No parameters required',
            description: 'Fetches the profile of the logged-in user. Requires token in the header.'
        },
        {
            path: '/api/users/profile', method: 'POST',
            howToCall: 'Send updated profile details in the request body',
            description: 'Updates the profile of the logged-in user. Requires token in the header.'
        }
    ];
    res.status(200).json(abouts);
});


module.exports = router;
