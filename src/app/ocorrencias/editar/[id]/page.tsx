"use client";

import React, { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

interface OcorrenciaData {
  tituloOcorrencia: string;
  descricaoDetalhada?: string;
  tipoOcorrencia: string;
  latitudeOcorrencia: string;
  longitudeOcorrencia: string;
  statusOcorrencia?: string;
  impactoEstimado?: string;
  alertaRelacionado?: { idAlerta?: string };
  areaRiscoAfetada?: { idAreaRisco?: string };
  usuarioReportou?: { idUsuario?: string };
  idOcorrencia?: number;
  dataHoraOcorrencia?: string;
}

interface OcorrenciaPayload {
    tituloOcorrencia: string;
    descricaoDetalhada?: string;
    tipoOcorrencia: string;
    latitudeOcorrencia: number;
    longitudeOcorrencia: number;
    statusOcorrencia?: string;
    impactoEstimado?: string;
    alertaRelacionado?: { idAlerta: number };
    areaRiscoAfetada?: { idAreaRisco: number };
    usuarioReportou?: { idUsuario: number };
}

const initialFormData: OcorrenciaData = {
  tituloOcorrencia: '',
  descricaoDetalhada: '',
  tipoOcorrencia: '',
  latitudeOcorrencia: '',
  longitudeOcorrencia: '',
  statusOcorrencia: 'ativa',
  impactoEstimado: '',
  alertaRelacionado: { idAlerta: '' },
  areaRiscoAfetada: { idAreaRisco: '' },
  usuarioReportou: { idUsuario: '' },
};

export default function PaginaEditarOcorrencia() {
  const router = useRouter();
  const params = useParams();
  const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const idOcorrencia = idParam ? Number(idParam) : null;

  const [formData, setFormData] = useState<OcorrenciaData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (idOcorrencia && !isNaN(idOcorrencia)) {
      const fetchOcorrencia = async () => {
        setIsLoadingData(true);
        setError(null);
        const currentApiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!currentApiUrl) {
          setError("URL da API não configurada.");
          setIsLoadingData(false);
          return;
        }
        try {
          const response = await fetch(`${currentApiUrl}/ocorrencias/${idOcorrencia}`);
          if (!response.ok) {
            const status = response.status;
            const statusText = response.statusText;
            let errorDetails = `Status ${status}: ${statusText}`;
            try {
                const errorBody = await response.json();
                if (errorBody && errorBody.message) errorDetails = errorBody.message;
                else if (typeof errorBody === 'string' && errorBody.length > 0) errorDetails = errorBody;
                else if (errorBody && typeof errorBody === 'object' && Object.keys(errorBody).length > 0) errorDetails = JSON.stringify(errorBody);
                console.error("Página Editar Ocorrência - Corpo do erro da API (JSON):", errorBody);
            } catch (parseJsonError) { 
                console.warn("Página Editar Ocorrência - Falha ao parsear corpo do erro como JSON. Tentando como texto. Erro:", parseJsonError);
                try {
                    const textErrorBody = await response.text();
                    if (textErrorBody && textErrorBody.length > 0 && textErrorBody.length < 500) errorDetails = textErrorBody;
                    console.error("Página Editar Ocorrência - Corpo do erro da API (Texto):", textErrorBody);
                  } catch (textParseError) {
                    console.warn("Página Editar Ocorrência - Falha ao ler corpo do erro como Texto. Erro:", textParseError);
                }
            }
            throw new Error(`Falha ao buscar dados da ocorrência: ${errorDetails}`);
          }
          const data: OcorrenciaData = await response.json();
          setFormData({
            tituloOcorrencia: data.tituloOcorrencia || '',
            descricaoDetalhada: data.descricaoDetalhada || '',
            tipoOcorrencia: data.tipoOcorrencia || '',
            latitudeOcorrencia: data.latitudeOcorrencia?.toString() || '',
            longitudeOcorrencia: data.longitudeOcorrencia?.toString() || '',
            statusOcorrencia: data.statusOcorrencia || 'ativa',
            impactoEstimado: data.impactoEstimado || '',
            alertaRelacionado: { idAlerta: data.alertaRelacionado?.idAlerta?.toString() || '' },
            areaRiscoAfetada: { idAreaRisco: data.areaRiscoAfetada?.idAreaRisco?.toString() || '' },
            usuarioReportou: { idUsuario: data.usuarioReportou?.idUsuario?.toString() || '' },
            dataHoraOcorrencia: data.dataHoraOcorrencia,
          });
        } catch (err) {
          let errorMessage = "Ocorreu um erro desconhecido ao carregar os dados da ocorrência.";
          if (err instanceof Error) errorMessage = err.message;
          setError(errorMessage);
          console.error("Página Editar Ocorrência - Erro no fetchOcorrencia:", err);
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchOcorrencia();
    } else {
      setError("ID da Ocorrência não fornecido ou inválido na URL.");
      setIsLoadingData(false);
    }
  }, [params.id, idOcorrencia]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "idAlerta" || name === "idAreaRisco" || name === "idUsuario") {
      if (name === "idAlerta") {
        setFormData(prev => ({ ...prev, alertaRelacionado: { idAlerta: value } }));
      } else if (name === "idAreaRisco") {
        setFormData(prev => ({ ...prev, areaRiscoAfetada: { idAreaRisco: value } }));
      } else if (name === "idUsuario") {
        setFormData(prev => ({ ...prev, usuarioReportou: { idUsuario: value } }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!idOcorrencia) {
        setError("ID da Ocorrência é inválido para atualização.");
        return;
    }
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const currentApiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!currentApiUrl) {
      setError("URL da API não configurada.");
      setIsLoading(false);
      return;
    }
    
    const payload: Partial<OcorrenciaPayload> = {
        tituloOcorrencia: formData.tituloOcorrencia,
        tipoOcorrencia: formData.tipoOcorrencia,
    };

    const lat = parseFloat(formData.latitudeOcorrencia as string);
    const lon = parseFloat(formData.longitudeOcorrencia as string);

    if (isNaN(lat) || isNaN(lon)) {
        setError("Latitude e Longitude devem ser números válidos.");
        setIsLoading(false);
        return;
    }
    payload.latitudeOcorrencia = lat;
    payload.longitudeOcorrencia = lon;

    if (formData.descricaoDetalhada) payload.descricaoDetalhada = formData.descricaoDetalhada;
    payload.statusOcorrencia = formData.statusOcorrencia || 'ativa';
    if (formData.impactoEstimado) payload.impactoEstimado = formData.impactoEstimado;

    const idAlerta = formData.alertaRelacionado?.idAlerta ? parseInt(formData.alertaRelacionado.idAlerta, 10) : NaN;
    if (!isNaN(idAlerta) && idAlerta > 0) payload.alertaRelacionado = { idAlerta }; else delete payload.alertaRelacionado;

    const idAreaRisco = formData.areaRiscoAfetada?.idAreaRisco ? parseInt(formData.areaRiscoAfetada.idAreaRisco, 10) : NaN;
    if (!isNaN(idAreaRisco) && idAreaRisco > 0) payload.areaRiscoAfetada = { idAreaRisco }; else delete payload.areaRiscoAfetada;
    
    const idUsuario = formData.usuarioReportou?.idUsuario ? parseInt(formData.usuarioReportou.idUsuario, 10) : NaN;
    if (!isNaN(idUsuario) && idUsuario > 0) payload.usuarioReportou = { idUsuario }; else delete payload.usuarioReportou;

    console.log("Enviando payload para API (Update Ocorrência):", JSON.stringify(payload, null, 2));

    try {
      const response = await fetch(`${currentApiUrl}/ocorrencias/${idOcorrencia}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMsg = `Falha ao atualizar ocorrência: Status ${response.status} ${response.statusText}`;
        try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorMsg;
        } catch (parseErr) {
            console.warn("Falha ao parsear corpo do erro JSON na atualização de ocorrência:", parseErr);
        }
        throw new Error(errorMsg);
      }
      setSuccessMessage(`Ocorrência "${formData.tituloOcorrencia}" atualizada com sucesso!`);
      
      setTimeout(() => {
        router.push('/ocorrencias');
      }, 2000);

    } catch (error) {
      let errorMessage = "Ocorreu um erro desconhecido ao atualizar a ocorrência.";
      if (error instanceof Error) errorMessage = error.message;
      setError(errorMessage);
      console.error("Erro no handleSubmit de Editar Ocorrência:", error);
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
    return <div style={{ padding: '20px', textAlign: 'center', color: 'var(--cor-texto-principal)'}}>Carregando dados da ocorrência...</div>;
  }
  
  if (error && !successMessage && formData.tituloOcorrencia === '' ) {
    return (
        <div style={{ fontFamily: 'var(--fonte-principal)', padding: '20px', maxWidth: '700px', margin: '2rem auto', color: 'var(--cor-texto-principal)' }}>
             <header style={{ marginBottom: '2rem', borderBottom: '2px solid var(--cor-borda)', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: '2rem', margin: 0, color: '#fff' }}>Editar Ocorrência</h1>
                <Link href="/ocorrencias" className="button-style" style={{ fontSize: '0.9rem', padding: '8px 15px', backgroundColor: '#555' }}>
                &larr; Voltar para Lista de Ocorrências
                </Link>
            </header>
            <p style={errorStyle}>Erro ao carregar dados da ocorrência: {error}</p>
        </div>
    );
  }

  return (
    <div style={{ fontFamily: 'var(--fonte-principal)', padding: '20px', maxWidth: '700px', margin: '2rem auto', color: 'var(--cor-texto-principal)' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '2px solid var(--cor-borda)', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '2rem', margin: 0, color: '#fff' }}>Editar Ocorrência (ID: {idOcorrencia})</h1>
        <Link href="/ocorrencias" className="button-style" style={{ fontSize: '0.9rem', padding: '8px 15px', backgroundColor: '#555' }}>
          &larr; Voltar para Lista de Ocorrências
        </Link>
      </header>

      {error && formData.tituloOcorrencia !== '' && <p style={errorStyle}>{error}</p>}
      {successMessage && <p style={successStyle}>{successMessage}</p>}

      <form onSubmit={handleSubmit} style={formStyle}>
        <div>
          <label htmlFor="tituloOcorrencia" style={labelStyle}>Título da Ocorrência (Obrigatório):</label>
          <input type="text" id="tituloOcorrencia" name="tituloOcorrencia" value={formData.tituloOcorrencia} onChange={handleChange} style={inputStyle} required />
        </div>
        <div>
          <label htmlFor="descricaoDetalhada" style={labelStyle}>Descrição Detalhada (Opcional):</label>
          <textarea id="descricaoDetalhada" name="descricaoDetalhada" value={formData.descricaoDetalhada || ''} onChange={handleChange} rows={3} style={inputStyle} />
        </div>
        <div>
          <label htmlFor="tipoOcorrencia" style={labelStyle}>Tipo da Ocorrência (Obrigatório):</label>
          <input type="text" id="tipoOcorrencia" name="tipoOcorrencia" value={formData.tipoOcorrencia} onChange={handleChange} style={inputStyle} required />
        </div>
        <div>
          <label htmlFor="latitudeOcorrencia" style={labelStyle}>Latitude (Obrigatório):</label>
          <input type="number" step="any" id="latitudeOcorrencia" name="latitudeOcorrencia" value={formData.latitudeOcorrencia} onChange={handleChange} style={inputStyle} required />
        </div>
        <div>
          <label htmlFor="longitudeOcorrencia" style={labelStyle}>Longitude (Obrigatório):</label>
          <input type="number" step="any" id="longitudeOcorrencia" name="longitudeOcorrencia" value={formData.longitudeOcorrencia} onChange={handleChange} style={inputStyle} required />
        </div>
        <div>
          <label htmlFor="statusOcorrencia" style={labelStyle}>Status da Ocorrência:</label>
          <select id="statusOcorrencia" name="statusOcorrencia" value={formData.statusOcorrencia} onChange={handleChange} style={inputStyle}>
            <option value="ativa">Ativa</option>
            <option value="em_atendimento">Em Atendimento</option>
            <option value="controlada">Controlada</option>
            <option value="finalizada">Finalizada</option>
          </select>
        </div>
        <div>
          <label htmlFor="impactoEstimado" style={labelStyle}>Impacto Estimado (Opcional):</label>
          <textarea id="impactoEstimado" name="impactoEstimado" value={formData.impactoEstimado || ''} onChange={handleChange} rows={3} style={inputStyle} />
        </div>
        {formData.dataHoraOcorrencia && (
            <div style={{fontSize: '0.9em', color: 'var(--cor-texto-secundario)', marginTop: '0.5rem'}}>
                Data da Ocorrência (não editável): {new Date(formData.dataHoraOcorrencia).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
            </div>
        )}
        <hr style={{borderColor: 'var(--cor-borda)', marginBlock: '1rem'}}/>
        <p style={{color: 'var(--cor-texto-secundario)', fontSize: '0.9em'}}>Associações (Opcional - IDs existentes):</p>
        <div>
          <label htmlFor="idUsuario" style={labelStyle}>ID do Usuário que Reportou:</label>
          <input type="number" id="idUsuario" name="idUsuario" value={formData.usuarioReportou?.idUsuario || ''} onChange={handleChange} style={inputStyle} placeholder="ID de usuário" min="1"/>
        </div>
        <div>
          <label htmlFor="idAlerta" style={labelStyle}>ID do Alerta Relacionado:</label>
          <input type="number" id="idAlerta" name="idAlerta" value={formData.alertaRelacionado?.idAlerta || ''} onChange={handleChange} style={inputStyle} placeholder="ID de alerta" min="1"/>
        </div>
        <div>
          <label htmlFor="idAreaRisco" style={labelStyle}>ID da Área de Risco Afetada:</label>
          <input type="number" id="idAreaRisco" name="idAreaRisco" value={formData.areaRiscoAfetada?.idAreaRisco || ''} onChange={handleChange} style={inputStyle} placeholder="ID de área de risco" min="1"/>
        </div>

        <button type="submit" style={buttonStyle} disabled={isLoading || isLoadingData}>
          {isLoading ? 'Salvando Alterações...' : 'Salvar Alterações'}
        </button>
      </form>
    </div>
  );
}