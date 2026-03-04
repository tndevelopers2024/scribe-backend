const mongoose = require('mongoose');

const driscollReflectionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    seminar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seminar',
        required: true
    },
    what: {
        type: String,
        required: true
    },
    soWhat: {
        type: String,
        required: true
    },
    nowWhat: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Resubmitted'],
        default: 'Pending'
    },
    feedback: {
        type: String
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Ensure a user can only have one reflection per seminar
driscollReflectionSchema.index({ user: 1, seminar: 1 }, { unique: true });

module.exports = mongoose.model('DriscollReflection', driscollReflectionSchema);
