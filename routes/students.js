
const express = require('express');
const router = express.Router();
const StudentsModel = require('../models/studentsModel'); // Adjust the path as needed
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your-secret-key';

const nodemailer = require('nodemailer'); // For sending reset emails
const crypto = require('crypto'); // For generating OTPs
const OTPModel = require('../models/otpModel')


router.post('/', (req, res) => {
    const { email, firstName, lastName, mobile, password, address, roll, class } = req.body;
  
    const newStudent = new StudentsModel({
      email,
      firstName,
      lastName,
      mobile,
      password, // Hash the password for security
      address,
      roll,
      class,
    });
  
    newStudent.save((err, savedStudent) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to create a new student.' });
      }
      res.status(201).json({ message: 'Student created successfully', student: savedStudent });
    });
  });

  router.get('/', (req, res) => {
    StudentsModel.find({}, (err, students) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to fetch students.' });
      }
      res.status(200).json(students);
    });
  });

  router.put('/:id', (req, res) => {
    const studentId = req.params.id;
    const updateData = req.body; // Data to update
  
    StudentsModel.findByIdAndUpdate(studentId, updateData, { new: true }, (err, updatedStudent) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to update the student.' });
      }
      res.status(200).json(updatedStudent);
    });
  });
  router.delete('/:id', (req, res) => {
    const studentId = req.params.id;
  
    StudentsModel.findByIdAndRemove(studentId, (err, removedStudent) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to delete the student.' });
      }
      res.status(200).json({ message: 'Student deleted successfully', student: removedStudent });
    });
  });
    

  router.post('/login', (req, res) => {
    const { email, password } = req.body;
  
    // Implement your user authentication logic here
    StudentsModel.findOne({ email }, (err, user) => {
      if (err || !user) {
        return res.status(401).json({ message: 'Authentication failed' });
      }
  
      // You should compare the hashed password here for security
      if (user.password === password) {
        // User is authenticated
  
        // Generate a JWT token
        const payload = { userId: user._id }; // Include user information in payload
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); // Token expiration time
  
        res.json({ message: 'Authentication successful', token });
      } else {
        res.status(401).json({ message: 'Authentication failed' });
      }
    });
  });
  
  router.post('/password-reset-request', (req, res) => {
    const { email } = req.body;
  
    // Check if the user with the provided email exists
    StudentsModel.findOne({ email }, (err, user) => {
      if (err || !user) {
        return res.status(404).json({ message: 'User not found.' });
      }
  
      // Generate a random OTP (one-time password)
      const otp = crypto.randomBytes(3).toString('hex'); // 6-character OTP
  
      // Save the OTP to the database with a status (e.g., pending)
      const otpDocument = new OTPModel({ email, otp, status: 0 }); // Status 0 for pending
      otpDocument.save();
  
      // Send an email with the OTP to the user
      const transporter = nodemailer.createTransport({
        // Configure your email sending service (e.g., Gmail)
      });
  
      const mailOptions = {
        from: 'your-email@example.com',
        to: email,
        subject: 'Password Reset OTP',
        text: `Your OTP for password reset is: ${otp}`,
      };
  
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Failed to send OTP.' });
        }
        res.status(200).json({ message: 'OTP sent successfully' });
      });
    });
  });
  
  // Reset password with OTP
router.post('/password-reset', (req, res) => {
    const { email, otp, newPassword } = req.body;
  
    // Verify the provided OTP
    OTPModel.findOne({ email, otp, status: 0 }, (err, otpDoc) => {
      if (err || !otpDoc) {
        return res.status(400).json({ message: 'Invalid OTP or OTP expired.' });
      }
  
      // Update the user's password
      StudentsModel.findOneAndUpdate({ email }, { password: newPassword }, (err, user) => {
        if (err || !user) {
          return res.status(500).json({ message: 'Failed to reset password.' });
        }
  
        // Update the OTP status to indicate it has been used
        otpDoc.status = 1; // Status 1 for used
        otpDoc.save();
  
        res.status(200).json({ message: 'Password reset successful' });
      });
    });
  });
  
  
  module.exports = router;
  