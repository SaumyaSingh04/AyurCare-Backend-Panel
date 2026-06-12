'use strict';

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const v = require('../validations/orderValidation');

router.use(authenticate);

/**
 * @swagger
 * /orders:
 *   post:
 *     tags: [Orders]
 *     summary: Place a new order
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items, shippingAddressId, paymentMethod]
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [productId, quantity]
 *                   properties:
 *                     productId: { type: string }
 *                     variantId: { type: string }
 *                     quantity: { type: integer, minimum: 1 }
 *               shippingAddressId: { type: string }
 *               paymentMethod: { type: string, enum: [cod] }
 *               couponCode: { type: string }
 *               customerNote: { type: string }
 *     responses:
 *       201: { description: Order placed successfully }
 *       400: { description: Validation error or insufficient stock }
 */
router.post('/', validate(v.placeOrder), ctrl.placeOrder);

/**
 * @swagger
 * /orders:
 *   get:
 *     tags: [Orders]
 *     summary: Get current user orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: Paginated order list }
 */
router.get('/', ctrl.getUserOrders);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get order by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Order detail }
 *       404: { description: Order not found }
 */
router.get('/:id', ctrl.getOrder);

/**
 * @swagger
 * /orders/{id}/cancel:
 *   post:
 *     tags: [Orders]
 *     summary: Cancel an order
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
 *               reason: { type: string }
 *     responses:
 *       200: { description: Order cancelled }
 *       400: { description: Cannot cancel at this stage }
 */
router.post('/:id/cancel', validate(v.cancelOrder), ctrl.cancelOrder);

/**
 * @swagger
 * /orders/{id}/return:
 *   post:
 *     tags: [Orders]
 *     summary: Request return for a delivered order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason]
 *             properties:
 *               reason: { type: string }
 *     responses:
 *       200: { description: Return request submitted }
 */
router.post('/:id/return', validate(v.returnOrder), ctrl.requestReturn);

/**
 * @swagger
 * /orders/{id}/invoice:
 *   get:
 *     tags: [Orders]
 *     summary: Generate and get invoice PDF URL
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Invoice URL returned }
 */
router.get('/:id/invoice', ctrl.getInvoice);

/**
 * @swagger
 * /orders/{id}/cod-confirm:
 *   post:
 *     tags: [Orders]
 *     summary: Confirm COD order (pay ₹100 confirmation charge)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: COD order confirmed }
 *       400: { description: Not a COD order or already confirmed }
 */
router.post('/:id/cod-confirm', ctrl.confirmCodOrder);

module.exports = router;
