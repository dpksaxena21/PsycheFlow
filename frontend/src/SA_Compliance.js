import React, { useState } from 'react';
export default function SACompliance({ S, card, Badge, KPICard }) {
  const [view, setView] = useState('dpdp');
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h2 style={{ margin:0, color:S.navy, fontSize:20, fontWeight:700 }}>Compliance Center</h2>
        <div style={{ display:'flex', gap:8 }}>
          {['dpdp','nabh','retention','checklist'].map(v=>(
            <button key={v} onClick={()=>setView(v)} style={{ padding:'6px 14px', border:'none', borderRadius:8, fontSize:12, fontWeight:view===v?700:400, background:view===v?S.blue:'transparent', color:view===v?'#fff':S.muted, cursor:'pointer', textTransform:'uppercase' }}>{v}</button>
          ))}
        </div>
      </div>
      {view==='dpdp' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
            <KPICard label="DPDP Act 2023" value="Compliant" color={S.success}/>
            <KPICard label="Consent Flow" value="Active" color={S.success}/>
            <KPICard label="Data Deletion" value="Available" color={S.success}/>
          </div>
          <div style={{ ...card }}>
            <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>DPDP Compliance Checklist</div>
            {[
              [true,'Consent flow on signup (DPDP Act 2023)'],
              [true,'Data deletion rights page (/dpdp)'],
              [true,'Privacy Policy page (/privacy)'],
              [true,'Terms of Service (/terms)'],
              [true,'RLS on all 21 Supabase tables'],
              [true,'Minimum data collection principle'],
              [true,'No third-party data selling'],
              [false,'Data Processing Agreement with hospitals (pending)'],
              [false,'Breach notification procedure (draft)'],
              [false,'Data Protection Officer appointed (future)'],
            ].map(([done,item],i)=>(
              <div key={i} style={{ display:'flex', gap:10, padding:'9px 0', borderBottom:`0.5px solid ${S.border}` }}>
                <div style={{ width:18, height:18, borderRadius:'50%', background:done?'#ECFDF5':'#F9FAFB', border:`1px solid ${done?'#A7F3D0':S.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {done?<span style={{ color:S.success, fontSize:9 }}>✓</span>:<span style={{ color:S.hint, fontSize:10 }}>—</span>}
                </div>
                <span style={{ fontSize:12, color:done?S.navy:S.hint }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {view==='nabh' && (
        <div>
          <div style={{ ...card }}>
            <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>NABH Digital Health Standards</div>
            {[
              [true,'Patient identification & registration'],
              [true,'Clinical documentation (EHR)'],
              [true,'Medication management (Pharmacy)'],
              [true,'Laboratory information system'],
              [true,'Billing transparency'],
              [false,'Infection control module (planned)'],
              [false,'Quality indicators dashboard (planned)'],
              [false,'Incident reporting system (planned)'],
              [false,'Staff credentialing module (planned)'],
            ].map(([done,item],i)=>(
              <div key={i} style={{ display:'flex', gap:10, padding:'9px 0', borderBottom:`0.5px solid ${S.border}` }}>
                <div style={{ width:18, height:18, borderRadius:'50%', background:done?'#ECFDF5':'#F9FAFB', border:`1px solid ${done?'#A7F3D0':S.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {done?<span style={{ color:S.success, fontSize:9 }}>✓</span>:<span style={{ color:S.hint, fontSize:10 }}>—</span>}
                </div>
                <span style={{ fontSize:12, color:done?S.navy:S.hint }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {view==='retention' && (
        <div>
          <div style={{ ...card }}>
            <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Data Retention Policy</div>
            {[['Patient Records','7 years (legal requirement)'],['EHR Data','7 years'],['Audit Logs','3 years'],['Session Data','2 years'],['Messages','1 year'],['Billing Records','7 years (GST requirement)'],['Consent Records','Permanent']].map(([type,policy])=>(
              <div key={type} style={{ display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:`0.5px solid ${S.border}` }}>
                <span style={{ fontSize:12, color:S.navy }}>{type}</span>
                <span style={{ fontSize:12, fontWeight:600, color:S.blue }}>{policy}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {view==='checklist' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
            <KPICard label="Completed" value="8" color={S.success}/>
            <KPICard label="Pending" value="6" color={S.warning}/>
            <KPICard label="Planned" value="4" color={S.blue}/>
          </div>
          <div style={{ ...card }}>
            <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Full Compliance Checklist</div>
            {[
              [true,'complete','DPDP Act 2023 compliance'],
              [true,'complete','RLS on all database tables'],
              [true,'complete','JWT authentication'],
              [true,'complete','HTTPS enforced (HSTS)'],
              [true,'complete','Audit logging'],
              [true,'complete','Rate limiting'],
              [true,'complete','Input sanitization'],
              [true,'complete','Error message hardening'],
              [false,'pending','ISO 27001 certification'],
              [false,'pending','Penetration testing'],
              [false,'pending','NABH digital health audit'],
              [false,'pending','Data Processing Agreements'],
              [false,'planned','SOC 2 Type II'],
              [false,'planned','HIPAA (for international)'],
            ].map(([done,status,item],i)=>(
              <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:`0.5px solid ${S.border}` }}>
                <div style={{ display:'flex', gap:10 }}>
                  <div style={{ width:18, height:18, borderRadius:'50%', background:done?'#ECFDF5':'#F9FAFB', border:`1px solid ${done?'#A7F3D0':S.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    {done?<span style={{ color:S.success, fontSize:9 }}>✓</span>:<span style={{ color:S.hint, fontSize:10 }}>—</span>}
                  </div>
                  <span style={{ fontSize:12, color:done?S.navy:S.hint }}>{item}</span>
                </div>
                <Badge color={status==='complete'?'green':status==='pending'?'yellow':'blue'}>{status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
