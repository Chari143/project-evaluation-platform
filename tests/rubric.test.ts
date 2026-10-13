import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { pool } from '../src/db';

describe('Rubric API Endpoints', () => {
    afterAll(async () => {
        await pool.end();
    });

    describe('POST /api/v1/rubrics', () => {
        it('should create a rubric with valid criteria summing to 100%', async () => {
            const payload = {
                assignmentId: 'asg_backend_01',
                name: 'Test Rubric',
                criteria: [
                    { dimension: 'Functionality', weight: 60, description: 'Core features' },
                    { dimension: 'Code Quality', weight: 40, description: 'Clean code' },
                ],
            };

            const res = await request(app).post('/api/v1/rubrics').send(payload);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('id');
            expect(res.body.data.criteria).toHaveLength(2);
            expect(res.body.data.criteria[0].weight).toBe(60);
        });

        it('should reject criteria whose weights do not sum to 100', async () => {
            const payload = {
                assignmentId: 'asg_backend_01',
                name: 'Bad Rubric',
                criteria: [
                    { dimension: 'Functionality', weight: 50, description: 'Core features' },
                    { dimension: 'Code Quality', weight: 30, description: 'Clean code' },
                ],
            };

            const res = await request(app).post('/api/v1/rubrics').send(payload);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toContain('100%');
        });
        // missing assignmentId and criteria
        it('should reject request with missing required fields', async () => {
            const res = await request(app)
                .post('/api/v1/rubrics')
                .send({ name: 'Incomplete Rubric' });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /api/v1/rubrics/assignment/:assignmentId', () => {
        it('should return the seeded rubric for the default assignment', async () => {
            const res = await request(app).get('/api/v1/rubrics/assignment/asg_backend_01');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.assignmentId).toBe('asg_backend_01');
            expect(res.body.data.criteria.length).toBeGreaterThan(0);

            // Verify all weights sum to 100
            const total = res.body.data.criteria.reduce(
                (sum: number, c: any) => sum + c.weight, 0
            );
            expect(Math.round(total)).toBe(100);
        });

        it('should return 404 for unknown assignment', async () => {
            const res = await request(app).get('/api/v1/rubrics/assignment/non_existent');
            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });
    });
});
