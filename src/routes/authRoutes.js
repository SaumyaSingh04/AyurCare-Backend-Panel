'use strict';

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authLimiter, otpLimiter } = require('../middleware/rateLimiter');
const v = require('../validations/authValidation');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and authorization
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password]
 *             properties:
 *               firstName: { type: string, example: Saumya }
 *               lastName: { type: string, example: Singh }
 *               email: { type: string, format: email, example: saumya@example.com }
 *               phone: { type: string, example: '9876543210' }
 *               password: { type: string, minLength: 8, example: SecurePassword123 }
 *     responses:
 *       201: { description: Registration successful }
 *       400: { description: Validation error }
 *       409: { description: Email already exists }
 */
router.post('/register', authLimiter, validate(v.register), ctrl.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email, example: saumya@example.com }
 *               password: { type: string, example: SecurePassword123 }
 *     responses:
 *       200: { description: Login successful, returns accessToken }
 *       401: { description: Invalid credentials }
 */
router.post('/login', authLimiter, validate(v.login), ctrl.login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Logout successful }
 */
router.post('/logout', authenticate, ctrl.logout);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200: { description: New accessToken returned }
 *       401: { description: Invalid refresh token }
 */
router.post('/refresh-token', ctrl.refreshToken);

/**
 * @swagger
 * /auth/verify-email:
 *   get:
 *     tags: [Auth]
 *     summary: Verify email via token link
 *     security: []
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Email verified }
 *       400: { description: Invalid or expired token }
 */
router.get('/verify-email', ctrl.verifyEmail);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Send password reset email
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200: { description: Reset email sent }
 */
router.post('/forgot-password', authLimiter, validate(v.forgotPassword), ctrl.forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password using token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token: { type: string }
 *               password: { type: string, minLength: 8 }
 *     responses:
 *       200: { description: Password reset successful }
 *       400: { description: Invalid or expired token }
 */
router.post('/reset-password', authLimiter, validate(v.resetPassword), ctrl.resetPassword);

/**
 * @swagger
 * /auth/send-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Send OTP to email
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200: { description: OTP sent }
 */
router.post('/send-otp', otpLimiter, validate(v.sendOTP), ctrl.sendOTP);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Verify OTP
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email: { type: string, format: email }
 *               otp: { type: string, example: '123456' }
 *     responses:
 *       200: { description: OTP verified }
 *       400: { description: Invalid or expired OTP }
 */
router.post('/verify-otp', validate(v.verifyOTP), ctrl.verifyOTP);

module.exports = router;
