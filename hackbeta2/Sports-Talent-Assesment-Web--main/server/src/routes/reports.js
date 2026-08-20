const express = require('express');
const router = express.Router();
const { query, get, run } = require('../database/db');
const { evaluatePlayerTalent } = require('../services/mlEngine');

// GET /api/reports/:playerId - Get full AI talent assessment report
router.get('/:playerId', async (req, res) => {
    try {
        const { playerId } = req.params;

        const player = await get('SELECT * FROM player_profiles WHERE id = ?', [playerId]);
        if (!player) {
            return res.status(404).json({ error: 'Player not found.' });
        }

        const batting = await get('SELECT * FROM batting_stats WHERE player_id = ?', [playerId]);
        const bowling = await get('SELECT * FROM bowling_stats WHERE player_id = ?', [playerId]);
        const fielding = await get('SELECT * FROM fielding_stats WHERE player_id = ?', [playerId]);
        const physicalTests = await query('SELECT * FROM physical_tests WHERE player_id = ? ORDER BY tested_at DESC', [playerId]);
        const cvAssessments = await query('SELECT * FROM cv_assessments WHERE player_id = ? ORDER BY created_at DESC', [playerId]);
        const progressHistory = await query('SELECT * FROM progress_history WHERE player_id = ? ORDER BY recorded_date ASC', [playerId]);

        let talentScore = await get('SELECT * FROM talent_scores WHERE player_id = ?', [playerId]);

        // If no score exists yet or recalculation needed, generate on the fly
        if (!talentScore) {
            const evalResult = evaluatePlayerTalent({
                player,
                batting,
                bowling,
                fielding,
                physicalTests,
                cvAssessments,
                progressHistory
            });

            await run(
                `INSERT OR REPLACE INTO talent_scores (
                    id, player_id, overall_talent_potential, current_performance_score, athletic_potential_score,
                    technical_skill_score, consistency_score, development_trajectory_score, talent_tier,
                    primary_archetype, secondary_archetype, archetype_similarity_pct, model_version,
                    prediction_confidence, sample_size_matches, strengths_json, development_areas_json,
                    ai_recommendations_json, explainability_factors_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    `ts_${playerId}`,
                    playerId,
                    evalResult.overall_talent_potential,
                    evalResult.current_performance_score,
                    evalResult.athletic_potential_score,
                    evalResult.technical_skill_score,
                    evalResult.consistency_score,
                    evalResult.development_trajectory_score,
                    evalResult.talent_tier,
                    evalResult.primary_archetype,
                    evalResult.secondary_archetype,
                    evalResult.archetype_similarity_pct,
                    evalResult.model_version,
                    evalResult.prediction_confidence,
                    evalResult.sample_size_matches,
                    JSON.stringify(evalResult.strengths),
                    JSON.stringify(evalResult.development_areas),
                    JSON.stringify(evalResult.ai_recommendations),
                    JSON.stringify(evalResult.explainability_factors)
                ]
            );

            talentScore = await get('SELECT * FROM talent_scores WHERE player_id = ?', [playerId]);
        }

        talentScore.strengths = JSON.parse(talentScore.strengths_json || '[]');
        talentScore.development_areas = JSON.parse(talentScore.development_areas_json || '[]');
        talentScore.ai_recommendations = JSON.parse(talentScore.ai_recommendations_json || '[]');
        talentScore.explainability_factors = JSON.parse(talentScore.explainability_factors_json || '[]');

        // Radar chart dimension data for easy consumption
        const radarDimensions = [
            { subject: 'Match Performance', score: talentScore.current_performance_score, fullMark: 100 },
            { subject: 'Athleticism', score: talentScore.athletic_potential_score, fullMark: 100 },
            { subject: 'Technical Biomechanics', score: talentScore.technical_skill_score, fullMark: 100 },
            { subject: 'Consistency', score: talentScore.consistency_score, fullMark: 100 },
            { subject: 'Development Trajectory', score: talentScore.development_trajectory_score, fullMark: 100 },
            { subject: 'Pressure Composure', score: batting ? (batting.pressure_index || 75) : 80, fullMark: 100 }
        ];

        res.json({
            player,
            talentScore,
            radarDimensions,
            batting,
            bowling,
            fielding,
            physicalTests,
            cvAssessments,
            progressHistory,
            generatedAt: new Date().toISOString()
        });
    } catch (err) {
        console.error('Get talent report error:', err);
        res.status(500).json({ error: 'Failed to generate talent assessment report.' });
    }
});

module.exports = router;
