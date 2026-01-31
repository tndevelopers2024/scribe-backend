const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedSuperAdmin = async () => {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/college-cms');

        const exists = await User.findOne({ email: 'superadmin@scribe.com' });
        if (exists) {
            console.log('Super Admin already exists');
            process.exit();
        }

        const user = new User({
            name: 'Super Admin',
            email: 'superadmin@scribe.com',
            password: 'password123',
            role: 'Super Admin'
        });

        await user.save();
        console.log('Super Admin Created');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedSuperAdmin();
