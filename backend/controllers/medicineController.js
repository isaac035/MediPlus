const Medicine = require('../models/Medicine');

// @route   GET /api/medicines
// @desc    Get all medicines (any logged-in user)
const getMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find().sort({ createdAt: -1 });
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch medicines', error: error.message });
  }
};

// @route   POST /api/medicines
// @desc    Add a new medicine (admin only)
const createMedicine = async (req, res) => {
  try {
    const { name, category, stockQuantity, unitPrice, status } = req.body;

    if (!name || !category || stockQuantity === undefined || unitPrice === undefined) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (stockQuantity < 0 || unitPrice < 0) {
      return res.status(400).json({ message: 'Stock quantity and unit price cannot be negative' });
    }

    const medicine = await Medicine.create({
      name,
      category,
      stockQuantity,
      unitPrice,
      status: status || (stockQuantity > 0 ? 'In Stock' : 'Out of Stock'),
    });

    res.status(201).json(medicine);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add medicine', error: error.message });
  }
};

// @route   PUT /api/medicines/:id
// @desc    Update a medicine (admin only)
const updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.json(medicine);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update medicine', error: error.message });
  }
};

// @route   DELETE /api/medicines/:id
// @desc    Delete a medicine (admin only)
const deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete medicine', error: error.message });
  }
};

module.exports = { getMedicines, createMedicine, updateMedicine, deleteMedicine };
