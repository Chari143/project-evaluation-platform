

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('GET /health', () => {
    it('should return 200 with healthy status', async () => {
        const response = await request(app).get('/health');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('status', 'healthy');
        expect(response.body).toHaveProperty('timestamp');
        expect(response.body).toHaveProperty('version', '1.0.0');
    });

    it('should return 404 for unknown route', async () => {
        const response = await request(app).get('/unknown-route');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            success: false,
            error: 'Route not found',
        });
    });
});
