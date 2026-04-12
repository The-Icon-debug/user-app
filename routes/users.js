const express = require('express');
const router = express.Router();
const User = require('../models/User');


// CREATE user
router.post('/', async (req, res) => {
    try {
        const user = new User(req.body);
        const savedUser = await user.save();
        res.status(201).json(savedUser);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// GET all users
router.get('/', async (req, res) => {
    const users = await User.find();
    res.json(users);
});


// READ single user
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).send("User not found");
        res.json(user);
    } catch (err) {
        res.status(400).send("Invalid ID");
    }
});


// UPDATE user
router.put('/:id', async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedUser) return res.status(404).send("User not found");

        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// DELETE user
router.delete('/:id', async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);

        if (!deletedUser) return res.status(404).send("User not found");

        res.send("User deleted");
    } catch (err) {
        res.status(400).send("Invalid ID");
    }
});

module.exports = router;