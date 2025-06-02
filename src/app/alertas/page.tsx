import React from 'react';
import Link from 'next/link';
import styles from './AlertasPage.module.css';
import DeleteAlertaButton from '@/components/AlertaActions/DeleteAlertaButton';

interface Alerta {
  idAlerta: number;
  titulo: string;
  descricaoCompleta: string;
  tipoEventoAlerta: string;
  nivelSeveridadeAlerta: string;
  dataHoraEmissao: string;
}

async function getAlertas(): Promise<Alerta[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    console.error("Variável de ambiente NEXT_PUBLIC_API_URL não está definida.");
    return [];
  }
  try {
    const response = await fetch(`${apiUrl}/alertas?page=0&pageSize=10`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(`Falha ao buscar alertas: ${response.status} ${response.statusText} - URL: ${response.url}`);
    }
    const data: Alerta[] = await response.json();
    return data;
  } catch (error) {
    console.error("Erro detalhado ao buscar alertas da API:", error);
    return [];
  }
}

export default async function PaginaAlertas() {
  const alertas = await getAlertas();

  const getSeverityClass = (severity?: string) => {
    if (!severity) return '';
    switch (severity.toLowerCase()) {
      case 'severo':
      case 'extremo':
        return styles.severitySevero;
      case 'alto':
        return styles.severityAlto;
      case 'moderado':
        return styles.severityModerado;
      case 'informativo':
      case 'baixo':
        return styles.severityBaixo;
      default:
        return '';
    }
  };

  const formatarTipoEvento = (tipoBruto?: string): string => {
    if (!tipoBruto) return 'Não especificado';
    switch (tipoBruto.toLowerCase()) {
      case 'enchente_iminente':
        return 'Enchente Iminente';
      case 'deslizamento_risco':
        return 'Risco de Deslizamento';
      case 'chuva_intensa_geral':
        return 'Chuvas Intensas (Geral)';
      case 'incendio_foco_detectado':
        return 'Foco de Incêndio Detectado';
      case 'manutencao_sirene':
        return 'Manutenção de Sirene';
      case 'enchente_risco':
        return 'Risco de Enchente';
      default:
        return tipoBruto.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
    }
  };

  const formatarNivelSeveridade = (nivelBruto?: string): string => {
    if (!nivelBruto) return 'Não especificado';
    switch (nivelBruto.toLowerCase()) {
      case 'severo':
        return 'Severo';
      case 'extremo':
        return 'Extremo';
      case 'alto':
        return 'Alto';
      case 'moderado':
        return 'Moderado';
      case 'informativo':
        return 'Informativo';
      case 'baixo':
        return 'Baixo';
      default:
        return nivelBruto.charAt(0).toUpperCase() + nivelBruto.slice(1).toLowerCase();
    }
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Alertas Atuais</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/alertas/novo" className="button-style" style={{backgroundColor: 'var(--cor-destaque-verde)', padding: '8px 15px', fontSize: '0.9rem' }}>
            + Novo Alerta
          </Link>
          <Link href="/" className={`button-style ${styles.backLink}`}>
            &larr; Voltar para a Home
          </Link>
        </div>
      </header>

      {alertas.length === 0 ? (
        <p className={styles.emptyMessage}>
          Nenhum alerta encontrado ou falha ao carregar as informações no momento.
        </p>
      ) : (
        <ul className={styles.alertList}>
          {alertas.map((alerta) => (
            <li key={alerta.idAlerta} className={`card ${styles.alertItem}`}>
              <h2>{alerta.titulo}</h2>
              <p className={styles.alertDetails}>
                <strong>Tipo:</strong> {formatarTipoEvento(alerta.tipoEventoAlerta)}
              </p>
              <p className={styles.alertDetails}>
                <strong>Severidade:</strong>{' '}
                <span className={getSeverityClass(alerta.nivelSeveridadeAlerta)}>
                  {formatarNivelSeveridade(alerta.nivelSeveridadeAlerta)}
                </span>
              </p>
              <p className={styles.alertDescription}>{alerta.descricaoCompleta}</p>
              <small className={styles.alertTimestamp}>
                Emitido em: {new Date(alerta.dataHoraEmissao).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
              </small>
              
              <div style={{ marginTop: '1rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <Link 
                  href={`/alertas/editar/${alerta.idAlerta}`} 
                  className="button-style"
                  style={{ 
                    backgroundColor: '#555', 
                    padding: '6px 12px', 
                    fontSize: '0.85rem' 
                  }}
                >
                  Editar
                </Link>
                <DeleteAlertaButton alertaId={alerta.idAlerta} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}