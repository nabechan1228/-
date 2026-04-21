"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './page.module.css';

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [status, setStatus] = useState<{ loading: boolean; message: string; type: 'success' | 'error' | null }>({
    loading: false,
    message: '',
    type: null
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ loading: true, message: '', type: null });

    try {
      const response = await fetch('http://127.0.0.1:8000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (response.ok) {
        setStatus({
          loading: false,
          message: 'お問い合わせを受け付けました。担当者よりご連絡いたします。',
          type: 'success'
        });
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        throw new Error(data.detail || '送信に失敗しました');
      }
    } catch (error: any) {
      setStatus({
        loading: false,
        message: 'エラーが発生しました: ' + error.message,
        type: 'error'
      });
    }
  };

  return (
    <div className={styles.container}>
      {/* Navigation */}
      <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.logo}>ICHIJO YAMAGATA</div>
        <div className={styles.navLinks}>
          <a href="#hero">ホーム</a>
          <a href="#performance">テクノロジー</a>
          <a href="#lineup">ラインナップ</a>
          <a href="#gallery">建築実例</a>
          <a href="#voices">お客様の声</a>
          <a href="#contact">お問い合わせ</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className={styles.hero}>
        <Image 
          src="/images/hero_exterior.png" 
          alt="一条工務店の美しい家" 
          fill
          priority
          className={styles.heroImage}
        />
        <div className={styles.heroOverlay}></div>
        <div className={`${styles.heroContent} animate-fade-in`}>
          <p className={styles.subtitle}>山形エリア 性能・品質 No.1 への挑戦</p>
          <h1>「家は、性能。」<br />理想を超える暮らしを。</h1>
          <p>全館床暖房、超気密・超断熱。圧倒的な住宅性能で、山形の厳しい冬も夏も、一年中快適な住まいをご提案します。</p>
          <div className={styles.ctaGroup}>
            <a href="#contact" className="btn btn-accent">資料請求はこちら</a>
            <a href="#contact" className="btn btn-secondary">展示場予約</a>
          </div>
        </div>
      </section>

      {/* Performance Section with Richer Layout */}
      <section id="performance" className="section-padding">
        <div className="container">
          <h2 className={styles.sectionTitle}>圧倒的な住宅性能</h2>
          <div className={styles.performanceGrid}>
            <div className={styles.performanceImage}>
              <div className={styles.imageReveal}>
                <Image 
                  src="/images/performance_tech.png" 
                  alt="テクノロジーイメージ" 
                  width={600} 
                  height={500} 
                  className={styles.richImage}
                />
              </div>
            </div>
            <div className={styles.performanceContent}>
              <div className={styles.performanceItemBox}>
                <span className={styles.badge}>業界最高水準</span>
                <h3>外内ダブル断熱構法</h3>
                <p>家全体を高性能断熱材で包み込み、魔法瓶のような保温性を実現。冷暖房効率を格段に高め、光熱費の大幅な削減に貢献します。</p>
              </div>
              <div className={styles.performanceItemBox}>
                <span className={styles.badge}>標準仕様</span>
                <h3>全館床暖房システム</h3>
                <p>リビングだけでなく、廊下、お風呂場、トイレまで家中の温度を一定に。温度差によるヒートショックのリスクを軽減し、冬でも裸足で過ごせる快適さを提供します。</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: Rich Gallery Section */}
      <section id="gallery" className={`section-padding ${styles.bgDark}`}>
        <div className="container">
          <h2 className={`${styles.sectionTitle} ${styles.textWhite}`}>建築実例ギャラリー</h2>
          <p className={styles.sectionSubtitle}>山形の風土に寄り添い、確かな性能に裏付けられた美しいデザインの数々。</p>
          <div className={styles.galleryGrid}>
            <div className={`${styles.galleryItem} ${styles.span2}`}>
              <Image src="/images/exterior.png" alt="外観" fill className={styles.galleryImg} />
              <div className={styles.galleryCaption}>自然と調和するモダンな外観</div>
            </div>
            <div className={styles.galleryItem}>
              <Image src="/images/interior.png" alt="内装" fill className={styles.galleryImg} />
              <div className={styles.galleryCaption}>温もりのあるリビング空間</div>
            </div>
            <div className={styles.galleryItem}>
              <Image src="/images/lineup_house_a.png" alt="外観夜景" fill className={styles.galleryImg} />
              <div className={styles.galleryCaption}>洗練された夜の表情</div>
            </div>
            <div className={`${styles.galleryItem} ${styles.span2}`}>
              <Image src="/images/hero_exterior.png" alt="アプローチ" fill className={styles.galleryImg} />
              <div className={styles.galleryCaption}>品格あふれる佇まい</div>
            </div>
          </div>
        </div>
      </section>

      {/* Lineup Section */}
      <section id="lineup" className="section-padding" style={{ backgroundColor: '#F8F8F8' }}>
        <div className="container">
          <h2 className={styles.sectionTitle}>商品ラインナップ</h2>
          <div className={styles.lineupGrid}>
            <div className={styles.richCard}>
              <div className={styles.cardImageWrapper}>
                <Image src="/images/lineup_house_a.png" alt="GRAND SMART" fill className={styles.cardImg} />
              </div>
              <div className={styles.cardContent}>
                <h3>GRAND SMART</h3>
                <p>一条工務店の技術の粋を集めた、機能性とデザイン性を両立した最高級モデル。</p>
                <a href="#contact" className={styles.textLink}>詳細を見る →</a>
              </div>
            </div>
            <div className={styles.richCard}>
              <div className={styles.cardImageWrapper}>
                <Image src="/images/interior.png" alt="i-smart" fill className={styles.cardImg} />
              </div>
              <div className={styles.cardContent}>
                <h3>i-smart</h3>
                <p>美しさと機能の両立。洗練されたデザインが、スマートな暮らしを叶えます。</p>
                <a href="#contact" className={styles.textLink}>詳細を見る →</a>
              </div>
            </div>
            <div className={styles.richCard}>
              <div className={styles.cardImageWrapper}>
                <Image src="/images/exterior.png" alt="SAISON" fill className={styles.cardImg} />
              </div>
              <div className={styles.cardContent}>
                <h3>SAISON</h3>
                <p>本物の素材にこだわった、時を経るほどに趣が増す格調高い住まい。</p>
                <a href="#contact" className={styles.textLink}>詳細を見る →</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: Owner Voices Section */}
      <section id="voices" className="section-padding">
        <div className="container">
          <h2 className={styles.sectionTitle}>オーナー様の声</h2>
          <div className={styles.voicesGrid}>
            <div className={styles.voiceCard}>
              <div className={styles.voiceQuote}>"冬の朝、素足で歩ける快適さに感動しました。結露も全くなく、空気がきれいで快適です。"</div>
              <div className={styles.voiceAuthor}>
                <div className={styles.authorAvatar}><Image src="/images/interior.png" alt="A様邸" fill /></div>
                <div>
                  <strong>山形市 A様</strong><br />
                  <span className={styles.microText}>i-smart 建築 / 30代ご夫婦</span>
                </div>
              </div>
            </div>
            <div className={styles.voiceCard}>
              <div className={styles.voiceQuote}>"太陽光発電と優れた断熱性のおかげで、光熱費が以前の賃貸マンション時代より安くなりました。"</div>
              <div className={styles.voiceAuthor}>
                <div className={styles.authorAvatar}><Image src="/images/hero_exterior.png" alt="B様邸" fill /></div>
                <div>
                  <strong>天童市 B様</strong><br />
                  <span className={styles.microText}>GRAND SMART 建築 / 40代ご家族</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className={styles.contactSection}>
        <div className="container">
          <div className={styles.contactWrapper}>
            <div className={styles.contactInfo}>
              <h2 className={styles.contactTitle}>理想の住まいづくりを、<br/>ここから。</h2>
              <p>最新のカタログや、展示場へのご来場予約はお気軽にお申し付けください。専門スタッフが丁寧にご案内いたします。</p>
            </div>
            <div className={styles.contactContainer}>
              <form onSubmit={handleSubmit}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="name">お名前</label>
                    <input type="text" id="name" name="name" placeholder="一条 太郎" required value={formData.name} onChange={handleChange} />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="email">メールアドレス</label>
                    <input type="email" id="email" name="email" placeholder="example@ichijo.co.jp" required value={formData.email} onChange={handleChange} />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="phone">電話番号（ハイフンなし）</label>
                  <input type="tel" id="phone" name="phone" placeholder="09012345678" value={formData.phone} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="message">お問い合わせ・ご相談内容</label>
                  <textarea id="message" name="message" placeholder="展示場の見学予約や、資料請求についてのご要望をご記入ください。" required value={formData.message} onChange={handleChange}></textarea>
                </div>
                <button type="submit" className={`btn btn-secondary ${styles.submitBtn}`} disabled={status.loading}>
                  {status.loading ? '送信中...' : 'この内容で送信する'}
                </button>
                
                {status.message && (
                  <div className={`${styles.message} ${status.type === 'success' ? styles.success : styles.error}`}>
                    {status.message}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerTop}>
            <p className={styles.logo} style={{ color: '#fff' }}>ICHIJO YAMAGATA</p>
            <div className={styles.footerLinks}>
              <a href="#">企業情報</a>
              <a href="#">プライバシーポリシー</a>
              <a href="#">サイトマップ</a>
            </div>
          </div>
          <p className={styles.copyright}>&copy; 2026 Ichijo Komuten Yamagata Area. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

