const express = require('express');
const { getMedicines, createMedicine, updateMedicine, deleteMedicine } = require('../controllers/medicineController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/medicines
router.get('/', protect, getMedicines);

// @route   POST /api/medicines
router.post('/', protect, adminOnly, createMedicine);

// @route   PUT /api/medicines/:id
router.put('/:id', protect, adminOnly, updateMedicine);

// @route   DELETE /api/medicines/:id
router.delete('/:id', protect, adminOnly, deleteMedicine);

module.exports = router;
