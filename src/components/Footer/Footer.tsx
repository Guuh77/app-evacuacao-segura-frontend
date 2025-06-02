import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <ul className={styles.footerLinks}>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/alertas">Alertas</Link>
          </li>
          <li>
            <Link href="/abrigos-seguros">Abrigos</Link>
          </li>
          <li>
            <Link href="/integrantes">Sobre a Equipe</Link>
          </li>
        </ul>
        <p className={styles.copyright}>
          &copy; {currentYear} Aplicativo de Evacuação e Rotas Seguras. Todos os direitos reservados.
        </p>
        {}
      </div>
    </footer>
  );
};

export default Footer;