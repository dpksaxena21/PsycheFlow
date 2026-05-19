import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import AppointmentsList from './AppointmentsList';
import Messages from './Messages';
import { exportPatientReport } from './pdfExport';
import axios from 'axios';

// ── UTILITIES ─────────────────────────────────────────────
const phqLevel = (s) => s <= 4  ? {label:'Minimal',  color:'#22c55e'}
  : s <= 9  ? {label:'Mild',     color:'#f59e0b'}
  : s <= 14 ? {label:'Moderate', color:'#f97316'}
  :           {label:'Severe',   color:'#ef4444'};

const riskColor = (r) => r === 'high' ? '#ef4444'
  : r === 'medium' ? '#f59e0b' : '#22c55e';

// ── SIDEBAR ───────────────────────────────────────────────
function Sidebar({ activeTab, setActiveTab, user, onLogout, patientCount, alertCount }) {
  const items = [
    { id:'roster',    icon:'👥', label:'Patient Roster',   badge: patientCount },
    { id:'link',      icon:'🔗', label:'Link Patient' },
    { id:'analytics', icon:'📊', label:'Practice Analytics' },
    { id:'alerts',    icon:'🚨', label:'Crisis Alerts',    badge: alertCount, badgeColor:'#ef4444' },
    { id:'appointments', icon:'📅', label:'Appointments' },
    { id:'messages', icon:'msg', label:'Messages' },
  ];

  return (
    <div style={{ width:240, background:'#0f0e2e', padding:24,
      display:'flex', flexDirection:'column', gap:4, minHeight:'100vh' }}>
      <div style={{ marginBottom:32 }}>
        <div style={{ fontSize:22, color:'#fff', fontWeight:'bold' }}>🧠 PsycheFlow</div>
        <div style={{ fontSize:11, color:'#a5b4fc', marginTop:2 }}>Clinician Portal</div>
        <div style={{ fontSize:11, color:'#6366f1', marginTop:8,
          background:'rgba(99,102,241,0.1)', padding:'4px 8px', borderRadius:6 }}>
          {user.email}
        </div>
      </div>

      {items.map(item => (
        <button key={item.id} onClick={() => setActiveTab(item.id)}
          style={{ padding:'10px 14px', borderRadius:10, border:'none',
            cursor:'pointer', textAlign:'left', fontSize:13,
            background: activeTab === item.id ? 'rgba(99,102,241,0.3)' : 'transparent',
            color: activeTab === item.id ? '#fff' : '#a5b4fc',
            display:'flex', alignItems:'center', gap:10, position:'relative' }}>
          <span>{item.icon}</span>
          {item.label}
          {item.badge > 0 && (
            <span style={{ marginLeft:'auto', background: item.badgeColor || '#6366f1',
              color:'#fff', borderRadius:10, padding:'2px 8px', fontSize:11 }}>
              {item.badge}
            </span>
          )}
        </button>
      ))}

      <div style={{ marginTop:'auto' }}>
        <button onClick={onLogout}
          style={{ width:'100%', padding:'8px 14px', borderRadius:8, border:'none',
            cursor:'pointer', background:'rgba(255,255,255,0.05)',
            color:'#a5b4fc', fontSize:12 }}>
          Sign Out
        </button>
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
      onMouseEnter={e => e.currentTarget.style.borderColor='#6366f1'}
      onMouseLeave={e => e.currentTarget.style.borderColor = risk === 'high' ? '#fecaca' : '#e2e8f0'}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:44, height:44, borderRadius:'50%',
            background: risk === 'high' ? '#fef2f2' : '#eef2ff',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>
            {risk === 'high' ? '⚠️' : '👤'}
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

      const res = await axios.post('http://127.0.0.1:8000/pre-session-brief', {
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
        <h3 style={{ margin:0, color:'#0369a1' }}>🎯 AI Pre-Session Brief</h3>
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
      const res = await axios.post('http://127.0.0.1:8000/detect-patterns', {
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
              <strong style={{ fontSize:13, color:'#6366f1' }}>Dominant Thought Patterns:</strong>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:8 }}>
                {patterns.dominant_patterns.map((p, i) => (
                  <span key={i} style={{ background:'#eef2ff', color:'#6366f1',
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
        <button onClick={detect} style={{ padding:'8px 16px', background:'#6366f1',
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
      <h3 style={{ margin:'0 0 20px', color:'#1e293b' }}>📋 Treatment Plan Builder</h3>

      <div style={{ marginBottom:16 }}>
        <label style={{ fontSize:13, color:'#475569', fontWeight:'bold' }}>
          Therapy Approach
        </label>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:8 }}>
          {approaches.map(a => (
            <button key={a} onClick={() => setPlan({...plan, approach:a})}
              style={{ padding:'6px 14px', borderRadius:20, border:'none',
                cursor:'pointer', fontSize:13,
                background: plan.approach === a ? '#6366f1' : '#f1f5f9',
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
                background: plan.frequency === f.toLowerCase() ? '#6366f1' : '#f1f5f9',
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
            minHeight:80, boxSizing:'border-box', fontFamily:'sans-serif' }} />
      </div>

      {saved ? (
        <div style={{ background:'#f0fdf4', borderRadius:8, padding:12,
          fontSize:13, color:'#16a34a' }}>
          ✅ Treatment plan saved successfully.
        </div>
      ) : (
        <button onClick={save} disabled={loading}
          style={{ padding:'10px 24px', background:'#6366f1', color:'#fff',
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
      const res = await axios.post('http://127.0.0.1:8000/longitudinal-narrative', {
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
          style={{ padding:'8px 16px', background:'#6366f1', color:'#fff',
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
      const res = await axios.get(`http://127.0.0.1:8000/crisis-alerts/${user.id}`);
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
    setLinkMsg('✅ Patient linked successfully!');
    setShareCode('');
    fetchPatients();
  };

  const generateSOAP = async (session) => {
    setGenerating(true);
    setSoapNote('');
    try {
      const res = await axios.post('http://127.0.0.1:8000/generate-soap', {
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
        background: active === id ? '#6366f1' : '#fff',
        color: active === id ? '#fff' : '#64748b',
        fontWeight: active === id ? 'bold' : 'normal' }}>
      {label}
    </button>
  );

  return (
    <div style={{ display:'flex', minHeight:'100vh',
      fontFamily:'sans-serif', background:'#f1f5f9' }}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={onLogout}
        patientCount={patients.length}
        alertCount={alerts.length}
      />

      <div style={{ flex:1, padding:32, overflowY:'auto' }}>

        {/* ── ROSTER ── */}
        {activeTab === 'roster' && !selected && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between',
              alignItems:'center', marginBottom:24 }}>
              <h2 style={{ margin:0, color:'#1e293b' }}>Patient Roster</h2>
              <button onClick={() => setActiveTab('link')}
                style={{ padding:'10px 20px', background:'#6366f1', color:'#fff',
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
                  style={{ padding:'10px 24px', background:'#6366f1', color:'#fff',
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
              <button onClick={() => exportPatientReport({ name: selected.email }, sessions, journals)} style={{ padding:'6px 14px', background:'#4F46E5', border:'none', borderRadius:8, cursor:'pointer', fontSize:13, color:'#fff' }}>Export PDF</button>
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
            <div style={{ marginBottom:24 }}>
              {tabBtn('overview',   '📊 Overview',        patientTab)}
              {tabBtn('brief',      '🎯 Pre-Session',      patientTab)}
              {tabBtn('patterns',   '🧩 Patterns',         patientTab)}
              {tabBtn('sessions',   '📋 Sessions',         patientTab)}
              {tabBtn('journals',   '📝 Journals',         patientTab)}
              {tabBtn('soap',       '🏥 SOAP Notes',       patientTab)}
              {tabBtn('treatment',  '💊 Treatment Plan',   patientTab)}
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
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)',
                      gap:12, marginBottom:20 }}>
                      {[
                        { label:'PHQ-9',    value:sessions[0]?.phq_score, level:phqLevel(sessions[0]?.phq_score||0) },
                        { label:'GAD-7',    value:sessions[0]?.gad_score, level:phqLevel(sessions[0]?.gad_score||0) },
                        { label:'Sessions', value:sessions.length,        level:{color:'#6366f1'} },
                        { label:'Journals', value:journals.length,        level:{color:'#6366f1'} },
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
                          💬 Latest Interview Assessment
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
                        💬 {s.answers.interview_assessment.slice(0,150)}...
                      </div>
                    )}
                    <button onClick={() => { generateSOAP(s); setPatientTab('soap'); }}
                      style={{ padding:'6px 16px', background:'#6366f1', color:'#fff',
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
                      <strong style={{ color:'#6366f1', textTransform:'capitalize' }}>
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
                      <div style={{ fontSize:12, color:'#6366f1', marginBottom:6 }}>
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
                              ⚠️ {k.replace(/_/g,' ')}: {v}
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
                    <p style={{ color:'#6366f1' }}>⚙️ Generating SOAP note...</p>
                  </div>
                ) : soapNote ? (
                  <div style={{ background:'#fff', borderRadius:16, padding:24,
                    border:'1px solid #e2e8f0' }}>
                    <h3 style={{ margin:'0 0 16px', color:'#6366f1' }}>📋 SOAP Note</h3>
                    <pre style={{ fontSize:13, color:'#374151', lineHeight:1.8,
                      whiteSpace:'pre-wrap', fontFamily:'sans-serif' }}>
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
                  color: linkMsg.startsWith('✅') ? '#16a34a' : '#dc2626' }}>
                  {linkMsg}
                </p>
              )}
              <button onClick={linkPatient}
                style={{ width:'100%', padding:'12px', background:'#6366f1',
                  color:'#fff', border:'none', borderRadius:10,
                  cursor:'pointer', fontSize:15, fontWeight:'bold' }}>
                Link Patient
              </button>
            </div>
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {activeTab === 'analytics' && (
          <div>
            <h2 style={{ color:'#1e293b', margin:'0 0 24px' }}>Practice Analytics</h2>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr',
              gap:16, marginBottom:24 }}>
              {[
                { label:'Total Patients',    value:patients.length,                            icon:'👥', color:'#6366f1' },
                { label:'High Risk Patients', value:patients.filter(p=>p.riskLevel==='high').length, icon:'🚨', color:'#ef4444' },
                { label:'Active Alerts',      value:alerts.length,                              icon:'⚠️', color:'#f59e0b' },
              ].map((c,i) => (
                <div key={i} style={{ background:'#fff', borderRadius:16, padding:24,
                  border:'1px solid #e2e8f0', textAlign:'center' }}>
                  <div style={{ fontSize:32, marginBottom:8 }}>{c.icon}</div>
                  <div style={{ fontSize:32, fontWeight:'bold', color:c.color }}>{c.value}</div>
                  <div style={{ fontSize:13, color:'#94a3b8' }}>{c.label}</div>
                </div>
              ))}
            </div>

            {/* Risk Distribution */}
            <div style={{ background:'#fff', borderRadius:16, padding:24,
              border:'1px solid #e2e8f0', marginBottom:20 }}>
              <h3 style={{ margin:'0 0 16px', color:'#1e293b' }}>Risk Distribution</h3>
              {['high','medium','low'].map(risk => {
                const count = patients.filter(p => p.riskLevel === risk).length;
                const pct   = patients.length ? (count/patients.length)*100 : 0;
                return (
                  <div key={risk} style={{ marginBottom:12 }}>
                    <div style={{ display:'flex', justifyContent:'space-between',
                      marginBottom:4 }}>
                      <span style={{ fontSize:13, textTransform:'capitalize',
                        color: riskColor(risk) }}>{risk} Risk</span>
                      <span style={{ fontSize:13, color:'#94a3b8' }}>
                        {count} patients
                      </span>
                    </div>
                    <div style={{ background:'#e2e8f0', borderRadius:6, height:8 }}>
                      <div style={{ width:`${pct}%`, background:riskColor(risk),
                        height:8, borderRadius:6 }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ background:'#fff', borderRadius:16, padding:24,
              border:'1px solid #e2e8f0' }}>
              <h3 style={{ margin:'0 0 8px', color:'#1e293b' }}>📊 Power BI Integration</h3>
              <p style={{ fontSize:13, color:'#94a3b8', margin:'0 0 16px' }}>
                Connect Supabase to Power BI for advanced practice analytics.
              </p>
              <div style={{ background:'#f8fafc', borderRadius:8, padding:12,
                fontSize:12, color:'#64748b', fontFamily:'monospace' }}>
                Host: db.uckgvukjdekoxfbxnqew.supabase.co<br/>
                Port: 5432<br/>
                Database: postgres<br/>
                Schema: public
              </div>
            </div>
          </div>
        )}

        {/* ── CRISIS ALERTS ── */}
        {activeTab === 'alerts' && (
          <div>
            <h2 style={{ color:'#1e293b', margin:'0 0 24px' }}>🚨 Crisis Alerts</h2>
            {alerts.length === 0 ? (
              <div style={{ background:'#f0fdf4', borderRadius:16, padding:48,
                textAlign:'center', border:'1px solid #86efac' }}>
                <div style={{ fontSize:48, marginBottom:16 }}>✅</div>
                <h3 style={{ color:'#16a34a' }}>No active alerts</h3>
                <p style={{ color:'#94a3b8' }}>All patients are in safe range.</p>
              </div>
            ) : alerts.map((p, i) => (
              <div key={i} style={{ background:'#fef2f2', borderRadius:16,
                padding:20, border:'2px solid #fecaca', marginBottom:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between',
                  alignItems:'center', marginBottom:12 }}>
                  <div>
                    <strong style={{ color:'#dc2626' }}>⚠️ High Risk Patient</strong>
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
      </div>
    </div>
  );
}