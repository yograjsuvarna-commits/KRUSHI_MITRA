const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { query, get, run } = require('../database/db');
const { generateToken, requireAuth } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { email, password, role = 'player', fullName, phone, sport = 'cricket', age, gender, location, primaryRole, battingStyle, bowlingStyle } = req.body;

        if (!email || !password || !fullName) {
            return res.status(400).json({ error: 'Email, password, and full name are required.' });
        }

        const existingUser = await get('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists.' });
        }

        const userId = `u_${uuidv4().substring(0, 8)}`;
        const passwordHash = bcrypt.hashSync(password, 10);

        await run(
            `INSERT INTO users (id, email, password_hash, role, full_name, phone) VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, email.toLowerCase().trim(), passwordHash, role, fullName, phone || null]
        );

        let playerId = null;
        if (role === 'player') {
            playerId = `p_${uuidv4().substring(0, 8)}`;
            await run(
                `INSERT INTO player_profiles (
                    id, user_id, sport_id, full_name, age, gender, location, primary_role,
                    batting_style, bowling_style, competition_level
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    playerId, userId, sport || 'cricket', fullName, age || 17, gender || 'Male',
                    location || 'India', primaryRole || 'batter', battingStyle || 'right_hand_bat',
                    bowlingStyle || 'none', 'district'
                ]
            );

            // Initialize base stats records
            await run(`INSERT INTO batting_stats (id, player_id) VALUES (?, ?)`, [`b_${playerId}`, playerId]);
            await run(`INSERT INTO bowling_stats (id, player_id) VALUES (?, ?)`, [`bw_${playerId}`, playerId]);
            await run(`INSERT INTO fielding_stats (id, player_id) VALUES (?, ?)`, [`f_${playerId}`, playerId]);
        }

        const user = { id: userId, email: email.toLowerCase().trim(), role, full_name: fullName };
        const token = generateToken(user);

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: { ...user, playerId }
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Internal server error during registration.' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const user = await get('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const isMatch = bcrypt.compareSync(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        let playerId = null;
        if (user.role === 'player') {
            const player = await get('SELECT id FROM player_profiles WHERE user_id = ?', [user.id]);
            if (player) playerId = player.id;
        }

        const token = generateToken(user);
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                full_name: user.full_name,
                avatar_url: user.avatar_url,
                playerId
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error during login.' });
    }
});

// POST /api/auth/demo/:role - Instant 1-click Demo Login for Hackathon Judges
router.post('/demo/:role', async (req, res) => {
    try {
        const role = req.params.role;
        let userEmail = 'rahul@starq.ai'; // default player

        if (role === 'coach') userEmail = 'coach.sharma@starq.ai';
        else if (role === 'scout') userEmail = 'scout@starq.ai';
        else if (role === 'admin') userEmail = 'admin@starq.ai';
        else if (role === 'fast_bowler') userEmail = 'vikram@starq.ai';
        else if (role === 'all_rounder') userEmail = 'ananya@starq.ai';

        const user = await get('SELECT * FROM users WHERE email = ?', [userEmail]);
        if (!user) {
            return res.status(404).json({ error: `Demo account for ${role} not found. Please run seed script.` });
        }

        let playerId = null;
        if (user.role === 'player') {
            const player = await get('SELECT id FROM player_profiles WHERE user_id = ?', [user.id]);
            if (player) playerId = player.id;
        }

        const token = generateToken(user);
        res.json({
            message: `Logged in as Demo ${user.role} (${user.full_name})`,
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                full_name: user.full_name,
                avatar_url: user.avatar_url,
                playerId
            }
        });
    } catch (err) {
        console.error('Demo login error:', err);
        res.status(500).json({ error: 'Demo login failed.' });
    }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
    try {
        const user = await get('SELECT id, email, role, full_name, avatar_url, phone, created_at FROM users WHERE id = ?', [req.user.id]);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        let profile = null;
        if (user.role === 'player') {
            profile = await get('SELECT * FROM player_profiles WHERE user_id = ?', [user.id]);
        }

        res.json({
            user,
            profile
        });
    } catch (err) {
        console.error('Get me error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;
