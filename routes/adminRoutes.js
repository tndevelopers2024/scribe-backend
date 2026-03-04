const express = require('express');
const {
    addCollege,
    addLeadFaculty,
    addFaculty,
    addStudent,
    addAdmin,
    getColleges,
    getUsers,
    getFacultiesByLeadFaculty,
    getStudentsByFaculty,
    deleteCollege,
    deleteUser,
    updateCollegeLead,
    updateFacultyLead,
    previewBulkStudents,
    confirmBulkStudents
} = require('../controllers/superAdminController');
const { protect, authorize } = require('../middleware/authMiddleware');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// All routes require authentication
router.use(protect);

// Super Admin only routes
router.post('/college', authorize('Super Admin', 'Developer'), addCollege);
router.post('/lead-faculty', authorize('Super Admin', 'Developer'), addLeadFaculty);
router.post('/faculty', authorize('Super Admin', 'Developer'), addFaculty);
router.post('/student', authorize('Super Admin', 'Developer'), addStudent);
router.post('/admin', authorize('Super Admin', 'Developer'), addAdmin);
router.post('/preview-students', authorize('Super Admin', 'Developer'), upload.single('file'), previewBulkStudents);
router.post('/confirm-students', authorize('Super Admin', 'Developer'), confirmBulkStudents);
router.get('/colleges', getColleges);
router.get('/users', authorize('Super Admin', 'Admin', 'Developer'), getUsers);

// Management routes
router.delete('/college/:id', authorize('Super Admin', 'Developer'), deleteCollege);
router.delete('/user/:id', authorize('Super Admin', 'Developer'), deleteUser);
router.put('/college/:id/lead', authorize('Super Admin', 'Developer'), updateCollegeLead);
router.put('/user/:id/lead', authorize('Super Admin', 'Developer'), updateFacultyLead);

// Lead Faculty can access their own faculties and students
router.get('/faculties/:leadFacultyId', authorize('Super Admin', 'Lead Faculty', 'Admin'), getFacultiesByLeadFaculty);
router.get('/students/:facultyId', authorize('Super Admin', 'Lead Faculty', 'Admin'), getStudentsByFaculty);

module.exports = router;
