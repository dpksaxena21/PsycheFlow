import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

export default function AppointmentsList({ psychologistId }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('appointments')
      .select('*')
      .eq('psychologist_id', psychologistId)
      .order('scheduled_at', { ascending: true });
    setAppointments(data || []);
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    await supabase.from('appointments').update({ status }).eq('id', id);
    fetchAppointments();
  };

  const statusColor = { scheduled: '#4F46E5', completed: '#10B981', cancelled: '#EF4444' };

  if (loading) return <p style={{ color:'#6B7280' }}>Loading appointments...</p>;

  if (appointments.length === 0) return (
    <div style={{
      background:'#fff', borderRadius:16, padding:40, textAlign:'center',
      boxShadow:'0 2px 12px rgba(0,0,0,0.06)'
    }}>
      <p style={{ color:'#6B7280', fontSize:15 }}>No appointments yet. Patients can book from their dashboard.</p>
    </div>
  );

  return (
    <div>
      {appointments.map(apt => {
        const patientName = apt.profiles?.display_name || apt.profiles?.full_name || 'Patient';
        return (
          <div key={apt.id} style={{
            background:'#fff', borderRadius:14, padding:'20px 24px',
            boxShadow:'0 2px 8px rgba(0,0,0,0.05)', marginBottom:12
          }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <div style={{ fontSize:16, fontWeight:600, color:'#1e293b' }}>{patientName}</div>
                <div style={{ fontSize:14, color:'#6B7280', marginTop:4 }}>
                  {new Date(apt.scheduled_at).toLocaleDateString('en-IN', {
                    weekday:'long', year:'numeric', month:'long', day:'numeric'
                  })}
                </div>
                <div style={{ fontSize:13, color:'#6B7280', marginTop:2 }}>
                  {new Date(apt.scheduled_at).toLocaleTimeString('en-IN', {
                    hour:'2-digit', minute:'2-digit'
                  })} · {apt.duration_minutes} min
                </div>
                {apt.notes && (
                  <div style={{
                    marginTop:10, padding:'8px 12px', background:'#F8FAFC',
                    borderRadius:8, fontSize:13, color:'#374151'
                  }}>Notes: {apt.notes}</div>
                )}
              </div>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8 }}>
                <span style={{
                  padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:600,
                  background: statusColor[apt.status] + '20',
                  color: statusColor[apt.status]
                }}>{apt.status.toUpperCase()}</span>
                {apt.status === 'scheduled' && (
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={() => updateStatus(apt.id, 'completed')}
                      style={{
                        padding:'6px 14px', borderRadius:8, border:'none',
                        background:'#10B981', color:'#fff', fontSize:13, cursor:'pointer'
                      }}>Complete</button>
                    <button onClick={() => updateStatus(apt.id, 'cancelled')}
                      style={{
                        padding:'6px 14px', borderRadius:8, border:'1px solid #EF4444',
                        background:'#fff', color:'#EF4444', fontSize:13, cursor:'pointer'
                      }}>Cancel</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
