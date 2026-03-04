const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const profileRoutes = require('./routes/profileRoutes');
const seminarRoutes = require('./routes/seminarRoutes');
const driscollReflectionRoutes = require('./routes/driscollReflectionRoutes');

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(express.json());

// CORS Configuration
const corsOptions = {
    origin: function (origin, callback) {
        // If the server (CyberPanel/LiteSpeed) is already adding CORS headers,
        // you can set DISABLE_CORS=true in your .env to stop Express from adding them.
        if (process.env.DISABLE_CORS === 'true') {
            return callback(null, false);
        }

        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:3000',
            'https://bioethics-eportfolio.com',
            'https://www.bioethics-eportfolio.com',
            'https://scribe-eportfolio.online',
            'https://www.scribe-eportfolio.online',
            'https://scribe-frontend.vercel.app'
        ];

        // Allow server-to-server / curl / mobile
        if (!origin) return callback(null, true);

        // Handle multiple origins (comma-separated, sometimes added by proxies)
        const origins = origin.split(',').map(o => o.trim());

        // Find the first origin that is allowed
        let matchedOrigin = null;

        for (const org of origins) {
            const normalizedOrigin = org.replace(/\/$/, '');

            const isAllowed = allowedOrigins.some(allowedOrigin => {
                if (allowedOrigin.includes('*')) {
                    const pattern = new RegExp('^' + allowedOrigin.replace(/\*/g, '.*') + '$');
                    return pattern.test(normalizedOrigin);
                }
                return allowedOrigin === normalizedOrigin;
            }) || normalizedOrigin.endsWith('.vercel.app');

            if (isAllowed) {
                matchedOrigin = org; // Keep the original format (with/without slash) but only one
                break;
            }
        }

        if (matchedOrigin) {
            callback(null, matchedOrigin);
        } else {
            console.log('❌ CORS blocked origin(s):', origin);
            callback(null, false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.log(err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/discussions', require('./routes/discussionRoutes'));
app.use('/api/faculty', require('./routes/facultyRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/seminars', seminarRoutes);
app.use('/api/reflections/driscoll', driscollReflectionRoutes);

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
