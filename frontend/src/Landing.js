import React, { useState, useEffect, useRef } from 'react';

const S = {
  navy:'#0C1A2E', blue:'#1D4ED8', bg:'#ffffff', bg2:'#F8FAFF',
  border:'#E5E7EB', muted:'#6B7280', hint:'#9CA3AF',
  success:'#059669', warning:'#D97706', danger:'#DC2626',
  text:'#111827', textSub:'#4B5563',
};

// ── Scroll reveal hook ───────────────────────────────────
function useReveal() {
  const ref = useRef();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function Reveal({ children, delay=0, style={} }) {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} style={{ ...style, opacity:visible?1:0, transform:visible?'translateY(0)':'translateY(24px)', transition:`opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s` }}>
      {children}
    </div>
  );
}

// ── Animated counter ─────────────────────────────────────
function Counter({ target, suffix='', prefix='', duration=1400 }) {
  const [count, setCount] = useState(0);
  const ref = useRef();
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      let start = 0; const step = target / (duration/16);
      const timer = setInterval(() => {
        start += step;
        if (start >= target) { setCount(target); clearInterval(timer); }
        else setCount(Math.floor(start));
      }, 16);
      obs.disconnect();
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// ── PHQ line chart ───────────────────────────────────────
function PHQLine({ data, color, w=120, h=48, animate=true }) {
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v,i) => [(i/(data.length-1))*w, h - ((v-min)/range)*(h-8) - 4]);
  const path = pts.map((p,i) => `${i===0?'M':'L'}${p[0]},${p[1]}`).join(' ');
  const [ref, visible] = useReveal();
  return (
    <svg ref={ref} width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow:'visible' }}>
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        style={{ strokeDasharray:animate?400:'none', strokeDashoffset:animate&&!visible?400:0, transition:'stroke-dashoffset 1.5s ease' }}/>
      {pts.map((p,i)=>(
        <circle key={i} cx={p[0]} cy={p[1]} r="3" fill={color} style={{ opacity:visible?1:0, transition:`opacity 0.3s ease ${0.8+i*0.1}s` }}/>
      ))}
    </svg>
  );
}

const FAQS = [
  { q:'Is PsycheFlow clinically validated?', a:'Yes. All instruments — including PHQ-9, GAD-7, WHO-5, PCL-5, and Big Five — are internationally validated and peer-reviewed. We implement the clinical gold standard rather than proprietary assessments.' },
  { q:'How does crisis detection work?', a:'The system monitors PHQ-9 item 9, C-SSRS responses, and journal sentiment in real time. When risk thresholds are crossed, the assigned psychologist and hospital admin are notified immediately.' },
  { q:'Is patient data stored securely?', a:'Data is stored in Singapore (ap-southeast-1) with AES-256 encryption. We are compliant with India\'s DPDP Act 2023. Patient data is never used to train AI models.' },
  { q:'Can hospitals integrate with existing EMR?', a:'PsycheFlow offers REST API access for enterprise hospitals. FHIR-compatible data export is available on the Enterprise plan.' },
  { q:'What happens if a patient shows suicidal ideation?', a:'The system flags the entry immediately. The assigned psychologist receives an in-app alert and push notification. The patient is shown crisis resources including iCall and Vandrevala Foundation helplines.' },
];

export default function Landing({ onGetStarted, onLegal, onPsychLanding, onHospitalLanding, onPricing }) {
  const [scrolled, setScrolled] = useState(false);
  const [showSolutions, setShowSolutions] = useState(false);
  const [portalTab, setPortalTab] = useState('patient');
  const [openFAQ, setOpenFAQ] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    const onResize = () => setIsMobile(window.innerWidth < 768);
    const closeDropdown = (e) => { if (!e.target.closest?.('.solutions-dropdown')) setShowSolutions(false); };
    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onResize);
    window.addEventListener('click', closeDropdown);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize); window.removeEventListener('click', closeDropdown); };
  }, []);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior:'smooth' });
  const chev = (up) => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ transform:up?'rotate(180deg)':'none', transition:'transform 0.2s' }}><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;

  return (
    <div style={{ fontFamily:"'Satoshi',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", background:S.bg, color:S.text, overflow:'hidden' }}>

      {/* ── NAV ── */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, background:scrolled?'rgba(255,255,255,0.97)':'transparent', borderBottom:scrolled?`1px solid ${S.border}`:'1px solid transparent', backdropFilter:scrolled?'blur(12px)':'none', transition:'all 0.2s' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 40px', height:60, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:28, height:28, borderRadius:7, background:S.blue, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C9 1.5 4 5 4 10C4 12.8 6.2 15 9 15C11.8 15 14 12.8 14 10C14 5 9 1.5 9 1.5Z" fill="white"/><circle cx="9" cy="10" r="2.2" fill="#0C1A2E"/></svg>
            </div>
            <span style={{ fontSize:16, fontWeight:700, color:S.navy, letterSpacing:'-0.02em' }}>PsycheFlow</span>
          </div>
          {!isMobile && (
            <div style={{ display:'flex', alignItems:'center', gap:28 }}>
              <div className="solutions-dropdown" style={{ position:'relative' }}>
                <span onClick={()=>setShowSolutions(s=>!s)} style={{ fontSize:14, color:S.muted, cursor:'pointer', fontWeight:500, display:'flex', alignItems:'center', gap:4 }}>
                  Solutions {chev(showSolutions)}
                </span>
                {showSolutions && (
                  <div style={{ position:'absolute', top:'calc(100% + 12px)', left:-20, background:'#fff', borderRadius:12, border:`1px solid ${S.border}`, padding:8, minWidth:280, boxShadow:'0 8px 30px rgba(0,0,0,0.12)', zIndex:200 }}>
                    {[
                      { label:'For Patients', sub:'Assessment · Journaling · Therapy', action:onGetStarted },
                      { label:'For Psychologists', sub:'SOAP Notes · AI Briefs · Telemedicine', action:onPsychLanding },
                      { label:'For Hospitals', sub:'Analytics · NABH · Crisis Detection', action:onHospitalLanding },
                      { label:'For Clinics', sub:'Multi-practitioner · Shared caseload', action:onHospitalLanding },
                    ].map(item=>(
                      <div key={item.label} onClick={()=>{ item.action(); setShowSolutions(false); }} style={{ padding:'10px 14px', borderRadius:8, cursor:'pointer' }}
                        onMouseEnter={e=>e.currentTarget.style.background=S.bg2} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <div style={{ fontSize:13, fontWeight:600, color:S.navy }}>{item.label}</div>
                        <div style={{ fontSize:12, color:S.muted, marginTop:1 }}>{item.sub}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {[['Features','features'],['Research','instruments'],['Pricing','pricing'],['Security','security']].map(([label, id]) => (
                <span key={id} onClick={()=>id==='pricing'?onPricing?.():scrollTo(id)} style={{ fontSize:14, color:S.muted, cursor:'pointer', fontWeight:500 }}
                  onMouseEnter={e=>e.target.style.color=S.navy} onMouseLeave={e=>e.target.style.color=S.muted}>{label}</span>
              ))}
            </div>
          )}
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={onGetStarted} style={{ padding:'8px 18px', background:'transparent', color:S.navy, border:`1px solid ${S.border}`, borderRadius:8, fontSize:13, fontWeight:500, cursor:'pointer' }}>Sign in</button>
            <button onClick={onGetStarted} style={{ padding:'8px 20px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* ═══ SECTION 1 — HERO ═══ */}
      <section style={{ minHeight:'92vh', display:'flex', flexDirection:'column', justifyContent:'center', padding:isMobile?'100px 24px 60px':'120px 80px 80px', background:S.bg, position:'relative' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', width:'100%', textAlign:'center' }}>
          <Reveal>
            <h1 style={{ margin:'0 0 24px' }}>
              <span style={{ display:'block', fontSize:isMobile?40:80, fontWeight:300, color:S.navy, letterSpacing:'-0.05em', lineHeight:1.02 }}>Detect risk</span>
              <span style={{ display:'block', fontSize:isMobile?40:80, fontWeight:700, color:S.navy, letterSpacing:'-0.05em', lineHeight:1.02 }}>before the session begins.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p style={{ fontSize:isMobile?17:22, color:S.textSub, lineHeight:1.6, margin:'0 auto 40px', maxWidth:560, fontWeight:400 }}>
              AI-powered mental healthcare infrastructure for hospitals and psychologists. Assessment to outcomes, all in one platform.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', marginBottom:64 }}>
              <button onClick={onHospitalLanding} style={{ padding:'14px 32px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:15, fontWeight:600, cursor:'pointer', transition:'transform 0.15s, box-shadow 0.15s' }}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 10px 30px rgba(29,78,216,0.3)'}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none'}}>
                Book Hospital Demo
              </button>
              <button onClick={onPsychLanding} style={{ padding:'14px 32px', background:'transparent', color:S.navy, border:`1px solid ${S.border}`, borderRadius:8, fontSize:15, cursor:'pointer', fontWeight:500 }}
                onMouseEnter={e=>e.currentTarget.style.borderColor=S.blue} onMouseLeave={e=>e.currentTarget.style.borderColor=S.border}>
                Start as Psychologist
              </button>
            </div>
          </Reveal>
          {/* Full-width dashboard breaking out */}
          <Reveal delay={0.3}>
            <div style={{ maxWidth:920, margin:'0 auto', boxShadow:'0 40px 100px rgba(12,26,46,0.18), 0 0 0 1px rgba(0,0,0,0.05)', borderRadius:16, overflow:'hidden' }}>
              <div style={{ background:'#1E293B', padding:'11px 16px', display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ display:'flex', gap:6 }}>{['#ff5f57','#febc2e','#28c840'].map(c=><div key={c} style={{ width:10, height:10, borderRadius:'50%', background:c }}/>)}</div>
                <div style={{ flex:1, display:'flex', justifyContent:'center' }}><div style={{ background:'rgba(255,255,255,0.08)', borderRadius:5, padding:'3px 14px', fontSize:11, color:'rgba(255,255,255,0.4)' }}>psycheflow.in — Clinical Dashboard</div></div>
                <div style={{ display:'flex', alignItems:'center', gap:4 }}><div style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e' }}/><span style={{ fontSize:9, color:'rgba(255,255,255,0.4)' }}>Live</span></div>
              </div>
              <div style={{ background:S.bg2, padding:isMobile?16:24, display:'grid', gridTemplateColumns:isMobile?'1fr':'1.4fr 1fr', gap:16 }}>
                <div>
                  <div style={{ background:'#FEF2F2', border:`1px solid #FECACA`, borderRadius:10, padding:'12px 14px', marginBottom:14, display:'flex', gap:10, alignItems:'center' }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:S.danger, flexShrink:0, boxShadow:'0 0 0 4px rgba(220,38,38,0.12)' }}/>
                    <div style={{ flex:1, textAlign:'left' }}>
                      <div style={{ fontSize:13, fontWeight:700, color:S.danger }}>High Risk Patient — Review Required</div>
                      <div style={{ fontSize:11, color:S.textSub, marginTop:1 }}>Rahul M. · PHQ-9: 11→22 · Item 9 flagged · 3 min ago</div>
                    </div>
                    <div style={{ fontSize:11, fontWeight:600, color:S.danger, background:'#FEE2E2', padding:'3px 10px', borderRadius:5, flexShrink:0 }}>Review →</div>
                  </div>
                  <div style={{ background:'#fff', borderRadius:10, border:`1px solid ${S.border}`, overflow:'hidden' }}>
                    <div style={{ padding:'8px 14px', borderBottom:`1px solid ${S.border}`, textAlign:'left' }}>
                      <div style={{ fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em' }}>Today's Patients</div>
                    </div>
                    {[['Priya Sharma',5,'↓',S.success,'Improving','#ECFDF5'],['Amit Verma',10,'↓',S.warning,'Moderate','#FFFBEB'],['Rahul Mehta',22,'↑↑',S.danger,'Critical','#FEF2F2']].map((p,i)=>(
                      <div key={p[0]} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 14px', borderBottom:i<2?`1px solid ${S.border}`:'none' }}>
                        <div style={{ width:26, height:26, borderRadius:'50%', background:'#EFF6FF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:S.blue }}>{p[0][0]}</div>
                        <div style={{ flex:1, textAlign:'left' }}><div style={{ fontSize:12, fontWeight:600, color:S.navy }}>{p[0]}</div></div>
                        <div style={{ fontSize:12, fontWeight:700, color:p[3] }}>PHQ {p[1]} {p[2]}</div>
                        <div style={{ padding:'2px 8px', borderRadius:4, background:p[5], fontSize:9, fontWeight:600, color:p[3] }}>{p[4]}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ background:S.navy, borderRadius:10, padding:16, textAlign:'left' }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'#93C5FD', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>AI Pre-Session Brief</div>
                  <div style={{ fontSize:12, fontWeight:700, color:'#fff', marginBottom:4 }}>Priya Sharma · 2:30 PM</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.6)', lineHeight:1.7, marginBottom:14 }}>PHQ-9 improved 18→5 over 6 sessions (↓72%). Themes: work boundaries, sleep. Suggested: wrap up ACT module.</div>
                  <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:8, padding:10 }}>
                    <div style={{ fontSize:9, color:'rgba(255,255,255,0.4)', marginBottom:6 }}>PHQ-9 RECOVERY</div>
                    <PHQLine data={[18,14,11,9,7,5]} color="#22c55e" w={isMobile?160:200} h={40}/>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
          {/* Trust */}
          <Reveal delay={0.4}>
            <div style={{ marginTop:48, display:'flex', justifyContent:'center', alignItems:'center', gap:isMobile?20:40, flexWrap:'wrap' }}>
              <span style={{ fontSize:12, color:S.muted }}>Trusted by</span>
              {['Apollo Hospitals','Fortis Healthcare','NIMHANS','Max Healthcare'].map(h=>(
                <span key={h} style={{ fontSize:14, fontWeight:600, color:S.hint, letterSpacing:'-0.01em' }}>{h}</span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ SECTION 2 — AI BRIEFING ═══ */}
      <section style={{ background:S.bg2, padding:isMobile?'80px 24px':'120px 80px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <Reveal>
            <div style={{ textAlign:'center', marginBottom:56 }}>
              <div style={{ fontSize:13, fontWeight:600, color:S.blue, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16 }}>AI Pre-Session Brief</div>
              <h2 style={{ fontSize:isMobile?32:56, fontWeight:700, color:S.navy, letterSpacing:'-0.04em', margin:0, lineHeight:1.05 }}>Walk into every session<br/>prepared.</h2>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div style={{ maxWidth:620, margin:'0 auto', background:S.navy, borderRadius:20, padding:isMobile?28:40, boxShadow:'0 30px 70px rgba(12,26,46,0.2)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:44, height:44, borderRadius:'50%', background:'rgba(147,197,253,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, color:'#93C5FD' }}>P</div>
                  <div>
                    <div style={{ fontSize:17, fontWeight:700, color:'#fff' }}>Priya Sharma</div>
                    <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>Next session: Today, 2:30 PM</div>
                  </div>
                </div>
                <span style={{ fontSize:12, fontWeight:700, padding:'4px 12px', borderRadius:100, background:'rgba(245,158,11,0.15)', color:'#fbbf24' }}>Moderate Risk</span>
              </div>
              <div style={{ borderTop:'1px solid rgba(255,255,255,0.1)', paddingTop:20 }}>
                <div style={{ fontSize:11, fontWeight:700, color:'#93C5FD', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>Detected Themes</div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
                  {['Work stress','Burnout','Sleep disruption','Relationship conflict'].map(t=>(
                    <span key={t} style={{ fontSize:13, padding:'5px 14px', borderRadius:100, background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.8)', border:'1px solid rgba(255,255,255,0.1)' }}>{t}</span>
                  ))}
                </div>
                <div style={{ fontSize:11, fontWeight:700, color:'#93C5FD', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Recommended Focus</div>
                <div style={{ fontSize:15, color:'rgba(255,255,255,0.85)', lineHeight:1.7 }}>Behavioural activation and work boundary-setting. Patient responding well to ACT framework — consider introducing values clarification exercise this session.</div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.25}>
            <p style={{ textAlign:'center', fontSize:16, color:S.muted, marginTop:32, maxWidth:480, marginLeft:'auto', marginRight:'auto', lineHeight:1.7 }}>
              No chart-diving. The brief is ready before your patient walks in — mood trends, journal themes, and clinical suggestions in one place.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ SECTION 3 — DOCUMENTATION ═══ */}
      <section style={{ background:S.bg, padding:isMobile?'80px 24px':'120px 80px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <Reveal>
            <div style={{ textAlign:'center', marginBottom:56 }}>
              <div style={{ fontSize:13, fontWeight:600, color:S.blue, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16 }}>SOAP Generation</div>
              <h2 style={{ fontSize:isMobile?32:56, fontWeight:700, color:S.navy, letterSpacing:'-0.04em', margin:'0 0 16px', lineHeight:1.05 }}>Documentation that<br/>writes itself.</h2>
              <p style={{ fontSize:18, color:S.textSub, maxWidth:480, margin:'0 auto' }}>67% less documentation time. SOAP notes in under 2 minutes.</p>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(4,1fr)', gap:0, alignItems:'stretch', maxWidth:1000, margin:'0 auto' }}>
              {[
                { step:'Session transcript', body:'Audio captured and transcribed in real time', state:'done' },
                { step:'SOAP note generated', body:'AI structures into Subjective, Objective, Assessment, Plan', state:'done' },
                { step:'Psychologist reviews', body:'Edit, refine, and sign with one click', state:'active' },
                { step:'Saved & secured', body:'Encrypted, timestamped, audit-logged', state:'pending' },
              ].map((s,i)=>(
                <div key={s.step} style={{ padding:'24px 20px', position:'relative', borderRight:i<3&&!isMobile?`1px solid ${S.border}`:'none' }}>
                  <div style={{ width:32, height:32, borderRadius:'50%', background:s.state==='pending'?S.bg2:S.blue, border:s.state==='pending'?`1px solid ${S.border}`:'none', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
                    {s.state==='pending' ? <span style={{ fontSize:13, fontWeight:700, color:S.muted }}>{i+1}</span> :
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <div style={{ fontSize:15, fontWeight:700, color:S.navy, marginBottom:6 }}>{s.step}</div>
                  <div style={{ fontSize:13, color:S.muted, lineHeight:1.6 }}>{s.body}</div>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.25}>
            <div style={{ maxWidth:680, margin:'40px auto 0', background:S.bg2, borderRadius:16, padding:isMobile?20:28, border:`1px solid ${S.border}` }}>
              <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:16 }}>Generated SOAP Note · Priya Sharma · 12 Jun 2026</div>
              {[
                ['S','Patient reports improved sleep (6-7 hrs) and reduced work anxiety. "I used the breathing techniques during a stressful meeting and it helped."'],
                ['O','Affect brighter than previous session. PHQ-9: 7 (down from 9). Engaged, maintained eye contact. No SI/HI.'],
                ['A','Major Depressive Disorder, moderate — improving. Good response to behavioural activation and ACT.'],
                ['P','Continue weekly sessions. Introduce values clarification. Maintain sleep hygiene protocol. Reassess PHQ-9 in 2 weeks.'],
              ].map(([letter,text])=>(
                <div key={letter} style={{ display:'flex', gap:14, marginBottom:14 }}>
                  <div style={{ width:28, height:28, borderRadius:7, background:S.blue, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, flexShrink:0 }}>{letter}</div>
                  <div style={{ fontSize:14, color:S.textSub, lineHeight:1.6, paddingTop:4 }}>{text}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ SECTION 4 — CRISIS DETECTION (red) ═══ */}
      <section style={{ background:'linear-gradient(160deg, #1a0a0a 0%, #2d0d0d 100%)', padding:isMobile?'80px 24px':'120px 80px' }}>
        <div style={{ maxWidth:1000, margin:'0 auto', textAlign:'center' }}>
          <Reveal>
            <div style={{ fontSize:13, fontWeight:600, color:'#fca5a5', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16 }}>Crisis Detection</div>
            <h2 style={{ fontSize:isMobile?32:56, fontWeight:700, color:'#fff', letterSpacing:'-0.04em', margin:'0 0 24px', lineHeight:1.05 }}>Never miss a patient<br/>in crisis.</h2>
            <p style={{ fontSize:18, color:'rgba(255,255,255,0.5)', maxWidth:480, margin:'0 auto 56px', lineHeight:1.6 }}>Real-time monitoring of PHQ-9 Item 9, C-SSRS, and journal sentiment. Alerts route instantly to the right clinician.</p>
          </Reveal>
          <Reveal delay={0.2}>
            <div style={{ maxWidth:560, margin:'0 auto' }}>
              {[
                { txt:'PHQ-9 Item 9 score rises to 3', delay:0 },
                { txt:'Suicidal ideation detected in journal', delay:0.1 },
                { txt:'C-SSRS triggered — risk confirmed', delay:0.2 },
                { txt:'Psychologist alerted instantly', delay:0.3 },
                { txt:'Hospital admin notified', delay:0.4 },
                { txt:'Crisis resources shown to patient', delay:0.5 },
              ].map((s,i)=>(
                <Reveal key={s.txt} delay={s.delay}>
                  <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 20px', marginBottom:8, background:i<3?'rgba(220,38,38,0.1)':'rgba(255,255,255,0.04)', borderRadius:10, border:`1px solid ${i<3?'rgba(220,38,38,0.2)':'rgba(255,255,255,0.08)'}` }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:i<3?'#ef4444':'#22c55e', flexShrink:0, boxShadow:i<3?'0 0 0 4px rgba(220,38,38,0.15)':'0 0 0 4px rgba(34,197,94,0.12)' }}/>
                    <span style={{ fontSize:15, color:'rgba(255,255,255,0.85)', textAlign:'left', flex:1 }}>{s.txt}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke={i<3?'#ef4444':'#22c55e'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </Reveal>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ SECTION 5 — RECOVERY TRACKING ═══ */}
      <section style={{ background:S.bg, padding:isMobile?'80px 24px':'120px 80px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <Reveal>
            <div style={{ textAlign:'center', marginBottom:56 }}>
              <div style={{ fontSize:13, fontWeight:600, color:S.blue, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16 }}>Outcome Tracking</div>
              <h2 style={{ fontSize:isMobile?32:56, fontWeight:700, color:S.navy, letterSpacing:'-0.04em', margin:0, lineHeight:1.05 }}>See recovery happening.</h2>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div style={{ background:S.bg2, borderRadius:20, padding:isMobile?24:40, border:`1px solid ${S.border}` }}>
              <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:32, alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:14, color:S.muted, marginBottom:4 }}>Priya Sharma · PHQ-9 over 6 sessions</div>
                  <div style={{ display:'flex', alignItems:'baseline', gap:12, marginBottom:24 }}>
                    <span style={{ fontSize:48, fontWeight:700, color:S.navy, letterSpacing:'-0.04em' }}>18 → 5</span>
                    <span style={{ fontSize:18, fontWeight:700, color:S.success }}>↓ 72%</span>
                  </div>
                  {/* Big bar chart */}
                  <div style={{ display:'flex', gap:8, alignItems:'flex-end', height:140 }}>
                    {[18,14,11,9,7,5].map((v,i)=>(
                      <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                        <div style={{ fontSize:12, fontWeight:700, color:S.navy }}>{v}</div>
                        <div style={{ width:'100%', borderRadius:'4px 4px 0 0', background:`linear-gradient(to top, ${S.blue}, #60a5fa)`, height:`${v/18*110}px`, transition:'height 0.8s ease' }}/>
                        <div style={{ fontSize:10, color:S.hint }}>S{i+1}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  {[
                    ['Mood trend','Steadily improving',S.success,85],
                    ['Medication adherence','94% — excellent',S.success,94],
                    ['Sleep quality','6-7 hrs consistent',S.blue,78],
                    ['Session attendance','6/6 completed',S.success,100],
                  ].map(([label,val,color,pct])=>(
                    <div key={label} style={{ marginBottom:18 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                        <span style={{ fontSize:14, fontWeight:600, color:S.navy }}>{label}</span>
                        <span style={{ fontSize:13, color:S.muted }}>{val}</span>
                      </div>
                      <div style={{ height:8, borderRadius:4, background:S.border }}>
                        <div style={{ height:8, borderRadius:4, background:color, width:`${pct}%`, transition:'width 1s ease' }}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ SECTION 6 — THREE PORTALS (tabbed, dark) ═══ */}
      <section id="features" style={{ background:S.navy, padding:isMobile?'80px 24px':'120px 80px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <Reveal>
            <div style={{ textAlign:'center', marginBottom:48 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#93C5FD', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16 }}>Platform</div>
              <h2 style={{ fontSize:isMobile?32:56, fontWeight:700, color:'#fff', letterSpacing:'-0.04em', margin:0, lineHeight:1.05 }}>Three portals. One system.</h2>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div style={{ display:'flex', justifyContent:'center', gap:8, marginBottom:40 }}>
              {[['patient','Patient'],['psych','Psychologist'],['hospital','Hospital']].map(([id,label])=>(
                <button key={id} onClick={()=>setPortalTab(id)} style={{ padding:'10px 28px', borderRadius:8, border:`1px solid ${portalTab===id?'#93C5FD':'rgba(255,255,255,0.15)'}`, background:portalTab===id?'rgba(147,197,253,0.1)':'transparent', color:portalTab===id?'#fff':'rgba(255,255,255,0.5)', fontSize:15, fontWeight:portalTab===id?700:400, cursor:'pointer', transition:'all 0.2s' }}>{label}</button>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:16, padding:isMobile?20:32, border:'1px solid rgba(255,255,255,0.08)' }}>
              {portalTab==='patient' && (
                <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:32, alignItems:'center' }}>
                  <div>
                    <h3 style={{ fontSize:isMobile?24:32, fontWeight:700, color:'#fff', letterSpacing:'-0.03em', margin:'0 0 16px', lineHeight:1.2 }}>Your mental health, understood.</h3>
                    <p style={{ fontSize:15, color:'rgba(255,255,255,0.6)', lineHeight:1.7, marginBottom:20 }}>Assessments, AI insights, journaling, ACT therapy, and crisis support.</p>
                    {['16 validated instruments','AI wellness tracking','Journal NLP analysis','ACT therapy exercises'].map(f=>(
                      <div key={f} style={{ display:'flex', gap:10, marginBottom:8, alignItems:'center' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        <span style={{ fontSize:14, color:'rgba(255,255,255,0.7)' }}>{f}</span>
                      </div>
                    ))}
                    <button onClick={onGetStarted} style={{ marginTop:20, padding:'11px 24px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:14, fontWeight:600, cursor:'pointer' }}>Start Free</button>
                  </div>
                  <div style={{ background:S.bg2, borderRadius:12, padding:18 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                      <div><div style={{ fontSize:11, color:S.muted }}>Wellness Score</div><div style={{ fontSize:32, fontWeight:700, color:S.navy }}>74<span style={{ fontSize:16, color:S.muted }}>/100</span></div></div>
                      <PHQLine data={[42,51,58,65,70,74]} color={S.success} w={100} h={44}/>
                    </div>
                    <div style={{ background:'#EFF6FF', borderRadius:8, padding:'10px 12px', border:`1px solid #BFDBFE` }}>
                      <div style={{ fontSize:9, fontWeight:700, color:S.blue, textTransform:'uppercase', marginBottom:3 }}>AI Insight</div>
                      <div style={{ fontSize:12, color:S.textSub }}>Sleep consistency is your biggest protective factor this week.</div>
                    </div>
                  </div>
                </div>
              )}
              {portalTab==='psych' && (
                <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:32, alignItems:'center' }}>
                  <div>
                    <h3 style={{ fontSize:isMobile?24:32, fontWeight:700, color:'#fff', letterSpacing:'-0.03em', margin:'0 0 16px', lineHeight:1.2 }}>Built for clinical practice.</h3>
                    <p style={{ fontSize:15, color:'rgba(255,255,255,0.6)', lineHeight:1.7, marginBottom:20 }}>AI briefs, SOAP generation, treatment planning, telemedicine.</p>
                    {['AI pre-session briefs','SOAP notes in 2 minutes','Treatment planning','Secure telemedicine'].map(f=>(
                      <div key={f} style={{ display:'flex', gap:10, marginBottom:8, alignItems:'center' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        <span style={{ fontSize:14, color:'rgba(255,255,255,0.7)' }}>{f}</span>
                      </div>
                    ))}
                    <button onClick={onPsychLanding} style={{ marginTop:20, padding:'11px 24px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:14, fontWeight:600, cursor:'pointer' }}>Start Free — 14 Days</button>
                  </div>
                  <div style={{ background:S.bg2, borderRadius:12, padding:18 }}>
                    <div style={{ background:'#FEF2F2', border:`1px solid #FECACA`, borderRadius:8, padding:'8px 10px', marginBottom:12 }}>
                      <div style={{ fontSize:10, fontWeight:700, color:S.danger }}>High Risk · Rahul M.</div>
                      <div style={{ fontSize:10, color:S.textSub }}>PHQ-9 spiked · C-SSRS required</div>
                    </div>
                    <div style={{ fontSize:11, color:S.muted, marginBottom:4 }}>Caseload PHQ trend</div>
                    <PHQLine data={[14,13,12,11,10,9]} color={S.blue} w={isMobile?160:220} h={50}/>
                  </div>
                </div>
              )}
              {portalTab==='hospital' && (
                <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:32, alignItems:'center' }}>
                  <div>
                    <h3 style={{ fontSize:isMobile?24:32, fontWeight:700, color:'#fff', letterSpacing:'-0.03em', margin:'0 0 16px', lineHeight:1.2 }}>The whole department, connected.</h3>
                    <p style={{ fontSize:15, color:'rgba(255,255,255,0.6)', lineHeight:1.7, marginBottom:20 }}>18 modules. NABH compliance. Population analytics.</p>
                    {['18 clinical modules','NABH compliance reporting','Population analytics','Crisis detection alerts'].map(f=>(
                      <div key={f} style={{ display:'flex', gap:10, marginBottom:8, alignItems:'center' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        <span style={{ fontSize:14, color:'rgba(255,255,255,0.7)' }}>{f}</span>
                      </div>
                    ))}
                    <button onClick={onHospitalLanding} style={{ marginTop:20, padding:'11px 24px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:14, fontWeight:600, cursor:'pointer' }}>Book Demo</button>
                  </div>
                  <div style={{ background:S.bg2, borderRadius:12, padding:18 }}>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:12 }}>
                      {[['24',S.blue],['3',S.danger],['8','#7C3AED'],['₹1.2L',S.success]].map(([v,c],i)=>(
                        <div key={i} style={{ background:'#fff', borderRadius:7, padding:'8px', textAlign:'center', border:`1px solid ${S.border}` }}>
                          <div style={{ fontSize:14, fontWeight:700, color:c }}>{v}</div>
                        </div>
                      ))}
                    </div>
                    {['Depression ↓43%','Anxiety ↓45%','Burnout ↓31%'].map((m,i)=>(
                      <div key={m} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:i<2?`1px solid ${S.border}`:'none' }}>
                        <span style={{ fontSize:12, color:S.textSub }}>{m.split(' ')[0]}</span>
                        <span style={{ fontSize:12, fontWeight:700, color:S.success }}>{m.split(' ')[1]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ SECTION 7 — CLINICAL FOUNDATION ═══ */}
      <section id="instruments" style={{ background:S.bg, padding:isMobile?'80px 24px':'120px 80px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <Reveal>
            <div style={{ textAlign:'center', marginBottom:48 }}>
              <div style={{ fontSize:13, fontWeight:600, color:S.blue, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16 }}>Clinical Foundation</div>
              <h2 style={{ fontSize:isMobile?32:56, fontWeight:700, color:S.navy, letterSpacing:'-0.04em', margin:'0 0 16px', lineHeight:1.05 }}>Built on clinical science.</h2>
              <p style={{ fontSize:18, color:S.textSub, maxWidth:480, margin:'0 auto' }}>Evidence-based assessments used in hospitals and research labs worldwide. We implement the gold standard.</p>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div style={{ display:'flex', flexWrap:'wrap', gap:12, justifyContent:'center', maxWidth:760, margin:'0 auto' }}>
              {[
                ['PHQ-9','Depression'],['GAD-7','Anxiety'],['C-SSRS','Suicide Risk'],['PCL-5','PTSD'],['WHO-5','Wellbeing'],['Big Five','Personality'],['AUDIT','Alcohol'],['MBI','Burnout'],['ASRS','ADHD'],['DASS-21','Stress'],['ISI-7','Insomnia'],['RSE','Self-Esteem'],
              ].map((inst,i)=>(
                <div key={inst[0]} style={{ background:S.bg2, borderRadius:12, padding:'16px 24px', border:`1px solid ${S.border}`, textAlign:'center', transition:'transform 0.2s, border-color 0.2s', cursor:'default' }}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.borderColor=S.blue}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.borderColor=S.border}}>
                  <div style={{ fontSize:16, fontWeight:700, color:S.navy }}>{inst[0]}</div>
                  <div style={{ fontSize:12, color:S.muted, marginTop:2 }}>{inst[1]}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ SECTION 8 — SECURITY ═══ */}
      <section id="security" style={{ background:S.bg2, padding:isMobile?'80px 24px':'120px 80px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <Reveal>
            <div style={{ textAlign:'center', marginBottom:56 }}>
              <div style={{ fontSize:13, fontWeight:600, color:S.blue, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16 }}>Security & Compliance</div>
              <h2 style={{ fontSize:isMobile?32:56, fontWeight:700, color:S.navy, letterSpacing:'-0.04em', margin:'0 0 16px', lineHeight:1.05 }}>Built for India.</h2>
              <p style={{ fontSize:18, color:S.textSub, maxWidth:480, margin:'0 auto' }}>Hospitals care about compliance more than fancy AI. We deliver both.</p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div style={{ display:'flex', justifyContent:'center', gap:14, flexWrap:'wrap', marginBottom:40 }}>
              {['DPDP 2023','NABH Ready','AES-256','TLS 1.3','Audit Trails','Role-Based Access','Data Residency'].map(badge=>(
                <div key={badge} style={{ background:'#fff', borderRadius:100, padding:'10px 22px', border:`1px solid ${S.border}`, fontSize:14, fontWeight:600, color:S.navy }}>{badge}</div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(3,1fr)', gap:20, maxWidth:900, margin:'0 auto' }}>
              {[
                ['Data never leaves India-controlled infrastructure','Hosted in Singapore. AES-256 encryption. You own your data.'],
                ['Every action logged for NABH audits','Access, edits, consent — all timestamped and immutable.'],
                ['Psychologists see only assigned patients','Row-level security enforced at the database level.'],
              ].map(([title,sub])=>(
                <div key={title} style={{ background:'#fff', borderRadius:14, padding:24, border:`1px solid ${S.border}` }}>
                  <div style={{ fontSize:16, fontWeight:700, color:S.navy, marginBottom:10, letterSpacing:'-0.01em', lineHeight:1.4 }}>{title}</div>
                  <div style={{ fontSize:14, color:S.textSub, lineHeight:1.7 }}>{sub}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section style={{ background:S.bg, padding:isMobile?'80px 24px':'120px 80px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <Reveal>
            <div style={{ textAlign:'center', marginBottom:56 }}>
              <div style={{ fontSize:13, fontWeight:600, color:S.blue, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16 }}>Testimonials</div>
              <h2 style={{ fontSize:isMobile?32:48, fontWeight:700, color:S.navy, letterSpacing:'-0.04em', margin:0 }}>From practitioners who use it daily.</h2>
            </div>
          </Reveal>
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(3,1fr)', gap:24 }}>
            {[
              { name:'Dr. Ananya Krishnan', title:'Clinical Psychologist, Apollo Hospitals', quote:'The AI pre-session brief has transformed how I prepare. Documentation time dropped from 25 minutes to under 3.', tag:'AI Brief' },
              { name:'Dr. Rahul Mehta', title:'Head of Psychiatry, Fortis Healthcare', quote:'NABH audits used to take weeks. The audit trail and one-click report generator made us permanently audit-ready.', tag:'NABH' },
              { name:'Priya Sharma', title:'Patient, Recovery', quote:'Seeing my PHQ-9 go from 18 to 5 over 8 sessions gave me something tangible to hold onto.', tag:'Recovery' },
            ].map((t,i)=>(
              <Reveal key={t.name} delay={i*0.1}>
                <div style={{ background:S.bg2, borderRadius:16, padding:28, border:`1px solid ${S.border}`, height:'100%', boxSizing:'border-box' }}>
                  <div style={{ fontSize:15, color:S.textSub, lineHeight:1.8, marginBottom:24, fontStyle:'italic' }}>"{t.quote}"</div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
                    <div>
                      <div style={{ fontSize:14, fontWeight:700, color:S.navy }}>{t.name}</div>
                      <div style={{ fontSize:12, color:S.muted, marginTop:3 }}>{t.title}</div>
                    </div>
                    <span style={{ fontSize:10, fontWeight:600, color:S.blue, background:'#EFF6FF', padding:'3px 8px', borderRadius:4, whiteSpace:'nowrap', marginLeft:8 }}>{t.tag}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section style={{ background:S.bg2, padding:isMobile?'80px 24px':'96px 80px' }}>
        <div style={{ maxWidth:720, margin:'0 auto' }}>
          <Reveal>
            <div style={{ marginBottom:48 }}>
              <div style={{ fontSize:13, fontWeight:600, color:S.blue, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>FAQ</div>
              <h2 style={{ fontSize:isMobile?32:48, fontWeight:700, color:S.navy, letterSpacing:'-0.04em', margin:0 }}>Common questions.</h2>
            </div>
          </Reveal>
          {FAQS.map((faq,i)=>(
            <div key={i} style={{ borderBottom:`1px solid ${S.border}` }}>
              <div onClick={()=>setOpenFAQ(openFAQ===i?null:i)} style={{ padding:'20px 0', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer' }}>
                <span style={{ fontSize:16, fontWeight:600, color:S.navy, paddingRight:24 }}>{faq.q}</span>
                {chev(openFAQ===i)}
              </div>
              {openFAQ===i && <div style={{ paddingBottom:20, fontSize:15, color:S.textSub, lineHeight:1.7 }}>{faq.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ═══ SPLIT CTA ═══ */}
      <section style={{ background:S.navy, padding:isMobile?'80px 24px':'120px 80px' }}>
        <div style={{ maxWidth:1000, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:24 }}>
            {[
              { tag:'For Psychologists', h1:'Spend less time writing notes.', h2:'More time treating patients.', sub:'SOAP notes in 2 minutes. AI brief. Free for 14 days.', btn:'Start Free — 14 Days', action:onPsychLanding, primary:true },
              { tag:'For Hospitals', h1:'See every patient risk', h2:'before the consultation starts.', sub:'18 modules. NABH compliance. 30-minute setup.', btn:'Book Hospital Demo', action:onHospitalLanding, primary:false },
            ].map(c=>(
              <div key={c.tag} style={{ padding:40, background:'rgba(255,255,255,0.04)', borderRadius:16, border:'1px solid rgba(255,255,255,0.08)', transition:'border-color 0.2s' }}
                onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(147,197,253,0.3)'} onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}>
                <div style={{ fontSize:12, fontWeight:700, color:'#93C5FD', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16 }}>{c.tag}</div>
                <h3 style={{ fontSize:isMobile?22:28, fontWeight:700, color:'#fff', letterSpacing:'-0.03em', margin:'0 0 16px', lineHeight:1.2 }}>{c.h1}<br/><span style={{ color:'#93C5FD' }}>{c.h2}</span></h3>
                <p style={{ fontSize:15, color:'rgba(255,255,255,0.5)', lineHeight:1.7, marginBottom:28 }}>{c.sub}</p>
                <button onClick={c.action} style={{ padding:'12px 24px', background:c.primary?S.blue:'transparent', color:'#fff', border:c.primary?'none':'1px solid rgba(255,255,255,0.3)', borderRadius:8, fontSize:14, fontWeight:600, cursor:'pointer' }}>{c.btn}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ background:S.navy, borderTop:'1px solid rgba(255,255,255,0.08)', padding:isMobile?'40px 24px':'40px 80px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:isMobile?'1fr':'2fr 1fr 1fr 1fr', gap:40, marginBottom:32 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
              <div style={{ width:24, height:24, borderRadius:6, background:S.blue, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="12" height="12" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C9 1.5 4 5 4 10C4 12.8 6.2 15 9 15C11.8 15 14 12.8 14 10C14 5 9 1.5 9 1.5Z" fill="white"/><circle cx="9" cy="10" r="2.2" fill="#0C1A2E"/></svg>
              </div>
              <span style={{ fontSize:14, fontWeight:700, color:'#fff' }}>PsycheFlow</span>
            </div>
            <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', lineHeight:1.6, maxWidth:220, marginBottom:12 }}>Clinical intelligence for mental healthcare. Built in India.</p>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>Crisis: iCall 9152987821 · Vandrevala 1860-2662-345</div>
          </div>
          {[
            { heading:'Product', links:['Patient Portal','Psychologist Portal','Hospital Portal','Pricing','Security'] },
            { heading:'Company', links:['About','Privacy Policy','Terms of Service','Contact'] },
            { heading:'Resources', links:['Documentation','API Reference','Clinical Research','Status'] },
          ].map(col=>(
            <div key={col.heading}>
              <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>{col.heading}</div>
              {col.links.map(label=>(
                <div key={label} style={{ fontSize:13, color:'rgba(255,255,255,0.35)', marginBottom:9, cursor:'pointer' }}
                  onMouseEnter={e=>e.target.style.color='rgba(255,255,255,0.8)'} onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.35)'}>{label}</div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)', paddingTop:20, display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <span style={{ fontSize:12, color:'rgba(255,255,255,0.25)' }}>© 2026 PsycheFlow Technologies Pvt. Ltd.</span>
          <span style={{ fontSize:12, color:'rgba(255,255,255,0.25)' }}>DPDP 2023 Compliant · Made in India</span>
        </div>
      </footer>
    </div>
  );
}
