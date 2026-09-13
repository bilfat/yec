-- 1. Create Enums
CREATE TYPE role_type AS ENUM ('ADMIN', 'JUDGE');
CREATE TYPE competition_stage AS ENUM ('BMC', 'PITCHING');
CREATE TYPE assignment_scope AS ENUM ('ALL', 'CRITERIA');
CREATE TYPE evaluation_status AS ENUM ('PENDING', 'COMPLETED');
CREATE TYPE result_status AS ENUM ('PENDING', 'PASSED', 'FAILED');

-- 2. Create Core Tables

-- Users (Judges and Admins)
-- Note: id matches auth.users(id) from Supabase Auth
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  username VARCHAR(80) UNIQUE NOT NULL,
  password_hash TEXT, -- Retained for fallback or metadata if needed, though Supabase Auth handles actual password
  role role_type NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subthemes
CREATE TABLE subthemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(160) NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams (Participants)
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) UNIQUE NOT NULL,
  pin_hash TEXT NOT NULL,
  subtheme_id UUID REFERENCES subthemes(id) ON DELETE SET NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Competition Settings (Singleton)
CREATE TABLE competition_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_name VARCHAR(200) NOT NULL,
  bmc_submission_open BOOLEAN DEFAULT false,
  bmc_evaluation_open BOOLEAN DEFAULT false,
  pitching_submission_open BOOLEAN DEFAULT false,
  pitching_evaluation_open BOOLEAN DEFAULT false,
  announcement_title VARCHAR(200),
  announcement_content TEXT,
  participant_support_phone VARCHAR(30),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Evaluation Tables

-- Evaluation Templates
CREATE TABLE evaluation_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(160) NOT NULL,
  stage competition_stage NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criteria
CREATE TABLE criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES evaluation_templates(id) ON DELETE CASCADE,
  name VARCHAR(160) NOT NULL,
  weight DECIMAL(5,2) NOT NULL CHECK (weight >= 0 AND weight <= 100),
  sort_order INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criterion Points
CREATE TABLE criterion_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  criterion_id UUID NOT NULL REFERENCES criteria(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  sort_order INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Transaction Tables

-- Submissions
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  stage competition_stage NOT NULL,
  subtheme_id UUID REFERENCES subthemes(id) ON DELETE SET NULL,
  original_filename VARCHAR(255) NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size BIGINT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, stage)
);

-- Assignments
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judge_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  stage competition_stage NOT NULL,
  assignment_scope assignment_scope NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assignment Criteria (For CRITERIA scope)
CREATE TABLE assignment_criteria (
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  criterion_id UUID NOT NULL REFERENCES criteria(id) ON DELETE CASCADE,
  PRIMARY KEY (assignment_id, criterion_id)
);

-- Evaluations
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  status evaluation_status DEFAULT 'PENDING',
  notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(assignment_id, submission_id)
);

-- Evaluation Scores
CREATE TABLE evaluation_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  criterion_point_id UUID NOT NULL REFERENCES criterion_points(id) ON DELETE CASCADE,
  score DECIMAL(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(evaluation_id, criterion_point_id)
);

-- 5. Result Tables

-- Team Stage Results
CREATE TABLE team_stage_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  stage competition_stage NOT NULL,
  final_score DECIMAL(6,2),
  result_status result_status DEFAULT 'PENDING',
  locked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, stage)
);

-- Final Results
CREATE TABLE final_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE UNIQUE,
  rank INT NOT NULL,
  final_score DECIMAL(6,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW; 
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_teams_modtime BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_settings_modtime BEFORE UPDATE ON competition_settings FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_subthemes_modtime BEFORE UPDATE ON subthemes FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_eval_templates_modtime BEFORE UPDATE ON evaluation_templates FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_criteria_modtime BEFORE UPDATE ON criteria FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_criterion_points_modtime BEFORE UPDATE ON criterion_points FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_submissions_modtime BEFORE UPDATE ON submissions FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_assignments_modtime BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_evaluations_modtime BEFORE UPDATE ON evaluations FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_evaluation_scores_modtime BEFORE UPDATE ON evaluation_scores FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_team_stage_results_modtime BEFORE UPDATE ON team_stage_results FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_final_results_modtime BEFORE UPDATE ON final_results FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- 7. Row Level Security (RLS)
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE subthemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE criterion_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_stage_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE final_results ENABLE ROW LEVEL SECURITY;

-- Note: In this project, all logic is Server-Authoritative.
-- This means we only need Service Role / authenticated bypass for the API layer.
-- We will add basic SELECT policies for public/anon if needed, but mostly API handlers will use service_role or check session on the server.
