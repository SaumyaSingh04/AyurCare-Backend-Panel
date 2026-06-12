'use strict';

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const { avatarUpload, handleMulterError } = require('../middleware/upload');
const v = require('../validations/userValidation');

// All user routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     tags: [Users]
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: User profile }
 *       401: { description: Unauthorized }
 */
router.get('/profile', ctrl.getProfile);

/**
 * @swagger
 * /users/profile:
 *   put:
 *     tags: [Users]
 *     summary: Update current user profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               phone: { type: string }
 *     responses:
 *       200: { description: Profile updated }
 */
router.put('/profile', validate(v.updateProfile), ctrl.updateProfile);

/**
 * @swagger
 * /users/avatar:
 *   post:
 *     tags: [Users]
 *     summary: Upload profile avatar
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar: { type: string, format: binary }
 *     responses:
 *       200: { description: Avatar uploaded }
 */
router.post('/avatar', avatarUpload.single('avatar'), handleMulterError, ctrl.uploadAvatar);

/**
 * @swagger
 * /users/addresses:
 *   get:
 *     tags: [Users]
 *     summary: Get all saved addresses
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: List of addresses }
 */
router.get('/addresses', ctrl.getAddresses);

/**
 * @swagger
 * /users/addresses:
 *   post:
 *     tags: [Users]
 *     summary: Add a new address
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, phone, addressLine1, city, state, pincode]
 *             properties:
 *               fullName: { type: string }
 *               phone: { type: string }
 *               addressLine1: { type: string }
 *               addressLine2: { type: string }
 *               city: { type: string }
 *               state: { type: string }
 *               pincode: { type: string }
 *               isDefault: { type: boolean }
 *     responses:
 *       200: { description: Address added }
 */
router.post('/addresses', validate(v.addAddress), ctrl.addAddress);

/**
 * @swagger
 * /users/addresses/{addressId}:
 *   put:
 *     tags: [Users]
 *     summary: Update an address
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName: { type: string }
 *               phone: { type: string }
 *               addressLine1: { type: string }
 *               city: { type: string }
 *               state: { type: string }
 *               pincode: { type: string }
 *     responses:
 *       200: { description: Address updated }
 */
router.put('/addresses/:addressId', validate(v.updateAddress), ctrl.updateAddress);

/**
 * @swagger
 * /users/addresses/{addressId}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete an address
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Address deleted }
 */
router.delete('/addresses/:addressId', ctrl.deleteAddress);

/**
 * @swagger
 * /users/addresses/{addressId}/default:
 *   patch:
 *     tags: [Users]
 *     summary: Set address as default
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Default address set }
 */
router.patch('/addresses/:addressId/default', ctrl.setDefaultAddress);

/**
 * @swagger
 * /users/wishlist:
 *   get:
 *     tags: [Users]
 *     summary: Get wishlist
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Wishlist items }
 */
router.get('/wishlist', ctrl.getWishlist);

/**
 * @swagger
 * /users/wishlist/{productId}:
 *   post:
 *     tags: [Users]
 *     summary: Toggle product in wishlist (add/remove)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Wishlist updated }
 */
router.post('/wishlist/:productId', ctrl.toggleWishlist);

module.exports = router;
