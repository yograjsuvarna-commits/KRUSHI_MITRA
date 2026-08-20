const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { getDb, exec, run, query, saveDb } = require('./db');
const { evaluatePlayerTalent } = require('../services/mlEngine');

async function seed() {
    console.log('🌱 Starting StarQ Database Seeding...');
    const db = await getDb();

    // Re-initialize schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        db.exec(schema);
    }

    const defaultPasswordHash = bcrypt.hashSync('password123', 10);

    // 1. Insert Sports
    const sports = [
        ['cricket', 'Cricket', 'cricket', 'team', 1],
        ['football', 'Football', 'football', 'team', 0],
        ['basketball', 'Basketball', 'basketball', 'team', 0],
        ['athletics', 'Athletics', 'athletics', 'individual', 0],
        ['badminton', 'Badminton', 'badminton', 'individual', 0]
    ];

    for (const [id, name, slug, cat, active] of sports) {
        db.run(
            `INSERT OR REPLACE INTO sports (id, name, slug, category, is_active) VALUES (?, ?, ?, ?, ?)`,
            [id, name, slug, cat, active]
        );
    }

    // 2. Insert Users
    const users = [
        ['u_rahul', 'rahul@starq.ai', defaultPasswordHash, 'player', 'Rahul Sharma', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', '+91 98765 43210'],
        ['u_vikram', 'vikram@starq.ai', defaultPasswordHash, 'player', 'Vikram Rathore', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', '+91 98765 43211'],
        ['u_ananya', 'ananya@starq.ai', defaultPasswordHash, 'player', 'Ananya Patel', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', '+91 98765 43212'],
        ['u_rohit', 'rohit@starq.ai', defaultPasswordHash, 'player', 'Rohit Verma', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', '+91 98765 43213'],
        ['u_kavya', 'kavya@starq.ai', defaultPasswordHash, 'player', 'Kavya Iyer', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', '+91 98765 43214'],
        ['u_samir', 'samir@starq.ai', defaultPasswordHash, 'player', 'Samir Khan', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', '+91 98765 43215'],
        ['u_scout', 'scout@starq.ai', defaultPasswordHash, 'scout', 'Rajesh Dravid', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', '+91 98765 43299'],
        ['u_coach', 'coach.sharma@starq.ai', defaultPasswordHash, 'coach', 'Arun Sharma', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', '+91 98765 43298'],
        ['u_admin', 'admin@starq.ai', defaultPasswordHash, 'admin', 'StarQ Admin', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', '+91 98765 43200']
    ];

    for (const u of users) {
        db.run(
            `INSERT OR REPLACE INTO users (id, email, password_hash, role, full_name, avatar_url, phone) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            u
        );
    }

    // 3. Insert Player Profiles
    const playerProfiles = [
        {
            id: 'p_rahul',
            user_id: 'u_rahul',
            full_name: 'Rahul Sharma',
            dob: '2009-04-14',
            age: 17,
            gender: 'Male',
            location: 'Bengaluru, Karnataka',
            state_region: 'Karnataka',
            primary_role: 'batter',
            batting_style: 'right_hand_bat',
            bowling_style: 'none',
            handedness: 'right',
            height_cm: 178,
            weight_kg: 68,
            wingspan_cm: 182,
            experience_years: 5.5,
            academy_club: 'Karnataka State Cricket Academy',
            competition_level: 'state_u19',
            jersey_number: 18,
            bio: 'Aggressive top-order batter with explosive powerplay scoring and excellent bat-speed through point and cover.',
            photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'
        },
        {
            id: 'p_vikram',
            user_id: 'u_vikram',
            full_name: 'Vikram Rathore',
            dob: '2008-01-22',
            age: 18,
            gender: 'Male',
            location: 'Jaipur, Rajasthan',
            state_region: 'Rajasthan',
            primary_role: 'fast_bowler',
            batting_style: 'right_hand_bat',
            bowling_style: 'right_arm_fast',
            handedness: 'right',
            height_cm: 188,
            weight_kg: 78,
            wingspan_cm: 194,
            experience_years: 6,
            academy_club: 'Rajasthan Pace Foundation',
            competition_level: 'state_u19',
            jersey_number: 99,
            bio: 'Express hit-the-deck fast bowler consistently clocking 135+ km/h with a sharp bouncer and steep release point.',
            photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300'
        },
        {
            id: 'p_ananya',
            user_id: 'u_ananya',
            full_name: 'Ananya Patel',
            dob: '2010-09-10',
            age: 16,
            gender: 'Female',
            location: 'Ahmedabad, Gujarat',
            state_region: 'Gujarat',
            primary_role: 'all_rounder',
            batting_style: 'right_hand_bat',
            bowling_style: 'right_arm_leg_spin',
            handedness: 'right',
            height_cm: 166,
            weight_kg: 56,
            wingspan_cm: 169,
            experience_years: 4.5,
            academy_club: 'Gujarat High Performance Center',
            competition_level: 'state_u16',
            jersey_number: 7,
            bio: 'Dynamic leg-spinning all-rounder with clever variations, sharp turn, and solid middle-order anchoring ability.',
            photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300'
        },
        {
            id: 'p_rohit',
            user_id: 'u_rohit',
            full_name: 'Rohit Verma',
            dob: '2007-06-05',
            age: 19,
            gender: 'Male',
            location: 'Delhi, NCR',
            state_region: 'Delhi',
            primary_role: 'batter',
            batting_style: 'right_hand_bat',
            bowling_style: 'right_arm_off_spin',
            handedness: 'right',
            height_cm: 180,
            weight_kg: 72,
            wingspan_cm: 181,
            experience_years: 7,
            academy_club: 'National Capital Cricket Club',
            competition_level: 'division_club',
            jersey_number: 45,
            bio: 'Technical opener with classical strokeplay, rock-solid defensive compact setup, and high conversion rate.',
            photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300'
        },
        {
            id: 'p_kavya',
            user_id: 'u_kavya',
            full_name: 'Kavya Iyer',
            dob: '2009-02-18',
            age: 17,
            gender: 'Female',
            location: 'Chennai, Tamil Nadu',
            state_region: 'Tamil Nadu',
            primary_role: 'wicket_keeper',
            batting_style: 'left_hand_bat',
            bowling_style: 'none',
            handedness: 'left',
            height_cm: 165,
            weight_kg: 55,
            wingspan_cm: 166,
            experience_years: 5,
            academy_club: 'Tamil Nadu Women Cricket Academy',
            competition_level: 'state_u19',
            jersey_number: 12,
            bio: 'Lightning-quick wicketkeeper with 190ms glove reaction time and fluent left-handed strokeplay against spin.',
            photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300'
        },
        {
            id: 'p_samir',
            user_id: 'u_samir',
            full_name: 'Samir Khan',
            dob: '2008-11-30',
            age: 18,
            gender: 'Male',
            location: 'Mumbai, Maharashtra',
            state_region: 'Maharashtra',
            primary_role: 'fast_bowler',
            batting_style: 'right_hand_bat',
            bowling_style: 'left_arm_fast',
            handedness: 'left',
            height_cm: 185,
            weight_kg: 74,
            wingspan_cm: 190,
            experience_years: 5,
            academy_club: 'Mumbai Cricket Association Academy',
            competition_level: 'state_u19',
            jersey_number: 21,
            bio: 'Left-arm seam bowler specializing in pinpoint death-over yorkers, deceptive slower balls, and reverse swing.',
            photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300'
        }
    ];

    for (const p of playerProfiles) {
        db.run(
            `INSERT OR REPLACE INTO player_profiles (
                id, user_id, sport_id, full_name, date_of_birth, age, gender, location, state_region,
                primary_role, batting_style, bowling_style, handedness, height_cm, weight_kg, wingspan_cm,
                experience_years, academy_club, competition_level, jersey_number, bio, profile_photo_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                p.id, p.user_id, 'cricket', p.full_name, p.dob, p.age, p.gender, p.location, p.state_region,
                p.primary_role, p.batting_style, p.bowling_style, p.handedness, p.height_cm, p.weight_kg, p.wingspan_cm,
                p.experience_years, p.academy_club, p.competition_level, p.jersey_number, p.bio, p.photo
            ]
        );
    }

    // 4. Batting Stats
    const battingData = [
        {
            id: 'b_rahul',
            player_id: 'p_rahul',
            matches: 28,
            innings: 26,
            runs: 1140,
            balls_faced: 775,
            highest_score: 112,
            is_not_out_highest: 1,
            batting_average: 47.5,
            strike_rate: 147.1,
            fours: 118,
            sixes: 34,
            fifties: 7,
            hundreds: 3,
            not_outs: 2,
            dot_ball_percentage: 36.2,
            boundary_percentage: 21.8,
            balls_per_boundary: 5.1,
            powerplay_strike_rate: 156.4,
            middle_overs_strike_rate: 132.8,
            death_overs_strike_rate: 172.5,
            avg_vs_pace: 52.4,
            avg_vs_spin: 39.8,
            chase_average: 51.2,
            pressure_index: 86.5
        },
        {
            id: 'b_vikram',
            player_id: 'p_vikram',
            matches: 24,
            innings: 14,
            runs: 165,
            balls_faced: 120,
            highest_score: 34,
            is_not_out_highest: 1,
            batting_average: 15.0,
            strike_rate: 137.5,
            fours: 12,
            sixes: 8,
            fifties: 0,
            hundreds: 0,
            not_outs: 3,
            dot_ball_percentage: 52.0,
            boundary_percentage: 16.6,
            balls_per_boundary: 6.0,
            powerplay_strike_rate: 0,
            middle_overs_strike_rate: 110,
            death_overs_strike_rate: 155,
            avg_vs_pace: 18.0,
            avg_vs_spin: 11.0,
            chase_average: 14.0,
            pressure_index: 68.0
        },
        {
            id: 'b_ananya',
            player_id: 'p_ananya',
            matches: 22,
            innings: 20,
            runs: 680,
            balls_faced: 540,
            highest_score: 76,
            is_not_out_highest: 0,
            batting_average: 37.8,
            strike_rate: 125.9,
            fours: 64,
            sixes: 11,
            fifties: 5,
            hundreds: 0,
            not_outs: 2,
            dot_ball_percentage: 41.0,
            boundary_percentage: 13.9,
            balls_per_boundary: 7.2,
            powerplay_strike_rate: 122.0,
            middle_overs_strike_rate: 128.5,
            death_overs_strike_rate: 138.0,
            avg_vs_pace: 35.0,
            avg_vs_spin: 42.5,
            chase_average: 44.0,
            pressure_index: 82.0
        },
        {
            id: 'b_rohit',
            player_id: 'p_rohit',
            matches: 32,
            innings: 30,
            runs: 1380,
            balls_faced: 1150,
            highest_score: 124,
            is_not_out_highest: 1,
            batting_average: 53.1,
            strike_rate: 120.0,
            fours: 142,
            sixes: 18,
            fifties: 10,
            hundreds: 4,
            not_outs: 4,
            dot_ball_percentage: 34.0,
            boundary_percentage: 15.5,
            balls_per_boundary: 7.1,
            powerplay_strike_rate: 118.0,
            middle_overs_strike_rate: 122.0,
            death_overs_strike_rate: 140.0,
            avg_vs_pace: 56.0,
            avg_vs_spin: 48.0,
            chase_average: 58.0,
            pressure_index: 89.0
        },
        {
            id: 'b_kavya',
            player_id: 'p_kavya',
            matches: 25,
            innings: 24,
            runs: 790,
            balls_faced: 610,
            highest_score: 68,
            is_not_out_highest: 1,
            batting_average: 39.5,
            strike_rate: 129.5,
            fours: 82,
            sixes: 9,
            fifties: 6,
            hundreds: 0,
            not_outs: 4,
            dot_ball_percentage: 38.5,
            boundary_percentage: 14.9,
            balls_per_boundary: 6.7,
            powerplay_strike_rate: 132.0,
            middle_overs_strike_rate: 126.0,
            death_overs_strike_rate: 135.0,
            avg_vs_pace: 36.5,
            avg_vs_spin: 44.0,
            chase_average: 42.0,
            pressure_index: 84.0
        },
        {
            id: 'b_samir',
            player_id: 'p_samir',
            matches: 20,
            innings: 10,
            runs: 85,
            balls_faced: 65,
            highest_score: 22,
            is_not_out_highest: 0,
            batting_average: 10.6,
            strike_rate: 130.8,
            fours: 6,
            sixes: 4,
            fifties: 0,
            hundreds: 0,
            not_outs: 2,
            dot_ball_percentage: 58.0,
            boundary_percentage: 15.3,
            balls_per_boundary: 6.5,
            powerplay_strike_rate: 0,
            middle_overs_strike_rate: 100,
            death_overs_strike_rate: 142,
            avg_vs_pace: 12.0,
            avg_vs_spin: 8.0,
            chase_average: 10.0,
            pressure_index: 62.0
        }
    ];

    for (const b of battingData) {
        db.run(
            `INSERT OR REPLACE INTO batting_stats (
                id, player_id, matches, innings, runs, balls_faced, highest_score, is_not_out_highest,
                batting_average, strike_rate, fours, sixes, fifties, hundreds, not_outs, dot_ball_percentage,
                boundary_percentage, balls_per_boundary, powerplay_strike_rate, middle_overs_strike_rate,
                death_overs_strike_rate, avg_vs_pace, avg_vs_spin, chase_average, pressure_index
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                b.id, b.player_id, b.matches, b.innings, b.runs, b.balls_faced, b.highest_score, b.is_not_out_highest,
                b.batting_average, b.strike_rate, b.fours, b.sixes, b.fifties, b.hundreds, b.not_outs, b.dot_ball_percentage,
                b.boundary_percentage, b.balls_per_boundary, b.powerplay_strike_rate, b.middle_overs_strike_rate,
                b.death_overs_strike_rate, b.avg_vs_pace, b.avg_vs_spin, b.chase_average, b.pressure_index
            ]
        );
    }

    // 5. Bowling Stats
    const bowlingData = [
        {
            id: 'bw_vikram',
            player_id: 'p_vikram',
            matches: 24,
            innings: 24,
            overs: 92.4,
            maidens: 8,
            runs_conceded: 580,
            wickets: 46,
            best_bowling_wickets: 5,
            best_bowling_runs: 18,
            bowling_average: 12.6,
            economy_rate: 6.26,
            strike_rate: 12.1,
            dot_ball_percentage: 62.4,
            four_wicket_hauls: 3,
            five_wicket_hauls: 2,
            average_speed_kmh: 134.8,
            max_speed_kmh: 141.2,
            yorker_percentage: 24.5,
            bouncer_percentage: 18.0,
            powerplay_economy: 5.4,
            death_overs_economy: 7.8,
            wickets_vs_top_order: 28
        },
        {
            id: 'bw_ananya',
            player_id: 'p_ananya',
            matches: 22,
            innings: 22,
            overs: 80.0,
            maidens: 5,
            runs_conceded: 470,
            wickets: 34,
            best_bowling_wickets: 4,
            best_bowling_runs: 16,
            bowling_average: 13.8,
            economy_rate: 5.88,
            strike_rate: 14.1,
            dot_ball_percentage: 58.5,
            four_wicket_hauls: 2,
            five_wicket_hauls: 0,
            average_speed_kmh: 82.5,
            max_speed_kmh: 88.0,
            yorker_percentage: 5.0,
            bouncer_percentage: 0.0,
            powerplay_economy: 6.1,
            death_overs_economy: 6.8,
            wickets_vs_top_order: 19
        },
        {
            id: 'bw_samir',
            player_id: 'p_samir',
            matches: 20,
            innings: 20,
            overs: 76.0,
            maidens: 4,
            runs_conceded: 494,
            wickets: 32,
            best_bowling_wickets: 4,
            best_bowling_runs: 22,
            bowling_average: 15.4,
            economy_rate: 6.50,
            strike_rate: 14.2,
            dot_ball_percentage: 56.0,
            four_wicket_hauls: 2,
            five_wicket_hauls: 0,
            average_speed_kmh: 128.5,
            max_speed_kmh: 134.0,
            yorker_percentage: 32.0,
            bouncer_percentage: 12.0,
            powerplay_economy: 5.8,
            death_overs_economy: 7.1,
            wickets_vs_top_order: 16
        }
    ];

    for (const bw of bowlingData) {
        db.run(
            `INSERT OR REPLACE INTO bowling_stats (
                id, player_id, matches, innings, overs, maidens, runs_conceded, wickets,
                best_bowling_wickets, best_bowling_runs, bowling_average, economy_rate, strike_rate,
                dot_ball_percentage, four_wicket_hauls, five_wicket_hauls, average_speed_kmh, max_speed_kmh,
                yorker_percentage, bouncer_percentage, powerplay_economy, death_overs_economy, wickets_vs_top_order
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                bw.id, bw.player_id, bw.matches, bw.innings, bw.overs, bw.maidens, bw.runs_conceded, bw.wickets,
                bw.best_bowling_wickets, bw.best_bowling_runs, bw.bowling_average, bw.economy_rate, bw.strike_rate,
                bw.dot_ball_percentage, bw.four_wicket_hauls, bw.five_wicket_hauls, bw.average_speed_kmh, bw.max_speed_kmh,
                bw.yorker_percentage, bw.bouncer_percentage, bw.powerplay_economy, bw.death_overs_economy, bw.wickets_vs_top_order
            ]
        );
    }

    // 6. Fielding Stats
    const fieldingData = [
        ['f_rahul', 'p_rahul', 28, 19, 2, 6, 0, 14, 9, 64.3, 'cover / point', 91.0],
        ['f_vikram', 'p_vikram', 24, 8, 1, 2, 0, 6, 3, 50.0, 'fine leg / long on', 84.0],
        ['f_ananya', 'p_ananya', 22, 14, 1, 4, 0, 10, 7, 70.0, 'backward point', 88.5],
        ['f_rohit', 'p_rohit', 32, 18, 3, 3, 0, 11, 6, 54.5, 'slip / mid-off', 82.0],
        ['f_kavya', 'p_kavya', 25, 28, 2, 9, 12, 18, 15, 83.3, 'wicketkeeper', 95.5],
        ['f_samir', 'p_samir', 20, 7, 1, 1, 0, 5, 2, 40.0, 'mid-on / deep square', 80.0]
    ];

    for (const f of fieldingData) {
        db.run(
            `INSERT OR REPLACE INTO fielding_stats (
                id, player_id, matches, catches, dropped_catches, run_outs, stumpings,
                direct_hit_attempts, direct_hit_successes, direct_hit_percentage, primary_fielding_position, sprint_reaction_score
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            f
        );
    }

    // 7. Physical Tests
    const physicalTests = [
        // Rahul Sharma
        ['pt_r1', 'p_rahul', 'sprint_10m', 1.74, 's', 92.0, 94.0, 0, 1.0, 'Explosive acceleration off the mark'],
        ['pt_r2', 'p_rahul', 'sprint_30m', 3.98, 's', 89.0, 91.0, 0, 1.0, 'Excellent top-end sprint speed'],
        ['pt_r3', 'p_rahul', 'vertical_jump', 62.5, 'cm', 88.0, 90.0, 0, 1.0, 'High lower-body vertical power'],
        ['pt_r4', 'p_rahul', 'standing_broad_jump', 2.52, 'm', 91.0, 93.0, 1, 0.92, 'CV Estimated broad jump with calibration reference'],
        ['pt_r5', 'p_rahul', 'reaction_time', 188.0, 'ms', 94.0, 96.0, 0, 1.0, 'Visual stimulus reaction test'],

        // Vikram Rathore
        ['pt_v1', 'p_vikram', 'sprint_10m', 1.70, 's', 95.0, 97.0, 0, 1.0, 'Elite fast-bowler run-up acceleration'],
        ['pt_v2', 'p_vikram', 'sprint_30m', 3.92, 's', 92.0, 94.0, 0, 1.0, 'High sprint velocity'],
        ['pt_v3', 'p_vikram', 'standing_broad_jump', 2.68, 'm', 96.0, 98.0, 1, 0.94, 'CV Estimated explosive broad jump'],
        ['pt_v4', 'p_vikram', 'vertical_jump', 68.0, 'cm', 94.0, 96.0, 0, 1.0, 'Exceptional takeoff power'],

        // Ananya Patel
        ['pt_a1', 'p_ananya', 'shuttle_run', 9.15, 's', 90.0, 92.0, 0, 1.0, 'Rapid lateral change of direction'],
        ['pt_a2', 'p_ananya', 'single_leg_balance', 48.0, 's', 93.0, 95.0, 0, 1.0, 'Superior core balance'],
        ['pt_a3', 'p_ananya', 'reaction_time', 195.0, 'ms', 91.0, 93.0, 0, 1.0, 'Fast visual reaction']
    ];

    for (const pt of physicalTests) {
        db.run(
            `INSERT OR REPLACE INTO physical_tests (
                id, player_id, test_type, raw_value, unit, score, percentile, is_cv_estimated, cv_confidence, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            pt
        );
    }

    // 8. Assessment Sessions & CV Results
    const sessions = [
        ['sess_r1', 'p_rahul', 'batting_cv', 'completed', 88.5, 'Batting stance and drive biomechanics analysis'],
        ['sess_v1', 'p_vikram', 'bowling_cv', 'completed', 91.0, 'Fast bowling action and delivery release tracking'],
        ['sess_a1', 'p_ananya', 'batting_cv', 'completed', 86.0, 'Leg spin action and balance assessment']
    ];

    for (const s of sessions) {
        db.run(
            `INSERT OR REPLACE INTO assessment_sessions (id, player_id, session_type, status, overall_performance_score, notes) VALUES (?, ?, ?, ?, ?, ?)`,
            s
        );
    }

    const cvData = [
        {
            id: 'cv_r1',
            session_id: 'sess_r1',
            player_id: 'p_rahul',
            name: 'batting_mechanics',
            posture: 91.0,
            balance: 89.0,
            hip: 86.0,
            shoulder: 88.0,
            head: 94.0,
            eff: 88.0,
            tech: 87.0,
            stance_ratio: 1.15,
            backlift_angle: 42.5,
            knee_flexion: 132.0,
            hip_shoulder_sep: 28.5,
            speed_kmh: 0,
            dist_m: 0,
            conf: 0.94,
            obs: JSON.stringify([
                'Head position stays perfectly still over the ball during initiation.',
                'Stance base width is optimal (1.15x shoulder width) providing great balance.',
                'Clean hip-shoulder separation angle creating strong rotational torque.',
                'Follow-through finishes with high elbow and steady center of gravity.'
            ])
        },
        {
            id: 'cv_v1',
            session_id: 'sess_v1',
            player_id: 'p_vikram',
            name: 'bowling_mechanics',
            posture: 92.0,
            balance: 88.0,
            hip: 90.0,
            shoulder: 94.0,
            head: 91.0,
            eff: 90.0,
            tech: 91.0,
            stance_ratio: 1.35,
            backlift_angle: 0,
            knee_flexion: 168.0,
            hip_shoulder_sep: 34.0,
            speed_kmh: 138.4,
            dist_m: 0,
            conf: 0.91,
            obs: JSON.stringify([
                'Bracing front leg creates powerful kinetic leverage at delivery stride.',
                'Steep high arm release angle maximizing bounce on hard wickets.',
                'Explosive hip-shoulder rotational snap measured at 34° separation.',
                'Consistent gather and alignment towards the off-stump channel.'
            ])
        }
    ];

    for (const c of cvData) {
        db.run(
            `INSERT OR REPLACE INTO cv_assessments (
                id, session_id, player_id, assessment_name, posture_stability_score, balance_score,
                hip_rotation_score, shoulder_rotation_score, head_stability_score, movement_efficiency_score,
                technique_consistency_score, stance_width_ratio, bat_backlift_angle_deg, front_knee_flexion_deg,
                hip_shoulder_separation_deg, estimated_speed_kmh, estimated_distance_m, measurement_confidence, raw_observations_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                c.id, c.session_id, c.player_id, c.name, c.posture, c.balance, c.hip, c.shoulder, c.head, c.eff, c.tech,
                c.stance_ratio, c.backlift_angle, c.knee_flexion, c.hip_shoulder_sep, c.speed_kmh, c.dist_m, c.conf, c.obs
            ]
        );
    }

    // 9. Progress History (T1, T2, T3, Current)
    const progressRecords = [
        // Rahul Sharma Trajectory
        ['pr_r1', 'p_rahul', 'T1_Baseline', '2025-06-15', 74.0, 70.0, 80.0, 72.0, 70.0, 82.0, 'Baseline academy intake test'],
        ['pr_r2', 'p_rahul', 'T2_Mid_Season', '2025-09-20', 80.0, 76.0, 85.0, 78.0, 76.0, 88.0, 'Mid-season state tournament review'],
        ['pr_r3', 'p_rahul', 'T3_Recent', '2025-12-10', 85.0, 80.0, 89.0, 84.0, 80.0, 92.0, 'Post-zonal camp assessment'],
        ['pr_r4', 'p_rahul', 'Current', '2026-02-18', 88.0, 84.0, 91.0, 87.0, 82.0, 94.0, 'Latest StarQ AI multi-modal evaluation'],

        // Vikram Rathore Trajectory
        ['pr_v1', 'p_vikram', 'T1_Baseline', '2025-06-15', 76.0, 74.0, 86.0, 75.0, 72.0, 84.0, 'Intake pace trials'],
        ['pr_v2', 'p_vikram', 'T2_Mid_Season', '2025-09-20', 82.0, 80.0, 90.0, 82.0, 78.0, 88.0, 'Pace foundation speed calibration'],
        ['pr_v3', 'p_vikram', 'T3_Recent', '2025-12-10', 87.0, 85.0, 93.0, 87.0, 82.0, 92.0, 'State U19 tournament metrics'],
        ['pr_v4', 'p_vikram', 'Current', '2026-02-18', 91.0, 89.0, 95.0, 91.0, 84.0, 96.0, 'Latest AI assessment: clocked 141.2 km/h max']
    ];

    for (const pr of progressRecords) {
        db.run(
            `INSERT OR REPLACE INTO progress_history (
                id, player_id, evaluation_phase, recorded_date, overall_potential,
                performance_score, athletic_score, technical_score, consistency_score, development_score, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            pr
        );
    }

    // 10. Generate and Insert ML Talent Scores for each player
    for (const p of playerProfiles) {
        const batting = battingData.find(b => b.player_id === p.id);
        const bowling = bowlingData.find(bw => bw.player_id === p.id);
        const fielding = { direct_hit_percentage: 65, sprint_reaction_score: 85 };
        const pTests = physicalTests.filter(pt => pt[1] === p.id).map(pt => ({ test_type: pt[2], raw_value: pt[3], score: pt[5] }));
        const pCv = cvData.filter(c => c.player_id === p.id).map(c => ({
            posture_stability_score: c.posture,
            balance_score: c.balance,
            hip_rotation_score: c.hip,
            shoulder_rotation_score: c.shoulder,
            head_stability_score: c.head,
            movement_efficiency_score: c.eff
        }));
        const pProg = progressRecords.filter(pr => pr[1] === p.id).map(pr => ({
            recorded_date: pr[3],
            overall_potential: pr[4],
            performance_score: pr[5],
            athletic_score: pr[6]
        }));

        const evalResult = evaluatePlayerTalent({
            player: p,
            batting,
            bowling,
            fielding,
            physicalTests: pTests,
            cvAssessments: pCv,
            progressHistory: pProg
        });

        db.run(
            `INSERT OR REPLACE INTO talent_scores (
                id, player_id, overall_talent_potential, current_performance_score, athletic_potential_score,
                technical_skill_score, consistency_score, development_trajectory_score, talent_tier,
                primary_archetype, secondary_archetype, archetype_similarity_pct, model_version,
                prediction_confidence, sample_size_matches, strengths_json, development_areas_json,
                ai_recommendations_json, explainability_factors_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                `ts_${p.id}`,
                p.id,
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
    }

    // 11. Scout Watchlist
    db.run(
        `INSERT OR REPLACE INTO scout_watchlist (id, scout_user_id, player_id, priority_level, private_scout_notes) VALUES (?, ?, ?, ?, ?)`,
        ['sw_1', 'u_scout', 'p_rahul', 'high', 'Top priority for upcoming state U19 camp. High bat speed and composure against express pace.']
    );
    db.run(
        `INSERT OR REPLACE INTO scout_watchlist (id, scout_user_id, player_id, priority_level, private_scout_notes) VALUES (?, ?, ?, ?, ?)`,
        ['sw_2', 'u_scout', 'p_vikram', 'high', 'Rare express pace talent with 140+ ceiling. Braced front knee is textbook.']
    );

    saveDb();
    console.log('✅ StarQ Database seeded successfully with 6 diverse player profiles, statistics, CV sessions, and ML talent reports!');
}

if (require.main === module) {
    seed().catch(err => {
        console.error('Seeding error:', err);
        process.exit(1);
    });
}

module.exports = seed;
