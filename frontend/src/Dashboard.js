import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

const bigFive  = ['Extraversion','Neuroticism','Agreeableness','Conscientiousness','Openness'];
const colorMap = { High:'#ef4444', Medium:'#f59e0b', Low:'#22c55e' };

function ShareCodeSection({ userId }) {
  const [shareCode, setShareCode] = useState(null);
  const [loading, setLoading]     = useState(false);

  const fetchExisting = async () => {
    const { data } = await supabase
      .from('patient_psychologist')
      .select('share_code')
      .eq('patient_id', userId)
      .eq('active', true)
      .order('linked_at', { ascending: false })
      .limit(1);
    if (data && data.length > 0) setShareCode(data[0].share_code);
  };

  useEffect(() => { fetchExisting(); }, []);

  const generateCode = async () => {
    setLoading(true);
    const code = Math.random().toString(36).substring(2,10).toUpperCase();
    const { error } = await supabase.from('patient_psychologist').insert({
      patient_id: userId,
      share_code: code,
      active:     true
    });
    if (!error) setShareCode(code);
    setLoading(false);
  };

  return (
    <div style={{ background:'#fff', borderRadius:16, padding:24,
      border:'1px solid #e2e8f0', marginTop:16 }}>
      <h3 style={{ margin:'0 0 8px', color:'#1e293b' }}>🔗 Share With Psychologist</h3>
      <p style={{ fontSize:13, color:'#94a3b8', marginTop:0, marginBottom:16 }}>
        Generate a Share Code and give it to your psychologist to link your profile.
      </p>
      {shareCode ? (
        <div>
          <div style={{ background:'#eef2ff', borderRadius:12, padding:20,
            textAlign:'center', marginBottom:12 }}>
            <div style={{ fontSize:32, fontWeight:'bold', letterSpacing:8,
              color:'#6366f1' }}>{shareCode}</div>
            <div style={{ fontSize:12, color:'#94a3b8', marginTop:4 }}>
              Share this code with your psychologist
            </div>
          </div>
          <button onClick={generateCode}
            style={{ padding:'8px 16px', background:'transparent',
              border:'1px solid #e2e8f0', borderRadius:8,
              cursor:'pointer', fontSize:12, color:'#64748b' }}>
            Generate New Code
          </button>
        </div>
      ) : (
        <button onClick={generateCode} disabled={loading}
          style={{ padding:'12px 24px', background:'#6366f1',
            color:'#fff', border:'none', borderRadius:10,
            cursor:'pointer', fontSize:14, fontWeight:'bold' }}>
          {loading ? 'Generating...' : '🔗 Generate Share Code'}
        </button>
      )}
    </div>
  );
}

export default function Dashboard({ user, onStartAssessment, onLogout, onPsychologistMode, onACTEngine }) {
  const [sessions, setSessions]   = useState([]);
  const [journals, setJournals]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: s } = await supabase.from('sessions').select('*')
      .eq('user_id', user.id).order('created_at', { ascending: false });
    const { data: j } = await supabase.from('journal_entries').select('*')
      .eq('user_id', user.id).order('created_at', { ascending: false });
    setSessions(s || []);
    setJournals(j || []);
    setLoading(false);
  };

  const phqLevel = (s) => s <= 4  ? {label:'Minimal',  color:'#22c55e'}
    : s <= 9  ? {label:'Mild',     color:'#f59e0b'}
    : s <= 14 ? {label:'Moderate', color:'#f97316'}
    :           {label:'Severe',   color:'#ef4444'};

  const latest = sessions[0];

  const tabStyle = (tab) => ({
    padding:'10px 20px', border:'none', borderRadius:8, cursor:'pointer',
    fontSize:14, fontWeight: activeTab===tab ? 'bold' : 'normal',
    background: activeTab===tab ? '#6366f1' : '#fff',
    color: activeTab===tab ? '#fff' : '#64748b', marginRight:8
  });

  if (loading) return (
    <div style={{ textAlign:'center', padding:80, fontFamily:'sans-serif' }}>
      <div style={{ fontSize:32 }}>⏳</div>
      <p style={{ color:'#94a3b8' }}>Loading your data...</p>
    </div>
  );

  return (
    <div style={{ fontFamily:'sans-serif', minHeight:'100vh',
      background:'#f1f5f9', padding:32 }}>
      <div style={{ maxWidth:720, margin:'0 auto' }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between',
          alignItems:'center', marginBottom:24 }}>
          <div>
            <h2 style={{ color:'#6366f1', margin:0 }}>🧠 PsycheFlow</h2>
            <p style={{ color:'#94a3b8', fontSize:13, margin:'4px 0 0' }}>
              {user.email}
            </p>
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <button onClick={onACTEngine}
              style={{ padding:'10px 16px', background:'#10b981', color:'#fff',
                border:'none', borderRadius:8, cursor:'pointer', fontSize:13 }}>
              🌱 ACT Engine
            </button>
            <button onClick={onPsychologistMode}
              style={{ padding:'10px 16px', background:'#1e1b4b', color:'#a5b4fc',
                border:'none', borderRadius:8, cursor:'pointer', fontSize:13 }}>
              🩺 Clinician Mode
            </button>
            <button onClick={onStartAssessment}
              style={{ padding:'10px 20px', background:'#6366f1', color:'#fff',
                border:'none', borderRadius:8, cursor:'pointer', fontSize:14 }}>
              + New Assessment
            </button>
            <button onClick={onLogout}
              style={{ padding:'10px 16px', background:'#fff', color:'#94a3b8',
                border:'1px solid #e2e8f0', borderRadius:8,
                cursor:'pointer', fontSize:13 }}>
              Sign Out
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ marginBottom:24 }}>
          <button style={tabStyle('overview')} onClick={() => setActiveTab('overview')}>
            Overview
          </button>
          <button style={tabStyle('history')} onClick={() => setActiveTab('history')}>
            History ({sessions.length})
          </button>
          <button style={tabStyle('journal')} onClick={() => setActiveTab('journal')}>
            Journal ({journals.length})
          </button>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div>
            {sessions.length === 0 ? (
              <div style={{ background:'#fff', borderRadius:16, padding:48,
                textAlign:'center', border:'1px solid #e2e8f0' }}>
                <div style={{ fontSize:48, marginBottom:16 }}>📋</div>
                <h3 style={{ color:'#1e293b' }}>No assessments yet</h3>
                <p style={{ color:'#94a3b8' }}>
                  Take your first assessment to see your psychological profile.
                </p>
                <button onClick={onStartAssessment}
                  style={{ padding:'12px 32px', background:'#6366f1', color:'#fff',
                    border:'none', borderRadius:10, cursor:'pointer', fontSize:15 }}>
                  Start Assessment
                </button>
              </div>
            ) : (
              <div>
                {/* Stats Cards */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr',
                  gap:16, marginBottom:20 }}>
                  {[
                    { label:'Total Sessions',  value:sessions.length,           icon:'📊', color:'#6366f1' },
                    { label:'Latest PHQ-9',    value:latest?.phq_score ?? '-',  icon:'😔', color:phqLevel(latest?.phq_score||0).color },
                    { label:'Latest GAD-7',    value:latest?.gad_score ?? '-',  icon:'😰', color:phqLevel(latest?.gad_score||0).color },
                    { label:'Journal Entries', value:journals.length,           icon:'📝', color:'#6366f1' },
                  ].map((card, i) => (
                    <div key={i} style={{ background:'#fff', borderRadius:16,
                      padding:20, border:'1px solid #e2e8f0' }}>
                      <div style={{ fontSize:28, marginBottom:8 }}>{card.icon}</div>
                      <div style={{ fontSize:28, fontWeight:'bold', color:card.color }}>
                        {card.value}
                      </div>
                      <div style={{ fontSize:13, color:'#94a3b8' }}>{card.label}</div>
                    </div>
                  ))}
                </div>

                {/* Latest Personality */}
                {latest?.predictions && Object.keys(latest.predictions).length > 0 && (
                  <div style={{ background:'#fff', borderRadius:16, padding:24,
                    border:'1px solid #e2e8f0', marginBottom:20 }}>
                    <h3 style={{ margin:'0 0 16px', color:'#6366f1' }}>
                      Latest Personality Profile
                    </h3>
                    {bigFive.map(t => {
                      const d = latest.predictions[t];
                      if (!d) return null;
                      return (
                        <div key={t} style={{ marginBottom:12 }}>
                          <div style={{ display:'flex', justifyContent:'space-between',
                            marginBottom:4 }}>
                            <span style={{ fontSize:14 }}>{t}</span>
                            <span style={{ color:colorMap[d.label],
                              fontWeight:'bold', fontSize:14 }}>
                              {d.label} ({d.confidence}%)
                            </span>
                          </div>
                          <div style={{ background:'#e2e8f0', borderRadius:6, height:8 }}>
                            <div style={{ width:`${d.confidence}%`,
                              background:colorMap[d.label], height:8, borderRadius:6 }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* PHQ Trend */}
                {sessions.length > 1 && (
                  <div style={{ background:'#fff', borderRadius:16, padding:24,
                    border:'1px solid #e2e8f0', marginBottom:20 }}>
                    <h3 style={{ margin:'0 0 16px', color:'#1e293b' }}>
                      Depression Score Trend (PHQ-9)
                    </h3>
                    <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:80 }}>
                      {[...sessions].reverse().map((s, i) => {
                        const h = Math.max((s.phq_score/27)*80, 4);
                        const c = phqLevel(s.phq_score).color;
                        return (
                          <div key={i} style={{ flex:1, display:'flex',
                            flexDirection:'column', alignItems:'center', gap:4 }}>
                            <div style={{ width:'100%', height:h,
                              background:c, borderRadius:4 }} />
                            <span style={{ fontSize:10, color:'#94a3b8' }}>
                              {s.phq_score}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Latest Journal */}
                {journals.length > 0 && (
                  <div style={{ background:'#fff', borderRadius:16, padding:24,
                    border:'1px solid #e2e8f0', marginBottom:16 }}>
                    <h3 style={{ margin:'0 0 16px', color:'#6366f1' }}>
                      Latest Journal Entry
                    </h3>
                    <div style={{ background:'#f8fafc', borderRadius:12, padding:16 }}>
                      <div style={{ display:'flex', justifyContent:'space-between',
                        marginBottom:8 }}>
                        <strong style={{ color:'#6366f1', textTransform:'capitalize' }}>
                          {journals[0].analysis?.emotions?.primary || 'Entry'} —{' '}
                          {journals[0].analysis?.emotions?.intensity || ''}
                        </strong>
                        <span style={{ fontSize:12, color:'#94a3b8' }}>
                          {new Date(journals[0].created_at).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <p style={{ fontSize:13, color:'#475569', margin:'0 0 8px',
                        fontStyle:'italic' }}>
                        "{journals[0].text?.slice(0,200)}..."
                      </p>
                      {journals[0].analysis?.condition_detection && (
                        <div style={{ fontSize:12, color:'#6366f1' }}>
                          Condition detected: <strong>
                            {journals[0].analysis.condition_detection.primary_condition}
                          </strong> ({journals[0].analysis.condition_detection.confidence}%)
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div style={{ background:'#fff', borderRadius:16, padding:24,
                  border:'1px solid #e2e8f0', marginBottom:16 }}>
                  <h3 style={{ margin:'0 0 16px', color:'#1e293b' }}>Quick Actions</h3>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    {[
                      { icon:'💬', label:'Conversational Interview', desc:'Talk to Dr. PsycheFlow' },
                      { icon:'📋', label:'Take Assessment',          desc:'Structured questionnaire' },
                      { icon:'🌱', label:'ACT Engine',               desc:'Therapy exercises' },
                      { icon:'📝', label:'View Journals',            desc:'Past journal entries' },
                    ].map((action, i) => (
                      <div key={i}
                        onClick={() => {
                          if (i < 2) onStartAssessment();
                          else if (i === 2) onACTEngine();
                          else setActiveTab('journal');
                        }}
                        style={{ background:'#f8fafc', borderRadius:12, padding:16,
                          cursor:'pointer', border:'1px solid #e2e8f0',
                          transition:'all 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor='#6366f1'}
                        onMouseLeave={e => e.currentTarget.style.borderColor='#e2e8f0'}>
                        <div style={{ fontSize:24, marginBottom:6 }}>{action.icon}</div>
                        <div style={{ fontSize:13, fontWeight:'bold', color:'#1e293b' }}>
                          {action.label}
                        </div>
                        <div style={{ fontSize:11, color:'#94a3b8' }}>{action.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Share Code */}
                <ShareCodeSection userId={user.id} />
              </div>
            )}
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div>
            {sessions.length === 0 ? (
              <div style={{ background:'#fff', borderRadius:16, padding:40,
                textAlign:'center', border:'1px solid #e2e8f0' }}>
                <p style={{ color:'#94a3b8' }}>No sessions yet.</p>
              </div>
            ) : sessions.map((s, i) => (
              <div key={i} style={{ background:'#fff', borderRadius:16,
                padding:20, border:'1px solid #e2e8f0', marginBottom:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between',
                  alignItems:'center', marginBottom:12 }}>
                  <strong style={{ color:'#1e293b' }}>
                    Session {sessions.length - i}
                  </strong>
                  <span style={{ fontSize:12, color:'#94a3b8' }}>
                    {new Date(s.created_at).toLocaleDateString('en-IN',
                      { day:'numeric', month:'short', year:'numeric' })}
                  </span>
                </div>

                {s.answers?.interview_assessment ? (
                  <div style={{ background:'#f0f9ff', borderRadius:8,
                    padding:12, fontSize:13, color:'#374151' }}>
                    <strong style={{ color:'#0369a1' }}>💬 Conversational Interview</strong>
                    <p style={{ margin:'8px 0 0', fontSize:12 }}>
                      {s.answers.interview_assessment.slice(0,200)}...
                    </p>
                  </div>
                ) : (
                  <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                    <div style={{ background:'#f8fafc', borderRadius:8,
                      padding:'8px 16px', textAlign:'center' }}>
                      <div style={{ fontSize:20, fontWeight:'bold',
                        color:phqLevel(s.phq_score).color }}>{s.phq_score}</div>
                      <div style={{ fontSize:11, color:'#94a3b8' }}>PHQ-9</div>
                    </div>
                    <div style={{ background:'#f8fafc', borderRadius:8,
                      padding:'8px 16px', textAlign:'center' }}>
                      <div style={{ fontSize:20, fontWeight:'bold',
                        color:phqLevel(s.gad_score).color }}>{s.gad_score}</div>
                      <div style={{ fontSize:11, color:'#94a3b8' }}>GAD-7</div>
                    </div>
                    {s.predictions && bigFive.slice(0,3).map(t => (
                      s.predictions[t] && (
                        <div key={t} style={{ background:'#f8fafc', borderRadius:8,
                          padding:'8px 16px', textAlign:'center' }}>
                          <div style={{ fontSize:13, fontWeight:'bold',
                            color:colorMap[s.predictions[t].label] }}>
                            {s.predictions[t].label}
                          </div>
                          <div style={{ fontSize:11, color:'#94a3b8' }}>{t.slice(0,4)}</div>
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* JOURNAL TAB */}
        {activeTab === 'journal' && (
          <div>
            {journals.length === 0 ? (
              <div style={{ background:'#fff', borderRadius:16, padding:40,
                textAlign:'center', border:'1px solid #e2e8f0' }}>
                <p style={{ color:'#94a3b8' }}>No journal entries yet.</p>
              </div>
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
                    {new Date(j.created_at).toLocaleDateString('en-IN',
                      { day:'numeric', month:'short', year:'numeric' })}
                  </span>
                </div>
                <p style={{ fontSize:13, color:'#475569', margin:'0 0 8px',
                  fontStyle:'italic' }}>"{j.text?.slice(0,150)}..."</p>
                {j.analysis?.condition_detection && (
                  <div style={{ fontSize:12, marginBottom:8 }}>
                    <span style={{ color:'#64748b' }}>Condition: </span>
                    <strong style={{ color:'#6366f1' }}>
                      {j.analysis.condition_detection.primary_condition}
                    </strong>
                    <span style={{ color:'#94a3b8', marginLeft:6 }}>
                      ({j.analysis.condition_detection.confidence}%)
                    </span>
                  </div>
                )}
                {j.analysis?.clinical_summary && (
                  <p style={{ fontSize:12, color:'#64748b', margin:0,
                    background:'#f8fafc', padding:'8px 12px', borderRadius:8 }}>
                    {j.analysis.clinical_summary}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}