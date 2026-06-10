import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

export default function HospitalNursing({ hospital, patients, ipdList, S, card, Badge, isMobile }) {
  const [vitals, setVitals] = useState([]);
  const [medSchedule, setMedSchedule] = useState([]);
  const [handover, setHandover] = useState('');
  const [handoverHistory, setHandoverHistory] = useState([]);
  const [vitalForm, setVitalForm] = useState({ patient_id:'', bp_systolic:'', bp_diastolic:'', pulse:'', temp:'', spo2:'', rr:'', weight:'', notes:'' });
  const [activeTab, setActiveTab] = useState('vitals');
  const [saving, setSaving] = useState(false);
  const admittedPatients = ipdList.filter(i => i.status==='admitted');

  useEffect(() => { loadData(); }, [hospital]);

  const loadData = async () => {
    if (!hospital) return;
    const [{ data: v }, { data: h }] = await Promise.all([
      supabase.from('nursing_vitals').select('*, hospital_patients(full_name, patient_uid)').eq('hospital_id', hospital.id).order('recorded_at', { ascending:false }).limit(50),
      supabase.from('nursing_handovers').select('*').eq('hospital_id', hospital.id).order('created_at', { ascending:false }).limit(10),
    ]);
    setVitals(v || []);
    setHandoverHistory(h || []);
  };

  const saveVitals = async () => {
    if (!vitalForm.patient_id) return;
    setSaving(true);
    await supabase.from('nursing_vitals').insert({
      hospital_id: hospital.id,
      patient_id: vitalForm.patient_id,
      bp_systolic: parseInt(vitalForm.bp_systolic) || null,
      bp_diastolic: parseInt(vitalForm.bp_diastolic) || null,
      pulse: parseInt(vitalForm.pulse) || null,
      temperature: parseFloat(vitalForm.temp) || null,
      spo2: parseInt(vitalForm.spo2) || null,
      respiratory_rate: parseInt(vitalForm.rr) || null,
      weight_kg: parseFloat(vitalForm.weight) || null,
      notes: vitalForm.notes,
      recorded_at: new Date().toISOString(),
    });
    setVitalForm({ patient_id:'', bp_systolic:'', bp_diastolic:'', pulse:'', temp:'', spo2:'', rr:'', weight:'', notes:'' });
    await loadData();
    setSaving(false);
  };

  const saveHandover = async () => {
    if (!handover.trim()) return;
    await supabase.from('nursing_handovers').insert({ hospital_id:hospital.id, notes:handover, shift: new Date().getHours()<12?'Morning':new Date().getHours()<20?'Afternoon':'Night', nurse_name:'Duty Nurse', created_at:new Date().toISOString() });
    setHandover('');
    await loadData();
  };

  const VITAL_FIELDS = [
    { key:'bp_systolic', label:'BP Systolic', unit:'mmHg', normal:'90-140' },
    { key:'bp_diastolic', label:'BP Diastolic', unit:'mmHg', normal:'60-90' },
    { key:'pulse', label:'Pulse', unit:'bpm', normal:'60-100' },
    { key:'temp', label:'Temperature', unit:'°C', normal:'36.1-37.2' },
    { key:'spo2', label:'SpO2', unit:'%', normal:'95-100' },
    { key:'rr', label:'Resp Rate', unit:'breaths/min', normal:'12-20' },
    { key:'weight', label:'Weight', unit:'kg', normal:'—' },
  ];

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h2 style={{ margin:0, color:S.navy, fontSize:20, fontWeight:700 }}>Nursing Module</h2>
        <div style={{ display:'flex', gap:6 }}>
          {['vitals','medication','handover'].map(t => (
            <button key={t} onClick={()=>setActiveTab(t)} style={{ padding:'6px 14px', border:'none', borderRadius:8, fontSize:12, fontWeight:activeTab===t?700:400, background:activeTab===t?S.blue:'transparent', color:activeTab===t?'#fff':S.muted, cursor:'pointer', textTransform:'capitalize' }}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:isMobile?'repeat(2,1fr)':'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        {[['Admitted Patients',admittedPatients.length,S.blue],['Vitals Recorded Today',vitals.filter(v=>new Date(v.recorded_at).toDateString()===new Date().toDateString()).length,S.success],['Handovers Today',handoverHistory.filter(h=>new Date(h.created_at).toDateString()===new Date().toDateString()).length,S.cyan],['Pending Meds',0,S.warning]].map(([label,val,color])=>(
          <div key={label} style={{ ...card, padding:'14px 18px', borderLeft:`3px solid ${color}` }}>
            <div style={{ fontSize:24, fontWeight:700, color }}>{val}</div>
            <div style={{ fontSize:11, color:S.muted, marginTop:2 }}>{label}</div>
          </div>
        ))}
      </div>

      {activeTab==='vitals' && (
        <div>
          {/* Vitals entry form */}
          <div style={{ ...card, marginBottom:20 }}>
            <div style={{ fontSize:12, fontWeight:700, color:S.navy, marginBottom:14 }}>Record Vitals</div>
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:10, color:S.muted, marginBottom:4, textTransform:'uppercase', fontWeight:600 }}>Patient</div>
              <select value={vitalForm.patient_id} onChange={e=>setVitalForm({...vitalForm,patient_id:e.target.value})} style={{ width:'100%', maxWidth:300, padding:'9px 10px', borderRadius:8, border:`0.5px solid ${S.border}`, fontSize:13, background:S.bg, color:S.navy, outline:'none' }}>
                <option value="">Select admitted patient</option>
                {admittedPatients.map(a => <option key={a.id} value={a.patient_id}>{a.hospital_patients?.full_name} — Bed {a.bed_number||'—'}</option>)}
              </select>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'repeat(2,1fr)':'repeat(4,1fr)', gap:10, marginBottom:12 }}>
              {VITAL_FIELDS.map(f => (
                <div key={f.key}>
                  <div style={{ fontSize:10, color:S.muted, marginBottom:3, textTransform:'uppercase', fontWeight:600 }}>{f.label} <span style={{ color:S.hint, fontWeight:400 }}>({f.unit})</span></div>
                  <input type="number" value={vitalForm[f.key]} onChange={e=>setVitalForm({...vitalForm,[f.key]:e.target.value})} placeholder={f.normal}
                    style={{ width:'100%', padding:'8px 10px', borderRadius:7, border:`0.5px solid ${S.border}`, fontSize:13, background:S.bg, color:S.navy, outline:'none', boxSizing:'border-box' }}/>
                </div>
              ))}
            </div>
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:10, color:S.muted, marginBottom:3, textTransform:'uppercase', fontWeight:600 }}>Notes</div>
              <input value={vitalForm.notes} onChange={e=>setVitalForm({...vitalForm,notes:e.target.value})} placeholder="Any observations, concerns..." style={{ width:'100%', padding:'8px 10px', borderRadius:7, border:`0.5px solid ${S.border}`, fontSize:13, background:S.bg, color:S.navy, outline:'none', boxSizing:'border-box' }}/>
            </div>
            <button onClick={saveVitals} disabled={saving||!vitalForm.patient_id} style={{ padding:'9px 20px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>{saving?'Saving...':'Save Vitals'}</button>
          </div>
          {/* Vitals history */}
          <div style={{ ...card, padding:0, overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr style={{ background:S.bg }}>{['Patient','Time','BP','Pulse','Temp','SpO2','RR','Notes'].map(h=><th key={h} style={{ padding:'9px 14px', fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', textAlign:'left', borderBottom:`0.5px solid ${S.border}`, whiteSpace:'nowrap' }}>{h}</th>)}</tr></thead>
              <tbody>
                {vitals.length===0?<tr><td colSpan={8} style={{ padding:40, textAlign:'center', color:S.muted }}>No vitals recorded yet.</td></tr>:vitals.slice(0,20).map(v=>(
                  <tr key={v.id} style={{ borderBottom:`0.5px solid ${S.border}` }} onMouseEnter={e=>e.currentTarget.style.background=S.lightBlue} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td style={{ padding:'8px 14px', fontSize:13, fontWeight:600, color:S.navy }}>{v.hospital_patients?.full_name}</td>
                    <td style={{ padding:'8px 14px', fontSize:11, color:S.muted }}>{new Date(v.recorded_at).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})} {new Date(v.recorded_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</td>
                    <td style={{ padding:'8px 14px', fontSize:12, color:S.navy }}>{v.bp_systolic&&v.bp_diastolic?`${v.bp_systolic}/${v.bp_diastolic}`:'—'}</td>
                    <td style={{ padding:'8px 14px', fontSize:12, color:v.pulse&&(v.pulse<60||v.pulse>100)?S.danger:S.navy }}>{v.pulse||'—'}</td>
                    <td style={{ padding:'8px 14px', fontSize:12, color:v.temperature&&(v.temperature>37.5)?S.danger:S.navy }}>{v.temperature?v.temperature+'°C':'—'}</td>
                    <td style={{ padding:'8px 14px', fontSize:12, color:v.spo2&&v.spo2<95?S.danger:S.success }}>{v.spo2?v.spo2+'%':'—'}</td>
                    <td style={{ padding:'8px 14px', fontSize:12, color:S.navy }}>{v.respiratory_rate||'—'}</td>
                    <td style={{ padding:'8px 14px', fontSize:11, color:S.muted }}>{v.notes||'—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab==='medication' && (
        <div>
          <div style={{ ...card, marginBottom:16 }}>
            <div style={{ fontSize:12, fontWeight:700, color:S.navy, marginBottom:12 }}>Medication Schedule</div>
            <div style={{ fontSize:12, color:S.muted, marginBottom:16 }}>Medication administration records for admitted patients. Linked to pharmacy module.</div>
            {admittedPatients.length===0 ? (
              <div style={{ textAlign:'center', padding:32, color:S.muted, fontSize:12 }}>No admitted patients currently.</div>
            ) : admittedPatients.map(a => (
              <div key={a.id} style={{ padding:'12px 0', borderBottom:`0.5px solid ${S.border}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:S.navy }}>{a.hospital_patients?.full_name}</div>
                    <div style={{ fontSize:11, color:S.muted }}>Bed {a.bed_number||'—'} · Admitted {new Date(a.admission_date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</div>
                  </div>
                  <button style={{ padding:'5px 12px', background:S.lightBlue, color:S.blue, border:'none', borderRadius:6, fontSize:11, cursor:'pointer', fontWeight:600 }}>View Prescriptions</button>
                </div>
              </div>
            ))}
          </div>
          {/* MAR — Medication Administration Record */}
          <div style={{ ...card }}>
            <div style={{ fontSize:12, fontWeight:700, color:S.navy, marginBottom:12 }}>MAR — Medication Administration Record</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
              {['Morning (6am-12pm)','Afternoon (12pm-6pm)','Night (6pm-12am)'].map(shift => (
                <div key={shift} style={{ background:S.bg, borderRadius:8, padding:'12px 14px' }}>
                  <div style={{ fontSize:11, fontWeight:700, color:S.navy, marginBottom:8 }}>{shift}</div>
                  <div style={{ fontSize:11, color:S.muted }}>No medications scheduled</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab==='handover' && (
        <div>
          <div style={{ ...card, marginBottom:16 }}>
            <div style={{ fontSize:12, fontWeight:700, color:S.navy, marginBottom:12 }}>Shift Handover Notes</div>
            <div style={{ marginBottom:8 }}>
              <div style={{ fontSize:10, color:S.muted, marginBottom:4, textTransform:'uppercase', fontWeight:600 }}>Current Shift: {new Date().getHours()<12?'Morning':new Date().getHours()<20?'Afternoon':'Night'}</div>
              <textarea value={handover} onChange={e=>setHandover(e.target.value)} rows={5}
                placeholder={`Handover notes for ${new Date().getHours()<12?'Morning':new Date().getHours()<20?'Afternoon':'Night'} shift...\n\nCover:\n- Critical patients\n- Pending investigations\n- Special instructions\n- Medications due`}
                style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:`0.5px solid ${S.border}`, fontSize:13, background:S.bg, color:S.navy, outline:'none', resize:'vertical', fontFamily:"'Satoshi',-apple-system,sans-serif", boxSizing:'border-box' }}/>
            </div>
            <button onClick={saveHandover} disabled={!handover.trim()} style={{ padding:'9px 20px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>Submit Handover</button>
          </div>
          <div style={{ ...card }}>
            <div style={{ fontSize:12, fontWeight:700, color:S.navy, marginBottom:12 }}>Handover History</div>
            {handoverHistory.length===0 ? <div style={{ textAlign:'center', padding:24, color:S.muted, fontSize:12 }}>No handovers recorded.</div> :
              handoverHistory.map(h => (
                <div key={h.id} style={{ padding:'12px 0', borderBottom:`0.5px solid ${S.border}` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <div style={{ display:'flex', gap:8 }}>
                      <Badge color={h.shift==='Morning'?'blue':h.shift==='Afternoon'?'yellow':'purple'}>{h.shift}</Badge>
                      <span style={{ fontSize:11, color:S.muted }}>{h.nurse_name}</span>
                    </div>
                    <span style={{ fontSize:11, color:S.muted }}>{new Date(h.created_at).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</span>
                  </div>
                  <div style={{ fontSize:12, color:S.navy, lineHeight:1.6, whiteSpace:'pre-line' }}>{h.notes}</div>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}
