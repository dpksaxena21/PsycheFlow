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
  const [globalSearch, setGlobalSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  // Patients
  const [patients, setPatients] = useState([]);
  const [patSearch, setPatSearch] = useState('');
  const [selPatient, setSelPatient] = useState(null);
  const [patForm, setPatForm] = useState({ full_name:'', date_of_birth:'', gender:'', phone:'', email:'', address:'', emergency_contact_name:'', emergency_contact_phone:'', blood_group:'', allergies:'', insurance_provider:'', insurance_number:'' });
  const [patLoading, setPatLoading] = useState(false);
  // EHR
  const [ehrRecords, setEhrRecords] = useState([]);
  const [ehrForm, setEhrForm] = useState({ record_type:'consultation', chief_complaint:'', diagnosis:'', notes:'', follow_up_date:'', bp_systolic:'', bp_diastolic:'', heart_rate:'', temperature:'', spo2:'', respiratory_rate:'', blood_sugar:'', weight:'', prescription:'' });
  const [ehrLoading, setEhrLoading] = useState(false);
  const [showEhrForm, setShowEhrForm] = useState(false);
  // IPD
  const [ipdList, setIpdList] = useState([]);
  const [ipdForm, setIpdForm] = useState({ patient_id:'', ward:'', bed_number:'', admitting_doctor:'', diagnosis_on_admission:'' });
  const [ipdLoading, setIpdLoading] = useState(false);
  const [showIpdForm, setShowIpdForm] = useState(false);
  // Pharmacy
  const [drugs, setDrugs] = useState([]);
  const [drugForm, setDrugForm] = useState({ drug_name:'', generic_name:'', category:'', stock_quantity:0, unit:'tablets', reorder_level:10, expiry_date:'', price_per_unit:'', supplier:'' });
  const [drugLoading, setDrugLoading] = useState(false);
  const [showDrugForm, setShowDrugForm] = useState(false);
  // Lab
  const [labOrders, setLabOrders] = useState([]);
  const [labForm, setLabForm] = useState({ patient_id:'', test_name:'', test_category:'', priority:'routine', notes:'' });
  const [labLoading, setLabLoading] = useState(false);
  const [showLabForm, setShowLabForm] = useState(false);
  // Billing
  const [invoices, setInvoices] = useState([]);
  const [invForm, setInvForm] = useState({ patient_id:'', items:'', notes:'' });
  const [invLoading, setInvLoading] = useState(false);
  const [showInvForm, setShowInvForm] = useState(false);
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
    const vitals = {
      bp: ehrForm.bp_systolic && ehrForm.bp_diastolic ? `${ehrForm.bp_systolic}/${ehrForm.bp_diastolic} mmHg` : '',
      heart_rate: ehrForm.heart_rate ? `${ehrForm.heart_rate} bpm` : '',
      temperature: ehrForm.temperature ? `${ehrForm.temperature} °F` : '',
      spo2: ehrForm.spo2 ? `${ehrForm.spo2}%` : '',
      respiratory_rate: ehrForm.respiratory_rate ? `${ehrForm.respiratory_rate} /min` : '',
      blood_sugar: ehrForm.blood_sugar ? `${ehrForm.blood_sugar} mg/dL` : '',
      weight: ehrForm.weight ? `${ehrForm.weight} kg` : '',
    };
    await supabase.from('ehr_records').insert({ hospital_id:hospital.id, patient_id:selPatient.id, doctor_id:user.id, record_type:ehrForm.record_type, chief_complaint:ehrForm.chief_complaint, diagnosis:ehrForm.diagnosis, notes:ehrForm.notes, follow_up_date:ehrForm.follow_up_date||null, vitals, prescription:ehrForm.prescription });
    setEhrForm({ record_type:'consultation', chief_complaint:'', diagnosis:'', notes:'', follow_up_date:'', bp_systolic:'', bp_diastolic:'', heart_rate:'', temperature:'', spo2:'', respiratory_rate:'', blood_sugar:'', weight:'', prescription:'' });
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

  const loadPharmacy = async () => {
    if (!hospital) return;
    const { data } = await supabase.from('pharmacy_inventory').select('*').eq('hospital_id', hospital.id).order('drug_name');
    setDrugs(data || []);
  };
  const loadLab = async () => {
    if (!hospital) return;
    const { data } = await supabase.from('lab_orders').select('*, hospital_patients(full_name,patient_uid)').eq('hospital_id', hospital.id).order('ordered_at', { ascending:false });
    setLabOrders(data || []);
  };
  const loadBilling = async () => {
    if (!hospital) return;
    const { data } = await supabase.from('billing_invoices').select('*, hospital_patients(full_name,patient_uid)').eq('hospital_id', hospital.id).order('created_at', { ascending:false });
    setInvoices(data || []);
  };
  const addDrug = async () => {
    if (!drugForm.drug_name || !hospital) return;
    setDrugLoading(true);
    await supabase.from('pharmacy_inventory').insert({ hospital_id:hospital.id, ...drugForm, stock_quantity:parseInt(drugForm.stock_quantity)||0, reorder_level:parseInt(drugForm.reorder_level)||10, price_per_unit:parseFloat(drugForm.price_per_unit)||0 });
    setDrugForm({ drug_name:'', generic_name:'', category:'', stock_quantity:0, unit:'tablets', reorder_level:10, expiry_date:'', price_per_unit:'', supplier:'' });
    setShowDrugForm(false);
    await loadPharmacy();
    setDrugLoading(false);
  };
  const addLabOrder = async () => {
    if (!labForm.patient_id || !labForm.test_name || !hospital) return;
    setLabLoading(true);
    await supabase.from('lab_orders').insert({ hospital_id:hospital.id, doctor_id:user.id, ...labForm });
    setLabForm({ patient_id:'', test_name:'', test_category:'', priority:'routine', notes:'' });
    setShowLabForm(false);
    await loadLab();
    setLabLoading(false);
  };
  const updateLabResult = async (id, result) => {
    await supabase.from('lab_orders').update({ result, status:'resulted', resulted_at:new Date().toISOString() }).eq('id',id);
    await loadLab();
  };
  const genInvoiceNumber = () => 'INV-' + Date.now().toString().slice(-8);
  const addInvoice = async () => {
    if (!invForm.patient_id || !invForm.items || !hospital) return;
    setInvLoading(true);
    const items = invForm.items.split('\n').filter(Boolean).map(line => {
      const parts = line.split(',');
      return { description: parts[0]?.trim(), amount: parseFloat(parts[1])||0 };
    });
    const subtotal = items.reduce((s,i) => s + i.amount, 0);
    const tax = subtotal * 0.18;
    const total = subtotal + tax;
    await supabase.from('billing_invoices').insert({ hospital_id:hospital.id, patient_id:invForm.patient_id, invoice_number:genInvoiceNumber(), items, subtotal, tax, total, notes:invForm.notes });
    setInvForm({ patient_id:'', items:'', notes:'' });
    setShowInvForm(false);
    await loadBilling();
    setInvLoading(false);
  };
  const markPaid = async (id, method) => {
    await supabase.from('billing_invoices').update({ status:'paid', payment_method:method, paid_at:new Date().toISOString() }).eq('id',id);
    await loadBilling();
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
    { id:'pharmacy', label:'Pharmacy' },
    { id:'lab', label:'Lab' },
    { id:'billing', label:'Billing' },
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

  const searchResults = globalSearch.length >= 2 ? [
    ...patients.filter(p => p.full_name?.toLowerCase().includes(globalSearch.toLowerCase()) || p.patient_uid?.includes(globalSearch.toUpperCase())).slice(0,3).map(p => ({ type:'patient', label:p.full_name, sub:p.patient_uid, action:()=>{ setSelPatient(p); loadEHR(p.id); setTab('ehr'); setGlobalSearch(''); setShowSearch(false); } })),
    ...drugs.filter(d => d.drug_name?.toLowerCase().includes(globalSearch.toLowerCase())).slice(0,2).map(d => ({ type:'drug', label:d.drug_name, sub:`Stock: ${d.stock_quantity} ${d.unit}`, action:()=>{ setTab('pharmacy'); setGlobalSearch(''); setShowSearch(false); } })),
    ...labOrders.filter(l => l.hospital_patients?.full_name?.toLowerCase().includes(globalSearch.toLowerCase()) || l.test_name?.toLowerCase().includes(globalSearch.toLowerCase())).slice(0,2).map(l => ({ type:'lab', label:l.test_name, sub:l.hospital_patients?.full_name, action:()=>{ setTab('lab'); setGlobalSearch(''); setShowSearch(false); } })),
  ] : [];

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
        {/* Global Search */}
        {!isMobile && (
          <div style={{ position:'relative', marginRight:8 }}>
            <input value={globalSearch} onChange={e=>{ setGlobalSearch(e.target.value); setShowSearch(true); }} onFocus={()=>setShowSearch(true)}
              placeholder="Search patients, drugs, tests..."
              style={{ padding:'7px 14px 7px 32px', borderRadius:8, border:'0.5px solid '+S.border, fontSize:12, outline:'none', background:S.bg, color:S.navy, width:240 }}/>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}>
              <circle cx="11" cy="11" r="7" stroke={S.muted} strokeWidth="2"/><path d="M21 21l-4.35-4.35" stroke={S.muted} strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {showSearch && searchResults.length > 0 && (
              <div style={{ position:'absolute', top:36, left:0, width:320, background:S.card, borderRadius:10, border:'0.5px solid '+S.border, boxShadow:'0 8px 24px rgba(0,0,0,0.1)', zIndex:200, overflow:'hidden' }}>
                {searchResults.map((r,i) => (
                  <div key={i} onClick={r.action} style={{ padding:'10px 14px', display:'flex', alignItems:'center', gap:10, cursor:'pointer', borderBottom:'0.5px solid '+S.border }}
                    onMouseEnter={e=>e.currentTarget.style.background=S.lightBlue}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <span style={{ fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:4, background: r.type==='patient'?S.lightBlue:r.type==='drug'?'#FEF3C7':'#ECFDF5', color: r.type==='patient'?S.blue:r.type==='drug'?S.warning:S.success, textTransform:'uppercase' }}>{r.type}</span>
                    <div>
                      <div style={{ fontSize:12, fontWeight:600, color:S.navy }}>{r.label}</div>
                      <div style={{ fontSize:10, color:S.muted }}>{r.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* Quick Actions */}
        {!isMobile && (
          <div style={{ position:'relative', marginRight:8 }}>
            <button onClick={()=>setShowQuickActions(q=>!q)} style={{ padding:'7px 14px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
              + Quick Action
            </button>
            {showQuickActions && (
              <div style={{ position:'absolute', top:36, right:0, width:200, background:S.card, borderRadius:10, border:'0.5px solid '+S.border, boxShadow:'0 8px 24px rgba(0,0,0,0.1)', zIndex:200, overflow:'hidden' }}>
                {[
                  { label:'+ New Patient', action:()=>{ setTab('patients'); setShowQuickActions(false); } },
                  { label:'+ New EHR Record', action:()=>{ setTab('ehr'); setShowEhrForm(true); setShowQuickActions(false); } },
                  { label:'+ Admit Patient', action:()=>{ setTab('ipd'); setShowIpdForm(true); setShowQuickActions(false); } },
                  { label:'+ Lab Order', action:()=>{ setTab('lab'); setShowLabForm(true); setShowQuickActions(false); } },
                  { label:'+ Create Invoice', action:()=>{ setTab('billing'); setShowInvForm(true); setShowQuickActions(false); } },
                  { label:'+ OPD Token', action:()=>{ setTab('queue'); setShowQuickActions(false); } },
                ].map((a,i) => (
                  <div key={i} onClick={a.action} style={{ padding:'10px 14px', fontSize:13, color:S.navy, cursor:'pointer', borderBottom:'0.5px solid '+S.border, fontWeight:500 }}
                    onMouseEnter={e=>e.currentTarget.style.background=S.lightBlue}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    {a.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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
                {/* Chief Complaint */}
                <div style={{ marginBottom:12 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:S.navy, marginBottom:4, textTransform:'uppercase' }}>Chief Complaint *</div>
                  <textarea value={ehrForm.chief_complaint} onChange={e=>setEhrForm({...ehrForm,chief_complaint:e.target.value})} rows={2}
                    style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'0.5px solid '+S.border, fontSize:13, background:S.bg, color:S.navy, outline:'none', resize:'vertical', fontFamily:'inherit', boxSizing:'border-box' }}/>
                </div>
                {/* Diagnosis */}
                <div style={{ marginBottom:12 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:S.navy, marginBottom:4, textTransform:'uppercase' }}>Diagnosis</div>
                  <textarea value={ehrForm.diagnosis} onChange={e=>setEhrForm({...ehrForm,diagnosis:e.target.value})} rows={2}
                    style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'0.5px solid '+S.border, fontSize:13, background:S.bg, color:S.navy, outline:'none', resize:'vertical', fontFamily:'inherit', boxSizing:'border-box' }}/>
                </div>
                {/* Vitals — structured */}
                <div style={{ marginBottom:12 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:S.navy, marginBottom:8, textTransform:'uppercase' }}>Vitals</div>
                  <div style={{ display:'grid', gridTemplateColumns:isMobile?'repeat(2,1fr)':'repeat(4,1fr)', gap:8 }}>
                    <div>
                      <div style={{ fontSize:10, color:S.muted, marginBottom:3 }}>BP Systolic</div>
                      <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                        <input type="number" value={ehrForm.bp_systolic} onChange={e=>setEhrForm({...ehrForm,bp_systolic:e.target.value})} placeholder="120"
                          style={{ width:'100%', padding:'7px 10px', borderRadius:7, border:'0.5px solid '+S.border, fontSize:13, background:S.bg, color:S.navy, outline:'none', boxSizing:'border-box' }}/>
                        <span style={{ fontSize:10, color:S.muted, whiteSpace:'nowrap' }}>mmHg</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize:10, color:S.muted, marginBottom:3 }}>BP Diastolic</div>
                      <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                        <input type="number" value={ehrForm.bp_diastolic} onChange={e=>setEhrForm({...ehrForm,bp_diastolic:e.target.value})} placeholder="80"
                          style={{ width:'100%', padding:'7px 10px', borderRadius:7, border:'0.5px solid '+S.border, fontSize:13, background:S.bg, color:S.navy, outline:'none', boxSizing:'border-box' }}/>
                        <span style={{ fontSize:10, color:S.muted, whiteSpace:'nowrap' }}>mmHg</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize:10, color:S.muted, marginBottom:3 }}>Heart Rate</div>
                      <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                        <input type="number" value={ehrForm.heart_rate} onChange={e=>setEhrForm({...ehrForm,heart_rate:e.target.value})} placeholder="72"
                          style={{ width:'100%', padding:'7px 10px', borderRadius:7, border:'0.5px solid '+S.border, fontSize:13, background:S.bg, color:S.navy, outline:'none', boxSizing:'border-box' }}/>
                        <span style={{ fontSize:10, color:S.muted }}>bpm</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize:10, color:S.muted, marginBottom:3 }}>Temperature</div>
                      <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                        <input type="number" value={ehrForm.temperature} onChange={e=>setEhrForm({...ehrForm,temperature:e.target.value})} placeholder="98.6"
                          style={{ width:'100%', padding:'7px 10px', borderRadius:7, border:'0.5px solid '+S.border, fontSize:13, background:S.bg, color:S.navy, outline:'none', boxSizing:'border-box' }}/>
                        <span style={{ fontSize:10, color:S.muted }}>°F</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize:10, color:S.muted, marginBottom:3 }}>SpO2</div>
                      <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                        <input type="number" value={ehrForm.spo2} onChange={e=>setEhrForm({...ehrForm,spo2:e.target.value})} placeholder="98" max="100"
                          style={{ width:'100%', padding:'7px 10px', borderRadius:7, border:'0.5px solid '+S.border, fontSize:13, background: parseInt(ehrForm.spo2)<95?'#FEF2F2':S.bg, color: parseInt(ehrForm.spo2)<95?S.danger:S.navy, outline:'none', boxSizing:'border-box' }}/>
                        <span style={{ fontSize:10, color:S.muted }}>%</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize:10, color:S.muted, marginBottom:3 }}>Resp. Rate</div>
                      <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                        <input type="number" value={ehrForm.respiratory_rate} onChange={e=>setEhrForm({...ehrForm,respiratory_rate:e.target.value})} placeholder="16"
                          style={{ width:'100%', padding:'7px 10px', borderRadius:7, border:'0.5px solid '+S.border, fontSize:13, background:S.bg, color:S.navy, outline:'none', boxSizing:'border-box' }}/>
                        <span style={{ fontSize:10, color:S.muted }}>/min</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize:10, color:S.muted, marginBottom:3 }}>Blood Sugar</div>
                      <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                        <input type="number" value={ehrForm.blood_sugar} onChange={e=>setEhrForm({...ehrForm,blood_sugar:e.target.value})} placeholder="100"
                          style={{ width:'100%', padding:'7px 10px', borderRadius:7, border:'0.5px solid '+S.border, fontSize:13, background: parseInt(ehrForm.blood_sugar)>200?'#FEF2F2':S.bg, color: parseInt(ehrForm.blood_sugar)>200?S.danger:S.navy, outline:'none', boxSizing:'border-box' }}/>
                        <span style={{ fontSize:10, color:S.muted, whiteSpace:'nowrap' }}>mg/dL</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize:10, color:S.muted, marginBottom:3 }}>Weight</div>
                      <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                        <input type="number" value={ehrForm.weight} onChange={e=>setEhrForm({...ehrForm,weight:e.target.value})} placeholder="70"
                          style={{ width:'100%', padding:'7px 10px', borderRadius:7, border:'0.5px solid '+S.border, fontSize:13, background:S.bg, color:S.navy, outline:'none', boxSizing:'border-box' }}/>
                        <span style={{ fontSize:10, color:S.muted }}>kg</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Prescription */}
                <div style={{ marginBottom:12 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:S.navy, marginBottom:4, textTransform:'uppercase' }}>Prescription</div>
                  <textarea value={ehrForm.prescription} onChange={e=>setEhrForm({...ehrForm,prescription:e.target.value})} rows={3}
                    placeholder="Tab Paracetamol 500mg — 1-0-1 × 5 days&#10;Tab Amoxicillin 500mg — 1-1-1 × 7 days"
                    style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'0.5px solid '+S.border, fontSize:13, background:S.bg, color:S.navy, outline:'none', resize:'vertical', fontFamily:'monospace', boxSizing:'border-box' }}/>
                </div>
                {/* Clinical Notes */}
                <div style={{ marginBottom:12 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:S.navy, marginBottom:4, textTransform:'uppercase' }}>Clinical Notes</div>
                  <textarea value={ehrForm.notes} onChange={e=>setEhrForm({...ehrForm,notes:e.target.value})} rows={4}
                    style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'0.5px solid '+S.border, fontSize:13, background:S.bg, color:S.navy, outline:'none', resize:'vertical', fontFamily:'inherit', boxSizing:'border-box' }}/>
                </div>
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
                  {r.vitals && Object.values(r.vitals).some(v=>v) && (
                    <div style={{ gridColumn: isMobile?'1':'1/-1' }}>
                      <div style={{ fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', marginBottom:6 }}>Vitals</div>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                        {r.vitals.bp && <span style={{ padding:'3px 10px', borderRadius:100, background:S.lightBlue, color:S.blue, fontSize:11, fontWeight:600 }}>BP: {r.vitals.bp}</span>}
                        {r.vitals.heart_rate && <span style={{ padding:'3px 10px', borderRadius:100, background:'#FEF3C7', color:'#D97706', fontSize:11, fontWeight:600 }}>HR: {r.vitals.heart_rate}</span>}
                        {r.vitals.temperature && <span style={{ padding:'3px 10px', borderRadius:100, background:'#FFF7ED', color:'#EA580C', fontSize:11, fontWeight:600 }}>Temp: {r.vitals.temperature}</span>}
                        {r.vitals.spo2 && <span style={{ padding:'3px 10px', borderRadius:100, background: parseInt(r.vitals.spo2)<95?'#FEF2F2':'#ECFDF5', color: parseInt(r.vitals.spo2)<95?S.danger:S.success, fontSize:11, fontWeight:600 }}>SpO2: {r.vitals.spo2}</span>}
                        {r.vitals.respiratory_rate && <span style={{ padding:'3px 10px', borderRadius:100, background:S.lightBlue, color:S.blue, fontSize:11, fontWeight:600 }}>RR: {r.vitals.respiratory_rate}</span>}
                        {r.vitals.blood_sugar && <span style={{ padding:'3px 10px', borderRadius:100, background: parseInt(r.vitals.blood_sugar)>200?'#FEF2F2':'#ECFDF5', color: parseInt(r.vitals.blood_sugar)>200?S.danger:S.success, fontSize:11, fontWeight:600 }}>BS: {r.vitals.blood_sugar}</span>}
                        {r.vitals.weight && <span style={{ padding:'3px 10px', borderRadius:100, background:S.bg, color:S.muted, fontSize:11, fontWeight:600 }}>Wt: {r.vitals.weight}</span>}
                      </div>
                    </div>
                  )}
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

        {/* PHARMACY */}
        {tab==='pharmacy' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:12 }}>
              <div>
                <h2 style={{ margin:0, color:S.navy, fontSize:20, fontWeight:700 }}>Pharmacy Inventory</h2>
                <div style={{ fontSize:12, color:S.muted, marginTop:2 }}>{drugs.length} drugs · {drugs.filter(d=>d.stock_quantity<=d.reorder_level).length} low stock</div>
              </div>
              <button onClick={()=>setShowDrugForm(f=>!f)} style={{ padding:'8px 16px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                {showDrugForm?'Cancel':'+ Add Drug'}
              </button>
            </div>
            {drugs.filter(d=>d.stock_quantity<=d.reorder_level).length > 0 && (
              <div style={{ background:'#FEF3C7', border:'1px solid #FDE68A', borderRadius:10, padding:'10px 16px', marginBottom:16, fontSize:12, color:'#D97706', fontWeight:500 }}>
                ⚠ {drugs.filter(d=>d.stock_quantity<=d.reorder_level).length} drug(s) at or below reorder level — restock needed
              </div>
            )}
            {showDrugForm && (
              <div style={{ ...card, marginBottom:20, borderColor:S.blue }}>
                <div style={{ fontSize:12, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:16 }}>Add Drug to Inventory</div>
                <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(3,1fr)', gap:12 }}>
                  {[['Drug Name *','drug_name','text'],['Generic Name','generic_name','text'],['Category','category','text'],['Stock Qty','stock_quantity','number'],['Unit','unit','text'],['Reorder Level','reorder_level','number'],['Expiry Date','expiry_date','date'],['Price/Unit (₹)','price_per_unit','number'],['Supplier','supplier','text']].map(([label,key,type])=>(
                    <div key={key}>
                      <div style={{ fontSize:11, fontWeight:600, color:S.navy, marginBottom:4, textTransform:'uppercase' }}>{label}</div>
                      <input type={type} value={drugForm[key]} onChange={e=>setDrugForm({...drugForm,[key]:e.target.value})}
                        style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'0.5px solid '+S.border, fontSize:13, background:S.bg, color:S.navy, outline:'none', boxSizing:'border-box' }}/>
                    </div>
                  ))}
                </div>
                <button onClick={addDrug} disabled={drugLoading||!drugForm.drug_name} style={{ marginTop:16, padding:'10px 24px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                  {drugLoading?'Adding...':'Add to Inventory'}
                </button>
              </div>
            )}
            <div style={{ display:'grid', gap:8 }}>
              {drugs.length===0 ? (
                <div style={{ ...card, textAlign:'center', padding:48, color:S.muted, fontSize:13 }}>No drugs in inventory. Add your first drug above.</div>
              ) : drugs.map(d=>(
                <div key={d.id} style={{ ...card, padding:16, display:'flex', alignItems:'center', gap:16 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:S.navy }}>{d.drug_name} {d.generic_name&&<span style={{ fontSize:12, color:S.muted }}>({d.generic_name})</span>}</div>
                    <div style={{ fontSize:11, color:S.muted, marginTop:2 }}>{d.category||'Uncategorized'} · {d.supplier||'No supplier'} · Exp: {d.expiry_date||'N/A'}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:18, fontWeight:700, color: d.stock_quantity<=d.reorder_level?S.danger:S.success }}>{d.stock_quantity}</div>
                    <div style={{ fontSize:10, color:S.muted }}>{d.unit}</div>
                    {d.price_per_unit>0&&<div style={{ fontSize:11, color:S.blue, marginTop:2 }}>₹{d.price_per_unit}/{d.unit}</div>}
                  </div>
                  <Badge color={d.stock_quantity<=d.reorder_level?'red':'green'}>{d.stock_quantity<=d.reorder_level?'Low Stock':'In Stock'}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LAB */}
        {tab==='lab' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:12 }}>
              <div>
                <h2 style={{ margin:0, color:S.navy, fontSize:20, fontWeight:700 }}>Laboratory</h2>
                <div style={{ fontSize:12, color:S.muted, marginTop:2 }}>{labOrders.filter(l=>l.status==='ordered').length} pending · {labOrders.filter(l=>l.status==='resulted').length} resulted</div>
              </div>
              <button onClick={()=>setShowLabForm(f=>!f)} style={{ padding:'8px 16px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                {showLabForm?'Cancel':'+ New Test Order'}
              </button>
            </div>
            {showLabForm && (
              <div style={{ ...card, marginBottom:20, borderColor:S.blue }}>
                <div style={{ fontSize:12, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:16 }}>New Lab Order</div>
                <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(2,1fr)', gap:12 }}>
                  <div>
                    <div style={{ fontSize:11, fontWeight:600, color:S.navy, marginBottom:4, textTransform:'uppercase' }}>Patient *</div>
                    <select value={labForm.patient_id} onChange={e=>setLabForm({...labForm,patient_id:e.target.value})}
                      style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'0.5px solid '+S.border, fontSize:13, background:S.bg, color:S.navy, outline:'none' }}>
                      <option value="">Select patient</option>
                      {patients.map(p=><option key={p.id} value={p.id}>{p.full_name} ({p.patient_uid})</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize:11, fontWeight:600, color:S.navy, marginBottom:4, textTransform:'uppercase' }}>Priority</div>
                    <select value={labForm.priority} onChange={e=>setLabForm({...labForm,priority:e.target.value})}
                      style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'0.5px solid '+S.border, fontSize:13, background:S.bg, color:S.navy, outline:'none' }}>
                      {['routine','urgent','stat'].map(p=><option key={p}>{p}</option>)}
                    </select>
                  </div>
                  {[['Test Name *','test_name','text'],['Category (e.g. Hematology)','test_category','text']].map(([label,key,type])=>(
                    <div key={key}>
                      <div style={{ fontSize:11, fontWeight:600, color:S.navy, marginBottom:4, textTransform:'uppercase' }}>{label}</div>
                      <input type={type} value={labForm[key]} onChange={e=>setLabForm({...labForm,[key]:e.target.value})}
                        style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'0.5px solid '+S.border, fontSize:13, background:S.bg, color:S.navy, outline:'none', boxSizing:'border-box' }}/>
                    </div>
                  ))}
                  <div style={{ gridColumn:isMobile?'1':'1/-1' }}>
                    <div style={{ fontSize:11, fontWeight:600, color:S.navy, marginBottom:4, textTransform:'uppercase' }}>Clinical Notes</div>
                    <textarea value={labForm.notes} onChange={e=>setLabForm({...labForm,notes:e.target.value})} rows={2}
                      style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'0.5px solid '+S.border, fontSize:13, background:S.bg, color:S.navy, outline:'none', resize:'vertical', fontFamily:'inherit', boxSizing:'border-box' }}/>
                  </div>
                </div>
                <button onClick={addLabOrder} disabled={labLoading||!labForm.patient_id||!labForm.test_name} style={{ marginTop:16, padding:'10px 24px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                  {labLoading?'Ordering...':'Place Order'}
                </button>
              </div>
            )}
            {/* Kanban columns */}
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(3,1fr)', gap:16 }}>
              {['ordered','processing','resulted'].map(status => (
                <div key={status} style={{ background: status==='ordered'?'#FFFBEB':status==='processing'?'#EFF6FF':'#ECFDF5', borderRadius:12, padding:16, minHeight:200 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                    <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color: status==='ordered'?S.warning:status==='processing'?S.blue:S.success }}>{status}</div>
                    <span style={{ fontSize:11, fontWeight:700, padding:'1px 8px', borderRadius:100, background:'rgba(0,0,0,0.06)', color:S.navy }}>{labOrders.filter(l=>l.status===status).length}</span>
                  </div>
                  {labOrders.filter(l=>l.status===status).length===0 ? (
                    <div style={{ fontSize:12, color:S.hint, textAlign:'center', padding:'20px 0' }}>No {status} tests</div>
                  ) : labOrders.filter(l=>l.status===status).map(o=>(
                    <div key={o.id} style={{ background:S.card, borderRadius:8, padding:12, marginBottom:8, border:'0.5px solid '+S.border }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
                        <div style={{ fontSize:12, fontWeight:600, color:S.navy }}>{o.test_name}</div>
                        <Badge color={o.priority==='stat'?'red':o.priority==='urgent'?'yellow':'blue'}>{o.priority}</Badge>
                      </div>
                      <div style={{ fontSize:11, color:S.muted, marginBottom:6 }}>{o.hospital_patients?.full_name} · {o.test_category||'General'}</div>
                      {o.result && <div style={{ fontSize:11, color:S.success, fontWeight:600, marginBottom:4 }}>Result: {o.result}</div>}
                      <div style={{ display:'flex', gap:6 }}>
                        {o.status==='ordered' && <button onClick={()=>{ const r=prompt('Enter test result:'); if(r) updateLabResult(o.id,r); }} style={{ fontSize:11, padding:'3px 10px', background:S.blue, color:'#fff', border:'none', borderRadius:6, cursor:'pointer' }}>Enter Result</button>}
                        {o.status==='ordered' && <button onClick={()=>{ supabase.from('lab_orders').update({status:'processing'}).eq('id',o.id).then(()=>loadLab()); }} style={{ fontSize:11, padding:'3px 10px', background:'transparent', color:S.blue, border:'0.5px solid '+S.blue, borderRadius:6, cursor:'pointer' }}>Processing</button>}
                      </div>
                      <div style={{ fontSize:9, color:S.hint, marginTop:4 }}>{new Date(o.ordered_at).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BILLING */}
        {tab==='billing' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:12 }}>
              <div>
                <h2 style={{ margin:0, color:S.navy, fontSize:20, fontWeight:700 }}>Billing</h2>
                <div style={{ fontSize:12, color:S.muted, marginTop:2 }}>
                  {invoices.filter(i=>i.status==='unpaid').length} unpaid · 
                  ₹{invoices.filter(i=>i.status==='paid').reduce((s,i)=>s+parseFloat(i.total||0),0).toFixed(0)} collected
                </div>
              </div>
              <button onClick={()=>setShowInvForm(f=>!f)} style={{ padding:'8px 16px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                {showInvForm?'Cancel':'+ New Invoice'}
              </button>
            </div>
            {showInvForm && (
              <div style={{ ...card, marginBottom:20, borderColor:S.blue }}>
                <div style={{ fontSize:12, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:16 }}>Create Invoice</div>
                <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(2,1fr)', gap:12, marginBottom:12 }}>
                  <div>
                    <div style={{ fontSize:11, fontWeight:600, color:S.navy, marginBottom:4, textTransform:'uppercase' }}>Patient *</div>
                    <select value={invForm.patient_id} onChange={e=>setInvForm({...invForm,patient_id:e.target.value})}
                      style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'0.5px solid '+S.border, fontSize:13, background:S.bg, color:S.navy, outline:'none' }}>
                      <option value="">Select patient</option>
                      {patients.map(p=><option key={p.id} value={p.id}>{p.full_name} ({p.patient_uid})</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize:11, fontWeight:600, color:S.navy, marginBottom:4, textTransform:'uppercase' }}>Notes</div>
                    <input value={invForm.notes} onChange={e=>setInvForm({...invForm,notes:e.target.value})}
                      style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'0.5px solid '+S.border, fontSize:13, background:S.bg, color:S.navy, outline:'none', boxSizing:'border-box' }}/>
                  </div>
                </div>
                <div style={{ marginBottom:12 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:S.navy, marginBottom:4, textTransform:'uppercase' }}>Line Items * (one per line: Description, Amount)</div>
                  <textarea value={invForm.items} onChange={e=>setInvForm({...invForm,items:e.target.value})} rows={4}
                    placeholder={'Consultation Fee, 500\nLab Tests, 1200\nMedication, 350'}
                    style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'0.5px solid '+S.border, fontSize:13, background:S.bg, color:S.navy, outline:'none', resize:'vertical', fontFamily:'monospace', boxSizing:'border-box' }}/>
                  <div style={{ fontSize:11, color:S.muted, marginTop:4 }}>Format: Item Name, Amount — 18% GST will be added automatically</div>
                </div>
                <button onClick={addInvoice} disabled={invLoading||!invForm.patient_id||!invForm.items} style={{ padding:'10px 24px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                  {invLoading?'Creating...':'Generate Invoice'}
                </button>
              </div>
            )}
            <div style={{ display:'grid', gap:10 }}>
              {invoices.length===0 ? (
                <div style={{ ...card, textAlign:'center', padding:48, color:S.muted, fontSize:13 }}>No invoices yet.</div>
              ) : invoices.map(inv=>(
                <div key={inv.id} style={{ ...card, padding:16 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                    <div>
                      <div style={{ fontSize:14, fontWeight:700, color:S.navy }}>{inv.invoice_number}</div>
                      <div style={{ fontSize:11, color:S.muted }}>{inv.hospital_patients?.full_name} · {new Date(inv.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize:20, fontWeight:700, color:inv.status==='paid'?S.success:S.danger }}>₹{parseFloat(inv.total||0).toFixed(2)}</div>
                      <Badge color={inv.status==='paid'?'green':'red'}>{inv.status?.toUpperCase()}</Badge>
                    </div>
                  </div>
                  {inv.items?.length>0 && (
                    <div style={{ background:S.bg, borderRadius:8, padding:'8px 12px', marginBottom:10 }}>
                      {inv.items.map((item,i)=>(
                        <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:S.navy, padding:'2px 0', borderBottom:i<inv.items.length-1?'0.5px solid '+S.border:'none' }}>
                          <span>{item.description}</span><span>₹{item.amount}</span>
                        </div>
                      ))}
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:S.muted, paddingTop:6 }}>
                        <span>Subtotal</span><span>₹{parseFloat(inv.subtotal||0).toFixed(2)}</span>
                      </div>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:S.muted }}>
                        <span>GST (18%)</span><span>₹{parseFloat(inv.tax||0).toFixed(2)}</span>
                      </div>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, fontWeight:700, color:S.navy, paddingTop:4, borderTop:'0.5px solid '+S.border, marginTop:4 }}>
                        <span>Total</span><span>₹{parseFloat(inv.total||0).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                  {inv.status==='unpaid' && (
                    <div style={{ display:'flex', gap:8 }}>
                      {['Cash','Card','UPI'].map(method=>(
                        <button key={method} onClick={()=>markPaid(inv.id,method)}
                          style={{ padding:'6px 14px', background:S.lightBlue, color:S.blue, border:'1px solid '+S.border, borderRadius:7, fontSize:12, fontWeight:600, cursor:'pointer' }}>
                          Paid via {method}
                        </button>
                      ))}
                    </div>
                  )}
                  {inv.status==='paid' && <div style={{ fontSize:11, color:S.success }}>✓ Paid via {inv.payment_method} · {inv.paid_at?new Date(inv.paid_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'}):''}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COMMAND CENTER DASHBOARD */}
        {tab==='dashboard' && (
          <div>
            {/* Header */}
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:11, fontWeight:600, color:S.muted, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:4 }}>Hospital Command Center</div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:8 }}>
                <h1 style={{ fontSize:24, fontWeight:700, color:S.navy, letterSpacing:'-0.02em', margin:0 }}>
                  Good {new Date().getHours()<12?'morning':new Date().getHours()<17?'afternoon':'evening'}, {hospital.admin_name||'Admin'}
                </h1>
                <div style={{ fontSize:12, color:S.muted }}>{new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
              </div>
            </div>

            {/* Critical Alerts Banner */}
            {(crisis>0 || beds.filter(b=>b.urgency==='crisis').length>0) && (
              <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:10, padding:'12px 16px', marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:S.danger, animation:'pulse 1s infinite' }}/>
                <span style={{ fontSize:13, fontWeight:700, color:S.danger }}>
                  {crisis} crisis patient(s) in queue · {beds.filter(b=>b.urgency==='crisis').length} crisis bed flag(s) — Immediate attention required
                </span>
              </div>
            )}

            {/* KPI Row 1 — Primary metrics */}
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'repeat(2,1fr)':'repeat(4,1fr)', gap:12, marginBottom:16 }}>
              {[
                { label:'OPD Waiting', value:waiting, sub:`${queue.filter(q=>q.status==='in_consultation').length} in consultation`, color:S.blue, action:'queue', icon:'🏥' },
                { label:'Registered Patients', value:patients.length, sub:'Total in registry', color:S.cyan, action:'patients', icon:'👥' },
                { label:'IPD Admitted', value:ipdList.filter(i=>i.status==='admitted').length, sub:`${ipdList.filter(i=>i.status==='discharged').length} discharged today`, color:'#7C3AED', action:'ipd', icon:'🛏' },
                { label:'Crisis Flags', value:crisis + beds.filter(b=>b.urgency==='crisis').length, sub:'Needs immediate review', color:crisis>0?S.danger:S.success, action:'beds', icon:'🚨' },
              ].map((s,i)=>(
                <div key={i} onClick={()=>setTab(s.action)} style={{ ...card, cursor:'pointer', borderLeft:`3px solid ${s.color}`, padding:'16px 20px' }}
                  onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
                  onMouseLeave={e=>e.currentTarget.style.transform=''}>
                  <div style={{ fontSize:28, fontWeight:700, color:s.color, letterSpacing:'-0.02em', marginBottom:2 }}>{s.value}</div>
                  <div style={{ fontSize:12, fontWeight:600, color:S.navy, marginBottom:2 }}>{s.label}</div>
                  <div style={{ fontSize:10, color:S.muted }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* KPI Row 2 — Financial & Operations */}
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'repeat(2,1fr)':'repeat(4,1fr)', gap:12, marginBottom:20 }}>
              {[
                { label:'Revenue Today', value:'₹'+invoices.filter(i=>i.status==='paid'&&new Date(i.paid_at).toDateString()===new Date().toDateString()).reduce((s,i)=>s+parseFloat(i.total||0),0).toFixed(0), sub:'Collected payments', color:S.success, action:'billing' },
                { label:'Pending Bills', value:invoices.filter(i=>i.status==='unpaid').length, sub:'Unpaid invoices', color:S.warning, action:'billing' },
                { label:'Lab Orders', value:labOrders.filter(l=>l.status==='ordered').length, sub:'Awaiting results', color:S.cyan, action:'lab' },
                { label:'Low Stock Drugs', value:drugs.filter(d=>d.stock_quantity<=d.reorder_level).length, sub:'Need restocking', color:drugs.filter(d=>d.stock_quantity<=d.reorder_level).length>0?S.danger:S.success, action:'pharmacy' },
              ].map((s,i)=>(
                <div key={i} onClick={()=>setTab(s.action)} style={{ ...card, cursor:'pointer', padding:'16px 20px' }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=S.blue}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=S.border}>
                  <div style={{ fontSize:22, fontWeight:700, color:s.color, letterSpacing:'-0.01em', marginBottom:2 }}>{s.value}</div>
                  <div style={{ fontSize:12, fontWeight:600, color:S.navy, marginBottom:2 }}>{s.label}</div>
                  <div style={{ fontSize:10, color:S.muted }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Live feeds — 3 column */}
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(3,1fr)', gap:16 }}>

              {/* OPD Live Queue */}
              <div style={{ ...card }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:S.muted, letterSpacing:'0.06em', textTransform:'uppercase' }}>Live OPD Queue</div>
                  <span onClick={()=>setTab('queue')} style={{ fontSize:11, color:S.blue, cursor:'pointer', fontWeight:500 }}>View all →</span>
                </div>
                {queue.filter(q=>q.status==='waiting').length===0 ? (
                  <div style={{ fontSize:12, color:S.muted, textAlign:'center', padding:'16px 0' }}>Queue is clear</div>
                ) : queue.filter(q=>q.status==='waiting').slice(0,4).map(q=>(
                  <div key={q.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'0.5px solid '+S.border }}>
                    <div style={{ fontWeight:700, color:S.blue, fontSize:12, minWidth:52 }}>{q.token_number}</div>
                    <div style={{ flex:1, fontSize:12, color:S.navy, fontWeight:500 }}>{q.patient_name}</div>
                    <Badge color={priorityColor(q.priority)}>{q.priority}</Badge>
                  </div>
                ))}
              </div>

              {/* Recent Patients */}
              <div style={{ ...card }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:S.muted, letterSpacing:'0.06em', textTransform:'uppercase' }}>Recent Patients</div>
                  <span onClick={()=>setTab('patients')} style={{ fontSize:11, color:S.blue, cursor:'pointer', fontWeight:500 }}>View all →</span>
                </div>
                {patients.length===0 ? (
                  <div style={{ fontSize:12, color:S.muted, textAlign:'center', padding:'16px 0' }}>No patients registered</div>
                ) : patients.slice(0,4).map(p=>(
                  <div key={p.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'0.5px solid '+S.border }}>
                    <div style={{ width:28, height:28, borderRadius:'50%', background:S.lightBlue, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:S.blue, flexShrink:0 }}>
                      {p.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, fontWeight:500, color:S.navy }}>{p.full_name}</div>
                      <div style={{ fontSize:10, color:S.muted }}>{p.patient_uid}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* IPD Status */}
              <div style={{ ...card }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:S.muted, letterSpacing:'0.06em', textTransform:'uppercase' }}>IPD Status</div>
                  <span onClick={()=>setTab('ipd')} style={{ fontSize:11, color:S.blue, cursor:'pointer', fontWeight:500 }}>View all →</span>
                </div>
                {ipdList.filter(i=>i.status==='admitted').length===0 ? (
                  <div style={{ fontSize:12, color:S.muted, textAlign:'center', padding:'16px 0' }}>No current admissions</div>
                ) : ipdList.filter(i=>i.status==='admitted').slice(0,4).map(adm=>(
                  <div key={adm.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'0.5px solid '+S.border }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, fontWeight:500, color:S.navy }}>{adm.hospital_patients?.full_name}</div>
                      <div style={{ fontSize:10, color:S.muted }}>Ward: {adm.ward} · Bed: {adm.bed_number}</div>
                    </div>
                    <Badge color="blue">Admitted</Badge>
                  </div>
                ))}
              </div>

            </div>

            {/* Bed flags + pending bills row */}
            {(beds.length>0 || invoices.filter(i=>i.status==='unpaid').length>0) && (
              <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(2,1fr)', gap:16, marginTop:16 }}>
                {beds.length>0 && (
                  <div style={{ ...card }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                      <div style={{ fontSize:11, fontWeight:700, color:S.muted, letterSpacing:'0.06em', textTransform:'uppercase' }}>Pending Bed Reviews</div>
                      <span onClick={()=>setTab('beds')} style={{ fontSize:11, color:S.blue, cursor:'pointer', fontWeight:500 }}>View all →</span>
                    </div>
                    {beds.slice(0,3).map(b=>(
                      <div key={b.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'8px 0', borderBottom:'0.5px solid '+S.border }}>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:12, fontWeight:600, color:S.navy }}>{b.ward_name} · Bed {b.bed_number}</div>
                          <div style={{ fontSize:11, color:S.muted }}>{b.patient_name} · {b.flag_reason}</div>
                        </div>
                        <Badge color={b.urgency==='crisis'?'red':b.urgency==='urgent'?'yellow':'green'}>{b.urgency}</Badge>
                      </div>
                    ))}
                  </div>
                )}
                {invoices.filter(i=>i.status==='unpaid').length>0 && (
                  <div style={{ ...card }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                      <div style={{ fontSize:11, fontWeight:700, color:S.muted, letterSpacing:'0.06em', textTransform:'uppercase' }}>Unpaid Invoices</div>
                      <span onClick={()=>setTab('billing')} style={{ fontSize:11, color:S.blue, cursor:'pointer', fontWeight:500 }}>View all →</span>
                    </div>
                    {invoices.filter(i=>i.status==='unpaid').slice(0,3).map(inv=>(
                      <div key={inv.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'8px 0', borderBottom:'0.5px solid '+S.border }}>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:12, fontWeight:600, color:S.navy }}>{inv.hospital_patients?.full_name}</div>
                          <div style={{ fontSize:11, color:S.muted }}>{inv.invoice_number}</div>
                        </div>
                        <div style={{ fontSize:13, fontWeight:700, color:S.danger }}>₹{parseFloat(inv.total||0).toFixed(0)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
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
          <div>
            {/* Visual Bed Map */}
            <div style={{ ...card, marginBottom:20 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                <div style={{ fontSize:13, fontWeight:700, color:S.navy }}>Visual Bed Map</div>
                <div style={{ display:'flex', gap:12, fontSize:11, color:S.muted }}>
                  {[['#ECFDF5','Available'],['#FEF2F2','Flagged/Crisis'],['#FEF3C7','Urgent'],['#EFF6FF','Normal']].map(([bg,label])=>(
                    <div key={label} style={{ display:'flex', alignItems:'center', gap:4 }}>
                      <div style={{ width:12, height:12, borderRadius:3, background:bg, border:'1px solid #e2e8f0' }}/>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Group beds by ward */}
              {(() => {
                const wardMap = {};
                beds.forEach(b => { if(!wardMap[b.ward_name]) wardMap[b.ward_name]=[]; wardMap[b.ward_name].push(b); });
                const ipdByWard = {};
                ipdList.filter(i=>i.status==='admitted').forEach(i=>{ if(!ipdByWard[i.ward]) ipdByWard[i.ward]=[]; ipdByWard[i.ward].push(i); });
                const allWards = [...new Set([...Object.keys(wardMap), ...Object.keys(ipdByWard)])];
                if(allWards.length===0) return <div style={{ textAlign:'center', padding:'24px 0', color:S.muted, fontSize:13 }}>No ward data yet. Add patients to IPD or flag beds to see the map.</div>;
                return allWards.map(ward=>(
                  <div key={ward} style={{ marginBottom:20 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>{ward}</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                      {/* IPD beds */}
                      {(ipdByWard[ward]||[]).map(adm=>(
                        <div key={adm.id} title={`${adm.hospital_patients?.full_name} — Admitted`}
                          style={{ width:64, height:64, borderRadius:8, background:'#EFF6FF', border:'1.5px solid #BFDBFE', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:10, fontWeight:600, color:S.blue, textAlign:'center', padding:4 }}>
                          <div style={{ fontSize:14 }}>🛏</div>
                          <div style={{ fontSize:9, color:S.blue, fontWeight:700 }}>{adm.bed_number||'B?'}</div>
                          <div style={{ fontSize:8, color:S.muted, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', width:'100%', textAlign:'center' }}>{adm.hospital_patients?.full_name?.split(' ')[0]}</div>
                        </div>
                      ))}
                      {/* Flagged beds */}
                      {(wardMap[ward]||[]).map(b=>(
                        <div key={b.id} title={`${b.patient_name} — ${b.urgency} — ${b.flag_reason}`}
                          style={{ width:64, height:64, borderRadius:8, background:b.urgency==='crisis'?'#FEF2F2':b.urgency==='urgent'?'#FEF3C7':'#FFF7ED', border:`1.5px solid ${b.urgency==='crisis'?'#FECACA':b.urgency==='urgent'?'#FDE68A':'#FED7AA'}`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:10, fontWeight:600, textAlign:'center', padding:4 }}>
                          <div style={{ fontSize:14 }}>{b.urgency==='crisis'?'🚨':b.urgency==='urgent'?'⚠️':'🔔'}</div>
                          <div style={{ fontSize:9, fontWeight:700, color:b.urgency==='crisis'?S.danger:S.warning }}>{b.bed_number}</div>
                          <div style={{ fontSize:8, color:S.muted, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', width:'100%', textAlign:'center' }}>{b.patient_name?.split(' ')[0]}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'340px 1fr', gap:20 }}>
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
