import React from 'react';
import Link from 'next/link';
import styles from './RelatosPage.module.css';
import DeleteRelatoButton from '@/components/RelatoActions/DeleteRelatoButton';

interface UsuarioSimples {
  idUsuario: number;
  nomeCompleto?: string;
}
interface OcorrenciaSimples {
  idOcorrencia: number;
  tituloOcorrencia?: string;
}
interface AlertaSimples {
  idAlerta: number;
  titulo?: string;
}
interface AreaDeRiscoSimples {
    idAreaRisco: number;
    nomeArea?: string;
}
interface AbrigoSeguroSimples {
    idAbrigo: number;
    nomeAbrigo?: string;
}
interface CampanhaSimples {
    idCampanha: number;
    nomeCampanha?: string;
}

interface Relato {
  idRelato: number;
  tituloRelato?: string;
  textoRelato: string;
  dataHoraRelato: string;
  tipoRelato?: string;
  statusValidacaoRelato?: string;
  anonimo?: boolean;
  usuarioAutor: UsuarioSimples;
  ocorrenciaAssociada?: OcorrenciaSimples;
  alertaAssociado?: AlertaSimples;
  areaRiscoAssociada?: AreaDeRiscoSimples;
  abrigoAssociado?: AbrigoSeguroSimples;
  campanhaAssociada?: CampanhaSimples;
}

async function getRelatos(): Promise<Relato[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    console.error("Página Lista Relatos - Variável NEXT_PUBLIC_API_URL não definida.");
    return [];
  }
  try {
    const response = await fetch(`${apiUrl}/relatos?page=0&pageSize=10`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      let errorDetails = `Status ${response.status}: ${response.statusText}`;
      try {
        const errorBody = await response.json();
        if (errorBody && errorBody.message) errorDetails = errorBody.message;
        else if (typeof errorBody === 'string' && errorBody.length > 0) errorDetails = errorBody;
      } catch (parseError) {
        console.warn("Página Lista Relatos - Falha ao parsear corpo do erro JSON:", parseError);
      }
      throw new Error(`Página Lista Relatos - Falha ao buscar relatos: ${errorDetails}`);
    }
    const data: Relato[] = await response.json();
    return data;
  } catch (fetchError) {
    console.error("Página Lista Relatos - Erro ao buscar relatos da API:", fetchError);
    return [];
  }
}

export default async function PaginaRelatos() {
  const relatos = await getRelatos();

  const formatarTipoRelato = (tipoBruto?: string): string => {
    if (!tipoBruto) return 'Não especificado';
    switch (tipoBruto.toLowerCase()) {
      case 'confirmacao_risco': return 'Confirmação de Risco';
      case 'pedido_ajuda': return 'Pedido de Ajuda';
      case 'informacao_util': return 'Informação Útil';
      case 'feedback_servico': return 'Feedback sobre Serviço';
      case 'condicao_abrigo': return 'Condição do Abrigo';
      default: return tipoBruto.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
    }
  };

  const formatarStatusValidacao = (statusBruto?: string): string => {
    if (!statusBruto) return 'Não especificado';
    switch (statusBruto.toLowerCase()) {
      case 'pendente': return 'Pendente';
      case 'validado': return 'Validado';
      case 'rejeitado': return 'Rejeitado';
      case 'em_analise': return 'Em Análise';
      default: return statusBruto.charAt(0).toUpperCase() + statusBruto.slice(1);
    }
  };

  const getStatusValidacaoClass = (statusBruto?: string) => {
    if (!styles || !statusBruto) return styles?.statusDefault || '';
    switch (statusBruto.toLowerCase()) {
      case 'pendente': return styles.statusPendente;
      case 'validado': return styles.statusValidado;
      case 'rejeitado': return styles.statusRejeitado;
      case 'em_analise': return styles.statusEmAnalise;
      default: return styles.statusDefault;
    }
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Relatos de Usuários</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link 
            href="/relatos/novo" 
            className="button-style"
            style={{backgroundColor: 'var(--cor-destaque-verde)', padding: '8px 15px', fontSize: '0.9rem' }}
          >
            + Novo Relato
          </Link>
          <Link href="/" className={`button-style ${styles.backLink}`}>
            &larr; Voltar para a Home
          </Link>
        </div>
      </header>

      {relatos.length === 0 ? (
        <p className={styles.emptyMessage}>
          Nenhum relato encontrado ou falha ao carregar as informações no momento.
        </p>
      ) : (
        <ul className={styles.relatoList}>
          {relatos.map((relato) => (
            <li key={relato.idRelato} className={`card ${styles.relatoItem}`}>
              {relato.tituloRelato && <h2>{relato.tituloRelato}</h2>}
              <p className={styles.relatoText}>{relato.textoRelato}</p>
              
              <div className={styles.relatoMeta}>
                <p>
                  <strong>Autor:</strong> {relato.anonimo ? 'Anônimo' : (relato.usuarioAutor?.nomeCompleto || `Usuário ID: ${relato.usuarioAutor.idUsuario}`)}
                </p>
                {relato.tipoRelato && (
                  <p><strong>Tipo:</strong> {formatarTipoRelato(relato.tipoRelato)}</p>
                )}
                {relato.statusValidacaoRelato && (
                  <p>
                    <strong>Status:</strong>{' '}
                    <span className={getStatusValidacaoClass(relato.statusValidacaoRelato)}>
                      {formatarStatusValidacao(relato.statusValidacaoRelato)}
                    </span>
                  </p>
                )}
              </div>

              {(relato.ocorrenciaAssociada || relato.alertaAssociado || relato.areaRiscoAssociada || relato.abrigoAssociado || relato.campanhaAssociada) && (
                <div className={styles.relatedInfo}>
                  <p><strong>Associado a:</strong></p>
                  {relato.ocorrenciaAssociada && <p>- Ocorrência: {relato.ocorrenciaAssociada.tituloOcorrencia || `ID ${relato.ocorrenciaAssociada.idOcorrencia}`}</p>}
                  {relato.alertaAssociado && <p>- Alerta: {relato.alertaAssociado.titulo || `ID ${relato.alertaAssociado.idAlerta}`}</p>}
                  {relato.areaRiscoAssociada && <p>- Área de Risco: {relato.areaRiscoAssociada.nomeArea || `ID ${relato.areaRiscoAssociada.idAreaRisco}`}</p>}
                  {relato.abrigoAssociado && <p>- Abrigo: {relato.abrigoAssociado.nomeAbrigo || `ID ${relato.abrigoAssociado.idAbrigo}`}</p>}
                  {relato.campanhaAssociada && <p>- Campanha: {relato.campanhaAssociada.nomeCampanha || `ID ${relato.campanhaAssociada.idCampanha}`}</p>}
                </div>
              )}
              
              <small className={styles.timestamp}>
                Enviado em: {new Date(relato.dataHoraRelato).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
              </small>
              {}
              <div style={{ marginTop: '1rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <Link 
                  href={`/relatos/editar/${relato.idRelato}`} 
                  className="button-style"
                  style={{ backgroundColor: '#555', padding: '6px 12px', fontSize: '0.85rem' }}
                >
                  Editar
                </Link>
                <DeleteRelatoButton relatoId={relato.idRelato} /> {}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}