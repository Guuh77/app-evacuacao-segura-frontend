import React from 'react';
import Link from 'next/link';
import styles from './AreasDeRiscoPage.module.css'; 
import DeleteAreaDeRiscoButton from '@/components/AreaDeRiscoActions/DeleteAreaDeRiscoButton';

interface AreaDeRisco {
  idAreaRisco: number;
  nomeArea: string;
  descricaoRisco?: string;
  tipoRisco: string;
  nivelRiscoPermanente?: string;
  dataIdentificacao: string; 
}

async function getAreasDeRisco(): Promise<AreaDeRisco[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    console.error("Página Lista Áreas de Risco - Variável de ambiente NEXT_PUBLIC_API_URL não está definida.");
    return [];
  }
  try {
    const response = await fetch(`${apiUrl}/areas-de-risco?page=0&pageSize=10`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(`Página Lista Áreas de Risco - Falha ao buscar áreas de risco: ${response.status} ${response.statusText} - URL: ${response.url}`);
    }
    const data: AreaDeRisco[] = await response.json();
    return data;
  } catch (error) {
    console.error("Página Lista Áreas de Risco - Erro detalhado ao buscar áreas de risco da API:", error);
    return [];
  }
}

export default async function PaginaAreasDeRisco() {
  const areas = await getAreasDeRisco();

  const formatarTipoRisco = (tipoBruto?: string): string => {
    if (!tipoBruto) return 'Não especificado';
    return tipoBruto
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  };

  const formatarNivelRisco = (nivelBruto?: string): string => {
    if (!nivelBruto) return 'Não especificado';
    return nivelBruto.charAt(0).toUpperCase() + nivelBruto.slice(1).toLowerCase();
  };

  const getNivelRiscoClass = (nivelBruto?: string) => {
    if (!nivelBruto) return styles.riscoDefault;
    switch (nivelBruto.toLowerCase()) {
      case 'critico':
        return styles.riscoCritico;
      case 'alto':
        return styles.riscoAlto;
      case 'medio':
        return styles.riscoMedio;
      case 'baixo':
        return styles.riscoBaixo;
      default:
        return styles.riscoDefault;
    }
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Áreas de Risco Identificadas</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link 
            href="/areas-de-risco/novo" 
            className="button-style"
            style={{backgroundColor: 'var(--cor-destaque-verde)', padding: '8px 15px', fontSize: '0.9rem' }}
          >
            + Nova Área de Risco
          </Link>
          <Link href="/" className={`button-style ${styles.backLink}`}>
            &larr; Voltar para a Home
          </Link>
        </div>
      </header>

      {areas.length === 0 ? (
        <p className={styles.emptyMessage}>
          Nenhuma área de risco encontrada ou falha ao carregar as informações no momento.
        </p>
      ) : (
        <ul className={styles.areaList}>
          {areas.map((area) => (
            <li key={area.idAreaRisco} className={`card ${styles.areaItem}`}>
              <h2>{area.nomeArea}</h2>
              {area.descricaoRisco && (
                <p className={styles.descriptionText}>{area.descricaoRisco}</p>
              )}
              <p className={styles.areaDetails}>
                <strong>Tipo de Risco:</strong> {formatarTipoRisco(area.tipoRisco)}
              </p>
              {area.nivelRiscoPermanente && (
                <p className={styles.areaDetails}>
                  <strong>Nível de Risco Permanente:</strong>{' '}
                  <span className={getNivelRiscoClass(area.nivelRiscoPermanente)}>
                    {formatarNivelRisco(area.nivelRiscoPermanente)}
                  </span>
                </p>
              )}
              <small className={styles.timestamp}>
                Identificada em: {new Date(area.dataIdentificacao).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </small>
              {}
              <div style={{ marginTop: '1rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <Link 
                  href={`/areas-de-risco/editar/${area.idAreaRisco}`} 
                  className="button-style"
                  style={{ backgroundColor: '#555', padding: '6px 12px', fontSize: '0.85rem' }}
                >
                  Editar
                </Link>
                <DeleteAreaDeRiscoButton areaId={area.idAreaRisco} /> {}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}