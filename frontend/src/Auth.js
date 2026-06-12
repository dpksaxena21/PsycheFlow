import React, { useState } from 'react';
import { supabase } from './supabase';

const S = {
  navy:'#0C1A2E', blue:'#1D4ED8', bg:'#F8FAFF', white:'#ffffff',
  border:'#E5E7EB', muted:'#6B7280', hint:'#9CA3AF',
  text:'#111827', textSub:'#4B5563', danger:'#DC2626',
};

const inp = {
  width:'100%', padding:'11px 14px', borderRadius:8,
  border:`1px solid ${S.border}`, fontSize:14, boxSizing:'border-box',
  outline:'none', background:S.white, color:S.text,
  fontFamily:"'Satoshi',-apple-system,sans-serif",
};

export default function Auth({ onLogin, onBack }) {
  const [mode, setMode] = useState('signin');
  const [form, setForm] = useState({ email:'', password:'', name:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true); setError('');
    if (mode === 'signin') {
      const { data, error:err } = await supabase.auth.signInWithPassword({ email:form.email, password:form.password });
      if (err) { setError(err.message); setLoading(false); return; }
      onLogin(data.user);
    } else if (mode === 'signup') {
      if (!form.name.trim()) { setError('Please enter your name.'); setLoading(false); return; }
      if (form.password.length < 8) { setError('Password must be at least 8 characters.'); setLoading(false); return; }
      const { data, error:err } = await supabase.auth.signUp({ email:form.email, password:form.password });
      if (err) { setError(err.message); setLoading(false); return; }
      if (data.user) {
        await supabase.from('profiles').upsert({ id:data.user.id, email:form.email, display_name:form.name, role:'patient' });
        setSent(true);
      }
    } else {
      const { error:err } = await supabase.auth.resetPasswordForEmail(form.email, { redirectTo: window.location.origin });
      if (err) { setError(err.message); setLoading(false); return; }
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div style={{ fontFamily:"'Satoshi',-apple-system,sans-serif", background:S.white, minHeight:'100vh', display:'flex' }}>

      {/* LEFT — branding panel */}
      <div style={{ display:'none', width:'45%', background:S.navy, padding:'48px 56px', flexDirection:'column', justifyContent:'space-between', position:'relative', overflow:'hidden' }}
        className="auth-left-panel">
        {/* Subtle background pattern */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle at 80% 20%, rgba(29,78,216,0.15) 0%, transparent 60%), radial-gradient(circle at 20% 80%, rgba(8,145,178,0.08) 0%, transparent 50%)', pointerEvents:'none' }}/>
        <div style={{ position:'relative' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:64 }}>
            <div style={{ width:28, height:28, borderRadius:7, background:S.blue, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C9 1.5 4 5 4 10C4 12.8 6.2 15 9 15C11.8 15 14 12.8 14 10C14 5 9 1.5 9 1.5Z" fill="white"/><circle cx="9" cy="10" r="2.2" fill="#0C1A2E"/></svg>
            </div>
            <span style={{ fontSize:15, fontWeight:700, color:'#fff' }}>PsycheFlow</span>
          </div>
          <div style={{ marginBottom:48 }}>
            <h2 style={{ fontSize:40, fontWeight:300, color:'#fff', letterSpacing:'-0.03em', lineHeight:1.1, margin:'0 0 4px' }}>Clinical</h2>
            <h2 style={{ fontSize:40, fontWeight:700, color:'#fff', letterSpacing:'-0.04em', lineHeight:1.1, margin:'0 0 8px' }}>intelligence</h2>
            <h2 style={{ fontSize:32, fontWeight:400, color:'#93C5FD', letterSpacing:'-0.03em', lineHeight:1.1, margin:0 }}>for mental healthcare.</h2>
          </div>
          <p style={{ fontSize:15, color:'rgba(255,255,255,0.5)', lineHeight:1.7, maxWidth:320 }}>
            16 validated instruments. AI risk detection. Therapy tools. All in one platform built for India's mental health ecosystem.
          </p>
        </div>
        <div>
          {[['50,000+','Assessments completed'],['94%','Crisis detection accuracy'],['16','Validated instruments']].map(([num,label])=>(
            <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize:13, color:'rgba(255,255,255,0.4)' }}>{label}</span>
              <span style={{ fontSize:14, fontWeight:700, color:'#fff' }}>{num}</span>
            </div>
          ))}
          <div style={{ marginTop:16, fontSize:11, color:'rgba(255,255,255,0.3)' }}>Crisis support: iCall 9152987821 · Vandrevala 1860-2662-345</div>
        </div>
      </div>

      {/* RIGHT — form panel */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 24px', background:S.white }}>
        {/* Back button */}
        <div style={{ position:'absolute', top:24, left:24 }}>
          <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', background:'transparent', border:`1px solid ${S.border}`, borderRadius:8, fontSize:13, color:S.muted, cursor:'pointer', fontWeight:500 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 5l-7 7 7 7" stroke={S.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Back to home
          </button>
        </div>

        <div style={{ width:'100%', maxWidth:400 }}>
          {/* Logo — shown on mobile since left panel hidden */}
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:40, justifyContent:'center' }}>
            <div style={{ width:28, height:28, borderRadius:7, background:S.blue, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C9 1.5 4 5 4 10C4 12.8 6.2 15 9 15C11.8 15 14 12.8 14 10C14 5 9 1.5 9 1.5Z" fill="white"/><circle cx="9" cy="10" r="2.2" fill="#0C1A2E"/></svg>
            </div>
            <span style={{ fontSize:15, fontWeight:700, color:S.navy }}>PsycheFlow</span>
          </div>

          {sent ? (
            <div style={{ textAlign:'center' }}>
              <div style={{ width:48, height:48, borderRadius:'50%', background:'#ECFDF5', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke='#059669' strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <h2 style={{ fontSize:22, fontWeight:700, color:S.navy, margin:'0 0 8px' }}>
                {mode === 'signup' ? 'Check your email' : 'Reset link sent'}
              </h2>
              <p style={{ fontSize:14, color:S.muted, marginBottom:24, lineHeight:1.6 }}>
                {mode === 'signup' ? 'We sent a confirmation link to ' : 'We sent a password reset link to '}
                <strong>{form.email}</strong>
              </p>
              <button onClick={() => { setSent(false); setMode('signin'); }} style={{ fontSize:14, color:S.blue, background:'none', border:'none', cursor:'pointer', fontWeight:500 }}>Back to sign in</button>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize:26, fontWeight:700, color:S.navy, letterSpacing:'-0.02em', margin:'0 0 6px', textAlign:'center' }}>
                {mode === 'signin' ? 'Welcome back' : mode === 'signup' ? 'Create account' : 'Reset password'}
              </h1>
              <p style={{ fontSize:14, color:S.muted, margin:'0 0 28px', textAlign:'center' }}>
                {mode === 'signin' ? 'Sign in to your PsycheFlow account' : mode === 'signup' ? 'Start your mental health journey' : 'Enter your email to receive a reset link'}
              </p>

              {/* Tab switcher */}
              {mode !== 'forgot' && (
                <div style={{ display:'flex', background:S.bg, borderRadius:10, padding:3, marginBottom:24, border:`1px solid ${S.border}` }}>
                  {[['signin','Sign In'],['signup','Sign Up']].map(([m,label])=>(
                    <button key={m} onClick={()=>{ setMode(m); setError(''); }} style={{ flex:1, padding:'9px', borderRadius:8, border:'none', cursor:'pointer', fontSize:13, fontWeight:600, background:mode===m?S.white:S.bg, color:mode===m?S.navy:S.muted, boxShadow:mode===m?'0 1px 3px rgba(0,0,0,0.08)':'none', transition:'all 0.15s' }}>
                      {label}
                    </button>
                  ))}
                </div>
              )}

              {/* Fields */}
              {mode === 'signup' && (
                <div style={{ marginBottom:14 }}>
                  <label style={{ fontSize:12, fontWeight:600, color:S.muted, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.04em' }}>Full Name</label>
                  <input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Dr. Priya Sharma" style={inp}
                    onFocus={e=>e.target.style.borderColor=S.blue} onBlur={e=>e.target.style.borderColor=S.border}/>
                </div>
              )}
              <div style={{ marginBottom:14 }}>
                <label style={{ fontSize:12, fontWeight:600, color:S.muted, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.04em' }}>Email</label>
                <input type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="you@example.com" style={inp}
                  onFocus={e=>e.target.style.borderColor=S.blue} onBlur={e=>e.target.style.borderColor=S.border}
                  onKeyDown={e=>e.key==='Enter'&&handleSubmit()}/>
              </div>
              {mode !== 'forgot' && (
                <div style={{ marginBottom:6 }}>
                  <label style={{ fontSize:12, fontWeight:600, color:S.muted, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.04em' }}>Password</label>
                  <input type="password" value={form.password} onChange={e=>set('password',e.target.value)} placeholder="••••••••" style={inp}
                    onFocus={e=>e.target.style.borderColor=S.blue} onBlur={e=>e.target.style.borderColor=S.border}
                    onKeyDown={e=>e.key==='Enter'&&handleSubmit()}/>
                </div>
              )}
              {mode === 'signin' && (
                <div style={{ textAlign:'right', marginBottom:20 }}>
                  <span onClick={()=>{ setMode('forgot'); setError(''); }} style={{ fontSize:13, color:S.blue, cursor:'pointer', fontWeight:500 }}>Forgot password?</span>
                </div>
              )}
              {mode !== 'signin' && <div style={{ marginBottom:20 }}/>}

              {error && (
                <div style={{ background:'#FEF2F2', border:`1px solid #FECACA`, borderRadius:8, padding:'10px 14px', fontSize:13, color:S.danger, marginBottom:16 }}>{error}</div>
              )}

              <button onClick={handleSubmit} disabled={loading}
                style={{ width:'100%', padding:'12px', background:loading?'#93C5FD':S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:14, fontWeight:600, cursor:loading?'not-allowed':'pointer', transition:'background 0.15s', marginBottom:20 }}>
                {loading ? 'Please wait...' : mode==='signin' ? 'Sign In →' : mode==='signup' ? 'Create Account →' : 'Send Reset Link →'}
              </button>

              {mode === 'forgot' && (
                <div style={{ textAlign:'center' }}>
                  <span onClick={()=>{ setMode('signin'); setError(''); }} style={{ fontSize:13, color:S.blue, cursor:'pointer', fontWeight:500 }}>← Back to sign in</span>
                </div>
              )}

              <div style={{ borderTop:`1px solid ${S.border}`, marginTop:8, paddingTop:20, textAlign:'center' }}>
                <div style={{ fontSize:12, color:S.hint, lineHeight:1.6 }}>Crisis support available 24/7</div>
                <div style={{ fontSize:12, color:S.muted, marginTop:3 }}>
                  iCall <strong>9152987821</strong> · Vandrevala <strong>1860-2662-345</strong>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .auth-left-panel { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
