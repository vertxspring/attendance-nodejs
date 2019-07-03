const mongoose = require('mongoose');

const approvalSchema = new mongoose.Schema({
  useremail: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024,
  },
  fromDate: {
    type: Date,
    required: true,
  },
  toDate: {
    type: Date,
    required: true,
  },
  reason: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    required: true,
  },
  updatedOn: {
    type: Date,
  },
});
module.exports.ApprovalModel = mongoose.model('approval', approvalSchema);
