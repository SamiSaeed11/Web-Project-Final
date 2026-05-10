# ATS - Recruitment System

**Web Development Project - BSCS 6F**

**Team Members:**
- Hussain Nawaz (23f-0845)
- Afifah (23f-0769)
- Sami Saeed (23f-0642)

## About
Multi-branch recruitment and applicant tracking system. Candidates can apply for jobs, HR can manage applications and schedule interviews.

## Tech Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB Atlas
- File Upload: Cloudinary
- Email: Nodemailer

## Setup

### Backend
```bash
cd backend
npm install
# Create .env file with your MongoDB, Cloudinary, Gmail credentials
node seed.js
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Test Accounts
After running seed.js (accounts named after team members):
- Admin (Sami Saeed): sami@ats.com / sami123456
- HR (Afifah): afifah@ats.com / afifah123456
- Candidate (Husain): husain@ats.com / husain123456

## Features
- Job posting and browsing
- Application submission with resume upload
- Application status tracking
- Interview scheduling
- Email notifications
- Multi-branch support (Islamabad, Lahore, Karachi, Remote)

## Project Structure
- `/backend` - Express API, MongoDB models, routes
- `/frontend` - React components, pages, routing

## Environment Variables
Check `.env.example` files in backend and frontend folders.

---

**Developed by:**
- Hussain Nawaz (23f-0845) - Backend & Database
- Afifah (23f-0769) - Frontend & UI/UX
- Sami Saeed (23f-0642) - Integration & Testing
