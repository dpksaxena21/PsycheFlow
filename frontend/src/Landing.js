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
  { q:'Is patient data stored securely?', a:"Data is stored in Singapore (ap-southeast-1) with AES-256 encryption. We are compliant with India's DPDP Act 2023. Patient data is never used to train AI models." },
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
      <section style={{ background:'#0C1A2E', padding:isMobile?'80px 24px':'120px 80px' }}>
        <div style={{ maxWidth:1000, margin:'0 auto', textAlign:'center' }}>
          <Reveal>
            <div style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16 }}>Crisis Detection</div>
            <h2 style={{ fontSize:isMobile?32:56, fontWeight:700, color:'#fff', letterSpacing:'-0.04em', margin:'0 0 24px', lineHeight:1.05 }}>Never miss a patient<br/>in crisis.</h2>
            <p style={{ fontSize:18, color:'rgba(255,255,255,0.5)', maxWidth:480, margin:'0 auto 56px', lineHeight:1.6 }}>Real-time monitoring of PHQ-9 Item 9, C-SSRS, and journal sentiment. Alerts route instantly to the right clinician.</p>
          </Reveal>
          <Reveal delay={0.2}>
            <div style={{ maxWidth:560, margin:'0 auto' }}>
              {[
                { txt:'PHQ-9 Item 9 score rises to 3', risk:true },
                { txt:'Suicidal ideation detected in journal', risk:true },
                { txt:'C-SSRS triggered — risk confirmed', risk:true },
                { txt:'Psychologist alerted instantly', risk:false },
                { txt:'Hospital admin notified', risk:false },
                { txt:'Crisis resources shown to patient', risk:false },
              ].map((s,i)=>(
                <Reveal key={s.txt} delay={i*0.1}>
                  <div style={{ display:'flex', alignItems:'center', gap:16, padding:'16px 22px', marginBottom:8, background:'rgba(255,255,255,0.04)', borderRadius:10, border:`1px solid ${s.risk?'rgba(239,68,68,0.2)':'rgba(34,197,94,0.15)'}`, transition:'background 0.2s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.07)'}
                    onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.04)'}>
                    {s.risk ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink:0 }}>
                        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="12" y1="9" x2="12" y2="13" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
                        <circle cx="12" cy="17" r="1" fill="#ef4444"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink:0 }}>
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 12l2 2 4-4" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    <span style={{ fontSize:15, color:'rgba(255,255,255,0.85)', textAlign:'left', flex:1, fontWeight:500 }}>{s.txt}</span>
                    <span style={{ fontSize:11, fontWeight:600, color:s.risk?'rgba(239,68,68,0.7)':'rgba(34,197,94,0.7)', background:s.risk?'rgba(239,68,68,0.08)':'rgba(34,197,94,0.08)', padding:'2px 8px', borderRadius:4 }}>{s.risk?'Detected':'Resolved'}</span>
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

      {/* ═══ SECTION 7 — DAY IN THE LIFE ═══ */}
      <section style={{ background:S.bg, padding:isMobile?'80px 24px':'120px 80px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <Reveal>
            <div style={{ textAlign:'center', marginBottom:64 }}>
              <div style={{ fontSize:13, fontWeight:600, color:S.blue, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16 }}>Patient Journey</div>
              <h2 style={{ fontSize:isMobile?32:56, fontWeight:700, color:S.navy, letterSpacing:'-0.04em', margin:'0 0 16px', lineHeight:1.05 }}>A day in the life<br/>of a PsycheFlow patient.</h2>
              <p style={{ fontSize:18, color:S.textSub, maxWidth:480, margin:'0 auto' }}>From morning check-in to recovered sleep — every touchpoint designed to help.</p>
            </div>
          </Reveal>
          <div style={{ position:'relative' }}>
            {/* Vertical timeline line */}
            {!isMobile && <div style={{ position:'absolute', left:48, top:24, bottom:24, width:2, background:`linear-gradient(to bottom, ${S.blue}, #7C3AED, #059669, #D97706, #0891B2)`, borderRadius:2 }}/>}
            {[
              {
                time:'8:00 AM', label:'Morning Mood Check', color:S.blue, bg:'#EFF6FF',
                icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 3v1m0 16v1M4.22 4.22l.7.7m12.16 12.16.7.7M1 12h1m20 0h1M4.22 19.78l.7-.7M18.36 5.64l.7-.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5"/></svg>,
                story:'Priya opens PsycheFlow and taps "Struggling" on the mood check. The app flags this — her third low mood in a row.',
                outcome:'Dr. PsycheFlow sends a gentle check-in nudge and suggests a 4-minute breathing exercise.',
                visual:<div style={{ background:'#EFF6FF', borderRadius:12, padding:14 }}>
                  <div style={{ fontSize:11, color:S.muted, marginBottom:8 }}>How are you feeling today, Priya?</div>
                  <div style={{ display:'flex', gap:6 }}>
                    {[['Great','#FCD34D'],['Good','#FCD34D'],['Okay','#FCD34D'],['Low','#93C5FD'],['Struggling','#C4B5FD']].map(([l,c],i)=>(
                      <div key={l} style={{ flex:1, background:i===4?'#7C3AED':'#fff', borderRadius:8, padding:'8px 4px', textAlign:'center', border:`1px solid ${i===4?'#7C3AED':S.border}` }}>
                        <div style={{ width:20, height:20, borderRadius:'50%', background:c, margin:'0 auto 4px' }}/>
                        <div style={{ fontSize:9, color:i===4?'#fff':S.muted, fontWeight:i===4?700:400 }}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              },
              {
                time:'9:30 AM', label:'AI Risk Detection', color:'#7C3AED', bg:'#F5F3FF',
                icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9.5 2A2.5 2.5 0 007 4.5v1A2.5 2.5 0 004.5 8v1A2.5 2.5 0 002 11.5C2 13 3 14.3 4.5 14.8V17a5 5 0 005 5h5a5 5 0 005-5v-2.2c1.5-.5 2.5-1.8 2.5-3.3A2.5 2.5 0 0019.5 9V8A2.5 2.5 0 0017 5.5v-1A2.5 2.5 0 0014.5 2h-5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
                story:'Priya completes a 15-minute adaptive assessment. PHQ-9 comes back at 14 — moderate depression. The AI cross-references her journal themes.',
                outcome:'Risk level: Moderate. Psychologist Dr. Ananya is automatically notified with a pre-session brief.',
                visual:<div style={{ background:'#F5F3FF', borderRadius:12, padding:14 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'#7C3AED', marginBottom:8 }}>AI ANALYSIS COMPLETE</div>
                  {[['PHQ-9','14','Moderate','#D97706'],['GAD-7','11','Mild-Mod','#D97706'],['Risk','Medium','Flagged','#DC2626']].map(([l,v,s,c])=>(
                    <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:`1px solid ${S.border}` }}>
                      <span style={{ fontSize:11, color:S.muted }}>{l}</span>
                      <span style={{ fontSize:11, fontWeight:700, color:c }}>{v} · {s}</span>
                    </div>
                  ))}
                </div>
              },
              {
                time:'11:00 AM', label:'Psychologist Receives Alert', color:'#059669', bg:'#ECFDF5',
                icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
                story:'Dr. Ananya opens her PsycheFlow dashboard. An AI pre-session brief is waiting — PHQ trends, journal themes, and a suggested focus for today.',
                outcome:'She walks into the 2 PM session already knowing Priya has been struggling with work stress and sleep disruption.',
                visual:<div style={{ background:'#ECFDF5', borderRadius:12, padding:14 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'#059669', marginBottom:6 }}>PRE-SESSION BRIEF · PRIYA S.</div>
                  <div style={{ fontSize:11, color:S.textSub, lineHeight:1.6 }}>PHQ-9 up from 9→14. Themes: work boundaries, sleep. Suggest: behavioural activation + sleep hygiene.</div>
                </div>
              },
              {
                time:'2:00 PM', label:'Therapy Session', color:'#D97706', bg:'#FFFBEB',
                icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/></svg>,
                story:'The session runs 50 minutes. Dr. Ananya uses the SOAP note template. Within 2 minutes of ending the session, a structured note is auto-generated.',
                outcome:'Documentation time: 2 minutes. Previously: 25 minutes. Priya gets homework assigned directly in the app.',
                visual:<div style={{ background:'#FFFBEB', borderRadius:12, padding:14 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'#D97706', marginBottom:6 }}>SOAP NOTE GENERATED</div>
                  {[['S','Patient reports work stress affecting sleep.'],['O','PHQ-9: 14, affect anxious but engaged.'],['A','MDD moderate — improving with ACT.'],['P','Sleep hygiene + boundary-setting HW.']].map(([l,t])=>(
                    <div key={l} style={{ display:'flex', gap:8, marginBottom:4 }}>
                      <span style={{ width:18, height:18, borderRadius:5, background:'#D97706', color:'#fff', fontSize:10, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{l}</span>
                      <span style={{ fontSize:10, color:S.textSub, lineHeight:1.4 }}>{t}</span>
                    </div>
                  ))}
                </div>
              },
              {
                time:'10:00 PM', label:'Recovery Improves', color:'#0891B2', bg:'#ECFEFF',
                icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                story:"Over 6 weeks, Priya's PHQ-9 drops from 18 to 5. Her sleep score improves by 40%. She logs into PsycheFlow and sees her recovery chart.",
                outcome:'PHQ-9: 18 → 5. Sleep: improving. Mood streak: 14 days. In remission.',
                visual:<div style={{ background:'#ECFEFF', borderRadius:12, padding:14 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'#0891B2', marginBottom:8 }}>6-WEEK RECOVERY</div>
                  <div style={{ display:'flex', gap:4, alignItems:'flex-end', height:48 }}>
                    {[18,14,11,9,7,5].map((v,i)=>(
                      <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
                        <div style={{ fontSize:8, color:'#0891B2', fontWeight:700 }}>{v}</div>
                        <div style={{ width:'100%', borderRadius:'2px 2px 0 0', background:`hsl(${180+i*10},70%,${40+i*5}%)`, height:`${v*2.2}px` }}/>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize:9, color:S.muted, marginTop:4, textAlign:'center' }}>PHQ-9 over 6 sessions ↓ 72%</div>
                </div>
              },
            ].map((step, i) => (
              <Reveal key={step.time} delay={i * 0.1}>
                <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'96px 1fr 1fr', gap:isMobile?16:32, marginBottom:40, alignItems:'start' }}>
                  {/* Time + dot */}
                  {!isMobile && <div style={{ textAlign:'right', paddingTop:4, position:'relative' }}>
                    <div style={{ fontSize:12, fontWeight:700, color:step.color }}>{step.time}</div>
                    <div style={{ position:'absolute', right:-9, top:6, width:18, height:18, borderRadius:'50%', background:step.color, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }}>
                      {React.cloneElement(step.icon, { width:10, height:10 })}
                    </div>
                  </div>}
                  {/* Story */}
                  <div style={{ paddingLeft:isMobile?0:24 }}>
                    {isMobile && <div style={{ fontSize:11, fontWeight:700, color:step.color, marginBottom:4 }}>{step.time}</div>}
                    <div style={{ fontSize:11, fontWeight:700, color:step.color, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>{step.label}</div>
                    <div style={{ fontSize:14, color:S.textSub, lineHeight:1.7, marginBottom:10 }}>{step.story}</div>
                    <div style={{ fontSize:13, fontWeight:600, color:S.navy, lineHeight:1.5, padding:'10px 14px', background:step.bg, borderRadius:8, border:`1px solid ${step.color}20` }}>{step.outcome}</div>
                  </div>
                  {/* Visual */}
                  <div>{step.visual}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 8 — FEATURE CARDS (Headspace-style) ═══ */}
      <section style={{ background:S.navy, padding:isMobile?'80px 24px':'120px 80px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <Reveal>
            <div style={{ textAlign:'center', marginBottom:64 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#93C5FD', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16 }}>Platform Modules</div>
              <h2 style={{ fontSize:isMobile?32:56, fontWeight:700, color:'#fff', letterSpacing:'-0.04em', margin:0, lineHeight:1.05 }}>Every feature designed<br/>around clinical outcomes.</h2>
            </div>
          </Reveal>
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(3,1fr)', gap:16, marginBottom:16 }}>
            {[
              {
                label:'Assessment Intelligence', color:'#1D4ED8', bg:'rgba(29,78,216,0.12)',
                tag:'16 instruments',
                desc:'Adaptive PHQ-9, GAD-7, PCL-5, Big Five and 12 more. AI selects questions based on your concerns. 3–25 minutes.',
                cta:'Start Assessment',
                illustration:<svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <circle cx="40" cy="40" r="32" stroke="#1D4ED8" strokeWidth="1" strokeDasharray="4 4" opacity="0.4"/>
                  <circle cx="40" cy="40" r="20" stroke="#1D4ED8" strokeWidth="1" opacity="0.6"/>
                  <circle cx="40" cy="40" r="8" fill="#1D4ED8" opacity="0.9"/>
                  <line x1="40" y1="8" x2="40" y2="20" stroke="#1D4ED8" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
                  <line x1="40" y1="60" x2="40" y2="72" stroke="#1D4ED8" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
                  <line x1="8" y1="40" x2="20" y2="40" stroke="#1D4ED8" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
                  <line x1="60" y1="40" x2="72" y2="40" stroke="#1D4ED8" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
                </svg>,
              },
              {
                label:'Journal Intelligence', color:'#7C3AED', bg:'rgba(124,58,237,0.12)',
                tag:'NLP powered',
                desc:'Write freely. AI detects themes, emotions, and risk signals in real time. Journal entries become clinical intelligence.',
                cta:'Start Journaling',
                illustration:<svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <rect x="16" y="10" width="44" height="56" rx="6" stroke="#7C3AED" strokeWidth="1.5" opacity="0.4"/>
                  <rect x="20" y="14" width="36" height="48" rx="4" fill="#7C3AED" opacity="0.06"/>
                  <line x1="26" y1="26" x2="54" y2="26" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="26" y1="34" x2="54" y2="34" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="26" y1="42" x2="46" y2="42" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="60" cy="62" r="14" fill="#7C3AED" opacity="0.9"/>
                  <path d="M55 62l3.5 3.5L65 58" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>,
              },
              {
                label:'ACT Therapy Engine', color:'#0891B2', bg:'rgba(8,145,178,0.12)',
                tag:'6 processes · 16 exercises',
                desc:'Acceptance, defusion, values, committed action. Interactive exercises including Leaves on a Stream and Box Breathing.',
                cta:'Explore ACT',
                illustration:<svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <path d="M40 72C40 72 16 58 16 38C16 25.85 27.85 16 40 16C52.15 16 64 25.85 64 38C64 58 40 72 40 72Z" stroke="#0891B2" strokeWidth="1.5" opacity="0.4"/>
                  <path d="M40 58C40 58 24 50 24 38C24 31.37 31.37 26 40 26C48.63 26 56 31.37 56 38C56 50 40 58 40 58Z" stroke="#0891B2" strokeWidth="1.5" opacity="0.6"/>
                  <circle cx="40" cy="38" r="8" fill="#0891B2" opacity="0.9"/>
                  <line x1="40" y1="16" x2="40" y2="30" stroke="#0891B2" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6"/>
                </svg>,
              },
              {
                label:'Crisis Detection', color:'#DC2626', bg:'rgba(220,38,38,0.1)',
                tag:'Real-time · 94% sensitivity',
                desc:'PHQ-9 Item 9, C-SSRS, and journal sentiment monitored continuously. Instant alerts to psychologist and hospital admin.',
                cta:'See How It Works',
                illustration:<svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <path d="M40 8s-24 16-24 36c0 13.25 10.75 24 24 24s24-10.75 24-24C64 24 40 8 40 8z" stroke="#DC2626" strokeWidth="1.5" opacity="0.3" fill="#DC2626" fillOpacity="0.06"/>
                  <path d="M40 20s-12 8-12 24c0 6.63 5.37 12 12 12s12-5.37 12-12c0-16-12-24-12-24z" stroke="#DC2626" strokeWidth="1.5" opacity="0.5"/>
                  <path d="M36 40l2 2 6-8" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>,
              },
              {
                label:'Sleep & Recovery', color:'#7C3AED', bg:'rgba(124,58,237,0.1)',
                tag:'ISI-7 · WHO-5',
                desc:'Track sleep quality, energy levels, and recovery trends. ISI insomnia screening integrated with mood and anxiety data.',
                cta:'Track Sleep',
                illustration:<svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <path d="M68 44.58A30 30 0 0135.42 12C22.55 12 10 22.85 10 36C10 50.36 21.64 62 36 62C49.15 62 60 50.55 60 37.68 61.58 39.88 62 42.18 62 44.58z" stroke="#7C3AED" strokeWidth="1.5" opacity="0.4" fill="#7C3AED" fillOpacity="0.06"/>
                  <circle cx="56" cy="22" r="4" fill="#7C3AED" opacity="0.7"/>
                  <circle cx="66" cy="14" r="2.5" fill="#7C3AED" opacity="0.4"/>
                  <circle cx="68" cy="28" r="2" fill="#7C3AED" opacity="0.3"/>
                  <circle cx="48" cy="10" r="1.5" fill="#7C3AED" opacity="0.3"/>
                </svg>,
              },
              {
                label:'Hospital Analytics', color:'#059669', bg:'rgba(5,150,105,0.1)',
                tag:'NABH · 18 modules',
                desc:'Population mental health analytics, NABH compliance reporting, OPD/IPD management, and crisis escalation workflows.',
                cta:'Book Hospital Demo',
                illustration:<svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <rect x="10" y="20" width="60" height="46" rx="6" stroke="#059669" strokeWidth="1.5" opacity="0.4"/>
                  <path d="M10 32h60" stroke="#059669" strokeWidth="1" opacity="0.3"/>
                  <rect x="20" y="42" width="8" height="16" rx="2" fill="#059669" opacity="0.4"/>
                  <rect x="36" y="36" width="8" height="22" rx="2" fill="#059669" opacity="0.6"/>
                  <rect x="52" y="30" width="8" height="28" rx="2" fill="#059669" opacity="0.9"/>
                  <polyline points="24 42 40 36 56 30" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
                </svg>,
              },
            ].map((card, i) => (
              <Reveal key={card.label} delay={i * 0.08}>
                <div style={{ background:card.bg, borderRadius:20, padding:28, border:`1px solid ${card.color}25`, cursor:'pointer', transition:'all 0.2s', height:'100%', boxSizing:'border-box', position:'relative', overflow:'hidden' }}
                  onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.borderColor=`${card.color}60`; }}
                  onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor=`${card.color}25`; }}>
                  {/* Background illustration */}
                  <div style={{ position:'absolute', right:16, bottom:16, opacity:0.25 }}>{card.illustration}</div>
                  <div style={{ fontSize:10, fontWeight:700, color:card.color, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>{card.label}</div>
                  <div style={{ fontSize:11, fontWeight:600, color:card.color, background:`${card.color}20`, padding:'2px 9px', borderRadius:100, display:'inline-block', marginBottom:14 }}>{card.tag}</div>
                  <div style={{ fontSize:14, color:'rgba(255,255,255,0.7)', lineHeight:1.65, marginBottom:20, maxWidth:220 }}>{card.desc}</div>
                  <div style={{ fontSize:12, fontWeight:600, color:card.color, display:'flex', alignItems:'center', gap:5 }}>
                    {card.cta}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 9 — INTERACTIVE PRODUCT TOUR ═══ */}
      <section style={{ background:S.bg2, padding:isMobile?'80px 24px':'120px 80px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <Reveal>
            <div style={{ textAlign:'center', marginBottom:56 }}>
              <div style={{ fontSize:13, fontWeight:600, color:S.blue, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16 }}>Product Tour</div>
              <h2 style={{ fontSize:isMobile?32:56, fontWeight:700, color:S.navy, letterSpacing:'-0.04em', margin:'0 0 16px', lineHeight:1.05 }}>See PsycheFlow<br/>in action.</h2>
              <p style={{ fontSize:18, color:S.textSub, maxWidth:480, margin:'0 auto' }}>Click each step to explore the product.</p>
            </div>
          </Reveal>
          {(() => {
            const [tourStep, setTourStep] = React.useState(0);
            const steps = [
              {
                label:'Patient Assessment', icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
                color:'#1D4ED8',
                preview:<div style={{ background:S.bg, borderRadius:14, padding:24 }}>
                  <div style={{ fontSize:11, color:S.muted, marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Adaptive Assessment · PHQ-9</div>
                  <div style={{ fontSize:18, fontWeight:600, color:S.navy, marginBottom:20, lineHeight:1.4 }}>Feeling down, depressed, or hopeless?</div>
                  <div style={{ display:'grid', gap:8 }}>
                    {['Not at all','Several days','More than half the days','Nearly every day'].map((opt,j)=>(
                      <div key={opt} style={{ padding:'12px 16px', borderRadius:10, border:`1.5px solid ${j===2?S.blue:S.border}`, background:j===2?S.lightBlue:'#fff', fontSize:14, color:j===2?S.blue:S.muted, fontWeight:j===2?600:400, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        {opt}
                        {j===2 && <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke={S.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop:16, height:4, borderRadius:2, background:S.border }}>
                    <div style={{ height:4, borderRadius:2, background:S.blue, width:'45%' }}/>
                  </div>
                  <div style={{ fontSize:11, color:S.muted, marginTop:4 }}>45% complete · ~8 questions remaining</div>
                </div>,
                desc:'16 validated instruments. AI selects only relevant questions based on your concerns. Average completion: 8 minutes.'
              },
              {
                label:'AI Pre-Session Brief', icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9.5 2A2.5 2.5 0 007 4.5v1A2.5 2.5 0 004.5 8v1A2.5 2.5 0 002 11.5C2 13 3 14.3 4.5 14.8V17a5 5 0 005 5h5a5 5 0 005-5v-2.2c1.5-.5 2.5-1.8 2.5-3.3A2.5 2.5 0 0019.5 9V8A2.5 2.5 0 0017 5.5v-1A2.5 2.5 0 0014.5 2h-5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
                color:'#7C3AED',
                preview:<div style={{ background:S.navy, borderRadius:14, padding:24 }}>
                  <div style={{ fontSize:10, color:'#93C5FD', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>AI Pre-Session Brief · Priya S. · 2:30 PM</div>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:14 }}>
                    {['Work stress','Sleep disruption','Burnout'].map(t=>(
                      <span key={t} style={{ fontSize:11, padding:'4px 12px', borderRadius:100, background:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.8)', border:'1px solid rgba(255,255,255,0.12)' }}>{t}</span>
                    ))}
                  </div>
                  <div style={{ fontSize:14, color:'rgba(255,255,255,0.8)', lineHeight:1.7, marginBottom:16 }}>PHQ-9 improved 18→14 over 3 sessions. Primary stressor: work boundary issues. Sleep onset delayed. Suggest: behavioural activation + sleep hygiene protocol.</div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                    {[['PHQ-9','14','↓ Improving'],['GAD-7','11','Stable'],['Risk','Medium','Flagged']].map(([l,v,s])=>(
                      <div key={l} style={{ background:'rgba(255,255,255,0.06)', borderRadius:8, padding:'8px 10px' }}>
                        <div style={{ fontSize:9, color:'rgba(255,255,255,0.4)', marginBottom:2 }}>{l}</div>
                        <div style={{ fontSize:16, fontWeight:700, color:'#fff' }}>{v}</div>
                        <div style={{ fontSize:9, color:'#93C5FD' }}>{s}</div>
                      </div>
                    ))}
                  </div>
                </div>,
                desc:'Auto-generated before every session. PHQ trends, journal themes, risk indicators, and suggested session focus — all in one brief.'
              },
              {
                label:'SOAP Note Generation', icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                color:'#059669',
                preview:<div style={{ background:S.bg, borderRadius:14, padding:24 }}>
                  <div style={{ fontSize:11, color:S.muted, marginBottom:14, textTransform:'uppercase', letterSpacing:'0.06em' }}>Generated SOAP Note · 2 min after session</div>
                  {[['S','#1D4ED8','Patient reports improved sleep (6-7 hrs) and reduced work anxiety. "I used breathing techniques during a stressful meeting."'],['O','#7C3AED','Affect brighter. PHQ-9: 11 (↓ from 14). Engaged, eye contact maintained. No SI/HI.'],['A','#059669','MDD moderate — improving. Good ACT response.'],['P','#D97706','Continue weekly. Introduce values clarification. Reassess PHQ-9 in 2 weeks.']].map(([l,c,text])=>(
                    <div key={l} style={{ display:'flex', gap:12, marginBottom:12 }}>
                      <div style={{ width:28, height:28, borderRadius:7, background:c, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, flexShrink:0 }}>{l}</div>
                      <div style={{ fontSize:13, color:S.textSub, lineHeight:1.6, paddingTop:4 }}>{text}</div>
                    </div>
                  ))}
                </div>,
                desc:'Session transcript to structured SOAP note in under 2 minutes. DAPA, BIRP, and DAP formats also supported.'
              },
              {
                label:'Hospital Dashboard', icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                color:'#DC2626',
                preview:<div style={{ background:S.bg, borderRadius:14, padding:20 }}>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:12 }}>
                    {[['24','#1D4ED8','OPD Today'],['3','#DC2626','High Risk'],['8','#7C3AED','Admitted'],['94%','#059669','NABH']].map(([v,c,l])=>(
                      <div key={l} style={{ background:'#fff', borderRadius:8, padding:'10px', textAlign:'center', border:`1px solid ${S.border}` }}>
                        <div style={{ fontSize:18, fontWeight:700, color:c }}>{v}</div>
                        <div style={{ fontSize:9, color:S.muted }}>{l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background:'#FEF2F2', border:`1px solid #FECACA`, borderRadius:8, padding:'10px 12px', marginBottom:10 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:'#DC2626' }}>Crisis Alert · BED-04 · PHQ-9 crossed 20</div>
                    <div style={{ fontSize:10, color:S.textSub }}>Psychologist Mehta notified · 3 min ago</div>
                  </div>
                  {[['Priya S.','OPD-12',5,'↓',S.success],['Rahul M.','BED-04',22,'↑↑',S.danger]].map(([n,id,phq,t,c])=>(
                    <div key={n} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:`1px solid ${S.border}`, fontSize:12 }}>
                      <span style={{ color:S.navy, fontWeight:600 }}>{n} · {id}</span>
                      <span style={{ color:c, fontWeight:700 }}>PHQ {phq} {t}</span>
                    </div>
                  ))}
                </div>,
                desc:'18 modules covering OPD, IPD, EHR, pharmacy, billing, NABH compliance, telemedicine, and population analytics.'
              },
            ];
            return (
              <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:32, alignItems:'start' }}>
                <div>
                  {steps.map((step, i)=>(
                    <div key={step.label} onClick={()=>setTourStep(i)}
                      style={{ padding:'16px 20px', borderRadius:12, marginBottom:8, cursor:'pointer', border:`1px solid ${tourStep===i?step.color:S.border}`, background:tourStep===i?`${step.color}08`:S.white, transition:'all 0.15s' }}>
                      <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:tourStep===i?10:0 }}>
                        <div style={{ width:32, height:32, borderRadius:8, background:tourStep===i?step.color:S.bg, display:'flex', alignItems:'center', justifyContent:'center', color:tourStep===i?'#fff':S.muted, transition:'all 0.15s' }}>{step.icon}</div>
                        <div style={{ fontSize:14, fontWeight:tourStep===i?700:500, color:tourStep===i?S.navy:S.muted }}>{step.label}</div>
                        <div style={{ marginLeft:'auto', width:20, height:20, borderRadius:'50%', background:tourStep===i?step.color:'transparent', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          {tourStep===i && <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                      </div>
                      {tourStep===i && <div style={{ fontSize:13, color:S.muted, lineHeight:1.6, paddingLeft:44 }}>{step.desc}</div>}
                    </div>
                  ))}
                </div>
                <div style={{ position:'sticky', top:80 }}>
                  <div style={{ boxShadow:'0 20px 60px rgba(0,0,0,0.12)', borderRadius:16, overflow:'hidden', border:`1px solid ${S.border}` }}>
                    <div style={{ background:'#1E293B', padding:'10px 14px', display:'flex', gap:6 }}>
                      {['#ff5f57','#febc2e','#28c840'].map(c=><div key={c} style={{ width:10, height:10, borderRadius:'50%', background:c }}/>)}
                    </div>
                    <div style={{ padding:20, background:S.bg2 }}>
                      {steps[tourStep].preview}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* ═══ SECTION 10 — PRICING ═══ */}
      <section id="pricing" style={{ background:S.bg, padding:isMobile?'80px 24px':'120px 80px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <Reveal>
            <div style={{ textAlign:'center', marginBottom:64 }}>
              <div style={{ fontSize:13, fontWeight:600, color:S.blue, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16 }}>Pricing</div>
              <h2 style={{ fontSize:isMobile?32:56, fontWeight:700, color:S.navy, letterSpacing:'-0.04em', margin:'0 0 16px', lineHeight:1.05 }}>Simple, transparent pricing.</h2>
              <p style={{ fontSize:18, color:S.textSub, maxWidth:480, margin:'0 auto' }}>Start free. Scale as you grow. No setup fees.</p>
            </div>
          </Reveal>
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(3,1fr)', gap:20, marginBottom:40 }}>
            {[
              {
                name:'Patient', price:'Free', period:'forever', color:S.blue, highlight:false,
                desc:"For individuals managing their mental health.",
                features:['16 validated assessments','AI-powered insights','Journal with NLP analysis','ACT therapy exercises','Mood & sleep tracking','Crisis support resources'],
                cta:'Get Started Free',
              },
              {
                name:'Psychologist', price:'₹999', period:'per month', color:'#7C3AED', highlight:true,
                desc:"For mental health professionals.",
                features:['Everything in Patient','AI pre-session briefs','SOAP/DAP note generation','Treatment planning tools','Secure telemedicine','Up to 50 patients','Population analytics'],
                cta:"Start Free — 14 Days",
                badge:'Most Popular',
              },
              {
                name:'Hospital', price:'Custom', period:'per month', color:'#059669', highlight:false,
                desc:"For hospitals and multi-practitioner clinics.",
                features:['Everything in Psychologist','18 clinical modules','NABH compliance reporting','Unlimited patients & staff','OPD/IPD management','EHR integration','Dedicated support'],
                cta:'Book Demo',
              },
            ].map(plan=>(
              <Reveal key={plan.name}>
                <div style={{ background:plan.highlight?S.navy:S.white, borderRadius:20, padding:28, border:`1px solid ${plan.highlight?S.blue:S.border}`, position:'relative', height:'100%', boxSizing:'border-box', transition:'transform 0.2s, box-shadow 0.2s' }}
                  onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 16px 40px rgba(0,0,0,0.1)'; }}
                  onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; }}>
                  {plan.badge && <div style={{ position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)', background:plan.color, color:'#fff', fontSize:11, fontWeight:700, padding:'4px 16px', borderRadius:100 }}>{plan.badge}</div>}
                  <div style={{ fontSize:12, fontWeight:700, color:plan.color, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>{plan.name}</div>
                  <div style={{ display:'flex', alignItems:'baseline', gap:6, marginBottom:8 }}>
                    <span style={{ fontSize:36, fontWeight:700, color:plan.highlight?'#fff':S.navy, letterSpacing:'-0.04em' }}>{plan.price}</span>
                    <span style={{ fontSize:13, color:plan.highlight?'rgba(255,255,255,0.5)':S.muted }}>{plan.period}</span>
                  </div>
                  <div style={{ fontSize:13, color:plan.highlight?'rgba(255,255,255,0.6)':S.muted, marginBottom:24, lineHeight:1.5 }}>{plan.desc}</div>
                  <div style={{ marginBottom:28 }}>
                    {plan.features.map(f=>(
                      <div key={f} style={{ display:'flex', gap:10, marginBottom:10, alignItems:'flex-start' }}>
                        <div style={{ width:18, height:18, borderRadius:'50%', background:`${plan.color}20`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke={plan.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                        <span style={{ fontSize:13, color:plan.highlight?'rgba(255,255,255,0.8)':S.textSub, lineHeight:1.4 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <button style={{ width:'100%', padding:'13px', background:plan.highlight?plan.color:S.blue, color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                    {plan.cta}
                  </button>
                </div>
              </Reveal>
            ))}
          </div>
          {/* Enterprise note */}
          <div style={{ textAlign:'center', padding:'24px', background:S.bg2, borderRadius:16, border:`1px solid ${S.border}` }}>
            <div style={{ fontSize:15, fontWeight:600, color:S.navy, marginBottom:6 }}>Need an enterprise or government contract?</div>
            <div style={{ fontSize:13, color:S.muted, marginBottom:16 }}>Custom pricing for health systems, government hospitals, and insurance networks. FHIR integration available.</div>
            <button onClick={onHospitalLanding} style={{ padding:'10px 24px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
              Talk to Sales →
            </button>
          </div>
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
              { tag:'For Psychologists', h1:'Spend less time writing notes.', h2:'More time treating patients.', sub:'SOAP notes in 2 minutes. AI brief. Free for 14 days.', btn:"Start Free — 14 Days", action:onPsychLanding, primary:true },
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
