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

const simulateReview = async () => {
    await connectDB();

    try {
        // Find a student
        const student = await User.findOne({ role: 'Student' });
        if (!student) {
            console.log('No student found');
            process.exit();
        }

        console.log(`Testing with student: ${student.name}`);
        console.log(`Initial Points: ${student.points}`);

        // Add a dummy achievement
        student.academicAchievements.push({
            courseName: 'Test Course 101',
            offeredBy: 'Test Org',
            modeOfStudy: 'Online',
            currentStatus: 'Completed',
            status: 'Pending'
        });
        await student.save();
        console.log('Added dummy Pending achievement.');

        // Get the item ID
        const newItem = student.academicAchievements[student.academicAchievements.length - 1];
        const itemId = newItem._id;

        // MIMIC CONTROLLER LOGIC
        const section = 'academicAchievements';
        const status = 'Approved';

        // Refetch student to simulate fresh request
        const freshStudent = await User.findById(student._id);
        const item = freshStudent[section].id(itemId);
        const oldStatus = item.status;

        console.log(`[SIMULATION] OldStatus: ${oldStatus}, NewStatus: ${status}`);

        item.status = status;

        if (status === 'Approved' && oldStatus !== 'Approved') {
            freshStudent.points = (freshStudent.points || 0) + 1;
            console.log(`[SIMULATION] Point Added. New Total: ${freshStudent.points}`);
        } else if (status !== 'Approved' && oldStatus === 'Approved') {
            freshStudent.points = Math.max(0, (freshStudent.points || 0) - 1);
        }

        await freshStudent.save();
        console.log(`Final Points in DB: ${freshStudent.points}`);

        // Clean up
        freshStudent.academicAchievements.pull(itemId);
        // Remove the point we just added to revert state
        freshStudent.points = (freshStudent.points || 0) - 1;
        await freshStudent.save();
        console.log('Cleaned up test data.');

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

simulateReview();
