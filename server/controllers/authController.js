const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { logActivity } = require('../utils/activityLogger');

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '7d' }
    );
};

exports.register = async (req, res) => {
    try {
        const { email, password, display_name, role, business_name, tax_id } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Validate Role (Only allow 'user' or 'sponsor' from public registration)
        const safeRole = (role === 'sponsor') ? 'sponsor' : 'user';

        // Create user
        const locationData = getLocationFromRequest(req); // Capture location
        const user = await User.create({
            email,
            password_hash,
            display_name,
            role: safeRole,
            business_name: safeRole === 'sponsor' ? business_name : null,
            tax_id: safeRole === 'sponsor' ? tax_id : null,
            ...locationData // Save location
        });

        const token = generateToken(user);

        // Auto-create Business for Sponsors
        if (safeRole === 'sponsor') {
            const { Business } = require('../models');
            await Business.create({
                owner_uid: user.id,
                name: business_name || `${display_name}'s Business`,
                category: 'General', // Default category
                status: 'pending'
            });
        }

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                display_name: user.display_name,
                role: user.role,
                public_id: user.public_id,
            },
        });

        // Log Activity
        logActivity('BTN_REGISTER', { email, role: safeRole }, user.id);


    } catch (error) {
        console.error('Register Error:', error);
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                message: error.errors ? error.errors.map(e => e.message).join(', ') : 'Validation error'
            });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const locationData = getLocationFromRequest(req); // Capture location

        // Check user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Email not found' });
        }

        // Check password
        if (!user.password_hash) {
            return res.status(400).json({ success: false, message: 'Please login with Google' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Incorrect password' });
        }

        // Update location on successful login
        await user.update(locationData);

        // Log Activity
        logActivity('BTN_LOGIN_NORMAL', { email }, user.id);

        const token = generateToken(user);

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                display_name: user.display_name,
                role: user.role,
                public_id: user.public_id,
                plan_type: user.plan_type,
            },
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
    try {
        const { token } = req.body;
        const locationData = getLocationFromRequest(req); // Capture location

        console.log('Google Login Attempt with token:', token ? token.substring(0, 20) + '...' : 'No Token');
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const { email, name, sub: googleId, picture } = ticket.getPayload();

        let user = await User.findOne({ where: { google_id: googleId } });

        if (!user) {
            // Check if email exists
            user = await User.findOne({ where: { email } });
            if (user) {
                // Link Google ID to existing user
                user.google_id = googleId;
                if (picture) user.avatar = picture; // Update avatar if linking
                await user.update({ ...locationData }); // Update location
            } else {
                // Create new user
                user = await User.create({
                    email,
                    display_name: name,
                    google_id: googleId,
                    avatar: picture, // Save avatar
                    role: 'user',
                    password_hash: null, // No password for social login
                    ...locationData // Save location
                });
            }
        } else {
            // Update existing user's avatar and location if they log in again
            const updates = { ...locationData };
            if (picture && user.avatar !== picture) {
                updates.avatar = picture;
            }
            await user.update(updates);
        }

        const jwtToken = generateToken(user);

        // Log Activity
        logActivity('BTN_LOGIN_GOOGLE', { email }, user.id);

        res.json({
            success: true,
            token: jwtToken,
            user: {
                id: user.id,
                email: user.email,
                display_name: user.display_name,
                role: user.role,
                public_id: user.public_id,
                plan_type: user.plan_type,
            },
        });
    } catch (error) {
        console.error('Google Login Error:', error);
        res.status(400).json({ success: false, message: 'Google login failed' });
    }
};

// Helper to get location
const getLocationFromRequest = (req) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
    const geo = geoip.lookup(ip);
    return geo ? {
        ip_address: ip,
        country: geo.country,
        region: geo.region,
        city: geo.city
    } : { ip_address: ip };
};

exports.facebookLogin = async (req, res) => {
    try {
        const { accessToken, userID } = req.body;
        const locationData = getLocationFromRequest(req); // Capture location

        // Verify token with Facebook
        const url = `https://graph.facebook.com/v19.0/me?access_token=${accessToken}&fields=id,name,email,picture.type(large)`;
        const { data } = await axios.get(url);

        if (data.id !== userID) {
            return res.status(400).json({ success: false, message: 'Invalid Facebook token' });
        }

        const { email, name, id: facebookId, picture } = data;
        const avatarUrl = picture?.data?.url;

        let user = await User.findOne({ where: { facebook_id: facebookId } });

        if (!user) {
            // Check if email exists (if email is provided by FB)
            if (email) {
                user = await User.findOne({ where: { email } });
                if (user) {
                    user.facebook_id = facebookId;
                    if (avatarUrl) user.avatar = avatarUrl; // Update avatar if linking
                    await user.update({ ...locationData }); // Update location
                    // await user.save(); // Removed redundant save
                }
            }

            if (!user) {
                // Create new user
                user = await User.create({
                    email: email || `${facebookId}@facebook.com`, // Fallback email
                    display_name: name,
                    facebook_id: facebookId,
                    avatar: avatarUrl, // Save avatar
                    role: 'user',
                    password_hash: null,
                    ...locationData // Save location
                });
            }
        } else {
            // Update existing user's avatar and location if they log in again
            const updates = { ...locationData };
            if (avatarUrl && user.avatar !== avatarUrl) {
                updates.avatar = avatarUrl;
            }
            await user.update(updates);
        }

        const jwtToken = generateToken(user);

        // Log Activity
        logActivity('BTN_LOGIN_FACEBOOK', { email }, user.id);

        res.json({
            success: true,
            token: jwtToken,
            user: {
                id: user.id,
                email: user.email,
                display_name: user.display_name,
                role: user.role,
                public_id: user.public_id,
                plan_type: user.plan_type,
            },
        });
    } catch (error) {
        console.error('Facebook Login Error:', error);
        res.status(400).json({ success: false, message: 'Facebook login failed' });
    }
};

const geoip = require('geoip-lite'); // Import for IP Geolocation

exports.guestLogin = async (req, res) => {
    try {
        const { deviceId } = req.body;

        if (!deviceId) {
            return res.status(400).json({ success: false, message: 'Device ID required' });
        }

        const email = `guest_${deviceId}@preexam.com`;

        // Get IP from request (handle proxy if behind Nginx/Cloudflare)
        // รับค่า IP จาก Header หรือ Connection
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;

        // Lookup location from IP
        // ค้นหาตำแหน่งจาก IP
        const geo = geoip.lookup(ip); // Returns object or null
        const locationData = geo ? {
            ip_address: ip,
            country: geo.country, // e.g. 'TH'
            region: geo.region,   // e.g. '10' (Bangkok)
            city: geo.city        // e.g. 'Bangkok'
        } : { ip_address: ip };

        // Robust Find or Create Logic
        let user = await User.findOne({ where: { email } });

        if (!user) {
            // Create new guest user with safe display name
            // Create new guest user with safe display name
            // Use last 5 chars of deviceId + 3 random digits to ensure uniqueness/randomness
            const shortId = deviceId.slice(-5) + Math.floor(100 + Math.random() * 900);
            user = await User.create({
                email,
                display_name: `Guest-${shortId}`,
                role: 'user',
                password_hash: null,
                plan_type: 'free',
                ...locationData // Save location data (บันทึกข้อมูลตำแหน่ง)
            });
        } else {
            // Update location for returning guest (อัปเดตตำแหน่งถ้ากลับมาใช้งานใหม่)
            await user.update(locationData);
        }

        const token = generateToken(user);

        // Log Activity
        logActivity('BTN_LOGIN_GUEST', { deviceId }, user.id);

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                display_name: user.display_name,
                role: user.role,
                public_id: user.public_id,
                plan_type: user.plan_type,
            },
        });
    } catch (error) {
        console.error('Guest Login Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password_hash'] }
        });
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
const crypto = require('crypto');
const { sendResetEmail } = require('../services/emailService');
const { Op } = require('sequelize'); // Ensure Op is imported if not already, or use Sequelize.Op

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            // Security: Don't reveal if user exists BUT for this use case we might want to be helpful or standard.
            // Standard: "If an account exists..."
            return res.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
        }

        // Generate Token
        // 20 bytes hex string
        const token = crypto.randomBytes(20).toString('hex');

        // Expiry: 1 hour from now
        // SQLite stores dates as numbers or strings depending on config. User model defined as DATE.
        // Sequelize usually handles Date objects -> timestamp/ISO string.
        const expires = Date.now() + 3600000;

        user.reset_password_token = token;
        user.reset_password_expires = expires;
        await user.save();

        // Send Email
        const emailSent = await sendResetEmail(user.email, token);

        if (emailSent) {
            res.json({ success: true, message: 'Reset link sent to your email.' });
        } else {
            console.error('Failed to send email to', user.email);
            // Rollback token? Not strictly necessary but clean.
            res.status(500).json({ success: false, message: 'Failed to send email service.' });
        }

    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        const user = await User.findOne({
            where: {
                reset_password_token: token,
                reset_password_expires: { [Op.gt]: Date.now() } // Expires > Now
            }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Password reset token is invalid or has expired.' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(newPassword, salt);

        // Clear token
        user.reset_password_token = null;
        user.reset_password_expires = null;

        await user.save();

        res.json({ success: true, message: 'Password has been reset successfully.' });

    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
