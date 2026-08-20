const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { query, get, run } = require('../database/db');
const { requireAuth } = require('../middleware/auth');

// GET /api/coach/leaderboard - High-potential talent discovery leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const { role, limit = 20 } = req.query;

        let sql = `
            SELECT 
                p.id,
                p.full_name,
                p.age,
                p.gender,
                p.location,
                p.state_region,
                p.primary_role,
                p.batting_style,
                p.bowling_style,
                p.competition_level,
                p.academy_club,
                p.profile_photo_url,
                ts.overall_talent_potential,
                ts.talent_tier,
                ts.primary_archetype,
                ts.prediction_confidence,
                ts.development_trajectory_score,
                ts.current_performance_score,
                ts.athletic_potential_score,
                ts.technical_skill_score,
                ts.consistency_score,
                b.runs,
                b.batting_average,
                b.strike_rate,
                bw.wickets,
                bw.bowling_average,
                bw.economy_rate,
                bw.average_speed_kmh
            FROM player_profiles p
            JOIN talent_scores ts ON ts.player_id = p.id
            LEFT JOIN batting_stats b ON b.player_id = p.id
            LEFT JOIN bowling_stats bw ON bw.player_id = p.id
            WHERE 1=1
        `;
        const params = [];

        if (role && role !== 'all') {
            sql += ` AND p.primary_role = ?`;
            params.push(role);
        }

        sql += ` ORDER BY ts.overall_talent_potential DESC LIMIT ?`;
        params.push(Number(limit));

        const leaderboard = await query(sql, params);
        res.json({ leaderboard, total: leaderboard.length });
    } catch (err) {
        console.error('Leaderboard error:', err);
        res.status(500).json({ error: 'Failed to retrieve talent leaderboard.' });
    }
});

// GET /api/coach/discover - Advanced Talent Discovery search
router.get('/discover', async (req, res) => {
    try {
        const { ageGroup, role, competitionLevel, region, minPotential = 75, archetype } = req.query;

        let sql = `
            SELECT 
                p.*,
                ts.overall_talent_potential,
                ts.talent_tier,
                ts.primary_archetype,
                ts.secondary_archetype,
                ts.archetype_similarity_pct,
                ts.prediction_confidence,
                ts.development_trajectory_score,
                ts.current_performance_score,
                ts.athletic_potential_score,
                ts.technical_skill_score,
                ts.consistency_score,
                ts.strengths_json,
                ts.explainability_factors_json,
                b.runs,
                b.batting_average,
                b.strike_rate,
                bw.wickets,
                bw.economy_rate,
                bw.average_speed_kmh
            FROM player_profiles p
            JOIN talent_scores ts ON ts.player_id = p.id
            LEFT JOIN batting_stats b ON b.player_id = p.id
            LEFT JOIN bowling_stats bw ON bw.player_id = p.id
            WHERE ts.overall_talent_potential >= ?
        `;
        const params = [Number(minPotential)];

        if (ageGroup === 'u16') {
            sql += ` AND p.age <= 16`;
        } else if (ageGroup === 'u19') {
            sql += ` AND p.age >= 16 AND p.age <= 19`;
        } else if (ageGroup === 'u23') {
            sql += ` AND p.age >= 19 AND p.age <= 23`;
        }

        if (role && role !== 'all') {
            sql += ` AND p.primary_role = ?`;
            params.push(role);
        }

        if (competitionLevel && competitionLevel !== 'all') {
            sql += ` AND p.competition_level = ?`;
            params.push(competitionLevel);
        }

        if (region && region !== 'all') {
            sql += ` AND (p.state_region = ? OR p.location LIKE ?)`;
            params.push(region, `%${region}%`);
        }

        if (archetype && archetype !== 'all') {
            sql += ` AND ts.primary_archetype LIKE ?`;
            params.push(`%${archetype}%`);
        }

        sql += ` ORDER BY ts.overall_talent_potential DESC`;

        const results = await query(sql, params);
        const mapped = results.map(r => ({
            ...r,
            strengths: JSON.parse(r.strengths_json || '[]'),
            explainability_factors: JSON.parse(r.explainability_factors_json || '[]')
        }));

        res.json({
            results: mapped,
            count: mapped.length,
            appliedFilters: { ageGroup, role, competitionLevel, region, minPotential, archetype }
        });
    } catch (err) {
        console.error('Talent discovery error:', err);
        res.status(500).json({ error: 'Talent discovery query failed.' });
    }
});

// POST /api/coach/compare - Compare 2 to 4 players side-by-side
router.post('/compare', async (req, res) => {
    try {
        const { playerIds = [] } = req.body;
        if (!playerIds || playerIds.length < 2) {
            return res.status(400).json({ error: 'At least 2 player IDs are required for comparison.' });
        }

        const playersData = [];

        for (const pid of playerIds) {
            const player = await get('SELECT * FROM player_profiles WHERE id = ?', [pid]);
            if (!player) continue;

            const batting = await get('SELECT * FROM batting_stats WHERE player_id = ?', [pid]);
            const bowling = await get('SELECT * FROM bowling_stats WHERE player_id = ?', [pid]);
            const fielding = await get('SELECT * FROM fielding_stats WHERE player_id = ?', [pid]);
            const physicalTests = await query('SELECT * FROM physical_tests WHERE player_id = ? ORDER BY tested_at DESC', [pid]);
            const cvAssessments = await query('SELECT * FROM cv_assessments WHERE player_id = ? ORDER BY created_at DESC', [pid]);
            const talentScore = await get('SELECT * FROM talent_scores WHERE player_id = ?', [pid]);

            if (talentScore) {
                talentScore.strengths = JSON.parse(talentScore.strengths_json || '[]');
                talentScore.development_areas = JSON.parse(talentScore.development_areas_json || '[]');
                talentScore.ai_recommendations = JSON.parse(talentScore.ai_recommendations_json || '[]');
            }

            playersData.push({
                player,
                batting,
                bowling,
                fielding,
                physicalTests,
                cvAssessments,
                talentScore,
                radar: [
                    { subject: 'Match Performance', score: talentScore ? talentScore.current_performance_score : 70 },
                    { subject: 'Athleticism', score: talentScore ? talentScore.athletic_potential_score : 70 },
                    { subject: 'Technical Biomechanics', score: talentScore ? talentScore.technical_skill_score : 70 },
                    { subject: 'Consistency', score: talentScore ? talentScore.consistency_score : 70 },
                    { subject: 'Development Trajectory', score: talentScore ? talentScore.development_trajectory_score : 70 },
                    { subject: 'Pressure Handling', score: batting ? (batting.pressure_index || 75) : 75 }
                ]
            });
        }

        res.json({
            comparisonCount: playersData.length,
            players: playersData
        });
    } catch (err) {
        console.error('Comparison error:', err);
        res.status(500).json({ error: 'Failed to compare players.' });
    }
});

// GET /api/coach/watchlist
router.get('/watchlist', requireAuth, async (req, res) => {
    try {
        const watchlist = await query(`
            SELECT 
                w.id as watchlist_id,
                w.priority_level,
                w.private_scout_notes,
                w.created_at as saved_at,
                p.*,
                ts.overall_talent_potential,
                ts.talent_tier,
                ts.primary_archetype
            FROM scout_watchlist w
            JOIN player_profiles p ON p.id = w.player_id
            LEFT JOIN talent_scores ts ON ts.player_id = p.id
            WHERE w.scout_user_id = ?
            ORDER BY w.created_at DESC
        `, [req.user.id]);

        res.json({ watchlist });
    } catch (err) {
        console.error('Watchlist error:', err);
        res.status(500).json({ error: 'Failed to retrieve watchlist.' });
    }
});

// POST /api/coach/watchlist
router.post('/watchlist', requireAuth, async (req, res) => {
    try {
        const { playerId, priorityLevel = 'high', notes } = req.body;
        const watchId = `sw_${uuidv4().substring(0, 8)}`;

        await run(
            `INSERT OR REPLACE INTO scout_watchlist (id, scout_user_id, player_id, priority_level, private_scout_notes)
             VALUES (?, ?, ?, ?, ?)`,
            [watchId, req.user.id, playerId, priorityLevel, notes || 'Added from talent discovery']
        );

        res.status(201).json({ message: 'Player added to scout watchlist.' });
    } catch (err) {
        console.error('Save watchlist error:', err);
        res.status(500).json({ error: 'Failed to add player to watchlist.' });
    }
});

module.exports = router;
