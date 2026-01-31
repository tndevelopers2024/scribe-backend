const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    getAssignedStudents,
    getStudentPortfolio,
    reviewPortfolioItem
} = require('../controllers/facultyController');

// All routes are protected and restricted to Faculty/Lead Faculty
router.use(protect);
router.use(authorize('Faculty', 'Lead Faculty', 'Super Admin'));

router.get('/students', getAssignedStudents);
router.get('/student/:id', getStudentPortfolio);
router.put('/review', reviewPortfolioItem);

module.exports = router;
