import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

export default function Appointments({ user, psychologistId }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [msg, setMsg] = useState('');

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '14:00', '14:30', '15:00', '15:30', '16:00',
    '16:30', '17:00', '17:30', '18:00'
  ];

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('appointments')
      .select('*')
      .or(`patient_id.eq.${user.id},psychologist_id.eq.${user.id}`)
      .order('scheduled_at', { ascending: true });
    setAppointments(data || []);
    setLoading(false);
  };

  const bookAppointment = async () => {
    if (!selectedDate || !selectedTime) {
      setMsg('Please select a date and time.');
      return;
    }
    if (!psychologistId) {
      setMsg('You must be linked to a psychologist first.');
      return;
    }
    setBooking(true);
    const scheduledAt = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();
    const { error } = await supabase.from('appointments').insert({
      patient_id: user.id,
      psychologist_id: psychologistId,
      scheduled_at: scheduledAt,
      notes,
      status: 'scheduled'
    });
    if (error) setMsg('❌ Booking failed: ' + error.message);
    else {
      setMsg('✅ Appointment booked successfully!');
      setSelectedDate('');
      setSelectedTime('');
      setNotes('');
      fetchAppointments();
    }
    setBooking(false);
  };

  const cancelAppointment = async (id) => {
    await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id);
    fetchAppointments();
  };

  const statusColor = { scheduled: '#4F46E5', completed: '#10B981', cancelled: '#EF4444' };
  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={{ padding: '0 0 40px' }}>
      <h2 style={{ color: '#1e293b', margin: '0 0 24px', fontSize: 22 }}>📅 Appointments</h2>

      {/* Book New */}
      <div style={{
        background: '#fff', borderRadius: 16, padding: 28,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 28
      }}>
        <h3 style={{ margin: '0 0 20px', color: '#1e293b', fontSize: 16 }}>Book a Session</h3>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <label style={{ fontSize: 13, color: '#6B7280', display: 'block', marginBottom: 6 }}>Date</label>
            <input type="date" value={selectedDate} min={today}
              onChange={e => setSelectedDate(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10,
                border: '1.5px solid #E5E7EB', fontSize: 14, boxSizing: 'border-box'
              }} />
          </div>
          <div style={{ flex: 2, minWidth: 280 }}>
            <label style={{ fontSize: 13, color: '#6B7280', display: 'block', marginBottom: 6 }}>Time Slot</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {timeSlots.map(t => (
                <button key={t} onClick={() => setSelectedTime(t)}
                  style={{
                    padding: '7px 14px', borderRadius: 8, border: '1.5px solid',
                    borderColor: selectedTime === t ? '#4F46E5' : '#E5E7EB',
                    background: selectedTime === t ? '#EEF2FF' : '#fff',
                    color: selectedTime === t ? '#4F46E5' : '#374151',
                    fontSize: 13, cursor: 'pointer', fontWeight: selectedTime === t ? 600 : 400
                  }}>{t}</button>
              ))}
            </div>
          </div>
        </div>
        <textarea value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="Any notes for your psychologist (optional)..."
          style={{
            width: '100%', padding: '10px 14px', borderRadius: 10,
            border: '1.5px solid #E5E7EB', fontSize: 14, resize: 'vertical',
            minHeight: 80, boxSizing: 'border-box', marginBottom: 16
          }} />
        {msg && <p style={{ color: msg.includes('✅') ? '#10B981' : '#EF4444', fontSize: 14, margin: '0 0 12px' }}>{msg}</p>}
        <button onClick={bookAppointment} disabled={booking}
          style={{
            padding: '12px 28px', borderRadius: 10, border: 'none',
            background: '#4F46E5', color: '#fff', fontSize: 15,
            fontWeight: 600, cursor: 'pointer'
          }}>
          {booking ? 'Booking...' : 'Book Appointment'}
        </button>
      </div>

      {/* Upcoming Appointments */}
      <h3 style={{ color: '#1e293b', margin: '0 0 16px', fontSize: 16 }}>Upcoming Sessions</h3>
      {loading ? <p style={{ color: '#6B7280' }}>Loading...</p> :
        appointments.length === 0 ? (
          <div style={{
            background: '#fff', borderRadius: 16, padding: 40, textAlign: 'center',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
          }}>
            <p style={{ color: '#6B7280', fontSize: 15 }}>No appointments yet. Book your first session above.</p>
          </div>
        ) : appointments.map(apt => (
          <div key={apt.id} style={{
            background: '#fff', borderRadius: 14, padding: '18px 24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: 12,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#1e293b' }}>
                {new Date(apt.scheduled_at).toLocaleDateString('en-IN', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })}
              </div>
              <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
                🕐 {new Date(apt.scheduled_at).toLocaleTimeString('en-IN', {
                  hour: '2-digit', minute: '2-digit'
                })} · {apt.duration_minutes} min session
              </div>
              {apt.notes && <div style={{ fontSize: 13, color: '#374151', marginTop: 6 }}>📝 {apt.notes}</div>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                background: statusColor[apt.status] + '20',
                color: statusColor[apt.status]
              }}>{apt.status.toUpperCase()}</span>
              {apt.status === 'scheduled' && apt.patient_id === user.id && (
                <button onClick={() => cancelAppointment(apt.id)}
                  style={{
                    padding: '6px 14px', borderRadius: 8, border: '1px solid #EF4444',
                    background: '#fff', color: '#EF4444', fontSize: 13, cursor: 'pointer'
                  }}>Cancel</button>
              )}
            </div>
          </div>
        ))
      }
    </div>
  );
}
