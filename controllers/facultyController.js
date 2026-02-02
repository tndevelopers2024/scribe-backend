const User = require('../models/User');

// @desc    Get all students assigned to a faculty
// @route   GET /api/faculty/students
// @access  Private (Faculty/Lead Faculty)
const getAssignedStudents = async (req, res) => {
    try {
        let query = { role: 'Student' };
        const userId = req.user._id.toString();
        const userCollegeId = req.user.college ? req.user.college.toString() : null;

        if (req.user.role === 'Lead Faculty') {
            // Broad search for Lead Faculty:
            // 1. Same college
            // 2. OR assigned explicitly to this Lead
            // 3. OR assigned to a Faculty member who reports to this Lead
            const subordinateFaculties = await User.find({ leadFaculty: req.user._id }).select('_id');
            const subordinateIds = subordinateFaculties.map(f => f._id);

            const conditions = [
                { leadFaculty: req.user._id },
                { faculty: { $in: subordinateIds } }
            ];

            if (userCollegeId) {
                conditions.push({ college: userCollegeId });
            }

            query = {
                role: 'Student',
                $or: conditions
            };

            console.log(`[DEBUG] Lead Faculty ${req.user.email} querying. College: ${userCollegeId}, Subordinates: ${subordinateIds.length}`);
        } else if (req.user.role === 'Faculty') {
            query.faculty = req.user._id;
        } else if (req.user.role === 'Super Admin' || req.user.role === 'Admin') {
            // Keep query as is (role: 'Student') to see all
        } else {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const students = await User.find(query)
            .select('-password')
            .populate('college', 'name')
            .populate('faculty', 'name');

        console.log(`[DEBUG] Found ${students.length} students for ${req.user.email} (${req.user.role})`);
        res.json(students);
    } catch (error) {
        console.error(`[DEBUG ERROR] getAssignedStudents: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get full portfolio of a specific student
// @route   GET /api/faculty/student/:id
// @access  Private (Faculty/Lead Faculty)
const getStudentPortfolio = async (req, res) => {
    try {
        const student = await User.findById(req.params.id)
            .select('-password')
            .populate('academicAchievements.reviewedBy', 'name profile.firstName profile.lastName')
            .populate('courseReflections.reviewedBy', 'name profile.firstName profile.lastName')
            .populate('beTheChange.reviewedBy', 'name profile.firstName profile.lastName')
            .populate('researchPublications.reviewedBy', 'name profile.firstName profile.lastName')
            .populate('interdisciplinaryCollaboration.reviewedBy', 'name profile.firstName profile.lastName')
            .populate('conferenceParticipation.reviewedBy', 'name profile.firstName profile.lastName')
            .populate('competitionsAwards.reviewedBy', 'name profile.firstName profile.lastName')
            .populate('workshopsTraining.reviewedBy', 'name profile.firstName profile.lastName')
            .populate('clinicalExperiences.reviewedBy', 'name profile.firstName profile.lastName')
            .populate('voluntaryParticipation.reviewedBy', 'name profile.firstName profile.lastName')
            .populate('ethicsThroughArt.reviewedBy', 'name profile.firstName profile.lastName')
            .populate('thoughtsToActions.reviewedBy', 'name profile.firstName profile.lastName')
            .populate('profile.reviewedBy', 'name profile.firstName profile.lastName')
            .populate('faculty', 'name')
            .populate('college', 'name');

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Authorization check - Use String for robust comparison
        const studentFacultyId = student.faculty?._id ? student.faculty._id.toString() : student.faculty ? student.faculty.toString() : null;
        const studentLeadFacultyId = student.leadFaculty ? student.leadFaculty.toString() : null;
        const studentCollegeId = student.college?._id ? student.college._id.toString() : student.college ? student.college.toString() : null;

        const userId = req.user._id.toString();
        const userCollegeId = req.user.college ? req.user.college.toString() : null;

        const isDirectFaculty = studentFacultyId === userId;
        const isLeadFacultyDirect = studentLeadFacultyId === userId;
        const isInSameCollege = (req.user.role === 'Lead Faculty' || req.user.role === 'Super Admin' || req.user.role === 'Admin') &&
            studentCollegeId && userCollegeId && studentCollegeId === userCollegeId;
        const isSuperAdmin = req.user.role === 'Super Admin' || req.user.role === 'Admin';

        if (!isDirectFaculty && !isInSameCollege && !isLeadFacultyDirect && !isSuperAdmin) {
            console.warn(`[AUTH FAIL] User ${req.user.email} (${req.user.role}) attempted to view student ${student.name}. 
                College Match: ${isInSameCollege} (St:${studentCollegeId} Usr:${userCollegeId}),
                Direct Match: ${isDirectFaculty} (StFac:${studentFacultyId} UsrId:${userId}), 
                Lead Match: ${isLeadFacultyDirect} (StLead:${studentLeadFacultyId} UsrId:${userId})`);
            return res.status(403).json({ message: 'Not authorized to view this student portfolio' });
        }

        // Calculate pending counts for each section (excluding profile)
        const pendingCounts = {
            achievements: student.academicAchievements?.filter(item => ['Pending', 'Resubmitted'].includes(item.status)).length || 0,
            reflections: student.courseReflections?.filter(item => ['Pending', 'Resubmitted'].includes(item.status)).length || 0,
            bethechange: student.beTheChange?.filter(item => ['Pending', 'Resubmitted'].includes(item.status)).length || 0,
            research: student.researchPublications?.filter(item => ['Pending', 'Resubmitted'].includes(item.status)).length || 0,
            collaboration: student.interdisciplinaryCollaboration?.filter(item => ['Pending', 'Resubmitted'].includes(item.status)).length || 0,
            conference: student.conferenceParticipation?.filter(item => ['Pending', 'Resubmitted'].includes(item.status)).length || 0,
            awards: student.competitionsAwards?.filter(item => ['Pending', 'Resubmitted'].includes(item.status)).length || 0,
            workshops: student.workshopsTraining?.filter(item => ['Pending', 'Resubmitted'].includes(item.status)).length || 0,
            clinical: student.clinicalExperiences?.filter(item => ['Pending', 'Resubmitted'].includes(item.status)).length || 0,
            voluntary: student.voluntaryParticipation?.filter(item => ['Pending', 'Resubmitted'].includes(item.status)).length || 0,
            ethics: student.ethicsThroughArt?.filter(item => ['Pending', 'Resubmitted'].includes(item.status)).length || 0,
            thoughts: student.thoughtsToActions?.filter(item => ['Pending', 'Resubmitted'].includes(item.status)).length || 0
        };

        res.json({ ...student.toObject(), pendingCounts });
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

        // Authorization check - Consistent with view logic
        const studentFacultyId = student.faculty?._id ? student.faculty._id.toString() : student.faculty ? student.faculty.toString() : null;
        const studentLeadFacultyId = student.leadFaculty ? student.leadFaculty.toString() : null;
        const studentCollegeId = student.college?._id ? student.college._id.toString() : student.college ? student.college.toString() : null;

        const userId = req.user._id.toString();
        const userCollegeId = req.user.college ? req.user.college.toString() : null;

        const isDirectFaculty = studentFacultyId === userId;
        const isLeadFacultyDirect = studentLeadFacultyId === userId;
        const isInSameCollege = (req.user.role === 'Lead Faculty' || req.user.role === 'Super Admin' || req.user.role === 'Admin') &&
            studentCollegeId && userCollegeId && studentCollegeId === userCollegeId;
        const isSuperAdmin = req.user.role === 'Super Admin' || req.user.role === 'Admin';

        if (!isDirectFaculty && !isInSameCollege && !isLeadFacultyDirect && !isSuperAdmin) {
            return res.status(403).json({ message: 'Not authorized to review this student' });
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
            item.reviewedBy = req.user._id;
            item.reviewedAt = Date.now();
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
