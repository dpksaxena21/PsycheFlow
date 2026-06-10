import React, { useState } from 'react';
import { supabase } from './supabase';

const S = { blue:'#1D4ED8', navy:'#0C1A2E', bg:'#060D1A', card:'rgba(255,255,255,0.04)', border:'rgba(255,255,255,0.1)', muted:'rgba(255,255,255,0.6)', hint:'rgba(255,255,255,0.3)' };
const inp = { width:'100%', padding:'11px 14px', borderRadius:8, border:'0.5px solid rgba(255,255,255,0.12)', fontSize:14, boxSizing:'border-box', outline:'none', background:'rgba(255,255,255,0.06)', color:'#fff', fontFamily:"'Satoshi',-apple-system,sans-serif" };

function genCode() {
  return 'PSYF-' + Math.random().toString(36).substr(2,4).toUpperCase();
}

export default function HospitalAuth({ onLogin, onBack }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email:'', password:'', hospitalName:'', city:'', adminName:'', designation:'', psychCount:'', nabh:false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const set = (k,v) => setForm(f => ({...f,[k]:v}));

  const handleLogin = async () => {
    setLoading(true); setError('');
    const { data, error:err } = await supabase.auth.signInWithPassword({ email:form.email, password:form.password });
    if (err) { setError(err.message); setLoading(false); return; }
    const { data:profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
    if (profile?.role !== 'hospital_admin') { setError('This account is not a hospital admin account.'); await supabase.auth.signOut(); setLoading(false); return; }
    onLogin(data.user);
    setLoading(false);
  };

  const handleSignup = async () => {
    if (!form.email||!form.password||!form.hospitalName||!form.city||!form.adminName) { setError('Please fill all required fields.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true); setError('');
    const { data, error:err } = await supabase.auth.signUp({ email:form.email, password:form.password });
    if (err) { setError(err.message); setLoading(false); return; }
    if (data.user) {
      const code = genCode();
      await supabase.from('profiles').upsert({ id:data.user.id, email:form.email, role:'hospital_admin', display_name:form.adminName });
      await supabase.from('hospitals').insert({ admin_id:data.user.id, name:form.hospitalName, city:form.city, admin_name:form.adminName, designation:form.designation, hospital_code:code, psychologist_count:form.psychCount, nabh_accredited:form.nabh });
    }
    setSuccess(true);
    setLoading(false);
  };

  return (
    <div style={{ fontFamily:"'Satoshi',-apple-system,sans-serif", background:S.bg, minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      <nav style={{ padding:'18px 48px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'0.5px solid '+S.border }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:7, background:S.blue, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="15" height="15" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C9 1.5 4 5 4 10C4 12.8 6.2 15 9 15C11.8 15 14 12.8 14 10C14 5 9 1.5 9 1.5Z" fill="white" opacity="0.9"/><circle cx="9" cy="10" r="2.2" fill="#0C1A2E"/></svg>
          </div>
          <span style={{ fontWeight:700, fontSize:14, color:'#fff' }}>PsycheFlow</span>
          <span style={{ fontSize:10, fontWeight:600, color:S.blue, background:'rgba(29,78,216,0.15)', padding:'2px 8px', borderRadius:100, marginLeft:4 }}>Hospital</span>
        </div>
        <span onClick={onBack} style={{ fontSize:13, color:S.muted, cursor:'pointer' }}>← Back</span>
      </nav>
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 24px' }}>
        <div style={{ width:'100%', maxWidth: mode==='signup' ? 520 : 400 }}>
          <h1 style={{ fontSize:26, fontWeight:700, color:'#fff', letterSpacing:'-0.02em', margin:'0 0 6px' }}>{mode==='login' ? 'Hospital Admin Login' : 'Create Hospital Account'}</h1>
          <p style={{ fontSize:13, color:S.muted, margin:'0 0 28px' }}>{mode==='login' ? 'Sign in to your hospital portal' : 'Set up PsycheFlow for your hospital'}</p>
          <div style={{ display:'flex', background:'rgba(255,255,255,0.04)', borderRadius:10, padding:3, marginBottom:24 }}>
            {['login','signup'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }} style={{ flex:1, padding:'9px', borderRadius:8, border:'none', cursor:'pointer', fontSize:13, fontWeight:600, background: mode===m ? S.blue : 'transparent', color: mode===m ? '#fff' : S.muted }}>
                {m==='login' ? 'Sign In' : 'Register Hospital'}
              </button>
            ))}
          </div>
          {success ? (
            <div style={{ background:'rgba(29,78,216,0.1)', border:'0.5px solid rgba(29,78,216,0.3)', borderRadius:10, padding:24, textAlign:'center' }}>
              <div style={{ fontSize:16, fontWeight:700, color:'#fff', marginBottom:8 }}>Account created</div>
              <div style={{ fontSize:13, color:S.muted, marginBottom:16 }}>Check your email to verify your account, then sign in.</div>
              <button onClick={() => { setMode('login'); setSuccess(false); }} style={{ padding:'10px 24px', background:S.blue, color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600 }}>Go to Sign In</button>
            </div>
          ) : (
            <div>
              {mode==='signup' && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                  {[['Hospital Name *','hospitalName','Apollo Hospitals Delhi'],['City *','city','New Delhi']].map(([l,k,p]) => (
                    <div key={k}>
                      <label style={{ fontSize:11, fontWeight:600, color:S.muted, display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.05em' }}>{l}</label>
                      <input value={form[k]} onChange={e=>set(k,e.target.value)} placeholder={p} style={inp} />
                    </div>
                  ))}
                </div>
              )}
              {mode==='signup' && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                  {[['Your Name *','adminName','Dr. Sharma'],['Designation','designation','HOD Psychiatry']].map(([l,k,p]) => (
                    <div key={k}>
                      <label style={{ fontSize:11, fontWeight:600, color:S.muted, display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.05em' }}>{l}</label>
                      <input value={form[k]} onChange={e=>set(k,e.target.value)} placeholder={p} style={inp} />
                    </div>
                  ))}
                </div>
              )}
              {[[['Email *','email','email','admin@hospital.com'],['Password *','password','password','••••••••']]].map((row,ri) => (
                <div key={ri} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                  {row.map(([l,k,t,p]) => (
                    <div key={k}>
                      <label style={{ fontSize:11, fontWeight:600, color:S.muted, display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.05em' }}>{l}</label>
                      <input type={t} value={form[k]} onChange={e=>set(k,e.target.value)} placeholder={p} style={inp} />
                    </div>
                  ))}
                </div>
              ))}
              {mode==='signup' && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
                  <div>
                    <label style={{ fontSize:11, fontWeight:600, color:S.muted, display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.05em' }}>Psychologists on staff</label>
                    <select value={form.psychCount} onChange={e=>set('psychCount',e.target.value)} style={{ ...inp, background:'rgba(255,255,255,0.06)' }}>
                      <option value="">Select</option>
                      {['1-2','3-5','6-10','11-20','20+'].map(o=><option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:10, paddingTop:22 }}>
                    <input type="checkbox" checked={form.nabh} onChange={e=>set('nabh',e.target.checked)} style={{ width:16, height:16, cursor:'pointer' }} />
                    <label style={{ fontSize:13, color:S.muted, cursor:'pointer' }}>NABH Accredited</label>
                  </div>
                </div>
              )}
              {error && <div style={{ background:'rgba(220,38,38,0.1)', border:'0.5px solid rgba(220,38,38,0.3)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#FCA5A5', marginBottom:12 }}>{error}</div>}
              <button onClick={mode==='login' ? handleLogin : handleSignup} disabled={loading}
                style={{ width:'100%', padding:'12px', background:loading ? 'rgba(29,78,216,0.5)' : S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:14, fontWeight:600, cursor:loading?'not-allowed':'pointer', marginBottom:12 }}>
                {loading ? 'Please wait...' : mode==='login' ? 'Sign In' : 'Create Hospital Account'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
