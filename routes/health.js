const express = require('express');
const checkRoleWithPassport = require('../middleware/acl');
const bcrypt = require('bcrypt');
const router = express.Router();

router.get('/unsecured', (req, res) => res.send({ level: 1, user: req.user }));
router.get('/secured', checkRoleWithPassport(false), (req, res) => res.send({ level: 2, user: req.user }));
router.get('/admin-secured', checkRoleWithPassport(true), (req, res) => res.send({ level: 3, user: req.user }));

router.get('/get-hash/:key', (req, res) => {
  bcrypt.hash(req.params.key, 10, (err, hash) => {
    if (hash) {
      res.send(hash);
    } else {
      res.status(400).send('Bad request');
    }
  });
});

module.exports = router;
