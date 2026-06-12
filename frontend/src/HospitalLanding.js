import React, { useState, useEffect } from 'react';

const S = {
  navy:'#0C1A2E', blue:'#1D4ED8', bg:'#ffffff', bg2:'#F8FAFF',
  border:'#E5E7EB', muted:'#6B7280', hint:'#9CA3AF',
  success:'#059669', warning:'#D97706', danger:'#DC2626',
  text:'#111827', textSub:'#4B5563',
};

export default function HospitalLanding({ onBack, onGetStarted, onContact }) {
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize); };
  }, []);
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior:'smooth' });

  return (
    <div style={{ fontFamily:"'Satoshi',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", background:S.bg, color:S.text }}>

      {/* NAV */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, background:scrolled?'rgba(255,255,255,0.97)':'transparent', borderBottom:scrolled?`1px solid ${S.border}`:'1px solid transparent', backdropFilter:scrolled?'blur(12px)':'none', transition:'all 0.2s' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 40px', height:60, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:28, height:28, borderRadius:7, background:S.blue, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C9 1.5 4 5 4 10C4 12.8 6.2 15 9 15C11.8 15 14 12.8 14 10C14 5 9 1.5 9 1.5Z" fill="white"/><circle cx="9" cy="10" r="2.2" fill="#0C1A2E"/></svg>
            </div>
            <span style={{ fontSize:15, fontWeight:700, color:S.navy }}>PsycheFlow <span style={{ color:S.blue }}>for Hospitals</span></span>
          </div>
          {!isMobile && (
            <div style={{ display:'flex', gap:28 }}>
              {[['Product Tour','tour'],['Workflow','workflow'],['NABH','nabh'],['Security','security'],['ROI','roi']].map(([l,id])=>(
                <span key={id} onClick={()=>scrollTo(id)} style={{ fontSize:14, color:S.muted, cursor:'pointer', fontWeight:500 }}
                  onMouseEnter={e=>e.target.style.color=S.navy} onMouseLeave={e=>e.target.style.color=S.muted}>{l}</span>
              ))}
            </div>
          )}
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <span onClick={onBack} style={{ fontSize:13, color:S.muted, cursor:'pointer', marginRight:4 }}>← Back</span>
            <button onClick={onGetStarted} style={{ padding:'7px 16px', background:'transparent', color:S.navy, border:`1px solid ${S.border}`, borderRadius:7, fontSize:13, cursor:'pointer' }}>Hospital Login</button>
            <button onClick={onGetStarted} style={{ padding:'8px 18px', background:S.blue, color:'#fff', border:'none', borderRadius:7, fontSize:13, fontWeight:600, cursor:'pointer' }}>Book Demo</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ paddingTop:120, paddingBottom:96, paddingLeft:isMobile?24:80, paddingRight:isMobile?24:80 }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'42fr 58fr', gap:isMobile?48:80, alignItems:'center' }}>
            <div>
              <h1 style={{ fontSize:isMobile?38:64, fontWeight:700, color:S.navy, letterSpacing:'-0.04em', lineHeight:1.05, margin:'0 0 24px' }}>
                Reduce intake time<br/>
                <span style={{ color:S.blue }}>by 40%.</span>
              </h1>
              <p style={{ fontSize:isMobile?16:19, color:S.textSub, lineHeight:1.65, margin:'0 0 40px', maxWidth:400 }}>
                Automate mental health assessments, clinical documentation, crisis monitoring, and NABH reporting. One platform for your entire psychiatry department.
              </p>
              <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:56 }}>
                <button onClick={onGetStarted} style={{ padding:'13px 28px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:15, fontWeight:600, cursor:'pointer' }}>Book Hospital Demo</button>
                <button onClick={()=>scrollTo('tour')} style={{ padding:'13px 24px', background:'transparent', color:S.muted, border:`1px solid ${S.border}`, borderRadius:8, fontSize:15, cursor:'pointer' }}>See Product Tour</button>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:24, maxWidth:360 }}>
                {[['40%','Reduction in intake time'],['60%','Less documentation effort'],['14','Clinical assessments'],['100%','Audit trail coverage']].map(([num,label])=>(
                  <div key={label}>
                    <div style={{ fontSize:24, fontWeight:700, color:S.navy, letterSpacing:'-0.03em' }}>{num}</div>
                    <div style={{ fontSize:13, color:S.muted, marginTop:4 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dashboard */}
            {!isMobile && (
              <div style={{ boxShadow:'0 24px 64px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)', borderRadius:16, overflow:'hidden' }}>
                <div style={{ background:'#1E293B', padding:'12px 16px', display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ display:'flex', gap:6 }}>{['#ff5f57','#febc2e','#28c840'].map(c=><div key={c} style={{ width:10, height:10, borderRadius:'50%', background:c }}/>)}</div>
                  <div style={{ flex:1, display:'flex', justifyContent:'center' }}>
                    <div style={{ background:'rgba(255,255,255,0.08)', borderRadius:5, padding:'3px 14px', fontSize:11, color:'rgba(255,255,255,0.4)' }}>Hospital Command Center — Apollo Hospital, Ghaziabad</div>
                  </div>
                </div>
                <div style={{ background:S.bg2, padding:20 }}>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:14 }}>
                    {[['24','OPD',S.blue],['8','IPD','#7C3AED'],['₹1.2L','Revenue',S.success],['2','Alerts',S.danger]].map(([v,l,c])=>(
                      <div key={l} style={{ background:'#fff', borderRadius:8, padding:'12px', border:`1px solid ${S.border}`, textAlign:'center' }}>
                        <div style={{ fontSize:20, fontWeight:700, color:c }}>{v}</div>
                        <div style={{ fontSize:10, color:S.muted, marginTop:2 }}>{l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background:'#FEF2F2', border:`1px solid #FECACA`, borderRadius:8, padding:'10px 12px', marginBottom:12 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:S.danger, marginBottom:2 }}>Crisis Alert</div>
                    <div style={{ fontSize:12, color:S.textSub }}>Patient BED-04 · PHQ-9 crossed 20 · Psychologist notified</div>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                    {['OPD Queue','Lab Kanban','Pharmacy','Billing RCM'].map(m=>(
                      <div key={m} style={{ background:'#fff', borderRadius:7, padding:'10px 12px', border:`1px solid ${S.border}`, fontSize:12, color:S.textSub, fontWeight:500 }}>{m}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Trust bar */}
          <div style={{ marginTop:64, paddingTop:32, borderTop:`1px solid ${S.border}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
            <div style={{ fontSize:13, color:S.muted }}>Trusted by leading hospitals across India</div>
            <div style={{ display:'flex', gap:32 }}>
              {['Apollo Hospitals','Fortis Healthcare','NIMHANS','Max Healthcare'].map(h=>(
                <div key={h} style={{ fontSize:13, fontWeight:600, color:S.hint }}>{h}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODULES */}
      <div id="tour" style={{ background:S.bg2, padding:isMobile?'80px 24px':'96px 80px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ marginBottom:48 }}>
            <div style={{ fontSize:13, fontWeight:600, color:S.blue, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>18 Modules</div>
            <h2 style={{ fontSize:isMobile?32:48, fontWeight:700, color:S.navy, letterSpacing:'-0.03em', margin:'0 0 16px' }}>Everything your department needs.</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'repeat(2,1fr)':'repeat(6,1fr)', gap:8 }}>
            {['OPD Queue','IPD Management','EHR','Pharmacy','Lab','Billing','Beds','Referrals','Appointments','Nursing','Clinical Orders','Discharge','Prescriptions','Telemedicine','NABH','Analytics','Staff','Connections'].map(m=>(
              <div key={m} style={{ background:'#fff', borderRadius:8, padding:'12px 14px', border:`1px solid ${S.border}`, fontSize:13, color:S.navy, fontWeight:500 }}>{m}</div>
            ))}
          </div>
        </div>
      </div>

      {/* WORKFLOW */}
      <div id="workflow" style={{ background:S.bg, padding:isMobile?'80px 24px':'96px 80px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ marginBottom:48 }}>
            <div style={{ fontSize:13, fontWeight:600, color:S.blue, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>Workflow</div>
            <h2 style={{ fontSize:isMobile?32:48, fontWeight:700, color:S.navy, letterSpacing:'-0.03em', margin:0 }}>From admission to discharge.</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(5,1fr)', gap:0 }}>
            {[['Patient registers','OPD intake, assessment assigned'],['AI assessment','16 instruments, 15 minutes'],['Psychologist reviews','AI brief, SOAP notes'],['Treatment','Prescriptions, telemedicine, nursing'],['Discharge','Checklist, summary, NABH report']].map(([title,body],i)=>(
              <div key={title} style={{ padding:'24px 20px', borderRight:i<4?`1px solid ${S.border}`:'none' }}>
                <div style={{ fontSize:13, fontWeight:700, color:S.blue, marginBottom:12 }}>0{i+1}</div>
                <div style={{ fontSize:16, fontWeight:700, color:S.navy, marginBottom:8, letterSpacing:'-0.01em' }}>{title}</div>
                <div style={{ fontSize:13, color:S.textSub, lineHeight:1.6 }}>{body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* NABH */}
      <div id="nabh" style={{ background:S.bg2, padding:isMobile?'80px 24px':'96px 80px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:80, alignItems:'center' }}>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:S.blue, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>NABH Compliance</div>
              <h2 style={{ fontSize:isMobile?28:40, fontWeight:700, color:S.navy, letterSpacing:'-0.03em', margin:'0 0 20px', lineHeight:1.1 }}>Built for NABH mental health standards.</h2>
              <p style={{ fontSize:16, color:S.textSub, lineHeight:1.7, marginBottom:24 }}>14-item compliance checklist, quality indicators, incident reporting, and one-click audit report generation.</p>
              {['14-item NABH checklist','Quality indicator tracking','Incident reporting','Audit trail export','One-click compliance report'].map(item=>(
                <div key={item} style={{ display:'flex', gap:10, marginBottom:12 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink:0, marginTop:2 }}><path d="M5 12l5 5L20 7" stroke={S.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span style={{ fontSize:14, color:S.textSub }}>{item}</span>
                </div>
              ))}
            </div>
            <div style={{ background:'#fff', borderRadius:16, padding:32, border:`1px solid ${S.border}` }}>
              <div style={{ fontSize:14, fontWeight:700, color:S.navy, marginBottom:20 }}>NABH Compliance Status</div>
              {[['Patient Identification','Complete','#059669'],['Risk Assessment','Complete','#059669'],['Medication Safety','In Progress','#D97706'],['Incident Reporting','Complete','#059669'],['Quality Indicators','In Progress','#D97706'],['Audit Trail','Complete','#059669']].map(([item,status,color])=>(
                <div key={item} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:`1px solid ${S.border}` }}>
                  <span style={{ fontSize:13, color:S.textSub }}>{item}</span>
                  <span style={{ fontSize:12, fontWeight:600, color }}>{status}</span>
                </div>
              ))}
              <div style={{ marginTop:16, padding:'10px 14px', background:'#EFF6FF', borderRadius:8, fontSize:13, color:S.blue, fontWeight:500 }}>8/14 items complete · On track for NABH audit</div>
            </div>
          </div>
        </div>
      </div>

      {/* ROI */}
      <div id="roi" style={{ background:S.bg, padding:isMobile?'80px 24px':'96px 80px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', textAlign:'center' }}>
          <div style={{ fontSize:13, fontWeight:600, color:S.blue, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>ROI</div>
          <h2 style={{ fontSize:isMobile?32:48, fontWeight:700, color:S.navy, letterSpacing:'-0.03em', margin:'0 0 16px' }}>Measurable outcomes.</h2>
          <p style={{ fontSize:18, color:S.textSub, marginBottom:56, maxWidth:500, margin:'0 auto 56px' }}>Hospitals using PsycheFlow see results within the first 30 days.</p>
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'repeat(2,1fr)':'repeat(4,1fr)', gap:24 }}>
            {[['40%','Reduction in patient intake time'],['60%','Less clinical documentation effort'],['94%','Crisis detection accuracy'],['3x','Faster NABH audit preparation']].map(([num,label])=>(
              <div key={label} style={{ padding:32, background:S.bg2, borderRadius:12, border:`1px solid ${S.border}` }}>
                <div style={{ fontSize:40, fontWeight:700, color:S.blue, letterSpacing:'-0.04em', marginBottom:8 }}>{num}</div>
                <div style={{ fontSize:14, color:S.textSub, lineHeight:1.5 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECURITY */}
      <div id="security" style={{ background:S.bg2, padding:isMobile?'80px 24px':'96px 80px' }}>
        <div style={{ maxWidth:720, margin:'0 auto', textAlign:'center' }}>
          <div style={{ fontSize:13, fontWeight:600, color:S.blue, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>Security</div>
          <h2 style={{ fontSize:isMobile?28:40, fontWeight:700, color:S.navy, letterSpacing:'-0.03em', margin:'0 0 16px' }}>Patient data never leaves your control.</h2>
          <p style={{ fontSize:17, color:S.textSub, lineHeight:1.7, marginBottom:40 }}>AES-256 encryption, DPDP 2023 compliance, and a full audit trail. We never use patient data to train AI models.</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
            {[['AES-256','Encryption at rest'],['DPDP 2023','India compliance'],['Zero training','On patient data']].map(([title,sub])=>(
              <div key={title} style={{ padding:20, background:'#fff', borderRadius:10, border:`1px solid ${S.border}` }}>
                <div style={{ fontSize:16, fontWeight:700, color:S.navy, marginBottom:4 }}>{title}</div>
                <div style={{ fontSize:13, color:S.muted }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ background:S.navy, padding:isMobile?'80px 24px':'96px 80px' }}>
        <div style={{ maxWidth:720, margin:'0 auto', textAlign:'center' }}>
          <h2 style={{ fontSize:isMobile?32:52, fontWeight:700, color:'#fff', letterSpacing:'-0.03em', margin:'0 0 20px', lineHeight:1.1 }}>Ready to transform your psychiatry department?</h2>
          <p style={{ fontSize:17, color:'rgba(255,255,255,0.6)', marginBottom:40, lineHeight:1.6 }}>Book a 30-minute demo. We'll walk you through the full hospital workflow.</p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={onGetStarted} style={{ padding:'14px 32px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:15, fontWeight:600, cursor:'pointer' }}>Book Hospital Demo</button>
            <button onClick={onContact} style={{ padding:'14px 28px', background:'transparent', color:'rgba(255,255,255,0.7)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:8, fontSize:15, cursor:'pointer' }}>Contact Sales</button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background:S.navy, borderTop:'1px solid rgba(255,255,255,0.08)', padding:'32px 80px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
          <span style={{ fontSize:13, color:'rgba(255,255,255,0.4)' }}>© 2026 PsycheFlow. DPDP 2023 Compliant.</span>
          <span onClick={onBack} style={{ fontSize:13, color:'rgba(255,255,255,0.4)', cursor:'pointer' }}>← Back to main site</span>
        </div>
      </footer>
    </div>
  );
}
