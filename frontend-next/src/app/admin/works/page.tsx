"use client";

import { useState, useEffect } from 'react';
import { useAuthFetch } from '../layout';

export default function WorksPage() {
  const [works, setWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mainImageUrl, setMainImageUrl] = useState('');
  const [location, setLocation] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState({ title: '', description: '', main_image_url: '', location: '', price_range: '', image_urls: [] as string[] });
  
  const authFetch = useAuthFetch();
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  const fetchWorks = async () => {
    try {
      const r = await fetch(`${API}/api/works`);
      if (r.ok) { const d = await r.json(); setWorks(Array.isArray(d) ? d : []); }
      else setWorks([]);
    } catch { setWorks([]); } finally { setLoading(false); }
  };
  useEffect(() => { fetchWorks(); }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMain: boolean, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await authFetch(`${API}/api/admin/upload`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        const url = `${API}${data.url}`;
        if (isEdit) {
            if (isMain) setEditData({...editData, main_image_url: url});
            else setEditData({...editData, image_urls: [...editData.image_urls, url]});
        } else {
            if (isMain) setMainImageUrl(url);
            else setImageUrls([...imageUrls, url]);
        }
      } else {
        alert('画像のアップロードに失敗しました');
      }
    } catch (err) {
      alert('エラーが発生しました');
    }
    // reset input
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const r = await authFetch(`${API}/api/admin/works`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, main_image_url: mainImageUrl, location, price_range: priceRange, image_urls: imageUrls })
      });
      if (r.ok) { 
          setTitle(''); setDescription(''); setMainImageUrl(''); setLocation(''); setPriceRange(''); setImageUrls([]); 
          fetchWorks(); 
      }
    } catch { alert('エラーが発生しました'); }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setEditData({ 
        title: item.title, description: item.description || '', 
        main_image_url: item.main_image_url || '', location: item.location || '', 
        price_range: item.price_range || '', image_urls: item.image_urls || [] 
    });
  };
  const handleCancelEdit = () => { setEditingId(null); };

  const handleUpdate = async (id: number) => {
    try {
      const r = await authFetch(`${API}/api/admin/works/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });
      if (r.ok) { setEditingId(null); fetchWorks(); }
    } catch { alert('エラーが発生しました'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('本当に削除しますか？')) return;
    try { const r = await authFetch(`${API}/api/admin/works/${id}`, { method: 'DELETE' }); if (r.ok) fetchWorks(); }
    catch { alert('エラーが発生しました'); }
  };

  const inputStyle = { width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' };
  const btnStyle = (bg: string, color: string, border?: string) => ({
    background: bg, color, border: border || 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' as const, fontSize: '0.8rem'
  });

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px' }}>施工事例管理</h1>
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '15px' }}>新規作成</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>タイトル</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>所在地（例：山形県酒田市）</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>価格帯（例：2000万円台）</label>
            <input type="text" value={priceRange} onChange={e => setPriceRange(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>メイン画像</label>
            <input type="file" accept="image/*" onChange={e => handleImageUpload(e, true, false)} style={inputStyle} />
            {mainImageUrl && <img src={mainImageUrl} alt="preview" style={{ width: '100px', marginTop: '10px' }} />}
            <input type="url" value={mainImageUrl} onChange={e => setMainImageUrl(e.target.value)} placeholder="またはURLを直接入力" style={{...inputStyle, marginTop: '5px'}} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>サブ画像</label>
            <input type="file" accept="image/*" onChange={e => handleImageUpload(e, false, false)} style={inputStyle} />
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
              {imageUrls.map((url, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img src={url} alt={`sub-${i}`} style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                  <button type="button" onClick={() => setImageUrls(urls => urls.filter((_, idx) => idx !== i))} style={{ position: 'absolute', top: 0, right: 0, background: 'red', color: 'white', border: 'none', cursor: 'pointer', width: '20px', height: '20px', borderRadius: '50%' }}>×</button>
                </div>
              ))}
            </div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>説明文</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={4} style={inputStyle} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <button type="submit" style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>登録する</button>
          </div>
        </form>
      </div>

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
            {loading ? (<tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center' }}>読み込み中...</td></tr>)
            : works.length === 0 ? (<tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>施工事例はありません</td></tr>)
            : works.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '15px' }}>
                  {editingId === item.id ? (
                    <div>
                        <input type="file" accept="image/*" onChange={e => handleImageUpload(e, true, true)} style={{ width: '60px', fontSize: '0.7rem' }} />
                        <input type="url" value={editData.main_image_url} onChange={e => setEditData({...editData, main_image_url: e.target.value})} placeholder="URL" style={{ width: '60px', padding: '4px', fontSize: '0.7rem', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                    </div>
                  ) : item.main_image_url ? (
                    <img src={item.main_image_url.startsWith('/uploads') ? `${API}${item.main_image_url}` : item.main_image_url} alt="サムネイル" style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                  ) : (<div style={{ width: '60px', height: '40px', background: '#e5e7eb', borderRadius: '4px' }}></div>)}
                </td>
                <td style={{ padding: '15px', fontSize: '0.9rem', fontWeight: '500' }}>
                  {editingId === item.id ? (
                    <input type="text" value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} style={{ padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px', width: '100%' }} />
                  ) : item.title}
                </td>
                <td style={{ padding: '15px', fontSize: '0.9rem', color: '#6b7280' }}>
                  {editingId === item.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <input type="text" value={editData.location} onChange={e => setEditData({...editData, location: e.target.value})} placeholder="所在地" style={{ padding: '4px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.85rem' }} />
                      <input type="text" value={editData.price_range} onChange={e => setEditData({...editData, price_range: e.target.value})} placeholder="価格帯" style={{ padding: '4px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.85rem' }} />
                    </div>
                  ) : (<>{item.location} {item.location && item.price_range && '/'} {item.price_range}</>)}
                </td>
                <td style={{ padding: '15px', fontSize: '0.9rem' }}>
                  {editingId === item.id ? (
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button onClick={() => handleUpdate(item.id)} style={btnStyle('#3b82f6', 'white')}>保存</button>
                      <button onClick={handleCancelEdit} style={btnStyle('#6b7280', 'white')}>キャンセル</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button onClick={() => handleEdit(item)} style={btnStyle('#3b82f6', 'white')}>編集</button>
                      <button onClick={() => handleDelete(item.id)} style={btnStyle('transparent', '#ef4444', '1px solid #ef4444')}>削除</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
