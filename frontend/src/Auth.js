import React, { useState } from 'react';
import { supabase } from './supabase';

export default function Auth({ onLogin }) {
  const [mode, setMode]       = useState('login');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]       = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }

      // Create profile
      await supabase.from('profiles').insert({
        id: data.user.id,
        email,
        full_name: name,
        share_code: Math.random().toString(36).substring(2, 10).toUpperCase()
      });
      onLogin(data.user);

    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }
      onLogin(data.user);
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 8,
    border: '1px solid #e2e8f0', fontSize: 15, marginBottom: 12,
    boxSizing: 'border-box', outline: 'none'
  };

  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh',
      background: 'linear-gradient(135deg, #eef2ff 0%, #fdf4ff 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 40,
        width: 380, boxShadow: '0 8px 40px rgba(99,102,241,0.12)' }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40 }}>🧠</div>
          <h2 style={{ color: '#6366f1', margin: '8px 0 4px' }}>PsycheFlow</h2>
          <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        {mode === 'signup' && (
          <input placeholder="Full Name" value={name}
            onChange={e => setName(e.target.value)} style={inputStyle} />
        )}
        <input placeholder="Email" type="email" value={email}
          onChange={e => setEmail(e.target.value)} style={inputStyle} />
        <input placeholder="Password" type="password" value={password}
          onChange={e => setPassword(e.target.value)} style={inputStyle} />

        {error && (
          <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{error}</p>
        )}

        <button onClick={handleSubmit} disabled={loading}
          style={{ width: '100%', padding: '13px', background: '#6366f1',
            color: '#fff', border: 'none', borderRadius: 10,
            fontSize: 16, cursor: 'pointer', marginBottom: 16 }}>
          {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#64748b', margin: 0 }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            style={{ color: '#6366f1', cursor: 'pointer', fontWeight: 'bold' }}>
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </span>
        </p>
      </div>
    </div>
  );
}