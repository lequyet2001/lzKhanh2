const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();

const port = process.env.PORT || 3000;
const uri = process.env.MONGODB_URI;

const authenticationRouter = require('./routes/authentication');
const studentCourse = require('./routes/student_course');
const checkToken = require('./middleware/checkToken');
const categoryRouter = require('./routes/categories');
const sectionRouter = require('./routes/sections');
const courseRouter = require('./routes/courses');
const defaultRouter = require('./routes/about');
const adminRouter = require('./routes/admin');
const usersRouter = require('./routes/users');
const roomRouter = require('./routes/room');
const cartRouter = require('./routes/cart');
const chat = require('./routes/chat');

app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
// Error handling middleware for JSON parsing errors
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ message: 'Invalid JSON' });
    }
    next();
});
// Connect to MongoDB
mongoose.connect(uri).then((e) => {
  console.log(e.connection.name);
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB', err);
});

app.use('/api/chat', chat);
app.use('/api/cart', cartRouter);
app.use('/api/room', roomRouter);
app.use('/api/courses', courseRouter);
app.use('/api/sections',sectionRouter );
app.use('/api/auth', authenticationRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/student_course', studentCourse);
app.use('/api/users', checkToken.checkToken, usersRouter);
app.use('/api/admin', checkToken.checkToken,checkToken.checkAdmin, adminRouter);

app.use('/', defaultRouter);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

module.exports = app;
