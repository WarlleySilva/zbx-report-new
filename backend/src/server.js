import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import settingsRoutes from './routes/settingsRoutes.js';

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'zbx-report-backend' });
});

app.use('/api', settingsRoutes);

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
