const User = require('../models/User');

// @desc    Get all students assigned to a faculty
// @route   GET /api/faculty/students
// @access  Private (Faculty/Lead Faculty)
const getAssignedStudents = async (req, res) => {
    try {
        // Find students where 'faculty' field matches the logged-in user's ID
        // Or if it's a Lead Faculty, they might want to see all students under their lead (optional hierarchy)
        // For now, let's assume direct assignment
        const students = await User.find({ faculty: req.user._id, role: 'Student' })
            .select('-password'); // Exclude password
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get full portfolio of a specific student
// @route   GET /api/faculty/student/:id
// @access  Private (Faculty/Lead Faculty)
const getStudentPortfolio = async (req, res) => {
    try {
        const student = await User.findById(req.params.id).select('-password');

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Check explicit assignment authorization
        // Allow if assigned faculty matches OR if user is Super Admin/Lead Faculty (checking logic might vary)
        if (student.faculty.toString() !== req.user._id.toString() && req.user.role !== 'Super Admin' && req.user.role !== 'Lead Faculty') {
            return res.status(401).json({ message: 'Not authorized to view this student portfolio' });
        }

        res.json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Review a portfolio item (Approve/Reject + Feedback)
// @route   PUT /api/faculty/review
// @access  Private (Faculty)
const reviewPortfolioItem = async (req, res) => {
    try {
        const { studentId, section, itemId, status, feedback } = req.body;

        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Authorization check
        if (student.faculty.toString() !== req.user._id.toString() && req.user.role !== 'Super Admin' && req.user.role !== 'Lead Faculty') {
            return res.status(401).json({ message: 'Not authorized to review this student' });
        }

        let oldStatus;

        // Update logic based on section
        if (section === 'profile') {
            oldStatus = student.profile.status;
            student.profile.status = status;
            student.profile.feedback = feedback;
        } else {
            // Find the item in the array
            if (!student[section]) {
                return res.status(400).json({ message: 'Invalid section' });
            }

            const item = student[section].id(itemId);
            if (!item) {
                return res.status(404).json({ message: 'Item not found' });
            }

            // Capture old status BEFORE modifying
            oldStatus = item.status;

            // Modify item
            item.status = status;
            item.feedback = feedback;
        }

        console.log(`[DEBUG] Reviewing item: Status=${status}, OldStatus=${oldStatus}, CurrentPoints=${student.points}`);

        // Point System Logic
        if (status === 'Approved' && oldStatus !== 'Approved') {
            student.points = (student.points || 0) + 1;
            console.log(`[DEBUG] Point Added. New Total: ${student.points}`);
        } else if (status !== 'Approved' && oldStatus === 'Approved') {
            student.points = Math.max(0, (student.points || 0) - 1);
            console.log(`[DEBUG] Point Removed. New Total: ${student.points}`);
        } else {
            console.log(`[DEBUG] No point change.`);
        }

        await student.save();
        res.json({ message: 'Review updated successfully', student });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAssignedStudents,
    getStudentPortfolio,
    reviewPortfolioItem
};
