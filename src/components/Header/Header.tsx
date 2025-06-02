import React from 'react';
import Link from 'next/link';
import styles from './Header.module.css';


const Header = () => {

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logoLink}>
        <h1 className={styles.logo}>Evacuação Segura</h1>
      </Link>
      <nav>
        <ul className={styles.navLinks}>
          <li>
            <Link href="/alertas" >
              Alertas
            </Link>
          </li>
          <li>
            <Link href="/abrigos-seguros" >
              Abrigos
            </Link>
          </li>
          <li>
            <Link href="/areas-de-risco" >
              Áreas de Risco
            </Link>
          </li>
          {}
        </ul>
      </nav>
    </header>
  );
};

export default Header;