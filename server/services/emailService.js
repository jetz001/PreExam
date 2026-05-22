const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // or configured host/port
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

const sendResetEmail = async (to, token) => {
    // Determine base URL (could be from env or hardcoded/request based)
    // Assuming standard dev/prod URLs.
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    const mailOptions = {
        from: `"PreExam Support" <${process.env.MAIL_USER}>`,
        to: to,
        subject: 'Password Reset Request',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4F46E5;">Password Reset</h2>
                <p>You requested a password reset for your PreExam account.</p>
                <p>Click the button below to reset your password. This link is valid for 1 hour.</p>
                <a href="${resetLink}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0;">Reset Password</a>
                <p style="color: #6B7280; font-size: 14px;">If you didn't ask for this, please ignore this email.</p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

module.exports = {
    sendResetEmail
};
