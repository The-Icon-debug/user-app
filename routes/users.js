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
    if (req.user.role === 'admin') {
        const users = await User.find().select('-password');
        return res.json(users);
    }

    // Normal user → only themselves
    const user = await User.findById(req.user.userId).select('-password');
    res.json([user]);
});


// READ single user
router.get('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// UPDATE user (user to only update their own profile, admin can update any)
router.put('/:id', auth, async (req, res) => {
    try {
        const targetUserId = req.params.id;

        // Allow if admin OR owner
        if (
            req.user.role !== 'admin' &&
            req.user.userId !== targetUserId
        ) {
            return res.status(403).json({ error: "Access denied" });
        }

        // Prevent role updates from frontend
        delete req.body.role;

        const updatedUser = await User.findByIdAndUpdate(
            targetUserId,
            req.body,
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(updatedUser);

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// DELETE user (admin only)
router.delete('/:id', auth, role(['admin']), async (req, res) => {
    try {
        if (req.user.userId === req.params.id) {
            return res.status(400).json({ error: "You cannot delete yourself" });
        }
        const deletedUser = await User.findByIdAndDelete(req.params.id);

        if (!deletedUser) return res.status(404).json({ error: "User not found" });

        res.json({ message: "User deleted" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;