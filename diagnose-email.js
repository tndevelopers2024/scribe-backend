require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('='.repeat(60));
console.log('EMAIL DIAGNOSTIC TOOL');
console.log('='.repeat(60));

// Step 1: Check environment variables
console.log('\n[1] Checking Environment Variables...');
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

if (!emailUser || !emailPass) {
    console.error('❌ ERROR: EMAIL_USER or EMAIL_PASS not found in .env');
    process.exit(1);
}

console.log(`✅ EMAIL_USER: ${emailUser}`);
console.log(`✅ EMAIL_PASS: ${'*'.repeat(emailPass.length)} (${emailPass.length} chars)`);

// Step 2: Create transporter
console.log('\n[2] Creating SMTP Transporter...');
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: emailUser,
        pass: emailPass
    },
    debug: true, // Enable debug output
    logger: true // Log to console
});

// Step 3: Verify connection
console.log('\n[3] Verifying SMTP Connection...');
transporter.verify()
    .then(() => {
        console.log('✅ SMTP Connection Successful!');

        // Step 4: Send test email
        console.log('\n[4] Sending Test Email...');
        return transporter.sendMail({
            from: emailUser,
            to: emailUser, // Send to self
            subject: `Test Email - ${new Date().toLocaleString()}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 2px solid #962B8F; border-radius: 10px;">
                    <h2 style="color: #962B8F;">✅ Email Service is Working!</h2>
                    <p>This test email was sent at: <strong>${new Date().toLocaleString()}</strong></p>
                    <p>If you received this email, your email service is configured correctly.</p>
                    <hr>
                    <p style="font-size: 12px; color: #888;">
                        <strong>Note:</strong> Check your Spam/Junk folder if you don't see this in your inbox.
                    </p>
                </div>
            `
        });
    })
    .then((info) => {
        console.log('✅ Email Sent Successfully!');
        console.log(`   Message ID: ${info.messageId}`);
        console.log(`   Response: ${info.response}`);
        console.log('\n' + '='.repeat(60));
        console.log('SUCCESS! Check your inbox (or spam folder) for the test email.');
        console.log('='.repeat(60));
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ ERROR OCCURRED:');
        console.error('   Error Type:', error.name);
        console.error('   Error Message:', error.message);

        if (error.code) {
            console.error('   Error Code:', error.code);
        }

        if (error.response) {
            console.error('   SMTP Response:', error.response);
        }

        console.log('\n' + '='.repeat(60));
        console.log('COMMON SOLUTIONS:');
        console.log('='.repeat(60));
        console.log('1. Invalid credentials: Verify EMAIL_PASS is a valid App Password');
        console.log('2. 2-Step Verification: Enable it in Google Account settings');
        console.log('3. App Password: Generate a new one at myaccount.google.com/apppasswords');
        console.log('4. Less Secure Apps: This is deprecated, use App Passwords instead');
        console.log('5. Network: Check firewall/antivirus blocking port 465');
        console.log('='.repeat(60));

        process.exit(1);
    });
