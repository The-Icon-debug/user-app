require('dotenv').config();
const express = require('express');
const connectDB = require('./db');

const app = express();
app.use(express.json());

// Connect DB
connectDB();

const port = process.env.PORT || 3000;

const userRoutes = require('./routes/users');
app.use('/users', userRoutes);

app.get('/', (req, res) => {
    res.send(`Welcome to ${process.env.APP_NAME}`);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});