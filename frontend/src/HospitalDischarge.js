import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

const CHECKLIST_ITEMS = [
  { id:'vitals_stable', label:'Vitals stable for 24 hours', category:'Clinical' },
  { id:'meds_prescribed', label:'Discharge medications prescribed', category:'Clinical' },
  { id:'follow_up', label:'Follow-up appointment scheduled', category:'Clinical' },
  { id:'patient_education', label:'Patient educated on medications & warning signs', category:'Clinical' },
  { id:'diet_instructions', label:'Diet and activity instructions given', category:'Clinical' },
  { id:'lab_results', label:'All pending lab results reviewed', category:'Clinical' },
  { id:'billing_cleared', label:'Billing cleared / insurance processed', category:'Administrative' },
  { id:'bed_released', label:'Bed release order given to nursing', category:'Administrative' },
  { id:'documents_ready', label:'Discharge summary prepared', category:'Administrative' },
  { id:'patient_consent', label:'Discharge consent signed by patient/attendant', category:'Administrative' },
  { id:'pharmacy_dispensed', label:'Discharge medications dispensed from pharmacy', category:'Pharmacy' },
  { id:'equipment_returned', label:'Hospital equipment returned (if any)', category:'Pharmacy' },
];

export default function HospitalDischarge({ hospital, ipdList, patients, reload, S, card, Badge, isMobile }) {
  const [discharges, setDischarges] = useState([]);
  const [selected, setSelected] = useState(null);
  const [checklist, setChecklist] = useState({});
  const [summary, setSummary] = useState('');
  const [processing, setProcessing] = useState(false);

  const admitted = ipdList.filter(i => i.status === 'admitted');

  useEffect(() => { loadDischarges(); }, [hospital?.id]);

  const loadDischarges = async () => {
    if (!hospital) return;
    const { data } = await supabase.from('discharge_records')
      .select('*, hospital_patients(full_name, patient_uid)')
      .eq('hospital_id', hospital.id)
      .order('created_at', { ascending:false }).limit(20);
    setDischarges(data || []);
  };

  const selectPatient = (ipd) => {
    setSelected(ipd);
    setChecklist({});
    setSummary(`Patient: ${ipd.hospital_patients?.full_name}\nAdmission Date: ${new Date(ipd.admission_date).toLocaleDateString('en-IN')}\nPrimary Diagnosis: ${ipd.diagnosis||'—'}\nTreating Doctor: ${ipd.doctor_name||'—'}\n\nCondition at Discharge:\n\nMedications Prescribed:\n\nFollow-up Instructions:\n\nEmergency Contact: iCall 9152987821`);
  };

  const toggleCheck = (id) => setChecklist(c => ({ ...c, [id]: !c[id] }));

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const allDone = completedCount === CHECKLIST_ITEMS.length;

  const processDischarge = async () => {
    if (!selected || !allDone) return;
    setProcessing(true);
    // Update IPD status
    await supabase.from('ipd_admissions').update({ status:'discharged', discharge_date:new Date().toISOString(), discharge_summary:summary }).eq('id', selected.id);
    // Create discharge record
    await supabase.from('discharge_records').insert({
      hospital_id: hospital.id,
      patient_id: selected.patient_id,
      ipd_id: selected.id,
      checklist: checklist,
      discharge_summary: summary,
      discharged_at: new Date().toISOString(),
    });
    // Release bed
    if (selected.bed_number) {
      await supabase.from('bed_tracking').update({ status:'available', patient_id:null }).eq('hospital_id', hospital.id).eq('bed_number', selected.bed_number);
    }
    setSelected(null);
    setChecklist({});
    setSummary('');
    await loadDischarges();
    reload?.();
    setProcessing(false);
    alert(`${selected.hospital_patients?.full_name} discharged successfully. Bed released.`);
  };

  const categories = [...new Set(CHECKLIST_ITEMS.map(i => i.category))];

  return (
    <div>
      <h2 style={{ margin:'0 0 20px', color:S.navy, fontSize:20, fontWeight:700 }}>Discharge Management</h2>
      <div style={{ display:'grid', gridTemplateColumns:isMobile?'repeat(2,1fr)':'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        {[['Pending Discharge',admitted.length,S.warning],['Discharged Today',discharges.filter(d=>new Date(d.created_at).toDateString()===new Date().toDateString()).length,S.success],['Total Discharges',discharges.length,S.blue],['Avg Stay',admitted.length>0?Math.round(admitted.reduce((s,a)=>s+Math.floor((Date.now()-new Date(a.admission_date))/(24*60*60*1000)),0)/admitted.length)+'d':'—',S.muted]].map(([label,val,color])=>(
          <div key={label} style={{ ...card, padding:'14px 18px', borderLeft:`3px solid ${color}` }}>
            <div style={{ fontSize:24, fontWeight:700, color }}>{val}</div>
            <div style={{ fontSize:11, color:S.muted, marginTop:2 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:selected?'280px 1fr':'1fr', gap:16 }}>
        {/* Admitted patients list */}
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>
            Admitted Patients ({admitted.length})
          </div>
          {admitted.length===0 ? (
            <div style={{ ...card, textAlign:'center', padding:32, color:S.muted, fontSize:12 }}>No admitted patients.</div>
          ) : admitted.map(a => {
            const days = Math.floor((Date.now()-new Date(a.admission_date))/(24*60*60*1000));
            return (
              <div key={a.id} onClick={()=>selectPatient(a)}
                style={{ ...card, cursor:'pointer', padding:'14px 16px', marginBottom:10, borderLeft:`3px solid ${selected?.id===a.id?S.blue:days>=4?S.success:S.border}`, background:selected?.id===a.id?S.lightBlue:undefined }}
                onMouseEnter={e=>e.currentTarget.style.transform='translateY(-1px)'}
                onMouseLeave={e=>e.currentTarget.style.transform=''}>
                <div style={{ fontSize:13, fontWeight:700, color:S.navy }}>{a.hospital_patients?.full_name}</div>
                <div style={{ fontSize:11, color:S.muted, marginTop:2 }}>{a.hospital_patients?.patient_uid} · Bed {a.bed_number||'—'}</div>
                <div style={{ display:'flex', gap:6, marginTop:6 }}>
                  <Badge color={days>=4?'green':'yellow'}>{days} day{days!==1?'s':''}</Badge>
                  {days>=4 && <Badge color="green">Ready for discharge</Badge>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Discharge workflow */}
        {selected && (
          <div>
            <div style={{ ...card, marginBottom:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <div>
                  <div style={{ fontSize:16, fontWeight:700, color:S.navy }}>{selected.hospital_patients?.full_name}</div>
                  <div style={{ fontSize:11, color:S.muted }}>Admitted: {new Date(selected.admission_date).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})} · {Math.floor((Date.now()-new Date(selected.admission_date))/(24*60*60*1000))} days</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:16, fontWeight:700, color:allDone?S.success:S.warning }}>{completedCount}/{CHECKLIST_ITEMS.length}</div>
                  <div style={{ fontSize:10, color:S.muted }}>checklist items</div>
                </div>
              </div>
              {/* Progress bar */}
              <div style={{ height:6, borderRadius:3, background:S.border, marginBottom:16 }}>
                <div style={{ height:6, borderRadius:3, background:allDone?S.success:S.blue, width:(completedCount/CHECKLIST_ITEMS.length*100)+'%', transition:'width 0.3s' }}/>
              </div>
              {/* Checklist by category */}
              {categories.map(cat => (
                <div key={cat} style={{ marginBottom:14 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>{cat}</div>
                  {CHECKLIST_ITEMS.filter(i=>i.category===cat).map(item => (
                    <div key={item.id} onClick={()=>toggleCheck(item.id)}
                      style={{ display:'flex', gap:10, padding:'8px 10px', borderRadius:7, cursor:'pointer', marginBottom:4, background:checklist[item.id]?'#ECFDF5':'transparent', border:`0.5px solid ${checklist[item.id]?'#A7F3D0':S.border}` }}
                      onMouseEnter={e=>e.currentTarget.style.background=checklist[item.id]?'#ECFDF5':S.bg}
                      onMouseLeave={e=>e.currentTarget.style.background=checklist[item.id]?'#ECFDF5':'transparent'}>
                      <div style={{ width:18, height:18, borderRadius:'50%', background:checklist[item.id]?S.success:S.border, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        {checklist[item.id] && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      <span style={{ fontSize:12, color:checklist[item.id]?S.success:S.navy }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Discharge summary */}
            <div style={{ ...card, marginBottom:14 }}>
              <div style={{ fontSize:12, fontWeight:700, color:S.navy, marginBottom:10 }}>Discharge Summary</div>
              <textarea value={summary} onChange={e=>setSummary(e.target.value)} rows={8}
                style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:`0.5px solid ${S.border}`, fontSize:12, background:S.bg, color:S.navy, outline:'none', resize:'vertical', fontFamily:"'Satoshi',-apple-system,sans-serif", lineHeight:1.7, boxSizing:'border-box' }}/>
            </div>

            <button onClick={processDischarge} disabled={!allDone||processing}
              style={{ width:'100%', padding:'12px', background:allDone?S.success:'#e2e8f0', color:allDone?'#fff':S.hint, border:'none', borderRadius:10, fontSize:14, fontWeight:700, cursor:allDone?'pointer':'not-allowed' }}>
              {processing?'Processing...':allDone?`Discharge ${selected.hospital_patients?.full_name}`:`Complete checklist first (${CHECKLIST_ITEMS.length-completedCount} remaining)`}
            </button>
          </div>
        )}
      </div>

      {/* Recent discharges */}
      {discharges.length > 0 && (
        <div style={{ marginTop:24 }}>
          <div style={{ fontSize:12, fontWeight:700, color:S.navy, marginBottom:12 }}>Recent Discharges</div>
          <div style={{ ...card, padding:0, overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr style={{ background:S.bg }}>{['Patient','Discharge Date','Stay','Summary'].map(h=><th key={h} style={{ padding:'9px 14px', fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', textAlign:'left', borderBottom:`0.5px solid ${S.border}` }}>{h}</th>)}</tr></thead>
              <tbody>
                {discharges.slice(0,5).map(d=>(
                  <tr key={d.id} style={{ borderBottom:`0.5px solid ${S.border}` }} onMouseEnter={e=>e.currentTarget.style.background=S.lightBlue} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td style={{ padding:'9px 14px', fontSize:13, fontWeight:600, color:S.navy }}>{d.hospital_patients?.full_name}</td>
                    <td style={{ padding:'9px 14px', fontSize:12, color:S.muted }}>{new Date(d.discharged_at||d.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</td>
                    <td style={{ padding:'9px 14px', fontSize:12, color:S.navy }}>—</td>
                    <td style={{ padding:'9px 14px', fontSize:11, color:S.muted }}>{d.discharge_summary?.slice(0,80)}...</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
