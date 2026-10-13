import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { pool } from '../src/db';

describe('Submission API Endpoints', () => {
    // Clean up DB pool connections
    afterAll(async () => {
        await pool.end();
    });

    describe('POST /api/v1/submissions', () => {
        it('should successfully create a submission with valid payload', async () => {
            const payload = {
                studentId: 'std_001',
                assignmentId: 'asg_backend_01',
                type: 'github',
                sourceUrl: 'https://github.com/Chari143/project-evaluation-platform',
                notes: 'Initial test submission',
            };

            const response = await request(app)
                .post('/api/v1/submissions')
                .send(payload);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.studentId).toBe(payload.studentId);
            expect(response.body.data.assignmentId).toBe(payload.assignmentId);
            expect(response.body.data.type).toBe(payload.type);
            expect(response.body.data.status).toBe('PENDING');
            expect(response.body.data.sourceUrl).toBe(payload.sourceUrl);
        });

        it('should reject submission if required fields are missing', async () => {
            const invalidPayload = {
                studentId: 'std_001',
                // missing assignmentId, type, sourceUrl
            };

            const response = await request(app)
                .post('/api/v1/submissions')
                .send(invalidPayload);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('Missing required fields');
        });

        it('should reject submission with unsupported submission type', async () => {
            // invalid type
            const invalidTypePayload = {
                studentId: 'std_001',
                assignmentId: 'asg_backend_01',
                type: 'ftp_server',
                sourceUrl: 'ftp://example.com/project',
            };

            const response = await request(app)
                .post('/api/v1/submissions')
                .send(invalidTypePayload);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('Invalid submission type');
        });
    });

    describe('GET /api/v1/submissions/:id', () => {
        it('should retrieve existing submission by ID', async () => {
            const createRes = await request(app)
                .post('/api/v1/submissions')
                .send({
                    studentId: 'std_001',
                    assignmentId: 'asg_backend_01',
                    type: 'zip',
                    sourceUrl: 'https://example.com/project.zip',
                });

            const submissionId = createRes.body.data.id;

            const getRes = await request(app).get(`/api/v1/submissions/${submissionId}`);

            expect(getRes.status).toBe(200);
            expect(getRes.body.success).toBe(true);
            expect(getRes.body.data.id).toBe(submissionId);
            expect(getRes.body.data.type).toBe('zip');
        });

        it('should return 404 for non-existent submission ID', async () => {
            const randomUuid = '00000000-0000-0000-0000-000000000000';
            const response = await request(app).get(`/api/v1/submissions/${randomUuid}`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });
});
