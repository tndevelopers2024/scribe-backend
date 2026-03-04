const Seminar = require('../models/Seminar');

// @desc    Create a new Seminar
// @route   POST /api/seminars
// @access  Private (Developer)
const createSeminar = async (req, res) => {
    const { title, date } = req.body;

    if (!title || !date) {
        return res.status(400).json({ message: 'Please provide title and date' });
    }

    try {
        const seminar = await Seminar.create({
            title,
            date,
            createdBy: req.user._id
        });

        res.status(201).json(seminar);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all Seminars
// @route   GET /api/seminars
// @access  Private
const getSeminars = async (req, res) => {
    try {
        const seminars = await Seminar.find().sort({ date: -1 });
        res.json(seminars);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a Seminar
// @route   PUT /api/seminars/:id
// @access  Private (Developer/Super Admin)
const updateSeminar = async (req, res) => {
    const { title, date } = req.body;
    try {
        const seminar = await Seminar.findById(req.params.id);
        if (!seminar) {
            return res.status(404).json({ message: 'Seminar not found' });
        }

        seminar.title = title || seminar.title;
        seminar.date = date || seminar.date;

        const updatedSeminar = await seminar.save();
        res.json(updatedSeminar);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a Seminar
// @route   DELETE /api/seminars/:id
// @access  Private (Developer/Super Admin)
const deleteSeminar = async (req, res) => {
    try {
        const seminar = await Seminar.findById(req.params.id);
        if (!seminar) {
            return res.status(404).json({ message: 'Seminar not found' });
        }

        await Seminar.findByIdAndDelete(req.params.id);
        res.json({ message: 'Seminar removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createSeminar,
    getSeminars,
    updateSeminar,
    deleteSeminar
};
