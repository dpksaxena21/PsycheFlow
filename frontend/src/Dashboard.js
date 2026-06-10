import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from './supabase';
import axios from 'axios';
import { calcWellnessScore, calcRiskLevel, severity, ScoreChange, SparkLine, WellnessRing, AchievementBadge, ClinicalScoreCards } from './DashboardWidgets';
import GlobalSearch from './GlobalSearch';
import NotificationCenter from './NotificationCenter';
import QuickCreate from './QuickCreate';
import Breadcrumbs from './Breadcrumbs';
import { useAutoSave, AutoSaveIndicator } from './useAutoSave';
import { useKeyboardNav } from './useKeyboardNav';

import { API_URL as API } from './config';

// ── Theme ──────────────────────────────────────────────
const useIsMobile = () => {
  const [m, setM] = React.useState(window.innerWidth < 768);
  useEffect(() => { const h = () => setM(window.innerWidth < 768); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h); }, []);
  return m;
};
const useTheme = () => {
  const [dark, setDark] = useState(() => localStorage.getItem('pf-theme') === 'dark');
  const toggle = () => { const n = !dark; setDark(n); localStorage.setItem('pf-theme', n ? 'dark' : 'light'); };
  return [dark, toggle];
};
const T = (dark) => ({
  bg: dark ? '#0C1A2E' : '#F8FAFF',
  bg2: dark ? '#0F2444' : '#FFFFFF',
  bg3: dark ? '#1a3a6b' : '#EFF6FF',
  text: dark ? '#F1F5F9' : '#0C1A2E',
  text2: dark ? '#CBD5E1' : '#3B5998',
  text3: dark ? '#64748B' : '#94a3b8',
  border: dark ? '#1e3a5f' : '#E2EBF6',
  blue: '#1D4ED8',
  blue2: dark ? 'rgba(29,78,216,0.15)' : '#EFF6FF',
  danger: '#DC2626',
  warning: '#D97706',
  success: '#059669',
  cyan: '#0891B2',
  purple: '#7C3AED',
});

// ── Icons ──────────────────────────────────────────────
const Icons = {
  overview: c => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 22V12h6v10" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  wellness: c => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402C1 3.335 4.198 1 7.5 1c1.988 0 4.063.992 4.5 2.5C12.437 1.992 14.512 1 16.5 1 19.8 1 23 3.335 23 7.191c0 4.105-5.369 8.863-11 14.402z" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  clinical: c => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  insights: c => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="6" r="2" stroke={c} strokeWidth="1.5"/><circle cx="4" cy="18" r="2" stroke={c} strokeWidth="1.5"/><circle cx="20" cy="18" r="2" stroke={c} strokeWidth="1.5"/><path d="M12 8v3M12 11l-6 5M12 11l6 5" stroke={c} strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="12" r="1.5" fill={c}/></svg>,
  journal: c => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 7h6M9 11h4" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>,
  therapy: c => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  assessment: c => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 11l3 3L22 4" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  profile: c => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke={c} strokeWidth="1.5"/><path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>,
  messages: c => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  appointments: c => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke={c} strokeWidth="1.5"/><path d="M16 2v4M8 2v4M3 10h18" stroke={c} strokeWidth="1.5" strokeLinecap="round"/><circle cx="8" cy="15" r="1" fill={c}/><circle cx="12" cy="15" r="1" fill={c}/><circle cx="16" cy="15" r="1" fill={c}/></svg>,
  share: c => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="18" cy="5" r="3" stroke={c} strokeWidth="1.5"/><circle cx="6" cy="12" r="3" stroke={c} strokeWidth="1.5"/><circle cx="18" cy="19" r="3" stroke={c} strokeWidth="1.5"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke={c} strokeWidth="1.5"/></svg>,
  sun: c => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="5" stroke={c} strokeWidth="1.5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>,
  moon: c => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  signout: c => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  plus: c => <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  bell: c => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  crisis: c => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke={c} strokeWidth="1.5"/><line x1="12" y1="9" x2="12" y2="13" stroke={c} strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="17" r="1" fill={c}/></svg>,
};

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview' },
  { id: 'wellness', label: 'Wellness' },
  { id: 'clinical', label: 'Clinical' },
  { id: 'insights', label: 'AI Insights' },
  { id: 'journal', label: 'Journal' },
  { id: 'therapy', label: 'Therapy' },
  { id: 'assessment', label: 'Assessments' },
  { id: 'profile', label: 'My Profile' },
  { id: 'messages', label: 'Messages' },
  { id: 'appointments', label: 'Appointments' },
  { id: 'share', label: 'Share Code' },
];

// ── Chatbot ────────────────────────────────────────────
function Chatbot({ user, t }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ role: 'assistant', content: 'Hi! I\'m Dr. PsycheFlow. How are you feeling today?' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);
  const send = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMsgs(m => [...m, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await axios.post(API + '/chatbot', { message: input, user_id: user.id, context: {} });
      setMsgs(m => [...m, { role: 'assistant', content: res.data.response }]);
    } catch { setMsgs(m => [...m, { role: 'assistant', content: 'Sorry, I\'m having trouble connecting.' }]); }
    setLoading(false);
  };
  if (!open) return (
    <button onClick={() => setOpen(true)} style={{ position: 'fixed', bottom: 88, right: 20, width: 48, height: 48, borderRadius: '50%', background: t.blue, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(29,78,216,0.4)', zIndex: 40 }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </button>
  );
  return (
    <div style={{ position: 'fixed', bottom: 88, right: 16, width: 320, height: 440, background: t.bg2, borderRadius: 16, border: `0.5px solid ${t.border}`, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', zIndex: 40 }}>
      <div style={{ padding: '12px 14px', borderBottom: `0.5px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>Dr. PsycheFlow</div>
        <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.text3, fontSize: 18 }}>×</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ maxWidth: '82%', padding: '8px 12px', borderRadius: m.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px', background: m.role === 'user' ? t.blue : t.bg3, color: m.role === 'user' ? '#fff' : t.text, fontSize: 12, lineHeight: 1.5 }}>{m.content}</div>
          </div>
        ))}
        {loading && <div style={{ fontSize: 11, color: t.text3 }}>Thinking...</div>}
        <div ref={bottomRef}/>
      </div>
      <div style={{ padding: '8px 10px', borderTop: `0.5px solid ${t.border}`, display: 'flex', gap: 6 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Ask about appointments..." style={{ flex: 1, padding: '7px 10px', borderRadius: 8, border: `0.5px solid ${t.border}`, background: t.bg, color: t.text, fontSize: 12, outline: 'none' }}/>
        <button onClick={send} disabled={loading || !input.trim()} style={{ padding: '7px 12px', background: t.blue, color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>→</button>
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────
export default function Dashboard({ user, profile, onStartAssessment, onLogout, onPsychologistMode, onACTEngine, onCrisis }) {
  const [dark, toggleDark] = useTheme();
  const t = T(dark);
  const isMobile = useIsMobile();
  const [tab, setTab] = useState('overview');
  useKeyboardNav(setTab, NAV_ITEMS);
  const [sessions, setSessions] = useState([]);
  const [journals, setJournals] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [psychologistId, setPsychologistId] = useState(null);
  const [psychologistContact, setPsychologistContact] = useState([]);
  const [mood, setMood] = useState(null);
  const [moodSaved, setMoodSaved] = useState(false);
  const [sideExpanded, setSideExpanded] = useState(false);
  const [sidePinned, setSidePinned] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [shareCode, setShareCode] = useState(null);
  const [hospitalRecords, setHospitalRecords] = useState(null);
  const [journalText, setJournalText] = useState('');
  const [journalAnalysis, setJournalAnalysis] = useState(null);
  const [journalDraft, setJournalDraft] = useState(() => localStorage.getItem('pf-journal-draft') || '');
  const [journalLoading, setJournalLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [lifeScores, setLifeScores] = useState({ work:5, relationships:7, family:6, health:6, finances:5, selfEsteem:6, purpose:7 });

  const name = profile?.display_name || profile?.full_name || user?.email?.split('@')[0] || 'there';
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';

  const buildNotifications = useCallback((s, a, j) => {
    const notifs = [];
    if (s.length > 0) {
      const latest = s[0];
      if (latest.phq_score > 14) notifs.push({ id: 'phq_' + latest.id, type: 'alert', title: 'High PHQ-9 score', body: `Score: ${latest.phq_score} — consider contacting your psychologist` });
      if (s.length >= 2) {
        const diff = s[0].phq_score - s[1].phq_score;
        if (diff >= 5) notifs.push({ id: 'spike_' + s[0].id, type: 'alert', title: `PHQ-9 spike: +${diff} points`, body: 'Significant worsening since last session' });
        if (diff <= -5) notifs.push({ id: 'imp_' + s[0].id, type: 'success', title: `PHQ-9 improved: ${Math.abs(diff)} points`, body: 'Great progress!' });
      }
    }
    const upcoming = a.filter(ap => ap.status === 'scheduled' && new Date(ap.scheduled_at) > new Date());
    if (upcoming.length > 0) {
      const next = upcoming[0];
      notifs.push({ id: 'appt_' + next.id, type: 'info', title: 'Upcoming session', body: new Date(next.scheduled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) });
    }
    if (j.length > 0) notifs.push({ id: 'jour_' + j[0].id, type: 'info', title: 'Journal analyzed', body: j[0].analysis?.emotions?.primary || 'New entry' });
    setNotifications(notifs);
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: s }, { data: j }, { data: a }, { data: link }] = await Promise.all([
        supabase.from('sessions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
        supabase.from('journal_entries').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
        supabase.from('appointments').select('*').eq('patient_id', user.id).order('scheduled_at', { ascending: true }),
        supabase.from('patient_psychologist').select('psychologist_id').eq('patient_id', user.id).eq('active', true).not('psychologist_id', 'is', null).neq('psychologist_id', user.id).limit(1).maybeSingle(),
      ]);
      setSessions(s || []);
      setJournals(j || []);
      setAppointments(a || []);
      if (link?.psychologist_id) {
        setPsychologistId(link.psychologist_id);
        const { data: pData } = await supabase.from('profiles').select('display_name, full_name').eq('id', link.psychologist_id).single();
        setPsychologistContact([{ id: link.psychologist_id, name: pData?.display_name || pData?.full_name || 'My Psychologist', role: 'psychologist' }]);
        // Load messages
        const { data: msgs } = await supabase.from('messages').select('*').or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`).order('created_at', { ascending: false }).limit(50);
        setMessages(msgs || []);
      }
      buildNotifications(s || [], a || [], j || []);
    } catch (e) {  }
    setLoading(false);
  }, [user.id, buildNotifications]);

  useEffect(() => { fetchAll(); loadHospitalRecords(); }, [fetchAll]);

  const loadHospitalRecords = async () => {
    try {
      const { data: pat } = await supabase.from('hospital_patients').select('*, hospitals(name, city)').eq('platform_user_id', user.id);
      if (pat?.length) {
        const { data: ehr } = await supabase.from('ehr_records').select('*').in('patient_id', pat.map(p => p.id)).order('created_at', { ascending: false }).limit(5);
        setHospitalRecords({ patients: pat, ehr: ehr || [] });
      }
    } catch {}
  };

  const saveMood = async (m) => {
    setMood(m);
    await supabase.from('mood_checkins').insert({ user_id: user.id, mood: m, created_at: new Date().toISOString() });
    setMoodSaved(true);
  };

  const analyzeJournal = async () => {
    if (journalText.trim().length < 20) return;
    setJournalLoading(true);
    try {
      const res = await axios.post(API + '/analyze-journal', { text: journalText });
      setJournalAnalysis(res.data);
      await supabase.from('journal_entries').insert({ user_id: user.id, text: journalText, analysis: res.data });
      setJournalText('');
      fetchAll();
    } catch { alert('Journal analysis failed'); }
    setJournalLoading(false);
  };

  const sendMessage = async () => {
    if (!newMsg.trim() || !psychologistId) return;
    await supabase.from('messages').insert({ sender_id: user.id, receiver_id: psychologistId, content: newMsg, read: false });
    setNewMsg('');
    fetchAll();
  };

  const generateShareCode = async () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    await supabase.from('patient_psychologist').insert({ patient_id: user.id, share_code: code, active: true });
    setShareCode(code);
  };

  // Computed values
  const wellnessScore = calcWellnessScore(sessions, journals, mood);
  const riskLevel = calcRiskLevel(sessions);
  const latest = sessions[0];
  const phqSeverity = latest ? severity(latest.phq_score, 27) : null;
  const gadSeverity = latest ? severity(latest.gad_score, 21) : null;
  const streakDays = Math.min(sessions.length * 3 + journals.length, 30);
  const achievements = [
    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2c0 0-1 3-1 6s1 4 1 4 1-1 1-4-1-6-1-6z" fill="#F97316"/><path d="M12 12c-3 0-5 2-5 4s2 3 5 3 5-1 5-3-2-4-5-4z" fill="#FB923C" opacity="0.6"/><circle cx="12" cy="10" r="2" fill="#FED7AA"/></svg>, label: '7 Day Streak', earned: streakDays >= 7 },
    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="4" y="3" width="13" height="18" rx="2" stroke="#1D4ED8" strokeWidth="1.5"/><path d="M8 8h7M8 12h7M8 16h4" stroke="#1D4ED8" strokeWidth="1.5" strokeLinecap="round"/><path d="M17 3v18" stroke="#1D4ED8" strokeWidth="1.5" strokeLinecap="round"/></svg>, label: 'Journal Master', earned: journals.length >= 5 },
    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="3" stroke="#059669" strokeWidth="1.5"/><path d="M7 12l4 4 6-7" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>, label: 'Assessment Pro', earned: sessions.length >= 3 },
    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 3c-1.5 0-3 1-3 3s1.5 3 3 3 3-1 3-3-1.5-3-3-3z" stroke="#7C3AED" strokeWidth="1.5"/><path d="M12 9v12M9 18h6" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round"/><path d="M6 14c0-2 2-4 6-4s6 2 6 4" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round"/></svg>, label: 'Mindful', earned: sessions.length >= 1 },
    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M6 4h3v16H6zM15 4h3v16h-3z" fill="none" stroke="#0891B2" strokeWidth="1.5" strokeLinecap="round"/><path d="M9 12h6" stroke="#0891B2" strokeWidth="1.5" strokeLinecap="round"/></svg>, label: 'Consistent', earned: sessions.length >= 5 },
  ];

  const sideStyle = (id) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: 40, borderRadius: 8, cursor: 'pointer', marginLeft: 8,
    background: tab === id ? t.blue2 : 'transparent',
    color: tab === id ? t.blue : t.text3,
  });

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.bg, fontFamily: "'Satoshi',-apple-system,sans-serif", flexDirection: 'column', gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${t.blue}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }}/>
      <div style={{ fontSize: 13, color: t.text3 }}>Loading your data...</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: t.bg, fontFamily: "'Satoshi',-apple-system,sans-serif", display: 'grid', gridTemplateColumns: isMobile ? '1fr' : `${sideExpanded ? 200 : 64}px 1fr`, transition: 'background 0.3s' }}>

      {/* Sidebar */}
      {!isMobile && (
        <nav onMouseEnter={() => setSideExpanded(true)} onMouseLeave={() => { if (!sidePinned) setSideExpanded(false); }} onClick={() => setSidePinned(p => !p)}
          style={{ background: t.bg2, borderRight: `0.5px solid ${t.border}`, display: 'flex', flexDirection: 'column', alignItems: sideExpanded ? 'flex-start' : 'center', padding: '16px 0', gap: 4, position: 'sticky', top: 0, height: '100vh', zIndex: 10, width: sideExpanded ? 200 : 64, transition: 'width 0.2s ease', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: sideExpanded ? '0 12px' : '0', width: '100%' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: t.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2C10 2 5 5.5 5 10.5C5 13.2 7.2 15.5 10 15.5C12.8 15.5 15 13.2 15 10.5C15 5.5 10 2 10 2Z" fill="white" opacity="0.9"/><circle cx="10" cy="10.5" r="2.5" fill="#0C1A2E"/></svg>
            </div>
            {sideExpanded && <span style={{ fontSize: 14, fontWeight: 700, color: t.text, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>PsycheFlow</span>}
          </div>
          {NAV_ITEMS.map(item => (
            <div key={item.id} title={item.label} onClick={(e) => { e.stopPropagation(); setTab(item.id); }}
              style={{ ...sideStyle(item.id), width: sideExpanded ? 'calc(100% - 16px)' : '40px', justifyContent: 'flex-start', padding: sideExpanded ? '0 12px' : '0', gap: 10 }}>
              <div style={{ flexShrink: 0 }}>{Icons[item.id] ? Icons[item.id](tab === item.id ? t.blue : t.text3) : Icons.overview(tab === item.id ? t.blue : t.text3)}</div>
              {sideExpanded && <span style={{ fontSize: 13, fontWeight: tab === item.id ? 600 : 400, color: tab === item.id ? t.blue : t.text2, whiteSpace: 'nowrap' }}>{item.label}</span>}
            </div>
          ))}
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 32, height: 0.5, background: t.border, marginBottom: 4 }}/>
            <div title="Toggle theme" onClick={(e) => { e.stopPropagation(); toggleDark(); }} style={{ ...sideStyle('theme'), color: t.text3, width: sideExpanded ? 'calc(100% - 16px)' : '40px', justifyContent: 'flex-start', padding: sideExpanded ? '0 12px' : '0', gap: 10 }}>
              <div style={{ flexShrink: 0 }}>{dark ? Icons.sun(t.text3) : Icons.moon(t.text3)}</div>
              {sideExpanded && <span style={{ fontSize: 13, color: t.text2, whiteSpace: 'nowrap' }}>{dark ? 'Light mode' : 'Dark mode'}</span>}
            </div>
            <div title="Sign out" onClick={(e) => { e.stopPropagation(); onLogout(); }} style={{ ...sideStyle('signout'), color: t.text3, width: sideExpanded ? 'calc(100% - 16px)' : '40px', justifyContent: 'flex-start', padding: sideExpanded ? '0 12px' : '0', gap: 10 }}>
              <div style={{ flexShrink: 0 }}>{Icons.signout(t.text3)}</div>
              {sideExpanded && <span style={{ fontSize: 13, color: t.text2, whiteSpace: 'nowrap' }}>Sign out</span>}
            </div>
          </div>
        </nav>
      )}

      {/* Main */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <div style={{ background: t.bg2, borderBottom: `0.5px solid ${t.border}`, padding: isMobile ? '0 12px' : '0 24px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 9, height: 64, flexShrink: 0 }}>
          {/* Logo on mobile */}
          {isMobile && (
            <div style={{ width: 30, height: 30, borderRadius: 8, background: t.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C9 1.5 4 5 4 10C4 12.8 6.2 15 9 15C11.8 15 14 12.8 14 10C14 5 9 1.5 9 1.5Z" fill="white" opacity="0.9"/><circle cx="9" cy="10" r="2.2" fill="#0C1A2E"/></svg>
            </div>
          )}
          {/* Global search */}
          {!isMobile && <GlobalSearch user={user} t={t} onNavigate={setTab}/>}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* SOS - single floating action on mobile, button on desktop */}
            {!isMobile && <button onClick={onCrisis} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: `0.5px solid ${t.danger}`, background: 'transparent', color: t.danger, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              {Icons.crisis(t.danger)} SOS
            </button>}
            {/* Notifications */}
            <NotificationCenter notifications={notifications.map(n => ({ ...n, category: n.type === 'alert' ? 'Clinical' : n.type === 'success' ? 'Clinical' : 'Appointments' }))} t={t} onNavigate={setTab}/>
            {/* Quick create */}
            {!isMobile && <QuickCreate t={t} actions={[
              { label: 'Start Assessment', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M9 11l3 3L22 4" stroke={t.blue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>, onClick: onStartAssessment },
              { label: 'Write in Journal', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke={t.blue} strokeWidth="1.5" strokeLinecap="round"/></svg>, onClick: () => setTab('journal') },
              { label: 'Book Appointment', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke={t.blue} strokeWidth="1.5"/><path d="M3 10h18" stroke={t.blue} strokeWidth="1.5" strokeLinecap="round"/></svg>, onClick: () => setTab('appointments') },
              { label: 'ACT Exercise', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78" stroke={t.blue} strokeWidth="1.5" strokeLinecap="round"/></svg>, onClick: onACTEngine },
            ]}/>}
            {onPsychologistMode && !isMobile && (
              <button onClick={onPsychologistMode} style={{ padding: '6px 12px', borderRadius: 8, border: `0.5px solid ${t.border}`, background: t.bg3, color: t.text2, fontSize: 11, fontWeight: 500, cursor: 'pointer' }}>Clinician view</button>
            )}
            {/* Profile avatar */}
            <div onClick={onLogout} title="Sign out" style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg,${t.blue},${t.cyan})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', flexShrink: 0 }}>
              {name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: isMobile ? '16px 12px 80px' : '20px 24px', overflowY: 'auto', flex: 1 }}>

          {/* ── OVERVIEW ─────────────────────────────── */}
          {tab === 'overview' && (
            <div>
              <Breadcrumbs items={[{ label: 'Dashboard' }, { label: 'Overview' }]} t={t}/>
              {/* Hero: Wellness Command Center */}
              <div style={{ background: `linear-gradient(135deg, ${t.bg2}, ${dark ? '#0d2847' : '#EFF6FF'})`, borderRadius: 16, padding: isMobile ? '20px 16px' : '24px 28px', marginBottom: 20, border: `0.5px solid ${t.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: t.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Mental Health Command Center</div>
                    <div style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, color: t.text, letterSpacing: '-0.03em', marginBottom: 16 }}>
                      {greeting}, {name}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 10 }}>
                      {[
                        { label: 'Wellness Score', value: wellnessScore ? `${wellnessScore}/100` : '—', color: wellnessScore >= 70 ? t.success : wellnessScore >= 40 ? t.warning : t.danger, tab: 'wellness' },
                        { label: 'Risk Level', value: riskLevel.level, color: riskLevel.color, tab: 'clinical' },
                        { label: 'Assessments', value: sessions.length, color: t.blue, tab: 'assessment' },
                        { label: 'Journal Entries', value: journals.length, color: t.cyan, tab: 'journal' },
                      ].map((stat, i) => (
                        <div key={i} onClick={() => setTab(stat.tab)} style={{ background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)', borderRadius: 10, padding: '10px 14px', backdropFilter: 'blur(4px)', cursor: 'pointer', transition: 'transform 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                          onMouseLeave={e => e.currentTarget.style.transform = ''}>
                          <div style={{ fontSize: 18, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                          <div style={{ fontSize: 10, color: t.text3, marginTop: 2 }}>{stat.label}</div>
                          <div style={{ fontSize: 9, color: t.text3, marginTop: 3, opacity: 0.7 }}>Tap to explore →</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Wellness ring */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ position: 'relative', width: 88, height: 88 }}>
                      <WellnessRing score={wellnessScore || 0} size={88} color={wellnessScore >= 70 ? t.success : wellnessScore >= 40 ? t.warning : t.danger}/>
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: t.text }}>{wellnessScore || '—'}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 10, color: t.text3 }}>Wellness Index</div>
                  </div>
                </div>
              </div>

              {/* Mood check-in */}
              {!moodSaved && (
                <div style={{ background: t.bg2, borderRadius: 12, padding: '16px 20px', marginBottom: 20, border: `0.5px solid ${t.border}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: t.text, marginBottom: 12 }}>How are you feeling right now?</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {[
      { id: 'great', label: 'Great', face: <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" fill="#FCD34D"/><circle cx="11" cy="13" r="2" fill="#92400E"/><circle cx="21" cy="13" r="2" fill="#92400E"/><path d="M10 20c1.5 2.5 4 4 6 4s4.5-1.5 6-4" stroke="#92400E" strokeWidth="1.8" strokeLinecap="round"/><path d="M9 11c1-1.5 2.5-2 3.5-1.5M23 11c-1-1.5-2.5-2-3.5-1.5" stroke="#92400E" strokeWidth="1.2" strokeLinecap="round"/></svg> },
      { id: 'good', label: 'Good', face: <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" fill="#FCD34D"/><circle cx="11" cy="13" r="2" fill="#92400E"/><circle cx="21" cy="13" r="2" fill="#92400E"/><path d="M11 20c1 2 3 3 5 3s4-1 5-3" stroke="#92400E" strokeWidth="1.8" strokeLinecap="round"/></svg> },
      { id: 'okay', label: 'Okay', face: <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" fill="#FCD34D"/><circle cx="11" cy="13" r="2" fill="#92400E"/><circle cx="21" cy="13" r="2" fill="#92400E"/><path d="M11 21h10" stroke="#92400E" strokeWidth="1.8" strokeLinecap="round"/></svg> },
      { id: 'low', label: 'Low', face: <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" fill="#93C5FD"/><circle cx="11" cy="13" r="2" fill="#1E3A5F"/><circle cx="21" cy="13" r="2" fill="#1E3A5F"/><path d="M11 22c1-2 3-3 5-3s4 1 5 3" stroke="#1E3A5F" strokeWidth="1.8" strokeLinecap="round"/><path d="M10 11c1-1 2.5-1.2 3.5-.5M22 11c-1-1-2.5-1.2-3.5-.5" stroke="#1E3A5F" strokeWidth="1.2" strokeLinecap="round"/></svg> },
      { id: 'anxious', label: 'Anxious', face: <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" fill="#C4B5FD"/><circle cx="11" cy="13" r="2.5" fill="#4C1D95"/><circle cx="21" cy="13" r="2.5" fill="#4C1D95"/><path d="M10 21c1.5-1 3-1.5 6-1.5s4.5.5 6 1.5" stroke="#4C1D95" strokeWidth="1.8" strokeLinecap="round"/><path d="M8 10c2-2 4-2.5 5-1.5M24 10c-2-2-4-2.5-5-1.5" stroke="#4C1D95" strokeWidth="1.2" strokeLinecap="round"/></svg> },
    ].map(m => (
                      <button key={m.id} onClick={() => saveMood(m.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 14px', borderRadius: 10, border: `0.5px solid ${t.border}`, background: mood === m.id ? t.blue2 : t.bg, cursor: 'pointer', minWidth: 60 }}>
                        {m.face}
                        <span style={{ fontSize: 10, color: mood === m.id ? t.blue : t.text3, fontWeight: mood === m.id ? 600 : 400 }}>{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {moodSaved && (
                <div style={{ background: t.bg2, borderRadius: 12, padding: '12px 16px', marginBottom: 20, border: `0.5px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width:24, height:24, borderRadius:'50%', background:t.success, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>Mood logged — feeling {mood} today</div>
                    <div style={{ fontSize: 11, color: t.text3 }}>Your psychologist can see this</div>
                  </div>
                </div>
              )}

              {/* Clinical scores row */}
              {latest && <ClinicalScoreCards latest={latest} sessions={sessions} t={t} isMobile={isMobile} setTab={setTab} severity={severity} ScoreChange={ScoreChange} SparkLine={SparkLine}/>}

              {/* Today's recommendations */}
              <div style={{ background: t.bg2, borderRadius: 12, padding: '16px 20px', marginBottom: 20, border: `0.5px solid ${t.border}` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: t.text, marginBottom: 12 }}>Today's Recommended Actions</div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap: 8 }}>
                  {[
                    { action: 'Complete PHQ-9 Assessment', done: sessions.length > 0, onClick: onStartAssessment, tag: '5 min' },
                    { action: 'Write in your journal', done: journals.length > 0, onClick: () => setTab('journal'), tag: '3 min' },
                    { action: 'Try an ACT exercise', done: false, onClick: onACTEngine, tag: '10 min' },
                    { action: 'Book a therapy session', done: appointments.some(a => a.status === 'scheduled'), onClick: () => setTab('appointments'), tag: '' },
                  ].map((rec, i) => (
                    <div key={i} onClick={rec.onClick} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, background: rec.done ? (dark ? 'rgba(5,150,105,0.1)' : '#ECFDF5') : t.bg, cursor: 'pointer', border: `0.5px solid ${rec.done ? '#A7F3D0' : t.border}` }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: rec.done ? t.success : t.border, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {rec.done && <svg width="10" height="10" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>}
                      </div>
                      <span style={{ fontSize: 12, color: rec.done ? t.success : t.text, flex: 1, textDecoration: rec.done ? 'line-through' : 'none' }}>{rec.action}</span>
                      {rec.tag && <span style={{ fontSize: 10, color: t.text3, background: t.bg3, padding: '2px 6px', borderRadius: 4 }}>{rec.tag}</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div style={{ background: t.bg2, borderRadius: 12, padding: '16px 20px', marginBottom: 20, border: `0.5px solid ${t.border}` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: t.text, marginBottom: 12 }}>Achievements</div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  {achievements.map((a, i) => <AchievementBadge key={i} {...a} t={t}/>)}
                </div>
              </div>

              {/* Hospital records */}
              {hospitalRecords?.patients?.length > 0 && (
                <div style={{ background: t.bg2, borderRadius: 12, padding: '16px 20px', marginBottom: 20, border: `0.5px solid ${t.border}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: t.text, marginBottom: 12 }}>Hospital Records</div>
                  {hospitalRecords.patients.map(p => (
                    <div key={p.id} style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: t.blue }}>{p.hospitals?.name}</div>
                      <div style={{ fontSize: 10, color: t.text3, marginBottom: 6 }}>{p.patient_uid} · {p.hospitals?.city}</div>
                      {hospitalRecords.ehr?.filter(e => e.patient_id === p.id).slice(0, 2).map(e => (
                        <div key={e.id} style={{ background: t.bg, borderRadius: 8, padding: '8px 12px', marginBottom: 4 }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: t.text, textTransform: 'capitalize' }}>{e.record_type?.replace('_', ' ')}</div>
                          {e.chief_complaint && <div style={{ fontSize: 11, color: t.text3 }}>{e.chief_complaint}</div>}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {/* Care team + Next appointment */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
                <div style={{ background: t.bg2, borderRadius: 12, padding: '16px 20px', border: `0.5px solid ${t.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: t.text }}>Care Team</div>
                    <span onClick={() => setTab('share')} style={{ fontSize: 10, color: t.blue, cursor: 'pointer', fontWeight: 500 }}>+ Add</span>
                  </div>
                  {psychologistContact.map(c => (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `0.5px solid ${t.border}` }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: t.blue2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: t.blue }}>{c.name?.charAt(0)}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: t.text }}>{c.name}</div>
                        <div style={{ fontSize: 10, color: t.text3 }}>Psychologist</div>
                      </div>
                      <button onClick={() => setTab('messages')} style={{ width: 28, height: 28, borderRadius: 7, background: t.bg3, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.text2 }}>
                        {Icons.messages(t.text2)}
                      </button>
                    </div>
                  ))}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg,${t.blue},${t.cyan})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="1.5"/><path d="M12 8v4l3 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: t.text }}>Dr. PsycheFlow</div>
                      <div style={{ fontSize: 10, color: t.text3 }}>AI Therapist · Always available</div>
                    </div>
                  </div>
                  {psychologistContact.length === 0 && (
                    <div style={{ fontSize: 11, color: t.text3, marginTop: 4 }}>No psychologist linked. <span onClick={() => setTab('share')} style={{ color: t.blue, cursor: 'pointer' }}>Generate share code →</span></div>
                  )}
                </div>
                <div style={{ background: t.bg2, borderRadius: 12, padding: '16px 20px', border: `0.5px solid ${t.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: t.text }}>Next Appointment</div>
                    <span onClick={() => setTab('appointments')} style={{ fontSize: 10, color: t.blue, cursor: 'pointer', fontWeight: 500 }}>Book</span>
                  </div>
                  {appointments.filter(a => a.status === 'scheduled' && new Date(a.scheduled_at) > new Date()).slice(0, 1).map(appt => (
                    <div key={appt.id}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: t.text }}>{new Date(appt.scheduled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                      <div style={{ fontSize: 12, color: t.text3, marginTop: 2 }}>{new Date(appt.scheduled_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} · {appt.mode || 'Video call'}</div>
                    </div>
                  ))}
                  {appointments.filter(a => a.status === 'scheduled' && new Date(a.scheduled_at) > new Date()).length === 0 && (
                    <div>
                      <div style={{ fontSize: 12, color: t.text3, marginBottom: 8 }}>No upcoming appointments</div>
                      <button onClick={() => setTab('appointments')} style={{ fontSize: 11, color: t.blue, background: t.blue2, border: 'none', padding: '6px 12px', borderRadius: 6, cursor: 'pointer' }}>Book a session</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── WELLNESS ─────────────────────────────── */}
          {tab === 'wellness' && (
            <div>
              <Breadcrumbs items={[{ label: 'Dashboard', onClick: () => setTab('overview') }, { label: 'Wellness' }]} t={t}/>
              <h2 style={{ margin: '0 0 20px', color: t.text, fontSize: 20, fontWeight: 700 }}>Wellness Center</h2>
              {/* Overall wellness */}
              <div style={{ background: t.bg2, borderRadius: 16, padding: '24px', marginBottom: 20, border: `0.5px solid ${t.border}`, display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
                  <WellnessRing score={wellnessScore || 0} size={120} color={wellnessScore >= 70 ? t.success : wellnessScore >= 40 ? t.warning : t.danger}/>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: t.text }}>{wellnessScore || '—'}</div>
                    <div style={{ fontSize: 9, color: t.text3 }}>/ 100</div>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: t.text, marginBottom: 6 }}>Mental Wellness Index</div>
                  <div style={{ fontSize: 13, color: t.text3, marginBottom: 12 }}>Composite score based on PHQ-9, GAD-7, journal sentiment, and session history</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {[['PHQ-9', latest?.phq_score, 27], ['GAD-7', latest?.gad_score, 21], ['Sessions', sessions.length, null], ['Journals', journals.length, null]].map(([label, val, max]) => (
                      <div key={label} style={{ background: t.bg3, borderRadius: 8, padding: '8px 12px', minWidth: 70 }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: t.blue }}>{val ?? '—'}</div>
                        <div style={{ fontSize: 10, color: t.text3 }}>{label}{max ? `/${max}` : ''}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Life domains */}
              <div style={{ background: t.bg2, borderRadius: 12, padding: '16px 20px', marginBottom: 20, border: `0.5px solid ${t.border}` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: t.text, marginBottom: 14 }}>Life Domains</div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 10 }}>
                  {Object.entries(lifeScores).map(([domain, score]) => (
                    <div key={domain} style={{ background: t.bg, borderRadius: 8, padding: '10px 12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 11, color: t.text, fontWeight: 500, textTransform: 'capitalize' }}>{domain}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: score >= 7 ? t.success : score >= 5 ? t.warning : t.danger }}>{score}/10</span>
                      </div>
                      <div style={{ height: 4, borderRadius: 2, background: t.border }}>
                        <div style={{ height: 4, borderRadius: 2, background: score >= 7 ? t.success : score >= 5 ? t.warning : t.danger, width: (score / 10 * 100) + '%', transition: 'width 0.4s' }}/>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 10, color: t.text3, marginTop: 10 }}>Tap to update your life domain scores</div>
              </div>

              {/* Recovery timeline */}
              {sessions.length > 0 && (
                <div style={{ background: t.bg2, borderRadius: 12, padding: '16px 20px', marginBottom: 20, border: `0.5px solid ${t.border}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: t.text, marginBottom: 14 }}>Recovery Timeline</div>
                  <div style={{ position: 'relative', paddingLeft: 20 }}>
                    <div style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 2, background: t.border }}/>
                    {[
                      { date: sessions[sessions.length - 1]?.created_at, event: 'First assessment completed', type: 'start' },
                      ...(journals.length > 0 ? [{ date: journals[journals.length - 1]?.created_at, event: 'Started journaling', type: 'journal' }] : []),
                      ...(sessions.length > 2 ? [{ date: sessions[Math.floor(sessions.length / 2)]?.created_at, event: 'Therapy in progress', type: 'therapy' }] : []),
                      ...(sessions.length > 0 && (sessions[0].phq_score < (sessions[sessions.length - 1]?.phq_score || 0)) ? [{ date: sessions[0].created_at, event: 'PHQ-9 score improving', type: 'improve' }] : []),
                      { date: new Date().toISOString(), event: 'Today — keep going!', type: 'today' },
                    ].filter(item => item.date).map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                        <div style={{ width: 14, height: 14, borderRadius: '50%', background: item.type === 'today' ? t.blue : item.type === 'improve' ? t.success : t.border, border: `2px solid ${item.type === 'today' ? t.blue : t.bg2}`, flexShrink: 0, marginTop: 2 }}/>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: t.text }}>{item.event}</div>
                          <div style={{ fontSize: 10, color: t.text3 }}>{new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Achievements */}
              <div style={{ background: t.bg2, borderRadius: 12, padding: '16px 20px', border: `0.5px solid ${t.border}` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: t.text, marginBottom: 14 }}>Achievements</div>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  {achievements.map((a, i) => <AchievementBadge key={i} {...a} t={t}/>)}
                </div>
              </div>
            </div>
          )}

          {/* ── CLINICAL ─────────────────────────────── */}
          {tab === 'clinical' && (
            <div>
              <Breadcrumbs items={[{ label: 'Dashboard', onClick: () => setTab('overview') }, { label: 'Clinical' }]} t={t}/>
              <h2 style={{ margin: '0 0 20px', color: t.text, fontSize: 20, fontWeight: 700 }}>Clinical Dashboard</h2>
              {!latest ? (
                <div style={{ background: t.bg2, borderRadius: 12, padding: 40, textAlign: 'center', border: `0.5px solid ${t.border}` }}>
                  <div style={{ fontSize: 13, color: t.text3, marginBottom: 12 }}>No assessment data yet.</div>
                  <button onClick={onStartAssessment} style={{ padding: '10px 20px', background: t.blue, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Take First Assessment</button>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
                    {[
                      { label: 'PHQ-9 Depression', score: latest.phq_score, max: 27, prev: sessions[1]?.phq_score, desc: 'Patient Health Questionnaire' },
                      { label: 'GAD-7 Anxiety', score: latest.gad_score, max: 21, prev: sessions[1]?.gad_score, desc: 'Generalized Anxiety Disorder' },
                      { label: 'Wellbeing (WHO-5)', score: Math.round((latest.wellbeing_score || 0.75) * 100), max: 100, prev: null, desc: 'World Health Organization scale' },
                    ].map((item, i) => {
                      const sev = severity(item.score, item.max);
                      const phqTrend = sessions.slice(0, 6).map(s => item.label.includes('PHQ') ? s.phq_score : s.gad_score).filter(v => v !== undefined).reverse();
                      return (
                        <div key={i} style={{ background: t.bg2, borderRadius: 14, padding: '18px 20px', border: `0.5px solid ${t.border}` }}>
                          <div style={{ fontSize: 10, fontWeight: 600, color: t.text3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{item.label}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
                            <div>
                              <div style={{ fontSize: 32, fontWeight: 700, color: sev.color, letterSpacing: '-0.02em' }}>{item.score}</div>
                              <div style={{ fontSize: 12, fontWeight: 600, color: sev.color }}>{sev.label}</div>
                              {item.prev !== null && item.prev !== undefined && <ScoreChange current={item.score} previous={item.prev}/>}
                            </div>
                            <div style={{ width: 80 }}>
                              <SparkLine data={phqTrend} color={sev.color}/>
                            </div>
                          </div>
                          <div style={{ height: 6, borderRadius: 3, background: t.border }}>
                            <div style={{ height: 6, borderRadius: 3, background: sev.color, width: (item.score / item.max * 100) + '%', transition: 'width 0.4s' }}/>
                          </div>
                          <div style={{ fontSize: 10, color: t.text3, marginTop: 6 }}>{item.desc}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Other clinical scores */}
                  <div style={{ background: t.bg2, borderRadius: 12, padding: '16px 20px', marginBottom: 20, border: `0.5px solid ${t.border}` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: t.text, marginBottom: 14 }}>Full Clinical Profile</div>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap: 10 }}>
                      {[
                        { label: 'Big Five — Openness', value: latest.Openness, tag: 'Personality' },
                        { label: 'Big Five — Conscientiousness', value: latest.Conscientiousness, tag: 'Personality' },
                        { label: 'Big Five — Extraversion', value: latest.Extraversion, tag: 'Personality' },
                        { label: 'Big Five — Agreeableness', value: latest.Agreeableness, tag: 'Personality' },
                        { label: 'Big Five — Neuroticism', value: latest.Neuroticism, tag: 'Personality' },
                        { label: 'Dark Triad — Narcissism', value: latest.Narcissism, tag: 'Dark Triad' },
                        { label: 'Dark Triad — Machiavellianism', value: latest.Machiavellianism, tag: 'Dark Triad' },
                        { label: 'Dark Triad — Psychopathy', value: latest.Psychopathy, tag: 'Dark Triad' },
                      ].filter(item => item.value !== undefined && item.value !== null).map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: t.bg, borderRadius: 8 }}>
                          <div>
                            <div style={{ fontSize: 12, color: t.text, fontWeight: 500 }}>{item.label}</div>
                            <div style={{ fontSize: 9, color: t.text3 }}>{item.tag}</div>
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: t.blue }}>{typeof item.value === 'string' ? item.value : Math.round(item.value * 100) / 100}</div>
                        </div>
                      ))}
                    </div>
                    {!Object.keys(latest).some(k => ['Openness', 'Extraversion', 'Neuroticism'].includes(k)) && (
                      <div style={{ textAlign: 'center', padding: 20, color: t.text3, fontSize: 12 }}>Complete a full assessment to see your clinical profile.</div>
                    )}
                  </div>

                  {/* Risk monitor */}
                  <div style={{ background: riskLevel.level === 'High' ? (dark ? 'rgba(220,38,38,0.1)' : '#FEF2F2') : t.bg2, borderRadius: 12, padding: '16px 20px', border: `1px solid ${riskLevel.level === 'High' ? '#FECACA' : t.border}` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: t.text, marginBottom: 12 }}>Crisis Monitor</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: riskLevel.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {Icons.crisis(riskLevel.color)}
                      </div>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: riskLevel.color }}>Risk Level: {riskLevel.level}</div>
                        <div style={{ fontSize: 11, color: t.text3 }}>Based on latest PHQ-9 and GAD-7 scores</div>
                      </div>
                    </div>
                    {riskLevel.level !== 'Low' && (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button onClick={onCrisis} style={{ padding: '8px 16px', background: t.danger, color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Contact Crisis Support</button>
                        <a href="tel:9152987821" style={{ padding: '8px 16px', background: 'transparent', color: t.danger, border: `1px solid ${t.danger}`, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }}>iCall: 9152987821</a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── AI INSIGHTS ──────────────────────────── */}
          {tab === 'insights' && (
            <div>
              <h2 style={{ margin: '0 0 20px', color: t.text, fontSize: 20, fontWeight: 700 }}>AI Insights Center</h2>
              {sessions.length === 0 && journals.length === 0 ? (
                <div style={{ background: t.bg2, borderRadius: 12, padding: 40, textAlign: 'center', border: `0.5px solid ${t.border}` }}>
                  <div style={{ fontSize: 13, color: t.text3 }}>Complete assessments and journal entries to unlock AI insights.</div>
                </div>
              ) : (
                <div>
                  {/* Weekly insights */}
                  <div style={{ background: `linear-gradient(135deg, ${dark ? '#0d2847' : '#EFF6FF'}, ${dark ? '#0f1f3d' : '#F0FDF4'})`, borderRadius: 16, padding: '20px 24px', marginBottom: 20, border: `0.5px solid ${t.border}` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: t.text3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Weekly AI Insights</div>
                    <div style={{ display: 'grid', gap: 10 }}>
                      {[
                        sessions.length > 1 && (sessions[0].phq_score < sessions[sessions.length - 1].phq_score ? '↓ Your depression score has improved by ' + (sessions[sessions.length - 1].phq_score - sessions[0].phq_score) + ' points since you started.' : '↑ Your PHQ-9 trend shows room for improvement. Consider discussing with your therapist.'),
                        journals.length > 0 && `✦ You've written ${journals.length} journal ${journals.length === 1 ? 'entry' : 'entries'}. Journaling is associated with reduced anxiety and better emotional processing.`,
                        sessions.length > 0 && `◎ Your latest assessment was ${Math.floor((Date.now() - new Date(sessions[0].created_at)) / (24 * 60 * 60 * 1000))} days ago. Regular check-ins help track your mental health progress.`,
                        '→ AI analysis suggests: consistent sleep, regular exercise, and social connection are the strongest protective factors for mental health.',
                      ].filter(Boolean).map((insight, i) => (
                        <div key={i} style={{ background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: t.text, lineHeight: 1.6 }}>
                          {insight}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Triggers and patterns */}
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16, marginBottom: 20 }}>
                    <div style={{ background: t.bg2, borderRadius: 12, padding: '16px 20px', border: `0.5px solid ${t.border}` }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: t.text, marginBottom: 12 }}>Potential Triggers</div>
                      {journals.slice(0, 3).map(j => (
                        <div key={j.id} style={{ padding: '8px 0', borderBottom: `0.5px solid ${t.border}` }}>
                          {j.analysis?.topics?.slice(0, 2).map((topic, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 6, height: 6, borderRadius: '50%', background: t.warning, flexShrink: 0 }}/>
                              <span style={{ fontSize: 12, color: t.text }}>{topic}</span>
                            </div>
                          ))}
                          {!j.analysis?.topics && <div style={{ fontSize: 12, color: t.text3 }}>Journal entry analyzed</div>}
                        </div>
                      ))}
                      {journals.length === 0 && <div style={{ fontSize: 12, color: t.text3 }}>Write journal entries to detect triggers.</div>}
                    </div>
                    <div style={{ background: t.bg2, borderRadius: 12, padding: '16px 20px', border: `0.5px solid ${t.border}` }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: t.text, marginBottom: 12 }}>Protective Factors</div>
                      {['Therapy Attendance', 'Journal Practice', 'Assessment Consistency', 'Help-Seeking Behavior'].map((factor, i) => {
                        const active = [sessions.length > 0, journals.length > 0, sessions.length > 2, true][i];
                        return (
                          <div key={factor} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: `0.5px solid ${t.border}` }}>
                            <div style={{ width: 16, height: 16, borderRadius: '50%', background: active ? t.success : t.border, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {active && <svg width="8" height="8" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>}
                            </div>
                            <span style={{ fontSize: 12, color: active ? t.text : t.text3 }}>{factor}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* PHQ trend chart */}
                  {sessions.length >= 2 && (
                    <div style={{ background: t.bg2, borderRadius: 12, padding: '16px 20px', border: `0.5px solid ${t.border}` }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: t.text, marginBottom: 14 }}>PHQ-9 Trend (Last {Math.min(6, sessions.length)} assessments)</div>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
                        {sessions.slice(0, 6).reverse().map((s, i) => {
                          const pct = (s.phq_score / 27) * 100;
                          const color = s.phq_score >= 20 ? t.danger : s.phq_score >= 15 ? t.warning : s.phq_score >= 10 ? '#F59E0B' : t.success;
                          return (
                            <div key={s.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                              <div style={{ fontSize: 10, color: t.text3 }}>{s.phq_score}</div>
                              <div style={{ width: '100%', background: color + '30', borderRadius: '4px 4px 0 0', height: pct + '%', border: `1px solid ${color}`, minHeight: 4 }}/>
                              <div style={{ fontSize: 8, color: t.text3 }}>{new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── JOURNAL ──────────────────────────────── */}
          {tab === 'journal' && (
            <div>
              <h2 style={{ margin: '0 0 20px', color: t.text, fontSize: 20, fontWeight: 700 }}>Journal</h2>
              <div style={{ background: t.bg2, borderRadius: 12, padding: '16px 20px', marginBottom: 20, border: `0.5px solid ${t.border}` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: t.text, marginBottom: 10 }}>New Entry</div>
                <Breadcrumbs items={[{ label: 'Dashboard', onClick: () => setTab('overview') }, { label: 'Journal' }]} t={t}/>
              <textarea value={journalDraft} onChange={e => { setJournalDraft(e.target.value); setJournalText(e.target.value); localStorage.setItem('pf-journal-draft', e.target.value); }} placeholder="How are you feeling today? What's on your mind?" rows={5}
                  style={{ width: '100%', padding: '12px', borderRadius: 10, border: `0.5px solid ${t.border}`, background: t.bg, color: t.text, fontSize: 13, lineHeight: 1.7, resize: 'vertical', outline: 'none', fontFamily: "'Satoshi',-apple-system,sans-serif", boxSizing: 'border-box' }}/>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:10 }}>
                  <span style={{ fontSize:11, color:t.text3 }}>{journalDraft.length} characters {journalDraft.length >= 20 ? '— ready to analyze' : '— write at least 20 characters'}</span>
                  <button onClick={async()=>{ setJournalText(journalDraft); await analyzeJournal(); localStorage.removeItem('pf-journal-draft'); setJournalDraft(''); }} disabled={journalLoading || journalDraft.trim().length < 20}
                  style={{ marginTop: 10, padding: '9px 20px', background: t.blue, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  {journalLoading ? 'Analyzing...' : 'Save & Analyze'}
                  </button>
                </div>
              </div>
              {journalAnalysis && (
                <div style={{ background: t.bg2, borderRadius: 12, padding: '16px 20px', marginBottom: 20, border: `0.5px solid ${t.border}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: t.text, marginBottom: 10 }}>AI Analysis</div>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 10 }}>
                    {[['Primary Emotion', journalAnalysis.emotions?.primary], ['Sentiment', journalAnalysis.sentiment], ['Theme', journalAnalysis.themes?.[0]]].map(([label, val]) => val && (
                      <div key={label} style={{ background: t.bg3, borderRadius: 8, padding: '10px 12px' }}>
                        <div style={{ fontSize: 9, color: t.text3, textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: t.text, textTransform: 'capitalize' }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: t.text, marginBottom: 12 }}>Past Entries ({journals.length})</div>
                {journals.map(j => (
                  <div key={j.id} style={{ background: t.bg2, borderRadius: 12, padding: '14px 16px', marginBottom: 10, border: `0.5px solid ${t.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ fontSize: 11, color: t.text3 }}>{new Date(j.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                      {j.analysis?.emotions?.primary && <div style={{ fontSize: 11, fontWeight: 600, color: t.blue, textTransform: 'capitalize' }}>{j.analysis.emotions.primary}</div>}
                    </div>
                    <div style={{ fontSize: 13, color: t.text, lineHeight: 1.6, marginBottom: 8 }}>{j.text?.slice(0, 200)}{j.text?.length > 200 ? '...' : ''}</div>
                    {j.analysis && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {j.analysis.themes?.slice(0, 3).map(theme => (
                          <span key={theme} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: t.bg3, color: t.blue, fontWeight: 500 }}>{theme}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {journals.length === 0 && <div style={{ textAlign: 'center', padding: 32, color: t.text3, fontSize: 13 }}>No journal entries yet. Start writing above.</div>}
              </div>
            </div>
          )}

          {/* ── THERAPY ──────────────────────────────── */}
          {tab === 'therapy' && (
            <div>
              <h2 style={{ margin: '0 0 20px', color: t.text, fontSize: 20, fontWeight: 700 }}>Therapy Progress</h2>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
                {[
                  { label: 'Sessions Completed', value: sessions.length, color: t.blue },
                  { label: 'Journal Entries', value: journals.length, color: t.success },
                  { label: 'Days Active', value: streakDays, color: t.warning },
                ].map((k, i) => (
                  <div key={i} style={{ background: t.bg2, borderRadius: 12, padding: '16px 20px', border: `0.5px solid ${t.border}` }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: k.color }}>{k.value}</div>
                    <div style={{ fontSize: 12, color: t.text3, marginTop: 2 }}>{k.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: t.bg2, borderRadius: 12, padding: '16px 20px', marginBottom: 20, border: `0.5px solid ${t.border}` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: t.text, marginBottom: 12 }}>ACT Therapy Exercises</div>
                <div style={{ fontSize: 12, color: t.text3, marginBottom: 12 }}>Acceptance and Commitment Therapy — evidence-based exercises for psychological flexibility</div>
                <button onClick={onACTEngine} style={{ padding: '10px 20px', background: t.blue, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Open ACT Engine →</button>
              </div>
              {sessions.length > 0 && (
                <div style={{ background: t.bg2, borderRadius: 12, padding: '16px 20px', border: `0.5px solid ${t.border}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: t.text, marginBottom: 12 }}>Session History</div>
                  {sessions.slice(0, 5).map(s => (
                    <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `0.5px solid ${t.border}` }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 500, color: t.text }}>{new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                        <div style={{ fontSize: 10, color: t.text3 }}>PHQ-9: {s.phq_score} · GAD-7: {s.gad_score}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: severity(s.phq_score, 27).color }}>{severity(s.phq_score, 27).label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── ASSESSMENTS ──────────────────────────── */}
          {tab === 'assessment' && (
            <div>
              <h2 style={{ margin: '0 0 20px', color: t.text, fontSize: 20, fontWeight: 700 }}>Assessment Center</h2>
              <div style={{ background: t.bg2, borderRadius: 12, padding: '20px', marginBottom: 20, border: `0.5px solid ${t.border}` }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 6 }}>14 Clinical Instruments Available</div>
                <div style={{ fontSize: 12, color: t.text3, marginBottom: 16 }}>PHQ-9, GAD-7, Big Five, Dark Triad, PCL-5, OCI-R, ASRS, MBI, WHO-5, ISI, DASS-21, C-SSRS, Sleep Quality, Workplace MH</div>
                <button onClick={onStartAssessment} style={{ padding: '10px 24px', background: t.blue, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Start New Assessment</button>
              </div>
              {sessions.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: t.text, marginBottom: 12 }}>Assessment History ({sessions.length})</div>
                  {sessions.map(s => (
                    <div key={s.id} style={{ background: t.bg2, borderRadius: 12, padding: '14px 16px', marginBottom: 10, border: `0.5px solid ${t.border}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: t.text }}>{new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                        <div style={{ fontSize: 11, color: severity(s.phq_score, 27).color, fontWeight: 600 }}>{severity(s.phq_score, 27).label}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        {[['PHQ-9', s.phq_score, 27], ['GAD-7', s.gad_score, 21]].map(([label, score, max]) => score !== undefined && (
                          <div key={label} style={{ background: t.bg, borderRadius: 6, padding: '6px 10px' }}>
                            <div style={{ fontSize: 10, color: t.text3 }}>{label}</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: severity(score, max).color }}>{score}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {sessions.length === 0 && (
                <div style={{ textAlign: 'center', padding: 40, color: t.text3, fontSize: 13 }}>No assessments yet. Complete your first assessment above.</div>
              )}
            </div>
          )}

          {/* ── PROFILE ──────────────────────────────── */}
          {tab === 'profile' && (
            <div>
              <h2 style={{ margin: '0 0 20px', color: t.text, fontSize: 20, fontWeight: 700 }}>My Psychological Profile</h2>
              <div style={{ background: t.bg2, borderRadius: 16, padding: '20px', marginBottom: 20, border: `0.5px solid ${t.border}`, display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: `linear-gradient(135deg,${t.blue},${t.cyan})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  {name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: t.text }}>{name}</div>
                  <div style={{ fontSize: 12, color: t.text3, marginTop: 2 }}>{user?.email}</div>
                  <div style={{ fontSize: 11, color: t.text3, marginTop: 2 }}>Member since {new Date(user?.created_at || Date.now()).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</div>
                </div>
              </div>
              {latest && Object.keys(latest).some(k => ['Openness', 'Extraversion'].includes(k)) ? (
                <div>
                  <div style={{ background: t.bg2, borderRadius: 12, padding: '16px 20px', marginBottom: 16, border: `0.5px solid ${t.border}` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: t.text, marginBottom: 12 }}>Big Five Personality</div>
                    {['Extraversion', 'Neuroticism', 'Agreeableness', 'Conscientiousness', 'Openness'].map(trait => {
                      const val = latest[trait];
                      if (val === undefined) return null;
                      const pct = (val / 10) * 100;
                      return (
                        <div key={trait} style={{ marginBottom: 10 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: 12, color: t.text, fontWeight: 500 }}>{trait}</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: t.blue }}>{Math.round(val * 100) / 100}/10</span>
                          </div>
                          <div style={{ height: 6, borderRadius: 3, background: t.border }}>
                            <div style={{ height: 6, borderRadius: 3, background: t.blue, width: pct + '%', transition: 'width 0.4s' }}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ background: t.bg2, borderRadius: 12, padding: '16px 20px', border: `0.5px solid ${t.border}` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: t.text, marginBottom: 12 }}>Dark Triad</div>
                    {['Narcissism', 'Machiavellianism', 'Psychopathy'].map(trait => {
                      const val = latest[trait];
                      if (val === undefined) return null;
                      const pct = (val / 9) * 100;
                      return (
                        <div key={trait} style={{ marginBottom: 10 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: 12, color: t.text }}>{trait}</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: pct > 60 ? t.danger : t.warning }}>{Math.round(val * 100) / 100}/9</span>
                          </div>
                          <div style={{ height: 6, borderRadius: 3, background: t.border }}>
                            <div style={{ height: 6, borderRadius: 3, background: pct > 60 ? t.danger : t.warning, width: pct + '%' }}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div style={{ background: t.bg2, borderRadius: 12, padding: 40, textAlign: 'center', border: `0.5px solid ${t.border}` }}>
                  <div style={{ fontSize: 13, color: t.text3, marginBottom: 12 }}>Complete a full assessment to build your psychological profile.</div>
                  <button onClick={onStartAssessment} style={{ padding: '10px 20px', background: t.blue, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Start Assessment</button>
                </div>
              )}
            </div>
          )}

          {/* ── MESSAGES ─────────────────────────────── */}
          {tab === 'messages' && (
            <div>
              <h2 style={{ margin: '0 0 20px', color: t.text, fontSize: 20, fontWeight: 700 }}>Messages</h2>
              {!psychologistId ? (
                <div style={{ background: t.bg2, borderRadius: 12, padding: 40, textAlign: 'center', border: `0.5px solid ${t.border}` }}>
                  <div style={{ fontSize: 13, color: t.text3, marginBottom: 12 }}>No psychologist linked yet.</div>
                  <button onClick={() => setTab('share')} style={{ padding: '10px 20px', background: t.blue, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Get Share Code →</button>
                </div>
              ) : (
                <div style={{ background: t.bg2, borderRadius: 12, border: `0.5px solid ${t.border}`, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 500 }}>
                  <div style={{ padding: '12px 16px', borderBottom: `0.5px solid ${t.border}`, fontSize: 13, fontWeight: 700, color: t.text }}>
                    {psychologistContact[0]?.name || 'My Psychologist'}
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {messages.slice().reverse().map(m => (
                      <div key={m.id} style={{ display: 'flex', justifyContent: m.sender_id === user.id ? 'flex-end' : 'flex-start' }}>
                        <div style={{ maxWidth: '75%', padding: '8px 12px', borderRadius: m.sender_id === user.id ? '12px 12px 4px 12px' : '12px 12px 12px 4px', background: m.sender_id === user.id ? t.blue : t.bg3, color: m.sender_id === user.id ? '#fff' : t.text, fontSize: 12, lineHeight: 1.5 }}>
                          {m.content}
                        </div>
                      </div>
                    ))}
                    {messages.length === 0 && <div style={{ textAlign: 'center', padding: 32, color: t.text3, fontSize: 12 }}>No messages yet. Send a message to your psychologist.</div>}
                  </div>
                  <div style={{ padding: '8px 12px', borderTop: `0.5px solid ${t.border}`, display: 'flex', gap: 8 }}>
                    <input value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Type a message..."
                      style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: `0.5px solid ${t.border}`, background: t.bg, color: t.text, fontSize: 12, outline: 'none' }}/>
                    <button onClick={sendMessage} disabled={!newMsg.trim()} style={{ padding: '8px 16px', background: t.blue, color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Send</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── APPOINTMENTS ─────────────────────────── */}
          {tab === 'appointments' && (
            <div>
              <h2 style={{ margin: '0 0 20px', color: t.text, fontSize: 20, fontWeight: 700 }}>Appointments</h2>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
                {[
                  { label: 'Upcoming', value: appointments.filter(a => a.status === 'scheduled' && new Date(a.scheduled_at) > new Date()).length, color: t.blue },
                  { label: 'Completed', value: appointments.filter(a => a.status === 'completed').length, color: t.success },
                  { label: 'Total', value: appointments.length, color: t.text2 },
                ].map((k, i) => (
                  <div key={i} style={{ background: t.bg2, borderRadius: 12, padding: '14px 18px', border: `0.5px solid ${t.border}` }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: k.color }}>{k.value}</div>
                    <div style={{ fontSize: 11, color: t.text3, marginTop: 2 }}>{k.label}</div>
                  </div>
                ))}
              </div>
              {appointments.length === 0 ? (
                <div style={{ background: t.bg2, borderRadius: 12, padding: 40, textAlign: 'center', border: `0.5px solid ${t.border}` }}>
                  <div style={{ fontSize: 13, color: t.text3, marginBottom: 12 }}>No appointments yet.</div>
                </div>
              ) : appointments.map(a => (
                <div key={a.id} style={{ background: t.bg2, borderRadius: 12, padding: '14px 16px', marginBottom: 10, border: `0.5px solid ${t.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{new Date(a.scheduled_at).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                      <div style={{ fontSize: 11, color: t.text3 }}>{new Date(a.scheduled_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} · {a.mode || 'Video'} · {a.duration || 50} min</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: a.status === 'scheduled' ? '#EFF6FF' : a.status === 'completed' ? '#ECFDF5' : '#FEF2F2', color: a.status === 'scheduled' ? t.blue : a.status === 'completed' ? t.success : t.danger }}>{a.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── SHARE CODE ───────────────────────────── */}
          {tab === 'share' && (
            <div>
              <h2 style={{ margin: '0 0 20px', color: t.text, fontSize: 20, fontWeight: 700 }}>Share Code</h2>
              <div style={{ background: t.bg2, borderRadius: 12, padding: '24px', border: `0.5px solid ${t.border}`, maxWidth: 480 }}>
                <div style={{ fontSize: 13, color: t.text3, marginBottom: 16, lineHeight: 1.6 }}>Generate a code and share it with your psychologist to link your account. They'll enter it in their portal to access your anonymized data.</div>
                {shareCode ? (
                  <div>
                    <div style={{ background: t.bg3, borderRadius: 10, padding: '16px', textAlign: 'center', marginBottom: 16 }}>
                      <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '0.2em', color: t.blue, fontFamily: 'monospace' }}>{shareCode}</div>
                      <div style={{ fontSize: 11, color: t.text3, marginTop: 6 }}>Share this code with your psychologist</div>
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText(shareCode); }} style={{ padding: '8px 20px', background: t.bg3, color: t.blue, border: `0.5px solid ${t.border}`, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Copy Code</button>
                  </div>
                ) : (
                  <button onClick={generateShareCode} style={{ padding: '10px 24px', background: t.blue, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Generate Share Code</button>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Mobile bottom tab bar */}
      {isMobile && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, background: t.bg2, borderTop: `0.5px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '8px 0', paddingBottom: 'calc(8px + env(safe-area-inset-bottom))' }}>
          {[
            { id: 'overview', label: 'Home' },
            { id: 'wellness', label: 'Wellness' },
            { id: 'clinical', label: 'Clinical' },
            { id: 'insights', label: 'Insights' },
            { id: 'journal', label: 'Journal' },
          ].map(item => (
            <div key={item.id} onClick={() => setTab(item.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer', minWidth: 52, padding: '4px 0' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: tab === item.id ? t.blue2 : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                {Icons[item.id] ? Icons[item.id](tab === item.id ? t.blue : t.text3) : Icons.overview(tab === item.id ? t.blue : t.text3)}
              </div>
              <span style={{ fontSize: 9, fontWeight: tab === item.id ? 600 : 400, color: tab === item.id ? t.blue : t.text3 }}>{item.label}</span>
            </div>
          ))}
          <div onClick={toggleDark} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer', minWidth: 52, padding: '4px 0' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {dark ? Icons.sun(t.text3) : Icons.moon(t.text3)}
            </div>
            <span style={{ fontSize: 9, color: t.text3 }}>{dark ? 'Light' : 'Dark'}</span>
          </div>
        </div>
      )}

      {/* SOS Button */}
      <button onClick={onCrisis} style={{ position: 'fixed', bottom: isMobile ? 76 : 24, right: 76, padding: '10px 18px', background: t.danger, color: '#fff', border: 'none', borderRadius: 100, fontSize: 12, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(220,38,38,0.4)', zIndex: 39, display: 'flex', alignItems: 'center', gap: 5 }}>
        {Icons.crisis('#fff')} SOS Crisis
      </button>

      {/* Chatbot */}
      <Chatbot user={user} t={t}/>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { transition: background-color 0.2s, border-color 0.2s, color 0.2s; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(29,78,216,0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
}
