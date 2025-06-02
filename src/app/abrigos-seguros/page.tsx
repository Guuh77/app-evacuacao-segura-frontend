import React from 'react';
import Link from 'next/link';
import styles from './AbrigosSegurosPage.module.css';
import DeleteAbrigoSeguroButton from '@/components/AbrigoActions/DeleteAbrigoSeguroButton';

interface AbrigoSeguro {
  idAbrigo: number;
  nomeAbrigo: string;
  enderecoCompleto: string;
  vagasDisponiveisAtual?: number;
  capacidadeMaximaPessoas?: number;
  recursosOferecidos?: string;
  statusOperacional?: string;
}

async function getAbrigosSeguros(): Promise<AbrigoSeguro[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    console.error("Página Lista Abrigos - Variável de ambiente NEXT_PUBLIC_API_URL não está definida.");
    return [];
  }
  try {
    const response = await fetch(`${apiUrl}/abrigos-seguros?page=0&pageSize=10`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(`Página Lista Abrigos - Falha ao buscar abrigos seguros: ${response.status} ${response.statusText} - URL: ${response.url}`);
    }
    const data: AbrigoSeguro[] = await response.json();
    return data;
  } catch (error) {
    console.error("Página Lista Abrigos - Erro detalhado ao buscar abrigos da API:", error);
    return [];
  }
}

export default async function PaginaAbrigosSeguros() {
  const abrigos = await getAbrigosSeguros();

  const formatarStatusOperacional = (status?: string): string => {
    if (!status) return 'Não informado';
    switch (status.toLowerCase()) {
      case 'aberto':
        return 'Aberto';
      case 'lotado':
        return 'Lotado';
      case 'fechado_temporariamente':
        return 'Fechado Temporariamente';
      case 'fechado':
        return 'Fechado';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getStatusClass = (status?: string) => {
    if (!status) return styles.statusOutro;
    switch (status.toLowerCase()) {
      case 'aberto':
        return styles.statusAberto;
      case 'lotado':
        return styles.statusLotado;
      case 'fechado_temporariamente':
      case 'fechado':
        return styles.statusFechado;
      default:
        return styles.statusOutro;
    }
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Abrigos Seguros Disponíveis</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link 
            href="/abrigos-seguros/novo" 
            className="button-style"
            style={{backgroundColor: 'var(--cor-destaque-verde)', padding: '8px 15px', fontSize: '0.9rem' }}
          >
            + Novo Abrigo
          </Link>
          <Link href="/" className={`button-style ${styles.backLink}`}>
            &larr; Voltar para a Home
          </Link>
        </div>
      </header>

      {abrigos.length === 0 ? (
        <p className={styles.emptyMessage}>
          Nenhum abrigo seguro encontrado ou falha ao carregar as informações no momento.
        </p>
      ) : (
        <ul className={styles.abrigoList}>
          {abrigos.map((abrigo) => (
            <li key={abrigo.idAbrigo} className={`card ${styles.abrigoItem}`}>
              <h2>{abrigo.nomeAbrigo}</h2>
              <p className={styles.abrigoDetails}>
                <strong>Endereço:</strong> {abrigo.enderecoCompleto}
              </p>
              {abrigo.statusOperacional && (
                <p className={styles.abrigoDetails}>
                  <strong>Status:</strong>{' '}
                  <span className={getStatusClass(abrigo.statusOperacional)}>
                    {formatarStatusOperacional(abrigo.statusOperacional)}
                  </span>
                </p>
              )}
              {typeof abrigo.vagasDisponiveisAtual === 'number' && (
                <p className={styles.abrigoDetails}>
                  <strong>Vagas Disponíveis:</strong> {abrigo.vagasDisponiveisAtual}
                  {typeof abrigo.capacidadeMaximaPessoas === 'number' && abrigo.capacidadeMaximaPessoas > 0 && ` de ${abrigo.capacidadeMaximaPessoas}`}
                </p>
              )}
              {abrigo.recursosOferecidos && (
                <p className={styles.recursosText}>
                  <strong>Recursos:</strong> {abrigo.recursosOferecidos}
                </p>
              )}
              {}
              <div style={{ marginTop: '1rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <Link 
                  href={`/abrigos-seguros/editar/${abrigo.idAbrigo}`} 
                  className="button-style"
                  style={{ 
                    backgroundColor: '#555', 
                    padding: '6px 12px', 
                    fontSize: '0.85rem' 
                  }}
                >
                  Editar
                </Link>
                <DeleteAbrigoSeguroButton abrigoId={abrigo.idAbrigo} /> {}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}