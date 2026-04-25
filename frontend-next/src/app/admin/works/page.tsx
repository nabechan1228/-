"use client";

import { useState, useEffect } from 'react';

export default function WorksPage() {
  const [works, setWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mainImageUrl, setMainImageUrl] = useState('');
  const [location, setLocation] = useState('');
  const [priceRange, setPriceRange] = useState('');

  const fetchWorks = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/works`);
      if (response.ok) {
        const data = await response.json();
        setWorks(Array.isArray(data) ? data : []);
      } else {
        setWorks([]);
      }
    } catch (err) {
      console.error(err);
      setWorks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/admin/works`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          title, description, main_image_url: mainImageUrl, location, price_range: priceRange 
        })
      });
      if (response.ok) {
        setTitle('');
        setDescription('');
        setMainImageUrl('');
        setLocation('');
        setPriceRange('');
        fetchWorks();
      }
    } catch (err) {
      alert('エラーが発生しました');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('本当に削除しますか？')) return;
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/admin/works/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchWorks();
      }
    } catch (err) {
      alert('エラーが発生しました');
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px' }}>施工事例管理</h1>
      
      {/* 新規追加フォーム */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '15px' }}>新規作成</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>タイトル</label>
            <input 
              type="text" value={title} onChange={e => setTitle(e.target.value)} required
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>所在地（例：山形県酒田市）</label>
            <input 
              type="text" value={location} onChange={e => setLocation(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>価格帯（例：2000万円台）</label>
            <input 
              type="text" value={priceRange} onChange={e => setPriceRange(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>メイン画像URL</label>
            <input 
              type="url" value={mainImageUrl} onChange={e => setMainImageUrl(e.target.value)} placeholder="https://..."
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>説明文</label>
            <textarea 
              value={description} onChange={e => setDescription(e.target.value)} required rows={4}
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <button type="submit" style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
              登録する
            </button>
          </div>
        </form>
      </div>

      {/* 一覧 */}
      <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <tr>
              <th style={{ padding: '15px', fontWeight: '500', color: '#4b5563', fontSize: '0.9rem', width: '80px' }}>画像</th>
              <th style={{ padding: '15px', fontWeight: '500', color: '#4b5563', fontSize: '0.9rem' }}>タイトル</th>
              <th style={{ padding: '15px', fontWeight: '500', color: '#4b5563', fontSize: '0.9rem' }}>所在地 / 価格帯</th>
              <th style={{ padding: '15px', fontWeight: '500', color: '#4b5563', fontSize: '0.9rem' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center' }}>読み込み中...</td></tr>
            ) : works.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>施工事例はありません</td></tr>
            ) : (
              works.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '15px' }}>
                    {item.main_image_url ? (
                      <img src={item.main_image_url} alt="サムネイル" style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                    ) : (
                      <div style={{ width: '60px', height: '40px', background: '#e5e7eb', borderRadius: '4px' }}></div>
                    )}
                  </td>
                  <td style={{ padding: '15px', fontSize: '0.9rem', fontWeight: '500' }}>{item.title}</td>
                  <td style={{ padding: '15px', fontSize: '0.9rem', color: '#6b7280' }}>
                    {item.location} {item.location && item.price_range && '/'} {item.price_range}
                  </td>
                  <td style={{ padding: '15px', fontSize: '0.9rem' }}>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
