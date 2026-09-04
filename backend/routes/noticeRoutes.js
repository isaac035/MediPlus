const express = require('express');
const {
  getNotices,
  createNotice,
  volunteerForNotice,
  updateNotice,
  deleteNotice,
} = require('../controllers/noticeController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/notices
router.get('/', protect, getNotices);

// @route   POST /api/notices
router.post('/', protect, adminOnly, createNotice);

// @route   PUT /api/notices/:id/volunteer
router.put('/:id/volunteer', protect, volunteerForNotice);

// @route   PUT /api/notices/:id
router.put('/:id', protect, adminOnly, updateNotice);

// @route   DELETE /api/notices/:id
router.delete('/:id', protect, adminOnly, deleteNotice);

module.exports = router;
