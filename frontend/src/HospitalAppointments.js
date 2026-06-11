import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

const SLOTS = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','14:00','14:30','15:00','15:30','16:00','16:30','17:00'];

export default function HospitalAppointments({ hospital, patients, staff, S, card, Badge, isMobile }) {
  const [appointments, setAppointments] = useState([]);
  const [view, setView] = useState('today');
  const [form, setForm] = useState({ patient_id:'', doctor_id:'', date:'', slot:'', mode:'in-person', type:'consultation', notes:'' });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().slice(0,10);

  useEffect(() => { loadAppointments(); }, [hospital?.id]);

  const loadAppointments = async () => {
    if (!hospital) return;
    const { data } = await supabase.from('hospital_appointments')
      .select('*, hospital_patients(full_name, patient_uid), hospital_staff(name, designation)')
      .eq('hospital_id', hospital.id)
      .order('scheduled_date', { ascending: true });
    setAppointments(data || []);
  };

  const book = async () => {
    if (!form.patient_id || !form.date || !form.slot) return;
    setLoading(true);
    await supabase.from('hospital_appointments').insert({
      hospital_id: hospital.id,
      patient_id: form.patient_id,
      doctor_id: form.doctor_id || null,
      scheduled_date: form.date,
      scheduled_time: form.slot,
      mode: form.mode,
      type: form.type,
      notes: form.notes,
      status: 'scheduled',
    });
    setForm({ patient_id:'', doctor_id:'', date:'', slot:'', mode:'in-person', type:'consultation', notes:'' });
    setShowForm(false);
    await loadAppointments();
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    await supabase.from('hospital_appointments').update({ status }).eq('id', id);
    setAppointments(a => a.map(x => x.id===id ? {...x, status} : x));
  };

  const todayAppts = appointments.filter(a => a.scheduled_date === today);
  const upcoming = appointments.filter(a => a.scheduled_date > today && a.status === 'scheduled');
  const past = appointments.filter(a => a.scheduled_date < today || a.status === 'completed');
  const filtered = view === 'today' ? todayAppts : view === 'upcoming' ? upcoming : past;

  // Slot availability — slots already booked today
  const bookedSlots = todayAppts.filter(a => a.status === 'scheduled').map(a => a.scheduled_time);

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <h2 style={{ margin:0, color:S.navy, fontSize:20, fontWeight:700 }}>Appointments</h2>
        <div style={{ display:'flex', gap:8 }}>
          {['today','upcoming','past'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{ padding:'6px 14px', border:'none', borderRadius:8, fontSize:12, fontWeight:view===v?700:400, background:view===v?S.blue:'transparent', color:view===v?'#fff':S.muted, cursor:'pointer', textTransform:'capitalize' }}>{v}</button>
          ))}
          <button onClick={() => setShowForm(f=>!f)} style={{ padding:'6px 14px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer' }}>+ Book</button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:isMobile?'repeat(2,1fr)':'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        {[['Today',todayAppts.length,S.blue],['Upcoming',upcoming.length,S.success],['Completed',past.filter(a=>a.status==='completed').length,S.muted],['Cancelled',appointments.filter(a=>a.status==='cancelled').length,S.danger]].map(([label,val,color]) => (
          <div key={label} style={{ ...card, padding:'14px 18px', borderLeft:`3px solid ${color}` }}>
            <div style={{ fontSize:24, fontWeight:700, color }}>{val}</div>
            <div style={{ fontSize:11, color:S.muted, marginTop:2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Booking form */}
      {showForm && (
        <div style={{ ...card, marginBottom:20, borderColor:S.blue }}>
          <div style={{ fontSize:12, fontWeight:700, color:S.navy, marginBottom:16 }}>Book New Appointment</div>
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(3,1fr)', gap:12, marginBottom:12 }}>
            <div>
              <div style={{ fontSize:10, color:S.muted, marginBottom:4, textTransform:'uppercase', fontWeight:600 }}>Patient *</div>
              <select value={form.patient_id} onChange={e=>setForm({...form,patient_id:e.target.value})} style={{ width:'100%', padding:'9px 10px', borderRadius:8, border:`0.5px solid ${S.border}`, fontSize:13, background:S.bg, color:S.navy, outline:'none' }}>
                <option value="">Select patient</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.full_name} ({p.patient_uid})</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize:10, color:S.muted, marginBottom:4, textTransform:'uppercase', fontWeight:600 }}>Doctor</div>
              <select value={form.doctor_id} onChange={e=>setForm({...form,doctor_id:e.target.value})} style={{ width:'100%', padding:'9px 10px', borderRadius:8, border:`0.5px solid ${S.border}`, fontSize:13, background:S.bg, color:S.navy, outline:'none' }}>
                <option value="">Select doctor</option>
                {(staff||[]).map(s => <option key={s.id} value={s.id}>{s.name} — {s.designation}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize:10, color:S.muted, marginBottom:4, textTransform:'uppercase', fontWeight:600 }}>Type</div>
              <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} style={{ width:'100%', padding:'9px 10px', borderRadius:8, border:`0.5px solid ${S.border}`, fontSize:13, background:S.bg, color:S.navy, outline:'none' }}>
                {['consultation','follow-up','assessment','therapy','emergency'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize:10, color:S.muted, marginBottom:4, textTransform:'uppercase', fontWeight:600 }}>Date *</div>
              <input type="date" value={form.date} min={today} onChange={e=>setForm({...form,date:e.target.value})} style={{ width:'100%', padding:'9px 10px', borderRadius:8, border:`0.5px solid ${S.border}`, fontSize:13, background:S.bg, color:S.navy, outline:'none', boxSizing:'border-box' }}/>
            </div>
            <div>
              <div style={{ fontSize:10, color:S.muted, marginBottom:4, textTransform:'uppercase', fontWeight:600 }}>Mode</div>
              <select value={form.mode} onChange={e=>setForm({...form,mode:e.target.value})} style={{ width:'100%', padding:'9px 10px', borderRadius:8, border:`0.5px solid ${S.border}`, fontSize:13, background:S.bg, color:S.navy, outline:'none' }}>
                {['in-person','video','phone'].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize:10, color:S.muted, marginBottom:4, textTransform:'uppercase', fontWeight:600 }}>Notes</div>
              <input value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Reason, special requirements..." style={{ width:'100%', padding:'9px 10px', borderRadius:8, border:`0.5px solid ${S.border}`, fontSize:13, background:S.bg, color:S.navy, outline:'none', boxSizing:'border-box' }}/>
            </div>
          </div>
          {/* Time slots */}
          {form.date && (
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:10, color:S.muted, marginBottom:8, textTransform:'uppercase', fontWeight:600 }}>Time Slot *</div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {SLOTS.map(slot => {
                  const booked = form.date===today && bookedSlots.includes(slot);
                  const selected = form.slot===slot;
                  return (
                    <button key={slot} disabled={booked} onClick={() => setForm({...form,slot})}
                      style={{ padding:'7px 12px', borderRadius:7, border:`0.5px solid ${selected?S.blue:booked?S.border:S.border}`, background:selected?S.blue:booked?S.bg:'#fff', color:selected?'#fff':booked?S.hint:S.navy, fontSize:12, fontWeight:selected?700:400, cursor:booked?'not-allowed':'pointer', opacity:booked?0.4:1 }}>
                      {slot}{booked?' ✗':''}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={book} disabled={loading||!form.patient_id||!form.date||!form.slot} style={{ padding:'9px 20px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', opacity:(!form.patient_id||!form.date||!form.slot)?0.6:1 }}>
              {loading?'Booking...':'Confirm Appointment'}
            </button>
            <button onClick={() => setShowForm(false)} style={{ padding:'9px 16px', background:'transparent', color:S.muted, border:`0.5px solid ${S.border}`, borderRadius:8, fontSize:13, cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Appointments list */}
      {filtered.length === 0 ? (
        <div style={{ ...card, textAlign:'center', padding:48, color:S.muted }}>
          No {view} appointments.
          {view==='today' && <div style={{ marginTop:10 }}><button onClick={()=>setShowForm(true)} style={{ padding:'8px 16px', background:S.blue, color:'#fff', border:'none', borderRadius:7, fontSize:12, cursor:'pointer' }}>Book First Appointment</button></div>}
        </div>
      ) : (
        <div style={{ display:'grid', gap:10 }}>
          {filtered.map(a => (
            <div key={a.id} style={{ ...card, padding:'14px 18px', borderLeft:`3px solid ${a.status==='scheduled'?S.blue:a.status==='completed'?S.success:a.status==='cancelled'?S.danger:S.warning}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:10 }}>
                <div style={{ display:'flex', gap:14, alignItems:'center' }}>
                  <div style={{ textAlign:'center', background:S.bg, borderRadius:10, padding:'8px 14px', minWidth:60 }}>
                    <div style={{ fontSize:20, fontWeight:700, color:S.blue }}>{a.scheduled_time}</div>
                    <div style={{ fontSize:10, color:S.muted }}>{new Date(a.scheduled_date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</div>
                  </div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:S.navy }}>{a.hospital_patients?.full_name}</div>
                    <div style={{ fontSize:11, color:S.muted, marginTop:2 }}>
                      {a.hospital_patients?.patient_uid} · {a.type} · {a.mode}
                      {a.hospital_staff && ` · Dr. ${a.hospital_staff.name}`}
                    </div>
                    {a.notes && <div style={{ fontSize:11, color:S.hint, marginTop:3 }}>{a.notes}</div>}
                  </div>
                </div>
                <div style={{ display:'flex', gap:6, alignItems:'center', flexWrap:'wrap' }}>
                  <Badge color={a.status==='scheduled'?'blue':a.status==='completed'?'green':a.status==='cancelled'?'red':'yellow'}>{a.status}</Badge>
                  <Badge color={a.mode==='video'?'purple':a.mode==='phone'?'cyan':'blue'}>{a.mode}</Badge>
                  {a.status==='scheduled' && (
                    <>
                      <button onClick={()=>updateStatus(a.id,'completed')} style={{ padding:'4px 10px', background:'#ECFDF5', color:S.success, border:'none', borderRadius:6, fontSize:11, fontWeight:600, cursor:'pointer' }}>Complete</button>
                      <button onClick={()=>updateStatus(a.id,'cancelled')} style={{ padding:'4px 10px', background:'#FEF2F2', color:S.danger, border:'none', borderRadius:6, fontSize:11, fontWeight:600, cursor:'pointer' }}>Cancel</button>
                      <button onClick={()=>updateStatus(a.id,'no-show')} style={{ padding:'4px 10px', background:'#FFFBEB', color:S.warning, border:'none', borderRadius:6, fontSize:11, fontWeight:600, cursor:'pointer' }}>No Show</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
