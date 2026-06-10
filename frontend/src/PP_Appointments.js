import React, { useState } from 'react';
import { supabase } from './supabase';
export default function PP_Appointments({ appointments, patients, reload, S, card, Badge, user }) {
  const [view, setView] = useState('upcoming');
  const [form, setForm] = useState({ patient_id: '', date: '', time: '', mode: 'video', duration: 50 });
  const upcoming = appointments.filter(a => a.status === 'scheduled' && new Date(a.scheduled_at) > new Date()).sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
  const past = appointments.filter(a => a.status === 'completed' || new Date(a.scheduled_at) < new Date()).sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at));
  const today = appointments.filter(a => new Date(a.scheduled_at).toDateString() === new Date().toDateString());
  const book = async () => {
    if (!form.patient_id || !form.date || !form.time) return;
    const scheduled_at = new Date(`${form.date}T${form.time}`).toISOString();
    await supabase.from('appointments').insert({ patient_id: form.patient_id, psychologist_id: user.id, scheduled_at, mode: form.mode, duration: form.duration, status: 'scheduled' });
    setForm({ patient_id: '', date: '', time: '', mode: 'video', duration: 50 });
    reload();
  };
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, color: S.navy, fontSize: 20, fontWeight: 700 }}>Appointments</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {['upcoming', 'today', 'past', 'book'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{ padding: '6px 14px', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: view === v ? 700 : 400, background: view === v ? S.blue : 'transparent', color: view === v ? '#fff' : S.muted, cursor: 'pointer', textTransform: 'capitalize' }}>{v === 'book' ? '+ Book' : v}</button>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {[['Upcoming', upcoming.length, S.blue], ['Today', today.length, S.success], ['Completed', past.length, S.muted], ['Total', appointments.length, S.navy]].map(([label, val, color]) => (
          <div key={label} style={{ ...card, padding: '14px 18px' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color }}>{val}</div>
            <div style={{ fontSize: 11, color: S.hint, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>
      {view === 'book' && (
        <div style={{ ...card, maxWidth: 480, marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: S.navy, marginBottom: 16 }}>Book New Appointment</div>
          <div style={{ display: 'grid', gap: 10 }}>
            <div>
              <div style={{ fontSize: 10, color: S.muted, marginBottom: 3 }}>Patient</div>
              <select value={form.patient_id} onChange={e => setForm({ ...form, patient_id: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: `0.5px solid ${S.border}`, fontSize: 12, background: S.bg, color: S.navy, outline: 'none' }}>
                <option value="">Select patient</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.display_name || p.full_name || p.email}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div><div style={{ fontSize: 10, color: S.muted, marginBottom: 3 }}>Date</div><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: `0.5px solid ${S.border}`, fontSize: 12, background: S.bg, color: S.navy, outline: 'none', boxSizing: 'border-box' }}/></div>
              <div><div style={{ fontSize: 10, color: S.muted, marginBottom: 3 }}>Time</div><input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: `0.5px solid ${S.border}`, fontSize: 12, background: S.bg, color: S.navy, outline: 'none', boxSizing: 'border-box' }}/></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div><div style={{ fontSize: 10, color: S.muted, marginBottom: 3 }}>Mode</div>
                <select value={form.mode} onChange={e => setForm({ ...form, mode: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: `0.5px solid ${S.border}`, fontSize: 12, background: S.bg, color: S.navy, outline: 'none' }}>
                  {['video', 'audio', 'in-person', 'chat'].map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div><div style={{ fontSize: 10, color: S.muted, marginBottom: 3 }}>Duration (min)</div><input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: `0.5px solid ${S.border}`, fontSize: 12, background: S.bg, color: S.navy, outline: 'none', boxSizing: 'border-box' }}/></div>
            </div>
            <button onClick={book} disabled={!form.patient_id || !form.date || !form.time} style={{ padding: '10px', background: S.blue, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Book Appointment</button>
          </div>
        </div>
      )}
      <div>
        {(view === 'upcoming' ? upcoming : view === 'today' ? today : past).map(a => {
          const pat = patients.find(p => p.id === a.patient_id);
          return (
            <div key={a.id} style={{ ...card, marginBottom: 10, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: S.navy }}>{new Date(a.scheduled_at).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                <div style={{ fontSize: 11, color: S.muted }}>{new Date(a.scheduled_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} · {a.mode || 'Video'} · {a.duration || 50} min</div>
                {pat && <div style={{ fontSize: 11, color: S.blue, marginTop: 2 }}>{pat.display_name || pat.full_name || pat.email}</div>}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <Badge color={a.status === 'scheduled' ? 'blue' : a.status === 'completed' ? 'green' : 'red'}>{a.status}</Badge>
              </div>
            </div>
          );
        })}
        {(view === 'upcoming' ? upcoming : view === 'today' ? today : past).length === 0 && (
          <div style={{ ...card, textAlign: 'center', padding: 40, color: S.hint }}>No {view} appointments.</div>
        )}
      </div>
    </div>
  );
}
