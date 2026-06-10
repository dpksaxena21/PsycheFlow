import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';

// Tab components
import PP_CommandCenter from './PP_CommandCenter';
import PP_Roster from './PP_Roster';
import PP_PatientChart from './PP_PatientChart';
import PP_Crisis from './PP_Crisis';
import PP_Appointments from './PP_Appointments';
import PP_SessionWorkspace from './PP_SessionWorkspace';
import PP_TreatmentPlans from './PP_TreatmentPlans';
import PP_Analytics from './PP_Analytics';
import PP_JournalIntelligence from './PP_JournalIntelligence';
import PP_AICopilot from './PP_AICopilot';
import PP_Assessments from './PP_Assessments';
import PP_Messages from './PP_Messages';
import PP_HospitalReferrals from './PP_HospitalReferrals';
import PP_Link from './PP_Link';

// Shared styles
export const S = {
  navy: '#0C1A2E', blue: '#1D4ED8', bg: '#F8FAFF', card: '#FFFFFF',
  border: '#E2EBF6', muted: '#3B5998', hint: '#94a3b8', lightBlue: '#EFF6FF',
  success: '#059669', danger: '#DC2626', warning: '#D97706', cyan: '#0891B2', purple: '#7C3AED',
};
export const card = { background: S.card, borderRadius: 12, border: `0.5px solid ${S.border}`, boxShadow: '0 1px 4px rgba(29,78,216,0.06)', padding: 20 };
export const Badge = ({ color, children }) => <span style={{ padding: '2px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600, background: color === 'red' ? '#FEF2F2' : color === 'yellow' ? '#FFFBEB' : color === 'green' ? '#ECFDF5' : color === 'purple' ? '#F5F3FF' : color === 'cyan' ? '#ECFEFF' : '#EFF6FF', color: color === 'red' ? S.danger : color === 'yellow' ? S.warning : color === 'green' ? S.success : color === 'purple' ? S.purple : color === 'cyan' ? S.cyan : S.blue }}>{children}</span>;

const TAB_ICONS = {
  command: c => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  roster: c => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="7" r="3" stroke={c} strokeWidth="1.5"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke={c} strokeWidth="1.5" strokeLinecap="round"/><path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.85" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>,
  crisis: c => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="9" x2="12" y2="13" stroke={c} strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="17" r="1" fill={c}/></svg>,
  appointments: c => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke={c} strokeWidth="1.5"/><path d="M16 2v4M8 2v4M3 10h18" stroke={c} strokeWidth="1.5" strokeLinecap="round"/><circle cx="8" cy="15" r="1" fill={c}/><circle cx="12" cy="15" r="1" fill={c}/></svg>,
  session: c => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="2" stroke={c} strokeWidth="1.5"/><circle cx="5" cy="19" r="2" stroke={c} strokeWidth="1.5"/><circle cx="19" cy="19" r="2" stroke={c} strokeWidth="1.5"/><path d="M12 7v4M12 11l-5 6M12 11l5 6" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>,
  treatment: c => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 2v6h6M9 13h6M9 17h4" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>,
  analytics: c => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 20V10M12 20V4M6 20v-6" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  journals: c => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke={c} strokeWidth="1.5" strokeLinecap="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke={c} strokeWidth="1.5" strokeLinecap="round"/><path d="M9 7h6M9 11h4" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>,
  assessments: c => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 11l3 3L22 4" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>,
  copilot: c => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="10" rx="2" stroke={c} strokeWidth="1.5"/><path d="M9 11V7a3 3 0 016 0v4" stroke={c} strokeWidth="1.5" strokeLinecap="round"/><circle cx="9" cy="16" r="1" fill={c}/><circle cx="15" cy="16" r="1" fill={c}/></svg>,
  messages: c => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  referrals: c => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 22V12h6v10" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>,
  link: c => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};
const TABS = [
  { id: 'command', label: 'Command Center' },
  { id: 'roster', label: 'Patient Roster' },
  { id: 'crisis', label: 'Crisis Center' },
  { id: 'appointments', label: 'Appointments' },
  { id: 'session', label: 'Session Workspace' },
  { id: 'treatment', label: 'Treatment Plans' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'journals', label: 'Journal Intelligence' },
  { id: 'assessments', label: 'Assessments' },
  { id: 'copilot', label: 'AI Copilot' },
  { id: 'messages', label: 'Messages' },
  { id: 'referrals', label: 'Hospital Referrals' },
  { id: 'link', label: 'Link Patient' },
];

export default function PsychologistShell({ user, profile, onLogout, onPatientMode }) {
  const [tab, setTab] = useState('command');
  const [patients, setPatients] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [journals, setJournals] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [crisisAlerts, setCrisisAlerts] = useState([]);
  const [hospitalReferrals, setHospitalReferrals] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sideExpanded, setSideExpanded] = useState(false);

  const name = profile?.display_name || profile?.full_name || user?.email?.split('@')[0] || 'Doctor';

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      // Load linked patients
      const { data: links } = await supabase.from('patient_psychologist')
        .select('patient_id, share_code, active, created_at').eq('psychologist_id', user.id).eq('active', true);

      if (links?.length) {
        const patientIds = links.map(l => l.patient_id);
        const [{ data: profiles }, { data: sess }, { data: jour }, { data: appts }] = await Promise.all([
          supabase.from('profiles').select('id, display_name, full_name, email, date_of_birth, gender').in('id', patientIds),
          supabase.from('sessions').select('*').in('user_id', patientIds).order('created_at', { ascending: false }),
          supabase.from('journal_entries').select('*').in('user_id', patientIds).order('created_at', { ascending: false }),
          supabase.from('appointments').select('*').in('patient_id', patientIds).order('scheduled_at', { ascending: true }),
        ]);

        // Enrich patients
        const enriched = (profiles || []).map(p => {
          const link = links.find(l => l.patient_id === p.id);
          const patSessions = (sess || []).filter(s => s.user_id === p.id);
          const patJournals = (jour || []).filter(j => j.user_id === p.id);
          const latest = patSessions[0];
          const prev = patSessions[1];
          const phqTrend = latest && prev ? (latest.phq_score < prev.phq_score ? 'improving' : latest.phq_score > prev.phq_score ? 'deteriorating' : 'stable') : 'unknown';
          const riskLevel = latest ? (latest.phq_score >= 20 ? 'critical' : latest.phq_score >= 15 ? 'high' : latest.phq_score >= 10 ? 'moderate' : 'low') : 'unknown';
          const age = p.date_of_birth ? Math.floor((Date.now() - new Date(p.date_of_birth)) / (365.25 * 24 * 60 * 60 * 1000)) : null;
          const daysSinceSession = latest ? Math.floor((Date.now() - new Date(latest.created_at)) / (24 * 60 * 60 * 1000)) : null;
          const daysSinceJournal = patJournals[0] ? Math.floor((Date.now() - new Date(patJournals[0].created_at)) / (24 * 60 * 60 * 1000)) : null;
          return { ...p, link, sessions: patSessions, journals: patJournals, latest, prev, phqTrend, riskLevel, age, daysSinceSession, daysSinceJournal };
        });

        setPatients(enriched);
        setSessions(sess || []);
        setJournals(jour || []);
        setAppointments(appts || []);

        // Crisis alerts — patients with high/critical risk
        const alerts = enriched.filter(p => p.riskLevel === 'critical' || p.riskLevel === 'high');
        setCrisisAlerts(alerts);
      }

      // Hospital referrals
      const { data: refs } = await supabase.from('cross_referrals')
        .select('*, hospital_patients(full_name, patient_uid, allergies, date_of_birth), hospitals(name, city)')
        .eq('psychologist_id', user.id).order('created_at', { ascending: false });
      setHospitalReferrals(refs || []);

    } catch (e) { console.error(e); }
    setLoading(false);
  }, [user.id]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const openPatient = (patient) => { setSelectedPatient(patient); setTab('roster'); };

  const sharedProps = {
    user, profile, patients, sessions, journals, appointments, crisisAlerts,
    hospitalReferrals, selectedPatient, setSelectedPatient, openPatient,
    reload: loadAll, setTab, S, card, Badge, name,
  };

  const COMPONENTS = {
    command: PP_CommandCenter, roster: PP_Roster, crisis: PP_Crisis,
    appointments: PP_Appointments, session: PP_SessionWorkspace,
    treatment: PP_TreatmentPlans, analytics: PP_Analytics,
    journals: PP_JournalIntelligence, assessments: PP_Assessments,
    copilot: PP_AICopilot, messages: PP_Messages,
    referrals: PP_HospitalReferrals, link: PP_Link,
  };
  const ActiveTab = COMPONENTS[tab] || PP_CommandCenter;
  const criticalCount = crisisAlerts.filter(p => p.riskLevel === 'critical').length;
  const pendingRefs = hospitalReferrals.filter(r => r.status === 'pending').length;

  return (
    <div style={{ fontFamily: "'Satoshi',-apple-system,sans-serif", background: S.bg, minHeight: '100vh', display: 'flex' }}>
      {/* Sidebar */}
      <nav onMouseEnter={() => setSideExpanded(true)} onMouseLeave={() => setSideExpanded(false)}
        style={{ background: S.navy, display: 'flex', flexDirection: 'column', padding: '0', position: 'sticky', top: 0, height: '100vh', zIndex: 20, width: sideExpanded ? 220 : 60, transition: 'width 0.2s ease', overflow: 'hidden', flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: sideExpanded ? '16px 16px' : '16px 12px', borderBottom: '0.5px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#1D4ED8,#0891B2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C9 1.5 4 5 4 10C4 12.8 6.2 15 9 15C11.8 15 14 12.8 14 10C14 5 9 1.5 9 1.5Z" fill="white" opacity="0.9"/><circle cx="9" cy="10" r="2.2" fill="#0C1A2E"/></svg>
          </div>
          {sideExpanded && <div><div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}><span style={{ color: '#93C5FD' }}>Psyche</span>Flow</div><div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>Clinical Portal</div></div>}
        </div>
        {/* Tabs */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {TABS.map(t => {
            const badge = t.id === 'crisis' ? criticalCount : t.id === 'referrals' ? pendingRefs : 0;
            return (
              <div key={t.id} onClick={() => setTab(t.id)} title={t.label}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: sideExpanded ? '9px 16px' : '9px 14px', cursor: 'pointer', background: tab === t.id ? 'rgba(29,78,216,0.3)' : 'transparent', borderLeft: tab === t.id ? '2px solid #1D4ED8' : '2px solid transparent', position: 'relative' }}
                onMouseEnter={e => e.currentTarget.style.background = tab === t.id ? 'rgba(29,78,216,0.3)' : 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = tab === t.id ? 'rgba(29,78,216,0.3)' : 'transparent'}>
                <div style={{ flexShrink: 0, display:'flex', alignItems:'center' }}>{TAB_ICONS[t.id] ? TAB_ICONS[t.id](tab === t.id ? '#fff' : 'rgba(255,255,255,0.45)') : null}</div>
                {sideExpanded && <span style={{ fontSize: 12, fontWeight: tab === t.id ? 600 : 400, color: tab === t.id ? '#fff' : 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>{t.label}</span>}
                {badge > 0 && <div style={{ position: 'absolute', top: 6, left: sideExpanded ? 'auto' : 32, right: sideExpanded ? 12 : 'auto', minWidth: 16, height: 16, borderRadius: 8, background: S.danger, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff', padding: '0 3px' }}>{badge}</div>}
              </div>
            );
          })}
        </div>
        {/* Footer */}
        <div style={{ padding: '12px', borderTop: '0.5px solid rgba(255,255,255,0.08)' }}>
          {onPatientMode && <div onClick={onPatientMode} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 4px', cursor: 'pointer', borderRadius: 6 }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/><path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/></svg>
            {sideExpanded && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Patient view</span>}
          </div>}
          <div onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 4px', cursor: 'pointer', borderRadius: 6 }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {sideExpanded && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Sign out</span>}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <div style={{ background: S.card, borderBottom: `0.5px solid ${S.border}`, padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: S.navy }}>Dr. {name}</div>
            <div style={{ fontSize: 10, color: S.hint }}>{patients.length} patients · {crisisAlerts.length} alerts · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {criticalCount > 0 && <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: '#FEF2F2', border: '1px solid #FECACA' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: S.danger }}/>
              <span style={{ fontSize: 11, fontWeight: 700, color: S.danger }}>{criticalCount} Critical Alert{criticalCount > 1 ? 's' : ''}</span>
            </div>}
            <button onClick={() => setTab('session')} style={{ padding: '7px 14px', background: S.blue, color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Start Session</button>
          </div>
        </div>
        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {loading ? <div style={{ textAlign: 'center', padding: 80, color: S.hint }}>Loading clinical data...</div> : <ActiveTab {...sharedProps} />}
        </div>
      </div>
      <style>{`
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(29,78,216,0.2);border-radius:10px}
      `}</style>
    </div>
  );
}
