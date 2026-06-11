import React, { useState, useRef, useEffect } from 'react';

const S = { navy:'#0C1A2E', blue:'#1D4ED8', bg:'#F8FAFF', white:'#FFFFFF', border:'#E2EBF6', muted:'#3B5998', hint:'#94a3b8', lightBlue:'#EFF6FF', success:'#059669', warning:'#D97706', danger:'#DC2626', cyan:'#0891B2', purple:'#7C3AED' };

const FAQS = [
  { q:'How long does implementation take?', a:'Most hospitals are fully deployed within 5-7 business days. We provide dedicated implementation support, staff training, and go-live assistance on all Hospital plans.' },
  { q:'Can PsycheFlow integrate with our existing HIS?', a:'Integration APIs are available on Professional and Enterprise plans. We support HL7 FHIR data exchange and custom integrations scoped during onboarding.' },
  { q:'How does PsycheFlow help with NABH accreditation?', a:'Our NABH module tracks all required clinical quality indicators, generates audit-ready reports, documents incidents, and maintains staff training records — all mapped to NABH standards.' },
  { q:'Where is hospital data stored?', a:'Data is stored in Supabase Singapore (ap-southeast-1) with AES-256 encryption. Enterprise plans support custom data residency including India-region storage.' },
  { q:'Can multiple departments use PsycheFlow?', a:'Yes. PsycheFlow supports multi-department deployment with role-based access. Psychiatry, psychology, OPD, IPD, pharmacy, and billing teams all have dedicated modules.' },
  { q:'Is there a free trial?', a:'We offer a 30-day pilot for qualified hospital buyers. Contact our sales team to schedule an evaluation.' },
];

function useInView(ref) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.1 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return inView;
}
function Section({ children, style }) {
  const ref = useRef();
  const inView = useInView(ref);
  return <div ref={ref} style={{ opacity:inView?1:0, transform:inView?'translateY(0)':'translateY(24px)', transition:'opacity 0.5s ease, transform 0.5s ease', ...style }}>{children}</div>;
}

export default function HospitalLanding({ onBack, onGetStarted, onContact }) {
  const [openFAQ, setOpenFAQ] = useState(null);
  const [form, setForm] = useState({ name:'', email:'', hospital:'', city:'', role:'', size:'', challenge:[], useCase:[] });
  const [submitted, setSubmitted] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    const h = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.hospital) return;
    setSubmitted(true);
  };

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior:'smooth' });

  return (
    <div style={{ fontFamily:"'Satoshi',-apple-system,sans-serif", background:S.bg, overflowX:'hidden' }}>

      {/* NAV */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, background: navScrolled?'rgba(255,255,255,0.95)':'transparent', backdropFilter:navScrolled?'blur(12px)':'none', borderBottom:navScrolled?`0.5px solid ${S.border}`:'none', transition:'all 0.3s', height:64, display:'flex', alignItems:'center', padding:'0 40px' }}>
        <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:10, background:'none', border:'none', cursor:'pointer', marginRight:32 }}>
          <div style={{ width:30, height:30, borderRadius:7, background:'linear-gradient(135deg,#1D4ED8,#0891B2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C9 1.5 4 5 4 10C4 12.8 6.2 15 9 15C11.8 15 14 12.8 14 10C14 5 9 1.5 9 1.5Z" fill="white" opacity="0.9"/><circle cx="9" cy="10" r="2.2" fill="#0C1A2E"/></svg>
          </div>
          <span style={{ fontSize:15, fontWeight:700, color:navScrolled?S.navy:'#fff' }}><span style={{ color:navScrolled?S.blue:'#93C5FD' }}>Psyche</span>Flow <span style={{ fontWeight:400, opacity:0.6 }}>for Hospitals</span></span>
        </button>
        {!isMobile && (
          <div style={{ display:'flex', gap:4, flex:1 }}>
            {[['Product Tour','tour'],['Workflow','workflow'],['NABH','nabh'],['Security','security'],['ROI','roi']].map(([label, id]) => (
              <button key={label} onClick={() => scrollTo(id)} style={{ padding:'6px 12px', background:'none', border:'none', fontSize:13, color:navScrolled?S.muted:'rgba(255,255,255,0.7)', cursor:'pointer', borderRadius:7 }}
                onMouseEnter={e => e.currentTarget.style.color=navScrolled?S.navy:'#fff'}
                onMouseLeave={e => e.currentTarget.style.color=navScrolled?S.muted:'rgba(255,255,255,0.7)'}>{label}</button>
            ))}
          </div>
        )}
        <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
          <button onClick={onBack} style={{ padding:'7px 14px', background:'transparent', border:`1px solid ${navScrolled?S.border:'rgba(255,255,255,0.3)'}`, color:navScrolled?S.muted:'rgba(255,255,255,0.9)', borderRadius:8, fontSize:13, cursor:'pointer' }}>← Back</button>
          <button onClick={onGetStarted} style={{ padding:'7px 14px', background:'transparent', border:`1px solid ${navScrolled?S.border:'rgba(255,255,255,0.3)'}`, color:navScrolled?S.muted:'rgba(255,255,255,0.85)', borderRadius:8, fontSize:13, cursor:'pointer', fontWeight:500 }}>Hospital Login</button>
          <button onClick={() => scrollTo('demo')} style={{ padding:'8px 18px', background:S.blue, color:'#fff', border:'none', borderRadius:9, fontSize:13, fontWeight:600, cursor:'pointer' }}>Book Demo</button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background:`linear-gradient(135deg, ${S.navy} 0%, #1a3a6b 100%)`, minHeight:'100vh', display:'flex', alignItems:'center', padding:'80px 40px 60px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:60, alignItems:'center' }}>
          <div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 14px', borderRadius:100, background:'rgba(29,78,216,0.2)', border:'1px solid rgba(29,78,216,0.3)', marginBottom:24 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e' }}/>
              <span style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.7)', letterSpacing:'0.04em' }}>HOSPITAL PSYCHIATRY OPERATING SYSTEM</span>
            </div>
            <h1 style={{ fontSize:isMobile?32:50, fontWeight:700, color:'#fff', letterSpacing:'-0.03em', lineHeight:1.15, margin:'0 0 20px' }}>
              Reduce Intake Time<br/>
              <span style={{ color:'#6EE7B7' }}>by 40%.</span>
            </h1>
            <p style={{ fontSize:17, color:'rgba(255,255,255,0.65)', lineHeight:1.7, marginBottom:32, maxWidth:460 }}>
              Automate mental health assessments, clinical documentation, crisis monitoring, and NABH reporting. One platform for your entire psychiatry department.
            </p>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:40 }}>
              <button onClick={() => scrollTo('demo')} style={{ padding:'13px 28px', background:S.blue, color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer' }}>Book Hospital Demo</button>
              <button onClick={() => scrollTo('tour')} style={{ padding:'13px 28px', background:'rgba(255,255,255,0.08)', color:'#fff', border:'1px solid rgba(255,255,255,0.2)', borderRadius:10, fontSize:14, cursor:'pointer' }}>See Product Tour</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:16 }}>
              {[['40%','Reduction in intake time'],['60%','Less documentation effort'],['14','Clinical assessments'],['100%','Audit trail coverage']].map(([val, label]) => (
                <div key={label} style={{ background:'rgba(255,255,255,0.05)', borderRadius:10, padding:'14px 16px', border:'1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize:24, fontWeight:700, color:'#6EE7B7' }}>{val}</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)', marginTop:3 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
          {!isMobile && (
            <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:20, border:'1px solid rgba(255,255,255,0.08)', padding:20 }}>
              <div style={{ display:'flex', gap:6, marginBottom:14 }}>
                {['#ff5f57','#febc2e','#28c840'].map(c=><div key={c} style={{ width:9,height:9,borderRadius:'50%',background:c }}/>)}
              </div>
              <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>Hospital Command Center — Apollo Hospital, Ghaziabad</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:14 }}>
                {[['24','OPD','#93C5FD'],['8','IPD','#A5B4FC'],['₹1.2L','Revenue','#6EE7B7'],['2','Alerts','#FCA5A5']].map(([val,label,color])=>(
                  <div key={label} style={{ background:'rgba(255,255,255,0.05)', borderRadius:8, padding:'10px 8px', textAlign:'center' }}>
                    <div style={{ fontSize:16, fontWeight:700, color }}>{val}</div>
                    <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', marginTop:2 }}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{ background:'rgba(220,38,38,0.15)', borderRadius:10, padding:'10px 12px', border:'1px solid rgba(220,38,38,0.3)', marginBottom:10 }}>
                <div style={{ fontSize:10, color:'#FCA5A5', fontWeight:700, marginBottom:4 }}>CRISIS ALERT</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.7)' }}>Patient BED-04 · PHQ-9 crossed 20 · Psychologist notified</div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {['OPD Queue','Lab Kanban','Pharmacy','Billing RCM'].map(m=>(
                  <div key={m} style={{ background:'rgba(255,255,255,0.04)', borderRadius:8, padding:'8px 10px', fontSize:11, color:'rgba(255,255,255,0.5)', border:'1px solid rgba(255,255,255,0.06)' }}>{m}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* HOSPITAL PROBLEMS */}
      <Section>
        <div style={{ padding:'80px 40px', background:S.white }}>
          <div style={{ maxWidth:1100, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:48 }}>
              <h2 style={{ fontSize:isMobile?26:36, fontWeight:700, color:S.navy, letterSpacing:'-0.02em', margin:'0 0 12px' }}>The problems every hospital psychiatry department faces</h2>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(3,1fr)', gap:20 }}>
              {[
                { title:'Intake Bottleneck', problem:'Manual paper assessments create 2-3 hour queues in psychiatry OPD, leading to lost consultations and patient dissatisfaction.', cost:'Avg 8 patients lost per day · ₹40,000+ revenue/day', solution:'Digital PHQ-9 sent before appointment · Assessment completed in 12 minutes · Doctor sees summary on arrival', icon:S.danger },
                { title:'Documentation Burden', problem:'Psychiatrists spend 40-60% of their time on paperwork instead of patient care. Illegible notes create compliance risks.', cost:'2-3 hours/day per doctor · High burnout · NABH risk', solution:'AI generates SOAP notes during session · BIRP/DAP templates · One-click documentation', icon:S.warning },
                { title:'No Risk Monitoring', problem:'High-risk patients fall through the cracks between sessions. Suicide risk escalations happen without warning systems.', cost:'Undetected crises · Legal liability · Poor outcomes', solution:'PHQ-9 trajectory monitoring · Automated alerts · Full escalation chain with audit trail', icon:S.blue },
              ].map(item => (
                <div key={item.title} style={{ background:S.bg, borderRadius:16, padding:24, border:`0.5px solid ${S.border}` }}>
                  <div style={{ width:40, height:40, borderRadius:10, background:item.icon+'15', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
                    <div style={{ width:12, height:12, borderRadius:'50%', background:item.icon }}/>
                  </div>
                  <div style={{ fontSize:15, fontWeight:700, color:S.navy, marginBottom:8 }}>{item.title}</div>
                  <div style={{ fontSize:13, color:S.muted, lineHeight:1.6, marginBottom:12 }}>{item.problem}</div>
                  <div style={{ padding:'8px 12px', background:'#FEF2F2', borderRadius:8, fontSize:12, color:S.danger, fontWeight:500, marginBottom:12 }}>{item.cost}</div>
                  <div style={{ padding:'8px 12px', background:'#ECFDF5', borderRadius:8, fontSize:12, color:S.success, fontWeight:500 }}>✓ {item.solution}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* PRODUCT TOUR */}
      <Section>
        <div id="tour" style={{ padding:'80px 40px', background:S.bg }}>
          <div style={{ maxWidth:1100, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:48 }}>
              <div style={{ display:'inline-block', padding:'4px 14px', borderRadius:100, background:S.lightBlue, color:S.blue, fontSize:12, fontWeight:600, letterSpacing:'0.04em', textTransform:'uppercase', marginBottom:14 }}>Product Tour</div>
              <h2 style={{ fontSize:isMobile?26:36, fontWeight:700, color:S.navy, letterSpacing:'-0.02em', margin:0 }}>Every module your psychiatry department needs</h2>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(3,1fr)', gap:16 }}>
              {[
                { title:'Hospital Dashboard', desc:'Command center with live KPIs — OPD queue, IPD census, revenue, crisis flags, and lab pending — all on one screen.', icon:S.blue, features:['Live OPD queue with wait times','IPD bed status real-time','Revenue today vs yesterday','Crisis flag counter'] },
                { title:'OPD Management', desc:'Digital token system with automated SMS alerts. Priority queue management with crisis escalation.', icon:S.success, features:['Digital tokens with SMS','Priority: Normal/Urgent/Crisis','AI-powered triage','Wait time tracking'] },
                { title:'EHR & Clinical Notes', desc:'AI-generated SOAP/DAP/BIRP notes. Structured vitals entry. Full clinical timeline.', icon:S.purple, features:['AI SOAP generation','8-field vitals entry','Clinical timeline view','Prescription management'] },
                { title:'Pharmacy & Lab', desc:'Inventory management with expiry alerts. Lab Kanban board: Ordered → Processing → Resulted.', icon:S.warning, features:['Stock level monitoring','Expiry alerts','Lab order tracking','Results entry'] },
                { title:'Billing & RCM', desc:'Complete revenue cycle management — charges, payments, insurance claims, refunds, and aging reports.', icon:S.cyan, features:['Invoice generation','Insurance/TPA claims','Payment tracking','GST-ready reports'] },
                { title:'NABH Compliance', desc:'Audit-ready reports, incident logging, quality indicators, and staff training records — all NABH mapped.', icon:S.danger, features:['Quality indicators','Incident reports','Audit trail','NABH mapping'] },
              ].map(module => (
                <div key={module.title} style={{ background:S.white, borderRadius:14, padding:22, border:`0.5px solid ${S.border}`, boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ width:36, height:36, borderRadius:9, background:module.icon+'15', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
                    <div style={{ width:12, height:12, borderRadius:'50%', background:module.icon }}/>
                  </div>
                  <div style={{ fontSize:14, fontWeight:700, color:S.navy, marginBottom:6 }}>{module.title}</div>
                  <div style={{ fontSize:12, color:S.muted, lineHeight:1.6, marginBottom:12 }}>{module.desc}</div>
                  {module.features.map(f => (
                    <div key={f} style={{ display:'flex', gap:6, marginBottom:5 }}>
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ flexShrink:0, marginTop:2 }}><path d="M3 8l4 4 6-7" stroke={module.icon} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span style={{ fontSize:12, color:S.navy }}>{f}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* WORKFLOW */}
      <Section>
        <div id="workflow" style={{ padding:'80px 40px', background:S.navy }}>
          <div style={{ maxWidth:900, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:60 }}>
              <h2 style={{ fontSize:isMobile?26:36, fontWeight:700, color:'#fff', letterSpacing:'-0.02em', margin:0 }}>How a patient flows through PsycheFlow</h2>
            </div>
            <div style={{ display:'grid', gap:0 }}>
              {[
                { n:'01', title:'Patient Enters Hospital', desc:'Receptionist registers patient. Assessment link sent via SMS automatically.', color:'#93C5FD' },
                { n:'02', title:'Digital Assessment Completed', desc:'Patient completes PHQ-9, GAD-7 on mobile. Takes 12 minutes. No paper.', color:'#6EE7B7' },
                { n:'03', title:'Risk Scored Automatically', desc:'AI assigns risk level (Low/Moderate/High/Critical). PHQ spike triggers immediate alert.', color:'#FCD34D' },
                { n:'04', title:'Psychiatrist Receives Summary', desc:'Pre-session brief ready: latest scores, mood trends, risk flags, journal themes.', color:'#A5B4FC' },
                { n:'05', title:'Consultation + SOAP Generated', desc:'Doctor conducts session. AI generates SOAP notes. Prescription recorded digitally.', color:'#F9A8D4' },
                { n:'06', title:'Progress Tracked Automatically', desc:'PHQ-9 trajectory updated. Outcome analytics refreshed. NABH indicators recorded.', color:'#6EE7B7' },
              ].map((step, i) => (
                <div key={i} style={{ display:'flex', gap:20, paddingBottom:24, position:'relative' }}>
                  {i < 5 && <div style={{ position:'absolute', left:19, top:40, bottom:0, width:2, background:'rgba(255,255,255,0.08)' }}/>}
                  <div style={{ width:40, height:40, borderRadius:'50%', background:step.color+'20', border:`2px solid ${step.color}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, zIndex:1 }}>
                    <span style={{ fontSize:11, fontWeight:700, color:step.color }}>{step.n}</span>
                  </div>
                  <div style={{ paddingTop:8 }}>
                    <div style={{ fontSize:15, fontWeight:700, color:'#fff', marginBottom:4 }}>{step.title}</div>
                    <div style={{ fontSize:13, color:'rgba(255,255,255,0.5)', lineHeight:1.6 }}>{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ROI CALCULATOR */}
      <Section>
        <div id="roi" style={{ padding:'80px 40px', background:S.white }}>
          <div style={{ maxWidth:900, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:48 }}>
              <div style={{ display:'inline-block', padding:'4px 14px', borderRadius:100, background:'#ECFDF5', color:S.success, fontSize:12, fontWeight:600, letterSpacing:'0.04em', textTransform:'uppercase', marginBottom:14 }}>ROI Calculator</div>
              <h2 style={{ fontSize:isMobile?26:36, fontWeight:700, color:S.navy, letterSpacing:'-0.02em', margin:0 }}>What PsycheFlow saves your hospital</h2>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(3,1fr)', gap:20, marginBottom:32 }}>
              {[
                { metric:'Intake Time', before:'20 min/patient', after:'12 min/patient', saving:'40% reduction', color:S.blue },
                { metric:'Documentation Time', before:'2 hours/doctor/day', after:'25 minutes/day', saving:'7.5 hours/week saved', color:S.purple },
                { metric:'Crisis Detection', before:'Manual review', after:'Automated real-time', saving:'Catches risk 48h earlier', color:S.danger },
              ].map(item => (
                <div key={item.metric} style={{ background:S.bg, borderRadius:14, padding:24, border:`0.5px solid ${S.border}` }}>
                  <div style={{ fontSize:13, fontWeight:700, color:item.color, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:16 }}>{item.metric}</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
                    <div style={{ background:'#FEF2F2', borderRadius:8, padding:'10px', textAlign:'center' }}>
                      <div style={{ fontSize:11, color:S.danger, marginBottom:4 }}>Before</div>
                      <div style={{ fontSize:12, fontWeight:700, color:S.navy }}>{item.before}</div>
                    </div>
                    <div style={{ background:'#ECFDF5', borderRadius:8, padding:'10px', textAlign:'center' }}>
                      <div style={{ fontSize:11, color:S.success, marginBottom:4 }}>After</div>
                      <div style={{ fontSize:12, fontWeight:700, color:S.navy }}>{item.after}</div>
                    </div>
                  </div>
                  <div style={{ fontSize:13, fontWeight:700, color:item.color, textAlign:'center' }}>{item.saving}</div>
                </div>
              ))}
            </div>
            <div style={{ background:`linear-gradient(135deg,${S.navy},#1a3a6b)`, borderRadius:16, padding:28, textAlign:'center' }}>
              <div style={{ fontSize:14, color:'rgba(255,255,255,0.5)', marginBottom:8 }}>For a hospital with 100 psychiatry patients/day</div>
              <div style={{ fontSize:32, fontWeight:700, color:'#6EE7B7', marginBottom:4 }}>800 minutes saved daily</div>
              <div style={{ fontSize:14, color:'rgba(255,255,255,0.6)' }}>= 13.3 staff hours = ₹8,000+ value per day</div>
            </div>
          </div>
        </div>
      </Section>

      {/* NABH */}
      <Section>
        <div id="nabh" style={{ padding:'80px 40px', background:S.bg }}>
          <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:60, alignItems:'center' }}>
            <div>
              <div style={{ display:'inline-block', padding:'4px 14px', borderRadius:100, background:S.lightBlue, color:S.blue, fontSize:12, fontWeight:600, letterSpacing:'0.04em', textTransform:'uppercase', marginBottom:16 }}>NABH Ready</div>
              <h2 style={{ fontSize:isMobile?26:34, fontWeight:700, color:S.navy, letterSpacing:'-0.02em', margin:'0 0 16px' }}>Built for NABH-accredited hospitals</h2>
              <p style={{ fontSize:15, color:S.muted, lineHeight:1.7, marginBottom:24 }}>PsycheFlow maps every module to NABH Mental Health Standards. Audit prep that used to take weeks takes hours.</p>
              {[['Patient safety indicators','PHQ-9, GAD-7, risk scoring tracked'],['Clinical documentation','Structured EHR with mandatory fields'],['Incident management','Adverse events logged with root cause'],['Staff training records','Competency tracking per NABH requirements'],['Quality dashboard','Real-time NABH indicators'],['Audit export','One-click audit-ready PDF reports']].map(([title,desc]) => (
                <div key={title} style={{ display:'flex', gap:10, marginBottom:12 }}>
                  <div style={{ width:20, height:20, borderRadius:'50%', background:'#EFF6FF', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke={S.blue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:S.navy }}>{title}</div>
                    <div style={{ fontSize:11, color:S.muted }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background:S.white, borderRadius:16, padding:28, border:`0.5px solid ${S.border}` }}>
              <div style={{ fontSize:13, fontWeight:700, color:S.navy, marginBottom:20 }}>NABH Compliance Checklist</div>
              {[['Patient identification & registration','Complete'],['Clinical documentation (EHR)','Complete'],['Medication management (Pharmacy)','Complete'],['Laboratory information system','Complete'],['Billing transparency','Complete'],['Incident reporting','Complete'],['Quality indicators dashboard','Complete'],['Staff credentialing','In Progress'],['Infection control module','Planned']].map(([item, status]) => (
                <div key={item} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:`0.5px solid ${S.border}` }}>
                  <span style={{ fontSize:12, color:S.navy }}>{item}</span>
                  <span style={{ fontSize:11, fontWeight:600, color:status==='Complete'?S.success:status==='In Progress'?S.warning:S.hint }}>{status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* SECURITY */}
      <Section>
        <div id="security" style={{ padding:'80px 40px', background:S.white }}>
          <div style={{ maxWidth:1100, margin:'0 auto', textAlign:'center' }}>
            <div style={{ display:'inline-block', padding:'4px 14px', borderRadius:100, background:'#ECFDF5', color:S.success, fontSize:12, fontWeight:600, letterSpacing:'0.04em', textTransform:'uppercase', marginBottom:16 }}>Security</div>
            <h2 style={{ fontSize:isMobile?26:34, fontWeight:700, color:S.navy, letterSpacing:'-0.02em', margin:'0 0 12px' }}>Hospital data protected at every layer</h2>
            <p style={{ fontSize:15, color:S.muted, maxWidth:480, margin:'0 auto 40px' }}>Clinical data requires the highest security standards. PsycheFlow is built accordingly.</p>
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'repeat(2,1fr)':'repeat(4,1fr)', gap:16 }}>
              {[['AES-256','Encryption at rest','#ECFDF5',S.success],['TLS 1.3','In-transit encryption','#EFF6FF',S.blue],['RLS','Row-level isolation','#F5F3FF',S.purple],['DPDP 2023','India data law','#ECFDF5',S.success],['Audit Logs','Immutable trail','#EFF6FF',S.blue],['RBAC','Role-based access','#F5F3FF',S.purple],['JWT Auth','Secure sessions','#FEF3C7',S.warning],['Backups','Daily Supabase','#ECFDF5',S.success]].map(([title,sub,bg,color]) => (
                <div key={title} style={{ background:bg, borderRadius:12, padding:'20px 16px', textAlign:'center' }}>
                  <div style={{ fontSize:18, fontWeight:700, color, marginBottom:4 }}>{title}</div>
                  <div style={{ fontSize:11, color:S.muted }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section>
        <div style={{ padding:'80px 40px', background:S.bg }}>
          <div style={{ maxWidth:760, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:40 }}>
              <h2 style={{ fontSize:isMobile?24:32, fontWeight:700, color:S.navy, letterSpacing:'-0.02em', margin:0 }}>Hospital FAQs</h2>
            </div>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ background:S.white, borderRadius:12, border:`0.5px solid ${S.border}`, marginBottom:10, overflow:'hidden' }}>
                <div onClick={() => setOpenFAQ(openFAQ===i?null:i)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px', cursor:'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background=S.bg} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <div style={{ fontSize:14, fontWeight:600, color:S.navy }}>{faq.q}</div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ transform:openFAQ===i?'rotate(180deg)':'none', transition:'transform 0.2s', flexShrink:0 }}><path d="M6 9l6 6 6-6" stroke={S.muted} strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
                {openFAQ===i && <div style={{ padding:'0 20px 16px', fontSize:13, color:S.muted, lineHeight:1.8 }}>{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* DEMO FORM */}
      <Section>
        <div id="demo" style={{ padding:'80px 40px', background:S.navy }}>
          <div style={{ maxWidth:680, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:40 }}>
              <h2 style={{ fontSize:isMobile?26:36, fontWeight:700, color:'#fff', letterSpacing:'-0.02em', margin:'0 0 12px' }}>Book a Hospital Demo</h2>
              <p style={{ fontSize:15, color:'rgba(255,255,255,0.5)' }}>See PsycheFlow deployed for your psychiatry department. 30-minute session with clinical and technical team.</p>
            </div>
            {submitted ? (
              <div style={{ background:'rgba(255,255,255,0.05)', borderRadius:16, padding:40, textAlign:'center', border:'1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ width:56, height:56, borderRadius:'50%', background:'rgba(34,197,94,0.2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div style={{ fontSize:20, fontWeight:700, color:'#fff', marginBottom:8 }}>Request Received</div>
                <div style={{ fontSize:14, color:'rgba(255,255,255,0.5)' }}>Our team will contact you within 24 hours to schedule your demo.</div>
              </div>
            ) : (
              <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:16, padding:32, border:'1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:14, marginBottom:14 }}>
                  {[['Your Name *','name','text','Dr. Rajesh Kumar'],['Work Email *','email','email','rajesh@hospital.com'],['Hospital Name *','hospital','text','Apollo Hospital'],['City','city','text','Delhi']].map(([label,field,type,placeholder]) => (
                    <div key={field}>
                      <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.5)', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.04em' }}>{label}</div>
                      <input type={type} value={form[field]} onChange={e => setForm({...form,[field]:e.target.value})} placeholder={placeholder}
                        style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.06)', color:'#fff', fontSize:13, outline:'none', boxSizing:'border-box', fontFamily:"'Satoshi',-apple-system,sans-serif" }}/>
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.5)', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.04em' }}>Your Role *</div>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {['Psychiatrist','Psychologist','Medical Superintendent','HOD','Administrator','CEO','IT Head'].map(role => (
                      <button key={role} onClick={() => setForm({...form,role})}
                        style={{ padding:'6px 14px', borderRadius:100, fontSize:12, fontWeight:form.role===role?700:400, background:form.role===role?S.blue:'rgba(255,255,255,0.06)', color:'#fff', border:`1px solid ${form.role===role?S.blue:'rgba(255,255,255,0.12)'}`, cursor:'pointer' }}>{role}</button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.5)', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.04em' }}>Hospital Size</div>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {['< 50 beds','50-200 beds','200-500 beds','500+ beds'].map(size => (
                      <button key={size} onClick={() => setForm({...form,size})}
                        style={{ padding:'6px 14px', borderRadius:100, fontSize:12, fontWeight:form.size===size?700:400, background:form.size===size?S.blue:'rgba(255,255,255,0.06)', color:'#fff', border:`1px solid ${form.size===size?S.blue:'rgba(255,255,255,0.12)'}`, cursor:'pointer' }}>{size}</button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom:20 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.5)', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.04em' }}>Current Challenges (select all that apply)</div>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {['Paper Assessments','No Analytics','Poor Documentation','No Risk Monitoring','NABH Compliance','Billing Issues'].map(ch => (
                      <button key={ch} onClick={() => setForm(f => ({ ...f, challenge: f.challenge.includes(ch) ? f.challenge.filter(x=>x!==ch) : [...f.challenge,ch] }))}
                        style={{ padding:'6px 12px', borderRadius:100, fontSize:12, fontWeight:form.challenge.includes(ch)?700:400, background:form.challenge.includes(ch)?S.blue:'rgba(255,255,255,0.06)', color:'#fff', border:`1px solid ${form.challenge.includes(ch)?S.blue:'rgba(255,255,255,0.12)'}`, cursor:'pointer' }}>{ch}</button>
                    ))}
                  </div>
                </div>
                <button onClick={handleSubmit} disabled={!form.name||!form.email||!form.hospital}
                  style={{ width:'100%', padding:'12px', background:S.blue, color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer', opacity:(!form.name||!form.email||!form.hospital)?0.6:1 }}>
                  Book My Demo →
                </button>
              </div>
            )}
          </div>
        </div>
      </Section>
    </div>
  );
}
