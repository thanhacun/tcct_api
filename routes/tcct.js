const express = require('express');
const router = express.Router();
const Tho = require('../models/tho');

const authCheck = require('../utils/auth_check');

router.get('/tho/:index', (req, res) => {
  const index = Number(req.params.index);
  Tho.findOne({index:index}).populate('postedUser').exec((error, tho) => {
    if (error) return res.json({error: error.message});
    // [] TODO: minimized user data send back to frontend
    res.status(200).json(tho);
  });
});

router.post('/tho', (req, res) => {
  if (res.locals && res.locals.error) {
    return res.status(401).json({error: res.locals.error.message});
  }
  const { modifiedTho, modifyAction } = req.body;
  Tho.findOne({_id:modifiedTho._id}, (error, tho) => {
    if (error) return res.json({error: 'Co loi, de nghi lien he tac gia!'});
    if (modifyAction === 'save') {
      let changedTho = (tho) ? tho : new Tho();

      changedTho.index = modifiedTho.index;
      changedTho.title = modifiedTho.title;
      changedTho.content = modifiedTho.content;
      changedTho.footer = modifiedTho.footer;
      changedTho.imgUrl = modifiedTho.imgUrl;
      changedTho.mediaUrl = modifiedTho.mediaUrl;
      // only update posted users if add new tho OR not having posted user yet
      if (!tho || !tho.postedUser) {
        changedTho.postedUser = modifiedTho.postedUser;
      }

      changedTho.save((error) => {
        if (error) return res.json({error: error.message});
        const update = (tho) ? 'updated' : 'added'
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

router.get('/tho/:index/comments', (req, res) => {
  const thoIndex = req.params.index;
  res.json({index: thoIndex, comments: [1,2,3]});
})

// NOTE: Use to delete all data just in case, TURNOFF when no use!
// router.get('/tho/emergency', (req, res) => {
//   Tho.remove({}, (error) => {
//     if(error) return res.json({error: 'Unknown error!'});
//     res.status(200).json({done: 'OK'});
//   })
// });

module.exports = router;
