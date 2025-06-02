import React from 'react';
import Link from 'next/link';
import styles from './HomePage.module.css';

export default function HomePage() {
  return (
    <main className={styles.mainContainer}>
      <header className={styles.headerSection}>
        <h1 className={styles.mainTitle}>
          Aplicativo de Evacuação e Rotas Seguras
        </h1>
      </header>

      <section className={styles.subTitle}>
        <p>
          Bem-vindo! Este aplicativo tem como objetivo fornecer informações cruciais
          e rotas seguras em situações de eventos extremos da natureza.
        </p>
      </section>

      <nav className={styles.navSection}>
        <ul className={styles.navList}>
          <li className={styles.navListItem}>
            {}
            <Link href="/alertas" className={`button-style ${styles.navLink}`}>
              Ver Alertas
            </Link>
          </li>
          <li className={styles.navListItem}>
            <Link href="/abrigos-seguros" className={`button-style ${styles.navLink}`}>
              Encontrar Abrigos
            </Link>
          </li>
          <li className={styles.navListItem}>
            <Link href="/areas-de-risco" className={`button-style ${styles.navLink}`}>
              Áreas de Risco
            </Link>
          </li>
          <li className={styles.navListItem}>
            <Link href="/ocorrencias" className={`button-style ${styles.navLink}`}>
              Ocorrências
            </Link>
          </li>
          <li className={styles.navListItem}>
            <Link href="/campanhas" className={`button-style ${styles.navLink}`}>
              Campanhas
            </Link>
          </li>
          <li className={styles.navListItem}>
            <Link href="/relatos" className={`button-style ${styles.navLink}`}>
              Relatos
            </Link>
          </li>
          <li className={styles.navListItem}>
            {}
            <Link href="/integrantes" className={`button-style ${styles.navLink} ${styles.navLinkSecondary}`}>
              Sobre a Equipe
            </Link>
          </li>
        </ul>
      </nav>
    </main>
  );
}