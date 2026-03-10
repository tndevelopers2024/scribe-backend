const DriscollReflection = require('../models/DriscollReflection');
const Seminar = require('../models/Seminar');
const User = require('../models/User');

// @desc    Add or update Driscoll Reflection
// @route   POST /api/reflections/driscoll
// @access  Private (Student)
const addDriscollReflection = async (req, res) => {
    const { seminarId, what, soWhat, nowWhat } = req.body;

    if (!seminarId || !what || !soWhat || !nowWhat) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        const seminar = await Seminar.findById(seminarId);
        if (!seminar) {
            return res.status(404).json({ message: 'Seminar not found' });
        }

        // Timer Logic: Starts next day after seminar, ends 24 hours later
        const now = new Date();
        const seminarDate = new Date(seminar.date);

        // Window start: 6:00 PM on the seminar date
        const startTime = new Date(seminarDate);
        startTime.setHours(18, 0, 0, 0);

        // Window end: 10:00 PM on the next day
        const endTime = new Date(seminarDate);
        endTime.setDate(endTime.getDate() + 1);
        endTime.setHours(22, 0, 0, 0);

        if (now < startTime) {
            return res.status(403).json({
                message: 'Reflection window has not started yet. It starts at 6:00 PM on the seminar date.'
            });
        }

        if (now > endTime) {
            return res.status(403).json({
                message: 'Reflection window is closed. It closes at 10:00 PM the following day of the seminar.'
            });
        }

        // check if it exists to handle status transition
        const existingReflection = await DriscollReflection.findOne({ user: req.user._id, seminar: seminarId });

        let status = 'Pending';
        if (existingReflection && (existingReflection.status === 'Rejected' || existingReflection.status === 'Resubmitted')) {
            status = 'Resubmitted';
        }

        // upsert logic
        const reflection = await DriscollReflection.findOneAndUpdate(
            { user: req.user._id, seminar: seminarId },
            { what, soWhat, nowWhat, status },
            { new: true, upsert: true }
        ).populate('seminar', 'title date')
            .populate('reviewedBy', 'name profile.firstName profile.lastName');

        res.status(200).json(reflection);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's Driscoll Reflections
// @route   GET /api/reflections/driscoll/my
// @access  Private (Student)
const getMyDriscollReflections = async (req, res) => {
    try {
        const reflections = await DriscollReflection.find({ user: req.user._id })
            .populate('seminar', 'title date')
            .populate('reviewedBy', 'name profile.firstName profile.lastName')
            .sort({ createdAt: -1 });
        res.json(reflections);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Review a Driscoll Reflection
// @route   PUT /api/reflections/driscoll/review
// @access  Private (Faculty)
const reviewDriscollReflection = async (req, res) => {
    const { studentId, reflectionId, status, feedback } = req.body;

    if (!studentId || !reflectionId || !status) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const reflection = await DriscollReflection.findById(reflectionId);
        if (!reflection) {
            return res.status(404).json({ message: 'Reflection not found' });
        }

        // Authorization check (consistent with facultyController review)
        const isSuperAdmin = req.user.role === 'Super Admin' || req.user.role === 'Admin';
        const isDirectFaculty = student.faculty?.toString() === req.user._id.toString();
        const isLeadFaculty = student.leadFaculty?.toString() === req.user._id.toString();
        const isSameCollege = (req.user.role === 'Lead Faculty' && student.college?.toString() === req.user.college?.toString());

        if (!isSuperAdmin && !isDirectFaculty && !isLeadFaculty && !isSameCollege) {
            return res.status(403).json({ message: 'Not authorized to review this student' });
        }

        const oldStatus = reflection.status;
        reflection.status = status;
        reflection.feedback = feedback;
        reflection.reviewedBy = req.user._id;
        reflection.reviewedAt = Date.now();

        await reflection.save();

        // Points System Logic (consistent with facultyController)
        if (status === 'Approved' && oldStatus !== 'Approved') {
            student.points = (student.points || 0) + 1;
            await student.save();
        } else if (status !== 'Approved' && oldStatus === 'Approved') {
            student.points = Math.max(0, (student.points || 0) - 1);
            await student.save();
        }

        res.status(200).json({ message: 'Review updated successfully', reflection });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addDriscollReflection,
    getMyDriscollReflections,
    reviewDriscollReflection
};
