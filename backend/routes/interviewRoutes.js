const express = require('express');
const router = express.Router();
const Interview = require('../models/Interview');
const Application = require('../models/Application');
const { protect, hrOnly } = require('../middleware/auth');
const { sendEmail, emailTemplates } = require('../utils/email');

// @route   POST /api/interviews
// @desc    Schedule an interview
// @access  Private (HR/Admin)
router.post('/', protect, hrOnly, async (req, res) => {
  try {
    const {
      applicationId,
      scheduledDate,
      scheduledTime,
      mode,
      location,
      meetingLink,
      message,
    } = req.body;

    // Get application
    const application = await Application.findById(applicationId)
      .populate('candidate', 'name email')
      .populate('job', 'title');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Create interview
    const interview = await Interview.create({
      application: applicationId,
      candidate: application.candidate._id,
      job: application.job._id,
      scheduledDate,
      scheduledTime,
      mode,
      location,
      meetingLink,
      message,
      scheduledBy: req.user._id,
    });

    // Update application status
    application.status = 'Interview Scheduled';
    await application.save();

    // Send email to candidate
    const formattedDate = new Date(scheduledDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    await sendEmail(
      application.candidate.email,
      'Interview Scheduled',
      emailTemplates.interviewScheduled(
        application.candidate.name,
        application.job.title,
        formattedDate,
        scheduledTime,
        mode,
        location,
        meetingLink,
        message
      )
    );

    const populatedInterview = await Interview.findById(interview._id)
      .populate('candidate', 'name email phone')
      .populate('job', 'title department')
      .populate('application');

    res.status(201).json(populatedInterview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/interviews
// @desc    Get all interviews
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let filter = {};

    // If candidate, show only their interviews
    if (req.user.role === 'candidate') {
      filter.candidate = req.user._id;
    }

    const interviews = await Interview.find(filter)
      .populate('candidate', 'name email phone')
      .populate('job', 'title department')
      .populate({
        path: 'job',
        populate: { path: 'branch', select: 'name' }
      })
      .populate('scheduledBy', 'name email')
      .sort({ scheduledDate: 1 });

    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/interviews/:id
// @desc    Get interview by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('candidate', 'name email phone')
      .populate('job', 'title department description')
      .populate('application')
      .populate('scheduledBy', 'name email');

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // Check authorization
    if (
      req.user.role !== 'hr' &&
      req.user.role !== 'admin' &&
      interview.candidate._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/interviews/:id
// @desc    Update interview
// @access  Private (HR/Admin)
router.put('/:id', protect, hrOnly, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('candidate', 'name email')
      .populate('job', 'title');

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    interview.scheduledDate = req.body.scheduledDate || interview.scheduledDate;
    interview.scheduledTime = req.body.scheduledTime || interview.scheduledTime;
    interview.mode = req.body.mode || interview.mode;
    interview.location = req.body.location || interview.location;
    interview.meetingLink = req.body.meetingLink || interview.meetingLink;
    interview.message = req.body.message || interview.message;
    interview.status = req.body.status || interview.status;

    const updatedInterview = await interview.save();

    // Send updated email if rescheduled
    if (req.body.status === 'Rescheduled' || req.body.scheduledDate || req.body.scheduledTime) {
      const formattedDate = new Date(updatedInterview.scheduledDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      await sendEmail(
        interview.candidate.email,
        'Interview Rescheduled',
        emailTemplates.interviewScheduled(
          interview.candidate.name,
          interview.job.title,
          formattedDate,
          updatedInterview.scheduledTime,
          updatedInterview.mode,
          updatedInterview.location,
          updatedInterview.meetingLink,
          'Your interview has been rescheduled. Please check the new details below.'
        )
      );
    }

    res.json(updatedInterview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/interviews/:id
// @desc    Delete interview
// @access  Private (HR/Admin)
router.delete('/:id', protect, hrOnly, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    await interview.deleteOne();
    res.json({ message: 'Interview deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
