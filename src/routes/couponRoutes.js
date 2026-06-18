'use strict';

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/couponController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { optionalAuth } = require('../middleware/auth');
const { ROLES } = require('../constants');

/**
 * @swagger
 * /coupons/validate:
 *   post:
 *     tags: [Coupons]
 *     summary: Validate a coupon code
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code: { type: string, example: SAVE10 }
 *     responses:
 *       200: { description: Coupon is valid }
 *       400: { description: Invalid or expired coupon }
 */
router.post('/validate', optionalAuth, ctrl.validateCoupon);

router.use(authenticate, authorize(ROLES.ADMIN));

/**
 * @swagger
 * /coupons:
 *   get:
 *     tags: [Coupons]
 *     summary: List all coupons (Admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: List of coupons }
 */
router.get('/', ctrl.listCoupons);

/**
 * @swagger
 * /coupons:
 *   post:
 *     tags: [Coupons]
 *     summary: Create a coupon (Admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, type, value, endDate]
 *             properties:
 *               code: { type: string, example: SAVE10 }
 *               type: { type: string, enum: [percentage, flat, free_shipping, buy_x_get_y] }
 *               value: { type: number, example: 10 }
 *               minOrderAmount: { type: number, example: 500 }
 *               maxDiscount: { type: number }
 *               endDate: { type: string, format: date-time }
 *               usageLimit: { type: integer }
 *               isActive: { type: boolean }
 *     responses:
 *       201: { description: Coupon created }
 */
router.post('/', ctrl.createCoupon);

/**
 * @swagger
 * /coupons/{id}:
 *   put:
 *     tags: [Coupons]
 *     summary: Update a coupon (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isActive: { type: boolean }
 *               endDate: { type: string, format: date-time }
 *               usageLimit: { type: integer }
 *     responses:
 *       200: { description: Coupon updated }
 */
router.put('/:id', ctrl.updateCoupon);

/**
 * @swagger
 * /coupons/{id}:
 *   delete:
 *     tags: [Coupons]
 *     summary: Delete a coupon (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Coupon deleted }
 */
router.delete('/:id', ctrl.deleteCoupon);

module.exports = router;
