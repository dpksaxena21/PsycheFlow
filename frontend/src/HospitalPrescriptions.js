import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabase';

const DRUG_DB = [
  { name:'Escitalopram', generic:'Escitalopram', brands:['Nexito','Cipralex'], category:'SSRI Antidepressant', strengths:['5mg','10mg','20mg'], controlled:false, interactions:['MAOIs','Linezolid','Tramadol'], serotonin:true },
  { name:'Sertraline', generic:'Sertraline', brands:['Zoloft','Serlift'], category:'SSRI Antidepressant', strengths:['25mg','50mg','100mg'], controlled:false, interactions:['MAOIs','Pimozide'], serotonin:true },
  { name:'Fluoxetine', generic:'Fluoxetine', brands:['Fludac','Prozac'], category:'SSRI Antidepressant', strengths:['10mg','20mg','40mg'], controlled:false, interactions:['MAOIs','Thioridazine'], serotonin:true },
  { name:'Clonazepam', generic:'Clonazepam', brands:['Rivotril','Clonotril'], category:'Benzodiazepine', strengths:['0.25mg','0.5mg','1mg','2mg'], controlled:true, interactions:['Alcohol','Opioids','CNS Depressants'], serotonin:false },
  { name:'Alprazolam', generic:'Alprazolam', brands:['Alprax','Xanax'], category:'Benzodiazepine', strengths:['0.25mg','0.5mg','1mg'], controlled:true, interactions:['Alcohol','Opioids','Itraconazole'], serotonin:false },
  { name:'Olanzapine', generic:'Olanzapine', brands:['Oleanz','Zyprexa'], category:'Atypical Antipsychotic', strengths:['2.5mg','5mg','10mg','15mg','20mg'], controlled:false, interactions:['Carbamazepine','Fluvoxamine'], serotonin:false },
  { name:'Risperidone', generic:'Risperidone', brands:['Sizodon','Risperdal'], category:'Atypical Antipsychotic', strengths:['0.5mg','1mg','2mg','4mg','6mg'], controlled:false, interactions:['Carbamazepine','CYP2D6 inhibitors'], serotonin:false },
  { name:'Quetiapine', generic:'Quetiapine', brands:['Qutan','Seroquel'], category:'Atypical Antipsychotic', strengths:['25mg','50mg','100mg','200mg','300mg','400mg'], controlled:false, interactions:['CYP3A4 inhibitors','Thioridazine'], serotonin:false },
  { name:'Lithium Carbonate', generic:'Lithium', brands:['Lithosun','Eskalith'], category:'Mood Stabilizer', strengths:['150mg','300mg','400mg'], controlled:false, interactions:['NSAIDs','Thiazide diuretics','ACE inhibitors'], serotonin:false },
  { name:'Sodium Valproate', generic:'Valproate', brands:['Valparin','Depakote'], category:'Mood Stabilizer', strengths:['200mg','500mg'], controlled:false, interactions:['Lamotrigine','Carbamazepine','Aspirin'], serotonin:false },
  { name:'Lamotrigine', generic:'Lamotrigine', brands:['Lamitor','Lamictal'], category:'Mood Stabilizer', strengths:['25mg','50mg','100mg','200mg'], controlled:false, interactions:['Valproate','Carbamazepine'], serotonin:false },
  { name:'Methylphenidate', generic:'Methylphenidate', brands:['Ritalin','Concerta'], category:'ADHD Stimulant', strengths:['5mg','10mg','20mg'], controlled:true, interactions:['MAOIs','Antihypertensives'], serotonin:false },
  { name:'Buspirone', generic:'Buspirone', brands:['Buspin','Buspar'], category:'Anxiolytic', strengths:['5mg','10mg','15mg'], controlled:false, interactions:['MAOIs','CYP3A4 inhibitors'], serotonin:true },
  { name:'Mirtazapine', generic:'Mirtazapine', brands:['Mirtaz','Remeron'], category:'NaSSA Antidepressant', strengths:['7.5mg','15mg','30mg','45mg'], controlled:false, interactions:['MAOIs','Alcohol'], serotonin:true },
  { name:'Venlafaxine', generic:'Venlafaxine', brands:['Venlor','Effexor'], category:'SNRI Antidepressant', strengths:['37.5mg','75mg','150mg'], controlled:false, interactions:['MAOIs','Serotonergic drugs'], serotonin:true },
  { name:'Zolpidem', generic:'Zolpidem', brands:['Zolfresh','Ambien'], category:'Sedative/Hypnotic', strengths:['5mg','10mg'], controlled:true, interactions:['CNS Depressants','Alcohol','CYP3A4 inhibitors'], serotonin:false },
  { name:'Melatonin', generic:'Melatonin', brands:['Meloset'], category:'Sleep Aid', strengths:['3mg','5mg','10mg'], controlled:false, interactions:['Anticoagulants','Immunosuppressants'], serotonin:false },
  { name:'Aripiprazole', generic:'Aripiprazole', brands:['Arip','Abilify'], category:'Atypical Antipsychotic', strengths:['5mg','10mg','15mg','20mg'], controlled:false, interactions:['CYP2D6 inhibitors','CYP3A4 inhibitors'], serotonin:false },
];

const CONDITION_PACKS = {
  'Moderate Depression': ['Escitalopram 10mg OD after breakfast 30 days','Clonazepam 0.5mg OD at bedtime 14 days'],
  'Severe Depression': ['Sertraline 50mg OD after breakfast 30 days','Mirtazapine 15mg OD at bedtime 30 days'],
  'Generalized Anxiety': ['Escitalopram 10mg OD after breakfast 30 days','Buspirone 10mg BD after meals 30 days'],
  'Bipolar Disorder': ['Sodium Valproate 500mg BD after meals 30 days','Quetiapine 25mg OD at bedtime 30 days'],
  'ADHD': ['Methylphenidate 10mg BD morning & afternoon 30 days'],
  'Psychosis': ['Olanzapine 5mg OD at bedtime 30 days','Risperidone 1mg BD after meals 30 days'],
  'Insomnia': ['Melatonin 5mg OD at bedtime 30 days','Clonazepam 0.5mg OD at bedtime 14 days'],
};

const FREQ_OPTIONS = ['OD (Once Daily)','BD (Twice Daily)','TDS (Three Times Daily)','QID (Four Times Daily)','SOS (As Needed)','OW (Once Weekly)','OM (Once Monthly)'];
const TIMING_OPTIONS = ['Before Breakfast','After Breakfast','Before Lunch','After Lunch','Before Dinner','After Dinner','At Bedtime','Early Morning','Custom'];
const DURATION_OPTIONS = ['3 days','5 days','7 days','14 days','1 month','2 months','3 months','6 months','Continue till review'];

const EMPTY_MED = { drugName:'', strength:'', frequency:'OD (Once Daily)', timing:'After Breakfast', duration:'1 month', quantity:'', instructions:'', controlled:false };

function checkInteractions(drugs) {
  const alerts = [];
  const serotDrugs = drugs.filter(d => { const db = DRUG_DB.find(x=>x.name===d.drugName); return db?.serotonin; });
  if (serotDrugs.length >= 2) alerts.push({ level:'high', msg:`Serotonin Syndrome Risk: ${serotDrugs.map(d=>d.drugName).join(' + ')} — multiple serotonergic agents combined` });
  const benzos = drugs.filter(d => { const db = DRUG_DB.find(x=>x.name===d.drugName); return db?.category?.includes('Benzodiazepine'); });
  if (benzos.length >= 2) alerts.push({ level:'high', msg:`Multiple Benzodiazepines: ${benzos.map(d=>d.drugName).join(' + ')} — CNS depression risk` });
  drugs.forEach(d => {
    const db = DRUG_DB.find(x=>x.name===d.drugName);
    if (!db) return;
    drugs.forEach(d2 => {
      if (d.drugName === d2.drugName) return;
      if (db.interactions.some(i => d2.drugName.toLowerCase().includes(i.toLowerCase()) || i.toLowerCase().includes(d2.drugName.toLowerCase()))) {
        alerts.push({ level:'moderate', msg:`Interaction: ${d.drugName} ↔ ${d2.drugName}` });
      }
    });
  });
  return [...new Map(alerts.map(a=>[a.msg,a])).values()];
};

export default function HospitalPrescriptions({ hospital, patients, S, card, Badge, isMobile }) {
  const [view, setView] = useState('list'); // list | create | timeline
  const [prescriptions, setPrescriptions] = useState([]);
  const [selPatient, setSelPatient] = useState(null);
  const [meds, setMeds] = useState([{ ...EMPTY_MED }]);
  const [rxForm, setRxForm] = useState({ diagnosis:'', instructions:'', follow_up:'14 days', doctor_name:'', notes:'' });
  const [drugSearch, setDrugSearch] = useState('');
  const [searchIdx, setSearchIdx] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [allergyAlert, setAllergyAlert] = useState([]);
  const [saving, setSaving] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [filter, setFilter] = useState('');
  const searchRef = useRef();

  useEffect(() => { loadPrescriptions(); }, [hospital]);
  useEffect(() => {
    const ia = checkInteractions(meds.filter(m=>m.drugName));
    setInteractions(ia);
    if (selPatient?.allergies) {
      const allergies = (selPatient.allergies||'').toLowerCase().split(',').map(a=>a.trim());
      const alerts = meds.filter(m => m.drugName && allergies.some(a => m.drugName.toLowerCase().includes(a) || a.includes(m.drugName.toLowerCase())));
      setAllergyAlert(alerts);
    }
  }, [meds, selPatient]);

  const loadPrescriptions = async () => {
    if (!hospital) return;
    const { data } = await supabase.from('prescriptions')
      .select('*, hospital_patients(full_name, patient_uid, date_of_birth, allergies, gender)')
      .eq('hospital_id', hospital.id).order('created_at', { ascending:false });
    setPrescriptions(data||[]);
  };

  const loadPatientHistory = async (patientId) => {
    const { data } = await supabase.from('prescriptions').select('*').eq('patient_id', patientId).order('created_at', { ascending:false }).limit(5);
    return data||[];
  };

  const selectPatient = async (p) => {
    setSelPatient(p);
    // AI suggestions based on diagnosis
    if (p.latest_diagnosis || rxForm.diagnosis) {
      const diag = rxForm.diagnosis || p.latest_diagnosis || '';
      const pack = Object.entries(CONDITION_PACKS).find(([key]) => diag.toLowerCase().includes(key.toLowerCase()));
      if (pack) setAiSuggestions(pack[1]);
    }
  };

  const applyPack = (packName) => {
    const pack = CONDITION_PACKS[packName];
    if (!pack) return;
    const newMeds = pack.map(med => {
      const parts = med.split(' ');
      const drug = DRUG_DB.find(d => med.includes(d.name));
      return { drugName:drug?.name||parts[0], strength:parts[1]||'', frequency:parts[2]||'OD (Once Daily)', timing:'After Breakfast', duration:parts[4]||'1 month', quantity:'', instructions:'', controlled:drug?.controlled||false };
    });
    setMeds(newMeds);
  };

  const copyLastPrescription = async () => {
    if (!selPatient) return;
    const history = await loadPatientHistory(selPatient.id);
    if (history.length > 0 && history[0].drugs) {
      setMeds(history[0].drugs);
    }
  };

  const addMed = () => setMeds(m=>[...m,{...EMPTY_MED}]);
  const removeMed = (i) => setMeds(m=>m.filter((_,idx)=>idx!==i));
  const updateMed = (i, field, val) => {
    const updated = meds.map((m,idx)=>idx===i?{...m,[field]:val}:m);
    if (field==='drugName') {
      const db = DRUG_DB.find(d=>d.name===val);
      if (db) updated[i] = { ...updated[i], strength:db.strengths[0], controlled:db.controlled };
    }
    setMeds(updated);
  };

  const drugResults = drugSearch ? DRUG_DB.filter(d=>d.name.toLowerCase().includes(drugSearch.toLowerCase())||d.category.toLowerCase().includes(drugSearch.toLowerCase())||d.brands.some(b=>b.toLowerCase().includes(drugSearch.toLowerCase()))).slice(0,6) : [];

  const save = async () => {
    if (!selPatient||!meds.some(m=>m.drugName)) return;
    setSaving(true);
    const rx = { hospital_id:hospital.id, patient_id:selPatient.id, drugs:meds.filter(m=>m.drugName), diagnosis:rxForm.diagnosis, instructions:rxForm.instructions, follow_up_days:rxForm.follow_up, doctor_name:rxForm.doctor_name, notes:rxForm.notes, status:'active', rx_number:`RX-${Date.now().toString(36).toUpperCase()}` };
    await supabase.from('prescriptions').insert(rx);
    await loadPrescriptions();
    setView('list');
    setMeds([{...EMPTY_MED}]);
    setRxForm({ diagnosis:'', instructions:'', follow_up:'14 days', doctor_name:'', notes:'' });
    setSelPatient(null);
    setSaving(false);
  };

  const printPrescription = (px) => {
    const p = px.hospital_patients;
    const age = p?.date_of_birth ? Math.floor((Date.now()-new Date(p.date_of_birth))/(365.25*24*60*60*1000)) : '—';
    const rxDate = new Date(px.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'});
    const qrData = `PsycheFlow-RX:${px.rx_number||px.id}:${rxDate}:${px.doctor_name||''}`;
    const win = window.open('','_blank');
    win.document.write(`<!DOCTYPE html><html><head><title>Rx — ${p?.full_name}</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box} body{font-family:Arial,sans-serif;padding:32px;max-width:680px;margin:0 auto;color:#0C1A2E;font-size:13px}
      .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #1D4ED8;padding-bottom:14px;margin-bottom:18px}
      .logo{font-size:20px;font-weight:700;color:#1D4ED8} .hospital{font-size:12px;color:#666;margin-top:2px}
      .patient-row{display:flex;gap:24px;background:#F8FAFF;padding:12px 16px;border-radius:8px;margin-bottom:18px}
      .label{font-size:10px;text-transform:uppercase;color:#94a3b8;letter-spacing:0.06em;margin-bottom:2px} .value{font-size:13px;font-weight:600}
      .rx-title{font-size:28px;font-weight:700;color:#1D4ED8;margin-bottom:14px;font-family:serif}
      .drug{padding:12px 14px;border:1px solid #E2EBF6;border-radius:8px;margin-bottom:10px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}
      .drug-name{grid-column:1/-1;font-size:15px;font-weight:700;margin-bottom:6px}
      .controlled{background:#FEF2F2;border-color:#FECACA;} .controlled-tag{display:inline-block;background:#DC2626;color:#fff;font-size:10px;padding:1px 6px;border-radius:3px;margin-left:8px}
      .footer{margin-top:32px;border-top:1px solid #E2EBF6;padding-top:16px;display:flex;justify-content:space-between;align-items:flex-end}
      .sig{text-align:right} .sig-line{border-top:1px solid #0C1A2E;padding-top:6px;margin-top:32px;font-size:12px}
      .allergy{background:#FEF2F2;border:1px solid #FECACA;border-radius:6px;padding:6px 10px;margin-bottom:14px;color:#DC2626;font-size:12px;font-weight:600}
      @media print{body{padding:20px}}
    </style></head><body>
    <div class="header">
      <div><div class="logo">PsycheFlow</div><div class="hospital">${hospital?.name||'Hospital'} · ${hospital?.city||''}</div><div style="font-size:11px;color:#666;margin-top:2px">Rx Date: ${rxDate}</div></div>
      <div style="text-align:right"><div style="font-size:11px;color:#666">Rx No: ${px.rx_number||px.id?.slice(0,8)?.toUpperCase()}</div></div>
    </div>
    <div class="patient-row">
      <div><div class="label">Patient</div><div class="value">${p?.full_name||'—'}</div></div>
      <div><div class="label">ID</div><div class="value">${p?.patient_uid||'—'}</div></div>
      <div><div class="label">Age/Gender</div><div class="value">${age} yrs / ${p?.gender||'—'}</div></div>
      ${px.diagnosis?`<div><div class="label">Diagnosis</div><div class="value">${px.diagnosis}</div></div>`:''}
    </div>
    ${p?.allergies?`<div class="allergy">⚠ Known Allergies: ${p.allergies}</div>`:''}
    <div class="rx-title">℞</div>
    ${(px.drugs||[]).map((d,i)=>`
    <div class="drug ${d.controlled?'controlled':''}">
      <div class="drug-name">${i+1}. ${d.drugName} ${d.strength}${d.controlled?'<span class="controlled-tag">CONTROLLED</span>':''}</div>
      <div><div class="label">Frequency</div><div>${d.frequency}</div></div>
      <div><div class="label">Timing</div><div>${d.timing}</div></div>
      <div><div class="label">Duration</div><div>${d.duration}</div></div>
      ${d.quantity?`<div><div class="label">Quantity</div><div>${d.quantity}</div></div>`:''}
      ${d.instructions?`<div style="grid-column:1/-1;color:#666;font-size:12px;margin-top:4px">${d.instructions}</div>`:''}
    </div>`).join('')}
    ${px.instructions?`<div style="margin-top:14px;padding:10px 14px;background:#F8FAFF;border-radius:7px"><strong>Instructions:</strong> ${px.instructions}</div>`:''}
    ${px.follow_up_days?`<div style="margin-top:10px;color:#1D4ED8;font-weight:600;font-size:13px">Follow-up in ${px.follow_up_days}</div>`:''}
    <div class="footer">
      <div style="font-size:11px;color:#999">This prescription is digitally generated by PsycheFlow.<br>Verify at psycheflow.in/verify/${px.rx_number||px.id?.slice(0,8)}</div>
      <div class="sig"><div style="font-size:12px;color:#666">Prescribed by</div><div class="sig-line">${px.doctor_name||'___________________'}</div><div style="font-size:11px;color:#666;margin-top:3px">Signature & Registration No.</div></div>
    </div>
    </body></html>`);
    win.document.close(); setTimeout(()=>win.print(),500);
  };

  const filtered = filter ? prescriptions.filter(p=>p.hospital_patients?.full_name?.toLowerCase().includes(filter.toLowerCase())||p.hospital_patients?.patient_uid?.includes(filter)||(p.diagnosis||'').toLowerCase().includes(filter.toLowerCase())) : prescriptions;

  // ── LIST VIEW ──────────────────────────────────────────────
  if (view==='list') return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <h2 style={{ margin:0, color:S.navy, fontSize:20, fontWeight:700 }}>Prescriptions</h2>
        <div style={{ display:'flex', gap:8 }}>
          <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Search patient / diagnosis..." style={{ padding:'7px 12px', borderRadius:8, border:`0.5px solid ${S.border}`, fontSize:13, outline:'none', background:S.bg, color:S.navy, width:220 }}/>
          <button onClick={()=>setView('create')} style={{ padding:'8px 20px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer' }}>+ New Prescription</button>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:isMobile?'repeat(2,1fr)':'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        {[['Total',prescriptions.length,S.blue],['Today',prescriptions.filter(p=>new Date(p.created_at).toDateString()===new Date().toDateString()).length,S.success],['Active',prescriptions.filter(p=>p.status==='active').length,S.cyan],['Controlled',prescriptions.filter(p=>(p.drugs||[]).some(d=>d.controlled)).length,S.danger]].map(([label,val,color])=>(
          <div key={label} style={{ ...card, padding:'14px 18px', borderLeft:`3px solid ${color}` }}>
            <div style={{ fontSize:26, fontWeight:700, color }}>{val}</div>
            <div style={{ fontSize:11, color:S.muted, marginTop:2 }}>{label}</div>
          </div>
        ))}
      </div>
      {filtered.length===0 ? <div style={{ ...card, textAlign:'center', padding:56, color:S.muted }}>No prescriptions yet. <button onClick={()=>setView('create')} style={{ background:'none', border:'none', color:S.blue, cursor:'pointer', fontWeight:600 }}>Create first prescription →</button></div>
        : filtered.map(px=>(
          <div key={px.id} style={{ ...card, marginBottom:12, padding:'16px 20px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:10 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:4 }}>
                  <div style={{ fontSize:15, fontWeight:700, color:S.navy }}>{px.hospital_patients?.full_name}</div>
                  <span style={{ fontSize:11, color:S.muted }}>{px.hospital_patients?.patient_uid}</span>
                  <Badge color={px.status==='active'?'green':'yellow'}>{px.status}</Badge>
                  {(px.drugs||[]).some(d=>d.controlled)&&<Badge color="red">Controlled Substance</Badge>}
                </div>
                {px.diagnosis&&<div style={{ fontSize:12, color:S.blue, marginBottom:6 }}>Dx: {px.diagnosis}</div>}
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {(px.drugs||[]).map((d,i)=>(
                    <div key={i} style={{ padding:'3px 10px', background:d.controlled?'#FEF2F2':S.bg, borderRadius:100, border:`0.5px solid ${d.controlled?S.danger:S.border}`, fontSize:12, color:d.controlled?S.danger:S.navy }}>
                      {d.drugName} {d.strength} — {d.frequency?.split(' ')[0]}
                    </div>
                  ))}
                </div>
                <div style={{ fontSize:11, color:S.hint, marginTop:6 }}>
                  {new Date(px.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                  {px.doctor_name&&` · Dr. ${px.doctor_name}`}
                  {px.follow_up_days&&` · Follow-up: ${px.follow_up_days}`}
                </div>
              </div>
              <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                <button onClick={()=>printPrescription(px)} style={{ padding:'6px 12px', background:'#ECFDF5', color:S.success, border:'none', borderRadius:7, fontSize:12, fontWeight:600, cursor:'pointer' }}>Print PDF</button>
                <button onClick={async()=>{ setSelPatient(px.hospital_patients); const hist=await loadPatientHistory(px.patient_id); if(hist[0]?.drugs){setMeds(hist[0].drugs);} setRxForm({diagnosis:px.diagnosis||'',instructions:px.instructions||'',follow_up:px.follow_up_days||'14 days',doctor_name:px.doctor_name||'',notes:''});setView('create'); }} style={{ padding:'6px 12px', background:S.lightBlue, color:S.blue, border:'none', borderRadius:7, fontSize:12, fontWeight:600, cursor:'pointer' }}>Renew</button>
              </div>
            </div>
          </div>
        ))
      }
    </div>
  );

  // ── CREATE VIEW ──────────────────────────────────────────────
  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
        <button onClick={()=>setView('list')} style={{ padding:'7px 14px', background:S.bg, border:`0.5px solid ${S.border}`, borderRadius:8, fontSize:12, cursor:'pointer', color:S.muted }}>← Back</button>
        <h2 style={{ margin:0, color:S.navy, fontSize:20, fontWeight:700 }}>New Prescription</h2>
      </div>

      {/* Interaction + allergy alerts */}
      {interactions.map((ia,i)=>(
        <div key={i} style={{ background:ia.level==='high'?'#FEF2F2':'#FFFBEB', border:`1px solid ${ia.level==='high'?'#FECACA':'#FDE68A'}`, borderRadius:9, padding:'10px 14px', marginBottom:10, display:'flex', gap:10, alignItems:'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke={ia.level==='high'?S.danger:S.warning} strokeWidth="1.5"/><line x1="12" y1="9" x2="12" y2="13" stroke={ia.level==='high'?S.danger:S.warning} strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="17" r="1" fill={ia.level==='high'?S.danger:S.warning}/></svg>
          <div><div style={{ fontSize:12, fontWeight:700, color:ia.level==='high'?S.danger:S.warning }}>{ia.level==='high'?'HIGH RISK':'MODERATE'} Drug Interaction</div><div style={{ fontSize:11, color:S.muted }}>{ia.msg}</div></div>
        </div>
      ))}
      {allergyAlert.map((a,i)=>(
        <div key={i} style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:9, padding:'10px 14px', marginBottom:10, display:'flex', gap:10 }}>
          <div style={{ fontSize:12, fontWeight:700, color:S.danger }}>ALLERGY ALERT — Patient is allergic. {a.drugName} may trigger reaction.</div>
        </div>
      ))}

      <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'300px 1fr', gap:16 }}>
        {/* LEFT: Patient + context */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {/* Patient selector */}
          <div style={{ ...card }}>
            <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Patient *</div>
            <select value={selPatient?.id||''} onChange={e=>{ const p=patients.find(x=>x.id===e.target.value); setSelPatient(p||null); if(p) selectPatient(p); }} style={{ width:'100%', padding:'9px 10px', borderRadius:8, border:`0.5px solid ${S.border}`, fontSize:13, background:S.bg, color:S.navy, outline:'none', marginBottom:8 }}>
              <option value="">Select patient</option>
              {patients.map(p=><option key={p.id} value={p.id}>{p.full_name} ({p.patient_uid})</option>)}
            </select>
            {selPatient && (
              <div>
                {selPatient.allergies&&<div style={{ padding:'5px 8px', background:'#FEF2F2', borderRadius:6, fontSize:11, color:S.danger, fontWeight:600, marginBottom:6 }}>⚠ Allergies: {selPatient.allergies}</div>}
                {[['PHQ-9',selPatient.latest?.phq_score],['GAD-7',selPatient.latest?.gad_score],['Risk',selPatient.riskLevel]].filter(x=>x[1]).map(([label,val])=>(
                  <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:`0.5px solid ${S.border}` }}>
                    <span style={{ fontSize:11, color:S.muted }}>{label}</span>
                    <span style={{ fontSize:11, fontWeight:700, color:S.navy, textTransform:'capitalize' }}>{val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Prescription details */}
          <div style={{ ...card }}>
            <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>Prescription Details</div>
            {[['Diagnosis','diagnosis','text','Major Depressive Disorder'],['Doctor Name','doctor_name','text','Dr. ']].map(([label,key,type,ph])=>(
              <div key={key} style={{ marginBottom:10 }}>
                <div style={{ fontSize:10, color:S.muted, marginBottom:3 }}>{label}</div>
                <input type={type} value={rxForm[key]} onChange={e=>setRxForm({...rxForm,[key]:e.target.value})} placeholder={ph} style={{ width:'100%', padding:'8px 10px', borderRadius:7, border:`0.5px solid ${S.border}`, fontSize:13, background:S.bg, color:S.navy, outline:'none', boxSizing:'border-box' }}/>
              </div>
            ))}
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:10, color:S.muted, marginBottom:3 }}>Follow-up</div>
              <select value={rxForm.follow_up} onChange={e=>setRxForm({...rxForm,follow_up:e.target.value})} style={{ width:'100%', padding:'8px 10px', borderRadius:7, border:`0.5px solid ${S.border}`, fontSize:13, background:S.bg, color:S.navy, outline:'none' }}>
                {['7 days','14 days','1 month','2 months','3 months','As needed'].map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize:10, color:S.muted, marginBottom:3 }}>Special Instructions</div>
              <textarea value={rxForm.instructions} onChange={e=>setRxForm({...rxForm,instructions:e.target.value})} rows={2} placeholder="Avoid alcohol, take with food..." style={{ width:'100%', padding:'8px 10px', borderRadius:7, border:`0.5px solid ${S.border}`, fontSize:12, background:S.bg, color:S.navy, outline:'none', resize:'none', fontFamily:"'Satoshi',-apple-system,sans-serif", boxSizing:'border-box' }}/>
            </div>
          </div>

          {/* Quick packs */}
          <div style={{ ...card }}>
            <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Quick Packs</div>
            <div style={{ marginBottom:6 }}>
              <button onClick={copyLastPrescription} style={{ width:'100%', padding:'7px', background:S.bg, color:S.blue, border:`0.5px solid ${S.border}`, borderRadius:7, fontSize:12, cursor:'pointer', fontWeight:600, marginBottom:6 }}>Copy Last Prescription</button>
            </div>
            {Object.keys(CONDITION_PACKS).map(pack=>(
              <div key={pack} onClick={()=>applyPack(pack)} style={{ padding:'7px 10px', borderRadius:7, marginBottom:4, cursor:'pointer', border:`0.5px solid ${S.border}`, fontSize:12, color:S.navy }}
                onMouseEnter={e=>{e.currentTarget.style.background=S.lightBlue;e.currentTarget.style.borderColor=S.blue;}}
                onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.borderColor=S.border;}}>
                {pack}
              </div>
            ))}
          </div>

          {/* AI Suggestions */}
          {aiSuggestions.length>0&&(
            <div style={{ ...card, borderColor:S.blue }}>
              <div style={{ fontSize:11, fontWeight:700, color:S.blue, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>AI Suggestion</div>
              <div style={{ fontSize:12, color:S.muted, marginBottom:8 }}>Based on diagnosis:</div>
              {aiSuggestions.map((s,i)=><div key={i} style={{ fontSize:12, color:S.navy, padding:'4px 0' }}>• {s}</div>)}
            </div>
          )}
        </div>

        {/* RIGHT: Medication builder */}
        <div>
          <div style={{ ...card, marginBottom:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <div style={{ fontSize:13, fontWeight:700, color:S.navy }}>Medications</div>
              <button onClick={addMed} style={{ padding:'5px 12px', background:S.lightBlue, color:S.blue, border:'none', borderRadius:7, fontSize:12, cursor:'pointer', fontWeight:600 }}>+ Add Drug</button>
            </div>
            {meds.map((med, idx)=>(
              <div key={idx} style={{ background:S.bg, borderRadius:10, padding:16, marginBottom:12, border:`0.5px solid ${med.controlled?S.danger:S.border}`, position:'relative' }}>
                {med.controlled&&<div style={{ position:'absolute', top:8, right:8, padding:'2px 8px', background:'#FEF2F2', borderRadius:4, fontSize:10, fontWeight:700, color:S.danger }}>CONTROLLED</div>}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                  {/* Drug search */}
                  <div style={{ position:'relative', gridColumn:'1/-1' }}>
                    <div style={{ fontSize:10, color:S.muted, marginBottom:3, textTransform:'uppercase', fontWeight:600 }}>Drug Name *</div>
                    <input ref={searchIdx===idx?searchRef:null}
                      value={searchIdx===idx?drugSearch:med.drugName}
                      onChange={e=>{setDrugSearch(e.target.value);setSearchIdx(idx);updateMed(idx,'drugName',e.target.value);}}
                      onFocus={()=>{setSearchIdx(idx);setDrugSearch(med.drugName);}}
                      onBlur={()=>setTimeout(()=>setSearchIdx(null),200)}
                      placeholder="Search drug name or brand..."
                      style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:`0.5px solid ${S.border}`, fontSize:13, background:'#fff', color:S.navy, outline:'none', boxSizing:'border-box' }}/>
                    {searchIdx===idx&&drugResults.length>0&&(
                      <div style={{ position:'absolute', top:'100%', left:0, right:0, background:'#fff', border:`0.5px solid ${S.border}`, borderRadius:10, zIndex:20, boxShadow:'0 8px 24px rgba(0,0,0,0.12)', maxHeight:240, overflowY:'auto', marginTop:2 }}>
                        {drugResults.map(d=>(
                          <div key={d.name} onMouseDown={()=>{updateMed(idx,'drugName',d.name);updateMed(idx,'strength',d.strengths[0]);updateMed(idx,'controlled',d.controlled);setDrugSearch('');setSearchIdx(null);}}
                            style={{ padding:'10px 14px', cursor:'pointer', borderBottom:`0.5px solid ${S.border}` }}
                            onMouseEnter={e=>e.currentTarget.style.background=S.lightBlue}
                            onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                            <div style={{ display:'flex', justifyContent:'space-between' }}>
                              <div style={{ fontSize:13, fontWeight:700, color:S.navy }}>{d.name} {d.controlled&&<span style={{ fontSize:10, color:S.danger, fontWeight:700 }}>CONTROLLED</span>}</div>
                              <span style={{ fontSize:10, color:S.hint }}>{d.category}</span>
                            </div>
                            <div style={{ fontSize:11, color:S.muted }}>Brands: {d.brands.join(', ')} · {d.strengths.join(', ')}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Strength */}
                  <div>
                    <div style={{ fontSize:10, color:S.muted, marginBottom:3, textTransform:'uppercase', fontWeight:600 }}>Strength</div>
                    <select value={med.strength} onChange={e=>updateMed(idx,'strength',e.target.value)} style={{ width:'100%', padding:'8px 10px', borderRadius:7, border:`0.5px solid ${S.border}`, fontSize:13, background:'#fff', color:S.navy, outline:'none' }}>
                      {(DRUG_DB.find(d=>d.name===med.drugName)?.strengths||[med.strength||'—']).map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                  {/* Frequency */}
                  <div>
                    <div style={{ fontSize:10, color:S.muted, marginBottom:3, textTransform:'uppercase', fontWeight:600 }}>Frequency</div>
                    <select value={med.frequency} onChange={e=>updateMed(idx,'frequency',e.target.value)} style={{ width:'100%', padding:'8px 10px', borderRadius:7, border:`0.5px solid ${S.border}`, fontSize:13, background:'#fff', color:S.navy, outline:'none' }}>
                      {FREQ_OPTIONS.map(f=><option key={f}>{f}</option>)}
                    </select>
                  </div>
                  {/* Timing */}
                  <div>
                    <div style={{ fontSize:10, color:S.muted, marginBottom:3, textTransform:'uppercase', fontWeight:600 }}>Timing</div>
                    <select value={med.timing} onChange={e=>updateMed(idx,'timing',e.target.value)} style={{ width:'100%', padding:'8px 10px', borderRadius:7, border:`0.5px solid ${S.border}`, fontSize:13, background:'#fff', color:S.navy, outline:'none' }}>
                      {TIMING_OPTIONS.map(t=><option key={t}>{t}</option>)}
                    </select>
                  </div>
                  {/* Duration */}
                  <div>
                    <div style={{ fontSize:10, color:S.muted, marginBottom:3, textTransform:'uppercase', fontWeight:600 }}>Duration</div>
                    <select value={med.duration} onChange={e=>updateMed(idx,'duration',e.target.value)} style={{ width:'100%', padding:'8px 10px', borderRadius:7, border:`0.5px solid ${S.border}`, fontSize:13, background:'#fff', color:S.navy, outline:'none' }}>
                      {DURATION_OPTIONS.map(d=><option key={d}>{d}</option>)}
                    </select>
                  </div>
                  {/* Quantity + instructions */}
                  <div>
                    <div style={{ fontSize:10, color:S.muted, marginBottom:3, textTransform:'uppercase', fontWeight:600 }}>Quantity</div>
                    <input value={med.quantity} onChange={e=>updateMed(idx,'quantity',e.target.value)} placeholder="30 tablets" style={{ width:'100%', padding:'8px 10px', borderRadius:7, border:`0.5px solid ${S.border}`, fontSize:13, background:'#fff', color:S.navy, outline:'none', boxSizing:'border-box' }}/>
                  </div>
                  <div style={{ gridColumn:'1/-1' }}>
                    <div style={{ fontSize:10, color:S.muted, marginBottom:3, textTransform:'uppercase', fontWeight:600 }}>Instructions</div>
                    <input value={med.instructions} onChange={e=>updateMed(idx,'instructions',e.target.value)} placeholder="Take regularly, avoid alcohol, monitor BP..." style={{ width:'100%', padding:'8px 10px', borderRadius:7, border:`0.5px solid ${S.border}`, fontSize:13, background:'#fff', color:S.navy, outline:'none', boxSizing:'border-box' }}/>
                  </div>
                </div>
                {meds.length>1&&<button onClick={()=>removeMed(idx)} style={{ position:'absolute', top:10, right:med.controlled?80:10, background:'none', border:'none', color:S.danger, cursor:'pointer', fontSize:12 }}>Remove</button>}
              </div>
            ))}
          </div>

          {/* Sticky action bar */}
          <div style={{ position:'sticky', bottom:0, background:S.bg, padding:'12px 0', borderTop:`0.5px solid ${S.border}`, display:'flex', gap:10 }}>
            <button onClick={save} disabled={saving||!selPatient||!meds.some(m=>m.drugName)}
              style={{ flex:1, padding:'11px', background:(!selPatient||!meds.some(m=>m.drugName))?S.border:S.blue, color:(!selPatient||!meds.some(m=>m.drugName))?S.hint:'#fff', border:'none', borderRadius:9, fontSize:14, fontWeight:700, cursor:'pointer' }}>
              {saving?'Saving...':'Issue Prescription'}
            </button>
            <button onClick={()=>setShowPreview(p=>!p)} style={{ padding:'11px 18px', background:S.lightBlue, color:S.blue, border:'none', borderRadius:9, fontSize:13, cursor:'pointer', fontWeight:600 }}>{showPreview?'Hide':'Preview'}</button>
            <button onClick={()=>setView('list')} style={{ padding:'11px 18px', background:'transparent', color:S.muted, border:`0.5px solid ${S.border}`, borderRadius:9, fontSize:13, cursor:'pointer' }}>Cancel</button>
          </div>

          {/* Live preview */}
          {showPreview&&(
            <div style={{ ...card, marginTop:14, background:'#FFFBF0', border:`0.5px solid #FDE68A` }}>
              <div style={{ fontSize:12, fontWeight:700, color:S.navy, marginBottom:12 }}>Prescription Preview</div>
              {selPatient&&<div style={{ marginBottom:8 }}><strong>Patient:</strong> {selPatient.full_name} · {selPatient.patient_uid}</div>}
              {rxForm.diagnosis&&<div style={{ marginBottom:4 }}><strong>Dx:</strong> {rxForm.diagnosis}</div>}
              {meds.filter(m=>m.drugName).map((m,i)=>(
                <div key={i} style={{ padding:'6px 0', borderBottom:`0.5px solid #FDE68A`, fontSize:13 }}>
                  <strong>{i+1}. {m.drugName} {m.strength}</strong> — {m.frequency?.split(' ')[0]} — {m.timing} — {m.duration}
                  {m.instructions&&<div style={{ fontSize:11, color:S.muted }}>{m.instructions}</div>}
                </div>
              ))}
              {rxForm.follow_up&&<div style={{ marginTop:8, fontSize:12, color:S.blue }}>Follow-up: {rxForm.follow_up}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
