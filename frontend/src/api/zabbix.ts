const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

export type InstanceSettingsPayload = {
  zabbixUrl: string;
  username?: string;
  secretValue: string;
  authType: 'token' | 'password';
};

export async function testConnection(payload: InstanceSettingsPayload) {
  const response = await fetch(`${API_BASE}/api/settings/test-connection`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Falha ao testar conexão');
  }

  return response.json();
}

export async function listGraphsByHost(hostId: string, name = 'default') {
  const response = await fetch(`${API_BASE}/api/zabbix/hosts/${hostId}/graphs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Falha ao listar gráficos');
  }

  return response.json();
}
