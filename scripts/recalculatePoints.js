const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
require('../models/DriscollReflection');

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

const recalculatePoints = async () => {
    await connectDB();

    try {
        const students = await User.find({ role: 'Student' })
            .populate('driscollReflections');
        console.log(`Found ${students.length} students. Recalculating points...`);

        for (const student of students) {
            let totalPoints = 0;

            // Check Profile
            if (student.profile && student.profile.status?.toLowerCase() === 'approved') {
                totalPoints++;
            }

            // Check Array Sections
            const sections = [
                'academicAchievements',
                'courseReflections',
                'beTheChange',
                'researchPublications',
                'interdisciplinaryCollaboration',
                'conferenceParticipation',
                'competitionsAwards',
                'workshopsTraining',
                'clinicalExperiences',
                'voluntaryParticipation',
                'ethicsThroughArt',
                'thoughtsToActions',
                'driscollReflections'
            ];

            sections.forEach(section => {
                const items = student[section];
                if (items && Array.isArray(items)) {
                    const approvedItems = items.filter(item => item.status?.toLowerCase() === 'approved');
                    totalPoints += approvedItems.length;
                }
            });

            // Update points if different
            if (student.points !== totalPoints) {
                console.log(`Updating ${student.name}: ${student.points || 0} -> ${totalPoints}`);
                student.points = totalPoints;
                await student.save();
            } else {
                console.log(`No change for ${student.name}: ${totalPoints} points`);
            }
        }

        console.log('Point recalculation complete.');
        process.exit();
    } catch (error) {
        console.error('Error recalculating points:', error);
        process.exit(1);
    }
};

recalculatePoints();
