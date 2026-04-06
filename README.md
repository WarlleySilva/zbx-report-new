# ZBX Report New

Dashboard de relatórios para Zabbix com configuração dinâmica por interface, seleção inteligente de gráficos e geração de PDF.

## Arquitetura proposta

```mermaid
flowchart LR
  A[Admin - Frontend React] -->|1. Salva URL/Usuário/Token| B[Backend Express API]
  B -->|2. Criptografa e persiste| C[(SQLite)]
  A -->|3. Testar Conexão| B
  B -->|4. user.login / token validate| D[Zabbix API]
  A -->|5. Seleciona Host Group| B
  B -->|6. hostgroup.get| D
  A -->|7. Seleciona Host| B
  B -->|8. host.get + template.get + graph.get| D
  B -->|9. Retorna gráficos por host/template| A
  A -->|10. Seleciona checkboxes e solicita PDF| B
  B -->|11. Busca métricas/gráficos| D
  B -->|12. Renderiza HTML + Puppeteer| E[(PDF)]
  B -->|13. Entrega PDF| A
```

## Funcionalidades-base implementadas

- **Configurações de instância** com persistência local (SQLite + criptografia AES-GCM).
- **Teste de conexão** via endpoint `/api/settings/test-connection`.
- **Listagem de gráficos por host** via endpoint `/api/zabbix/hosts/:hostId/graphs`.
- **UI inicial React/Vite** para validar conexão.

## Ambiente de desenvolvimento (Docker Compose)

```bash
docker compose up -d --build
```

Verificações esperadas:

```bash
curl http://localhost:4000/health
# {"ok":true,"service":"zbx-report-backend"}

curl -I http://localhost:5173
# HTTP/1.1 200 OK
```

## Persistência leve sugerida

### SQLite (recomendado para MVP)

- Tabela única `instance_settings` com versão e timestamps.
- Criptografia em repouso para segredo (`token_enc`) com chave em variável de ambiente.
- Fácil backup e operação local em Docker.

Campos da tabela:

- `id`
- `name`
- `zabbix_url`
- `username`
- `token_enc`
- `auth_type` (`token` ou `password`)
- `created_at`, `updated_at`

### Redis (opcional)

- Útil para cache de host groups/hosts/graphs e sessões.
- Não ideal como base principal de configuração sem estratégia de persistência (AOF/RDB).

## Estrutura inicial

- `docker-compose.yml` para ambiente de desenvolvimento.
- Backend Express com:
  - Teste de conexão com Zabbix.
  - Listagem de gráficos por host (incluindo templates vinculados).
- Frontend Vite + React com formulário inicial para configuração e teste de conexão.
