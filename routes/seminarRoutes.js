const express = require('express');
const router = express.Router();
const { createSeminar, getSeminars, updateSeminar, deleteSeminar } = require('../controllers/seminarController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getSeminars)
    .post(protect, authorize('Super Admin', 'Developer'), createSeminar);

router.route('/:id')
    .put(protect, authorize('Super Admin', 'Developer'), updateSeminar)
    .delete(protect, authorize('Super Admin', 'Developer'), deleteSeminar);

module.exports = router;
