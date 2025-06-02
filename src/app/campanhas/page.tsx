import React from 'react';
import Link from 'next/link';
import styles from './CampanhasPage.module.css';

interface UsuarioSimples {
  idUsuario: number;
  nomeCompleto?: string;
}

interface Campanha {
  idCampanha: number; 
  nomeCampanha: string;
  descricaoCampanha?: string;
  tipoCampanha: string;
  dataInicioCampanha: string; 
  dataFimCampanha?: string;  
  publicoAlvo?: string;
  statusCampanha?: string;
  entidadeOrganizadora?: string;
  organizadorUsuario?: UsuarioSimples; 
  metaCampanha?: string;
  localPrincipalCampanha?: string;
}

async function getCampanhas(): Promise<Campanha[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    console.error("Página Lista Campanhas - Variável NEXT_PUBLIC_API_URL não definida.");
    return [];
  }
  try {
    const response = await fetch(`${apiUrl}/campanhas?page=0&pageSize=10`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      let errorDetails = `Status ${response.status}: ${response.statusText}`;
      try {
        const errorBody = await response.json();
        if (errorBody && errorBody.message) {
            errorDetails = errorBody.message;
        } else if (typeof errorBody === 'string' && errorBody.length > 0) {
            errorDetails = errorBody;
        }
      } catch {
      }
      throw new Error(`Página Lista Campanhas - Falha ao buscar campanhas: ${errorDetails}`);
    }
    const data: Campanha[] = await response.json();
    return data;
  } catch (fetchError) { 
    console.error("Página Lista Campanhas - Erro geral ao buscar campanhas da API:", fetchError);
    return [];
  }
}

export default async function PaginaCampanhas() {
  const campanhas = await getCampanhas();

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Não definida';
    if (dateString.includes('<') || dateString.includes('>')) {
        return 'Data Inválida';
    }
    const parts = dateString.split('-');
    if (parts.length === 3 && parts[0].length === 4 && parts[1].length === 2 && parts[2].length === 2) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const dateObj = new Date(dateString);
    if (!isNaN(dateObj.getTime())) {
        return dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    return dateString;
  };

  const formatarTipoCampanha = (tipoBruto?: string): string => {
    if (!tipoBruto) return 'Não especificado';
    switch (tipoBruto.toLowerCase()) {
        case 'prevencao': return 'Prevenção';
        case 'arrecadacao_doacoes': return 'Arrecadação de Doações';
        case 'conscientizacao': return 'Conscientização';
        case 'voluntariado': return 'Voluntariado';
        case 'abrigo_temporario': return 'Abrigo Temporário';
        default: return tipoBruto.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
    }
  };

  const formatarStatusCampanha = (statusBruto?: string): string => {
    if (!statusBruto) return 'Não especificado';
    switch (statusBruto.toLowerCase()) {
        case 'planejamento': return 'Planejamento';
        case 'ativa': return 'Ativa';
        case 'concluida': return 'Concluída';
        case 'cancelada': return 'Cancelada';
        default: return statusBruto.charAt(0).toUpperCase() + statusBruto.slice(1);
    }
  };

   const getStatusClass = (statusBruto?: string) => {
    if (!styles || !statusBruto) return styles?.statusDefault || '';
    switch (statusBruto.toLowerCase()) {
        case 'ativa': return styles.statusAtiva;
        case 'planejamento': return styles.statusPlanejamento;
        case 'concluida': return styles.statusConcluida;
        case 'cancelada': return styles.statusCancelada;
        default: return styles.statusDefault;
    }
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Campanhas</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {/* Botão "+ Nova Campanha" REMOVIDO */}
          <Link href="/" className={`button-style ${styles.backLink}`}>
            &larr; Voltar para a Home
          </Link>
        </div>
      </header>

      {campanhas.length === 0 ? (
        <p className={styles.emptyMessage}>
          Nenhuma campanha encontrada ou falha ao carregar as informações no momento.
        </p>
      ) : (
        <ul className={styles.campanhaList}>
          {campanhas.map((campanha) => (
            <li key={campanha.idCampanha} className={`card ${styles.campanhaItem}`}>
              <h2>{campanha.nomeCampanha}</h2>
              {campanha.descricaoCampanha && (
                <p className={styles.descriptionText}>{campanha.descricaoCampanha}</p>
              )}
              <p className={styles.campanhaDetails}>
                <strong>Tipo:</strong> {formatarTipoCampanha(campanha.tipoCampanha)}
              </p>
              {campanha.statusCampanha && (
                <p className={styles.campanhaDetails}>
                  <strong>Status:</strong>{' '}
                  <span className={getStatusClass(campanha.statusCampanha)}>
                    {formatarStatusCampanha(campanha.statusCampanha)}
                  </span>
                </p>
              )}
              <p className={styles.campanhaDetails}>
                <strong>Início:</strong> {formatDate(campanha.dataInicioCampanha)}
              </p>
              {campanha.dataFimCampanha && (
                <p className={styles.campanhaDetails}>
                  <strong>Fim:</strong> {formatDate(campanha.dataFimCampanha)}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}