"use client";

import Image from 'next/image';
import styles from '../page.module.css';

export default function ShowroomsPage() {
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
          <h1 style={{ fontSize: '2.5rem', marginBottom: '20px', color: 'var(--color-primary)', textAlign: 'center' }}>展示場案内</h1>
          <p style={{ textAlign: 'center', marginBottom: '60px', color: 'var(--color-text-muted)' }}>
            自然と調和する渡部工務店の住まいを、ぜひ実際の空間でご体感ください。
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
            {/* Showroom 1 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
              <div style={{ flex: '1 1 400px' }}>
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d100000!2d139.8!3d38.9!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5f8c6c2e3!2z5bGx5b2i55yM6YWS55Sw5biC!5e0!3m2!1sja!2sjp!4v1600000000000!5m2!1sja!2sjp" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0, minHeight: '400px' }} 
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
              <div style={{ flex: '1 1 400px', padding: '40px' }}>
                <h2 style={{ fontSize: '1.8rem', color: 'var(--color-primary)', marginBottom: '15px' }}>酒田メイン展示場</h2>
                <p style={{ marginBottom: '25px', color: 'var(--color-text-muted)' }}>
                  最新のIoT設備と、伝統的な木造建築の技術が融合したプレミアムな展示場です。光と風の通り道を計算し尽くした空間設計をご覧ください。
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <li style={{ display: 'flex', gap: '10px' }}><strong>所在地:</strong> <span>〒998-0000 山形県酒田市テスト町1-2-3</span></li>
                  <li style={{ display: 'flex', gap: '10px' }}><strong>営業時間:</strong> <span>10:00 〜 18:00（水曜定休）</span></li>
                  <li style={{ display: 'flex', gap: '10px' }}><strong>アクセス:</strong> <span>酒田駅から車で約15分。無料駐車場完備。</span></li>
                  <li style={{ display: 'flex', gap: '10px' }}><strong>電話番号:</strong> <span>0234-XX-XXXX</span></li>
                </ul>
                <div style={{ marginTop: '40px' }}>
                  <a href="/#contact" className={`btn ${styles.btnGold}`} style={{ display: 'block', textAlign: 'center' }}>来場予約はこちら</a>
                </div>
              </div>
            </div>
          </div>
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
