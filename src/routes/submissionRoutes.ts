import { Router, Request, Response } from 'express';
import { SubmissionService } from '../services/submissionService';
import { SubmissionPayload, SubmissionType } from '../types/submission';

const router = Router();

const VALID_TYPES: SubmissionType[] = ['github', 'zip', 'pdf', 'gdrive', 'url'];

// POST /api/v1/submissions
router.post('/', async (req: Request, res: Response) => {
    try {
        const { studentId, assignmentId, type, sourceUrl, notes } = req.body as Partial<SubmissionPayload>;

        if (!studentId || !assignmentId || !type || !sourceUrl) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: studentId, assignmentId, type, sourceUrl',
            });
        }

        if (!VALID_TYPES.includes(type)) {
            return res.status(400).json({
                success: false,
                error: `Invalid submission type. Must be one of: ${VALID_TYPES.join(', ')}`,
            });
        }

        const submission = await SubmissionService.createSubmission({
            studentId,
            assignmentId,
            type,
            sourceUrl,
            notes,
        });

        return res.status(201).json({
            success: true,
            data: submission,
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message || 'Database error' });
    }
});

// GET /api/v1/submissions/:id
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        if (!id || typeof id !== 'string') {
            return res.status(400).json({ success: false, error: 'Invalid or missing submission ID' });
        }

        const submission = await SubmissionService.getSubmissionById(id);
        if (!submission) {
            return res.status(404).json({ success: false, error: `Submission with id '${id}' not found` });
        }

        return res.json({ success: true, data: submission });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message || 'Database error' });
    }
});

// GET /api/v1/submissions
router.get('/', async (req: Request, res: Response) => {
    try {
        const submissions = await SubmissionService.listSubmissions();
        return res.json({ success: true, data: submissions });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message || 'Database error' });
    }
});

export default router;
