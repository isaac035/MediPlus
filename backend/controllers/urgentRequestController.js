const UrgentRequest = require('../models/UrgentRequest');

// @route   GET /api/urgent-requests
// @desc    Get all urgent requests (any logged-in user)
const getUrgentRequests = async (req, res) => {
  try {
    const requests = await UrgentRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch urgent requests', error: error.message });
  }
};

// @route   POST /api/urgent-requests
// @desc    Create a new urgent request (any logged-in user)
const createUrgentRequest = async (req, res) => {
  try {
    const { patientName, medicineRequired, district, urgencyLevel, contactNumber } = req.body;

    if (!patientName || !medicineRequired || !district || !contactNumber) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!/^\d{10}$/.test(contactNumber)) {
      return res.status(400).json({ message: 'Contact number must be exactly 10 digits' });
    }

    const request = await UrgentRequest.create({
      patientName,
      medicineRequired,
      district,
      urgencyLevel: urgencyLevel || 'Moderate',
      contactNumber,
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create urgent request', error: error.message });
  }
};

// @route   PUT /api/urgent-requests/:id
// @desc    Update an urgent request, e.g. mark fulfilled (admin only)
const updateUrgentRequest = async (req, res) => {
  try {
    const request = await UrgentRequest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!request) {
      return res.status(404).json({ message: 'Urgent request not found' });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update urgent request', error: error.message });
  }
};

// @route   DELETE /api/urgent-requests/:id
// @desc    Delete an urgent request (admin only)
const deleteUrgentRequest = async (req, res) => {
  try {
    const request = await UrgentRequest.findByIdAndDelete(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Urgent request not found' });
    }

    res.json({ message: 'Urgent request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete urgent request', error: error.message });
  }
};

module.exports = { getUrgentRequests, createUrgentRequest, updateUrgentRequest, deleteUrgentRequest };
