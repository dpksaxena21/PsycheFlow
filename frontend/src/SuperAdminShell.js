import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

// Tab components
import SADashboard from './SA_Dashboard';
import SAHospitals from './SA_Hospitals';
import SASubscriptions from './SA_Subscriptions';
import SAUsers from './SA_Users';
import SARevenue from './SA_Revenue';
import SAAnalytics from './SA_Analytics';
import SAAIMonitor from './SA_AIMonitor';
import SASystemHealth from './SA_SystemHealth';
import SASecurity from './SA_Security';
import SAFeatureFlags from './SA_FeatureFlags';
import SAComms from './SA_Comms';
import SACompliance from './SA_Compliance';
import SAAudit from './SA_Audit';
import SASupport from './SA_Support';
import SALicenses from './SA_Licenses';
import SADatabase from './SA_Database';
import SACustomerSuccess from './SA_CustomerSuccess';
import SAMarketplace from './SA_Marketplace';
import SAAIGovernance from './SA_AIGovernance';
import SAFinanceOps from './SA_FinanceOps';

export const S = { blue:'#1D4ED8', navy:'#0C1A2E', bg:'#F8FAFF', card:'#FFFFFF', border:'#E2EBF6', muted:'#3B5998', hint:'#94a3b8', lightBlue:'#EFF6FF', success:'#059669', danger:'#DC2626', warning:'#D97706', cyan:'#0891B2', purple:'#7C3AED' };
export const card = { background:S.card, borderRadius:12, border:`0.5px solid ${S.border}`, boxShadow:'0 1px 4px rgba(29,78,216,0.06)', padding:24 };
export const Badge = ({ color, children }) => <span style={{ padding:'2px 10px', borderRadius:100, fontSize:11, fontWeight:600, background:color==='red'?'#FEF2F2':color==='yellow'?'#FFFBEB':color==='green'?'#ECFDF5':color==='purple'?'#F5F3FF':color==='cyan'?'#ECFEFF':'#EFF6FF', color:color==='red'?S.danger:color==='yellow'?S.warning:color==='green'?S.success:color==='purple'?S.purple:color==='cyan'?S.cyan:S.blue }}>{children}</span>;
export const inp = { width:'100%', padding:'9px 12px', borderRadius:8, border:`0.5px solid ${S.border}`, fontSize:13, outline:'none', background:S.bg, color:S.navy, boxSizing:'border-box', fontFamily:"'Satoshi',-apple-system,sans-serif" };
export const KPICard = ({ label, value, sub, color, onClick }) => (
  <div onClick={onClick} style={{ ...card, borderLeft:`3px solid ${color}`, padding:'16px 20px', cursor:onClick?'pointer':'default' }}
    onMouseEnter={e=>onClick&&(e.currentTarget.style.transform='translateY(-2px)')}
    onMouseLeave={e=>onClick&&(e.currentTarget.style.transform='')}>
    <div style={{ fontSize:26, fontWeight:700, color, letterSpacing:'-0.02em' }}>{value}</div>
    <div style={{ fontSize:12, fontWeight:600, color:S.navy, marginTop:3 }}>{label}</div>
    {sub && <div style={{ fontSize:10, color:S.muted, marginTop:2 }}>{sub}</div>}
  </div>
);

const TABS = [
  { id:'dashboard', label:'Dashboard', group:'overview' },
  { id:'hospitals', label:'Hospitals', group:'customers' },
  { id:'customer_success', label:'Customer Success', group:'customers' },
  { id:'subscriptions', label:'Subscriptions', group:'revenue' },
  { id:'revenue', label:'Revenue', group:'revenue' },
  { id:'finance', label:'Finance Ops', group:'revenue' },
  { id:'users', label:'Users', group:'platform' },
  { id:'analytics', label:'Analytics', group:'platform' },
  { id:'ai_monitor', label:'AI Monitor', group:'platform' },
  { id:'ai_governance', label:'AI Governance', group:'platform' },
  { id:'system_health', label:'System Health', group:'ops' },
  { id:'security', label:'Security', group:'ops' },
  { id:'feature_flags', label:'Feature Flags', group:'ops' },
  { id:'comms', label:'Comms', group:'ops' },
  { id:'compliance', label:'Compliance', group:'legal' },
  { id:'audit', label:'Audit Logs', group:'legal' },
  { id:'support', label:'Support', group:'service' },
  { id:'licenses', label:'Licenses', group:'service' },
  { id:'database', label:'Database', group:'service' },
  { id:'marketplace', label:'Marketplace', group:'service' },
];

export default function SuperAdminShell({ onLogout }) {
  const [tab, setTab] = useState('dashboard');
  const [systemStatus, setSystemStatus] = useState({ railway:'checking', supabase:'checking' });
  const [sharedData, setSharedData] = useState({
    hospitals: [], subscriptions: [], auditLogs: [],
    totalPatients: 0, totalProfiles: 0, totalSessions: 0,
    totalEHR: 0, totalLabOrders: 0, loading: true
  });

  useEffect(() => { loadSharedData(); checkHealth(); }, []);

  const loadSharedData = async () => {
    const [
      { data: hosp }, { data: subs }, { data: logs },
      { count: pat }, { count: prof }, { count: sess },
      { count: ehr }, { count: lab },
    ] = await Promise.all([
      supabase.from('hospitals').select('*').order('created_at', { ascending: false }),
      supabase.from('hospital_subscriptions').select('*, hospitals(name, city)'),
      supabase.from('superadmin_audit_logs').select('*').order('created_at', { ascending: false }).limit(200),
      supabase.from('hospital_patients').select('*', { count:'exact', head:true }),
      supabase.from('profiles').select('*', { count:'exact', head:true }),
      supabase.from('sessions').select('*', { count:'exact', head:true }),
      supabase.from('ehr_records').select('*', { count:'exact', head:true }),
      supabase.from('lab_orders').select('*', { count:'exact', head:true }),
    ]);
    setSharedData({ hospitals:hosp||[], subscriptions:subs||[], auditLogs:logs||[], totalPatients:pat||0, totalProfiles:prof||0, totalSessions:sess||0, totalEHR:ehr||0, totalLabOrders:lab||0, loading:false });
  };

  const checkHealth = async () => {
    try { const r = await fetch('https://web-production-3887e.up.railway.app/', { signal:AbortSignal.timeout(5000) }); setSystemStatus(s=>({...s, railway:r.ok?'healthy':'degraded'})); } catch { setSystemStatus(s=>({...s, railway:'down'})); }
    try { const { error } = await supabase.from('hospitals').select('id').limit(1); setSystemStatus(s=>({...s, supabase:error?'degraded':'healthy'})); } catch { setSystemStatus(s=>({...s, supabase:'down'})); }
  };

  const logAction = async (action, resourceType, resourceId) => {
    await supabase.from('superadmin_audit_logs').insert({ actor_email:'dpksaxena21@gmail.com', action, resource_type:resourceType, resource_id:resourceId });
    loadSharedData();
  };

  const props = { ...sharedData, systemStatus, logAction, reload:loadSharedData, setTab, S, card, Badge, inp, KPICard };

  const COMPONENTS = {
    dashboard: SADashboard, hospitals: SAHospitals, subscriptions: SASubscriptions,
    users: SAUsers, revenue: SARevenue, analytics: SAAnalytics,
    ai_monitor: SAAIMonitor, system_health: SASystemHealth, security: SASecurity,
    feature_flags: SAFeatureFlags, comms: SAComms, compliance: SACompliance,
    audit: SAAudit, support: SASupport, licenses: SALicenses, database: SADatabase,
    customer_success: SACustomerSuccess, marketplace: SAMarketplace,
    ai_governance: SAAIGovernance, finance: SAFinanceOps,
  };

  const ActiveTab = COMPONENTS[tab] || SADashboard;

  return (
    <div style={{ fontFamily:"'Satoshi',-apple-system,sans-serif", background:S.bg, minHeight:'100vh' }}>
      <div style={{ background:S.navy, padding:'0 24px', display:'flex', alignItems:'center', borderBottom:'0.5px solid rgba(255,255,255,0.08)', position:'sticky', top:0, zIndex:100 }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 0', marginRight:20, borderRight:'0.5px solid rgba(255,255,255,0.1)', paddingRight:20, flexShrink:0 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:'linear-gradient(135deg,#1D4ED8,#0891B2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C9 1.5 4 5 4 10C4 12.8 6.2 15 9 15C11.8 15 14 12.8 14 10C14 5 9 1.5 9 1.5Z" fill="white" opacity="0.9"/><circle cx="9" cy="10" r="2.2" fill="#0C1A2E"/></svg>
          </div>
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:'#fff' }}><span style={{ color:'#93C5FD' }}>Psyche</span>Flow HQ</div>
            <div style={{ fontSize:8, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Super Admin</div>
          </div>
        </div>
        {/* Tabs */}
        <div style={{ display:'flex', gap:0, flex:1, overflowX:'auto', WebkitOverflowScrolling:'touch', minWidth:0 }}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{ padding:'14px 10px', border:'none', background:'transparent', fontSize:11, fontWeight:tab===t.id?700:400, color:tab===t.id?'#fff':'rgba(255,255,255,0.4)', cursor:'pointer', borderBottom:tab===t.id?`2px solid ${S.blue}`:'2px solid transparent', whiteSpace:'nowrap', transition:'all 0.15s', flexShrink:0 }}>
              {t.label}
            </button>
          ))}
        </div>
        {/* Status + logout */}
        <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0, marginLeft:12 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:Object.values(systemStatus).every(s=>s==='healthy')?'#22c55e':'#ef4444' }} title="System status"/>
          <button onClick={onLogout} style={{ padding:'5px 12px', background:'rgba(255,255,255,0.08)', border:'none', borderRadius:6, fontSize:11, color:'rgba(255,255,255,0.6)', cursor:'pointer' }}>Sign out</button>
        </div>
      </div>
      <div style={{ padding:'24px 28px', maxWidth:1400, margin:'0 auto' }}>
        {sharedData.loading ? <div style={{ textAlign:'center', padding:80, color:S.muted }}>Loading platform data...</div> : <ActiveTab {...props} />}
      </div>
      <style>{`
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(29,78,216,0.2);border-radius:10px}
        ::-webkit-scrollbar-thumb:hover{background:rgba(29,78,216,0.4)}
      `}</style>
    </div>
  );
}
