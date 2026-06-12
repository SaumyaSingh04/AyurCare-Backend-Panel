'use strict';

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reviewController');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * /reviews/product/{productId}:
 *   get:
 *     tags: [Reviews]
 *     summary: Get reviews for a product
 *     security: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: Paginated reviews }
 */
router.get('/product/:productId', ctrl.getProductReviews);

/**
 * @swagger
 * /reviews:
 *   post:
 *     tags: [Reviews]
 *     summary: Create a product review
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, rating, comment]
 *             properties:
 *               productId: { type: string }
 *               orderId: { type: string }
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *               title: { type: string }
 *               comment: { type: string }
 *     responses:
 *       201: { description: Review created }
 *       409: { description: Already reviewed this product }
 */
router.post('/', authenticate, ctrl.createReview);

/**
 * @swagger
 * /reviews/{id}:
 *   put:
 *     tags: [Reviews]
 *     summary: Update your review
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
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *               title: { type: string }
 *               comment: { type: string }
 *     responses:
 *       200: { description: Review updated }
 */
router.put('/:id', authenticate, ctrl.updateReview);

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     tags: [Reviews]
 *     summary: Delete your review
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Review deleted }
 */
router.delete('/:id', authenticate, ctrl.deleteReview);

/**
 * @swagger
 * /reviews/{id}/vote:
 *   post:
 *     tags: [Reviews]
 *     summary: Vote a review as helpful
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Vote recorded }
 */
router.post('/:id/vote', authenticate, ctrl.voteHelpful);

module.exports = router;
