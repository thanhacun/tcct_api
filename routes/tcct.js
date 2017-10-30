const express = require('express');
const router = express.Router();

const authCheck = require('../utils/auth_check');

router.get('/tho', (req, res) => {
  return res.status(200).json({'tcct': 'Kim Bong Mieu'});
});

router.post('/tho', authCheck, (req, res) => {
  return res.status(200).json({'tcct': 'Add new OK'});
});

module.exports = router;
