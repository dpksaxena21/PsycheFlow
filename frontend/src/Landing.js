import React, { useState, useEffect, useRef } from 'react';

const useAnim = () => {
  const ref = useRef();
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if(e.isIntersecting) setVis(true); }, { threshold: 0.1 });
    if(ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, vis];
};

const Anim = ({ children, style={} }) => {
  const [ref, vis] = useAnim();
  return <div ref={ref} style={{ opacity: vis?1:0, transform: vis?'translateY(0)':'translateY(24px)', transition:'opacity 0.6s ease, transform 0.6s ease', ...style }}>{children}</div>;
};

const S = {
  teal: '#0D9488', blue: '#1D4ED8', cyan: '#0891B2',
  navy: '#0C1A2E', navyDark: '#0F2444',
  lightBlue: '#EFF6FF', border: '#BFDBFE',
  textPrimary: '#0C1A2E', textMuted: '#3B5998',
  white: '#fff', offWhite: '#FAFCFF',
};

const LogoMark = ({ size=30 }) => (
  <div style={{ width:size, height:size, borderRadius:size*0.27, background:S.blue, display:'flex', alignItems:'center', justifyContent:'center' }}>
    <svg width={size*0.6} height={size*0.6} viewBox="0 0 18 18" fill="none">
      <path d="M9 2C9 2 4 5.5 4 10C4 12.8 6.2 15 9 15C11.8 15 14 12.8 14 10C14 5.5 9 2 9 2Z" fill="white" opacity="0.9"/>
      <circle cx="9" cy="10" r="2.2" fill={S.navy}/>
    </svg>
  </div>
);

const BtnPrimary = ({ children, onClick, style={} }) => (
  <button onClick={onClick} style={{ background:S.blue, color:'#fff', border:'none', padding:'11px 24px', borderRadius:100, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'transform 0.15s, box-shadow 0.15s', ...style }}
    onMouseEnter={e=>{ e.target.style.transform='translateY(-1px)'; e.target.style.boxShadow='0 6px 20px rgba(29,78,216,0.3)'; }}
    onMouseLeave={e=>{ e.target.style.transform=''; e.target.style.boxShadow=''; }}
  >{children}</button>
);

const BtnOutline = ({ children, onClick }) => (
  <button onClick={onClick} style={{ background:S.white, color:S.navy, border:`0.5px solid ${S.blue}`, padding:'11px 24px', borderRadius:100, fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>{children}</button>
);

const FEATURES = [
  { title:'AI clinical assessment', desc:'19 ML models. PHQ-9, GAD-7, Big Five, PTSD, OCD, ADHD. Results in 15 minutes.', icon:<svg width="26" height="26" viewBox="0 0 28 28" fill="none"><ellipse cx="14" cy="11" rx="7" ry="5" stroke="rgba(255,255,255,0.85)" strokeWidth="1.3"/><path d="M7 11C7 14 5 17 5 17C5 20 9 22 14 22C19 22 23 20 23 17C23 17 21 14 21 11" stroke="rgba(255,255,255,0.85)" strokeWidth="1.3" strokeLinecap="round"/><circle cx="14" cy="13" r="2.5" fill="rgba(255,255,255,0.85)"/></svg> },
  { title:'Psychologist co-pilot', desc:'Pre-session AI briefs, SOAP notes, cognitive pattern detection — automated.', icon:<svg width="26" height="26" viewBox="0 0 28 28" fill="none"><rect x="7" y="5" width="14" height="18" rx="3" stroke="rgba(255,255,255,0.5)" strokeWidth="1.3"/><path d="M11 10H17M11 14H15M11 18H13" stroke="rgba(255,255,255,0.5)" strokeWidth="1.3" strokeLinecap="round"/><circle cx="20" cy="20" r="4" fill={S.blue}/><path d="M18.5 20L19.5 21L21.5 19" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { title:'Crisis detection', desc:'C-SSRS screening, automated escalation, instant psychologist alerts.', icon:<svg width="26" height="26" viewBox="0 0 28 28" fill="none"><path d="M14 5L20 10V18C20 21 17 23 14 23C11 23 8 21 8 18V10L14 5Z" stroke="rgba(255,255,255,0.5)" strokeWidth="1.3" strokeLinejoin="round"/><path d="M11 16L13.5 18.5L17 14" stroke="rgba(255,255,255,0.5)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { title:'ACT therapy engine', desc:'Evidence-based therapy with JITAI — right intervention at the right moment.', icon:<svg width="26" height="26" viewBox="0 0 28 28" fill="none"><path d="M14 22C14 22 7 17.5 7 12C7 9 10.1 7 14 7C17.9 7 21 9 21 12C21 17.5 14 22 14 22Z" stroke="rgba(255,255,255,0.5)" strokeWidth="1.3"/><path d="M11 12.5C11 12.5 12 14.5 14 14.5C16 14.5 17 12.5 17 12.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.3" strokeLinecap="round"/></svg> },
  { title:'Secure messaging', desc:'Encrypted patient-psychologist chat. Real-time, read receipts, full history.', icon:<svg width="26" height="26" viewBox="0 0 28 28" fill="none"><rect x="5" y="8" width="18" height="14" rx="4" stroke="rgba(255,255,255,0.5)" strokeWidth="1.3"/><path d="M10 8V6C10 5.4 10.4 5 11 5H17C17.6 5 18 5.4 18 6V8" stroke="rgba(255,255,255,0.5)" strokeWidth="1.3"/><circle cx="11" cy="15" r="1.5" fill="rgba(255,255,255,0.5)"/><circle cx="17" cy="15" r="1.5" fill="rgba(255,255,255,0.5)"/></svg> },
  { title:'Practice analytics', desc:'Outcome tracking, risk distribution, population trends for clinic admins.', icon:<svg width="26" height="26" viewBox="0 0 28 28" fill="none"><rect x="5" y="5" width="18" height="18" rx="3" stroke="rgba(255,255,255,0.5)" strokeWidth="1.3"/><path d="M9 19V15M13 19V10M17 19V13M21 19V17" stroke="rgba(255,255,255,0.5)" strokeWidth="1.3" strokeLinecap="round"/></svg> },
];

const WHO = [
  { title:'Hospitals & clinics', desc:'Scale mental healthcare without scaling headcount.', pts:['Reduce intake time by 70%','Population health monitoring','DPDP Act 2023 compliant'] },
  { title:'Psychologists', desc:'Spend more time with patients, less on paperwork.', pts:['AI pre-session briefs','One-click SOAP notes','Crisis alerts in real-time'] },
  { title:'Patients', desc:'Professional mental health support, always available.', pts:['Assessment in 15 minutes','Personalized therapy tools','Secure messaging'] },
];

const FAQS = [
  { q:'Is PsycheFlow a medical diagnosis tool?', a:'No. PsycheFlow is AI-assisted assessment. All outputs are patterns and recommendations, never diagnoses. Clinical decisions are always made by licensed psychologists.' },
  { q:'How accurate are the ML models?', a:'Suicide risk model: 94% accuracy, ROC-AUC 0.98. Condition classifier: 76% across 7 conditions. All trained on validated clinical datasets.' },
  { q:'How is patient data protected?', a:'All data encrypted at rest and in transit. DPDP Act 2023 compliant. Patients control their consent and can request deletion anytime.' },
  { q:'Can hospitals integrate with their EMR?', a:'Yes. PsycheFlow offers EMR-ready data export and API access. Contact us for enterprise integration support.' },
  { q:'What does the free plan include?', a:'Free patients get full AI assessment, journal, mood tracking, and ACT exercises. Psychologists get a 14-day free trial with all features.' },
];

export default function Landing({ onGetStarted }) {
  const [scrolled, setScrolled] = useState(false);
  const [activeWho, setActiveWho] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <div style={{ fontFamily:"'Satoshi',-apple-system,sans-serif", background:S.white, color:S.textPrimary, overflowX:'hidden' }}>

      {/* NAV */}
      <nav style={{ position:'sticky', top:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 48px', background: scrolled?'rgba(255,255,255,0.96)':'#fff', borderBottom:`0.5px solid ${S.border}`, backdropFilter: scrolled?'blur(12px)':'none', transition:'all 0.3s' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <LogoMark size={30}/>
          <span style={{ fontWeight:700, fontSize:15, letterSpacing:'-0.02em' }}>PsycheFlow</span>
        </div>
        <div style={{ display:'flex', gap:28, alignItems:'center' }}>
          {['Features','For Hospitals','Psychologists','Pricing'].map(l => (
            <span key={l} style={{ fontSize:13, color:S.textMuted, cursor:'pointer' }}>{l}</span>
          ))}
          <BtnPrimary onClick={onGetStarted} style={{ padding:'8px 18px', fontSize:13 }}>Get Started</BtnPrimary>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', minHeight:520 }}>
        <div style={{ padding:'80px 48px 80px 48px', display:'flex', flexDirection:'column', justifyContent:'center', borderRight:`0.5px solid ${S.border}` }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 12px', borderRadius:100, border:`0.5px solid #93C5FD`, background:S.lightBlue, fontSize:11, fontWeight:600, color:S.blue, marginBottom:20, width:'fit-content' }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:S.blue, animation:'pulse 2s infinite' }}/>
            AI-powered psychology platform for India
          </div>
          <h1 style={{ fontSize:52, fontWeight:700, letterSpacing:'-0.03em', lineHeight:1.06, marginBottom:16, color:S.navy }}>
            Your mind,<br/>
            <span style={{ background:`linear-gradient(90deg,${S.blue},${S.cyan})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>understood</span><br/>
            at scale.
          </h1>
          <p style={{ fontSize:15, color:S.textMuted, lineHeight:1.7, marginBottom:28, maxWidth:420 }}>
            AI-powered psychological assessment, therapy tools, and clinical management for hospitals, psychologists, and patients across India.
          </p>
          <div style={{ display:'flex', gap:10 }}>
            <BtnPrimary onClick={onGetStarted}>Explore platform</BtnPrimary>
            <BtnOutline onClick={onGetStarted}>Book a demo ↗</BtnOutline>
          </div>
        </div>
        <div style={{ background:S.lightBlue, display:'flex', alignItems:'center', justifyContent:'center', padding:40 }}>
          <div style={{ background:S.white, borderRadius:18, border:`0.5px solid ${S.border}`, padding:20, width:'100%', maxWidth:300, boxShadow:'0 4px 24px rgba(29,78,216,0.08)' }}>
            <div style={{ fontWeight:700, fontSize:14, color:S.navy, letterSpacing:'-0.01em' }}>Welcome, Deepak!</div>
            <div style={{ fontSize:10, color:S.textMuted, marginTop:2, marginBottom:12 }}>Session 4 · Today, 10:30 AM</div>
            <div style={{ background:S.lightBlue, color:S.blue, fontSize:9, fontWeight:700, padding:'3px 9px', borderRadius:100, border:`0.5px solid #93C5FD`, display:'inline-block', marginBottom:12 }}>● Low risk</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:7, marginBottom:12 }}>
              {[['4','PHQ-9','#FFF1F3','#BE123C'],['6','GAD-7',S.lightBlue,S.blue],['↓72%','Better','#F0F9FF','#0369A1']].map(([v,l,bg,c],i) => (
                <div key={i} style={{ padding:10, borderRadius:10, background:bg }}>
                  <div style={{ fontSize:15, fontWeight:700, color:c }}>{v}</div>
                  <div style={{ fontSize:9, color:'#6B7280', marginTop:1 }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ border:`0.5px solid ${S.border}`, borderRadius:11, padding:12, marginBottom:10, background:S.offWhite }}>
              <div style={{ fontSize:9, fontWeight:700, color:S.navy, marginBottom:9, letterSpacing:'0.03em', textTransform:'uppercase' }}>Depression trend · PHQ-9</div>
              <div style={{ display:'flex', alignItems:'flex-end', gap:4, height:50 }}>
                {[['85%','#FEE2E2','#BE123C','18'],['65%','#FEE2E2','#BE123C','14'],['46%','#FED7AA','#C2410C','10'],['28%',S.border,S.blue,'6'],['16%','#93C5FD',S.blue,'4']].map(([h,bg,c,v],i) => (
                  <div key={i} style={{ flex:1, height:h, background:bg, borderRadius:'3px 3px 0 0', position:'relative' }}>
                    <span style={{ position:'absolute', top:-14, left:'50%', transform:'translateX(-50%)', fontSize:8, fontWeight:700, color:c, whiteSpace:'nowrap' }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                <span style={{ fontSize:8, color:S.textMuted }}>Wk 1</span>
                <span style={{ fontSize:8, color:S.textMuted }}>Wk 5</span>
              </div>
            </div>
            <div style={{ padding:'9px 11px', background:S.lightBlue, borderRadius:9, border:`0.5px solid #93C5FD` }}>
              <div style={{ fontSize:8, fontWeight:700, color:S.blue, marginBottom:2, letterSpacing:'0.06em' }}>AI PRE-SESSION BRIEF</div>
              <div style={{ fontSize:10, color:'#374151', lineHeight:1.6 }}>Significant improvement since Week 1. Focus on sleep hygiene and coping strategies.</div>
            </div>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', borderTop:`0.5px solid ${S.border}`, borderBottom:`0.5px solid ${S.border}` }}>
        {[['197M','Indians need mental health support'],['4,309','Registered psychologists in India'],['94%','Suicide risk detection accuracy'],['19','Validated ML models']].map(([v,l],i) => (
          <div key={i} style={{ padding:'22px 0', textAlign:'center', borderRight: i<3?`0.5px solid ${S.border}`:'none' }}>
            <div style={{ fontSize:24, fontWeight:700, color:S.blue, letterSpacing:'-0.02em' }}>{v}</div>
            <div style={{ fontSize:10, color:S.textMuted, marginTop:3, lineHeight:1.4, padding:'0 10px' }}>{l}</div>
          </div>
        ))}
      </div>

      {/* FEATURES */}
      <div style={{ background:S.navy, padding:'80px 48px' }}>
        <Anim><div style={{ display:'inline-block', padding:'3px 12px', borderRadius:100, background:'rgba(147,197,253,0.15)', color:'#93C5FD', fontSize:10, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:10 }}>Platform</div></Anim>
        <Anim>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:16, marginTop:8, marginBottom:32 }}>
            <h2 style={{ fontSize:30, fontWeight:700, letterSpacing:'-0.02em', color:'#fff', maxWidth:360, lineHeight:1.15 }}>Everything a mental health practice needs.</h2>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.3)', maxWidth:260, lineHeight:1.7 }}>Built on validated clinical instruments and trained on millions of data points.</p>
          </div>
        </Anim>
        <Anim>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:1, background:'rgba(255,255,255,0.04)', borderRadius:16, overflow:'hidden', border:'0.5px solid rgba(255,255,255,0.06)' }}>
            {FEATURES.map((f,i) => (
              <div key={i} style={{ background: i===0?S.blue:'#0F2444', padding:26, position:'relative', transition:'background 0.2s', cursor:'pointer' }}
                onMouseEnter={e=>{ if(i!==0) e.currentTarget.style.background='#1a3a6b'; }}
                onMouseLeave={e=>{ if(i!==0) e.currentTarget.style.background='#0F2444'; }}
              >
                <div style={{ position:'absolute', top:16, right:16, width:20, height:20, borderRadius:5, background:'rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 8L8 2M8 2H4M8 2V6" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round"/></svg>
                </div>
                <div style={{ marginBottom:10 }}>{f.icon}</div>
                <h3 style={{ fontSize:13, fontWeight:700, color:'#fff', marginBottom:5, letterSpacing:'-0.01em' }}>{f.title}</h3>
                <p style={{ fontSize:11, color: i===0?'rgba(255,255,255,0.75)':'rgba(255,255,255,0.4)', lineHeight:1.7, margin:0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </Anim>
      </div>

      {/* WHO */}
      <div style={{ padding:'80px 48px', background:S.white }}>
        <Anim><div style={{ display:'inline-block', padding:'3px 12px', borderRadius:100, background:S.lightBlue, color:S.blue, border:`0.5px solid #93C5FD`, fontSize:10, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:10 }}>Who it's for</div></Anim>
        <Anim><h2 style={{ fontSize:30, fontWeight:700, letterSpacing:'-0.02em', color:S.navy, maxWidth:360, lineHeight:1.15, marginTop:8, marginBottom:28 }}>Built for every stakeholder.</h2></Anim>
        <Anim>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
            {WHO.map((w,i) => (
              <div key={i} onClick={() => setActiveWho(i)}
                style={{ padding:26, borderRadius:16, border:`0.5px solid ${activeWho===i?S.blue:S.border}`, background: activeWho===i?S.lightBlue:S.white, cursor:'pointer', transition:'all 0.2s' }}>
                <div style={{ marginBottom:14 }}>
                  {i===0 && <svg width="36" height="36" viewBox="0 0 36 36" fill="none"><rect width="36" height="36" rx="10" fill={S.lightBlue}/><path d="M18 9C14 9 11 11.7 11 15C11 18.3 13 20 18 20" stroke={S.blue} strokeWidth="1.8" strokeLinecap="round"/><path d="M18 20C23 20 25 18.3 25 15C25 11.7 22 9 18 9" stroke={S.cyan} strokeWidth="1.8" strokeLinecap="round"/><path d="M14 15H22M18 11V19" stroke={S.blue} strokeWidth="1.8" strokeLinecap="round"/><path d="M12 24H24M15 24V27M21 24V27" stroke={S.blue} strokeWidth="1.6" strokeLinecap="round"/></svg>}
                  {i===1 && <svg width="36" height="36" viewBox="0 0 36 36" fill="none"><rect width="36" height="36" rx="10" fill={S.lightBlue}/><circle cx="18" cy="14" r="4" stroke={S.blue} strokeWidth="1.8"/><path d="M10 27C10 23.1 13.6 20 18 20C22.4 20 26 23.1 26 27" stroke={S.blue} strokeWidth="1.8" strokeLinecap="round"/><path d="M23 10L25 12L29 8" stroke={S.cyan} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  {i===2 && <svg width="36" height="36" viewBox="0 0 36 36" fill="none"><rect width="36" height="36" rx="10" fill={S.lightBlue}/><ellipse cx="18" cy="14" rx="6" ry="5" stroke={S.blue} strokeWidth="1.8"/><path d="M15 14C15 14 16 16 18 16C20 16 21 14 21 14" stroke={S.cyan} strokeWidth="1.6" strokeLinecap="round"/><circle cx="15.5" cy="13" r="1" fill={S.blue}/><circle cx="20.5" cy="13" r="1" fill={S.blue}/><path d="M12 24C12 21.2 14.7 19 18 19C21.3 19 24 21.2 24 24" stroke={S.blue} strokeWidth="1.8" strokeLinecap="round"/></svg>}
                </div>
                <h3 style={{ fontSize:14, fontWeight:700, color:S.navy, marginBottom:7, letterSpacing:'-0.01em' }}>{w.title}</h3>
                <p style={{ fontSize:12, color:S.textMuted, lineHeight:1.7, marginBottom:10 }}>{w.desc}</p>
                {w.pts.map((p,j) => (
                  <div key={j} style={{ display:'flex', alignItems:'center', gap:7, marginBottom:5, fontSize:11, color:S.textMuted }}>
                    <span style={{ color:S.blue, fontSize:12, flexShrink:0 }}>✓</span>{p}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Anim>
      </div>

      {/* COMPLIANCE */}
      <div style={{ padding:'80px 48px', background:S.white, borderTop:`0.5px solid ${S.border}` }}>
        <Anim><div style={{ display:'inline-block', padding:'3px 12px', borderRadius:100, background:S.lightBlue, color:S.blue, border:`0.5px solid #93C5FD`, fontSize:10, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:10 }}>Compliance</div></Anim>
        <Anim>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:16, marginTop:8, marginBottom:24 }}>
            <h2 style={{ fontSize:30, fontWeight:700, letterSpacing:'-0.02em', color:S.navy, maxWidth:340, lineHeight:1.15 }}>Built for Indian healthcare compliance.</h2>
            <p style={{ fontSize:12, color:S.textMuted, maxWidth:280, lineHeight:1.7 }}>Designed around India's DPDP Act 2023, clinical best practices, and RCI verification.</p>
          </div>
        </Anim>
        <Anim>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
            {[
              { title:'DPDP Act 2023', sub:'Full data protection', icon:<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill={S.lightBlue}/><path d="M16 6L20 9H26V18C26 22.4 21.5 25.8 16 26C10.5 25.8 6 22.4 6 18V9H12L16 6Z" stroke={S.blue} strokeWidth="1.6" strokeLinejoin="round"/><path d="M12 17L15 20L20 14" stroke={S.cyan} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg> },
              { title:'RCI verified', sub:'Psychologist credentials', icon:<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill={S.lightBlue}/><rect x="8" y="6" width="16" height="20" rx="3" stroke={S.blue} strokeWidth="1.6"/><path d="M12 13H20M12 17H18M12 21H15" stroke={S.cyan} strokeWidth="1.6" strokeLinecap="round"/><circle cx="22" cy="22" r="5" fill={S.blue}/><path d="M20 22L21.5 23.5L24 21" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg> },
              { title:'Encrypted', sub:'End-to-end security', icon:<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill={S.lightBlue}/><rect x="10" y="14" width="12" height="12" rx="2" stroke={S.blue} strokeWidth="1.6"/><path d="M13 14V11C13 9.3 14.3 8 16 8C17.7 8 19 9.3 19 11V14" stroke={S.cyan} strokeWidth="1.6" strokeLinecap="round"/><circle cx="16" cy="20" r="2" fill={S.blue}/></svg> },
              { title:'SaMD class B', sub:'India MDR 2017 ready', icon:<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill={S.lightBlue}/><path d="M8 20C10 17 13 15 16 15C19 15 22 17 24 20" stroke={S.blue} strokeWidth="1.6" strokeLinecap="round"/><path d="M11 13C12 10 14 8 16 8C18 8 20 10 21 13" stroke={S.cyan} strokeWidth="1.6" strokeLinecap="round"/><path d="M8 24H24" stroke={S.blue} strokeWidth="1.6" strokeLinecap="round"/></svg> },
            ].map((c,i) => (
              <div key={i} style={{ padding:22, borderRadius:14, border:`0.5px solid ${S.border}`, background:S.white, textAlign:'center', transition:'transform 0.2s, box-shadow 0.2s', cursor:'default' }}
                onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 4px 16px rgba(29,78,216,0.1)'; }}
                onMouseLeave={e=>{ e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}
              >
                <div style={{ marginBottom:10 }}>{c.icon}</div>
                <div style={{ fontSize:12, fontWeight:700, color:S.navy, marginBottom:3 }}>{c.title}</div>
                <div style={{ fontSize:10, color:S.blue }}>{c.sub}</div>
              </div>
            ))}
          </div>
        </Anim>
      </div>

      {/* FAQ */}
      <div style={{ padding:'80px 48px', background:S.white, borderTop:`0.5px solid ${S.border}` }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'flex-start' }}>
          <Anim>
            <div style={{ display:'inline-block', padding:'3px 12px', borderRadius:100, background:S.lightBlue, color:S.blue, border:`0.5px solid #93C5FD`, fontSize:10, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:10 }}>FAQ</div>
            <h2 style={{ fontSize:30, fontWeight:700, letterSpacing:'-0.02em', color:S.navy, lineHeight:1.15, marginTop:8, marginBottom:16 }}>Frequently asked<br/>questions.</h2>
            <p style={{ fontSize:13, color:S.textMuted, lineHeight:1.7, marginBottom:20 }}>Find answers about PsycheFlow's platform, compliance, and clinical capabilities.</p>
            <BtnPrimary onClick={onGetStarted}>Ask us anything →</BtnPrimary>
          </Anim>
          <Anim>
            {FAQS.map((f,i) => (
              <div key={i} onClick={() => setOpenFaq(openFaq===i?null:i)} style={{ borderBottom:`0.5px solid ${S.border}`, padding:'14px 0', cursor:'pointer' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:14 }}>
                  <span style={{ fontSize:13, fontWeight:500, color:S.navy }}>{f.q}</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d={openFaq===i?"M4 10L8 6L12 10":"M4 6H12M8 2V10"} stroke={S.blue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                {openFaq===i && <div style={{ fontSize:12, color:S.textMuted, lineHeight:1.7, marginTop:8 }}>{f.a}</div>}
              </div>
            ))}
          </Anim>
        </div>
      </div>

      {/* CTA */}
      <div style={{ margin:'0 48px 48px', background:`linear-gradient(135deg,${S.navy},#1a3a6b)`, borderRadius:20, padding:'64px 48px', textAlign:'center' }}>
        <h2 style={{ fontSize:34, fontWeight:700, color:'#fff', letterSpacing:'-0.02em', marginBottom:12, lineHeight:1.1 }}>The future of mental<br/>healthcare is here.</h2>
        <p style={{ fontSize:14, color:'rgba(255,255,255,0.5)', marginBottom:28, lineHeight:1.6 }}>Join hospitals and psychologists transforming<br/>mental health outcomes across India.</p>
        <BtnPrimary onClick={onGetStarted} style={{ fontSize:14, padding:'12px 28px' }}>Get started free →</BtnPrimary>
        <button onClick={onGetStarted} style={{ background:'transparent', color:'#93C5FD', border:'0.5px solid #93C5FD', padding:'11px 22px', borderRadius:100, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', marginLeft:10 }}>Book a demo</button>
        <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginTop:14 }}>No credit card · DPDP compliant · iCall 9152987821 · Vandrevala 1860-2662-345</div>
      </div>

      {/* FOOTER */}
      <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr 1fr 1fr', gap:32, padding:'40px 48px', borderTop:`0.5px solid ${S.border}` }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}><LogoMark size={28}/><span style={{ fontWeight:700, fontSize:14 }}>PsycheFlow</span></div>
          <p style={{ fontSize:12, color:S.textMuted, lineHeight:1.7 }}>AI-powered psychology platform for India.</p>
          <p style={{ fontSize:12, color:S.textMuted, marginTop:10, lineHeight:1.8 }}>Crisis: iCall 9152987821<br/>Vandrevala: 1860-2662-345<br/>NIMHANS: 080-46110007</p>
        </div>
        {[['Platform',['Features','For hospitals','For psychologists','Pricing','API docs']],['Company',['About us','Blog','Careers','Press','Contact']],['Legal',['Privacy policy','Terms of service','DPDP compliance','Cookie policy','Refund policy']]].map(([h,links]) => (
          <div key={h}>
            <div style={{ fontSize:11, fontWeight:700, marginBottom:12, color:S.navy, letterSpacing:'0.02em', textTransform:'uppercase' }}>{h}</div>
            {links.map(l => <span key={l} style={{ fontSize:12, color:S.textMuted, display:'block', marginBottom:8, cursor:'pointer' }}>{l}</span>)}
          </div>
        ))}
      </div>
      <div style={{ padding:'14px 48px', borderTop:`0.5px solid ${S.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:11, color:S.textMuted }}>© 2026 PsycheFlow. All rights reserved.</span>
        <span style={{ fontSize:11, color:S.textMuted }}>psycheflow.in</span>
        <span style={{ fontSize:11, color:S.textMuted }}>Made in India 🇮🇳</span>
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.4)}}`}</style>
    </div>
  );
}
