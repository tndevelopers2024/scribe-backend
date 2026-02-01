const User = require('../models/User');

// @desc    Get current user's profile
// @route   GET /api/profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password')
            .populate('college', 'name')
            .populate('faculty', 'name email')
            .populate('leadFaculty', 'name email')
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
            .populate('profile.reviewedBy', 'name profile.firstName profile.lastName');

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update current user's profile
// @route   PUT /api/profile
const updateProfile = async (req, res) => {
    try {
        const { profile } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update profile fields
        if (profile) {
            user.profile = {
                firstName: profile.firstName || user.profile?.firstName || '',
                middleName: profile.middleName || user.profile?.middleName || '',
                lastName: profile.lastName || user.profile?.lastName || '',
                dateOfBirth: profile.dateOfBirth || user.profile?.dateOfBirth || null,
                sex: profile.sex || user.profile?.sex || '',
                phoneNumber: profile.phoneNumber || user.profile?.phoneNumber || '',
                fieldOfStudy: profile.fieldOfStudy || user.profile?.fieldOfStudy || '',
                levelOfEducation: profile.levelOfEducation || user.profile?.levelOfEducation || '',
                yearOfStudy: profile.yearOfStudy || user.profile?.yearOfStudy || '',
                institution: profile.institution || user.profile?.institution || '',
                country: profile.country || user.profile?.country || '',
                about: profile.about || user.profile?.about || '',
                vision: profile.vision || user.profile?.vision || '',
                profilePicture: profile.profilePicture || user.profile?.profilePicture || ''
            };
        }

        await user.save();

        const updatedUser = await User.findById(user._id)
            .select('-password')
            .populate('college', 'name')
            .populate('faculty', 'name email')
            .populate('leadFaculty', 'name email')
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
            .populate('profile.reviewedBy', 'name profile.firstName profile.lastName');

        res.json({
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Add academic achievement
// @route   POST /api/profile/achievements
const addAchievement = async (req, res) => {
    try {
        const { courseName, offeredBy, modeOfStudy, duration, currentStatus } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newAchievement = {
            courseName,
            offeredBy,
            modeOfStudy,
            duration,
            currentStatus
        };

        user.academicAchievements.push(newAchievement);
        await user.save();

        res.status(201).json({
            message: 'Achievement added successfully',
            achievement: user.academicAchievements[user.academicAchievements.length - 1]
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update academic achievement
// @route   PUT /api/profile/achievements/:id
const updateAchievement = async (req, res) => {
    try {
        const { id } = req.params;
        const { courseName, offeredBy, modeOfStudy, duration, currentStatus } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const achievement = user.academicAchievements.id(id);

        if (!achievement) {
            return res.status(404).json({ message: 'Achievement not found' });
        }

        achievement.courseName = courseName || achievement.courseName;
        achievement.offeredBy = offeredBy || achievement.offeredBy;
        achievement.modeOfStudy = modeOfStudy || achievement.modeOfStudy;
        achievement.duration = duration || achievement.duration;
        achievement.currentStatus = currentStatus || achievement.currentStatus;

        if (achievement.status === 'Rejected') {
            achievement.status = 'Resubmitted';
        }

        await user.save();

        res.json({
            message: 'Achievement updated successfully',
            achievement
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete academic achievement
// @route   DELETE /api/profile/achievements/:id
const deleteAchievement = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const achievement = user.academicAchievements.id(id);

        if (!achievement) {
            return res.status(404).json({ message: 'Achievement not found' });
        }

        if (achievement.status === 'Approved') {
            user.points = Math.max(0, (user.points || 0) - 1);
        }

        achievement.deleteOne();
        await user.save();

        res.json({ message: 'Achievement deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Course Reflection CRUD
const addCourseReflection = async (req, res) => {
    try {
        const { year, date, topicOfSession, rating, whatWasGood, whatCanBe, whatDidILearn } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.courseReflections.push({ year, date, topicOfSession, rating, whatWasGood, whatCanBe, whatDidILearn });
        await user.save();

        res.status(201).json({
            message: 'Course reflection added successfully',
            reflection: user.courseReflections[user.courseReflections.length - 1]
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateCourseReflection = async (req, res) => {
    try {
        const { id } = req.params;
        const { year, date, topicOfSession, rating, whatWasGood, whatCanBe, whatDidILearn } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const reflection = user.courseReflections.id(id);
        if (!reflection) return res.status(404).json({ message: 'Reflection not found' });

        if (year) reflection.year = year;
        if (date) reflection.date = date;
        if (topicOfSession) reflection.topicOfSession = topicOfSession;
        if (rating) reflection.rating = rating;
        if (whatWasGood) reflection.whatWasGood = whatWasGood;
        if (whatCanBe) reflection.whatCanBe = whatCanBe;
        if (whatDidILearn) reflection.whatDidILearn = whatDidILearn;

        if (reflection.status === 'Rejected') {
            reflection.status = 'Resubmitted';
        }

        await user.save();
        res.json({ message: 'Course reflection updated successfully', reflection });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteCourseReflection = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const reflection = user.courseReflections.id(id);
        if (!reflection) return res.status(404).json({ message: 'Reflection not found' });

        if (reflection.status === 'Approved') {
            user.points = Math.max(0, (user.points || 0) - 1);
        }

        reflection.deleteOne();
        await user.save();
        res.json({ message: 'Course reflection deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Be the Change CRUD
const addBeTheChange = async (req, res) => {
    try {
        const { year, reflectOnImpact } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.beTheChange.push({ year, reflectOnImpact });
        await user.save();

        res.status(201).json({
            message: 'Be the Change reflection added successfully',
            reflection: user.beTheChange[user.beTheChange.length - 1]
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateBeTheChange = async (req, res) => {
    try {
        const { id } = req.params;
        const { year, reflectOnImpact } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const reflection = user.beTheChange.id(id);
        if (!reflection) return res.status(404).json({ message: 'Reflection not found' });

        if (year) reflection.year = year;
        if (reflectOnImpact) reflection.reflectOnImpact = reflectOnImpact;

        if (reflection.status === 'Rejected') {
            reflection.status = 'Resubmitted';
        }

        await user.save();
        res.json({ message: 'Be the Change reflection updated successfully', reflection });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteBeTheChange = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const reflection = user.beTheChange.id(id);
        if (!reflection) return res.status(404).json({ message: 'Reflection not found' });

        if (reflection.status === 'Approved') {
            user.points = Math.max(0, (user.points || 0) - 1);
        }

        reflection.deleteOne();
        await user.save();
        res.json({ message: 'Be the Change reflection deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Research Publications CRUD
const addResearchPublication = async (req, res) => {
    try {
        const { projectTitle, typeOfArticle, authors, journal, doi, citation, impactFactor } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.researchPublications.push({ projectTitle, typeOfArticle, authors, journal, doi, citation, impactFactor });
        await user.save();

        res.status(201).json({
            message: 'Research publication added successfully',
            publication: user.researchPublications[user.researchPublications.length - 1]
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateResearchPublication = async (req, res) => {
    try {
        const { id } = req.params;
        const { projectTitle, typeOfArticle, authors, journal, doi, citation, impactFactor } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const publication = user.researchPublications.id(id);
        if (!publication) return res.status(404).json({ message: 'Publication not found' });

        if (projectTitle) publication.projectTitle = projectTitle;
        if (typeOfArticle) publication.typeOfArticle = typeOfArticle;
        if (authors) publication.authors = authors;
        if (journal) publication.journal = journal;
        if (doi !== undefined) publication.doi = doi;
        if (citation !== undefined) publication.citation = citation;
        if (impactFactor !== undefined) publication.impactFactor = impactFactor;

        if (publication.status === 'Rejected') {
            publication.status = 'Resubmitted';
        }

        await user.save();
        res.json({ message: 'Research publication updated successfully', publication });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteResearchPublication = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const publication = user.researchPublications.id(id);
        if (!publication) return res.status(404).json({ message: 'Publication not found' });

        if (publication.status === 'Approved') {
            user.points = Math.max(0, (user.points || 0) - 1);
        }

        publication.deleteOne();
        await user.save();
        res.json({ message: 'Research publication deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Interdisciplinary Collaboration CRUD
const addInterdisciplinaryCollaboration = async (req, res) => {
    try {
        const { projectTitle, topic, disciplinesInvolved, anticipatedDuration, significance, teamExperience, whatWentWell, whatCanBeImproved } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.interdisciplinaryCollaboration.push({ projectTitle, topic, disciplinesInvolved, anticipatedDuration, significance, teamExperience, whatWentWell, whatCanBeImproved });
        await user.save();

        res.status(201).json({
            message: 'Collaboration added successfully',
            collaboration: user.interdisciplinaryCollaboration[user.interdisciplinaryCollaboration.length - 1]
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateInterdisciplinaryCollaboration = async (req, res) => {
    try {
        const { id } = req.params;
        const { projectTitle, topic, disciplinesInvolved, anticipatedDuration, significance, teamExperience, whatWentWell, whatCanBeImproved } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const collaboration = user.interdisciplinaryCollaboration.id(id);
        if (!collaboration) return res.status(404).json({ message: 'Collaboration not found' });

        if (projectTitle) collaboration.projectTitle = projectTitle;
        if (topic) collaboration.topic = topic;
        if (disciplinesInvolved) collaboration.disciplinesInvolved = disciplinesInvolved;
        if (anticipatedDuration) collaboration.anticipatedDuration = anticipatedDuration;
        if (significance) collaboration.significance = significance;
        if (teamExperience) collaboration.teamExperience = teamExperience;
        if (whatWentWell) collaboration.whatWentWell = whatWentWell;
        if (whatCanBeImproved) collaboration.whatCanBeImproved = whatCanBeImproved;

        if (collaboration.status === 'Rejected') {
            collaboration.status = 'Resubmitted';
        }

        await user.save();
        res.json({ message: 'Collaboration updated successfully', collaboration });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteInterdisciplinaryCollaboration = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const collaboration = user.interdisciplinaryCollaboration.id(id);
        if (!collaboration) return res.status(404).json({ message: 'Collaboration not found' });

        if (collaboration.status === 'Approved') {
            user.points = Math.max(0, (user.points || 0) - 1);
        }

        collaboration.deleteOne();
        await user.save();
        res.json({ message: 'Collaboration deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Conference Participation CRUD
const addConferenceParticipation = async (req, res) => {
    try {
        const { conferenceName, attendeePresenter, summaryOfWork, dateOfConference, venue, nationalInternational, mode } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.conferenceParticipation.push({ conferenceName, attendeePresenter, summaryOfWork, dateOfConference, venue, nationalInternational, mode });
        await user.save();

        res.status(201).json({
            message: 'Conference participation added successfully',
            conference: user.conferenceParticipation[user.conferenceParticipation.length - 1]
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateConferenceParticipation = async (req, res) => {
    try {
        const { id } = req.params;
        const { conferenceName, attendeePresenter, summaryOfWork, dateOfConference, venue, nationalInternational, mode } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const conference = user.conferenceParticipation.id(id);
        if (!conference) return res.status(404).json({ message: 'Conference not found' });

        if (conferenceName) conference.conferenceName = conferenceName;
        if (attendeePresenter) conference.attendeePresenter = attendeePresenter;
        if (summaryOfWork) conference.summaryOfWork = summaryOfWork;
        if (dateOfConference) conference.dateOfConference = dateOfConference;
        if (venue) conference.venue = venue;
        if (nationalInternational) conference.nationalInternational = nationalInternational;
        if (mode) conference.mode = mode;

        if (conference.status === 'Rejected') {
            conference.status = 'Resubmitted';
        }

        await user.save();
        res.json({ message: 'Conference participation updated successfully', conference });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteConferenceParticipation = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const conference = user.conferenceParticipation.id(id);
        if (!conference) return res.status(404).json({ message: 'Conference not found' });

        if (conference.status === 'Approved') {
            user.points = Math.max(0, (user.points || 0) - 1);
        }

        conference.deleteOne();
        await user.save();
        res.json({ message: 'Conference participation deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Competitions and Awards CRUD
const addCompetitionAward = async (req, res) => {
    try {
        const { competition, venue, date, mode, summaryOfWork, awardsReceived } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.competitionsAwards.push({ competition, venue, date, mode, summaryOfWork, awardsReceived });
        await user.save();

        res.status(201).json({
            message: 'Competition/Award added successfully',
            competition: user.competitionsAwards[user.competitionsAwards.length - 1]
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateCompetitionAward = async (req, res) => {
    try {
        const { id } = req.params;
        const { competition, venue, date, mode, summaryOfWork, awardsReceived } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const comp = user.competitionsAwards.id(id);
        if (!comp) return res.status(404).json({ message: 'Competition not found' });

        if (competition) comp.competition = competition;
        if (venue) comp.venue = venue;
        if (date) comp.date = date;
        if (mode) comp.mode = mode;
        if (summaryOfWork) comp.summaryOfWork = summaryOfWork;
        if (awardsReceived) comp.awardsReceived = awardsReceived;

        if (comp.status === 'Rejected') {
            comp.status = 'Resubmitted';
        }

        await user.save();
        res.json({ message: 'Competition/Award updated successfully', competition: comp });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteCompetitionAward = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const comp = user.competitionsAwards.id(id);
        if (!comp) return res.status(404).json({ message: 'Competition not found' });

        if (comp.status === 'Approved') {
            user.points = Math.max(0, (user.points || 0) - 1);
        }

        comp.deleteOne();
        await user.save();
        res.json({ message: 'Competition/Award deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Workshops and Training CRUD
const addWorkshopTraining = async (req, res) => {
    try {
        const { nameOfWorkshop, conductedBy, mode, skillsAcquired } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.workshopsTraining.push({ nameOfWorkshop, conductedBy, mode, skillsAcquired });
        await user.save();

        res.status(201).json({
            message: 'Workshop/Training added successfully',
            workshop: user.workshopsTraining[user.workshopsTraining.length - 1]
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateWorkshopTraining = async (req, res) => {
    try {
        const { id } = req.params;
        const { nameOfWorkshop, conductedBy, mode, skillsAcquired } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const workshop = user.workshopsTraining.id(id);
        if (!workshop) return res.status(404).json({ message: 'Workshop not found' });

        if (nameOfWorkshop) workshop.nameOfWorkshop = nameOfWorkshop;
        if (conductedBy) workshop.conductedBy = conductedBy;
        if (mode) workshop.mode = mode;
        if (skillsAcquired) workshop.skillsAcquired = skillsAcquired;

        if (workshop.status === 'Rejected') {
            workshop.status = 'Resubmitted';
        }

        await user.save();
        res.json({ message: 'Workshop/Training updated successfully', workshop });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteWorkshopTraining = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const workshop = user.workshopsTraining.id(id);
        if (!workshop) return res.status(404).json({ message: 'Workshop not found' });

        if (workshop.status === 'Approved') {
            user.points = Math.max(0, (user.points || 0) - 1);
        }

        workshop.deleteOne();
        await user.save();
        res.json({ message: 'Workshop/Training deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Clinical Experiences CRUD
const addClinicalExperience = async (req, res) => {
    try {
        const { ethicalDilemma, bioethicsPrinciple, whatWasDone, yourPerspective, howToManage } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.clinicalExperiences.push({ ethicalDilemma, bioethicsPrinciple, whatWasDone, yourPerspective, howToManage });
        await user.save();

        res.status(201).json({
            message: 'Clinical experience added successfully',
            experience: user.clinicalExperiences[user.clinicalExperiences.length - 1]
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateClinicalExperience = async (req, res) => {
    try {
        const { id } = req.params;
        const { ethicalDilemma, bioethicsPrinciple, whatWasDone, yourPerspective, howToManage } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const experience = user.clinicalExperiences.id(id);
        if (!experience) return res.status(404).json({ message: 'Clinical experience not found' });

        if (ethicalDilemma) experience.ethicalDilemma = ethicalDilemma;
        if (bioethicsPrinciple) experience.bioethicsPrinciple = bioethicsPrinciple;
        if (whatWasDone) experience.whatWasDone = whatWasDone;
        if (yourPerspective) experience.yourPerspective = yourPerspective;
        if (howToManage) experience.howToManage = howToManage;

        if (experience.status === 'Rejected') {
            experience.status = 'Resubmitted';
        }

        await user.save();
        res.json({ message: 'Clinical experience updated successfully', experience });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteClinicalExperience = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const experience = user.clinicalExperiences.id(id);
        if (!experience) return res.status(404).json({ message: 'Clinical experience not found' });

        if (experience.status === 'Approved') {
            user.points = Math.max(0, (user.points || 0) - 1);
        }

        experience.deleteOne();
        await user.save();
        res.json({ message: 'Clinical experience deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Voluntary Participation CRUD
const addVoluntaryParticipation = async (req, res) => {
    try {
        const { nameOfOrganisation, yourRole, whatDidYouLearn, positiveInfluence } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.voluntaryParticipation.push({ nameOfOrganisation, yourRole, whatDidYouLearn, positiveInfluence });
        await user.save();

        res.status(201).json({
            message: 'Voluntary participation added successfully',
            participation: user.voluntaryParticipation[user.voluntaryParticipation.length - 1]
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateVoluntaryParticipation = async (req, res) => {
    try {
        const { id } = req.params;
        const { nameOfOrganisation, yourRole, whatDidYouLearn, positiveInfluence } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const participation = user.voluntaryParticipation.id(id);
        if (!participation) return res.status(404).json({ message: 'Voluntary participation not found' });

        if (nameOfOrganisation) participation.nameOfOrganisation = nameOfOrganisation;
        if (yourRole) participation.yourRole = yourRole;
        if (whatDidYouLearn) participation.whatDidYouLearn = whatDidYouLearn;
        if (positiveInfluence) participation.positiveInfluence = positiveInfluence;

        if (participation.status === 'Rejected') {
            participation.status = 'Resubmitted';
        }

        await user.save();
        res.json({ message: 'Voluntary participation updated successfully', participation });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteVoluntaryParticipation = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const participation = user.voluntaryParticipation.id(id);
        if (!participation) return res.status(404).json({ message: 'Voluntary participation not found' });

        if (participation.status === 'Approved') {
            user.points = Math.max(0, (user.points || 0) - 1);
        }

        participation.deleteOne();
        await user.save();
        res.json({ message: 'Voluntary participation deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Ethics Through Art CRUD
const addEthicsThroughArt = async (req, res) => {
    try {
        const { workAbout, whyThisTopic, howExpressed, whyThisFormat } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.ethicsThroughArt.push({ workAbout, whyThisTopic, howExpressed, whyThisFormat });
        await user.save();

        res.status(201).json({
            message: 'Ethics through art added successfully',
            art: user.ethicsThroughArt[user.ethicsThroughArt.length - 1]
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateEthicsThroughArt = async (req, res) => {
    try {
        const { id } = req.params;
        const { workAbout, whyThisTopic, howExpressed, whyThisFormat } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const art = user.ethicsThroughArt.id(id);
        if (!art) return res.status(404).json({ message: 'Ethics through art not found' });

        if (workAbout) art.workAbout = workAbout;
        if (whyThisTopic) art.whyThisTopic = whyThisTopic;
        if (howExpressed) art.howExpressed = howExpressed;
        if (whyThisFormat) art.whyThisFormat = whyThisFormat;

        if (art.status === 'Rejected') {
            art.status = 'Pending';
        }

        await user.save();
        res.json({ message: 'Ethics through art updated successfully', art });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteEthicsThroughArt = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const art = user.ethicsThroughArt.id(id);
        if (!art) return res.status(404).json({ message: 'Ethics through art not found' });

        if (art.status === 'Approved') {
            user.points = Math.max(0, (user.points || 0) - 1);
        }

        art.deleteOne();
        await user.save();
        res.json({ message: 'Ethics through art deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Thoughts to Actions CRUD
const addThinkingToAction = async (req, res) => {
    try {
        const { futurePlan } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.thoughtsToActions.push({ futurePlan });
        await user.save();

        res.status(201).json({
            message: 'Future plan added successfully',
            plan: user.thoughtsToActions[user.thoughtsToActions.length - 1]
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateThinkingToAction = async (req, res) => {
    try {
        const { id } = req.params;
        const { futurePlan } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const plan = user.thoughtsToActions.id(id);
        if (!plan) return res.status(404).json({ message: 'Plan not found' });

        if (futurePlan) plan.futurePlan = futurePlan;

        if (plan.status === 'Rejected') {
            plan.status = 'Pending';
        }

        await user.save();
        res.json({ message: 'Future plan updated successfully', plan });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteThinkingToAction = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const plan = user.thoughtsToActions.id(id);
        if (!plan) return res.status(404).json({ message: 'Plan not found' });

        if (plan.status === 'Approved') {
            user.points = Math.max(0, (user.points || 0) - 1);
        }

        plan.deleteOne();
        await user.save();
        res.json({ message: 'Future plan deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Discussion Forum Logic (Since it's separate from User profile, we might want a separate controller, 
// but for simplicity and since it's part of the student features, we can keep it here or create a new file.
// Ideally, this should be in discussionController.js, but let's check if we can add it here or if we should create a new one.
// Given the prompt "Implementing Thoughts to Actions and Feedback Sections", I'll create a new controller `discussionController.js` properly.
// But first, let's finish `profileController.js` with ThoughtsToActions.

module.exports = {
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
};
