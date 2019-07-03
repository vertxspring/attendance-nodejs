/* eslint-disable object-shorthand */
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { jwtOptions } = require('../middleware/strategy');
const { userModel } = require('../models/user');

const router = express.Router();

router.post('/login', async (req, res) => {
  let user;
  if (req.body.email && req.body.password) {
    const { email } = req.body;
    user = await userModel.findOne({ email: email });
  }

  if (!user) {
    res.status(401).json({ message: 'No such user found' });
    return;
  }

  bcrypt.compare(req.body.password, user.password, (err, result) => {
    if (result) {
      const payload = { email: user.email, isAdmin: !!user.isAdmin };
      const token = jwt.sign(payload, jwtOptions.secretOrKey);
      res.send({ message: 'ok', token });
    } else {
      res.status(401).send({ message: 'Passwords did not match' });
    }
  });
});

module.exports = router;
