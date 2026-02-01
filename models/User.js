const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['Super Admin', 'Lead Faculty', 'Faculty', 'Student'],
        required: true
    },
    college: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'College'
    },
    assignedBy: { // The higher-up who created this user
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    leadFaculty: { // For role 'Faculty' -> assigned to which Lead Faculty
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    faculty: { // For role 'Student' -> assigned to which Faculty
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    profile: {
        firstName: { type: String },
        middleName: { type: String },
        lastName: { type: String },
        dateOfBirth: { type: Date },
        sex: {
            type: String,
            enum: ['Male', 'Female', 'Other', '']
        },
        phoneNumber: { type: String },
        fieldOfStudy: {
            type: String,
            enum: ['Medical', 'Nursing', 'Allied Health', 'Dentistry', 'Other Health Profession', '']
        },
        levelOfEducation: {
            type: String,
            enum: ['UG', 'PG', '']
        },
        yearOfStudy: { type: String },
        institution: { type: String },
        country: { type: String },
        about: { type: String },
        vision: { type: String },
        profilePicture: { type: String },
        status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Resubmitted'], default: 'Pending' },
        feedback: { type: String },
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reviewedAt: { type: Date }
    },
    academicAchievements: [{
        courseName: { type: String, required: true },
        offeredBy: { type: String, required: true },
        modeOfStudy: {
            type: String,
            enum: ['Online', 'Offline', 'Hybrid', ''],
            required: true
        },
        duration: { type: String },
        currentStatus: {
            type: String,
            enum: ['Completed', 'In Progress', 'Planned', ''],
            required: true
        },
        status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Resubmitted'], default: 'Pending' },
        feedback: { type: String },
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reviewedAt: { type: Date },
        createdAt: { type: Date, default: Date.now }
    }],
    courseReflections: [{
        year: { type: String, required: true },
        date: { type: Date, required: true },
        topicOfSession: { type: String, required: true },
        rating: { type: Number, min: 1, max: 5, required: true },
        whatWasGood: { type: String, required: true },
        whatCanBe: { type: String, required: true },
        whatDidILearn: { type: String, required: true },
        status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Resubmitted'], default: 'Pending' },
        feedback: { type: String },
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reviewedAt: { type: Date },
        createdAt: { type: Date, default: Date.now }
    }],
    beTheChange: [{
        year: { type: String, required: true },
        reflectOnImpact: { type: String, required: true },
        status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Resubmitted'], default: 'Pending' },
        feedback: { type: String },
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reviewedAt: { type: Date },
        createdAt: { type: Date, default: Date.now }
    }],
    researchPublications: [{
        projectTitle: { type: String, required: true },
        typeOfArticle: { type: String, required: true },
        authors: { type: String, required: true },
        journal: { type: String, required: true },
        doi: { type: String },
        citation: { type: String },
        impactFactor: { type: String },
        status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Resubmitted'], default: 'Pending' },
        feedback: { type: String },
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reviewedAt: { type: Date },
        createdAt: { type: Date, default: Date.now }
    }],
    interdisciplinaryCollaboration: [{
        projectTitle: { type: String, required: true },
        topic: { type: String, required: true },
        disciplinesInvolved: { type: String, required: true },
        anticipatedDuration: { type: String, required: true },
        significance: { type: String, required: true },
        teamExperience: { type: String, required: true },
        whatWentWell: { type: String, required: true },
        whatCanBeImproved: { type: String, required: true },
        status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Resubmitted'], default: 'Pending' },
        feedback: { type: String },
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reviewedAt: { type: Date },
        createdAt: { type: Date, default: Date.now }
    }],
    conferenceParticipation: [{
        conferenceName: { type: String, required: true },
        attendeePresenter: { type: String, required: true },
        summaryOfWork: { type: String, required: true },
        dateOfConference: { type: Date, required: true },
        venue: { type: String, required: true },
        nationalInternational: { type: String, required: true },
        mode: { type: String, required: true },
        status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Resubmitted'], default: 'Pending' },
        feedback: { type: String },
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reviewedAt: { type: Date },
        createdAt: { type: Date, default: Date.now }
    }],
    competitionsAwards: [{
        competition: { type: String, required: true },
        venue: { type: String, required: true },
        date: { type: Date, required: true },
        mode: { type: String, required: true },
        summaryOfWork: { type: String, required: true },
        awardsReceived: { type: String, required: true },
        status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Resubmitted'], default: 'Pending' },
        feedback: { type: String },
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reviewedAt: { type: Date },
        createdAt: { type: Date, default: Date.now }
    }],
    workshopsTraining: [{
        nameOfWorkshop: { type: String, required: true },
        conductedBy: { type: String, required: true },
        mode: { type: String, required: true },
        skillsAcquired: { type: String, required: true },
        status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Resubmitted'], default: 'Pending' },
        feedback: { type: String },
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reviewedAt: { type: Date },
        createdAt: { type: Date, default: Date.now }
    }],
    clinicalExperiences: [{
        ethicalDilemma: { type: String, required: true },
        bioethicsPrinciple: { type: String, required: true },
        whatWasDone: { type: String, required: true },
        yourPerspective: { type: String, required: true },
        howToManage: { type: String, required: true },
        status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Resubmitted'], default: 'Pending' },
        feedback: { type: String },
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reviewedAt: { type: Date },
        createdAt: { type: Date, default: Date.now }
    }],
    voluntaryParticipation: [{
        nameOfOrganisation: { type: String, required: true },
        yourRole: { type: String, required: true },
        whatDidYouLearn: { type: String, required: true },
        positiveInfluence: { type: String, required: true },
        status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Resubmitted'], default: 'Pending' },
        feedback: { type: String },
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reviewedAt: { type: Date },
        createdAt: { type: Date, default: Date.now }
    }],
    ethicsThroughArt: [{
        workAbout: { type: String, required: true },
        whyThisTopic: { type: String, required: true },
        howExpressed: { type: String, required: true },
        whyThisFormat: { type: String, required: true },
        status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Resubmitted'], default: 'Pending' },
        feedback: { type: String },
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reviewedAt: { type: Date },
        createdAt: { type: Date, default: Date.now }
    }],
    thoughtsToActions: [{
        futurePlan: { type: String, required: true },
        targetDate: { type: Date },
        status: { type: String, enum: ['Pending', 'In Progress', 'Achieved', 'Approved', 'Rejected'], default: 'Pending' },
        feedback: { type: String },
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reviewedAt: { type: Date },
        createdAt: { type: Date, default: Date.now }
    }],
    isFirstLogin: {
        type: Boolean,
        default: true
    },
    people: {
        type: Number,
        default: 0
    },
    points: {
        type: Number,
        default: 0
    },
    resetPasswordOtp: String,
    resetPasswordOtpExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Encrypt password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password OTP
userSchema.methods.getResetPasswordOtp = function () {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash token and set to resetPasswordOtp field
    this.resetPasswordOtp = crypto
        .createHash('sha256')
        .update(otp)
        .digest('hex');

    // Set expire (10 minutes)
    this.resetPasswordOtpExpire = Date.now() + 10 * 60 * 1000;

    return otp;
};

module.exports = mongoose.model('User', userSchema);
