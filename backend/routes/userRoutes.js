const express = require('express');
const { getUsers, updateUserRole, deleteUser } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes below require a logged-in admin
router.use(protect, adminOnly);

// @route   GET /api/users
router.get('/', getUsers);

// @route   PUT /api/users/:id
router.put('/:id', updateUserRole);

// @route   DELETE /api/users/:id
router.delete('/:id', deleteUser);

module.exports = router;
