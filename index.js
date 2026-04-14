require('dotenv').config();
const express = require('express');
const connectDB = require('./db');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Connect DB
connectDB();

const port = process.env.PORT || 3000;

app.use('/auth', authRoutes);
app.use('/users', userRoutes);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});