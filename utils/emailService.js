require('dotenv').config();
const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 465,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

const path = require('path');

/**
 * Send credentials email to newly created users
 * @param {string} email - Recipient email address
 * @param {string} name - Recipient name
 * @param {string} password - Generated password
 * @param {string} role - User role (Lead Faculty, Faculty, Student)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
const sendCredentialsEmail = async (email, name, password, role) => {
    try {
        console.log(`📧 Preparing to send credentials email to ${email}...`);

        // Validate environment variables
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error('❌ EMAIL_USER or EMAIL_PASS not configured in .env');
            return {
                success: false,
                error: 'Email service not configured'
            };
        }

        const transporter = createTransporter();

        // Verify connection before sending
        console.log('🔍 Verifying SMTP connection...');
        await transporter.verify();
        console.log('✅ SMTP connection verified');

        const mailOptions = {
            from: `"SCRIBE" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Welcome to SCRIBE - Your ${role} Account`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e1e1e1; border-radius: 15px; background-color: #ffffff; color: #333;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <img src="cid:logo" alt="Scribe Logo" style="max-width: 220px; height: auto;">
                    </div>
                    
                    <h2 style="color: #962B8F; text-align: center; margin-bottom: 25px;">Welcome to SCRIBE</h2>
                    
                    <p style="font-size: 16px; line-height: 1.6;">Dear <strong>${name}</strong>,</p>
                    
                    <p style="font-size: 16px; line-height: 1.6;">Your account has been successfully created with the role of <strong>${role}</strong> on our platform.</p>
                    
                    <div style="background-color: #f9f9f9; padding: 25px; border-radius: 12px; margin: 30px 0; border: 1px solid #eee;">
                        <h3 style="margin-top: 0; color: #444; font-size: 18px; border-bottom: 2px solid #962B8F; padding-bottom: 10px; display: inline-block;">Your Login Credentials</h3>
                        <p style="margin: 15px 0; font-size: 15px;"><strong>Email:</strong> <span style="color: #555;">${email}</span></p>
                        <p style="margin: 15px 0; font-size: 15px;"><strong>Password:</strong> <code style="background-color: #f1f1f1; padding: 6px 12px; border-radius: 6px; font-size: 17px; color: #962B8F; font-weight: bold; font-family: monospace;">${password}</code></p>
                    </div>
                    
                    <div style="background-color: #fff9f9; padding: 15px; border-radius: 8px; border-left: 4px solid #d9534f; margin-bottom: 30px;">
                        <p style="color: #d9534f; margin: 0; font-size: 14px;"><strong>⚠️ Important:</strong> Please ensure you change your password immediately after your first login for security purposes.</p>
                    </div>
                    
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="background-color: #962B8F; color: #ffffff; padding: 14px 35px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 4px 10px rgba(150, 43, 143, 0.2);">Login to SCRIBE</a>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 30px 0;">
                    
                    <p style="font-size: 12px; color: #999; text-align: center; line-height: 1.5;">
                        This is an automated system message. Please do not reply directly to this email.<br>
                        &copy; ${new Date().getFullYear()} SCRIBE. All rights reserved.
                    </p>
                </div>
            `,
            attachments: [{
                filename: 'logo.png',
                path: path.join(__dirname, '../assets/logo.png'),
                cid: 'logo'
            }]
        };

        console.log('📤 Sending email...');
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully! Message ID: ${info.messageId}`);

        return {
            success: true,
            messageId: info.messageId
        };

    } catch (error) {
        console.error('❌ Error sending email:', error.message);
        console.error('Error details:', error);

        return {
            success: false,
            error: error.message
        };
    }
};

const sendPasswordResetOTP = async (email, name, otp) => {
    try {
        console.log(`📧 Preparing to send password reset OTP to ${email}...`);

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error('❌ EMAIL_USER or EMAIL_PASS not configured in .env');
            return {
                success: false,
                error: 'Email service not configured'
            };
        }

        const transporter = createTransporter();
        const mailOptions = {
            from: `"SCRIBE Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset Code - SCRIBE',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e1e1e1; border-radius: 15px; background-color: #ffffff; color: #333;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <img src="cid:logo" alt="Scribe Logo" style="max-width: 220px; height: auto;">
                    </div>
                    
                    <h2 style="color: #962B8F; text-align: center; margin-bottom: 25px;">Password Reset Code</h2>
                    
                    <p style="font-size: 16px; line-height: 1.6;">Dear <strong>${name}</strong>,</p>
                    
                    <p style="font-size: 16px; line-height: 1.6;">You have requested to reset your password. Use the code below to complete the process. This code will expire in 10 minutes.</p>
                    
                    <div style="text-align: center; margin: 35px 0;">
                        <div style="background-color: #f3e5f5; color: #962B8F; display: inline-block; padding: 15px 30px; font-size: 32px; letter-spacing: 5px; font-weight: bold; border-radius: 10px; border: 2px dashed #962B8F;">
                            ${otp}
                        </div>
                    </div>
                    
                    <p style="font-size: 14px; color: #777; line-height: 1.6;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
                    
                    <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 30px 0;">
                    
                    <p style="font-size: 12px; color: #999; text-align: center; line-height: 1.5;">
                        This is an automated system message. Please do not reply directly to this email.<br>
                        &copy; ${new Date().getFullYear()} SCRIBE. All rights reserved.
                    </p>
                </div>
            `,
            attachments: [{
                filename: 'logo.png',
                path: path.join(__dirname, '../assets/logo.png'),
                cid: 'logo'
            }]
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Password reset OTP sent! Message ID: ${info.messageId}`);

        return {
            success: true,
            messageId: info.messageId
        };
    } catch (error) {
        console.error('❌ Error sending reset OTP:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
};

module.exports = {
    sendCredentialsEmail,
    sendPasswordResetOTP
};
