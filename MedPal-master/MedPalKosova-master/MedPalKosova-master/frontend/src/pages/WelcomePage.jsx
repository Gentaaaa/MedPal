import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/WelcomePage.module.css';

export default function WelcomePage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Mirësevini në <span className={styles.highlight}>MedPal</span></h1>
        <p>Platformë digjitale për menaxhimin e shëndetit për Klinikë, Mjekë dhe Pacientë.</p>
      </header>

      <main className={styles.main}>
        <section className={styles.infoSection}>
          <div className={styles.card}>
            <h2>🏥 Për Klinikën</h2>
            <p>Menaxhoni mjekët dhe terminet në një sistem të thjeshtë dhe efikas.</p>
          </div>
          <div className={styles.card}>
            <h2>👩‍⚕️ Për Mjekët</h2>
            <p>Shihni oraret, pacientët dhe historikun shëndetësor me lehtësi.</p>
          </div>
          <div className={styles.card}>
            <h2>🧑‍🤝‍🧑 Për Pacientët</h2>
            <p>Rezervoni termine, ndiqni medikamentet dhe komunikoni me mjekun tuaj.</p>
          </div>
        </section>

        <section className={styles.authButtons}>
          <Link to="/login" className={styles.btnPrimary}>Kyçu</Link>
          <Link to="/register" className={styles.btnSecondary}>Regjistrohu</Link>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} MedPal. Të gjitha të drejtat të rezervuara.</p>
      </footer>
    </div>
  );
}
