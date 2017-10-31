const express = require('express');
const router = express.Router();
const Tho = require('../models/tho');

const authCheck = require('../utils/auth_check');

router.get('/tho', (req, res) => {
  Tho.find({}, (error, thos) => {
    if (error) return res.json({error: error.message});
    return res.status(200).json(thos);
  })
});

router.post('/tho', (req, res) => {
  if (res.locals && res.locals.error) {
    return res.status(401).json({error: res.locals.error.message});
  }
  Tho.findOne({'index':req.body.index}, (error, tho) => {
    if (error || tho) {
      return res.json({error: 'Da nhap lieu hoac co loi!'});
    }
    const newTho = new Tho();
    newTho.index = req.body.index;
    newTho.title = req.body.title;
    newTho.content = req.body.content;
    newTho.footer = req.body.footer;
    newTho.save((error) => {
      if (error) return res.json({error: error.message});
      return res.status(200).json(newTho);
    })
  })
});

module.exports = router;
