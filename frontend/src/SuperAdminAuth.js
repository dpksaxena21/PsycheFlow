import React, { useState } from 'react';
import { supabase } from './supabase';

const S = { blue:'#1D4ED8', navy:'#0C1A2E', danger:'#DC2626' };

export default function SuperAdminAuth({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) { setError('Invalid credentials'); setLoading(false); return; }
      
      // Check if user is a superadmin
      const { data: admin } = await supabase.from('psycheflow_admins').select('*').eq('user_id', data.user.id).single();
      if (!admin) { setError('Access denied. Not a superadmin account.'); await supabase.auth.signOut(); setLoading(false); return; }
      
      onLogin({ ...data.user, adminRole: admin.role, adminName: admin.name });
    } catch { setError('Login failed. Try again.'); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:'100vh', background:S.navy, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Satoshi',-apple-system,sans-serif" }}>
      <div style={{ background:'#fff', borderRadius:16, padding:40, width:380, boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:28 }}>
          <div style={{ width:40, height:40, borderRadius:10, background:S.navy, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="22" height="22" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C9 1.5 4 5 4 10C4 12.8 6.2 15 9 15C11.8 15 14 12.8 14 10C14 5 9 1.5 9 1.5Z" fill="white" opacity="0.9"/><circle cx="9" cy="10" r="2.2" fill="#0C1A2E"/></svg>
          </div>
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:S.navy }}>PsycheFlow HQ</div>
            <div style={{ fontSize:11, color:'#94a3b8' }}>Super Admin Access</div>
          </div>
        </div>
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:11, fontWeight:600, color:S.navy, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            style={{ width:'100%', padding:'10px 14px', borderRadius:8, border:'1px solid #E2EBF6', fontSize:14, outline:'none', boxSizing:'border-box', color:S.navy }} />
        </div>
        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:11, fontWeight:600, color:S.navy, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key==='Enter'&&handleLogin()}
            style={{ width:'100%', padding:'10px 14px', borderRadius:8, border:'1px solid #E2EBF6', fontSize:14, outline:'none', boxSizing:'border-box', color:S.navy }} />
        </div>
        {error && <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:8, padding:'10px 14px', fontSize:12, color:S.danger, marginBottom:16 }}>{error}</div>}
        <button onClick={handleLogin} disabled={loading || !email || !password}
          style={{ width:'100%', padding:'12px', background:S.navy, color:'#fff', border:'none', borderRadius:8, fontSize:14, fontWeight:600, cursor:'pointer', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Verifying...' : 'Access HQ'}
        </button>
        <div style={{ textAlign:'center', marginTop:16, fontSize:11, color:'#94a3b8' }}>Restricted access · PsycheFlow administrators only</div>
      </div>
    </div>
  );
}
