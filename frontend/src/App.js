import React, { useState } from 'react';
import { logAction, ACTIONS } from './audit';
import Landing from './Landing';
import axios from 'axios';
import { supabase } from './supabase';
import Auth from './Auth';
import AdaptiveQuestionnaire from './AdaptiveQuestionnaire';
import ClinicalInterview from './ClinicalInterview';
import Dashboard from './Dashboard';
import PsychologistPortal from './PsychologistPortal';
import ACTEngine from './ACTEngine';
import CrisisManagement from './CrisisManagement';
import Consent from './Consent';
import Onboarding from './Onboarding';

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
      const res = await axios.post('http://127.0.0.1:8000/analyze-journal', { text });
      setAnalysis(res.data);
      await supabase.from('journal_entries').insert({ user_id: userId, text, analysis: res.data });
    } catch { alert('Journal analysis failed'); }
    setLoading(false);
  };

  return (
    <div style={{ background:'#fff', borderRadius:16, padding:24, border:'1px solid #e2e8f0', marginTop:20 }}>
      <h3 style={{ margin:'0 0 8px', color:'#6366f1' }}>📝 Journal Analysis</h3>
      <p style={{ fontSize:13, color:'#94a3b8', marginTop:0, marginBottom:16 }}>Write freely about how you feel. Our AI will analyze it clinically.</p>
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder="What's on your mind today? Write freely..."
        style={{ width:'100%', minHeight:120, padding:12, borderRadius:8, border:'1px solid #e2e8f0', fontSize:14, fontFamily:'sans-serif', resize:'vertical', boxSizing:'border-box', outline:'none' }} />
      <button onClick={analyze} disabled={loading || text.trim().length < 20}
        style={{ marginTop:12, padding:'10px 24px', background:'#6366f1', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:14 }}>
        {loading ? 'Analyzing...' : '🔍 Analyze Journal'}
      </button>
      {analysis && (
        <div style={{ marginTop:20 }}>
          {analysis.condition_detection && (
            <div style={{ background: analysis.condition_detection.alert ? '#fef2f2' : '#f0f9ff', borderRadius:12, padding:16, marginBottom:12, border: analysis.condition_detection.alert ? '2px solid #ef4444' : '1px solid #bae6fd' }}>
              <strong style={{ color: analysis.condition_detection.alert ? '#dc2626' : '#0369a1' }}>{analysis.condition_detection.alert ? '🚨' : '🔍'} Condition Detection</strong>
              <div style={{ marginTop:8 }}>
                <span style={{ fontSize:15, fontWeight:'bold', color: analysis.condition_detection.alert ? '#dc2626' : '#1e293b' }}>{analysis.condition_detection.primary_condition}</span>
                <span style={{ fontSize:13, color:'#64748b', marginLeft:8 }}>({analysis.condition_detection.confidence}% confidence)</span>
              </div>
              <div style={{ fontSize:12, color:'#94a3b8', marginTop:6 }}>
                {analysis.condition_detection.top3.map((t, i) => (<span key={i} style={{ marginRight:12 }}>{t.condition}: {t.probability}%</span>))}
              </div>
              {analysis.condition_detection.alert && (
                <div style={{ marginTop:10, padding:'8px 12px', background:'#fee2e2', borderRadius:8, fontSize:13, color:'#dc2626' }}>
                  ⚠️ If you are in crisis, please call iCall: <strong>9152987821</strong>
                </div>
              )}
            </div>
          )}
          <div style={{ background:'#f8fafc', borderRadius:12, padding:16, marginBottom:12 }}>
            <strong>Primary Emotion:</strong> <span style={{ color:'#6366f1', textTransform:'capitalize' }}>{analysis.emotions.primary}</span> — Intensity: <strong>{analysis.emotions.intensity}</strong><br/>
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
            <strong style={{ fontSize:13 }}>Recommended Focus: </strong><span style={{ fontSize:13, color:'#6366f1' }}>{analysis.recommended_focus}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [screen, setScreen]                   = useState('home');
  const [results, setResults]                 = useState(null);
  const [user, setUser]                       = useState(null);
  const [fullReport, setFullReport]           = useState(null);
  const [reportLoading, setReportLoading]     = useState(false);
  const [assessMode, setAssessMode]           = useState(null);
  const [isPsychologist, setIsPsychologist]   = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [consentGiven, setConsentGiven]       = useState(null);
  const [showACT, setShowACT]                 = useState(false);
  const [showCrisis, setShowCrisis]           = useState(false);
  const [onboarded, setOnboarded]             = useState(null);
  const [profile, setProfile]                 = useState(null);

  const checkOnboarding = async (userId) => {
    const { data } = await supabase.from('profiles').select('onboarded, display_name, concerns, urgency, goals, role, consent_given').eq('id', userId).single();
    setOnboarded(data?.onboarded === true ? true : false);
    setProfile(data || null);
    if (data?.role === 'psychologist') { setIsPsychologist(true); setOnboarded(true); }
    setConsentGiven(data?.consent_given === true);
  };

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) checkOnboarding(session.user.id);
      if (session?.user) logAction(session.user.id, ACTIONS.LOGIN, 'auth');
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) checkOnboarding(session.user.id);
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
      const res = await axios.post('http://127.0.0.1:8000/predict', payload);
      const predictions = res.data.predictions;
      if (user) await supabase.from('sessions').insert({ user_id: user.id, phq_score: phq, gad_score: gad, predictions, answers });
      if (user) { try { await axios.post('http://127.0.0.1:8000/check-crisis', { patient_id: user.id, phq_score: phq, gad_score: gad, answers }); } catch(e) { console.log('Crisis check error:', e); } }
      setResults({ predictions, phq, gad, age, gender, occupation, concern, bipolar, ptsd, ocd, adhd, burnout, selfEsteem });
      setScreen('results');
    } catch { alert('API error — is FastAPI running?'); setScreen('home'); }
  };

  const handleGenerateReport = async () => {
    setReportLoading(true);
    try {
      const res = await axios.post('http://127.0.0.1:8000/generate-report', { predictions: results.predictions, phq_score: results.phq, gad_score: results.gad, age: results.age || 25, gender: results.gender || 1 });
      setFullReport(res.data);
    } catch { alert('Report generation failed'); }
    setReportLoading(false);
  };

  const handleLogout = async () => {
    logAction(user?.id, ACTIONS.LOGOUT, 'auth');
    await supabase.auth.signOut();
    setUser(null); setScreen('home'); setResults(null); setFullReport(null);
    setAssessMode(null); setIsPsychologist(false); setShowACT(false);
    setShowCrisis(false); setOnboarded(null); setProfile(null);
  };

  const TraitBar = ({ name, data, colorFn }) => (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
        <strong style={{ fontSize:14 }}>{name}</strong>
        <span style={{ color: colorFn(data.label), fontWeight:'bold', fontSize:14 }}>{data.label} ({data.confidence}%)</span>
      </div>
      <div style={{ background:'#e2e8f0', borderRadius:6, height:10 }}>
        <div style={{ width:`${data.confidence}%`, background: colorFn(data.label), height:10, borderRadius:6, transition:'width 0.5s ease' }} />
      </div>
    </div>
  );

  const scoreLevel = (s, max) => { const p = s/max; return p<0.2?{label:'Minimal',color:'#22c55e'}:p<0.4?{label:'Mild',color:'#f59e0b'}:p<0.6?{label:'Moderate',color:'#f97316'}:{label:'Severe',color:'#ef4444'}; };
  const phqLevel = (s) => s<=4?{label:'Minimal',color:'#22c55e'}:s<=9?{label:'Mild',color:'#f59e0b'}:s<=14?{label:'Moderate',color:'#f97316'}:{label:'Severe',color:'#ef4444'};
  const gadLevel = (s) => s<=4?{label:'Minimal',color:'#22c55e'}:s<=9?{label:'Mild',color:'#f59e0b'}:s<=14?{label:'Moderate',color:'#f97316'}:{label:'Severe',color:'#ef4444'};

  if (showLanding && !user) return <Landing onGetStarted={() => setShowLanding(false)} />;
  if (!user) return <Auth onLogin={(u) => { setUser(u); setShowLanding(false); checkOnboarding(u.id); }} />;
  if (user && consentGiven === false && !isPsychologist) return <Consent user={user} onConsent={() => { setConsentGiven(true); }} />;
  if (user && onboarded === false) return <Onboarding user={user} onComplete={() => { setOnboarded(true); checkOnboarding(user.id); }} />;
  if (isPsychologist) return <PsychologistPortal user={user} onLogout={handleLogout} />;

  if (showACT) return (
    <div style={{ fontFamily:'sans-serif', minHeight:'100vh', background:'linear-gradient(135deg, #eef2ff 0%, #fdf4ff 100%)', padding:40 }}>
      <div style={{ maxWidth:720, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', marginBottom:24 }}>
          <h2 style={{ color:'#6366f1', margin:0 }}>🧠 PsycheFlow</h2>
          <button onClick={() => setShowACT(false)} style={{ marginLeft:'auto', padding:'6px 14px', background:'transparent', border:'1px solid #e2e8f0', borderRadius:8, color:'#94a3b8', cursor:'pointer', fontSize:12 }}>← Dashboard</button>
        </div>
        <ACTEngine user={user} phqScore={0} gadScore={0} condition="normal" />
      </div>
    </div>
  );

  if (showCrisis) return (
    <div style={{ fontFamily:'sans-serif', minHeight:'100vh', background:'#f1f5f9', padding:40 }}>
      <div style={{ maxWidth:720, margin:'0 auto' }}>
        <CrisisManagement user={user} onBack={() => setShowCrisis(false)} />
      </div>
    </div>
  );

  if (screen === 'home') return (
    <Dashboard user={user} profile={profile}
      onStartAssessment={() => { setAssessMode(null); setScreen('questionnaire'); }}
      onLogout={handleLogout} onPsychologistMode={() => setIsPsychologist(true)}
      onACTEngine={() => setShowACT(true)} onCrisis={() => setShowCrisis(true)} />
  );

  if (screen === 'questionnaire') return (
    <div style={{ fontFamily:'sans-serif', minHeight:'100vh', background:'linear-gradient(135deg, #eef2ff 0%, #fdf4ff 100%)', padding:40 }}>
      <div style={{ maxWidth:680, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', marginBottom:32 }}>
          <span style={{ fontSize:24, marginRight:10 }}>🧠</span>
          <h2 style={{ color:'#6366f1', margin:0 }}>PsycheFlow</h2>
          <button onClick={() => { setScreen('home'); setAssessMode(null); }} style={{ marginLeft:'auto', padding:'6px 14px', background:'transparent', border:'1px solid #e2e8f0', borderRadius:8, color:'#94a3b8', cursor:'pointer', fontSize:12 }}>← Back</button>
        </div>
        {!assessMode ? (
          <div style={{ background:'#fff', borderRadius:20, padding:36, border:'1px solid #e2e8f0', boxShadow:'0 4px 24px rgba(99,102,241,0.08)' }}>
            <h3 style={{ color:'#1e293b', margin:'0 0 8px' }}>Choose Assessment Mode</h3>
            <p style={{ color:'#64748b', fontSize:14, marginBottom:28 }}>How would you like to be assessed today?</p>
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div onClick={() => setAssessMode('interview')} style={{ padding:24, borderRadius:16, border:'2px solid #e2e8f0', cursor:'pointer', transition:'all 0.2s' }} onMouseEnter={e=>e.currentTarget.style.borderColor='#6366f1'} onMouseLeave={e=>e.currentTarget.style.borderColor='#e2e8f0'}>
                <div style={{ fontSize:28, marginBottom:8 }}>💬</div>
                <h4 style={{ color:'#6366f1', margin:'0 0 6px' }}>Conversational Interview</h4>
                <p style={{ color:'#64748b', fontSize:13, margin:0 }}>Talk to Dr. PsycheFlow like a real psychologist. Natural conversation, adaptive follow-up questions. Takes 10-15 minutes. Most accurate.</p>
                <div style={{ marginTop:10, fontSize:12, color:'#6366f1', fontWeight:'bold' }}>⭐ Recommended</div>
              </div>
              <div onClick={() => setAssessMode('questionnaire')} style={{ padding:24, borderRadius:16, border:'2px solid #e2e8f0', cursor:'pointer', transition:'all 0.2s' }} onMouseEnter={e=>e.currentTarget.style.borderColor='#6366f1'} onMouseLeave={e=>e.currentTarget.style.borderColor='#e2e8f0'}>
                <div style={{ fontSize:28, marginBottom:8 }}>📋</div>
                <h4 style={{ color:'#6366f1', margin:'0 0 6px' }}>Structured Questionnaire</h4>
                <p style={{ color:'#64748b', fontSize:13, margin:0 }}>Validated clinical questionnaires (PHQ-9, GAD-7, Big Five, and more). Adaptive — adjusts based on your answers. Takes 10-20 minutes.</p>
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
    <div style={{ fontFamily:'sans-serif', minHeight:'100vh', background:'linear-gradient(135deg, #eef2ff 0%, #fdf4ff 100%)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:48, marginBottom:16 }}>⚙️</div>
        <h3 style={{ color:'#6366f1' }}>Analyzing your profile...</h3>
        <p style={{ color:'#94a3b8' }}>Running 13 psychological models</p>
      </div>
    </div>
  );

  if (screen === 'results' && results) {
    const phq = phqLevel(results.phq);
    const gad = gadLevel(results.gad);
    return (
      <div style={{ fontFamily:'sans-serif', background:'#f1f5f9', minHeight:'100vh', padding:32 }}>
        <div style={{ maxWidth:680, margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
            <h2 style={{ color:'#6366f1', margin:0 }}>🧠 Your Psychological Report</h2>
            <div>
              <button onClick={() => setScreen('home')} style={{ padding:'8px 16px', background:'#6366f1', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:13, marginRight:8 }}>Dashboard</button>
              <button onClick={() => { setScreen('questionnaire'); setResults(null); setFullReport(null); setAssessMode(null); }} style={{ padding:'8px 16px', background:'#fff', color:'#6366f1', border:'1px solid #6366f1', borderRadius:8, cursor:'pointer', fontSize:13 }}>Retake</button>
            </div>
          </div>
          <div style={{ background:'#fff', borderRadius:16, padding:24, border:'1px solid #e2e8f0', marginBottom:20 }}>
            <h3 style={{ margin:'0 0 16px', color:'#1e293b' }}>Mental Health Screening</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
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
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
                {[{label:'Bipolar (MDQ)',score:results.bipolar,max:20},{label:'PTSD (PCL-5)',score:results.ptsd,max:20},{label:'OCD (OCI-R)',score:results.ocd,max:20},{label:'ADHD (ASRS)',score:results.adhd,max:20},{label:'Burnout (MBI)',score:results.burnout,max:20},{label:'Self-Esteem',score:results.selfEsteem,max:12}].filter(item=>item.score>0).map((item,i)=>{
                  const lv=scoreLevel(item.score,item.max);
                  return (<div key={i} style={{ background:'#f8fafc', borderRadius:10, padding:12, textAlign:'center' }}><div style={{ fontSize:11, color:'#64748b', marginBottom:4 }}>{item.label}</div><div style={{ fontSize:22, fontWeight:'bold', color:lv.color }}>{item.score}</div><div style={{ fontSize:11, color:lv.color, fontWeight:'bold' }}>{lv.label}</div></div>);
                })}
              </div>
            </div>
          )}
          <div style={{ background:'#fff', borderRadius:16, padding:24, border:'1px solid #e2e8f0', marginBottom:20 }}>
            <h3 style={{ margin:'0 0 16px', color:'#6366f1' }}>Personality — Big Five (OCEAN)</h3>
            {bigFive.map(t=>(<TraitBar key={t} name={t} data={results.predictions[t]} colorFn={(l)=>colorMap[l]} />))}
          </div>
          <div style={{ background:'#fff', borderRadius:16, padding:24, border:'1px solid #e2e8f0', marginBottom:20 }}>
            <h3 style={{ margin:'0 0 16px', color:'#dc2626' }}>Dark Triad Assessment</h3>
            <p style={{ fontSize:12, color:'#94a3b8', marginTop:0, marginBottom:16 }}>For self-awareness only. High scores indicate tendencies, not disorders.</p>
            {darkTriad.map(t=>(<TraitBar key={t} name={t} data={results.predictions[t]} colorFn={(l)=>dtColor[l]} />))}
          </div>
          <div style={{ background:'#fff', borderRadius:16, padding:24, border:'1px solid #e2e8f0', marginBottom:20 }}>
            <h3 style={{ margin:'0 0 8px', color:'#6366f1' }}>✨ Full Psychological Report</h3>
            <p style={{ fontSize:13, color:'#94a3b8', marginTop:0, marginBottom:16 }}>A comprehensive 2000+ word psychological profile written by our AI psychologist.</p>
            {!fullReport ? (
              <button onClick={handleGenerateReport} disabled={reportLoading} style={{ padding:'12px 32px', background:'linear-gradient(135deg, #6366f1, #8b5cf6)', color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontSize:15, fontWeight:'bold', boxShadow:'0 4px 20px rgba(99,102,241,0.3)' }}>
                {reportLoading ? '⏳ Generating your report (~1 min)...' : '✨ Generate My Full Report'}
              </button>
            ) : (
              <div>
                {Object.entries(fullReport.sections).map(([title,content])=>(content&&(
                  <div key={title} style={{ marginBottom:24 }}>
                    <h4 style={{ color:'#6366f1', fontSize:13, fontWeight:'bold', textTransform:'uppercase', letterSpacing:'0.5px', borderBottom:'2px solid #eef2ff', paddingBottom:8, marginBottom:12 }}>{title}</h4>
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
