import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';

const S = { blue:'#1D4ED8', navy:'#0C1A2E', bg:'#F8FAFF', card:'#FFFFFF', border:'#E2EBF6', muted:'#3B5998', hint:'#94a3b8', lightBlue:'#EFF6FF', cyan:'#0891B2', danger:'#DC2626', warning:'#D97706', success:'#059669' };
const card = { background:S.card, borderRadius:12, border:'0.5px solid '+S.border, boxShadow:'0 1px 4px rgba(29,78,216,0.06)', padding:24 };

const Badge = ({ color, children }) => <span style={{ padding:'2px 10px', borderRadius:100, fontSize:11, fontWeight:600, background: color==='red'?'#FEF2F2': color==='yellow'?'#FFFBEB': color==='green'?'#ECFDF5':'#EFF6FF', color: color==='red'?S.danger: color==='yellow'?S.warning: color==='green'?S.success:S.blue }}>{children}</span>;

const priorityColor = p => p==='crisis'?'red': p==='urgent'?'yellow':'green';
const statusColor = s => s==='waiting'?'yellow': s==='in_consultation'?'blue': s==='done'?'green':'red';

export default function HospitalPortal({ user, onLogout }) {
  const [tab, setTab] = useState('dashboard');
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

  // Token generation
  const genToken = () => {
    const existing = queue.map(q => parseInt(q.token_number.replace('PSY-',''))||0);
    const next = existing.length > 0 ? Math.max(...existing)+1 : 1;
    return 'PSY-' + String(next).padStart(3,'0');
  };

  const addToQueue = async () => {
    if (!qForm.patient_name || !hospital) return;
    setQLoading(true);
    await supabase.from('opd_queue').insert({ hospital_id:hospital.id, token_number:genToken(), patient_name:qForm.patient_name, patient_phone:qForm.patient_phone, patient_age:parseInt(qForm.patient_age)||null, priority:qForm.priority, notes:qForm.notes, status:'waiting' });
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
      <div style={{ background:S.card, borderBottom:'0.5px solid '+S.border, padding:'0 32px', display:'flex', alignItems:'center', gap:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'16px 0', marginRight:32, borderRight:'0.5px solid '+S.border, paddingRight:32 }}>
          <div style={{ width:28, height:28, borderRadius:7, background:S.blue, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="15" height="15" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C9 1.5 4 5 4 10C4 12.8 6.2 15 9 15C11.8 15 14 12.8 14 10C14 5 9 1.5 9 1.5Z" fill="white" opacity="0.9"/><circle cx="9" cy="10" r="2.2" fill="#0C1A2E"/></svg>
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:S.navy, letterSpacing:'-0.01em' }}>{hospital.name}</div>
            <div style={{ fontSize:10, color:S.muted }}>{hospital.city} · {hospital.hospital_code}</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:4, flex:1 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding:'18px 16px', border:'none', background:'transparent', fontSize:13, fontWeight: tab===t.id?700:400, color: tab===t.id?S.blue:S.muted, cursor:'pointer', borderBottom: tab===t.id?'2px solid '+S.blue:'2px solid transparent' }}>
              {t.label}
              {t.id==='queue' && waiting>0 && <span style={{ marginLeft:6, background:S.blue, color:'#fff', borderRadius:100, padding:'1px 6px', fontSize:10, fontWeight:700 }}>{waiting}</span>}
              {t.id==='beds' && crisis>0 && <span style={{ marginLeft:6, background:S.danger, color:'#fff', borderRadius:100, padding:'1px 6px', fontSize:10, fontWeight:700 }}>{crisis}</span>}
              {t.id==='referrals' && pendingRef>0 && <span style={{ marginLeft:6, background:S.warning, color:'#fff', borderRadius:100, padding:'1px 6px', fontSize:10, fontWeight:700 }}>{pendingRef}</span>}
            </button>
          ))}
        </div>
        <button onClick={onLogout} style={{ padding:'8px 16px', background:'transparent', border:'0.5px solid '+S.border, borderRadius:8, fontSize:12, color:S.muted, cursor:'pointer' }}>Sign out</button>
      </div>

      <div style={{ padding:'28px 32px', maxWidth:1200, margin:'0 auto' }}>

        {/* DASHBOARD */}
        {tab==='dashboard' && (
          <div>
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:11, fontWeight:600, color:S.muted, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:4 }}>Hospital Admin</div>
              <h1 style={{ fontSize:24, fontWeight:700, color:S.navy, letterSpacing:'-0.02em', margin:0 }}>Good {new Date().getHours()<12?'morning':new Date().getHours()<17?'afternoon':'evening'}, {hospital.admin_name || 'Admin'}</h1>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
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
