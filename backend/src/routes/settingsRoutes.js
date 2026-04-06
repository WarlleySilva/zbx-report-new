import { Router } from 'express';
import { getSettings, upsertSettings } from '../db.js';
import { listGraphsByHost, resolveAuth, testConnection } from '../services/zabbixClient.js';

const router = Router();

router.post('/settings/test-connection', async (req, res) => {
  try {
    const { zabbixUrl, username, secretValue, authType } = req.body;
    const result = await testConnection({ zabbixUrl, username, secretValue, authType });
    return res.json(result);
  } catch (error) {
    return res.status(400).json({ ok: false, message: error.message });
  }
});

router.post('/settings', async (req, res) => {
  try {
    const { name, zabbixUrl, username, secretValue, authType } = req.body;
    const id = upsertSettings({ name, zabbixUrl, username, secretValue, authType });
    return res.status(201).json({ ok: true, id });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
});

router.get('/settings/:name?', (req, res) => {
  const data = getSettings(req.params.name || 'default');
  if (!data) {
    return res.status(404).json({ ok: false, message: 'Configuração não encontrada.' });
  }

  return res.json({
    ok: true,
    data: { ...data, secretValue: '********' }
  });
});

router.post('/zabbix/hosts/:hostId/graphs', async (req, res) => {
  try {
    const hostId = req.params.hostId;
    const { name = 'default' } = req.body;
    const settings = getSettings(name);

    if (!settings) {
      return res.status(404).json({ ok: false, message: 'Configuração da instância não existe.' });
    }

    const auth = await resolveAuth(settings);
    const result = await listGraphsByHost({ zabbixUrl: settings.zabbixUrl, auth, hostId });

    return res.json({ ok: true, ...result });
  } catch (error) {
    return res.status(400).json({ ok: false, message: error.message });
  }
});

export default router;
