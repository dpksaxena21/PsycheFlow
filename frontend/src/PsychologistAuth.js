import React, { useState } from 'react';
import { supabase } from './supabase';

const S = { blue:'#1D4ED8', navy:'#0C1A2E', bg:'#0C1A2E', card:'rgba(255,255,255,0.05)', border:'rgba(255,255,255,0.1)', muted:'rgba(255,255,255,0.6)', hint:'rgba(255,255,255,0.35)', white:'#ffffff' };

const inputStyle = { width:'100%', padding:'12px 16px', borderRadius:10, border:'0.5px solid rgba(255,255,255,0.15)', fontSize:15, boxSizing:'border-box', outline:'none', background:'rgba(255,255,255,0.07)', color:'#fff', fontFamily:"'Satoshi',-apple-system,sans-serif" };

export default function PsychologistAuth({ onLogin, onBack }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [rciNumber, setRciNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [ageBlocked, setAgeBlocked] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    setError('');
    if (mode === 'login') {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) setError(err.message);
      else onLogin(data.user);
    } else {
      const age = new Date().getFullYear() - parseInt(birthYear);
      if (!birthYear || isNaN(age) || age < 18) { setAgeBlocked(true); setLoading(false); return; }
      const { data, error: err } = await supabase.auth.signUp({ email, password });
      if (err) { setError(err.message); setLoading(false); return; }
      if (data.user) {
        await supabase.from('profiles').upsert({ id: data.user.id, email, role: 'psychologist', rci_number: rciNumber || null, verification_status: 'pending' });
      }
      setSuccess('Account created! Check your email to verify, then sign in.');
    }
    setLoading(false);
  };

  return (
    <div style={{ fontFamily:"'Satoshi',-apple-system,sans-serif", background:S.bg, minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      {/* Nav */}
      <nav style={{ padding:'20px 48px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:S.blue, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="17" height="17" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C9 1.5 4 5 4 10C4 12.8 6.2 15 9 15C11.8 15 14 12.8 14 10C14 5 9 1.5 9 1.5Z" fill="white" opacity="0.9"/><circle cx="9" cy="10" r="2.2" fill="#0C1A2E"/></svg>
          </div>
          <span style={{ fontWeight:700, fontSize:15, color:'#fff', letterSpacing:'-0.02em' }}>PsycheFlow</span>
          <span style={{ fontSize:11, fontWeight:600, color:S.blue, background:'rgba(29,78,216,0.15)', padding:'2px 8px', borderRadius:100, marginLeft:4 }}>For Psychologists</span>
        </div>
        <span onClick={onBack} style={{ fontSize:13, color:S.muted, cursor:'pointer' }}>← Back to main site</span>
      </nav>

      {/* Main */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 24px' }}>
        <div style={{ width:'100%', maxWidth:420 }}>
          <div style={{ marginBottom:32 }}>
            <h1 style={{ fontSize:28, fontWeight:700, color:'#fff', letterSpacing:'-0.02em', margin:'0 0 8px' }}>
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p style={{ fontSize:14, color:S.muted, margin:0 }}>
              {mode === 'login' ? 'Sign in to your psychologist portal' : 'Join PsycheFlow as a licensed psychologist'}
            </p>
          </div>

          {/* Mode toggle */}
          <div style={{ display:'flex', background:'rgba(255,255,255,0.05)', borderRadius:10, padding:4, marginBottom:28 }}>
            {['login','signup'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                style={{ flex:1, padding:'10px', borderRadius:8, border:'none', cursor:'pointer', fontSize:13, fontWeight:600, transition:'all 0.2s',
                  background: mode===m ? S.blue : 'transparent',
                  color: mode===m ? '#fff' : S.muted }}>
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {success ? (
            <div style={{ background:'rgba(8,145,178,0.1)', border:'0.5px solid rgba(8,145,178,0.3)', borderRadius:10, padding:20, textAlign:'center', color:'#fff' }}>
              <div style={{ fontSize:15, fontWeight:600, marginBottom:6 }}>Check your email</div>
              <div style={{ fontSize:13, color:S.muted }}>{success}</div>
              <button onClick={() => { setMode('login'); setSuccess(''); }} style={{ marginTop:16, padding:'10px 24px', background:S.blue, color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600 }}>Go to Sign In</button>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:12, fontWeight:600, color:S.muted, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" style={inputStyle} />
              </div>
              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:12, fontWeight:600, color:S.muted, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
              </div>
              {mode === 'signup' && (
                <>
                  <div style={{ marginBottom:16 }}>
                    <label style={{ fontSize:12, fontWeight:600, color:S.muted, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Year of Birth</label>
                    <input type="number" value={birthYear} onChange={e => { setBirthYear(e.target.value); setAgeBlocked(false); }} placeholder="e.g. 1990" min="1900" max={new Date().getFullYear()} style={{ ...inputStyle, borderColor: ageBlocked ? '#DC2626' : 'rgba(255,255,255,0.15)' }} />
                    {ageBlocked && <p style={{ fontSize:12, color:'#DC2626', marginTop:4 }}>You must be 18 or older to register.</p>}
                  </div>
                  <div style={{ marginBottom:16 }}>
                    <label style={{ fontSize:12, fontWeight:600, color:S.muted, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>RCI Registration Number</label>
                    <input value={rciNumber} onChange={e => setRciNumber(e.target.value)} placeholder="e.g. A12345" style={inputStyle} />
                    <p style={{ fontSize:11, color:S.hint, marginTop:4 }}>Required for verification. Your account will be reviewed before full access is granted.</p>
                  </div>
                </>
              )}
              {error && <div style={{ background:'rgba(220,38,38,0.1)', border:'0.5px solid rgba(220,38,38,0.3)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#FCA5A5', marginBottom:16 }}>{error}</div>}
              <button onClick={handleAuth} disabled={loading}
                style={{ width:'100%', padding:'13px', background: loading ? 'rgba(29,78,216,0.5)' : S.blue, color:'#fff', border:'none', borderRadius:10, fontSize:15, fontWeight:600, cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
              <p style={{ textAlign:'center', fontSize:12, color:S.hint, marginTop:16 }}>
                {mode === 'login' ? 'Don\'t have an account?' : 'Already have an account?'}{' '}
                <span onClick={() => { setMode(mode==='login'?'signup':'login'); setError(''); }} style={{ color:S.blue, cursor:'pointer', fontWeight:600 }}>
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </span>
              </p>
            </div>
          )}
          <p style={{ textAlign:'center', fontSize:11, color:S.hint, marginTop:24 }}>Crisis support: iCall 9152987821 · Vandrevala 1860-2662-345</p>
        </div>
      </div>
    </div>
  );
}
