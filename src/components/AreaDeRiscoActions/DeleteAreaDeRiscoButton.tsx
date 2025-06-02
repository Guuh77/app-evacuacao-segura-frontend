"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

interface DeleteAreaDeRiscoButtonProps {
  areaId: number;
  onDeleteSuccess?: () => void; 
}

const DeleteAreaDeRiscoButton: React.FC<DeleteAreaDeRiscoButtonProps> = ({ areaId, onDeleteSuccess }) => {
  const router = useRouter();

  const handleDelete = async () => {

    if (!areaId || isNaN(Number(areaId))) {
        alert("ID da área de risco inválido. Não é possível excluir.");
        console.error("[DeleteAreaDeRiscoButton] Tentativa de exclusão com ID inválido:", areaId);
        return;
    }

    if (!window.confirm(`Tem certeza que deseja excluir a Área de Risco ID ${areaId}? Esta ação não pode ser desfeita.`)) {
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      alert("URL da API não configurada. Deleção não pode prosseguir.");
      console.error("[DeleteAreaDeRiscoButton] NEXT_PUBLIC_API_URL não está definida.");
      return;
    }

    const deleteUrl = `${apiUrl}/areas-de-risco/${areaId}`;

    try {
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
      });

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
            console.error("[DeleteAreaDeRiscoButton] Detalhes do corpo do erro da API (JSON):", errorBody);
        } catch (jsonParseError) {
            console.warn("[DeleteAreaDeRiscoButton] Não foi possível parsear o corpo do erro como JSON. Tentando como texto. Erro de parse JSON:", jsonParseError);
            try {
                const textErrorBody = await response.text();
                if (textErrorBody && textErrorBody.length > 0 && textErrorBody.length < 500) {
                    errorDetails = textErrorBody;
                }
                console.error("[DeleteAreaDeRiscoButton] Detalhes do corpo do erro da API (Texto):", textErrorBody);
            } catch (textParseError) {
                console.warn("[DeleteAreaDeRiscoButton] Não foi possível ler o corpo do erro como Texto. Usando status/texto do erro. Erro no parse do corpo:", textParseError);
            }
        }
        throw new Error(`Falha ao excluir área de risco: ${errorDetails}`);
      }

      alert(`Área de Risco ID ${areaId} excluída com sucesso!`);
      
      if (onDeleteSuccess) {
        onDeleteSuccess();
      } else {
        router.refresh(); 
      }

    } catch (error) {
      console.error("[DeleteAreaDeRiscoButton] Erro ao excluir área de risco (catch principal):", error);
      alert(`Erro ao excluir área de risco: ${error instanceof Error ? error.message : String(error)}`);
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

export default DeleteAreaDeRiscoButton;