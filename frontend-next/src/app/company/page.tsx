"use client";

import styles from '../page.module.css';

export default function CompanyPage() {
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
        <div className="container" style={{ maxWidth: '800px' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '40px', color: 'var(--color-primary)', textAlign: 'center' }}>会社概要</h1>
          
          <div style={{ background: '#fff', padding: '50px', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}>
            
            <div style={{ marginBottom: '50px' }}>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--color-secondary)', borderBottom: '2px solid var(--color-accent)', paddingBottom: '10px', marginBottom: '20px' }}>代表メッセージ</h2>
              <p style={{ lineHeight: '2', color: 'var(--color-text-dark)' }}>
                私たちが建てるのは、単なる「家」ではありません。<br/>
                そこに住まうご家族が、毎日を笑顔で過ごし、何十年先も安心して暮らせる「舞台」を創造しています。<br/><br/>
                山形県酒田市の厳しい冬の寒さや夏の暑さを知り尽くした私たちだからこそできる、
                地域に根ざした家づくりがあります。伝統的な職人の技と最新のテクノロジーを融合させ、
                お客様の「人生を豊かにする邸宅」をこれからも提供し続けます。
              </p>
              <div style={{ textAlign: 'right', marginTop: '20px', fontWeight: 'bold' }}>
                代表取締役社長 渡部 太郎
              </div>
            </div>

            <div>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--color-secondary)', borderBottom: '2px solid var(--color-accent)', paddingBottom: '10px', marginBottom: '20px' }}>会社情報</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {[
                    { label: '会社名', value: '株式会社 渡部工務店' },
                    { label: '設立', value: '1985年 4月' },
                    { label: '資本金', value: '3,000万円' },
                    { label: '代表者', value: '代表取締役社長 渡部 太郎' },
                    { label: '所在地', value: '〒998-0000 山形県酒田市テスト町1-2-3' },
                    { label: '電話番号', value: '0234-XX-XXXX' },
                    { label: '事業内容', value: '注文住宅の設計・施工、リフォーム事業、不動産売買' },
                    { label: '許可・登録', value: '山形県知事許可 (般-XX) 第XXXX号' },
                  ].map((item, index) => (
                    <tr key={item.label} style={{ borderBottom: index === 7 ? 'none' : '1px solid #eee' }}>
                      <th style={{ padding: '20px 10px', textAlign: 'left', width: '30%', color: 'var(--color-text-muted)', fontWeight: 'normal' }}>{item.label}</th>
                      <td style={{ padding: '20px 10px', fontWeight: '500' }}>{item.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
