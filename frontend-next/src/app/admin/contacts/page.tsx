"use client";

import { useState, useEffect } from 'react';
import { useAuthFetch } from '../layout';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const authFetch = useAuthFetch();

  const fetchContacts = async () => {
    try {
      const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/admin/contacts`);
      if (!response.ok) throw new Error('取得失敗');
      const data = await response.json();
      setContacts(data.contacts || []);
    } catch (err) {
      setError('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/admin/contacts/${id}/read`, {
        method: 'PATCH',
      });
      if (response.ok) {
        setContacts(contacts.map(c => c.id === id ? { ...c, is_read: true } : c));
      }
    } catch (err) {
      alert('エラーが発生しました');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('本当に削除しますか？')) return;
    try {
      const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/admin/contacts/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setContacts(contacts.filter(c => c.id !== id));
      }
    } catch (err) {
      alert('エラーが発生しました');
    }
  };

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px' }}>お問い合わせ管理</h1>
      
      <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <tr>
              <th style={{ padding: '15px', fontWeight: '500', color: '#4b5563', fontSize: '0.9rem' }}>日時</th>
              <th style={{ padding: '15px', fontWeight: '500', color: '#4b5563', fontSize: '0.9rem' }}>お名前</th>
              <th style={{ padding: '15px', fontWeight: '500', color: '#4b5563', fontSize: '0.9rem' }}>連絡先</th>
              <th style={{ padding: '15px', fontWeight: '500', color: '#4b5563', fontSize: '0.9rem' }}>内容</th>
              <th style={{ padding: '15px', fontWeight: '500', color: '#4b5563', fontSize: '0.9rem' }}>ステータス</th>
              <th style={{ padding: '15px', fontWeight: '500', color: '#4b5563', fontSize: '0.9rem' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {contacts.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>お問い合わせはありません</td></tr>
            ) : (
              contacts.map((contact) => (
                <tr key={contact.id} style={{ borderBottom: '1px solid #e5e7eb', background: contact.is_read ? 'white' : '#f0fdf4' }}>
                  <td style={{ padding: '15px', fontSize: '0.9rem' }}>{new Date(contact.created_at).toLocaleString('ja-JP')}</td>
                  <td style={{ padding: '15px', fontSize: '0.9rem', fontWeight: '500' }}>{contact.name}</td>
                  <td style={{ padding: '15px', fontSize: '0.9rem' }}>
                    <div>{contact.email}</div>
                    {contact.phone && <div style={{ color: '#6b7280' }}>{contact.phone}</div>}
                  </td>
                  <td style={{ padding: '15px', fontSize: '0.9rem', maxWidth: '300px' }}>
                    <div style={{ whiteSpace: 'pre-wrap', maxHeight: '100px', overflowY: 'auto' }}>{contact.message}</div>
                  </td>
                  <td style={{ padding: '15px', fontSize: '0.9rem' }}>
                    {contact.is_read ? 
                      <span style={{ color: '#6b7280' }}>既読</span> : 
                      <span style={{ color: '#16a34a', fontWeight: 'bold' }}>未読</span>
                    }
                  </td>
                  <td style={{ padding: '15px', fontSize: '0.9rem' }}>
                    {!contact.is_read && (
                      <button 
                        onClick={() => handleMarkRead(contact.id)}
                        style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px', fontSize: '0.8rem' }}
                      >
                        既読にする
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(contact.id)}
                      style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
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
