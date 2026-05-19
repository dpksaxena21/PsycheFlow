import React, { useState } from 'react';
import { supabase } from './supabase';
import Logo from './Logo';

export default function Auth({ onLogin }) {
  const [mode, setMode]         = useState('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]         = useState('patient');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState('');

  const handleAuth = async () => {
    setLoading(true);
    setError('');
    if (mode === 'login') {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) setError(err.message);
      else onLogin(data.user);
    } else {
      const { data, error: err } = await supabase.auth.signUp({ email, password });
      if (err) { setError(err.message); setLoading(false); return; }
      if (data?.user) {
        await supabase.from('profiles').upsert({ id: data.user.id, email, role });
      }
      setSuccess('Account created! Check your email to verify, then sign in.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight:'100vh', display:'flex',
      fontFamily:"-apple-system, 'DM Sans', sans-serif",
      background:'#F7F6F3'
    }}>
      {/* Left Panel */}
      <div style={{
        width:'50%', minHeight:'100vh',
        background:'linear-gradient(145deg, #0F0B2D 0%, #1a1654 50%, #0a2818 100%)',
        padding:'52px', display:'flex', flexDirection:'column',
        justifyContent:'space-between', position:'relative', overflow:'hidden'
      }}>
        <div style={{ position:'absolute', top:'-120px', right:'-120px',
          width:'400px', height:'400px', borderRadius:'50%',
          background:'radial-gradient(circle, rgba(79,70,229,0.25) 0%, transparent 70%)' }}/>
        <div style={{ position:'absolute', bottom:'-60px', left:'-60px',
          width:'320px', height:'320px', borderRadius:'50%',
          background:'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)' }}/>

        <Logo size="md" dark={true} />

        <div style={{ position:'relative', zIndex:1 }}>
          <h1 style={{
            fontFamily:"'DM Serif Display', Georgia, serif",
            fontSize:'52px', fontWeight:400, color:'#ffffff',
            lineHeight:1.12, margin:'0 0 20px', letterSpacing:'-0.02em'
          }}>
            Your mind,<br/>
            <span style={{ color:'#10B981' }}>understood.</span>
          </h1>
          <p style={{
            fontSize:'16px', color:'rgba(255,255,255,0.55)',
            lineHeight:1.75, maxWidth:'340px', margin:'0 0 48px'
          }}>
            AI-powered psychological intelligence platform for India's mental health ecosystem.
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            {[
              { icon:'🧠', text:'Clinically validated AI assessments' },
              { icon:'💬', text:'Conversational therapy with Dr. PsycheFlow' },
              { icon:'🌱', text:'ACT therapy exercises & flexibility tools' },
              { icon:'🩺', text:'Psychologist portal with SOAP notes & RAG' },
              { icon:'🔒', text:'Private, encrypted, Class B SaMD compliant' },
            ].map((item, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <span style={{ fontSize:'16px' }}>{item.icon}</span>
                <span style={{ fontSize:'14px', color:'rgba(255,255,255,0.65)' }}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.25)',
          letterSpacing:'0.05em', position:'relative', zIndex:1 }}>
          © 2026 PSYCHEFLOW · PSYCHEFLOW.IN · CLASS B SAMD
        </div>
      </div>

      {/* Right Panel */}
      <div style={{
        width:'50%', display:'flex', alignItems:'center',
        justifyContent:'center', padding:'60px'
      }}>
        <div style={{ width:'100%', maxWidth:'380px' }}>
          <h2 style={{
            fontFamily:"'DM Serif Display', Georgia, serif",
            fontSize:'34px', fontWeight:400, color:'#111827',
            margin:'0 0 6px', letterSpacing:'-0.02em'
          }}>
            {mode === 'login' ? 'Welcome back' : 'Get started'}
          </h2>
          <p style={{ fontSize:'15px', color:'#6B7280', margin:'0 0 32px' }}>
            {mode === 'login'
              ? 'Sign in to your PsycheFlow account'
              : 'Create your account — it takes 30 seconds'}
          </p>

          {/* Toggle */}
          <div style={{
            background:'#F3F4F6', borderRadius:'10px',
            padding:'3px', display:'flex', marginBottom:'28px'
          }}>
            {['login','signup'].map(m => (
              <button key={m}
                onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                style={{
                  flex:1, padding:'9px', border:'none', borderRadius:'8px',
                  cursor:'pointer', fontSize:'14px', fontWeight:500,
                  transition:'all 0.15s',
                  background: mode === m ? '#fff' : 'transparent',
                  color: mode === m ? '#111827' : '#6B7280',
                  boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
                }}>
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Email */}
          <label style={{ fontSize:'13px', fontWeight:500, color:'#374151',
            display:'block', marginBottom:'6px' }}>Email</label>
          <input type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAuth()}
            placeholder="you@example.com"
            style={{
              width:'100%', padding:'12px 16px', borderRadius:'10px',
              border:'1.5px solid #E5E7EB', fontSize:'15px',
              boxSizing:'border-box', outline:'none', background:'#fff',
              color:'#111827', marginBottom:'16px', transition:'border-color 0.15s'
            }}
            onFocus={e => e.target.style.borderColor='#4F46E5'}
            onBlur={e  => e.target.style.borderColor='#E5E7EB'}
          />

          {/* Password */}
          <label style={{ fontSize:'13px', fontWeight:500, color:'#374151',
            display:'block', marginBottom:'6px' }}>Password</label>
          <input type="password" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAuth()}
            placeholder="••••••••"
            style={{
              width:'100%', padding:'12px 16px', borderRadius:'10px',
              border:'1.5px solid #E5E7EB', fontSize:'15px',
              boxSizing:'border-box', outline:'none', background:'#fff',
              color:'#111827', marginBottom:'24px', transition:'border-color 0.15s'
            }}
            onFocus={e => e.target.style.borderColor='#4F46E5'}
            onBlur={e  => e.target.style.borderColor='#E5E7EB'}
          />
          {mode === 'signup' && (
            <div style={{ marginBottom:'24px' }}>
              <p style={{ fontSize:'13px', color:'#6B7280', marginBottom:'10px', fontWeight:500 }}>I am a:</p>
              <div style={{ display:'flex', gap:'12px' }}>
                {['patient','psychologist'].map(r => (
                  <button key={r} onClick={() => setRole(r)} type='button'
                    style={{
                      flex:1, padding:'12px', borderRadius:'10px', cursor:'pointer',
                      border: role === r ? '2px solid #4F46E5' : '1.5px solid #E5E7EB',
                      background: role === r ? '#EEF2FF' : '#fff',
                      color: role === r ? '#4F46E5' : '#6B7280',
                      fontWeight: role === r ? 600 : 400,
                      fontSize:'14px', textTransform:'capitalize', transition:'all 0.15s'
                    }}>
                    {r === 'patient' ? '🧠 Patient' : '🩺 Psychologist'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div style={{
              background:'#FEF2F2', border:'1px solid #FECACA',
              borderRadius:'8px', padding:'10px 14px',
              fontSize:'13px', color:'#DC2626', marginBottom:'16px'
            }}>{error}</div>
          )}

          {success && (
            <div style={{
              background:'#F0FDF4', border:'1px solid #86EFAC',
              borderRadius:'8px', padding:'10px 14px',
              fontSize:'13px', color:'#16A34A', marginBottom:'16px'
            }}>{success}</div>
          )}

          <button onClick={handleAuth} disabled={loading}
            style={{
              width:'100%', padding:'13px',
              background: loading ? '#9CA3AF' : '#4F46E5',
              color:'#fff', border:'none', borderRadius:'10px',
              fontSize:'15px', fontWeight:600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition:'all 0.15s', letterSpacing:'0.01em'
            }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In →' : 'Create Account →'}
          </button>

          <p style={{
            fontSize:'12px', color:'#9CA3AF',
            textAlign:'center', marginTop:'24px', lineHeight:1.7
          }}>
            Crisis support available 24/7<br/>
            iCall <strong style={{ color:'#6B7280' }}>9152987821</strong>
            {' · '}Vandrevala <strong style={{ color:'#6B7280' }}>1860-2662-345</strong>
          </p>
        </div>
      </div>
    </div>
  );
}