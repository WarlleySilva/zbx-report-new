import { InstanceSettingsForm } from './components/InstanceSettingsForm';

export function App() {
  return (
    <main style={{ fontFamily: 'Arial, sans-serif', padding: '2rem', maxWidth: 960, margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1rem' }}>Dashboard de Relatórios Zabbix</h1>
      <p style={{ marginBottom: '1.5rem' }}>
        Configure a instância, valide a conexão e avance para seleção de host/gráficos.
      </p>
      <InstanceSettingsForm />
    </main>
  );
}
