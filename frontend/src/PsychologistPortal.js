import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import axios from 'axios';

export default function PsychologistPortal({ user, onLogout }) {
  const [patients, setPatients]       = useState([]);
  const [selected, setSelected]       = useState(null);
  const [sessions, setSessions]       = useState([]);
  const [journals, setJournals]       = useState([]);
  const [soapNote, setSoapNote]       = useState('');
  const [generating, setGenerating]   = useState(false);
  const [activeTab, setActiveTab]     = useState('roster');
  const [patientTab, setPatientTab]   = useState('overview');
  const [shareCode, setShareCode]     = useState('');
  const [loading, setLoading]         = useState(true);
  const [linkMsg, setLinkMsg]         = useState('');

  useEffect(() => { fetchPatients(); }, []);

  const fetchPatients = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('patient_psychologist')
      .select('*, patient:patient_id(id, email)')
      .eq('psychologist_id', user.id)
      .eq('active', true);
    setPatients(data || []);
    setLoading(false);
  };

  const fetchPatientData = async (patientId) => {
    const { data: s } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', patientId)
      .order('created_at', { ascending: false });

    const { data: j } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', patientId)
      .order('created_at', { ascending: false });

    setSessions(s || []);
    setJournals(j || []);
  };

  const linkPatient = async () => {
    if (!shareCode.trim()) return;
    const { data, error } = await supabase
      .from('patient_psychologist')
      .select('*')
      .eq('share_code', shareCode.trim().toUpperCase())
      .single();

    if (error || !data) {
      setLinkMsg('❌ Invalid share code. Ask patient to generate one.');
      return;
    }

    await supabase
      .from('patient_psychologist')
      .update({ psychologist_id: user.id, active: true })
      .eq('share_code', shareCode.trim().toUpperCase());

    setLinkMsg('✅ Patient linked successfully!');
    setShareCode('');
    fetchPatients();
  };

  const generateSOAP = async (session) => {
    setGenerating(true);
    setSoapNote('');
    try {
      const res = await axios.post('http://127.0.0.1:8000/generate-soap', {
        session_data: session,
        patient_concern: session.answers?.concern || '',
        interview_assessment: session.answers?.interview_assessment || ''
      });
      setSoapNote(res.data.soap_note);
    } catch {
      setSoapNote('Error generating SOAP note. Please try again.');
    }
    setGenerating(false);
  };

  const phqLevel = (s) => s <= 4  ? {label:'Minimal',  color:'#22c55e'}
    : s <= 9  ? {label:'Mild',     color:'#f59e0b'}
    : s <= 14 ? {label:'Moderate', color:'#f97316'}
    :           {label:'Severe',   color:'#ef4444'};

  const tabStyle = (tab, active) => ({
    padding:'8px 16px', border:'none', borderRadius:8,
    cursor:'pointer', fontSize:13,
    background: active === tab ? '#6366f1' : '#fff',
    color: active === tab ? '#fff' : '#64748b',
    marginRight:8, fontWeight: active === tab ? 'bold' : 'normal'
  });

  return (
    <div style={{ fontFamily:'sans-serif', minHeight:'100vh',
      background:'#f1f5f9', display:'flex' }}>

      {/* Sidebar */}
      <div style={{ width:240, background:'#1e1b4b', padding:24,
        display:'flex', flexDirection:'column', gap:8 }}>
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:20, color:'#fff', fontWeight:'bold' }}>
            🧠 PsycheFlow
          </div>
          <div style={{ fontSize:11, color:'#a5b4fc', marginTop:4 }}>
            Clinician Portal
          </div>
        </div>

        {[
          { id:'roster',    icon:'👥', label:'Patient Roster' },
          { id:'link',      icon:'🔗', label:'Link Patient' },
          { id:'analytics', icon:'📊', label:'Analytics' },
        ].map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)}
            style={{ padding:'10px 14px', borderRadius:10, border:'none',
              cursor:'pointer', textAlign:'left', fontSize:13,
              background: activeTab === item.id
                ? 'rgba(99,102,241,0.3)' : 'transparent',
              color: activeTab === item.id ? '#fff' : '#a5b4fc',
              display:'flex', alignItems:'center', gap:10 }}>
            <span>{item.icon}</span> {item.label}
          </button>
        ))}

        <div style={{ marginTop:'auto' }}>
          <div style={{ fontSize:12, color:'#a5b4fc', marginBottom:8 }}>
            {user.email}
          </div>
          <button onClick={onLogout}
            style={{ padding:'8px 14px', borderRadius:8, border:'none',
              cursor:'pointer', background:'rgba(255,255,255,0.1)',
              color:'#a5b4fc', fontSize:12, width:'100%' }}>
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex:1, padding:32, overflowY:'auto' }}>

        {/* ROSTER TAB */}
        {activeTab === 'roster' && !selected && (
          <div>
            <h2 style={{ color:'#1e293b', margin:'0 0 24px' }}>
              Patient Roster
            </h2>

            {loading ? (
              <p style={{ color:'#94a3b8' }}>Loading patients...</p>
            ) : patients.length === 0 ? (
              <div style={{ background:'#fff', borderRadius:16, padding:48,
                textAlign:'center', border:'1px solid #e2e8f0' }}>
                <div style={{ fontSize:48, marginBottom:16 }}>👥</div>
                <h3 style={{ color:'#1e293b' }}>No patients yet</h3>
                <p style={{ color:'#94a3b8' }}>
                  Link patients using their Share Code or send them an invitation.
                </p>
                <button onClick={() => setActiveTab('link')}
                  style={{ padding:'10px 24px', background:'#6366f1',
                    color:'#fff', border:'none', borderRadius:8,
                    cursor:'pointer', fontSize:14 }}>
                  Link Patient →
                </button>
              </div>
            ) : (
              <div style={{ display:'grid', gap:12 }}>
                {patients.map((p, i) => (
                  <div key={i}
                    onClick={() => {
                      setSelected(p);
                      fetchPatientData(p.patient_id);
                      setPatientTab('overview');
                    }}
                    style={{ background:'#fff', borderRadius:16, padding:20,
                      border:'1px solid #e2e8f0', cursor:'pointer',
                      display:'flex', justifyContent:'space-between',
                      alignItems:'center', transition:'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor='#6366f1'}
                    onMouseLeave={e => e.currentTarget.style.borderColor='#e2e8f0'}>
                    <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                      <div style={{ width:44, height:44, borderRadius:'50%',
                        background:'#eef2ff', display:'flex', alignItems:'center',
                        justifyContent:'center', fontSize:18 }}>
                        👤
                      </div>
                      <div>
                        <div style={{ fontWeight:'bold', color:'#1e293b' }}>
                          {p.patient?.email || 'Patient'}
                        </div>
                        <div style={{ fontSize:12, color:'#94a3b8' }}>
                          Linked {new Date(p.linked_at).toLocaleDateString('en-IN')}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize:12, color:'#6366f1' }}>
                      View Profile →
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PATIENT DETAIL VIEW */}
        {activeTab === 'roster' && selected && (
          <div>
            <div style={{ display:'flex', alignItems:'center',
              gap:16, marginBottom:24 }}>
              <button onClick={() => { setSelected(null); setSoapNote(''); }}
                style={{ padding:'6px 14px', background:'#fff',
                  border:'1px solid #e2e8f0', borderRadius:8,
                  cursor:'pointer', fontSize:13, color:'#64748b' }}>
                ← Back
              </button>
              <div>
                <h2 style={{ color:'#1e293b', margin:0 }}>
                  {selected.patient?.email}
                </h2>
                <div style={{ fontSize:12, color:'#94a3b8' }}>
                  {sessions.length} sessions · {journals.length} journal entries
                </div>
              </div>
            </div>

            {/* Patient Tabs */}
            <div style={{ marginBottom:24 }}>
              {['overview','sessions','journals','soap'].map(tab => (
                <button key={tab} style={tabStyle(tab, patientTab)}
                  onClick={() => setPatientTab(tab)}>
                  {tab === 'soap' ? 'SOAP Notes' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* OVERVIEW */}
            {patientTab === 'overview' && (
              <div>
                {sessions.length === 0 ? (
                  <div style={{ background:'#fff', borderRadius:16, padding:32,
                    textAlign:'center', border:'1px solid #e2e8f0' }}>
                    <p style={{ color:'#94a3b8' }}>
                      No assessment data yet. Ask patient to complete assessment.
                    </p>
                  </div>
                ) : (
                  <div style={{ display:'grid', gap:16 }}>
                    {/* Latest Scores */}
                    <div style={{ background:'#fff', borderRadius:16, padding:24,
                      border:'1px solid #e2e8f0' }}>
                      <h3 style={{ margin:'0 0 16px', color:'#1e293b' }}>
                        Latest Assessment
                      </h3>
                      <div style={{ display:'grid',
                        gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
                        {[
                          { label:'PHQ-9', value:sessions[0]?.phq_score,
                            level: phqLevel(sessions[0]?.phq_score||0) },
                          { label:'GAD-7', value:sessions[0]?.gad_score,
                            level: phqLevel(sessions[0]?.gad_score||0) },
                          { label:'Sessions', value:sessions.length,
                            level:{color:'#6366f1'} },
                          { label:'Journals', value:journals.length,
                            level:{color:'#6366f1'} },
                        ].map((item, i) => (
                          <div key={i} style={{ background:'#f8fafc',
                            borderRadius:12, padding:16, textAlign:'center' }}>
                            <div style={{ fontSize:24, fontWeight:'bold',
                              color:item.level.color }}>{item.value}</div>
                            <div style={{ fontSize:12, color:'#94a3b8' }}>
                              {item.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* PHQ Trend */}
                    {sessions.length > 1 && (
                      <div style={{ background:'#fff', borderRadius:16, padding:24,
                        border:'1px solid #e2e8f0' }}>
                        <h3 style={{ margin:'0 0 16px', color:'#1e293b' }}>
                          Depression Trend (PHQ-9)
                        </h3>
                        <div style={{ display:'flex', alignItems:'flex-end',
                          gap:8, height:80 }}>
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

                    {/* Latest Interview Assessment */}
                    {sessions[0]?.answers?.interview_assessment && (
                      <div style={{ background:'#f0f9ff', borderRadius:16,
                        padding:24, border:'1px solid #bae6fd' }}>
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

            {/* SESSIONS */}
            {patientTab === 'sessions' && (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {sessions.map((s, i) => (
                  <div key={i} style={{ background:'#fff', borderRadius:16,
                    padding:20, border:'1px solid #e2e8f0' }}>
                    <div style={{ display:'flex', justifyContent:'space-between',
                      marginBottom:12 }}>
                      <strong>Session {sessions.length - i}</strong>
                      <span style={{ fontSize:12, color:'#94a3b8' }}>
                        {new Date(s.created_at).toLocaleDateString('en-IN',
                          {day:'numeric',month:'short',year:'numeric'})}
                      </span>
                    </div>
                    <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                      <div style={{ background:'#f8fafc', borderRadius:8,
                        padding:'6px 14px', textAlign:'center' }}>
                        <div style={{ fontSize:18, fontWeight:'bold',
                          color:phqLevel(s.phq_score).color }}>{s.phq_score}</div>
                        <div style={{ fontSize:10, color:'#94a3b8' }}>PHQ-9</div>
                      </div>
                      <div style={{ background:'#f8fafc', borderRadius:8,
                        padding:'6px 14px', textAlign:'center' }}>
                        <div style={{ fontSize:18, fontWeight:'bold',
                          color:phqLevel(s.gad_score).color }}>{s.gad_score}</div>
                        <div style={{ fontSize:10, color:'#94a3b8' }}>GAD-7</div>
                      </div>
                    </div>
                    <button onClick={() => {
                      generateSOAP(s);
                      setPatientTab('soap');
                    }}
                      style={{ marginTop:12, padding:'6px 16px',
                        background:'#6366f1', color:'#fff', border:'none',
                        borderRadius:8, cursor:'pointer', fontSize:12 }}>
                      Generate SOAP Note
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* JOURNALS */}
            {patientTab === 'journals' && (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {journals.length === 0 ? (
                  <p style={{ color:'#94a3b8' }}>No journal entries yet.</p>
                ) : journals.map((j, i) => (
                  <div key={i} style={{ background:'#fff', borderRadius:16,
                    padding:20, border:'1px solid #e2e8f0' }}>
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
                        {Object.entries(j.analysis.risk_signals).map(([k,v]) => (
                          v !== 'none' && v !== 'low' && (
                            <span key={k} style={{ fontSize:11, padding:'2px 8px',
                              background:'#fef3c7', borderRadius:6, color:'#92400e' }}>
                              ⚠️ {k.replace(/_/g,' ')}: {v}
                            </span>
                          )
                        ))}
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

            {/* SOAP NOTES */}
            {patientTab === 'soap' && (
              <div>
                {generating ? (
                  <div style={{ background:'#fff', borderRadius:16, padding:32,
                    textAlign:'center', border:'1px solid #e2e8f0' }}>
                    <div style={{ fontSize:32, marginBottom:12 }}>⚙️</div>
                    <p style={{ color:'#6366f1' }}>Generating SOAP note...</p>
                  </div>
                ) : soapNote ? (
                  <div style={{ background:'#fff', borderRadius:16, padding:24,
                    border:'1px solid #e2e8f0' }}>
                    <h3 style={{ margin:'0 0 16px', color:'#6366f1' }}>
                      📋 SOAP Note
                    </h3>
                    <pre style={{ fontSize:13, color:'#374151', lineHeight:1.8,
                      whiteSpace:'pre-wrap', fontFamily:'sans-serif' }}>
                      {soapNote}
                    </pre>
                  </div>
                ) : (
                  <div style={{ background:'#fff', borderRadius:16, padding:32,
                    textAlign:'center', border:'1px solid #e2e8f0' }}>
                    <p style={{ color:'#94a3b8' }}>
                      Go to Sessions tab and click "Generate SOAP Note" for a session.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* LINK PATIENT TAB */}
        {activeTab === 'link' && (
          <div style={{ maxWidth:480 }}>
            <h2 style={{ color:'#1e293b', margin:'0 0 24px' }}>
              Link a Patient
            </h2>

            <div style={{ background:'#fff', borderRadius:16, padding:24,
              border:'1px solid #e2e8f0', marginBottom:20 }}>
              <h3 style={{ margin:'0 0 8px', color:'#1e293b' }}>
                Enter Patient Share Code
              </h3>
              <p style={{ fontSize:13, color:'#94a3b8', marginBottom:16 }}>
                Ask your patient to generate a Share Code from their dashboard
                and enter it below.
              </p>
              <input
                value={shareCode}
                onChange={e => setShareCode(e.target.value.toUpperCase())}
                placeholder="e.g. ABC12345"
                style={{ width:'100%', padding:'12px 16px', borderRadius:8,
                  border:'1px solid #e2e8f0', fontSize:16, letterSpacing:4,
                  boxSizing:'border-box', marginBottom:12 }}
              />
              {linkMsg && (
                <p style={{ fontSize:13, color: linkMsg.startsWith('✅')
                  ? '#16a34a' : '#dc2626', marginBottom:12 }}>{linkMsg}</p>
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

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div>
            <h2 style={{ color:'#1e293b', margin:'0 0 24px' }}>Analytics</h2>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr',
              gap:16, marginBottom:24 }}>
              {[
                { label:'Total Patients',  value: patients.length,  icon:'👥' },
                { label:'Total Sessions',  value: '—',              icon:'📋' },
                { label:'High Risk Cases', value: '—',              icon:'🚨' },
              ].map((card, i) => (
                <div key={i} style={{ background:'#fff', borderRadius:16,
                  padding:20, border:'1px solid #e2e8f0', textAlign:'center' }}>
                  <div style={{ fontSize:32, marginBottom:8 }}>{card.icon}</div>
                  <div style={{ fontSize:28, fontWeight:'bold', color:'#6366f1' }}>
                    {card.value}
                  </div>
                  <div style={{ fontSize:13, color:'#94a3b8' }}>{card.label}</div>
                </div>
              ))}
            </div>
            <div style={{ background:'#fff', borderRadius:16, padding:24,
              border:'1px solid #e2e8f0', textAlign:'center' }}>
              <div style={{ fontSize:32, marginBottom:12 }}>📊</div>
              <h3 style={{ color:'#1e293b' }}>Power BI Integration</h3>
              <p style={{ color:'#94a3b8', fontSize:13 }}>
                Connect your Supabase database to Power BI for advanced analytics.
                <br/>Connection string available in Settings.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}