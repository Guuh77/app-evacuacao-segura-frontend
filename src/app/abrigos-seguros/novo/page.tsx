"use client";

import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface NovoAbrigoData {
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
}

const initialFormData: NovoAbrigoData = {
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

export default function PaginaNovoAbrigo() {
  const router = useRouter();
  const [formData, setFormData] = useState<NovoAbrigoData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'latitudeAbrigo' || name === 'longitudeAbrigo' || name === 'capacidadeMaximaPessoas' || name === 'vagasDisponiveisAtual') && value === '' ? '' : value,
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
      latitudeAbrigo: parseFloat(formData.latitudeAbrigo as string),
      longitudeAbrigo: parseFloat(formData.longitudeAbrigo as string),
      capacidadeMaximaPessoas: formData.capacidadeMaximaPessoas ? parseInt(formData.capacidadeMaximaPessoas as string, 10) : undefined,
      vagasDisponiveisAtual: formData.vagasDisponiveisAtual ? parseInt(formData.vagasDisponiveisAtual as string, 10) : undefined,
    };

    for (const key in payload) {
        if (payload[key as keyof typeof payload] === '' || payload[key as keyof typeof payload] === undefined) {
            delete payload[key as keyof typeof payload];
        }
    }
    if (!payload.statusOperacional) {
        payload.statusOperacional = 'aberto';
    }


    try {
      const response = await fetch(`${apiUrl}/abrigos-seguros`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Falha ao criar abrigo: ${response.status}` }));
        throw new Error(errorData.message || `Falha ao criar abrigo: ${response.status}`);
      }

      const novoAbrigo = await response.json();
      setSuccessMessage(`Abrigo "${novoAbrigo.nomeAbrigo}" criado com sucesso! ID: ${novoAbrigo.idAbrigo}`);
      setFormData(initialFormData);

      setTimeout(() => {
        router.push('/abrigos-seguros');
      }, 2000);

    } catch (err) {
      let errorMessage = "Ocorreu um erro desconhecido ao criar o abrigo.";
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
        <h1 style={{ fontSize: '2rem', margin: 0, color: '#fff' }}>Cadastrar Novo Abrigo Seguro</h1>
        <Link href="/abrigos-seguros" className="button-style" style={{ fontSize: '0.9rem', padding: '8px 15px', backgroundColor: '#555' }}>
          &larr; Voltar para Lista de Abrigos
        </Link>
      </header>

      {error && <p style={errorStyle}>{error}</p>}
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
          <label htmlFor="latitudeAbrigo" style={labelStyle}>Latitude (Obrigatório, ex: -23.5505):</label>
          <input type="number" step="any" id="latitudeAbrigo" name="latitudeAbrigo" value={formData.latitudeAbrigo} onChange={handleChange} style={inputStyle} required />
        </div>
        <div>
          <label htmlFor="longitudeAbrigo" style={labelStyle}>Longitude (Obrigatório, ex: -46.6333):</label>
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
          <label htmlFor="recursosOferecidos" style={labelStyle}>Recursos Oferecidos (Opcional, ex: Água, Comida):</label>
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
          <label htmlFor="statusOperacional" style={labelStyle}>Status Operacional (Opcional):</label>
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

        <button type="submit" style={buttonStyle} disabled={isLoading}>
          {isLoading ? 'Cadastrando...' : 'Cadastrar Abrigo'}
        </button>
      </form>
    </div>
  );
}