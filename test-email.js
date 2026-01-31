require('dotenv').config();
const nodemailer = require('nodemailer');

const testEmail = async () => {
    console.log('--- Starting Email Test ---');
    console.log(`User: ${process.env.EMAIL_USER}`);
    // Show first and last 2 chars of password for verification without revealing it
    const pass = process.env.EMAIL_PASS || '';
    const maskedPass = pass.length > 4 ? `${pass.substring(0, 2)}...${pass.substring(pass.length - 2)}` : '****';
    console.log(`Pass: ${maskedPass} (Length: ${pass.length})`);

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        console.log('Verifying connection...');
        await transporter.verify();
        console.log('✅ Connection verification successful!');

        console.log('Attempting to send mail...');
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to self
            subject: 'Test Email from CMS',
            text: 'If you see this, the email service is working!'
        });
        console.log(`✅ Email sent: ${info.messageId}`);
    } catch (error) {
        console.error('❌ Error occurred:');
        console.error(error);
    }
};

testEmail();
