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

  const heroImages = [
    '/images/hero1.png',
    '/images/hero2.png',
    '/images/hero3.png',
    '/images/hero4.png',
  ];
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Auto slider crossing every 6s
    const sliderInterval = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % heroImages.length);
    }, 6000);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(sliderInterval);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ loading: true, message: '', type: null });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/contact`, {
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
        <div className={styles.logo}>WATANABE KOMUTEN</div>
        <div className={styles.navLinks}>
          <a href="/">トップ</a>
          <a href="/works">施工事例</a>
          <a href="/showrooms">展示場</a>
          <a href="/company">会社概要</a>
          <a href="/#contact">お問い合わせ</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className={styles.hero}>
        {heroImages.map((src, idx) => (
          <Image 
            key={src}
            src={src} 
            alt={`渡部工務店の誇れる邸宅 ${idx + 1}`} 
            fill
            priority={idx === 0}
            className={`${styles.heroImage} ${idx === heroIndex ? styles.activeHero : styles.inactiveHero}`}
          />
        ))}
        <div className={styles.heroOverlay}></div>
        <div className={`${styles.heroContent} animate-fade-in`}>
          <p className={styles.subtitle}>Watanabe Komuten's Premium Quality</p>
          <h1>「誇れる住まいを、<br />あなたと共に。」</h1>
          <p className={styles.heroText}>洗練されたデザイン、そして末長く続く安心。<br/>地域に根ざし、生涯にわたる価値を育む住まいをご提案します。</p>
          <div className={styles.ctaGroup}>
            <a href="#contact" className={`btn ${styles.btnGold}`}>カタログ請求</a>
            <a href="#contact" className={`btn ${styles.btnNavy}`}>展示場来場予約</a>
          </div>
        </div>
      </section>

      {/* Concept Section */}
      <section id="concept" className="section-padding">
        <div className="container">
          <div className={styles.conceptHeader}>
            <h2 className={styles.sectionTitleLeft}>
              <span className={styles.conceptSub}>Philosophy</span><br/>
              人生を豊かにする邸宅、<br/>その真価。
            </h2>
            <div className={styles.conceptLead}>
              家はただの箱ではありません。家族の成長を見守り、日々の安らぎを生み出し、やがては次世代へと受け継がれる大切な「資産」です。<br/><br/>
              渡部工務店は、積み重ねてきた技術と経験を活かし、周囲の環境と調和しながらも圧倒的な存在感を放つ、美しく力強い邸宅を描き出します。
            </div>
          </div>
          
          <div className={styles.conceptGridRich}>
            <div className={styles.conceptImgBox1}>
              <div className={styles.conceptImageWrapper}>
                <Image src="/images/hero3.png" alt="美しい中庭" fill className={styles.conceptImg} />
              </div>
            </div>
            <div className={styles.conceptImgBox2}>
              <div className={styles.conceptImageWrapper}>
                <Image src="/images/hero4.png" alt="洗練されたダイニング" fill className={styles.conceptImg} />
              </div>
            </div>
            <div className={styles.conceptContentBox}>
              <h3 className={styles.conceptSmallTitle}>時を超える、普遍的な美しさ</h3>
              <p>光と影の移ろいを計算し尽くした空間設計。昼は自然光が優しく室内を包み込み、夜は計算された照明が重厚感のある雰囲気を演出します。どんな時代にも流されない、洗練された「本物の価値」をお届けします。</p>
              <div className={styles.signature}>渡部工務店</div>
            </div>
          </div>
        </div>
      </section>

      {/* Infinite Horizontal Scroll Gallery */ }
      <section id="gallery" className={styles.gallerySection}>
        <div className={styles.galleryHeader}>
          <h2 className={styles.sectionTitle}>シームレスに繋がる、上質なインテリア</h2>
          <p className={styles.sectionSubtitle}>光と影が織りなす極上の表情。洗練された内装デザインの数々をご覧ください。</p>
        </div>
        
        <div className={styles.scrollContainer}>
          <div className={styles.scrollTrack}>
            {/* Set 1 */}
            <div className={styles.scrollItem}><div className={styles.scrollImageWrapper}><img src="/images/interior.png" alt="快適なリビング" className={styles.scrollImg} /></div></div>
            <div className={styles.scrollItem}><div className={styles.scrollImageWrapper}><img src="/images/hero_exterior.png" alt="圧倒的な外観" className={styles.scrollImg} /></div></div>
            <div className={styles.scrollItem}><div className={styles.scrollImageWrapper}><img src="/images/exterior.png" alt="モダンな内装" className={styles.scrollImg} /></div></div>
            <div className={styles.scrollItem}><div className={styles.scrollImageWrapper}><img src="/images/lineup_house_a.png" alt="夜の上質な空間" className={styles.scrollImg} /></div></div>
            <div className={styles.scrollItem}><div className={styles.scrollImageWrapper}><img src="/images/performance_tech.png" alt="こだわりの設備" className={styles.scrollImg} /></div></div>
            <div className={styles.scrollItem}><div className={styles.scrollImageWrapper}><img src="/images/interior.png" alt="安らぎの寝室" className={styles.scrollImg} /></div></div>
            <div className={styles.scrollItem}><div className={styles.scrollImageWrapper}><img src="/images/hero_exterior.png" alt="自然と調和するインテリア" className={styles.scrollImg} /></div></div>
            {/* Set 2 (Duplicated for seamless loop) */}
            <div className={styles.scrollItem}><div className={styles.scrollImageWrapper}><img src="/images/interior.png" alt="快適なリビング" className={styles.scrollImg} /></div></div>
            <div className={styles.scrollItem}><div className={styles.scrollImageWrapper}><img src="/images/hero_exterior.png" alt="圧倒的な外観" className={styles.scrollImg} /></div></div>
            <div className={styles.scrollItem}><div className={styles.scrollImageWrapper}><img src="/images/exterior.png" alt="モダンな内装" className={styles.scrollImg} /></div></div>
            <div className={styles.scrollItem}><div className={styles.scrollImageWrapper}><img src="/images/lineup_house_a.png" alt="夜の上質な空間" className={styles.scrollImg} /></div></div>
            <div className={styles.scrollItem}><div className={styles.scrollImageWrapper}><img src="/images/performance_tech.png" alt="こだわりの設備" className={styles.scrollImg} /></div></div>
            <div className={styles.scrollItem}><div className={styles.scrollImageWrapper}><img src="/images/interior.png" alt="安らぎの寝室" className={styles.scrollImg} /></div></div>
            <div className={styles.scrollItem}><div className={styles.scrollImageWrapper}><img src="/images/hero_exterior.png" alt="自然と調和するインテリア" className={styles.scrollImg} /></div></div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section id="technology" className={`section-padding ${styles.bgDark}`}>
        <div className="container">
          <h2 className={`${styles.sectionTitle} ${styles.textWhite}`}>未来へ続く、確かな技術力</h2>
          <p className={styles.sectionSubtitleWait}>美しさだけではなく、安心と快適さを支える先進のテクノロジー。</p>
          
          <div className={styles.techGrid}>
            <div className={styles.techCard}>
              <div className={styles.techIcon}>🛡️</div>
              <h3>強靭な構造体</h3>
              <p>独自の高耐久構造により、巨大地震にも耐えうる圧倒的な安全性を確保。ご家族の命と財産を守り抜きます。</p>
            </div>
            <div className={styles.techCard}>
              <div className={styles.techIcon}>🍃</div>
              <h3>次世代断熱性能</h3>
              <p>四季を通じてもっとも快適な室温を保ちます。冷暖房効率を飛躍的に高め、環境にもお財布にも優しい暮らしを。</p>
            </div>
            <div className={styles.techCard}>
              <div className={styles.techIcon}>✨</div>
              <h3>ロングライフ設計</h3>
              <p>数十年後も価値が維持できるよう、メンテナンス性に優れた外壁や屋根材を標準採用。末長い安心をお約束します。</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className={styles.contactSection}>
        <div className="container">
          <div className={styles.contactWrapper}>
            <div className={styles.contactInfo}>
              <h2 className={styles.contactTitle}>あなたの理想を、<br/>かたちに。</h2>
              <p className={styles.contactDesc}>
                カタログのご請求、モデルハウスのご見学、あるいは土地活用のご相談など、どんなことでもお気軽にお問い合わせください。<br/><br/>
                渡部工務店の専門スタッフが、一邸一邸、真心こめて対応させていただきます。
              </p>
            </div>
            <div className={styles.contactContainer}>
              <div className={styles.sslBlock}>
                <div className={styles.sslHeader}>
                  <span className={styles.sslIcon}>🔒</span>
                  <span className={styles.sslTitle}>当サイトは全ページSSL/HTTPS対応です</span>
                </div>
                <p className={styles.sslDesc}>
                  現代のWebサイトにおいて必須であるSSL証明書を導入し、以下の効果でお客様に安心・安全な環境を提供しています。
                </p>
                <ul className={styles.sslList}>
                  <li><strong>データ通信の暗号化によるセキュリティ確保</strong>：お預かりする大切な個人情報は高度に暗号化され、安全に送信されます。</li>
                  <li><strong>「保護されていない通信」という警告表示の回避</strong>：ブラウザの警告を排除し、快適で安心してご利用いただける環境を構築しています。</li>
                  <li><strong>Google検索でのランキング要因としての効果</strong>：検索エンジンの推奨基準をクリアした、信頼性の高いシステムで運用されています。</li>
                </ul>
              </div>

              <form onSubmit={handleSubmit}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="name">お名前</label>
                    <input type="text" id="name" name="name" placeholder="渡部 太郎" required value={formData.name} onChange={handleChange} />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="email">メールアドレス</label>
                    <input type="email" id="email" name="email" placeholder="example@watanabe.co.jp" required value={formData.email} onChange={handleChange} />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="phone">電話番号（ハイフンなし）</label>
                  <input type="tel" id="phone" name="phone" placeholder="09012345678" value={formData.phone} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="message">お問い合わせ・ご相談内容</label>
                  <textarea id="message" name="message" placeholder="展示場の見学予約や、間取りのご相談などご自由にご記入ください。" required value={formData.message} onChange={handleChange}></textarea>
                </div>
                <button type="submit" className={`btn ${styles.btnNavy} ${styles.submitBtn}`} disabled={status.loading}>
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
