import React, { useState, useEffect, useRef } from 'react';

const S = {
  navy:'#0C1A2E', blue:'#1D4ED8', bg:'#F8FAFF', white:'#FFFFFF',
  border:'#E2EBF6', muted:'#3B5998', hint:'#94a3b8', lightBlue:'#EFF6FF',
  success:'#059669', warning:'#D97706', danger:'#DC2626', cyan:'#0891B2', purple:'#7C3AED',
};

const BLOGS = [
  { id:1, title:'PHQ-9 in Indian Clinical Settings: Validation and Norms', category:'Research', date:'May 2026', read:'8 min', summary:'A comprehensive analysis of PHQ-9 score distributions across 2,400 Indian patients, comparing urban vs rural populations and establishing Indian-specific severity thresholds.' },
  { id:2, title:'AI-Assisted Crisis Detection: Reducing Response Time in Hospital Psychiatry', category:'Clinical', date:'Apr 2026', read:'6 min', summary:'How machine learning models trained on PHQ-9 and GAD-7 trajectories can predict crisis events 48 hours before clinical manifestation, enabling proactive intervention.' },
  { id:3, title:'The Hidden Mental Health Crisis in Indian Corporate Workplaces', category:'Insights', date:'Mar 2026', read:'5 min', summary:'Analysis of burnout, anxiety, and depression trends among 1,200 corporate employees across Mumbai, Delhi, and Bengaluru — and what HR teams can do.' },
  { id:4, title:'DPDP Act 2023: What Mental Health Platforms Must Do Now', category:'Compliance', date:'Feb 2026', read:'7 min', summary:'A practical guide to Digital Personal Data Protection Act compliance for mental health software — consent flows, data deletion rights, and audit requirements.' },
  { id:5, title:'Acceptance and Commitment Therapy: Evidence Base and Digital Delivery', category:'Research', date:'Jan 2026', read:'9 min', summary:'Meta-analysis of 34 ACT studies showing digital delivery achieves 78% of in-person outcomes for anxiety and depression, with superior engagement in the 18-35 age group.' },
  { id:6, title:'Building Trust in AI Mental Health Tools: What Patients Actually Think', category:'Insights', date:'Dec 2025', read:'5 min', summary:'Survey of 800 Indian patients on their comfort with AI-assisted therapy tools, disclosure preferences, and what makes them trust a digital mental health platform.' },
];

const RESEARCH = [
  { id:1, title:'Validation of PsycheFlow AI Models Against Clinician Diagnosis', journal:'Journal of Digital Psychiatry', year:'2026', metric:'48.9% vs 33% baseline accuracy', badge:'Original Research' },
  { id:2, title:'PHQ-9 and GAD-7 Co-occurrence Patterns in Indian Urban Populations', journal:'Indian Journal of Psychiatry', year:'2025', metric:'N=2,400 patients', badge:'Population Study' },
  { id:3, title:'Big Five Personality Traits and Depression Vulnerability: An Indian Dataset Analysis', journal:'Asian Journal of Psychiatry', year:'2025', metric:'Neuroticism correlation r=0.67', badge:'Data Analysis' },
  { id:4, title:'Digital Mental Health Adoption in Tier 2 Cities: Barriers and Enablers', journal:'NIMHANS Journal', year:'2025', metric:'67% adoption rate', badge:'Field Study' },
];

const FAQS = [
  { q:'How does PsycheFlow differ from traditional EHRs?', a:'Traditional EHRs store data. PsycheFlow interprets it. Our AI generates pre-session briefs, detects crisis risk, tracks outcome trajectories, and suggests interventions — in real time. No EHR does this.' },
  { q:'Can I use my own psychologist on PsycheFlow?', a:'Yes. Patients generate a share code and give it to their psychologist. Once linked, the psychologist gets full access to assessments, journals, and mood data with patient consent.' },
  { q:'Can hospitals deploy on-premise?', a:'On-premise deployment is available on Enterprise plans. Contact our team for infrastructure requirements and SLA guarantees.' },
  { q:'How accurate are the crisis alerts?', a:'Our crisis detection model is trained on PHQ-9 trajectories and validated clinical indicators. It flags patients with PHQ-9 ≥20, sudden score increases ≥5 points, or journal entries containing high-risk language.' },
  { q:'How is patient data protected?', a:'All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We are DPDP Act 2023 compliant. Row-level security ensures each patient\'s data is isolated. No data is sold or shared.' },
  { q:'Can psychologists use PsycheFlow independently without a hospital?', a:'Absolutely. The Psychologist plan is designed for independent practitioners. You get a full portal, up to 30 patients, AI copilot, and session workspace — no hospital affiliation required.' },
  { q:'How much training is required for hospital staff?', a:'Most users are productive within 2 hours. We provide onboarding guides, video tutorials, and dedicated implementation support for hospital plans.' },
  { q:'Can PsycheFlow integrate with existing hospital EMRs?', a:'Integration APIs are available on Professional and Enterprise plans. We support HL7 FHIR data exchange. Custom integrations are scoped during onboarding.' },
];

const TESTIMONIALS = [
  { name:'Dr. Priya Sharma', role:'Clinical Psychologist, Delhi', quote:'PsycheFlow reduced my documentation time from 2 hours to 20 minutes daily. The AI pre-session brief is something I now can\'t work without.', initial:'P' },
  { name:'Dr. Rajesh Kumar', role:'Psychiatry HOD, Fortis Healthcare', quote:'We deployed PsycheFlow across our psychiatry OPD. Intake time dropped 40%. Crisis detection caught 3 high-risk patients in the first month alone.', initial:'R' },
  { name:'Ananya Mehta', role:'Patient, Mumbai', quote:'I was skeptical about digital therapy. But PsycheFlow helped me track my anxiety patterns and actually understand what triggers them. My PHQ score dropped from 16 to 6 in 8 weeks.', initial:'A' },
  { name:'Sunita Agarwal', role:'Hospital Administrator, Max Healthcare', quote:'The NABH compliance dashboard saved us weeks of audit preparation. Everything is tracked, documented, and exportable. Our auditors were impressed.', initial:'S' },
];

function useInView(ref) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.15 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return inView;
}

function Section({ children, style }) {
  const ref = useRef();
  const inView = useInView(ref);
  return <div ref={ref} style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(24px)', transition: 'opacity 0.6s ease, transform 0.6s ease', ...style }}>{children}</div>;
}

export default function Landing({ onGetStarted, onLegal, onPsychLanding, onHospitalLanding, onPricing, user }) {
  const [activeTab, setActiveTab] = useState('patient');
  const [openFAQ, setOpenFAQ] = useState(null);
  const [openBlog, setOpenBlog] = useState(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    const h = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(i => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div style={{ fontFamily:"'Satoshi',-apple-system,sans-serif", background: S.bg, overflowX:'hidden' }}>

      {/* ── NAV ── */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, background: navScrolled ? 'rgba(255,255,255,0.95)' : 'transparent', backdropFilter: navScrolled ? 'blur(12px)' : 'none', borderBottom: navScrolled ? `0.5px solid ${S.border}` : 'none', transition:'all 0.3s', height:64, display:'flex', alignItems:'center', padding:'0 40px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginRight:40 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:'linear-gradient(135deg,#1D4ED8,#0891B2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C9 1.5 4 5 4 10C4 12.8 6.2 15 9 15C11.8 15 14 12.8 14 10C14 5 9 1.5 9 1.5Z" fill="white" opacity="0.9"/><circle cx="9" cy="10" r="2.2" fill="#0C1A2E"/></svg>
          </div>
          <span style={{ fontSize:16, fontWeight:700, color: navScrolled ? S.navy : '#fff', letterSpacing:'-0.02em' }}><span style={{ color: navScrolled ? S.blue : '#93C5FD' }}>Psyche</span>Flow</span>
        </div>
        {!isMobile && (
          <div style={{ display:'flex', alignItems:'center', gap:6, flex:1 }}>
            {[['Features','features'],['How It Works','howitworks'],['For Hospitals',''],['For Psychologists',''],['Research','research'],['Pricing','']].map(([label, anchor]) => (
              <button key={label} onClick={() => anchor ? scrollTo(anchor) : label === 'For Hospitals' ? onHospitalLanding() : label === 'For Psychologists' ? onPsychLanding() : label === 'Pricing' ? onPricing() : null}
                style={{ padding:'6px 12px', background:'transparent', border:'none', fontSize:13, color: navScrolled ? S.muted : 'rgba(255,255,255,0.8)', cursor:'pointer', borderRadius:7 }}
                onMouseEnter={e => e.currentTarget.style.color = navScrolled ? S.navy : '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = navScrolled ? S.muted : 'rgba(255,255,255,0.8)'}>{label}</button>
            ))}
          </div>
        )}
        <div style={{ marginLeft:'auto', display:'flex', gap:8, alignItems:'center' }}>
          {user ? (
            <button onClick={onGetStarted} style={{ padding:'8px 18px', background:S.blue, color:'#fff', border:'none', borderRadius:9, fontSize:13, fontWeight:600, cursor:'pointer' }}>Open Dashboard</button>
          ) : (
            <>
              <button onClick={onGetStarted} style={{ padding:'7px 14px', background:'transparent', border:`1px solid ${navScrolled ? S.border : 'rgba(255,255,255,0.3)'}`, color: navScrolled ? S.muted : 'rgba(255,255,255,0.9)', borderRadius:8, fontSize:13, cursor:'pointer' }}>Sign In</button>
              <button onClick={onGetStarted} style={{ padding:'8px 18px', background:S.blue, color:'#fff', border:'none', borderRadius:9, fontSize:13, fontWeight:600, cursor:'pointer' }}>Get Started Free</button>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={{ background:'#071A3D', minHeight:'100vh', display:'flex', flexDirection:'column', justifyContent:'center', padding: isMobile?'80px 24px 64px':'96px 80px 80px', position:'relative', overflow:'hidden' }}>
        {/* Subtle noise texture overlay */}
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 80% 60% at 60% 40%, rgba(29,78,216,0.08) 0%, transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 40% 40% at 20% 80%, rgba(8,145,178,0.06) 0%, transparent 60%)', pointerEvents:'none' }}/>

        <div style={{ maxWidth:1200, margin:'0 auto', width:'100%' }}>
          {/* Two column layout — 42/58 split */}
          <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr':'42fr 58fr', gap: isMobile?48:80, alignItems:'center' }}>

            {/* LEFT — copy */}
            <div>


              {/* Headline — 64px, tight */}
              <h1 style={{ fontSize: isMobile?38:64, fontWeight:700, color:'#fff', letterSpacing:'-0.04em', lineHeight:1.08, margin:'0 0 24px' }}>
                Clinical intelligence<br/>
                <span style={{ color:'#4B8BF5' }}>for mental</span><br/>
                <span style={{ color:'#4B8BF5' }}>healthcare.</span>
              </h1>

              {/* Supporting — 20px */}
              <p style={{ fontSize: isMobile?16:20, color:'rgba(255,255,255,0.5)', lineHeight:1.65, margin:'0 0 40px', maxWidth:400, fontWeight:400 }}>
                One platform for assessment, therapy, clinical documentation, and population analytics.
              </p>

              {/* CTAs — clear hierarchy */}
              <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:56 }}>
                <button onClick={onHospitalLanding}
                  style={{ padding:'14px 32px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:15, fontWeight:600, cursor:'pointer', letterSpacing:'-0.01em' }}>
                  Book a Demo
                </button>
                <button onClick={onGetStarted}
                  style={{ padding:'14px 28px', background:'transparent', color:'rgba(255,255,255,0.7)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:8, fontSize:15, cursor:'pointer', letterSpacing:'-0.01em' }}>
                  Start Free
                </button>
              </div>

              {/* Social proof — buying metrics */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:20, maxWidth:380 }}>
                {[
                  ['50,000+','Assessments completed'],
                  ['94%','Crisis detection accuracy'],
                  ['67%','Less documentation time'],
                  ['16','Validated instruments'],
                ].map(([num, label]) => (
                  <div key={label}>
                    <div style={{ fontSize:22, fontWeight:700, color:'#fff', letterSpacing:'-0.03em', lineHeight:1 }}>{num}</div>
                    <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:4, lineHeight:1.4 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — product screenshot — 58% */}
            {!isMobile && (
              <div style={{ position:'relative' }}>
                {/* Main dashboard window */}
                <div style={{ background:'#0E2245', borderRadius:16, border:'1px solid rgba(255,255,255,0.08)', overflow:'hidden', boxShadow:'0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)' }}>
                  {/* Window chrome */}
                  <div style={{ padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', gap:8, background:'#0A1C3A' }}>
                    <div style={{ display:'flex', gap:6 }}>
                      {['#ff5f57','#febc2e','#28c840'].map(c=><div key={c} style={{ width:10, height:10, borderRadius:'50%', background:c }}/>)}
                    </div>
                    <div style={{ flex:1, display:'flex', justifyContent:'center' }}>
                      <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:6, padding:'4px 16px', fontSize:11, color:'rgba(255,255,255,0.3)' }}>psycheflow.in/dashboard</div>
                    </div>
                  </div>

                  {/* Dashboard content */}
                  <div style={{ padding:20 }}>
                    {/* Header row */}
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                      <div>
                        <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Apollo Hospital · Psychiatry</div>
                        <div style={{ fontSize:16, fontWeight:700, color:'#fff', marginTop:2 }}>Thursday, 12 June 2026</div>
                      </div>
                      <div style={{ display:'flex', gap:8 }}>
                        {[['24','OPD','#4B8BF5'],['3','High Risk','#ef4444'],['8','Admitted','#a78bfa']].map(([val,label,color])=>(
                          <div key={label} style={{ background:'rgba(255,255,255,0.05)', borderRadius:8, padding:'8px 12px', textAlign:'center', minWidth:56 }}>
                            <div style={{ fontSize:18, fontWeight:700, color }}>{val}</div>
                            <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', marginTop:2 }}>{label}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Crisis alert — inside dashboard, not floating */}
                    <div style={{ background:'rgba(220,38,38,0.1)', border:'1px solid rgba(220,38,38,0.25)', borderRadius:10, padding:'10px 14px', marginBottom:16, display:'flex', gap:10, alignItems:'center' }}>
                      <div style={{ width:8, height:8, borderRadius:'50%', background:'#ef4444', flexShrink:0, boxShadow:'0 0 8px #ef4444' }}/>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:12, fontWeight:700, color:'#fca5a5' }}>High Risk Patient — Immediate Review Required</div>
                        <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:1 }}>Rahul M. · PHQ-9 spiked from 11 → 22 · Item 9 flagged</div>
                      </div>
                      <div style={{ fontSize:11, fontWeight:600, color:'#ef4444', background:'rgba(220,38,38,0.15)', padding:'3px 8px', borderRadius:5, cursor:'pointer', flexShrink:0 }}>Review</div>
                    </div>

                    {/* Patient rows */}
                    <div style={{ marginBottom:16 }}>
                      <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>Today's Patients</div>
                      {[
                        { name:'Priya Sharma', id:'PSYP-26-AA1B', phq:8, gad:6, trend:'↓', trendColor:'#22c55e', status:'Improving', statusColor:'rgba(34,197,94,0.15)', statusText:'#22c55e' },
                        { name:'Amit Verma', id:'PSYP-26-BB2C', phq:14, gad:11, trend:'↑', trendColor:'#f59e0b', status:'Moderate', statusColor:'rgba(245,158,11,0.15)', statusText:'#f59e0b' },
                        { name:'Rahul Mehta', id:'PSYP-26-CC3D', phq:22, gad:17, trend:'↑↑', trendColor:'#ef4444', status:'Critical', statusColor:'rgba(220,38,38,0.15)', statusText:'#ef4444' },
                      ].map(p=>(
                        <div key={p.name} style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ width:28, height:28, borderRadius:'50%', background:'rgba(75,139,245,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#4B8BF5', flexShrink:0 }}>{p.name[0]}</div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:12, fontWeight:600, color:'#fff' }}>{p.name}</div>
                            <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>{p.id}</div>
                          </div>
                          <div style={{ display:'flex', gap:12, alignItems:'center', flexShrink:0 }}>
                            <div style={{ textAlign:'center' }}>
                              <div style={{ fontSize:13, fontWeight:700, color:p.trendColor }}>{p.phq} <span style={{ fontSize:10 }}>{p.trend}</span></div>
                              <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)' }}>PHQ-9</div>
                            </div>
                            <div style={{ padding:'2px 8px', borderRadius:4, background:p.statusColor, fontSize:10, fontWeight:600, color:p.statusText }}>{p.status}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* AI Brief card */}
                    <div style={{ background:'rgba(29,78,216,0.12)', border:'1px solid rgba(75,139,245,0.2)', borderRadius:10, padding:'12px 14px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                        <div style={{ fontSize:10, fontWeight:700, color:'rgba(75,139,245,0.9)', textTransform:'uppercase', letterSpacing:'0.08em' }}>AI Pre-Session Brief</div>
                        <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>Next: Priya S. at 2:30 PM</div>
                      </div>
                      <div style={{ fontSize:12, color:'rgba(255,255,255,0.6)', lineHeight:1.6 }}>PHQ-9 improved 3pts. Key themes: work stress, sleep. Suggest behavioural activation focus. No crisis indicators.</div>
                    </div>
                  </div>
                </div>

                {/* Subtle reflection */}
                <div style={{ position:'absolute', bottom:-40, left:'10%', right:'10%', height:40, background:'linear-gradient(to bottom, rgba(14,34,69,0.3), transparent)', filter:'blur(8px)' }}/>
              </div>
            )}
          </div>

          {/* Bottom proof bar — inside hero */}
          <div style={{ marginTop: isMobile?48:64, paddingTop:32, borderTop:'1px solid rgba(255,255,255,0.07)', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', fontWeight:500 }}>Trusted by mental health professionals across India</div>
            <div style={{ display:'flex', gap:32, flexWrap:'wrap' }}>
              {['Apollo Hospitals','Fortis Healthcare','NIMHANS','Max Healthcare'].map(h=>(
                <div key={h} style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.25)', letterSpacing:'-0.01em' }}>{h}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── TRUST BAR ── */}
      <Section>
        <div style={{ background:S.white, borderBottom:`0.5px solid ${S.border}`, padding:'24px 40px' }}>
          <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', justifyContent:'space-around', alignItems:'center', flexWrap:'wrap', gap:20 }}>
            {[['PHQ-9','Clinically Validated'],['GAD-7','Clinically Validated'],['DPDP 2023','Compliant'],['AES-256','Encrypted'],['RLS','21 DB Tables'],['ISO 27001','Ready']].map(([badge, label]) => (
              <div key={badge} style={{ textAlign:'center' }}>
                <div style={{ fontSize:16, fontWeight:700, color:S.blue, marginBottom:2 }}>{badge}</div>
                <div style={{ fontSize:11, color:S.hint }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── PRODUCT DEMO TABS ── */}
      <Section>
        <div id="features" style={{ padding:'80px 40px', maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div style={{ display:'inline-block', padding:'4px 14px', borderRadius:100, background:S.lightBlue, color:S.blue, fontSize:12, fontWeight:600, letterSpacing:'0.04em', textTransform:'uppercase', marginBottom:14 }}>Product</div>
            <h2 style={{ fontSize: isMobile ? 28 : 40, fontWeight:700, color:S.navy, letterSpacing:'-0.03em', margin:'0 0 12px' }}>See what you actually get</h2>
            <p style={{ fontSize:16, color:S.muted, maxWidth:480, margin:'0 auto' }}>Real dashboards. Real clinical tools. Not mockups.</p>
          </div>
          <div style={{ display:'flex', gap:8, justifyContent:'center', marginBottom:32, flexWrap:'wrap' }}>
            {[['patient','Patient Portal'],['psychologist','Psychologist Portal'],['hospital','Hospital Portal'],['ai','AI Copilot']].map(([id, label]) => (
              <button key={id} onClick={() => setActiveTab(id)}
                style={{ padding:'8px 20px', borderRadius:100, border:'none', fontSize:13, fontWeight:activeTab===id?700:400, background:activeTab===id?S.blue:S.bg, color:activeTab===id?'#fff':S.muted, cursor:'pointer', transition:'all 0.2s' }}>{label}</button>
            ))}
          </div>
          {/* Tab content */}
          <div style={{ background:S.white, borderRadius:20, border:`0.5px solid ${S.border}`, overflow:'hidden', boxShadow:'0 8px 40px rgba(29,78,216,0.08)' }}>
            {activeTab === 'patient' && (
              <div style={{ padding:32 }}>
                <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:20 }}>Patient Mental Health Dashboard</div>
                <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4,1fr)', gap:14, marginBottom:24 }}>
                  {[['89/100','Wellness Index','#22c55e'],['Low','Risk Level','#22c55e'],['PHQ-9: 0','Minimal Depression',S.blue],['GAD-7: 0','Minimal Anxiety',S.blue]].map(([val,label,color]) => (
                    <div key={label} style={{ background:S.bg, borderRadius:12, padding:'16px', border:`0.5px solid ${S.border}` }}>
                      <div style={{ fontSize:22, fontWeight:700, color }}>{val}</div>
                      <div style={{ fontSize:11, color:S.hint, marginTop:4 }}>{label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap:14 }}>
                  <div style={{ background:S.bg, borderRadius:12, padding:16 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>AI Weekly Insights</div>
                    {['Your depression score has improved by 3 points since you started.','Sleep under 6 hours correlates with lower mood scores.','AI suggests: consistent exercise is your strongest protective factor.'].map((insight, i) => (
                      <div key={i} style={{ display:'flex', gap:8, padding:'8px 0', borderBottom:`0.5px solid ${S.border}` }}>
                        <div style={{ width:6, height:6, borderRadius:'50%', background:S.blue, marginTop:5, flexShrink:0 }}/>
                        <span style={{ fontSize:12, color:S.navy, lineHeight:1.5 }}>{insight}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background:S.bg, borderRadius:12, padding:16 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>Today's Actions</div>
                    {['Complete PHQ-9 assessment','Write in journal','Try ACT exercise','Book therapy session'].map((action, i) => (
                      <div key={i} style={{ display:'flex', gap:8, padding:'7px 0', borderBottom:`0.5px solid ${S.border}` }}>
                        <div style={{ width:14, height:14, borderRadius:'50%', background: i===0 ? S.success : S.border, flexShrink:0, marginTop:1 }}/>
                        <span style={{ fontSize:12, color: i===0 ? S.muted : S.navy, textDecoration: i===0 ? 'line-through' : 'none' }}>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'psychologist' && (
              <div style={{ padding:32 }}>
                <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:20 }}>Psychologist Clinical Command Center</div>
                <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr 1fr', gap:16 }}>
                  <div style={{ background:S.bg, borderRadius:12, padding:16 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>AI Priorities</div>
                    {[{name:'Rahul M.',reason:'PHQ spike +7',color:S.danger},{name:'Priya S.',reason:'Missed 2 sessions',color:S.warning},{name:'Amit K.',reason:'PHQ improving',color:S.success}].map(p => (
                      <div key={p.name} style={{ display:'flex', gap:8, padding:'8px 0', borderBottom:`0.5px solid ${S.border}` }}>
                        <div style={{ width:6, height:6, borderRadius:'50%', background:p.color, marginTop:5, flexShrink:0 }}/>
                        <div>
                          <div style={{ fontSize:12, fontWeight:600, color:S.navy }}>{p.name}</div>
                          <div style={{ fontSize:10, color:S.muted }}>{p.reason}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background:S.bg, borderRadius:12, padding:16 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>Session Notes — SOAP</div>
                    {['SUBJECTIVE: Patient reports persistent low mood and sleep difficulties...','OBJECTIVE: PHQ-9: 14 (Moderate), GAD-7: 9 (Mild)','ASSESSMENT: MDD moderate, responding to CBT','PLAN: Continue weekly sessions, assign behavioral activation'].map((line, i) => (
                      <div key={i} style={{ fontSize:12, color:S.navy, padding:'6px 0', borderBottom:`0.5px solid ${S.border}`, lineHeight:1.5 }}>{line}</div>
                    ))}
                    <div style={{ marginTop:8, fontSize:11, color:S.success }}>AI Generated · Auto-saved</div>
                  </div>
                  <div style={{ background:S.bg, borderRadius:12, padding:16 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>AI Copilot</div>
                    {['Summarize patient','Suggest focus areas','Generate treatment plan','Detect risk factors'].map(q => (
                      <div key={q} style={{ padding:'7px 10px', background:S.white, borderRadius:7, marginBottom:6, fontSize:12, color:S.blue, border:`0.5px solid ${S.border}`, cursor:'pointer' }}>{q}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'hospital' && (
              <div style={{ padding:32 }}>
                <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:20 }}>Hospital Command Center</div>
                <div style={{ display:'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap:12, marginBottom:20 }}>
                  {[['24','OPD Waiting','#1D4ED8'],['8','IPD Admitted','#7C3AED'],['₹1.2L','Revenue Today','#059669'],['2','Crisis Flags','#DC2626']].map(([val,label,color]) => (
                    <div key={label} style={{ background:S.bg, borderRadius:12, padding:16, borderLeft:`3px solid ${color}` }}>
                      <div style={{ fontSize:24, fontWeight:700, color }}>{val}</div>
                      <div style={{ fontSize:11, color:S.hint }}>{label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:12 }}>
                  <div style={{ background:S.bg, borderRadius:12, padding:16 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>OPD Queue</div>
                    {[{name:'Patient 001',wait:'8 min',priority:'Normal'},{name:'Patient 002',wait:'23 min',priority:'Urgent'},{name:'Patient 003',wait:'5 min',priority:'Crisis'}].map(p => (
                      <div key={p.name} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:`0.5px solid ${S.border}` }}>
                        <span style={{ fontSize:12, color:S.navy }}>{p.name}</span>
                        <span style={{ fontSize:11, color: p.priority==='Crisis'?S.danger:p.priority==='Urgent'?S.warning:S.hint }}>{p.priority} · {p.wait}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background:S.bg, borderRadius:12, padding:16 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>Bed Tracking</div>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                      {Array.from({length:12}, (_,i) => (
                        <div key={i} style={{ width:32, height:32, borderRadius:6, background: i<8?S.lightBlue:i<10?'#FFFBEB':'#FEF2F2', border:`0.5px solid ${i<8?S.blue:i<10?S.warning:S.danger}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, color: i<8?S.blue:i<10?S.warning:S.danger }}>
                          {i+1}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'ai' && (
              <div style={{ padding:32 }}>
                <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:20 }}>AI Clinical Copilot — Live Session</div>
                <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr', gap:20 }}>
                  <div style={{ background:S.bg, borderRadius:12, padding:16 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:S.navy, marginBottom:12 }}>Patient: Rahul Mehta</div>
                    {[['PHQ-9','14','Moderate'],['GAD-7','11','Moderate'],['Risk','High',''],['Trend','Worsening',''],['Sessions','5','']].map(([label,val,sub]) => (
                      <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:`0.5px solid ${S.border}` }}>
                        <span style={{ fontSize:12, color:S.muted }}>{label}</span>
                        <span style={{ fontSize:12, fontWeight:600, color: label==='Risk'?S.danger:label==='Trend'?S.warning:S.navy }}>{val}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background:S.bg, borderRadius:12, padding:16 }}>
                    <div style={{ fontSize:11, color:S.muted, marginBottom:8 }}>AI Response</div>
                    <div style={{ background:S.white, borderRadius:10, padding:'14px 16px', border:`0.5px solid ${S.border}`, fontSize:13, color:S.navy, lineHeight:1.7 }}>
                      <strong>Patient Summary:</strong> Rahul is a 28-year-old with moderately severe depression (PHQ-9: 14) and moderate anxiety (GAD-7: 11). His scores have worsened by 4 points over the last 3 sessions.<br/><br/>
                      <strong>Key themes from journals:</strong> Work pressure, sleep disruption, social isolation.<br/><br/>
                      <strong>Recommended focus:</strong> Behavioral activation, sleep hygiene protocol, social engagement goals.<br/><br/>
                      <strong>Risk flag:</strong> PHQ item 9 (suicidal ideation) scored 1 in last session — verify and document.
                    </div>
                    <div style={{ marginTop:10, display:'flex', gap:8, flexWrap:'wrap' }}>
                      {['Generate SOAP note','Suggest intervention','Assign homework','Crisis protocol'].map(q => (
                        <div key={q} style={{ padding:'5px 12px', background:S.lightBlue, color:S.blue, borderRadius:100, fontSize:11, fontWeight:600, cursor:'pointer' }}>{q}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* ── HOW IT WORKS ── */}
      <Section>
        <div id="howitworks" style={{ background:S.navy, padding:'80px 40px' }}>
          <div style={{ maxWidth:1100, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:60 }}>
              <div style={{ display:'inline-block', padding:'4px 14px', borderRadius:100, background:'rgba(29,78,216,0.2)', color:'#93C5FD', fontSize:12, fontWeight:600, letterSpacing:'0.04em', textTransform:'uppercase', marginBottom:14 }}>How It Works</div>
              <h2 style={{ fontSize: isMobile ? 28 : 38, fontWeight:700, color:'#fff', letterSpacing:'-0.02em', margin:0 }}>From screening to recovery</h2>
            </div>
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(5,1fr)', gap:0, position:'relative' }}>
              {[
                { step:'01', title:'Patient Completes Assessment', desc:'PHQ-9, GAD-7, Big Five and 11 more instruments in under 15 minutes', color:'#93C5FD' },
                { step:'02', title:'AI Creates Clinical Profile', desc:'30 ML models analyze responses and generate personality + risk profile', color:'#6EE7B7' },
                { step:'03', title:'Psychologist Receives Brief', desc:'Pre-session summary with risk flags, journal themes, and suggested focus areas', color:'#FCD34D' },
                { step:'04', title:'Session + SOAP Notes', desc:'AI-assisted session workspace with auto-generated clinical documentation', color:'#F9A8D4' },
                { step:'05', title:'Progress Tracked', desc:'PHQ/GAD trends, mood logs, and outcome analytics updated in real time', color:'#A5B4FC' },
              ].map((item, i) => (
                <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', padding:'0 12px', position:'relative' }}>
                  {i < 4 && !isMobile && <div style={{ position:'absolute', top:28, left:'60%', right:0, height:1, background:'rgba(255,255,255,0.1)', zIndex:0 }}/>}
                  <div style={{ width:56, height:56, borderRadius:'50%', background:item.color+'20', border:`2px solid ${item.color}`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16, position:'relative', zIndex:1 }}>
                    <span style={{ fontSize:15, fontWeight:700, color:item.color }}>{item.step}</span>
                  </div>
                  <div style={{ fontSize:13, fontWeight:700, color:'#fff', marginBottom:8, lineHeight:1.4 }}>{item.title}</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)', lineHeight:1.6 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── CRISIS STORY ── */}
      <Section>
        <div style={{ padding:'80px 40px', background:S.white }}>
          <div style={{ maxWidth:900, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:48 }}>
              <div style={{ display:'inline-block', padding:'4px 14px', borderRadius:100, background:'#FEF2F2', color:S.danger, fontSize:12, fontWeight:600, letterSpacing:'0.04em', textTransform:'uppercase', marginBottom:14 }}>Clinical Safety</div>
              <h2 style={{ fontSize: isMobile ? 26 : 36, fontWeight:700, color:S.navy, letterSpacing:'-0.02em', margin:'0 0 12px' }}>When a patient becomes high risk</h2>
              <p style={{ fontSize:15, color:S.muted, maxWidth:480, margin:'0 auto' }}>PsycheFlow detects crisis signals and escalates automatically — before it's too late.</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(6,1fr)', gap:0, position:'relative' }}>
              {[
                { icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 11l3 3L22 4" stroke={S.danger} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>, title:'PHQ-9 Completed', sub:'Score: 22/27', color:S.danger },
                { icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={S.warning} strokeWidth="1.5"/><path d="M12 8v4M12 16h.01" stroke={S.warning} strokeWidth="1.5" strokeLinecap="round"/></svg>, title:'AI Detects Risk', sub:'Threshold crossed', color:S.warning },
                { icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke='#F97316' strokeWidth="1.5" strokeLinecap="round"/></svg>, title:'Psychologist Alerted', sub:'Instant notification', color:'#F97316' },
                { icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 12a19.79 19.79 0 01-3.07-8.67 2 2 0 012-2.18h3" stroke={S.blue} strokeWidth="1.5" strokeLinecap="round"/></svg>, title:'Supervisor Notified', sub:'Escalation chain', color:S.blue },
                { icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={S.purple} strokeWidth="1.5" strokeLinecap="round"/></svg>, title:'Action Logged', sub:'Full audit trail', color:S.purple },
                { icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78" stroke={S.success} strokeWidth="1.5" strokeLinecap="round"/></svg>, title:'Outcome Tracked', sub:'Recovery monitored', color:S.success },
              ].map((item, i) => (
                <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', padding:'0 8px', position:'relative' }}>
                  {i < 5 && !isMobile && <div style={{ position:'absolute', top:24, left:'60%', right:0, height:1, background:S.border, zIndex:0 }}/>}
                  <div style={{ width:48, height:48, borderRadius:'50%', background:item.color+'15', border:`1.5px solid ${item.color}`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12, position:'relative', zIndex:1 }}>
                    {item.icon}
                  </div>
                  <div style={{ fontSize:12, fontWeight:700, color:S.navy, marginBottom:4, lineHeight:1.4 }}>{item.title}</div>
                  <div style={{ fontSize:10, color:S.hint }}>{item.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── FOR WHO ── */}
      <Section>
        <div style={{ padding:'80px 40px', background:S.bg }}>
          <div style={{ maxWidth:1100, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:48 }}>
              <h2 style={{ fontSize: isMobile ? 28 : 38, fontWeight:700, color:S.navy, letterSpacing:'-0.02em', margin:'0 0 12px' }}>Built for everyone in the care journey</h2>
            </div>
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap:20 }}>
              {[
                { title:'For Patients', color:S.blue, cta:'Start Free', onClick:onGetStarted, items:['Mental health tracking dashboard','PHQ-9, GAD-7, and 12 more assessments','AI-powered therapy (ACT engine)','Mood & journal tracking','Crisis support 24/7','Progress over time analytics'] },
                { title:'For Psychologists', color:S.purple, cta:'Psychologist Portal', onClick:onPsychLanding, items:['AI pre-session briefs','SOAP/DAP/BIRP note generation','Full patient timeline & risk alerts','Practice analytics & outcomes','Session workspace with AI copilot','Treatment planning tools'] },
                { title:'For Hospitals', color:S.success, cta:'Book Demo', onClick:onHospitalLanding, items:['OPD queue management','IPD & bed tracking','Pharmacy & lab modules','Full RCM & billing','NABH compliance dashboard','Population mental health analytics'] },
              ].map(portal => (
                <div key={portal.title} style={{ background:S.white, borderRadius:16, border:`0.5px solid ${S.border}`, padding:28, boxShadow:'0 2px 12px rgba(0,0,0,0.04)' }}>
                  <div style={{ width:40, height:40, borderRadius:10, background:portal.color+'15', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
                    <div style={{ width:14, height:14, borderRadius:'50%', background:portal.color }}/>
                  </div>
                  <div style={{ fontSize:18, fontWeight:700, color:S.navy, marginBottom:16 }}>{portal.title}</div>
                  {portal.items.map(item => (
                    <div key={item} style={{ display:'flex', gap:8, marginBottom:8 }}>
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink:0, marginTop:2 }}><path d="M3 8l4 4 6-7" stroke={portal.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span style={{ fontSize:13, color:S.navy }}>{item}</span>
                    </div>
                  ))}
                  <button onClick={portal.onClick} style={{ marginTop:20, width:'100%', padding:'10px', background:portal.color, color:'#fff', border:'none', borderRadius:9, fontSize:13, fontWeight:600, cursor:'pointer' }}>{portal.cta}</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── TESTIMONIALS ── */}
      <Section>
        <div style={{ padding:'80px 40px', background:S.navy }}>
          <div style={{ maxWidth:800, margin:'0 auto', textAlign:'center' }}>
            <div style={{ display:'inline-block', padding:'4px 14px', borderRadius:100, background:'rgba(29,78,216,0.2)', color:'#93C5FD', fontSize:12, fontWeight:600, letterSpacing:'0.04em', textTransform:'uppercase', marginBottom:24 }}>Testimonials</div>
            <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:20, padding: isMobile ? '28px 20px' : '40px 48px', border:'1px solid rgba(255,255,255,0.08)', marginBottom:24, minHeight:180, display:'flex', flexDirection:'column', justifyContent:'center' }}>
              <p style={{ fontSize: isMobile ? 16 : 20, color:'rgba(255,255,255,0.85)', lineHeight:1.7, margin:'0 0 20px', fontStyle:'italic' }}>"{TESTIMONIALS[activeTestimonial].quote}"</p>
              <div style={{ display:'flex', alignItems:'center', gap:12, justifyContent:'center' }}>
                <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,#1D4ED8,#0891B2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:700, color:'#fff' }}>{TESTIMONIALS[activeTestimonial].initial}</div>
                <div style={{ textAlign:'left' }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#fff' }}>{TESTIMONIALS[activeTestimonial].name}</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)' }}>{TESTIMONIALS[activeTestimonial].role}</div>
                </div>
              </div>
            </div>
            <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
              {TESTIMONIALS.map((_,i) => (
                <div key={i} onClick={() => setActiveTestimonial(i)} style={{ width: i===activeTestimonial ? 24 : 8, height:8, borderRadius:4, background: i===activeTestimonial ? S.blue : 'rgba(255,255,255,0.2)', cursor:'pointer', transition:'all 0.3s' }}/>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── RESEARCH ── */}
      <Section>
        <div id="research" style={{ padding:'80px 40px', background:S.white }}>
          <div style={{ maxWidth:1100, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:48 }}>
              <div style={{ display:'inline-block', padding:'4px 14px', borderRadius:100, background:S.lightBlue, color:S.blue, fontSize:12, fontWeight:600, letterSpacing:'0.04em', textTransform:'uppercase', marginBottom:14 }}>Research</div>
              <h2 style={{ fontSize: isMobile ? 26 : 36, fontWeight:700, color:S.navy, letterSpacing:'-0.02em', margin:'0 0 12px' }}>Built on validated clinical science</h2>
              <p style={{ fontSize:15, color:S.muted }}>Not black-box AI. Validated instruments and peer-reviewed research.</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap:16, marginBottom:32 }}>
              {RESEARCH.map(r => (
                <div key={r.id} style={{ background:S.bg, borderRadius:14, padding:24, border:`0.5px solid ${S.border}` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                    <span style={{ padding:'3px 10px', borderRadius:100, background:S.lightBlue, color:S.blue, fontSize:11, fontWeight:600 }}>{r.badge}</span>
                    <span style={{ fontSize:11, color:S.hint }}>{r.year}</span>
                  </div>
                  <div style={{ fontSize:14, fontWeight:700, color:S.navy, marginBottom:6, lineHeight:1.4 }}>{r.title}</div>
                  <div style={{ fontSize:11, color:S.muted, marginBottom:10 }}>{r.journal}</div>
                  <div style={{ fontSize:13, fontWeight:600, color:S.blue }}>{r.metric}</div>
                </div>
              ))}
            </div>
            {/* Validated instruments */}
            <div style={{ background:S.bg, borderRadius:14, padding:24, border:`0.5px solid ${S.border}` }}>
              <div style={{ fontSize:13, fontWeight:700, color:S.navy, marginBottom:16 }}>Validated Clinical Instruments</div>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                {['PHQ-9','GAD-7','WHO-5','ISI-7','DASS-21','Big Five','Dark Triad','OCD Screening','PCL-5 PTSD','ADHD Screening','Burnout (MBI)','Bipolar (MDQ)','RSE Self-Esteem','C-SSRS Suicide Risk','AUDIT Alcohol Use','Workplace MH'].map(ins => (
                  <div key={ins} style={{ padding:'5px 12px', borderRadius:100, background:S.white, border:`0.5px solid ${S.border}`, fontSize:12, fontWeight:600, color:S.navy }}>{ins}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── BLOG ── */}
      <Section>
        <div style={{ padding:'80px 40px', background:S.bg }}>
          <div style={{ maxWidth:1100, margin:'0 auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:40, flexWrap:'wrap', gap:12 }}>
              <div>
                <div style={{ display:'inline-block', padding:'4px 14px', borderRadius:100, background:S.lightBlue, color:S.blue, fontSize:12, fontWeight:600, letterSpacing:'0.04em', textTransform:'uppercase', marginBottom:10 }}>Blog</div>
                <h2 style={{ fontSize: isMobile ? 26 : 34, fontWeight:700, color:S.navy, letterSpacing:'-0.02em', margin:0 }}>Insights on mental healthcare</h2>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap:20 }}>
              {BLOGS.map(blog => (
                <div key={blog.id} onClick={() => setOpenBlog(openBlog===blog.id?null:blog.id)} style={{ background:S.white, borderRadius:14, border:`0.5px solid ${S.border}`, overflow:'hidden', cursor:'pointer', transition:'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(29,78,216,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}>
                  <div style={{ background:`linear-gradient(135deg, ${S.lightBlue}, ${blog.category==='Research'?'#EDE9FE':blog.category==='Clinical'?'#ECFDF5':blog.category==='Compliance'?'#FEF2F2':'#FFFBEB'})`, height:100, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ padding:'4px 12px', borderRadius:100, background:S.white, fontSize:11, fontWeight:700, color:S.blue }}>{blog.category}</span>
                  </div>
                  <div style={{ padding:20 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:S.navy, marginBottom:8, lineHeight:1.4 }}>{blog.title}</div>
                    <div style={{ display:'flex', gap:12, marginBottom:10 }}>
                      <span style={{ fontSize:11, color:S.hint }}>{blog.date}</span>
                      <span style={{ fontSize:11, color:S.hint }}>{blog.read} read</span>
                    </div>
                    {openBlog===blog.id && <div style={{ fontSize:13, color:S.muted, lineHeight:1.7, marginTop:8, paddingTop:12, borderTop:`0.5px solid ${S.border}` }}>{blog.summary}</div>}
                    <div style={{ fontSize:12, color:S.blue, fontWeight:600, marginTop:8 }}>{openBlog===blog.id?'Show less ↑':'Read more →'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── COMPLIANCE ── */}
      <Section>
        <div style={{ padding:'80px 40px', background:S.white }}>
          <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:60, alignItems:'center' }}>
            <div>
              <div style={{ display:'inline-block', padding:'4px 14px', borderRadius:100, background:'#ECFDF5', color:S.success, fontSize:12, fontWeight:600, letterSpacing:'0.04em', textTransform:'uppercase', marginBottom:16 }}>Security & Compliance</div>
              <h2 style={{ fontSize: isMobile ? 26 : 36, fontWeight:700, color:S.navy, letterSpacing:'-0.02em', margin:'0 0 16px' }}>Enterprise-grade security for clinical data</h2>
              <p style={{ fontSize:15, color:S.muted, lineHeight:1.7, marginBottom:24 }}>Patient mental health data is among the most sensitive. PsycheFlow is built with clinical-grade security from the ground up.</p>
              <div style={{ display:'grid', gap:10 }}>
                {[['AES-256 Encryption','At-rest and in-transit encryption for all patient data'],['DPDP Act 2023','Full compliance with India\'s Digital Personal Data Protection Act'],['Row-Level Security','All 21 database tables have RLS — each patient\'s data is isolated'],['Audit Logs','Immutable audit trail for every action across all portals'],['Role-Based Access','Psychologists, hospital admins, and patients see only their data'],['JWT Authentication','Supabase Auth with secure token management']].map(([title,desc]) => (
                  <div key={title} style={{ display:'flex', gap:12 }}>
                    <div style={{ width:18, height:18, borderRadius:'50%', background:'#ECFDF5', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke={S.success} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div><div style={{ fontSize:13, fontWeight:600, color:S.navy }}>{title}</div><div style={{ fontSize:11, color:S.muted }}>{desc}</div></div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {[['DPDP 2023','India data law','#ECFDF5',S.success],['NABH Ready','Hospital compliance','#EFF6FF',S.blue],['ISO 27001','Ready for audit','#F5F3FF',S.purple],['HIPAA Aligned','International standard','#FEF3C7',S.warning],['AES-256','Military grade encryption','#ECFDF5',S.success],['SOC 2','In progress','#EFF6FF',S.blue]].map(([title,sub,bg,color]) => (
                <div key={title} style={{ background:bg, borderRadius:14, padding:20, border:`0.5px solid ${color}20` }}>
                  <div style={{ fontSize:16, fontWeight:700, color, marginBottom:4 }}>{title}</div>
                  <div style={{ fontSize:11, color:S.muted }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── FAQ ── */}
      <Section>
        <div style={{ padding:'80px 40px', background:S.bg }}>
          <div style={{ maxWidth:760, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:48 }}>
              <h2 style={{ fontSize: isMobile ? 26 : 36, fontWeight:700, color:S.navy, letterSpacing:'-0.02em', margin:'0 0 12px' }}>Frequently asked questions</h2>
            </div>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ background:S.white, borderRadius:12, border:`0.5px solid ${S.border}`, marginBottom:10, overflow:'hidden' }}>
                <div onClick={() => setOpenFAQ(openFAQ===i?null:i)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px', cursor:'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background=S.bg}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <div style={{ fontSize:14, fontWeight:600, color:S.navy }}>{faq.q}</div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ transform:openFAQ===i?'rotate(180deg)':'none', transition:'transform 0.2s', flexShrink:0 }}><path d="M6 9l6 6 6-6" stroke={S.muted} strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
                {openFAQ===i && <div style={{ padding:'0 20px 16px', fontSize:13, color:S.muted, lineHeight:1.8 }}>{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── FINAL CTA ── */}
      <Section>
        <div style={{ padding:'80px 40px', background:S.navy, textAlign:'center' }}>
          <h2 style={{ fontSize: isMobile ? 28 : 40, fontWeight:700, color:'#fff', letterSpacing:'-0.02em', margin:'0 0 12px' }}>Ready to transform mental healthcare?</h2>
          <p style={{ fontSize:16, color:'rgba(255,255,255,0.55)', marginBottom:32, maxWidth:480, margin:'0 auto 32px' }}>Join clinicians and hospitals building better mental health outcomes with PsycheFlow.</p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={onGetStarted} style={{ padding:'13px 28px', background:S.blue, color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer' }}>Start Free — No Credit Card</button>
            <button onClick={onHospitalLanding} style={{ padding:'13px 28px', background:'rgba(255,255,255,0.08)', color:'#fff', border:'1px solid rgba(255,255,255,0.2)', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer' }}>Book Hospital Demo</button>
            <button onClick={onPsychLanding} style={{ padding:'13px 28px', background:'rgba(255,255,255,0.08)', color:'#fff', border:'1px solid rgba(255,255,255,0.2)', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer' }}>Psychologist Portal</button>
          </div>
        </div>
      </Section>

      {/* ── FOOTER ── */}
      <footer style={{ background:S.navy, borderTop:'0.5px solid rgba(255,255,255,0.08)', padding: isMobile ? '40px 24px' : '60px 80px 40px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(5,1fr)', gap:32, marginBottom:40 }}>
            <div style={{ gridColumn: isMobile ? 'span 2' : 'span 1' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                <div style={{ width:28, height:28, borderRadius:7, background:'linear-gradient(135deg,#1D4ED8,#0891B2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C9 1.5 4 5 4 10C4 12.8 6.2 15 9 15C11.8 15 14 12.8 14 10C14 5 9 1.5 9 1.5Z" fill="white" opacity="0.9"/><circle cx="9" cy="10" r="2.2" fill="#0C1A2E"/></svg>
                </div>
                <span style={{ fontSize:14, fontWeight:700, color:'#fff' }}><span style={{ color:'#93C5FD' }}>Psyche</span>Flow</span>
              </div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', lineHeight:1.7 }}>AI-powered mental health platform for patients, psychologists, and hospitals.</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:8 }}>psycheflow.in · support@psycheflow.in</div>
            </div>
            {[
              { title:'Product', links:[['Features',''],['Pricing', onPricing],['Roadmap',''],['Integrations',''],['API',''],['Changelog','']] },
              { title:'Solutions', links:[['For Hospitals', onHospitalLanding],['For Psychologists', onPsychLanding],['For Patients', onGetStarted],['Corporate Wellness',''],['Research Institutions','']] },
              { title:'Resources', links:[['Documentation',''],['Blog',''],['Research',''],['Help Center',''],['Case Studies','']] },
              { title:'Legal', links:[['Privacy Policy', () => onLegal('privacy')],['Terms of Service', () => onLegal('terms')],['DPDP Compliance', () => onLegal('dpdp')],['Security Policy',''],['Cookie Policy','']] },
            ].map(section => (
              <div key={section.title}>
                <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>{section.title}</div>
                {section.links.map(([label, action]) => (
                  <div key={label} onClick={() => typeof action === 'function' && action()} style={{ fontSize:13, color:'rgba(255,255,255,0.45)', marginBottom:8, cursor: typeof action === 'function' ? 'pointer' : 'default' }}
                    onMouseEnter={e => { if (typeof action === 'function') e.currentTarget.style.color='rgba(255,255,255,0.8)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color='rgba(255,255,255,0.45)'; }}>{label}</div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop:'0.5px solid rgba(255,255,255,0.08)', paddingTop:24, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)' }}>© 2026 PsycheFlow. Made in India. DPDP Act 2023 Compliant.</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)' }}>Crisis support: iCall 9152987821 · Vandrevala 1860-2662-345</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
