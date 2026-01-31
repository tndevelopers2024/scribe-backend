const User = require('../models/User');
const College = require('../models/College');
const { sendCredentialsEmail } = require('../utils/emailService');
const crypto = require('crypto');

const generatePassword = () => {
    return crypto.randomBytes(4).toString('hex'); // 8 chars
};

// @desc    Add a new College
// @route   POST /api/admin/college
// @desc    Add a new College
// @route   POST /api/admin/college
const addCollege = async (req, res) => {
    const { name, location } = req.body;
    try {
        const college = await College.create({
            name,
            location,
        });
        res.status(201).json(college);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Add Lead Faculty
// @route   POST /api/admin/lead-faculty
const addLeadFaculty = async (req, res) => {
    const { name, email, collegeId } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const password = generatePassword();
        const user = await User.create({
            name,
            email,
            password,
            role: 'Lead Faculty',
            college: collegeId,
            assignedBy: req.user._id
        });

        // Update College with Lead Faculty
        await College.findByIdAndUpdate(collegeId, { leadFaculty: user._id });

        console.log(`📧 Attempting to send email to ${email}...`);
        const emailResult = await sendCredentialsEmail(email, name, password, 'Lead Faculty');
        console.log(`📧 Email result:`, emailResult);

        res.status(201).json({
            message: emailResult.success ? 'Lead Faculty added and email sent successfully' : `Lead Faculty added but email failed: ${emailResult.error}`,
            user,
            emailSent: emailResult.success
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Add Faculty
// @route   POST /api/admin/faculty
const addFaculty = async (req, res) => {
    const { name, email, leadFacultyId } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const leadFaculty = await User.findById(leadFacultyId);
        if (!leadFaculty || leadFaculty.role !== 'Lead Faculty') {
            return res.status(400).json({ message: 'Invalid Lead Faculty ID' });
        }

        const password = generatePassword();
        const user = await User.create({
            name,
            email,
            password,
            role: 'Faculty',
            leadFaculty: leadFacultyId,
            college: leadFaculty.college,
            assignedBy: req.user._id
        });

        const emailResult = await sendCredentialsEmail(email, name, password, 'Faculty');
        res.status(201).json({
            message: emailResult.success ? 'Faculty added and email sent successfully' : `Faculty added but email failed: ${emailResult.error}`,
            user,
            emailSent: emailResult.success
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Add Student
// @route   POST /api/admin/student
const addStudent = async (req, res) => {
    const { name, email, collegeId } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Validate college exists
        const college = await College.findById(collegeId);
        if (!college) {
            return res.status(400).json({ message: 'Invalid College ID' });
        }

        // Find all faculties in the college
        const faculties = await User.find({
            role: 'Faculty',
            college: collegeId
        });

        if (faculties.length === 0) {
            return res.status(400).json({ message: 'No faculties available in this college. Please add faculties first.' });
        }

        // Count students for each faculty and find the one with least students
        let facultyWithLeastStudents = null;
        let minStudentCount = Infinity;

        for (const faculty of faculties) {
            const studentCount = await User.countDocuments({
                role: 'Student',
                faculty: faculty._id
            });

            if (studentCount < minStudentCount) {
                minStudentCount = studentCount;
                facultyWithLeastStudents = faculty;
            }
        }

        const password = generatePassword();
        const user = await User.create({
            name,
            email,
            password,
            role: 'Student',
            faculty: facultyWithLeastStudents._id,
            leadFaculty: facultyWithLeastStudents.leadFaculty,
            college: collegeId,
            assignedBy: req.user._id
        });

        const emailResult = await sendCredentialsEmail(email, name, password, 'Student');
        res.status(201).json({
            message: emailResult.success
                ? `Student added and assigned to ${facultyWithLeastStudents.name}. Email sent successfully.`
                : `Student added and assigned to ${facultyWithLeastStudents.name}, but email failed: ${emailResult.error}`,
            user,
            assignedFaculty: {
                id: facultyWithLeastStudents._id,
                name: facultyWithLeastStudents.name,
                email: facultyWithLeastStudents.email
            },
            emailSent: emailResult.success
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get All Colleges
// @route   GET /api/admin/colleges
const getColleges = async (req, res) => {
    try {
        const colleges = await College.find().populate('leadFaculty', 'name email');
        res.json(colleges);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Users (Filtered by Role or Hierarchy)
// @route   GET /api/admin/users
const getUsers = async (req, res) => {
    try {
        const { role, leadFacultyId, facultyId } = req.query;
        let query = {};
        if (role) query.role = role;
        if (leadFacultyId) query.leadFaculty = leadFacultyId;
        if (facultyId) query.faculty = facultyId;

        const users = await User.find(query)
            .populate('college', 'name')
            .populate('leadFaculty', 'name')
            .populate('faculty', 'name');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Faculties by Lead Faculty ID
// @route   GET /api/admin/faculties/:leadFacultyId
const getFacultiesByLeadFaculty = async (req, res) => {
    try {
        const { leadFacultyId } = req.params;
        const faculties = await User.find({
            role: 'Faculty',
            leadFaculty: leadFacultyId
        })
            .populate('college', 'name')
            .populate('leadFaculty', 'name email')
            .select('name email role college leadFaculty');
        res.json(faculties);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Students by Faculty ID
// @route   GET /api/admin/students/:facultyId
const getStudentsByFaculty = async (req, res) => {
    try {
        const { facultyId } = req.params;
        const students = await User.find({
            role: 'Student',
            faculty: facultyId
        })
            .populate('faculty', 'name email')
            .populate('college', 'name')
            .select('name email role faculty college');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addCollege,
    addLeadFaculty,
    addFaculty,
    addStudent,
    getColleges,
    getUsers,
    getFacultiesByLeadFaculty,
    getStudentsByFaculty
};
