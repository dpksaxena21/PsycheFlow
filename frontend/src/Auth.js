import React, { useState, useRef, useEffect } from 'react';
const useIsMobile = () => { const [m, setM] = React.useState(window.innerWidth < 768); useEffect(() => { const h = () => setM(window.innerWidth < 768); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h); }, []); return m; };
import { supabase } from './supabase';
import Logo from './Logo';

export default function Auth({ onLogin }) {
  const isMobile = useIsMobile();
  const [mode, setMode]         = useState('login');
  const [email, setEmail]       = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [ageBlocked, setAgeBlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [role, setRole]         = useState('patient');
  const [rciNumber, setRciNumber]   = useState('');
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
      const currentYear = new Date().getFullYear();
      const age = currentYear - parseInt(birthYear);
      if (!birthYear || isNaN(age) || age < 18) {
        setAgeBlocked(true);
        setLoading(false);
        return;
      }
      setAgeBlocked(false);
      const { data, error: err } = await supabase.auth.signUp({ email, password });
      if (err) { setError(err.message); setLoading(false); return; }
      if (data?.user) {
        await supabase.from('profiles').upsert({ id: data.user.id, email, role: 'patient', verification_status: 'verified' });
      }
      setSuccess('Account created! Check your email to verify, then sign in.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight:'100vh', display:'flex',
      fontFamily:"-apple-system, 'DM Sans', sans-serif",
      background:'#F8FAFF'
    }}>
      {/* Left Panel */}
      <div onMouseMove={(e) => { const r=e.currentTarget.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-0.5,y=(e.clientY-r.top)/r.height-0.5; e.currentTarget.style.setProperty('--ox',x); e.currentTarget.style.setProperty('--oy',y); }} style={{ width:'50%', minHeight:'100vh', background:'linear-gradient(145deg, #0C1A2E 0%, #0F2444 50%, #0C2340 100%)', padding:'52px', display:'flex', flexDirection:'column', justifyContent:'space-between', position:'relative', overflow:'hidden' }}>
        <div className="orb1" style={{ position:'absolute', top:'-120px', right:'-120px', width:'400px', height:'400px', borderRadius:'50%', background:'radial-gradient(circle, rgba(29,78,216,0.3) 0%, transparent 70%)', pointerEvents:'none', animation:'orbFloat1 8s ease-in-out infinite' }}/>
        <div className="orb2" style={{ position:'absolute', bottom:'-60px', left:'-60px', width:'320px', height:'320px', borderRadius:'50%', background:'radial-gradient(circle, rgba(8,145,178,0.2) 0%, transparent 70%)', pointerEvents:'none', animation:'orbFloat2 10s ease-in-out infinite' }}/>
        <div className="orb3" style={{ position:'absolute', top:'40%', left:'30%', width:'200px', height:'200px', borderRadius:'50%', background:'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', pointerEvents:'none', animation:'orbFloat3 12s ease-in-out infinite' }}/>

        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
            <rect width="64" height="64" rx="14" fill="#1D4ED8"/>
            <line x1="16" y1="10" x2="16" y2="54" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.18"/>
            <path d="M 16 10 C 16 10 46 10 46 26 C 46 42 16 46 16 46" fill="none" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.18"/>
            <line x1="20" y1="13" x2="20" y2="52" stroke="white" strokeWidth="7.5" strokeLinecap="round"/>
            <path d="M 20 13 C 20 13 42 13 42 26 C 42 39 20 43 20 43" fill="none" stroke="white" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M 30 11 C 42 11 44 19 44 23" fill="none" stroke="#93C5FD" strokeWidth="7.5" strokeLinecap="round"/>
            <circle cx="44" cy="26" r="3.5" fill="#93C5FD" opacity="0.8"/>
            <line x1="44" y1="26" x2="50" y2="26" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
            <path d="M 50 26 L 53 18 L 56 34 L 59 26" fill="none" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
          </svg>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:'#fff', letterSpacing:'-0.3px', lineHeight:1 }}>Psyche<span style={{ color:'#60A5FA' }}>Flow</span></div>
            <div style={{ fontSize:9, color:'#3B5998', letterSpacing:'2px', marginTop:2 }}>MENTAL HEALTH AI</div>
          </div>
        </div>

        <div style={{ position:'relative', zIndex:1 }}>
          <h1 style={{
            fontFamily:"'DM Serif Display', Georgia, serif",
            fontSize:'52px', fontWeight:400, color:'#ffffff',
            lineHeight:1.12, margin:'0 0 20px', letterSpacing:'-0.02em'
          }}>
            Your mind,<br/>
            <span style={{ color:'#3B82F6' }}>understood.</span>
          </h1>
          <p style={{
            fontSize:'16px', color:'rgba(255,255,255,0.55)',
            lineHeight:1.75, maxWidth:'340px', margin:'0 0 48px'
          }}>
            AI-powered psychological intelligence platform for India's mental health ecosystem.
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {[
              { svg:<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><ellipse cx="8" cy="6" rx="4" ry="3" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2"/><path d="M4 6C4 7.8 3 9 3 9C3 10.5 5.2 11.5 8 11.5C10.8 11.5 13 10.5 13 9C13 9 12 7.8 12 6" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" strokeLinecap="round"/><circle cx="8" cy="6.8" r="1.4" fill="rgba(255,255,255,0.7)"/></svg>, text:'Clinically validated AI assessments' },
              { svg:<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="12" height="9" rx="2.5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2"/><path d="M5 8H11M5 10.5H8" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" strokeLinecap="round"/></svg>, text:'Conversational therapy with Dr. PsycheFlow' },
              { svg:<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 13C8 13 3.5 10 3.5 6.5C3.5 4.5 5.5 3 8 3C10.5 3 12.5 4.5 12.5 6.5C12.5 10 8 13 8 13Z" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2"/><path d="M6 6.8C6 6.8 6.7 8 8 8C9.3 8 10 6.8 10 6.8" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" strokeLinecap="round"/></svg>, text:'ACT therapy exercises and flexibility tools' },
              { svg:<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2"/><path d="M5 6H11M5 9H9M5 12H7" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" strokeLinecap="round"/></svg>, text:'Psychologist portal with SOAP notes and RAG' },
              { svg:<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="4" y="7" width="8" height="7" rx="1.5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2"/><path d="M6 7V5C6 3.9 6.9 3 8 3C9.1 3 10 3.9 10 5V7" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" strokeLinecap="round"/><circle cx="8" cy="10.5" r="1" fill="rgba(255,255,255,0.7)"/></svg>, text:'Private, encrypted, DPDP Act 2023 compliant' },
            ].map((item, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <div style={{ width:28, height:28, borderRadius:7, background:'rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{item.svg}</div>
                <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.65)' }}>
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
        justifyContent:'center', padding:'60px',
        background:'#ffffff',
      }}>
        <div style={{ width:'100%', maxWidth:'360px' }}>
          <div style={{ marginBottom:32 }}>
            <h2 style={{
              fontFamily:"'Satoshi', system-ui, sans-serif",
              fontSize:'28px', fontWeight:700, color:'#0C1A2E',
              margin:'0 0 6px', letterSpacing:'-0.5px'
            }}>
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p style={{ fontSize:'14px', color:'#94a3b8', margin:0 }}>
              {mode === 'login'
                ? 'Sign in to your PsycheFlow account'
                : 'Start your mental health journey today'}
            </p>
          </div>

          {/* Toggle */}
          <div style={{
            background:'#EFF6FF', borderRadius:'10px',
            padding:'3px', display:'flex', marginBottom:'28px',
            border:'0.5px solid #E2EBF6'
          }}>
            {['login','signup'].map(m => (
              <button key={m}
                onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                style={{
                  flex:1, padding:'10px', border:'none', borderRadius:'8px',
                  cursor:'pointer', fontSize:'13px', fontWeight:600,
                  transition:'all 0.15s', fontFamily:"'Satoshi',system-ui,sans-serif",
                  background: mode === m ? '#1D4ED8' : 'transparent',
                  color: mode === m ? '#fff' : '#3B5998',
                  boxShadow: mode === m ? '0 2px 8px rgba(29,78,216,0.2)' : 'none'
                }}>
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Email */}
          <label style={{ fontSize:'12px', fontWeight:600, color:'#0C1A2E', letterSpacing:'0.02em',
            display:'block', marginBottom:'6px', textTransform:'uppercase' }}>Email</label>
          <input type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAuth()}
            placeholder="you@example.com"
            style={{
              width:'100%', padding:'12px 16px', borderRadius:'10px',
              border:'1.5px solid #E2EBF6', fontSize:'14px',
              boxSizing:'border-box', outline:'none', background:'#F8FAFF',
              color:'#0C1A2E', marginBottom:'16px', transition:'border-color 0.15s',
              fontFamily:"'Satoshi',system-ui,sans-serif" 
            }}
            onFocus={e => { e.target.style.borderColor='#1D4ED8'; e.target.style.background='#fff'; }}
            onBlur={e  => e.target.style.borderColor='#E5E7EB'}
          />

          {/* Password */}
          <label style={{ fontSize:'12px', fontWeight:600, color:'#0C1A2E', letterSpacing:'0.02em',
            display:'block', marginBottom:'6px', textTransform:'uppercase' }}>Password</label>
          <input type="password" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAuth()}
            placeholder="••••••••"
            style={{
              width:'100%', padding:'12px 16px', borderRadius:'10px',
              border:'1.5px solid #E2EBF6', fontSize:'14px',
              boxSizing:'border-box', outline:'none', background:'#F8FAFF',
              color:'#0C1A2E', marginBottom:'24px', transition:'border-color 0.15s',
              fontFamily:"'Satoshi',system-ui,sans-serif" 
            }}
            onFocus={e => { e.target.style.borderColor='#1D4ED8'; e.target.style.background='#fff'; }}
            onBlur={e  => e.target.style.borderColor='#E5E7EB'}
          />
          {mode === 'signup' && (
            <div style={{ marginBottom:'24px' }}>
              <label style={{ fontSize:'13px', color:'#6B7280', display:'block', marginBottom:'6px', fontWeight:500 }}>Year of Birth</label>
              <input type="number" value={birthYear} onChange={e => { setBirthYear(e.target.value); setAgeBlocked(false); }}
                placeholder="e.g. 1998" min="1900" max={new Date().getFullYear()}
                style={{ width:'100%', padding:'12px 16px', borderRadius:'10px', border: ageBlocked ? '1.5px solid #DC2626' : '1.5px solid #E5E7EB', fontSize:'15px', boxSizing:'border-box', outline:'none' }}
              />
              {ageBlocked && <p style={{ fontSize:'12px', color:'#DC2626', marginTop:6 }}>You must be 18 or older to use PsycheFlow.</p>}
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
              width:'100%', padding:'14px',
              background: loading ? '#9CA3AF' : '#1D4ED8',
              color:'#fff', border:'none', borderRadius:'10px',
              fontSize:'14px', fontWeight:700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition:'all 0.15s', letterSpacing:'0.02em',
              fontFamily:"'Satoshi',system-ui,sans-serif",
              boxShadow: loading ? 'none' : '0 4px 16px rgba(29,78,216,0.25)'
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