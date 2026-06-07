import { IconAlert, IconWarning, IconTarget, IconChart, IconClipboard, IconJournal, IconHospital, IconPill, IconChat, IconUser, IconCheck, IconEEG } from './icons';
import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import AppointmentsList from './AppointmentsList';
import Messages from './Messages';
import { exportPatientReport } from './pdfExport';
import AnalyticsDashboard from './AnalyticsDashboard';
import InvitePatient from './InvitePatient';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';
const useIsMobile = () => {
  const [m, setM] = React.useState(window.innerWidth < 768);
  React.useEffect(() => {
    const h = () => setM(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return m;
};


// ── UTILITIES ─────────────────────────────────────────────
const phqLevel = (s) => s <= 4  ? {label:'Minimal',  color:'#22c55e'}
  : s <= 9  ? {label:'Mild',     color:'#f59e0b'}
  : s <= 14 ? {label:'Moderate', color:'#f97316'}
  :           {label:'Severe',   color:'#ef4444'};

const riskColor = (r) => r === 'high' ? '#ef4444'
  : r === 'medium' ? '#f59e0b' : '#22c55e';

// ── SIDEBAR ───────────────────────────────────────────────
const PORTAL_ICONS = {
  roster: (c) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="7" cy="5" r="3" stroke={c} strokeWidth="1.4"/><path d="M1 15C1 12.2 3.7 10 7 10" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><circle cx="13" cy="7" r="2.5" stroke={c} strokeWidth="1.4"/><path d="M10 15C10 13 11.3 12 13 12C14.7 12 16 13 16 15" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>,
  link: (c) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="14" cy="4" r="2" stroke={c} strokeWidth="1.4"/><circle cx="4" cy="9" r="2" stroke={c} strokeWidth="1.4"/><circle cx="14" cy="14" r="2" stroke={c} strokeWidth="1.4"/><path d="M6 8L12 5M6 10L12 13" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>,
  invite: (c) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="4" width="14" height="10" rx="2.5" stroke={c} strokeWidth="1.4"/><path d="M5 8H13M5 11H9" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>,
  analytics: (c) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="14" height="14" rx="2.5" stroke={c} strokeWidth="1.4"/><path d="M5 12V9M8 12V7M11 12V10M14 12V8" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>,
  alerts: (c) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2L11 7H16L12.5 10L14 15L9 12L4 15L5.5 10L2 7H7L9 2Z" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/></svg>,
  appointments: (c) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="4" width="14" height="12" rx="2" stroke={c} strokeWidth="1.4"/><path d="M6 2V5M12 2V5M2 8H16" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><rect x="6" y="10" width="6" height="3" rx="1" fill={c} opacity="0.4"/></svg>,
  messages: (c) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="5" width="14" height="10" rx="3" stroke={c} strokeWidth="1.4"/><path d="M5 9H13M5 12H9" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>,
};

function Sidebar({ activeTab, setActiveTab, user, onLogout, patientCount, alertCount }) {
  const [expanded, setExpanded] = React.useState(false);
  const [pinned, setPinned] = React.useState(false);
  const items = [
    { id:'roster', label:'Patient Roster', badge: patientCount },
    { id:'link', label:'Link Patient' },
    { id:'invite', label:'Invite Patient' },
    { id:'analytics', label:'Practice Analytics' },
    { id:'alerts', label:'Crisis Alerts', badge: alertCount, badgeRed: true },
    { id:'appointments', label:'Appointments' },
    { id:'messages', label:'Messages' },
  ];
  const exp = expanded || pinned;
  const isMobile = useIsMobile();
  if (isMobile) return (
    <>
      {/* Mobile top bar */}
      <div style={{ position:'fixed', top:0, left:0, right:0, zIndex:50, background:'#0C1A2E', borderBottom:'0.5px solid rgba(255,255,255,0.08)', padding:'10px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:'#1D4ED8', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><path d="M10 2C10 2 5 5.5 5 10.5C5 13.2 7.2 15.5 10 15.5C12.8 15.5 15 13.2 15 10.5C15 5.5 10 2 10 2Z" fill="white" opacity="0.9"/><circle cx="10" cy="10.5" r="2.5" fill="#0C1A2E"/></svg>
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:'#fff' }}>PsycheFlow</div>
            <div style={{ fontSize:9, color:'#3B82F6', letterSpacing:'1px' }}>CLINICIAN PORTAL</div>
          </div>
        </div>
        <div onClick={onLogout} style={{ padding:'6px 12px', borderRadius:7, background:'rgba(255,255,255,0.06)', cursor:'pointer' }}>
          <span style={{ fontSize:12, color:'#7BA3CC' }}>Sign out</span>
        </div>
      </div>
      {/* Mobile bottom tab bar */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:50, background:'#0C1A2E', borderTop:'0.5px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'space-around', padding:'6px 0 10px', paddingBottom:'calc(6px + env(safe-area-inset-bottom))' }}>
        {[
          { id:'roster', label:'Patients' },
          { id:'analytics', label:'Analytics' },
          { id:'alerts', label:'Alerts', badgeRed: true, badge: alertCount },
          { id:'appointments', label:'Schedule' },
          { id:'messages', label:'Messages' },
        ].map(item => {
          const active = activeTab === item.id;
          const ic = PORTAL_ICONS[item.id];
          return (
            <div key={item.id} onClick={() => setActiveTab(item.id)}
              style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, cursor:'pointer', minWidth:52, position:'relative' }}>
              <div style={{ width:36, height:36, borderRadius:10, background: active?'rgba(29,78,216,0.4)':'transparent', display:'flex', alignItems:'center', justifyContent:'center' }}>
                {ic ? ic(active?'#93C5FD':'#3B5998') : null}
              </div>
              {item.badge > 0 && <div style={{ position:'absolute', top:0, right:6, width:14, height:14, borderRadius:'50%', background:item.badgeRed?'#DC2626':'#1D4ED8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, color:'#fff', fontWeight:700 }}>{item.badge}</div>}
              <span style={{ fontSize:9, color: active?'#93C5FD':'#3B5998', fontWeight: active?600:400 }}>{item.label}</span>
            </div>
          );
        })}
      </div>
    </>
  );
  return (
    <div onMouseEnter={() => setExpanded(true)} onMouseLeave={() => { if(!pinned) setExpanded(false); }}
      style={{ width: exp?220:64, background:'#0C1A2E', display:'flex', flexDirection:'column', alignItems: exp?'flex-start':'center', padding:'16px 0', gap:4, minHeight:'100vh', transition:'width 0.2s ease', overflow:'hidden', flexShrink:0 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20, padding: exp?'0 16px':'0', width:'100%' }}>
        <div style={{ width:34, height:34, borderRadius:9, background:'#1D4ED8', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, cursor:'pointer' }} onClick={() => setPinned(p=>!p)}>
          <svg width="19" height="19" viewBox="0 0 20 20" fill="none"><path d="M10 2C10 2 5 5.5 5 10.5C5 13.2 7.2 15.5 10 15.5C12.8 15.5 15 13.2 15 10.5C15 5.5 10 2 10 2Z" fill="white" opacity="0.9"/><circle cx="10" cy="10.5" r="2.5" fill="#0C1A2E"/></svg>
        </div>
        {exp && <div><div style={{ fontSize:13, fontWeight:700, color:'#fff', letterSpacing:'-0.01em', whiteSpace:'nowrap' }}>PsycheFlow</div><div style={{ fontSize:10, color:'#3B82F6' }}>Clinician Portal</div></div>}
      </div>
      {items.map(item => {
        const active = activeTab === item.id;
        const ic = PORTAL_ICONS[item.id];
        return (
          <div key={item.id} onClick={() => setActiveTab(item.id)} title={item.label}
            style={{ width: exp?'calc(100% - 16px)':'40px', height:40, borderRadius:10, display:'flex', alignItems:'center', gap:10, padding: exp?'0 12px':'0', justifyContent: exp?'flex-start':'center', cursor:'pointer', background: active?'rgba(29,78,216,0.3)':'transparent', transition:'all 0.15s', margin: exp?'0 8px':'0' }}>
            <div style={{ flexShrink:0 }}>{ic ? ic(active?'#93C5FD':'#3B5998') : null}</div>
            {exp && <span style={{ fontSize:13, fontWeight:active?600:400, color:active?'#fff':'#7BA3CC', whiteSpace:'nowrap' }}>{item.label}</span>}
            {exp && item.badge > 0 && <span style={{ marginLeft:'auto', background:item.badgeRed?'#DC2626':'#1D4ED8', color:'#fff', borderRadius:100, padding:'1px 7px', fontSize:10, fontWeight:600 }}>{item.badge}</span>}
          </div>
        );
      })}
      <div style={{ marginTop:'auto', padding: exp?'0 8px':'0', width: exp?'calc(100% - 16px)':'40px' }}>
        <div style={{ height:0.5, background:'rgba(255,255,255,0.08)', margin:'8px 0' }}/>
        <div onClick={onLogout} title="Sign out"
          style={{ height:40, borderRadius:10, display:'flex', alignItems:'center', gap:10, padding: exp?'0 12px':'0', justifyContent: exp?'flex-start':'center', cursor:'pointer' }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 9H3M3 9L6 6M3 9L6 12M9 5V3H15V15H9V13" stroke="#3B5998" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          {exp && <span style={{ fontSize:13, color:'#7BA3CC', whiteSpace:'nowrap' }}>Sign out</span>}
        </div>
      </div>
    </div>
  );
}

// ── PATIENT CARD ──────────────────────────────────────────
function PatientCard({ patient, onClick }) {
  const latest = patient.sessions?.[0];
  const risk   = patient.riskLevel || 'low';

  return (
    <div onClick={onClick}
      style={{ background:'#fff', borderRadius:16, padding:20,
        border:`2px solid ${risk === 'high' ? '#fecaca' : '#e2e8f0'}`,
        cursor:'pointer', transition:'all 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor='#1D4ED8'}
      onMouseLeave={e => e.currentTarget.style.borderColor = risk === 'high' ? '#fecaca' : '#e2e8f0'}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:44, height:44, borderRadius:'50%',
            background: risk === 'high' ? '#fef2f2' : '#EFF6FF',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>
            {risk === 'high' ? <IconAlert size={15} color='#dc2626'/> : <IconUser size={15} color='#64748b'/>}
          </div>
          <div>
            <div style={{ fontWeight:'bold', color:'#1e293b', fontSize:14 }}>
              {patient.email}
            </div>
            <div style={{ fontSize:12, color:'#94a3b8', marginTop:2 }}>
              {patient.sessions?.length || 0} sessions · Linked {new Date(patient.linked_at).toLocaleDateString('en-IN')}
            </div>
          </div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
          <span style={{ fontSize:11, padding:'2px 8px', borderRadius:6,
            background: riskColor(risk) + '20', color: riskColor(risk), fontWeight:'bold' }}>
            {risk.toUpperCase()} RISK
          </span>
          {latest && (
            <span style={{ fontSize:11, color:'#94a3b8' }}>
              PHQ: <strong style={{ color: phqLevel(latest.phq_score).color }}>
                {latest.phq_score}
              </strong>
            </span>
          )}
        </div>
      </div>

      {/* Mini trend */}
      {patient.sessions?.length > 1 && (
        <div style={{ marginTop:12, display:'flex', alignItems:'flex-end', gap:3, height:24 }}>
          {[...patient.sessions].reverse().slice(0,8).map((s, i) => (
            <div key={i} style={{ flex:1, height: Math.max((s.phq_score/27)*24, 2),
              background: phqLevel(s.phq_score).color, borderRadius:2 }} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── PRE-SESSION BRIEF ─────────────────────────────────────
function PreSessionBrief({ patient, sessions, journals }) {
  const [brief, setBrief]     = useState('');
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const latest  = sessions[0];
      const prev    = sessions[1];
      const recentJ = journals.slice(0,3).map(j => j.text).join('\n---\n');

      const res = await axios.post(API + '/pre-session-brief', {
        patient_email:    patient.email,
        sessions_count:   sessions.length,
        latest_phq:       latest?.phq_score || 0,
        latest_gad:       latest?.gad_score || 0,
        prev_phq:         prev?.phq_score || 0,
        prev_gad:         prev?.gad_score || 0,
        interview_assessment: latest?.answers?.interview_assessment || '',
        recent_journals:  recentJ,
        risk_level:       patient.riskLevel || 'low'
      });
      setBrief(res.data.brief);
      setGenerated(true);
    } catch {
      setBrief('Error generating brief. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{ background:'#f0f9ff', borderRadius:16, padding:24,
      border:'1px solid #bae6fd', marginBottom:20 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
        marginBottom:16 }}>
        <h3 style={{ margin:0, color:'#0369a1' }}><IconTarget size={16} color='#0369a1' style={{marginRight:6}}/> AI Pre-Session Brief</h3>
        <button onClick={generate} disabled={loading}
          style={{ padding:'8px 16px', background:'#0369a1', color:'#fff',
            border:'none', borderRadius:8, cursor:'pointer', fontSize:13 }}>
          {loading ? 'Generating...' : generated ? 'Regenerate' : 'Generate Brief'}
        </button>
      </div>
      {brief ? (
        <div style={{ fontSize:13, color:'#374151', lineHeight:1.8, whiteSpace:'pre-wrap' }}>
          {brief}
        </div>
      ) : (
        <p style={{ color:'#94a3b8', fontSize:13, margin:0 }}>
          Click "Generate Brief" to get an AI-powered clinical summary before the session starts.
        </p>
      )}
    </div>
  );
}

// ── COGNITIVE PATTERN DETECTOR ────────────────────────────
function CognitivePatternDetector({ journals }) {
  const [patterns, setPatterns] = useState(null);
  const [loading, setLoading]   = useState(false);

  const detect = async () => {
    if (journals.length < 2) return;
    setLoading(true);
    try {
      const res = await axios.post(API + '/detect-patterns', {
        journals: journals.map(j => ({
          text: j.text,
          date: j.created_at,
          emotion: j.analysis?.emotions?.primary,
          risk: j.analysis?.risk_signals,
          condition: j.analysis?.condition_detection?.primary_condition
        }))
      });
      setPatterns(res.data);
    } catch {
      setPatterns({ error: true });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (journals.length >= 2) detect();
  }, [journals]);

  if (journals.length < 2) return (
    <div style={{ background:'#fff', borderRadius:16, padding:24,
      border:'1px solid #e2e8f0', marginBottom:20 }}>
      <h3 style={{ margin:'0 0 8px', color:'#1e293b' }}>🧩 Cognitive Pattern Detector</h3>
      <p style={{ color:'#94a3b8', fontSize:13 }}>
        Needs 2+ journal entries to detect patterns.
      </p>
    </div>
  );

  return (
    <div style={{ background:'#fff', borderRadius:16, padding:24,
      border:'1px solid #e2e8f0', marginBottom:20 }}>
      <h3 style={{ margin:'0 0 16px', color:'#1e293b' }}>🧩 Cognitive Pattern Detector</h3>
      {loading ? (
        <p style={{ color:'#94a3b8' }}>Analyzing patterns...</p>
      ) : patterns && !patterns.error ? (
        <div>
          {patterns.dominant_patterns && (
            <div style={{ marginBottom:16 }}>
              <strong style={{ fontSize:13, color:'#1D4ED8' }}>Dominant Thought Patterns:</strong>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:8 }}>
                {patterns.dominant_patterns.map((p, i) => (
                  <span key={i} style={{ background:'#EFF6FF', color:'#1D4ED8',
                    padding:'4px 12px', borderRadius:20, fontSize:12 }}>
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}
          {patterns.risk_trend && (
            <div style={{ marginBottom:16 }}>
              <strong style={{ fontSize:13, color:'#dc2626' }}>Risk Trend:</strong>
              <span style={{ marginLeft:8, fontSize:13, color:'#374151' }}>
                {patterns.risk_trend}
              </span>
            </div>
          )}
          {patterns.clinical_observations && (
            <div style={{ background:'#f8fafc', borderRadius:8, padding:12,
              fontSize:13, color:'#374151', lineHeight:1.7 }}>
              {patterns.clinical_observations}
            </div>
          )}
        </div>
      ) : (
        <button onClick={detect} style={{ padding:'8px 16px', background:'#1D4ED8',
          color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:13 }}>
          Detect Patterns
        </button>
      )}
    </div>
  );
}

// ── TREATMENT PLAN BUILDER ────────────────────────────────
function TreatmentPlanBuilder({ patient, userId }) {
  const [plan, setPlan]       = useState({
    approach: 'CBT',
    goals:    ['', '', ''],
    homework: '',
    frequency: 'weekly',
    duration: '12 sessions'
  });
  const [saved, setSaved]     = useState(false);
  const [loading, setLoading] = useState(false);

  const approaches = ['CBT','ACT','DBT','Psychodynamic','Integrative','Supportive'];
  const frequencies = ['Weekly','Bi-weekly','Monthly'];

  const save = async () => {
    setLoading(true);
    await supabase.from('treatment_plans').insert({
      patient_id:        userId,
      psychologist_id:   patient.psychologist_id,
      goals:             plan.goals.filter(g => g.trim()),
      therapy_approach:  plan.approach,
      interventions:     { homework: plan.homework, frequency: plan.frequency },
      review_date:       new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]
    });
    setSaved(true);
    setLoading(false);
  };

  return (
    <div style={{ background:'#fff', borderRadius:16, padding:24,
      border:'1px solid #e2e8f0', marginBottom:20 }}>
      <h3 style={{ margin:'0 0 20px', color:'#1e293b' }}><IconClipboard size={16} color='#1e293b' style={{marginRight:6}}/> Treatment Plan Builder</h3>

      <div style={{ marginBottom:16 }}>
        <label style={{ fontSize:13, color:'#475569', fontWeight:'bold' }}>
          Therapy Approach
        </label>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:8 }}>
          {approaches.map(a => (
            <button key={a} onClick={() => setPlan({...plan, approach:a})}
              style={{ padding:'6px 14px', borderRadius:20, border:'none',
                cursor:'pointer', fontSize:13,
                background: plan.approach === a ? '#1D4ED8' : '#F8FAFF',
                color: plan.approach === a ? '#fff' : '#64748b' }}>
              {a}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom:16 }}>
        <label style={{ fontSize:13, color:'#475569', fontWeight:'bold' }}>
          Treatment Goals
        </label>
        {plan.goals.map((goal, i) => (
          <input key={i} value={goal}
            onChange={e => {
              const g = [...plan.goals];
              g[i] = e.target.value;
              setPlan({...plan, goals:g});
            }}
            placeholder={`Goal ${i+1} (e.g. Reduce panic attacks by 50%)`}
            style={{ width:'100%', padding:'10px 14px', borderRadius:8,
              border:'1px solid #e2e8f0', fontSize:13, marginTop:8,
              boxSizing:'border-box' }} />
        ))}
      </div>

      <div style={{ marginBottom:16 }}>
        <label style={{ fontSize:13, color:'#475569', fontWeight:'bold' }}>
          Session Frequency
        </label>
        <div style={{ display:'flex', gap:8, marginTop:8 }}>
          {frequencies.map(f => (
            <button key={f} onClick={() => setPlan({...plan, frequency:f.toLowerCase()})}
              style={{ padding:'6px 14px', borderRadius:20, border:'none',
                cursor:'pointer', fontSize:13,
                background: plan.frequency === f.toLowerCase() ? '#1D4ED8' : '#F8FAFF',
                color: plan.frequency === f.toLowerCase() ? '#fff' : '#64748b' }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom:16 }}>
        <label style={{ fontSize:13, color:'#475569', fontWeight:'bold' }}>
          Homework / Between-Session Tasks
        </label>
        <textarea value={plan.homework}
          onChange={e => setPlan({...plan, homework:e.target.value})}
          placeholder="e.g. Complete thought diary daily, practice 5-min breathing exercise..."
          style={{ width:'100%', padding:'10px 14px', borderRadius:8,
            border:'1px solid #e2e8f0', fontSize:13, marginTop:8,
            minHeight:80, boxSizing:'border-box', fontFamily:"'Satoshi',-apple-system,sans-serif" }} />
      </div>

      {saved ? (
        <div style={{ background:'#f0fdf4', borderRadius:8, padding:12,
          fontSize:13, color:'#16a34a' }}>
          <IconCheck size={15} color='#16a34a' style={{marginRight:6}}/> Treatment plan saved successfully.
        </div>
      ) : (
        <button onClick={save} disabled={loading}
          style={{ padding:'10px 24px', background:'#1D4ED8', color:'#fff',
            border:'none', borderRadius:8, cursor:'pointer', fontSize:14 }}>
          {loading ? 'Saving...' : 'Save Treatment Plan'}
        </button>
      )}
    </div>
  );
}

// ── SESSION COMPARISON ────────────────────────────────────
function SessionComparison({ sessions }) {
  if (sessions.length < 2) return null;
  const curr = sessions[0];
  const prev = sessions[1];

  const diff = (a, b) => {
    const d = a - b;
    if (d === 0) return { icon:'→', color:'#94a3b8', text:'No change' };
    if (d < 0)   return { icon:'↓', color:'#22c55e', text:`Improved by ${Math.abs(d)}` };
    return             { icon:'↑', color:'#ef4444', text:`Increased by ${d}` };
  };

  const phqDiff = diff(curr.phq_score, prev.phq_score);
  const gadDiff = diff(curr.gad_score, prev.gad_score);

  return (
    <div style={{ background:'#fff', borderRadius:16, padding:24,
      border:'1px solid #e2e8f0', marginBottom:20 }}>
      <h3 style={{ margin:'0 0 16px', color:'#1e293b' }}>📈 Session Comparison</h3>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        {[
          { label:'Depression (PHQ-9)', curr:curr.phq_score, prev:prev.phq_score, diff:phqDiff },
          { label:'Anxiety (GAD-7)',    curr:curr.gad_score, prev:prev.gad_score, diff:gadDiff },
        ].map((item, i) => (
          <div key={i} style={{ background:'#f8fafc', borderRadius:12, padding:16 }}>
            <div style={{ fontSize:12, color:'#94a3b8', marginBottom:8 }}>{item.label}</div>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:10, color:'#94a3b8' }}>Previous</div>
                <div style={{ fontSize:20, fontWeight:'bold',
                  color: phqLevel(item.prev).color }}>{item.prev}</div>
              </div>
              <div style={{ fontSize:24, color: item.diff.color }}>{item.diff.icon}</div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:10, color:'#94a3b8' }}>Current</div>
                <div style={{ fontSize:20, fontWeight:'bold',
                  color: phqLevel(item.curr).color }}>{item.curr}</div>
              </div>
            </div>
            <div style={{ fontSize:12, color: item.diff.color, marginTop:8, fontWeight:'bold' }}>
              {item.diff.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── LONGITUDINAL NARRATIVE ────────────────────────────────
function LongitudinalNarrative({ patient, sessions, journals }) {
  const [narrative, setNarrative] = useState('');
  const [loading, setLoading]     = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await axios.post(API + '/longitudinal-narrative', {
        patient_email:   patient.email,
        sessions:        sessions.slice(0,5).map(s => ({
          date:     s.created_at,
          phq:      s.phq_score,
          gad:      s.gad_score,
          interview: s.answers?.interview_assessment || ''
        })),
        journals: journals.slice(0,5).map(j => ({
          date:      j.created_at,
          text:      j.text?.slice(0,200),
          emotion:   j.analysis?.emotions?.primary,
          condition: j.analysis?.condition_detection?.primary_condition
        }))
      });
      setNarrative(res.data.narrative);
    } catch {
      setNarrative('Error generating narrative.');
    }
    setLoading(false);
  };

  return (
    <div style={{ background:'#fff', borderRadius:16, padding:24,
      border:'1px solid #e2e8f0', marginBottom:20 }}>
      <div style={{ display:'flex', justifyContent:'space-between',
        alignItems:'center', marginBottom:16 }}>
        <h3 style={{ margin:0, color:'#1e293b' }}>📖 Living Case Formulation</h3>
        <button onClick={generate} disabled={loading}
          style={{ padding:'8px 16px', background:'#1D4ED8', color:'#fff',
            border:'none', borderRadius:8, cursor:'pointer', fontSize:13 }}>
          {loading ? 'Generating...' : narrative ? 'Update' : 'Generate'}
        </button>
      </div>
      {narrative ? (
        <div style={{ fontSize:13, color:'#374151', lineHeight:1.8,
          whiteSpace:'pre-wrap' }}>{narrative}</div>
      ) : (
        <p style={{ color:'#94a3b8', fontSize:13, margin:0 }}>
          Generate a living case formulation that updates after every session — covering predisposing factors, precipitating events, maintaining factors, and progress narrative.
        </p>
      )}
    </div>
  );
}

// ── MAIN PORTAL ───────────────────────────────────────────
export default function PsychologistPortal({ user, onLogout }) {
  const [patients, setPatients]     = useState([]);
  const [selected, setSelected]     = useState(null);
  const [sessions, setSessions]     = useState([]);
  const [journals, setJournals]     = useState([]);
  const [activeTab, setActiveTab]   = useState('roster');
  const [patientTab, setPatientTab] = useState('overview');
  const [shareCode, setShareCode]   = useState('');
  const [linkMsg, setLinkMsg]       = useState('');
  const [loading, setLoading]       = useState(true);
  const [soapNote, setSoapNote]     = useState('');
  const [generating, setGenerating] = useState(false);
  const [alerts, setAlerts]         = useState([]);
  const [crisisAlerts, setCrisisAlerts] = useState([]);

  const fetchCrisisAlerts = async () => {
    try {
      const res = await axios.get(`${API}/crisis-alerts/${user.id}`);
      if (res.data.alerts && res.data.alerts.length > 0) {
        setCrisisAlerts(res.data.alerts);
      }
    } catch(e) { console.log("Crisis alerts fetch error:", e); }
  };
  useEffect(() => { fetchPatients(); fetchCrisisAlerts(); }, []);

  const fetchPatients = async () => {
    setLoading(true);
    const { data: links } = await supabase
      .from('patient_psychologist')
      .select('*')
      .eq('psychologist_id', user.id)
      .eq('active', true);

    if (!links || links.length === 0) {
      setPatients([]);
      setLoading(false);
      return;
    }

    const enriched = await Promise.all(links.map(async (link) => {
      const { data: authData } = await supabase
        .from('sessions')
        .select('phq_score, gad_score, created_at, answers')
        .eq('user_id', link.patient_id)
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: jData } = await supabase
        .from('journal_entries')
        .select('analysis, created_at')
        .eq('user_id', link.patient_id)
        .order('created_at', { ascending: false })
        .limit(3);

      const { data: pData } = await supabase.from('profiles').select('display_name, full_name').eq('id', link.patient_id).single();
      const latestPHQ  = authData?.[0]?.phq_score || 0;
      const latestGAD  = authData?.[0]?.gad_score || 0;
      const riskLevel  = latestPHQ >= 20 || latestGAD >= 15 ? 'high'
        : latestPHQ >= 10 || latestGAD >= 10 ? 'medium' : 'low';

      const hasAlert = jData?.some(j =>
        j.analysis?.risk_signals &&
        Object.values(j.analysis.risk_signals).some(v =>
          v === 'high' || v === 'severe' || v === 'present'
        )
      );

      return {
        ...link,
        email: pData?.display_name || pData?.full_name || 'Patient ' + link.patient_id?.slice(0,8),
        sessions:       authData || [],
        journals:       jData || [],
        riskLevel,
        hasAlert,
        psychologist_id: user.id
      };
    }));

    const alertPatients = enriched.filter(p => p.hasAlert || p.riskLevel === 'high');
    setAlerts(alertPatients);
    setPatients(enriched);
    setLoading(false);
  };

  const fetchPatientFull = async (patientId) => {
    const { data: s } = await supabase.from('sessions').select('*')
      .eq('user_id', patientId).order('created_at', { ascending: false });
    const { data: j } = await supabase.from('journal_entries').select('*')
      .eq('user_id', patientId).order('created_at', { ascending: false });
    setSessions(s || []);
    setJournals(j || []);
  };

  const linkPatient = async () => {
    if (!shareCode.trim()) return;
    const { data, error } = await supabase
      .from('patient_psychologist')
      .select('*')
      .eq('share_code', shareCode.trim().toUpperCase())
      .maybeSingle();

    if (error || !data) {
      setLinkMsg('❌ Invalid share code.');
      return;
    }
    if (data.psychologist_id && data.psychologist_id !== user.id) {
      setLinkMsg('❌ This patient is already linked to another psychologist.');
      return;
    }

    const { error: updateError } = await supabase.from('patient_psychologist')
      .update({ psychologist_id: user.id, active: true })
      .eq('share_code', shareCode.trim().toUpperCase());
    if (updateError) {
      setLinkMsg('❌ Failed to link: ' + updateError.message);
      return;
    }
    setLinkMsg('Patient linked successfully!');
    setShareCode('');
    fetchPatients();
  };

  const generateSOAP = async (session) => {
    setGenerating(true);
    setSoapNote('');
    try {
      const res = await axios.post(API + '/generate-soap', {
        session_data:         session,
        patient_concern:      session.answers?.concern || '',
        interview_assessment: session.answers?.interview_assessment || ''
      });
      setSoapNote(res.data.soap_note);
    } catch {
      setSoapNote('Error generating SOAP note.');
    }
    setGenerating(false);
  };

  const tabBtn = (id, label, active) => (
    <button key={id} onClick={() => setPatientTab(id)}
      style={{ padding:'8px 16px', border:'none', borderRadius:8,
        cursor:'pointer', fontSize:13, marginRight:8,
        background: active === id ? '#1D4ED8' : '#fff',
        color: active === id ? '#fff' : '#64748b',
        fontWeight: active === id ? 'bold' : 'normal' }}>
      {label}
    </button>
  );

  const isMobile = useIsMobile();
  return (
    <div style={{ display:'flex', minHeight:'100vh',
      fontFamily:"'Satoshi',-apple-system,sans-serif", background:'#F8FAFF' }}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={onLogout}
        patientCount={patients.length}
        alertCount={alerts.length}
      />

      <div style={{ flex:1, padding: isMobile ? '72px 12px 80px' : '32px', overflowY:'auto' }}>

        {/* ── ROSTER ── */}
        {activeTab === 'roster' && !selected && (
          <div>
            <div style={{ display:'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 12 : 0, justifyContent:'space-between',
              alignItems: isMobile ? 'flex-start' : 'center', marginBottom:24 }}>
              <h2 style={{ margin:0, color:'#1e293b' }}>Patient Roster</h2>
              <button onClick={() => setActiveTab('link')}
                style={{ padding:'10px 20px', background:'#1D4ED8', color:'#fff',
                  border:'none', borderRadius:8, cursor:'pointer', fontSize:14 }}>
                + Link Patient
              </button>
            </div>

            {loading ? (
              <p style={{ color:'#94a3b8' }}>Loading patients...</p>
            ) : patients.length === 0 ? (
              <div style={{ background:'#fff', borderRadius:16, padding:48,
                textAlign:'center', border:'1px solid #e2e8f0' }}>
                <div style={{ fontSize:48, marginBottom:16 }}>👥</div>
                <h3 style={{ color:'#1e293b' }}>No patients yet</h3>
                <p style={{ color:'#94a3b8' }}>
                  Ask patients to generate a Share Code from their dashboard.
                </p>
                <button onClick={() => setActiveTab('link')}
                  style={{ padding:'10px 24px', background:'#1D4ED8', color:'#fff',
                    border:'none', borderRadius:8, cursor:'pointer' }}>
                  Link Patient →
                </button>
              </div>
            ) : (
              <div style={{ display:'grid', gap:12 }}>
                {patients.map((p, i) => (
                  <PatientCard key={i} patient={p} onClick={() => {
                    setSelected(p);
                    fetchPatientFull(p.patient_id);
                    setPatientTab('overview');
                    setSoapNote('');
                  }} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PATIENT DETAIL ── */}
        {activeTab === 'roster' && selected && (
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24 }}>
              <button onClick={() => { setSelected(null); setSessions([]); setJournals([]); }}
                style={{ padding:'6px 14px', background:'#fff', border:'1px solid #e2e8f0',
                  borderRadius:8, cursor:'pointer', fontSize:13, color:'#64748b' }}>
                ← Roster
              </button>
              <button onClick={() => exportPatientReport({ name: selected.email }, sessions, journals)} style={{ padding:'6px 14px', background:'#1D4ED8', border:'none', borderRadius:8, cursor:'pointer', fontSize:13, color:'#fff' }}>Export PDF</button>
              <div>
                <h2 style={{ margin:0, color:'#1e293b', fontSize:18 }}>
                  Patient: {selected.email}
                </h2>
                <div style={{ display:'flex', gap:12, marginTop:4 }}>
                  <span style={{ fontSize:12, color:'#94a3b8' }}>
                    {sessions.length} sessions
                  </span>
                  <span style={{ fontSize:12, color:'#94a3b8' }}>
                    {journals.length} journal entries
                  </span>
                  <span style={{ fontSize:12, padding:'2px 8px', borderRadius:6,
                    background: riskColor(selected.riskLevel)+'20',
                    color: riskColor(selected.riskLevel), fontWeight:'bold' }}>
                    {(selected.riskLevel||'low').toUpperCase()} RISK
                  </span>
                </div>
              </div>
            </div>

            {/* Patient Tabs */}
            <div style={{ marginBottom:24, overflowX: isMobile ? 'auto' : 'visible', whiteSpace: isMobile ? 'nowrap' : 'normal', paddingBottom: isMobile ? 4 : 0 }}>
              {tabBtn('overview',   <><IconChart size={13} style={{marginRight:4}}/> Overview</>,        patientTab)}
              {tabBtn('brief',      <><IconTarget size={13} style={{marginRight:4}}/> Pre-Session</>,      patientTab)}
              {tabBtn('patterns',   '🧩 Patterns',         patientTab)}
              {tabBtn('sessions',   <><IconClipboard size={13} style={{marginRight:4}}/> Sessions</>,         patientTab)}
              {tabBtn('journals',   <><IconJournal size={13} style={{marginRight:4}}/> Journals</>,         patientTab)}
              {tabBtn('soap',       <><IconHospital size={13} style={{marginRight:4}}/> SOAP Notes</>,       patientTab)}
              {tabBtn('treatment',  <><IconPill size={13} style={{marginRight:4}}/> Treatment Plan</>,   patientTab)}
              {tabBtn('narrative',  '📖 Case Formulation', patientTab)}
            </div>

            {/* OVERVIEW */}
            {patientTab === 'overview' && (
              <div>
                {sessions.length === 0 ? (
                  <div style={{ background:'#fff', borderRadius:16, padding:32,
                    textAlign:'center', border:'1px solid #e2e8f0' }}>
                    <p style={{ color:'#94a3b8' }}>No assessment data yet.</p>
                  </div>
                ) : (
                  <div>
                    {/* Score Cards */}
                    <div style={{ display:'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)',
                      gap:12, marginBottom:20 }}>
                      {[
                        { label:'PHQ-9',    value:sessions[0]?.phq_score, level:phqLevel(sessions[0]?.phq_score||0) },
                        { label:'GAD-7',    value:sessions[0]?.gad_score, level:phqLevel(sessions[0]?.gad_score||0) },
                        { label:'Sessions', value:sessions.length,        level:{color:'#1D4ED8'} },
                        { label:'Journals', value:journals.length,        level:{color:'#1D4ED8'} },
                      ].map((c, i) => (
                        <div key={i} style={{ background:'#fff', borderRadius:12,
                          padding:16, textAlign:'center', border:'1px solid #e2e8f0' }}>
                          <div style={{ fontSize:11, color:'#94a3b8', marginBottom:4 }}>
                            {c.label}
                          </div>
                          <div style={{ fontSize:24, fontWeight:'bold', color:c.level.color }}>
                            {c.value ?? '-'}
                          </div>
                          {c.level.label && (
                            <div style={{ fontSize:11, color:c.level.color }}>
                              {c.level.label}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <SessionComparison sessions={sessions} />

                    {/* PHQ Trend */}
                    {sessions.length > 1 && (
                      <div style={{ background:'#fff', borderRadius:16, padding:24,
                        border:'1px solid #e2e8f0', marginBottom:20 }}>
                        <h3 style={{ margin:'0 0 16px', color:'#1e293b' }}>
                          PHQ-9 Trend
                        </h3>
                        <div style={{ display:'flex', alignItems:'flex-end',
                          gap:8, height:100 }}>
                          {[...sessions].reverse().map((s, i) => {
                            const h = Math.max((s.phq_score/27)*100, 4);
                            return (
                              <div key={i} style={{ flex:1, display:'flex',
                                flexDirection:'column', alignItems:'center', gap:4 }}>
                                <div style={{ width:'100%', height:h,
                                  background:phqLevel(s.phq_score).color, borderRadius:4 }} />
                                <span style={{ fontSize:10, color:'#94a3b8' }}>
                                  {s.phq_score}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Latest Interview */}
                    {sessions[0]?.answers?.interview_assessment && (
                      <div style={{ background:'#f0f9ff', borderRadius:16, padding:24,
                        border:'1px solid #bae6fd', marginBottom:20 }}>
                        <h3 style={{ margin:'0 0 12px', color:'#0369a1' }}>
                          <IconChat size={13} style={{marginRight:4}}/> Latest Interview Assessment
                        </h3>
                        <p style={{ fontSize:13, color:'#374151', lineHeight:1.8,
                          margin:0, whiteSpace:'pre-wrap' }}>
                          {sessions[0].answers.interview_assessment}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* PRE-SESSION BRIEF */}
            {patientTab === 'brief' && (
              <PreSessionBrief
                patient={selected}
                sessions={sessions}
                journals={journals}
              />
            )}

            {/* COGNITIVE PATTERNS */}
            {patientTab === 'patterns' && (
              <CognitivePatternDetector journals={journals} />
            )}

            {/* SESSIONS */}
            {patientTab === 'sessions' && (
              <div>
                {sessions.map((s, i) => (
                  <div key={i} style={{ background:'#fff', borderRadius:16,
                    padding:20, border:'1px solid #e2e8f0', marginBottom:12 }}>
                    <div style={{ display:'flex', justifyContent:'space-between',
                      marginBottom:12 }}>
                      <strong>Session {sessions.length - i}</strong>
                      <span style={{ fontSize:12, color:'#94a3b8' }}>
                        {new Date(s.created_at).toLocaleDateString('en-IN',
                          {day:'numeric',month:'short',year:'numeric'})}
                      </span>
                    </div>
                    <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:12 }}>
                      {[
                        {l:'PHQ-9', v:s.phq_score},
                        {l:'GAD-7', v:s.gad_score}
                      ].map((item,j) => (
                        <div key={j} style={{ background:'#f8fafc', borderRadius:8,
                          padding:'6px 14px', textAlign:'center' }}>
                          <div style={{ fontSize:18, fontWeight:'bold',
                            color:phqLevel(item.v).color }}>{item.v}</div>
                          <div style={{ fontSize:10, color:'#94a3b8' }}>{item.l}</div>
                        </div>
                      ))}
                    </div>
                    {s.answers?.interview_assessment && (
                      <div style={{ fontSize:12, color:'#64748b', background:'#f8fafc',
                        padding:'8px 12px', borderRadius:8, marginBottom:8 }}>
                        <IconChat size={13} style={{marginRight:4}}/> {s.answers.interview_assessment.slice(0,150)}...
                      </div>
                    )}
                    <button onClick={() => { generateSOAP(s); setPatientTab('soap'); }}
                      style={{ padding:'6px 16px', background:'#1D4ED8', color:'#fff',
                        border:'none', borderRadius:8, cursor:'pointer', fontSize:12 }}>
                      Generate SOAP Note
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* JOURNALS */}
            {patientTab === 'journals' && (
              <div>
                {journals.length === 0 ? (
                  <p style={{ color:'#94a3b8' }}>No journal entries.</p>
                ) : journals.map((j, i) => (
                  <div key={i} style={{ background:'#fff', borderRadius:16,
                    padding:20, border:'1px solid #e2e8f0', marginBottom:12 }}>
                    <div style={{ display:'flex', justifyContent:'space-between',
                      marginBottom:8 }}>
                      <strong style={{ color:'#1D4ED8', textTransform:'capitalize' }}>
                        {j.analysis?.emotions?.primary || 'Entry'} —{' '}
                        {j.analysis?.emotions?.intensity || ''}
                      </strong>
                      <span style={{ fontSize:12, color:'#94a3b8' }}>
                        {new Date(j.created_at).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <p style={{ fontSize:13, color:'#475569', fontStyle:'italic',
                      margin:'0 0 8px' }}>"{j.text?.slice(0,200)}..."</p>
                    {j.analysis?.condition_detection && (
                      <div style={{ fontSize:12, color:'#1D4ED8', marginBottom:6 }}>
                        Condition: <strong>
                          {j.analysis.condition_detection.primary_condition}
                        </strong> ({j.analysis.condition_detection.confidence}%)
                      </div>
                    )}
                    {j.analysis?.risk_signals && (
                      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                        {Object.entries(j.analysis.risk_signals).map(([k,v]) =>
                          (v !== 'none' && v !== 'low') && (
                            <span key={k} style={{ fontSize:11, padding:'2px 8px',
                              background:'#fef3c7', borderRadius:6, color:'#92400e' }}>
                              <IconWarning size={13} color='#dc2626' style={{marginRight:4}}/> {k.replace(/_/g,' ')}: {v}
                            </span>
                          )
                        )}
                      </div>
                    )}
                    {j.analysis?.clinical_summary && (
                      <p style={{ fontSize:12, color:'#64748b', margin:'8px 0 0',
                        background:'#f8fafc', padding:'8px 12px', borderRadius:8 }}>
                        {j.analysis.clinical_summary}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* SOAP */}
            {patientTab === 'soap' && (
              <div>
                {generating ? (
                  <div style={{ background:'#fff', borderRadius:16, padding:32,
                    textAlign:'center' }}>
                    <p style={{ color:'#1D4ED8' }}>⚙️ Generating SOAP note...</p>
                  </div>
                ) : soapNote ? (
                  <div style={{ background:'#fff', borderRadius:16, padding:24,
                    border:'1px solid #e2e8f0' }}>
                    <h3 style={{ margin:'0 0 16px', color:'#1D4ED8' }}><IconClipboard size={16} color='#1D4ED8' style={{marginRight:6}}/> SOAP Note</h3>
                    <pre style={{ fontSize:13, color:'#374151', lineHeight:1.8,
                      whiteSpace:'pre-wrap', fontFamily:"'Satoshi',-apple-system,sans-serif" }}>
                      {soapNote}
                    </pre>
                  </div>
                ) : (
                  <div style={{ background:'#fff', borderRadius:16, padding:32,
                    textAlign:'center', border:'1px solid #e2e8f0' }}>
                    <p style={{ color:'#94a3b8' }}>
                      Go to Sessions tab and click "Generate SOAP Note".
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TREATMENT PLAN */}
            {patientTab === 'treatment' && (
              <TreatmentPlanBuilder
                patient={selected}
                userId={selected.patient_id}
              />
            )}

            {/* LONGITUDINAL NARRATIVE */}
            {patientTab === 'narrative' && (
              <LongitudinalNarrative
                patient={selected}
                sessions={sessions}
                journals={journals}
              />
            )}
          </div>
        )}

        {/* ── LINK PATIENT ── */}
        {activeTab === 'link' && (
          <div style={{ maxWidth:480 }}>
            <h2 style={{ color:'#1e293b', margin:'0 0 24px' }}>Link a Patient</h2>
            <div style={{ background:'#fff', borderRadius:16, padding:24,
              border:'1px solid #e2e8f0' }}>
              <h3 style={{ margin:'0 0 8px' }}>Enter Patient Share Code</h3>
              <p style={{ fontSize:13, color:'#94a3b8', marginBottom:16 }}>
                Ask patient to generate a Share Code from their dashboard.
              </p>
              <input value={shareCode}
                onChange={e => setShareCode(e.target.value.toUpperCase())}
                placeholder="e.g. ABC12345"
                style={{ width:'100%', padding:'12px 16px', borderRadius:8,
                  border:'1px solid #e2e8f0', fontSize:18, letterSpacing:4,
                  boxSizing:'border-box', marginBottom:12, textAlign:'center' }} />
              {linkMsg && (
                <p style={{ fontSize:13, marginBottom:12,
                  color: linkMsg.startsWith('Patient') ? '#16a34a' : '#dc2626' }}>
                  {linkMsg}
                </p>
              )}
              <button onClick={linkPatient}
                style={{ width:'100%', padding:'12px', background:'#1D4ED8',
                  color:'#fff', border:'none', borderRadius:10,
                  cursor:'pointer', fontSize:15, fontWeight:'bold' }}>
                Link Patient
              </button>
            </div>
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard patients={patients} alerts={crisisAlerts} />
        )}
        {activeTab === 'alerts' && (
          <div>
            <h2 style={{ color:'#1e293b', margin:'0 0 24px' }}><IconAlert size={20} color='#dc2626' style={{marginRight:8}}/> Crisis Alerts</h2>
            {alerts.length === 0 ? (
              <div style={{ background:'#f0fdf4', borderRadius:16, padding:48,
                textAlign:'center', border:'1px solid #86efac' }}>
                <div style={{ fontSize:48, marginBottom:16 }}><IconCheck size={48} color='#16a34a'/></div>
                <h3 style={{ color:'#16a34a' }}>No active alerts</h3>
                <p style={{ color:'#94a3b8' }}>All patients are in safe range.</p>
              </div>
            ) : alerts.map((p, i) => (
              <div key={i} style={{ background:'#fef2f2', borderRadius:16,
                padding:20, border:'2px solid #fecaca', marginBottom:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between',
                  alignItems:'center', marginBottom:12 }}>
                  <div>
                    <strong style={{ color:'#dc2626', display:'flex', alignItems:'center', gap:4 }}><IconAlert size={14} color='#dc2626'/> High Risk Patient</strong>
                    <div style={{ fontSize:12, color:'#94a3b8', marginTop:4 }}>
                      Patient: {p.email}
                    </div>
                  </div>
                  <button onClick={() => {
                    setSelected(p);
                    fetchPatientFull(p.patient_id);
                    setPatientTab('overview');
                    setActiveTab('roster');
                  }}
                    style={{ padding:'8px 16px', background:'#dc2626', color:'#fff',
                      border:'none', borderRadius:8, cursor:'pointer', fontSize:13 }}>
                    View Patient →
                  </button>
                </div>
                <div style={{ fontSize:13, color:'#374151' }}>
                  PHQ-9: <strong style={{ color:'#ef4444' }}>
                    {p.sessions?.[0]?.phq_score}
                  </strong> · Risk Level: <strong style={{ color:'#ef4444' }}>
                    {p.riskLevel?.toUpperCase()}
                  </strong>
                </div>
                <div style={{ marginTop:12, padding:'8px 12px', background:'#fee2e2',
                  borderRadius:8, fontSize:13, color:'#dc2626' }}>
                  🆘 Crisis Resources: iCall 9152987821 | Vandrevala 1860-2662-345
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'appointments' && (
          <div>
            <h2 style={{ color:'#1e293b', margin:'0 0 24px' }}>Appointments</h2>
            <AppointmentsList psychologistId={user.id} />
          </div>
        )}
        {activeTab === 'messages' && <Messages user={user} contacts={patients.map(p => ({ id: p.patient_id, name: p.email, role: 'patient' }))} />}
        {activeTab === 'invite' && <InvitePatient user={user} />}
      </div>
    </div>
  );
}