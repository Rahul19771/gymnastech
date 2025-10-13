-- GymnaTech - Professional Gymnastics Scoring Platform Database Schema

-- Users table with role-based access
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'judge', 'official', 'athlete', 'public')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Apparatus configuration table
CREATE TABLE IF NOT EXISTS apparatus (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    discipline VARCHAR(50) DEFAULT 'womens_artistic',
    is_active BOOLEAN DEFAULT true,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events/Competitions table
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    start_time TIME,
    location VARCHAR(255),
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    config JSONB DEFAULT '{}',
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Athletes table
CREATE TABLE IF NOT EXISTS athletes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    country VARCHAR(3),
    club VARCHAR(255),
    registration_number VARCHAR(50) UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event athletes registration
CREATE TABLE IF NOT EXISTS event_athletes (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    athlete_id INTEGER NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    apparatus_ids INTEGER[] NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, athlete_id)
);

-- Event judges assignment
CREATE TABLE IF NOT EXISTS event_judges (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    apparatus_id INTEGER REFERENCES apparatus(id),
    panel VARCHAR(20) CHECK (panel IN ('d_panel', 'e_panel', 'head_judge')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, user_id, apparatus_id, panel)
);

-- Performances table
CREATE TABLE IF NOT EXISTS performances (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    athlete_id INTEGER NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    apparatus_id INTEGER NOT NULL REFERENCES apparatus(id),
    order_number INTEGER,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'scored', 'reviewed', 'finalized')),
    video_url TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, athlete_id, apparatus_id)
);

-- Scores table (individual judge scores)
CREATE TABLE IF NOT EXISTS scores (
    id SERIAL PRIMARY KEY,
    performance_id INTEGER NOT NULL REFERENCES performances(id) ON DELETE CASCADE,
    judge_id INTEGER NOT NULL REFERENCES users(id),
    score_type VARCHAR(10) NOT NULL CHECK (score_type IN ('d_score', 'e_score')),
    score_value DECIMAL(5, 3) NOT NULL CHECK (score_value >= 0),
    deductions JSONB DEFAULT '[]',
    penalties JSONB DEFAULT '[]',
    comments TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(performance_id, judge_id, score_type)
);

-- Final scores (computed results)
CREATE TABLE IF NOT EXISTS final_scores (
    id SERIAL PRIMARY KEY,
    performance_id INTEGER NOT NULL UNIQUE REFERENCES performances(id) ON DELETE CASCADE,
    d_score DECIMAL(5, 3) NOT NULL DEFAULT 0,
    e_score DECIMAL(5, 3) NOT NULL DEFAULT 0,
    neutral_deductions DECIMAL(5, 3) DEFAULT 0,
    final_score DECIMAL(6, 3) NOT NULL DEFAULT 0,
    e_scores_detail JSONB DEFAULT '{}',
    calculation_method VARCHAR(50) DEFAULT 'drop_high_low',
    is_official BOOLEAN DEFAULT false,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP
);

-- Audit log for transparency
CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER,
    old_data JSONB,
    new_data JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scoring rules configuration
CREATE TABLE IF NOT EXISTS scoring_rules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    discipline VARCHAR(50) NOT NULL,
    apparatus_id INTEGER REFERENCES apparatus(id),
    ruleset_version VARCHAR(50),
    rules JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    effective_from DATE,
    effective_until DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_athletes_registration ON athletes(registration_number);
CREATE INDEX idx_performances_event ON performances(event_id);
CREATE INDEX idx_performances_athlete ON performances(athlete_id);
CREATE INDEX idx_performances_status ON performances(status);
CREATE INDEX idx_scores_performance ON scores(performance_id);
CREATE INDEX idx_scores_judge ON scores(judge_id);
CREATE INDEX idx_final_scores_performance ON final_scores(performance_id);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);


