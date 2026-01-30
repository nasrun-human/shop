import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Navigate } from 'react-router-dom';
import './Chat.css';

const Chat = () => {
  const { user } = useShop();
  const [users, setUsers] = useState([]);
  const [peer, setPeer] = useState('');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const scrollerRef = useRef(null);

  const isAdmin = user?.role === 'admin';
  const activePeer = useMemo(() => {
    if (!user) return '';
    return isAdmin ? peer : 'admin';
  }, [user, isAdmin, peer]);

  useEffect(() => {
    if (!user) return;
    if (isAdmin) {
      fetch('/api/users')
        .then(r => r.json())
        .then(list => {
          const filtered = list.filter(u => u.username !== 'admin');
          setUsers(filtered);
          if (!peer && filtered.length) setPeer(filtered[0].username);
        })
        .catch(() => setUsers([]));
    }
  }, [user, isAdmin, peer]);

  useEffect(() => {
    let timer = null;
    const load = async () => {
      if (!user || !activePeer) return;
      try {
        const r = await fetch(`/api/chat/messages?user=${encodeURIComponent(user.username)}&peer=${encodeURIComponent(activePeer)}`);
        const data = await r.json();
        setMessages(Array.isArray(data) ? data : []);
        if (scrollerRef.current) {
          scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
        }
      } catch (e) { console.error(e); }
    };
    load();
    timer = setInterval(load, 3000);
    return () => { if (timer) clearInterval(timer); };
  }, [user, activePeer]);

  const send = async (payload = {}) => {
    if (!user || !activePeer) return;
    const body = {
      from: user.username,
      to: activePeer,
      text: payload.text ?? text,
      attachment: payload.attachment || '',
      attachment_name: payload.attachment_name || '',
      attachment_type: payload.attachment_type || ''
    };
    const r = await fetch('/api/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (r.ok) {
      setText('');
      const msg = await r.json();
      setMessages(prev => [...prev, msg]);
      if (scrollerRef.current) {
        scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
      }
    }
  };

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const r = await fetch('/api/upload/chat', { method: 'POST', body: fd });
      const data = await r.json();
      await send({ attachment: data.url, attachment_name: data.name, attachment_type: data.type, text: '' });
    } catch (e) { console.error(e); }
    setUploading(false);
  };

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="chat-container">
      {isAdmin && (
        <div className="chat-sidebar">
          <h3 className="section-title">CUSTOMERS</h3>
          <ul className="peer-list">
            {users.map(u => (
              <li key={u.username}>
                <button
                  className={u.username === activePeer ? 'peer active' : 'peer'}
                  onClick={() => setPeer(u.username)}
                >
                  {u.username}
                </button>
              </li>
            ))}
            {users.length === 0 && <li style={{ color: '#888' }}>No users</li>}
          </ul>
        </div>
      )}

      <div className="chat-main">
        <div className="chat-header">
          <h3 className="section-title">
            {isAdmin ? `Chat with ${activePeer || '-'}` : 'Chat with Admin'}
          </h3>
        </div>
        <div className="chat-messages" ref={scrollerRef}>
          {messages.map(m => {
            const mine = m.from_user === user.username;
            const isImage = m.attachment && String(m.attachment_type).startsWith('image/');
            return (
              <div key={m.id} className={mine ? 'bubble mine' : 'bubble'}>
                {m.text && <div className="bubble-text">{m.text}</div>}
                {m.attachment && (
                  <div className="bubble-attachment">
                    {isImage ? (
                      <img src={m.attachment} alt={m.attachment_name || 'image'} />
                    ) : (
                      <a href={m.attachment} target="_blank" rel="noreferrer">
                        {m.attachment_name || 'Download file'}
                      </a>
                    )}
                  </div>
                )}
                <div className="bubble-meta">
                  <span>{m.created_at?.replace('T', ' ').slice(0, 19)}</span>
                </div>
              </div>
            );
          })}
          {messages.length === 0 && (
            <div style={{ color: '#888', textAlign: 'center' }}>No messages</div>
          )}
        </div>
        <div className="chat-input">
          <input
            className="chat-text"
            placeholder="พิมพ์ข้อความ..."
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && text.trim()) send();
            }}
          />
          <label className="chat-attach">
            {uploading ? 'Uploading...' : 'Attach'}
            <input
              type="file"
              style={{ display: 'none' }}
              onChange={e => {
                const f = e.target && e.target.files && e.target.files[0] ? e.target.files[0] : null;
                if (f) handleFile(f);
              }}
            />
          </label>
          <button className="chat-send" onClick={() => text.trim() && send()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
