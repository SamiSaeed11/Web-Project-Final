const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['candidate', 'hr', 'admin'],
      default: 'candidate',
    },
    phone: {
      type: String,
      trim: true,
    },
    profilePicture: {
      type: String, // Cloudinary URL
    },
    resumeUrl: {
      type: String, // Cloudinary URL
    },
    coverLetterUrl: {
      type: String, // Cloudinary URL
    },
    skills: [String],
    experience: {
      type: String,
    },
    education: {
      type: String,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
