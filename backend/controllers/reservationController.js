const Reservation = require('../models/Reservation');

// @route   GET /api/reservations
// @desc    Get all reservations (any logged-in user)
const getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({ createdAt: -1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reservations', error: error.message });
  }
};

// @route   POST /api/reservations
// @desc    Create a new reservation (any logged-in user)
const createReservation = async (req, res) => {
  try {
    const { customerName, contactNumber, medicineName, quantity, pickupDate } = req.body;

    if (!customerName || !contactNumber || !medicineName || !quantity || !pickupDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!/^\d{10}$/.test(contactNumber)) {
      return res.status(400).json({ message: 'Contact number must be exactly 10 digits' });
    }

    if (Number(quantity) <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than 0' });
    }

    const parsedDate = new Date(pickupDate);
    if (Number.isNaN(parsedDate.getTime()) || parsedDate < new Date().setHours(0, 0, 0, 0)) {
      return res.status(400).json({ message: 'Pickup date must be a valid, non-past date' });
    }

    const reservation = await Reservation.create({
      customerName,
      contactNumber,
      medicineName,
      quantity,
      pickupDate: parsedDate,
    });

    res.status(201).json(reservation);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create reservation', error: error.message });
  }
};

// @route   PUT /api/reservations/:id
// @desc    Update reservation status (admin only)
const updateReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update reservation', error: error.message });
  }
};

// @route   DELETE /api/reservations/:id
// @desc    Delete a reservation (admin only)
const deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    res.json({ message: 'Reservation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete reservation', error: error.message });
  }
};

module.exports = { getReservations, createReservation, updateReservation, deleteReservation };
