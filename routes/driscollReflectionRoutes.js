const express = require('express');
const router = express.Router();
const { addDriscollReflection, getMyDriscollReflections, reviewDriscollReflection } = require('../controllers/reflectionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('Student'), addDriscollReflection);

router.route('/my')
    .get(protect, authorize('Student'), getMyDriscollReflections);

router.route('/review')
    .put(protect, authorize('Faculty', 'Lead Faculty', 'Super Admin', 'Admin', 'Developer'), reviewDriscollReflection);

module.exports = router;
