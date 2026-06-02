import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';


const processInfo = {
  defusion:         { icon:'🧠', label:'Cognitive Defusion',    color:'#6366f1', desc:'See thoughts as thoughts, not facts' },
  acceptance:       { icon:'🌊', label:'Acceptance',             color:'#0ea5e9', desc:'Make room for difficult feelings' },
  present_moment:   { icon:'🎯', label:'Present Moment',         color:'#10b981', desc:'Anchor yourself in the now' },
  values:           { icon:'⭐', label:'Values',                  color:'#f59e0b', desc:'Clarify what truly matters' },
  committed_action: { icon:'🚀', label:'Committed Action',       color:'#ef4444', desc:'Act on what matters despite obstacles' },
  self_as_context:  { icon:'👁️', label:'Self as Context',        color:'#8b5cf6', desc:'Connect with your observer self' },
};

const AAQ_QUESTIONS = [
  "My painful experiences and memories make it difficult for me to live a life that I would value.",
  "I'm afraid of my feelings.",
  "I worry about not being able to control my worries and feelings.",
  "My painful memories prevent me from having a fulfilling life.",
  "Emotions cause problems in my life.",
  "It seems like most people are handling their lives better than I am.",
  "Worries get in the way of my success."
];

function ExerciseCard({ exercise, onStart }) {
  return (
    <div style={{ background:'#fff', borderRadius:16, padding:24,
      border:'1px solid #e2e8f0', cursor:'pointer', transition:'all 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor='#6366f1'}
      onMouseLeave={e => e.currentTarget.style.borderColor='#e2e8f0'}>
      <div style={{ display:'flex', justifyContent:'space-between',
        alignItems:'flex-start', marginBottom:12 }}>
        <div>
          <h3 style={{ margin:'0 0 4px', color:'#1e293b', fontSize:16 }}>
            {exercise.title}
          </h3>
          <p style={{ margin:0, fontSize:13, color:'#64748b' }}>
            {exercise.description}
          </p>
        </div>
        <span style={{ background:'#eef2ff', color:'#6366f1', padding:'4px 10px',
          borderRadius:20, fontSize:12, whiteSpace:'nowrap', marginLeft:12 }}>
          ⏱ {exercise.duration} min
        </span>
      </div>
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:16 }}>
        {exercise.suitable_for?.map((tag, i) => (
          <span key={i} style={{ background:'#f1f5f9', color:'#64748b',
            padding:'2px 8px', borderRadius:10, fontSize:11 }}>
            {tag}
          </span>
        ))}
      </div>
      <button onClick={() => onStart(exercise)}
        style={{ padding:'10px 20px', background:'#6366f1', color:'#fff',
          border:'none', borderRadius:8, cursor:'pointer', fontSize:14,
          fontWeight:'bold', width:'100%' }}>
        Start Exercise →
      </button>
    </div>
  );
}

function ExercisePlayer({ exercise, onComplete, onBack }) {
  const [step, setStep]         = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [done, setDone]         = useState(false);

  const submitFeedback = async (helpful) => {
    setFeedback(helpful);
    await axios.post(API + '/act/feedback', {
      exercise_id: exercise.id,
      helpful
    });
    setDone(true);
  };

  return (
    <div style={{ maxWidth:600, margin:'0 auto' }}>
      <button onClick={onBack}
        style={{ padding:'6px 14px', background:'transparent',
          border:'1px solid #e2e8f0', borderRadius:8,
          cursor:'pointer', fontSize:13, color:'#64748b', marginBottom:20 }}>
        ← Back
      </button>

      <div style={{ background:'#fff', borderRadius:20, padding:32,
        border:'1px solid #e2e8f0',
        boxShadow:'0 4px 24px rgba(99,102,241,0.08)' }}>
        <h2 style={{ color:'#6366f1', margin:'0 0 8px' }}>{exercise.title}</h2>
        <p style={{ color:'#64748b', fontSize:14, margin:'0 0 24px' }}>
          {exercise.description} · {exercise.duration} minutes
        </p>

        {/* Progress */}
        <div style={{ background:'#e2e8f0', borderRadius:6, height:6, marginBottom:24 }}>
          <div style={{ width:`${((step+1)/exercise.steps.length)*100}%`,
            background:'#6366f1', height:6, borderRadius:6,
            transition:'width 0.3s ease' }} />
        </div>

        {!done ? (
          <div>
            <div style={{ background:'#f8fafc', borderRadius:12, padding:24,
              marginBottom:24, minHeight:100 }}>
              <div style={{ fontSize:13, color:'#94a3b8', marginBottom:8 }}>
                Step {step + 1} of {exercise.steps.length}
              </div>
              <p style={{ fontSize:17, color:'#1e293b', lineHeight:1.7, margin:0 }}>
                {exercise.steps[step]}
              </p>
            </div>

            <div style={{ display:'flex', gap:12 }}>
              {step > 0 && (
                <button onClick={() => setStep(step - 1)}
                  style={{ flex:1, padding:'12px', background:'#f1f5f9',
                    color:'#64748b', border:'none', borderRadius:10,
                    cursor:'pointer', fontSize:14 }}>
                  ← Previous
                </button>
              )}
              {step < exercise.steps.length - 1 ? (
                <button onClick={() => setStep(step + 1)}
                  style={{ flex:2, padding:'12px', background:'#6366f1',
                    color:'#fff', border:'none', borderRadius:10,
                    cursor:'pointer', fontSize:14, fontWeight:'bold' }}>
                  Next Step →
                </button>
              ) : (
                <div style={{ flex:2 }}>
                  <p style={{ fontSize:14, color:'#1e293b', textAlign:'center',
                    marginBottom:12 }}>
                    Was this exercise helpful?
                  </p>
                  <div style={{ display:'flex', gap:12 }}>
                    <button onClick={() => submitFeedback(true)}
                      style={{ flex:1, padding:'12px', background:'#22c55e',
                        color:'#fff', border:'none', borderRadius:10,
                        cursor:'pointer', fontSize:14 }}>
                      👍 Yes, helpful
                    </button>
                    <button onClick={() => submitFeedback(false)}
                      style={{ flex:1, padding:'12px', background:'#f1f5f9',
                        color:'#64748b', border:'none', borderRadius:10,
                        cursor:'pointer', fontSize:14 }}>
                      👎 Not really
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>
              {feedback ? '🌟' : '💙'}
            </div>
            <h3 style={{ color:'#1e293b', marginBottom:8 }}>
              {feedback ? 'Great work!' : 'Thank you for the feedback'}
            </h3>
            <p style={{ color:'#64748b', fontSize:14, marginBottom:24 }}>
              {feedback
                ? 'You just practiced psychological flexibility. Every rep counts.'
                : 'Your feedback helps us recommend better exercises next time.'}
            </p>
            <button onClick={onComplete}
              style={{ padding:'12px 32px', background:'#6366f1', color:'#fff',
                border:'none', borderRadius:10, cursor:'pointer',
                fontSize:14, fontWeight:'bold' }}>
              Back to ACT Engine
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function AAQAssessment({ onComplete }) {
  const [answers, setAnswers] = useState(Array(7).fill(4));
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    const res = await axios.post(API + '/act/aaq-score', { answers });
    setResult(res.data);
    setLoading(false);
  };

  const labels = ['Never true','Very rarely true','Rarely true','Sometimes true',
                  'Frequently true','Almost always true','Always true'];

  return (
    <div style={{ background:'#fff', borderRadius:16, padding:24,
      border:'1px solid #e2e8f0' }}>
      <h3 style={{ margin:'0 0 8px', color:'#6366f1' }}>
        📊 AAQ-II: Psychological Flexibility Assessment
      </h3>
      <p style={{ fontSize:13, color:'#94a3b8', marginBottom:24 }}>
        Rate each statement from 1 (Never true) to 7 (Always true)
      </p>

      {!result ? (
        <div>
          {AAQ_QUESTIONS.map((q, i) => (
            <div key={i} style={{ marginBottom:20 }}>
              <p style={{ fontSize:14, color:'#1e293b', margin:'0 0 8px' }}>
                {i+1}. {q}
              </p>
              <div style={{ display:'flex', gap:4 }}>
                {[1,2,3,4,5,6,7].map(val => (
                  <button key={val} onClick={() => {
                    const a = [...answers]; a[i] = val; setAnswers(a);
                  }}
                    style={{ flex:1, padding:'8px 4px', border:'none',
                      borderRadius:6, cursor:'pointer', fontSize:12,
                      background: answers[i] === val ? '#6366f1' : '#f1f5f9',
                      color: answers[i] === val ? '#fff' : '#64748b' }}>
                    {val}
                  </button>
                ))}
              </div>
              <div style={{ display:'flex', justifyContent:'space-between',
                fontSize:11, color:'#94a3b8', marginTop:4 }}>
                <span>Never</span><span>Always</span>
              </div>
            </div>
          ))}
          <button onClick={submit} disabled={loading}
            style={{ width:'100%', padding:'12px', background:'#6366f1',
              color:'#fff', border:'none', borderRadius:10,
              cursor:'pointer', fontSize:14, fontWeight:'bold' }}>
            {loading ? 'Calculating...' : 'Get My Flexibility Score'}
          </button>
        </div>
      ) : (
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:56, fontWeight:'bold', marginBottom:8,
            color: result.psychologically_flexible ? '#22c55e' : '#f59e0b' }}>
            {result.total_score}
            <span style={{ fontSize:20, color:'#94a3b8' }}>/49</span>
          </div>
          <h3 style={{ color: result.psychologically_flexible ? '#22c55e' : '#f59e0b' }}>
            {result.level}
          </h3>
          <p style={{ color:'#64748b', fontSize:14, marginBottom:24 }}>
            {result.interpretation}
          </p>
          {result.act_indicated && (
            <div style={{ background:'#fff7ed', borderRadius:12, padding:16,
              marginBottom:20, fontSize:13, color:'#92400e' }}>
              ⚡ ACT therapy is strongly indicated. Regular practice of these
              exercises will build psychological flexibility over time.
            </div>
          )}
          <button onClick={onComplete}
            style={{ padding:'10px 24px', background:'#6366f1', color:'#fff',
              border:'none', borderRadius:8, cursor:'pointer', fontSize:14 }}>
            Start Practicing →
          </button>
        </div>
      )}
    </div>
  );
}

export default function ACTEngine({ user, phqScore, gadScore, condition }) {
  const [exercises, setExercises]       = useState({});
  const [recommended, setRecommended]   = useState(null);
  const [activeProcess, setActiveProcess] = useState(null);
  const [activeExercise, setActiveExercise] = useState(null);
  const [activeTab, setActiveTab]       = useState('home');
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [exRes, recRes] = await Promise.all([
        axios.get(API + '/act/exercises'),
        axios.post(API + '/act/recommend', {
          condition:       condition || 'normal',
          phq_score:       phqScore || 0,
          gad_score:       gadScore || 0,
          journal_risk:    {},
          days_since_last: 1
        })
      ]);
      setExercises(exRes.data);
      setRecommended(recRes.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  if (activeExercise) return (
    <ExercisePlayer
      exercise={activeExercise}
      onBack={() => setActiveExercise(null)}
      onComplete={() => setActiveExercise(null)}
    />
  );

  const tabStyle = (tab) => ({
    padding:'10px 20px', border:'none', borderRadius:8,
    cursor:'pointer', fontSize:14, marginRight:8,
    background: activeTab === tab ? '#6366f1' : '#fff',
    color: activeTab === tab ? '#fff' : '#64748b',
    fontWeight: activeTab === tab ? 'bold' : 'normal'
  });

  return (
    <div style={{ fontFamily:'sans-serif', maxWidth:720, margin:'0 auto', padding:24 }}>
      <div style={{ marginBottom:24 }}>
        <h2 style={{ color:'#6366f1', margin:'0 0 4px' }}>
          🌱 ACT Engine
        </h2>
        <p style={{ color:'#64748b', fontSize:14, margin:0 }}>
          Acceptance and Commitment Therapy — Build Psychological Flexibility
        </p>
      </div>

      <div style={{ marginBottom:24 }}>
        <button style={tabStyle('home')}    onClick={() => setActiveTab('home')}>Home</button>
        <button style={tabStyle('library')} onClick={() => setActiveTab('library')}>Exercise Library</button>
        <button style={tabStyle('aaq')}     onClick={() => setActiveTab('aaq')}>Flexibility Score</button>
      </div>

      {/* HOME TAB */}
      {activeTab === 'home' && (
        <div>
          {/* Stress Score */}
          {recommended && (
            <div style={{ background: recommended.should_intervene
              ? 'linear-gradient(135deg, #fef2f2, #fff7ed)'
              : 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
              borderRadius:16, padding:24, marginBottom:24,
              border: `1px solid ${recommended.should_intervene ? '#fecaca' : '#86efac'}` }}>
              <div style={{ display:'flex', justifyContent:'space-between',
                alignItems:'center' }}>
                <div>
                  <h3 style={{ margin:'0 0 4px',
                    color: recommended.should_intervene ? '#dc2626' : '#16a34a' }}>
                    {recommended.should_intervene
                      ? '⚠️ Intervention Recommended'
                      : '✅ You\'re Doing Well'}
                  </h3>
                  <p style={{ margin:0, fontSize:13, color:'#64748b' }}>
                    Stress Score: <strong>{recommended.stress_score}/100</strong>
                  </p>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:36, fontWeight:'bold',
                    color: recommended.should_intervene ? '#dc2626' : '#16a34a' }}>
                    {recommended.stress_score}
                  </div>
                  <div style={{ fontSize:12, color:'#94a3b8' }}>stress score</div>
                </div>
              </div>
            </div>
          )}

          {/* Recommended Exercise */}
          {recommended?.exercise && (
            <div style={{ marginBottom:24 }}>
              <h3 style={{ color:'#1e293b', margin:'0 0 16px' }}>
                🎯 Recommended for You
              </h3>
              <ExerciseCard
                exercise={recommended.exercise}
                onStart={setActiveExercise}
              />
            </div>
          )}

          {/* 6 Processes */}
          <h3 style={{ color:'#1e293b', margin:'0 0 16px' }}>
            The 6 ACT Processes
          </h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {Object.entries(processInfo).map(([key, info]) => (
              <div key={key}
                onClick={() => { setActiveProcess(key); setActiveTab('library'); }}
                style={{ background:'#fff', borderRadius:12, padding:16,
                  border:'1px solid #e2e8f0', cursor:'pointer',
                  transition:'all 0.2s' }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = info.color;
                  e.currentTarget.style.background  = info.color + '08';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.background  = '#fff';
                }}>
                <div style={{ fontSize:24, marginBottom:8 }}>{info.icon}</div>
                <div style={{ fontSize:13, fontWeight:'bold', color:'#1e293b',
                  marginBottom:4 }}>{info.label}</div>
                <div style={{ fontSize:11, color:'#94a3b8' }}>{info.desc}</div>
                <div style={{ fontSize:11, color:info.color, marginTop:8 }}>
                  {exercises[key]?.length || 0} exercises →
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LIBRARY TAB */}
      {activeTab === 'library' && (
        <div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
            <button onClick={() => setActiveProcess(null)}
              style={{ padding:'6px 14px', borderRadius:20, border:'none',
                cursor:'pointer', fontSize:13,
                background: !activeProcess ? '#6366f1' : '#f1f5f9',
                color: !activeProcess ? '#fff' : '#64748b' }}>
              All
            </button>
            {Object.entries(processInfo).map(([key, info]) => (
              <button key={key} onClick={() => setActiveProcess(key)}
                style={{ padding:'6px 14px', borderRadius:20, border:'none',
                  cursor:'pointer', fontSize:13,
                  background: activeProcess === key ? info.color : '#f1f5f9',
                  color: activeProcess === key ? '#fff' : '#64748b' }}>
                {info.icon} {info.label}
              </button>
            ))}
          </div>

          <div style={{ display:'grid', gap:16 }}>
            {Object.entries(exercises)
              .filter(([key]) => !activeProcess || key === activeProcess)
              .flatMap(([key, exList]) => exList.map(ex => (
                <ExerciseCard key={ex.id} exercise={ex} onStart={setActiveExercise} />
              )))}
          </div>
        </div>
      )}

      {/* AAQ TAB */}
      {activeTab === 'aaq' && (
        <AAQAssessment onComplete={() => setActiveTab('home')} />
      )}
    </div>
  );
}