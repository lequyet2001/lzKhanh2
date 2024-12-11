const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;
const uri = process.env.MONGODB_URI;

const usersRouter = require('./routes/users');
const defaultRouter = require('./routes/about');
const checkToken = require('./middleware/checkToken');
const authenticationRouter = require('./routes/authentication');
const adminRouter = require('./routes/admin');
const courseRouter = require('./routes/courses');

app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

// Error handling middleware for JSON parsing errors
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ message: 'Invalid JSON' });
    }
    next();
});
// Connect to MongoDB
mongoose.connect(uri).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB', err);
});

app.use('/api/users', checkToken.checkToken, usersRouter);
app.use('/api/auth', authenticationRouter);
app.use('/api/admin', checkToken.checkToken,checkToken.checkAdmin, adminRouter);
app.use('/api/courses', courseRouter);

app.use('/', defaultRouter);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

module.exports = app;
