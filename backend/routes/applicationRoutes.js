const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const { protect, hrOnly } = require('../middleware/auth');
const { uploadResume, uploadCoverLetter } = require('../config/cloudinary');
const { sendEmail, emailTemplates } = require('../utils/email');
const User = require('../models/User');

// @route   POST /api/applications
// @desc    Apply for a job
// @access  Private (Candidate)
router.post('/', protect, uploadResume.single('resume'), async (req, res) => {
  try {
    const { jobId } = req.body;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      candidate: req.user._id,
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Check if resume is uploaded
    if (!req.file && !req.user.resumeUrl) {
      return res.status(400).json({ message: 'Resume is required' });
    }

    const resumeUrl = req.file ? req.file.path : req.user.resumeUrl;

    // Create application
    const application = await Application.create({
      job: jobId,
      candidate: req.user._id,
      resumeUrl: resumeUrl,
      coverLetterUrl: req.user.coverLetterUrl || '',
    });

    const populatedApplication = await Application.findById(application._id)
      .populate('job', 'title department')
      .populate('candidate', 'name email');

    // Send confirmation email
    await sendEmail(
      req.user.email,
      'Application Received',
      emailTemplates.applicationReceived(req.user.name, job.title)
    );

    res.status(201).json(populatedApplication);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/applications/my-applications
// @desc    Get logged-in candidate's applications
// @access  Private (Candidate)
router.get('/my-applications', protect, async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user._id })
      .populate('job', 'title department branch status')
      .populate({
        path: 'job',
        populate: { path: 'branch', select: 'name' }
      })
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/applications
// @desc    Get all applications (HR/Admin)
// @access  Private (HR/Admin)
router.get('/', protect, hrOnly, async (req, res) => {
  try {
    const { jobId, status } = req.query;

    const filter = {};
    if (jobId) filter.job = jobId;
    if (status) filter.status = status;

    const applications = await Application.find(filter)
      .populate('job', 'title department branch')
      .populate('candidate', 'name email phone skills experience education')
      .populate({
        path: 'job',
        populate: { path: 'branch', select: 'name' }
      })
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/applications/:id
// @desc    Get application by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job', 'title department description requirements branch')
      .populate('candidate', 'name email phone skills experience education resumeUrl coverLetterUrl')
      .populate({
        path: 'job',
        populate: { path: 'branch', select: 'name address' }
      });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check authorization
    if (
      req.user.role !== 'hr' &&
      req.user.role !== 'admin' &&
      application.candidate._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/applications/:id/status
// @desc    Update application status
// @access  Private (HR/Admin)
router.put('/:id/status', protect, hrOnly, async (req, res) => {
  try {
    const { status, notes } = req.body;

    const application = await Application.findById(req.params.id)
      .populate('candidate', 'name email')
      .populate('job', 'title');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    if (notes) application.notes = notes;

    const updatedApplication = await application.save();

    // Send email based on status
    const candidate = application.candidate;
    const jobTitle = application.job.title;

    switch (status) {
      case 'Shortlisted':
        await sendEmail(
          candidate.email,
          'You have been shortlisted!',
          emailTemplates.shortlisted(candidate.name, jobTitle)
        );
        break;
      case 'Rejected':
        await sendEmail(
          candidate.email,
          'Application Update',
          emailTemplates.rejected(candidate.name, jobTitle)
        );
        break;
      case 'Selected':
        await sendEmail(
          candidate.email,
          'Congratulations! You are selected',
          emailTemplates.selected(candidate.name, jobTitle)
        );
        break;
    }

    res.json(updatedApplication);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/applications/:id
// @desc    Delete application
// @access  Private (HR/Admin)
router.delete('/:id', protect, hrOnly, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    await application.deleteOne();
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
