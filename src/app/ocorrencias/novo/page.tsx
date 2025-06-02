"use client";

import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface NovaOcorrenciaData {
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

const initialFormData: NovaOcorrenciaData = {
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

export default function PaginaNovaOcorrencia() {
  const router = useRouter();
  const [formData, setFormData] = useState<NovaOcorrenciaData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
      setFormData(prev => ({ ...prev, [name]: value, }));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      setError("URL da API não configurada.");
      setIsLoading(false);
      return;
    }

    const payload: Partial<OcorrenciaPayload> = {
      tituloOcorrencia: formData.tituloOcorrencia,
      tipoOcorrencia: formData.tipoOcorrencia,
    };

    const lat = parseFloat(formData.latitudeOcorrencia);
    const lon = parseFloat(formData.longitudeOcorrencia);

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
    if (!isNaN(idAlerta) && idAlerta > 0) payload.alertaRelacionado = { idAlerta };

    const idAreaRisco = formData.areaRiscoAfetada?.idAreaRisco ? parseInt(formData.areaRiscoAfetada.idAreaRisco, 10) : NaN;
    if (!isNaN(idAreaRisco) && idAreaRisco > 0) payload.areaRiscoAfetada = { idAreaRisco };
    
    const idUsuario = formData.usuarioReportou?.idUsuario ? parseInt(formData.usuarioReportou.idUsuario, 10) : NaN;
    if (!isNaN(idUsuario) && idUsuario > 0) payload.usuarioReportou = { idUsuario };
    
    console.log("Enviando payload para API (Ocorrências):", JSON.stringify(payload, null, 2));

    try {
      const response = await fetch(`${apiUrl}/ocorrencias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMsg = `Falha ao criar ocorrência: Status ${response.status} ${response.statusText}`;
        try {
            const errorData = await response.json();
            if (errorData && errorData.message) {
              errorMsg = errorData.message;
            } else if (typeof errorData === 'string' && errorData.length > 0){
              errorMsg = errorData;
            }
             console.error("Erro da API (JSON):", errorData);
        } catch (parseJsonError) {
            console.warn("Falha ao parsear corpo do erro JSON, tentando como texto. Erro:", parseJsonError);
            try {
                const textErrorBody = await response.text();
                if (textErrorBody && textErrorBody.length > 0 && textErrorBody.length < 500) {
                    errorMsg = textErrorBody;
                }
                console.error("Erro da API (Texto):", textErrorBody);
            } catch (parseTextError) {
                 console.warn("Falha ao ler corpo do erro como Texto. Erro:", parseTextError);
            }
        }
        throw new Error(errorMsg);
      }

      const novaOcorrencia = await response.json();
      setSuccessMessage(`Ocorrência "${novaOcorrencia.tituloOcorrencia}" criada com sucesso! ID: ${novaOcorrencia.idOcorrencia}`);
      setFormData(initialFormData);
      
      setTimeout(() => { router.push('/ocorrencias'); }, 2000);

    } catch (error) {
      let errorMessage = "Ocorreu um erro desconhecido ao criar a ocorrência.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setError(errorMessage);
      console.error("Erro no handleSubmit de Nova Ocorrência:", error);
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

  return (
    <div style={{ fontFamily: 'var(--fonte-principal)', padding: '20px', maxWidth: '700px', margin: '2rem auto', color: 'var(--cor-texto-principal)' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '2px solid var(--cor-borda)', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '2rem', margin: 0, color: '#fff' }}>Registrar Nova Ocorrência</h1>
        <Link href="/ocorrencias" className="button-style" style={{ fontSize: '0.9rem', padding: '8px 15px', backgroundColor: '#555' }}>
          &larr; Voltar para Lista de Ocorrências
        </Link>
      </header>

      {error && <p style={errorStyle}>{error}</p>}
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
          <label htmlFor="tipoOcorrencia" style={labelStyle}>Tipo da Ocorrência (Obrigatório, ex: enchente_confirmada):</label>
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
        <hr style={{borderColor: 'var(--cor-borda)', marginBlock: '1rem'}}/>
        <p style={{color: 'var(--cor-texto-secundario)', fontSize: '0.9em'}}>Associações (Opcional - use IDs existentes):</p>
        <div>
          <label htmlFor="idUsuario" style={labelStyle}>ID do Usuário que Reportou:</label>
          <input type="number" id="idUsuario" name="idUsuario" value={formData.usuarioReportou?.idUsuario || ''} onChange={handleChange} style={inputStyle} placeholder="ID de usuário existente" min="1"/>
        </div>
        <div>
          <label htmlFor="idAlerta" style={labelStyle}>ID do Alerta Relacionado:</label>
          <input type="number" id="idAlerta" name="idAlerta" value={formData.alertaRelacionado?.idAlerta || ''} onChange={handleChange} style={inputStyle} placeholder="ID de alerta existente" min="1"/>
        </div>
        <div>
          <label htmlFor="idAreaRisco" style={labelStyle}>ID da Área de Risco Afetada:</label>
          <input type="number" id="idAreaRisco" name="idAreaRisco" value={formData.areaRiscoAfetada?.idAreaRisco || ''} onChange={handleChange} style={inputStyle} placeholder="ID de área de risco existente" min="1"/>
        </div>

        <button type="submit" style={buttonStyle} disabled={isLoading}>
          {isLoading ? 'Registrando...' : 'Registrar Ocorrência'}
        </button>
      </form>
    </div>
  );
}