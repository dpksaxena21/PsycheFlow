import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { logAction, ACTIONS } from './audit';
import { theme as t } from './theme';

const TIME_SLOTS = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00'];
const STATUS = { scheduled:{color:'#1D4ED8',bg:'#EFF6FF'}, completed:{color:'#15803D',bg:'#F0FDF4'}, cancelled:{color:'#DC2626',bg:'#FEF2F2'} };

export default function Appointments({ user, psychologistId }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    const { data } = await supabase.from('appointments').select('*')
      .or(`patient_id.eq.${user.id},psychologist_id.eq.${user.id}`)
      .order('scheduled_at', { ascending: true });
    setAppointments(data || []);
    setLoading(false);
  };

  const bookAppointment = async () => {
    if (!selectedDate || !selectedTime) { setMsg('Please select a date and time.'); setMsgType('error'); return; }
    if (!psychologistId) { setMsg('You must be linked to a psychologist first.'); setMsgType('error'); return; }
    setBooking(true);
    const scheduledAt = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();
    const { error } = await supabase.from('appointments').insert({ patient_id: user.id, psychologist_id: psychologistId, scheduled_at: scheduledAt, notes, status: 'scheduled' });
    if (error) { setMsg('Booking failed: ' + error.message); setMsgType('error'); }
    else {
      logAction(user.id, ACTIONS.APPOINTMENT_BOOKED, 'appointments', { psychologist_id: psychologistId });
      setMsg('Appointment booked successfully.'); setMsgType('success');
      setSelectedDate(''); setSelectedTime(''); setNotes('');
      fetchAppointments();
    }
    setBooking(false);
  };

  const cancelAppointment = async (id) => {
    await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id);
    fetchAppointments();
  };

  const upcoming = appointments.filter(a => a.status === 'scheduled' && new Date(a.scheduled_at) >= new Date());
  const past = appointments.filter(a => a.status !== 'scheduled' || new Date(a.scheduled_at) < new Date());

  const inp = { width:'100%', padding:'10px 13px', borderRadius:8, border:`0.5px solid ${t.border}`, fontSize:13, fontFamily:t.font, boxSizing:'border-box', color:t.navy, background:t.bg, outline:'none' };

  return (
    <div style={{ paddingBottom:40, fontFamily:t.font }}>

      {/* Book new */}
      <div style={{ background:t.bg2, borderRadius:12, border:`0.5px solid ${t.border}`, padding:20, marginBottom:20, boxShadow:'0 1px 4px rgba(29,78,216,0.06)' }}>
        <div style={{ fontSize:11, fontWeight:600, color:t.text3, letterSpacing:'0.04em', textTransform:'uppercase', marginBottom:14 }}>Book a session</div>

        {!psychologistId && (
          <div style={{ padding:'10px 14px', background:'#FEF2F2', borderRadius:8, border:'0.5px solid #FECACA', fontSize:12, color:'#DC2626', marginBottom:14 }}>
            You need to be linked to a psychologist first. Generate a share code from the Share tab.
          </div>
        )}

        <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:14 }}>
          <div style={{ flex:1, minWidth:160 }}>
            <div style={{ fontSize:11, fontWeight:600, color:t.text3, marginBottom:6, textTransform:'uppercase', letterSpacing:'0.04em' }}>Date</div>
            <input type="date" value={selectedDate} min={today} onChange={e => setSelectedDate(e.target.value)} style={inp}
              onFocus={e => e.target.style.borderColor=t.blue} onBlur={e => e.target.style.borderColor=t.border}/>
          </div>
          <div style={{ flex:2, minWidth:240 }}>
            <div style={{ fontSize:11, fontWeight:600, color:t.text3, marginBottom:6, textTransform:'uppercase', letterSpacing:'0.04em' }}>Time slot</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {TIME_SLOTS.map(slot => (
                <button key={slot} onClick={() => setSelectedTime(slot)}
                  style={{ padding:'6px 12px', borderRadius:7, border:`0.5px solid ${selectedTime===slot?t.blue:t.border}`, background:selectedTime===slot?t.blue2:t.bg2, color:selectedTime===slot?t.blue:t.text2, fontSize:12, fontWeight:selectedTime===slot?600:400, cursor:'pointer', fontFamily:t.font, transition:'all 0.15s' }}>
                  {slot}
                </button>
              ))}
            </div>
          </div>
        </div>

        <textarea value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="Notes for your psychologist (optional)..."
          style={{ ...inp, resize:'vertical', minHeight:72, marginBottom:14 }}
          onFocus={e => e.target.style.borderColor=t.blue} onBlur={e => e.target.style.borderColor=t.border}/>

        {msg && (
          <div style={{ padding:'8px 12px', borderRadius:8, fontSize:12, marginBottom:12, background: msgType==='success'?'#F0FDF4':'#FEF2F2', color: msgType==='success'?'#15803D':'#DC2626', border:`0.5px solid ${msgType==='success'?'#BBF7D0':'#FECACA'}` }}>
            {msg}
          </div>
        )}

        <button onClick={bookAppointment} disabled={booking||!psychologistId}
          style={{ ...t.btn, opacity: (!psychologistId||booking)?0.5:1 }}>
          {booking ? 'Booking...' : 'Book appointment'}
        </button>
      </div>

      {/* Upcoming */}
      <div style={{ fontSize:11, fontWeight:600, color:t.text3, letterSpacing:'0.04em', textTransform:'uppercase', marginBottom:10 }}>Upcoming sessions</div>
      {loading ? (
        <div style={{ padding:20, textAlign:'center', color:t.text3, fontSize:13 }}>Loading...</div>
      ) : upcoming.length === 0 ? (
        <div style={{ background:t.bg2, borderRadius:12, border:`0.5px solid ${t.border}`, padding:24, textAlign:'center', marginBottom:20 }}>
          <div style={{ fontSize:13, color:t.text3 }}>No upcoming appointments. Book your first session above.</div>
        </div>
      ) : upcoming.map(apt => (
        <div key={apt.id} style={{ background:t.bg2, borderRadius:12, border:`0.5px solid ${t.border}`, padding:'14px 16px', marginBottom:10, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:t.blue2, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <div style={{ fontSize:14, fontWeight:700, color:t.blue, lineHeight:1 }}>{new Date(apt.scheduled_at).getDate()}</div>
              <div style={{ fontSize:8, fontWeight:600, color:t.blue }}>{new Date(apt.scheduled_at).toLocaleString('en-IN',{month:'short'}).toUpperCase()}</div>
            </div>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:t.navy }}>
                {new Date(apt.scheduled_at).toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}
              </div>
              <div style={{ fontSize:11, color:t.text3, marginTop:2 }}>
                {new Date(apt.scheduled_at).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})} · {apt.duration_minutes||50} min
              </div>
              {apt.notes && <div style={{ fontSize:11, color:t.text2, marginTop:3 }}>{apt.notes}</div>}
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ padding:'3px 10px', borderRadius:100, fontSize:10, fontWeight:600, background:STATUS[apt.status]?.bg, color:STATUS[apt.status]?.color }}>{apt.status}</span>
            {apt.patient_id === user.id && (
              <button onClick={() => cancelAppointment(apt.id)}
                style={{ padding:'6px 12px', borderRadius:7, border:`0.5px solid ${t.border}`, background:t.bg2, color:'#DC2626', fontSize:11, cursor:'pointer', fontFamily:t.font }}>
                Cancel
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Past */}
      {past.length > 0 && (
        <>
          <div style={{ fontSize:11, fontWeight:600, color:t.text3, letterSpacing:'0.04em', textTransform:'uppercase', margin:'20px 0 10px' }}>Past sessions</div>
          {past.map(apt => (
            <div key={apt.id} style={{ background:t.bg2, borderRadius:12, border:`0.5px solid ${t.border}`, padding:'12px 16px', marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center', opacity:0.7 }}>
              <div>
                <div style={{ fontSize:12, fontWeight:500, color:t.navy }}>{new Date(apt.scheduled_at).toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'})}</div>
                <div style={{ fontSize:11, color:t.text3 }}>{new Date(apt.scheduled_at).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</div>
              </div>
              <span style={{ padding:'3px 10px', borderRadius:100, fontSize:10, fontWeight:600, background:STATUS[apt.status]?.bg||t.bg, color:STATUS[apt.status]?.color||t.text3 }}>{apt.status}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
