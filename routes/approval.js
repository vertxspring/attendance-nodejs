const express = require('express');

const checkRoleWithPassport = require('../middleware/acl');

const router = express.Router();
const { ApprovalModel } = require('../models/approval');

const state = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
};

function buildApprovalFilter(req, isAdmin) {
  const { fromDate } = req.query;
  const { toDate } = req.query;
  const { status } = req.query;
  let useremail;
  if (isAdmin) {
    useremail = req.query.useremail;
  } else {
    useremail = req.user.email;
  }
  const filters = {};
  if (fromDate) filters.fromDate = { $gte: fromDate };
  if (toDate) filters.toDate = { $lte: toDate };
  if (useremail) filters.useremail = useremail;
  if (status) filters.status = status;
  return filters;
}

function buildCheckConflictFilter(useremail, fromDate, toDate) {
  return {
    useremail,
    status: { $in: [state.PENDING, state.SUCCESS] },
    $or: [
      { $and: [{ fromDate: { $gte: fromDate } }, { fromDate: { $lte: toDate } }] },
      { $and: [{ toDate: { $lte: toDate } }, { toDate: { $gte: fromDate } }] },
      { $and: [{ fromDate: { $lte: fromDate } }, { toDate: { $gte: toDate } }] },
      { $and: [{ fromDate: { $gte: fromDate } }, { toDate: { $lte: toDate } }] },
    ],
  };
}

router.post('/', checkRoleWithPassport(false), async (req, res) => {
  const { fromDate } = req.body;
  const { toDate } = req.body;
  const { reason } = req.body;
  const useremail = req.user.email;
  console.log(typeof fromDate);
  const filters = buildCheckConflictFilter(useremail, fromDate, toDate);
  const overlappingApprovals = await ApprovalModel.find(filters);
  if (overlappingApprovals.length > 0) {
    res.status(400).send('conflicted approvals');
    return;
  }
  const approval = new ApprovalModel({
    fromDate,
    toDate,
    reason,
    useremail,
    status: state.PENDING,
  });

  approval.save((err) => {
    if (err) res.status(400).send(err);
    else res.send({ success: true });
  });
});

router.get('/', checkRoleWithPassport(false), async (req, res) => {
  const filters = buildApprovalFilter(req, false);
  if (!filters.useremail) {
    res.status(500).send('Internal error');
  }
  console.log(filters);
  const results = await ApprovalModel.find(filters);
  return res.send(results);
});

router.get('/all', checkRoleWithPassport(true), async (req, res) => {
  const filters = buildApprovalFilter(req, true);
  const results = await ApprovalModel.find(filters);
  return res.send(results);
});

router.patch('/cancel/:approvalId', checkRoleWithPassport(false), async (req, res) => {
  const approvalId = req.params.approvalId;
  const useremail = req.user.email;
  const approval = await ApprovalModel.findOne({
    _id: approvalId,
    status: state.PENDING,
    useremail,
  });

  if (!approval) {
    res.status(400).send('No pending approvals found with this ID');
    return;
  }

  approval.status = state.CANCELLED;
  approval.updatedOn = new Date();
  approval.save();
  res.send({ success: true });
});

router.patch('/:approvalId', checkRoleWithPassport(true), async (req, res) => {
  const approvalId = req.params.approvalId;
  console.log(approvalId);
  let accept = req.query.accept;
  if (accept === 'false') {
    accept = false;
  } else {
    accept = true;
  }
  const approval = await ApprovalModel.findOne({ _id: approvalId, status: state.PENDING });

  if (!approval) {
    res.status(400).send('No pending approvals found with this ID');
    return;
  }

  approval.status = accept ? state.APPROVED : state.REJECTED;
  approval.updatedOn = new Date();
  approval.save();
  res.send({ success: true });
});

module.exports = router;
