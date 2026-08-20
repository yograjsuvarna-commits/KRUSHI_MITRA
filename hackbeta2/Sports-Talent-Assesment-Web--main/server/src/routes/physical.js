const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { query, get, run } = require('../database/db');
const { requireAuth } = require('../middleware/auth');
const { evaluatePlayerTalent } = require('../services/mlEngine');

const BENCHMARKS = {
    'sprint_10m': { min: 1.60, max: 2.30, invert: true, unit: 's' },
    'sprint_20m': { min: 2.80, max: 3.80, invert: true, unit: 's' },
    'sprint_30m': { min: 3.80, max: 5.00, invert: true, unit: 's' },
    'vertical_jump': { min: 35.0, max: 75.0, invert: false, unit: 'cm' },
    'standing_broad_jump': { min: 1.80, max: 2.90, invert: false, unit: 'm' },
    'shuttle_run': { min: 8.50, max: 12.50, invert: true, unit: 's' },
    'beep_test': { min: 8.0, max: 15.5, invert: false, unit: 'level' },
    'reaction_time': { min: 160.0, max: 340.0, invert: true, unit: 'ms' },
    'single_leg_balance': { min: 15.0, max: 60.0, invert: false, unit: 's' }
};

function calculateTestScore(testType, rawValue) {
    const bm = BENCHMARKS[testType] || { min: 0, max: 100, invert: false, unit: '' };
    const clamped = Math.max(bm.min, Math.min(bm.max, rawValue));
    let score = ((clamped - bm.min) / (bm.max - bm.min)) * 100;
    if (bm.invert) score = 100 - score;
    const percentile = Math.min(99, Math.max(1, Math.round(score * 0.95 + 4)));
    return { score: Math.round(score), percentile, unit: bm.unit };
}

// GET /api/physical/:playerId
router.get('/:playerId', async (req, res) => {
    try {
        const { playerId } = req.params;
        const tests = await query('SELECT * FROM physical_tests WHERE player_id = ? ORDER BY tested_at DESC', [playerId]);
        res.json({ tests, benchmarks: BENCHMARKS });
    } catch (err) {
        console.error('Get physical tests error:', err);
        res.status(500).json({ error: 'Failed to fetch physical tests.' });
    }
});

// POST /api/physical/:playerId
router.post('/:playerId', requireAuth, async (req, res) => {
    try {
        const { playerId } = req.params;
        const { testType, rawValue, unit, isCvEstimated = 0, cvConfidence = 1.0, notes } = req.body;

        if (!testType || rawValue === undefined) {
            return res.status(400).json({ error: 'Test type and raw measurement value are required.' });
        }

        const { score, percentile, unit: defaultUnit } = calculateTestScore(testType, Number(rawValue));
        const testId = `pt_${uuidv4().substring(0, 8)}`;

        await run(
            `INSERT INTO physical_tests (
                id, player_id, test_type, raw_value, unit, score, percentile,
                is_cv_estimated, cv_confidence, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                testId, playerId, testType, Number(rawValue), unit || defaultUnit,
                score, percentile, isCvEstimated ? 1 : 0, Number(cvConfidence), notes || null
            ]
        );

        // Auto-recalculate player talent report
        const player = await get('SELECT * FROM player_profiles WHERE id = ?', [playerId]);
        if (player) {
            const batting = await get('SELECT * FROM batting_stats WHERE player_id = ?', [playerId]);
            const bowling = await get('SELECT * FROM bowling_stats WHERE player_id = ?', [playerId]);
            const fielding = await get('SELECT * FROM fielding_stats WHERE player_id = ?', [playerId]);
            const physicalTests = await query('SELECT * FROM physical_tests WHERE player_id = ?', [playerId]);
            const cvAssessments = await query('SELECT * FROM cv_assessments WHERE player_id = ?', [playerId]);
            const progressHistory = await query('SELECT * FROM progress_history WHERE player_id = ?', [playerId]);

            const result = evaluatePlayerTalent({
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
                    result.overall_talent_potential,
                    result.current_performance_score,
                    result.athletic_potential_score,
                    result.technical_skill_score,
                    result.consistency_score,
                    result.development_trajectory_score,
                    result.talent_tier,
                    result.primary_archetype,
                    result.secondary_archetype,
                    result.archetype_similarity_pct,
                    result.model_version,
                    result.prediction_confidence,
                    result.sample_size_matches,
                    JSON.stringify(result.strengths),
                    JSON.stringify(result.development_areas),
                    JSON.stringify(result.ai_recommendations),
                    JSON.stringify(result.explainability_factors)
                ]
            );
        }

        const savedTest = await get('SELECT * FROM physical_tests WHERE id = ?', [testId]);
        res.status(201).json({
            message: 'Physical test recorded and talent potential updated.',
            test: savedTest
        });
    } catch (err) {
        console.error('Save physical test error:', err);
        res.status(500).json({ error: 'Failed to record physical test.' });
    }
});

module.exports = router;
