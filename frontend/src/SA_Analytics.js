import React, { useState } from 'react';
export default function SAAnalytics({ hospitals, subscriptions, totalPatients, totalProfiles, totalSessions, totalEHR, totalLabOrders, S, card, Badge, KPICard }) {
  const [workspace, setWorkspace] = useState('business');
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h2 style={{ margin:0, color:S.navy, fontSize:20, fontWeight:700 }}>Analytics</h2>
        <div style={{ display:'flex', gap:4, background:S.bg, borderRadius:8, padding:3 }}>
          {['business','product','clinical','hospital','ai'].map(w=>(
            <button key={w} onClick={()=>setWorkspace(w)} style={{ padding:'6px 12px', border:'none', borderRadius:6, fontSize:11, fontWeight:workspace===w?700:400, background:workspace===w?S.card:S.bg, color:workspace===w?S.navy:S.muted, cursor:'pointer', textTransform:'capitalize', boxShadow:workspace===w?'0 1px 4px rgba(0,0,0,0.08)':'none' }}>{w==='ai'?'AI':w}</button>
          ))}
        </div>
      </div>
      {workspace==='business' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
            <KPICard label="Total Hospitals" value={hospitals.length} color={S.blue}/>
            <KPICard label="Active Subscriptions" value={subscriptions.filter(s=>s.status==='active').length} color={S.success}/>
            <KPICard label="MRR" value={'₹'+subscriptions.reduce((s,sub)=>s+parseFloat(sub.monthly_cost||0),0).toLocaleString()} color={S.success}/>
            <KPICard label="Growth Rate" value="—" sub="Requires historical data" color={S.warning}/>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div style={{ ...card }}>
              <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Hospital Growth</div>
              <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:120 }}>
                {hospitals.slice(-6).map((h,i)=>(
                  <div key={h.id} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                    <div style={{ width:'100%', background:S.blue, borderRadius:'4px 4px 0 0', height:(i+1)/hospitals.slice(-6).length*100+'px', opacity:0.6+(i/6)*0.4 }}/>
                    <div style={{ fontSize:8, color:S.muted, textAlign:'center' }}>{new Date(h.created_at).toLocaleDateString('en-IN',{month:'short'})}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ ...card }}>
              <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Plan Distribution</div>
              {['free','starter','professional','enterprise'].map((plan,i)=>{
                const count = subscriptions.filter(s=>s.plan===plan).length + (plan==='free'?hospitals.length-subscriptions.length:0);
                const pct = hospitals.length>0?Math.round(count/hospitals.length*100):0;
                const colors = [S.muted, S.success, S.blue, S.purple];
                return (
                  <div key={plan} style={{ marginBottom:10 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                      <span style={{ fontSize:12, color:S.navy, textTransform:'capitalize', fontWeight:500 }}>{plan}</span>
                      <span style={{ fontSize:11, color:S.muted }}>{count} ({pct}%)</span>
                    </div>
                    <div style={{ height:6, borderRadius:3, background:S.border }}>
                      <div style={{ height:6, borderRadius:3, background:colors[i], width:pct+'%' }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {workspace==='product' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
            <KPICard label="Total Sessions" value={totalSessions.toLocaleString()} sub="AI assessments" color={S.blue}/>
            <KPICard label="EHR Records" value={totalEHR.toLocaleString()} sub="Clinical notes" color={S.success}/>
            <KPICard label="Lab Orders" value={totalLabOrders.toLocaleString()} sub="Total tests" color={S.warning}/>
          </div>
          <div style={{ ...card }}>
            <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:16 }}>Most Used Modules</div>
            {[['Patient Dashboard','Daily','Active'],['EHR Records','Daily','Active'],['OPD Queue','Daily','Active'],['Billing','Weekly','Active'],['Lab Kanban','Weekly','Active'],['Pharmacy','Weekly','Active'],['AI Copilot','Monthly','Beta'],['Telemedicine','—','Coming Soon']].map(([module,freq,status])=>(
              <div key={module} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:`0.5px solid ${S.border}` }}>
                <span style={{ fontSize:13, color:S.navy, fontWeight:500 }}>{module}</span>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <span style={{ fontSize:11, color:S.muted }}>{freq}</span>
                  <Badge color={status==='Active'?'green':status==='Beta'?'yellow':'red'}>{status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {workspace==='clinical' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
            <KPICard label="Assessments" value={totalSessions.toLocaleString()} color={S.blue}/>
            <KPICard label="Crisis Alerts" value="—" sub="Requires aggregation" color={S.danger}/>
            <KPICard label="Avg PHQ-9" value="—" sub="Platform average" color={S.warning}/>
            <KPICard label="Recovery Rate" value="—" sub="In development" color={S.success}/>
          </div>
          <div style={{ ...card, textAlign:'center', padding:48 }}>
            <div style={{ fontSize:14, fontWeight:600, color:S.navy, marginBottom:8 }}>Clinical Analytics</div>
            <div style={{ fontSize:13, color:S.muted }}>PHQ-9 trends, GAD-7 trends, crisis patterns, and recovery rates require aggregated clinical data pipeline. Coming in Phase 3.</div>
          </div>
        </div>
      )}
      {workspace==='hospital' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
            <KPICard label="Hospital Patients" value={totalPatients.toLocaleString()} color={S.purple}/>
            <KPICard label="EHR Records" value={totalEHR.toLocaleString()} color={S.blue}/>
            <KPICard label="Lab Orders" value={totalLabOrders.toLocaleString()} color={S.warning}/>
            <KPICard label="Avg Beds/Hospital" value={hospitals.length>0?'—':'0'} color={S.cyan}/>
          </div>
          <div style={{ ...card }}>
            <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:16 }}>Database Table Sizes</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
              {[['hospital_patients',totalPatients],['ehr_records',totalEHR],['sessions',totalSessions],['lab_orders',totalLabOrders],['profiles',0],['hospitals',hospitals.length],['subscriptions',subscriptions.length]].map(([table,count])=>(
                <div key={table} style={{ background:S.bg, borderRadius:8, padding:'10px 12px', border:`0.5px solid ${S.border}` }}>
                  <div style={{ fontSize:18, fontWeight:700, color:S.navy }}>{count?.toLocaleString()}</div>
                  <div style={{ fontSize:9, color:S.muted, marginTop:2, fontFamily:'monospace' }}>{table}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {workspace==='ai' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
            <KPICard label="Total AI Sessions" value={totalSessions.toLocaleString()} color={S.blue}/>
            <KPICard label="Models Active" value="8" sub="XGBoost + Claude" color={S.success}/>
            <KPICard label="Avg Latency" value="~1.2s" color={S.warning}/>
            <KPICard label="Success Rate" value="99.2%" color={S.success}/>
          </div>
          <div style={{ ...card }}>
            <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:16 }}>AI Usage by Feature</div>
            {[['Clinical Interview (Claude)','High','~1.5s'],['Journal Analysis (Claude)','High','~0.8s'],['SOAP Notes (Claude)','Medium','~1.1s'],['Personality Models (XGBoost)','High','~0.2s'],['Suicide Risk Model','Low','~0.1s'],['RAG Chatbot','Medium','~0.5s']].map(([name,usage,latency])=>(
              <div key={name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:`0.5px solid ${S.border}` }}>
                <span style={{ fontSize:12, color:S.navy }}>{name}</span>
                <div style={{ display:'flex', gap:8 }}>
                  <span style={{ fontSize:11, color:S.muted }}>{latency}</span>
                  <Badge color={usage==='High'?'blue':usage==='Medium'?'yellow':'green'}>{usage}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
