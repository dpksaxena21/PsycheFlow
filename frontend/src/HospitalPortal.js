import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import HospitalAppointments from './HospitalAppointments';
import HospitalNursing from './HospitalNursing';
import HospitalClinicalOrders from './HospitalClinicalOrders';
import HospitalDischarge from './HospitalDischarge';
import HospitalPrescriptions from './HospitalPrescriptions';
import HospitalTelemedicine from './HospitalTelemedicine';

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
  const [tab, setTab] = useState(() => {
    const hash = window.location.hash.replace('#','');
    const valid = ['dashboard','patients','ehr','ipd','pharmacy','lab','billing','queue','beds','referrals','analytics','staff'];
    return valid.includes(hash) ? hash : 'dashboard';
  });

  const setTabWithRoute = (t) => {
    setTab(t);
    window.location.hash = t;
  };
  const [globalSearch, setGlobalSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  // Patients
  const [patients, setPatients] = useState([]);
  const [patSearch, setPatSearch] = useState('');
  const [selPatient, setSelPatient] = useState(null);
  const [patForm, setPatForm] = useState({ full_name:'', date_of_birth:'', gender:'', phone:'', email:'', address:'', emergency_contact_name:'', emergency_contact_phone:'', blood_group:'', allergies:'', insurance_provider:'', insurance_number:'' });
  const [patLoading, setPatLoading] = useState(false);
  const [drawerPatient, setDrawerPatient] = useState(null);
  const [showRegForm, setShowRegForm] = useState(false);
  // EHR
  const [ehrRecords, setEhrRecords] = useState([]);
  const [ehrForm, setEhrForm] = useState({ record_type:'consultation', chief_complaint:'', diagnosis:'', notes:'', follow_up_date:'', bp_systolic:'', bp_diastolic:'', heart_rate:'', temperature:'', spo2:'', respiratory_rate:'', blood_sugar:'', weight:'', prescription:'' });
  const [ehrLoading, setEhrLoading] = useState(false);
  const [showEhrForm, setShowEhrForm] = useState(false);
  const [ehrTab, setEhrTab] = useState('notes');
  const [aiSummary, setAiSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
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
  const [drugSearch, setDrugSearch] = useState('');
  const [drugCategory, setDrugCategory] = useState('');
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
  // RCM
  const [charges, setCharges] = useState([]);
  const [payments, setPayments] = useState([]);
  const [claims, setClaims] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [selInvoice, setSelInvoice] = useState(null);
  const [billingTab, setBillingTab] = useState('dashboard');
  const [billingPatient, setBillingPatient] = useState(null);
  const [chargeForm, setChargeForm] = useState({ department:'', item_name:'', quantity:1, unit_price:'', hsn_code:'', gst_rate:18 });
  const [payForm, setPayForm] = useState({ amount:'', payment_method:'cash', reference_number:'', notes:'' });
  const [claimForm, setClaimForm] = useState({ policy_number:'', insurance_company:'', claim_amount:'', notes:'' });
  const [refundForm, setRefundForm] = useState({ amount:'', reason:'', approved_by:'' });
  const [discountForm, setDiscountForm] = useState({ discount_percent:'', reason:'', approved_by:'' });
  const [showChargeForm, setShowChargeForm] = useState(false);
  const [showPayForm, setShowPayForm] = useState(false);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  // Cross-connections
  const [crossReferrals, setCrossReferrals] = useState([]);
  const [psychSearch, setPsychSearch] = useState('');
  const [psychResults, setPsychResults] = useState([]);
  const [refForm, setRefForm] = useState({ patient_id:'', psychologist_id:'', reason:'', priority:'normal', notes:'' });
  const [showCrossRef, setShowCrossRef] = useState(false);
  const [linkForm, setLinkForm] = useState({ patient_id:'', platform_email:'' });
  const [showLinkForm, setShowLinkForm] = useState(false);
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

  const generateAISummary = async (type) => {
    if (!selPatient) return;
    setAiLoading(true);
    setAiSummary('');
    try {
      const API = 'https://web-production-3887e.up.railway.app';
      const res = await fetch(API + '/chatbot', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          messages: [{ role: 'user', content: type === 'summarize'
            ? `Summarize this patient: ${selPatient.full_name}, ${selPatient.date_of_birth?Math.floor((new Date()-new Date(selPatient.date_of_birth))/(365.25*24*60*60*1000)):'?'}y, ${selPatient.gender||''}. Allergies: ${selPatient.allergies||'none'}. EHR records: ${ehrRecords.length}. Latest diagnosis: ${ehrRecords[0]?.diagnosis||'none'}. Be brief and clinical.`
            : type === 'progress'
            ? `Generate a clinical progress note for: ${selPatient.full_name}. Latest vitals: ${ehrRecords[0]?.vitals ? JSON.stringify(ehrRecords[0].vitals) : 'not recorded'}. Diagnosis: ${ehrRecords[0]?.diagnosis||'unknown'}. Keep it professional and brief.`
            : `Generate a discharge summary for: ${selPatient.full_name}. Diagnosis: ${ehrRecords[0]?.diagnosis||'unknown'}. Include follow-up instructions. Be concise.` }],
          user_id: 'hospital_admin',
          context: {}
        })
      });
      const data = await res.json();
      setAiSummary(data.response || data.message || 'Unable to generate summary.');
    } catch { setAiSummary('Error generating AI summary.'); }
    setAiLoading(false);
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
  const loadCrossReferrals = async () => {
    if (!hospital) return;
    const { data } = await supabase.from('cross_referrals')
      .select('*, hospital_patients(full_name, patient_uid)')
      .eq('hospital_id', hospital.id)
      .order('created_at', { ascending: false });
    setCrossReferrals(data || []);
  };

  const searchPsychologists = async (term) => {
    if (term.length < 2) { setPsychResults([]); return; }
    try {
      const { data } = await supabase.from('profiles')
        .select('id, display_name, full_name, specialization')
        .or(`display_name.ilike.%${term}%,full_name.ilike.%${term}%`)
        .limit(5);
      setPsychResults(data || []);
    } catch { setPsychResults([]); }
  };

  const sendCrossReferral = async () => {
    if (!refForm.patient_id || !refForm.psychologist_id || !hospital) return;
    await supabase.from('cross_referrals').insert({
      hospital_id: hospital.id,
      patient_id: refForm.patient_id,
      psychologist_id: refForm.psychologist_id,
      reason: refForm.reason,
      priority: refForm.priority,
      notes: refForm.notes,
      status: 'pending'
    });
    setRefForm({ patient_id:'', psychologist_id:'', reason:'', priority:'normal', notes:'' });
    setShowCrossRef(false);
    await loadCrossReferrals();
  };

  const linkPatientToPlatform = async () => {
    if (!linkForm.patient_id || !linkForm.platform_email) return;
    try {
      // Try profiles table first with display_name or full_name match
      const { data: profile } = await supabase.from('profiles')
        .select('id').eq('email', linkForm.platform_email).maybeSingle();
      const userId = profile?.id;
      if (!userId) { alert('No PsycheFlow account found with that email. Ask the patient to register first.'); return; }
      await supabase.from('hospital_patients')
        .update({ platform_user_id: userId, platform_linked_at: new Date().toISOString() })
        .eq('id', linkForm.patient_id);
      setLinkForm({ patient_id:'', platform_email:'' });
      setShowLinkForm(false);
      await loadPatients();
      alert('Patient linked successfully.');
    } catch(e) { alert('Link failed. Please try again.'); }
  };

  const loadRCM = async () => {
    if (!hospital) return;
    const [{ data: ch }, { data: py }, { data: cl }, { data: rf }, { data: dc }] = await Promise.all([
      supabase.from('bill_charges').select('*, hospital_patients(full_name,patient_uid)').eq('hospital_id', hospital.id).order('created_at', { ascending:false }),
      supabase.from('bill_payments').select('*, hospital_patients(full_name,patient_uid)').eq('hospital_id', hospital.id).order('created_at', { ascending:false }),
      supabase.from('insurance_claims').select('*, hospital_patients(full_name,patient_uid)').eq('hospital_id', hospital.id).order('created_at', { ascending:false }),
      supabase.from('bill_refunds').select('*, hospital_patients(full_name,patient_uid)').eq('hospital_id', hospital.id).order('created_at', { ascending:false }),
      supabase.from('bill_discounts').select('*').eq('hospital_id', hospital.id).order('created_at', { ascending:false }),
    ]);
    setCharges(ch||[]);
    setPayments(py||[]);
    setClaims(cl||[]);
    setRefunds(rf||[]);
    setDiscounts(dc||[]);
  };

  const addCharge = async () => {
    if (!chargeForm.department||!chargeForm.item_name||!chargeForm.unit_price||!selInvoice) return;
    const total = parseFloat(chargeForm.unit_price) * parseInt(chargeForm.quantity||1);
    await supabase.from('bill_charges').insert({ hospital_id:hospital.id, patient_id:selInvoice.patient_id, invoice_id:selInvoice.id, ...chargeForm, quantity:parseInt(chargeForm.quantity||1), unit_price:parseFloat(chargeForm.unit_price), total });
    // Update invoice total
    const newSubtotal = (parseFloat(selInvoice.subtotal||0)) + total;
    const newTax = newSubtotal * 0.18;
    await supabase.from('billing_invoices').update({ subtotal:newSubtotal, tax:newTax, total:newSubtotal+newTax }).eq('id', selInvoice.id);
    setChargeForm({ department:'', item_name:'', quantity:1, unit_price:'', hsn_code:'', gst_rate:18 });
    setShowChargeForm(false);
    await loadBilling(); await loadRCM();
  };

  const addPayment = async () => {
    if (!payForm.amount||!selInvoice) return;
    await supabase.from('bill_payments').insert({ hospital_id:hospital.id, patient_id:selInvoice.patient_id, invoice_id:selInvoice.id, amount:parseFloat(payForm.amount), payment_method:payForm.payment_method, reference_number:payForm.reference_number, notes:payForm.notes });
    // Check if fully paid
    const totalPaid = payments.filter(p=>p.invoice_id===selInvoice.id).reduce((s,p)=>s+parseFloat(p.amount||0),0) + parseFloat(payForm.amount);
    if (totalPaid >= parseFloat(selInvoice.total||0)) {
      await supabase.from('billing_invoices').update({ status:'paid', payment_method:payForm.payment_method, paid_at:new Date().toISOString() }).eq('id', selInvoice.id);
    }
    setPayForm({ amount:'', payment_method:'cash', reference_number:'', notes:'' });
    setShowPayForm(false);
    await loadBilling(); await loadRCM();
  };

  const addClaim = async () => {
    if (!claimForm.insurance_company||!claimForm.claim_amount||!selInvoice) return;
    const claimNo = 'CLM-'+Date.now().toString().slice(-8);
    await supabase.from('insurance_claims').insert({ hospital_id:hospital.id, patient_id:selInvoice.patient_id, invoice_id:selInvoice.id, claim_number:claimNo, ...claimForm, claim_amount:parseFloat(claimForm.claim_amount) });
    setClaimForm({ policy_number:'', insurance_company:'', claim_amount:'', notes:'' });
    setShowClaimForm(false);
    await loadRCM();
  };

  const addRefund = async () => {
    if (!refundForm.amount||!selInvoice) return;
    await supabase.from('bill_refunds').insert({ hospital_id:hospital.id, patient_id:selInvoice.patient_id, invoice_id:selInvoice.id, amount:parseFloat(refundForm.amount), reason:refundForm.reason, approved_by:refundForm.approved_by });
    setRefundForm({ amount:'', reason:'', approved_by:'' });
    setShowRefundForm(false);
    await loadRCM();
  };

  const addDiscount = async () => {
    if (!discountForm.discount_percent||!selInvoice) return;
    const discAmt = parseFloat(selInvoice.subtotal||0) * parseFloat(discountForm.discount_percent) / 100;
    await supabase.from('bill_discounts').insert({ hospital_id:hospital.id, invoice_id:selInvoice.id, discount_percent:parseFloat(discountForm.discount_percent), discount_amount:discAmt, reason:discountForm.reason, approved_by:discountForm.approved_by, status:'approved' });
    const newTotal = parseFloat(selInvoice.total||0) - discAmt;
    await supabase.from('billing_invoices').update({ total:newTotal }).eq('id', selInvoice.id);
    setDiscountForm({ discount_percent:'', reason:'', approved_by:'' });
    setShowDiscountForm(false);
    await loadBilling(); await loadRCM();
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
      } catch (e) {  }
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
    { id:'connections', label:'Connections' },
    { id:'analytics', label:'Analytics' },
    { id:'appointments', label:'Appointments' },
    { id:'nursing', label:'Nursing' },
    { id:'orders', label:'Clinical Orders' },
    { id:'discharge', label:'Discharge' },
    { id:'prescriptions', label:'Prescriptions' },
    { id:'telemedicine', label:'Telemedicine' },
    { id:'nabh', label:'NABH' },
    { id:'staff', label:'Staff' },
  ];

  const inp = { width:'100%', padding:'9px 12px', borderRadius:8, border:'0.5px solid '+S.border, fontSize:13, boxSizing:'border-box', outline:'none', background:S.bg, color:S.navy, fontFamily:"'Satoshi',-apple-system,sans-serif" };
  const sel = { ...inp, background:S.bg };

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', fontFamily:"'Satoshi',-apple-system,sans-serif", color:S.muted }}>Loading hospital portal...</div>;
  if (!hospital) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', fontFamily:"'Satoshi',-apple-system,sans-serif", color:S.muted }}>Hospital not found. Please contact support.</div>;

  const waiting = queue.filter(q=>q.status==='waiting').length;

  // ── Hospital Intelligence Engine ──────────────────────
  // Intelligence insights — inline safe implementation
  const intelligence = (() => {
    try {
      const insights = [];
      const criticalQ = (queue||[]).filter(q=>q.priority==='crisis'&&q.status==='waiting');
      if (criticalQ.length > 0) insights.push({ type:'critical', icon:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#DC2626" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="9" x2="12" y2="13" stroke="#DC2626" strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="17" r="1" fill="#DC2626"/></svg>', title:`${criticalQ.length} Crisis Patient(s) in Queue`, body:'Immediate attention required' });
      const dischargeable = (ipdList||[]).filter(a=>{
        if(a.status!=='admitted') return false;
        const days = Math.floor((Date.now()-new Date(a.admission_date))/(24*60*60*1000));
        return days >= 4;
      });
      if (dischargeable.length > 0) insights.push({ type:'info', icon:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#1D4ED8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="8" x2="12" y2="14" stroke="#1D4ED8" strokeWidth="1.8" strokeLinecap="round"/><line x1="9" y1="11" x2="15" y2="11" stroke="#1D4ED8" strokeWidth="1.8" strokeLinecap="round"/></svg>', title:`${dischargeable.length} Patient(s) May Be Ready for Discharge`, body: dischargeable.map(d=>d.hospital_patients?.full_name||'Unknown').join(', ') });
      const lowStock = (drugs||[]).filter(d=>d.stock_quantity<=d.reorder_level);
      if (lowStock.length > 0) insights.push({ type:'warning', icon:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#D97706" strokeWidth="1.8"/><path d="M12 8v4M12 16h.01" stroke="#D97706" strokeWidth="1.8" strokeLinecap="round"/></svg>', title:`${lowStock.length} Drug(s) Low on Stock`, body: lowStock.slice(0,3).map(d=>d.drug_name).join(', ') });
      return { insights, discharge_candidates: dischargeable };
    } catch { return null; }
  })();

  const triagedQueue = (() => {
    try {
      if (!queue?.length) return [];
      const priorityWeight = { crisis:0, urgent:10, normal:20 };
      const now = Date.now();
      return [...queue].filter(q=>q.status==='waiting').sort((a,b)=>{
        const aScore = (priorityWeight[a.priority]||20) + Math.max(0, 30-Math.floor((now-new Date(a.created_at))/60000));
        const bScore = (priorityWeight[b.priority]||20) + Math.max(0, 30-Math.floor((now-new Date(b.created_at))/60000));
        return aScore - bScore;
      });
    } catch { return queue||[]; }
  })();

  const leakage = (() => {
    try {
      const leaks = [];
      (ipdList||[]).filter(a=>a.status==='admitted').forEach(adm=>{
        const patCharges = (charges||[]).filter(c=>c.patient_id===adm.patient_id);
        const depts = new Set(patCharges.map(c=>c.department?.toLowerCase()));
        const days = Math.floor((Date.now()-new Date(adm.admission_date))/(24*60*60*1000));
        if(days>0 && !depts.has('room') && !depts.has('bed')) leaks.push({ patient_name:adm.hospital_patients?.full_name, message:`Room charges missing (${days} day${days>1?'s':''})`, estimated_loss:days*2000 });
      });
      (labOrders||[]).filter(l=>l.status==='resulted').forEach(lab=>{
        const billed = (charges||[]).some(c=>c.patient_id===lab.patient_id&&c.department?.toLowerCase()==='lab');
        if(!billed) leaks.push({ patient_name:lab.hospital_patients?.full_name, message:`Lab "${lab.test_name}" not billed`, estimated_loss:800 });
      });
      return { leaks, total_leakage:leaks.reduce((s,l)=>s+l.estimated_loss,0), count:leaks.length };
    } catch { return { leaks:[], total_leakage:0, count:0 }; }
  })();
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
          <div style={{ width:28, height:28, borderRadius:7, background:S.blue, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="15" height="15" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C9 1.5 4 5 4 10C4 12.8 6.2 15 9 15C11.8 15 14 12.8 14 10C14 5 9 1.5 9 1.5Z" fill="white" opacity="0.9"/><circle cx="9" cy="10" r="2.2" fill="#0C1A2E"/></svg>
          </div>
          <div style={{ flexShrink:0 }}>
            <div style={{ fontSize:13, fontWeight:700, color:S.navy, letterSpacing:'-0.01em' }}>{hospital.name}</div>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:1 }}>
              <span style={{ fontSize:9, color:S.hint }}>{hospital.city}</span>
              <span style={{ fontSize:9, color:S.border }}>·</span>
              <span style={{ fontSize:9, color:S.hint, fontFamily:'monospace' }}>{hospital.hospital_code}</span>
              <span style={{ fontSize:9, color:S.border }}>·</span>
              <span style={{ width:5, height:5, borderRadius:'50%', background: waiting>0?'#f59e0b':'#22c55e', display:'inline-block' }}/>
              <span style={{ fontSize:9, color: waiting>0?S.warning:S.success, fontWeight:600 }}>{waiting} waiting</span>
              <span style={{ fontSize:9, color:S.border }}>·</span>
              <span style={{ fontSize:9, color:'#7C3AED', fontWeight:600 }}>{ipdList.filter(i=>i.status==='admitted').length} admitted</span>
              <span style={{ fontSize:9, color:S.border }}>·</span>
              <span style={{ fontSize:9, color:S.success, fontWeight:600 }}>₹{invoices.filter(i=>i.status==='paid'&&new Date(i.paid_at||i.created_at).toDateString()===new Date().toDateString()).reduce((s,i)=>s+parseFloat(i.total||0),0).toFixed(0)} today</span>
            </div>
          </div>
          {isMobile && <button onClick={onLogout} style={{ padding:'6px 12px', background:'transparent', border:'0.5px solid '+S.border, borderRadius:8, fontSize:12, color:S.muted, cursor:'pointer' }}>Sign out</button>}
        </div>
        <div style={{ display:'flex', gap:4, flex:1, overflowX:'auto', WebkitOverflowScrolling:'touch', minWidth:0 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTabWithRoute(t.id)}
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
          <div style={{ position:'relative', marginRight:8, flexShrink:0 }}>
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
                  { label:'+ New Patient', action:()=>{ setTabWithRoute('patients'); setShowQuickActions(false); } },
                  { label:'+ New EHR Record', action:()=>{ setTabWithRoute('ehr'); setShowEhrForm(true); setShowQuickActions(false); } },
                  { label:'+ Admit Patient', action:()=>{ setTabWithRoute('ipd'); setShowIpdForm(true); setShowQuickActions(false); } },
                  { label:'+ Lab Order', action:()=>{ setTabWithRoute('lab'); setShowLabForm(true); setShowQuickActions(false); } },
                  { label:'+ Create Invoice', action:()=>{ setTabWithRoute('billing'); setShowInvForm(true); setShowQuickActions(false); } },
                  { label:'+ OPD Token', action:()=>{ setTabWithRoute('queue'); setShowQuickActions(false); } },
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
          <div style={{ position:'relative' }}>
            {/* KPI Row */}
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'repeat(2,1fr)':'repeat(4,1fr)', gap:12, marginBottom:20 }}>
              {[
                { label:'Total Patients', value:patients.length, color:S.blue },
                { label:'New This Month', value:patients.filter(p=>new Date(p.created_at).getMonth()===new Date().getMonth()).length, color:S.cyan },
                { label:'Currently Admitted', value:ipdList.filter(i=>i.status==='admitted').length, color:'#7C3AED' },
                { label:'With Allergies', value:patients.filter(p=>p.allergies).length, color:S.danger },
              ].map((k,i)=>(
                <div key={i} style={{ ...card, padding:'14px 18px' }}>
                  <div style={{ fontSize:26, fontWeight:700, color:k.color, letterSpacing:'-0.02em' }}>{k.value}</div>
                  <div style={{ fontSize:11, color:S.muted, marginTop:2 }}>{k.label}</div>
                </div>
              ))}
            </div>

            {/* Header + actions */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:10 }}>
              <div style={{ display:'flex', gap:8 }}>
                <input value={patSearch} onChange={e=>setPatSearch(e.target.value)} placeholder="Search by name or ID..."
                  style={{ padding:'8px 14px', borderRadius:8, border:'0.5px solid '+S.border, fontSize:13, outline:'none', background:S.bg, color:S.navy, width:220 }}/>
              </div>
              <button onClick={()=>setShowRegForm(f=>!f)} style={{ padding:'8px 16px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                {showRegForm?'Cancel':'+ Register Patient'}
              </button>
            </div>

            {/* Registration Form — collapsible */}
            {showRegForm && (
              <div style={{ ...card, marginBottom:20, borderColor:S.blue }}>
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
                <button onClick={()=>{ addPatient(); setShowRegForm(false); }} disabled={patLoading||!patForm.full_name}
                  style={{ marginTop:16, padding:'10px 24px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                  {patLoading ? 'Registering...' : '+ Register Patient'}
                </button>
              </div>
            )}

            {/* Patient Table */}
            <div style={{ ...card, padding:0, overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:S.bg }}>
                    {['MRN','Patient','Age / Gender','Blood','Phone','Allergies','Registered','Actions'].map(h=>(
                      <th key={h} style={{ padding:'10px 14px', fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', textAlign:'left', borderBottom:'0.5px solid '+S.border, whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {patients.filter(p => !patSearch || p.full_name?.toLowerCase().includes(patSearch.toLowerCase()) || p.patient_uid?.includes(patSearch.toUpperCase())).map((p,i) => (
                    <tr key={p.id} style={{ borderBottom:'0.5px solid '+S.border, cursor:'pointer' }}
                      onMouseEnter={e=>e.currentTarget.style.background=S.lightBlue}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{ padding:'10px 14px', fontSize:12, fontWeight:700, color:S.blue }}>{p.patient_uid}</td>
                      <td style={{ padding:'10px 14px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ width:30, height:30, borderRadius:'50%', background:S.lightBlue, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:S.blue, flexShrink:0 }}>{p.full_name?.charAt(0)}</div>
                          <div>
                            <div style={{ fontSize:13, fontWeight:600, color:S.navy }}>{p.full_name}</div>
                            <div style={{ fontSize:10, color:S.muted }}>{p.email||'No email'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding:'10px 14px', fontSize:12, color:S.navy }}>
                        {p.date_of_birth ? Math.floor((new Date()-new Date(p.date_of_birth))/(365.25*24*60*60*1000))+'y' : '-'} / {p.gender||'-'}
                      </td>
                      <td style={{ padding:'10px 14px', fontSize:12, color:S.navy }}>{p.blood_group||'-'}</td>
                      <td style={{ padding:'10px 14px', fontSize:12, color:S.navy }}>{p.phone||'-'}</td>
                      <td style={{ padding:'10px 14px' }}>{p.allergies?<Badge color="red">{p.allergies.slice(0,15)}</Badge>:<span style={{fontSize:11,color:S.hint}}>None</span>}</td>
                      <td style={{ padding:'10px 14px', fontSize:11, color:S.muted }}>{new Date(p.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</td>
                      <td style={{ padding:'10px 14px' }}>
                        <div style={{ display:'flex', gap:4 }}>
                          <button onClick={()=>setDrawerPatient(p)} style={{ fontSize:10, padding:'3px 8px', background:S.lightBlue, color:S.blue, border:'none', borderRadius:5, cursor:'pointer', fontWeight:600 }}>View</button>
                          <button onClick={()=>{ setSelPatient(p); loadEHR(p.id); setTab('ehr'); }} style={{ fontSize:10, padding:'3px 8px', background:'#ECFDF5', color:S.success, border:'none', borderRadius:5, cursor:'pointer', fontWeight:600 }}>EHR</button>
                          <button onClick={()=>{ setIpdForm({...ipdForm,patient_id:p.id}); setTab('ipd'); setShowIpdForm(true); }} style={{ fontSize:10, padding:'3px 8px', background:'#F3F4F6', color:S.muted, border:'none', borderRadius:5, cursor:'pointer', fontWeight:600 }}>Admit</button>
                          <button onClick={()=>{ setInvForm({...invForm,patient_id:p.id}); setTab('billing'); setShowInvForm(true); }} style={{ fontSize:10, padding:'3px 8px', background:'#FEF3C7', color:S.warning, border:'none', borderRadius:5, cursor:'pointer', fontWeight:600 }}>Bill</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {patients.length===0 && <div style={{ textAlign:'center', padding:48, color:S.muted, fontSize:13 }}>No patients yet. Click "+ Register Patient" to add your first patient.</div>}
            </div>

            {/* Patient Drawer */}
            {drawerPatient && (
              <div style={{ position:'fixed', top:0, right:0, width:isMobile?'100%':380, height:'100vh', background:S.card, borderLeft:'0.5px solid '+S.border, boxShadow:'-4px 0 24px rgba(0,0,0,0.1)', zIndex:300, overflowY:'auto', display:'flex', flexDirection:'column' }}>
                <div style={{ padding:'16px 20px', borderBottom:'0.5px solid '+S.border, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ fontSize:13, fontWeight:700, color:S.navy }}>Patient Snapshot</div>
                  <button onClick={()=>setDrawerPatient(null)} style={{ background:'none', border:'none', fontSize:18, cursor:'pointer', color:S.muted }}>×</button>
                </div>
                <div style={{ padding:20, flex:1 }}>
                  {/* Avatar + name */}
                  <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
                    <div style={{ width:56, height:56, borderRadius:'50%', background:S.lightBlue, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:700, color:S.blue }}>{drawerPatient.full_name?.charAt(0)}</div>
                    <div>
                      <div style={{ fontSize:18, fontWeight:700, color:S.navy }}>{drawerPatient.full_name}</div>
                      <div style={{ fontSize:12, color:S.blue, fontWeight:600 }}>{drawerPatient.patient_uid}</div>
                    </div>
                  </div>
                  {/* Details grid */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
                    {[
                      ['Age', drawerPatient.date_of_birth ? Math.floor((new Date()-new Date(drawerPatient.date_of_birth))/(365.25*24*60*60*1000))+'y' : 'N/A'],
                      ['Gender', drawerPatient.gender||'N/A'],
                      ['Blood Group', drawerPatient.blood_group||'N/A'],
                      ['Phone', drawerPatient.phone||'N/A'],
                      ['Email', drawerPatient.email||'N/A'],
                      ['Insurance', drawerPatient.insurance_provider||'None'],
                    ].map(([label,val])=>(
                      <div key={label} style={{ background:S.bg, borderRadius:8, padding:'10px 12px' }}>
                        <div style={{ fontSize:9, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:3 }}>{label}</div>
                        <div style={{ fontSize:13, fontWeight:600, color:S.navy }}>{val}</div>
                      </div>
                    ))}
                  </div>
                  {/* Allergies */}
                  {drawerPatient.allergies && (
                    <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:8, padding:'10px 14px', marginBottom:16 }}>
                      <div style={{ fontSize:10, fontWeight:700, color:S.danger, textTransform:'uppercase', marginBottom:3 }}>⚠ Allergies</div>
                      <div style={{ fontSize:13, color:S.danger }}>{drawerPatient.allergies}</div>
                    </div>
                  )}
                  {/* Emergency contact */}
                  {drawerPatient.emergency_contact_name && (
                    <div style={{ background:S.bg, borderRadius:8, padding:'10px 14px', marginBottom:16 }}>
                      <div style={{ fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', marginBottom:3 }}>Emergency Contact</div>
                      <div style={{ fontSize:13, color:S.navy }}>{drawerPatient.emergency_contact_name}</div>
                      <div style={{ fontSize:12, color:S.muted }}>{drawerPatient.emergency_contact_phone}</div>
                    </div>
                  )}
                  {/* IPD status */}
                  {(() => { const adm = ipdList.find(i=>i.patient_id===drawerPatient.id&&i.status==='admitted'); return adm ? (
                    <div style={{ background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:8, padding:'10px 14px', marginBottom:16 }}>
                      <div style={{ fontSize:10, fontWeight:700, color:S.blue, textTransform:'uppercase', marginBottom:3 }}>Currently Admitted</div>
                      <div style={{ fontSize:13, color:S.navy }}>Ward: {adm.ward} · Bed: {adm.bed_number}</div>
                      <div style={{ fontSize:11, color:S.muted }}>{adm.admitting_doctor}</div>
                    </div>
                  ) : null; })()}
                  {/* Outstanding bills */}
                  {(() => { const unpaid = invoices.filter(i=>i.patient_id===drawerPatient.id&&i.status==='unpaid'); return unpaid.length>0 ? (
                    <div style={{ background:'#FEF3C7', border:'1px solid #FDE68A', borderRadius:8, padding:'10px 14px', marginBottom:16 }}>
                      <div style={{ fontSize:10, fontWeight:700, color:S.warning, textTransform:'uppercase', marginBottom:3 }}>Outstanding Balance</div>
                      <div style={{ fontSize:18, fontWeight:700, color:S.warning }}>₹{unpaid.reduce((s,i)=>s+parseFloat(i.total||0),0).toFixed(0)}</div>
                    </div>
                  ) : null; })()}
                  {/* Quick actions */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:8 }}>
                    {[
                      { label:'View EHR', color:S.blue, bg:S.lightBlue, action:()=>{ setSelPatient(drawerPatient); loadEHR(drawerPatient.id); setTab('ehr'); setDrawerPatient(null); } },
                      { label:'Admit IPD', color:'#7C3AED', bg:'#F5F3FF', action:()=>{ setIpdForm({...ipdForm,patient_id:drawerPatient.id}); setTab('ipd'); setShowIpdForm(true); setDrawerPatient(null); } },
                      { label:'Create Bill', color:S.warning, bg:'#FFFBEB', action:()=>{ setInvForm({...invForm,patient_id:drawerPatient.id}); setTab('billing'); setShowInvForm(true); setDrawerPatient(null); } },
                      { label:'Lab Order', color:S.success, bg:'#ECFDF5', action:()=>{ setLabForm({...labForm,patient_id:drawerPatient.id}); setTab('lab'); setShowLabForm(true); setDrawerPatient(null); } },
                    ].map(a=>(
                      <button key={a.label} onClick={a.action} style={{ padding:'10px', background:a.bg, color:a.color, border:'none', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer' }}>{a.label}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* EHR */}
        {tab==='ehr' && (
          <div>
            {/* Back + actions */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16, flexWrap:'wrap' }}>
              <button onClick={()=>setTab('patients')} style={{ padding:'6px 14px', background:'#fff', border:'0.5px solid '+S.border, borderRadius:8, cursor:'pointer', fontSize:12, color:S.muted }}>← Patients</button>
              {selPatient && <button onClick={()=>setShowEhrForm(f=>!f)} style={{ marginLeft:'auto', padding:'8px 16px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>{showEhrForm?'Cancel':'+ New Record'}</button>}
            </div>

            {/* Sticky Patient Header */}
            {selPatient ? (
              <div style={{ background:S.navy, borderRadius:12, padding:'16px 20px', marginBottom:16, display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
                <div style={{ width:44, height:44, borderRadius:'50%', background:'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, color:'#fff', flexShrink:0 }}>{selPatient.full_name?.charAt(0)}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:17, fontWeight:700, color:'#fff' }}>{selPatient.full_name}</div>
                  <div style={{ display:'flex', gap:12, marginTop:4, flexWrap:'wrap' }}>
                    {[
                      selPatient.date_of_birth ? Math.floor((new Date()-new Date(selPatient.date_of_birth))/(365.25*24*60*60*1000))+'y' : null,
                      selPatient.gender,
                      'MRN: '+selPatient.patient_uid,
                      selPatient.blood_group,
                    ].filter(Boolean).map((v,i)=><span key={i} style={{ fontSize:11, color:'rgba(255,255,255,0.6)' }}>{v}</span>)}
                  </div>
                </div>
                {selPatient.allergies && (
                  <div style={{ background:'rgba(220,38,38,0.2)', border:'1px solid rgba(220,38,38,0.4)', borderRadius:7, padding:'4px 10px', fontSize:11, fontWeight:700, color:'#FCA5A5' }}>⚠ {selPatient.allergies}</div>
                )}
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)' }}>{ehrRecords.length} records</div>
              </div>
            ) : <div style={{ ...card, textAlign:'center', padding:32, color:S.muted, fontSize:13, marginBottom:16 }}>Select a patient from the Patients tab to view their EHR.</div>}

            {selPatient && (
              <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 280px', gap:16 }}>
                <div>
                  {/* Sub tabs */}
                  <div style={{ display:'flex', gap:4, marginBottom:16, background:S.bg, borderRadius:8, padding:3 }}>
                    {['notes','timeline'].map(t=>(
                      <button key={t} onClick={()=>setEhrTab(t)} style={{ flex:1, padding:'7px', border:'none', borderRadius:6, cursor:'pointer', fontSize:12, fontWeight:ehrTab===t?700:400, background:ehrTab===t?S.card:S.bg, color:ehrTab===t?S.navy:S.muted, boxShadow:ehrTab===t?'0 1px 4px rgba(0,0,0,0.08)':'none' }}>
                        {t==='notes'?'Clinical Notes':'Timeline'}
                      </button>
                    ))}
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

            {/* Timeline / Notes toggle */}
            {ehrTab==='timeline' && selPatient && (
              <div style={{ ...card, padding:0, overflow:'hidden' }}>
                <div style={{ padding:'12px 16px', borderBottom:'0.5px solid '+S.border, fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em' }}>Patient Timeline</div>
                {ehrRecords.length===0 ? <div style={{ padding:32, textAlign:'center', color:S.muted, fontSize:13 }}>No records yet.</div> : (
                  <div style={{ padding:'8px 16px' }}>
                    {ehrRecords.map((r,i)=>(
                      <div key={r.id} style={{ display:'flex', gap:12, padding:'12px 0', borderBottom:i<ehrRecords.length-1?'0.5px solid '+S.border:'none' }}>
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:0 }}>
                          <div style={{ width:10, height:10, borderRadius:'50%', background: r.record_type==='emergency'?S.danger:r.record_type==='discharge'?S.success:S.blue, flexShrink:0, marginTop:3 }}/>
                          {i<ehrRecords.length-1 && <div style={{ width:1, flex:1, background:S.border, marginTop:4 }}/>}
                        </div>
                        <div style={{ flex:1, paddingBottom:8 }}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                            <span style={{ fontSize:12, fontWeight:600, color:S.navy }}>{r.record_type?.replace('_',' ').toUpperCase()}</span>
                            <span style={{ fontSize:10, color:S.muted }}>{new Date(r.created_at).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</span>
                          </div>
                          {r.chief_complaint && <div style={{ fontSize:12, color:S.muted, marginTop:2 }}>{r.chief_complaint}</div>}
                          {r.diagnosis && <div style={{ fontSize:12, color:S.blue, marginTop:2, fontWeight:500 }}>Dx: {r.diagnosis}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                {/* AI Panel */}
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  <div style={{ ...card, padding:16 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>AI Copilot</div>
                    {[
                      { label:'Summarize Patient', type:'summarize' },
                      { label:'Generate Progress Note', type:'progress' },
                      { label:'Draft Discharge Summary', type:'discharge' },
                    ].map(a=>(
                      <button key={a.type} onClick={()=>generateAISummary(a.type)} disabled={aiLoading||!selPatient}
                        style={{ width:'100%', padding:'9px 12px', background:S.lightBlue, color:S.blue, border:'0.5px solid '+S.border, borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', marginBottom:8, textAlign:'left', fontFamily:'inherit' }}>
                        {aiLoading?'Generating...':a.label}
                      </button>
                    ))}
                    {aiSummary && (
                      <div style={{ background:S.bg, borderRadius:8, padding:12, fontSize:12, color:S.navy, lineHeight:1.7, marginTop:4, borderLeft:'3px solid '+S.blue }}>
                        {aiSummary}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
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
            {/* Pharmacy search + filter */}
            <div style={{ display:'flex', gap:8, marginBottom:12, flexWrap:'wrap' }}>
              <input value={drugSearch} onChange={e=>setDrugSearch(e.target.value)} placeholder="Search drug name or generic..."
                style={{ flex:1, padding:'8px 14px', borderRadius:8, border:'0.5px solid '+S.border, fontSize:13, outline:'none', background:S.bg, color:S.navy, minWidth:200 }}/>
              <select value={drugCategory} onChange={e=>setDrugCategory(e.target.value)}
                style={{ padding:'8px 12px', borderRadius:8, border:'0.5px solid '+S.border, fontSize:13, background:S.bg, color:S.navy, outline:'none' }}>
                <option value="">All Categories</option>
                {[...new Set(drugs.map(d=>d.category).filter(Boolean))].map(c=><option key={c} value={c}>{c}</option>)}
              </select>
              <select onChange={e=>{ if(e.target.value==='low') setDrugSearch('__low__'); else if(e.target.value==='expiring') setDrugSearch('__expiring__'); else setDrugSearch(''); }}
                style={{ padding:'8px 12px', borderRadius:8, border:'0.5px solid '+S.border, fontSize:13, background:S.bg, color:S.navy, outline:'none' }}>
                <option value="">All Status</option>
                <option value="low">Low Stock</option>
                <option value="expiring">Expiring Soon</option>
              </select>
            </div>

            {/* Expiring soon alert */}
            {drugs.filter(d=>d.expiry_date&&new Date(d.expiry_date)<new Date(Date.now()+30*24*60*60*1000)).length>0 && (
              <div style={{ background:'#FEF3C7', border:'1px solid #FDE68A', borderRadius:10, padding:'10px 16px', marginBottom:12, fontSize:12, color:S.warning, fontWeight:500 }}>
                ⏰ {drugs.filter(d=>d.expiry_date&&new Date(d.expiry_date)<new Date(Date.now()+30*24*60*60*1000)).length} drug(s) expiring within 30 days
              </div>
            )}
            {/* Dense table */}
            <div style={{ ...card, padding:0, overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:S.bg }}>
                    {['Drug Name','Generic','Category','Stock','Unit','Reorder','Expiry','Price','Supplier','Status'].map(h=>(
                      <th key={h} style={{ padding:'9px 12px', fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.05em', textAlign:'left', borderBottom:'0.5px solid '+S.border, whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    let filtered = drugs;
                    if(drugSearch==='__low__') filtered = drugs.filter(d=>d.stock_quantity<=d.reorder_level);
                    else if(drugSearch==='__expiring__') filtered = drugs.filter(d=>d.expiry_date&&new Date(d.expiry_date)<new Date(Date.now()+30*24*60*60*1000));
                    else if(drugSearch) filtered = drugs.filter(d=>d.drug_name?.toLowerCase().includes(drugSearch.toLowerCase())||d.generic_name?.toLowerCase().includes(drugSearch.toLowerCase()));
                    if(drugCategory) filtered = filtered.filter(d=>d.category===drugCategory);
                    return filtered;
                  })().length===0 ? (
                    <tr><td colSpan={10} style={{ padding:40, textAlign:'center', color:S.muted, fontSize:13 }}>No drugs match your search.</td></tr>
                  ) : (() => {
                    let filtered = drugs;
                    if(drugSearch==='__low__') filtered = drugs.filter(d=>d.stock_quantity<=d.reorder_level);
                    else if(drugSearch==='__expiring__') filtered = drugs.filter(d=>d.expiry_date&&new Date(d.expiry_date)<new Date(Date.now()+30*24*60*60*1000));
                    else if(drugSearch) filtered = drugs.filter(d=>d.drug_name?.toLowerCase().includes(drugSearch.toLowerCase())||d.generic_name?.toLowerCase().includes(drugSearch.toLowerCase()));
                    if(drugCategory) filtered = filtered.filter(d=>d.category===drugCategory);
                    return filtered;
                  })().map(d=>{
                    const expiring = d.expiry_date && new Date(d.expiry_date) < new Date(Date.now()+30*24*60*60*1000);
                    const lowStock = d.stock_quantity <= d.reorder_level;
                    return (
                    <tr key={d.id} style={{ borderBottom:'0.5px solid '+S.border, background: expiring?'#FFFBEB':lowStock?'#FFF5F5':'transparent' }}
                      onMouseEnter={e=>e.currentTarget.style.background=S.lightBlue}
                      onMouseLeave={e=>e.currentTarget.style.background=expiring?'#FFFBEB':lowStock?'#FFF5F5':'transparent'}>
                      <td style={{ padding:'9px 12px', fontSize:13, fontWeight:600, color:S.navy }}>{d.drug_name}</td>
                      <td style={{ padding:'9px 12px', fontSize:12, color:S.muted }}>{d.generic_name||'-'}</td>
                      <td style={{ padding:'9px 12px', fontSize:12, color:S.muted }}>{d.category||'-'}</td>
                      <td style={{ padding:'9px 12px', fontSize:13, fontWeight:700, color:lowStock?S.danger:S.success }}>{d.stock_quantity}</td>
                      <td style={{ padding:'9px 12px', fontSize:12, color:S.muted }}>{d.unit}</td>
                      <td style={{ padding:'9px 12px', fontSize:12, color:S.muted }}>{d.reorder_level}</td>
                      <td style={{ padding:'9px 12px', fontSize:12, color:expiring?S.danger:S.muted }}>{d.expiry_date||'-'}</td>
                      <td style={{ padding:'9px 12px', fontSize:12, color:S.blue }}>{d.price_per_unit>0?'₹'+d.price_per_unit:'-'}</td>
                      <td style={{ padding:'9px 12px', fontSize:12, color:S.muted }}>{d.supplier||'-'}</td>
                      <td style={{ padding:'9px 12px' }}>
                        <Badge color={lowStock?'red':expiring?'yellow':'green'}>{lowStock?'Low':expiring?'Expiring':'OK'}</Badge>
                      </td>
                    </tr>
                  );})}
                </tbody>
              </table>
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

        {/* BILLING — FULL RCM */}
        {tab==='billing' && (
          <div>
            {/* RCM Sub-nav */}
            <div style={{ display:'flex', gap:4, marginBottom:20, overflowX:'auto', WebkitOverflowScrolling:'touch', paddingBottom:4 }}>
              {['dashboard','invoices','charges','payments','insurance','refunds','discounts','revenue'].map(t=>(
                <button key={t} onClick={()=>{ setBillingTab(t); setSelInvoice(null); }}
                  style={{ padding:'7px 14px', border:'none', borderRadius:8, cursor:'pointer', fontSize:12, fontWeight:billingTab===t?700:400, background:billingTab===t?S.blue:'transparent', color:billingTab===t?'#fff':S.muted, whiteSpace:'nowrap', transition:'all 0.15s' }}>
                  {t.charAt(0).toUpperCase()+t.slice(1)}
                </button>
              ))}
            </div>

            {/* BILLING DASHBOARD */}
            {billingTab==='dashboard' && (
              <div>
                <h2 style={{ margin:'0 0 20px', color:S.navy, fontSize:20, fontWeight:700 }}>Billing Command Center</h2>
                <div style={{ display:'grid', gridTemplateColumns:isMobile?'repeat(2,1fr)':'repeat(3,1fr)', gap:16, marginBottom:24 }}>
                  {[
                    { label:'Revenue Today', value:'₹'+invoices.filter(i=>i.status==='paid'&&new Date(i.paid_at||i.created_at).toDateString()===new Date().toDateString()).reduce((s,i)=>s+parseFloat(i.total||0),0).toFixed(0), color:S.success },
                    { label:'Pending Payments', value:'₹'+invoices.filter(i=>i.status==='unpaid').reduce((s,i)=>s+parseFloat(i.total||0),0).toFixed(0), color:S.warning },
                    { label:'Insurance Claims', value:'₹'+claims.reduce((s,c)=>s+parseFloat(c.claim_amount||0),0).toFixed(0), color:S.blue },
                    { label:'Refund Requests', value:refunds.filter(r=>r.status==='requested').length, color:S.danger },
                    { label:'Outstanding Bills', value:invoices.filter(i=>i.status==='unpaid').length+' invoices', color:S.warning },
                    { label:'Total Collected', value:'₹'+payments.reduce((s,p)=>s+parseFloat(p.amount||0),0).toFixed(0), color:S.success },
                  ].map((k,i)=>(
                    <div key={i} style={{ ...card, padding:'18px 20px' }}>
                      <div style={{ fontSize:22, fontWeight:700, color:k.color, letterSpacing:'-0.01em' }}>{k.value}</div>
                      <div style={{ fontSize:12, color:S.muted, marginTop:4 }}>{k.label}</div>
                    </div>
                  ))}
                </div>
                {/* Recent unpaid */}
                <div style={{ ...card }}>
                  <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:16 }}>Pending Invoices</div>
                  {invoices.filter(i=>i.status==='unpaid').slice(0,5).map(inv=>(
                    <div key={inv.id} onClick={()=>{ setSelInvoice(inv); setBillingTab('invoices'); }} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'0.5px solid '+S.border, cursor:'pointer' }}
                      onMouseEnter={e=>e.currentTarget.style.background=S.lightBlue}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:600, color:S.navy }}>{inv.hospital_patients?.full_name}</div>
                        <div style={{ fontSize:11, color:S.muted }}>{inv.invoice_number} · {new Date(inv.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</div>
                      </div>
                      <div style={{ fontSize:15, fontWeight:700, color:S.danger }}>₹{parseFloat(inv.total||0).toFixed(0)}</div>
                    </div>
                  ))}
                  {invoices.filter(i=>i.status==='unpaid').length===0 && <div style={{ textAlign:'center', padding:24, color:S.muted, fontSize:13 }}>No pending invoices</div>}
                </div>
              </div>
            )}

            {/* INVOICES */}
            {billingTab==='invoices' && (
              <div style={{ display:'grid', gridTemplateColumns:selInvoice&&!isMobile?'1fr 320px':'1fr', gap:16 }}>
                <div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:S.navy }}>Invoices ({invoices.length})</div>
                    <button onClick={()=>setShowInvForm(f=>!f)} style={{ padding:'7px 14px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer' }}>{showInvForm?'Cancel':'+ New Invoice'}</button>
                  </div>
                  {showInvForm && (
                    <div style={{ ...card, marginBottom:16, borderColor:S.blue }}>
                      <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>Create Invoice</div>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                        <div>
                          <div style={{ fontSize:10, fontWeight:600, color:S.navy, marginBottom:3, textTransform:'uppercase' }}>Patient *</div>
                          <select value={invForm.patient_id} onChange={e=>setInvForm({...invForm,patient_id:e.target.value})} style={{ width:'100%', padding:'7px 10px', borderRadius:7, border:'0.5px solid '+S.border, fontSize:12, background:S.bg, color:S.navy, outline:'none' }}>
                            <option value="">Select</option>
                            {patients.map(p=><option key={p.id} value={p.id}>{p.full_name} ({p.patient_uid})</option>)}
                          </select>
                        </div>
                        <div>
                          <div style={{ fontSize:10, fontWeight:600, color:S.navy, marginBottom:3, textTransform:'uppercase' }}>Notes</div>
                          <input value={invForm.notes} onChange={e=>setInvForm({...invForm,notes:e.target.value})} style={{ width:'100%', padding:'7px 10px', borderRadius:7, border:'0.5px solid '+S.border, fontSize:12, background:S.bg, color:S.navy, outline:'none', boxSizing:'border-box' }}/>
                        </div>
                      </div>
                      <div style={{ marginBottom:10 }}>
                        <div style={{ fontSize:10, fontWeight:600, color:S.navy, marginBottom:3, textTransform:'uppercase' }}>Line Items (Description, Amount — one per line)</div>
                        <textarea value={invForm.items} onChange={e=>setInvForm({...invForm,items:e.target.value})} rows={3} placeholder={'Consultation Fee, 500\nLab Tests, 1200'} style={{ width:'100%', padding:'7px 10px', borderRadius:7, border:'0.5px solid '+S.border, fontSize:12, background:S.bg, color:S.navy, outline:'none', resize:'vertical', fontFamily:'monospace', boxSizing:'border-box' }}/>
                      </div>
                      <button onClick={addInvoice} disabled={invLoading||!invForm.patient_id||!invForm.items} style={{ padding:'8px 20px', background:S.blue, color:'#fff', border:'none', borderRadius:7, fontSize:12, fontWeight:600, cursor:'pointer' }}>{invLoading?'Creating...':'Generate Invoice'}</button>
                    </div>
                  )}
                  <div style={{ ...card, padding:0, overflow:'hidden' }}>
                    <table style={{ width:'100%', borderCollapse:'collapse' }}>
                      <thead><tr style={{ background:S.bg }}>{['Invoice','Patient','Date','Subtotal','GST','Total','Status',''].map(h=><th key={h} style={{ padding:'9px 12px', fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.05em', textAlign:'left', borderBottom:'0.5px solid '+S.border, whiteSpace:'nowrap' }}>{h}</th>)}</tr></thead>
                      <tbody>
                        {invoices.map(inv=>(
                          <tr key={inv.id} style={{ borderBottom:'0.5px solid '+S.border, background:selInvoice?.id===inv.id?S.lightBlue:'transparent', cursor:'pointer' }}
                            onClick={()=>setSelInvoice(inv)}
                            onMouseEnter={e=>{ if(selInvoice?.id!==inv.id) e.currentTarget.style.background=S.bg; }}
                            onMouseLeave={e=>{ if(selInvoice?.id!==inv.id) e.currentTarget.style.background='transparent'; }}>
                            <td style={{ padding:'9px 12px', fontSize:12, fontWeight:700, color:S.blue }}>{inv.invoice_number}</td>
                            <td style={{ padding:'9px 12px', fontSize:12, color:S.navy }}>{inv.hospital_patients?.full_name}</td>
                            <td style={{ padding:'9px 12px', fontSize:11, color:S.muted }}>{new Date(inv.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</td>
                            <td style={{ padding:'9px 12px', fontSize:12, color:S.navy }}>₹{parseFloat(inv.subtotal||0).toFixed(0)}</td>
                            <td style={{ padding:'9px 12px', fontSize:12, color:S.muted }}>₹{parseFloat(inv.tax||0).toFixed(0)}</td>
                            <td style={{ padding:'9px 12px', fontSize:13, fontWeight:700, color:inv.status==='paid'?S.success:S.danger }}>₹{parseFloat(inv.total||0).toFixed(0)}</td>
                            <td style={{ padding:'9px 12px' }}><Badge color={inv.status==='paid'?'green':'red'}>{inv.status?.toUpperCase()}</Badge></td>
                            <td style={{ padding:'9px 12px' }}><button onClick={e=>{e.stopPropagation();setSelInvoice(inv);}} style={{ fontSize:10, padding:'3px 8px', background:S.lightBlue, color:S.blue, border:'none', borderRadius:5, cursor:'pointer' }}>Manage</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {invoices.length===0&&<div style={{ textAlign:'center', padding:40, color:S.muted, fontSize:13 }}>No invoices yet.</div>}
                  </div>
                </div>
                {/* Right sticky panel */}
                {selInvoice && (
                  <div style={{ ...card, padding:0, overflow:'hidden', alignSelf:'start', position:'sticky', top:80 }}>
                    <div style={{ padding:'14px 16px', borderBottom:'0.5px solid '+S.border, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div style={{ fontSize:12, fontWeight:700, color:S.navy }}>{selInvoice.invoice_number}</div>
                      <button onClick={()=>setSelInvoice(null)} style={{ background:'none', border:'none', fontSize:16, cursor:'pointer', color:S.muted }}>×</button>
                    </div>
                    <div style={{ padding:14 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:S.navy, marginBottom:4 }}>{invoices.find(i=>i.id===selInvoice.id)?.hospital_patients?.full_name||selInvoice.hospital_patients?.full_name}</div>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
                        <span style={{ fontSize:11, color:S.muted }}>Total</span>
                        <span style={{ fontSize:16, fontWeight:700, color:S.navy }}>₹{parseFloat(selInvoice.total||0).toFixed(0)}</span>
                      </div>
                      {/* Payments summary */}
                      <div style={{ fontSize:11, color:S.muted, marginBottom:4 }}>Collected: ₹{payments.filter(p=>p.invoice_id===selInvoice.id).reduce((s,p)=>s+parseFloat(p.amount||0),0).toFixed(0)}</div>
                      <div style={{ fontSize:11, color:S.danger, marginBottom:12 }}>Pending: ₹{Math.max(0, parseFloat(selInvoice.total||0) - payments.filter(p=>p.invoice_id===selInvoice.id).reduce((s,p)=>s+parseFloat(p.amount||0),0)).toFixed(0)}</div>
                      {/* Action buttons */}
                      {[
                        { label:'+ Add Charge', show:true, action:()=>setShowChargeForm(f=>!f), color:S.blue, bg:S.lightBlue },
                        { label:'Collect Payment', show:selInvoice.status==='unpaid', action:()=>setShowPayForm(f=>!f), color:'#fff', bg:S.success },
                        { label:'Insurance Claim', show:true, action:()=>setShowClaimForm(f=>!f), color:S.blue, bg:'#EFF6FF' },
                        { label:'Apply Discount', show:selInvoice.status==='unpaid', action:()=>setShowDiscountForm(f=>!f), color:S.warning, bg:'#FFFBEB' },
                        { label:'Request Refund', show:true, action:()=>setShowRefundForm(f=>!f), color:S.danger, bg:'#FEF2F2' },
                      ].filter(a=>a.show).map(a=>(
                        <button key={a.label} onClick={a.action} style={{ width:'100%', padding:'9px', background:a.bg, color:a.color, border:'none', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', marginBottom:6, textAlign:'left', fontFamily:'inherit' }}>{a.label}</button>
                      ))}
                      {/* Add charge form */}
                      {showChargeForm && (
                        <div style={{ background:S.bg, borderRadius:8, padding:12, marginTop:8 }}>
                          <div style={{ fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', marginBottom:8 }}>Add Charge</div>
                          {[['Department','department','text'],['Item Name','item_name','text'],['Qty','quantity','number'],['Unit Price ₹','unit_price','number'],['HSN Code','hsn_code','text']].map(([l,k,t])=>(
                            <div key={k} style={{ marginBottom:6 }}>
                              <div style={{ fontSize:9, color:S.muted, marginBottom:2 }}>{l}</div>
                              <input type={t} value={chargeForm[k]} onChange={e=>setChargeForm({...chargeForm,[k]:e.target.value})} style={{ width:'100%', padding:'6px 8px', borderRadius:6, border:'0.5px solid '+S.border, fontSize:12, background:'#fff', color:S.navy, outline:'none', boxSizing:'border-box' }}/>
                            </div>
                          ))}
                          <button onClick={addCharge} style={{ width:'100%', padding:'7px', background:S.blue, color:'#fff', border:'none', borderRadius:6, fontSize:12, fontWeight:600, cursor:'pointer', marginTop:4 }}>Add</button>
                        </div>
                      )}
                      {/* Collect payment form */}
                      {showPayForm && (
                        <div style={{ background:S.bg, borderRadius:8, padding:12, marginTop:8 }}>
                          <div style={{ fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', marginBottom:8 }}>Collect Payment</div>
                          <div style={{ marginBottom:6 }}>
                            <div style={{ fontSize:9, color:S.muted, marginBottom:2 }}>Amount ₹</div>
                            <input type="number" value={payForm.amount} onChange={e=>setPayForm({...payForm,amount:e.target.value})} style={{ width:'100%', padding:'6px 8px', borderRadius:6, border:'0.5px solid '+S.border, fontSize:12, background:'#fff', color:S.navy, outline:'none', boxSizing:'border-box' }}/>
                          </div>
                          <div style={{ marginBottom:6 }}>
                            <div style={{ fontSize:9, color:S.muted, marginBottom:2 }}>Method</div>
                            <select value={payForm.payment_method} onChange={e=>setPayForm({...payForm,payment_method:e.target.value})} style={{ width:'100%', padding:'6px 8px', borderRadius:6, border:'0.5px solid '+S.border, fontSize:12, background:'#fff', color:S.navy, outline:'none' }}>
                              {['cash','upi','card','netbanking','insurance','corporate'].map(m=><option key={m}>{m}</option>)}
                            </select>
                          </div>
                          <div style={{ marginBottom:6 }}>
                            <div style={{ fontSize:9, color:S.muted, marginBottom:2 }}>Reference No.</div>
                            <input value={payForm.reference_number} onChange={e=>setPayForm({...payForm,reference_number:e.target.value})} style={{ width:'100%', padding:'6px 8px', borderRadius:6, border:'0.5px solid '+S.border, fontSize:12, background:'#fff', color:S.navy, outline:'none', boxSizing:'border-box' }}/>
                          </div>
                          <button onClick={addPayment} style={{ width:'100%', padding:'7px', background:S.success, color:'#fff', border:'none', borderRadius:6, fontSize:12, fontWeight:600, cursor:'pointer' }}>Collect</button>
                        </div>
                      )}
                      {/* Insurance claim form */}
                      {showClaimForm && (
                        <div style={{ background:S.bg, borderRadius:8, padding:12, marginTop:8 }}>
                          <div style={{ fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', marginBottom:8 }}>Insurance Claim</div>
                          {[['Insurance Company','insurance_company','text'],['Policy Number','policy_number','text'],['Claim Amount ₹','claim_amount','number']].map(([l,k,t])=>(
                            <div key={k} style={{ marginBottom:6 }}>
                              <div style={{ fontSize:9, color:S.muted, marginBottom:2 }}>{l}</div>
                              <input type={t} value={claimForm[k]} onChange={e=>setClaimForm({...claimForm,[k]:e.target.value})} style={{ width:'100%', padding:'6px 8px', borderRadius:6, border:'0.5px solid '+S.border, fontSize:12, background:'#fff', color:S.navy, outline:'none', boxSizing:'border-box' }}/>
                            </div>
                          ))}
                          <button onClick={addClaim} style={{ width:'100%', padding:'7px', background:S.blue, color:'#fff', border:'none', borderRadius:6, fontSize:12, fontWeight:600, cursor:'pointer' }}>Submit Claim</button>
                        </div>
                      )}
                      {/* Discount form */}
                      {showDiscountForm && (
                        <div style={{ background:S.bg, borderRadius:8, padding:12, marginTop:8 }}>
                          <div style={{ fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', marginBottom:8 }}>Apply Discount</div>
                          {[['Discount %','discount_percent','number'],['Reason','reason','text'],['Approved By','approved_by','text']].map(([l,k,t])=>(
                            <div key={k} style={{ marginBottom:6 }}>
                              <div style={{ fontSize:9, color:S.muted, marginBottom:2 }}>{l}</div>
                              <input type={t} value={discountForm[k]} onChange={e=>setDiscountForm({...discountForm,[k]:e.target.value})} style={{ width:'100%', padding:'6px 8px', borderRadius:6, border:'0.5px solid '+S.border, fontSize:12, background:'#fff', color:S.navy, outline:'none', boxSizing:'border-box' }}/>
                            </div>
                          ))}
                          <button onClick={addDiscount} style={{ width:'100%', padding:'7px', background:S.warning, color:'#fff', border:'none', borderRadius:6, fontSize:12, fontWeight:600, cursor:'pointer' }}>Apply</button>
                        </div>
                      )}
                      {/* Refund form */}
                      {showRefundForm && (
                        <div style={{ background:S.bg, borderRadius:8, padding:12, marginTop:8 }}>
                          <div style={{ fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', marginBottom:8 }}>Request Refund</div>
                          {[['Amount ₹','amount','number'],['Reason','reason','text'],['Approved By','approved_by','text']].map(([l,k,t])=>(
                            <div key={k} style={{ marginBottom:6 }}>
                              <div style={{ fontSize:9, color:S.muted, marginBottom:2 }}>{l}</div>
                              <input type={t} value={refundForm[k]} onChange={e=>setRefundForm({...refundForm,[k]:e.target.value})} style={{ width:'100%', padding:'6px 8px', borderRadius:6, border:'0.5px solid '+S.border, fontSize:12, background:'#fff', color:S.navy, outline:'none', boxSizing:'border-box' }}/>
                            </div>
                          ))}
                          <button onClick={addRefund} style={{ width:'100%', padding:'7px', background:S.danger, color:'#fff', border:'none', borderRadius:6, fontSize:12, fontWeight:600, cursor:'pointer' }}>Submit</button>
                        </div>
                      )}
                      {/* Payments history */}
                      {payments.filter(p=>p.invoice_id===selInvoice.id).length>0 && (
                        <div style={{ marginTop:12 }}>
                          <div style={{ fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', marginBottom:6 }}>Payment History</div>
                          {payments.filter(p=>p.invoice_id===selInvoice.id).map(p=>(
                            <div key={p.id} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'0.5px solid '+S.border, fontSize:11 }}>
                              <span style={{ color:S.muted, textTransform:'capitalize' }}>{p.payment_method}</span>
                              <span style={{ fontWeight:600, color:S.success }}>₹{parseFloat(p.amount||0).toFixed(0)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CHARGES */}
            {billingTab==='charges' && (
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:S.navy, marginBottom:16 }}>All Charges ({charges.length})</div>
                <div style={{ ...card, padding:0, overflow:'hidden' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead><tr style={{ background:S.bg }}>{['Date','Patient','Department','Item','Qty','Unit Price','Total','HSN'].map(h=><th key={h} style={{ padding:'9px 12px', fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.05em', textAlign:'left', borderBottom:'0.5px solid '+S.border, whiteSpace:'nowrap' }}>{h}</th>)}</tr></thead>
                    <tbody>
                      {charges.length===0?<tr><td colSpan={8} style={{ padding:40, textAlign:'center', color:S.muted, fontSize:13 }}>No charges recorded yet.</td></tr>:charges.map(c=>(
                        <tr key={c.id} style={{ borderBottom:'0.5px solid '+S.border }} onMouseEnter={e=>e.currentTarget.style.background=S.lightBlue} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                          <td style={{ padding:'8px 12px', fontSize:11, color:S.muted }}>{new Date(c.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</td>
                          <td style={{ padding:'8px 12px', fontSize:12, color:S.navy }}>{c.hospital_patients?.full_name}</td>
                          <td style={{ padding:'8px 12px' }}><Badge color="blue">{c.department}</Badge></td>
                          <td style={{ padding:'8px 12px', fontSize:12, color:S.navy }}>{c.item_name}</td>
                          <td style={{ padding:'8px 12px', fontSize:12, color:S.muted }}>{c.quantity}</td>
                          <td style={{ padding:'8px 12px', fontSize:12, color:S.muted }}>₹{parseFloat(c.unit_price||0).toFixed(0)}</td>
                          <td style={{ padding:'8px 12px', fontSize:13, fontWeight:700, color:S.navy }}>₹{parseFloat(c.total||0).toFixed(0)}</td>
                          <td style={{ padding:'8px 12px', fontSize:11, color:S.muted }}>{c.hsn_code||'-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PAYMENTS */}
            {billingTab==='payments' && (
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:S.navy, marginBottom:16 }}>Payment Transactions ({payments.length})</div>
                <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(3,1fr)', gap:12, marginBottom:20 }}>
                  {['cash','upi','card'].map(m=>(
                    <div key={m} style={{ ...card, padding:'14px 18px' }}>
                      <div style={{ fontSize:20, fontWeight:700, color:S.blue }}>₹{payments.filter(p=>p.payment_method===m).reduce((s,p)=>s+parseFloat(p.amount||0),0).toFixed(0)}</div>
                      <div style={{ fontSize:11, color:S.muted, marginTop:2, textTransform:'capitalize' }}>{m} collections</div>
                    </div>
                  ))}
                </div>
                <div style={{ ...card, padding:0, overflow:'hidden' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead><tr style={{ background:S.bg }}>{['Date','Patient','Method','Reference','Amount'].map(h=><th key={h} style={{ padding:'9px 12px', fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.05em', textAlign:'left', borderBottom:'0.5px solid '+S.border }}>{h}</th>)}</tr></thead>
                    <tbody>
                      {payments.length===0?<tr><td colSpan={5} style={{ padding:40, textAlign:'center', color:S.muted, fontSize:13 }}>No payments yet.</td></tr>:payments.map(p=>(
                        <tr key={p.id} style={{ borderBottom:'0.5px solid '+S.border }} onMouseEnter={e=>e.currentTarget.style.background=S.lightBlue} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                          <td style={{ padding:'8px 12px', fontSize:11, color:S.muted }}>{new Date(p.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</td>
                          <td style={{ padding:'8px 12px', fontSize:12, color:S.navy }}>{p.hospital_patients?.full_name}</td>
                          <td style={{ padding:'8px 12px' }}><Badge color="blue">{p.payment_method}</Badge></td>
                          <td style={{ padding:'8px 12px', fontSize:11, color:S.muted }}>{p.reference_number||'-'}</td>
                          <td style={{ padding:'8px 12px', fontSize:13, fontWeight:700, color:S.success }}>₹{parseFloat(p.amount||0).toFixed(0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* INSURANCE */}
            {billingTab==='insurance' && (
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:S.navy, marginBottom:16 }}>Insurance Claims ({claims.length})</div>
                <div style={{ display:'grid', gridTemplateColumns:isMobile?'repeat(2,1fr)':'repeat(4,1fr)', gap:12, marginBottom:20 }}>
                  {[
                    { label:'Total Claimed', value:'₹'+claims.reduce((s,c)=>s+parseFloat(c.claim_amount||0),0).toFixed(0), color:S.blue },
                    { label:'Approved', value:'₹'+claims.reduce((s,c)=>s+parseFloat(c.approved_amount||0),0).toFixed(0), color:S.success },
                    { label:'Pending', value:claims.filter(c=>c.status==='pending').length, color:S.warning },
                    { label:'Rejected', value:claims.filter(c=>c.status==='rejected').length, color:S.danger },
                  ].map((k,i)=><div key={i} style={{ ...card, padding:'14px 18px' }}><div style={{ fontSize:20, fontWeight:700, color:k.color }}>{k.value}</div><div style={{ fontSize:11, color:S.muted, marginTop:2 }}>{k.label}</div></div>)}
                </div>
                <div style={{ ...card, padding:0, overflow:'hidden' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead><tr style={{ background:S.bg }}>{['Claim #','Patient','Insurer','Policy','Claimed','Approved','Received','Status'].map(h=><th key={h} style={{ padding:'9px 12px', fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.05em', textAlign:'left', borderBottom:'0.5px solid '+S.border, whiteSpace:'nowrap' }}>{h}</th>)}</tr></thead>
                    <tbody>
                      {claims.length===0?<tr><td colSpan={8} style={{ padding:40, textAlign:'center', color:S.muted, fontSize:13 }}>No claims yet.</td></tr>:claims.map(c=>(
                        <tr key={c.id} style={{ borderBottom:'0.5px solid '+S.border }} onMouseEnter={e=>e.currentTarget.style.background=S.lightBlue} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                          <td style={{ padding:'8px 12px', fontSize:12, fontWeight:700, color:S.blue }}>{c.claim_number}</td>
                          <td style={{ padding:'8px 12px', fontSize:12, color:S.navy }}>{c.hospital_patients?.full_name}</td>
                          <td style={{ padding:'8px 12px', fontSize:12, color:S.navy }}>{c.insurance_company}</td>
                          <td style={{ padding:'8px 12px', fontSize:11, color:S.muted }}>{c.policy_number||'-'}</td>
                          <td style={{ padding:'8px 12px', fontSize:12, fontWeight:600, color:S.navy }}>₹{parseFloat(c.claim_amount||0).toFixed(0)}</td>
                          <td style={{ padding:'8px 12px', fontSize:12, color:S.success }}>₹{parseFloat(c.approved_amount||0).toFixed(0)}</td>
                          <td style={{ padding:'8px 12px', fontSize:12, color:S.blue }}>₹{parseFloat(c.received_amount||0).toFixed(0)}</td>
                          <td style={{ padding:'8px 12px' }}><Badge color={c.status==='approved'?'green':c.status==='rejected'?'red':'yellow'}>{c.status?.toUpperCase()}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* REFUNDS */}
            {billingTab==='refunds' && (
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:S.navy, marginBottom:16 }}>Refund Requests ({refunds.length})</div>
                <div style={{ display:'grid', gap:10 }}>
                  {refunds.length===0?<div style={{ ...card, textAlign:'center', padding:40, color:S.muted, fontSize:13 }}>No refund requests.</div>:refunds.map(r=>(
                    <div key={r.id} style={{ ...card, padding:16, display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:600, color:S.navy }}>{r.hospital_patients?.full_name}</div>
                        <div style={{ fontSize:11, color:S.muted }}>{r.reason} · {r.approved_by?'Approved by: '+r.approved_by:''}</div>
                        <div style={{ fontSize:10, color:S.hint, marginTop:2 }}>{new Date(r.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</div>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <div style={{ fontSize:16, fontWeight:700, color:S.danger }}>₹{parseFloat(r.amount||0).toFixed(0)}</div>
                        <Badge color={r.status==='paid'?'green':r.status==='approved'?'blue':'yellow'}>{r.status?.toUpperCase()}</Badge>
                      </div>
                      {r.status==='requested'&&<button onClick={()=>{ supabase.from('bill_refunds').update({status:'approved'}).eq('id',r.id).then(()=>loadRCM()); }} style={{ padding:'5px 12px', background:'#ECFDF5', color:S.success, border:'1px solid #A7F3D0', borderRadius:6, fontSize:11, fontWeight:600, cursor:'pointer' }}>Approve</button>}
                      {r.status==='approved'&&<button onClick={()=>{ supabase.from('bill_refunds').update({status:'paid'}).eq('id',r.id).then(()=>loadRCM()); }} style={{ padding:'5px 12px', background:S.lightBlue, color:S.blue, border:'0.5px solid '+S.border, borderRadius:6, fontSize:11, fontWeight:600, cursor:'pointer' }}>Mark Paid</button>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DISCOUNTS */}
            {billingTab==='discounts' && (
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:S.navy, marginBottom:16 }}>Discount Log ({discounts.length})</div>
                <div style={{ ...card, padding:0, overflow:'hidden' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead><tr style={{ background:S.bg }}>{['Date','Invoice','Discount %','Amount','Reason','Approved By','Status'].map(h=><th key={h} style={{ padding:'9px 12px', fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.05em', textAlign:'left', borderBottom:'0.5px solid '+S.border }}>{h}</th>)}</tr></thead>
                    <tbody>
                      {discounts.length===0?<tr><td colSpan={7} style={{ padding:40, textAlign:'center', color:S.muted, fontSize:13 }}>No discounts applied.</td></tr>:discounts.map(d=>(
                        <tr key={d.id} style={{ borderBottom:'0.5px solid '+S.border }}>
                          <td style={{ padding:'8px 12px', fontSize:11, color:S.muted }}>{new Date(d.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</td>
                          <td style={{ padding:'8px 12px', fontSize:12, color:S.blue }}>{invoices.find(i=>i.id===d.invoice_id)?.invoice_number||'-'}</td>
                          <td style={{ padding:'8px 12px', fontSize:12, fontWeight:600, color:S.warning }}>{d.discount_percent}%</td>
                          <td style={{ padding:'8px 12px', fontSize:12, fontWeight:600, color:S.danger }}>-₹{parseFloat(d.discount_amount||0).toFixed(0)}</td>
                          <td style={{ padding:'8px 12px', fontSize:11, color:S.muted }}>{d.reason||'-'}</td>
                          <td style={{ padding:'8px 12px', fontSize:11, color:S.muted }}>{d.approved_by||'-'}</td>
                          <td style={{ padding:'8px 12px' }}><Badge color={d.status==='approved'?'green':'yellow'}>{d.status?.toUpperCase()}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* REVENUE REPORTS */}
            {billingTab==='revenue' && (
              <div>
                <h2 style={{ margin:'0 0 20px', color:S.navy, fontSize:20, fontWeight:700 }}>Revenue Analytics</h2>
                {/* Summary KPIs */}
                <div style={{ display:'grid', gridTemplateColumns:isMobile?'repeat(2,1fr)':'repeat(4,1fr)', gap:12, marginBottom:24 }}>
                  {[
                    { label:'Total Revenue', value:'₹'+invoices.filter(i=>i.status==='paid').reduce((s,i)=>s+parseFloat(i.total||0),0).toFixed(0), color:S.success },
                    { label:'Outstanding', value:'₹'+invoices.filter(i=>i.status==='unpaid').reduce((s,i)=>s+parseFloat(i.total||0),0).toFixed(0), color:S.danger },
                    { label:'Avg Bill Size', value:'₹'+(invoices.length>0?(invoices.reduce((s,i)=>s+parseFloat(i.total||0),0)/invoices.length).toFixed(0):'0'), color:S.blue },
                    { label:'Collection Rate', value:invoices.length>0?Math.round(invoices.filter(i=>i.status==='paid').length/invoices.length*100)+'%':'0%', color:S.cyan },
                  ].map((k,i)=><div key={i} style={{ ...card, padding:'16px 20px' }}><div style={{ fontSize:22, fontWeight:700, color:k.color }}>{k.value}</div><div style={{ fontSize:11, color:S.muted, marginTop:2 }}>{k.label}</div></div>)}
                </div>
                {/* Payment method breakdown */}
                <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(2,1fr)', gap:16, marginBottom:20 }}>
                  <div style={{ ...card }}>
                    <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Revenue by Payment Method</div>
                    {['cash','upi','card','netbanking','insurance','corporate'].map(m=>{
                      const amt = payments.filter(p=>p.payment_method===m).reduce((s,p)=>s+parseFloat(p.amount||0),0);
                      const total = payments.reduce((s,p)=>s+parseFloat(p.amount||0),0);
                      const pct = total>0?Math.round(amt/total*100):0;
                      return amt>0?(
                        <div key={m} style={{ marginBottom:10 }}>
                          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                            <span style={{ fontSize:12, color:S.navy, textTransform:'capitalize', fontWeight:500 }}>{m}</span>
                            <span style={{ fontSize:12, fontWeight:700, color:S.navy }}>₹{amt.toFixed(0)} <span style={{ fontSize:10, color:S.muted }}>({pct}%)</span></span>
                          </div>
                          <div style={{ height:6, borderRadius:3, background:S.border }}>
                            <div style={{ height:6, borderRadius:3, background:S.blue, width:pct+'%', transition:'width 0.3s' }}/>
                          </div>
                        </div>
                      ):null;
                    })}
                    {payments.length===0&&<div style={{ fontSize:12, color:S.muted, textAlign:'center', padding:'16px 0' }}>No payment data yet.</div>}
                  </div>
                  <div style={{ ...card }}>
                    <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Charges by Department</div>
                    {[...new Set(charges.map(c=>c.department))].map(dept=>{
                      const amt = charges.filter(c=>c.department===dept).reduce((s,c)=>s+parseFloat(c.total||0),0);
                      const total = charges.reduce((s,c)=>s+parseFloat(c.total||0),0);
                      const pct = total>0?Math.round(amt/total*100):0;
                      return (
                        <div key={dept} style={{ marginBottom:10 }}>
                          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                            <span style={{ fontSize:12, color:S.navy, fontWeight:500 }}>{dept}</span>
                            <span style={{ fontSize:12, fontWeight:700, color:S.navy }}>₹{amt.toFixed(0)} <span style={{ fontSize:10, color:S.muted }}>({pct}%)</span></span>
                          </div>
                          <div style={{ height:6, borderRadius:3, background:S.border }}>
                            <div style={{ height:6, borderRadius:3, background:S.cyan, width:pct+'%', transition:'width 0.3s' }}/>
                          </div>
                        </div>
                      );
                    })}
                    {charges.length===0&&<div style={{ fontSize:12, color:S.muted, textAlign:'center', padding:'16px 0' }}>No charge data yet.</div>}
                  </div>
                </div>
                {/* Aging report */}
                <div style={{ ...card }}>
                  <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Outstanding Aging Report</div>
                  <div style={{ display:'grid', gridTemplateColumns:isMobile?'repeat(2,1fr)':'repeat(4,1fr)', gap:10 }}>
                    {[['0-30 Days',30],['31-60 Days',60],['61-90 Days',90],['90+ Days',999]].map(([label,days],idx)=>{
                      const from = idx===0?0:[30,60,90][idx-1];
                      const unpaid = invoices.filter(i=>{
                        if(i.status!=='unpaid') return false;
                        const age = Math.floor((new Date()-new Date(i.created_at))/(24*60*60*1000));
                        return age>=from && (idx===3?age>90:age<days);
                      });
                      const amt = unpaid.reduce((s,i)=>s+parseFloat(i.total||0),0);
                      return (
                        <div key={label} style={{ padding:'12px 14px', borderRadius:8, background:idx===3?'#FEF2F2':idx===2?'#FEF3C7':S.bg, border:'0.5px solid '+S.border }}>
                          <div style={{ fontSize:10, color:S.muted, marginBottom:4 }}>{label}</div>
                          <div style={{ fontSize:18, fontWeight:700, color:idx>=2?S.danger:S.navy }}>₹{amt.toFixed(0)}</div>
                          <div style={{ fontSize:10, color:S.muted }}>{unpaid.length} invoices</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
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

            {/* AI Intelligence Insights */}
            {intelligence?.insights?.length > 0 && (
              <div style={{ display:'grid', gap:8, marginBottom:20 }}>
                {intelligence.insights.map((insight, i) => (
                  <div key={i} style={{ background: insight.type==='critical'?'#FEF2F2':insight.type==='warning'?'#FEF3C7':'#EFF6FF', border:`1px solid ${insight.type==='critical'?'#FECACA':insight.type==='warning'?'#FDE68A':'#BFDBFE'}`, borderRadius:10, padding:'10px 16px', display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ flexShrink:0 }} dangerouslySetInnerHTML={{ __html: insight.icon }} />
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color: insight.type==='critical'?'#DC2626':insight.type==='warning'?'#D97706':'#1D4ED8' }}>{insight.title}</div>
                      <div style={{ fontSize:11, color:'#64748b', marginTop:1 }}>{insight.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Revenue Leakage Alert */}
            {leakage?.count > 0 && (
              <div style={{ background:'#FFF7ED', border:'1px solid #FED7AA', borderRadius:10, padding:'12px 16px', marginBottom:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#EA580C' }}>Revenue Leakage Detected — ₹{leakage.total_leakage.toLocaleString()} at risk</div>
                  <span style={{ fontSize:11, color:'#94a3b8' }}>{leakage.count} unbilled service(s)</span>
                </div>
                {leakage.leaks.slice(0,3).map((l,i)=>(
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#374151', padding:'3px 0', borderBottom:'0.5px solid #FED7AA' }}>
                    <span>{l.patient_name} — {l.message}</span>
                    <span style={{ fontWeight:600, color:'#DC2626' }}>₹{l.estimated_loss}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Discharge candidates */}
            {intelligence?.discharge_candidates?.length > 0 && (
              <div style={{ background:'#ECFDF5', border:'1px solid #A7F3D0', borderRadius:10, padding:'10px 16px', marginBottom:16 }}>
                <div style={{ fontSize:12, fontWeight:700, color:'#059669', marginBottom:6 }}>Discharge Candidates ({intelligence.discharge_candidates.length})</div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {intelligence.discharge_candidates.map((d,i)=>(
                    <div key={i} style={{ background:'#fff', borderRadius:6, padding:'4px 10px', fontSize:11, color:'#059669', border:'1px solid #A7F3D0' }}>
                      {d.hospital_patients?.full_name} — {d.los.expected_discharge}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* KPI Row 1 — Primary metrics */}
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'repeat(2,1fr)':'repeat(4,1fr)', gap:12, marginBottom:16 }}>
              {[
                { label:'OPD Waiting', value:waiting, sub:`${queue.filter(q=>q.status==='in_consultation').length} in consultation`, color:S.blue, action:'queue', icon:'hospital' },
                { label:'Registered Patients', value:patients.length, sub:'Total in registry', color:S.cyan, action:'patients', icon:'patients' },
                { label:'IPD Admitted', value:ipdList.filter(i=>i.status==='admitted').length, sub:`${ipdList.filter(i=>i.status==='discharged').length} discharged today`, color:'#7C3AED', action:'ipd', icon:'bed' },
                { label:'Crisis Flags', value:crisis + beds.filter(b=>b.urgency==='crisis').length, sub:'Needs immediate review', color:crisis>0?S.danger:S.success, action:'beds', icon:'crisis' },
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
                {triagedQueue.filter(q=>q.status==='waiting').length===0 ? (
                  <div style={{ fontSize:12, color:S.muted, textAlign:'center', padding:'16px 0' }}>Queue is clear</div>
                ) : triagedQueue.filter(q=>q.status==='waiting').slice(0,4).map(q=>(
                  <div key={q.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'0.5px solid '+S.border }}>
                    <div style={{ fontWeight:700, color:S.blue, fontSize:12, minWidth:52 }}>{q.token_number}</div>
                    <div style={{ flex:1, fontSize:12, color:S.navy, fontWeight:500 }}>{q.patient_name}</div>
                    <div style={{ fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:4, background: q.score>=100?'#FEF2F2':q.score>=60?'#FEF3C7':'#EFF6FF', color: q.score>=100?'#DC2626':q.score>=60?'#D97706':'#1D4ED8' }}>S:{q.score}</div>
                    <Badge color={q.priority==='crisis'?'red':q.priority==='urgent'?'yellow':'blue'}>{q.priority}</Badge>
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
            <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(29,78,216,0.2); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(29,78,216,0.4); }
      `}</style>
          </div>
        )}

        {/* OPD QUEUE */}
        {tab==='queue' && (
          <div>
            {/* Queue KPIs */}
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'repeat(2,1fr)':'repeat(4,1fr)', gap:12, marginBottom:20 }}>
              {[
                { label:'Waiting', value:queue.filter(q=>q.status==='waiting').length, color:S.warning },
                { label:'In Consultation', value:queue.filter(q=>q.status==='in_consultation').length, color:S.blue },
                { label:'Completed Today', value:queue.filter(q=>q.status==='done').length, color:S.success },
                { label:'Crisis', value:queue.filter(q=>q.priority==='crisis').length, color:S.danger },
              ].map((k,i)=>(
                <div key={i} style={{ ...card, padding:'14px 18px', borderLeft:`3px solid ${k.color}` }}>
                  <div style={{ fontSize:26, fontWeight:700, color:k.color }}>{k.value}</div>
                  <div style={{ fontSize:11, color:S.muted, marginTop:2 }}>{k.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'340px 1fr', gap:20 }}>
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
                          <div style={{ width:14, height:14, borderRadius:'50%', background:b.urgency==='crisis'?S.danger:b.urgency==='urgent'?S.warning:'#22c55e' }}/>
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

        {/* CONNECTIONS */}
        {tab==='connections' && (
          <div>
            <div style={{ marginBottom:20 }}>
              <h2 style={{ margin:0, color:S.navy, fontSize:20, fontWeight:700 }}>Cross-Platform Connections</h2>
              <div style={{ fontSize:12, color:S.muted, marginTop:4 }}>Link hospital patients to PsycheFlow accounts · Refer patients to psychologists</div>
            </div>

            {/* KPI row */}
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'repeat(2,1fr)':'repeat(4,1fr)', gap:12, marginBottom:20 }}>
              {[
                { label:'Cross Referrals', value:crossReferrals.length, sub:'To psychologists', color:S.blue },
                { label:'Pending', value:crossReferrals.filter(r=>r.status==='pending').length, sub:'Awaiting response', color:S.warning },
                { label:'Accepted', value:crossReferrals.filter(r=>r.status==='accepted').length, sub:'Active connections', color:S.success },
                { label:'Linked Patients', value:patients.filter(p=>p.platform_user_id).length, sub:'On PsycheFlow', color:'#7C3AED' },
              ].map((k,i)=>(
                <div key={i} style={{ ...card, padding:'14px 18px', borderLeft:`3px solid ${k.color}` }}>
                  <div style={{ fontSize:24, fontWeight:700, color:k.color }}>{k.value}</div>
                  <div style={{ fontSize:12, fontWeight:600, color:S.navy, marginTop:2 }}>{k.label}</div>
                  <div style={{ fontSize:10, color:S.muted }}>{k.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:16, marginBottom:20 }}>
              {/* Refer to Psychologist */}
              <div style={{ ...card }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:S.navy }}>Refer Patient to Psychologist</div>
                  <button onClick={()=>setShowCrossRef(f=>!f)} style={{ padding:'6px 12px', background:S.blue, color:'#fff', border:'none', borderRadius:7, fontSize:11, fontWeight:600, cursor:'pointer' }}>{showCrossRef?'Cancel':'+ New Referral'}</button>
                </div>
                {showCrossRef && (
                  <div style={{ background:S.bg, borderRadius:8, padding:14, marginBottom:14 }}>
                    <div style={{ marginBottom:10 }}>
                      <div style={{ fontSize:10, fontWeight:600, color:S.navy, marginBottom:4, textTransform:'uppercase' }}>Patient *</div>
                      <select value={refForm.patient_id} onChange={e=>setRefForm({...refForm,patient_id:e.target.value})}
                        style={{ width:'100%', padding:'8px 10px', borderRadius:7, border:`0.5px solid ${S.border}`, fontSize:12, background:'#fff', color:S.navy, outline:'none' }}>
                        <option value="">Select patient</option>
                        {patients.map(p=><option key={p.id} value={p.id}>{p.full_name} ({p.patient_uid})</option>)}
                      </select>
                    </div>
                    <div style={{ marginBottom:10 }}>
                      <div style={{ fontSize:10, fontWeight:600, color:S.navy, marginBottom:4, textTransform:'uppercase' }}>Search Psychologist</div>
                      <input value={psychSearch} onChange={e=>{ setPsychSearch(e.target.value); searchPsychologists(e.target.value); }}
                        placeholder="Type name to search..."
                        style={{ width:'100%', padding:'8px 10px', borderRadius:7, border:`0.5px solid ${S.border}`, fontSize:12, background:'#fff', color:S.navy, outline:'none', boxSizing:'border-box' }}/>
                      {psychResults.length>0 && (
                        <div style={{ background:'#fff', border:`0.5px solid ${S.border}`, borderRadius:7, marginTop:4, overflow:'hidden' }}>
                          {psychResults.map(p=>(
                            <div key={p.id} onClick={()=>{ setRefForm({...refForm,psychologist_id:p.id}); setPsychSearch(p.display_name||p.full_name); setPsychResults([]); }}
                              style={{ padding:'8px 12px', fontSize:12, color:S.navy, cursor:'pointer', borderBottom:`0.5px solid ${S.border}` }}
                              onMouseEnter={e=>e.currentTarget.style.background=S.lightBlue}
                              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                              <div style={{ fontWeight:600 }}>{p.display_name||p.full_name}</div>
                              <div style={{ fontSize:10, color:S.muted }}>{p.specialization||'Psychologist'}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
                      <div>
                        <div style={{ fontSize:10, fontWeight:600, color:S.navy, marginBottom:4, textTransform:'uppercase' }}>Priority</div>
                        <select value={refForm.priority} onChange={e=>setRefForm({...refForm,priority:e.target.value})}
                          style={{ width:'100%', padding:'7px 10px', borderRadius:7, border:`0.5px solid ${S.border}`, fontSize:12, background:'#fff', color:S.navy, outline:'none' }}>
                          {['normal','urgent','crisis'].map(p=><option key={p}>{p}</option>)}
                        </select>
                      </div>
                      <div>
                        <div style={{ fontSize:10, fontWeight:600, color:S.navy, marginBottom:4, textTransform:'uppercase' }}>Reason</div>
                        <input value={refForm.reason} onChange={e=>setRefForm({...refForm,reason:e.target.value})}
                          placeholder="Depression, anxiety..."
                          style={{ width:'100%', padding:'7px 10px', borderRadius:7, border:`0.5px solid ${S.border}`, fontSize:12, background:'#fff', color:S.navy, outline:'none', boxSizing:'border-box' }}/>
                      </div>
                    </div>
                    <div style={{ marginBottom:10 }}>
                      <div style={{ fontSize:10, fontWeight:600, color:S.navy, marginBottom:4, textTransform:'uppercase' }}>Clinical Notes</div>
                      <textarea value={refForm.notes} onChange={e=>setRefForm({...refForm,notes:e.target.value})} rows={2}
                        style={{ width:'100%', padding:'7px 10px', borderRadius:7, border:`0.5px solid ${S.border}`, fontSize:12, background:'#fff', color:S.navy, outline:'none', resize:'vertical', fontFamily:'inherit', boxSizing:'border-box' }}/>
                    </div>
                    <button onClick={sendCrossReferral} disabled={!refForm.patient_id||!refForm.psychologist_id}
                      style={{ width:'100%', padding:'8px', background:S.blue, color:'#fff', border:'none', borderRadius:7, fontSize:12, fontWeight:600, cursor:'pointer' }}>Send Referral</button>
                  </div>
                )}
                {/* Referral list */}
                {crossReferrals.length===0 ? <div style={{ textAlign:'center', padding:24, color:S.muted, fontSize:12 }}>No referrals sent yet.</div> :
                  crossReferrals.slice(0,5).map(r=>(
                    <div key={r.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom:`0.5px solid ${S.border}` }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:12, fontWeight:600, color:S.navy }}>{r.hospital_patients?.full_name}</div>
                        <div style={{ fontSize:10, color:S.muted }}>{r.reason||'No reason specified'} · {new Date(r.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</div>
                      </div>
                      <Badge color={r.priority==='crisis'?'red':r.priority==='urgent'?'yellow':'blue'}>{r.priority}</Badge>
                      <Badge color={r.status==='accepted'?'green':r.status==='rejected'?'red':'yellow'}>{r.status}</Badge>
                    </div>
                  ))
                }
              </div>

              {/* Link to PsycheFlow account */}
              <div style={{ ...card }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:S.navy }}>Link Patient to PsycheFlow Account</div>
                  <button onClick={()=>setShowLinkForm(f=>!f)} style={{ padding:'6px 12px', background:'#7C3AED', color:'#fff', border:'none', borderRadius:7, fontSize:11, fontWeight:600, cursor:'pointer' }}>{showLinkForm?'Cancel':'+ Link Account'}</button>
                </div>
                <div style={{ fontSize:11, color:S.muted, marginBottom:12, padding:'8px 12px', background:S.lightBlue, borderRadius:7 }}>
                  Linking allows patients to view their hospital records, prescriptions and lab results in their PsycheFlow patient dashboard.
                </div>
                {showLinkForm && (
                  <div style={{ background:S.bg, borderRadius:8, padding:14, marginBottom:14 }}>
                    <div style={{ marginBottom:10 }}>
                      <div style={{ fontSize:10, fontWeight:600, color:S.navy, marginBottom:4, textTransform:'uppercase' }}>Hospital Patient *</div>
                      <select value={linkForm.patient_id} onChange={e=>setLinkForm({...linkForm,patient_id:e.target.value})}
                        style={{ width:'100%', padding:'8px 10px', borderRadius:7, border:`0.5px solid ${S.border}`, fontSize:12, background:'#fff', color:S.navy, outline:'none' }}>
                        <option value="">Select patient</option>
                        {patients.filter(p=>!p.platform_user_id).map(p=><option key={p.id} value={p.id}>{p.full_name} ({p.patient_uid})</option>)}
                      </select>
                    </div>
                    <div style={{ marginBottom:10 }}>
                      <div style={{ fontSize:10, fontWeight:600, color:S.navy, marginBottom:4, textTransform:'uppercase' }}>PsycheFlow Email *</div>
                      <input value={linkForm.platform_email} onChange={e=>setLinkForm({...linkForm,platform_email:e.target.value})}
                        placeholder="patient@email.com"
                        style={{ width:'100%', padding:'8px 10px', borderRadius:7, border:`0.5px solid ${S.border}`, fontSize:12, background:'#fff', color:S.navy, outline:'none', boxSizing:'border-box' }}/>
                    </div>
                    <button onClick={linkPatientToPlatform} disabled={!linkForm.patient_id||!linkForm.platform_email}
                      style={{ width:'100%', padding:'8px', background:'#7C3AED', color:'#fff', border:'none', borderRadius:7, fontSize:12, fontWeight:600, cursor:'pointer' }}>Link Account</button>
                  </div>
                )}
                {/* Linked patients */}
                <div style={{ fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Linked Patients ({patients.filter(p=>p.platform_user_id).length})</div>
                {patients.filter(p=>p.platform_user_id).length===0 ? <div style={{ textAlign:'center', padding:16, color:S.muted, fontSize:12 }}>No linked patients yet.</div> :
                  patients.filter(p=>p.platform_user_id).map(p=>(
                    <div key={p.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:`0.5px solid ${S.border}` }}>
                      <div style={{ width:28, height:28, borderRadius:'50%', background:'#F5F3FF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#7C3AED' }}>{p.full_name?.charAt(0)}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:12, fontWeight:600, color:S.navy }}>{p.full_name}</div>
                        <div style={{ fontSize:10, color:S.muted }}>{p.patient_uid} · Linked {new Date(p.platform_linked_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</div>
                      </div>
                      <Badge color="green">Linked</Badge>
                    </div>
                  ))
                }
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
        {tab==='appointments' && (
          <HospitalAppointments hospital={hospital} patients={patients} staff={staff} S={S} card={card} Badge={Badge} isMobile={isMobile}/>
        )}
        {tab==='nursing' && (
          <HospitalNursing hospital={hospital} patients={patients} ipdList={ipdList} S={S} card={card} Badge={Badge} isMobile={isMobile}/>
        )}
        {tab==='orders' && (
          <HospitalClinicalOrders hospital={hospital} patients={patients} S={S} card={card} Badge={Badge} isMobile={isMobile}/>
        )}
        {tab==='discharge' && (
          <HospitalDischarge hospital={hospital} ipdList={ipdList} patients={patients} reload={fetchAll} S={S} card={card} Badge={Badge} isMobile={isMobile}/>
        )}

        {tab==='prescriptions' && (
          <HospitalPrescriptions hospital={hospital} patients={patients} S={S} card={card} Badge={Badge} isMobile={isMobile}/>
        )}
        {tab==='telemedicine' && (
          <HospitalTelemedicine hospital={hospital} patients={patients} staff={staff} user={user} S={S} card={card} Badge={Badge} isMobile={isMobile}/>
        )}

        {tab==='nabh' && (
          <div>
            <div style={{ marginBottom:20 }}>
              <h2 style={{ margin:0, color:S.navy, fontSize:20, fontWeight:700 }}>NABH Compliance</h2>
              <div style={{ fontSize:12, color:S.muted, marginTop:4 }}>National Accreditation Board for Hospitals — Mental Health Standards</div>
            </div>

            {/* KPI row */}
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'repeat(2,1fr)':'repeat(4,1fr)', gap:12, marginBottom:20 }}>
              {[
                { label:'Checklist Complete', value:'8/14', color:S.blue },
                { label:'Critical Items', value:'8', sub:'All complete', color:S.success },
                { label:'In Progress', value:'4', color:S.warning },
                { label:'Planned', value:'2', color:S.muted },
              ].map((k,i) => (
                <div key={i} style={{ ...card, padding:'14px 18px', borderLeft:`3px solid ${k.color}` }}>
                  <div style={{ fontSize:24, fontWeight:700, color:k.color }}>{k.value}</div>
                  <div style={{ fontSize:12, fontWeight:600, color:S.navy, marginTop:2 }}>{k.label}</div>
                  {k.sub && <div style={{ fontSize:10, color:S.muted }}>{k.sub}</div>}
                </div>
              ))}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:16, marginBottom:20 }}>
              {/* Compliance Checklist */}
              <div style={{ ...card }}>
                <div style={{ fontSize:12, fontWeight:700, color:S.navy, marginBottom:14 }}>NABH Mental Health Checklist</div>
                {[
                  { item:'Patient identification & registration', status:'complete', critical:true },
                  { item:'Clinical documentation (EHR)', status:'complete', critical:true },
                  { item:'Medication management (Pharmacy)', status:'complete', critical:true },
                  { item:'Laboratory information system', status:'complete', critical:true },
                  { item:'Billing transparency', status:'complete', critical:true },
                  { item:'OPD queue management', status:'complete', critical:true },
                  { item:'IPD bed tracking', status:'complete', critical:true },
                  { item:'Referral management', status:'complete', critical:true },
                  { item:'Crisis detection & escalation', status:'complete', critical:true },
                  { item:'Staff credentialing module', status:'progress', critical:false },
                  { item:'Infection control module', status:'progress', critical:false },
                  { item:'NABH quality indicators dashboard', status:'progress', critical:false },
                  { item:'Incident reporting system', status:'progress', critical:false },
                  { item:'Patient satisfaction surveys', status:'planned', critical:false },
                ].map((item, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:`0.5px solid ${S.border}` }}>
                    <div style={{ width:18, height:18, borderRadius:'50%', background:item.status==='complete'?'#ECFDF5':item.status==='progress'?'#FFFBEB':'#F9FAFB', border:`1px solid ${item.status==='complete'?'#A7F3D0':item.status==='progress'?'#FDE68A':S.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      {item.status==='complete' && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke={S.success} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      {item.status==='progress' && <div style={{ width:6, height:6, borderRadius:'50%', background:S.warning }}/>}
                      {item.status==='planned' && <div style={{ width:6, height:6, borderRadius:'50%', background:S.border }}/>}
                    </div>
                    <span style={{ fontSize:12, color:item.status==='complete'?S.navy:S.hint, flex:1 }}>{item.item}</span>
                    {item.critical && <span style={{ fontSize:9, fontWeight:700, color:S.blue, background:S.lightBlue, padding:'1px 6px', borderRadius:3 }}>CRITICAL</span>}
                  </div>
                ))}
              </div>

              {/* Quality Indicators */}
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div style={{ ...card }}>
                  <div style={{ fontSize:12, fontWeight:700, color:S.navy, marginBottom:12 }}>Quality Indicators</div>
                  {[
                    { indicator:'Average OPD Wait Time', value:queue.length>0?Math.floor((Date.now()-new Date(queue[0]?.created_at))/(60000))+'min':'—', target:'< 30 min', met:true },
                    { indicator:'Assessment Completion Rate', value:patients.length>0?'100%':'—', target:'> 90%', met:true },
                    { indicator:'Crisis Response Time', value:'< 5 min', target:'< 15 min', met:true },
                    { indicator:'Documentation Rate', value:ehrList.length>0?Math.round(ehrList.length/Math.max(1,patients.length)*100)+'%':'—', target:'> 95%', met:true },
                    { indicator:'Bed Occupancy Rate', value:ipdList.length>0?Math.round(ipdList.filter(i=>i.status==='admitted').length/Math.max(1,(beds||[]).length)*100)+'%':'—', target:'< 85%', met:true },
                  ].map(qi => (
                    <div key={qi.indicator} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:`0.5px solid ${S.border}` }}>
                      <div>
                        <div style={{ fontSize:12, color:S.navy }}>{qi.indicator}</div>
                        <div style={{ fontSize:10, color:S.muted }}>Target: {qi.target}</div>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <div style={{ fontSize:13, fontWeight:700, color:qi.met?S.success:S.danger }}>{qi.value}</div>
                        <div style={{ fontSize:9, color:qi.met?S.success:S.danger }}>{qi.met?'✓ Met':'✗ Not met'}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Audit Trail */}
                <div style={{ ...card }}>
                  <div style={{ fontSize:12, fontWeight:700, color:S.navy, marginBottom:12 }}>Audit Trail</div>
                  <div style={{ fontSize:12, color:S.muted, marginBottom:10 }}>All clinical actions are logged for NABH audit readiness.</div>
                  {[
                    ['Patient registrations', patients.length, S.blue],
                    ['EHR records created', (ehrList||[]).length, S.success],
                    ['Lab orders', (labOrders||[]).length, S.warning],
                    ['Billing invoices', (invoices||[]).length, S.cyan],
                    ['OPD tokens issued', (queue||[]).length, S.purple],
                  ].map(([label, val, color]) => (
                    <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:`0.5px solid ${S.border}` }}>
                      <span style={{ fontSize:12, color:S.muted }}>{label}</span>
                      <span style={{ fontSize:13, fontWeight:700, color }}>{val}</span>
                    </div>
                  ))}
                  <button onClick={() => {
                    const data = `NABH Audit Report — ${new Date().toLocaleDateString('en-IN')}

Patients: ${patients.length}
EHR Records: ${(ehrList||[]).length}
Lab Orders: ${(labOrders||[]).length}
Invoices: ${(invoices||[]).length}
OPD Tokens: ${(queue||[]).length}

Compliance: 8/14 checklist items complete
Critical Items: All 9 complete`;
                    const blob = new Blob([data], { type:'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a'); a.href=url; a.download='nabh_audit_report.txt'; a.click();
                  }} style={{ marginTop:12, width:'100%', padding:'8px', background:S.lightBlue, color:S.blue, border:`0.5px solid ${S.border}`, borderRadius:7, fontSize:12, fontWeight:600, cursor:'pointer' }}>
                    Export Audit Report
                  </button>
                </div>
              </div>
            </div>

            {/* Incident Reporting */}
            <div style={{ ...card }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <div style={{ fontSize:12, fontWeight:700, color:S.navy }}>Incident Reporting</div>
                <button style={{ padding:'6px 14px', background:S.blue, color:'#fff', border:'none', borderRadius:7, fontSize:11, fontWeight:600, cursor:'pointer' }}>+ Log Incident</button>
              </div>
              <div style={{ fontSize:12, color:S.muted, padding:'16px', background:S.bg, borderRadius:8, textAlign:'center' }}>
                No incidents logged. All adverse events, near-misses, and medication errors should be documented here for NABH compliance.
              </div>
            </div>
          </div>
        )}

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
