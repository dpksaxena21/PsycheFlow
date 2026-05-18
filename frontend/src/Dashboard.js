import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import Logo from './Logo';
import MoodCheckIn from './MoodCheckIn';

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
      <h3 style={{ margin:'0 0 8px', color:'#111827', fontSize:15 }}>
        🔗 Share With Psychologist
      </h3>
      <p style={{ fontSize:13, color:'#6B7280', marginTop:0, marginBottom:16 }}>
        Generate a Share Code and give it to your psychologist to link your profile.
      </p>
      {shareCode ? (
        <div>
          <div style={{ background:'#eef2ff', borderRadius:12, padding:20,
            textAlign:'center', marginBottom:12 }}>
            <div style={{ fontSize:30, fontWeight:'bold', letterSpacing:8,
              color:'#4F46E5', fontFamily:'monospace' }}>{shareCode}</div>
            <div style={{ fontSize:12, color:'#6B7280', marginTop:6 }}>
              Share this code with your psychologist
            </div>
          </div>
          <button onClick={generateCode}
            style={{ padding:'8px 16px', background:'transparent',
              border:'1px solid #E5E7EB', borderRadius:8,
              cursor:'pointer', fontSize:12, color:'#6B7280' }}>
            Generate New Code
          </button>
        </div>
      ) : (
        <button onClick={generateCode} disabled={loading}
          style={{ padding:'12px 24px', background:'#4F46E5',
            color:'#fff', border:'none', borderRadius:10,
            cursor:'pointer', fontSize:14, fontWeight:600 }}>
          {loading ? 'Generating...' : '🔗 Generate Share Code'}
        </button>
      )}
    </div>
  );
}

export default function Dashboard({ user, onStartAssessment, onLogout,
  onPsychologistMode, onACTEngine, onCrisis }) {
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
    fontSize:14, fontWeight: activeTab===tab ? 600 : 400,
    background: activeTab===tab ? '#4F46E5' : '#fff',
    color: activeTab===tab ? '#fff' : '#6B7280', marginRight:8,
    transition:'all 0.15s'
  });

  if (loading) return (
    <div style={{ textAlign:'center', padding:80, fontFamily:'-apple-system,sans-serif' }}>
      <div style={{ fontSize:32, marginBottom:12 }}>
        <svg width="40" height="28" viewBox="0 0 40 28">
          {[7,12,20,16,10].map((h,i) => (
            <rect key={i} x={i*8} y={28-h} width="6" height={h} rx="3"
              fill={i<4?'#4F46E5':'#10B981'} opacity={[0.28,0.55,1,0.72,0.55][i]}/>
          ))}
        </svg>
      </div>
      <p style={{ color:'#9CA3AF', fontSize:14 }}>Loading your data...</p>
    </div>
  );

  return (
    <div style={{ fontFamily:'-apple-system, sans-serif', minHeight:'100vh',
      background:'#F7F6F3', padding:32 }}>
      <div style={{ maxWidth:740, margin:'0 auto' }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between',
          alignItems:'center', marginBottom:28, flexWrap:'wrap', gap:12 }}>
          <div>
            <Logo size="md" />
            <p style={{ color:'#9CA3AF', fontSize:12, margin:'5px 0 0', paddingLeft:2 }}>
              {user.email}
            </p>
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
            <button onClick={onCrisis}
              style={{ padding:'9px 14px', background:'#FEF2F2', color:'#DC2626',
                border:'1px solid #FECACA', borderRadius:8,
                cursor:'pointer', fontSize:13, fontWeight:500 }}>
              🆘 Crisis
            </button>
            <button onClick={onACTEngine}
              style={{ padding:'9px 14px', background:'#F0FDF4', color:'#10B981',
                border:'1px solid #86EFAC', borderRadius:8,
                cursor:'pointer', fontSize:13, fontWeight:500 }}>
              🌱 ACT
            </button>
            <button onClick={onPsychologistMode}
              style={{ padding:'9px 14px', background:'#0F0B2D', color:'#a5b4fc',
                border:'none', borderRadius:8, cursor:'pointer',
                fontSize:13, fontWeight:500 }}>
              🩺 Clinician
            </button>
            <button onClick={onStartAssessment}
              style={{ padding:'9px 18px', background:'#4F46E5', color:'#fff',
                border:'none', borderRadius:8, cursor:'pointer',
                fontSize:14, fontWeight:600 }}>
              + Assessment
            </button>
            <button onClick={onLogout}
              style={{ padding:'9px 14px', background:'#fff', color:'#9CA3AF',
                border:'1px solid #E5E7EB', borderRadius:8,
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
              <div style={{ background:'#fff', borderRadius:20, padding:56,
                textAlign:'center', border:'1px solid #E5E7EB',
                boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ marginBottom:20 }}>
                  <svg width="48" height="34" viewBox="0 0 48 34">
                    {[7,12,20,16,10].map((h,i) => (
                      <rect key={i} x={i*9+1} y={34-h} width="7" height={h} rx="3.5"
                        fill={i<4?'#4F46E5':'#10B981'}
                        opacity={[0.2,0.4,0.7,0.5,0.3][i]}/>
                    ))}
                  </svg>
                </div>
                <h3 style={{ color:'#111827', margin:'0 0 8px', fontSize:20,
                  fontWeight:600 }}>No assessments yet</h3>
                <p style={{ color:'#9CA3AF', fontSize:14, margin:'0 0 28px' }}>
                  Take your first assessment to build your psychological profile.
                </p>
                <button onClick={onStartAssessment}
                  style={{ padding:'12px 32px', background:'#4F46E5', color:'#fff',
                    border:'none', borderRadius:10, cursor:'pointer',
                    fontSize:15, fontWeight:600 }}>
                  Start Assessment →
                </button>
              </div>
            ) : (
              <div>
                {/* Mood Check-in */}
<MoodCheckIn userId={user.id} onComplete={(mood) => {
  console.log('Mood logged:', mood);
}} />
                {/* Stats */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr',
                  gap:12, marginBottom:20 }}>
                  {[
                    { label:'Sessions',    value:sessions.length,          color:'#4F46E5' },
                    { label:'Latest PHQ-9', value:latest?.phq_score??'-', color:phqLevel(latest?.phq_score||0).color },
                    { label:'Latest GAD-7', value:latest?.gad_score??'-', color:phqLevel(latest?.gad_score||0).color },
                    { label:'Journals',    value:journals.length,          color:'#4F46E5' },
                  ].map((card, i) => (
                    <div key={i} style={{ background:'#fff', borderRadius:14,
                      padding:'20px 16px', border:'1px solid #F3F4F6',
                      boxShadow:'0 1px 3px rgba(0,0,0,0.04)', textAlign:'center' }}>
                      <div style={{ fontSize:26, fontWeight:700, color:card.color,
                        marginBottom:4 }}>{card.value}</div>
                      <div style={{ fontSize:11, color:'#9CA3AF',
                        textTransform:'uppercase', letterSpacing:'0.05em' }}>
                        {card.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Personality */}
                {latest?.predictions && Object.keys(latest.predictions).length > 0 && (
                  <div style={{ background:'#fff', borderRadius:16, padding:24,
                    border:'1px solid #F3F4F6', marginBottom:16,
                    boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ margin:'0 0 20px', color:'#111827', fontSize:15,
                      fontWeight:600 }}>Personality Profile</h3>
                    {bigFive.map(t => {
                      const d = latest.predictions[t];
                      if (!d) return null;
                      return (
                        <div key={t} style={{ marginBottom:14 }}>
                          <div style={{ display:'flex', justifyContent:'space-between',
                            marginBottom:5 }}>
                            <span style={{ fontSize:13, color:'#374151' }}>{t}</span>
                            <span style={{ fontSize:13, fontWeight:600,
                              color:colorMap[d.label] }}>
                              {d.label} · {d.confidence}%
                            </span>
                          </div>
                          <div style={{ background:'#F3F4F6', borderRadius:6, height:6 }}>
                            <div style={{ width:`${d.confidence}%`,
                              background:colorMap[d.label], height:6, borderRadius:6,
                              transition:'width 0.5s ease' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* PHQ Trend */}
                {sessions.length > 1 && (
                  <div style={{ background:'#fff', borderRadius:16, padding:24,
                    border:'1px solid #F3F4F6', marginBottom:16,
                    boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ margin:'0 0 20px', color:'#111827', fontSize:15,
                      fontWeight:600 }}>Depression Trend (PHQ-9)</h3>
                    <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:80 }}>
                      {[...sessions].reverse().map((s, i) => {
                        const h = Math.max((s.phq_score/27)*80, 4);
                        const c = phqLevel(s.phq_score).color;
                        return (
                          <div key={i} style={{ flex:1, display:'flex',
                            flexDirection:'column', alignItems:'center', gap:4 }}>
                            <div style={{ width:'100%', height:h,
                              background:c, borderRadius:4,
                              transition:'height 0.3s ease' }} />
                            <span style={{ fontSize:9, color:'#9CA3AF' }}>
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
                    border:'1px solid #F3F4F6', marginBottom:16,
                    boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ margin:'0 0 16px', color:'#111827', fontSize:15,
                      fontWeight:600 }}>Latest Journal</h3>
                    <div style={{ background:'#F9FAFB', borderRadius:10, padding:16 }}>
                      <div style={{ display:'flex', justifyContent:'space-between',
                        marginBottom:8 }}>
                        <strong style={{ color:'#4F46E5', textTransform:'capitalize',
                          fontSize:13 }}>
                          {journals[0].analysis?.emotions?.primary || 'Entry'} —{' '}
                          {journals[0].analysis?.emotions?.intensity || ''}
                        </strong>
                        <span style={{ fontSize:11, color:'#9CA3AF' }}>
                          {new Date(journals[0].created_at).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <p style={{ fontSize:13, color:'#6B7280', margin:'0 0 8px',
                        fontStyle:'italic', lineHeight:1.6 }}>
                        "{journals[0].text?.slice(0,180)}..."
                      </p>
                      {journals[0].analysis?.condition_detection && (
                        <div style={{ fontSize:12, color:'#4F46E5' }}>
                          Condition: <strong>
                            {journals[0].analysis.condition_detection.primary_condition}
                          </strong>{' '}
                          ({journals[0].analysis.condition_detection.confidence}%)
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div style={{ background:'#fff', borderRadius:16, padding:24,
                  border:'1px solid #F3F4F6', marginBottom:16,
                  boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
                  <h3 style={{ margin:'0 0 16px', color:'#111827', fontSize:15,
                    fontWeight:600 }}>Quick Actions</h3>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    {[
                      { icon:'💬', label:'Talk to Dr. PsycheFlow', desc:'Conversational interview', color:'#EEF2FF', border:'#C7D2FE' },
                      { icon:'📋', label:'Structured Assessment',  desc:'PHQ-9, GAD-7 & more',     color:'#F0FDF4', border:'#86EFAC' },
                      { icon:'🌱', label:'ACT Therapy',            desc:'Build flexibility',         color:'#F0FDF4', border:'#86EFAC' },
                      { icon:'🆘', label:'Crisis Support',         desc:'Immediate help',            color:'#FEF2F2', border:'#FECACA' },
                    ].map((action, i) => (
                      <div key={i}
                        onClick={() => {
                          if (i === 0 || i === 1) onStartAssessment();
                          else if (i === 2) onACTEngine();
                          else onCrisis();
                        }}
                        style={{ background:action.color, borderRadius:12, padding:16,
                          cursor:'pointer', border:`1px solid ${action.border}`,
                          transition:'all 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.transform='translateY(-1px)'}
                        onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
                        <div style={{ fontSize:22, marginBottom:6 }}>{action.icon}</div>
                        <div style={{ fontSize:13, fontWeight:600, color:'#111827',
                          marginBottom:2 }}>{action.label}</div>
                        <div style={{ fontSize:11, color:'#6B7280' }}>{action.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

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
                textAlign:'center', border:'1px solid #F3F4F6' }}>
                <p style={{ color:'#9CA3AF' }}>No sessions yet.</p>
              </div>
            ) : sessions.map((s, i) => (
              <div key={i} style={{ background:'#fff', borderRadius:14,
                padding:20, border:'1px solid #F3F4F6', marginBottom:10,
                boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ display:'flex', justifyContent:'space-between',
                  alignItems:'center', marginBottom:12 }}>
                  <strong style={{ color:'#111827', fontSize:14 }}>
                    Session {sessions.length - i}
                  </strong>
                  <span style={{ fontSize:11, color:'#9CA3AF' }}>
                    {new Date(s.created_at).toLocaleDateString('en-IN',
                      { day:'numeric', month:'short', year:'numeric' })}
                  </span>
                </div>

                {s.answers?.interview_assessment ? (
                  <div style={{ background:'#F0F9FF', borderRadius:8,
                    padding:12, fontSize:13, color:'#374151' }}>
                    <strong style={{ color:'#0369A1', fontSize:12 }}>
                      💬 Conversational Interview
                    </strong>
                    <p style={{ margin:'6px 0 0', fontSize:12, color:'#6B7280',
                      lineHeight:1.6 }}>
                      {s.answers.interview_assessment.slice(0,180)}...
                    </p>
                  </div>
                ) : (
                  <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                    {[
                      { l:'PHQ-9', v:s.phq_score },
                      { l:'GAD-7', v:s.gad_score }
                    ].map((item,j) => (
                      <div key={j} style={{ background:'#F9FAFB', borderRadius:8,
                        padding:'8px 14px', textAlign:'center',
                        border:'1px solid #F3F4F6' }}>
                        <div style={{ fontSize:18, fontWeight:700,
                          color:phqLevel(item.v).color }}>{item.v}</div>
                        <div style={{ fontSize:10, color:'#9CA3AF',
                          textTransform:'uppercase', letterSpacing:'0.05em' }}>
                          {item.l}
                        </div>
                      </div>
                    ))}
                    {s.predictions && bigFive.slice(0,3).map(t => (
                      s.predictions[t] && (
                        <div key={t} style={{ background:'#F9FAFB', borderRadius:8,
                          padding:'8px 14px', textAlign:'center',
                          border:'1px solid #F3F4F6' }}>
                          <div style={{ fontSize:13, fontWeight:600,
                            color:colorMap[s.predictions[t].label] }}>
                            {s.predictions[t].label}
                          </div>
                          <div style={{ fontSize:10, color:'#9CA3AF',
                            textTransform:'uppercase', letterSpacing:'0.05em' }}>
                            {t.slice(0,5)}
                          </div>
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
                textAlign:'center', border:'1px solid #F3F4F6' }}>
                <p style={{ color:'#9CA3AF' }}>No journal entries yet.</p>
              </div>
            ) : journals.map((j, i) => (
              <div key={i} style={{ background:'#fff', borderRadius:14,
                padding:20, border:'1px solid #F3F4F6', marginBottom:10,
                boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ display:'flex', justifyContent:'space-between',
                  marginBottom:8 }}>
                  <strong style={{ color:'#4F46E5', textTransform:'capitalize',
                    fontSize:14 }}>
                    {j.analysis?.emotions?.primary || 'Entry'} —{' '}
                    {j.analysis?.emotions?.intensity || ''}
                  </strong>
                  <span style={{ fontSize:11, color:'#9CA3AF' }}>
                    {new Date(j.created_at).toLocaleDateString('en-IN',
                      { day:'numeric', month:'short', year:'numeric' })}
                  </span>
                </div>
                <p style={{ fontSize:13, color:'#6B7280', margin:'0 0 8px',
                  fontStyle:'italic', lineHeight:1.6 }}>
                  "{j.text?.slice(0,150)}..."
                </p>
                {j.analysis?.condition_detection && (
                  <div style={{ fontSize:12, marginBottom:6 }}>
                    <span style={{ color:'#9CA3AF' }}>Condition: </span>
                    <strong style={{ color:'#4F46E5' }}>
                      {j.analysis.condition_detection.primary_condition}
                    </strong>
                    <span style={{ color:'#9CA3AF', marginLeft:4 }}>
                      ({j.analysis.condition_detection.confidence}%)
                    </span>
                  </div>
                )}
                {j.analysis?.clinical_summary && (
                  <p style={{ fontSize:12, color:'#6B7280', margin:0,
                    background:'#F9FAFB', padding:'8px 12px', borderRadius:8,
                    lineHeight:1.6 }}>
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