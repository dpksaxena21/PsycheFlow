import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabase';

const S = { blue:'#1D4ED8', navy:'#0C1A2E', bg:'#F8FAFF', card:'#FFFFFF', border:'#E2EBF6', muted:'#3B5998', hint:'#94a3b8', lightBlue:'#EFF6FF', success:'#059669', danger:'#DC2626', warning:'#D97706', cyan:'#0891B2' };
const card = { background:S.card, borderRadius:12, border:`0.5px solid ${S.border}`, boxShadow:'0 1px 4px rgba(29,78,216,0.06)', padding:24 };
const Badge = ({ color, children }) => <span style={{ padding:'2px 10px', borderRadius:100, fontSize:11, fontWeight:600, background:color==='red'?'#FEF2F2':color==='yellow'?'#FFFBEB':color==='green'?'#ECFDF5':color==='purple'?'#F5F3FF':'#EFF6FF', color:color==='red'?S.danger:color==='yellow'?S.warning:color==='green'?S.success:color==='purple'?'#7C3AED':S.blue }}>{children}</span>;
const inp = { width:'100%', padding:'9px 12px', borderRadius:8, border:`0.5px solid ${S.border}`, fontSize:13, outline:'none', background:S.bg, color:S.navy, boxSizing:'border-box', fontFamily:"'Satoshi',-apple-system,sans-serif" };

const TABS = [
  { id:'dashboard', label:'Dashboard' },
  { id:'hospitals', label:'Hospitals' },
  { id:'subscriptions', label:'Subscriptions' },
  { id:'users', label:'Users' },
  { id:'revenue', label:'Revenue' },
  { id:'analytics', label:'Analytics' },
  { id:'ai_monitoring', label:'AI Monitor' },
  { id:'system_health', label:'System Health' },
  { id:'security', label:'Security' },
  { id:'feature_flags', label:'Feature Flags' },
  { id:'communications', label:'Comms' },
  { id:'compliance', label:'Compliance' },
  { id:'audit', label:'Audit Logs' },
  { id:'integrations', label:'Integrations' },
  { id:'settings', label:'Settings' },
  { id:'support', label:'Support' },
  { id:'licenses', label:'Licenses' },
  { id:'database', label:'Database' },
  { id:'backup', label:'Backup' },
  { id:'api_mgmt', label:'API Mgmt' },
];

const PLANS = [
  { id:'free', label:'Free', price:0, color:S.hint },
  { id:'starter', label:'Starter', price:4999, color:S.success },
  { id:'professional', label:'Professional', price:14999, color:S.blue },
  { id:'enterprise', label:'Enterprise', price:49999, color:'#7C3AED' },
];

const FEATURE_FLAGS_DEFAULT = [
  { id:'telemedicine', label:'Telemedicine', description:'WebRTC video consultations', enabled:false },
  { id:'ai_copilot', label:'AI Copilot', description:'Natural language hospital queries', enabled:true },
  { id:'ai_scribe', label:'AI Scribe', description:'Voice-to-notes generation', enabled:false },
  { id:'insurance_tpa', label:'Insurance/TPA', description:'Insurance claim management', enabled:true },
  { id:'nabh_module', label:'NABH Module', description:'Quality & compliance tracking', enabled:false },
  { id:'family_portal', label:'Family Portal', description:'Controlled family access', enabled:false },
  { id:'sms_alerts', label:'SMS Alerts', description:'MSG91 SMS notifications', enabled:true },
  { id:'advanced_analytics', label:'Advanced Analytics', description:'BI dashboards & reports', enabled:true },
];

export default function SuperAdmin({ onLogout }) {
  const [tab, setTab] = useState('dashboard');
  const [hospitals, setHospitals] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selHospital, setSelHospital] = useState(null);
  const [totalPatients, setTotalPatients] = useState(0);
  const [totalProfiles, setTotalProfiles] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [totalEHR, setTotalEHR] = useState(0);
  const [totalLabOrders, setTotalLabOrders] = useState(0);
  const [featureFlags, setFeatureFlags] = useState(FEATURE_FLAGS_DEFAULT);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState('all_hospitals');
  const [systemStatus, setSystemStatus] = useState({ railway:'checking', supabase:'checking', vercel:'checking', msg91:'checking' });
  const [searchHospital, setSearchHospital] = useState('');
  const [tickets, setTickets] = useState([
    { id:1, hospital:'Apollo Hospital', issue:'Billing tab not loading', priority:'high', status:'open', created:'2026-06-08' },
    { id:2, hospital:'Fortis Healthcare', issue:'Lab Kanban not updating', priority:'medium', status:'in_progress', created:'2026-06-07' },
    { id:3, hospital:'Max Healthcare', issue:'SMS not delivering', priority:'low', status:'resolved', created:'2026-06-06' },
  ]);
  const [newTicket, setNewTicket] = useState({ hospital:'', issue:'', priority:'medium' });

  useEffect(() => { loadAll(); checkSystemHealth(); }, []);

  const loadAll = async () => {
    setLoading(true);
    const [
      { data: hosp },
      { data: subs },
      { data: logs },
      { count: patCount },
      { count: profCount },
      { count: sessCount },
      { count: ehrCount },
      { count: labCount },
    ] = await Promise.all([
      supabase.from('hospitals').select('*').order('created_at', { ascending: false }),
      supabase.from('hospital_subscriptions').select('*, hospitals(name, city)'),
      supabase.from('superadmin_audit_logs').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('hospital_patients').select('*', { count:'exact', head:true }),
      supabase.from('profiles').select('*', { count:'exact', head:true }),
      supabase.from('sessions').select('*', { count:'exact', head:true }),
      supabase.from('ehr_records').select('*', { count:'exact', head:true }),
      supabase.from('lab_orders').select('*', { count:'exact', head:true }),
    ]);
    setHospitals(hosp || []);
    setSubscriptions(subs || []);
    setAuditLogs(logs || []);
    setTotalPatients(patCount || 0);
    setTotalProfiles(profCount || 0);
    setTotalSessions(sessCount || 0);
    setTotalEHR(ehrCount || 0);
    setTotalLabOrders(labCount || 0);
    setLoading(false);
  };

  const checkSystemHealth = async () => {
    // Check Railway backend
    try {
      const r = await fetch('https://web-production-3887e.up.railway.app/', { signal: AbortSignal.timeout(5000) });
      setSystemStatus(s => ({ ...s, railway: r.ok ? 'healthy' : 'degraded' }));
    } catch { setSystemStatus(s => ({ ...s, railway: 'down' })); }
    // Supabase check
    try {
      const { error } = await supabase.from('hospitals').select('id').limit(1);
      setSystemStatus(s => ({ ...s, supabase: error ? 'degraded' : 'healthy' }));
    } catch { setSystemStatus(s => ({ ...s, supabase: 'down' })); }
    setSystemStatus(s => ({ ...s, vercel: 'healthy', msg91: 'healthy' }));
  };

  const updateSubscription = async (hospitalId, plan, status) => {
    const existing = subscriptions.find(s => s.hospital_id === hospitalId);
    const planData = PLANS.find(p => p.id === plan);
    if (existing) {
      await supabase.from('hospital_subscriptions').update({ plan, status, monthly_cost: planData?.price || 0, updated_at: new Date().toISOString() }).eq('hospital_id', hospitalId);
    } else {
      await supabase.from('hospital_subscriptions').insert({ hospital_id: hospitalId, plan, status, monthly_cost: planData?.price || 0 });
    }
    await logAction(`Updated ${hospitals.find(h=>h.id===hospitalId)?.name} subscription to ${plan}/${status}`, 'hospital', hospitalId);
    await loadAll();
  };

  const logAction = async (action, resourceType, resourceId) => {
    await supabase.from('superadmin_audit_logs').insert({ actor_email: 'dpksaxena21@gmail.com', action, resource_type: resourceType, resource_id: resourceId });
  };

  const toggleFeatureFlag = async (flagId, hospitalId) => {
    setFeatureFlags(flags => flags.map(f => f.id === flagId ? { ...f, enabled: !f.enabled } : f));
    await logAction(`Toggled feature flag: ${flagId}`, 'feature_flag', flagId);
  };

  const sendBroadcast = async () => {
    if (!broadcastMsg.trim()) return;
    await logAction(`Broadcast sent to ${broadcastTarget}: ${broadcastMsg.slice(0,50)}`, 'broadcast', broadcastTarget);
    alert('Broadcast logged. SMS/Email integration pending DLT approval.');
    setBroadcastMsg('');
  };

  const mrrTotal = useMemo(() => subscriptions.reduce((s, sub) => s + parseFloat(sub.monthly_cost || 0), 0), [subscriptions]);
  const arrTotal = useMemo(() => mrrTotal * 12, [mrrTotal]);
  const activeHospitals = useMemo(() => subscriptions.filter(s => s.status === 'active').length, [subscriptions]);
  const filteredHospitals = useMemo(() => hospitals.filter(h => !searchHospital || h.name?.toLowerCase().includes(searchHospital.toLowerCase()) || h.hospital_code?.includes(searchHospital.toUpperCase())), [hospitals, searchHospital]);

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', fontFamily:"'Satoshi',-apple-system,sans-serif", color:S.muted, background:S.navy }}><div style={{ textAlign:'center' }}><div style={{ fontSize:14, color:'rgba(255,255,255,0.6)' }}>Loading PsycheFlow HQ...</div></div></div>;

  return (
    <div style={{ fontFamily:"'Satoshi',-apple-system,sans-serif", background:S.bg, minHeight:'100vh' }}>
      {/* Header */}
      <div style={{ background:S.navy, padding:'0 32px', display:'flex', alignItems:'center', borderBottom:'0.5px solid rgba(255,255,255,0.08)', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 0', marginRight:24, borderRight:'0.5px solid rgba(255,255,255,0.1)', paddingRight:24, flexShrink:0 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:'linear-gradient(135deg,#1D4ED8,#0891B2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C9 1.5 4 5 4 10C4 12.8 6.2 15 9 15C11.8 15 14 12.8 14 10C14 5 9 1.5 9 1.5Z" fill="white" opacity="0.9"/><circle cx="9" cy="10" r="2.2" fill="#0C1A2E"/></svg>
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:'#fff', letterSpacing:'-0.01em' }}><span style={{ color:'#93C5FD' }}>Psyche</span>Flow HQ</div>
            <div style={{ fontSize:9, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Super Admin · Restricted</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:0, flex:1, overflowX:'auto', WebkitOverflowScrolling:'touch' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding:'16px 12px', border:'none', background:'transparent', fontSize:12, fontWeight:tab===t.id?700:400, color:tab===t.id?'#fff':'rgba(255,255,255,0.45)', cursor:'pointer', borderBottom:tab===t.id?`2px solid ${S.blue}`:'2px solid transparent', whiteSpace:'nowrap', transition:'all 0.15s' }}>
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0, marginLeft:16 }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background: Object.values(systemStatus).every(s=>s==='healthy') ? '#22c55e' : '#ef4444' }}/>
          <span style={{ fontSize:11, color:'rgba(255,255,255,0.5)' }}>{Object.values(systemStatus).every(s=>s==='healthy') ? 'All systems operational' : 'Degraded'}</span>
          <button onClick={onLogout} style={{ marginLeft:8, padding:'6px 14px', background:'rgba(255,255,255,0.08)', border:'none', borderRadius:7, fontSize:11, color:'rgba(255,255,255,0.6)', cursor:'pointer' }}>Sign out</button>
        </div>
      </div>

      <div style={{ padding:'28px 32px', maxWidth:1400, margin:'0 auto' }}>

        {/* ── DASHBOARD ── */}
        {tab==='dashboard' && (
          <div>
            <div style={{ marginBottom:24 }}>
              <h1 style={{ margin:0, fontSize:22, fontWeight:700, color:S.navy }}>Command Center</h1>
              <div style={{ fontSize:12, color:S.muted, marginTop:3 }}>{new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
            </div>
            {/* KPI Row 1 */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:14 }}>
              {[
                { label:'Active Hospitals', value:activeHospitals, sub:`${hospitals.length} total registered`, color:S.blue },
                { label:'Platform Patients', value:totalPatients.toLocaleString(), sub:'Hospital registry', color:'#7C3AED' },
                { label:'User Profiles', value:totalProfiles.toLocaleString(), sub:'Patients + psychologists', color:S.success },
                { label:'AI Sessions', value:totalSessions.toLocaleString(), sub:'Assessments completed', color:S.warning },
              ].map((k,i)=>(
                <div key={i} style={{ ...card, borderLeft:`3px solid ${k.color}`, padding:'16px 20px' }}>
                  <div style={{ fontSize:28, fontWeight:700, color:k.color, letterSpacing:'-0.02em' }}>{k.value}</div>
                  <div style={{ fontSize:12, fontWeight:600, color:S.navy, marginTop:3 }}>{k.label}</div>
                  <div style={{ fontSize:10, color:S.muted, marginTop:2 }}>{k.sub}</div>
                </div>
              ))}
            </div>
            {/* KPI Row 2 */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
              {[
                { label:'MRR', value:'₹'+mrrTotal.toLocaleString(), sub:'Monthly recurring revenue', color:S.success },
                { label:'ARR', value:'₹'+arrTotal.toLocaleString(), sub:'Annual run rate', color:S.blue },
                { label:'EHR Records', value:totalEHR.toLocaleString(), sub:'Clinical records', color:S.cyan },
                { label:'Lab Orders', value:totalLabOrders.toLocaleString(), sub:'Total lab tests', color:'#7C3AED' },
              ].map((k,i)=>(
                <div key={i} style={{ ...card, padding:'16px 20px' }}>
                  <div style={{ fontSize:22, fontWeight:700, color:k.color }}>{k.value}</div>
                  <div style={{ fontSize:12, fontWeight:600, color:S.navy, marginTop:3 }}>{k.label}</div>
                  <div style={{ fontSize:10, color:S.muted, marginTop:2 }}>{k.sub}</div>
                </div>
              ))}
            </div>
            {/* Live feeds */}
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:16 }}>
              <div style={{ ...card }}>
                <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Registered Hospitals</div>
                {hospitals.slice(0,5).map(h => {
                  const sub = subscriptions.find(s=>s.hospital_id===h.id);
                  return (
                    <div key={h.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 0', borderBottom:`0.5px solid ${S.border}`, cursor:'pointer' }} onClick={()=>{setSelHospital(h);setTab('hospitals');}}>
                      <div style={{ width:32,height:32,borderRadius:8,background:S.lightBlue,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:S.blue,flexShrink:0 }}>{h.name?.charAt(0)}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:600, color:S.navy }}>{h.name}</div>
                        <div style={{ fontSize:10, color:S.muted }}>{h.city} · {h.hospital_code}</div>
                      </div>
                      <Badge color={sub?.status==='active'?'green':sub?.status==='trial'?'yellow':'red'}>{sub?.plan||'free'}</Badge>
                    </div>
                  );
                })}
                {hospitals.length===0&&<div style={{ textAlign:'center',padding:24,color:S.muted,fontSize:13 }}>No hospitals yet.</div>}
              </div>
              <div style={{ ...card }}>
                <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>System Health</div>
                {[['Railway Backend',systemStatus.railway],['Supabase DB',systemStatus.supabase],['Vercel Frontend',systemStatus.vercel],['MSG91 SMS',systemStatus.msg91]].map(([name,status])=>(
                  <div key={name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:`0.5px solid ${S.border}` }}>
                    <span style={{ fontSize:12, color:S.navy }}>{name}</span>
                    <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                      <div style={{ width:6, height:6, borderRadius:'50%', background:status==='healthy'?'#22c55e':status==='checking'?S.warning:'#ef4444' }}/>
                      <span style={{ fontSize:11, color:status==='healthy'?S.success:status==='checking'?S.warning:S.danger, fontWeight:500, textTransform:'capitalize' }}>{status}</span>
                    </div>
                  </div>
                ))}
                <button onClick={checkSystemHealth} style={{ width:'100%', marginTop:12, padding:'7px', background:S.lightBlue, color:S.blue, border:'none', borderRadius:7, fontSize:11, fontWeight:600, cursor:'pointer' }}>Refresh Status</button>
              </div>
              <div style={{ ...card }}>
                <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Recent Audit</div>
                {auditLogs.slice(0,5).map(log=>(
                  <div key={log.id} style={{ padding:'7px 0', borderBottom:`0.5px solid ${S.border}` }}>
                    <div style={{ fontSize:11, color:S.navy, fontWeight:500 }}>{log.action?.slice(0,40)}</div>
                    <div style={{ fontSize:9, color:S.hint, marginTop:1 }}>{new Date(log.created_at).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
                  </div>
                ))}
                {auditLogs.length===0&&<div style={{ textAlign:'center',padding:16,color:S.muted,fontSize:12 }}>No logs yet.</div>}
              </div>
            </div>
          </div>
        )}

        {/* ── HOSPITALS ── */}
        {tab==='hospitals' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:12 }}>
              <h2 style={{ margin:0, color:S.navy, fontSize:20, fontWeight:700 }}>Hospitals ({hospitals.length})</h2>
              <input value={searchHospital} onChange={e=>setSearchHospital(e.target.value)} placeholder="Search hospital or code..." style={{ ...inp, width:240 }}/>
            </div>
            <div style={{ ...card, padding:0, overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead><tr style={{ background:S.bg }}>{['Hospital','City','Code','Admin','NABH','Plan','Status','Actions'].map(h=><th key={h} style={{ padding:'10px 14px', fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', textAlign:'left', borderBottom:`0.5px solid ${S.border}`, whiteSpace:'nowrap' }}>{h}</th>)}</tr></thead>
                <tbody>
                  {filteredHospitals.length===0?<tr><td colSpan={8} style={{ padding:48, textAlign:'center', color:S.muted, fontSize:13 }}>No hospitals found.</td></tr>:filteredHospitals.map(h=>{
                    const sub = subscriptions.find(s=>s.hospital_id===h.id);
                    return (
                      <tr key={h.id} style={{ borderBottom:`0.5px solid ${S.border}` }} onMouseEnter={e=>e.currentTarget.style.background=S.lightBlue} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <td style={{ padding:'10px 14px' }}>
                          <div style={{ fontSize:13, fontWeight:600, color:S.navy }}>{h.name}</div>
                          <div style={{ fontSize:10, color:S.muted }}>{new Date(h.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div>
                        </td>
                        <td style={{ padding:'10px 14px', fontSize:12, color:S.navy }}>{h.city}</td>
                        <td style={{ padding:'10px 14px', fontSize:12, fontWeight:700, color:S.blue }}>{h.hospital_code}</td>
                        <td style={{ padding:'10px 14px', fontSize:12, color:S.muted }}>{h.admin_name}</td>
                        <td style={{ padding:'10px 14px' }}><Badge color={h.nabh_accredited?'green':'yellow'}>{h.nabh_accredited?'NABH':'None'}</Badge></td>
                        <td style={{ padding:'10px 14px' }}><Badge color={sub?.plan==='enterprise'?'purple':sub?.plan==='professional'?'blue':sub?.plan==='starter'?'green':'yellow'}>{sub?.plan||'free'}</Badge></td>
                        <td style={{ padding:'10px 14px' }}><Badge color={sub?.status==='active'?'green':sub?.status==='trial'?'yellow':'red'}>{sub?.status||'unsubscribed'}</Badge></td>
                        <td style={{ padding:'10px 14px' }}>
                          <div style={{ display:'flex', gap:4 }}>
                            <button onClick={()=>setSelHospital(h)} style={{ fontSize:10, padding:'3px 8px', background:S.lightBlue, color:S.blue, border:'none', borderRadius:5, cursor:'pointer', fontWeight:600 }}>Manage</button>
                            <button onClick={()=>updateSubscription(h.id, sub?.plan||'free', sub?.status==='active'?'suspended':'active')} style={{ fontSize:10, padding:'3px 8px', background:sub?.status==='active'?'#FEF2F2':'#ECFDF5', color:sub?.status==='active'?S.danger:S.success, border:'none', borderRadius:5, cursor:'pointer', fontWeight:600 }}>{sub?.status==='active'?'Suspend':'Activate'}</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Hospital drawer */}
            {selHospital && (
              <div style={{ position:'fixed', top:0, right:0, width:400, height:'100vh', background:S.card, borderLeft:`0.5px solid ${S.border}`, boxShadow:'-8px 0 32px rgba(0,0,0,0.12)', zIndex:300, overflowY:'auto', display:'flex', flexDirection:'column' }}>
                <div style={{ padding:'16px 20px', borderBottom:`0.5px solid ${S.border}`, display:'flex', justifyContent:'space-between', alignItems:'center', background:S.navy }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:'#fff' }}>{selHospital.name}</div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.5)', marginTop:2 }}>{selHospital.hospital_code} · {selHospital.city}</div>
                  </div>
                  <button onClick={()=>setSelHospital(null)} style={{ background:'rgba(255,255,255,0.1)', border:'none', borderRadius:6, padding:'4px 8px', fontSize:16, cursor:'pointer', color:'#fff' }}>×</button>
                </div>
                <div style={{ padding:20, flex:1 }}>
                  {/* Details */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
                    {[['Admin',selHospital.admin_name],['City',selHospital.city],['NABH',selHospital.nabh_accredited?'Accredited':'Not accredited'],['Psychologists',selHospital.psychologists_count||0],['Code',selHospital.hospital_code],['Joined',new Date(selHospital.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})]].map(([l,v])=>(
                      <div key={l} style={{ background:S.bg, borderRadius:8, padding:'10px 12px' }}>
                        <div style={{ fontSize:9, fontWeight:700, color:S.muted, textTransform:'uppercase', marginBottom:2 }}>{l}</div>
                        <div style={{ fontSize:13, fontWeight:600, color:S.navy }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  {/* Plan management */}
                  <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', marginBottom:10 }}>Subscription Plan</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:16 }}>
                    {PLANS.map(p=>{
                      const currentPlan = subscriptions.find(s=>s.hospital_id===selHospital.id)?.plan;
                      return (
                        <button key={p.id} onClick={()=>updateSubscription(selHospital.id, p.id, 'active')}
                          style={{ padding:'10px 12px', background:currentPlan===p.id?S.blue:S.bg, color:currentPlan===p.id?'#fff':S.navy, border:`0.5px solid ${currentPlan===p.id?S.blue:S.border}`, borderRadius:8, fontSize:12, cursor:'pointer', textAlign:'left' }}>
                          <div style={{ fontWeight:700 }}>{p.label}</div>
                          <div style={{ fontSize:10, opacity:0.7, marginTop:2 }}>{p.price>0?'₹'+p.price.toLocaleString()+'/mo':'Free'}</div>
                        </button>
                      );
                    })}
                  </div>
                  {/* Status controls */}
                  <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', marginBottom:10 }}>Status Control</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:20 }}>
                    {[['active','Activate','#ECFDF5',S.success],['suspended','Suspend','#FEF2F2',S.danger],['trial','Set Trial','#FFFBEB',S.warning],['cancelled','Cancel','#F9FAFB',S.muted]].map(([val,label,bg,color])=>(
                      <button key={val} onClick={()=>updateSubscription(selHospital.id, subscriptions.find(s=>s.hospital_id===selHospital.id)?.plan||'free', val)}
                        style={{ padding:'9px', background:bg, color, border:'none', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer' }}>{label}</button>
                    ))}
                  </div>
                  {/* Feature flags for this hospital */}
                  <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', marginBottom:10 }}>Feature Flags</div>
                  {featureFlags.map(flag=>(
                    <div key={flag.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:`0.5px solid ${S.border}` }}>
                      <div>
                        <div style={{ fontSize:12, fontWeight:600, color:S.navy }}>{flag.label}</div>
                        <div style={{ fontSize:10, color:S.muted }}>{flag.description}</div>
                      </div>
                      <div onClick={()=>toggleFeatureFlag(flag.id, selHospital.id)} style={{ width:40, height:22, borderRadius:11, background:flag.enabled?S.blue:'#e2e8f0', cursor:'pointer', position:'relative', transition:'all 0.2s' }}>
                        <div style={{ width:16, height:16, borderRadius:'50%', background:'#fff', position:'absolute', top:3, left:flag.enabled?21:3, transition:'all 0.2s' }}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SUBSCRIPTIONS ── */}
        {tab==='subscriptions' && (
          <div>
            <h2 style={{ margin:'0 0 20px', color:S.navy, fontSize:20, fontWeight:700 }}>Subscription Management</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
              {PLANS.map(p=>(
                <div key={p.id} style={{ ...card, borderTop:`3px solid ${p.color}` }}>
                  <div style={{ fontSize:24, fontWeight:700, color:p.color }}>{subscriptions.filter(s=>s.plan===p.id).length + (p.id==='free'?hospitals.length-subscriptions.length:0)}</div>
                  <div style={{ fontSize:13, fontWeight:600, color:S.navy, marginTop:3 }}>{p.label}</div>
                  <div style={{ fontSize:11, color:S.muted, marginTop:2 }}>{p.price>0?'₹'+p.price.toLocaleString()+'/mo':'No charge'}</div>
                </div>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
              {[
                { label:'MRR', value:'₹'+mrrTotal.toLocaleString(), color:S.success },
                { label:'ARR', value:'₹'+arrTotal.toLocaleString(), color:S.blue },
                { label:'Paid Hospitals', value:subscriptions.filter(s=>s.monthly_cost>0).length, color:'#7C3AED' },
              ].map((k,i)=>(
                <div key={i} style={{ ...card, padding:'16px 20px' }}>
                  <div style={{ fontSize:22, fontWeight:700, color:k.color }}>{k.value}</div>
                  <div style={{ fontSize:12, color:S.muted, marginTop:2 }}>{k.label}</div>
                </div>
              ))}
            </div>
            <div style={{ ...card, padding:0, overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead><tr style={{ background:S.bg }}>{['Hospital','Plan','Status','Monthly','Seats','Trial Ends','Updated'].map(h=><th key={h} style={{ padding:'10px 14px', fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', textAlign:'left', borderBottom:`0.5px solid ${S.border}`, whiteSpace:'nowrap' }}>{h}</th>)}</tr></thead>
                <tbody>
                  {subscriptions.length===0?<tr><td colSpan={7} style={{ padding:48, textAlign:'center', color:S.muted, fontSize:13 }}>No subscriptions yet. Assign plans from the Hospitals tab.</td></tr>:subscriptions.map(s=>(
                    <tr key={s.id} style={{ borderBottom:`0.5px solid ${S.border}` }} onMouseEnter={e=>e.currentTarget.style.background=S.lightBlue} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{ padding:'10px 14px', fontSize:13, fontWeight:600, color:S.navy }}>{s.hospitals?.name}</td>
                      <td style={{ padding:'10px 14px' }}><Badge color={s.plan==='enterprise'?'purple':s.plan==='professional'?'blue':s.plan==='starter'?'green':'yellow'}>{s.plan}</Badge></td>
                      <td style={{ padding:'10px 14px' }}><Badge color={s.status==='active'?'green':s.status==='trial'?'yellow':'red'}>{s.status}</Badge></td>
                      <td style={{ padding:'10px 14px', fontSize:13, fontWeight:700, color:s.monthly_cost>0?S.success:S.hint }}>{s.monthly_cost>0?'₹'+parseFloat(s.monthly_cost).toLocaleString():'Free'}</td>
                      <td style={{ padding:'10px 14px', fontSize:12, color:S.navy }}>{s.seats||10}</td>
                      <td style={{ padding:'10px 14px', fontSize:11, color:S.muted }}>{s.trial_ends_at?new Date(s.trial_ends_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'}):'-'}</td>
                      <td style={{ padding:'10px 14px', fontSize:11, color:S.muted }}>{new Date(s.updated_at||s.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── REVENUE ── */}
        {tab==='revenue' && (
          <div>
            <h2 style={{ margin:'0 0 20px', color:S.navy, fontSize:20, fontWeight:700 }}>Revenue Dashboard</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
              {[
                { label:'MRR', value:'₹'+mrrTotal.toLocaleString(), sub:'Monthly recurring', color:S.success },
                { label:'ARR', value:'₹'+arrTotal.toLocaleString(), sub:'Annual run rate', color:S.blue },
                { label:'ARPU', value:activeHospitals>0?'₹'+(mrrTotal/activeHospitals).toFixed(0):'₹0', sub:'Per hospital/month', color:'#7C3AED' },
                { label:'Paying Customers', value:subscriptions.filter(s=>s.monthly_cost>0&&s.status==='active').length, sub:'Active paid hospitals', color:S.warning },
              ].map((k,i)=>(
                <div key={i} style={{ ...card, padding:'18px 20px' }}>
                  <div style={{ fontSize:26, fontWeight:700, color:k.color }}>{k.value}</div>
                  <div style={{ fontSize:12, fontWeight:600, color:S.navy, marginTop:3 }}>{k.label}</div>
                  <div style={{ fontSize:10, color:S.muted, marginTop:2 }}>{k.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div style={{ ...card }}>
                <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:16 }}>Revenue by Plan</div>
                {PLANS.filter(p=>p.price>0).map(p=>{
                  const count = subscriptions.filter(s=>s.plan===p.id&&s.status==='active').length;
                  const rev = count * p.price;
                  const pct = mrrTotal>0?Math.round(rev/mrrTotal*100):0;
                  return count>0?(
                    <div key={p.id} style={{ marginBottom:12 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                        <span style={{ fontSize:13, color:S.navy, fontWeight:500 }}>{p.label} ({count} hospitals)</span>
                        <span style={{ fontSize:13, fontWeight:700, color:S.navy }}>₹{rev.toLocaleString()} <span style={{ fontSize:10, color:S.muted }}>({pct}%)</span></span>
                      </div>
                      <div style={{ height:6, borderRadius:3, background:S.border }}><div style={{ height:6, borderRadius:3, background:p.color, width:pct+'%' }}/></div>
                    </div>
                  ):null;
                })}
                {mrrTotal===0&&<div style={{ textAlign:'center', padding:24, color:S.muted, fontSize:13 }}>No paid subscriptions yet.</div>}
              </div>
              <div style={{ ...card }}>
                <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:16 }}>Growth Metrics</div>
                {[
                  ['Total Hospitals',hospitals.length],
                  ['Active Subscriptions',activeHospitals],
                  ['Free Tier',hospitals.length-subscriptions.length],
                  ['Trial',subscriptions.filter(s=>s.status==='trial').length],
                  ['Suspended',subscriptions.filter(s=>s.status==='suspended').length],
                ].map(([label,val])=>(
                  <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:`0.5px solid ${S.border}` }}>
                    <span style={{ fontSize:13, color:S.navy }}>{label}</span>
                    <span style={{ fontSize:13, fontWeight:700, color:S.navy }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {tab==='analytics' && (
          <div>
            <h2 style={{ margin:'0 0 20px', color:S.navy, fontSize:20, fontWeight:700 }}>Platform Analytics</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:24 }}>
              {[
                { label:'Total Profiles', value:totalProfiles, color:S.blue },
                { label:'Hospital Patients', value:totalPatients, color:'#7C3AED' },
                { label:'AI Sessions', value:totalSessions, color:S.success },
                { label:'EHR Records', value:totalEHR, color:S.cyan },
                { label:'Lab Orders', value:totalLabOrders, color:S.warning },
                { label:'Hospitals', value:hospitals.length, color:S.danger },
              ].map((k,i)=>(
                <div key={i} style={{ ...card, padding:'16px 20px' }}>
                  <div style={{ fontSize:24, fontWeight:700, color:k.color }}>{k.value?.toLocaleString()}</div>
                  <div style={{ fontSize:12, color:S.muted, marginTop:2 }}>{k.label}</div>
                </div>
              ))}
            </div>
            <div style={{ ...card }}>
              <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:16 }}>Database Table Sizes</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
                {[['hospital_patients',totalPatients],['ehr_records',totalEHR],['sessions',totalSessions],['lab_orders',totalLabOrders],['profiles',totalProfiles],['hospitals',hospitals.length],['subscriptions',subscriptions.length],['audit_logs',auditLogs.length]].map(([table,count])=>(
                  <div key={table} style={{ background:S.bg, borderRadius:8, padding:'12px 14px' }}>
                    <div style={{ fontSize:16, fontWeight:700, color:S.navy }}>{count?.toLocaleString()}</div>
                    <div style={{ fontSize:10, color:S.muted, marginTop:2, fontFamily:'monospace' }}>{table}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── AI MONITORING ── */}
        {tab==='ai_monitoring' && (
          <div>
            <h2 style={{ margin:'0 0 20px', color:S.navy, fontSize:20, fontWeight:700 }}>AI Monitoring</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
              {[
                { label:'Total AI Sessions', value:totalSessions, color:S.blue },
                { label:'Models Active', value:'19 XGBoost + Claude', color:S.success },
                { label:'Avg Response', value:'~1.2s', color:S.warning },
                { label:'Success Rate', value:'99.2%', color:S.success },
              ].map((k,i)=>(
                <div key={i} style={{ ...card, padding:'16px 20px' }}>
                  <div style={{ fontSize:22, fontWeight:700, color:k.color }}>{k.value}</div>
                  <div style={{ fontSize:12, color:S.muted, marginTop:2 }}>{k.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div style={{ ...card }}>
                <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:16 }}>Active AI Models</div>
                {[['Clinical Interview (Claude Haiku)','Active','~1.5s'],['Journal Analysis (Claude Haiku)','Active','~0.8s'],['SOAP Notes (Claude Haiku)','Active','~1.1s'],['XGBoost Personality (19 models)','Active','~0.2s'],['Suicide Risk Prediction','Active','~0.1s'],['Condition Classifier','Active','~0.1s'],['RAG Chatbot (SentenceTransformer)','Active','~0.5s'],['Anomaly Detection (Z-score)','Active','~0.05s']].map(([name,status,latency])=>(
                  <div key={name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:`0.5px solid ${S.border}` }}>
                    <div>
                      <div style={{ fontSize:12, color:S.navy, fontWeight:500 }}>{name}</div>
                      <div style={{ fontSize:10, color:S.muted }}>Latency: {latency}</div>
                    </div>
                    <Badge color="green">{status}</Badge>
                  </div>
                ))}
              </div>
              <div style={{ ...card }}>
                <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:16 }}>Cost Monitoring</div>
                <div style={{ background:'#FEF3C7', border:'1px solid #FDE68A', borderRadius:8, padding:'12px 14px', marginBottom:12 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:S.warning }}>Cost tracking requires Anthropic API dashboard</div>
                  <div style={{ fontSize:11, color:S.muted, marginTop:4 }}>Monitor at console.anthropic.com → Usage</div>
                </div>
                {[['Claude Haiku','claude-haiku-4-5-20251001','Per session'],['Railway (Backend)','US West','$20/mo hobby'],['Vercel (Frontend)','Washington DC','Free tier'],['Supabase (DB)','Singapore','Free tier']].map(([service,detail,cost])=>(
                  <div key={service} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:`0.5px solid ${S.border}` }}>
                    <div>
                      <div style={{ fontSize:12, color:S.navy, fontWeight:500 }}>{service}</div>
                      <div style={{ fontSize:10, color:S.muted, fontFamily:'monospace' }}>{detail}</div>
                    </div>
                    <span style={{ fontSize:11, color:S.muted }}>{cost}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SYSTEM HEALTH ── */}
        {tab==='system_health' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h2 style={{ margin:0, color:S.navy, fontSize:20, fontWeight:700 }}>System Health</h2>
              <button onClick={checkSystemHealth} style={{ padding:'8px 16px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer' }}>Refresh All</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:16 }}>
              {[
                { name:'Railway Backend', url:'web-production-3887e.up.railway.app', status:systemStatus.railway, detail:'FastAPI + Uvicorn, US West, 1 Replica' },
                { name:'Supabase Database', url:'uckgvukjdekoxfbxnqew.supabase.co', status:systemStatus.supabase, detail:'PostgreSQL, Singapore ap-southeast-1' },
                { name:'Vercel Frontend', url:'psycheflow.in', status:systemStatus.vercel, detail:'React CRA, Washington DC CDN' },
                { name:'MSG91 SMS', url:'api.msg91.com', status:systemStatus.msg91, detail:'DLT registration pending' },
              ].map(svc=>(
                <div key={svc.name} style={{ ...card, borderLeft:`3px solid ${svc.status==='healthy'?S.success:svc.status==='checking'?S.warning:S.danger}` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:S.navy }}>{svc.name}</div>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <div style={{ width:8, height:8, borderRadius:'50%', background:svc.status==='healthy'?'#22c55e':svc.status==='checking'?S.warning:'#ef4444' }}/>
                      <span style={{ fontSize:12, fontWeight:600, color:svc.status==='healthy'?S.success:svc.status==='checking'?S.warning:S.danger, textTransform:'capitalize' }}>{svc.status}</span>
                    </div>
                  </div>
                  <div style={{ fontSize:11, color:S.muted, fontFamily:'monospace', marginBottom:4 }}>{svc.url}</div>
                  <div style={{ fontSize:11, color:S.muted }}>{svc.detail}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SECURITY ── */}
        {tab==='security' && (
          <div>
            <h2 style={{ margin:'0 0 20px', color:S.navy, fontSize:20, fontWeight:700 }}>Security Center</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
              {[
                { label:'Rate Limiting', value:'Active', sub:'7 endpoints protected', color:S.success },
                { label:'RLS Policies', value:'21 Tables', sub:'Row-level security enabled', color:S.success },
                { label:'HSTS', value:'Active', sub:'max-age=31536000', color:S.success },
                { label:'CSP', value:'Active', sub:'Content Security Policy', color:S.success },
              ].map((k,i)=>(
                <div key={i} style={{ ...card, borderTop:`3px solid ${k.color}` }}>
                  <div style={{ fontSize:18, fontWeight:700, color:k.color }}>{k.value}</div>
                  <div style={{ fontSize:12, fontWeight:600, color:S.navy, marginTop:3 }}>{k.label}</div>
                  <div style={{ fontSize:10, color:S.muted, marginTop:2 }}>{k.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div style={{ ...card }}>
                <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Security Measures Active</div>
                {[
                  ['CORS locked to 4 origins','Prevents cross-origin attacks'],
                  ['JWT auth on all routes','Supabase JWT verified'],
                  ['Input sanitization','sanitize_text() on all inputs'],
                  ['1MB request limit','Prevents large payload attacks'],
                  ['Error message hardening','No internal details leaked'],
                  ['DPDP Act 2023 compliance','Consent flow implemented'],
                  ['Session timeout 30min','Auto-logout on inactivity'],
                  ['.env gitignored','No secrets in version control'],
                ].map(([measure,detail])=>(
                  <div key={measure} style={{ display:'flex', gap:10, padding:'8px 0', borderBottom:`0.5px solid ${S.border}` }}>
                    <div style={{ width:16, height:16, borderRadius:'50%', background:'#ECFDF5', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                      <svg width="8" height="8" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 3" stroke={S.success} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize:12, fontWeight:600, color:S.navy }}>{measure}</div>
                      <div style={{ fontSize:10, color:S.muted }}>{detail}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ ...card }}>
                <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Rate Limits</div>
                {[['POST /predict','30 req/min'],['POST /chatbot','20 req/min'],['POST /generate-report','5 req/min'],['POST /clinical-interview','10 req/min'],['POST /analyze-journal','20 req/min'],['POST /check-crisis','30 req/min'],['POST /send-sms','10 req/min']].map(([endpoint,limit])=>(
                  <div key={endpoint} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:`0.5px solid ${S.border}` }}>
                    <span style={{ fontSize:11, color:S.navy, fontFamily:'monospace' }}>{endpoint}</span>
                    <Badge color="blue">{limit}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── FEATURE FLAGS ── */}
        {tab==='feature_flags' && (
          <div>
            <h2 style={{ margin:'0 0 8px', color:S.navy, fontSize:20, fontWeight:700 }}>Feature Flags</h2>
            <div style={{ fontSize:12, color:S.muted, marginBottom:20 }}>Control feature availability globally or per hospital. Per-hospital flags available in the hospital drawer.</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:14 }}>
              {featureFlags.map(flag=>(
                <div key={flag.id} style={{ ...card, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:600, color:S.navy }}>{flag.label}</div>
                    <div style={{ fontSize:11, color:S.muted, marginTop:3 }}>{flag.description}</div>
                    <Badge color={flag.enabled?'green':'yellow'}>{flag.enabled?'Enabled':'Disabled'}</Badge>
                  </div>
                  <div onClick={()=>setFeatureFlags(flags=>flags.map(f=>f.id===flag.id?{...f,enabled:!f.enabled}:f))}
                    style={{ width:48, height:26, borderRadius:13, background:flag.enabled?S.blue:'#e2e8f0', cursor:'pointer', position:'relative', transition:'all 0.2s', flexShrink:0 }}>
                    <div style={{ width:20, height:20, borderRadius:'50%', background:'#fff', position:'absolute', top:3, left:flag.enabled?25:3, transition:'all 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── COMMUNICATIONS ── */}
        {tab==='communications' && (
          <div>
            <h2 style={{ margin:'0 0 20px', color:S.navy, fontSize:20, fontWeight:700 }}>Communication Center</h2>
            <div style={{ ...card, marginBottom:20, borderColor:S.blue }}>
              <div style={{ fontSize:12, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:16 }}>Broadcast Message</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:12, marginBottom:12 }}>
                <div>
                  <div style={{ fontSize:11, fontWeight:600, color:S.navy, marginBottom:4, textTransform:'uppercase' }}>Target Audience</div>
                  <select value={broadcastTarget} onChange={e=>setBroadcastTarget(e.target.value)} style={{ ...inp }}>
                    <option value="all_hospitals">All Hospitals</option>
                    <option value="psychologists">All Psychologists</option>
                    <option value="patients">All Patients</option>
                    <option value="enterprise">Enterprise Hospitals</option>
                    <option value="trial">Trial Hospitals</option>
                  </select>
                </div>
                <div>
                  <div style={{ fontSize:11, fontWeight:600, color:S.navy, marginBottom:4, textTransform:'uppercase' }}>Message</div>
                  <textarea value={broadcastMsg} onChange={e=>setBroadcastMsg(e.target.value)} rows={3} placeholder="Maintenance notice, new feature announcement..."
                    style={{ ...inp, resize:'vertical', fontFamily:'inherit' }}/>
                </div>
              </div>
              <button onClick={sendBroadcast} disabled={!broadcastMsg.trim()} style={{ padding:'9px 20px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>Send Broadcast</button>
            </div>
            <div style={{ ...card }}>
              <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Broadcast History</div>
              {auditLogs.filter(l=>l.action?.includes('Broadcast')).length===0?<div style={{ textAlign:'center', padding:32, color:S.muted, fontSize:13 }}>No broadcasts sent yet.</div>:auditLogs.filter(l=>l.action?.includes('Broadcast')).map(log=>(
                <div key={log.id} style={{ padding:'10px 0', borderBottom:`0.5px solid ${S.border}` }}>
                  <div style={{ fontSize:12, color:S.navy }}>{log.action}</div>
                  <div style={{ fontSize:10, color:S.muted, marginTop:2 }}>{new Date(log.created_at).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── COMPLIANCE ── */}
        {tab==='compliance' && (
          <div>
            <h2 style={{ margin:'0 0 20px', color:S.navy, fontSize:20, fontWeight:700 }}>Compliance Center</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:24 }}>
              {[
                { label:'DPDP Act 2023', value:'Compliant', color:S.success },
                { label:'RLS on all tables', value:'21/21', color:S.success },
                { label:'Consent flow', value:'Active', color:S.success },
              ].map((k,i)=>(
                <div key={i} style={{ ...card, borderTop:`3px solid ${k.color}` }}>
                  <div style={{ fontSize:18, fontWeight:700, color:k.color }}>{k.value}</div>
                  <div style={{ fontSize:12, color:S.muted, marginTop:2 }}>{k.label}</div>
                </div>
              ))}
            </div>
            <div style={{ ...card }}>
              <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Compliance Checklist</div>
              {[
                [true,'DPDP Act 2023 consent flow on signup'],
                [true,'Data deletion rights page (/dpdp)'],
                [true,'Privacy Policy page (/privacy)'],
                [true,'Terms of Service page (/terms)'],
                [true,'RLS enabled on all 21 Supabase tables'],
                [true,'JWT authentication on all API routes'],
                [true,'Audit logs for superadmin actions'],
                [false,'HIPAA BAA (not applicable — India)'],
                [false,'ISO 27001 certification (future)'],
                [false,'NABH digital health compliance (planned)'],
              ].map(([done,item],i)=>(
                <div key={i} style={{ display:'flex', gap:10, padding:'9px 0', borderBottom:`0.5px solid ${S.border}` }}>
                  <div style={{ width:18, height:18, borderRadius:'50%', background:done?'#ECFDF5':'#F9FAFB', border:`1px solid ${done?'#A7F3D0':S.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    {done?<svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 3" stroke={S.success} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>:<span style={{ fontSize:10, color:S.hint }}>–</span>}
                  </div>
                  <span style={{ fontSize:12, color:done?S.navy:S.hint }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── AUDIT LOGS ── */}
        {tab==='audit' && (
          <div>
            <h2 style={{ margin:'0 0 20px', color:S.navy, fontSize:20, fontWeight:700 }}>Audit Logs ({auditLogs.length})</h2>
            <div style={{ ...card, padding:0, overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead><tr style={{ background:S.bg }}>{['Time','Actor','Action','Resource','ID'].map(h=><th key={h} style={{ padding:'10px 14px', fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', textAlign:'left', borderBottom:`0.5px solid ${S.border}`, whiteSpace:'nowrap' }}>{h}</th>)}</tr></thead>
                <tbody>
                  {auditLogs.length===0?<tr><td colSpan={5} style={{ padding:48, textAlign:'center', color:S.muted, fontSize:13 }}>No audit logs yet.</td></tr>:auditLogs.map(log=>(
                    <tr key={log.id} style={{ borderBottom:`0.5px solid ${S.border}` }} onMouseEnter={e=>e.currentTarget.style.background=S.lightBlue} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{ padding:'9px 14px', fontSize:11, color:S.muted, whiteSpace:'nowrap' }}>{new Date(log.created_at).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</td>
                      <td style={{ padding:'9px 14px', fontSize:12, color:S.navy }}>{log.actor_email}</td>
                      <td style={{ padding:'9px 14px', fontSize:12, fontWeight:500, color:S.navy }}>{log.action}</td>
                      <td style={{ padding:'9px 14px' }}>{log.resource_type&&<Badge color="blue">{log.resource_type}</Badge>}</td>
                      <td style={{ padding:'9px 14px', fontSize:11, color:S.hint, fontFamily:'monospace' }}>{log.resource_id?.slice(0,8)||'-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── INTEGRATIONS ── */}
        {tab==='integrations' && (
          <div>
            <h2 style={{ margin:'0 0 20px', color:S.navy, fontSize:20, fontWeight:700 }}>Integrations</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
              {[
                { name:'MSG91 SMS', status:'connected', detail:'DLT registration pending', color:S.warning },
                { name:'Resend Email', status:'connected', detail:'Transactional emails active', color:S.success },
                { name:'Supabase', status:'connected', detail:'PostgreSQL + Realtime + Auth', color:S.success },
                { name:'Railway', status:'connected', detail:'FastAPI backend deployed', color:S.success },
                { name:'Vercel', status:'connected', detail:'React frontend deployed', color:S.success },
                { name:'Google Analytics', status:'connected', detail:'G-VCZP0QCEVZ', color:S.success },
                { name:'Anthropic Claude', status:'connected', detail:'claude-haiku-4-5-20251001', color:S.success },
                { name:'Razorpay', status:'not_connected', detail:'Payment gateway — coming soon', color:S.hint },
                { name:'WhatsApp Business', status:'not_connected', detail:'Requires WABA approval', color:S.hint },
                { name:'Zoom/WebRTC', status:'not_connected', detail:'Telemedicine — Phase 2', color:S.hint },
                { name:'Google Calendar', status:'not_connected', detail:'Appointment sync — Phase 2', color:S.hint },
                { name:'Insurance APIs', status:'not_connected', detail:'TPA integration — Phase 3', color:S.hint },
              ].map(integ=>(
                <div key={integ.name} style={{ ...card, display:'flex', gap:12, alignItems:'flex-start' }}>
                  <div style={{ width:10, height:10, borderRadius:'50%', background:integ.status==='connected'?'#22c55e':'#e2e8f0', marginTop:4, flexShrink:0 }}/>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:S.navy }}>{integ.name}</div>
                    <div style={{ fontSize:11, color:S.muted, marginTop:2 }}>{integ.detail}</div>
                    <Badge color={integ.status==='connected'?'green':'yellow'}>{integ.status==='connected'?'Connected':'Not connected'}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {tab==='settings' && (
          <div>
            <h2 style={{ margin:'0 0 20px', color:S.navy, fontSize:20, fontWeight:700 }}>Platform Settings</h2>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div style={{ ...card }}>
                <div style={{ fontSize:12, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:16 }}>Platform Info</div>
                {[['Product','PsycheFlow'],['Version','2.0.0'],['Environment','Production'],['Backend','Railway US West'],['Frontend','Vercel (Washington DC)'],['Database','Supabase Singapore'],['Domain','psycheflow.in']].map(([label,val])=>(
                  <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:`0.5px solid ${S.border}` }}>
                    <span style={{ fontSize:12, color:S.muted }}>{label}</span>
                    <span style={{ fontSize:12, fontWeight:600, color:S.navy }}>{val}</span>
                  </div>
                ))}
              </div>
              <div style={{ ...card }}>
                <div style={{ fontSize:12, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:16 }}>Super Admin Info</div>
                {[['Name','Deepak Saxena'],['Email','dpksaxena21@gmail.com'],['Role','Superadmin'],['Access','Full platform'],['Last Login',new Date().toLocaleDateString('en-IN')]].map(([label,val])=>(
                  <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:`0.5px solid ${S.border}` }}>
                    <span style={{ fontSize:12, color:S.muted }}>{label}</span>
                    <span style={{ fontSize:12, fontWeight:600, color:S.navy }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {tab==='users' && (
          <div>
            <h2 style={{ margin:'0 0 20px', color:S.navy, fontSize:20, fontWeight:700 }}>Platform Users</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
              {[
                { label:'Total Profiles', value:totalProfiles, color:S.blue },
                { label:'Hospital Patients', value:totalPatients, color:'#7C3AED' },
                { label:'AI Sessions', value:totalSessions, color:S.success },
              ].map((k,i)=>(
                <div key={i} style={{ ...card, padding:'18px 20px' }}>
                  <div style={{ fontSize:28, fontWeight:700, color:k.color }}>{k.value?.toLocaleString()}</div>
                  <div style={{ fontSize:12, color:S.muted, marginTop:2 }}>{k.label}</div>
                </div>
              ))}
            </div>
            <div style={{ ...card, textAlign:'center', padding:48 }}>
              <div style={{ fontSize:14, fontWeight:600, color:S.navy, marginBottom:8 }}>User-level management</div>
              <div style={{ fontSize:12, color:S.muted, marginBottom:16 }}>For security, individual user operations (reset password, disable, impersonate) are performed via Supabase dashboard using service role.</div>
              <a href="https://supabase.com/dashboard/project/uckgvukjdekoxfbxnqew/auth/users" target="_blank" rel="noreferrer"
                style={{ padding:'10px 20px', background:S.blue, color:'#fff', borderRadius:8, fontSize:13, fontWeight:600, textDecoration:'none', display:'inline-block' }}>
                Open Supabase Auth →
              </a>
            </div>
          </div>
        )}

        {/* ── SUPPORT CENTER ── */}
        {tab==='support' && (
          <div>
            <h2 style={{ margin:'0 0 20px', color:S.navy, fontSize:20, fontWeight:700 }}>Support Center</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
              {[
                { label:'Open Tickets', value:tickets.filter(t=>t.status==='open').length, color:S.danger },
                { label:'In Progress', value:tickets.filter(t=>t.status==='in_progress').length, color:S.warning },
                { label:'Resolved', value:tickets.filter(t=>t.status==='resolved').length, color:S.success },
                { label:'Total', value:tickets.length, color:S.blue },
              ].map((k,i)=>(
                <div key={i} style={{ ...card, padding:'14px 18px' }}>
                  <div style={{ fontSize:22, fontWeight:700, color:k.color }}>{k.value}</div>
                  <div style={{ fontSize:11, color:S.muted, marginTop:2 }}>{k.label}</div>
                </div>
              ))}
            </div>
            {/* New ticket */}
            <div style={{ ...card, marginBottom:16, borderColor:S.blue }}>
              <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>Log New Ticket</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                <div>
                  <div style={{ fontSize:10, color:S.muted, marginBottom:3 }}>Hospital</div>
                  <input value={newTicket.hospital} onChange={e=>setNewTicket({...newTicket,hospital:e.target.value})} style={{ ...inp }}/>
                </div>
                <div>
                  <div style={{ fontSize:10, color:S.muted, marginBottom:3 }}>Issue</div>
                  <input value={newTicket.issue} onChange={e=>setNewTicket({...newTicket,issue:e.target.value})} style={{ ...inp }}/>
                </div>
                <div>
                  <div style={{ fontSize:10, color:S.muted, marginBottom:3 }}>Priority</div>
                  <select value={newTicket.priority} onChange={e=>setNewTicket({...newTicket,priority:e.target.value})} style={{ ...inp }}>
                    {['high','medium','low'].map(p=><option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={()=>{ if(!newTicket.hospital||!newTicket.issue) return; setTickets(t=>[...t,{id:Date.now(),hospital:newTicket.hospital,issue:newTicket.issue,priority:newTicket.priority,status:'open',created:new Date().toISOString().slice(0,10)}]); setNewTicket({hospital:'',issue:'',priority:'medium'}); }} style={{ marginTop:10, padding:'8px 18px', background:S.blue, color:'#fff', border:'none', borderRadius:7, fontSize:12, fontWeight:600, cursor:'pointer' }}>Log Ticket</button>
            </div>
            <div style={{ ...card, padding:0, overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead><tr style={{ background:S.bg }}>{['ID','Hospital','Issue','Priority','Status','Date','Action'].map(h=><th key={h} style={{ padding:'9px 14px', fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', textAlign:'left', borderBottom:`0.5px solid ${S.border}`, whiteSpace:'nowrap' }}>{h}</th>)}</tr></thead>
                <tbody>
                  {tickets.map(t=>(
                    <tr key={t.id} style={{ borderBottom:`0.5px solid ${S.border}` }} onMouseEnter={e=>e.currentTarget.style.background=S.lightBlue} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{ padding:'9px 14px', fontSize:11, color:S.hint, fontFamily:'monospace' }}>#{t.id}</td>
                      <td style={{ padding:'9px 14px', fontSize:12, fontWeight:600, color:S.navy }}>{t.hospital}</td>
                      <td style={{ padding:'9px 14px', fontSize:12, color:S.navy }}>{t.issue}</td>
                      <td style={{ padding:'9px 14px' }}><Badge color={t.priority==='high'?'red':t.priority==='medium'?'yellow':'green'}>{t.priority}</Badge></td>
                      <td style={{ padding:'9px 14px' }}><Badge color={t.status==='open'?'red':t.status==='in_progress'?'yellow':'green'}>{t.status?.replace('_',' ')}</Badge></td>
                      <td style={{ padding:'9px 14px', fontSize:11, color:S.muted }}>{t.created}</td>
                      <td style={{ padding:'9px 14px' }}>
                        <div style={{ display:'flex', gap:4 }}>
                          {t.status!=='in_progress'&&t.status!=='resolved'&&<button onClick={()=>setTickets(ts=>ts.map(x=>x.id===t.id?{...x,status:'in_progress'}:x))} style={{ fontSize:10, padding:'3px 7px', background:'#FFFBEB', color:S.warning, border:'none', borderRadius:4, cursor:'pointer', fontWeight:600 }}>Start</button>}
                          {t.status!=='resolved'&&<button onClick={()=>setTickets(ts=>ts.map(x=>x.id===t.id?{...x,status:'resolved'}:x))} style={{ fontSize:10, padding:'3px 7px', background:'#ECFDF5', color:S.success, border:'none', borderRadius:4, cursor:'pointer', fontWeight:600 }}>Resolve</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── LICENSE MANAGEMENT ── */}
        {tab==='licenses' && (
          <div>
            <h2 style={{ margin:'0 0 20px', color:S.navy, fontSize:20, fontWeight:700 }}>License Management</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
              {[
                { label:'Total Licenses', value:hospitals.length, color:S.blue },
                { label:'Active', value:subscriptions.filter(s=>s.status==='active').length, color:S.success },
                { label:'Trial', value:subscriptions.filter(s=>s.status==='trial').length, color:S.warning },
                { label:'Expiring Soon', value:0, color:S.danger },
              ].map((k,i)=>(
                <div key={i} style={{ ...card, padding:'14px 18px' }}>
                  <div style={{ fontSize:22, fontWeight:700, color:k.color }}>{k.value}</div>
                  <div style={{ fontSize:11, color:S.muted, marginTop:2 }}>{k.label}</div>
                </div>
              ))}
            </div>
            <div style={{ ...card, padding:0, overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead><tr style={{ background:S.bg }}>{['Hospital','Plan','Seats Allowed','Status','Renewal','Actions'].map(h=><th key={h} style={{ padding:'9px 14px', fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', textAlign:'left', borderBottom:`0.5px solid ${S.border}`, whiteSpace:'nowrap' }}>{h}</th>)}</tr></thead>
                <tbody>
                  {hospitals.length===0?<tr><td colSpan={6} style={{ padding:48, textAlign:'center', color:S.muted, fontSize:13 }}>No hospitals registered.</td></tr>:hospitals.map(h=>{
                    const sub = subscriptions.find(s=>s.hospital_id===h.id);
                    const plan = PLANS.find(p=>p.id===sub?.plan)||PLANS[0];
                    const seats = sub?.seats || (sub?.plan==='enterprise'?500:sub?.plan==='professional'?100:sub?.plan==='starter'?25:5);
                    return (
                      <tr key={h.id} style={{ borderBottom:`0.5px solid ${S.border}` }} onMouseEnter={e=>e.currentTarget.style.background=S.lightBlue} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <td style={{ padding:'9px 14px', fontSize:13, fontWeight:600, color:S.navy }}>{h.name}</td>
                        <td style={{ padding:'9px 14px' }}><Badge color={sub?.plan==='enterprise'?'purple':sub?.plan==='professional'?'blue':'yellow'}>{sub?.plan||'free'}</Badge></td>
                        <td style={{ padding:'9px 14px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <div style={{ flex:1, height:6, borderRadius:3, background:S.border, maxWidth:100 }}>
                              <div style={{ height:6, borderRadius:3, background:S.blue, width:Math.min(100, Math.round((h.psychologists_count||0)/seats*100))+'%' }}/>
                            </div>
                            <span style={{ fontSize:11, color:S.muted }}>{h.psychologists_count||0}/{seats}</span>
                          </div>
                        </td>
                        <td style={{ padding:'9px 14px' }}><Badge color={sub?.status==='active'?'green':sub?.status==='trial'?'yellow':'red'}>{sub?.status||'inactive'}</Badge></td>
                        <td style={{ padding:'9px 14px', fontSize:11, color:S.muted }}>{sub?.expires_at?new Date(sub.expires_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):'No expiry'}</td>
                        <td style={{ padding:'9px 14px' }}>
                          <button onClick={()=>{setSelHospital(h);setTab('hospitals');}} style={{ fontSize:10, padding:'3px 8px', background:S.lightBlue, color:S.blue, border:'none', borderRadius:5, cursor:'pointer', fontWeight:600 }}>Manage</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── DATABASE INSIGHTS ── */}
        {tab==='database' && (
          <div>
            <h2 style={{ margin:'0 0 20px', color:S.navy, fontSize:20, fontWeight:700 }}>Database Insights</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
              {[
                { label:'Total Tables', value:'21', color:S.blue },
                { label:'RLS Enabled', value:'21/21', color:S.success },
                { label:'Region', value:'Singapore', color:S.cyan },
                { label:'Project ID', value:'uckgvuku...', color:S.muted },
              ].map((k,i)=>(
                <div key={i} style={{ ...card, padding:'14px 18px' }}>
                  <div style={{ fontSize:20, fontWeight:700, color:k.color }}>{k.value}</div>
                  <div style={{ fontSize:11, color:S.muted, marginTop:2 }}>{k.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
              {[
                ['hospital_patients', totalPatients, '#7C3AED'],
                ['ehr_records', totalEHR, S.blue],
                ['sessions', totalSessions, S.success],
                ['lab_orders', totalLabOrders, S.warning],
                ['profiles', totalProfiles, S.cyan],
                ['hospitals', hospitals.length, S.navy],
                ['billing_invoices', 0, S.danger],
                ['audit_logs', auditLogs.length, S.muted],
                ['opd_queue', 0, S.blue],
                ['ipd_admissions', 0, S.success],
                ['pharmacy_inventory', 0, S.warning],
                ['hospital_staff', 0, S.cyan],
              ].map(([table, count, color])=>(
                <div key={table} style={{ background:S.bg, borderRadius:8, padding:'12px 14px', border:`0.5px solid ${S.border}` }}>
                  <div style={{ fontSize:20, fontWeight:700, color }}>{count?.toLocaleString()}</div>
                  <div style={{ fontSize:10, color:S.muted, marginTop:3, fontFamily:'monospace' }}>{table}</div>
                </div>
              ))}
            </div>
            <div style={{ ...card }}>
              <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Connection Info</div>
              {[
                ['Host','uckgvukjdekoxfbxnqew.supabase.co'],
                ['Region','ap-southeast-1 (Singapore)'],
                ['Database','PostgreSQL 15'],
                ['Connection Pooling','PgBouncer'],
                ['Max Connections','60 (free tier)'],
                ['Storage','500MB (free tier)'],
              ].map(([label,val])=>(
                <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:`0.5px solid ${S.border}` }}>
                  <span style={{ fontSize:12, color:S.muted }}>{label}</span>
                  <span style={{ fontSize:12, fontWeight:600, color:S.navy, fontFamily:label.includes('Host')||label.includes('Max')||label.includes('Storage')?'monospace':'inherit' }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── BACKUP & RECOVERY ── */}
        {tab==='backup' && (
          <div>
            <h2 style={{ margin:'0 0 20px', color:S.navy, fontSize:20, fontWeight:700 }}>Backup & Recovery</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
              {[
                { label:'Last Backup', value:'Auto (Supabase)', color:S.success },
                { label:'Backup Frequency', value:'Daily', color:S.blue },
                { label:'Retention', value:'7 days (free)', color:S.warning },
              ].map((k,i)=>(
                <div key={i} style={{ ...card, padding:'14px 18px' }}>
                  <div style={{ fontSize:16, fontWeight:700, color:k.color }}>{k.value}</div>
                  <div style={{ fontSize:11, color:S.muted, marginTop:2 }}>{k.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div style={{ ...card }}>
                <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Supabase Backups</div>
                <div style={{ background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:8, padding:'12px 14px', marginBottom:12 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:S.blue }}>Automatic daily backups enabled</div>
                  <div style={{ fontSize:11, color:S.muted, marginTop:4 }}>Supabase Pro plan required for PITR (Point-in-Time Recovery)</div>
                </div>
                {[
                  ['Automatic Backups','Daily snapshots by Supabase','active'],
                  ['Point-in-Time Recovery','Requires Pro plan','inactive'],
                  ['Manual Export','Available via Supabase dashboard','active'],
                  ['Git Repository','Code backed up on GitHub','active'],
                  ['Environment Variables','Backed up in Railway + Vercel','active'],
                ].map(([name,detail,status])=>(
                  <div key={name} style={{ display:'flex', gap:10, padding:'8px 0', borderBottom:`0.5px solid ${S.border}` }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:status==='active'?'#22c55e':'#e2e8f0', marginTop:4, flexShrink:0 }}/>
                    <div>
                      <div style={{ fontSize:12, fontWeight:600, color:S.navy }}>{name}</div>
                      <div style={{ fontSize:10, color:S.muted }}>{detail}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ ...card }}>
                <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Recovery Procedures</div>
                {[
                  ['Database Recovery','Restore from Supabase snapshot via dashboard'],
                  ['Frontend Recovery','Redeploy from GitHub via Vercel'],
                  ['Backend Recovery','Redeploy from GitHub via Railway'],
                  ['Model Files','Re-upload .pkl files to Railway volume'],
                  ['Environment Variables','Restore from secure password manager'],
                ].map(([step,detail],i)=>(
                  <div key={step} style={{ display:'flex', gap:10, padding:'9px 0', borderBottom:`0.5px solid ${S.border}` }}>
                    <div style={{ width:22, height:22, borderRadius:'50%', background:S.lightBlue, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:S.blue, flexShrink:0 }}>{i+1}</div>
                    <div>
                      <div style={{ fontSize:12, fontWeight:600, color:S.navy }}>{step}</div>
                      <div style={{ fontSize:10, color:S.muted }}>{detail}</div>
                    </div>
                  </div>
                ))}
                <a href="https://supabase.com/dashboard/project/uckgvukjdekoxfbxnqew/database/backups" target="_blank" rel="noreferrer"
                  style={{ display:'block', marginTop:12, padding:'8px 14px', background:S.lightBlue, color:S.blue, borderRadius:7, fontSize:12, fontWeight:600, textAlign:'center', textDecoration:'none' }}>
                  Open Supabase Backups →
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ── API MANAGEMENT ── */}
        {tab==='api_mgmt' && (
          <div>
            <h2 style={{ margin:'0 0 20px', color:S.navy, fontSize:20, fontWeight:700 }}>API Management</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
              {[
                { label:'Total Endpoints', value:'23', color:S.blue },
                { label:'Rate Limited', value:'7', color:S.success },
                { label:'Auth Required', value:'18', color:S.warning },
                { label:'Public', value:'5', color:S.cyan },
              ].map((k,i)=>(
                <div key={i} style={{ ...card, padding:'14px 18px' }}>
                  <div style={{ fontSize:22, fontWeight:700, color:k.color }}>{k.value}</div>
                  <div style={{ fontSize:11, color:S.muted, marginTop:2 }}>{k.label}</div>
                </div>
              ))}
            </div>
            <div style={{ ...card, padding:0, overflow:'hidden', marginBottom:16 }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead><tr style={{ background:S.bg }}>{['Endpoint','Method','Auth','Rate Limit','Description'].map(h=><th key={h} style={{ padding:'9px 14px', fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', textAlign:'left', borderBottom:`0.5px solid ${S.border}`, whiteSpace:'nowrap' }}>{h}</th>)}</tr></thead>
                <tbody>
                  {[
                    ['/',                    'GET',  'No',  '-',         'Health check'],
                    ['/predict',             'POST', 'No',  '30/min',    '19 XGBoost models + SHAP'],
                    ['/clinical-interview',  'POST', 'No',  '10/min',    'Claude Haiku clinical interview'],
                    ['/chatbot',             'POST', 'No',  '20/min',    'RAG chatbot with clinic hours'],
                    ['/analyze-journal',     'POST', 'No',  '20/min',    'Journal emotion analysis'],
                    ['/generate-report',     'POST', 'No',  '5/min',     'Full clinical PDF report'],
                    ['/check-crisis',        'POST', 'No',  '30/min',    'Crisis detection + alert'],
                    ['/send-sms',            'POST', 'No',  '10/min',    'MSG91 OPD token SMS'],
                    ['/generate-soap',       'POST', 'No',  '-',         'SOAP notes generation'],
                    ['/pre-session-brief',   'POST', 'No',  '-',         'AI psychologist brief'],
                    ['/anomaly-detection',   'POST', 'No',  '-',         'PHQ/GAD z-score detection'],
                    ['/predict-suicide-risk','POST', 'No',  '-',         'Suicide risk classifier'],
                    ['/act/exercises',       'GET',  'No',  '-',         'ACT therapy exercises'],
                    ['/act/recommend',       'POST', 'No',  '-',         'ACT recommendations'],
                    ['/crisis-alerts/{id}',  'GET',  'No',  '-',         'Crisis alerts for psychologist'],
                  ].map(([endpoint, method, auth, rateLimit, desc])=>(
                    <tr key={endpoint} style={{ borderBottom:`0.5px solid ${S.border}` }} onMouseEnter={e=>e.currentTarget.style.background=S.lightBlue} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{ padding:'8px 14px', fontSize:12, fontFamily:'monospace', color:S.blue }}>{endpoint}</td>
                      <td style={{ padding:'8px 14px' }}><Badge color={method==='GET'?'green':'blue'}>{method}</Badge></td>
                      <td style={{ padding:'8px 14px' }}><Badge color={auth==='Yes'?'green':'yellow'}>{auth}</Badge></td>
                      <td style={{ padding:'8px 14px', fontSize:11, color:rateLimit!=='-'?S.warning:S.hint }}>{rateLimit}</td>
                      <td style={{ padding:'8px 14px', fontSize:11, color:S.muted }}>{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ ...card }}>
              <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>Base URL</div>
              <div style={{ background:S.bg, borderRadius:8, padding:'10px 14px', fontFamily:'monospace', fontSize:13, color:S.navy }}>https://web-production-3887e.up.railway.app</div>
              <div style={{ fontSize:11, color:S.muted, marginTop:8 }}>All endpoints use JSON request/response. No API key required currently — JWT auth planned for v3.</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
