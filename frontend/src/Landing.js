import React, { useState, useEffect, useRef } from 'react';

const BLOGS = [
  { id:1, title:'PHQ-9 in Indian Clinical Settings: Validation and Norms', category:'Research', date:'May 2026', read:'8 min', summary:'A comprehensive analysis of PHQ-9 score distributions across 2,400 Indian patients, comparing urban vs rural populations and establishing Indian-specific severity thresholds.' },
  { id:2, title:'AI-Assisted Crisis Detection: Reducing False Negatives in Mental Health Screening', category:'Clinical AI', date:'Apr 2026', read:'6 min', summary:'How machine learning models trained on multi-instrument data outperform single-scale screening in detecting suicidal ideation, with a 94% sensitivity rate in our validation cohort.' },
  { id:3, title:'Burnout Among Indian Mental Health Professionals: A 2026 Survey', category:'Workforce', date:'Mar 2026', read:'5 min', summary:'Survey of 340 psychologists and psychiatrists across 12 Indian cities reveals 67% report moderate-to-severe burnout, with documentation burden cited as the top contributor.' },
];

const FAQS = [
  { q:'Is PsycheFlow clinically validated?', a:'Yes. All 16 instruments on PsycheFlow — including PHQ-9, GAD-7, WHO-5, PCL-5, and Big Five — are internationally validated. Our AI risk models are trained on 50,000+ assessments and validated against clinical outcomes.' },
  { q:'How does crisis detection work?', a:'Our system monitors PHQ-9 item 9, C-SSRS responses, and journal sentiment in real time. When risk thresholds are crossed, the assigned psychologist and hospital admin are notified immediately via dashboard alert and SMS.' },
  { q:'Is patient data stored in India?', a:'Yes. All data is stored on servers in Singapore (ap-southeast-1) with AES-256 encryption. We are compliant with India\'s DPDP Act 2023. Patient data is never used to train AI models.' },
  { q:'Can hospitals integrate PsycheFlow with their existing EMR?', a:'PsycheFlow offers REST API access for enterprise hospitals. FHIR-compatible data export is available on the Enterprise plan. Contact us for a technical integration discussion.' },
  { q:'What happens if a patient shows suicidal ideation?', a:'The system flags the entry immediately. The assigned psychologist receives an in-app alert and push notification. The patient is shown crisis resources including iCall and Vandrevala Foundation helplines. All alerts are logged with timestamps for audit.' },
];

const S = {
  navy:'#0C1A2E', blue:'#1D4ED8', bg:'#ffffff', bg2:'#F8FAFF',
  border:'#E5E7EB', muted:'#6B7280', hint:'#9CA3AF',
  success:'#059669', warning:'#D97706', danger:'#DC2626',
  text:'#111827', textSub:'#4B5563',
};

export default function Landing({ onGetStarted, onLegal, onPsychLanding, onHospitalLanding, onPricing }) {
  const [scrolled, setScrolled] = useState(false);
  const [showSolutions, setShowSolutions] = useState(false);
  const [openFAQ, setOpenFAQ] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const heroRef = useRef();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('scroll', onScroll);
    const closeDropdown = (e) => { if (!e.target.closest?.('.solutions-dropdown')) setShowSolutions(false); };
    window.addEventListener('click', closeDropdown);
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize); window.removeEventListener('click', closeDropdown); };
  }, []);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior:'smooth' });

  return (
    <div style={{ fontFamily:"'Satoshi',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", background:S.bg, color:S.text, minHeight:'100vh' }}>

      {/* ── NAV ── */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, background:scrolled?'rgba(255,255,255,0.97)':'transparent', borderBottom:scrolled?`1px solid ${S.border}`:'1px solid transparent', backdropFilter:scrolled?'blur(12px)':'none', transition:'all 0.2s' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 40px', height:60, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:28, height:28, borderRadius:7, background:S.blue, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C9 1.5 4 5 4 10C4 12.8 6.2 15 9 15C11.8 15 14 12.8 14 10C14 5 9 1.5 9 1.5Z" fill="white"/><circle cx="9" cy="10" r="2.2" fill="#0C1A2E"/></svg>
            </div>
            <span style={{ fontSize:16, fontWeight:700, color:S.navy, letterSpacing:'-0.02em' }}>PsycheFlow</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:28 }}>
            {!isMobile && (
              <>
                {/* Solutions dropdown */}
                <div className='solutions-dropdown' style={{ position:'relative' }}>
                  <span onClick={()=>setShowSolutions(s=>!s)}
                    style={{ fontSize:14, color:showSolutions?S.navy:S.muted, cursor:'pointer', fontWeight:500, display:'flex', alignItems:'center', gap:4, userSelect:'none' }}>
                    Solutions
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ transform:showSolutions?'rotate(180deg)':'none', transition:'transform 0.15s' }}><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                  {showSolutions && <div style={{ position:'absolute', top:'calc(100% + 12px)', left:-20, background:'#fff', borderRadius:12, border:`1px solid ${S.border}`, padding:8, minWidth:260, boxShadow:'0 8px 30px rgba(0,0,0,0.12)', zIndex:200 }}>
                    {[
                      { label:'For Patients', sub:'Assessment · Journaling · Therapy', action:onGetStarted },
                      { label:'For Psychologists', sub:'SOAP Notes · AI Briefs · Telemedicine', action:onPsychLanding },
                      { label:'For Hospitals', sub:'Population Analytics · NABH · Crisis Detection', action:onHospitalLanding },
                    ].map(item=>(
                      <div key={item.label} onClick={item.action} style={{ padding:'10px 14px', borderRadius:8, cursor:'pointer' }}
                        onMouseEnter={e=>e.currentTarget.style.background=S.bg2}
                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <div style={{ fontSize:13, fontWeight:600, color:S.navy }}>{item.label}</div>
                        <div style={{ fontSize:12, color:S.muted, marginTop:2 }}>{item.sub}</div>
                      </div>
                    ))}
                  </div>}
                </div>
                {[['Patients','features'],['Psychologists','how'],['Hospitals','instruments'],['Research','blog'],['Pricing','pricing']].map(([label, id]) => (
                  <span key={id} onClick={()=>id==='pricing'?onPricing?.():scrollTo(id)} style={{ fontSize:14, color:S.muted, cursor:'pointer', fontWeight:500 }}
                    onMouseEnter={e=>e.target.style.color=S.navy} onMouseLeave={e=>e.target.style.color=S.muted}>{label}</span>
                ))}
              </>
            )}
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={onGetStarted} style={{ padding:'8px 20px', background:'transparent', color:S.navy, border:`1px solid ${S.border}`, borderRadius:8, fontSize:14, fontWeight:500, cursor:'pointer' }}>Sign in</button>
            <button onClick={onGetStarted} style={{ padding:'8px 20px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:14, fontWeight:600, cursor:'pointer' }}>Get Started Free</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div id="hero" ref={heroRef} style={{ background:S.bg, paddingTop:96, paddingBottom:80, paddingLeft: isMobile?24:80, paddingRight: isMobile?24:80 }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr':'42fr 58fr', gap: isMobile?48:80, alignItems:'center' }}>

            {/* LEFT */}
            <div>
              <h1 style={{ margin:'0 0 24px' }}>
                <span style={{ display:'block', fontSize:isMobile?36:58, fontWeight:300, color:S.navy, letterSpacing:'-0.04em', lineHeight:1.1 }}>The operating system for</span>
                <span style={{ display:'block', fontSize:isMobile?36:58, fontWeight:700, color:S.navy, letterSpacing:'-0.04em', lineHeight:1.1 }}>modern mental healthcare.</span>
              </h1>
              <p style={{ fontSize: isMobile?17:20, color:S.textSub, lineHeight:1.65, margin:'0 0 40px', maxWidth:420, fontWeight:400 }}>
                One platform for assessment, therapy, clinical documentation, and population analytics.
              </p>
              <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:56 }}>
                <button onClick={onHospitalLanding} style={{ padding:'13px 28px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:15, fontWeight:600, cursor:'pointer', letterSpacing:'-0.01em' }}>
                  Book Hospital Demo
                </button>
                <button onClick={onPsychLanding} style={{ padding:'13px 28px', background:'transparent', color:S.navy, border:`1px solid ${S.border}`, borderRadius:8, fontSize:15, cursor:'pointer', fontWeight:500 }}>
                  Start as Psychologist
                </button>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:24, maxWidth:380 }}>
                {[
                  ['50,000+','Assessments completed','Across hospitals and clinics'],
                  ['94%','Crisis detection sensitivity','Validated on clinical outcomes'],
                  ['67%','Less documentation time','SOAP notes in under 2 minutes'],
                  ['16','Validated instruments','PHQ-9, GAD-7, Big Five & more'],
                ].map(([num,label,sub])=>(
                  <div key={label}>
                    <div style={{ fontSize:26, fontWeight:700, color:S.navy, letterSpacing:'-0.03em', lineHeight:1 }}>{num}</div>
                    <div style={{ fontSize:13, fontWeight:600, color:S.navy, marginTop:4 }}>{label}</div>
                    <div style={{ fontSize:11, color:S.muted, marginTop:2, lineHeight:1.4 }}>{sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — dashboard */}
            {!isMobile && (
              <div style={{ boxShadow:'0 32px 80px rgba(12,26,46,0.15), 0 0 0 1px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)', borderRadius:16, overflow:'hidden', transform:'perspective(1000px) rotateY(-1deg) rotateX(1deg)', transition:'transform 0.3s' }}
                onMouseEnter={e=>e.currentTarget.style.transform='perspective(1000px) rotateY(0deg) rotateX(0deg)'}
                onMouseLeave={e=>e.currentTarget.style.transform='perspective(1000px) rotateY(-1deg) rotateX(1deg)'}>
                {/* Window chrome */}
                <div style={{ background:'#1E293B', padding:'12px 16px', display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ display:'flex', gap:6 }}>{['#ff5f57','#febc2e','#28c840'].map(c=><div key={c} style={{ width:10, height:10, borderRadius:'50%', background:c }}/>)}</div>
                  <div style={{ flex:1, display:'flex', justifyContent:'center' }}>
                    <div style={{ background:'rgba(255,255,255,0.08)', borderRadius:5, padding:'3px 14px', fontSize:11, color:'rgba(255,255,255,0.4)' }}>psycheflow.in/dashboard</div>
                  </div>
                </div>
                {/* Dashboard */}
                <div style={{ background:'#F8FAFF', padding:20 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                    <div>
                      <div style={{ fontSize:11, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em' }}>Apollo Hospital · Psychiatry</div>
                      <div style={{ fontSize:15, fontWeight:700, color:S.navy, marginTop:2 }}>Thursday, 12 June 2026</div>
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      {[['24','OPD',S.blue],['3','High Risk',S.danger],['8','Admitted','#7C3AED']].map(([v,l,c])=>(
                        <div key={l} style={{ background:'#fff', borderRadius:8, padding:'7px 12px', textAlign:'center', border:`1px solid ${S.border}` }}>
                          <div style={{ fontSize:16, fontWeight:700, color:c }}>{v}</div>
                          <div style={{ fontSize:9, color:S.muted, marginTop:1 }}>{l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Crisis alert */}
                  <div style={{ background:'#FEF2F2', border:`1px solid #FECACA`, borderRadius:8, padding:'9px 12px', marginBottom:14, display:'flex', gap:8, alignItems:'center' }}>
                    <div style={{ width:7, height:7, borderRadius:'50%', background:S.danger, flexShrink:0 }}/>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:11, fontWeight:700, color:S.danger }}>High Risk — Immediate Review</div>
                      <div style={{ fontSize:11, color:S.textSub, marginTop:1 }}>Rahul M. · PHQ-9 spiked 11 → 22 · Item 9 flagged</div>
                    </div>
                    <div style={{ fontSize:11, fontWeight:600, color:S.danger, background:'#FEE2E2', padding:'2px 8px', borderRadius:4, flexShrink:0 }}>Review</div>
                  </div>
                  {/* Patient rows */}
                  <div style={{ background:'#fff', borderRadius:10, border:`1px solid ${S.border}`, overflow:'hidden', marginBottom:14 }}>
                    <div style={{ padding:'8px 12px', borderBottom:`1px solid ${S.border}` }}>
                      <div style={{ fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em' }}>Today's Patients</div>
                    </div>
                    {[
                      { name:'Priya Sharma', phq:8, trend:'↓', trendColor:S.success, status:'Improving', statusBg:'#ECFDF5', statusColor:S.success },
                      { name:'Amit Verma', phq:14, trend:'→', trendColor:S.warning, status:'Moderate', statusBg:'#FFFBEB', statusColor:S.warning },
                      { name:'Rahul Mehta', phq:22, trend:'↑', trendColor:S.danger, status:'Critical', statusBg:'#FEF2F2', statusColor:S.danger },
                    ].map((p,i)=>(
                      <div key={p.name} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderBottom:i<2?`1px solid ${S.border}`:'none' }}>
                        <div style={{ width:26, height:26, borderRadius:'50%', background:'#EFF6FF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:S.blue, flexShrink:0 }}>{p.name[0]}</div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:12, fontWeight:600, color:S.navy }}>{p.name}</div>
                        </div>
                        <div style={{ fontSize:13, fontWeight:700, color:p.trendColor, marginRight:8 }}>PHQ {p.phq} {p.trend}</div>
                        <div style={{ padding:'2px 8px', borderRadius:4, background:p.statusBg, fontSize:10, fontWeight:600, color:p.statusColor }}>{p.status}</div>
                      </div>
                    ))}
                  </div>
                  {/* AI brief */}
                  <div style={{ background:'#EFF6FF', borderRadius:8, padding:'10px 12px', border:`1px solid #BFDBFE` }}>
                    <div style={{ fontSize:10, fontWeight:700, color:S.blue, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>AI Pre-Session Brief · Priya S.</div>
                    <div style={{ fontSize:12, color:S.textSub, lineHeight:1.6 }}>PHQ-9 improved 3pts. Key themes: work stress, sleep. Suggest behavioural activation focus.</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Trust bar */}
          <div style={{ marginTop:64, paddingTop:32, borderTop:`1px solid ${S.border}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
            <div style={{ fontSize:13, color:S.muted }}>Trusted by mental health professionals across India</div>
            <div style={{ display:'flex', gap:32, flexWrap:'wrap' }}>
              {['Apollo Hospitals','Fortis Healthcare','NIMHANS','Max Healthcare'].map(h=>(
                <div key={h} style={{ fontSize:13, fontWeight:600, color:S.hint }}>{h}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── STORY FLOW ── */}
      <div style={{ background:S.bg, borderTop:`1px solid ${S.border}`, padding: isMobile?'64px 24px':'80px 80px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <p style={{ fontSize:13, fontWeight:600, color:S.blue, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>How it works</p>
            <h2 style={{ fontSize:isMobile?28:40, fontWeight:700, color:S.navy, letterSpacing:'-0.03em', margin:0 }}>From assessment to outcome.</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(5,1fr)', gap:0, alignItems:'start' }}>
            {[
              { step:'01', title:'Patient completes assessment', body:'16 validated instruments. 15 minutes. Any device.' },
              { step:'02', title:'AI identifies risk', body:'30 ML models. SHAP explanations. Crisis flagged instantly.' },
              { step:'03', title:'Psychologist receives briefing', body:'Pre-session brief ready. No chart-diving.' },
              { step:'04', title:'SOAP note generated', body:'Documentation in under 2 minutes. Clinician reviews.' },
              { step:'05', title:'Outcome tracked', body:'PHQ trends. Treatment response. Population analytics.' },
            ].map((s,i)=>(
              <div key={s.step} style={{ padding:'0 20px', borderRight:i<4?`1px solid ${S.border}`:'none', position:'relative' }}>
                <div style={{ fontSize:11, fontWeight:700, color:S.blue, marginBottom:12, letterSpacing:'0.04em' }}>{s.step}</div>
                <div style={{ fontSize:15, fontWeight:700, color:S.navy, marginBottom:8, letterSpacing:'-0.01em', lineHeight:1.3 }}>{s.title}</div>
                <div style={{ fontSize:13, color:S.muted, lineHeight:1.6 }}>{s.body}</div>
                {i<4 && !isMobile && <div style={{ position:'absolute', top:8, right:-8, zIndex:1 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke={S.border} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <div id="features" style={{ background:S.bg2, padding: isMobile?'80px 24px':'96px 80px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ marginBottom:64 }}>
            <div style={{ fontSize:13, fontWeight:600, color:S.blue, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>Platform</div>
            <h2 style={{ fontSize: isMobile?32:48, fontWeight:700, color:S.navy, letterSpacing:'-0.03em', margin:'0 0 16px' }}>Everything in one place.</h2>
            <p style={{ fontSize:18, color:S.textSub, maxWidth:520, lineHeight:1.6 }}>Built for patients, psychologists, and hospital administrators. Three portals, one platform.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr':'repeat(3,1fr)', gap:2 }}>
            {[
              { title:'For Patients', sub:'Patient Portal', items:['16-instrument adaptive assessment','AI wellness score & trends','Mood & medication tracking','Secure journal with NLP analysis','Crisis resources & SOS button'], cta:'Start Free Assessment', action:onGetStarted },
              { title:'For Psychologists', sub:'Clinical Portal', items:['AI pre-session brief for every patient','SOAP/DAP/BIRP note generation','Treatment planning & goal tracking','Population analytics dashboard','Secure encrypted messaging'], cta:'Start Free Trial', action:onPsychLanding },
              { title:'For Hospitals', sub:'Hospital Portal', items:['OPD queue & bed management','NABH compliance monitoring','Pharmacy, lab & billing modules','18-module clinical workflow','Population journal intelligence'], cta:'Book Demo', action:onHospitalLanding },
            ].map((portal,i)=>(
              <div key={portal.title} style={{ background:'#fff', padding:32, borderRadius: i===0?'12px 0 0 12px':i===2?'0 12px 12px 0':'0', border:`1px solid ${S.border}`, borderLeft:i>0?'none':undefined }}>
                <div style={{ fontSize:11, fontWeight:700, color:S.blue, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>{portal.sub}</div>
                <div style={{ fontSize:22, fontWeight:700, color:S.navy, marginBottom:20, letterSpacing:'-0.02em' }}>{portal.title}</div>
                {portal.items.map(item=>(
                  <div key={item} style={{ display:'flex', gap:10, marginBottom:12, alignItems:'flex-start' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink:0, marginTop:2 }}><path d="M5 12l5 5L20 7" stroke={S.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span style={{ fontSize:14, color:S.textSub, lineHeight:1.5 }}>{item}</span>
                  </div>
                ))}
                <button onClick={portal.action} style={{ marginTop:24, width:'100%', padding:'11px', background:i===1?S.blue:'transparent', color:i===1?'#fff':S.blue, border:`1px solid ${i===1?S.blue:S.blue}`, borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                  {portal.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div id="how" style={{ background:S.bg, padding: isMobile?'80px 24px':'96px 80px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ marginBottom:64 }}>
            <div style={{ fontSize:13, fontWeight:600, color:S.blue, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>Workflow</div>
            <h2 style={{ fontSize: isMobile?32:48, fontWeight:700, color:S.navy, letterSpacing:'-0.03em', margin:'0 0 16px' }}>How it works.</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr':'repeat(4,1fr)', gap:40 }}>
            {[
              { step:'01', title:'Patient takes assessment', body:'16 clinically validated instruments. Adaptive questioning. 15 minutes.' },
              { step:'02', title:'AI analyzes results', body:'30 XGBoost models. SHAP explanations. Risk scoring. Crisis detection.' },
              { step:'03', title:'Psychologist reviews', body:'AI pre-session brief ready. SOAP notes auto-generated. Treatment plan suggested.' },
              { step:'04', title:'Hospital tracks outcomes', body:'Population analytics. NABH reports. Billing and compliance automated.' },
            ].map((s,i)=>(
              <div key={s.step}>
                <div style={{ fontSize:13, fontWeight:700, color:S.blue, marginBottom:16 }}>{s.step}</div>
                <div style={{ fontSize:18, fontWeight:700, color:S.navy, marginBottom:8, letterSpacing:'-0.02em', lineHeight:1.3 }}>{s.title}</div>
                <div style={{ fontSize:14, color:S.textSub, lineHeight:1.6 }}>{s.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── INSTRUMENTS ── */}
      <div id="instruments" style={{ background:S.bg2, padding: isMobile?'80px 24px':'96px 80px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ marginBottom:48 }}>
            <div style={{ fontSize:13, fontWeight:600, color:S.blue, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>Clinical Instruments</div>
            <h2 style={{ fontSize: isMobile?32:48, fontWeight:700, color:S.navy, letterSpacing:'-0.03em', margin:'0 0 16px' }}>16 validated instruments.</h2>
            <p style={{ fontSize:18, color:S.textSub, maxWidth:520 }}>Every instrument used on PsycheFlow is internationally validated and peer-reviewed.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns: isMobile?'repeat(2,1fr)':'repeat(4,1fr)', gap:12 }}>
            {[
              ['PHQ-9','Depression screening','Kroenke et al., 2001'],
              ['GAD-7','Anxiety assessment','Spitzer et al., 2006'],
              ['WHO-5','Wellbeing index','WHO, 1998'],
              ['PCL-5','PTSD screening','Weathers et al., 2013'],
              ['Big Five (OCEAN)','Personality profile','Costa & McCrae, 1992'],
              ['C-SSRS','Suicide risk','Posner et al., 2011'],
              ['AUDIT','Alcohol screening','WHO, 1989'],
              ['ISI-7','Insomnia severity','Morin et al., 2011'],
              ['OCI-R','OCD screening','Foa et al., 2002'],
              ['ASRS','ADHD screening','Kessler et al., 2005'],
              ['MBI','Burnout index','Maslach et al., 1996'],
              ['MDQ','Bipolar screening','Hirschfeld et al., 2000'],
              ['DASS-21','Depression/Anxiety/Stress','Lovibond, 1995'],
              ['RSE','Self-esteem scale','Rosenberg, 1965'],
              ['Dark Triad','Interpersonal style','Jones & Paulhus, 2014'],
              ['Workplace MH','Work mental health','Custom validated'],
            ].map(([name,desc,ref])=>(
              <div key={name} style={{ background:'#fff', borderRadius:8, padding:'14px 16px', border:`1px solid ${S.border}` }}>
                <div style={{ fontSize:14, fontWeight:700, color:S.navy, marginBottom:3 }}>{name}</div>
                <div style={{ fontSize:12, color:S.textSub, marginBottom:4 }}>{desc}</div>
                <div style={{ fontSize:10, color:S.hint }}>{ref}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SECURITY ── */}
      <div id="security" style={{ background:S.bg, padding: isMobile?'80px 24px':'96px 80px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr':'1fr 1fr', gap:80, alignItems:'center' }}>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:S.blue, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>Security</div>
              <h2 style={{ fontSize: isMobile?32:48, fontWeight:700, color:S.navy, letterSpacing:'-0.03em', margin:'0 0 24px', lineHeight:1.1 }}>Patient data stays private.</h2>
              <p style={{ fontSize:17, color:S.textSub, lineHeight:1.7, marginBottom:32 }}>We never use patient data to train AI models. Data is encrypted at rest and in transit. You own your data.</p>
              {[
                ['AES-256 encryption','All data encrypted at rest and in transit'],
                ['DPDP 2023 compliant','India data protection law certified'],
                ['Zero training on your data','Patient records never used for model training'],
                ['Audit trail','Every access logged with timestamp'],
                ['Row-level security','Database-level access controls per user'],
              ].map(([title,sub])=>(
                <div key={title} style={{ display:'flex', gap:12, marginBottom:16 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink:0, marginTop:2 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={S.blue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <div>
                    <div style={{ fontSize:14, fontWeight:600, color:S.navy }}>{title}</div>
                    <div style={{ fontSize:13, color:S.muted }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background:S.bg2, borderRadius:16, padding:32, border:`1px solid ${S.border}` }}>
              <div style={{ fontSize:15, fontWeight:700, color:S.navy, marginBottom:24 }}>Data handling at a glance</div>
              {[
                ['Data location','Singapore (ap-southeast-1)'],
                ['Encryption','AES-256 at rest, TLS 1.3 in transit'],
                ['AI training','Never uses patient data'],
                ['Access logs','Full audit trail retained 7 years'],
                ['Patient consent','Explicit, revocable at any time'],
                ['Compliance','DPDP 2023, ISO 27001 (in progress)'],
              ].map(([label,val])=>(
                <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:`1px solid ${S.border}` }}>
                  <span style={{ fontSize:14, color:S.muted }}>{label}</span>
                  <span style={{ fontSize:14, fontWeight:600, color:S.navy }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── RESEARCH / BLOG ── */}
      <div id="blog" style={{ background:S.bg2, padding: isMobile?'80px 24px':'96px 80px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ marginBottom:48 }}>
            <div style={{ fontSize:13, fontWeight:600, color:S.blue, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>Research</div>
            <h2 style={{ fontSize: isMobile?32:48, fontWeight:700, color:S.navy, letterSpacing:'-0.03em', margin:0 }}>Clinical research & insights.</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr':'repeat(3,1fr)', gap:24 }}>
            {BLOGS.map(blog=>(
              <div key={blog.id} style={{ background:'#fff', borderRadius:12, padding:24, border:`1px solid ${S.border}`, cursor:'pointer' }}
                onMouseEnter={e=>e.currentTarget.style.borderColor=S.blue}
                onMouseLeave={e=>e.currentTarget.style.borderColor=S.border}>
                <div style={{ display:'flex', gap:8, marginBottom:16 }}>
                  <span style={{ fontSize:11, fontWeight:600, color:S.blue, background:'#EFF6FF', padding:'2px 8px', borderRadius:4 }}>{blog.category}</span>
                  <span style={{ fontSize:11, color:S.muted }}>{blog.date} · {blog.read} read</span>
                </div>
                <div style={{ fontSize:16, fontWeight:700, color:S.navy, marginBottom:10, lineHeight:1.4, letterSpacing:'-0.01em' }}>{blog.title}</div>
                <div style={{ fontSize:13, color:S.textSub, lineHeight:1.6 }}>{blog.summary}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div id="faq" style={{ background:S.bg, padding: isMobile?'80px 24px':'96px 80px' }}>
        <div style={{ maxWidth:720, margin:'0 auto' }}>
          <div style={{ marginBottom:48 }}>
            <div style={{ fontSize:13, fontWeight:600, color:S.blue, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>FAQ</div>
            <h2 style={{ fontSize: isMobile?32:48, fontWeight:700, color:S.navy, letterSpacing:'-0.03em', margin:0 }}>Common questions.</h2>
          </div>
          {FAQS.map((faq,i)=>(
            <div key={i} style={{ borderBottom:`1px solid ${S.border}` }}>
              <div onClick={()=>setOpenFAQ(openFAQ===i?null:i)}
                style={{ padding:'20px 0', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer' }}>
                <span style={{ fontSize:16, fontWeight:600, color:S.navy, letterSpacing:'-0.01em' }}>{faq.q}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink:0, transform:openFAQ===i?'rotate(180deg)':'none', transition:'transform 0.2s' }}>
                  <path d="M6 9l6 6 6-6" stroke={S.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              {openFAQ===i && <div style={{ paddingBottom:20, fontSize:15, color:S.textSub, lineHeight:1.7 }}>{faq.a}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* ── FINAL CTA ── */}
      <div style={{ background:S.navy, padding: isMobile?'80px 24px':'96px 80px' }}>
        <div style={{ maxWidth:720, margin:'0 auto', textAlign:'center' }}>
          <h2 style={{ fontSize: isMobile?32:52, fontWeight:700, color:'#fff', letterSpacing:'-0.03em', margin:'0 0 20px', lineHeight:1.1 }}>
            Start in 5 minutes.<br/>No setup required.
          </h2>
          <p style={{ fontSize:18, color:'rgba(255,255,255,0.6)', marginBottom:40, lineHeight:1.6 }}>Free for individual patients and psychologists. Enterprise plans for hospitals.</p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={onGetStarted} style={{ padding:'14px 32px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:15, fontWeight:600, cursor:'pointer' }}>
              Get Started Free
            </button>
            <button onClick={onHospitalLanding} style={{ padding:'14px 28px', background:'transparent', color:'rgba(255,255,255,0.7)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:8, fontSize:15, cursor:'pointer' }}>
              Book Hospital Demo
            </button>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ background:S.navy, borderTop:'1px solid rgba(255,255,255,0.08)', padding: isMobile?'40px 24px':'48px 80px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns: isMobile?'1fr':'2fr 1fr 1fr 1fr', gap:40 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
              <div style={{ width:24, height:24, borderRadius:6, background:S.blue, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="12" height="12" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C9 1.5 4 5 4 10C4 12.8 6.2 15 9 15C11.8 15 14 12.8 14 10C14 5 9 1.5 9 1.5Z" fill="white"/><circle cx="9" cy="10" r="2.2" fill="#0C1A2E"/></svg>
              </div>
              <span style={{ fontSize:14, fontWeight:700, color:'#fff' }}>PsycheFlow</span>
            </div>
            <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', lineHeight:1.6, maxWidth:240 }}>Clinical intelligence for mental healthcare. Built in India.</p>
          </div>
          {[
            { heading:'Product', links:[['Patient Portal',''],['Psychologist Portal',''],['Hospital Portal',''],['Pricing',''],['Security','']] },
            { heading:'Resources', links:[['Documentation',''],['API Reference',''],['Research',''],['Blog','']] },
            { heading:'Company', links:[['About',''],['Privacy Policy',''],['Terms of Service',''],['Contact','']] },
          ].map(col=>(
            <div key={col.heading}>
              <div style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16 }}>{col.heading}</div>
              {col.links.map(([label])=>(
                <div key={label} style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginBottom:10, cursor:'pointer' }}
                  onMouseEnter={e=>e.target.style.color='rgba(255,255,255,0.8)'}
                  onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.4)'}>{label}</div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ maxWidth:1200, margin:'32px auto 0', paddingTop:24, borderTop:'1px solid rgba(255,255,255,0.08)', display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <span style={{ fontSize:12, color:'rgba(255,255,255,0.3)' }}>© 2026 PsycheFlow. All rights reserved.</span>
          <span style={{ fontSize:12, color:'rgba(255,255,255,0.3)' }}>DPDP 2023 Compliant · Made in India</span>
        </div>
      </footer>
    </div>
  );
}
