import React from 'react';
import Link from 'next/link';

export default function PaginaIntegrantes() {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <h1 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        Integrantes do Projeto
      </h1>
      <div style={{ marginTop: '20px' }}>
        <div style={{ marginBottom: '15px' }}>
          <h2 style={{ fontSize: '1.2em', marginBlock: '0.5em' }}>Gustavo</h2>
          <p style={{ marginBlock: '0.2em' }}>RM: 561055</p>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <h2 style={{ fontSize: '1.2em', marginBlock: '0.5em' }}>Arthur</h2>
          <p style={{ marginBlock: '0.2em' }}>RM: 560820</p>
        </div>
      </div>
      <div style={{ marginTop: '30px', paddingTop: '15px', borderTop: '1px solid #ccc' }}>
        <p>
          {/* 2. Substitua <a> por <Link> e o atributo href continua o mesmo */}
          <Link href="/" style={{ color: '#0070f3', textDecoration: 'none' }}>
            Voltar para a Home
          </Link>
        </p>
      </div>
    </div>
  );
}