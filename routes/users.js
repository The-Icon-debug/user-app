const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/User');
const auth = require('../middleware/auth');


// CREATE user (signup)
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ ...req.body, password: hashedPassword });
        const savedUser = await user.save();
        res.status(201).json(savedUser);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// LOGIN
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("Invalid credentials");

    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    res.json({ token });
});


//  protected routes
// GET all users
router.get('/', auth, async (req, res) => {
    const users = await User.find().select('-password'); // Exclude password field
    res.json(users);
});


// READ single user
router.get('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).send("User not found");
        res.json(user);
    } catch (err) {
        res.status(400).send("Invalid ID");
    }
});


// UPDATE user
router.put('/:id', auth, async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) return res.status(404).send("User not found");

        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// DELETE user
router.delete('/:id', auth, async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);

        if (!deletedUser) return res.status(404).send("User not found");

        res.send("User deleted");
    } catch (err) {
        res.status(400).send("Invalid ID");
    }
});

module.exports = router;