const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// Send email function
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `ATS System <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
};

// Email templates
const emailTemplates = {
  applicationReceived: (candidateName, jobTitle) => `
    <h2>Application Received</h2>
    <p>Dear ${candidateName},</p>
    <p>Thank you for applying for the position of <strong>${jobTitle}</strong>.</p>
    <p>We have received your application and our HR team will review it shortly.</p>
    <p>You will be notified about the next steps via email.</p>
    <br>
    <p>Best regards,<br>HR Team</p>
  `,

  shortlisted: (candidateName, jobTitle) => `
    <h2>Congratulations! You've Been Shortlisted</h2>
    <p>Dear ${candidateName},</p>
    <p>We are pleased to inform you that you have been shortlisted for the position of <strong>${jobTitle}</strong>.</p>
    <p>Our HR team will contact you soon to schedule an interview.</p>
    <br>
    <p>Best regards,<br>HR Team</p>
  `,

  interviewScheduled: (candidateName, jobTitle, date, time, mode, location, meetingLink, message) => `
    <h2>Interview Scheduled</h2>
    <p>Dear ${candidateName},</p>
    <p>Your interview for the position of <strong>${jobTitle}</strong> has been scheduled.</p>
    <h3>Interview Details:</h3>
    <ul>
      <li><strong>Date:</strong> ${date}</li>
      <li><strong>Time:</strong> ${time}</li>
      <li><strong>Mode:</strong> ${mode}</li>
      ${location ? `<li><strong>Location:</strong> ${location}</li>` : ''}
      ${meetingLink ? `<li><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></li>` : ''}
    </ul>
    ${message ? `<p><strong>Additional Message:</strong><br>${message}</p>` : ''}
    <p>Please be on time and prepare accordingly.</p>
    <br>
    <p>Best regards,<br>HR Team</p>
  `,

  rejected: (candidateName, jobTitle) => `
    <h2>Application Update</h2>
    <p>Dear ${candidateName},</p>
    <p>Thank you for your interest in the position of <strong>${jobTitle}</strong> and for taking the time to apply.</p>
    <p>After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current needs.</p>
    <p>We appreciate your interest in our company and encourage you to apply for future openings that match your skills and experience.</p>
    <br>
    <p>Best regards,<br>HR Team</p>
  `,

  selected: (candidateName, jobTitle) => `
    <h2>Congratulations! You're Selected</h2>
    <p>Dear ${candidateName},</p>
    <p>We are delighted to inform you that you have been selected for the position of <strong>${jobTitle}</strong>!</p>
    <p>Our HR team will contact you shortly with the offer letter and next steps.</p>
    <p>Welcome to the team!</p>
    <br>
    <p>Best regards,<br>HR Team</p>
  `,

  customMessage: (candidateName, message) => `
    <h2>Message from HR</h2>
    <p>Dear ${candidateName},</p>
    <p>${message}</p>
    <br>
    <p>Best regards,<br>HR Team</p>
  `,
};

module.exports = { sendEmail, emailTemplates };
