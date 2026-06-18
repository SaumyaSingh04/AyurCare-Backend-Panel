'use strict';

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/cartController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const v = require('../validations/cartValidation');

router.use(authenticate);

/**
 * @swagger
 * /cart:
 *   get:
 *     tags: [Cart]
 *     summary: Get current user cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Cart with items }
 */
router.get('/', ctrl.getCart);

/**
 * @swagger
 * /cart/items:
 *   post:
 *     tags: [Cart]
 *     summary: Add item to cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, quantity]
 *             properties:
 *               productId: { type: string }
 *               variantId: { type: string }
 *               quantity: { type: integer, minimum: 1, example: 1 }
 *     responses:
 *       200: { description: Item added, returns updated cart }
 *       400: { description: Insufficient stock }
 *       404: { description: Product not found }
 */
router.post('/items', validate(v.addToCart), ctrl.addItem);

/**
 * @swagger
 * /cart/items/{itemId}:
 *   put:
 *     tags: [Cart]
 *     summary: Update cart item quantity
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity: { type: integer, minimum: 0 }
 *     responses:
 *       200: { description: Cart updated }
 */
router.put('/items/:itemId', validate(v.updateCartItem), ctrl.updateItem);

/**
 * @swagger
 * /cart/items/{itemId}:
 *   delete:
 *     tags: [Cart]
 *     summary: Remove item from cart
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Item removed }
 */
router.delete('/items/:itemId', ctrl.removeItem);

/**
 * @swagger
 * /cart:
 *   delete:
 *     tags: [Cart]
 *     summary: Clear entire cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Cart cleared }
 */
router.delete('/', ctrl.clearCart);

/**
 * @swagger
 * /cart/coupon:
 *   post:
 *     tags: [Cart]
 *     summary: Apply coupon to cart
 *     security:
 *       - bearerAuth: []
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
 *       200: { description: Coupon applied, returns discount amount }
 *       400: { description: Invalid or expired coupon }
 */
router.post('/coupon', validate(v.applyCoupon), ctrl.applyCoupon);

module.exports = router;
