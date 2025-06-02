"use client";

import React, { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

interface RelatoData {
  tituloRelato?: string;
  textoRelato: string;
  tipoRelato?: string;
  anonimo: boolean;
  latitudeRelato?: string;
  longitudeRelato?: string;
  statusValidacaoRelato?: string;
  usuarioAutor?: { idUsuario?: string };
  ocorrenciaAssociada?: { idOcorrencia?: string };
  alertaAssociado?: { idAlerta?: string };
  areaRiscoAssociada?: { idAreaRisco?: string };
  abrigoAssociado?: { idAbrigo?: string };
  campanhaAssociada?: { idCampanha?: string };
  idRelato?: number;
  dataHoraRelato?: string;
}

const initialFormData: RelatoData = {
  tituloRelato: '',
  textoRelato: '',
  tipoRelato: 'informacao_util',
  anonimo: false,
  latitudeRelato: '',
  longitudeRelato: '',
  statusValidacaoRelato: 'pendente',
  usuarioAutor: { idUsuario: '' },
  ocorrenciaAssociada: { idOcorrencia: '' },
  alertaAssociado: { idAlerta: '' },
  areaRiscoAssociada: { idAreaRisco: '' },
  abrigoAssociado: { idAbrigo: '' },
  campanhaAssociada: { idCampanha: '' },
};

interface RelatoPayload {
  tituloRelato?: string;
  textoRelato: string;
  tipoRelato?: string;
  anonimo: boolean;
  latitudeRelato?: number;
  longitudeRelato?: number;
  statusValidacaoRelato?: string;
  ocorrenciaAssociada?: { idOcorrencia: number };
  alertaAssociado?: { idAlerta: number };
  areaRiscoAssociada?: { idAreaRisco: number };
  abrigoAssociado?: { idAbrigo: number };
  campanhaAssociada?: { idCampanha: number };
}


export default function PaginaEditarRelato() {
  const router = useRouter();
  const params = useParams();
  const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const idRelato = idParam ? Number(idParam) : null;

  const [formData, setFormData] = useState<RelatoData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (idRelato && !isNaN(idRelato)) {
      const fetchRelato = async () => {
        setIsLoadingData(true);
        setError(null);
        const currentApiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!currentApiUrl) {
          setError("URL da API não configurada.");
          setIsLoadingData(false);
          return;
        }
        try {
          const response = await fetch(`${currentApiUrl}/relatos/${idRelato}`);
          if (!response.ok) {
            const status = response.status;
            const statusText = response.statusText;
            let errorDetails = `Status ${status}: ${statusText}`;
            try {
                const errorBody = await response.json();
                if (errorBody && errorBody.message) errorDetails = errorBody.message;
            } catch (parseError) { 
                console.warn("Página Editar Relato - Falha ao parsear corpo do erro JSON:", parseError);
            }
            throw new Error(`Falha ao buscar dados do relato: ${errorDetails}`);
          }
          const data: RelatoData = await response.json();
          setFormData({
            ...initialFormData,
            idRelato: data.idRelato,
            tituloRelato: data.tituloRelato || '',
            textoRelato: data.textoRelato || '',
            tipoRelato: data.tipoRelato || 'informacao_util',
            anonimo: data.anonimo || false,
            latitudeRelato: data.latitudeRelato?.toString() || '',
            longitudeRelato: data.longitudeRelato?.toString() || '',
            statusValidacaoRelato: data.statusValidacaoRelato || 'pendente',
            usuarioAutor: { idUsuario: data.usuarioAutor?.idUsuario?.toString() || '' },
            ocorrenciaAssociada: { idOcorrencia: data.ocorrenciaAssociada?.idOcorrencia?.toString() || '' },
            alertaAssociado: { idAlerta: data.alertaAssociado?.idAlerta?.toString() || '' },
            areaRiscoAssociada: { idAreaRisco: data.areaRiscoAssociada?.idAreaRisco?.toString() || '' },
            abrigoAssociado: { idAbrigo: data.abrigoAssociado?.idAbrigo?.toString() || '' },
            campanhaAssociada: { idCampanha: data.campanhaAssociada?.idCampanha?.toString() || '' },
            dataHoraRelato: data.dataHoraRelato,
          });
        } catch (err) {
          let errorMessage = "Ocorreu um erro desconhecido ao carregar os dados do relato.";
          if (err instanceof Error) errorMessage = err.message;
          setError(errorMessage);
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchRelato();
    } else {
      setError("ID do Relato não fornecido ou inválido na URL.");
      setIsLoadingData(false);
    }
  }, [params.id, idRelato]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        switch (name) {
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
    if (!idRelato) {
        setError("ID do Relato é inválido para atualização.");
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
    
    const payload: Partial<RelatoPayload> = {
        textoRelato: formData.textoRelato,
        anonimo: formData.anonimo,
    };

    if (formData.tituloRelato) payload.tituloRelato = formData.tituloRelato;
    if (formData.tipoRelato) payload.tipoRelato = formData.tipoRelato;
    if (formData.statusValidacaoRelato) payload.statusValidacaoRelato = formData.statusValidacaoRelato;
    
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
    if (ocorrenciaIdObj) payload.ocorrenciaAssociada = { idOcorrencia: ocorrenciaIdObj.id }; else delete payload.ocorrenciaAssociada;
    
    const alertaIdObj = parseAndSetOptionalId(formData.alertaAssociado?.idAlerta);
    if (alertaIdObj) payload.alertaAssociado = { idAlerta: alertaIdObj.id }; else delete payload.alertaAssociado;

    const areaRiscoIdObj = parseAndSetOptionalId(formData.areaRiscoAssociada?.idAreaRisco);
    if (areaRiscoIdObj) payload.areaRiscoAssociada = { idAreaRisco: areaRiscoIdObj.id }; else delete payload.areaRiscoAssociada;

    const abrigoIdObj = parseAndSetOptionalId(formData.abrigoAssociado?.idAbrigo);
    if (abrigoIdObj) payload.abrigoAssociado = { idAbrigo: abrigoIdObj.id }; else delete payload.abrigoAssociado;

    const campanhaIdObj = parseAndSetOptionalId(formData.campanhaAssociada?.idCampanha);
    if (campanhaIdObj) payload.campanhaAssociada = { idCampanha: campanhaIdObj.id }; else delete payload.campanhaAssociada;

    console.log("Enviando payload para API (Update Relato):", JSON.stringify(payload, null, 2));

    try {
      const response = await fetch(`${currentApiUrl}/relatos/${idRelato}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMsg = `Falha ao atualizar relato: Status ${response.status} ${response.statusText}`;
        try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorMsg;
        } catch (parseErr) {
            console.warn("Falha ao parsear corpo do erro JSON na atualização de relato:", parseErr);
        }
        throw new Error(errorMsg);
      }
      setSuccessMessage(`Relato "${formData.tituloRelato || 'ID: ' + idRelato}" atualizado com sucesso!`);
      setTimeout(() => {
        router.push('/relatos');
      }, 2000);

    } catch (error) {
      let errorMessage = "Ocorreu um erro desconhecido ao atualizar o relato.";
      if (error instanceof Error) errorMessage = error.message;
      setError(errorMessage);
      console.error("Erro no handleSubmit de Editar Relato:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px', margin: '0 auto' };
  const inputStyle: React.CSSProperties = { padding: '10px', border: '1px solid var(--cor-borda)', borderRadius: '4px', fontSize: '1rem', backgroundColor: '#333', color: 'var(--cor-texto-principal)' };
  const labelStyle: React.CSSProperties = { marginBottom: '0.25rem', fontWeight: 'bold', color: 'var(--cor-texto-secundario)' };
  const checkboxLabelStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--cor-texto-secundario)' };
  const buttonStyle: React.CSSProperties = { padding: '12px 18px', backgroundColor: 'var(--cor-destaque-verde)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem', fontWeight: '500', opacity: isLoading || isLoadingData ? 0.7 : 1 };
  const errorStyle: React.CSSProperties = { color: 'var(--cor-alerta-erro)', marginBottom: '1rem', border: '1px solid var(--cor-alerta-erro)', padding: '10px', borderRadius: '4px', backgroundColor: 'rgba(217, 83, 79, 0.1)' };
  const successStyle: React.CSSProperties = { color: 'var(--cor-alerta-sucesso)', marginBottom: '1rem', border: '1px solid var(--cor-alerta-sucesso)', padding: '10px', borderRadius: '4px', backgroundColor: 'rgba(60, 179, 113, 0.1)' };

  if (isLoadingData) {
    return <div style={{ padding: '20px', textAlign: 'center', color: 'var(--cor-texto-principal)'}}>Carregando dados do relato...</div>;
  }
  
  if (error && !successMessage && formData.textoRelato === '' ) {
    return (
        <div style={{ fontFamily: 'var(--fonte-principal)', padding: '20px', maxWidth: '700px', margin: '2rem auto', color: 'var(--cor-texto-principal)' }}>
             <header style={{ marginBottom: '2rem', borderBottom: '2px solid var(--cor-borda)', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: '2rem', margin: 0, color: '#fff' }}>Editar Relato</h1>
                <Link href="/relatos" className="button-style" style={{ fontSize: '0.9rem', padding: '8px 15px', backgroundColor: '#555' }}>
                &larr; Voltar para Lista de Relatos
                </Link>
            </header>
            <p style={errorStyle}>Erro ao carregar dados do relato: {error}</p>
        </div>
    );
  }

  return (
    <div style={{ fontFamily: 'var(--fonte-principal)', padding: '20px', maxWidth: '700px', margin: '2rem auto', color: 'var(--cor-texto-principal)' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '2px solid var(--cor-borda)', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '2rem', margin: 0, color: '#fff' }}>Editar Relato (ID: {idRelato})</h1>
        <Link href="/relatos" className="button-style" style={{ fontSize: '0.9rem', padding: '8px 15px', backgroundColor: '#555' }}>
          &larr; Voltar para Lista de Relatos
        </Link>
      </header>

      {error && formData.textoRelato !== '' && <p style={errorStyle}>{error}</p>} {}
      {successMessage && <p style={successStyle}>{successMessage}</p>}

      <form onSubmit={handleSubmit} style={formStyle}>
        <div>
            <label htmlFor="idUsuarioAutor" style={labelStyle}>ID do Usuário Autor (Não editável):</label>
            <input type="text" id="idUsuarioAutorDisplay" name="idUsuarioAutorDisplay" value={formData.usuarioAutor?.idUsuario || ''} style={{...inputStyle, backgroundColor: '#444'}} readOnly />
        </div>
        {formData.dataHoraRelato && (
            <div style={{fontSize: '0.9em', color: 'var(--cor-texto-secundario)', marginTop: '0.5rem', marginBottom: '0.5rem'}}>
                Enviado em (Não editável): {new Date(formData.dataHoraRelato).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
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
          <label htmlFor="statusValidacaoRelato" style={labelStyle}>Status de Validação:</label>
          <select id="statusValidacaoRelato" name="statusValidacaoRelato" value={formData.statusValidacaoRelato} onChange={handleChange} style={inputStyle}>
            <option value="pendente">Pendente</option>
            <option value="validado">Validado</option>
            <option value="rejeitado">Rejeitado</option>
            <option value="em_analise">Em Análise</option>
          </select>
        </div>
        <div style={checkboxLabelStyle}>
          <input type="checkbox" id="anonimo" name="anonimo" checked={formData.anonimo} onChange={handleChange} style={{width: 'auto', marginRight: '8px'}} />
          <label htmlFor="anonimo">Manter como Anônimo</label>
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

        <button type="submit" style={buttonStyle} disabled={isLoading || isLoadingData}>
          {isLoading ? 'Salvando Alterações...' : 'Salvar Alterações'}
        </button>
      </form>
    </div>
  );
}