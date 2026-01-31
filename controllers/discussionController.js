const Discussion = require('../models/Discussion');
const User = require('../models/User');

// Get all discussions
const getDiscussions = async (req, res) => {
    try {
        const discussions = await Discussion.find()
            .populate('user', 'name')
            .populate('comments.user', 'name')
            .sort({ createdAt: -1 });
        res.json(discussions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new discussion post
const createDiscussion = async (req, res) => {
    try {
        const { title, content } = req.body;
        const discussion = await Discussion.create({
            user: req.user._id,
            title,
            content
        });

        const populatedDiscussion = await Discussion.findById(discussion._id).populate('user', 'name');
        res.status(201).json(populatedDiscussion);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a discussion post
const deleteDiscussion = async (req, res) => {
    try {
        const discussion = await Discussion.findById(req.params.id);

        if (!discussion) {
            return res.status(404).json({ message: 'Discussion not found' });
        }

        // Check user
        if (discussion.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await discussion.deleteOne();
        res.json({ id: req.params.id });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Add a comment
const addComment = async (req, res) => {
    try {
        const discussion = await Discussion.findById(req.params.id);
        if (!discussion) {
            return res.status(404).json({ message: 'Discussion not found' });
        }

        const comment = {
            user: req.user._id,
            text: req.body.text
        };

        discussion.comments.push(comment);
        await discussion.save();

        const updatedDiscussion = await Discussion.findById(req.params.id)
            .populate('user', 'name')
            .populate('comments.user', 'name');

        res.json(updatedDiscussion);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Toggle Like
const toggleLike = async (req, res) => {
    try {
        const discussion = await Discussion.findById(req.params.id);
        if (!discussion) {
            return res.status(404).json({ message: 'Discussion not found' });
        }

        // Check if discussion has already been liked
        const index = discussion.likes.findIndex(id => id.toString() === req.user._id.toString());

        if (index === -1) {
            // Like
            discussion.likes.push(req.user._id);
        } else {
            // Unlike
            discussion.likes.splice(index, 1);
        }

        await discussion.save();
        res.json(discussion.likes);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getDiscussions,
    createDiscussion,
    deleteDiscussion,
    addComment,
    toggleLike
};
