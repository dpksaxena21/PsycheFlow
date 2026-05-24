import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { theme as t } from './theme';

const MOODS = [
  { id:'great',   label:'Great',   color:'#15803D', bg:'#F0FDF4', border:'#BBF7D0' },
  { id:'good',    label:'Good',    color:'#1D4ED8', bg:'#EFF6FF', border:'#BFDBFE' },
  { id:'okay',    label:'Okay',    color:'#CA8A04', bg:'#FEFCE8', border:'#FDE68A' },
  { id:'low',     label:'Low',     color:'#EA580C', bg:'#FFF7ED', border:'#FED7AA' },
  { id:'anxious', label:'Anxious', color:'#DC2626', bg:'#FEF2F2', border:'#FECACA' },
];

const MoodFace = ({ id, color, size=28 }) => {
  const c = color;
  const s = size;
  const faces = {
    great: <svg width={s} height={s} viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="13" stroke={c} strokeWidth="1.4"/><circle cx="12" cy="13" r="1.2" fill={c}/><circle cx="20" cy="13" r="1.2" fill={c}/><path d="M11 18C11 18 12.5 21 16 21C19.5 21 21 18 21 18" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><path d="M13 11C13 11 14 10 16 10C18 10 19 11 19 11" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/></svg>,
    good: <svg width={s} height={s} viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="13" stroke={c} strokeWidth="1.4"/><circle cx="12" cy="13.5" r="1.2" fill={c}/><circle cx="20" cy="13.5" r="1.2" fill={c}/><path d="M12 18.5C12 18.5 13.5 20.5 16 20.5C18.5 20.5 20 18.5 20 18.5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>,
    okay: <svg width={s} height={s} viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="13" stroke={c} strokeWidth="1.4"/><circle cx="12" cy="13.5" r="1.2" fill={c}/><circle cx="20" cy="13.5" r="1.2" fill={c}/><path d="M12 19.5H20" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>,
    low: <svg width={s} height={s} viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="13" stroke={c} strokeWidth="1.4"/><circle cx="12" cy="13.5" r="1.2" fill={c}/><circle cx="20" cy="13.5" r="1.2" fill={c}/><path d="M12 20.5C12 20.5 13.5 18 16 18C18.5 18 20 20.5 20 20.5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>,
    anxious: <svg width={s} height={s} viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="13" stroke={c} strokeWidth="1.4"/><path d="M10.5 11.5C11 10.5 12 10 13 10.5" stroke={c} strokeWidth="1.2" strokeLinecap="round"/><path d="M19 10.5C20 10 21 10.5 21.5 11.5" stroke={c} strokeWidth="1.2" strokeLinecap="round"/><circle cx="12" cy="13.5" r="1.2" fill={c}/><circle cx="20" cy="13.5" r="1.2" fill={c}/><path d="M12 19.5C12.8 18.5 14 19 15 18.5C16 18 17 18.5 18 18C19 17.5 20 18.5 20 19.5" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg>,
  };
  return faces[id] || null;
};

const PROMPTS = [
  "How are you feeling right now?",
  "Check in with yourself — how's today going?",
  "Take a breath. How are you doing today?",
  "What's your emotional weather right now?",
];

export default function MoodCheckIn({ userId, onComplete }) {
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [todayMood, setTodayMood] = useState(null);
  const [streak, setStreak] = useState(0);
  const [history, setHistory] = useState([]);
  const [showNote, setShowNote] = useState(false);
  const prompt = PROMPTS[new Date().getDay() % PROMPTS.length];

  useEffect(() => { fetchMoodData(); }, []);

  const fetchMoodData = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase.from('mood_checkins').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(30);
    if (!data) return;
    setHistory(data);
    const todayEntry = data.find(d => d.created_at?.startsWith(today));
    if (todayEntry) { setTodayMood(todayEntry); setSaved(true); }
    let s = 0;
    const dates = [...new Set(data.map(d => d.created_at?.split('T')[0]))].sort().reverse();
    for (let i = 0; i < dates.length; i++) {
      const expected = new Date();
      expected.setDate(expected.getDate() - i);
      if (dates[i] === expected.toISOString().split('T')[0]) s++;
      else break;
    }
    setStreak(s);
  };

  const saveMood = async () => {
    if (!selected) return;
    setLoading(true);
    await supabase.from('mood_checkins').insert({ user_id: userId, mood: selected.id, label: selected.label, color: selected.color, note: note.trim() || null });
    setTodayMood({ mood: selected.id, label: selected.label });
    setSaved(true);
    setLoading(false);
    if (onComplete) onComplete(selected);
  };

  if (saved && todayMood) {
    const mood = MOODS.find(m => m.id === todayMood.mood) || MOODS[1];
    return (
      <div style={{ background: t.bg2, borderRadius:12, padding:16, border:`0.5px solid ${t.border}`, boxShadow: t.card, display:'flex', alignItems:'center', gap:14 }}>
        <div style={{ width:44, height:44, borderRadius:12, background: mood.bg, border:`0.5px solid ${mood.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <MoodFace id={mood.id} color={mood.color} size={28}/>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:600, color: mood.color }}>Feeling {mood.label} today</div>
          <div style={{ fontSize:11, color: t.text3, marginTop:2 }}>{streak > 1 ? `${streak} day streak` : 'Check in daily to build your streak'}</div>
        </div>
        <div style={{ display:'flex', gap:3, alignItems:'flex-end' }}>
          {Array.from({length:7}).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6-i));
            const entry = history.find(h => h.created_at?.startsWith(date.toISOString().split('T')[0]));
            const m = entry ? MOODS.find(m => m.id === entry.mood) : null;
            return <div key={i} style={{ width:5, height: m?18:6, background: m?m.color:t.border, borderRadius:3 }}/>;
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: t.bg2, borderRadius:12, padding:16, border:`0.5px solid ${t.border}`, boxShadow: t.card }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div style={{ fontSize:11, fontWeight:600, color: t.text3, letterSpacing:'0.04em', textTransform:'uppercase' }}>{prompt}</div>
        {streak > 0 && <div style={{ fontSize:11, color: t.blue, fontWeight:600, display:'flex', alignItems:'center', gap:4 }}><div style={{ width:6, height:6, borderRadius:'50%', background: t.blue }}/>{streak} day streak</div>}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:6, marginBottom: showNote?12:0 }}>
        {MOODS.map(mood => (
          <div key={mood.id} onClick={() => { setSelected(mood); setShowNote(true); }}
            style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5, padding:'10px 4px', borderRadius:10, border:`0.5px solid ${selected?.id===mood.id ? mood.color : t.border}`, background: selected?.id===mood.id ? mood.bg : t.bg2, cursor:'pointer', transition:'all 0.15s' }}>
            <MoodFace id={mood.id} color={selected?.id===mood.id ? mood.color : t.text3} size={26}/>
            <span style={{ fontSize:9, fontWeight:500, color: selected?.id===mood.id ? mood.color : t.text3 }}>{mood.label}</span>
          </div>
        ))}
      </div>
      {showNote && selected && (
        <div style={{ marginTop:12 }}>
          <textarea value={note} onChange={e => setNote(e.target.value)}
            placeholder={`What's making you feel ${selected.label.toLowerCase()}? (optional)`}
            rows={2} style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:`0.5px solid ${t.border}`, fontSize:12, fontFamily: t.font, resize:'none', outline:'none', boxSizing:'border-box', color: t.text, lineHeight:1.6, background: t.bg }}
            onFocus={e => e.target.style.borderColor=t.blue} onBlur={e => e.target.style.borderColor=t.border}
          />
          <button onClick={saveMood} disabled={loading}
            style={{ width:'100%', marginTop:8, padding:'10px', background: loading?t.text3:selected.color, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily: t.font }}>
            {loading ? 'Saving...' : `Log ${selected.label} mood`}
          </button>
        </div>
      )}
    </div>
  );
}
