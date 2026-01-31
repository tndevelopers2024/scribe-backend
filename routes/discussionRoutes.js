const express = require('express');
const router = express.Router();
const {
    getDiscussions,
    createDiscussion,
    deleteDiscussion,
    addComment,
    toggleLike
} = require('../controllers/discussionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getDiscussions)
    .post(protect, createDiscussion);

router.route('/:id')
    .delete(protect, deleteDiscussion);

router.route('/:id/comment')
    .post(protect, addComment);

router.route('/:id/like')
    .put(protect, toggleLike);

module.exports = router;
