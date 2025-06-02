"use client";

import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface NovaAreaDeRiscoData {
  nomeArea: string;
  descricaoRisco?: string;
  tipoRisco: string;
  latitudeCentro: number | string;
  longitudeCentro: number | string;
  raioKm?: number | string;
  poligonoCoordenadas?: string;
  nivelRiscoPermanente?: string;
}

const initialFormData: NovaAreaDeRiscoData = {
  nomeArea: '',
  descricaoRisco: '',
  tipoRisco: '',
  latitudeCentro: '',
  longitudeCentro: '',
  raioKm: '',
  poligonoCoordenadas: '',
  nivelRiscoPermanente: 'medio',
};

export default function PaginaNovaAreaDeRisco() {
  const router = useRouter();
  const [formData, setFormData] = useState<NovaAreaDeRiscoData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'latitudeCentro' || name === 'longitudeCentro' || name === 'raioKm') && value === '' ? '' : value,
    }));
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

    const payload = {
      ...formData,
      latitudeCentro: parseFloat(formData.latitudeCentro as string),
      longitudeCentro: parseFloat(formData.longitudeCentro as string),
      raioKm: formData.raioKm ? parseFloat(formData.raioKm as string) : undefined,
    };

    for (const key in payload) {
        if (payload[key as keyof typeof payload] === '' || payload[key as keyof typeof payload] === undefined) {
            delete payload[key as keyof typeof payload];
        }
    }
    if (!payload.nivelRiscoPermanente) {
        payload.nivelRiscoPermanente = 'medio';
    }

    try {
      const response = await fetch(`${apiUrl}/areas-de-risco`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Falha ao criar área de risco: ${response.status}` }));
        throw new Error(errorData.message || `Falha ao criar área de risco: ${response.status}`);
      }

      const novaArea = await response.json();
      setSuccessMessage(`Área de Risco "${novaArea.nomeArea}" criada com sucesso! ID: ${novaArea.idAreaRisco}`);
      setFormData(initialFormData);

      setTimeout(() => {
        router.push('/areas-de-risco');
      }, 2000);

    } catch (err) {
      let errorMessage = "Ocorreu um erro desconhecido ao criar a área de risco.";
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

  return (
    <div style={{ fontFamily: 'var(--fonte-principal)', padding: '20px', maxWidth: '700px', margin: '2rem auto', color: 'var(--cor-texto-principal)' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '2px solid var(--cor-borda)', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '2rem', margin: 0, color: '#fff' }}>Cadastrar Nova Área de Risco</h1>
        <Link href="/areas-de-risco" className="button-style" style={{ fontSize: '0.9rem', padding: '8px 15px', backgroundColor: '#555' }}>
          &larr; Voltar para Lista de Áreas de Risco
        </Link>
      </header>

      {error && <p style={errorStyle}>{error}</p>}
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
          <label htmlFor="tipoRisco" style={labelStyle}>Tipo de Risco (Obrigatório, ex: deslizamento, enchente):</label>
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
          <label htmlFor="poligonoCoordenadas" style={labelStyle}>Polígono de Coordenadas (Opcional, ex: GeoJSON):</label>
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

        <button type="submit" style={buttonStyle} disabled={isLoading}>
          {isLoading ? 'Cadastrando...' : 'Cadastrar Área de Risco'}
        </button>
      </form>
    </div>
  );
}