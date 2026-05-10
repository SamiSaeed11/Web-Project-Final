const express = require('express');
const router = express.Router();
const Branch = require('../models/Branch');
const { protect, hrOnly } = require('../middleware/auth');

// @route   GET /api/branches
// @desc    Get all branches
// @access  Public
router.get('/', async (req, res) => {
  try {
    const branches = await Branch.find({ isActive: true });
    res.json(branches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/branches
// @desc    Create new branch
// @access  Private (HR/Admin only)
router.post('/', protect, hrOnly, async (req, res) => {
  try {
    const { name, address, contactEmail, contactPhone } = req.body;

    const branch = await Branch.create({
      name,
      address,
      contactEmail,
      contactPhone,
    });

    res.status(201).json(branch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/branches/:id
// @desc    Get branch by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }
    res.json(branch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/branches/:id
// @desc    Update branch
// @access  Private (HR/Admin only)
router.put('/:id', protect, hrOnly, async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);

    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    branch.name = req.body.name || branch.name;
    branch.address = req.body.address || branch.address;
    branch.contactEmail = req.body.contactEmail || branch.contactEmail;
    branch.contactPhone = req.body.contactPhone || branch.contactPhone;
    branch.isActive = req.body.isActive !== undefined ? req.body.isActive : branch.isActive;

    const updatedBranch = await branch.save();
    res.json(updatedBranch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/branches/:id
// @desc    Delete branch
// @access  Private (HR/Admin only)
router.delete('/:id', protect, hrOnly, async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);

    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    await branch.deleteOne();
    res.json({ message: 'Branch deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
