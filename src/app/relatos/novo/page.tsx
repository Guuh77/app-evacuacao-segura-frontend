"use client";

import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface NovoRelatoData {
  tituloRelato?: string;
  textoRelato: string;
  tipoRelato?: string; 
  anonimo: boolean;
  latitudeRelato?: string; 
  longitudeRelato?: string; 
  usuarioAutor: { idUsuario?: string };
  ocorrenciaAssociada?: { idOcorrencia?: string };
  alertaAssociado?: { idAlerta?: string };
  areaRiscoAssociada?: { idAreaRisco?: string };
  abrigoAssociado?: { idAbrigo?: string };
  campanhaAssociada?: { idCampanha?: string };
}

interface RelatoPayload {
  tituloRelato?: string;
  textoRelato: string;
  tipoRelato?: string;
  anonimo: boolean;
  latitudeRelato?: number;
  longitudeRelato?: number;
  usuarioAutor?: { idUsuario: number };
  ocorrenciaAssociada?: { idOcorrencia: number };
  alertaAssociado?: { idAlerta: number };
  areaRiscoAssociada?: { idAreaRisco: number };
  abrigoAssociado?: { idAbrigo: number };
  campanhaAssociada?: { idCampanha: number };
}

const initialFormData: NovoRelatoData = {
  tituloRelato: '',
  textoRelato: '',
  tipoRelato: 'informacao_util',
  anonimo: false,
  latitudeRelato: '',
  longitudeRelato: '',
  usuarioAutor: { idUsuario: '' },
  ocorrenciaAssociada: { idOcorrencia: '' },
  alertaAssociado: { idAlerta: '' },
  areaRiscoAssociada: { idAreaRisco: '' },
  abrigoAssociado: { idAbrigo: '' },
  campanhaAssociada: { idCampanha: '' },
};

export default function PaginaNovoRelato() {
  const router = useRouter();
  const [formData, setFormData] = useState<NovoRelatoData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => {
            const newState = { ...prev, [name]: checked };
            if (name === 'anonimo' && checked) {
                newState.usuarioAutor = { idUsuario: '' };
            }
            return newState;
        });
    } else {
        switch (name) {
          case "idUsuarioAutor":
            setFormData(prev => ({ ...prev, usuarioAutor: { idUsuario: value } }));
            break;
          case "idOcorrencia":
            setFormData(prev => ({ ...prev, ocorrenciaAssociada: { idOcorrencia: value } }));
            break;
          case "idAlerta":
            setFormData(prev => ({ ...prev, alertaAssociado: { idAlerta: value } }));
            break;
          case "idAreaRisco":
            setFormData(prev => ({ ...prev, areaRiscoAssociada: { idAreaRisco: value } }));
            break;
          case "idAbrigo":
            setFormData(prev => ({ ...prev, abrigoAssociado: { idAbrigo: value } }));
            break;
          case "idCampanha":
            setFormData(prev => ({ ...prev, campanhaAssociada: { idCampanha: value } }));
            break;
          default:
            setFormData(prev => ({ ...prev, [name]: value }));
            break;
        }
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

    if (!formData.anonimo && (!formData.usuarioAutor?.idUsuario || formData.usuarioAutor.idUsuario === '' || isNaN(parseInt(formData.usuarioAutor.idUsuario, 10)) || parseInt(formData.usuarioAutor.idUsuario, 10) <= 0 )) {
        setError("Se o relato não for anônimo, o ID do Usuário Autor é obrigatório e deve ser um número válido maior que zero.");
        setIsLoading(false);
        return;
    }

    const payload: Partial<RelatoPayload> = {
        textoRelato: formData.textoRelato,
        anonimo: formData.anonimo,
    };

    if (!formData.anonimo && formData.usuarioAutor?.idUsuario) {
        payload.usuarioAutor = { idUsuario: parseInt(formData.usuarioAutor.idUsuario, 10) };
    }

    if (formData.tituloRelato) payload.tituloRelato = formData.tituloRelato;
    if (formData.tipoRelato) payload.tipoRelato = formData.tipoRelato;
    
    if (formData.latitudeRelato) {
        const lat = parseFloat(formData.latitudeRelato);
        if (!isNaN(lat)) payload.latitudeRelato = lat;
    }
    if (formData.longitudeRelato) {
        const lon = parseFloat(formData.longitudeRelato);
        if (!isNaN(lon)) payload.longitudeRelato = lon;
    }

    const parseAndSetOptionalId = (idString?: string): { id: number } | undefined => {
        if (idString) {
            const idNum = parseInt(idString, 10);
            if (!isNaN(idNum) && idNum > 0) return { id: idNum };
        }
        return undefined;
    };

    const ocorrenciaIdObj = parseAndSetOptionalId(formData.ocorrenciaAssociada?.idOcorrencia);
    if (ocorrenciaIdObj) payload.ocorrenciaAssociada = { idOcorrencia: ocorrenciaIdObj.id };
    
    const alertaIdObj = parseAndSetOptionalId(formData.alertaAssociado?.idAlerta);
    if (alertaIdObj) payload.alertaAssociado = { idAlerta: alertaIdObj.id };

    const areaRiscoIdObj = parseAndSetOptionalId(formData.areaRiscoAssociada?.idAreaRisco);
    if (areaRiscoIdObj) payload.areaRiscoAssociada = { idAreaRisco: areaRiscoIdObj.id };

    const abrigoIdObj = parseAndSetOptionalId(formData.abrigoAssociado?.idAbrigo);
    if (abrigoIdObj) payload.abrigoAssociado = { idAbrigo: abrigoIdObj.id };

    const campanhaIdObj = parseAndSetOptionalId(formData.campanhaAssociada?.idCampanha);
    if (campanhaIdObj) payload.campanhaAssociada = { idCampanha: campanhaIdObj.id };
    
    console.log("Enviando payload para API (Relatos):", JSON.stringify(payload, null, 2));

    try {
      const response = await fetch(`${apiUrl}/relatos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMsg = `Falha ao criar relato: Status ${response.status} ${response.statusText}`;
        try { 
            const errorData = await response.json(); 
            errorMsg = errorData.message || errorMsg; 
        } catch (parseError) { 
            console.warn("Falha ao parsear corpo do erro JSON na criação de relato:", parseError);
        }
        throw new Error(errorMsg);
      }

      const novoRelato = await response.json();
      setSuccessMessage(`Relato "${novoRelato.tituloRelato || 'ID: ' + novoRelato.idRelato}" criado com sucesso!`);
      setFormData(initialFormData);
      
      setTimeout(() => { router.push('/relatos'); }, 2000);

    } catch (error) {
      let errorMessage = "Ocorreu um erro desconhecido ao criar o relato.";
      if (error instanceof Error) errorMessage = error.message;
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px', margin: '0 auto' };
  const inputStyle: React.CSSProperties = { padding: '10px', border: '1px solid var(--cor-borda)', borderRadius: '4px', fontSize: '1rem', backgroundColor: '#333', color: 'var(--cor-texto-principal)' };
  const labelStyle: React.CSSProperties = { marginBottom: '0.25rem', fontWeight: 'bold', color: 'var(--cor-texto-secundario)' };
  const checkboxLabelStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--cor-texto-secundario)' };
  const buttonStyle: React.CSSProperties = { padding: '12px 18px', backgroundColor: 'var(--cor-destaque-verde)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem', fontWeight: '500', opacity: isLoading ? 0.7 : 1 };
  const errorStyle: React.CSSProperties = { color: 'var(--cor-alerta-erro)', marginBottom: '1rem', border: '1px solid var(--cor-alerta-erro)', padding: '10px', borderRadius: '4px', backgroundColor: 'rgba(217, 83, 79, 0.1)' };
  const successStyle: React.CSSProperties = { color: 'var(--cor-alerta-sucesso)', marginBottom: '1rem', border: '1px solid var(--cor-alerta-sucesso)', padding: '10px', borderRadius: '4px', backgroundColor: 'rgba(60, 179, 113, 0.1)' };

  return (
    <div style={{ fontFamily: 'var(--fonte-principal)', padding: '20px', maxWidth: '700px', margin: '2rem auto', color: 'var(--cor-texto-principal)' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '2px solid var(--cor-borda)', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '2rem', margin: 0, color: '#fff' }}>Enviar Novo Relato</h1>
        <Link href="/relatos" className="button-style" style={{ fontSize: '0.9rem', padding: '8px 15px', backgroundColor: '#555' }}>
          &larr; Voltar para Lista de Relatos
        </Link>
      </header>

      {error && <p style={errorStyle}>{error}</p>}
      {successMessage && <p style={successStyle}>{successMessage}</p>}

      <form onSubmit={handleSubmit} style={formStyle}>
        <div style={checkboxLabelStyle}>
          <input type="checkbox" id="anonimo" name="anonimo" checked={formData.anonimo} onChange={handleChange} style={{width: 'auto', marginRight: '8px'}} />
          <label htmlFor="anonimo">Enviar como Anônimo</label>
        </div>
        
        {!formData.anonimo && (
          <div>
            <label htmlFor="idUsuarioAutor" style={labelStyle}>Seu ID de Usuário (Obrigatório se não anônimo):</label>
            <input type="number" id="idUsuarioAutor" name="idUsuarioAutor" value={formData.usuarioAutor?.idUsuario || ''} onChange={handleChange} style={inputStyle} required={!formData.anonimo} min="1" placeholder="ID do seu usuário no sistema"/>
          </div>
        )}

        <div>
          <label htmlFor="tituloRelato" style={labelStyle}>Título do Relato (Opcional):</label>
          <input type="text" id="tituloRelato" name="tituloRelato" value={formData.tituloRelato} onChange={handleChange} style={inputStyle} />
        </div>
        <div>
          <label htmlFor="textoRelato" style={labelStyle}>Texto do Relato (Obrigatório):</label>
          <textarea id="textoRelato" name="textoRelato" value={formData.textoRelato} onChange={handleChange} rows={5} style={inputStyle} required />
        </div>
        <div>
          <label htmlFor="tipoRelato" style={labelStyle}>Tipo do Relato:</label>
          <select id="tipoRelato" name="tipoRelato" value={formData.tipoRelato} onChange={handleChange} style={inputStyle}>
            <option value="informacao_util">Informação Útil</option>
            <option value="confirmacao_risco">Confirmação de Risco</option>
            <option value="pedido_ajuda">Pedido de Ajuda</option>
            <option value="feedback_servico">Feedback sobre Serviço</option>
            <option value="condicao_abrigo">Condição do Abrigo</option>
          </select>
        </div>
        <div>
          <label htmlFor="latitudeRelato" style={labelStyle}>Latitude (Opcional):</label>
          <input type="number" step="any" id="latitudeRelato" name="latitudeRelato" value={formData.latitudeRelato} onChange={handleChange} style={inputStyle} />
        </div>
        <div>
          <label htmlFor="longitudeRelato" style={labelStyle}>Longitude (Opcional):</label>
          <input type="number" step="any" id="longitudeRelato" name="longitudeRelato" value={formData.longitudeRelato} onChange={handleChange} style={inputStyle} />
        </div>
        
        <hr style={{borderColor: 'var(--cor-borda)', marginBlock: '1rem'}}/>
        <p style={{color: 'var(--cor-texto-secundario)', fontSize: '0.9em'}}>Associar este relato a (Opcional - IDs existentes):</p>
        
        <div>
          <label htmlFor="idOcorrencia" style={labelStyle}>ID da Ocorrência Associada:</label>
          <input type="number" id="idOcorrencia" name="idOcorrencia" value={formData.ocorrenciaAssociada?.idOcorrencia || ''} onChange={handleChange} style={inputStyle} placeholder="ID de ocorrência" min="1"/>
        </div>
        <div>
          <label htmlFor="idAlerta" style={labelStyle}>ID do Alerta Associado:</label>
          <input type="number" id="idAlerta" name="idAlerta" value={formData.alertaAssociado?.idAlerta || ''} onChange={handleChange} style={inputStyle} placeholder="ID de alerta" min="1"/>
        </div>
        <div>
          <label htmlFor="idAreaRisco" style={labelStyle}>ID da Área de Risco Associada:</label>
          <input type="number" id="idAreaRisco" name="idAreaRisco" value={formData.areaRiscoAssociada?.idAreaRisco || ''} onChange={handleChange} style={inputStyle} placeholder="ID de área de risco" min="1"/>
        </div>
        <div>
          <label htmlFor="idAbrigo" style={labelStyle}>ID do Abrigo Associado:</label>
          <input type="number" id="idAbrigo" name="idAbrigo" value={formData.abrigoAssociado?.idAbrigo || ''} onChange={handleChange} style={inputStyle} placeholder="ID de abrigo" min="1"/>
        </div>
        <div>
          <label htmlFor="idCampanha" style={labelStyle}>ID da Campanha Associada:</label>
          <input type="number" id="idCampanha" name="idCampanha" value={formData.campanhaAssociada?.idCampanha || ''} onChange={handleChange} style={inputStyle} placeholder="ID de campanha" min="1"/>
        </div>

        <button type="submit" style={buttonStyle} disabled={isLoading}>
          {isLoading ? 'Enviando...' : 'Enviar Relato'}
        </button>
      </form>
    </div>
  );
}