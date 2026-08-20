export interface User {
  id: string;
  email: string;
  role: 'player' | 'coach' | 'scout' | 'admin';
  full_name: string;
  avatar_url?: string;
  phone?: string;
  playerId?: string;
}

export interface PlayerProfile {
  id: string;
  user_id: string;
  sport_id: string;
  full_name: string;
  date_of_birth?: string;
  age: number;
  gender: string;
  location: string;
  state_region?: string;
  country?: string;
  primary_role: 'batter' | 'fast_bowler' | 'spin_bowler' | 'all_rounder' | 'wicket_keeper';
  batting_style?: string;
  bowling_style?: string;
  handedness?: string;
  height_cm?: number;
  weight_kg?: number;
  wingspan_cm?: number;
  experience_years?: number;
  academy_club?: string;
  competition_level: 'school' | 'district' | 'division_club' | 'state_u16' | 'state_u19' | 'national_camp';
  jersey_number?: number;
  bio?: string;
  profile_photo_url?: string;
}

export interface BattingStats {
  id: string;
  player_id: string;
  matches: number;
  innings: number;
  runs: number;
  balls_faced: number;
  highest_score: number;
  is_not_out_highest: number;
  batting_average: number;
  strike_rate: number;
  fours: number;
  sixes: number;
  fifties: number;
  hundreds: number;
  not_outs: number;
  dot_ball_percentage: number;
  boundary_percentage: number;
  balls_per_boundary: number;
  powerplay_strike_rate: number;
  middle_overs_strike_rate: number;
  death_overs_strike_rate: number;
  avg_vs_pace: number;
  avg_vs_spin: number;
  chase_average: number;
  pressure_index: number;
}

export interface BowlingStats {
  id: string;
  player_id: string;
  matches: number;
  innings: number;
  overs: number;
  maidens: number;
  runs_conceded: number;
  wickets: number;
  best_bowling_wickets: number;
  best_bowling_runs: number;
  bowling_average: number;
  economy_rate: number;
  strike_rate: number;
  dot_ball_percentage: number;
  four_wicket_hauls: number;
  five_wicket_hauls: number;
  average_speed_kmh: number;
  max_speed_kmh: number;
  yorker_percentage: number;
  bouncer_percentage: number;
  powerplay_economy: number;
  death_overs_economy: number;
  wickets_vs_top_order: number;
}

export interface FieldingStats {
  id: string;
  player_id: string;
  matches: number;
  catches: number;
  dropped_catches: number;
  run_outs: number;
  stumpings: number;
  direct_hit_attempts: number;
  direct_hit_successes: number;
  direct_hit_percentage: number;
  primary_fielding_position: string;
  sprint_reaction_score: number;
}

export interface PhysicalTest {
  id: string;
  player_id: string;
  test_type: string;
  raw_value: number;
  unit: string;
  score: number;
  percentile: number;
  is_cv_estimated: number;
  cv_confidence: number;
  tested_at: string;
  notes?: string;
}

export interface CVAssessment {
  id: string;
  session_id: string;
  player_id: string;
  assessment_name: string;
  posture_stability_score: number;
  balance_score: number;
  hip_rotation_score: number;
  shoulder_rotation_score: number;
  head_stability_score: number;
  movement_efficiency_score: number;
  technique_consistency_score: number;
  stance_width_ratio?: number;
  bat_backlift_angle_deg?: number;
  front_knee_flexion_deg?: number;
  hip_shoulder_separation_deg?: number;
  estimated_speed_kmh?: number;
  estimated_distance_m?: number;
  measurement_confidence: number;
  raw_observations_json?: string;
  created_at: string;
}

export interface TalentScore {
  id: string;
  player_id: string;
  overall_talent_potential: number;
  current_performance_score: number;
  athletic_potential_score: number;
  technical_skill_score: number;
  consistency_score: number;
  development_trajectory_score: number;
  talent_tier: 'Elite Potential' | 'High Potential' | 'Advanced' | 'Developing' | 'Emerging';
  primary_archetype: string;
  secondary_archetype?: string;
  archetype_similarity_pct: number;
  model_version: string;
  prediction_confidence: number;
  sample_size_matches: number;
  strengths: string[];
  development_areas: string[];
  ai_recommendations: string[];
  explainability_factors: string[];
  calculated_at: string;
}

export interface ProgressRecord {
  id: string;
  player_id: string;
  evaluation_phase: string;
  recorded_date: string;
  overall_potential: number;
  performance_score: number;
  athletic_score: number;
  technical_score: number;
  consistency_score: number;
  development_score: number;
  notes?: string;
}

export interface TalentReportResponse {
  player: PlayerProfile;
  talentScore: TalentScore;
  radarDimensions: Array<{ subject: string; score: number; fullMark: number }>;
  batting: BattingStats | null;
  bowling: BowlingStats | null;
  fielding: FieldingStats | null;
  physicalTests: PhysicalTest[];
  cvAssessments: CVAssessment[];
  progressHistory: ProgressRecord[];
  generatedAt: string;
}
