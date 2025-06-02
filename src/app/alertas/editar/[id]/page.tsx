"use client";

import React, { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

interface AlertaData {
  titulo: string;
  descricaoCompleta: string;
  tipoEventoAlerta: string;
  nivelSeveridadeAlerta: string;
  instrucoesSeguranca?: string;
  emitidoPorUsuario: { idUsuario: number };
  areaDeRiscoAssociada?: { idAreaRisco?: number };
  idAlerta?: number;
  dataHoraEmissao?: string;
}

const initialFormData: AlertaData = {
  titulo: '',
  descricaoCompleta: '',
  tipoEventoAlerta: '',
  nivelSeveridadeAlerta: '',
  instrucoesSeguranca: '',
  emitidoPorUsuario: { idUsuario: 0 },
  areaDeRiscoAssociada: { idAreaRisco: undefined },
};

export default function PaginaEditarAlerta() {
  const router = useRouter();
  const params = useParams();
  const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const idAlerta = idParam ? Number(idParam) : null;

  const [formData, setFormData] = useState<AlertaData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    console.log("Parâmetros da rota (params):", params);
    console.log("ID extraído (idParam):", idParam);
    console.log("ID do Alerta convertido para número (idAlerta):", idAlerta);

    if (idAlerta && !isNaN(idAlerta)) {
      const fetchAlerta = async () => {
        setIsLoadingData(true);
        setError(null);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          setError("URL da API não configurada.");
          setIsLoadingData(false);
          return;
        }

        const fetchUrl = `${apiUrl}/alertas/${idAlerta}`;
        console.log("Tentando buscar dados de:", fetchUrl);

        try {
          const response = await fetch(fetchUrl);
          if (!response.ok) {
            throw new Error(`Falha ao buscar dados do alerta: ${response.status} (${response.statusText})`);
          }
          const data: AlertaData = await response.json();
          setFormData({
            titulo: data.titulo || '',
            descricaoCompleta: data.descricaoCompleta || '',
            tipoEventoAlerta: data.tipoEventoAlerta || '',
            nivelSeveridadeAlerta: data.nivelSeveridadeAlerta || '',
            instrucoesSeguranca: data.instrucoesSeguranca || '',
            emitidoPorUsuario: { idUsuario: data.emitidoPorUsuario?.idUsuario || 0 },
            areaDeRiscoAssociada: data.areaDeRiscoAssociada?.idAreaRisco ? { idAreaRisco: data.areaDeRiscoAssociada.idAreaRisco } : { idAreaRisco: undefined },
          });
        } catch (err) {
          let errorMessage = "Erro ao carregar dados do alerta.";
          if (err instanceof Error) {
            errorMessage = err.message;
          } else if (typeof err === 'string') {
            errorMessage = err;
          }
          setError(errorMessage);
          console.error("Erro no fetchAlerta:", err);
        
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchAlerta();
    } else {
        setError("ID do Alerta não fornecido, inválido ou não é um número.");
        console.error("ID do Alerta inválido ou não numérico:", idAlerta, "Tipo:", typeof idAlerta);
        setIsLoadingData(false);
    }
  }, [params.id]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevFormData => {
      if (name === 'idUsuario' || name === 'idAreaRisco') {
        const idValue = value ? parseInt(value, 10) : undefined;
        if (name === 'idUsuario') {
          return { ...prevFormData, emitidoPorUsuario: { idUsuario: idValue || 0 } };
        } else if (name === 'idAreaRisco') {
          if (idValue && idValue !== 0) {
            return { ...prevFormData, areaDeRiscoAssociada: { idAreaRisco: idValue } };
          } else {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { areaDeRiscoAssociada: _ignored, ...rest } = prevFormData;
            return { ...rest, areaDeRiscoAssociada: undefined };
          }
        }
      }
      return { ...prevFormData, [name]: value };
    });
  };


  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!idAlerta) {
        setError("ID do Alerta é inválido para atualização.");
        return;
    }
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      setError("URL da API não configurada.");
      setIsLoading(false);
      return;
    }

    if (!formData.emitidoPorUsuario?.idUsuario || formData.emitidoPorUsuario.idUsuario === 0) {
        setError("ID do Usuário Emissor é obrigatório e deve ser um número válido maior que zero.");
        setIsLoading(false);
        return;
    }
    
    const payload: Partial<AlertaData> = { ...formData };
    if (payload.areaDeRiscoAssociada && (payload.areaDeRiscoAssociada.idAreaRisco === undefined || payload.areaDeRiscoAssociada.idAreaRisco === 0)) {
        delete payload.areaDeRiscoAssociada; 
    }

    try {
      const response = await fetch(`${apiUrl}/alertas/${idAlerta}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Status ${response.status}: ${response.statusText}` }));
        throw new Error(errorData.message || `Falha ao atualizar alerta: ${response.status} ${response.statusText}`);
      }

      setSuccessMessage(`Alerta "${formData.titulo}" atualizado com sucesso! (Os dados foram enviados)`);
      
      setTimeout(() => {
        router.push('/alertas'); 
      }, 2500);

    } catch (err) { 
      let errorMessage = "Ocorreu um erro desconhecido ao atualizar o alerta.";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px', margin: '0 auto' };
  const inputStyle: React.CSSProperties = { padding: '10px', border: '1px solid var(--cor-borda)', borderRadius: '4px', fontSize: '1rem', backgroundColor: '#333', color: 'var(--cor-texto-principal)' };
  const labelStyle: React.CSSProperties = { marginBottom: '0.25rem', fontWeight: 'bold', color: 'var(--cor-texto-secundario)' };
  const buttonStyle: React.CSSProperties = { padding: '12px 18px', backgroundColor: 'var(--cor-destaque-verde)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem', fontWeight: '500', opacity: isLoading ? 0.7 : 1 };
  const errorStyle: React.CSSProperties = { color: 'var(--cor-alerta-erro)', marginBottom: '1rem', border: '1px solid var(--cor-alerta-erro)', padding: '10px', borderRadius: '4px', backgroundColor: 'rgba(217, 83, 79, 0.1)' };
  const successStyle: React.CSSProperties = { color: 'var(--cor-alerta-sucesso)', marginBottom: '1rem', border: '1px solid var(--cor-alerta-sucesso)', padding: '10px', borderRadius: '4px', backgroundColor: 'rgba(60, 179, 113, 0.1)' };

  if (isLoadingData) {
    return <div style={{ padding: '20px', textAlign: 'center', color: 'var(--cor-texto-principal)'}}>Carregando dados do alerta...</div>;
  }
  
  if (error && !formData.titulo && !successMessage) { 
    return (
        <div style={{ padding: '20px', color: 'var(--cor-texto-principal)' }}>
              <header style={{ marginBottom: '2rem', borderBottom: '2px solid var(--cor-borda)', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: '2rem', margin: 0, color: '#fff' }}>Editar Alerta</h1>
                <Link href="/alertas" className="button-style" style={{ fontSize: '0.9rem', padding: '8px 15px', backgroundColor: '#555' }}>
                &larr; Voltar para Lista de Alertas
                </Link>
            </header>
            <p style={errorStyle}>{error}</p>
        </div>
    );
  }

  return (
    <div style={{ fontFamily: 'var(--fonte-principal)', padding: '20px', maxWidth: '700px', margin: '2rem auto', color: 'var(--cor-texto-principal)' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '2px solid var(--cor-borda)', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '2rem', margin: 0, color: '#fff' }}>Editar Alerta (ID: {idAlerta})</h1>
        <Link href="/alertas" className="button-style" style={{ fontSize: '0.9rem', padding: '8px 15px', backgroundColor: '#555' }}>
          &larr; Voltar para Lista de Alertas
        </Link>
      </header>

      {error && formData.titulo && <p style={errorStyle}>{error}</p>}
      {successMessage && <p style={successStyle}>{successMessage}</p>}

      <form onSubmit={handleSubmit} style={formStyle}>
        <div>
          <label htmlFor="idUsuario" style={labelStyle}>ID do Usuário Emissor (Obrigatório):</label>
          <input
            type="number"
            id="idUsuario"
            name="idUsuario"
            value={formData.emitidoPorUsuario?.idUsuario === 0 ? '' : formData.emitidoPorUsuario?.idUsuario}
            onChange={handleChange}
            style={inputStyle}
            min="1"
            required
          />
        </div>
        <div>
          <label htmlFor="titulo" style={labelStyle}>Título:</label>
          <input
            type="text"
            id="titulo"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            style={inputStyle}
            required
          />
        </div>
        <div>
          <label htmlFor="descricaoCompleta" style={labelStyle}>Descrição Completa:</label>
          <textarea
            id="descricaoCompleta"
            name="descricaoCompleta"
            value={formData.descricaoCompleta}
            onChange={handleChange}
            rows={4}
            style={inputStyle}
            required
          />
        </div>
        <div>
          <label htmlFor="tipoEventoAlerta" style={labelStyle}>Tipo do Evento (ex: enchente_iminente):</label>
          <input
            type="text"
            id="tipoEventoAlerta"
            name="tipoEventoAlerta"
            value={formData.tipoEventoAlerta}
            onChange={handleChange}
            style={inputStyle}
            required
          />
        </div>
        <div>
          <label htmlFor="nivelSeveridadeAlerta" style={labelStyle}>Nível de Severidade:</label>
          <select
            id="nivelSeveridadeAlerta"
            name="nivelSeveridadeAlerta"
            value={formData.nivelSeveridadeAlerta}
            onChange={handleChange}
            style={inputStyle}
            required
          >
            <option value="">Selecione...</option>
            <option value="informativo">Informativo</option>
            <option value="moderado">Moderado</option>
            <option value="severo">Severo</option>
            <option value="extremo">Extremo</option>
          </select>
        </div>
        <div>
          <label htmlFor="instrucoesSeguranca" style={labelStyle}>Instruções de Segurança (Opcional):</label>
          <textarea
            id="instrucoesSeguranca"
            name="instrucoesSeguranca"
            value={formData.instrucoesSeguranca || ''}
            onChange={handleChange}
            rows={3}
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="idAreaRisco" style={labelStyle}>ID da Área de Risco Associada (Opcional):</label>
          <input
            type="number"
            id="idAreaRisco"
            name="idAreaRisco"
            value={formData.areaDeRiscoAssociada?.idAreaRisco === undefined ? '' : formData.areaDeRiscoAssociada.idAreaRisco}
            onChange={handleChange}
            style={inputStyle}
            placeholder="Deixe em branco ou 0 para não associar"
            min="1"
          />
        </div>

        <button type="submit" style={buttonStyle} disabled={isLoading || isLoadingData}>
          {isLoading ? 'Salvando Alterações...' : 'Salvar Alterações'}
        </button>
      </form>
    </div>
  );
}
