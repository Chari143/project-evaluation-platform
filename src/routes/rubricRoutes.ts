import { Router, Request, Response } from 'express';
import { RubricService } from '../services/rubricService';
import { CreateRubricPayload } from '../types/rubric';

const router = Router();

// POST /api/v1/rubrics - Create a new rubric 
router.post('/', async (req: Request, res: Response) => {
    try {
        const { assignmentId, name, description, criteria } = req.body as Partial<CreateRubricPayload>;

        if (!assignmentId || !name || !criteria || !Array.isArray(criteria) || criteria.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: assignmentId, name or non-empty criteria',
            });
        }

        const rubric = await RubricService.createRubric({
            assignmentId,
            name,
            description,
            criteria,
        });

        return res.status(201).json({
            success: true,
            data: rubric,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            error: error.message || 'Error creating rubric',
        });
    }
});

// GET /api/v1/rubrics/:id
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        if (!id || typeof id !== 'string') {
            return res.status(400).json({ success: false, error: 'Invalid rubric ID' });
        }

        const rubric = await RubricService.getRubricById(id);
        if (!rubric) {
            return res.status(404).json({ success: false, error: `Rubric with id '${id}' not found` });
        }

        return res.json({ success: true, data: rubric });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message || 'Server error' });
    }
});

// GET /api/v1/rubrics/assignment/:assignmentId
router.get('/assignment/:assignmentId', async (req: Request, res: Response) => {
    try {
        const assignmentId = req.params.assignmentId;
        if (!assignmentId || typeof assignmentId !== 'string') {
            return res.status(400).json({ success: false, error: 'Invalid assignment ID' });
        }

        const rubric = await RubricService.getRubricByAssignmentId(assignmentId);
        if (!rubric) {
            return res.status(404).json({ success: false, error: `No rubric found for assignment '${assignmentId}'` });
        }

        return res.json({ success: true, data: rubric });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message || 'Server error' });
    }
});

export default router;
