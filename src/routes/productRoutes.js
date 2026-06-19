'use strict';

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const { cache } = require('../middleware/cache');
const { productUpload, handleMulterError } = require('../middleware/upload');
const { CACHE_TTL, ROLES } = require('../constants');
const v = require('../validations/productValidation');

/**
 * @swagger
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: List all active products
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [-createdAt, price, -price, -averageRating, -totalSold] }
 *     responses:
 *       200: { description: Paginated product list }
 */
router.get('/', cache(CACHE_TTL.PRODUCT_LIST), validate(v.productQuery, 'query'), ctrl.listProducts);

/**
 * @swagger
 * /products/search:
 *   get:
 *     tags: [Products]
 *     summary: Search products by name/description
 *     security: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: Search results }
 */
router.get('/search', validate(v.productQuery, 'query'), ctrl.searchProducts);

/**
 * @swagger
 * /products/featured:
 *   get:
 *     tags: [Products]
 *     summary: Get featured products
 *     security: []
 *     responses:
 *       200: { description: Featured products list }
 */
router.get('/featured', cache(CACHE_TTL.PRODUCT_LIST), ctrl.getFeaturedProducts);

/**
 * @swagger
 * /products/{slug}:
 *   get:
 *     tags: [Products]
 *     summary: Get product by slug
 *     security: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Product detail }
 *       404: { description: Product not found }
 */
router.get('/:slug', cache(CACHE_TTL.PRODUCT_DETAIL), ctrl.getProduct);

/**
 * @swagger
 * /products:
 *   post:
 *     tags: [Products]
 *     summary: Create a product (Admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, description, price, categoryId]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               compareAtPrice: { type: number }
 *               categoryId: { type: string }
 *               stock: { type: integer }
 *               brand: { type: string }
 *               isFeatured: { type: boolean }
 *               images: { type: array, items: { type: string, format: binary } }
 *     responses:
 *       201: { description: Product created }
 *       403: { description: Forbidden }
 */
router.post('/', authenticate, authorize(ROLES.ADMIN), productUpload.array('images', 10), handleMulterError, validate(v.createProduct), ctrl.createProduct);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: Update a product (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               price: { type: number }
 *               stock: { type: integer }
 *               isActive: { type: boolean }
 *               isFeatured: { type: boolean }
 *     responses:
 *       200: { description: Product updated }
 *       404: { description: Not found }
 */
router.put('/:id', authenticate, authorize(ROLES.ADMIN), productUpload.array('images', 10), handleMulterError, validate(v.updateProduct), ctrl.updateProduct);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: Delete a product (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Product deleted }
 */
router.delete('/:id', authenticate, authorize(ROLES.ADMIN), ctrl.deleteProduct);

/**
 * @swagger
 * /products/{id}/images:
 *   delete:
 *     tags: [Products]
 *     summary: Delete a product image (Admin)
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
 *             required: [publicId]
 *             properties:
 *               publicId: { type: string }
 *     responses:
 *       200: { description: Image deleted }
 */
router.delete('/:id/images', authenticate, authorize(ROLES.ADMIN), ctrl.deleteProductImage);

module.exports = router;
