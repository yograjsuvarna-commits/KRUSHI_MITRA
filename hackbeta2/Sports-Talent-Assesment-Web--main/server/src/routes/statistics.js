const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { query, get, run } = require('../database/db');
const { requireAuth } = require('../middleware/auth');
const { evaluatePlayerTalent } = require('../services/mlEngine');

async function triggerTalentRecalculation(playerId) {
    try {
        const player = await get('SELECT * FROM player_profiles WHERE id = ?', [playerId]);
        if (!player) return;
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
    } catch (err) {
        console.error('Recalculation error:', err);
    }
}

// GET /api/statistics/:playerId
router.get('/:playerId', async (req, res) => {
    try {
        const { playerId } = req.params;
        const batting = await get('SELECT * FROM batting_stats WHERE player_id = ?', [playerId]);
        const bowling = await get('SELECT * FROM bowling_stats WHERE player_id = ?', [playerId]);
        const fielding = await get('SELECT * FROM fielding_stats WHERE player_id = ?', [playerId]);

        res.json({ batting, bowling, fielding });
    } catch (err) {
        console.error('Get stats error:', err);
        res.status(500).json({ error: 'Failed to retrieve player statistics.' });
    }
});

// POST /api/statistics/:playerId/batting
router.post('/:playerId/batting', requireAuth, async (req, res) => {
    try {
        const { playerId } = req.params;
        const {
            matches, innings, runs, ballsFaced, highestScore, isNotOutHighest,
            battingAverage, strikeRate, fours, sixes, fifties, hundreds, notOuts,
            dotBallPercentage, boundaryPercentage, ballsPerBoundary, powerplayStrikeRate,
            middleOversStrikeRate, deathOversStrikeRate, avgVsPace, avgVsSpin, chaseAverage, pressureIndex
        } = req.body;

        const calculatedAvg = innings - (notOuts || 0) > 0 ? (runs / (innings - (notOuts || 0))).toFixed(1) : runs;
        const calculatedSR = ballsFaced > 0 ? ((runs / ballsFaced) * 100).toFixed(1) : strikeRate || 0;

        await run(
            `INSERT OR REPLACE INTO batting_stats (
                id, player_id, matches, innings, runs, balls_faced, highest_score, is_not_out_highest,
                batting_average, strike_rate, fours, sixes, fifties, hundreds, not_outs,
                dot_ball_percentage, boundary_percentage, balls_per_boundary,
                powerplay_strike_rate, middle_overs_strike_rate, death_overs_strike_rate,
                avg_vs_pace, avg_vs_spin, chase_average, pressure_index
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                `b_${playerId}`, playerId, matches || 0, innings || 0, runs || 0, ballsFaced || 0,
                highestScore || 0, isNotOutHighest ? 1 : 0, Number(battingAverage || calculatedAvg),
                Number(strikeRate || calculatedSR), fours || 0, sixes || 0, fifties || 0, hundreds || 0,
                notOuts || 0, dotBallPercentage || 40, boundaryPercentage || 15, ballsPerBoundary || 6.5,
                powerplayStrikeRate || strikeRate || 130, middleOversStrikeRate || strikeRate || 120,
                deathOversStrikeRate || strikeRate || 150, avgVsPace || calculatedAvg, avgVsSpin || calculatedAvg,
                chaseAverage || calculatedAvg, pressureIndex || 75
            ]
        );

        await triggerTalentRecalculation(playerId);
        const updated = await get('SELECT * FROM batting_stats WHERE player_id = ?', [playerId]);
        res.json({ message: 'Batting stats saved & AI Talent Score updated', batting: updated });
    } catch (err) {
        console.error('Save batting stats error:', err);
        res.status(500).json({ error: 'Failed to save batting statistics.' });
    }
});

// POST /api/statistics/:playerId/bowling
router.post('/:playerId/bowling', requireAuth, async (req, res) => {
    try {
        const { playerId } = req.params;
        const {
            matches, innings, overs, maidens, runsConceded, wickets,
            bestBowlingWickets, bestBowlingRuns, bowlingAverage, economyRate, strikeRate,
            dotBallPercentage, fourWicketHauls, fiveWicketHauls, averageSpeedKmh, maxSpeedKmh,
            yorkerPercentage, bouncerPercentage, powerplayEconomy, deathOversEconomy, wicketsVsTopOrder
        } = req.body;

        const calculatedAvg = wickets > 0 ? (runsConceded / wickets).toFixed(1) : runsConceded;
        const calculatedEcon = overs > 0 ? (runsConceded / overs).toFixed(2) : economyRate || 0;
        const calculatedSR = wickets > 0 ? ((overs * 6) / wickets).toFixed(1) : strikeRate || 0;

        await run(
            `INSERT OR REPLACE INTO bowling_stats (
                id, player_id, matches, innings, overs, maidens, runs_conceded, wickets,
                best_bowling_wickets, best_bowling_runs, bowling_average, economy_rate, strike_rate,
                dot_ball_percentage, four_wicket_hauls, five_wicket_hauls, average_speed_kmh, max_speed_kmh,
                yorker_percentage, bouncer_percentage, powerplay_economy, death_overs_economy, wickets_vs_top_order
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                `bw_${playerId}`, playerId, matches || 0, innings || 0, overs || 0, maidens || 0,
                runsConceded || 0, wickets || 0, bestBowlingWickets || 0, bestBowlingRuns || 0,
                Number(bowlingAverage || calculatedAvg), Number(economyRate || calculatedEcon),
                Number(strikeRate || calculatedSR), dotBallPercentage || 50, fourWicketHauls || 0,
                fiveWicketHauls || 0, averageSpeedKmh || 0, maxSpeedKmh || 0, yorkerPercentage || 15,
                bouncerPercentage || 10, powerplayEconomy || calculatedEcon, deathOversEconomy || (Number(calculatedEcon) + 1.5),
                wicketsVsTopOrder || Math.round((wickets || 0) * 0.5)
            ]
        );

        await triggerTalentRecalculation(playerId);
        const updated = await get('SELECT * FROM bowling_stats WHERE player_id = ?', [playerId]);
        res.json({ message: 'Bowling stats saved & AI Talent Score updated', bowling: updated });
    } catch (err) {
        console.error('Save bowling stats error:', err);
        res.status(500).json({ error: 'Failed to save bowling statistics.' });
    }
});

// POST /api/statistics/:playerId/mock-csv-import
router.post('/:playerId/mock-csv-import', requireAuth, async (req, res) => {
    try {
        const { playerId } = req.params;
        const { csvType = 'batting' } = req.body;

        // Populate rich realistic match stats from standard tournament scorecard log
        if (csvType === 'batting') {
            await run(
                `INSERT OR REPLACE INTO batting_stats (
                    id, player_id, matches, innings, runs, balls_faced, highest_score, is_not_out_highest,
                    batting_average, strike_rate, fours, sixes, fifties, hundreds, not_outs,
                    dot_ball_percentage, boundary_percentage, balls_per_boundary,
                    powerplay_strike_rate, middle_overs_strike_rate, death_overs_strike_rate,
                    avg_vs_pace, avg_vs_spin, chase_average, pressure_index
                ) VALUES (?, ?, 24, 22, 940, 640, 94, 1, 44.8, 146.9, 98, 28, 6, 1, 1, 38.0, 19.7, 5.1, 152.0, 134.0, 168.0, 48.0, 40.0, 46.5, 84.0)`,
                [`b_${playerId}`, playerId]
            );
        } else {
            await run(
                `INSERT OR REPLACE INTO bowling_stats (
                    id, player_id, matches, innings, overs, maidens, runs_conceded, wickets,
                    best_bowling_wickets, best_bowling_runs, bowling_average, economy_rate, strike_rate,
                    dot_ball_percentage, four_wicket_hauls, five_wicket_hauls, average_speed_kmh, max_speed_kmh,
                    yorker_percentage, bouncer_percentage, powerplay_economy, death_overs_economy, wickets_vs_top_order
                ) VALUES (?, ?, 20, 20, 78.0, 6, 490, 38, 4, 19, 12.8, 6.28, 12.3, 60.5, 3, 1, 134.0, 139.5, 26.0, 15.0, 5.5, 7.6, 22)`,
                [`bw_${playerId}`, playerId]
            );
        }

        await triggerTalentRecalculation(playerId);
        res.json({ message: `Successfully imported CSV scorecard data for ${csvType}` });
    } catch (err) {
        console.error('CSV import error:', err);
        res.status(500).json({ error: 'Failed to process CSV data.' });
    }
});

module.exports = router;
