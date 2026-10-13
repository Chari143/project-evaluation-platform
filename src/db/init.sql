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



-- 4. Rubrics
CREATE TABLE IF NOT EXISTS rubrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Rubric Criteria table
CREATE TABLE IF NOT EXISTS rubric_criteria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rubric_id UUID NOT NULL REFERENCES rubrics(id) ON DELETE CASCADE,
    dimension VARCHAR(64) NOT NULL,       
    weight NUMERIC(5, 2) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rubrics_assignment_id ON rubrics(assignment_id);
CREATE INDEX IF NOT EXISTS idx_rubric_criteria_rubric_id ON rubric_criteria(rubric_id);

-- Seed data for rubric metrics
DO $$
DECLARE
    default_rubric_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM rubrics WHERE assignment_id = 'asg_backend_01') THEN
        INSERT INTO rubrics (assignment_id, name, description)
        VALUES ('asg_backend_01', 'Standard Full-Stack Project Rubric', 'Default 6-dimension evaluation rubric')
        RETURNING id INTO default_rubric_id;

        INSERT INTO rubric_criteria (rubric_id, dimension, weight, description)
        VALUES 
            (default_rubric_id, 'Functionality', 25.0, 'Core features work properly and edge cases handled'),
            (default_rubric_id, 'Code Quality', 20.0, 'Clean code, readability, adherence to standards, error handling'),
            (default_rubric_id, 'Architecture', 20.0, 'System design, modularity, separation of concerns, scalability'),
            (default_rubric_id, 'Problem Solving', 15.0, 'Algorithmic efficiency, trade-offs, sound engineering reasoning'),
            (default_rubric_id, 'Documentation', 10.0, 'Clear README, API documentation, setup instructions'),
            (default_rubric_id, 'Innovation / AI Usage', 10.0, 'Creative approaches, modern tools, AI integration');
    END IF;
END $$;






-- 6. Evaluation job table
CREATE TABLE IF NOT EXISTS evaluation_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES submissions(id),
    rubric_id UUID NOT NULL REFERENCES rubrics(id),
    status VARCHAR(32) NOT NULL DEFAULT 'QUEUED',  -- QUEUED | PROCESSING | COMPLETED | FAILED
    attempts INT NOT NULL DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_eval_jobs_submission_id ON evaluation_jobs(submission_id);
CREATE INDEX IF NOT EXISTS idx_eval_jobs_status ON evaluation_jobs(status);
