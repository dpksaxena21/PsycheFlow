import React, { useState, useEffect, useRef } from 'react';

const S = {
  navy:'#0C1A2E', blue:'#1D4ED8', bg:'#ffffff', bg2:'#F8FAFF',
  border:'#E5E7EB', muted:'#6B7280', hint:'#9CA3AF',
  success:'#059669', warning:'#D97706', danger:'#DC2626',
  text:'#111827', textSub:'#4B5563',
};

// ── SVG Icons ────────────────────────────────────────────
const Icon = {
  shield: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={S.blue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  lock: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke={S.blue} strokeWidth="1.5"/><path d="M7 11V7a5 5 0 0110 0v4" stroke={S.blue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  log: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={S.blue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><polyline points="14 2 14 8 20 8" stroke={S.blue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><line x1="16" y1="13" x2="8" y2="13" stroke={S.blue} strokeWidth="1.5" strokeLinecap="round"/><line x1="16" y1="17" x2="8" y2="17" stroke={S.blue} strokeWidth="1.5" strokeLinecap="round"/></svg>,
  user: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={S.blue} strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="7" r="4" stroke={S.blue} strokeWidth="1.5"/></svg>,
  block: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={S.blue} strokeWidth="1.5"/><path d="M4.93 4.93l14.14 14.14" stroke={S.blue} strokeWidth="1.5" strokeLinecap="round"/></svg>,
  pulse: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke={S.blue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  check: (color='#059669') => <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  arrow: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chevron: (dir='down') => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ transform:dir==='up'?'rotate(180deg)':'none', transition:'transform 0.2s' }}><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  alert: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="9" x2="12" y2="13" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="17" r="1" fill="#DC2626"/></svg>,
  chart: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="#1D4ED8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  brain: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9.5 2A2.5 2.5 0 007 4.5v1A2.5 2.5 0 004.5 8v1A2.5 2.5 0 002 11.5C2 13 3 14.3 4.5 14.8V17a5 5 0 005 5h5a5 5 0 005-5v-2.2c1.5-.5 2.5-1.8 2.5-3.3A2.5 2.5 0 0019.5 9V8A2.5 2.5 0 0017 5.5v-1A2.5 2.5 0 0014.5 2h-5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  clipboard: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  hospital: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 22V12h6v10M12 7v6M9 10h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  trend: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><polyline points="17 6 23 6 23 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

// ── Mini PHQ trend chart ─────────────────────────────────
function PHQChart({ data, color }) {
  const max = Math.max(...data);
  const w = 80, h = 36;
  const pts = data.map((v,i) => `${(i/(data.length-1))*w},${h - (v/max)*h}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow:'visible' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {data.map((v,i) => (
        <circle key={i} cx={(i/(data.length-1))*w} cy={h-(v/max)*h} r="2.5" fill={color}/>
      ))}
    </svg>
  );
}

// ── Animated counter ─────────────────────────────────────
function Counter({ target, suffix='', duration=1200 }) {
  const [count, setCount] = useState(0);
  const ref = useRef();
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      let start = 0;
      const step = target / (duration / 16);
      const timer = setInterval(() => {
        start += step;
        if (start >= target) { setCount(target); clearInterval(timer); }
        else setCount(Math.floor(start));
      }, 16);
      observer.disconnect();
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ── Portal tab dashboards ────────────────────────────────
function PatientDash() {
  const [activeTab, setActiveTab] = useState('overview');
  return (
    <div style={{ background:'#F8FAFF', borderRadius:10, padding:16, fontSize:12 }}>
      <div style={{ display:'flex', gap:8, marginBottom:14 }}>
        {['overview','assessment','journal'].map(t=>(
          <div key={t} onClick={()=>setActiveTab(t)} style={{ padding:'4px 10px', borderRadius:6, cursor:'pointer', fontSize:11, fontWeight:600, background:activeTab===t?S.blue:'transparent', color:activeTab===t?'#fff':S.muted, border:`1px solid ${activeTab===t?S.blue:S.border}`, textTransform:'capitalize', transition:'all 0.15s' }}>{t}</div>
        ))}
      </div>
      {activeTab==='overview' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <div>
              <div style={{ fontSize:10, color:S.muted }}>Wellness Score</div>
              <div style={{ fontSize:28, fontWeight:700, color:S.navy }}>74<span style={{ fontSize:14, color:S.muted }}>/100</span></div>
            </div>
            <PHQChart data={[18,14,11,9,7,5]} color={S.success}/>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
            {[['PHQ-9','5','↓ Improving',S.success],['GAD-7','4','↓ Minimal',S.success],['Streak','12d','Journal active',S.blue]].map(([l,v,s,c])=>(
              <div key={l} style={{ background:'#fff', borderRadius:7, padding:'9px 10px', border:`1px solid ${S.border}` }}>
                <div style={{ fontSize:9, color:S.muted }}>{l}</div>
                <div style={{ fontSize:16, fontWeight:700, color:c }}>{v}</div>
                <div style={{ fontSize:9, color:c }}>{s}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:10, background:'#EFF6FF', borderRadius:7, padding:'8px 10px', border:`1px solid #BFDBFE` }}>
            <div style={{ fontSize:9, fontWeight:700, color:S.blue, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:3 }}>AI Insight</div>
            <div style={{ fontSize:11, color:S.textSub }}>Your PHQ-9 dropped 13 points in 6 weeks. Sleep consistency is your biggest protective factor.</div>
          </div>
        </div>
      )}
      {activeTab==='assessment' && (
        <div>
          <div style={{ fontSize:12, fontWeight:600, color:S.navy, marginBottom:10 }}>PHQ-9 Depression Screening</div>
          {[['Little interest in activities','Not at all',0],['Feeling down or hopeless','Several days',1],['Trouble sleeping','More than half',2]].map(([q,a,score])=>(
            <div key={q} style={{ padding:'8px 0', borderBottom:`1px solid ${S.border}` }}>
              <div style={{ fontSize:11, color:S.textSub, marginBottom:4 }}>{q}</div>
              <div style={{ display:'flex', gap:6 }}>
                {['Not at all','Several days','More than half','Nearly every'].map(opt=>(
                  <div key={opt} style={{ padding:'3px 7px', borderRadius:5, fontSize:9, fontWeight:600, background:opt===a?S.blue:'#F1F5F9', color:opt===a?'#fff':S.muted, cursor:'pointer' }}>{opt.split(' ')[0]}</div>
                ))}
              </div>
            </div>
          ))}
          <div style={{ marginTop:10, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ fontSize:11, color:S.muted }}>Progress: 3/9</div>
            <div style={{ width:80, height:4, borderRadius:2, background:S.border }}>
              <div style={{ width:'33%', height:4, borderRadius:2, background:S.blue }}/>
            </div>
          </div>
        </div>
      )}
      {activeTab==='journal' && (
        <div>
          <div style={{ background:'#fff', borderRadius:7, padding:10, border:`1px solid ${S.border}`, marginBottom:10 }}>
            <div style={{ fontSize:10, color:S.muted, marginBottom:6 }}>Today · 2:14 PM</div>
            <div style={{ fontSize:12, color:S.textSub, lineHeight:1.6, fontStyle:'italic' }}>"Had a difficult meeting at work. Feeling overwhelmed but trying to use the breathing techniques from last session..."</div>
          </div>
          <div style={{ background:'#EFF6FF', borderRadius:7, padding:'8px 10px', border:`1px solid #BFDBFE` }}>
            <div style={{ fontSize:9, fontWeight:700, color:S.blue, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:3 }}>NLP Analysis</div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {['Work stress','Coping skills','Moderate anxiety'].map(t=>(
                <span key={t} style={{ fontSize:9, padding:'2px 7px', borderRadius:100, background:'#DBEAFE', color:S.blue, fontWeight:600 }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PsychDash() {
  const [activePatient, setActivePatient] = useState(0);
  const patients = [
    { name:'Priya Sharma', phq:[18,14,11,9,7,5], risk:'Low', status:'Improving', last:'2 days ago', nextSession:'2:30 PM today', brief:'PHQ-9 improved significantly. Focus: sleep hygiene and work boundary-setting.' },
    { name:'Rahul Mehta', phq:[11,12,14,16,19,22], risk:'High', status:'Deteriorating', last:'1 day ago', nextSession:'11:00 AM today', brief:'PHQ-9 spiked. Item 9 flagged. C-SSRS required before session. Crisis protocol on standby.' },
    { name:'Amit Verma', phq:[14,13,13,12,11,10], risk:'Moderate', status:'Stable', last:'5 days ago', nextSession:'4:00 PM today', brief:'Slow improvement. Burnout primary driver. Behavioural activation showing early results.' },
  ];
  const p = patients[activePatient];
  const riskColor = p.risk==='High'?S.danger:p.risk==='Moderate'?S.warning:S.success;
  return (
    <div style={{ background:'#F8FAFF', borderRadius:10, padding:16, fontSize:12 }}>
      <div style={{ display:'flex', gap:6, marginBottom:12 }}>
        {patients.map((pt,i)=>(
          <div key={pt.name} onClick={()=>setActivePatient(i)} style={{ flex:1, padding:'6px 8px', borderRadius:7, cursor:'pointer', background:activePatient===i?'#fff':'transparent', border:`1px solid ${activePatient===i?S.blue:S.border}`, transition:'all 0.15s' }}>
            <div style={{ fontSize:10, fontWeight:700, color:activePatient===i?S.navy:S.muted }}>{pt.name.split(' ')[0]}</div>
            <div style={{ width:8, height:8, borderRadius:'50%', background:pt.risk==='High'?S.danger:pt.risk==='Moderate'?S.warning:S.success, marginTop:3 }}/>
          </div>
        ))}
      </div>
      {p.risk==='High' && (
        <div style={{ background:'#FEF2F2', border:`1px solid #FECACA`, borderRadius:7, padding:'7px 10px', marginBottom:10, display:'flex', gap:7, alignItems:'center' }}>
          {Icon.alert}
          <div>
            <div style={{ fontSize:10, fontWeight:700, color:S.danger }}>High Risk — Review before session</div>
            <div style={{ fontSize:10, color:S.textSub }}>PHQ-9 Item 9 flagged · C-SSRS required</div>
          </div>
        </div>
      )}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:S.navy }}>{p.name}</div>
          <div style={{ fontSize:10, color:S.muted }}>Last session: {p.last} · Next: {p.nextSession}</div>
        </div>
        <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:100, background:p.risk==='High'?'#FEF2F2':p.risk==='Moderate'?'#FFFBEB':'#ECFDF5', color:riskColor }}>{p.risk} Risk</span>
      </div>
      <div style={{ marginBottom:10 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
          <div style={{ fontSize:10, color:S.muted }}>PHQ-9 Trend (6 weeks)</div>
          <div style={{ fontSize:11, fontWeight:700, color:p.phq[5]<p.phq[0]?S.success:S.danger }}>{p.phq[0]} → {p.phq[5]}</div>
        </div>
        <PHQChart data={p.phq} color={p.risk==='High'?S.danger:p.risk==='Moderate'?S.warning:S.success}/>
      </div>
      <div style={{ background:'#EFF6FF', borderRadius:7, padding:'8px 10px', border:`1px solid #BFDBFE` }}>
        <div style={{ fontSize:9, fontWeight:700, color:S.blue, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:3 }}>AI Pre-Session Brief</div>
        <div style={{ fontSize:11, color:S.textSub, lineHeight:1.6 }}>{p.brief}</div>
      </div>
    </div>
  );
}

function HospitalDash() {
  const [view, setView] = useState('opd');
  return (
    <div style={{ background:'#F8FAFF', borderRadius:10, padding:16, fontSize:12 }}>
      <div style={{ display:'flex', gap:8, marginBottom:12 }}>
        {['opd','analytics','nabh'].map(t=>(
          <div key={t} onClick={()=>setView(t)} style={{ padding:'4px 10px', borderRadius:6, cursor:'pointer', fontSize:11, fontWeight:600, background:view===t?S.navy:'transparent', color:view===t?'#fff':S.muted, border:`1px solid ${view===t?S.navy:S.border}`, textTransform:'uppercase', transition:'all 0.15s' }}>{t}</div>
        ))}
      </div>
      {view==='opd' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:10 }}>
            {[['24',S.blue,'OPD Today'],['3',S.danger,'High Risk'],['8','#7C3AED','Admitted'],['₹1.2L',S.success,'Revenue']].map(([v,c,l])=>(
              <div key={l} style={{ background:'#fff', borderRadius:7, padding:'8px', textAlign:'center', border:`1px solid ${S.border}` }}>
                <div style={{ fontSize:15, fontWeight:700, color:c }}>{v}</div>
                <div style={{ fontSize:8, color:S.muted, marginTop:1 }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ background:'#FEF2F2', border:`1px solid #FECACA`, borderRadius:7, padding:'8px 10px', marginBottom:8 }}>
            <div style={{ fontSize:10, fontWeight:700, color:S.danger, marginBottom:1 }}>Crisis Alert · BED-04</div>
            <div style={{ fontSize:10, color:S.textSub }}>PHQ-9 crossed 20 · Psychologist Mehta notified · 3 min ago</div>
          </div>
          {[['Rahul Mehta','BED-04',22,'Critical',S.danger],['Priya Sharma','OPD-12',5,'Improving',S.success],['Amit Verma','OPD-07',10,'Moderate',S.warning]].map(([name,id,phq,status,c])=>(
            <div key={name} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 0', borderBottom:`1px solid ${S.border}` }}>
              <div style={{ width:22, height:22, borderRadius:'50%', background:'#EFF6FF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, color:S.blue, flexShrink:0 }}>{name[0]}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:11, fontWeight:600, color:S.navy }}>{name}</div>
                <div style={{ fontSize:9, color:S.muted }}>{id}</div>
              </div>
              <div style={{ fontSize:11, fontWeight:700, color:c }}>PHQ {phq}</div>
              <div style={{ fontSize:9, fontWeight:600, padding:'2px 6px', borderRadius:4, background:c==='#059669'?'#ECFDF5':c===S.danger?'#FEF2F2':'#FFFBEB', color:c }}>{status}</div>
            </div>
          ))}
        </div>
      )}
      {view==='analytics' && (
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:S.navy, marginBottom:10 }}>Population Outcomes — Q2 2026</div>
          {[['Depression (PHQ-9)','Avg 14 → 8',57,'↓ 43%',S.success],['Anxiety (GAD-7)','Avg 11 → 6',55,'↓ 45%',S.success],['Burnout','Avg 16 → 11',69,'↓ 31%',S.warning],['Crisis Flags','High risk reduced',82,'↓ 18%',S.blue]].map(([label,sub,pct,change,color])=>(
            <div key={label} style={{ marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                <div>
                  <div style={{ fontSize:11, fontWeight:600, color:S.navy }}>{label}</div>
                  <div style={{ fontSize:9, color:S.muted }}>{sub}</div>
                </div>
                <div style={{ fontSize:12, fontWeight:700, color:color }}>{change}</div>
              </div>
              <div style={{ height:5, borderRadius:3, background:S.border }}>
                <div style={{ height:5, borderRadius:3, background:color, width:pct+'%', transition:'width 0.8s' }}/>
              </div>
            </div>
          ))}
        </div>
      )}
      {view==='nabh' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
            <div style={{ fontSize:11, fontWeight:700, color:S.navy }}>NABH Compliance</div>
            <div style={{ fontSize:11, fontWeight:700, color:S.success }}>11/14 Complete</div>
          </div>
          {[['Patient Identification & Registration','complete'],['Risk Assessment Protocol','complete'],['Crisis Management Procedure','complete'],['Medication Safety Checks','complete'],['Incident Reporting System','complete'],['Quality Indicator Tracking','in-progress'],['Staff Competency Records','in-progress'],['Audit Trail Documentation','complete']].map(([item,status])=>(
            <div key={item} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:`1px solid ${S.border}` }}>
              <span style={{ fontSize:10, color:S.textSub }}>{item}</span>
              <span style={{ fontSize:9, fontWeight:700, color:status==='complete'?S.success:S.warning }}>{status==='complete'?'✓ Done':'In Progress'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── FAQ ──────────────────────────────────────────────────
const FAQS = [
  { q:'Is PsycheFlow clinically validated?', a:'Yes. All 16 instruments — including PHQ-9, GAD-7, WHO-5, PCL-5, and Big Five — are internationally validated and peer-reviewed. Our AI risk models are trained on 50,000+ assessments.' },
  { q:'How does crisis detection work?', a:'The system monitors PHQ-9 item 9, C-SSRS responses, and journal sentiment in real time. When risk thresholds are crossed, the assigned psychologist and hospital admin are notified immediately.' },
  { q:'Is patient data stored in India?', a:'Data is stored in Singapore (ap-southeast-1) with AES-256 encryption. We are fully compliant with India\'s DPDP Act 2023. Patient data is never used to train AI models.' },
  { q:'Can hospitals integrate PsycheFlow with existing EMR?', a:'PsycheFlow offers REST API access for enterprise hospitals. FHIR-compatible data export is available on the Enterprise plan.' },
  { q:'What happens if a patient shows suicidal ideation?', a:'The system flags the entry immediately. The assigned psychologist receives an in-app alert and push notification. The patient is shown crisis resources including iCall and Vandrevala Foundation helplines.' },
];

// ── Main Component ───────────────────────────────────────
export default function Landing({ onGetStarted, onLegal, onPsychLanding, onHospitalLanding, onPricing }) {
  const [scrolled, setScrolled] = useState(false);
  const [showSolutions, setShowSolutions] = useState(false);
  const [portalTab, setPortalTab] = useState('patient');
  const [openFAQ, setOpenFAQ] = useState(null);
  const [workflowStep, setWorkflowStep] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    const onResize = () => setIsMobile(window.innerWidth < 768);
    const closeDropdown = (e) => { if (!e.target.closest?.('.solutions-dropdown')) setShowSolutions(false); };
    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onResize);
    window.addEventListener('click', closeDropdown);
    // Auto-advance workflow
    const t = setInterval(() => setWorkflowStep(s => (s+1)%5), 3000);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('click', closeDropdown);
      clearInterval(t);
    };
  }, []);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior:'smooth' });

  const workflowSteps = [
    { label:'Patient Assessment', sub:'16 instruments · 15 minutes', output:[['PHQ-9','Score 14 · Moderate'],['GAD-7','Score 9 · Mild'],['Risk','Moderate — flagged']], color:S.blue },
    { label:'AI Risk Analysis', sub:'30 ML models · SHAP explanations', output:[['Suicide Risk','Low — C-SSRS clear'],['Burnout','High — MBI 16/20'],['Themes','Sleep · Work · Isolation']], color:'#7C3AED' },
    { label:'Clinical Brief', sub:'Auto-generated before session', output:[['AI Summary','3-sentence brief ready'],['SOAP Draft','Template pre-filled'],['Suggestions','CBT + Sleep hygiene']], color:S.success },
    { label:'Consultation', sub:'Session workspace + notes', output:[['Session Timer','Running'],['Notes','SOAP auto-drafted'],['Homework','Assigned']], color:S.warning },
    { label:'Outcome Tracking', sub:'Population + individual analytics', output:[['PHQ-9 Trend','18→14→9→5 ↓72%'],['Sessions','6 complete'],['Status','In remission']], color:S.success },
  ];

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
          {!isMobile && (
            <div style={{ display:'flex', alignItems:'center', gap:28 }}>
              <div className="solutions-dropdown" style={{ position:'relative' }}>
                <span onClick={()=>setShowSolutions(s=>!s)} style={{ fontSize:14, color:S.muted, cursor:'pointer', fontWeight:500, display:'flex', alignItems:'center', gap:4 }}>
                  Solutions {Icon.chevron(showSolutions?'up':'down')}
                </span>
                {showSolutions && (
                  <div style={{ position:'absolute', top:'calc(100% + 12px)', left:-20, background:'#fff', borderRadius:12, border:`1px solid ${S.border}`, padding:8, minWidth:280, boxShadow:'0 8px 30px rgba(0,0,0,0.12)', zIndex:200 }}>
                    {[
                      { label:'For Patients', sub:'Assessment · Journaling · ACT Therapy', action:onGetStarted },
                      { label:'For Psychologists', sub:'SOAP Notes · AI Briefs · Telemedicine', action:onPsychLanding },
                      { label:'For Hospitals', sub:'Population Analytics · NABH · Crisis Detection', action:onHospitalLanding },
                    ].map(item=>(
                      <div key={item.label} onClick={()=>{ item.action(); setShowSolutions(false); }} style={{ padding:'10px 14px', borderRadius:8, cursor:'pointer', transition:'background 0.1s' }}
                        onMouseEnter={e=>e.currentTarget.style.background=S.bg2}
                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <div style={{ fontSize:13, fontWeight:600, color:S.navy }}>{item.label}</div>
                        <div style={{ fontSize:12, color:S.muted, marginTop:1 }}>{item.sub}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {[['Features','features'],['Research','instruments'],['Pricing','pricing'],['Security','security']].map(([label, id]) => (
                <span key={id} onClick={()=>id==='pricing'?onPricing?.():scrollTo(id)} style={{ fontSize:14, color:S.muted, cursor:'pointer', fontWeight:500, transition:'color 0.15s' }}
                  onMouseEnter={e=>e.target.style.color=S.navy} onMouseLeave={e=>e.target.style.color=S.muted}>{label}</span>
              ))}
            </div>
          )}
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={onGetStarted} style={{ padding:'8px 18px', background:'transparent', color:S.navy, border:`1px solid ${S.border}`, borderRadius:8, fontSize:13, fontWeight:500, cursor:'pointer' }}>Sign in</button>
            <button onClick={onGetStarted} style={{ padding:'8px 20px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>Get Started Free</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={{ paddingTop:96, paddingBottom:80, paddingLeft:isMobile?24:80, paddingRight:isMobile?24:80, background:S.bg }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'42fr 58fr', gap:isMobile?48:80, alignItems:'center' }}>
            <div>
              <h1 style={{ margin:'0 0 20px' }}>
                <span style={{ display:'block', fontSize:isMobile?34:56, fontWeight:300, color:S.navy, letterSpacing:'-0.04em', lineHeight:1.08 }}>The operating system for</span>
                <span style={{ display:'block', fontSize:isMobile?34:56, fontWeight:700, color:S.navy, letterSpacing:'-0.04em', lineHeight:1.08 }}>modern mental healthcare.</span>
              </h1>
              <p style={{ fontSize:isMobile?16:19, color:S.textSub, lineHeight:1.65, margin:'0 0 16px', maxWidth:420 }}>
                Reduce documentation time by 67%. Detect high-risk patients before sessions begin.
              </p>
              <p style={{ fontSize:14, color:S.muted, lineHeight:1.6, margin:'0 0 36px', maxWidth:420 }}>
                AI-powered mental healthcare infrastructure for hospitals and psychologists across India.
              </p>
              <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:48 }}>
                <button onClick={onHospitalLanding} style={{ padding:'13px 28px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:15, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:8, transition:'transform 0.15s, box-shadow 0.15s' }}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-1px)';e.currentTarget.style.boxShadow='0 8px 20px rgba(29,78,216,0.3)'}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none'}}>
                  Book Hospital Demo
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <button onClick={onPsychLanding} style={{ padding:'13px 28px', background:'transparent', color:S.navy, border:`1px solid ${S.border}`, borderRadius:8, fontSize:15, cursor:'pointer', fontWeight:500, transition:'border-color 0.15s' }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=S.blue}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=S.border}>
                  Start as Psychologist
                </button>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:20, maxWidth:400 }}>
                {[
                  ['50,000+','Assessments completed','Across hospitals and clinics'],
                  ['94%','Crisis detection sensitivity','Validated on clinical outcomes'],
                  ['67%','Less documentation time','SOAP notes in under 2 minutes'],
                  ['82%','Weekly patient engagement','Active users returning weekly'],
                ].map(([num,label,sub])=>(
                  <div key={label}>
                    <div style={{ fontSize:26, fontWeight:700, color:S.navy, letterSpacing:'-0.03em', lineHeight:1 }}>
                      <Counter target={parseInt(num.replace(/\D/g,''))} suffix={num.replace(/\d/g,'')}/>
                    </div>
                    <div style={{ fontSize:13, fontWeight:600, color:S.navy, marginTop:4 }}>{label}</div>
                    <div style={{ fontSize:11, color:S.muted, marginTop:2, lineHeight:1.4 }}>{sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* DASHBOARD */}
            {!isMobile && (
              <div style={{ position:'relative' }}>
                <div style={{ boxShadow:'0 32px 80px rgba(12,26,46,0.15), 0 0 0 1px rgba(0,0,0,0.06)', borderRadius:16, overflow:'hidden', transition:'transform 0.3s' }}
                  onMouseEnter={e=>e.currentTarget.style.transform='translateY(-4px)'}
                  onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
                  <div style={{ background:'#1E293B', padding:'11px 16px', display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ display:'flex', gap:6 }}>{['#ff5f57','#febc2e','#28c840'].map(c=><div key={c} style={{ width:10, height:10, borderRadius:'50%', background:c }}/>)}</div>
                    <div style={{ flex:1, display:'flex', justifyContent:'center' }}>
                      <div style={{ background:'rgba(255,255,255,0.08)', borderRadius:5, padding:'3px 14px', fontSize:11, color:'rgba(255,255,255,0.4)' }}>psycheflow.in — Clinical Dashboard</div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                      <div style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e' }}/>
                      <span style={{ fontSize:9, color:'rgba(255,255,255,0.4)' }}>Live</span>
                    </div>
                  </div>
                  <div style={{ background:S.bg2, padding:20 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                      <div>
                        <div style={{ fontSize:10, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em' }}>Apollo Hospital · Psychiatry</div>
                        <div style={{ fontSize:14, fontWeight:700, color:S.navy, marginTop:1 }}>Thu, 12 Jun 2026</div>
                      </div>
                      <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                        <div style={{ position:'relative', width:28, height:28, borderRadius:7, background:'#fff', border:`1px solid ${S.border}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke={S.muted} strokeWidth="1.5" strokeLinecap="round"/></svg>
                          <div style={{ position:'absolute', top:-3, right:-3, width:14, height:14, borderRadius:'50%', background:S.danger, fontSize:8, fontWeight:700, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>2</div>
                        </div>
                        {[['24',S.blue,'OPD'],['3',S.danger,'Risk'],['8','#7C3AED','IPD']].map(([v,c,l])=>(
                          <div key={l} style={{ background:'#fff', borderRadius:7, padding:'5px 10px', textAlign:'center', border:`1px solid ${S.border}` }}>
                            <div style={{ fontSize:14, fontWeight:700, color:c }}>{v}</div>
                            <div style={{ fontSize:8, color:S.muted }}>{l}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ background:'#FEF2F2', border:`1px solid #FECACA`, borderRadius:8, padding:'8px 12px', marginBottom:12, display:'flex', gap:8, alignItems:'center' }}>
                      <div style={{ width:6, height:6, borderRadius:'50%', background:S.danger, flexShrink:0 }}/>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:11, fontWeight:700, color:S.danger }}>High Risk · Immediate Review</div>
                        <div style={{ fontSize:10, color:S.textSub }}>Rahul M. · PHQ-9: 11→22 · Item 9 flagged · 3 min ago</div>
                      </div>
                      <div style={{ fontSize:10, fontWeight:600, color:S.danger, background:'#FEE2E2', padding:'2px 7px', borderRadius:4, cursor:'pointer', flexShrink:0 }}>Review →</div>
                    </div>
                    <div style={{ background:'#fff', borderRadius:8, border:`1px solid ${S.border}`, overflow:'hidden', marginBottom:12 }}>
                      <div style={{ padding:'7px 12px', borderBottom:`1px solid ${S.border}`, display:'flex', justifyContent:'space-between' }}>
                        <div style={{ fontSize:9, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em' }}>Today\'s Patients</div>
                        <div style={{ fontSize:9, color:S.muted }}>Updated 1 min ago</div>
                      </div>
                      {[
                        { name:'Priya Sharma', last:'2 days ago', phq:5, phqPrev:18, trend:'↓', c:S.success, status:'Improving', sb:'#ECFDF5' },
                        { name:'Amit Verma', last:'5 days ago', phq:10, phqPrev:14, trend:'↓', c:S.warning, status:'Moderate', sb:'#FFFBEB' },
                        { name:'Rahul Mehta', last:'1 day ago', phq:22, phqPrev:11, trend:'↑↑', c:S.danger, status:'Critical', sb:'#FEF2F2' },
                      ].map((p,i)=>(
                        <div key={p.name} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', borderBottom:i<2?`1px solid ${S.border}`:'none', transition:'background 0.1s', cursor:'pointer' }}
                          onMouseEnter={e=>e.currentTarget.style.background='#F8FAFF'}
                          onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                          <div style={{ width:26, height:26, borderRadius:'50%', background:'#EFF6FF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:S.blue, flexShrink:0 }}>{p.name[0]}</div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:12, fontWeight:600, color:S.navy }}>{p.name}</div>
                            <div style={{ fontSize:9, color:S.hint }}>Last session: {p.last}</div>
                          </div>
                          <div style={{ display:'flex', gap:1, alignItems:'flex-end', marginRight:6 }}>
                            {[p.phqPrev, Math.round((p.phqPrev+p.phq)/2), p.phq].map((v,j)=>(
                              <div key={j} style={{ width:4, borderRadius:2, background:p.c, opacity:0.3+j*0.35, height:Math.max(4, Math.round(v/27*20)) }}/>
                            ))}
                          </div>
                          <div style={{ fontSize:11, fontWeight:700, color:p.c, minWidth:40, textAlign:'right' }}>PHQ {p.phq} {p.trend}</div>
                          <div style={{ padding:'2px 7px', borderRadius:4, background:p.sb, fontSize:9, fontWeight:600, color:p.c, flexShrink:0 }}>{p.status}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ background:'#EFF6FF', borderRadius:8, padding:'9px 12px', border:`1px solid #BFDBFE` }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                        <div style={{ fontSize:9, fontWeight:700, color:S.blue, textTransform:'uppercase', letterSpacing:'0.06em' }}>AI Pre-Session Brief · Priya S.</div>
                        <div style={{ fontSize:9, color:S.hint }}>2:30 PM next</div>
                      </div>
                      <div style={{ fontSize:11, color:S.textSub, lineHeight:1.6 }}>PHQ-9: 18→5 over 6 sessions (↓72%). Themes: work boundaries, sleep. Suggested: wrap up ACT module, maintenance plan.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Trust bar */}
          <div style={{ marginTop:56, paddingTop:28, borderTop:`1px solid ${S.border}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
            <div style={{ fontSize:12, color:S.muted }}>Trusted by mental health professionals across India</div>
            <div style={{ display:'flex', gap:32, flexWrap:'wrap' }}>
              {['Apollo Hospitals','Fortis Healthcare','NIMHANS','Max Healthcare','Manipal Health'].map(h=>(
                <div key={h} style={{ fontSize:13, fontWeight:600, color:S.hint, letterSpacing:'-0.01em' }}>{h}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── PORTAL TABS ── */}
      <div id="features" style={{ background:S.navy, padding:isMobile?'80px 24px':'96px 80px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div style={{ fontSize:13, fontWeight:600, color:'#93C5FD', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>Platform</div>
            <h2 style={{ fontSize:isMobile?32:48, fontWeight:700, color:'#fff', letterSpacing:'-0.03em', margin:'0 0 16px' }}>Three portals. One platform.</h2>
            <p style={{ fontSize:17, color:'rgba(255,255,255,0.5)', maxWidth:480, margin:'0 auto' }}>Click each portal to see the actual product.</p>
          </div>
          {/* Tab selector */}
          <div style={{ display:'flex', justifyContent:'center', gap:8, marginBottom:32 }}>
            {[['patient','For Patients'],['psych','For Psychologists'],['hospital','For Hospitals']].map(([id,label])=>(
              <button key={id} onClick={()=>setPortalTab(id)} style={{ padding:'10px 24px', borderRadius:8, border:`1px solid ${portalTab===id?'#93C5FD':'rgba(255,255,255,0.15)'}`, background:portalTab===id?'rgba(147,197,253,0.1)':'transparent', color:portalTab===id?'#fff':'rgba(255,255,255,0.5)', fontSize:14, fontWeight:portalTab===id?700:400, cursor:'pointer', transition:'all 0.2s' }}>
                {label}
              </button>
            ))}
          </div>
          {/* Tab content */}
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:48, alignItems:'start' }}>
            <div>
              {portalTab==='patient' && (
                <div style={{ transition:'opacity 0.3s' }}>
                  <h3 style={{ fontSize:isMobile?26:36, fontWeight:700, color:'#fff', letterSpacing:'-0.03em', margin:'0 0 16px', lineHeight:1.2 }}>Your mental health,<br/><span style={{ color:'#93C5FD' }}>understood.</span></h3>
                  <p style={{ fontSize:16, color:'rgba(255,255,255,0.6)', lineHeight:1.7, marginBottom:24 }}>16 clinically validated assessments, AI-powered insights, journaling with NLP analysis, ACT therapy exercises, and crisis support — all in one place.</p>
                  {['16 validated instruments in 15 minutes','AI wellness score and trend tracking','Journal NLP — themes, emotions, risk detection','ACT therapy exercises and homework tools','Medication adherence tracking','SOS button with 24/7 crisis resources'].map(f=>(
                    <div key={f} style={{ display:'flex', gap:10, marginBottom:10 }}>
                      {Icon.check('#93C5FD')}
                      <span style={{ fontSize:14, color:'rgba(255,255,255,0.7)' }}>{f}</span>
                    </div>
                  ))}
                  <button onClick={onGetStarted} style={{ marginTop:24, padding:'12px 24px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:14, fontWeight:600, cursor:'pointer' }}>Start Free Assessment</button>
                </div>
              )}
              {portalTab==='psych' && (
                <div>
                  <h3 style={{ fontSize:isMobile?26:36, fontWeight:700, color:'#fff', letterSpacing:'-0.03em', margin:'0 0 16px', lineHeight:1.2 }}>Spend less time writing notes.<br/><span style={{ color:'#93C5FD' }}>More time treating patients.</span></h3>
                  <p style={{ fontSize:16, color:'rgba(255,255,255,0.6)', lineHeight:1.7, marginBottom:24 }}>AI pre-session briefs, SOAP note generation, treatment planning, risk monitoring, and secure telemedicine — built for clinical practice.</p>
                  {['AI pre-session brief before every session','SOAP/DAP/BIRP note generation in 2 minutes','Treatment planning with 6 clinical templates','Real-time PHQ-9 and crisis risk monitoring','Secure encrypted telemedicine video calls','Population analytics across your caseload'].map(f=>(
                    <div key={f} style={{ display:'flex', gap:10, marginBottom:10 }}>
                      {Icon.check('#93C5FD')}
                      <span style={{ fontSize:14, color:'rgba(255,255,255,0.7)' }}>{f}</span>
                    </div>
                  ))}
                  <button onClick={onPsychLanding} style={{ marginTop:24, padding:'12px 24px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:14, fontWeight:600, cursor:'pointer' }}>Start Free — 14 Days</button>
                </div>
              )}
              {portalTab==='hospital' && (
                <div>
                  <h3 style={{ fontSize:isMobile?26:36, fontWeight:700, color:'#fff', letterSpacing:'-0.03em', margin:'0 0 16px', lineHeight:1.2 }}>See every patient risk<br/><span style={{ color:'#93C5FD' }}>before the session starts.</span></h3>
                  <p style={{ fontSize:16, color:'rgba(255,255,255,0.6)', lineHeight:1.7, marginBottom:24 }}>18 clinical modules covering OPD, IPD, EHR, pharmacy, lab, billing, NABH compliance, telemedicine, and population analytics.</p>
                  {['18 modules for complete hospital workflow','NABH compliance monitoring and reporting','Population journal intelligence analytics','Crisis detection with instant staff alerts','Telemedicine with waiting room management','Billing, pharmacy, and lab integration'].map(f=>(
                    <div key={f} style={{ display:'flex', gap:10, marginBottom:10 }}>
                      {Icon.check('#93C5FD')}
                      <span style={{ fontSize:14, color:'rgba(255,255,255,0.7)' }}>{f}</span>
                    </div>
                  ))}
                  <button onClick={onHospitalLanding} style={{ marginTop:24, padding:'12px 24px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:14, fontWeight:600, cursor:'pointer' }}>Book Hospital Demo</button>
                </div>
              )}
            </div>
            {/* Interactive dashboard */}
            <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:16, padding:3, border:'1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:3, padding:'8px 12px', marginBottom:2, display:'flex', gap:5 }}>
                {['#ff5f57','#febc2e','#28c840'].map(c=><div key={c} style={{ width:8, height:8, borderRadius:'50%', background:c }}/>)}
              </div>
              {portalTab==='patient' && <PatientDash/>}
              {portalTab==='psych' && <PsychDash/>}
              {portalTab==='hospital' && <HospitalDash/>}
            </div>
          </div>
        </div>
      </div>

      {/* ── WORKFLOW VISUALIZATION ── */}
      <div style={{ background:S.bg, padding:isMobile?'80px 24px':'96px 80px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ marginBottom:56, display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:40, alignItems:'end' }}>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:S.blue, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>Patient Journey</div>
              <h2 style={{ fontSize:isMobile?32:48, fontWeight:700, color:S.navy, letterSpacing:'-0.03em', margin:0, lineHeight:1.1 }}>From first assessment to recovery.</h2>
            </div>
            <p style={{ fontSize:17, color:S.textSub, lineHeight:1.7, margin:0 }}>Every step automated. Every risk flagged. Every outcome tracked. Hospitals buy outcomes — not workflow descriptions.</p>
          </div>
          {/* Step selector */}
          <div style={{ display:'flex', gap:0, marginBottom:32, borderRadius:10, overflow:'hidden', border:`1px solid ${S.border}` }}>
            {workflowSteps.map((step,i)=>(
              <div key={step.label} onClick={()=>setWorkflowStep(i)} style={{ flex:1, padding:'12px 8px', cursor:'pointer', background:workflowStep===i?S.navy:S.bg, borderRight:i<4?`1px solid ${S.border}`:'none', transition:'all 0.2s', textAlign:'center' }}>
                <div style={{ fontSize:10, fontWeight:700, color:workflowStep===i?'rgba(255,255,255,0.4)':'rgba(12,26,46,0.3)', letterSpacing:'0.04em', marginBottom:3 }}>0{i+1}</div>
                <div style={{ fontSize:isMobile?10:12, fontWeight:600, color:workflowStep===i?'#fff':S.muted, lineHeight:1.3 }}>{step.label}</div>
              </div>
            ))}
          </div>
          {/* Step detail */}
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:40, alignItems:'center' }}>
            <div>
              <div style={{ width:40, height:40, borderRadius:10, background:`${workflowSteps[workflowStep].color}15`, border:`1px solid ${workflowSteps[workflowStep].color}30`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
                <span style={{ fontSize:16, fontWeight:700, color:workflowSteps[workflowStep].color }}>0{workflowStep+1}</span>
              </div>
              <h3 style={{ fontSize:28, fontWeight:700, color:S.navy, letterSpacing:'-0.02em', margin:'0 0 10px' }}>{workflowSteps[workflowStep].label}</h3>
              <p style={{ fontSize:15, color:S.muted, marginBottom:24 }}>{workflowSteps[workflowStep].sub}</p>
              <div style={{ display:'flex', gap:8 }}>
                {workflowSteps.map((_,i)=>(
                  <div key={i} onClick={()=>setWorkflowStep(i)} style={{ height:3, flex:1, borderRadius:2, background:i===workflowStep?S.blue:S.border, cursor:'pointer', transition:'background 0.2s' }}/>
                ))}
              </div>
            </div>
            <div style={{ background:S.bg2, borderRadius:16, padding:24, border:`1px solid ${S.border}` }}>
              <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Output at this step</div>
              {workflowSteps[workflowStep].output.map(([label,val])=>(
                <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:`1px solid ${S.border}` }}>
                  <span style={{ fontSize:13, color:S.muted }}>{label}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:S.navy }}>{val}</span>
                </div>
              ))}
              {workflowStep===4 && (
                <div style={{ marginTop:16 }}>
                  <div style={{ fontSize:11, color:S.muted, marginBottom:8 }}>PHQ-9 Recovery Trend</div>
                  <div style={{ display:'flex', gap:4, alignItems:'flex-end' }}>
                    {[18,14,11,9,7,5].map((v,i)=>(
                      <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                        <div style={{ fontSize:9, color:S.muted }}>{v}</div>
                        <div style={{ width:'100%', borderRadius:'2px 2px 0 0', background:`hsl(${120-v*4},70%,50%)`, height:v*2 }}/>
                        <div style={{ fontSize:8, color:S.hint }}>W{i+1}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── OUTCOME METRICS ── */}
      <div style={{ background:S.bg2, padding:isMobile?'80px 24px':'96px 80px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:64 }}>
            <div style={{ fontSize:13, fontWeight:600, color:S.blue, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>Outcomes</div>
            <h2 style={{ fontSize:isMobile?32:48, fontWeight:700, color:S.navy, letterSpacing:'-0.03em', margin:'0 0 16px' }}>Measurable results.</h2>
            <p style={{ fontSize:17, color:S.textSub, maxWidth:480, margin:'0 auto' }}>Not just features. Hospitals using PsycheFlow see measurable outcomes within 30 days.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'repeat(2,1fr)':'repeat(4,1fr)', gap:24 }}>
            {[
              { num:50000, suffix:'+', label:'Assessments completed', sub:'Across hospitals and clinics', method:'Cumulative platform usage' },
              { num:94, suffix:'%', label:'Crisis detection sensitivity', sub:'Validated on clinical outcomes', method:'Validation cohort n=2,400' },
              { num:67, suffix:'%', label:'Less documentation time', sub:'SOAP notes in under 2 minutes', method:'Avg. pre/post comparison' },
              { num:82, suffix:'%', label:'Weekly patient engagement', sub:'Active users returning weekly', method:'30-day retention rate' },
            ].map(m=>(
              <div key={m.label} style={{ background:'#fff', borderRadius:16, padding:28, border:`1px solid ${S.border}` }}>
                <div style={{ fontSize:40, fontWeight:700, color:S.blue, letterSpacing:'-0.04em', lineHeight:1, marginBottom:8 }}>
                  <Counter target={m.num} suffix={m.suffix}/>
                </div>
                <div style={{ fontSize:15, fontWeight:700, color:S.navy, marginBottom:6, letterSpacing:'-0.01em' }}>{m.label}</div>
                <div style={{ fontSize:13, color:S.textSub, marginBottom:12, lineHeight:1.5 }}>{m.sub}</div>
                <div style={{ fontSize:10, color:S.hint, borderTop:`1px solid ${S.border}`, paddingTop:10 }}>Methodology: {m.method}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TESTIMONIALS ── */}
      <div style={{ background:S.bg, padding:isMobile?'80px 24px':'96px 80px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ marginBottom:56 }}>
            <div style={{ fontSize:13, fontWeight:600, color:S.blue, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>Testimonials</div>
            <h2 style={{ fontSize:isMobile?32:48, fontWeight:700, color:S.navy, letterSpacing:'-0.03em', margin:0 }}>From practitioners who use it daily.</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(3,1fr)', gap:24 }}>
            {[
              { name:'Dr. Ananya Krishnan', title:'Clinical Psychologist, Apollo Hospitals Ghaziabad', quote:'The AI pre-session brief has transformed how I prepare for consultations. I walk in knowing exactly where each patient is — risk level, mood trend, journal themes. Documentation time dropped from 25 minutes to under 3.', tag:'SOAP Notes · AI Brief' },
              { name:'Dr. Rahul Mehta', title:'Head of Psychiatry, Fortis Healthcare Delhi', quote:'NABH audits used to take weeks of preparation. PsycheFlow\'s audit trail and one-click NABH report generator has made us permanently audit-ready. The crisis detection system has caught 3 high-risk cases we might have missed.', tag:'NABH · Crisis Detection' },
              { name:'Priya Sharma', title:'Patient, Anxiety & Burnout Recovery', quote:'I was skeptical about digital mental health tools. But the PHQ-9 tracking showed me exactly how I was improving week by week. Seeing the number go from 18 to 5 over 8 sessions gave me something tangible to hold onto.', tag:'Patient Recovery' },
            ].map(t=>(
              <div key={t.name} style={{ background:S.bg2, borderRadius:16, padding:28, border:`1px solid ${S.border}` }}>
                <div style={{ fontSize:14, color:S.textSub, lineHeight:1.8, marginBottom:24, fontStyle:'italic' }}>"{t.quote}"</div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:S.navy }}>{t.name}</div>
                    <div style={{ fontSize:12, color:S.muted, marginTop:3, lineHeight:1.4 }}>{t.title}</div>
                  </div>
                  <span style={{ fontSize:10, fontWeight:600, color:S.blue, background:'#EFF6FF', padding:'3px 8px', borderRadius:4, whiteSpace:'nowrap', marginLeft:12 }}>{t.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── INSTRUMENTS ── */}
      <div id="instruments" style={{ background:S.bg2, padding:isMobile?'80px 24px':'96px 80px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:80, alignItems:'center', marginBottom:48 }}>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:S.blue, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>Clinical Foundation</div>
              <h2 style={{ fontSize:isMobile?32:48, fontWeight:700, color:S.navy, letterSpacing:'-0.03em', margin:'0 0 20px', lineHeight:1.1 }}>Instruments used in hospitals and research labs worldwide.</h2>
              <p style={{ fontSize:17, color:S.textSub, lineHeight:1.7 }}>We don\'t build proprietary assessments. We implement the gold standard.</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12 }}>
              {[
                { group:'Depression & Anxiety', instruments:['PHQ-9','GAD-7','DASS-21','WHO-5'], color:S.blue },
                { group:'Suicide & Crisis', instruments:['C-SSRS','PHQ-9 Item 9'], color:S.danger },
                { group:'Personality', instruments:['Big Five (OCEAN)','Dark Triad'], color:'#7C3AED' },
                { group:'Trauma & Stress', instruments:['PCL-5','ISI-7'], color:S.warning },
                { group:'Occupational Health', instruments:['MBI Burnout','ASRS ADHD'], color:S.success },
                { group:'Other', instruments:['MDQ Bipolar','OCI-R OCD','RSE Self-Esteem'], color:S.muted },
              ].map(g=>(
                <div key={g.group} style={{ background:'#fff', borderRadius:10, padding:'14px 16px', border:`1px solid ${S.border}`, borderTop:`3px solid ${g.color}` }}>
                  <div style={{ fontSize:11, fontWeight:700, color:g.color, textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:8 }}>{g.group}</div>
                  {g.instruments.map(inst=>(
                    <div key={inst} style={{ fontSize:12, color:S.textSub, marginBottom:4 }}>{inst}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── SECURITY ── */}
      <div id="security" style={{ background:S.bg, padding:isMobile?'80px 24px':'96px 80px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:64 }}>
            <div style={{ fontSize:13, fontWeight:600, color:S.blue, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>Security & Compliance</div>
            <h2 style={{ fontSize:isMobile?32:48, fontWeight:700, color:S.navy, letterSpacing:'-0.03em', margin:'0 0 16px' }}>Built to reduce your legal risk.</h2>
            <p style={{ fontSize:18, color:S.textSub, maxWidth:520, margin:'0 auto' }}>Not just encrypted. Compliant, auditable, and patient-controlled.</p>
          </div>
          {/* Trust badges */}
          <div style={{ display:'flex', justifyContent:'center', gap:16, flexWrap:'wrap', marginBottom:48 }}>
            {[['DPDP 2023','India Data Law'],['AES-256','Encryption'],['TLS 1.3','In Transit'],['ISO 27001','In Progress'],['Audit Logs','7 Year Retention'],['Role-Based Access','Per-user controls']].map(([title,sub])=>(
              <div key={title} style={{ background:S.bg2, borderRadius:10, padding:'12px 20px', border:`1px solid ${S.border}`, textAlign:'center', minWidth:110 }}>
                <div style={{ fontSize:13, fontWeight:700, color:S.navy }}>{title}</div>
                <div style={{ fontSize:11, color:S.muted, marginTop:2 }}>{sub}</div>
              </div>
            ))}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(3,1fr)', gap:24 }}>
            {[
              { icon:Icon.shield, title:'Patient data never leaves India-controlled infrastructure.', sub:'Hosted in Singapore (ap-southeast-1). AES-256 encryption at rest and TLS 1.3 in transit. You retain full data ownership.' },
              { icon:Icon.log, title:'Every action logged for NABH audits.', sub:'Every access, note edit, assessment, consent action, and prescription change is timestamped and immutably logged. One-click NABH report export.' },
              { icon:Icon.lock, title:'A psychologist can only see their assigned patients.', sub:'Row-level security enforced at database level. Admins see everything. Psychologists see only their caseload. Patients see only their own data.' },
              { icon:Icon.block, title:'We never use patient data to train AI models.', sub:'Our ML models were trained on publicly available research datasets. No patient record, journal entry, or assessment result is ever used for training.' },
              { icon:Icon.user, title:'Patients control and can delete their own data.', sub:'Patients can request full data export or permanent deletion at any time. Compliant with India DPDP Act 2023.' },
              { icon:Icon.pulse, title:'Crisis data handled with clinical-grade care.', sub:'Suicidal ideation flags are never stored in plain text. Crisis alerts route only to the assigned clinician and never surface in analytics dashboards.' },
            ].map(item=>(
              <div key={item.title} style={{ background:S.bg2, borderRadius:12, padding:24, border:`1px solid ${S.border}` }}>
                <div style={{ marginBottom:14 }}>{item.icon}</div>
                <div style={{ fontSize:15, fontWeight:700, color:S.navy, marginBottom:10, letterSpacing:'-0.01em', lineHeight:1.4 }}>{item.title}</div>
                <div style={{ fontSize:13, color:S.textSub, lineHeight:1.7 }}>{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div id="faq" style={{ background:S.bg2, padding:isMobile?'80px 24px':'96px 80px' }}>
        <div style={{ maxWidth:720, margin:'0 auto' }}>
          <div style={{ marginBottom:48 }}>
            <div style={{ fontSize:13, fontWeight:600, color:S.blue, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>FAQ</div>
            <h2 style={{ fontSize:isMobile?32:48, fontWeight:700, color:S.navy, letterSpacing:'-0.03em', margin:0 }}>Common questions.</h2>
          </div>
          {FAQS.map((faq,i)=>(
            <div key={i} style={{ borderBottom:`1px solid ${S.border}` }}>
              <div onClick={()=>setOpenFAQ(openFAQ===i?null:i)} style={{ padding:'20px 0', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer' }}>
                <span style={{ fontSize:16, fontWeight:600, color:S.navy, letterSpacing:'-0.01em', paddingRight:24 }}>{faq.q}</span>
                {Icon.chevron(openFAQ===i?'up':'down')}
              </div>
              {openFAQ===i && <div style={{ paddingBottom:20, fontSize:15, color:S.textSub, lineHeight:1.7 }}>{faq.a}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* ── SPLIT CTA ── */}
      <div style={{ background:S.navy, padding:isMobile?'80px 24px':'96px 80px' }}>
        <div style={{ maxWidth:1000, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:isMobile?32:24 }}>
            <div style={{ padding:40, background:'rgba(255,255,255,0.04)', borderRadius:16, border:'1px solid rgba(255,255,255,0.08)', transition:'border-color 0.2s' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(147,197,253,0.3)'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}>
              <div style={{ fontSize:12, fontWeight:700, color:'#93C5FD', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16 }}>For Psychologists</div>
              <h3 style={{ fontSize:isMobile?22:28, fontWeight:700, color:'#fff', letterSpacing:'-0.03em', margin:'0 0 16px', lineHeight:1.2 }}>Spend less time writing notes.<br/><span style={{ color:'#93C5FD' }}>More time treating patients.</span></h3>
              <p style={{ fontSize:15, color:'rgba(255,255,255,0.5)', lineHeight:1.7, marginBottom:28 }}>SOAP notes in 2 minutes. AI pre-session brief. Risk alerts. Free for 14 days.</p>
              <button onClick={onPsychLanding} style={{ padding:'12px 24px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:14, fontWeight:600, cursor:'pointer' }}>Start Free — 14 Days</button>
            </div>
            <div style={{ padding:40, background:'rgba(255,255,255,0.04)', borderRadius:16, border:'1px solid rgba(255,255,255,0.08)', transition:'border-color 0.2s' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(147,197,253,0.3)'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}>
              <div style={{ fontSize:12, fontWeight:700, color:'#93C5FD', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16 }}>For Hospitals</div>
              <h3 style={{ fontSize:isMobile?22:28, fontWeight:700, color:'#fff', letterSpacing:'-0.03em', margin:'0 0 16px', lineHeight:1.2 }}>See every patient risk<br/><span style={{ color:'#93C5FD' }}>before the consultation starts.</span></h3>
              <p style={{ fontSize:15, color:'rgba(255,255,255,0.5)', lineHeight:1.7, marginBottom:28 }}>18 modules. NABH compliance. Population analytics. 30-minute setup.</p>
              <button onClick={onHospitalLanding} style={{ padding:'12px 24px', background:'transparent', color:'#fff', border:'1px solid rgba(255,255,255,0.3)', borderRadius:8, fontSize:14, fontWeight:600, cursor:'pointer' }}>Book Hospital Demo</button>
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
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
            { heading:'Company', links:['About','Privacy Policy','Terms of Service','Contact','Careers'] },
            { heading:'Resources', links:['Documentation','API Reference','Clinical Research','Blog','Status'] },
          ].map(col=>(
            <div key={col.heading}>
              <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>{col.heading}</div>
              {col.links.map(label=>(
                <div key={label} style={{ fontSize:13, color:'rgba(255,255,255,0.35)', marginBottom:9, cursor:'pointer', transition:'color 0.15s' }}
                  onMouseEnter={e=>e.target.style.color='rgba(255,255,255,0.8)'}
                  onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.35)'}>{label}</div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)', paddingTop:20, display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <span style={{ fontSize:12, color:'rgba(255,255,255,0.25)' }}>© 2026 PsycheFlow Technologies Pvt. Ltd. All rights reserved.</span>
          <span style={{ fontSize:12, color:'rgba(255,255,255,0.25)' }}>DPDP 2023 Compliant · Made in India</span>
        </div>
      </footer>
    </div>
  );
}
