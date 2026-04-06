import { useState } from 'react';
import { testConnection } from '../api/zabbix';

export function InstanceSettingsForm() {
  const [form, setForm] = useState({
    zabbixUrl: '',
    username: '',
    secretValue: '',
    authType: 'token' as 'token' | 'password'
  });
  const [status, setStatus] = useState<string>('');

  async function handleTestConnection() {
    setStatus('Testando conexão...');
    try {
      const result = await testConnection(form);
      setStatus(`✅ Conectado no Zabbix ${result.version} como ${result.user?.username ?? 'usuário válido'}`);
    } catch (error) {
      setStatus(`❌ ${error instanceof Error ? error.message : 'Falha desconhecida'}`);
    }
  }

  return (
    <div className="max-w-2xl rounded-xl border p-6 shadow-sm space-y-4">
      <h2 className="text-xl font-semibold">Configurações de Instância</h2>

      <input
        className="w-full rounded border p-2"
        placeholder="https://zabbix.suaempresa.com"
        value={form.zabbixUrl}
        onChange={(e) => setForm((s) => ({ ...s, zabbixUrl: e.target.value }))}
      />

      <input
        className="w-full rounded border p-2"
        placeholder="Usuário"
        value={form.username}
        onChange={(e) => setForm((s) => ({ ...s, username: e.target.value }))}
      />

      <input
        className="w-full rounded border p-2"
        type="password"
        placeholder="Token ou senha"
        value={form.secretValue}
        onChange={(e) => setForm((s) => ({ ...s, secretValue: e.target.value }))}
      />

      <button
        type="button"
        className="rounded bg-blue-600 px-4 py-2 text-white"
        onClick={handleTestConnection}
      >
        Testar Conexão
      </button>

      {status && <p className="text-sm">{status}</p>}
    </div>
  );
}
