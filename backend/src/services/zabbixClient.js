async function zabbixRpc({ url, method, params = {}, auth }) {
  const body = {
    jsonrpc: '2.0',
    method,
    params,
    id: Date.now()
  };

  if (auth) body.auth = auth;

  const response = await fetch(`${url.replace(/\/$/, '')}/api_jsonrpc.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`Zabbix HTTP error: ${response.status}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(`${data.error.message}: ${data.error.data}`);
  }

  return data.result;
}

export async function resolveAuth({ zabbixUrl, username, secretValue, authType = 'token' }) {
  if (authType === 'password') {
    return zabbixRpc({
      url: zabbixUrl,
      method: 'user.login',
      params: { username, password: secretValue }
    });
  }
  return secretValue;
}

export async function testConnection({ zabbixUrl, username, secretValue, authType = 'token' }) {
  const version = await zabbixRpc({ url: zabbixUrl, method: 'apiinfo.version' });
  const auth = await resolveAuth({ zabbixUrl, username, secretValue, authType });

  const user = await zabbixRpc({
    url: zabbixUrl,
    method: 'user.get',
    auth,
    params: {
      output: ['userid', 'username', 'name', 'surname'],
      selectRole: ['name']
    }
  });

  return {
    ok: true,
    version,
    user: user?.[0] ?? null
  };
}

export async function listGraphsByHost({ zabbixUrl, auth, hostId }) {
  const hosts = await zabbixRpc({
    url: zabbixUrl,
    method: 'host.get',
    auth,
    params: {
      output: ['hostid', 'name'],
      hostids: [hostId],
      selectParentTemplates: ['templateid', 'name']
    }
  });

  if (!hosts.length) throw new Error('Host não encontrado.');

  const templateIds = hosts[0].parentTemplates.map((template) => template.templateid);

  const graphs = await zabbixRpc({
    url: zabbixUrl,
    method: 'graph.get',
    auth,
    params: {
      output: ['graphid', 'name', 'width', 'height'],
      hostids: [hostId],
      selectHosts: ['hostid', 'name'],
      sortfield: 'name'
    }
  });

  return { host: hosts[0], templateIds, graphs };
}
