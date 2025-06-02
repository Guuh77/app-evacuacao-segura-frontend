"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

interface DeleteAbrigoSeguroButtonProps {
  abrigoId: number;
  onDeleteSuccess?: () => void; 
}

const DeleteAbrigoSeguroButton: React.FC<DeleteAbrigoSeguroButtonProps> = ({ abrigoId, onDeleteSuccess }) => {
  const router = useRouter();

  console.log(`[DeleteButton] Renderizado para abrigoId: ${abrigoId}, Tipo: ${typeof abrigoId}`);

  const handleDelete = async () => {
    console.log(`[DeleteButton] Tentando excluir abrigo com ID (no handleDelete): ${abrigoId}, Tipo: ${typeof abrigoId}`);

    if (!abrigoId || isNaN(Number(abrigoId))) {
        alert("ID do abrigo inválido. Não é possível excluir.");
        console.error("[DeleteButton] Tentativa de exclusão com ID inválido:", abrigoId);
        return;
    }

    if (!window.confirm(`Tem certeza que deseja excluir o abrigo seguro ID ${abrigoId}? Esta ação não pode ser desfeita.`)) {
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      alert("URL da API não configurada. Deleção não pode prosseguir.");
      console.error("[DeleteButton] NEXT_PUBLIC_API_URL não está definida.");
      return;
    }

    const deleteUrl = `${apiUrl}/abrigos-seguros/${abrigoId}`;
    console.log(`[DeleteButton] Enviando DELETE para: ${deleteUrl}`);

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
             console.error("[DeleteButton] Detalhes do corpo do erro da API:", errorData);
        } catch (parseError) {
            console.warn("[DeleteButton] Não foi possível parsear o corpo do erro como JSON, tentando como texto. Erro de parse:", parseError);
            try {
                const textErrorBody = await response.text();
                 if (textErrorBody && textErrorBody.length > 0 && textErrorBody.length < 500) { 
                    errorDetails = textErrorBody;
                 }
                 console.error("[DeleteButton] Detalhes do corpo do erro da API (Texto):", textErrorBody);
            } catch (textParseError) {
                 console.warn("[DeleteButton] Não foi possível ler o corpo do erro como Texto. Erro no parse do corpo:", textParseError);
            }
        }
        throw new Error(`Falha ao excluir abrigo seguro: ${errorDetails}`);
      }

      alert(`Abrigo Seguro ID ${abrigoId} excluído com sucesso!`);
      
      if (onDeleteSuccess) {
        onDeleteSuccess();
      } else {
        router.refresh(); 
      }

    } catch (error) {
      console.error("[DeleteButton] Erro ao excluir abrigo seguro (catch principal):", error);
      alert(`Erro ao excluir abrigo seguro: ${error instanceof Error ? error.message : String(error)}`);
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

export default DeleteAbrigoSeguroButton;