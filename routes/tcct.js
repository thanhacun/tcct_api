const express = require('express');
const router = express.Router();
const Tho = require('../models/tho');
const Comment = require('../models/comment');

const authCheck = require('../utils/auth_check');

router.get('/tho/:index', (req, res) => {
  const index = Number(req.params.index);
  Tho.findOne({index:index}).populate('postedUser').exec((error, tho) => {
    if (error) return res.json({error: error.message});
    // [] TODO: minimized user data send back to frontend
    res.status(200).json(tho);
  });
});

router.post('/tho', authCheck, (req, res) => {
  if (res.locals && res.locals.error) {
    return res.status(401).json({error: res.locals.error});
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

router.get('/allthos', (req, res) => {
  Tho.find({}).populate('postedUser').exec((error, thos) => {
    if (error) return res.status(401).json({error: error.message});
    res.status(200).json(thos);
  })
})

router.get('/tho/:index/comments', (req, res) => {
  // [X] TODO: return only comments having user
  // it may be the case when user unlink account!
  const thoIndex = req.params.index;
  Tho.findOne({index: thoIndex})
    .populate({
      path: 'comments',
      populate: {
        path: 'postedUser',
        select: 'profile',
        model: 'User'
      }
    }).exec((error, tho) => {
    if (error) return res.json({error: error.message});
    // return a list of comments that having postedUser
    return res.json({comments: tho.comments.filter(comment => !!comment.postedUser)})
  });
});

router.post('/tho/:index/comment', authCheck, (req, res) => {
  if (res.locals && res.locals.error) { return res.status(401).json({error: req.locals.error});}
  // if (!req.user) { return res.status(401).json({error: 'There is no user!'})};

  const thoIndex = Number(req.params.index);
  const { postedComment, commentAction } = req.body;

  Tho.findOne({index: thoIndex}, (error, tho) => {
    if (error) return res.json({error: 'Co loi, de nghi lien he tac gia!'});
    if (tho && commentAction === 'save') {
      const affectedComment = new Comment(postedComment);
      Comment.findOneAndUpdate({_id: affectedComment._id}, affectedComment, {upsert: true, new: true}, (error, newComment) => {
        if (error) return res.json({error: error.message});
        if (!postedComment._id) {
          // new comment => add to tho.comments using concat method
          tho.comments = (tho.comments || []).concat(newComment._id);
        }
        tho.save((error, updatedTho) => {
          if (error) return res.json({error: error.message});
          //populate users in comments to return updated data
          tho.populate({
            path: 'comments',
            populate: {
              path: 'postedUser',
              model: 'User'
            }
          }, (error, updatedTho) => {
            if (error) return res.json({error: error.message});
            return res.status(200).json({comments: updatedTho.comments, update: 'updated'})
          })
        });
      });
    }

    if (tho && commentAction === 'delete') {
      Comment.findOneAndRemove({_id: postedComment._id}, (error) => {
        if (error) return res.json({error: error.message});
        tho.comments = tho.comments.filter(comment => comment != postedComment._id);
        tho.save(error => {
          if (error) return res.json({error: error.message});
          //populate users in comments to return updated data
          tho.populate({
            path: 'comments',
            populate: {
              path: 'postedUser',
              model: 'User'
            }
          }, (error, updatedTho) => {
            if (error) return res.json({error: error.message});
            return res.status(200).json({comments: updatedTho.comments, update: 'deleted'})
          })
        });
      });
    }
  });
})

// NOTE: Use to delete all data just in case, TURNOFF when no use!
// REVIEW whenever turn on!
// router.get('/tho/emergency', (req, res) => {
//   Tho.remove({}, (error) => {
//     if(error) return res.json({error: 'Unknown error!'});
//     res.status(200).json({done: 'OK'});
//   })
// });

module.exports = router;
