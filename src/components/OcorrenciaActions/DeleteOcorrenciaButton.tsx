"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

interface DeleteOcorrenciaButtonProps {
  ocorrenciaId: number;
  onDeleteSuccess?: () => void; 
}

const DeleteOcorrenciaButton: React.FC<DeleteOcorrenciaButtonProps> = ({ ocorrenciaId, onDeleteSuccess }) => {
  const router = useRouter();


  const handleDelete = async () => {

    if (!ocorrenciaId || isNaN(Number(ocorrenciaId))) {
        alert("ID da ocorrência inválido. Não é possível excluir.");
        console.error("[DeleteOcorrenciaButton] Tentativa de exclusão com ID inválido:", ocorrenciaId);
        return;
    }

    if (!window.confirm(`Tem certeza que deseja excluir a Ocorrência ID ${ocorrenciaId}? Esta ação não pode ser desfeita.`)) {
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      alert("URL da API não configurada. Deleção não pode prosseguir.");
      console.error("[DeleteOcorrenciaButton] NEXT_PUBLIC_API_URL não está definida.");
      return;
    }

    const deleteUrl = `${apiUrl}/ocorrencias/${ocorrenciaId}`;

    try {
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
      });

      if (!response.ok) {
        let errorDetails = `Status ${response.status}: ${response.statusText}`;
        try {
            const errorData = await response.json();
            if (errorData && errorData.message) {
                errorDetails = errorData.message;
            } else if (typeof errorData === 'string' && errorData.length > 0) {
                errorDetails = errorData;
            } else if (errorData && typeof errorData === 'object' && Object.keys(errorData).length > 0) {
                errorDetails = JSON.stringify(errorData);
            }
            console.error("[DeleteOcorrenciaButton] Detalhes do corpo do erro da API (JSON):", errorData);
        } catch (jsonParseError) {
            console.warn("[DeleteOcorrenciaButton] Não foi possível parsear o corpo do erro como JSON. Tentando como texto. Erro de parse JSON:", jsonParseError);
            try {
                const textErrorBody = await response.text();
                if (textErrorBody && textErrorBody.length > 0 && textErrorBody.length < 500) {
                    errorDetails = textErrorBody;
                }
                console.error("[DeleteOcorrenciaButton] Detalhes do corpo do erro da API (Texto):", textErrorBody);
            } catch (textParseError) {
                console.warn("[DeleteOcorrenciaButton] Não foi possível ler o corpo do erro como Texto. Usando status/texto do erro. Erro no parse do corpo:", textParseError);
            }
        }
        throw new Error(`Falha ao excluir ocorrência: ${errorDetails}`);
      }

      alert(`Ocorrência ID ${ocorrenciaId} excluída com sucesso!`);
      
      if (onDeleteSuccess) {
        onDeleteSuccess();
      } else {
        router.refresh(); 
      }

    } catch (error) {
      console.error("[DeleteOcorrenciaButton] Erro ao excluir ocorrência (catch principal):", error);
      alert(`Erro ao excluir ocorrência: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="button-style"
      style={{ 
        backgroundColor: 'var(--cor-alerta-erro)', 
        marginLeft: '10px', 
        padding: '6px 12px', 
        fontSize: '0.85rem' 
       }}
    >
      Excluir
    </button>
  );
};

export default DeleteOcorrenciaButton;