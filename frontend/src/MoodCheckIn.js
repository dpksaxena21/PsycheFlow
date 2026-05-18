import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

const MOODS = [
  { id:'great',   emoji:'😄', label:'Great',   color:'#10B981', bg:'#F0FDF4', border:'#86EFAC' },
  { id:'good',    emoji:'🙂', label:'Good',    color:'#4F46E5', bg:'#EEF2FF', border:'#C7D2FE' },
  { id:'okay',    emoji:'😐', label:'Okay',    color:'#F59E0B', bg:'#FFFBEB', border:'#FDE68A' },
  { id:'low',     emoji:'😔', label:'Low',     color:'#F97316', bg:'#FFF7ED', border:'#FED7AA' },
  { id:'anxious', emoji:'😰', label:'Anxious', color:'#EF4444', bg:'#FEF2F2', border:'#FECACA' },
];

const PROMPTS = [
  "How are you feeling right now?",
  "Check in with yourself — how's today going?",
  "Take a breath. How are you doing today?",
  "What's your emotional weather right now?",
];

export default function MoodCheckIn({ userId, onComplete }) {
  const [selected, setSelected]     = useState(null);
  const [note, setNote]             = useState('');
  const [saved, setSaved]           = useState(false);
  const [loading, setLoading]       = useState(false);
  const [todayMood, setTodayMood]   = useState(null);
  const [streak, setStreak]         = useState(0);
  const [history, setHistory]       = useState([]);
  const [showNote, setShowNote]     = useState(false);
  const prompt = PROMPTS[new Date().getDay() % PROMPTS.length];

  useEffect(() => { fetchMoodData(); }, []);

  const fetchMoodData = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('mood_checkins')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30);

    if (!data) return;
    setHistory(data);

    const todayEntry = data.find(d => d.created_at?.startsWith(today));
    if (todayEntry) {
      setTodayMood(todayEntry);
      setSaved(true);
    }

    // Calculate streak
    let s = 0;
    const dates = [...new Set(data.map(d => d.created_at?.split('T')[0]))].sort().reverse();
    for (let i = 0; i < dates.length; i++) {
      const expected = new Date();
      expected.setDate(expected.getDate() - i);
      const expectedStr = expected.toISOString().split('T')[0];
      if (dates[i] === expectedStr) s++;
      else break;
    }
    setStreak(s);
  };

  const saveMood = async () => {
    if (!selected) return;
    setLoading(true);
    await supabase.from('mood_checkins').insert({
      user_id:  userId,
      mood:     selected.id,
      emoji:    selected.emoji,
      label:    selected.label,
      color:    selected.color,
      note:     note.trim() || null,
    });
    setTodayMood({ mood: selected.id, label: selected.label, emoji: selected.emoji });
    setSaved(true);
    setLoading(false);
    if (onComplete) onComplete(selected);
  };

  // Already checked in today
  if (saved && todayMood) {
    const mood = MOODS.find(m => m.id === todayMood.mood) || MOODS[1];
    return (
      <div style={{ background: mood.bg, borderRadius:20, padding:24,
        border:`1px solid ${mood.border}`, marginBottom:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:36 }}>{todayMood.emoji}</span>
            <div>
              <div style={{ fontSize:15, fontWeight:600, color:'#111827' }}>
                Feeling {todayMood.label} today
              </div>
              <div style={{ fontSize:12, color:'#6B7280', marginTop:2 }}>
                {streak > 1 ? `🔥 ${streak} day streak` : 'Check in daily to build your streak'}
              </div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {/* Mini 7-day chart */}
            <div style={{ display:'flex', gap:3, alignItems:'flex-end' }}>
              {Array.from({length:7}).map((_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (6 - i));
                const dateStr = date.toISOString().split('T')[0];
                const entry = history.find(h => h.created_at?.startsWith(dateStr));
                const m = entry ? MOODS.find(m => m.id === entry.mood) : null;
                return (
                  <div key={i} style={{ width:6, height: m ? 20 : 8,
                    background: m ? m.color : '#E5E7EB',
                    borderRadius:3, opacity: m ? 1 : 0.4 }} />
                );
              })}
            </div>
            <span style={{ fontSize:11, color:'#9CA3AF' }}>7 days</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background:'#fff', borderRadius:20, padding:24,
      border:'1px solid #F3F4F6',
      boxShadow:'0 1px 8px rgba(0,0,0,0.06)', marginBottom:16 }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between',
        alignItems:'center', marginBottom:20 }}>
        <div>
          <p style={{ fontSize:16, fontWeight:600, color:'#111827', margin:'0 0 2px' }}>
            {prompt}
          </p>
          <p style={{ fontSize:12, color:'#9CA3AF', margin:0 }}>
            {streak > 0 ? `🔥 ${streak} day streak — keep it going` : 'Start your daily check-in streak'}
          </p>
        </div>
        {streak > 0 && (
          <div style={{ background:'#FFF7ED', borderRadius:10, padding:'6px 12px',
            border:'1px solid #FED7AA' }}>
            <span style={{ fontSize:18 }}>🔥</span>
            <span style={{ fontSize:14, fontWeight:700, color:'#F97316',
              marginLeft:4 }}>{streak}</span>
          </div>
        )}
      </div>

      {/* Mood Buttons */}
      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        {MOODS.map(mood => (
          <button key={mood.id} onClick={() => { setSelected(mood); setShowNote(true); }}
            style={{
              flex:1, padding:'12px 4px', borderRadius:14,
              border: selected?.id === mood.id
                ? `2px solid ${mood.color}`
                : '2px solid #F3F4F6',
              background: selected?.id === mood.id ? mood.bg : '#FAFAFA',
              cursor:'pointer', transition:'all 0.15s',
              transform: selected?.id === mood.id ? 'translateY(-2px)' : 'translateY(0)',
              boxShadow: selected?.id === mood.id
                ? `0 4px 12px ${mood.color}30` : 'none'
            }}
            onMouseEnter={e => {
              if (selected?.id !== mood.id) {
                e.currentTarget.style.background = mood.bg;
                e.currentTarget.style.borderColor = mood.border;
              }
            }}
            onMouseLeave={e => {
              if (selected?.id !== mood.id) {
                e.currentTarget.style.background = '#FAFAFA';
                e.currentTarget.style.borderColor = '#F3F4F6';
              }
            }}>
            <div style={{ fontSize:24, marginBottom:4 }}>{mood.emoji}</div>
            <div style={{ fontSize:11, color: selected?.id === mood.id
              ? mood.color : '#6B7280', fontWeight:500 }}>
              {mood.label}
            </div>
          </button>
        ))}
      </div>

      {/* Optional Note */}
      {showNote && selected && (
        <div style={{ marginBottom:16 }}>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder={`What's making you feel ${selected.label.toLowerCase()}? (optional)`}
            style={{
              width:'100%', padding:'10px 14px', borderRadius:10,
              border:'1.5px solid #E5E7EB', fontSize:13,
              fontFamily:'-apple-system,sans-serif', resize:'none',
              outline:'none', boxSizing:'border-box', minHeight:72,
              color:'#374151', lineHeight:1.6,
              transition:'border-color 0.15s'
            }}
            onFocus={e => e.target.style.borderColor = selected.color}
            onBlur={e => e.target.style.borderColor = '#E5E7EB'}
          />
        </div>
      )}

      {/* Save Button */}
      {selected && (
        <button onClick={saveMood} disabled={loading}
          style={{
            width:'100%', padding:'12px',
            background: loading ? '#9CA3AF' : selected.color,
            color:'#fff', border:'none', borderRadius:10,
            fontSize:14, fontWeight:600, cursor:'pointer',
            transition:'all 0.15s',
            boxShadow: `0 4px 12px ${selected.color}40`
          }}>
          {loading ? 'Saving...' : `Log ${selected.emoji} ${selected.label} mood`}
        </button>
      )}
    </div>
  );
}