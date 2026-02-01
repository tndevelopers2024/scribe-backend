const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendPasswordResetOTP } = require('../utils/emailService');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isFirstLogin: user.isFirstLogin,
                college: user.college,
                points: user.points || 0,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user._id);

        if (user && (await user.matchPassword(currentPassword))) {
            user.password = newPassword; // Will be hashed by pre-save hook
            user.isFirstLogin = false;
            await user.save();
            res.json({ message: 'Password updated successfully' });
        } else {
            res.status(400).json({ message: 'Invalid current password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'There is no user with that email' });
        }

        // Get reset OTP
        const otp = user.getResetPasswordOtp();

        await user.save({ validateBeforeSave: false });

        try {
            await sendPasswordResetOTP(user.email, user.name, otp);
            res.status(200).json({ message: 'OTP sent to email' });
        } catch (error) {
            user.resetPasswordOtp = undefined;
            user.resetPasswordOtpExpire = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    const { email, otp, password } = req.body;

    // Get hashed OTP
    const resetPasswordOtp = crypto
        .createHash('sha256')
        .update(otp)
        .digest('hex');

    try {
        const user = await User.findOne({
            email,
            resetPasswordOtp,
            resetPasswordOtpExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Set new password
        user.password = password;
        user.resetPasswordOtp = undefined;
        user.resetPasswordOtpExpire = undefined;
        user.isFirstLogin = false;
        await user.save();

        res.status(200).json({
            message: 'Password reset successful',
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { loginUser, changePassword, forgotPassword, resetPassword };
