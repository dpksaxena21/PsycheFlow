import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

const S = { blue:'#1D4ED8', navy:'#0C1A2E', bg:'#F8FAFF', card:'#FFFFFF', border:'#E2EBF6', muted:'#3B5998', hint:'#94a3b8', lightBlue:'#EFF6FF', success:'#059669', danger:'#DC2626', warning:'#D97706' };
const card = { background:S.card, borderRadius:12, border:`0.5px solid ${S.border}`, boxShadow:'0 1px 4px rgba(29,78,216,0.06)', padding:24 };
const Badge = ({ color, children }) => <span style={{ padding:'2px 10px', borderRadius:100, fontSize:11, fontWeight:600, background:color==='red'?'#FEF2F2':color==='yellow'?'#FFFBEB':color==='green'?'#ECFDF5':'#EFF6FF', color:color==='red'?S.danger:color==='yellow'?S.warning:color==='green'?S.success:S.blue }}>{children}</span>;

export default function SuperAdmin({ onLogout }) {
  const [tab, setTab] = useState('dashboard');
  const [hospitals, setHospitals] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selHospital, setSelHospital] = useState(null);
  const [totalPatients, setTotalPatients] = useState(0);
  const [totalPsychologists, setTotalPsychologists] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    const [
      { data: hosp },
      { data: subs },
      { data: logs },
      { count: patCount },
      { count: psychCount },
      { count: sessCount },
    ] = await Promise.all([
      supabase.from('hospitals').select('*, hospital_staff(count)').order('created_at', { ascending: false }),
      supabase.from('hospital_subscriptions').select('*, hospitals(name, city)'),
      supabase.from('superadmin_audit_logs').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('hospital_patients').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('sessions').select('*', { count: 'exact', head: true }),
    ]);
    setHospitals(hosp || []);
    setSubscriptions(subs || []);
    setAuditLogs(logs || []);
    setTotalPatients(patCount || 0);
    setTotalPsychologists(psychCount || 0);
    setTotalSessions(sessCount || 0);
    setLoading(false);
  };

  const updateSubscription = async (hospitalId, plan, status) => {
    const existing = subscriptions.find(s => s.hospital_id === hospitalId);
    if (existing) {
      await supabase.from('hospital_subscriptions').update({ plan, status, updated_at: new Date().toISOString() }).eq('hospital_id', hospitalId);
    } else {
      await supabase.from('hospital_subscriptions').insert({ hospital_id: hospitalId, plan, status });
    }
    await supabase.from('superadmin_audit_logs').insert({ actor_email: 'dpksaxena21@gmail.com', action: `Updated subscription: ${plan}/${status}`, resource_type: 'hospital', resource_id: hospitalId });
    await loadAll();
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'hospitals', label: 'Hospitals' },
    { id: 'subscriptions', label: 'Subscriptions' },
    { id: 'users', label: 'Users' },
    { id: 'audit', label: 'Audit Logs' },
  ];

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', fontFamily:"'Satoshi',-apple-system,sans-serif", color:S.muted }}>Loading PsycheFlow HQ...</div>;

  return (
    <div style={{ fontFamily:"'Satoshi',-apple-system,sans-serif", background:S.bg, minHeight:'100vh' }}>
      {/* Header */}
      <div style={{ background:S.navy, padding:'0 32px', display:'flex', alignItems:'center', gap:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 0', marginRight:32, borderRight:'0.5px solid rgba(255,255,255,0.1)', paddingRight:32 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:S.blue, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C9 1.5 4 5 4 10C4 12.8 6.2 15 9 15C11.8 15 14 12.8 14 10C14 5 9 1.5 9 1.5Z" fill="white" opacity="0.9"/><circle cx="9" cy="10" r="2.2" fill="#0C1A2E"/></svg>
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:'#fff' }}>PsycheFlow HQ</div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.5)' }}>Super Admin</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:0, flex:1, overflowX:'auto' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding:'18px 16px', border:'none', background:'transparent', fontSize:13, fontWeight:tab===t.id?700:400, color:tab===t.id?'#fff':'rgba(255,255,255,0.5)', cursor:'pointer', borderBottom:tab===t.id?'2px solid '+S.blue:'2px solid transparent', whiteSpace:'nowrap' }}>
              {t.label}
            </button>
          ))}
        </div>
        <button onClick={onLogout} style={{ padding:'8px 16px', background:'rgba(255,255,255,0.1)', border:'none', borderRadius:8, fontSize:12, color:'rgba(255,255,255,0.7)', cursor:'pointer' }}>Sign out</button>
      </div>

      <div style={{ padding:'28px 32px', maxWidth:1200, margin:'0 auto' }}>

        {/* DASHBOARD */}
        {tab === 'dashboard' && (
          <div>
            <div style={{ marginBottom:24 }}>
              <h1 style={{ margin:0, fontSize:22, fontWeight:700, color:S.navy }}>PsycheFlow Command Center</h1>
              <div style={{ fontSize:12, color:S.muted, marginTop:4 }}>Platform-wide overview · {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</div>
            </div>

            {/* KPI Grid */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
              {[
                { label:'Total Hospitals', value:hospitals.length, sub:`${hospitals.filter(h=>subscriptions.find(s=>s.hospital_id===h.id&&s.status==='active')).length} active`, color:S.blue },
                { label:'Platform Patients', value:totalPatients.toLocaleString(), sub:'Hospital registry', color:'#7C3AED' },
                { label:'Psychologists', value:totalPsychologists.toLocaleString(), sub:'Registered profiles', color:S.success },
                { label:'Total Sessions', value:totalSessions.toLocaleString(), sub:'AI assessments', color:S.warning },
              ].map((k,i) => (
                <div key={i} style={{ ...card, borderLeft:`3px solid ${k.color}` }}>
                  <div style={{ fontSize:28, fontWeight:700, color:k.color, letterSpacing:'-0.02em' }}>{k.value}</div>
                  <div style={{ fontSize:13, fontWeight:600, color:S.navy, marginTop:2 }}>{k.label}</div>
                  <div style={{ fontSize:11, color:S.muted, marginTop:2 }}>{k.sub}</div>
                </div>
              ))}
            </div>

            {/* Hospital list preview */}
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:16 }}>
              <div style={{ ...card }}>
                <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:16 }}>Registered Hospitals</div>
                {hospitals.slice(0,6).map(h => {
                  const sub = subscriptions.find(s => s.hospital_id === h.id);
                  return (
                    <div key={h.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:`0.5px solid ${S.border}` }}>
                      <div style={{ width:36, height:36, borderRadius:9, background:S.lightBlue, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:S.blue, flexShrink:0 }}>{h.name?.charAt(0)}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:600, color:S.navy }}>{h.name}</div>
                        <div style={{ fontSize:11, color:S.muted }}>{h.city} · {h.hospital_code}</div>
                      </div>
                      <Badge color={sub?.status==='active'?'green':sub?.status==='trial'?'yellow':'red'}>{sub?.plan||'free'}</Badge>
                    </div>
                  );
                })}
                {hospitals.length === 0 && <div style={{ textAlign:'center', padding:32, color:S.muted, fontSize:13 }}>No hospitals registered yet.</div>}
              </div>
              <div style={{ ...card }}>
                <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:16 }}>Recent Audit Logs</div>
                {auditLogs.slice(0,6).map(log => (
                  <div key={log.id} style={{ padding:'8px 0', borderBottom:`0.5px solid ${S.border}` }}>
                    <div style={{ fontSize:12, color:S.navy, fontWeight:500 }}>{log.action}</div>
                    <div style={{ fontSize:10, color:S.muted, marginTop:2 }}>{log.actor_email} · {new Date(log.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</div>
                  </div>
                ))}
                {auditLogs.length === 0 && <div style={{ textAlign:'center', padding:32, color:S.muted, fontSize:13 }}>No audit logs yet.</div>}
              </div>
            </div>
          </div>
        )}

        {/* HOSPITALS */}
        {tab === 'hospitals' && (
          <div>
            <h2 style={{ margin:'0 0 20px', color:S.navy, fontSize:20, fontWeight:700 }}>All Hospitals ({hospitals.length})</h2>
            <div style={{ ...card, padding:0, overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:S.bg }}>
                    {['Hospital','City','Code','Admin','Staff','Plan','Status','Actions'].map(h => (
                      <th key={h} style={{ padding:'10px 14px', fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', textAlign:'left', borderBottom:`0.5px solid ${S.border}`, whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {hospitals.length === 0 ? (
                    <tr><td colSpan={8} style={{ padding:48, textAlign:'center', color:S.muted, fontSize:13 }}>No hospitals yet.</td></tr>
                  ) : hospitals.map(h => {
                    const sub = subscriptions.find(s => s.hospital_id === h.id);
                    return (
                      <tr key={h.id} style={{ borderBottom:`0.5px solid ${S.border}` }}
                        onMouseEnter={e => e.currentTarget.style.background = S.lightBlue}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding:'10px 14px' }}>
                          <div style={{ fontSize:13, fontWeight:600, color:S.navy }}>{h.name}</div>
                          <div style={{ fontSize:10, color:S.muted }}>{h.nabh_accredited ? 'NABH Accredited' : 'Not accredited'}</div>
                        </td>
                        <td style={{ padding:'10px 14px', fontSize:12, color:S.navy }}>{h.city}</td>
                        <td style={{ padding:'10px 14px', fontSize:12, fontWeight:700, color:S.blue }}>{h.hospital_code}</td>
                        <td style={{ padding:'10px 14px', fontSize:12, color:S.muted }}>{h.admin_name}</td>
                        <td style={{ padding:'10px 14px', fontSize:12, color:S.navy }}>{h.psychologists_count || 0}</td>
                        <td style={{ padding:'10px 14px' }}><Badge color={sub?.plan==='enterprise'?'blue':sub?.plan==='pro'?'green':'yellow'}>{sub?.plan || 'free'}</Badge></td>
                        <td style={{ padding:'10px 14px' }}><Badge color={sub?.status==='active'?'green':sub?.status==='trial'?'yellow':'red'}>{sub?.status || 'unsubscribed'}</Badge></td>
                        <td style={{ padding:'10px 14px' }}>
                          <div style={{ display:'flex', gap:4 }}>
                            <button onClick={() => setSelHospital(h)} style={{ fontSize:10, padding:'3px 8px', background:S.lightBlue, color:S.blue, border:'none', borderRadius:5, cursor:'pointer', fontWeight:600 }}>Manage</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Hospital management drawer */}
            {selHospital && (
              <div style={{ position:'fixed', top:0, right:0, width:380, height:'100vh', background:S.card, borderLeft:`0.5px solid ${S.border}`, boxShadow:'-4px 0 24px rgba(0,0,0,0.1)', zIndex:300, overflowY:'auto' }}>
                <div style={{ padding:'16px 20px', borderBottom:`0.5px solid ${S.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ fontSize:14, fontWeight:700, color:S.navy }}>{selHospital.name}</div>
                  <button onClick={() => setSelHospital(null)} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:S.muted }}>×</button>
                </div>
                <div style={{ padding:20 }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
                    {[['City', selHospital.city], ['Code', selHospital.hospital_code], ['Admin', selHospital.admin_name], ['NABH', selHospital.nabh_accredited ? 'Yes' : 'No']].map(([l,v]) => (
                      <div key={l} style={{ background:S.bg, borderRadius:8, padding:'10px 12px' }}>
                        <div style={{ fontSize:9, fontWeight:700, color:S.muted, textTransform:'uppercase', marginBottom:2 }}>{l}</div>
                        <div style={{ fontSize:13, fontWeight:600, color:S.navy }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', marginBottom:10 }}>Subscription Management</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:16 }}>
                    {[['free','Free'],['basic','Basic'],['pro','Pro'],['enterprise','Enterprise']].map(([val,label]) => (
                      <button key={val} onClick={() => updateSubscription(selHospital.id, val, 'active')}
                        style={{ padding:'10px', background: subscriptions.find(s=>s.hospital_id===selHospital.id)?.plan===val ? S.blue : S.bg, color: subscriptions.find(s=>s.hospital_id===selHospital.id)?.plan===val ? '#fff' : S.navy, border:`0.5px solid ${S.border}`, borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer' }}>
                        {label}
                      </button>
                    ))}
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                    {[['active','Activate'],['suspended','Suspend'],['trial','Set Trial'],['cancelled','Cancel']].map(([val,label]) => (
                      <button key={val} onClick={() => updateSubscription(selHospital.id, subscriptions.find(s=>s.hospital_id===selHospital.id)?.plan||'free', val)}
                        style={{ padding:'10px', background: val==='suspended'||val==='cancelled' ? '#FEF2F2' : val==='trial' ? '#FFFBEB' : '#ECFDF5', color: val==='suspended'||val==='cancelled' ? S.danger : val==='trial' ? S.warning : S.success, border:'none', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer' }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUBSCRIPTIONS */}
        {tab === 'subscriptions' && (
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
              {[
                { label:'Enterprise', value:subscriptions.filter(s=>s.plan==='enterprise').length, color:S.blue },
                { label:'Pro', value:subscriptions.filter(s=>s.plan==='pro').length, color:S.success },
                { label:'Basic', value:subscriptions.filter(s=>s.plan==='basic').length, color:S.warning },
                { label:'Free', value:subscriptions.filter(s=>s.plan==='free'||!s.plan).length + (hospitals.length - subscriptions.length), color:S.muted },
              ].map((k,i) => (
                <div key={i} style={{ ...card }}>
                  <div style={{ fontSize:24, fontWeight:700, color:k.color }}>{k.value}</div>
                  <div style={{ fontSize:12, color:S.muted, marginTop:2 }}>{k.label} plan</div>
                </div>
              ))}
            </div>
            <div style={{ ...card, padding:0, overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:S.bg }}>
                    {['Hospital','City','Plan','Status','Seats','Cost/mo','Trial Ends','Created'].map(h => (
                      <th key={h} style={{ padding:'10px 14px', fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', textAlign:'left', borderBottom:`0.5px solid ${S.border}`, whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.length === 0 ? (
                    <tr><td colSpan={8} style={{ padding:48, textAlign:'center', color:S.muted, fontSize:13 }}>No subscriptions yet.</td></tr>
                  ) : subscriptions.map(s => (
                    <tr key={s.id} style={{ borderBottom:`0.5px solid ${S.border}` }}
                      onMouseEnter={e => e.currentTarget.style.background = S.lightBlue}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding:'10px 14px', fontSize:13, fontWeight:600, color:S.navy }}>{s.hospitals?.name}</td>
                      <td style={{ padding:'10px 14px', fontSize:12, color:S.muted }}>{s.hospitals?.city}</td>
                      <td style={{ padding:'10px 14px' }}><Badge color={s.plan==='enterprise'?'blue':s.plan==='pro'?'green':'yellow'}>{s.plan}</Badge></td>
                      <td style={{ padding:'10px 14px' }}><Badge color={s.status==='active'?'green':s.status==='trial'?'yellow':'red'}>{s.status}</Badge></td>
                      <td style={{ padding:'10px 14px', fontSize:12, color:S.navy }}>{s.seats}</td>
                      <td style={{ padding:'10px 14px', fontSize:12, fontWeight:600, color:S.navy }}>{s.monthly_cost > 0 ? '₹'+s.monthly_cost : 'Free'}</td>
                      <td style={{ padding:'10px 14px', fontSize:11, color:S.muted }}>{s.trial_ends_at ? new Date(s.trial_ends_at).toLocaleDateString('en-IN', { day:'numeric', month:'short' }) : '-'}</td>
                      <td style={{ padding:'10px 14px', fontSize:11, color:S.muted }}>{new Date(s.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* USERS */}
        {tab === 'users' && (
          <div>
            <h2 style={{ margin:'0 0 20px', color:S.navy, fontSize:20, fontWeight:700 }}>Platform Users</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
              {[
                { label:'Total Profiles', value:totalPsychologists, color:S.blue },
                { label:'Hospital Patients', value:totalPatients, color:'#7C3AED' },
                { label:'AI Sessions', value:totalSessions, color:S.success },
              ].map((k,i) => (
                <div key={i} style={{ ...card }}>
                  <div style={{ fontSize:28, fontWeight:700, color:k.color }}>{k.value?.toLocaleString()}</div>
                  <div style={{ fontSize:12, color:S.muted, marginTop:2 }}>{k.label}</div>
                </div>
              ))}
            </div>
            <div style={{ ...card, textAlign:'center', padding:40, color:S.muted, fontSize:13 }}>
              Detailed user management requires service role access. Use Supabase dashboard for user-level operations.
            </div>
          </div>
        )}

        {/* AUDIT LOGS */}
        {tab === 'audit' && (
          <div>
            <h2 style={{ margin:'0 0 20px', color:S.navy, fontSize:20, fontWeight:700 }}>Audit Logs ({auditLogs.length})</h2>
            <div style={{ ...card, padding:0, overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:S.bg }}>
                    {['Time','Actor','Action','Resource','Resource ID'].map(h => (
                      <th key={h} style={{ padding:'10px 14px', fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', textAlign:'left', borderBottom:`0.5px solid ${S.border}`, whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding:48, textAlign:'center', color:S.muted, fontSize:13 }}>No audit logs yet.</td></tr>
                  ) : auditLogs.map(log => (
                    <tr key={log.id} style={{ borderBottom:`0.5px solid ${S.border}` }}
                      onMouseEnter={e => e.currentTarget.style.background = S.lightBlue}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding:'10px 14px', fontSize:11, color:S.muted, whiteSpace:'nowrap' }}>{new Date(log.created_at).toLocaleString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</td>
                      <td style={{ padding:'10px 14px', fontSize:12, color:S.navy }}>{log.actor_email}</td>
                      <td style={{ padding:'10px 14px', fontSize:12, fontWeight:500, color:S.navy }}>{log.action}</td>
                      <td style={{ padding:'10px 14px' }}>{log.resource_type && <Badge color="blue">{log.resource_type}</Badge>}</td>
                      <td style={{ padding:'10px 14px', fontSize:11, color:S.muted, fontFamily:'monospace' }}>{log.resource_id?.slice(0,8) || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
