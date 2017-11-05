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
  // NOTE: save method either save or update based on the existence of of _id
  if (res.locals && res.locals.error) {
    return res.status(401).json({error: res.locals.error.message});
  }
  const { modifiedTho, modifyAction } = req.body;
  Tho.findOne({'index':modifiedTho.index}, (error, tho) => {
    if (error) return res.json({error: 'Co loi, de nghi lien he tac gia!'});
    if (modifyAction === 'save') {
      let changedTho = (tho) ? tho : new Tho();

      changedTho.index = modifiedTho.index;
      changedTho.title = modifiedTho.title;
      changedTho.content = modifiedTho.content;
      changedTho.footer = modifiedTho.footer;

      changedTho.save((error) => {
        if (error) return res.json({error: error.message});
        const update = (changedTho._id) ? 'updated' : 'added'
        return res.status(200).json({modifiedTho: changedTho, update});
      });

    } else {
      tho.remove((error) => {
        if (error) return json({error: error.message});
        return res.status(200).json({modifiedTho: tho, update: 'deleted'});
      })
    }
  })
});

router.get('/tho/emergency', (req, res) => {
  // use to delete all data just in case, turnoff when no use!
  Tho.remove({}, (error) => {
    if(error) return res.json({error: 'Unknown error!'});
    res.status(200).json({done: 'OK'});
  })
})

module.exports = router;
