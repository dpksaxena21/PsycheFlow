import React, { useState, useEffect } from 'react';
const useIsMobile = () => { const [m, setM] = React.useState(window.innerWidth < 768); useEffect(() => { const h = () => setM(window.innerWidth < 768); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h); }, []); return m; };
import { logAction, ACTIONS } from './audit';
import { useAuthStore, useAssessmentStore } from './store';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Landing from './Landing';
import axios from 'axios';
import { supabase } from './supabase';
import Auth from './Auth';
import AdaptiveQuestionnaire from './AdaptiveQuestionnaire';
import ClinicalInterview from './ClinicalInterview';
import Dashboard from './Dashboard';
import PsychologistPortal from './PsychologistShell';
import ACTEngine from './ACTEngine';
import CrisisManagement from './CrisisManagement';
import Consent from './Consent';
import Onboarding from './Onboarding';
import Privacy from './Privacy';
import PsychologistLanding from './PsychologistLanding';
import HospitalLanding from './HospitalLanding';
import HospitalAuth from './HospitalAuth';
import HospitalPortal from './HospitalPortal';
import SuperAdmin from './SuperAdminShell';
import SuperAdminAuth from './SuperAdminAuth';
import PsychologistAuth from './PsychologistAuth';
import Terms from './Terms';
import DPDP from './DPDP';

import { IconJournal, IconAnalyze, IconAlert, IconCheck, IconWarning } from './icons';
import LoadingScreen from './LoadingScreen';
const API = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';


const bigFive   = ['Extraversion','Neuroticism','Agreeableness','Conscientiousness','Openness'];
const darkTriad = ['Machiavellianism','Narcissism','Psychopathy'];
const colorMap  = { High:'#ef4444', Medium:'#f59e0b', Low:'#22c55e' };
const dtColor   = { High:'#dc2626', Medium:'#f97316', Low:'#16a34a' };

function JournalSection({ userId }) {
  const [text, setText]         = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading]   = useState(false);

  const analyze = async () => {
    if (text.trim().length < 20) return;
    setLoading(true);
    try {
      const res = await axios.post(API + '/analyze-journal', { text });
      setAnalysis(res.data);
      await supabase.from('journal_entries').insert({ user_id: userId, text, analysis: res.data });
    } catch { alert('Journal analysis failed'); }
    setLoading(false);
  };

  return (
    <div style={{ background:'#fff', borderRadius:16, padding:24, border:'1px solid #e2e8f0', marginTop:20 }}>
      <h3 style={{ margin:'0 0 8px', color:'#1D4ED8' }}><IconJournal size={18} color='#1D4ED8' style={{marginRight:6}}/> Journal Analysis</h3>
      <p style={{ fontSize:13, color:'#94a3b8', marginTop:0, marginBottom:16 }}>Write freely about how you feel. Our AI will analyze it clinically.</p>
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder="What's on your mind today? Write freely..."
        style={{ width:'100%', minHeight:120, padding:12, borderRadius:8, border:'1px solid #e2e8f0', fontSize:14, fontFamily:"'Satoshi',-apple-system,sans-serif", resize:'vertical', boxSizing:'border-box', outline:'none' }} />
      <button onClick={analyze} disabled={loading || text.trim().length < 20}
        style={{ marginTop:12, padding:'10px 24px', background:'#1D4ED8', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:14 }}>
        {loading ? <><IconEEG size={15} color='white' style={{marginRight:6}}/> Analyzing...</> : <><IconAnalyze size={15} color='white' style={{marginRight:6}}/> Analyze Journal</>}
      </button>
      {analysis && (
        <div style={{ marginTop:20 }}>
          {analysis.condition_detection && (
            <div style={{ background: analysis.condition_detection.alert ? '#fef2f2' : '#f0f9ff', borderRadius:12, padding:16, marginBottom:12, border: analysis.condition_detection.alert ? '2px solid #ef4444' : '1px solid #bae6fd' }}>
              <strong style={{ color: analysis.condition_detection.alert ? '#dc2626' : '#0369a1' }}>{analysis.condition_detection.alert ? <IconAlert size={15} color='#dc2626'/> : <IconAnalyze size={15} color='#0369a1'/>} Condition Detection</strong>
              <div style={{ marginTop:8 }}>
                <span style={{ fontSize:15, fontWeight:'bold', color: analysis.condition_detection.alert ? '#dc2626' : '#1e293b' }}>{analysis.condition_detection.primary_condition}</span>
                <span style={{ fontSize:13, color:'#64748b', marginLeft:8 }}>({analysis.condition_detection.confidence}% confidence)</span>
              </div>
              <div style={{ fontSize:12, color:'#94a3b8', marginTop:6 }}>
                {analysis.condition_detection.top3.map((t, i) => (<span key={i} style={{ marginRight:12 }}>{t.condition}: {t.probability}%</span>))}
              </div>
              {analysis.condition_detection.alert && (
                <div style={{ marginTop:10, padding:'8px 12px', background:'#fee2e2', borderRadius:8, fontSize:13, color:'#dc2626' }}>
                  <IconWarning size={14} color='#dc2626' style={{marginRight:4}}/> If you are in crisis, please call iCall: <strong>9152987821</strong>
                </div>
              )}
            </div>
          )}
          <div style={{ background:'#f8fafc', borderRadius:12, padding:16, marginBottom:12 }}>
            <strong>Primary Emotion:</strong> <span style={{ color:'#1D4ED8', textTransform:'capitalize' }}>{analysis.emotions.primary}</span> — Intensity: <strong>{analysis.emotions.intensity}</strong><br/>
            <span style={{ fontSize:13, color:'#64748b' }}>Also detected: {analysis.emotions.secondary.join(', ')}</span>
          </div>
          <div style={{ background:'#fff7ed', borderRadius:12, padding:16, marginBottom:12 }}>
            <strong>Risk Signals</strong>
            <div style={{ fontSize:13, marginTop:8, display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
              {Object.entries(analysis.risk_signals).map(([k, v]) => (
                <div key={k}><span style={{ color:'#94a3b8' }}>{k.replace(/_/g,' ')}: </span><strong style={{ color: v==='none'||v==='low' ? '#22c55e' : v==='mild' ? '#f59e0b' : '#ef4444' }}>{v}</strong></div>
              ))}
            </div>
          </div>
          {analysis.cognitive_distortions.length > 0 && (
            <div style={{ background:'#fef2f2', borderRadius:12, padding:16, marginBottom:12 }}>
              <strong>Cognitive Distortions Detected</strong>
              {analysis.cognitive_distortions.map((d, i) => (
                <div key={i} style={{ fontSize:13, marginTop:8, borderLeft:'3px solid #ef4444', paddingLeft:10 }}>
                  <strong>{d.type}</strong> — {d.severity}<br/><span style={{ color:'#64748b' }}>"{d.evidence}"</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ background:'#f0fdf4', borderRadius:12, padding:16 }}>
            <strong>Clinical Summary</strong>
            <p style={{ fontSize:13, color:'#374151', margin:'8px 0' }}>{analysis.clinical_summary}</p>
            <strong style={{ fontSize:13 }}>Recommended Focus: </strong><span style={{ fontSize:13, color:'#1D4ED8' }}>{analysis.recommended_focus}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  // Zustand stores
  const { user, setUser, profile, isPsychologist, setIsPsychologist, showLanding, setShowLanding, legalPage, setLegalPage, showPsychLanding, setShowPsychLanding, showPsychAuth, setShowPsychAuth, showHospitalLanding, setShowHospitalLanding, showHospitalAuth, setShowHospitalAuth, hospitalUser, setHospitalUser,
          consentGiven, setConsentGiven, onboarded, setOnboarded, login, logout, checkOnboarding } = useAuthStore();
  const { screen, setScreen, results, setResults, fullReport, setFullReport } = useAssessmentStore();
  const isMobile = useIsMobile();

  // Local UI state
  const [reportLoading, setReportLoading]     = useState(false);
  const [assessMode, setAssessMode]           = useState(null);
  const [showACT, setShowACT]                 = useState(false);
  const [showCrisis, setShowCrisis]           = useState(false);
  const [superAdminUser, setSuperAdminUser]   = useState(() => { try { return JSON.parse(localStorage.getItem('psycheflow_superadmin')||'null'); } catch { return null; } });
  const [showSuperAdminAuth, setShowSuperAdminAuth] = useState(false);


  // checkOnboarding now handled by Zustand store

  React.useEffect(() => {
    // Restore hospital session if exists
    const savedHospital = localStorage.getItem('psycheflow_hospital_user');
    if (savedHospital) {
      try { setHospitalUser(JSON.parse(savedHospital)); } catch { localStorage.removeItem('psycheflow_hospital_user'); }
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!savedHospital) {
        setUser(session?.user ?? null);
        if (session?.user) checkOnboarding(session.user.id);
        if (session?.user) logAction(session.user.id, ACTIONS.LOGIN, 'auth');
      }
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      if (!localStorage.getItem('psycheflow_hospital_user')) {
        setUser(session?.user ?? null);
        if (session?.user) checkOnboarding(session.user.id);
      }
    });
  }, []);

  // Session timeout after 30 mins inactivity
  React.useEffect(() => {
    if (!user) return;
    let timer = setTimeout(() => {
      supabase.auth.signOut();
      setUser(null);
      alert("Session expired. Please log in again.");
    }, 30 * 60 * 1000);
    const reset = () => { clearTimeout(timer); timer = setTimeout(() => { supabase.auth.signOut(); setUser(null); }, 30 * 60 * 1000); };
    window.addEventListener("mousemove", reset);
    window.addEventListener("keydown", reset);
    return () => { clearTimeout(timer); window.removeEventListener("mousemove", reset); window.removeEventListener("keydown", reset); };
  }, [user]);

  const handleComplete = async ({ answers, age, gender, occupation, concern }) => {
    setScreen('loading');
    setFullReport(null);
    const score = (ids) => ids.reduce((s, id) => s + (answers[id] || 3), 0) / ids.length;
    const payload = {
      age, gender,
      Extraversion: score(['E1','E2']), Neuroticism: score(['N1','N2']),
      Agreeableness: score(['A1','A2']), Conscientiousness: score(['C1','C2']),
      Openness: score(['O1','O2']), Machiavellianism: score(['M1','M2']),
      Narcissism: score(['NA1','NA2']), Psychopathy: score(['P1','P2']),
    };
    const phq = ['PHQ1','PHQ2','PHQ3','PHQ4','PHQ5','PHQ6','PHQ7','PHQ8','PHQ9'].reduce((s,id)=>s+(answers[id]||0),0);
    const gad = ['GAD1','GAD2','GAD3','GAD4','GAD5','GAD6','GAD7'].reduce((s,id)=>s+(answers[id]||0),0);
    const bipolar    = ['MDQ1','MDQ2','MDQ3','MDQ4','MDQ5'].reduce((s,id)=>s+(answers[id]||0),0);
    const ptsd       = ['PCL1','PCL2','PCL3','PCL4','PCL5'].reduce((s,id)=>s+(answers[id]||0),0);
    const ocd        = ['OCD1','OCD2','OCD3','OCD4','OCD5'].reduce((s,id)=>s+(answers[id]||0),0);
    const adhd       = ['ADHD1','ADHD2','ADHD3','ADHD4','ADHD5'].reduce((s,id)=>s+(answers[id]||0),0);
    const burnout    = ['BRN1','BRN2','BRN3','BRN4','BRN5'].reduce((s,id)=>s+(answers[id]||0),0);
    const selfEsteem = ['RSE1','RSE2','RSE3','RSE4'].reduce((s,id)=>s+(answers[id]||0),0);
    try {
      const res = await axios.post(API + '/predict', payload);
      const predictions = res.data.predictions;
      if (user) await supabase.from('sessions').insert({ user_id: user.id, phq_score: phq, gad_score: gad, predictions, answers });
      if (user) { try { await axios.post(API + '/check-crisis', { patient_id: user.id, phq_score: phq, gad_score: gad, answers }); } catch(e) { console.log('Crisis check error:', e); } }
      setResults({ predictions, phq, gad, age, gender, occupation, concern, bipolar, ptsd, ocd, adhd, burnout, selfEsteem });
      setScreen('results');
    } catch { alert('API error — is FastAPI running?'); setScreen('home'); }
  };

  const handleGenerateReport = async () => {
    setReportLoading(true);
    try {
      const res = await axios.post(API + '/generate-report', { predictions: results.predictions, phq_score: results.phq, gad_score: results.gad, age: results.age || 25, gender: results.gender || 1 });
      setFullReport(res.data);
    } catch { alert('Report generation failed'); }
    setReportLoading(false);
  };

  const handleLogout = async () => { setShowLanding(true);
    logAction(user?.id, ACTIONS.LOGOUT, 'auth');
    await supabase.auth.signOut();
    setUser(null); setScreen('home'); setResults(null); setFullReport(null);
    setAssessMode(null); setIsPsychologist(false); setShowACT(false);
    setShowCrisis(false); setOnboarded(null); 
  };

  const [expandedTrait, setExpandedTrait] = React.useState(null);
  const TraitBar = ({ name, data, colorFn }) => (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4, cursor:'pointer' }} onClick={() => setExpandedTrait(expandedTrait===name?null:name)}>
        <strong style={{ fontSize:14, color:'#0C1A2E' }}>{name}</strong>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ color: colorFn(data.label), fontWeight:'bold', fontSize:14 }}>{data.label} ({data.confidence}%)</span>
          {data && data.explanation && data.explanation.length > 0 && <span style={{ fontSize:11, color:'#1D4ED8', fontWeight:600 }}>why?</span>}
        </div>
      </div>
      <div style={{ background:'#e2e8f0', borderRadius:6, height:8 }}>
        <div style={{ width:`${data.confidence}%`, background: colorFn(data.label), height:8, borderRadius:6, transition:'width 0.5s ease' }} />
      </div>
      {expandedTrait===name && data && data.explanation && data.explanation.length > 0 && (
        <div style={{ marginTop:8, padding:'10px 12px', background:'#EFF6FF', borderRadius:8, border:'0.5px solid #E2EBF6', animation:'fadeIn 0.2s ease' }}>
          <div style={{ fontSize:11, fontWeight:600, color:'#3B5998', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Why this score</div>
          {data.explanation.map((e,i) => (
            <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:6, marginBottom:4 }}>
              <span style={{ fontSize:12, color: e.direction==='increases'?'#059669':'#DC2626', fontWeight:700 }}>{e.direction==='increases'?'▲':'▼'}</span>
              <span style={{ fontSize:12, color:'#0C1A2E', lineHeight:1.5 }}>{e.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const scoreLevel = (s, max) => { const p = s/max; return p<0.2?{label:'Minimal',color:'#22c55e'}:p<0.4?{label:'Mild',color:'#f59e0b'}:p<0.6?{label:'Moderate',color:'#f97316'}:{label:'Severe',color:'#ef4444'}; };
  const phqLevel = (s) => s<=4?{label:'Minimal',color:'#22c55e'}:s<=9?{label:'Mild',color:'#f59e0b'}:s<=14?{label:'Moderate',color:'#f97316'}:{label:'Severe',color:'#ef4444'};
  const gadLevel = (s) => s<=4?{label:'Minimal',color:'#22c55e'}:s<=9?{label:'Mild',color:'#f59e0b'}:s<=14?{label:'Moderate',color:'#f97316'}:{label:'Severe',color:'#ef4444'};

  // Route guards
  // Check URL for superadmin route
  if (window.location.pathname === '/superadmin' || showSuperAdminAuth) {
    if (superAdminUser) return <SuperAdmin onLogout={() => { setSuperAdminUser(null); localStorage.removeItem('psycheflow_superadmin'); window.location.href = '/'; }} />;
    return <SuperAdminAuth onLogin={(u) => { setSuperAdminUser(u); localStorage.setItem('psycheflow_superadmin', JSON.stringify(u)); setShowSuperAdminAuth(false); }} />;
  }

  if (hospitalUser) return <HospitalPortal user={hospitalUser} onLogout={() => { setHospitalUser(null); setShowHospitalLanding(true); localStorage.removeItem('psycheflow_hospital_user'); }} />;
  if (showHospitalAuth) return <HospitalAuth onBack={() => { setShowHospitalAuth(false); setShowHospitalLanding(true); }} onLogin={(u) => { setHospitalUser(u); setShowHospitalAuth(false); localStorage.setItem('psycheflow_hospital_user', JSON.stringify(u)); }} />;
  if (showHospitalLanding) return <HospitalLanding onBack={() => setShowHospitalLanding(false)} onContact={() => setShowHospitalLanding(false)} onGetStarted={() => { setShowHospitalLanding(false); setShowHospitalAuth(true); }} />;
  if (showPsychLanding) return <PsychologistLanding onBack={() => setShowPsychLanding(false)} onGetStarted={() => { setShowPsychLanding(false); setShowPsychAuth(true); }} />;
  if (showPsychAuth) return <PsychologistAuth onBack={() => { setShowPsychAuth(false); setShowPsychLanding(true); }} onLogin={(u) => { setShowPsychAuth(false); setUser(u); checkOnboarding(u.id); }} />;
  if (legalPage === 'privacy') return <Privacy onBack={() => setLegalPage(null)} />;
  if (legalPage === 'terms') return <Terms onBack={() => setLegalPage(null)} />;
  if (legalPage === 'dpdp') return <DPDP onBack={() => setLegalPage(null)} />;
  if (!user) return showLanding===false ? <Auth onLogin={(u) => { setUser(u); setShowLanding(false); checkOnboarding(u.id); }} /> : <Landing onGetStarted={() => setShowLanding(false)} onLegal={(page) => setLegalPage(page)} onPsychLanding={() => setShowPsychLanding(true)} onHospitalLanding={() => setShowHospitalLanding(true)} />;
  if (user && consentGiven === false && !isPsychologist) return <Consent user={user} onConsent={() => { setConsentGiven(true); }} />;
  if (user && onboarded === false) return <Onboarding user={user} onComplete={() => { setOnboarded(true); checkOnboarding(user.id); }} />;
  if (isPsychologist) return <PsychologistPortal user={user} onLogout={handleLogout} />;

  if (showACT) return (
    <div style={{ fontFamily:"'Satoshi',-apple-system,sans-serif", minHeight:'100vh', background:'linear-gradient(135deg, #EFF6FF 0%, #fdf4ff 100%)', padding:40 }}>
      <div style={{ maxWidth:720, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', marginBottom:24 }}>
          <h2 style={{ color:'#1D4ED8', margin:0 }}>PsycheFlow</h2>
          <button onClick={() => setShowACT(false)} style={{ marginLeft:'auto', padding:'6px 14px', background:'transparent', border:'1px solid #e2e8f0', borderRadius:8, color:'#94a3b8', cursor:'pointer', fontSize:12 }}>← Dashboard</button>
        </div>
        <ACTEngine user={user} phqScore={0} gadScore={0} condition="normal" />
      </div>
    </div>
  );

  if (showCrisis) return (
    <div style={{ fontFamily:"'Satoshi',-apple-system,sans-serif", minHeight:'100vh', background:'#f1f5f9', padding:40 }}>
      <div style={{ maxWidth:720, margin:'0 auto' }}>
        <CrisisManagement user={user} onBack={() => setShowCrisis(false)} />
      </div>
    </div>
  );

  if (screen === 'home') return (
    <Dashboard user={user} profile={profile}
      onStartAssessment={() => { setAssessMode(null); setScreen('questionnaire'); }}
      onLogout={handleLogout} onPsychologistMode={() => { useAuthStore.getState().setIsPsychologist(true); }}
      onACTEngine={() => setShowACT(true)} onCrisis={() => setShowCrisis(true)} />
  );

  if (screen === 'questionnaire') return (
    <div style={{ fontFamily:"'Satoshi',-apple-system,sans-serif", minHeight:'100vh', background:'#F8FAFF', padding:'40px 24px' }}>
      <div style={{ maxWidth:580, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', marginBottom:40 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:30, height:30, borderRadius:8, background:'#1D4ED8', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="17" height="17" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C9 1.5 4 5 4 10C4 12.8 6.2 15 9 15C11.8 15 14 12.8 14 10C14 5 9 1.5 9 1.5Z" fill="white" opacity="0.9"/><circle cx="9" cy="10" r="2.2" fill="#0C1A2E"/></svg>
            </div>
            <span style={{ fontWeight:700, fontSize:15, letterSpacing:'-0.02em', color:'#0C1A2E' }}>PsycheFlow</span>
          </div>
          <button onClick={() => { setScreen('home'); setAssessMode(null); }} style={{ marginLeft:'auto', padding:'8px 16px', background:'#fff', border:'0.5px solid #E2EBF6', borderRadius:8, color:'#3B5998', cursor:'pointer', fontSize:13, fontFamily:'inherit' }}>← Back</button>
        </div>
        {!assessMode ? (
          <div>
            <div style={{ marginBottom:28 }}>
              <div style={{ display:'inline-block', padding:'3px 12px', borderRadius:100, background:'#EFF6FF', color:'#1D4ED8', fontSize:11, fontWeight:600, letterSpacing:'0.04em', textTransform:'uppercase', marginBottom:12 }}>Assessment</div>
              <h2 style={{ fontSize:26, fontWeight:700, letterSpacing:'-0.02em', color:'#0C1A2E', margin:'0 0 8px' }}>How would you like to be assessed?</h2>
              <p style={{ fontSize:14, color:'#3B5998', margin:0, lineHeight:1.6 }}>Both methods use clinically validated instruments. Choose what feels right for you.</p>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div onClick={() => setAssessMode('interview')}
                style={{ background:'#fff', borderRadius:14, border:'0.5px solid #E2EBF6', padding:24, cursor:'pointer', transition:'all 0.2s', position:'relative' }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor='#1D4ED8'; e.currentTarget.style.boxShadow='0 0 0 3px rgba(29,78,216,0.08)'; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor='#E2EBF6'; e.currentTarget.style.boxShadow='none'; }}>
                <div style={{ position:'absolute', top:16, right:16, padding:'3px 10px', borderRadius:100, background:'#EFF6FF', color:'#1D4ED8', fontSize:10, fontWeight:600 }}>Recommended</div>
                <div style={{ marginBottom:12 }}>
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="2" y="6" width="24" height="18" rx="5" stroke="#1D4ED8" strokeWidth="1.4"/><path d="M8 14H20M8 18H15" stroke="#1D4ED8" strokeWidth="1.4" strokeLinecap="round"/></svg>
                </div>
                <h3 style={{ fontSize:16, fontWeight:700, color:'#0C1A2E', margin:'0 0 6px', letterSpacing:'-0.01em' }}>AI Clinical Interview</h3>
                <p style={{ fontSize:13, color:'#3B5998', margin:'0 0 12px', lineHeight:1.6 }}>Talk to Dr. PsycheFlow naturally. 15 turns covering 14 clinical domains. Most accurate and personalised.</p>
                <div style={{ fontSize:11, color:'#3B5998', display:'flex', gap:12 }}>
                  <span>10-15 minutes</span><span>·</span><span>Most accurate</span><span>·</span><span>14 domains</span>
                </div>
              </div>
              <div onClick={() => setAssessMode('questionnaire')}
                style={{ background:'#fff', borderRadius:14, border:'0.5px solid #E2EBF6', padding:24, cursor:'pointer', transition:'all 0.2s' }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor='#1D4ED8'; e.currentTarget.style.boxShadow='0 0 0 3px rgba(29,78,216,0.08)'; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor='#E2EBF6'; e.currentTarget.style.boxShadow='none'; }}>
                <div style={{ marginBottom:12 }}>
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="4" y="2" width="20" height="24" rx="4" stroke="#1D4ED8" strokeWidth="1.4"/><path d="M9 9H19M9 13H17M9 17H13" stroke="#1D4ED8" strokeWidth="1.4" strokeLinecap="round"/></svg>
                </div>
                <h3 style={{ fontSize:16, fontWeight:700, color:'#0C1A2E', margin:'0 0 6px', letterSpacing:'-0.01em' }}>Structured Questionnaire</h3>
                <p style={{ fontSize:13, color:'#3B5998', margin:'0 0 12px', lineHeight:1.6 }}>PHQ-9, GAD-7, Big Five, Dark Triad, OCD, PTSD, ADHD, Burnout. 14 validated instruments, adaptive.</p>
                <div style={{ fontSize:11, color:'#3B5998', display:'flex', gap:12 }}>
                  <span>10-20 minutes</span><span>·</span><span>14 instruments</span><span>·</span><span>Detailed report</span>
                </div>
              </div>
            </div>
          </div>
        ) : assessMode === 'interview' ? (
          <ClinicalInterview user={user} onComplete={async (assessment) => {
            if (user) await supabase.from('sessions').insert({ user_id: user.id, phq_score: 0, gad_score: 0, predictions: {}, answers: { interview_assessment: assessment } });
            setAssessMode(null); setScreen('home');
          }} />
        ) : (
          <AdaptiveQuestionnaire onComplete={handleComplete} />
        )}
      </div>
    </div>
  );

  if (screen === 'loading') return (
    <LoadingScreen message="Running 19 psychological models..." />
  );

  if (screen === 'results' && results) {
    const phq = phqLevel(results.phq);
    const gad = gadLevel(results.gad);
    return (
      <div style={{ fontFamily:"'Satoshi',-apple-system,sans-serif", background:'#f1f5f9', minHeight:'100vh', padding:32 }}>
        <div style={{ maxWidth:680, margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
            <h2 style={{ color:'#1D4ED8', margin:0 }}>Your Psychological Report</h2>
            <div>
              <button onClick={() => setScreen('home')} style={{ padding:'8px 16px', background:'#1D4ED8', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:13, marginRight:8 }}>Dashboard</button>
              <button onClick={() => { setScreen('questionnaire'); setResults(null); setFullReport(null); setAssessMode(null); }} style={{ padding:'8px 16px', background:'#fff', color:'#1D4ED8', border:'1px solid #1D4ED8', borderRadius:8, cursor:'pointer', fontSize:13 }}>Retake</button>
            </div>
          </div>
          <div style={{ background:'#fff', borderRadius:16, padding:24, border:'1px solid #e2e8f0', marginBottom:20 }}>
            <h3 style={{ margin:'0 0 16px', color:'#1e293b' }}>Mental Health Screening</h3>
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:12 }}>
              {[{label:'Depression (PHQ-9)',score:results.phq,level:phq},{label:'Anxiety (GAD-7)',score:results.gad,level:gad}].map((item,i)=>(
                <div key={i} style={{ background:'#f8fafc', borderRadius:12, padding:16, textAlign:'center' }}>
                  <div style={{ fontSize:12, color:'#64748b', marginBottom:4 }}>{item.label}</div>
                  <div style={{ fontSize:28, fontWeight:'bold', color:item.level.color }}>{item.score}</div>
                  <div style={{ fontSize:12, color:item.level.color, fontWeight:'bold' }}>{item.level.label}</div>
                </div>
              ))}
            </div>
          </div>
          {(results.bipolar>0||results.ptsd>0||results.ocd>0||results.adhd>0||results.burnout>0) && (
            <div style={{ background:'#fff', borderRadius:16, padding:24, border:'1px solid #e2e8f0', marginBottom:20 }}>
              <h3 style={{ margin:'0 0 16px', color:'#1e293b' }}>Additional Screening Results</h3>
              <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr', gap:10 }}>
                {[{label:'Bipolar (MDQ)',score:results.bipolar,max:20},{label:'PTSD (PCL-5)',score:results.ptsd,max:20},{label:'OCD (OCI-R)',score:results.ocd,max:20},{label:'ADHD (ASRS)',score:results.adhd,max:20},{label:'Burnout (MBI)',score:results.burnout,max:20},{label:'Self-Esteem',score:results.selfEsteem,max:12}].filter(item=>item.score>0).map((item,i)=>{
                  const lv=scoreLevel(item.score,item.max);
                  return (<div key={i} style={{ background:'#f8fafc', borderRadius:10, padding:12, textAlign:'center' }}><div style={{ fontSize:11, color:'#64748b', marginBottom:4 }}>{item.label}</div><div style={{ fontSize:22, fontWeight:'bold', color:lv.color }}>{item.score}</div><div style={{ fontSize:11, color:lv.color, fontWeight:'bold' }}>{lv.label}</div></div>);
                })}
              </div>
            </div>
          )}
          <div style={{ background:'#fff', borderRadius:16, padding:24, border:'1px solid #e2e8f0', marginBottom:20 }}>
            <h3 style={{ margin:'0 0 16px', color:'#1D4ED8' }}>Personality — Big Five (OCEAN)</h3>
            {bigFive.map(t=>(<TraitBar key={t} name={t} data={results.predictions[t]} colorFn={(l)=>colorMap[l]} />))}
          </div>
          <div style={{ background:'#fff', borderRadius:16, padding:24, border:'1px solid #e2e8f0', marginBottom:20 }}>
            <h3 style={{ margin:'0 0 16px', color:'#dc2626' }}>Dark Triad Assessment</h3>
            <p style={{ fontSize:12, color:'#94a3b8', marginTop:0, marginBottom:16 }}>For self-awareness only. High scores indicate tendencies, not disorders.</p>
            {darkTriad.map(t=>(<TraitBar key={t} name={t} data={results.predictions[t]} colorFn={(l)=>dtColor[l]} />))}
          </div>
          <div style={{ background:'#fff', borderRadius:16, padding:24, border:'1px solid #e2e8f0', marginBottom:20 }}>
            <h3 style={{ margin:'0 0 8px', color:'#1D4ED8' }}>Full Psychological Report</h3>
            <p style={{ fontSize:13, color:'#94a3b8', marginTop:0, marginBottom:16 }}>A comprehensive 2000+ word psychological profile written by our AI psychologist.</p>
            {!fullReport ? (
              <button onClick={handleGenerateReport} disabled={reportLoading} style={{ padding:'12px 32px', background:'#1D4ED8', color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontSize:15, fontWeight:'bold', boxShadow:'0 4px 20px rgba(29,78,216,0.15)' }}>
                {reportLoading ? 'Generating your report (~1 min)...' : 'Generate My Full Report'}
              </button>
            ) : (
              <div>
                {Object.entries(fullReport.sections).map(([title,content])=>(content&&(
                  <div key={title} style={{ marginBottom:24 }}>
                    <h4 style={{ color:'#1D4ED8', fontSize:13, fontWeight:'bold', textTransform:'uppercase', letterSpacing:'0.5px', borderBottom:'2px solid #EFF6FF', paddingBottom:8, marginBottom:12 }}>{title}</h4>
                    <p style={{ fontSize:14, color:'#374151', lineHeight:1.8, margin:0, whiteSpace:'pre-wrap' }}>{content}</p>
                  </div>
                )))}
                <div style={{ background:'#f8fafc', borderRadius:8, padding:12, fontSize:12, color:'#94a3b8', marginTop:16 }}>{fullReport.word_count} words · Generated by PsycheFlow AI</div>
              </div>
            )}
          </div>
          <JournalSection userId={user.id} />
        </div>
      </div>
    );
  }
}
