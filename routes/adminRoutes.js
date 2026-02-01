const express = require('express');
const {
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
} = require('../controllers/superAdminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Super Admin only routes
router.post('/college', authorize('Super Admin'), addCollege);
router.post('/lead-faculty', authorize('Super Admin'), addLeadFaculty);
router.post('/faculty', authorize('Super Admin'), addFaculty);
router.post('/student', authorize('Super Admin'), addStudent);
router.get('/colleges', getColleges);
router.get('/users', authorize('Super Admin'), getUsers);

// Management routes
router.delete('/college/:id', authorize('Super Admin'), deleteCollege);
router.delete('/user/:id', authorize('Super Admin'), deleteUser);
router.put('/college/:id/lead', authorize('Super Admin'), updateCollegeLead);
router.put('/user/:id/lead', authorize('Super Admin'), updateFacultyLead);

// Lead Faculty can access their own faculties and students
router.get('/faculties/:leadFacultyId', authorize('Super Admin', 'Lead Faculty'), getFacultiesByLeadFaculty);
router.get('/students/:facultyId', authorize('Super Admin', 'Lead Faculty'), getStudentsByFaculty);

module.exports = router;
