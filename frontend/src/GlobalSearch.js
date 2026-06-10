import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabase';

export default function GlobalSearch({ user, t, onNavigate }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const inputRef = useRef();

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (!query.trim() || query.length < 2) { setResults([]); return; }
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const search = async (q) => {
    setLoading(true);
    const term = q.toLowerCase();
    try {
      const [{ data: sessions }, { data: journals }, { data: appointments }] = await Promise.all([
        supabase.from('sessions').select('id, created_at, phq_score, gad_score').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('journal_entries').select('id, text, created_at').eq('user_id', user.id).ilike('text', `%${q}%`).limit(5),
        supabase.from('appointments').select('id, scheduled_at, mode, status').eq('patient_id', user.id).limit(5),
      ]);
      const r = [
        ...(sessions || []).filter(s => `phq ${s.phq_score} gad ${s.gad_score}`.includes(term) || 'assessment'.includes(term)).map(s => ({ type: 'Assessment', icon: 'assessment', title: `Assessment — PHQ ${s.phq_score}, GAD ${s.gad_score}`, sub: new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), tab: 'assessment' })),
        ...(journals || []).map(j => ({ type: 'Journal', icon: 'journal', title: j.text?.slice(0, 60) + '...', sub: new Date(j.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), tab: 'journal' })),
        ...(appointments || []).filter(a => 'appointment session'.includes(term)).map(a => ({ type: 'Appointment', icon: 'appointments', title: `${a.mode || 'Session'} — ${a.status}`, sub: new Date(a.scheduled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), tab: 'appointments' })),
      ];
      // Add static navigation items
      const navItems = [
        { type: 'Page', icon: 'overview', title: 'Overview Dashboard', tab: 'overview' },
        { type: 'Page', icon: 'wellness', title: 'Wellness Center', tab: 'wellness' },
        { type: 'Page', icon: 'clinical', title: 'Clinical Dashboard', tab: 'clinical' },
        { type: 'Page', icon: 'insights', title: 'AI Insights', tab: 'insights' },
        { type: 'Page', icon: 'therapy', title: 'Therapy & ACT', tab: 'therapy' },
        { type: 'Page', icon: 'profile', title: 'My Profile', tab: 'profile' },
        { type: 'Page', icon: 'messages', title: 'Messages', tab: 'messages' },
      ].filter(n => n.title.toLowerCase().includes(term));
      setResults([...navItems, ...r].slice(0, 8));
    } catch {}
    setLoading(false);
  };

  const ic = t?.blue || '#1D4ED8';
  const bg = t?.bg2 || '#fff';
  const border = t?.border || '#E2EBF6';
  const navy = t?.navy || '#0C1A2E';
  const text3 = t?.text3 || '#94a3b8';

  return (
    <div ref={ref} style={{ position: 'relative', flex: 1, maxWidth: 480 }}>
      <div onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 10, border: `0.5px solid ${border}`, background: t?.bg || '#F8FAFF', cursor: 'text' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke={text3} strokeWidth="1.5"/><path d="M21 21l-4.35-4.35" stroke={text3} strokeWidth="1.5" strokeLinecap="round"/></svg>
        <span style={{ fontSize: 12, color: text3, flex: 1 }}>Search everything... <span style={{ fontSize: 10, opacity: 0.6 }}>⌘K</span></span>
      </div>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, marginTop: 4, background: bg, borderRadius: 12, border: `0.5px solid ${border}`, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', overflow: 'hidden' }}>
          <div style={{ padding: '10px 12px', borderBottom: `0.5px solid ${border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke={ic} strokeWidth="1.5"/><path d="M21 21l-4.35-4.35" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/></svg>
            <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search patients, assessments, journals, pages..."
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, background: 'transparent', color: navy, fontFamily: "'Satoshi',-apple-system,sans-serif" }} autoFocus/>
            {query && <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: text3, fontSize: 16 }}>×</button>}
          </div>
          {loading && <div style={{ padding: '12px 16px', fontSize: 12, color: text3 }}>Searching...</div>}
          {!loading && query.length >= 2 && results.length === 0 && <div style={{ padding: '20px 16px', fontSize: 12, color: text3, textAlign: 'center' }}>No results for "{query}"</div>}
          {!loading && results.length > 0 && (
            <div>
              {results.map((r, i) => (
                <div key={i} onClick={() => { onNavigate(r.tab); setOpen(false); setQuery(''); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer', borderBottom: `0.5px solid ${border}` }}
                  onMouseEnter={e => e.currentTarget.style.background = t?.bg3 || '#EFF6FF'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: t?.bg3 || '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke={ic} strokeWidth="1.5"/></svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: navy, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</div>
                    <div style={{ fontSize: 10, color: text3 }}>{r.type} {r.sub ? '· ' + r.sub : ''}</div>
                  </div>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke={text3} strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
              ))}
            </div>
          )}
          {!query && (
            <div style={{ padding: '8px 0' }}>
              <div style={{ padding: '4px 14px', fontSize: 10, fontWeight: 700, color: text3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quick Navigation</div>
              {['Overview', 'Clinical', 'Wellness', 'Journal', 'Assessments', 'Therapy', 'Messages'].map(page => (
                <div key={page} onClick={() => { onNavigate(page.toLowerCase()); setOpen(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = t?.bg3 || '#EFF6FF'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span style={{ fontSize: 12, color: navy }}>{page}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 10, color: text3 }}>→</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ padding: '8px 14px', borderTop: `0.5px solid ${border}`, display: 'flex', gap: 12 }}>
            <span style={{ fontSize: 10, color: text3 }}>↑↓ navigate</span>
            <span style={{ fontSize: 10, color: text3 }}>↵ select</span>
            <span style={{ fontSize: 10, color: text3 }}>esc close</span>
          </div>
        </div>
      )}
    </div>
  );
}
