-- StarQ Sports Talent Assessment Database Schema
-- Designed to be sport-agnostic with deep Cricket implementation

-- Sports registry
CREATE TABLE IF NOT EXISTS sports (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT DEFAULT 'team',
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Users & Authentication
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('player', 'coach', 'scout', 'admin')),
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Player Profiles
CREATE TABLE IF NOT EXISTS player_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    sport_id TEXT NOT NULL DEFAULT 'cricket',
    full_name TEXT NOT NULL,
    date_of_birth TEXT,
    age INTEGER NOT NULL,
    gender TEXT NOT NULL,
    location TEXT NOT NULL,
    state_region TEXT,
    country TEXT DEFAULT 'India',
    
    -- Cricket specific attributes
    primary_role TEXT NOT NULL, -- 'batter', 'fast_bowler', 'spin_bowler', 'all_rounder', 'wicket_keeper'
    batting_style TEXT, -- 'right_hand_bat', 'left_hand_bat'
    bowling_style TEXT, -- 'right_arm_fast', 'left_arm_fast', 'right_arm_off_spin', 'right_arm_leg_spin', 'left_arm_orthodox', 'left_arm_chinaman', 'none'
    handedness TEXT DEFAULT 'right',
    
    -- Physical attributes
    height_cm REAL,
    weight_kg REAL,
    wingspan_cm REAL,
    
    -- Background & Level
    experience_years REAL DEFAULT 0,
    academy_club TEXT,
    competition_level TEXT NOT NULL, -- 'school', 'district', 'state_u16', 'state_u19', 'division_club', 'national_camp'
    jersey_number INTEGER,
    bio TEXT,
    profile_photo_url TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (sport_id) REFERENCES sports(id)
);

-- Batting Statistics
CREATE TABLE IF NOT EXISTS batting_stats (
    id TEXT PRIMARY KEY,
    player_id TEXT NOT NULL,
    matches INTEGER DEFAULT 0,
    innings INTEGER DEFAULT 0,
    runs INTEGER DEFAULT 0,
    balls_faced INTEGER DEFAULT 0,
    highest_score INTEGER DEFAULT 0,
    is_not_out_highest INTEGER DEFAULT 0,
    batting_average REAL DEFAULT 0.0,
    strike_rate REAL DEFAULT 0.0,
    fours INTEGER DEFAULT 0,
    sixes INTEGER DEFAULT 0,
    fifties INTEGER DEFAULT 0,
    hundreds INTEGER DEFAULT 0,
    not_outs INTEGER DEFAULT 0,
    dot_ball_percentage REAL DEFAULT 0.0,
    boundary_percentage REAL DEFAULT 0.0,
    balls_per_boundary REAL DEFAULT 0.0,
    
    -- Phase breakdown (JSON for flexible advanced tracking)
    powerplay_strike_rate REAL DEFAULT 0.0,
    middle_overs_strike_rate REAL DEFAULT 0.0,
    death_overs_strike_rate REAL DEFAULT 0.0,
    avg_vs_pace REAL DEFAULT 0.0,
    avg_vs_spin REAL DEFAULT 0.0,
    chase_average REAL DEFAULT 0.0,
    pressure_index REAL DEFAULT 0.0, -- 0-100
    
    season_year TEXT DEFAULT '2025-26',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES player_profiles(id) ON DELETE CASCADE
);

-- Bowling Statistics
CREATE TABLE IF NOT EXISTS bowling_stats (
    id TEXT PRIMARY KEY,
    player_id TEXT NOT NULL,
    matches INTEGER DEFAULT 0,
    innings INTEGER DEFAULT 0,
    overs REAL DEFAULT 0.0,
    maidens INTEGER DEFAULT 0,
    runs_conceded INTEGER DEFAULT 0,
    wickets INTEGER DEFAULT 0,
    best_bowling_wickets INTEGER DEFAULT 0,
    best_bowling_runs INTEGER DEFAULT 0,
    bowling_average REAL DEFAULT 0.0,
    economy_rate REAL DEFAULT 0.0,
    strike_rate REAL DEFAULT 0.0,
    dot_ball_percentage REAL DEFAULT 0.0,
    four_wicket_hauls INTEGER DEFAULT 0,
    five_wicket_hauls INTEGER DEFAULT 0,
    
    -- Advanced Pace/Spin Metrics
    average_speed_kmh REAL DEFAULT 0.0,
    max_speed_kmh REAL DEFAULT 0.0,
    yorker_percentage REAL DEFAULT 0.0,
    bouncer_percentage REAL DEFAULT 0.0,
    powerplay_economy REAL DEFAULT 0.0,
    death_overs_economy REAL DEFAULT 0.0,
    wickets_vs_top_order INTEGER DEFAULT 0,
    
    season_year TEXT DEFAULT '2025-26',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES player_profiles(id) ON DELETE CASCADE
);

-- Fielding Statistics
CREATE TABLE IF NOT EXISTS fielding_stats (
    id TEXT PRIMARY KEY,
    player_id TEXT NOT NULL,
    matches INTEGER DEFAULT 0,
    catches INTEGER DEFAULT 0,
    dropped_catches INTEGER DEFAULT 0,
    run_outs INTEGER DEFAULT 0,
    stumpings INTEGER DEFAULT 0,
    direct_hit_attempts INTEGER DEFAULT 0,
    direct_hit_successes INTEGER DEFAULT 0,
    direct_hit_percentage REAL DEFAULT 0.0,
    primary_fielding_position TEXT DEFAULT 'cover/point',
    sprint_reaction_score REAL DEFAULT 80.0,
    
    season_year TEXT DEFAULT '2025-26',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES player_profiles(id) ON DELETE CASCADE
);

-- Physical Performance Tests
CREATE TABLE IF NOT EXISTS physical_tests (
    id TEXT PRIMARY KEY,
    player_id TEXT NOT NULL,
    test_type TEXT NOT NULL, -- 'sprint_10m', 'sprint_20m', 'sprint_30m', 'vertical_jump', 'standing_broad_jump', 'shuttle_run', 'beep_test', 'reaction_time', 'single_leg_balance'
    raw_value REAL NOT NULL,
    unit TEXT NOT NULL, -- 's', 'cm', 'm', 'ms', 'level'
    score REAL NOT NULL, -- 0-100 normalized
    percentile REAL DEFAULT 50.0,
    is_cv_estimated INTEGER DEFAULT 0,
    cv_confidence REAL DEFAULT 1.0,
    tested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (player_id) REFERENCES player_profiles(id) ON DELETE CASCADE
);

-- Assessment Sessions
CREATE TABLE IF NOT EXISTS assessment_sessions (
    id TEXT PRIMARY KEY,
    player_id TEXT NOT NULL,
    session_type TEXT NOT NULL, -- 'batting_cv', 'bowling_cv', 'broad_jump_cv', 'ball_speed_cv', 'full_assessment'
    status TEXT NOT NULL DEFAULT 'completed', -- 'in_progress', 'completed', 'aborted'
    overall_performance_score REAL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES player_profiles(id) ON DELETE CASCADE
);

-- Computer Vision Assessment Results
CREATE TABLE IF NOT EXISTS cv_assessments (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    player_id TEXT NOT NULL,
    assessment_name TEXT NOT NULL, -- 'batting_mechanics', 'bowling_mechanics', 'broad_jump', 'ball_speed_tracking'
    
    -- Biomechanics Scores (0-100)
    posture_stability_score REAL DEFAULT 0.0,
    balance_score REAL DEFAULT 0.0,
    hip_rotation_score REAL DEFAULT 0.0,
    shoulder_rotation_score REAL DEFAULT 0.0,
    head_stability_score REAL DEFAULT 0.0,
    movement_efficiency_score REAL DEFAULT 0.0,
    technique_consistency_score REAL DEFAULT 0.0,
    
    -- Specific measurements
    stance_width_ratio REAL,
    bat_backlift_angle_deg REAL,
    front_knee_flexion_deg REAL,
    hip_shoulder_separation_deg REAL,
    bowling_release_height_ratio REAL,
    estimated_speed_kmh REAL,
    estimated_distance_m REAL,
    measurement_confidence REAL DEFAULT 0.85,
    
    landmark_summary_json TEXT, -- JSON summary of key joint coordinates
    raw_observations_json TEXT, -- JSON array of qualitative feedback
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES player_profiles(id) ON DELETE CASCADE
);

-- AI / ML Talent Scores & Explainable Profiles
CREATE TABLE IF NOT EXISTS talent_scores (
    id TEXT PRIMARY KEY,
    player_id TEXT UNIQUE NOT NULL,
    overall_talent_potential REAL NOT NULL, -- 0-100
    current_performance_score REAL NOT NULL,
    athletic_potential_score REAL NOT NULL,
    technical_skill_score REAL NOT NULL,
    consistency_score REAL NOT NULL,
    development_trajectory_score REAL NOT NULL,
    
    talent_tier TEXT NOT NULL, -- 'Elite Potential', 'High Potential', 'Advanced', 'Developing', 'Emerging'
    primary_archetype TEXT NOT NULL, -- e.g., 'Aggressive Top-Order Batter', 'Express Fast Bowler', 'Power Finisher'
    secondary_archetype TEXT,
    archetype_similarity_pct REAL DEFAULT 85.0,
    
    model_version TEXT DEFAULT 'v1.4-random-forest-ensemble',
    prediction_confidence REAL NOT NULL, -- 0-100%
    sample_size_matches INTEGER DEFAULT 0,
    
    strengths_json TEXT NOT NULL, -- JSON array of strengths
    development_areas_json TEXT NOT NULL, -- JSON array of development areas
    ai_recommendations_json TEXT NOT NULL, -- JSON array of coaching drills & recommendations
    explainability_factors_json TEXT NOT NULL, -- JSON detailed rationale for score
    
    calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES player_profiles(id) ON DELETE CASCADE
);

-- Progress History (T1, T2, T3 Time-series for trajectory analysis)
CREATE TABLE IF NOT EXISTS progress_history (
    id TEXT PRIMARY KEY,
    player_id TEXT NOT NULL,
    evaluation_phase TEXT NOT NULL, -- 'T1_Baseline', 'T2_Mid_Season', 'T3_Recent', 'Current'
    recorded_date TEXT NOT NULL,
    overall_potential REAL NOT NULL,
    performance_score REAL NOT NULL,
    athletic_score REAL NOT NULL,
    technical_score REAL NOT NULL,
    consistency_score REAL NOT NULL,
    development_score REAL NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES player_profiles(id) ON DELETE CASCADE
);

-- Coach / Scout Shortlists & Notes
CREATE TABLE IF NOT EXISTS scout_watchlist (
    id TEXT PRIMARY KEY,
    scout_user_id TEXT NOT NULL,
    player_id TEXT NOT NULL,
    priority_level TEXT DEFAULT 'high', -- 'high', 'medium', 'watch'
    private_scout_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (scout_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES player_profiles(id) ON DELETE CASCADE
);
