const mongoose = require('mongoose');

const urgentRequestSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    medicineRequired: {
      type: String,
      required: [true, 'Medicine required field is required'],
      trim: true,
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
    },
    urgencyLevel: {
      type: String,
      enum: ['Critical', 'Moderate', 'Low'],
      default: 'Moderate',
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
      match: [/^\d{10}$/, 'Contact number must be exactly 10 digits'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Fulfilled'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('UrgentRequest', urgentRequestSchema);
