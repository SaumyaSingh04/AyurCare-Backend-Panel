'use strict';

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/categoryController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { cache } = require('../middleware/cache');
const { categoryUpload, handleMulterError } = require('../middleware/upload');
const { CACHE_TTL, ROLES } = require('../constants');

/**
 * @swagger
 * /categories:
 *   get:
 *     tags: [Categories]
 *     summary: Get all active categories
 *     security: []
 *     responses:
 *       200: { description: List of categories }
 */
router.get('/', cache(CACHE_TTL.CATEGORY_LIST), ctrl.getAllCategories);

/**
 * @swagger
 * /categories/tree:
 *   get:
 *     tags: [Categories]
 *     summary: Get category hierarchy tree
 *     security: []
 *     responses:
 *       200: { description: Nested category tree }
 */
router.get('/tree', cache(CACHE_TTL.CATEGORY_LIST), ctrl.getCategoryTree);

/**
 * @swagger
 * /categories/{slug}:
 *   get:
 *     tags: [Categories]
 *     summary: Get category by slug
 *     security: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Category detail }
 *       404: { description: Not found }
 */
router.get('/:slug', ctrl.getCategoryBySlug);

/**
 * @swagger
 * /categories:
 *   post:
 *     tags: [Categories]
 *     summary: Create a category (Admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               parentId: { type: string }
 *               image: { type: string, format: binary }
 *     responses:
 *       201: { description: Category created }
 */
router.post('/', authenticate, authorize(ROLES.ADMIN), categoryUpload.single('image'), handleMulterError, ctrl.createCategory);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     tags: [Categories]
 *     summary: Update a category (Admin)
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
 *               description: { type: string }
 *               isActive: { type: boolean }
 *     responses:
 *       200: { description: Category updated }
 */
router.put('/:id', authenticate, authorize(ROLES.ADMIN), categoryUpload.single('image'), handleMulterError, ctrl.updateCategory);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     tags: [Categories]
 *     summary: Delete a category (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Category deleted }
 */
router.delete('/:id', authenticate, authorize(ROLES.ADMIN), ctrl.deleteCategory);

module.exports = router;
