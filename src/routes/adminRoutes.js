'use strict';

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { ROLES } = require('../constants');

router.use(authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN));

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     tags: [Admin]
 *     summary: Get dashboard stats
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Dashboard statistics }
 */
router.get('/dashboard', ctrl.getDashboard);

/**
 * @swagger
 * /admin/reports/sales:
 *   get:
 *     tags: [Admin]
 *     summary: Get sales report
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema: { type: string, format: date, example: '2024-01-01' }
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema: { type: string, format: date, example: '2024-12-31' }
 *     responses:
 *       200: { description: Sales grouped by day }
 */
router.get('/reports/sales', ctrl.getSalesReport);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: List all users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [user, admin] }
 *     responses:
 *       200: { description: Paginated user list }
 */
router.get('/users', ctrl.listUsers);

/**
 * @swagger
 * /admin/users/{id}/status:
 *   patch:
 *     tags: [Admin]
 *     summary: Toggle user active/inactive
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: User status toggled }
 */
router.patch('/users/:id/status', ctrl.toggleUserStatus);

/**
 * @swagger
 * /admin/users/{id}/role:
 *   patch:
 *     tags: [Admin]
 *     summary: Update user role
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
 *             required: [role]
 *             properties:
 *               role: { type: string, enum: [user, admin] }
 *     responses:
 *       200: { description: Role updated }
 */
router.patch('/users/:id/role', ctrl.updateUserRole);

/**
 * @swagger
 * /admin/products:
 *   get:
 *     tags: [Admin]
 *     summary: List all products including inactive (Admin)
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
 *       200: { description: Paginated product list }
 */
router.get('/products', ctrl.listProducts);

/**
 * @swagger
 * /admin/orders:
 *   get:
 *     tags: [Admin]
 *     summary: List all orders (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, confirmed, processing, shipped, delivered, cancelled] }
 *     responses:
 *       200: { description: Paginated order list }
 */
router.get('/orders', ctrl.listOrders);

/**
 * @swagger
 * /admin/orders/{id}/status:
 *   patch:
 *     tags: [Admin]
 *     summary: Update order status (Admin)
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
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [confirmed, processing, shipped, out_for_delivery, delivered, cancelled] }
 *               note: { type: string }
 *     responses:
 *       200: { description: Order status updated }
 */
router.patch('/orders/:id/status', ctrl.updateOrderStatus);

module.exports = router;
