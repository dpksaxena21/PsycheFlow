import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';

const useIsMobile = () => {
  const [m, setM] = React.useState(window.innerWidth < 768);
  React.useEffect(() => {
    const h = () => setM(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return m;
};
const S = { blue:'#1D4ED8', navy:'#0C1A2E', bg:'#F8FAFF', card:'#FFFFFF', border:'#E2EBF6', muted:'#3B5998', hint:'#94a3b8', lightBlue:'#EFF6FF', cyan:'#0891B2', danger:'#DC2626', warning:'#D97706', success:'#059669' };
const card = { background:S.card, borderRadius:12, border:'0.5px solid '+S.border, boxShadow:'0 1px 4px rgba(29,78,216,0.06)', padding:24 };
const cardMobile = { ...card, padding:16 };

const Badge = ({ color, children }) => <span style={{ padding:'2px 10px', borderRadius:100, fontSize:11, fontWeight:600, background: color==='red'?'#FEF2F2': color==='yellow'?'#FFFBEB': color==='green'?'#ECFDF5':'#EFF6FF', color: color==='red'?S.danger: color==='yellow'?S.warning: color==='green'?S.success:S.blue }}>{children}</span>;

const priorityColor = p => p==='crisis'?'red': p==='urgent'?'yellow':'green';
const statusColor = s => s==='waiting'?'yellow': s==='in_consultation'?'blue': s==='done'?'green':'red';

export default function HospitalPortal({ user, onLogout }) {
  const isMobile = useIsMobile();
  const [tab, setTab] = useState('dashboard');
  // Patients
  const [patients, setPatients] = useState([]);
  const [patSearch, setPatSearch] = useState('');
  const [selPatient, setSelPatient] = useState(null);
  const [patForm, setPatForm] = useState({ full_name:'', date_of_birth:'', gender:'', phone:'', email:'', address:'', emergency_contact_name:'', emergency_contact_phone:'', blood_group:'', allergies:'', insurance_provider:'', insurance_number:'' });
  const [patLoading, setPatLoading] = useState(false);
  // EHR
  const [ehrRecords, setEhrRecords] = useState([]);
  const [ehrForm, setEhrForm] = useState({ record_type:'consultation', chief_complaint:'', diagnosis:'', notes:'', vitals:'', follow_up_date:'' });
  const [ehrLoading, setEhrLoading] = useState(false);
  const [showEhrForm, setShowEhrForm] = useState(false);
  // IPD
  const [ipdList, setIpdList] = useState([]);
  const [ipdForm, setIpdForm] = useState({ patient_id:'', ward:'', bed_number:'', admitting_doctor:'', diagnosis_on_admission:'' });
  const [ipdLoading, setIpdLoading] = useState(false);
  const [showIpdForm, setShowIpdForm] = useState(false);
  const [hospital, setHospital] = useState(null);
  const [queue, setQueue] = useState([]);
  const [beds, setBeds] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [staff, setStaff] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // OPD Queue form
  const [qForm, setQForm] = useState({ patient_name:'', patient_phone:'', patient_age:'', priority:'normal', notes:'' });
  const [qLoading, setQLoading] = useState(false);

  // Bed tracking form
  const [bForm, setBForm] = useState({ ward_name:'', bed_number:'', patient_name:'', patient_age:'', mental_health_flag:'monitor', flag_reason:'', urgency:'normal', flagged_by_name:'', flagged_by_department:'' });
  const [bLoading, setBLoading] = useState(false);

  // Staff form
  const [sForm, setSForm] = useState({ email:'', role:'psychologist', department:'' });
  const [sLoading, setSLoading] = useState(false);
  const [sMsg, setSMsg] = useState('');

  const loadAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data: hosp } = await supabase.from('hospitals').select('*').eq('admin_id', user.id).single();
    if (!hosp) { setLoading(false); return; }
    setHospital(hosp);

    const today = new Date().toISOString().split('T')[0];
    const [{ data: q }, { data: b }, { data: r }, { data: st }] = await Promise.all([
      supabase.from('opd_queue').select('*').eq('hospital_id', hosp.id).gte('created_at', today).order('created_at', { ascending:true }),
      supabase.from('bed_tracking').select('*').eq('hospital_id', hosp.id).eq('status','pending').order('flagged_at', { ascending:false }),
      supabase.from('referrals').select('*').eq('hospital_id', hosp.id).order('created_at', { ascending:false }),
      supabase.from('hospital_staff').select('*, profiles(display_name, email)').eq('hospital_id', hosp.id),
    ]);
    setQueue(q||[]);
    setBeds(b||[]);
    setReferrals(r||[]);
    setStaff(st||[]);

    // Analytics from sessions table linked to hospital staff
    const staffIds = (st||[]).map(s => s.user_id);
    if (staffIds.length > 0) {
      const { data: sessions } = await supabase.from('sessions').select('phq_score, gad_score, created_at').in('user_id', staffIds);
      if (sessions && sessions.length > 0) {
        const phqDist = { minimal:0, mild:0, moderate:0, severe:0 };
        const gadDist = { minimal:0, mild:0, moderate:0, severe:0 };
        sessions.forEach(s => {
          if (s.phq_score <= 4) phqDist.minimal++;
          else if (s.phq_score <= 9) phqDist.mild++;
          else if (s.phq_score <= 14) phqDist.moderate++;
          else phqDist.severe++;
          if (s.gad_score <= 4) gadDist.minimal++;
          else if (s.gad_score <= 9) gadDist.mild++;
          else if (s.gad_score <= 14) gadDist.moderate++;
          else gadDist.severe++;
        });
        setAnalytics({ total: sessions.length, phqDist, gadDist });
      }
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const loadPatients = async () => {
    if (!hospital) return;
    const { data } = await supabase.from('hospital_patients').select('*').eq('hospital_id', hospital.id).order('created_at', { ascending:false });
    setPatients(data || []);
  };

  const loadEHR = async (patientId) => {
    const { data } = await supabase.from('ehr_records').select('*').eq('patient_id', patientId).order('created_at', { ascending:false });
    setEhrRecords(data || []);
  };

  const loadIPD = async () => {
    if (!hospital) return;
    const { data } = await supabase.from('ipd_admissions').select('*, hospital_patients(full_name, patient_uid)').eq('hospital_id', hospital.id).order('created_at', { ascending:false });
    setIpdList(data || []);
  };

  const genPatientUID = () => {
    const yr = new Date().getFullYear().toString().slice(-2);
    const rand = Math.random().toString(36).substring(2,6).toUpperCase();
    return `PSYP-${yr}-${rand}`;
  };

  const addPatient = async () => {
    if (!patForm.full_name || !hospital) return;
    setPatLoading(true);
    const uid = genPatientUID();
    await supabase.from('hospital_patients').insert({ hospital_id:hospital.id, patient_uid:uid, ...patForm });
    setPatForm({ full_name:'', date_of_birth:'', gender:'', phone:'', email:'', address:'', emergency_contact_name:'', emergency_contact_phone:'', blood_group:'', allergies:'', insurance_provider:'', insurance_number:'' });
    await loadPatients();
    setPatLoading(false);
  };

  const addEHR = async () => {
    if (!selPatient || !ehrForm.chief_complaint || !hospital) return;
    setEhrLoading(true);
    await supabase.from('ehr_records').insert({ hospital_id:hospital.id, patient_id:selPatient.id, doctor_id:user.id, ...ehrForm, vitals: ehrForm.vitals ? { notes: ehrForm.vitals } : {} });
    setEhrForm({ record_type:'consultation', chief_complaint:'', diagnosis:'', notes:'', vitals:'', follow_up_date:'' });
    setShowEhrForm(false);
    await loadEHR(selPatient.id);
    setEhrLoading(false);
  };

  const addIPD = async () => {
    if (!ipdForm.patient_id || !hospital) return;
    setIpdLoading(true);
    await supabase.from('ipd_admissions').insert({ hospital_id:hospital.id, ...ipdForm, status:'admitted' });
    setIpdForm({ patient_id:'', ward:'', bed_number:'', admitting_doctor:'', diagnosis_on_admission:'' });
    setShowIpdForm(false);
    await loadIPD();
    setIpdLoading(false);
  };

  const dischargePatient = async (id, summary) => {
    await supabase.from('ipd_admissions').update({ status:'discharged', discharge_date:new Date().toISOString(), discharge_summary:summary }).eq('id',id);
    await loadIPD();
  };

  // Token generation
  const genToken = () => {
    const existing = queue.map(q => parseInt(q.token_number.replace('PSY-',''))||0);
    const next = existing.length > 0 ? Math.max(...existing)+1 : 1;
    return 'PSY-' + String(next).padStart(3,'0');
  };

  const addToQueue = async () => {
    if (!qForm.patient_name || !hospital) return;
    setQLoading(true);
    const token = genToken();
    await supabase.from('opd_queue').insert({ hospital_id:hospital.id, token_number:token, patient_name:qForm.patient_name, patient_phone:qForm.patient_phone, patient_age:parseInt(qForm.patient_age)||null, priority:qForm.priority, notes:qForm.notes, status:'waiting' });
    // Send SMS if phone provided
    if (qForm.patient_phone && qForm.patient_phone.length >= 10) {
      try {
        await fetch(process.env.REACT_APP_API_URL + '/send-sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: qForm.patient_phone,
            token_number: token,
            hospital_name: hospital.name,
            priority: qForm.priority
          })
        });
      } catch (e) { console.warn('SMS failed:', e); }
    }
    setQForm({ patient_name:'', patient_phone:'', patient_age:'', priority:'normal', notes:'' });
    await loadAll();
    setQLoading(false);
  };

  const updateQueueStatus = async (id, status) => {
    const upd = { status };
    if (status==='in_consultation') upd.called_at = new Date().toISOString();
    if (status==='done') upd.completed_at = new Date().toISOString();
    await supabase.from('opd_queue').update(upd).eq('id',id);
    await loadAll();
  };

  const addBedFlag = async () => {
    if (!bForm.ward_name||!bForm.bed_number||!bForm.patient_name||!hospital) return;
    setBLoading(true);
    await supabase.from('bed_tracking').insert({ hospital_id:hospital.id, ...bForm, patient_age:parseInt(bForm.patient_age)||null, flagged_by:user.id, status:'pending' });
    setBForm({ ward_name:'', bed_number:'', patient_name:'', patient_age:'', mental_health_flag:'monitor', flag_reason:'', urgency:'normal', flagged_by_name:'', flagged_by_department:'' });
    await loadAll();
    setBLoading(false);
  };

  const resolveBed = async (id) => {
    await supabase.from('bed_tracking').update({ status:'reviewed', reviewed_by:user.id, reviewed_at:new Date().toISOString() }).eq('id',id);
    await loadAll();
  };

  const updateReferral = async (id, status) => {
    await supabase.from('referrals').update({ status, assigned_to:user.id }).eq('id',id);
    await loadAll();
  };

  const inviteStaff = async () => {
    if (!sForm.email||!hospital) return;
    setSLoading(true);
    const { data: profile } = await supabase.from('profiles').select('id').eq('email', sForm.email).single();
    if (!profile) { setSMsg('User not found. Ask them to register on PsycheFlow first.'); setSLoading(false); return; }
    await supabase.from('hospital_staff').insert({ hospital_id:hospital.id, user_id:profile.id, role:sForm.role, department:sForm.department });
    setSMsg('Staff member added successfully.');
    setSForm({ email:'', role:'psychologist', department:'' });
    await loadAll();
    setSLoading(false);
  };

  const tabs = [
    { id:'dashboard', label:'Dashboard' },
    { id:'patients', label:'Patients' },
    { id:'ehr', label:'EHR' },
    { id:'ipd', label:'IPD' },
    { id:'queue', label:'OPD Queue' },
    { id:'beds', label:'Bed Tracking' },
    { id:'referrals', label:'Referrals' },
    { id:'analytics', label:'Analytics' },
    { id:'staff', label:'Staff' },
  ];

  const inp = { width:'100%', padding:'9px 12px', borderRadius:8, border:'0.5px solid '+S.border, fontSize:13, boxSizing:'border-box', outline:'none', background:S.bg, color:S.navy, fontFamily:"'Satoshi',-apple-system,sans-serif" };
  const sel = { ...inp, background:S.bg };

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', fontFamily:"'Satoshi',-apple-system,sans-serif", color:S.muted }}>Loading hospital portal...</div>;
  if (!hospital) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', fontFamily:"'Satoshi',-apple-system,sans-serif", color:S.muted }}>Hospital not found. Please contact support.</div>;

  const waiting = queue.filter(q=>q.status==='waiting').length;
  const crisis = beds.filter(b=>b.urgency==='crisis').length;
  const pendingRef = referrals.filter(r=>r.status==='pending').length;

  return (
    <div style={{ fontFamily:"'Satoshi',-apple-system,sans-serif", background:S.bg, minHeight:'100vh' }}>
      {/* Header */}
      <div style={{ background:S.card, borderBottom:'0.5px solid '+S.border, padding: isMobile ? '0 16px' : '0 32px', display:'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', gap:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'12px 0', marginRight: isMobile ? 0 : 32, borderRight: isMobile ? 'none' : '0.5px solid '+S.border, paddingRight: isMobile ? 0 : 32, borderBottom: isMobile ? '0.5px solid '+S.border : 'none', justifyContent:'space-between' }}>
          <div style={{ width:28, height:28, borderRadius:7, background:S.blue, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="15" height="15" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C9 1.5 4 5 4 10C4 12.8 6.2 15 9 15C11.8 15 14 12.8 14 10C14 5 9 1.5 9 1.5Z" fill="white" opacity="0.9"/><circle cx="9" cy="10" r="2.2" fill="#0C1A2E"/></svg>
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:S.navy, letterSpacing:'-0.01em' }}>{hospital.name}</div>
            <div style={{ fontSize:10, color:S.muted }}>{hospital.city} · {hospital.hospital_code}</div>
          </div>
          {isMobile && <button onClick={onLogout} style={{ padding:'6px 12px', background:'transparent', border:'0.5px solid '+S.border, borderRadius:8, fontSize:12, color:S.muted, cursor:'pointer' }}>Sign out</button>}
        </div>
        <div style={{ display:'flex', gap:4, flex:1, overflowX: isMobile ? 'auto' : 'visible', WebkitOverflowScrolling:'touch' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding: isMobile ? '12px 12px' : '18px 16px', border:'none', background:'transparent', fontSize: isMobile ? 12 : 13, whiteSpace:'nowrap', fontWeight: tab===t.id?700:400, color: tab===t.id?S.blue:S.muted, cursor:'pointer', borderBottom: tab===t.id?'2px solid '+S.blue:'2px solid transparent' }}>
              {t.label}
              {t.id==='queue' && waiting>0 && <span style={{ marginLeft:6, background:S.blue, color:'#fff', borderRadius:100, padding:'1px 6px', fontSize:10, fontWeight:700 }}>{waiting}</span>}
              {t.id==='beds' && crisis>0 && <span style={{ marginLeft:6, background:S.danger, color:'#fff', borderRadius:100, padding:'1px 6px', fontSize:10, fontWeight:700 }}>{crisis}</span>}
              {t.id==='referrals' && pendingRef>0 && <span style={{ marginLeft:6, background:S.warning, color:'#fff', borderRadius:100, padding:'1px 6px', fontSize:10, fontWeight:700 }}>{pendingRef}</span>}
            </button>
          ))}
        </div>
        {!isMobile && <button onClick={onLogout} style={{ padding:'8px 16px', background:'transparent', border:'0.5px solid '+S.border, borderRadius:8, fontSize:12, color:S.muted, cursor:'pointer' }}>Sign out</button>}
      </div>

      <div style={{ padding: isMobile ? '16px 12px' : '28px 32px', maxWidth:1200, margin:'0 auto' }}>

        {/* PATIENTS */}
        {tab==='patients' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:12 }}>
              <div>
                <h2 style={{ margin:0, color:S.navy, fontSize:20, fontWeight:700 }}>Patient Registry</h2>
                <div style={{ fontSize:12, color:S.muted, marginTop:2 }}>{patients.length} registered patients</div>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <input value={patSearch} onChange={e=>setPatSearch(e.target.value)} placeholder="Search by name or ID..."
                  style={{ padding:'8px 14px', borderRadius:8, border:'0.5px solid '+S.border, fontSize:13, outline:'none', background:S.bg, color:S.navy, width:220 }}/>
              </div>
            </div>

            {/* Registration Form */}
            <div style={{ ...card, marginBottom:20 }}>
              <div style={{ fontSize:12, fontWeight:700, color:S.muted, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:16 }}>Register New Patient</div>
              <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr':'repeat(3,1fr)', gap:12 }}>
                {[
                  ['Full Name *','full_name','text'],['Date of Birth','date_of_birth','date'],['Gender','gender','select-gender'],
                  ['Phone','phone','tel'],['Email','email','email'],['Blood Group','blood_group','select-blood'],
                  ['Address','address','text'],['Allergies','allergies','text'],['Insurance Provider','insurance_provider','text'],
                  ['Emergency Contact','emergency_contact_name','text'],['Emergency Phone','emergency_contact_phone','tel'],['Insurance Number','insurance_number','text'],
                ].map(([label,key,type]) => (
                  <div key={key}>
                    <div style={{ fontSize:11, fontWeight:600, color:S.navy, marginBottom:4, textTransform:'uppercase', letterSpacing:'0.04em' }}>{label}</div>
                    {type==='select-gender' ? (
                      <select value={patForm[key]} onChange={e=>setPatForm({...patForm,[key]:e.target.value})}
                        style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'0.5px solid '+S.border, fontSize:13, background:S.bg, color:S.navy, outline:'none' }}>
                        <option value="">Select</option>
                        {['Male','Female','Other','Prefer not to say'].map(g=><option key={g}>{g}</option>)}
                      </select>
                    ) : type==='select-blood' ? (
                      <select value={patForm[key]} onChange={e=>setPatForm({...patForm,[key]:e.target.value})}
                        style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'0.5px solid '+S.border, fontSize:13, background:S.bg, color:S.navy, outline:'none' }}>
                        <option value="">Select</option>
                        {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b=><option key={b}>{b}</option>)}
                      </select>
                    ) : (
                      <input type={type} value={patForm[key]} onChange={e=>setPatForm({...patForm,[key]:e.target.value})}
                        style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'0.5px solid '+S.border, fontSize:13, background:S.bg, color:S.navy, outline:'none', boxSizing:'border-box' }}/>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={addPatient} disabled={patLoading||!patForm.full_name}
                style={{ marginTop:16, padding:'10px 24px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                {patLoading ? 'Registering...' : '+ Register Patient'}
              </button>
            </div>

            {/* Patient List */}
            <div style={{ display:'grid', gap:10 }}>
              {patients.filter(p => !patSearch || p.full_name?.toLowerCase().includes(patSearch.toLowerCase()) || p.patient_uid?.includes(patSearch.toUpperCase())).map(p => (
                <div key={p.id} style={{ ...card, padding:16, display:'flex', alignItems:'center', gap:16, cursor:'pointer' }}
                  onClick={() => { setSelPatient(p); loadEHR(p.id); setTab('ehr'); }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=S.blue}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=S.border}>
                  <div style={{ width:44, height:44, borderRadius:'50%', background:S.lightBlue, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, color:S.blue, flexShrink:0 }}>
                    {p.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:S.navy }}>{p.full_name}</div>
                    <div style={{ fontSize:11, color:S.muted, marginTop:2 }}>
                      {p.patient_uid} · {p.gender || 'N/A'} · {p.blood_group || 'N/A'} · {p.phone || 'No phone'}
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    {p.allergies && <Badge color="red">Allergies</Badge>}
                    <div style={{ fontSize:10, color:S.hint, marginTop:4 }}>{new Date(p.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div>
                  </div>
                </div>
              ))}
              {patients.length === 0 && (
                <div style={{ ...card, textAlign:'center', padding:48, color:S.muted, fontSize:13 }}>No patients registered yet. Use the form above to register your first patient.</div>
              )}
            </div>
          </div>
        )}

        {/* EHR */}
        {tab==='ehr' && (
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20, flexWrap:'wrap' }}>
              <button onClick={()=>setTab('patients')} style={{ padding:'6px 14px', background:'#fff', border:'0.5px solid '+S.border, borderRadius:8, cursor:'pointer', fontSize:12, color:S.muted }}>← Patients</button>
              {selPatient ? (
                <div>
                  <h2 style={{ margin:0, color:S.navy, fontSize:18, fontWeight:700 }}>{selPatient.full_name}</h2>
                  <div style={{ fontSize:11, color:S.muted }}>{selPatient.patient_uid} · {selPatient.blood_group||'N/A'} · {selPatient.allergies ? '⚠ '+selPatient.allergies : 'No known allergies'}</div>
                </div>
              ) : <div style={{ color:S.muted, fontSize:13 }}>Select a patient from the registry</div>}
              {selPatient && (
                <button onClick={()=>setShowEhrForm(f=>!f)} style={{ marginLeft:'auto', padding:'8px 16px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                  {showEhrForm ? 'Cancel' : '+ New Record'}
                </button>
              )}
            </div>

            {/* New EHR Form */}
            {showEhrForm && selPatient && (
              <div style={{ ...card, marginBottom:20, borderColor:S.blue }}>
                <div style={{ fontSize:12, fontWeight:700, color:S.muted, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:16 }}>New Clinical Record</div>
                <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr':'repeat(2,1fr)', gap:12, marginBottom:12 }}>
                  <div>
                    <div style={{ fontSize:11, fontWeight:600, color:S.navy, marginBottom:4, textTransform:'uppercase' }}>Record Type</div>
                    <select value={ehrForm.record_type} onChange={e=>setEhrForm({...ehrForm,record_type:e.target.value})}
                      style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'0.5px solid '+S.border, fontSize:13, background:S.bg, color:S.navy, outline:'none' }}>
                      {['consultation','follow_up','emergency','procedure','discharge'].map(t=><option key={t} value={t}>{t.replace('_',' ').toUpperCase()}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize:11, fontWeight:600, color:S.navy, marginBottom:4, textTransform:'uppercase' }}>Follow-up Date</div>
                    <input type="date" value={ehrForm.follow_up_date} onChange={e=>setEhrForm({...ehrForm,follow_up_date:e.target.value})}
                      style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'0.5px solid '+S.border, fontSize:13, background:S.bg, color:S.navy, outline:'none', boxSizing:'border-box' }}/>
                  </div>
                </div>
                {[['Chief Complaint *','chief_complaint'],['Diagnosis','diagnosis'],['Vitals (BP, HR, Temp, SpO2)','vitals'],['Clinical Notes','notes']].map(([label,key]) => (
                  <div key={key} style={{ marginBottom:12 }}>
                    <div style={{ fontSize:11, fontWeight:600, color:S.navy, marginBottom:4, textTransform:'uppercase' }}>{label}</div>
                    <textarea value={ehrForm[key]} onChange={e=>setEhrForm({...ehrForm,[key]:e.target.value})} rows={key==='notes'?4:2}
                      style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'0.5px solid '+S.border, fontSize:13, background:S.bg, color:S.navy, outline:'none', resize:'vertical', fontFamily:'inherit', boxSizing:'border-box' }}/>
                  </div>
                ))}
                <button onClick={addEHR} disabled={ehrLoading||!ehrForm.chief_complaint}
                  style={{ padding:'10px 24px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                  {ehrLoading ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            )}

            {/* EHR Records */}
            {!selPatient ? (
              <div style={{ ...card, textAlign:'center', padding:48, color:S.muted, fontSize:13 }}>Select a patient from the Patients tab to view their EHR.</div>
            ) : ehrRecords.length === 0 ? (
              <div style={{ ...card, textAlign:'center', padding:48, color:S.muted, fontSize:13 }}>No records yet. Click "+ New Record" to add the first clinical entry.</div>
            ) : ehrRecords.map(r => (
              <div key={r.id} style={{ ...card, marginBottom:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <Badge color={r.record_type==='emergency'?'red':r.record_type==='discharge'?'green':'blue'}>{r.record_type?.replace('_',' ').toUpperCase()}</Badge>
                    <span style={{ fontSize:12, color:S.muted }}>{new Date(r.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</span>
                  </div>
                  {r.follow_up_date && <Badge color="yellow">Follow-up: {new Date(r.follow_up_date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</Badge>}
                </div>
                <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr':'repeat(2,1fr)', gap:12 }}>
                  {r.chief_complaint && <div><div style={{ fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', marginBottom:4 }}>Chief Complaint</div><div style={{ fontSize:13, color:S.navy }}>{r.chief_complaint}</div></div>}
                  {r.diagnosis && <div><div style={{ fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', marginBottom:4 }}>Diagnosis</div><div style={{ fontSize:13, color:S.navy }}>{r.diagnosis}</div></div>}
                  {r.vitals?.notes && <div><div style={{ fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', marginBottom:4 }}>Vitals</div><div style={{ fontSize:13, color:S.navy }}>{r.vitals.notes}</div></div>}
                  {r.notes && <div style={{ gridColumn: isMobile?'1':'1/-1' }}><div style={{ fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', marginBottom:4 }}>Clinical Notes</div><div style={{ fontSize:13, color:S.navy, lineHeight:1.6 }}>{r.notes}</div></div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* IPD */}
        {tab==='ipd' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:12 }}>
              <div>
                <h2 style={{ margin:0, color:S.navy, fontSize:20, fontWeight:700 }}>IPD — Inpatient Management</h2>
                <div style={{ fontSize:12, color:S.muted, marginTop:2 }}>{ipdList.filter(i=>i.status==='admitted').length} currently admitted</div>
              </div>
              <button onClick={()=>setShowIpdForm(f=>!f)} style={{ padding:'8px 16px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                {showIpdForm ? 'Cancel' : '+ New Admission'}
              </button>
            </div>

            {/* Admission Form */}
            {showIpdForm && (
              <div style={{ ...card, marginBottom:20, borderColor:S.blue }}>
                <div style={{ fontSize:12, fontWeight:700, color:S.muted, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:16 }}>New Admission</div>
                <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr':'repeat(2,1fr)', gap:12 }}>
                  <div>
                    <div style={{ fontSize:11, fontWeight:600, color:S.navy, marginBottom:4, textTransform:'uppercase' }}>Patient *</div>
                    <select value={ipdForm.patient_id} onChange={e=>setIpdForm({...ipdForm,patient_id:e.target.value})}
                      style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'0.5px solid '+S.border, fontSize:13, background:S.bg, color:S.navy, outline:'none' }}>
                      <option value="">Select patient</option>
                      {patients.map(p=><option key={p.id} value={p.id}>{p.full_name} ({p.patient_uid})</option>)}
                    </select>
                  </div>
                  {[['Ward','ward'],['Bed Number','bed_number'],['Admitting Doctor','admitting_doctor'],['Diagnosis on Admission','diagnosis_on_admission']].map(([label,key]) => (
                    <div key={key}>
                      <div style={{ fontSize:11, fontWeight:600, color:S.navy, marginBottom:4, textTransform:'uppercase' }}>{label}</div>
                      <input value={ipdForm[key]} onChange={e=>setIpdForm({...ipdForm,[key]:e.target.value})}
                        style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'0.5px solid '+S.border, fontSize:13, background:S.bg, color:S.navy, outline:'none', boxSizing:'border-box' }}/>
                    </div>
                  ))}
                </div>
                <button onClick={addIPD} disabled={ipdLoading||!ipdForm.patient_id}
                  style={{ marginTop:16, padding:'10px 24px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                  {ipdLoading ? 'Admitting...' : 'Admit Patient'}
                </button>
              </div>
            )}

            {/* IPD List */}
            <div style={{ display:'grid', gap:10 }}>
              {ipdList.length === 0 ? (
                <div style={{ ...card, textAlign:'center', padding:48, color:S.muted, fontSize:13 }}>No admissions yet.</div>
              ) : ipdList.map(adm => (
                <div key={adm.id} style={{ ...card, padding:16 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                    <div>
                      <div style={{ fontSize:14, fontWeight:700, color:S.navy }}>{adm.hospital_patients?.full_name}</div>
                      <div style={{ fontSize:11, color:S.muted }}>{adm.hospital_patients?.patient_uid} · Ward: {adm.ward} · Bed: {adm.bed_number}</div>
                    </div>
                    <Badge color={adm.status==='admitted'?'blue':adm.status==='discharged'?'green':'yellow'}>{adm.status?.toUpperCase()}</Badge>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr':'repeat(3,1fr)', gap:8, marginBottom:10 }}>
                    <div><div style={{ fontSize:10, color:S.muted, textTransform:'uppercase', fontWeight:600 }}>Admitted</div><div style={{ fontSize:12, color:S.navy }}>{new Date(adm.admission_date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div></div>
                    <div><div style={{ fontSize:10, color:S.muted, textTransform:'uppercase', fontWeight:600 }}>Doctor</div><div style={{ fontSize:12, color:S.navy }}>{adm.admitting_doctor||'N/A'}</div></div>
                    <div><div style={{ fontSize:10, color:S.muted, textTransform:'uppercase', fontWeight:600 }}>Diagnosis</div><div style={{ fontSize:12, color:S.navy }}>{adm.diagnosis_on_admission||'N/A'}</div></div>
                  </div>
                  {adm.status === 'admitted' && (
                    <button onClick={() => { const s = prompt('Discharge summary:'); if(s) dischargePatient(adm.id, s); }}
                      style={{ padding:'6px 14px', background:'#ECFDF5', color:S.success, border:'1px solid #A7F3D0', borderRadius:7, fontSize:12, fontWeight:600, cursor:'pointer' }}>
                      Discharge Patient
                    </button>
                  )}
                  {adm.discharge_summary && (
                    <div style={{ marginTop:10, padding:'8px 12px', background:S.bg, borderRadius:8, fontSize:12, color:S.muted }}>
                      <strong>Discharge Summary:</strong> {adm.discharge_summary}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DASHBOARD */}
        {tab==='dashboard' && (
          <div>
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:11, fontWeight:600, color:S.muted, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:4 }}>Hospital Admin</div>
              <h1 style={{ fontSize:24, fontWeight:700, color:S.navy, letterSpacing:'-0.02em', margin:0 }}>Good {new Date().getHours()<12?'morning':new Date().getHours()<17?'afternoon':'evening'}, {hospital.admin_name || 'Admin'}</h1>
            </div>
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap:16, marginBottom:24 }}>
              {[
                { label:'Waiting in OPD', value:waiting, color:S.blue, action:'queue' },
                { label:'Pending bed flags', value:beds.length, color:crisis>0?S.danger:S.muted, action:'beds' },
                { label:'Pending referrals', value:pendingRef, color:pendingRef>0?S.warning:S.muted, action:'referrals' },
                { label:'Staff members', value:staff.length, color:S.success, action:'staff' },
              ].map((s,i) => (
                <div key={i} onClick={() => setTab(s.action)} style={{ ...card, cursor:'pointer' }}>
                  <div style={{ fontSize:32, fontWeight:700, color:s.color, letterSpacing:'-0.02em', marginBottom:4 }}>{s.value}</div>
                  <div style={{ fontSize:12, color:S.muted }}>{s.label}</div>
                </div>
              ))}
            </div>
            {queue.filter(q=>q.status==='waiting').length > 0 && (
              <div style={{ ...card, marginBottom:16 }}>
                <div style={{ fontSize:11, fontWeight:600, color:S.muted, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:16 }}>OPD Queue — Today</div>
                {queue.filter(q=>q.status==='waiting').slice(0,5).map(q => (
                  <div key={q.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'0.5px solid '+S.border }}>
                    <div style={{ fontWeight:700, color:S.blue, fontSize:13, minWidth:60 }}>{q.token_number}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:S.navy }}>{q.patient_name}</div>
                      {q.notes && <div style={{ fontSize:11, color:S.muted }}>{q.notes}</div>}
                    </div>
                    <Badge color={priorityColor(q.priority)}>{q.priority}</Badge>
                  </div>
                ))}
              </div>
            )}
            {beds.length > 0 && (
              <div style={{ ...card }}>
                <div style={{ fontSize:11, fontWeight:600, color:S.muted, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:16 }}>Pending Bed Reviews</div>
                {beds.slice(0,3).map(b => (
                  <div key={b.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'0.5px solid '+S.border }}>
                    <div style={{ fontSize:12, fontWeight:700, color:S.navy }}>{b.ward_name} · Bed {b.bed_number}</div>
                    <div style={{ flex:1, fontSize:12, color:S.muted }}>{b.patient_name} · {b.flag_reason}</div>
                    <Badge color={b.urgency==='crisis'?'red':b.urgency==='urgent'?'yellow':'green'}>{b.urgency}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* OPD QUEUE */}
        {tab==='queue' && (
          <div style={{ display:'grid', gridTemplateColumns:'340px 1fr', gap:20 }}>
            <div style={{ ...card }}>
              <div style={{ fontSize:13, fontWeight:700, color:S.navy, marginBottom:16 }}>Add Patient to Queue</div>
              {[['Patient Name *','patient_name','text'],['Phone','patient_phone','tel'],['Age','patient_age','number']].map(([l,k,t]) => (
                <div key={k} style={{ marginBottom:12 }}>
                  <label style={{ fontSize:11, fontWeight:600, color:S.muted, display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em' }}>{l}</label>
                  <input type={t} value={qForm[k]} onChange={e=>setQForm(f=>({...f,[k]:e.target.value}))} style={inp} />
                </div>
              ))}
              <div style={{ marginBottom:12 }}>
                <label style={{ fontSize:11, fontWeight:600, color:S.muted, display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em' }}>Priority</label>
                <select value={qForm.priority} onChange={e=>setQForm(f=>({...f,priority:e.target.value}))} style={sel}>
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                  <option value="crisis">Crisis</option>
                </select>
              </div>
              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:11, fontWeight:600, color:S.muted, display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em' }}>Notes</label>
                <input value={qForm.notes} onChange={e=>setQForm(f=>({...f,notes:e.target.value}))} placeholder="Referred by Dr. Gupta, ward 4..." style={inp} />
              </div>
              <button onClick={addToQueue} disabled={qLoading||!qForm.patient_name}
                style={{ width:'100%', padding:'10px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                {qLoading ? 'Adding...' : 'Add to Queue'}
              </button>
            </div>
            <div>
              <div style={{ ...card, marginBottom:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:S.navy }}>Today's Queue</div>
                  <div style={{ fontSize:12, color:S.muted }}>{queue.length} total · {waiting} waiting</div>
                </div>
                {queue.length===0 ? <div style={{ textAlign:'center', padding:'32px 0', color:S.muted, fontSize:13 }}>No patients in queue today</div> : queue.map(q => (
                  <div key={q.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:'0.5px solid '+S.border }}>
                    <div style={{ fontWeight:700, color:S.blue, fontSize:14, minWidth:64 }}>{q.token_number}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:S.navy }}>{q.patient_name}{q.patient_age ? ', '+q.patient_age+'y' : ''}</div>
                      {q.patient_phone && <div style={{ fontSize:11, color:S.muted }}>{q.patient_phone}</div>}
                      {q.notes && <div style={{ fontSize:11, color:S.muted }}>{q.notes}</div>}
                    </div>
                    <Badge color={priorityColor(q.priority)}>{q.priority}</Badge>
                    <Badge color={statusColor(q.status)}>{q.status.replace('_',' ')}</Badge>
                    {q.status==='waiting' && <button onClick={()=>updateQueueStatus(q.id,'in_consultation')} style={{ padding:'5px 12px', background:S.blue, color:'#fff', border:'none', borderRadius:6, fontSize:11, fontWeight:600, cursor:'pointer' }}>Call</button>}
                    {q.status==='in_consultation' && <button onClick={()=>updateQueueStatus(q.id,'done')} style={{ padding:'5px 12px', background:S.success, color:'#fff', border:'none', borderRadius:6, fontSize:11, fontWeight:600, cursor:'pointer' }}>Done</button>}
                    {q.status==='waiting' && <button onClick={()=>updateQueueStatus(q.id,'no_show')} style={{ padding:'5px 12px', background:'transparent', color:S.hint, border:'0.5px solid '+S.border, borderRadius:6, fontSize:11, cursor:'pointer' }}>No show</button>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* BED TRACKING */}
        {tab==='beds' && (
          <div style={{ display:'grid', gridTemplateColumns:'340px 1fr', gap:20 }}>
            <div style={{ ...card }}>
              <div style={{ fontSize:13, fontWeight:700, color:S.navy, marginBottom:16 }}>Flag Bed for Review</div>
              {[['Ward Name *','ward_name','ICU / Ward 4'],['Bed Number *','bed_number','B-12'],['Patient Name *','patient_name',''],['Patient Age','patient_age','']].map(([l,k,p]) => (
                <div key={k} style={{ marginBottom:10 }}>
                  <label style={{ fontSize:11, fontWeight:600, color:S.muted, display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em' }}>{l}</label>
                  <input value={bForm[k]} onChange={e=>setBForm(f=>({...f,[k]:e.target.value}))} placeholder={p} style={inp} />
                </div>
              ))}
              <div style={{ marginBottom:10 }}>
                <label style={{ fontSize:11, fontWeight:600, color:S.muted, display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em' }}>Flag Type</label>
                <select value={bForm.mental_health_flag} onChange={e=>setBForm(f=>({...f,mental_health_flag:e.target.value}))} style={sel}>
                  {['monitor','anxiety','depression','psychosis','self_harm','substance_withdrawal','post_surgical_distress'].map(o=><option key={o} value={o}>{o.replace(/_/g,' ')}</option>)}
                </select>
              </div>
              <div style={{ marginBottom:10 }}>
                <label style={{ fontSize:11, fontWeight:600, color:S.muted, display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em' }}>Urgency</label>
                <select value={bForm.urgency} onChange={e=>setBForm(f=>({...f,urgency:e.target.value}))} style={sel}>
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                  <option value="crisis">Crisis</option>
                </select>
              </div>
              <div style={{ marginBottom:10 }}>
                <label style={{ fontSize:11, fontWeight:600, color:S.muted, display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em' }}>Reason</label>
                <input value={bForm.flag_reason} onChange={e=>setBForm(f=>({...f,flag_reason:e.target.value}))} placeholder="Brief clinical reason..." style={inp} />
              </div>
              {[['Flagged by','flagged_by_name'],['Department','flagged_by_department']].map(([l,k]) => (
                <div key={k} style={{ marginBottom:10 }}>
                  <label style={{ fontSize:11, fontWeight:600, color:S.muted, display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em' }}>{l}</label>
                  <input value={bForm[k]} onChange={e=>setBForm(f=>({...f,[k]:e.target.value}))} style={inp} />
                </div>
              ))}
              <button onClick={addBedFlag} disabled={bLoading||!bForm.ward_name||!bForm.bed_number||!bForm.patient_name}
                style={{ width:'100%', padding:'10px', background:S.danger, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', marginTop:6 }}>
                {bLoading ? 'Flagging...' : 'Flag for Psychiatric Review'}
              </button>
            </div>
            <div style={{ ...card }}>
              <div style={{ fontSize:13, fontWeight:700, color:S.navy, marginBottom:16 }}>Pending Bed Reviews ({beds.length})</div>
              {beds.length===0 ? <div style={{ textAlign:'center', padding:'32px 0', color:S.muted, fontSize:13 }}>No pending bed reviews</div> : beds.map(b => (
                <div key={b.id} style={{ padding:'14px 0', borderBottom:'0.5px solid '+S.border }}>
                  <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:4 }}>
                        <div style={{ fontSize:13, fontWeight:700, color:S.navy }}>{b.ward_name} · Bed {b.bed_number}</div>
                        <Badge color={b.urgency==='crisis'?'red':b.urgency==='urgent'?'yellow':'green'}>{b.urgency}</Badge>
                        <Badge color="blue">{b.mental_health_flag.replace(/_/g,' ')}</Badge>
                      </div>
                      <div style={{ fontSize:13, color:S.navy }}>{b.patient_name}{b.patient_age?', '+b.patient_age+'y':''}</div>
                      {b.flag_reason && <div style={{ fontSize:12, color:S.muted, marginTop:2 }}>{b.flag_reason}</div>}
                      {b.flagged_by_name && <div style={{ fontSize:11, color:S.hint, marginTop:2 }}>Flagged by {b.flagged_by_name}{b.flagged_by_department?' · '+b.flagged_by_department:''}</div>}
                    </div>
                    <button onClick={()=>resolveBed(b.id)} style={{ padding:'6px 14px', background:S.success, color:'#fff', border:'none', borderRadius:6, fontSize:12, fontWeight:600, cursor:'pointer', flexShrink:0 }}>Mark Reviewed</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REFERRALS */}
        {tab==='referrals' && (
          <div style={{ ...card }}>
            <div style={{ fontSize:13, fontWeight:700, color:S.navy, marginBottom:16 }}>Referrals ({referrals.length})</div>
            {referrals.length===0 ? <div style={{ textAlign:'center', padding:'32px 0', color:S.muted, fontSize:13 }}>No referrals yet</div> : referrals.map(r => (
              <div key={r.id} style={{ padding:'14px 0', borderBottom:'0.5px solid '+S.border }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:4 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:S.navy }}>{r.patient_name}{r.patient_age?', '+r.patient_age+'y':''}</div>
                      <Badge color={r.urgency==='emergency'?'red':r.urgency==='urgent'?'yellow':'green'}>{r.urgency}</Badge>
                      <Badge color={r.status==='pending'?'yellow':r.status==='completed'?'green':'blue'}>{r.status}</Badge>
                    </div>
                    <div style={{ fontSize:12, color:S.muted }}>From: {r.from_department} · {r.referring_doctor_name||'Unknown doctor'}</div>
                    <div style={{ fontSize:12, color:S.navy, marginTop:4 }}>{r.reason}</div>
                    {r.clinical_notes && <div style={{ fontSize:11, color:S.muted, marginTop:2 }}>{r.clinical_notes}</div>}
                  </div>
                  <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                    {r.status==='pending' && <button onClick={()=>updateReferral(r.id,'accepted')} style={{ padding:'6px 14px', background:S.blue, color:'#fff', border:'none', borderRadius:6, fontSize:12, fontWeight:600, cursor:'pointer' }}>Accept</button>}
                    {r.status==='accepted' && <button onClick={()=>updateReferral(r.id,'completed')} style={{ padding:'6px 14px', background:S.success, color:'#fff', border:'none', borderRadius:6, fontSize:12, fontWeight:600, cursor:'pointer' }}>Complete</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ANALYTICS */}
        {tab==='analytics' && (
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
              <div style={{ ...card }}>
                <div style={{ fontSize:11, fontWeight:600, color:S.muted, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:16 }}>PHQ-9 Distribution</div>
                {analytics ? Object.entries(analytics.phqDist).map(([k,v]) => (
                  <div key={k} style={{ marginBottom:10 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                      <span style={{ fontSize:12, color:S.navy, textTransform:'capitalize' }}>{k}</span>
                      <span style={{ fontSize:12, fontWeight:600, color:S.navy }}>{v}</span>
                    </div>
                    <div style={{ background:S.border, borderRadius:4, height:6 }}>
                      <div style={{ width: analytics.total>0 ? (v/analytics.total*100)+'%' : '0%', background:k==='severe'?S.danger:k==='moderate'?S.warning:k==='mild'?S.blue:S.success, height:6, borderRadius:4, transition:'width 0.4s' }} />
                    </div>
                  </div>
                )) : <div style={{ color:S.muted, fontSize:13 }}>No data yet. Add psychologists to staff to see analytics.</div>}
              </div>
              <div style={{ ...card }}>
                <div style={{ fontSize:11, fontWeight:600, color:S.muted, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:16 }}>GAD-7 Distribution</div>
                {analytics ? Object.entries(analytics.gadDist).map(([k,v]) => (
                  <div key={k} style={{ marginBottom:10 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                      <span style={{ fontSize:12, color:S.navy, textTransform:'capitalize' }}>{k}</span>
                      <span style={{ fontSize:12, fontWeight:600, color:S.navy }}>{v}</span>
                    </div>
                    <div style={{ background:S.border, borderRadius:4, height:6 }}>
                      <div style={{ width: analytics.total>0 ? (v/analytics.total*100)+'%' : '0%', background:k==='severe'?S.danger:k==='moderate'?S.warning:k==='mild'?S.blue:S.success, height:6, borderRadius:4, transition:'width 0.4s' }} />
                    </div>
                  </div>
                )) : <div style={{ color:S.muted, fontSize:13 }}>No data yet.</div>}
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
              {[
                { label:'Total Assessments', value: analytics?.total||0 },
                { label:'OPD Patients Today', value: queue.length },
                { label:'Pending Bed Flags', value: beds.length },
              ].map((s,i) => (
                <div key={i} style={{ ...card, textAlign:'center' }}>
                  <div style={{ fontSize:36, fontWeight:700, color:S.blue, letterSpacing:'-0.02em', marginBottom:4 }}>{s.value}</div>
                  <div style={{ fontSize:12, color:S.muted }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STAFF */}
        {tab==='staff' && (
          <div style={{ display:'grid', gridTemplateColumns:'340px 1fr', gap:20 }}>
            <div style={{ ...card }}>
              <div style={{ fontSize:13, fontWeight:700, color:S.navy, marginBottom:16 }}>Add Staff Member</div>
              <div style={{ marginBottom:10 }}>
                <label style={{ fontSize:11, fontWeight:600, color:S.muted, display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em' }}>Email (must be registered on PsycheFlow)</label>
                <input value={sForm.email} onChange={e=>setSForm(f=>({...f,email:e.target.value}))} placeholder="doctor@hospital.com" style={inp} />
              </div>
              <div style={{ marginBottom:10 }}>
                <label style={{ fontSize:11, fontWeight:600, color:S.muted, display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em' }}>Role</label>
                <select value={sForm.role} onChange={e=>setSForm(f=>({...f,role:e.target.value}))} style={sel}>
                  <option value="psychologist">Psychologist</option>
                  <option value="referring_doctor">Referring Doctor</option>
                  <option value="nurse">Nurse</option>
                </select>
              </div>
              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:11, fontWeight:600, color:S.muted, display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em' }}>Department</label>
                <input value={sForm.department} onChange={e=>setSForm(f=>({...f,department:e.target.value}))} placeholder="Psychiatry, Cardiology..." style={inp} />
              </div>
              {sMsg && <div style={{ fontSize:12, color: sMsg.includes('success')?S.success:S.danger, marginBottom:12 }}>{sMsg}</div>}
              <button onClick={inviteStaff} disabled={sLoading||!sForm.email}
                style={{ width:'100%', padding:'10px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                {sLoading ? 'Adding...' : 'Add to Hospital'}
              </button>
            </div>
            <div style={{ ...card }}>
              <div style={{ fontSize:13, fontWeight:700, color:S.navy, marginBottom:16 }}>Staff Members ({staff.length})</div>
              {staff.length===0 ? <div style={{ textAlign:'center', padding:'32px 0', color:S.muted, fontSize:13 }}>No staff added yet</div> : staff.map(s => (
                <div key={s.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:'0.5px solid '+S.border }}>
                  <div style={{ width:36, height:36, borderRadius:8, background:S.lightBlue, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:S.blue }}>
                    {(s.profiles?.display_name||s.profiles?.email||'?')[0].toUpperCase()}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:S.navy }}>{s.profiles?.display_name||'Unknown'}</div>
                    <div style={{ fontSize:11, color:S.muted }}>{s.profiles?.email} · {s.department||'No department'}</div>
                  </div>
                  <Badge color="blue">{s.role.replace(/_/g,' ')}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
