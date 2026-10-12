import express from 'express';
import cors from 'cors';

import healthRouter from './routes/health';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/health', healthRouter);

app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});
