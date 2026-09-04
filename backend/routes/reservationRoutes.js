const express = require('express');
const {
  getReservations,
  createReservation,
  updateReservation,
  deleteReservation,
} = require('../controllers/reservationController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/reservations
router.get('/', protect, getReservations);

// @route   POST /api/reservations
router.post('/', protect, createReservation);

// @route   PUT /api/reservations/:id
router.put('/:id', protect, adminOnly, updateReservation);

// @route   DELETE /api/reservations/:id
router.delete('/:id', protect, adminOnly, deleteReservation);

module.exports = router;
