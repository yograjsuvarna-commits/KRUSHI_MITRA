const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { query, get, run } = require('../database/db');
const { requireAuth } = require('../middleware/auth');
const { evaluatePlayerTalent } = require('../services/mlEngine');

// GET /api/players - List players with search & filtering
router.get('/', async (req, res) => {
    try {
        const { role, ageMin, ageMax, state, competition_level, search, minPotential } = req.query;

        let sql = `
            SELECT 
                p.*,
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
            LEFT JOIN talent_scores ts ON ts.player_id = p.id
            LEFT JOIN batting_stats b ON b.player_id = p.id
            LEFT JOIN bowling_stats bw ON bw.player_id = p.id
            WHERE 1=1
        `;
        const params = [];

        if (role && role !== 'all') {
            sql += ` AND p.primary_role = ?`;
            params.push(role);
        }
        if (ageMin) {
            sql += ` AND p.age >= ?`;
            params.push(Number(ageMin));
        }
        if (ageMax) {
            sql += ` AND p.age <= ?`;
            params.push(Number(ageMax));
        }
        if (state && state !== 'all') {
            sql += ` AND (p.state_region = ? OR p.location LIKE ?)`;
            params.push(state, `%${state}%`);
        }
        if (competition_level && competition_level !== 'all') {
            sql += ` AND p.competition_level = ?`;
            params.push(competition_level);
        }
        if (minPotential) {
            sql += ` AND ts.overall_talent_potential >= ?`;
            params.push(Number(minPotential));
        }
        if (search) {
            sql += ` AND (p.full_name LIKE ? OR p.location LIKE ? OR p.academy_club LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        sql += ` ORDER BY ts.overall_talent_potential DESC NULLS LAST`;

        const players = await query(sql, params);
        res.json({ players, count: players.length });
    } catch (err) {
        console.error('List players error:', err);
        res.status(500).json({ error: 'Failed to fetch players.' });
    }
});

// GET /api/players/:id - Get complete player profile with all stats & evaluation
router.get('/:id', async (req, res) => {
    try {
        const playerId = req.params.id;
        const player = await get('SELECT * FROM player_profiles WHERE id = ?', [playerId]);
        if (!player) {
            return res.status(404).json({ error: 'Player profile not found.' });
        }

        const batting = await get('SELECT * FROM batting_stats WHERE player_id = ?', [playerId]);
        const bowling = await get('SELECT * FROM bowling_stats WHERE player_id = ?', [playerId]);
        const fielding = await get('SELECT * FROM fielding_stats WHERE player_id = ?', [playerId]);
        const physicalTests = await query('SELECT * FROM physical_tests WHERE player_id = ? ORDER BY tested_at DESC', [playerId]);
        const cvAssessments = await query('SELECT * FROM cv_assessments WHERE player_id = ? ORDER BY created_at DESC', [playerId]);
        const progressHistory = await query('SELECT * FROM progress_history WHERE player_id = ? ORDER BY recorded_date ASC', [playerId]);
        let talentScore = await get('SELECT * FROM talent_scores WHERE player_id = ?', [playerId]);

        // Parse JSON fields
        if (talentScore) {
            talentScore.strengths = JSON.parse(talentScore.strengths_json || '[]');
            talentScore.development_areas = JSON.parse(talentScore.development_areas_json || '[]');
            talentScore.ai_recommendations = JSON.parse(talentScore.ai_recommendations_json || '[]');
            talentScore.explainability_factors = JSON.parse(talentScore.explainability_factors_json || '[]');
        }

        res.json({
            player,
            batting,
            bowling,
            fielding,
            physicalTests,
            cvAssessments,
            progressHistory,
            talentScore
        });
    } catch (err) {
        console.error('Get player detail error:', err);
        res.status(500).json({ error: 'Failed to fetch player details.' });
    }
});

// PUT /api/players/:id - Update player profile
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const playerId = req.params.id;
        const {
            fullName, age, gender, location, stateRegion, primaryRole, battingStyle,
            bowlingStyle, handedness, heightCm, weightKg, wingspanCm,
            experienceYears, academyClub, competitionLevel, jerseyNumber, bio, profilePhotoUrl
        } = req.body;

        await run(
            `UPDATE player_profiles SET
                full_name = COALESCE(?, full_name),
                age = COALESCE(?, age),
                gender = COALESCE(?, gender),
                location = COALESCE(?, location),
                state_region = COALESCE(?, state_region),
                primary_role = COALESCE(?, primary_role),
                batting_style = COALESCE(?, batting_style),
                bowling_style = COALESCE(?, bowling_style),
                handedness = COALESCE(?, handedness),
                height_cm = COALESCE(?, height_cm),
                weight_kg = COALESCE(?, weight_kg),
                wingspan_cm = COALESCE(?, wingspan_cm),
                experience_years = COALESCE(?, experience_years),
                academy_club = COALESCE(?, academy_club),
                competition_level = COALESCE(?, competition_level),
                jersey_number = COALESCE(?, jersey_number),
                bio = COALESCE(?, bio),
                profile_photo_url = COALESCE(?, profile_photo_url),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
            [
                fullName, age, gender, location, stateRegion, primaryRole, battingStyle,
                bowlingStyle, handedness, heightCm, weightKg, wingspanCm,
                experienceYears, academyClub, competitionLevel, jerseyNumber, bio, profilePhotoUrl,
                playerId
            ]
        );

        const updated = await get('SELECT * FROM player_profiles WHERE id = ?', [playerId]);
        res.json({ message: 'Profile updated successfully', player: updated });
    } catch (err) {
        console.error('Update player error:', err);
        res.status(500).json({ error: 'Failed to update player profile.' });
    }
});

module.exports = router;
