const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { protect, hrOnly } = require('../middleware/auth');

// @route   GET /api/jobs
// @desc    Get all jobs (with filters)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { branch, department, status } = req.query;

    const filter = {};
    if (branch) filter.branch = branch;
    if (department) filter.department = { $regex: department, $options: 'i' };
    if (status) filter.status = status;
    else filter.status = 'open'; // Default: only show open jobs

    const jobs = await Job.find(filter)
      .populate('branch', 'name')
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/jobs
// @desc    Create new job
// @access  Private (HR/Admin only)
router.post('/', protect, hrOnly, async (req, res) => {
  try {
    const {
      title,
      department,
      description,
      requirements,
      responsibilities,
      branch,
      availableSeats,
      experienceRequired,
      salaryRange,
      jobType,
    } = req.body;

    const job = await Job.create({
      title,
      department,
      description,
      requirements,
      responsibilities,
      branch,
      availableSeats,
      experienceRequired,
      salaryRange,
      jobType,
      postedBy: req.user._id,
    });

    const populatedJob = await Job.findById(job._id)
      .populate('branch', 'name')
      .populate('postedBy', 'name email');

    res.status(201).json(populatedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/jobs/:id
// @desc    Get job by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('branch', 'name address contactEmail contactPhone')
      .populate('postedBy', 'name email');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/jobs/:id
// @desc    Update job
// @access  Private (HR/Admin only)
router.put('/:id', protect, hrOnly, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    job.title = req.body.title || job.title;
    job.department = req.body.department || job.department;
    job.description = req.body.description || job.description;
    job.requirements = req.body.requirements || job.requirements;
    job.responsibilities = req.body.responsibilities || job.responsibilities;
    job.branch = req.body.branch || job.branch;
    job.availableSeats = req.body.availableSeats || job.availableSeats;
    job.experienceRequired = req.body.experienceRequired || job.experienceRequired;
    job.salaryRange = req.body.salaryRange || job.salaryRange;
    job.jobType = req.body.jobType || job.jobType;
    job.status = req.body.status || job.status;

    const updatedJob = await job.save();
    const populatedJob = await Job.findById(updatedJob._id)
      .populate('branch', 'name')
      .populate('postedBy', 'name email');

    res.json(populatedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete job
// @access  Private (HR/Admin only)
router.delete('/:id', protect, hrOnly, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    await job.deleteOne();
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
