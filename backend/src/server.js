import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import settingsRoutes from './routes/settingsRoutes.js';

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.status(200).json({ ok: true, message: 'zbx-report backend online' });
});

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'zbx-report-backend' });
});

app.use('/api', settingsRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ ok: false, message: 'Erro interno no servidor.' });
});

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
