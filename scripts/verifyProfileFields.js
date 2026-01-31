const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const verifyProfileFields = async () => {
    await connectDB();

    try {
        // Create a dummy profile
        const newProfile = {
            firstName: 'Test',
            lastName: 'Student',
            about: 'This is a test about section.',
            vision: 'This is a test vision section.'
        };

        // Find a student
        let student = await User.findOne({ role: 'Student' });
        if (!student) {
            console.log('No student found to test.');
            process.exit();
        }

        console.log(`Testing with student: ${student.name}`);

        // Update profile
        student.profile = { ...student.profile, ...newProfile };
        await student.save();
        console.log('Updated student profile with about/vision.');

        // Fetch again as if we are faculty (mimic controller query)
        const fetchedStudent = await User.findById(student._id).select('-password');

        console.log('Fetched Student Profile:', fetchedStudent.profile);

        if (fetchedStudent.profile.about === newProfile.about && fetchedStudent.profile.vision === newProfile.vision) {
            console.log('SUCCESS: Fields are present and correct.');
        } else {
            console.log('FAILURE: Fields are missing or incorrect.');
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

verifyProfileFields();
