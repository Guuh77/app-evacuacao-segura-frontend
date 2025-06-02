import React from 'react';
import Link from 'next/link';
import styles from './OcorrenciasPage.module.css';
import DeleteOcorrenciaButton from '@/components/OcorrenciaActions/DeleteOcorrenciaButton';


interface UsuarioSimples {
  idUsuario: number;
  nomeCompleto?: string;
}

interface AlertaSimples {
  idAlerta: number;
  titulo?: string;
}

interface AreaDeRiscoSimples {
  idAreaRisco: number;
  nomeArea?: string;
}

interface Ocorrencia {
  idOcorrencia: number;
  tituloOcorrencia: string;
  descricaoDetalhada?: string;
  tipoOcorrencia: string;
  dataHoraOcorrencia: string;
  statusOcorrencia?: string;
  impactoEstimado?: string;
  usuarioReportou?: UsuarioSimples;
  alertaRelacionado?: AlertaSimples;
  areaRiscoAfetada?: AreaDeRiscoSimples;
}

async function getOcorrencias(): Promise<Ocorrencia[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    console.error("Página Lista Ocorrências - Variável NEXT_PUBLIC_API_URL não definida.");
    return [];
  }
  try {
    const response = await fetch(`${apiUrl}/ocorrencias?page=0&pageSize=10`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(`Página Lista Ocorrências - Falha ao buscar ocorrências: ${response.status} ${response.statusText}`);
    }
    const data: Ocorrencia[] = await response.json();
    return data;
  } catch (error) {
    console.error("Página Lista Ocorrências - Erro ao buscar ocorrências da API:", error);
    return [];
  }
}

export default async function PaginaOcorrencias() {
  const ocorrencias = await getOcorrencias();

  const formatarTipoOcorrencia = (tipoBruto?: string): string => {
    if (!tipoBruto) return 'Não especificado';
    return tipoBruto
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  };

  const formatarStatusOcorrencia = (statusBruto?: string): string => {
    if (!statusBruto) return 'Não especificado';
    switch (statusBruto.toLowerCase()) {
        case 'ativa': return 'Ativa';
        case 'em_atendimento': return 'Em Atendimento';
        case 'controlada': return 'Controlada';
        case 'finalizada': return 'Finalizada';
        default: return statusBruto.charAt(0).toUpperCase() + statusBruto.slice(1);
    }
  };

  const getStatusClass = (statusBruto?: string) => {
    if (!styles || !statusBruto) return styles?.statusDefault || '';
    switch (statusBruto.toLowerCase()) {
        case 'ativa': return styles.statusAtiva;
        case 'em_atendimento': return styles.statusEmAtendimento;
        case 'controlada': return styles.statusControlada;
        case 'finalizada': return styles.statusFinalizada;
        default: return styles.statusDefault;
    }
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Ocorrências Registradas</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link 
            href="/ocorrencias/novo" 
            className="button-style"
            style={{backgroundColor: 'var(--cor-destaque-verde)', padding: '8px 15px', fontSize: '0.9rem' }}
          >
            + Nova Ocorrência
          </Link>
          <Link href="/" className={`button-style ${styles.backLink}`}>
            &larr; Voltar para a Home
          </Link>
        </div>
      </header>

      {ocorrencias.length === 0 ? (
        <p className={styles.emptyMessage}>
          Nenhuma ocorrência encontrada ou falha ao carregar as informações no momento.
        </p>
      ) : (
        <ul className={styles.ocorrenciaList}>
          {ocorrencias.map((ocorrencia) => (
            <li key={ocorrencia.idOcorrencia} className={`card ${styles.ocorrenciaItem}`}>
              <h2>{ocorrencia.tituloOcorrencia}</h2>
              
              {ocorrencia.descricaoDetalhada && (
                <p className={styles.descriptionText}>{ocorrencia.descricaoDetalhada}</p>
              )}

              <p className={styles.ocorrenciaDetails}>
                <strong>Tipo:</strong> {formatarTipoOcorrencia(ocorrencia.tipoOcorrencia)}
              </p>
              {ocorrencia.statusOcorrencia && (
                <p className={styles.ocorrenciaDetails}>
                  <strong>Status:</strong>{' '}
                  <span className={getStatusClass(ocorrencia.statusOcorrencia)}>
                    {formatarStatusOcorrencia(ocorrencia.statusOcorrencia)}
                  </span>
                </p>
              )}
              
              {(ocorrencia.usuarioReportou || ocorrencia.alertaRelacionado || ocorrencia.areaRiscoAfetada) && (
                <div className={styles.relatedInfo}>
                  {ocorrencia.usuarioReportou && ocorrencia.usuarioReportou.nomeCompleto && (
                     <p><strong>Reportado por:</strong> {ocorrencia.usuarioReportou.nomeCompleto}</p>
                  )}
                  {ocorrencia.alertaRelacionado && ocorrencia.alertaRelacionado.titulo && (
                     <p><strong>Alerta Relacionado:</strong> {ocorrencia.alertaRelacionado.titulo}</p>
                  )}
                   {ocorrencia.areaRiscoAfetada && ocorrencia.areaRiscoAfetada.nomeArea && (
                     <p><strong>Área Afetada:</strong> {ocorrencia.areaRiscoAfetada.nomeArea}</p>
                   )}
                </div>
              )}

              {ocorrencia.impactoEstimado && (
                <p className={styles.descriptionText}>
                  <strong>Impacto Estimado:</strong> {ocorrencia.impactoEstimado}
                </p>
              )}
              <small className={styles.timestamp}>
                Data/Hora: {new Date(ocorrencia.dataHoraOcorrencia).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
              </small>
              {}
              <div style={{ marginTop: '1rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <Link 
                  href={`/ocorrencias/editar/${ocorrencia.idOcorrencia}`} 
                  className="button-style"
                  style={{ backgroundColor: '#555', padding: '6px 12px', fontSize: '0.85rem' }}
                >
                  Editar
                </Link>
                <DeleteOcorrenciaButton ocorrenciaId={ocorrencia.idOcorrencia} /> {}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}