const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('university').trim().notEmpty().withMessage('University is required'),
    body('department').notEmpty().withMessage('Department is required'),
    body('year').notEmpty().withMessage('Year of study is required'),
    body('skills').isArray({ min: 1 }).withMessage('At least one skill is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const { name, email, password, university, department, year, skills, bio } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already registered' });
        }

        // Create user
        const user = await User.create({
            name, email, password, university, department, year, skills,
            bio: bio || 'New student on ProjectBuddy!'
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            university: user.university,
            department: user.department,
            year: user.year,
            skills: user.skills,
            bio: user.bio,
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// @route   POST /api/auth/login
// @desc    Login user & get token
// @access  Public
router.post('/login', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const { email, password } = req.body;

        // Find user with password field included
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            university: user.university,
            department: user.department,
            year: user.year,
            skills: user.skills,
            bio: user.bio,
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// @route   GET /api/auth/me
// @desc    Get current logged-in user
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
