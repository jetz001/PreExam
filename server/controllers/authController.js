const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

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
        const user = await User.create({
            email,
            password_hash,
            display_name,
            role: safeRole,
            business_name: safeRole === 'sponsor' ? business_name : null,
            tax_id: safeRole === 'sponsor' ? tax_id : null,
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

        // Check user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        // Check password
        if (!user.password_hash) {
            return res.status(400).json({ success: false, message: 'Please login with Google' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

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
        console.log('Google Login Attempt with token:', token ? token.substring(0, 20) + '...' : 'No Token');
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const { email, name, sub: googleId } = ticket.getPayload();

        let user = await User.findOne({ where: { google_id: googleId } });

        if (!user) {
            // Check if email exists
            user = await User.findOne({ where: { email } });
            if (user) {
                // Link Google ID to existing user
                user.google_id = googleId;
                await user.save();
            } else {
                // Create new user
                user = await User.create({
                    email,
                    display_name: name,
                    google_id: googleId,
                    role: 'user',
                    password_hash: null, // No password for social login
                });
            }
        }

        const jwtToken = generateToken(user);
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

exports.facebookLogin = async (req, res) => {
    try {
        const { accessToken, userID } = req.body;

        // Verify token with Facebook
        const url = `https://graph.facebook.com/v19.0/me?access_token=${accessToken}&fields=id,name,email`;
        const { data } = await axios.get(url);

        if (data.id !== userID) {
            return res.status(400).json({ success: false, message: 'Invalid Facebook token' });
        }

        const { email, name, id: facebookId } = data;

        let user = await User.findOne({ where: { facebook_id: facebookId } });

        if (!user) {
            // Check if email exists (if email is provided by FB)
            if (email) {
                user = await User.findOne({ where: { email } });
                if (user) {
                    user.facebook_id = facebookId;
                    await user.save();
                }
            }

            if (!user) {
                // Create new user
                user = await User.create({
                    email: email || `${facebookId}@facebook.com`, // Fallback email
                    display_name: name,
                    facebook_id: facebookId,
                    role: 'user',
                    password_hash: null,
                });
            }
        }

        const jwtToken = generateToken(user);
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

exports.guestLogin = async (req, res) => {
    try {
        const { deviceId } = req.body;

        if (!deviceId) {
            return res.status(400).json({ success: false, message: 'Device ID required' });
        }

        const email = `guest_${deviceId}@preexam.com`;

        // Robust Find or Create Logic
        let user = await User.findOne({ where: { email } });

        if (!user) {
            // Create new guest user with safe display name
            const shortId = deviceId.substring(0, 8);
            user = await User.create({
                email,
                display_name: `Guest-${shortId}`,
                role: 'user',
                password_hash: null,
                plan_type: 'free'
            });
        }

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
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        // In a real application, you would:
        // 1. Verify user exists
        // 2. Generate a reset token
        // 3. Send email with link

        // For now, we simulate success to avoid information leakage and provide UI feedback
        // as we don't have an email service yet.
        console.log(`Password reset requested for: ${email}`);

        res.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
