"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

interface DeleteAlertaButtonProps {
  alertaId: number;
  onDeleteSuccess?: () => void;
}

const DeleteAlertaButton: React.FC<DeleteAlertaButtonProps> = ({ alertaId, onDeleteSuccess }) => {
  const router = useRouter();

  console.log(`DeleteAlertaButton renderizado para alertaId: ${alertaId}`);

  const handleDelete = async () => {
    console.log(`Tentando excluir alerta com ID (no handleDelete): ${alertaId}`);

    if (!window.confirm(`Tem certeza que deseja excluir o alerta ID ${alertaId}? Esta ação não pode ser desfeita.`)) {
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      alert("URL da API não configurada. Deleção não pode prosseguir.");
      console.error("NEXT_PUBLIC_API_URL não está definida.");
      return;
    }

    const deleteUrl = `${apiUrl}/alertas/${alertaId}`;
    console.log(`Enviando DELETE para: ${deleteUrl}`);

    try {
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Status ${response.status}: ${response.statusText}` }));
        throw new Error(errorData?.message || `Falha ao excluir alerta: ${response.status} ${response.statusText}`);
      }

      alert(`Alerta ID ${alertaId} excluído com sucesso!`);
      
      if (onDeleteSuccess) {
        onDeleteSuccess();
      } else {
        router.refresh(); 
      }

    } catch (error) {
      console.error("Erro ao excluir alerta:", error);
      alert(`Erro ao excluir alerta: ${error instanceof Error ? error.message : String(error)}`);
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

export default DeleteAlertaButton;