"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from '../page.module.css';

export default function WorksPage() {
  const [works, setWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/works`)
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setWorks(data);
        } else {
          setWorks([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setWorks([]);
        setLoading(false);
      });
  }, []);

  return (
    <div className={styles.container}>
      <nav className={`${styles.navbar} ${styles.scrolled}`}>
        <div className={styles.logo}>WATANABE KOMUTEN</div>
        <div className={styles.navLinks}>
          <a href="/">トップ</a>
          <a href="/works">施工事例</a>
          <a href="/showrooms">展示場</a>
          <a href="/company">会社概要</a>
          <a href="/#contact">お問い合わせ</a>
        </div>
      </nav>

      <section className="section-padding" style={{ marginTop: '80px', minHeight: '60vh' }}>
        <div className="container">
          <h1 style={{ fontSize: '2.5rem', marginBottom: '20px', color: 'var(--color-primary)', textAlign: 'center' }}>施工事例</h1>
          <p style={{ textAlign: 'center', marginBottom: '40px', color: 'var(--color-text-muted)' }}>
            渡部工務店が手がけた、こだわりの邸宅をご覧ください。
          </p>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>読み込み中...</div>
          ) : works.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '8px' }}>
              現在、公開されている施工事例はありません。
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
              {works.map((work) => (
                <div key={work.id} style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ height: '200px', position: 'relative', backgroundColor: '#eee' }}>
                    {work.main_image_url ? (
                      <img src={work.main_image_url} alt={work.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#aaa' }}>NO IMAGE</div>
                    )}
                  </div>
                  <div style={{ padding: '20px' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '10px', color: 'var(--color-primary)' }}>{work.title}</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '15px' }}>{work.description}</p>
                    <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {work.location && <span>📍 {work.location}</span>}
                      {work.price_range && <span>💰 {work.price_range}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerTop}>
            <h2 className={styles.footerLogo}>WATANABE KOMUTEN</h2>
            <div className={styles.footerLinks}>
              <a href="/company">会社概要</a>
              <a href="/works">施工事例</a>
              <a href="/showrooms">展示場</a>
              <a href="/#contact">お問い合わせ</a>
            </div>
          </div>
          <p className={styles.copyright}>&copy; 2026 Watanabe Komuten. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
