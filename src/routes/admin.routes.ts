import { Router } from 'express';
import {
  getAllUsers,
  getUserDetails,
  toggleUserStatus,
  promoteToAdmin,
  getSecurityInsights,
  getDashboardStats,
} from '../controllers/admin.controller';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/adminAuth';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/stats', getDashboardStats);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users with pagination
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/users', getAllUsers);

/**
 * @swagger
 * /api/admin/users/{userId}:
 *   get:
 *     summary: Get user details with sessions
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 */
router.get('/users/:userId', getUserDetails);

/**
 * @swagger
 * /api/admin/users/{userId}/toggle-status:
 *   patch:
 *     summary: Activate or deactivate user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User status updated
 */
router.patch('/users/:userId/toggle-status', toggleUserStatus);

/**
 * @swagger
 * /api/admin/users/{userId}/promote:
 *   patch:
 *     summary: Promote user to admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User promoted
 */
router.patch('/users/:userId/promote', promoteToAdmin);

/**
 * @swagger
 * /api/admin/security/insights:
 *   get:
 *     summary: Get security insights and suspicious activities
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Security insights
 */
router.get('/security/insights', getSecurityInsights);

export default router;
