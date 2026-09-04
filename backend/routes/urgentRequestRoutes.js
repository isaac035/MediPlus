const express = require('express');
const {
  getUrgentRequests,
  createUrgentRequest,
  updateUrgentRequest,
  deleteUrgentRequest,
} = require('../controllers/urgentRequestController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/urgent-requests
router.get('/', protect, getUrgentRequests);

// @route   POST /api/urgent-requests
router.post('/', protect, createUrgentRequest);

// @route   PUT /api/urgent-requests/:id
router.put('/:id', protect, adminOnly, updateUrgentRequest);

// @route   DELETE /api/urgent-requests/:id
router.delete('/:id', protect, adminOnly, deleteUrgentRequest);

module.exports = router;
