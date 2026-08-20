const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { query, get, run } = require('../database/db');
const { requireAuth } = require('../middleware/auth');
const { evaluatePlayerTalent } = require('../services/mlEngine');

// POST /api/assessments/start - Start a new assessment session
router.post('/start', requireAuth, async (req, res) => {
    try {
        const { playerId, sessionType = 'full_assessment' } = req.body;
        const sessionId = `sess_${uuidv4().substring(0, 8)}`;

        await run(
            `INSERT INTO assessment_sessions (id, player_id, session_type, status) VALUES (?, ?, ?, 'in_progress')`,
            [sessionId, playerId, sessionType]
        );

        res.status(201).json({
            message: 'Assessment session initiated.',
            sessionId,
            sessionType
        });
    } catch (err) {
        console.error('Start session error:', err);
        res.status(500).json({ error: 'Failed to initiate assessment session.' });
    }
});

// POST /api/assessments/submit-cv - Submit computer vision biomechanics results
router.post('/submit-cv', requireAuth, async (req, res) => {
    try {
        const {
            sessionId,
            playerId,
            assessmentName = 'batting_mechanics',
            postureStabilityScore = 85,
            balanceScore = 88,
            hipRotationScore = 84,
            shoulderRotationScore = 86,
            headStabilityScore = 90,
            movementEfficiencyScore = 87,
            techniqueConsistencyScore = 85,
            stanceWidthRatio = 1.15,
            batBackliftAngleDeg = 40.0,
            frontKneeFlexionDeg = 135.0,
            hipShoulderSeparationDeg = 30.0,
            estimatedSpeedKmh = 0,
            estimatedDistanceM = 0,
            measurementConfidence = 0.90,
            observations = []
        } = req.body;

        const cvId = `cv_${uuidv4().substring(0, 8)}`;
        const validSessionId = sessionId || `sess_${uuidv4().substring(0, 8)}`;

        // Check if session exists, if not create one
        const session = await get('SELECT id FROM assessment_sessions WHERE id = ?', [validSessionId]);
        if (!session) {
            await run(
                `INSERT INTO assessment_sessions (id, player_id, session_type, status, overall_performance_score) VALUES (?, ?, ?, 'completed', ?)`,
                [validSessionId, playerId, assessmentName, postureStabilityScore]
            );
        } else {
            await run(
                `UPDATE assessment_sessions SET status = 'completed', overall_performance_score = ? WHERE id = ?`,
                [postureStabilityScore, validSessionId]
            );
        }

        // Insert CV assessment
        await run(
            `INSERT INTO cv_assessments (
                id, session_id, player_id, assessment_name, posture_stability_score, balance_score,
                hip_rotation_score, shoulder_rotation_score, head_stability_score, movement_efficiency_score,
                technique_consistency_score, stance_width_ratio, bat_backlift_angle_deg, front_knee_flexion_deg,
                hip_shoulder_separation_deg, estimated_speed_kmh, estimated_distance_m, measurement_confidence,
                raw_observations_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                cvId, validSessionId, playerId, assessmentName,
                Number(postureStabilityScore), Number(balanceScore), Number(hipRotationScore),
                Number(shoulderRotationScore), Number(headStabilityScore), Number(movementEfficiencyScore),
                Number(techniqueConsistencyScore), Number(stanceWidthRatio), Number(batBackliftAngleDeg),
                Number(frontKneeFlexionDeg), Number(hipShoulderSeparationDeg), Number(estimatedSpeedKmh),
                Number(estimatedDistanceM), Number(measurementConfidence), JSON.stringify(observations)
            ]
        );

        // If broad jump was assessed, record to physical_tests as well
        if (estimatedDistanceM > 0) {
            const ptId = `pt_${uuidv4().substring(0, 8)}`;
            const score = Math.min(99, Math.max(30, Math.round(((estimatedDistanceM - 1.8) / (2.9 - 1.8)) * 100)));
            await run(
                `INSERT INTO physical_tests (id, player_id, test_type, raw_value, unit, score, percentile, is_cv_estimated, cv_confidence, notes)
                 VALUES (?, ?, 'standing_broad_jump', ?, 'm', ?, ?, 1, ?, 'Live CV broad jump measurement with calibration')`,
                [ptId, playerId, estimatedDistanceM, score, score, measurementConfidence]
            );
        }

        // Re-evaluate full player talent model
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

            // Record trajectory point if new overall score
            const today = new Date().toISOString().split('T')[0];
            await run(
                `INSERT INTO progress_history (id, player_id, evaluation_phase, recorded_date, overall_potential, performance_score, athletic_score, technical_score, consistency_score, development_score, notes)
                 VALUES (?, ?, 'CV_Assessment', ?, ?, ?, ?, ?, ?, ?, 'Automated CV live test recording')`,
                [
                    `pr_${uuidv4().substring(0, 8)}`,
                    playerId,
                    today,
                    result.overall_talent_potential,
                    result.current_performance_score,
                    result.athletic_potential_score,
                    result.technical_skill_score,
                    result.consistency_score,
                    result.development_trajectory_score
                ]
            );
        }

        const savedCv = await get('SELECT * FROM cv_assessments WHERE id = ?', [cvId]);
        const updatedTalent = await get('SELECT * FROM talent_scores WHERE player_id = ?', [playerId]);

        res.status(201).json({
            message: 'Computer vision analysis processed and Talent Potential Report generated.',
            cvAssessment: savedCv,
            talentScore: updatedTalent ? {
                ...updatedTalent,
                strengths: JSON.parse(updatedTalent.strengths_json || '[]'),
                development_areas: JSON.parse(updatedTalent.development_areas_json || '[]'),
                ai_recommendations: JSON.parse(updatedTalent.ai_recommendations_json || '[]'),
                explainability_factors: JSON.parse(updatedTalent.explainability_factors_json || '[]')
            } : null
        });
    } catch (err) {
        console.error('Submit CV error:', err);
        res.status(500).json({ error: 'Failed to process computer vision assessment.' });
    }
});

// POST /api/assessments/ball-speed-estimator
router.post('/ball-speed-estimator', async (req, res) => {
    try {
        const { pixelDisplacement, frameCount = 5, fps = 30, calibrationRatioMetersPerPixel = 0.038 } = req.body;

        if (!pixelDisplacement) {
            return res.status(400).json({ error: 'pixelDisplacement parameter is required.' });
        }

        // Formula: Speed = Distance / Time
        // Distance = pixelDisplacement * calibrationRatio
        // Time = frameCount / fps
        const distanceMeters = pixelDisplacement * calibrationRatioMetersPerPixel;
        const timeSeconds = frameCount / fps;
        const speedMps = distanceMeters / timeSeconds;
        const speedKmh = Number((speedMps * 3.6).toFixed(1));

        // Confidence estimation
        const confidence = fps >= 60 ? 0.92 : fps >= 30 ? 0.84 : 0.70;

        res.json({
            estimatedSpeedKmh: speedKmh,
            estimatedSpeedMps: Number(speedMps.toFixed(1)),
            distanceMeters: Number(distanceMeters.toFixed(2)),
            timeSeconds: Number(timeSeconds.toFixed(3)),
            confidencePct: Math.round(confidence * 100),
            disclaimer: 'Estimated speed based on optical displacement and calibration reference. For official speed measurement, radar/Hawkeye sensor is required.'
        });
    } catch (err) {
        console.error('Ball speed estimator error:', err);
        res.status(500).json({ error: 'Ball speed calculation failed.' });
    }
});

// POST /api/assessments/broad-jump-estimator
router.post('/broad-jump-estimator', async (req, res) => {
    try {
        const { startPixelX, endPixelX, calibrationPixelsPerMeter = 320 } = req.body;

        const pixelDiff = Math.abs(endPixelX - startPixelX);
        const distanceM = Number((pixelDiff / calibrationPixelsPerMeter).toFixed(2));
        const confidencePct = 91;

        res.json({
            estimatedDistanceM: distanceM,
            pixelDelta: pixelDiff,
            confidencePct,
            disclaimer: 'Estimated jump distance based on calibrated horizontal displacement.'
        });
    } catch (err) {
        console.error('Broad jump error:', err);
        res.status(500).json({ error: 'Broad jump calculation failed.' });
    }
});

module.exports = router;
