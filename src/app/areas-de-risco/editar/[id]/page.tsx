"use client";

import React, { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

interface AreaDeRiscoData {
  nomeArea: string;
  descricaoRisco?: string;
  tipoRisco: string;
  latitudeCentro: number | string;
  longitudeCentro: number | string;
  raioKm?: number | string;
  poligonoCoordenadas?: string;
  nivelRiscoPermanente?: string;
  idAreaRisco?: number; 
}

const initialFormData: AreaDeRiscoData = {
  nomeArea: '',
  descricaoRisco: '',
  tipoRisco: '',
  latitudeCentro: '',
  longitudeCentro: '',
  raioKm: '',
  poligonoCoordenadas: '',
  nivelRiscoPermanente: 'medio',
};

export default function PaginaEditarAreaDeRisco() {
  const router = useRouter();
  const params = useParams();
  const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const idAreaRisco = idParam ? Number(idParam) : null;

  const [formData, setFormData] = useState<AreaDeRiscoData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    console.log("Página Editar Área de Risco - Parâmetros:", params, "ID extraído:", idAreaRisco);

    if (idAreaRisco && !isNaN(idAreaRisco)) {
      const fetchAreaDeRisco = async () => {
        setIsLoadingData(true);
        setError(null);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          setError("URL da API não configurada.");
          setIsLoadingData(false);
          return;
        }

        const fetchUrl = `${apiUrl}/areas-de-risco/${idAreaRisco}`;
        console.log("Página Editar Área de Risco - Buscando de:", fetchUrl);
        
        try {
          const response = await fetch(fetchUrl);
          
          if (!response.ok) {
            const status = response.status;
            const statusText = response.statusText;
            let errorDetails = `Status ${status}: ${statusText}`;
            try {
                const errorBody = await response.json();
                if (errorBody && errorBody.message) {
                    errorDetails = errorBody.message;
                } else if (typeof errorBody === 'string' && errorBody.length > 0) {
                    errorDetails = errorBody;
                } else if (errorBody && typeof errorBody === 'object' && Object.keys(errorBody).length > 0) {
                    errorDetails = JSON.stringify(errorBody);
                }
                console.error("Página Editar Área de Risco - Corpo do erro da API (JSON):", errorBody);
            } catch (jsonParseError) { 
                console.warn("Página Editar Área de Risco - Falha ao parsear corpo do erro como JSON. Tentando como texto. Erro:", jsonParseError);
                try {
                    const textErrorBody = await response.text();
                    if (textErrorBody && textErrorBody.length > 0 && textErrorBody.length < 500) {
                        errorDetails = textErrorBody;
                    }
                     console.error("Página Editar Área de Risco - Corpo do erro da API (Texto):", textErrorBody);
                  } catch (textParseError) {
                    console.warn("Página Editar Área de Risco - Falha ao ler corpo do erro como Texto. Erro:", textParseError);
                }
            }
            throw new Error(`Falha ao buscar dados da área de risco. ${errorDetails}`);
          }

          const data: AreaDeRiscoData = await response.json();
          setFormData({
            nomeArea: data.nomeArea || '',
            descricaoRisco: data.descricaoRisco || '',
            tipoRisco: data.tipoRisco || '',
            latitudeCentro: data.latitudeCentro?.toString() || '',
            longitudeCentro: data.longitudeCentro?.toString() || '',
            raioKm: data.raioKm?.toString() || '',
            poligonoCoordenadas: data.poligonoCoordenadas || '',
            nivelRiscoPermanente: data.nivelRiscoPermanente || 'medio',
          });
        } catch (err) { 
          let errorMessage = "Ocorreu um erro desconhecido ao carregar os dados da área de risco.";
          if (err instanceof Error) {
            errorMessage = err.message;
          }
          setError(errorMessage);
          console.error("Página Editar Área de Risco - Erro no fetchAreaDeRisco (catch principal):", err); 
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchAreaDeRisco();
    } else {
      setError("ID da Área de Risco não fornecido, inválido ou não é um número na URL.");
      console.error("Página Editar Área de Risco - ID da Área de Risco inválido:", idAreaRisco);
      setIsLoadingData(false);
    }
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'latitudeCentro' || name === 'longitudeCentro' || name === 'raioKm') && value === '' ? '' : value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!idAreaRisco) {
        setError("ID da Área de Risco é inválido para atualização.");
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
    
    const payload: Partial<AreaDeRiscoData> = {
      ...formData,
      latitudeCentro: parseFloat(formData.latitudeCentro as string),
      longitudeCentro: parseFloat(formData.longitudeCentro as string),
      raioKm: formData.raioKm ? parseFloat(formData.raioKm as string) : undefined,
    };
    Object.keys(payload).forEach(keyStr => {
        const key = keyStr as keyof typeof payload;
        if (payload[key] === undefined || payload[key] === '') {
            if (!(typeof initialFormData[key] === 'string' && payload[key] === '')) {
                delete payload[key];
            }
        }
    });
    if (!payload.nivelRiscoPermanente && initialFormData.nivelRiscoPermanente) {
        payload.nivelRiscoPermanente = initialFormData.nivelRiscoPermanente;
    }

    try {
      const response = await fetch(`${apiUrl}/areas-de-risco/${idAreaRisco}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Status ${response.status}: ${response.statusText}` }));
        throw new Error(errorData.message || `Falha ao atualizar área de risco: ${response.status} ${response.statusText}`);
      }
      setSuccessMessage(`Área de Risco "${formData.nomeArea}" atualizada com sucesso!`);
      setTimeout(() => {
        router.push('/areas-de-risco');
      }, 2000);

    } catch (err) {
      let errorMessage = "Ocorreu um erro desconhecido ao atualizar a área de risco.";
      if (err instanceof Error) errorMessage = err.message;
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px', margin: '0 auto' };
  const inputStyle: React.CSSProperties = { padding: '10px', border: '1px solid var(--cor-borda)', borderRadius: '4px', fontSize: '1rem', backgroundColor: '#333', color: 'var(--cor-texto-principal)' };
  const labelStyle: React.CSSProperties = { marginBottom: '0.25rem', fontWeight: 'bold', color: 'var(--cor-texto-secundario)' };
  const buttonStyle: React.CSSProperties = { padding: '12px 18px', backgroundColor: 'var(--cor-destaque-verde)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem', fontWeight: '500', opacity: isLoading || isLoadingData ? 0.7 : 1 };
  const errorStyle: React.CSSProperties = { color: 'var(--cor-alerta-erro)', marginBottom: '1rem', border: '1px solid var(--cor-alerta-erro)', padding: '10px', borderRadius: '4px', backgroundColor: 'rgba(217, 83, 79, 0.1)' };
  const successStyle: React.CSSProperties = { color: 'var(--cor-alerta-sucesso)', marginBottom: '1rem', border: '1px solid var(--cor-alerta-sucesso)', padding: '10px', borderRadius: '4px', backgroundColor: 'rgba(60, 179, 113, 0.1)' };

  if (isLoadingData) {
    return <div style={{ padding: '20px', textAlign: 'center', color: 'var(--cor-texto-principal)'}}>Carregando dados da área de risco...</div>;
  }
  
  if (error && !successMessage && formData.nomeArea === '' ) {
    return (
        <div style={{ fontFamily: 'var(--fonte-principal)', padding: '20px', maxWidth: '700px', margin: '2rem auto', color: 'var(--cor-texto-principal)' }}>
             <header style={{ marginBottom: '2rem', borderBottom: '2px solid var(--cor-borda)', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: '2rem', margin: 0, color: '#fff' }}>Editar Área de Risco</h1>
                <Link href="/areas-de-risco" className="button-style" style={{ fontSize: '0.9rem', padding: '8px 15px', backgroundColor: '#555' }}>
                &larr; Voltar para Lista de Áreas de Risco
                </Link>
            </header>
            <p style={errorStyle}>Erro ao carregar dados da área de risco: {error}</p>
        </div>
    );
  }

  return (
    <div style={{ fontFamily: 'var(--fonte-principal)', padding: '20px', maxWidth: '700px', margin: '2rem auto', color: 'var(--cor-texto-principal)' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '2px solid var(--cor-borda)', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '2rem', margin: 0, color: '#fff' }}>Editar Área de Risco (ID: {idAreaRisco})</h1>
        <Link href="/areas-de-risco" className="button-style" style={{ fontSize: '0.9rem', padding: '8px 15px', backgroundColor: '#555' }}>
          &larr; Voltar para Lista de Áreas de Risco
        </Link>
      </header>

      {error && formData.nomeArea !== '' && <p style={errorStyle}>{error}</p>}
      {successMessage && <p style={successStyle}>{successMessage}</p>}

      <form onSubmit={handleSubmit} style={formStyle}>
        <div>
          <label htmlFor="nomeArea" style={labelStyle}>Nome da Área (Obrigatório):</label>
          <input type="text" id="nomeArea" name="nomeArea" value={formData.nomeArea} onChange={handleChange} style={inputStyle} required />
        </div>
        <div>
          <label htmlFor="descricaoRisco" style={labelStyle}>Descrição do Risco (Opcional):</label>
          <textarea id="descricaoRisco" name="descricaoRisco" value={formData.descricaoRisco} onChange={handleChange} rows={3} style={inputStyle} />
        </div>
        <div>
          <label htmlFor="tipoRisco" style={labelStyle}>Tipo de Risco (Obrigatório):</label>
          <input type="text" id="tipoRisco" name="tipoRisco" value={formData.tipoRisco} onChange={handleChange} style={inputStyle} required />
        </div>
        <div>
          <label htmlFor="latitudeCentro" style={labelStyle}>Latitude do Centro (Obrigatório):</label>
          <input type="number" step="any" id="latitudeCentro" name="latitudeCentro" value={formData.latitudeCentro} onChange={handleChange} style={inputStyle} required />
        </div>
        <div>
          <label htmlFor="longitudeCentro" style={labelStyle}>Longitude do Centro (Obrigatório):</label>
          <input type="number" step="any" id="longitudeCentro" name="longitudeCentro" value={formData.longitudeCentro} onChange={handleChange} style={inputStyle} required />
        </div>
        <div>
          <label htmlFor="raioKm" style={labelStyle}>Raio em Km (Opcional):</label>
          <input type="number" step="any" id="raioKm" name="raioKm" value={formData.raioKm} onChange={handleChange} style={inputStyle} />
        </div>
        <div>
          <label htmlFor="poligonoCoordenadas" style={labelStyle}>Polígono de Coordenadas (Opcional):</label>
          <textarea id="poligonoCoordenadas" name="poligonoCoordenadas" value={formData.poligonoCoordenadas} onChange={handleChange} rows={3} style={inputStyle} />
        </div>
         <div>
          <label htmlFor="nivelRiscoPermanente" style={labelStyle}>Nível de Risco Permanente:</label>
          <select id="nivelRiscoPermanente" name="nivelRiscoPermanente" value={formData.nivelRiscoPermanente} onChange={handleChange} style={inputStyle}>
            <option value="baixo">Baixo</option>
            <option value="medio">Médio</option>
            <option value="alto">Alto</option>
            <option value="critico">Crítico</option>
          </select>
        </div>

        <button type="submit" style={buttonStyle} disabled={isLoading || isLoadingData}>
          {isLoading ? 'Salvando Alterações...' : 'Salvar Alterações'}
        </button>
      </form>
    </div>
  );
}