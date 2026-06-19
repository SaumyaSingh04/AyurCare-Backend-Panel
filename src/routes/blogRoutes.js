'use strict';

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/blogController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const { cache } = require('../middleware/cache');
const { blogUpload, handleMulterError } = require('../middleware/upload');
const { CACHE_TTL, ROLES } = require('../constants');
const v = require('../validations/blogValidation');

// ─── Public ───────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /blogs:
 *   get:
 *     tags: [Blogs]
 *     summary: List published blogs
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
 *         name: tags
 *         schema: { type: string }
 *         description: Comma-separated tags
 *       - in: query
 *         name: isFeatured
 *         schema: { type: string, enum: ['true','false'] }
 *     responses:
 *       200:
 *         description: Paginated blog list
 */
router.get('/', cache(CACHE_TTL.BLOG_LIST), validate(v.blogQuery, 'query'), ctrl.listBlogs);

/**
 * @swagger
 * /blogs/search:
 *   get:
 *     tags: [Blogs]
 *     summary: Full-text search across published blogs
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', validate(v.blogQuery, 'query'), ctrl.searchBlogs);

/**
 * @swagger
 * /blogs/featured:
 *   get:
 *     tags: [Blogs]
 *     summary: Get featured blog posts
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 6 }
 *     responses:
 *       200:
 *         description: Featured blogs
 */
router.get('/featured', cache(CACHE_TTL.BLOG_LIST), ctrl.getFeaturedBlogs);

/**
 * @swagger
 * /blogs/{id}/like:
 *   post:
 *     tags: [Blogs]
 *     summary: Like a blog post
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Like incremented
 */
router.post('/:id/like', ctrl.likeBlog);

/**
 * @swagger
 * /blogs/{slug}:
 *   get:
 *     tags: [Blogs]
 *     summary: Get a published blog by slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Blog detail
 *       404:
 *         description: Blog not found
 */
router.get('/:slug', cache(CACHE_TTL.BLOG_DETAIL), ctrl.getBlog);

// ─── Admin ────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /blogs/admin/all:
 *   get:
 *     tags: [Blogs]
 *     summary: List all blogs (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [draft, published, archived] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: All blogs
 */
router.get('/admin/all', authenticate, authorize(ROLES.ADMIN), validate(v.blogQuery, 'query'), ctrl.listAllAdmin);

/**
 * @swagger
 * /blogs/admin/{id}:
 *   get:
 *     tags: [Blogs]
 *     summary: Get any blog by ID (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Blog detail
 *       404:
 *         description: Not found
 */
router.get('/admin/:id', authenticate, authorize(ROLES.ADMIN), ctrl.getBlogAdmin);

/**
 * @swagger
 * /blogs:
 *   post:
 *     tags: [Blogs]
 *     summary: Create a blog post (Admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title: { type: string }
 *               content: { type: string }
 *               excerpt: { type: string }
 *               category: { type: string }
 *               tags: { type: string, description: 'Comma-separated or JSON array' }
 *               status: { type: string, enum: [draft, published, archived] }
 *               isFeatured: { type: boolean }
 *               metaTitle: { type: string }
 *               metaDescription: { type: string }
 *               coverImage: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Blog created
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 */
router.post('/', authenticate, authorize(ROLES.ADMIN), blogUpload.single('coverImage'), handleMulterError, validate(v.createBlog), ctrl.createBlog);

/**
 * @swagger
 * /blogs/{id}:
 *   put:
 *     tags: [Blogs]
 *     summary: Update a blog post (Admin)
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
 *               title: { type: string }
 *               content: { type: string }
 *               excerpt: { type: string }
 *               category: { type: string }
 *               status: { type: string, enum: [draft, published, archived] }
 *               isFeatured: { type: boolean }
 *               coverImage: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Blog updated
 *       404:
 *         description: Not found
 */
router.put('/:id', authenticate, authorize(ROLES.ADMIN), blogUpload.single('coverImage'), handleMulterError, validate(v.updateBlog), ctrl.updateBlog);

/**
 * @swagger
 * /blogs/{id}:
 *   delete:
 *     tags: [Blogs]
 *     summary: Delete a blog post (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Blog deleted
 *       404:
 *         description: Not found
 */
router.delete('/:id', authenticate, authorize(ROLES.ADMIN), ctrl.deleteBlog);

/**
 * @swagger
 * /blogs/{id}/publish:
 *   patch:
 *     tags: [Blogs]
 *     summary: Publish a blog post (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Blog published
 *       409:
 *         description: Already published
 */
router.patch('/:id/publish', authenticate, authorize(ROLES.ADMIN), ctrl.publishBlog);

/**
 * @swagger
 * /blogs/{id}/unpublish:
 *   patch:
 *     tags: [Blogs]
 *     summary: Unpublish a blog post (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Blog unpublished
 */
router.patch('/:id/unpublish', authenticate, authorize(ROLES.ADMIN), ctrl.unpublishBlog);

module.exports = router;
