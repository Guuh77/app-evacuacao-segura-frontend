"use client";

import React, { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

interface AbrigoData {
  nomeAbrigo: string;
  enderecoCompleto: string;
  latitudeAbrigo: number | string;
  longitudeAbrigo: number | string;
  capacidadeMaximaPessoas?: number | string;
  vagasDisponiveisAtual?: number | string;
  recursosOferecidos?: string;
  contatoResponsavelAbrigo?: string;
  telefoneContatoAbrigo?: string;
  statusOperacional?: string;
  observacoesAdicionais?: string;
  idAbrigo?: number;
}

const initialFormData: AbrigoData = {
  nomeAbrigo: '',
  enderecoCompleto: '',
  latitudeAbrigo: '',
  longitudeAbrigo: '',
  capacidadeMaximaPessoas: '',
  vagasDisponiveisAtual: '',
  recursosOferecidos: '',
  contatoResponsavelAbrigo: '',
  telefoneContatoAbrigo: '',
  statusOperacional: 'aberto',
  observacoesAdicionais: '',
};

export default function PaginaEditarAbrigo() {
  const router = useRouter();
  const params = useParams();
  const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const idAbrigo = idParam ? Number(idParam) : null;

  const [formData, setFormData] = useState<AbrigoData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    console.log("Página Editar Abrigo - Parâmetros da rota (params):", params);
    console.log("Página Editar Abrigo - ID extraído (idParam):", idParam);
    console.log("Página Editar Abrigo - ID do Abrigo convertido (idAbrigo):", idAbrigo);

    if (idAbrigo && !isNaN(idAbrigo)) {
      const fetchAbrigo = async () => {
        setIsLoadingData(true);
        setError(null);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          setError("URL da API não configurada.");
          setIsLoadingData(false);
          return;
        }

        const fetchUrl = `${apiUrl}/abrigos-seguros/${idAbrigo}`;
        console.log("Página Editar Abrigo - Tentando buscar dados de:", fetchUrl);
        
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
                console.error("Página Editar Abrigo - Detalhes do corpo do erro da API (JSON):", errorBody);
            } catch (parseJsonError) { 
                console.warn("Página Editar Abrigo - Não foi possível parsear o corpo do erro como JSON. Tentando como texto. Erro de parse JSON:", parseJsonError);
                try {
                    const textErrorBody = await response.text();
                    if (textErrorBody && textErrorBody.length > 0 && textErrorBody.length < 500) { 
                        errorDetails = textErrorBody;
                    }
                     console.error("Página Editar Abrigo - Detalhes do corpo do erro da API (Texto):", textErrorBody);
                  } catch (parseTextError) {
                    console.warn("Página Editar Abrigo - Não foi possível ler o corpo do erro como Texto. Usando status/texto do erro. Erro no parse do corpo:", parseTextError);
                }
            }
            throw new Error(`Falha ao buscar dados do abrigo. ${errorDetails}`);
          }

          const data: AbrigoData = await response.json();
          setFormData({
            nomeAbrigo: data.nomeAbrigo || '',
            enderecoCompleto: data.enderecoCompleto || '',
            latitudeAbrigo: data.latitudeAbrigo?.toString() || '',
            longitudeAbrigo: data.longitudeAbrigo?.toString() || '',
            capacidadeMaximaPessoas: data.capacidadeMaximaPessoas?.toString() || '',
            vagasDisponiveisAtual: data.vagasDisponiveisAtual?.toString() || '',
            recursosOferecidos: data.recursosOferecidos || '',
            contatoResponsavelAbrigo: data.contatoResponsavelAbrigo || '',
            telefoneContatoAbrigo: data.telefoneContatoAbrigo || '',
            statusOperacional: data.statusOperacional || 'aberto',
            observacoesAdicionais: data.observacoesAdicionais || '',
          });
        } catch (err) { 
          let errorMessage = "Ocorreu um erro desconhecido ao carregar os dados do abrigo.";
          if (err instanceof Error) {
            errorMessage = err.message;
          }
          setError(errorMessage);
          console.error("Página Editar Abrigo - Erro no fetchAbrigo (catch principal):", err); 
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchAbrigo();
    } else {
      setError("ID do Abrigo não fornecido, inválido ou não é um número na URL.");
      console.error("Página Editar Abrigo - ID do Abrigo inválido:", idAbrigo);
      setIsLoadingData(false);
    }
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'latitudeAbrigo' || name === 'longitudeAbrigo' || name === 'capacidadeMaximaPessoas' || name === 'vagasDisponiveisAtual') && value === '' ? '' : value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!idAbrigo) {
        setError("ID do Abrigo é inválido para atualização.");
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
    
    const payload: Partial<AbrigoData> = {
      ...formData,
      latitudeAbrigo: parseFloat(formData.latitudeAbrigo as string),
      longitudeAbrigo: parseFloat(formData.longitudeAbrigo as string),
      capacidadeMaximaPessoas: formData.capacidadeMaximaPessoas ? parseInt(formData.capacidadeMaximaPessoas as string, 10) : undefined,
      vagasDisponiveisAtual: formData.vagasDisponiveisAtual ? parseInt(formData.vagasDisponiveisAtual as string, 10) : undefined,
    };

    Object.keys(payload).forEach(keyStr => {
      const key = keyStr as keyof typeof payload;
      if (payload[key] === undefined || payload[key] === '') {
        if (!(typeof initialFormData[key] === 'string' && payload[key] === '')) {
            delete payload[key];
        }
      }
    });
     if (!payload.statusOperacional && initialFormData.statusOperacional) { 
        payload.statusOperacional = initialFormData.statusOperacional;
    }


    try {
      const response = await fetch(`${apiUrl}/abrigos-seguros/${idAbrigo}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Status ${response.status}: ${response.statusText}` }));
        throw new Error(errorData.message || `Falha ao atualizar abrigo: ${response.status} ${response.statusText}`);
      }

      setSuccessMessage(`Abrigo "${formData.nomeAbrigo}" atualizado com sucesso! (Dados enviados)`);
      
      setTimeout(() => {
        router.push('/abrigos-seguros');
      }, 2000);

    } catch (err) {
      let errorMessage = "Ocorreu um erro desconhecido ao atualizar o abrigo.";
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
  const buttonStyle: React.CSSProperties = { padding: '12px 18px', backgroundColor: 'var(--cor-destaque-verde)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem', fontWeight: '500', opacity: isLoading || isLoadingData ? 0.7 : 1 };
  const errorStyle: React.CSSProperties = { color: 'var(--cor-alerta-erro)', marginBottom: '1rem', border: '1px solid var(--cor-alerta-erro)', padding: '10px', borderRadius: '4px', backgroundColor: 'rgba(217, 83, 79, 0.1)' };
  const successStyle: React.CSSProperties = { color: 'var(--cor-alerta-sucesso)', marginBottom: '1rem', border: '1px solid var(--cor-alerta-sucesso)', padding: '10px', borderRadius: '4px', backgroundColor: 'rgba(60, 179, 113, 0.1)' };

  if (isLoadingData) {
    return <div style={{ padding: '20px', textAlign: 'center', color: 'var(--cor-texto-principal)'}}>Carregando dados do abrigo...</div>;
  }
  
  if (error && !successMessage && formData.nomeAbrigo === '' ) { 
    return (
        <div style={{ fontFamily: 'var(--fonte-principal)', padding: '20px', maxWidth: '700px', margin: '2rem auto', color: 'var(--cor-texto-principal)' }}>
             <header style={{ marginBottom: '2rem', borderBottom: '2px solid var(--cor-borda)', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: '2rem', margin: 0, color: '#fff' }}>Editar Abrigo Seguro</h1>
                <Link href="/abrigos-seguros" className="button-style" style={{ fontSize: '0.9rem', padding: '8px 15px', backgroundColor: '#555' }}>
                &larr; Voltar para Lista de Abrigos
                </Link>
            </header>
            <p style={errorStyle}>Erro ao carregar dados do abrigo: {error}</p>
        </div>
    );
  }

  return (
    <div style={{ fontFamily: 'var(--fonte-principal)', padding: '20px', maxWidth: '700px', margin: '2rem auto', color: 'var(--cor-texto-principal)' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '2px solid var(--cor-borda)', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '2rem', margin: 0, color: '#fff' }}>Editar Abrigo Seguro (ID: {idAbrigo})</h1>
        <Link href="/abrigos-seguros" className="button-style" style={{ fontSize: '0.9rem', padding: '8px 15px', backgroundColor: '#555' }}>
          &larr; Voltar para Lista de Abrigos
        </Link>
      </header>

      {error && formData.nomeAbrigo !== '' && <p style={errorStyle}>{error}</p>}
      {successMessage && <p style={successStyle}>{successMessage}</p>}

      <form onSubmit={handleSubmit} style={formStyle}>
        <div>
          <label htmlFor="nomeAbrigo" style={labelStyle}>Nome do Abrigo (Obrigatório):</label>
          <input type="text" id="nomeAbrigo" name="nomeAbrigo" value={formData.nomeAbrigo} onChange={handleChange} style={inputStyle} required />
        </div>
        <div>
          <label htmlFor="enderecoCompleto" style={labelStyle}>Endereço Completo (Obrigatório):</label>
          <textarea id="enderecoCompleto" name="enderecoCompleto" value={formData.enderecoCompleto} onChange={handleChange} rows={3} style={inputStyle} required />
        </div>
        <div>
          <label htmlFor="latitudeAbrigo" style={labelStyle}>Latitude (Obrigatório):</label>
          <input type="number" step="any" id="latitudeAbrigo" name="latitudeAbrigo" value={formData.latitudeAbrigo} onChange={handleChange} style={inputStyle} required />
        </div>
        <div>
          <label htmlFor="longitudeAbrigo" style={labelStyle}>Longitude (Obrigatório):</label>
          <input type="number" step="any" id="longitudeAbrigo" name="longitudeAbrigo" value={formData.longitudeAbrigo} onChange={handleChange} style={inputStyle} required />
        </div>
        <div>
          <label htmlFor="capacidadeMaximaPessoas" style={labelStyle}>Capacidade Máxima (Opcional):</label>
          <input type="number" id="capacidadeMaximaPessoas" name="capacidadeMaximaPessoas" value={formData.capacidadeMaximaPessoas} onChange={handleChange} style={inputStyle} />
        </div>
        <div>
          <label htmlFor="vagasDisponiveisAtual" style={labelStyle}>Vagas Disponíveis (Opcional):</label>
          <input type="number" id="vagasDisponiveisAtual" name="vagasDisponiveisAtual" value={formData.vagasDisponiveisAtual} onChange={handleChange} style={inputStyle} />
        </div>
        <div>
          <label htmlFor="recursosOferecidos" style={labelStyle}>Recursos Oferecidos (Opcional):</label>
          <textarea id="recursosOferecidos" name="recursosOferecidos" value={formData.recursosOferecidos} onChange={handleChange} rows={3} style={inputStyle} />
        </div>
        <div>
          <label htmlFor="contatoResponsavelAbrigo" style={labelStyle}>Contato do Responsável (Opcional):</label>
          <input type="text" id="contatoResponsavelAbrigo" name="contatoResponsavelAbrigo" value={formData.contatoResponsavelAbrigo} onChange={handleChange} style={inputStyle} />
        </div>
        <div>
          <label htmlFor="telefoneContatoAbrigo" style={labelStyle}>Telefone de Contato (Opcional):</label>
          <input type="text" id="telefoneContatoAbrigo" name="telefoneContatoAbrigo" value={formData.telefoneContatoAbrigo} onChange={handleChange} style={inputStyle} />
        </div>
        <div>
          <label htmlFor="statusOperacional" style={labelStyle}>Status Operacional:</label>
          <select id="statusOperacional" name="statusOperacional" value={formData.statusOperacional} onChange={handleChange} style={inputStyle}>
            <option value="aberto">Aberto</option>
            <option value="lotado">Lotado</option>
            <option value="fechado_temporariamente">Fechado Temporariamente</option>
            <option value="fechado">Fechado</option>
          </select>
        </div>
        <div>
          <label htmlFor="observacoesAdicionais" style={labelStyle}>Observações Adicionais (Opcional):</label>
          <textarea id="observacoesAdicionais" name="observacoesAdicionais" value={formData.observacoesAdicionais} onChange={handleChange} rows={3} style={inputStyle} />
        </div>

        <button type="submit" style={buttonStyle} disabled={isLoading || isLoadingData}>
          {isLoading ? 'Salvando Alterações...' : 'Salvar Alterações'}
        </button>
      </form>
    </div>
  );
}