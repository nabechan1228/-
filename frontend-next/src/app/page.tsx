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
      <nav className={`${styles.navbar} ${scrolled ? 'glass-panel' : ''}`}>
        <div className={styles.logo}>Nature House</div>
        <div className={styles.navLinks}>
          <a href="#about">About</a>
          <a href="#features">Features</a>
          <a href="#contact">Contact</a>
        </div>
      </nav>

      <section className={styles.hero}>
        <Image 
          src="/images/exterior.png" 
          alt="自然に囲まれた美しい家" 
          fill
          priority
          className={styles.heroImage}
        />
        <div className={styles.heroOverlay}></div>
        <div className={`${styles.heroContent} glass-panel animate-fade-in`}>
          <h1>自然と共に、息づく家。</h1>
          <p>木の温もりとアースカラーが織りなす、あなただけの安らぎの空間。環境と調和し、時を重ねるごとに愛着が増す住まいをご提案します。</p>
        </div>
      </section>

      <section id="features" className={styles.featureSection}>
        <div className={`${styles.featureText} fade-in-up`}>
          <h2>森の呼吸を感じるリビング</h2>
          <p>無垢材をふんだんに使用した内装は、自然の香りと温もりで満たされます。大開口の窓からは四季折々の景色が広がり、室内に居ながらにして森の中にいるような深いリラックス効果をもたらします。</p>
          <p>選び抜かれたアースカラーのインテリアが、心と体を優しく包み込みます。</p>
        </div>
        <div className={`${styles.featureImageWrapper} fade-in-up delay-200`}>
          <Image 
            src="/images/interior.png" 
            alt="木の温もりを感じるリビング" 
            width={600} 
            height={400} 
            layout="responsive"
          />
        </div>
      </section>

      <section id="contact" className={styles.contactSection}>
        <div className={`${styles.contactContainer} glass-panel fade-in-up delay-100`}>
          <h2>お問い合わせ</h2>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="name">お名前</label>
              <input type="text" id="name" name="name" required value={formData.name} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">メールアドレス</label>
              <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="phone">電話番号</label>
              <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="message">お問い合わせ内容</label>
              <textarea id="message" name="message" required value={formData.message} onChange={handleChange}></textarea>
            </div>
            <button type="submit" className={styles.submitBtn} disabled={status.loading}>
              {status.loading ? '送信中...' : '送信する'}
            </button>
            
            {status.message && (
              <div className={`${styles.message} ${status.type === 'success' ? styles.success : styles.error}`}>
                {status.message}
              </div>
            )}
          </form>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>&copy; 2026 Nature House Maker. All rights reserved.</p>
      </footer>
    </div>
  );
}
