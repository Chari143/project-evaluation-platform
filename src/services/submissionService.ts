import { pool } from '../db';
import { Submission, SubmissionPayload } from '../types/submission';

export class SubmissionService {
    static async createSubmission(payload: SubmissionPayload): Promise<Submission> {
        const query = `
      INSERT INTO submissions (student_id, assignment_id, type, source_url, notes, status)
      VALUES ($1, $2, $3, $4, $5, 'PENDING')
      RETURNING id, student_id, assignment_id, type, source_url, notes, status, created_at, updated_at;
    `;
        const values = [
            payload.studentId,
            payload.assignmentId,
            payload.type,
            payload.sourceUrl,
            payload.notes ?? null,
        ];

        const result = await pool.query(query, values);
        const row = result.rows[0];

        return {
            id: row.id,
            studentId: row.student_id,
            assignmentId: row.assignment_id,
            type: row.type,
            sourceUrl: row.source_url,
            notes: row.notes ?? undefined,
            status: row.status,
            createdAt: row.created_at.toISOString(),
            updatedAt: row.updated_at.toISOString(),
        };
    }

    static async getSubmissionById(id: string): Promise<Submission | null> {
        const query = `
      SELECT id, student_id, assignment_id, type, source_url, notes, status, created_at, updated_at
      FROM submissions
      WHERE id = $1;
    `;

        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) {
            return null;
        }

        const row = result.rows[0];
        return {
            id: row.id,
            studentId: row.student_id,
            assignmentId: row.assignment_id,
            type: row.type,
            sourceUrl: row.source_url,
            notes: row.notes ?? undefined,
            status: row.status,
            createdAt: row.created_at.toISOString(),
            updatedAt: row.updated_at.toISOString(),
        };
    }

    static async listSubmissions(): Promise<Submission[]> {
        const query = `
      SELECT id, student_id, assignment_id, type, source_url, notes, status, created_at, updated_at
      FROM submissions
      ORDER BY created_at DESC;
    `;

        const result = await pool.query(query);
        return result.rows.map((row) => ({
            id: row.id,
            studentId: row.student_id,
            assignmentId: row.assignment_id,
            type: row.type,
            sourceUrl: row.source_url,
            notes: row.notes ?? undefined,
            status: row.status,
            createdAt: row.created_at.toISOString(),
            updatedAt: row.updated_at.toISOString(),
        }));
    }
}
