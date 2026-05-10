const express = require('express');
const router = express.Router();
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { protect } = require('../middleware/auth');
const { uploadProfilePic, uploadResume, uploadCoverLetter } = require('../config/cloudinary');

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'candidate',
      phone,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      user.skills = req.body.skills || user.skills;
      user.experience = req.body.experience || user.experience;
      user.education = req.body.education || user.education;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        profilePicture: updatedUser.profilePicture,
        resumeUrl: updatedUser.resumeUrl,
        coverLetterUrl: updatedUser.coverLetterUrl,
        skills: updatedUser.skills,
        experience: updatedUser.experience,
        education: updatedUser.education,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/upload-profile-pic
// @desc    Upload profile picture
// @access  Private
router.post('/upload-profile-pic', protect, uploadProfilePic.single('profilePic'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user._id);
    user.profilePicture = req.file.path; // Cloudinary URL
    await user.save();

    res.json({
      message: 'Profile picture uploaded successfully',
      profilePicture: req.file.path,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/upload-resume
// @desc    Upload resume
// @access  Private
router.post('/upload-resume', protect, uploadResume.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user._id);
    user.resumeUrl = req.file.path; // Cloudinary URL
    await user.save();

    res.json({
      message: 'Resume uploaded successfully',
      resumeUrl: req.file.path,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/upload-cover-letter
// @desc    Upload cover letter
// @access  Private
router.post('/upload-cover-letter', protect, uploadCoverLetter.single('coverLetter'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user._id);
    user.coverLetterUrl = req.file.path; // Cloudinary URL
    await user.save();

    res.json({
      message: 'Cover letter uploaded successfully',
      coverLetterUrl: req.file.path,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
