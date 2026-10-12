CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--Users
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'STUDENT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

--Assignments
CREATE TABLE IF NOT EXISTS assignments (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

--Submissions table
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(64) NOT NULL,
    assignment_id VARCHAR(64) NOT NULL,
    type VARCHAR(32) NOT NULL,
    source_url TEXT NOT NULL,
    notes TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- seed data
INSERT INTO users (id, name, email, role)
VALUES 
    ('std_001', 'Hari Chenna', 'hari@example.com', 'STUDENT'),
    ('eval_001', 'Lead Evaluator', 'evaluator@example.com', 'EVALUATOR')
ON CONFLICT (id) DO NOTHING;

INSERT INTO assignments (id, title, description)
VALUES 
    ('asg_backend_01', 'Backend Evaluation Platform', 'Design and implement an evaluation engine')
ON CONFLICT (id) DO NOTHING;
