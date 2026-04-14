const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const auth = require('../middleware/auth');
const role = require('../middleware/role');


// CREATE user (admin only)
router.post('/', auth, role(['admin']), async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            phone,
            password: hashedPassword,
            role: 'user'
        });
        const savedUser = await user.save();

        res.status(201).json(savedUser);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


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


// UPDATE user (user to only update their own profile, admin can update any)
router.put('/:id', auth, role(['admin']), async (req, res) => {
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


// DELETE user (admin only)
router.delete('/:id', auth, role(['admin']), async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);

        if (!deletedUser) return res.status(404).send("User not found");

        res.send("User deleted");
    } catch (err) {
        res.status(400).send("Invalid ID");
    }
});

module.exports = router;