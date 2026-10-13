import express from 'express';
import cors from 'cors';

import healthRouter from './routes/health';
import submissionRouter from './routes/submissionRoutes';
import rubricRouter from './routes/rubricRoutes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/health', healthRouter);
app.use('/api/v1/submissions', submissionRouter)
app.use('/api/v1/rubrics', rubricRouter)
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
});

export default app;
