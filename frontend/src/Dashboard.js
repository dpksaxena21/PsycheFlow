import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabase';
import Appointments from './Appointments';
import Messages from './Messages';
import MoodCheckIn from './MoodCheckIn';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const bigFive = ['Extraversion','Neuroticism','Agreeableness','Conscientiousness','Openness'];
const colorMap = { High:'#ef4444', Medium:'#f59e0b', Low:'#22c55e' };

const phqLevel = (s) => s<=4?{label:'Minimal',color:'#15803D'}:s<=9?{label:'Mild',color:'#CA8A04'}:s<=14?{label:'Moderate',color:'#EA580C'}:{label:'Severe',color:'#DC2626'};

const useIsMobile = () => {
  const [m, setM] = React.useState(window.innerWidth < 768);
  React.useEffect(() => {
    const h = () => setM(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return m;
};

function useTheme() {
  const [dark, setDark] = useState(() => localStorage.getItem('pf-theme') === 'dark');
  const toggle = () => setDark(d => {
    const next = !d;
    localStorage.setItem('pf-theme', next ? 'dark' : 'light');
    return next;
  });
  return [dark, toggle];
}

const T = (dark) => ({
  bg: dark ? '#0A0F1E' : '#F8FAFF',
  bg2: dark ? '#111827' : '#FFFFFF',
  bg3: dark ? '#1E2A3B' : '#EFF6FF',
  text: dark ? '#F0F6FF' : '#0C1A2E',
  text2: dark ? '#7BA3CC' : '#3B5998',
  text3: dark ? '#4B6A8A' : '#94a3b8',
  border: dark ? '#1E2A3B' : '#E2EBF6',
  blue: dark ? '#3B82F6' : '#1D4ED8',
  blue2: dark ? '#1E2A3B' : '#EFF6FF',
  card: dark ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 4px rgba(29,78,216,0.06)',
  danger: dark ? '#FCA5A5' : '#DC2626',
  dangerBg: dark ? '#450A0A' : '#FEF2F2',
});

// Custom mood SVGs
const MoodFaces = {
  great: (c) => <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="13" stroke={c} strokeWidth="1.4"/><circle cx="12" cy="13" r="1.2" fill={c}/><circle cx="20" cy="13" r="1.2" fill={c}/><path d="M11 18C11 18 12.5 21 16 21C19.5 21 21 18 21 18" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><path d="M13 11C13 11 14 10 16 10C18 10 19 11 19 11" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/></svg>,
  good: (c) => <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="13" stroke={c} strokeWidth="1.4"/><circle cx="12" cy="13.5" r="1.2" fill={c}/><circle cx="20" cy="13.5" r="1.2" fill={c}/><path d="M12 18.5C12 18.5 13.5 20.5 16 20.5C18.5 20.5 20 18.5 20 18.5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>,
  okay: (c) => <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="13" stroke={c} strokeWidth="1.4"/><circle cx="12" cy="13.5" r="1.2" fill={c}/><circle cx="20" cy="13.5" r="1.2" fill={c}/><path d="M12 19.5H20" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>,
  low: (c) => <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="13" stroke={c} strokeWidth="1.4"/><circle cx="12" cy="13.5" r="1.2" fill={c}/><circle cx="20" cy="13.5" r="1.2" fill={c}/><path d="M12 20.5C12 20.5 13.5 18 16 18C18.5 18 20 20.5 20 20.5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>,
  anxious: (c) => <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="13" stroke={c} strokeWidth="1.4"/><path d="M10.5 11.5C11 10.5 12 10 13 10.5" stroke={c} strokeWidth="1.2" strokeLinecap="round"/><path d="M19 10.5C20 10 21 10.5 21.5 11.5" stroke={c} strokeWidth="1.2" strokeLinecap="round"/><circle cx="12" cy="13.5" r="1.2" fill={c}/><circle cx="20" cy="13.5" r="1.2" fill={c}/><path d="M12 19.5C12.8 18.5 14 19 15 18.5C16 18 17 18.5 18 18C19 17.5 20 18.5 20 19.5" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg>,
};

// Nav icons
const Icons = {
  overview: (c) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="6" height="6" rx="1.5" fill={c} opacity="0.9"/><rect x="10" y="2" width="6" height="6" rx="1.5" fill={c} opacity="0.4"/><rect x="2" y="10" width="6" height="6" rx="1.5" fill={c} opacity="0.4"/><rect x="10" y="10" width="6" height="6" rx="1.5" fill={c} opacity="0.6"/></svg>,
  assessment: (c) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><ellipse cx="9" cy="7" rx="5" ry="4" stroke={c} strokeWidth="1.4"/><path d="M4 7C4 9.5 2.5 11 2.5 11C2.5 13.5 5.5 15 9 15C12.5 15 15.5 13.5 15.5 11C15.5 11 14 9.5 14 7" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><circle cx="9" cy="8" r="2" fill={c}/></svg>,
  journal: (c) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="3" y="2" width="12" height="14" rx="2" stroke={c} strokeWidth="1.4"/><path d="M6 6H12M6 9H10M6 12H8" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>,
  therapy: (c) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 15C9 15 4 11.5 4 7C4 4.8 6.2 3 9 3C11.8 3 14 4.8 14 7C14 11.5 9 15 9 15Z" stroke={c} strokeWidth="1.4"/><path d="M6.5 7.5C6.5 7.5 7.3 9 9 9C10.7 9 11.5 7.5 11.5 7.5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>,
  messages: (c) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="5" width="14" height="10" rx="3" stroke={c} strokeWidth="1.4"/><path d="M5 9H13M5 12H9" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>,
  appointments: (c) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="4" width="14" height="12" rx="2" stroke={c} strokeWidth="1.4"/><path d="M6 2V5M12 2V5M2 8H16" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><rect x="6" y="10" width="6" height="3" rx="1" fill={c} opacity="0.4"/></svg>,
  share: (c) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="14" cy="4" r="2" stroke={c} strokeWidth="1.4"/><circle cx="4" cy="9" r="2" stroke={c} strokeWidth="1.4"/><circle cx="14" cy="14" r="2" stroke={c} strokeWidth="1.4"/><path d="M6 8L12 5M6 10L12 13" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>,
  sun: (c) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="3.5" stroke={c} strokeWidth="1.4"/><path d="M9 2V3.5M9 14.5V16M2 9H3.5M14.5 9H16M4 4L5 5M13 13L14 14M4 14L5 13M13 5L14 4" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>,
  moon: (c) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M15 10C14 12.5 11.5 14 8.5 14C5.2 14 2.5 11.3 2.5 8C2.5 5 4 2.5 6.5 1.5C4.5 3 3.5 5 3.5 7.5C3.5 11 6.5 14 10 14C11.8 14 13.5 13.3 14.8 12.1" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>,
  signout: (c) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 9H3M3 9L6 6M3 9L6 12M9 5V3H15V15H9V13" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  bell: (c) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2C8 2 4 4 4 9V11L2 13H14L12 11V9C12 4 8 2 8 2Z" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/><path d="M6 13C6 14.1 6.9 15 8 15C9.1 15 10 14.1 10 13" stroke={c} strokeWidth="1.3"/></svg>,
  plus: (c) => <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 2V11M2 6.5H11" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>,
  send: (c) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M14 2L2 7L7 9L9 14L14 2Z" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  bot: (c) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="5" width="12" height="9" rx="3" stroke={c} strokeWidth="1.3"/><path d="M5.5 9H6.5M9.5 9H10.5" stroke={c} strokeWidth="1.3" strokeLinecap="round"/><path d="M8 5V3M6 3H10" stroke={c} strokeWidth="1.3" strokeLinecap="round"/><path d="M5 14V16M11 14V16" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg>,
};

// AI Chatbot with anti-hallucination
function Chatbot({ user, psychologistId, t, appointments, dark, sessions, journals, profile }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    { role: 'assistant', text: 'Hi! I\'m your PsycheFlow assistant. I can help you schedule appointments, check availability, and answer questions about your care. How can I help?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const getSystemContext = () => {
    const now = new Date();
    const dayOfWeek = now.toLocaleDateString('en-IN', { weekday: 'long' });
    const date = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const time = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const aptList = appointments.length > 0
      ? appointments.map(a => `- ${new Date(a.scheduled_at).toLocaleString('en-IN')} (${a.status})`).join('\n')
      : 'No appointments scheduled yet.';

    return `You are PsycheFlow's scheduling assistant. Today is ${dayOfWeek}, ${date} at ${time} IST.

STRICT RULES — never violate:
1. Clinic hours: Monday to Saturday, 9:00 AM to 6:00 PM IST only.
2. If today is Sunday OR time is outside 9AM-6PM, the clinic is CLOSED. Say so explicitly.
3. NEVER confirm appointment availability without checking the schedule below.
4. NEVER make up doctor names, slots, or information not provided.
5. If you don't know something, say "I don't have that information" — never guess.
6. Only schedule appointments for weekdays 9AM-6PM in 30-min slots.

USER'S EXISTING APPOINTMENTS:
${aptList}

PSYCHOLOGIST LINKED: ${psychologistId ? 'Yes — Dr. Priya Sharma' : 'Not yet linked to a psychologist.'}

You can: check availability, suggest slots, confirm bookings (tell user to use Appointments tab), answer questions about PsycheFlow features. You cannot: access external systems, make medical diagnoses, prescribe medications.`;
  };
  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    const newMsgs = [...msgs, { role: 'user', text: userMsg }];
    setMsgs(newMsgs);
    setLoading(true);
    try {
      const history = newMsgs.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.text }));
      const res = await axios.post(`${API}/chatbot`, {
        messages: history,
        user_id: user?.id || '',
        context: {
          // User identity
          user_name: profile?.display_name || user?.email?.split('@')[0] || 'User',
          user_email: user?.email || '',
          user_concerns: profile?.concerns || [],
          user_goals: profile?.goals || [],
          user_urgency: profile?.urgency || 'stable',

          // Assessment scores from latest session
          phq_score: sessions?.[0]?.phq_score ?? null,
          gad_score: sessions?.[0]?.gad_score ?? null,
          total_sessions: sessions?.length || 0,
          last_session_date: sessions?.[0]?.created_at ? new Date(sessions[0].created_at).toLocaleDateString('en-IN') : null,
          personality: sessions?.[0]?.predictions ? Object.entries(sessions[0].predictions).slice(0,5).map(([k,v]) => `${k}: ${v.label}`).join(', ') : null,

          // Psychologist info
          has_psychologist: !!psychologistId,
          psychologist_name: psychologistId ? 'Dr. Priya Sharma' : null,
          psychologist_id: psychologistId || null,

          // Appointments
          appointments: appointments.slice(0,5).map(a => ({
            date: new Date(a.scheduled_at).toLocaleDateString('en-IN'),
            time: new Date(a.scheduled_at).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}),
            status: a.status,
            notes: a.notes || null
          })),

          // Journal
          total_journals: journals?.length || 0,
          latest_mood: journals?.[0]?.analysis?.emotions?.primary || null,
          latest_journal_date: journals?.[0]?.created_at ? new Date(journals[0].created_at).toLocaleDateString('en-IN') : null,
        }
      });
      const reply = res.data?.response || 'I am having trouble responding right now.';
      setMsgs(m => [...m, { role: 'assistant', text: reply }]);
    } catch {
      setMsgs(m => [...m, { role: 'assistant', text: 'Sorry, I am offline right now. Please try again.' }]);
    }
    setLoading(false);
  };

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{
      position: 'fixed', bottom: 88, right: 24, width: 48, height: 48,
      borderRadius: '50%', background: t.blue, border: 'none', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 4px 16px rgba(29,78,216,0.3)', zIndex: 50
    }}>
      {Icons.bot('#fff')}
    </button>
  );

  return (
    <div style={{
      position: 'fixed', bottom: 88, right: 24, width: 320, height: 440,
      background: t.bg2, borderRadius: 16, border: `0.5px solid ${t.border}`,
      boxShadow: '0 8px 32px rgba(0,0,0,0.15)', zIndex: 50,
      display: 'flex', flexDirection: 'column', overflow: 'hidden'
    }}>
      <div style={{ padding: '12px 16px', borderBottom: `0.5px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: t.blue }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {Icons.bot('#fff')}
          <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>PsycheFlow Assistant</span>
        </div>
        <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '80%', padding: '8px 12px', borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
              background: m.role === 'user' ? t.blue : t.bg3,
              color: m.role === 'user' ? '#fff' : t.text,
              fontSize: 12, lineHeight: 1.6
            }}>{m.text}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ background: t.bg3, padding: '8px 12px', borderRadius: '12px 12px 12px 2px', fontSize: 12, color: t.text3 }}>Thinking...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ padding: 10, borderTop: `0.5px solid ${t.border}`, display: 'flex', gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask about appointments..."
          style={{ flex: 1, padding: '8px 12px', border: `0.5px solid ${t.border}`, borderRadius: 8, fontSize: 12, background: t.bg3, color: t.text, outline: 'none', fontFamily: 'inherit' }}
        />
        <button onClick={send} style={{ width: 34, height: 34, borderRadius: 8, background: t.blue, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {Icons.send('#fff')}
        </button>
      </div>
    </div>
  );
}

function ShareCodeSection({ userId, t }) {
  const [shareCode, setShareCode] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from('patient_psychologist').select('share_code').eq('patient_id', userId).eq('active', true).order('linked_at', { ascending: false }).limit(1)
      .then(({ data }) => { if (data?.length) setShareCode(data[0].share_code); });
  }, []);

  const generateCode = async () => {
    setLoading(true);
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    const { error } = await supabase.from('patient_psychologist').insert({ patient_id: userId, share_code: code, active: true });
    if (!error) setShareCode(code);
    setLoading(false);
  };

  return (
    <div style={{ background: t.bg2, borderRadius: 12, padding: 16, border: `0.5px solid ${t.border}` }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: t.text3, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 10 }}>Link your psychologist</div>
      {shareCode ? (
        <div>
          <div style={{ background: t.bg3, borderRadius: 8, padding: 14, textAlign: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: 6, color: t.blue, fontFamily: 'monospace' }}>{shareCode}</div>
            <div style={{ fontSize: 11, color: t.text3, marginTop: 4 }}>Share with your psychologist</div>
          </div>
          <button onClick={generateCode} style={{ fontSize: 11, color: t.text2, background: 'none', border: `0.5px solid ${t.border}`, padding: '6px 12px', borderRadius: 6, cursor: 'pointer' }}>Generate new code</button>
        </div>
      ) : (
        <button onClick={generateCode} disabled={loading} style={{ background: t.blue, color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          {loading ? 'Generating...' : 'Generate share code'}
        </button>
      )}
    </div>
  );
}

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview' },
  { id: 'assessment', label: 'Assessment' },
  { id: 'journal', label: 'Journal' },
  { id: 'therapy', label: 'Therapy' },
  { id: 'messages', label: 'Messages' },
  { id: 'appointments', label: 'Appointments' },
  { id: 'share', label: 'Share code' },
];

const MOOD_ITEMS = [
  { id: 'great', label: 'Great' },
  { id: 'good', label: 'Good' },
  { id: 'okay', label: 'Okay' },
  { id: 'low', label: 'Low' },
  { id: 'anxious', label: 'Anxious' },
];

export default function Dashboard({ user, profile, onStartAssessment, onLogout, onPsychologistMode, onACTEngine, onCrisis }) {
  const [dark, toggleDark] = useTheme();
  const t = T(dark);
  const isMobile = useIsMobile();
  const [tab, setTab] = useState('overview');
  const [sessions, setSessions] = useState([]);
  const [journals, setJournals] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [psychologistId, setPsychologistId] = useState(null);
  const [psychologistContact, setPsychologistContact] = useState([]);
  const [mood, setMood] = useState(null);
  const [sideExpanded, setSideExpanded] = useState(false);
  const [sidePinned, setSidePinned] = useState(false);
  const [moodSaved, setMoodSaved] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: s }, { data: j }, { data: a }, { data: link }] = await Promise.all([
      supabase.from('sessions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('journal_entries').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('appointments').select('*').eq('patient_id', user.id).order('scheduled_at', { ascending: true }),
      supabase.from('patient_psychologist').select('psychologist_id').eq('patient_id', user.id).eq('active', true).not('psychologist_id', 'is', null).neq('psychologist_id', user.id).limit(1).maybeSingle(),
    ]);
    setSessions(s || []);
    setJournals(j || []);
    setAppointments(a || []);
    if (link?.psychologist_id) {
      setPsychologistId(link.psychologist_id);
      setPsychologistContact([{ id: link.psychologist_id, name: 'My Psychologist', role: 'psychologist' }]);
    }
    setLoading(false);
  };

  const saveMood = async (m) => {
    setMood(m);
    await supabase.from('mood_checkins').insert({ user_id: user.id, mood: m, label: m, emoji: m, color: '#1D4ED8', created_at: new Date().toISOString() });
    setMoodSaved(true);
  };

  const latest = sessions[0];
  const name = profile?.display_name || user.email?.split('@')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const sideStyle = (id) => ({
    width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', background: tab === id ? t.blue2 : 'transparent', border: 'none',
    color: tab === id ? t.blue : t.text3, position: 'relative', transition: 'all 0.15s',
  });

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.bg, fontFamily: "'Satoshi',-apple-system,sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${t.blue}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ color: t.text3, fontSize: 13 }}>Loading your data...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: t.bg, fontFamily: "'Satoshi',-apple-system,sans-serif", display: 'grid', gridTemplateColumns: isMobile ? '1fr' : `${sideExpanded?200:64}px 1fr`, transition: 'background 0.3s' }}>

      {/* Sidebar — hidden on mobile */}
      {!isMobile && <nav onMouseEnter={()=>setSideExpanded(true)} onMouseLeave={()=>{if(!sidePinned)setSideExpanded(false)}} onClick={()=>{setSidePinned(p=>!p)}} style={{ background: t.bg2, borderRight: `0.5px solid ${t.border}`, display: 'flex', flexDirection: 'column', alignItems: sideExpanded?'flex-start':'center', padding: '16px 0', gap: 4, position: 'sticky', top: 0, height: '100vh', zIndex: 10, width: sideExpanded?200:64, transition:'width 0.2s ease', overflow:'hidden' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16, padding: sideExpanded?'0 12px':'0', width:'100%' }}>
          <div style={{ width:36, height:36, borderRadius:10, background:t.blue, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2C10 2 5 5.5 5 10.5C5 13.2 7.2 15.5 10 15.5C12.8 15.5 15 13.2 15 10.5C15 5.5 10 2 10 2Z" fill="white" opacity="0.9"/><circle cx="10" cy="10.5" r="2.5" fill="#0C1A2E"/></svg>
          </div>
          {sideExpanded && <span style={{fontSize:14, fontWeight:700, color:t.text, letterSpacing:'-0.02em', whiteSpace:'nowrap'}}>PsycheFlow</span>}
        </div>

        {NAV_ITEMS.map(item => (
          <div key={item.id} title={item.label} onClick={(e)=>{e.stopPropagation();setTab(item.id)}} style={{...sideStyle(item.id), width: sideExpanded?'calc(100% - 16px)':'40px', justifyContent:'flex-start', padding: sideExpanded?'0 12px':'0', gap:10}}>
            <div style={{flexShrink:0}}>{Icons[item.id] ? Icons[item.id](tab === item.id ? t.blue : t.text3) : null}</div>
            {sideExpanded && <span style={{fontSize:13, fontWeight: tab===item.id?600:400, color: tab===item.id?t.blue:t.text2, whiteSpace:'nowrap'}}>{item.label}</span>}
          </div>
        ))}

        <div style={{ width: 32, height: 0.5, background: t.border, margin: '6px 0' }} />

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 32, height: 0.5, background: t.border, marginBottom: 4 }} />
          <div title="Toggle theme" onClick={(e)=>{e.stopPropagation();toggleDark()}} style={{...sideStyle('theme'), color:t.text3, width:sideExpanded?'calc(100% - 16px)':'40px', justifyContent:'flex-start', padding:sideExpanded?'0 12px':'0', gap:10}}>
            <div style={{flexShrink:0}}>{dark ? Icons.sun(t.text3) : Icons.moon(t.text3)}</div>
            {sideExpanded && <span style={{fontSize:13, color:t.text2, whiteSpace:'nowrap'}}>{dark?'Light mode':'Dark mode'}</span>}
          </div>
          <div title="Sign out" onClick={(e)=>{e.stopPropagation();onLogout()}} style={{...sideStyle('signout'), color:t.text3, width:sideExpanded?'calc(100% - 16px)':'40px', justifyContent:'flex-start', padding:sideExpanded?'0 12px':'0', gap:10}}>
            <div style={{flexShrink:0}}>{Icons.signout(t.text3)}</div>
            {sideExpanded && <span style={{fontSize:13, color:t.text2, whiteSpace:'nowrap'}}>Sign out</span>}
          </div>
        </div>
      </nav>}

      {/* Main */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Topbar */}
        <div style={{ background: t.bg2, borderBottom: `0.5px solid ${t.border}`, padding: isMobile ? '12px 16px' : '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 9 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em', color: t.text }}>{greeting}, {name}</div>
            <div style={{ fontSize: 11, color: t.text3, marginTop: 1 }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              {sessions.length > 0 && ` · ${sessions.length} sessions`}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: t.bg3, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {Icons.bell(t.text2)}
            </div>
            {onPsychologistMode && (
              <button onClick={onPsychologistMode} style={{ padding: '8px 14px', borderRadius: 8, border: `0.5px solid ${t.border}`, background: t.bg3, color: t.text2, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                Clinician view
              </button>
            )}
            <button onClick={onStartAssessment} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: t.blue, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
              {Icons.plus('#fff')} Assessment
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: isMobile ? '16px 12px 80px' : '20px 24px', overflowY: 'auto', flex: 1 }}>

          {/* OVERVIEW */}
          {tab === 'overview' && (
            <div>
              {/* Health rings */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
                {[
                  { label: 'Wellbeing', val: '75', sub: '↑ 12 this week', color: t.blue, pct: 75 },
                  { label: 'Depression', val: `PHQ ${latest?.phq_score ?? '-'}`, sub: latest ? phqLevel(latest.phq_score).label : 'No data', color: latest ? phqLevel(latest.phq_score).color : t.text3, pct: latest ? (latest.phq_score / 27) * 100 : 0 },
                  { label: 'Anxiety', val: `GAD ${latest?.gad_score ?? '-'}`, sub: latest ? phqLevel(latest.gad_score).label : 'No data', color: '#0891B2', pct: latest ? (latest.gad_score / 21) * 100 : 0 },
                ].map((ring, i) => {
                  const r = 18, circ = 2 * Math.PI * r;
                  const offset = circ - (ring.pct / 100) * circ;
                  return (
                    <div key={i} style={{ background: t.bg2, borderRadius: 12, border: `0.5px solid ${t.border}`, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: t.card }}>
                      <div style={{ position: 'relative', width: 44, height: 44, flexShrink: 0 }}>
                        <svg width="44" height="44" viewBox="0 0 44 44">
                          <circle cx="22" cy="22" r={r} fill="none" stroke={t.border} strokeWidth="4" />
                          <circle cx="22" cy="22" r={r} fill="none" stroke={ring.color} strokeWidth="4" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 22 22)" />
                        </svg>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: ring.color }}>{Math.round(ring.pct)}%</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: t.text3, marginBottom: 2 }}>{ring.label}</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: ring.color, letterSpacing: '-0.02em' }}>{ring.val}</div>
                        <div style={{ fontSize: 9, color: t.text2, marginTop: 1 }}>{ring.sub}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 12 }}>

                {/* Mood */}
                <div style={{ background: t.bg2, borderRadius: 12, border: `0.5px solid ${t.border}`, padding: 16, boxShadow: t.card }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: t.text3, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 12 }}>Mood today</div>
                  {moodSaved ? (
                    <div style={{ textAlign: 'center', padding: '12px 0' }}>
                      <div style={{ marginBottom: 6 }}>{MoodFaces[mood] ? MoodFaces[mood](t.blue) : null}</div>
                      <div style={{ fontSize: 12, color: t.blue, fontWeight: 500, textTransform: 'capitalize' }}>{mood} — logged</div>
                      <div style={{ fontSize: 10, color: t.text3, marginTop: 4 }}>Check in again tomorrow</div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6, marginBottom: 10 }}>
                        {MOOD_ITEMS.map(m => (
                          <div key={m.id} onClick={() => saveMood(m.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '8px 4px', borderRadius: 10, border: `0.5px solid ${mood === m.id ? t.blue : t.border}`, background: mood === m.id ? t.blue2 : t.bg2, cursor: 'pointer', transition: 'all 0.15s' }}>
                            {MoodFaces[m.id](mood === m.id ? t.blue : t.text3)}
                            <span style={{ fontSize: 9, fontWeight: 500, color: mood === m.id ? t.blue : t.text3 }}>{m.label}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ fontSize: 11, color: t.text3, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: t.blue }} />
                        Tap to log your mood
                      </div>
                    </div>
                  )}
                </div>

                {/* PHQ trend */}
                <div style={{ background: t.bg2, borderRadius: 12, border: `0.5px solid ${t.border}`, padding: 16, boxShadow: t.card }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: t.text3, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Depression trend</div>
                    <span style={{ fontSize: 10, color: t.blue, fontWeight: 500 }}>PHQ-9</span>
                  </div>
                  {sessions.length > 0 ? (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 56, marginBottom: 6 }}>
                        {[...sessions].reverse().slice(-7).map((s, i) => {
                          const h = Math.max((s.phq_score / 27) * 56, 4);
                          const col = phqLevel(s.phq_score).color;
                          return <div key={i} style={{ flex: 1, height: h, background: col, borderRadius: '3px 3px 0 0', opacity: 0.7 + i * 0.04 }} />;
                        })}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 9, color: t.text3 }}>Earliest</span>
                        <span style={{ fontSize: 10, color: t.blue, fontWeight: 600 }}>Now: {latest?.phq_score ?? '-'} — {latest ? phqLevel(latest.phq_score).label : ''}</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.text3, fontSize: 12 }}>Complete an assessment first</div>
                  )}
                </div>

                {/* AI Brief */}
                <div style={{ background: t.bg2, borderRadius: 12, border: `0.5px solid ${t.border}`, padding: 16, gridColumn: '1/-1', boxShadow: t.card }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: t.text3, letterSpacing: '0.04em', textTransform: 'uppercase' }}>AI pre-session brief</div>
                    <span style={{ fontSize: 10, color: t.text3 }}>Auto-generated</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 8, marginBottom: 10 }}>
                    {[
                      { label: 'Status', val: latest ? (latest.phq_score <= 9 ? '● Low risk' : latest.phq_score <= 14 ? '● Medium risk' : '● High risk') : 'No data', col: latest ? phqLevel(latest.phq_score).color : t.text3 },
                      { label: 'Sessions', val: `${sessions.length} completed`, col: t.text },
                      { label: 'Last check-in', val: latest ? new Date(latest.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Never', col: t.text },
                    ].map((c, i) => (
                      <div key={i} style={{ padding: '8px 10px', borderRadius: 8, background: t.bg3 }}>
                        <div style={{ fontSize: 9, fontWeight: 600, color: t.text3, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 3 }}>{c.label}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: c.col }}>{c.val}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: '10px 12px', background: t.blue2, borderRadius: 8, fontSize: 12, color: t.text2, lineHeight: 1.6, borderLeft: `2px solid ${t.blue}` }}>
                    {sessions.length > 0
                      ? `${sessions.length} sessions completed. Latest PHQ-9: ${latest?.phq_score ?? '-'} (${latest ? phqLevel(latest.phq_score).label : ''}). ${sessions.length > 1 ? `Trend: ${latest?.phq_score < sessions[1]?.phq_score ? 'improving' : latest?.phq_score > sessions[1]?.phq_score ? 'worsening' : 'stable'}.` : ''} Continue monitoring and maintain current therapy plan.`
                      : 'No sessions yet. Complete your first assessment to build your psychological profile.'}
                  </div>
                </div>

                {/* Care team */}
                <div style={{ background: t.bg2, borderRadius: 12, border: `0.5px solid ${t.border}`, padding: 16, boxShadow: t.card }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: t.text3, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Care team</div>
                    <span onClick={() => setTab('share')} style={{ fontSize: 10, color: t.blue, fontWeight: 500, cursor: 'pointer' }}>+ Add</span>
                  </div>
                  <div>
                    {[
                      { initials: psychologistId ? 'PS' : '?', name: psychologistId ? 'Dr. Priya Sharma' : 'No psychologist linked', role: psychologistId ? 'Clinical Psychologist · Linked' : 'Generate a share code to link', bg: t.blue2, color: t.blue },
                      { initials: 'AI', name: 'Dr. PsycheFlow', role: 'AI Therapist · Always available', bg: dark ? '#1A2E1A' : '#F0FDF4', color: '#15803D' },
                    ].map((m, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i === 0 ? `0.5px solid ${t.border}` : 'none' }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: m.bg, color: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{m.initials}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 500, color: t.text }}>{m.name}</div>
                          <div style={{ fontSize: 10, color: t.text3 }}>{m.role}</div>
                        </div>
                        <button onClick={() => setTab('messages')} style={{ width: 28, height: 28, borderRadius: 7, background: t.bg3, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.text2 }}>
                          {Icons.messages(t.text2)}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next appointment */}
                <div style={{ background: t.bg2, borderRadius: 12, border: `0.5px solid ${t.border}`, padding: 16, boxShadow: t.card }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: t.text3, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Next appointment</div>
                    <span onClick={() => setTab('appointments')} style={{ fontSize: 10, color: t.blue, fontWeight: 500, cursor: 'pointer' }}>Book</span>
                  </div>
                  {appointments.filter(a => a.status === 'scheduled' && new Date(a.scheduled_at) > new Date()).length > 0 ? (
                    (() => {
                      const next = appointments.filter(a => a.status === 'scheduled' && new Date(a.scheduled_at) > new Date())[0];
                      const d = new Date(next.scheduled_at);
                      return (
                        <div style={{ padding: 12, background: t.bg3, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 38, height: 38, borderRadius: 8, background: t.blue2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: t.blue, lineHeight: 1 }}>{d.getDate()}</div>
                            <div style={{ fontSize: 8, color: t.blue, fontWeight: 500 }}>{d.toLocaleString('en-IN', { month: 'short' }).toUpperCase()}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 500, color: t.text }}>Session with Dr. Priya</div>
                            <div style={{ fontSize: 10, color: t.text3, marginTop: 1 }}>{d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} · 50 min</div>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div style={{ padding: 12, background: t.bg3, borderRadius: 8, textAlign: 'center' }}>
                      <div style={{ fontSize: 12, color: t.text3, marginBottom: 8 }}>No upcoming appointments</div>
                      <button onClick={() => setTab('appointments')} style={{ fontSize: 11, color: t.blue, background: t.blue2, border: 'none', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit' }}>Book a session</button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* ASSESSMENT */}
          {tab === 'assessment' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
                {[
                  { title: 'AI Clinical Interview', desc: 'Conversational assessment with Dr. PsycheFlow. 15 turns, 14 clinical domains. Most accurate.', action: onStartAssessment, tag: 'Recommended' },
                  { title: 'Structured Assessment', desc: 'PHQ-9, GAD-7, Big Five, Dark Triad, OCD, PTSD, ADHD, Burnout. 14 validated instruments.', action: onStartAssessment, tag: '14 instruments' },
                  { title: 'ACT Therapy', desc: 'Acceptance & Commitment Therapy exercises. Build psychological flexibility.', action: onACTEngine, tag: '16 exercises' },
                  { title: 'Quick Mood Check', desc: 'Log your mood and get a personalized insight in under 2 minutes.', action: () => setTab('overview'), tag: '2 min' },
                ].map((c, i) => (
                  <div key={i} onClick={c.action} style={{ background: t.bg2, borderRadius: 12, border: `0.5px solid ${t.border}`, padding: 20, cursor: 'pointer', transition: 'all 0.15s', boxShadow: t.card }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 4px 16px rgba(29,78,216,0.12)`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = t.card; }}>
                    <div style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 100, background: t.blue2, color: t.blue, fontSize: 10, fontWeight: 600, marginBottom: 12 }}>{c.tag}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 6, letterSpacing: '-0.01em' }}>{c.title}</div>
                    <div style={{ fontSize: 12, color: t.text2, lineHeight: 1.6 }}>{c.desc}</div>
                  </div>
                ))}
              </div>
              {sessions.length > 0 && (
                <div style={{ marginTop: 16, background: t.bg2, borderRadius: 12, border: `0.5px solid ${t.border}`, padding: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: t.text3, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 12 }}>Session history</div>
                  {sessions.slice(0, 5).map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < 4 ? `0.5px solid ${t.border}` : 'none' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: t.blue2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: t.blue, flexShrink: 0 }}>{sessions.length - i}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 500, color: t.text }}>Session {sessions.length - i}</div>
                        <div style={{ fontSize: 10, color: t.text3 }}>{new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: phqLevel(s.phq_score).color }}>PHQ {s.phq_score}</div>
                        <div style={{ fontSize: 10, color: t.text3 }}>GAD {s.gad_score}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* JOURNAL */}
          {tab === 'journal' && (
            <div>
              {journals.length === 0 ? (
                <div style={{ background: t.bg2, borderRadius: 12, border: `0.5px solid ${t.border}`, padding: 40, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, color: t.text3 }}>No journal entries yet. Complete an assessment to create your first entry.</div>
                </div>
              ) : journals.map((j, i) => (
                <div key={i} style={{ background: t.bg2, borderRadius: 12, border: `0.5px solid ${t.border}`, padding: 16, marginBottom: 10, boxShadow: t.card }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: t.blue, textTransform: 'capitalize' }}>{j.analysis?.emotions?.primary || 'Entry'} · {j.analysis?.emotions?.intensity || ''}</div>
                    <span style={{ fontSize: 10, color: t.text3 }}>{new Date(j.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  <p style={{ fontSize: 12, color: t.text2, fontStyle: 'italic', lineHeight: 1.6, marginBottom: 8 }}>"{j.text?.slice(0, 180)}..."</p>
                  {j.analysis?.clinical_summary && (
                    <div style={{ fontSize: 11, color: t.text2, background: t.bg3, padding: '8px 12px', borderRadius: 8, lineHeight: 1.6 }}>{j.analysis.clinical_summary}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* THERAPY */}
          {tab === 'therapy' && (
            <div>
              <div style={{ background: t.bg2, borderRadius: 12, border: `0.5px solid ${t.border}`, padding: 24, textAlign: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 8 }}>ACT Therapy Engine</div>
                <div style={{ fontSize: 12, color: t.text2, marginBottom: 16, lineHeight: 1.6 }}>16 evidence-based exercises. Acceptance & Commitment Therapy with personalized JITAI recommendations.</div>
                <button onClick={onACTEngine} style={{ background: t.blue, color: '#fff', border: 'none', padding: '11px 24px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Open ACT Engine</button>
              </div>
            </div>
          )}

          {/* MESSAGES */}
          {tab === 'messages' && <Messages user={user} contacts={psychologistContact} />}

          {/* APPOINTMENTS */}
          {tab === 'appointments' && <Appointments user={user} psychologistId={psychologistId} />}

          {/* SHARE */}
          {tab === 'share' && <ShareCodeSection userId={user.id} t={t} />}

        </div>
      </div>

      {/* Floating crisis button */}
      <button onClick={onCrisis} style={{
        position: 'fixed', bottom: isMobile ? 76 : 24, right: 16, padding: '10px 18px',
        borderRadius: 100, background: t.dangerBg, color: t.danger,
        border: `1px solid ${t.danger}`, fontSize: 13, fontWeight: 600,
        cursor: 'pointer', fontFamily: 'inherit', zIndex: 40,
        boxShadow: '0 2px 12px rgba(220,38,38,0.2)'
      }}>
        SOS Crisis
      </button>

      {/* Chatbot */}
      <Chatbot user={user} psychologistId={psychologistId} t={t} appointments={appointments} dark={dark} sessions={sessions} journals={journals} profile={profile} />

      {/* Mobile bottom tab bar */}
      {isMobile && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
          background: t.bg2, borderTop: `0.5px solid ${t.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-around',
          padding: '8px 0 12px', paddingBottom: 'calc(8px + env(safe-area-inset-bottom))',
        }}>
          {NAV_ITEMS.slice(0, 5).map(item => (
            <div key={item.id} onClick={() => setTab(item.id)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer', minWidth: 52, padding: '4px 0' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: tab === item.id ? t.blue2 : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}>
                {Icons[item.id] ? Icons[item.id](tab === item.id ? t.blue : t.text3) : null}
              </div>
              <span style={{ fontSize: 9, fontWeight: tab === item.id ? 600 : 400, color: tab === item.id ? t.blue : t.text3 }}>
                {item.label}
              </span>
            </div>
          ))}
          <div onClick={toggleDark}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer', minWidth: 52, padding: '4px 0' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {dark ? Icons.sun(t.text3) : Icons.moon(t.text3)}
            </div>
            <span style={{ fontSize: 9, color: t.text3 }}>{dark ? 'Light' : 'Dark'}</span>
          </div>
        </div>
      )}

      <style>{\`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { transition: background-color 0.2s, border-color 0.2s, color 0.2s; }
      \`}</style>
    </div>
  );
}
