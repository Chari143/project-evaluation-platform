import { pool } from '../db';
import { Rubric, CreateRubricPayload, RubricCriterion } from '../types/rubric';

const criteriaObject = (r: any): RubricCriterion => ({
    id: r.id,
    rubricId: r.rubric_id,
    dimension: r.dimension,
    weight: parseFloat(r.weight),
    description: r.description,
    createdAt: r.created_at.toISOString(),
});

export class RubricService {
    static async createRubric(payload: CreateRubricPayload): Promise<Rubric> {
        const totalWeight = payload.criteria.reduce((sum, c) => sum + Number(c.weight), 0);
        if (Math.round(totalWeight) !== 100) {
            throw new Error(`Criteria weights must sum to 100%. Got: ${totalWeight}%`);
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const rubricRes = await client.query(
                `INSERT INTO rubrics (assignment_id, name, description)
                 VALUES ($1, $2, $3)
                 RETURNING id, assignment_id, name, description, created_at, updated_at;`,
                [payload.assignmentId, payload.name, payload.description ?? null]
            );
            const rubricRow = rubricRes.rows[0];

            const criteria = await Promise.all(
                payload.criteria.map((c) =>
                    client.query(
                        `INSERT INTO rubric_criteria (rubric_id, dimension, weight, description)
                         VALUES ($1, $2, $3, $4)
                         RETURNING id, rubric_id, dimension, weight, description, created_at;`,
                        [rubricRow.id, c.dimension, c.weight, c.description]
                    ).then((res) => criteriaObject(res.rows[0]))
                )
            );

            await client.query('COMMIT');

            return {
                id: rubricRow.id,
                assignmentId: rubricRow.assignment_id,
                name: rubricRow.name,
                description: rubricRow.description ?? undefined,
                criteria,
                createdAt: rubricRow.created_at.toISOString(),
                updatedAt: rubricRow.updated_at.toISOString(),
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async getRubricById(id: string): Promise<Rubric | null> {
        const rubricRes = await pool.query(`SELECT * FROM rubrics WHERE id = $1;`, [id]);
        if (rubricRes.rows.length === 0) return null;

        const rubricRow = rubricRes.rows[0];
        const criteriaRes = await pool.query(
            `SELECT * FROM rubric_criteria WHERE rubric_id = $1 ORDER BY created_at ASC;`,
            [id]
        );

        return {
            id: rubricRow.id,
            assignmentId: rubricRow.assignment_id,
            name: rubricRow.name,
            description: rubricRow.description ?? undefined,
            criteria: criteriaRes.rows.map(criteriaObject),
            createdAt: rubricRow.created_at.toISOString(),
            updatedAt: rubricRow.updated_at.toISOString(),
        };
    }

    static async getRubricByAssignmentId(assignmentId: string): Promise<Rubric | null> {
        const rubricRes = await pool.query(
            `SELECT * FROM rubrics WHERE assignment_id = $1 ORDER BY created_at DESC LIMIT 1;`,
            [assignmentId]
        );
        if (rubricRes.rows.length === 0) return null;
        return this.getRubricById(rubricRes.rows[0].id);
    }
}
