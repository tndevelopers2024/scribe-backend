const nodemailer = require('nodemailer');

const sendCredentialsEmail = async (email, name, password, role) => {
    // Debug: Check what credentials the server is actually seeing
    console.log('--- Email Service Debug ---');
    console.log(`Sending to: ${email}`);
    console.log(`Using User: ${process.env.EMAIL_USER}`);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('⚠️ Missing EMAIL_USER or EMAIL_PASS environment variables.');
        logMockEmail(email, password);
        return { success: false, error: 'Missing EMAIL_USER or EMAIL_PASS environment variables' };
    }

    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            connectionTimeout: 10000, // 10 seconds
            greetingTimeout: 10000,
            socketTimeout: 10000
        });

        // Verify connection before sending
        console.log('🔄 Verifying SMTP connection...');
        await transporter.verify();
        console.log('✅ SMTP connection verified');

        const mailOptions = {
            from: process.env.EMAIL_USER, // Simplified to exactly match test-email.js
            to: email,
            subject: 'Welcome - Your Account Credentials',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #962B8F; text-align: center;">Welcome to the System</h2>
                    <p>Hello <strong>${name}</strong>,</p>
                    <p>You have been registered as a <strong>${role}</strong>.</p>
                    <p>Here are your temporary login credentials:</p>
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                        <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
                    </div>
                    <p>Please login and change your password immediately.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #888; text-align: center;">This is an automated email. Please do not reply.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully to ${email}`);
        return { success: true };

    } catch (error) {
        console.error('❌ Error sending email:', error.message);
        if (error.response) console.error('SMTP Response:', error.response);

        logMockEmail(email, password);
        return { success: false, error: error.message };
    }
};

const logMockEmail = (email, password) => {
    console.log('\n================ MOCK EMAIL (COPY THIS) ================');
    console.log(`To: ${email}`);
    console.log(`Password: ${password}`);
    console.log('========================================================\n');
};

module.exports = { sendCredentialsEmail };
