const express = require('express');
const router = express.Router();
const {
    getProfile,
    updateProfile,
    addAchievement,
    updateAchievement,
    deleteAchievement,
    addCourseReflection,
    updateCourseReflection,
    deleteCourseReflection,
    addBeTheChange,
    updateBeTheChange,
    deleteBeTheChange,
    addResearchPublication,
    updateResearchPublication,
    deleteResearchPublication,
    addInterdisciplinaryCollaboration,
    updateInterdisciplinaryCollaboration,
    deleteInterdisciplinaryCollaboration,
    addConferenceParticipation,
    updateConferenceParticipation,
    deleteConferenceParticipation,
    addCompetitionAward,
    updateCompetitionAward,
    deleteCompetitionAward,
    addWorkshopTraining,
    updateWorkshopTraining,
    deleteWorkshopTraining,
    addClinicalExperience,
    updateClinicalExperience,
    deleteClinicalExperience,
    addVoluntaryParticipation,
    updateVoluntaryParticipation,
    deleteVoluntaryParticipation,
    addEthicsThroughArt,
    updateEthicsThroughArt,
    deleteEthicsThroughArt,
    addThinkingToAction,
    updateThinkingToAction,
    deleteThinkingToAction
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

router.route('/')
    .get(getProfile)
    .put(updateProfile);

router.route('/achievements')
    .post(addAchievement);

router.route('/achievements/:id')
    .put(updateAchievement)
    .delete(deleteAchievement);

router.route('/course-reflections')
    .post(addCourseReflection);

router.route('/course-reflections/:id')
    .put(updateCourseReflection)
    .delete(deleteCourseReflection);

router.route('/be-the-change')
    .post(addBeTheChange);

router.route('/be-the-change/:id')
    .put(updateBeTheChange)
    .delete(deleteBeTheChange);

router.route('/research-publications')
    .post(addResearchPublication);

router.route('/research-publications/:id')
    .put(updateResearchPublication)
    .delete(deleteResearchPublication);

router.route('/interdisciplinary-collaboration')
    .post(addInterdisciplinaryCollaboration);

router.route('/interdisciplinary-collaboration/:id')
    .put(updateInterdisciplinaryCollaboration)
    .delete(deleteInterdisciplinaryCollaboration);

router.route('/conference-participation')
    .post(addConferenceParticipation);

router.route('/conference-participation/:id')
    .put(updateConferenceParticipation)
    .delete(deleteConferenceParticipation);

router.route('/competitions-awards')
    .post(addCompetitionAward);

router.route('/competitions-awards/:id')
    .put(updateCompetitionAward)
    .delete(deleteCompetitionAward);

router.route('/workshops-training')
    .post(addWorkshopTraining);

router.route('/workshops-training/:id')
    .put(updateWorkshopTraining)
    .delete(deleteWorkshopTraining);

router.route('/clinical-experiences')
    .post(addClinicalExperience);

router.route('/clinical-experiences/:id')
    .put(updateClinicalExperience)
    .delete(deleteClinicalExperience);

router.route('/voluntary-participation')
    .post(addVoluntaryParticipation);

router.route('/voluntary-participation/:id')
    .put(updateVoluntaryParticipation)
    .delete(deleteVoluntaryParticipation);

router.route('/ethics-through-art')
    .post(addEthicsThroughArt);

router.route('/ethics-through-art/:id')
    .put(updateEthicsThroughArt)
    .delete(deleteEthicsThroughArt);

router.route('/thoughts-to-actions')
    .post(addThinkingToAction);

router.route('/thoughts-to-actions/:id')
    .put(updateThinkingToAction)
    .delete(deleteThinkingToAction);

module.exports = router;
