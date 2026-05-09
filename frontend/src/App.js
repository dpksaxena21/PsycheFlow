import React, { useState } from 'react';
import axios from 'axios';
import { supabase } from './supabase';
import Auth from './Auth';
import Questionnaire from './Questionnaire';
import Dashboard from './Dashboard';

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
      await supabase.from('journal_entries').insert({
        user_id: userId,
        text,
        analysis: res.data
      });
    } catch {
      alert('Journal analysis failed');
    }
    setLoading(false);
  };

  return (
    <div style={{ background:'#fff', borderRadius:16, padding:24,
      border:'1px solid #e2e8f0', marginTop:20 }}>
      <h3 style={{ margin:'0 0 8px', color:'#6366f1' }}>📝 Journal Analysis</h3>
      <p style={{ fontSize:13, color:'#94a3b8', marginTop:0, marginBottom:16 }}>
        Write freely about how you feel. Our AI will analyze it clinically.
      </p>
      <textarea value={text} onChange={e => setText(e.target.value)}
        placeholder="What's on your mind today? Write freely..."
        style={{ width:'100%', minHeight:120, padding:12, borderRadius:8,
          border:'1px solid #e2e8f0', fontSize:14, fontFamily:'sans-serif',
          resize:'vertical', boxSizing:'border-box', outline:'none' }} />
      <button onClick={analyze} disabled={loading || text.trim().length < 20}
        style={{ marginTop:12, padding:'10px 24px', background:'#6366f1',
          color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:14 }}>
        {loading ? 'Analyzing...' : '🔍 Analyze Journal'}
      </button>

      {analysis && (
        <div style={{ marginTop:20 }}>
          <div style={{ background:'#f8fafc', borderRadius:12, padding:16, marginBottom:12 }}>
            <strong>Primary Emotion:</strong>{' '}
            <span style={{ color:'#6366f1', textTransform:'capitalize' }}>
              {analysis.emotions.primary}
            </span>
            {' '}— Intensity: <strong>{analysis.emotions.intensity}</strong>
            <br/>
            <span style={{ fontSize:13, color:'#64748b' }}>
              Also detected: {analysis.emotions.secondary.join(', ')}
            </span>
          </div>

          <div style={{ background:'#fff7ed', borderRadius:12, padding:16, marginBottom:12 }}>
            <strong>Risk Signals</strong>
            <div style={{ fontSize:13, marginTop:8, display:'grid',
              gridTemplateColumns:'1fr 1fr', gap:6 }}>
              {Object.entries(analysis.risk_signals).map(([k, v]) => (
                <div key={k}>
                  <span style={{ color:'#94a3b8' }}>{k.replace(/_/g,' ')}: </span>
                  <strong style={{ color: v==='none'||v==='low' ? '#22c55e'
                    : v==='mild' ? '#f59e0b' : '#ef4444' }}>{v}</strong>
                </div>
              ))}
            </div>
          </div>

          {analysis.cognitive_distortions.length > 0 && (
            <div style={{ background:'#fef2f2', borderRadius:12, padding:16, marginBottom:12 }}>
              <strong>Cognitive Distortions Detected</strong>
              {analysis.cognitive_distortions.map((d, i) => (
                <div key={i} style={{ fontSize:13, marginTop:8,
                  borderLeft:'3px solid #ef4444', paddingLeft:10 }}>
                  <strong>{d.type}</strong> — {d.severity}<br/>
                  <span style={{ color:'#64748b' }}>"{d.evidence}"</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ background:'#f0fdf4', borderRadius:12, padding:16 }}>
            <strong>Clinical Summary</strong>
            <p style={{ fontSize:13, color:'#374151', margin:'8px 0' }}>
              {analysis.clinical_summary}
            </p>
            <strong style={{ fontSize:13 }}>Recommended Focus: </strong>
            <span style={{ fontSize:13, color:'#6366f1' }}>
              {analysis.recommended_focus}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [screen, setScreen]   = useState('home');
  const [results, setResults] = useState(null);
  const [user, setUser]       = useState(null);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const handleComplete = async ({ answers, age, gender }) => {
    setScreen('loading');

    const score = (ids) => ids.reduce((s, id) => s + (answers[id] || 3), 0) / ids.length;

    const payload = {
      age, gender,
      Extraversion:       score(['E1','E2']),
      Neuroticism:        score(['N1','N2']),
      Agreeableness:      score(['A1','A2']),
      Conscientiousness:  score(['C1','C2']),
      Openness:           score(['O1','O2']),
      Machiavellianism:   score(['M1','M2']),
      Narcissism:         score(['NA1','NA2']),
      Psychopathy:        score(['P1','P2']),
    };

    const phq = ['PHQ1','PHQ2','PHQ3','PHQ4','PHQ5','PHQ6','PHQ7']
      .reduce((s, id) => s + (answers[id] || 0), 0);
    const gad = ['GAD1','GAD2','GAD3','GAD4','GAD5','GAD6','GAD7']
      .reduce((s, id) => s + (answers[id] || 0), 0);

    try {
      const res = await axios.post('http://127.0.0.1:8000/predict', payload);
      const predictions = res.data.predictions;

      if (user) {
        await supabase.from('sessions').insert({
          user_id:     user.id,
          phq_score:   phq,
          gad_score:   gad,
          predictions,
          answers
        });
      }

      setResults({ predictions, phq, gad });
      setScreen('results');
    } catch {
      alert('API error — is FastAPI running?');
      setScreen('home');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setScreen('home');
    setResults(null);
  };

  const TraitBar = ({ name, data, colorFn }) => (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
        <strong style={{ fontSize:14 }}>{name}</strong>
        <span style={{ color: colorFn(data.label), fontWeight:'bold', fontSize:14 }}>
          {data.label} ({data.confidence}%)
        </span>
      </div>
      <div style={{ background:'#e2e8f0', borderRadius:6, height:10 }}>
        <div style={{ width:`${data.confidence}%`, background: colorFn(data.label),
          height:10, borderRadius:6, transition:'width 0.5s ease' }} />
      </div>
    </div>
  );

  const phqLevel = (s) => s <= 4  ? {label:'Minimal',  color:'#22c55e'}
    : s <= 9  ? {label:'Mild',     color:'#f59e0b'}
    : s <= 14 ? {label:'Moderate', color:'#f97316'}
    :           {label:'Severe',   color:'#ef4444'};

  const gadLevel = (s) => s <= 4  ? {label:'Minimal',  color:'#22c55e'}
    : s <= 9  ? {label:'Mild',     color:'#f59e0b'}
    : s <= 14 ? {label:'Moderate', color:'#f97316'}
    :           {label:'Severe',   color:'#ef4444'};

  if (!user) return <Auth onLogin={setUser} />;

  if (screen === 'home') return (
    <Dashboard
      user={user}
      onStartAssessment={() => setScreen('questionnaire')}
      onLogout={handleLogout}
    />
  );

  if (screen === 'questionnaire') return (
    <div style={{ fontFamily:'sans-serif', minHeight:'100vh',
      background:'linear-gradient(135deg, #eef2ff 0%, #fdf4ff 100%)', padding:40 }}>
      <div style={{ maxWidth:640, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', marginBottom:32 }}>
          <span style={{ fontSize:24, marginRight:10 }}>🧠</span>
          <h2 style={{ color:'#6366f1', margin:0 }}>PsycheFlow</h2>
        </div>
        <Questionnaire onComplete={handleComplete} />
      </div>
    </div>
  );

  if (screen === 'loading') return (
    <div style={{ fontFamily:'sans-serif', minHeight:'100vh',
      background:'linear-gradient(135deg, #eef2ff 0%, #fdf4ff 100%)',
      display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:48, marginBottom:16 }}>⚙️</div>
        <h3 style={{ color:'#6366f1' }}>Analyzing your profile...</h3>
        <p style={{ color:'#94a3b8' }}>Running 8 psychological models</p>
      </div>
    </div>
  );

  if (screen === 'results' && results) {
    const phq = phqLevel(results.phq);
    const gad = gadLevel(results.gad);
    return (
      <div style={{ fontFamily:'sans-serif', background:'#f1f5f9',
        minHeight:'100vh', padding:32 }}>
        <div style={{ maxWidth:640, margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between',
            alignItems:'center', marginBottom:24 }}>
            <h2 style={{ color:'#6366f1', margin:0 }}>🧠 Your Psychological Report</h2>
            <div>
              <button onClick={() => setScreen('home')}
                style={{ padding:'8px 16px', background:'#6366f1', color:'#fff',
                  border:'none', borderRadius:8, cursor:'pointer',
                  fontSize:13, marginRight:8 }}>
                Dashboard
              </button>
              <button onClick={() => { setScreen('questionnaire'); setResults(null); }}
                style={{ padding:'8px 16px', background:'#fff', color:'#6366f1',
                  border:'1px solid #6366f1', borderRadius:8,
                  cursor:'pointer', fontSize:13 }}>
                Retake
              </button>
            </div>
          </div>

          <div style={{ background:'#fff', borderRadius:16, padding:24,
            border:'1px solid #e2e8f0', marginBottom:20 }}>
            <h3 style={{ margin:'0 0 16px', color:'#1e293b' }}>Mental Health Screening</h3>
            <div style={{ display:'flex', gap:16 }}>
              <div style={{ flex:1, background:'#f8fafc', borderRadius:12,
                padding:16, textAlign:'center' }}>
                <div style={{ fontSize:13, color:'#64748b', marginBottom:4 }}>
                  Depression (PHQ-9)
                </div>
                <div style={{ fontSize:28, fontWeight:'bold', color:phq.color }}>
                  {results.phq}
                </div>
                <div style={{ fontSize:13, color:phq.color, fontWeight:'bold' }}>
                  {phq.label}
                </div>
              </div>
              <div style={{ flex:1, background:'#f8fafc', borderRadius:12,
                padding:16, textAlign:'center' }}>
                <div style={{ fontSize:13, color:'#64748b', marginBottom:4 }}>
                  Anxiety (GAD-7)
                </div>
                <div style={{ fontSize:28, fontWeight:'bold', color:gad.color }}>
                  {results.gad}
                </div>
                <div style={{ fontSize:13, color:gad.color, fontWeight:'bold' }}>
                  {gad.label}
                </div>
              </div>
            </div>
          </div>

          <div style={{ background:'#fff', borderRadius:16, padding:24,
            border:'1px solid #e2e8f0', marginBottom:20 }}>
            <h3 style={{ margin:'0 0 16px', color:'#6366f1' }}>
              Personality — Big Five (OCEAN)
            </h3>
            {bigFive.map(t => (
              <TraitBar key={t} name={t} data={results.predictions[t]}
                colorFn={(l) => colorMap[l]} />
            ))}
          </div>

          <div style={{ background:'#fff', borderRadius:16, padding:24,
            border:'1px solid #e2e8f0', marginBottom:20 }}>
            <h3 style={{ margin:'0 0 16px', color:'#dc2626' }}>Dark Triad Assessment</h3>
            <p style={{ fontSize:12, color:'#94a3b8', marginTop:0, marginBottom:16 }}>
              For self-awareness only. High scores indicate tendencies, not disorders.
            </p>
            {darkTriad.map(t => (
              <TraitBar key={t} name={t} data={results.predictions[t]}
                colorFn={(l) => dtColor[l]} />
            ))}
          </div>

          <JournalSection userId={user.id} />
        </div>
      </div>
    );
  }
}