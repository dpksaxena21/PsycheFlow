import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabase';
import axios from 'axios';
import { AutoSaveIndicator, useAutoSave } from './useAutoSave';
const API = 'https://web-production-3887e.up.railway.app';

const NOTE_TEMPLATES = {
  SOAP: `SUBJECTIVE:\n\nOBJECTIVE:\nPHQ-9: \nGAD-7: \nMood: \n\nASSESSMENT:\n\nPLAN:\n`,
  DAP: `DATA:\n\nASSESSMENT:\n\nPLAN:\n`,
  BIRP: `BEHAVIOR:\n\nINTERVENTION:\n\nRESPONSE:\n\nPLAN:\n`,
};

export default function PP_SessionWorkspace({ patients, user, S, card, Badge }) {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [noteType, setNoteType] = useState('SOAP');
  const [notes, setNotes] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [homework, setHomework] = useState('');
  const [riskLevel, setRiskLevel] = useState('low');
  const [saved, setSaved] = useState(false);
  const timerRef = useRef();
  const notesRef = useRef(notes);
  notesRef.current = notes;

  // Auto-save notes
  const saveNotes = async (content) => {
    if (!selectedPatient || !content.trim()) return;
    await supabase.from('clinical_notes').upsert({
      psychologist_id: user.id, patient_id: selectedPatient.id,
      content, note_type: noteType, updated_at: new Date().toISOString()
    });
  };
  const { status: saveStatus } = useAutoSave(notes, saveNotes, 2000);

  // Session timer
  useEffect(() => {
    if (sessionStarted) {
      timerRef.current = setInterval(() => setSessionDuration(d => d + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [sessionStarted]);

  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const askAI = async (q) => {
    if (!q.trim()) return;
    setAiLoading(true);
    setAiResponse('');
    try {
      const ctx = selectedPatient ? `Patient: ${selectedPatient.display_name||selectedPatient.full_name}, PHQ-9: ${selectedPatient.latest?.phq_score}, GAD-7: ${selectedPatient.latest?.gad_score}, Risk: ${selectedPatient.riskLevel}, Sessions: ${selectedPatient.sessions?.length}` : '';
      const res = await axios.post(API + '/chatbot', { messages: [{ role: 'user', content: q + (ctx ? `\n\nPatient context: ${ctx}` : '') }], user_id: user.id, context: { role: 'psychologist_session' } });
      setAiResponse(res.data.response);
    } catch { setAiResponse('AI unavailable. Check connection.'); }
    setAiLoading(false);
  };

  const generateSOAP = async () => {
    if (!selectedPatient) return;
    setAiLoading(true);
    try {
      const res = await axios.post(API + '/generate-soap', {
        patient_name: selectedPatient.display_name || selectedPatient.full_name,
        phq_score: selectedPatient.latest?.phq_score,
        gad_score: selectedPatient.latest?.gad_score,
        session_notes: notes,
        psychologist_id: user.id,
      });
      setNotes(res.data.soap_note || notes);
    } catch { setAiResponse('SOAP generation failed.'); }
    setAiLoading(false);
  };

  const endSession = async () => {
    if (!selectedPatient) return;
    await supabase.from('appointments').insert({
      patient_id: selectedPatient.id, psychologist_id: user.id,
      status: 'completed', duration: Math.floor(sessionDuration/60),
      notes: notes, homework, scheduled_at: new Date().toISOString(),
    });
    setSaved(true);
    setSessionStarted(false);
  };

  if (!sessionStarted && !selectedPatient) return (
    <div>
      <h2 style={{ margin: '0 0 20px', color: S.navy, fontSize: 20, fontWeight: 700 }}>Session Workspace</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        {patients.slice(0, 6).map(p => (
          <div key={p.id} onClick={() => { setSelectedPatient(p); setNotes(NOTE_TEMPLATES[noteType]); }} style={{ ...card, cursor: 'pointer', borderLeft: `3px solid ${p.riskLevel === 'critical' ? S.danger : p.riskLevel === 'high' ? S.warning : S.success}` }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = ''}>
            <div style={{ fontSize: 14, fontWeight: 700, color: S.navy, marginBottom: 4 }}>{p.display_name || p.full_name}</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
              <Badge color={p.riskLevel === 'critical' ? 'red' : p.riskLevel === 'high' ? 'yellow' : 'green'}>{p.riskLevel}</Badge>
            </div>
            <div style={{ fontSize: 11, color: S.muted }}>PHQ: {p.latest?.phq_score ?? '—'} · GAD: {p.latest?.gad_score ?? '—'}</div>
            <button style={{ marginTop: 10, width: '100%', padding: '7px', background: S.blue, color: '#fff', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Start Session</button>
          </div>
        ))}
        {patients.length === 0 && <div style={{ ...card, gridColumn: '1/-1', textAlign: 'center', padding: 48, color: S.muted }}>No patients linked. Link patients first.</div>}
      </div>
    </div>
  );

  if (saved) return (
    <div style={{ ...card, textAlign: 'center', padding: 60 }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: S.navy, marginBottom: 8 }}>Session Complete</div>
      <div style={{ fontSize: 13, color: S.muted, marginBottom: 20 }}>Duration: {formatTime(sessionDuration)} · Notes saved · Homework assigned</div>
      <button onClick={() => { setSaved(false); setSelectedPatient(null); setNotes(''); setSessionDuration(0); }} style={{ padding: '10px 24px', background: S.blue, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>New Session</button>
    </div>
  );

  return (
    <div>
      {/* Session header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setSelectedPatient(null)} style={{ padding: '6px 12px', background: S.bg, border: `0.5px solid ${S.border}`, borderRadius: 7, fontSize: 12, cursor: 'pointer', color: S.muted }}>← Back</button>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: S.navy }}>{selectedPatient?.display_name || selectedPatient?.full_name}</div>
            <div style={{ fontSize: 11, color: S.muted }}>PHQ-9: {selectedPatient?.latest?.phq_score ?? '—'} · GAD-7: {selectedPatient?.latest?.gad_score ?? '—'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AutoSaveIndicator status={saveStatus}/>
          {sessionStarted && <div style={{ padding: '6px 14px', background: '#FEF2F2', color: S.danger, borderRadius: 8, fontSize: 13, fontWeight: 700, fontFamily: 'monospace' }}>{formatTime(sessionDuration)}</div>}
          {!sessionStarted ? (
            <button onClick={() => setSessionStarted(true)} style={{ padding: '8px 18px', background: S.success, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Start Session</button>
          ) : (
            <button onClick={endSession} style={{ padding: '8px 18px', background: S.danger, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>End & Save</button>
          )}
        </div>
      </div>

      {/* 3-panel split layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 280px', gap: 16, minHeight: '70vh' }}>

        {/* Left: Patient Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ ...card }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Patient Summary</div>
            {[['Risk', selectedPatient?.riskLevel, selectedPatient?.riskLevel === 'critical' ? S.danger : selectedPatient?.riskLevel === 'high' ? S.warning : S.success],
              ['PHQ-9', selectedPatient?.latest?.phq_score ?? '—', S.navy],
              ['GAD-7', selectedPatient?.latest?.gad_score ?? '—', S.navy],
              ['Sessions', selectedPatient?.sessions?.length ?? 0, S.blue],
              ['Journals', selectedPatient?.journals?.length ?? 0, S.cyan],
              ['Trend', selectedPatient?.phqTrend ?? 'unknown', selectedPatient?.phqTrend === 'improving' ? S.success : selectedPatient?.phqTrend === 'deteriorating' ? S.danger : S.muted],
            ].map(([label, val, color]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `0.5px solid ${S.border}` }}>
                <span style={{ fontSize: 12, color: S.muted }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color, textTransform: 'capitalize' }}>{val}</span>
              </div>
            ))}
          </div>

          {/* Risk level selector */}
          <div style={{ ...card }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Session Risk Assessment</div>
            {['low', 'moderate', 'high', 'critical'].map(r => (
              <div key={r} onClick={() => setRiskLevel(r)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 6, cursor: 'pointer', marginBottom: 4, background: riskLevel === r ? (r === 'critical' ? '#FEF2F2' : r === 'high' ? '#FFFBEB' : r === 'moderate' ? '#FFFBF0' : '#ECFDF5') : 'transparent' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: r === 'critical' ? S.danger : r === 'high' ? S.warning : r === 'moderate' ? '#F59E0B' : S.success }}/>
                <span style={{ fontSize: 12, fontWeight: riskLevel === r ? 700 : 400, color: S.navy, textTransform: 'capitalize' }}>{r}</span>
                {riskLevel === r && <svg style={{ marginLeft: 'auto' }} width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
            ))}
          </div>

          {/* Latest journal */}
          {selectedPatient?.journals?.[0] && (
            <div style={{ ...card }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Latest Journal</div>
              <div style={{ fontSize: 12, color: S.navy, lineHeight: 1.6 }}>{selectedPatient.journals[0].text?.slice(0, 150)}...</div>
              <div style={{ fontSize: 10, color: S.muted, marginTop: 6 }}>{new Date(selectedPatient.journals[0].created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
            </div>
          )}
        </div>

        {/* Center: Notes */}
        <div style={{ ...card, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {Object.keys(NOTE_TEMPLATES).map(type => (
                <button key={type} onClick={() => { setNoteType(type); if (!notes.trim()) setNotes(NOTE_TEMPLATES[type]); }} style={{ padding: '5px 12px', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: noteType === type ? 700 : 400, background: noteType === type ? S.blue : S.bg, color: noteType === type ? '#fff' : S.muted, cursor: 'pointer' }}>{type}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <AutoSaveIndicator status={saveStatus}/>
              <button onClick={generateSOAP} disabled={aiLoading} style={{ padding: '5px 10px', background: S.lightBlue, color: S.blue, border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>AI Generate</button>
            </div>
          </div>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            style={{ flex: 1, width: '100%', padding: '12px', borderRadius: 8, border: `0.5px solid ${S.border}`, fontSize: 13, lineHeight: 1.8, resize: 'none', outline: 'none', fontFamily: "'Satoshi',-apple-system,sans-serif", background: S.bg, color: S.navy, minHeight: 300, boxSizing: 'border-box' }}
            placeholder={NOTE_TEMPLATES[noteType]}/>
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: S.muted, marginBottom: 6 }}>Homework / Follow-up</div>
            <textarea value={homework} onChange={e => setHomework(e.target.value)} rows={3}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: `0.5px solid ${S.border}`, fontSize: 12, resize: 'none', outline: 'none', fontFamily: "'Satoshi',-apple-system,sans-serif", background: S.bg, color: S.navy, boxSizing: 'border-box' }}
              placeholder="Assign homework, exercises, or follow-up tasks..."/>
          </div>
        </div>

        {/* Right: AI Copilot */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ ...card, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: S.navy, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="10" rx="2" stroke={S.blue} strokeWidth="1.5"/><path d="M9 11V7a3 3 0 016 0v4" stroke={S.blue} strokeWidth="1.5" strokeLinecap="round"/><circle cx="9" cy="16" r="1" fill={S.blue}/><circle cx="15" cy="16" r="1" fill={S.blue}/></svg>
              AI Clinical Copilot
            </div>
            <div style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
              {['Summarize patient history', 'Suggest session focus', 'Identify risk factors', 'Generate treatment plan', 'Suggest intervention', 'Detect cognitive distortions'].map(q => (
                <button key={q} onClick={() => { setAiQuery(q); askAI(q); }}
                  style={{ padding: '7px 10px', background: S.bg, color: S.muted, border: `0.5px solid ${S.border}`, borderRadius: 7, fontSize: 11, cursor: 'pointer', textAlign: 'left' }}
                  onMouseEnter={e => { e.currentTarget.style.background = S.lightBlue; e.currentTarget.style.color = S.blue; }}
                  onMouseLeave={e => { e.currentTarget.style.background = S.bg; e.currentTarget.style.color = S.muted; }}>
                  {q}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              <input value={aiQuery} onChange={e => setAiQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && askAI(aiQuery)}
                placeholder="Ask about this patient..."
                style={{ flex: 1, padding: '7px 10px', borderRadius: 7, border: `0.5px solid ${S.border}`, fontSize: 12, outline: 'none', background: S.bg, color: S.navy }}/>
              <button onClick={() => askAI(aiQuery)} disabled={aiLoading} style={{ padding: '7px 12px', background: S.blue, color: '#fff', border: 'none', borderRadius: 7, fontSize: 12, cursor: 'pointer' }}>→</button>
            </div>
            {aiLoading && <div style={{ fontSize: 12, color: S.muted, padding: '8px 0' }}>Analyzing...</div>}
            {aiResponse && (
              <div style={{ background: S.lightBlue, borderRadius: 8, padding: '10px 12px', fontSize: 12, color: S.navy, lineHeight: 1.7, overflowY: 'auto', maxHeight: 200 }}>
                {aiResponse}
              </div>
            )}
          </div>

          {/* Intervention Library */}
          <div style={{ ...card }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Interventions</div>
            {[['CBT', 'Cognitive restructuring'],['ACT', 'Acceptance & commitment'],['DBT', 'Dialectical behavior'],['Mindfulness', 'Present moment awareness'],['Somatic', 'Body-based techniques']].map(([name, desc]) => (
              <div key={name} onClick={() => { setAiQuery(`Explain ${name} technique for this session`); askAI(`Explain ${name} technique and specific exercises for a patient with PHQ-9: ${selectedPatient?.latest?.phq_score}, GAD-7: ${selectedPatient?.latest?.gad_score}`); }}
                style={{ padding: '7px 0', borderBottom: `0.5px solid ${S.border}`, cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = S.lightBlue}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ fontSize: 12, fontWeight: 600, color: S.blue }}>{name}</div>
                <div style={{ fontSize: 10, color: S.muted }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
