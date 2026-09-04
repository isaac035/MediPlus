const Notice = require('../models/Notice');

// @route   GET /api/notices
// @desc    Get all notices (any logged-in user)
const getNotices = async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notices', error: error.message });
  }
};

// @route   POST /api/notices
// @desc    Post a new notice (admin only)
const createNotice = async (req, res) => {
  try {
    const { title, category, district, description, contactNumber } = req.body;

    if (!title || !category || !district || !description || !contactNumber) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!['Blood', 'Volunteer', 'Equipment'].includes(category)) {
      return res.status(400).json({ message: 'Category must be Blood, Volunteer, or Equipment' });
    }

    if (!/^\d{10}$/.test(contactNumber)) {
      return res.status(400).json({ message: 'Contact number must be exactly 10 digits' });
    }

    const notice = await Notice.create({ title, category, district, description, contactNumber });

    res.status(201).json(notice);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create notice', error: error.message });
  }
};

// @route   PUT /api/notices/:id/volunteer
// @desc    Register the logged-in user as a volunteer ("I Want to Help")
const volunteerForNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    const alreadyVolunteered = notice.volunteers.some(
      (v) => v.user.toString() === req.user._id.toString()
    );
    if (alreadyVolunteered) {
      return res.status(400).json({ message: 'You have already volunteered for this notice' });
    }

    notice.volunteers.push({
      user: req.user._id,
      name: req.user.name,
      contactNumber: req.user.phone,
    });
    await notice.save();

    res.json(notice);
  } catch (error) {
    res.status(500).json({ message: 'Failed to register as volunteer', error: error.message });
  }
};

// @route   PUT /api/notices/:id
// @desc    Update a notice, e.g. close it (admin only)
const updateNotice = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    res.json(notice);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update notice', error: error.message });
  }
};

// @route   DELETE /api/notices/:id
// @desc    Delete a notice (admin only)
const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);

    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    res.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete notice', error: error.message });
  }
};

module.exports = { getNotices, createNotice, volunteerForNotice, updateNotice, deleteNotice };
