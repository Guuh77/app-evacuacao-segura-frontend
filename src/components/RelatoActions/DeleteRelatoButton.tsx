"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

interface DeleteRelatoButtonProps {
  relatoId: number;
  onDeleteSuccess?: () => void; 
}

const DeleteRelatoButton: React.FC<DeleteRelatoButtonProps> = ({ relatoId, onDeleteSuccess }) => {
  const router = useRouter();

  const handleDelete = async () => {
    if (!relatoId || isNaN(Number(relatoId))) {
        alert("ID do relato inválido. Não é possível excluir.");
        console.error("[DeleteRelatoButton] Tentativa de exclusão com ID inválido:", relatoId);
        return;
    }

    if (!window.confirm(`Tem certeza que deseja excluir o Relato ID ${relatoId}? Esta ação não pode ser desfeita.`)) {
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      alert("URL da API não configurada. Deleção não pode prosseguir.");
      console.error("[DeleteRelatoButton] NEXT_PUBLIC_API_URL não está definida.");
      return;
    }

    const deleteUrl = `${apiUrl}/relatos/${relatoId}`;
    console.log(`[DeleteRelatoButton] Enviando DELETE para: ${deleteUrl}`);

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
            }
            console.error("[DeleteRelatoButton] Detalhes do corpo do erro da API:", errorData);
        } catch (parseError) {
            console.warn("[DeleteRelatoButton] Não foi possível parsear corpo do erro JSON. Usando status/texto. Erro de parse:", parseError);
        }
        throw new Error(`Falha ao excluir relato: ${errorDetails}`);
      }

      alert(`Relato ID ${relatoId} excluído com sucesso!`);

      if (onDeleteSuccess) {
        onDeleteSuccess();
      } else {
        router.refresh(); 
      }

    } catch (error) {
      console.error("[DeleteRelatoButton] Erro ao excluir relato:", error);
      alert(`Erro ao excluir relato: ${error instanceof Error ? error.message : String(error)}`);
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

export default DeleteRelatoButton;