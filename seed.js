const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const College = require('./models/College');

dotenv.config();

const seedDatabase = async () => {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/college-cms');

        // Seed Super Admin
        const exists = await User.findOne({ email: 'superadmin@scribe.com' });
        if (exists) {
            console.log('Super Admin already exists');
        } else {
            const user = new User({
                name: 'Super Admin',
                email: 'superadmin@scribe.com',
                password: 'password123',
                role: 'Super Admin'
            });
            await user.save();
            console.log('Super Admin Created');
        }

        // Seed Colleges
        const colleges = [
            "Sri shanmuga college of Nurisng",
            "KARPAGA VINAYAGA INSTITUTE OF MEDICAL SCIENCES AND RESEARCH CENTRE",
            "KARPAGA VINAYAGA COLLEGE OF NURSING",
            "Panimalar medical college",
            "Panimalar college of nursing",
            "Karpaga Vinayaga Dental college",
            "SRM MCH &RC"
        ];

        for (const collegeName of colleges) {
            const collegeExists = await College.findOne({ name: collegeName });
            if (!collegeExists) {
                await new College({
                    name: collegeName,
                    location: 'Chennai'
                }).save();
                console.log(`College Created: ${collegeName}`);
            } else {
                console.log(`College already exists: ${collegeName}`);
            }
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedDatabase();
