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
        const nameParts = name ? name.split(' ') : [];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
        const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';

        // Get college name for institution initialization
        const college = await College.findById(collegeId);

        const user = await User.create({
            name,
            email,
            password,
            role: 'Lead Faculty',
            college: collegeId,
            assignedBy: req.user._id,
            profile: {
                firstName,
                middleName,
                lastName,
                institution: college ? college.name : ''
            }
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
        const nameParts = name ? name.split(' ') : [];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
        const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';

        const user = await User.create({
            name,
            email,
            password,
            role: 'Faculty',
            leadFaculty: leadFacultyId,
            college: leadFaculty.college,
            assignedBy: req.user._id,
            profile: {
                firstName,
                middleName,
                lastName,
                institution: leadFaculty.college?.name || ''
            }
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
        const nameParts = name ? name.split(' ') : [];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
        const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';

        const user = await User.create({
            name,
            email,
            password,
            role: 'Student',
            faculty: facultyWithLeastStudents._id,
            leadFaculty: facultyWithLeastStudents.leadFaculty,
            college: collegeId,
            assignedBy: req.user._id,
            profile: {
                firstName,
                middleName,
                lastName,
                institution: college.name || ''
            }
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
        const colleges = await College.find().populate('leadFaculty', 'name email').sort({ name: 1 });
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
            .select('name email role faculty college profile academicAchievements courseReflections beTheChange researchPublications interdisciplinaryCollaboration conferenceParticipation competitionsAwards workshopsTraining clinicalExperiences voluntaryParticipation ethicsThroughArt thoughtsToActions');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a College
// @route   DELETE /api/admin/college/:id
const deleteCollege = async (req, res) => {
    try {
        const college = await College.findById(req.params.id);
        if (!college) {
            return res.status(404).json({ message: 'College not found' });
        }

        // Clear college reference in all users
        await User.updateMany({ college: req.params.id }, { $set: { college: null } });

        await College.findByIdAndDelete(req.params.id);
        res.json({ message: 'College deleted and user references cleared' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a User (Lead Faculty, Faculty, or Student)
// @route   DELETE /api/admin/user/:id
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const role = user.role;

        // Cleanup based on role
        if (role === 'Lead Faculty') {
            const collegeId = user.college;

            // 1. Find a potential successor (any regular Faculty in the same college)
            const successor = await User.findOne({
                college: collegeId,
                role: 'Faculty',
                _id: { $ne: user._id }
            });

            if (successor) {
                // 2. Promote the successor to Lead Faculty
                successor.role = 'Lead Faculty';
                successor.leadFaculty = null;
                await successor.save();

                // 3. Update the college to point to the new Lead
                await College.updateMany({ leadFaculty: user._id }, { $set: { leadFaculty: successor._id } });

                // 4. Reassign all other faculties and students to report to the new Lead
                await User.updateMany(
                    { college: collegeId, leadFaculty: user._id, _id: { $ne: successor._id } },
                    { $set: { leadFaculty: successor._id } }
                );

                // 5. Transfer specific mentorship: Any students directly under the deleted lead
                // now report to the new promoted lead.
                await User.updateMany(
                    { faculty: user._id },
                    { $set: { faculty: successor._id } }
                );
            } else {
                // No successor found, clear references as before
                await College.updateMany({ leadFaculty: user._id }, { $set: { leadFaculty: null } });
                await User.updateMany({ leadFaculty: user._id }, { $set: { leadFaculty: null } });
            }
        } else if (role === 'Faculty') {
            // Clear faculty reference in students
            await User.updateMany({ faculty: user._id }, { $set: { faculty: null } });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: `${role} deleted and references cleared` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Lead Faculty for a College
// @route   PUT /api/admin/college/:id/lead
const updateCollegeLead = async (req, res) => {
    const { leadFacultyId } = req.body;
    try {
        const college = await College.findById(req.params.id);
        if (!college) {
            return res.status(404).json({ message: 'College not found' });
        }

        const newLead = await User.findById(leadFacultyId);
        if (!newLead) {
            return res.status(404).json({ message: 'User not found' });
        }

        const oldPrimaryLeadId = college.leadFaculty;
        const oldPrimaryLead = await User.findById(oldPrimaryLeadId);

        // 1. Promote new lead
        newLead.role = 'Lead Faculty';
        newLead.leadFaculty = null;
        await newLead.save();

        // 2. Update college root reference
        college.leadFaculty = newLead._id;
        await college.save();

        // 3. Demote ANYONE ELSE who is currently a Lead Faculty for this college
        // This ensures the exclusivity (Nelson should only be lead faculty)
        const otherLeads = await User.find({
            college: req.params.id,
            role: 'Lead Faculty',
            _id: { $ne: newLead._id }
        });

        for (let lead of otherLeads) {
            lead.role = 'Faculty';
            lead.leadFaculty = newLead._id;
            await lead.save();
        }

        // 4. Handle Student Transfer (Mapping: New Lead's former students -> Old Primary Lead)
        // If we have an oldPrimaryLead (e.g. Madhavan), assign Nelson's former students to him.
        if (oldPrimaryLead && oldPrimaryLead._id.toString() !== newLead._id.toString()) {
            await User.updateMany(
                {
                    college: req.params.id,
                    role: 'Student',
                    $or: [{ faculty: newLead._id }, { assignedBy: newLead._id }]
                },
                {
                    $set: {
                        faculty: oldPrimaryLead._id,
                        assignedBy: oldPrimaryLead._id,
                        leadFaculty: newLead._id
                    }
                }
            );

            // Explicitly ensure the old primary lead is reporting to the new lead
            oldPrimaryLead.role = 'Faculty';
            oldPrimaryLead.leadFaculty = newLead._id;
            await oldPrimaryLead.save();
        }

        // 5. Update all other users (Faculty/Students) in this college to report to the new Lead
        await User.updateMany(
            { college: req.params.id, _id: { $ne: newLead._id } },
            { $set: { leadFaculty: newLead._id } }
        );

        res.json({
            message: `Leadership transferred to ${newLead.name}. Previous leads demoted to Faculty.`,
            college
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update Lead Faculty for a specific Faculty member
// @route   PUT /api/admin/user/:id/lead
const updateFacultyLead = async (req, res) => {
    const { leadFacultyId } = req.body;
    try {
        const faculty = await User.findById(req.params.id);
        if (!faculty || faculty.role !== 'Faculty') {
            return res.status(404).json({ message: 'Faculty not found' });
        }

        const newLead = await User.findById(leadFacultyId);
        if (!newLead || newLead.role !== 'Lead Faculty') {
            return res.status(400).json({ message: 'Invalid Lead Faculty' });
        }

        // Update faculty and their associated students
        faculty.leadFaculty = leadFacultyId;
        await faculty.save();

        await User.updateMany(
            { faculty: faculty._id },
            { $set: { leadFaculty: leadFacultyId } }
        );

        res.json({ message: 'Lead Faculty reassigned for faculty and their students' });
    } catch (error) {
        res.status(400).json({ message: error.message });
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
    getStudentsByFaculty,
    deleteCollege,
    deleteUser,
    updateCollegeLead,
    updateFacultyLead
};
