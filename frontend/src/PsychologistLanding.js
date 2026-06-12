import React, { useState, useEffect } from 'react';

const S = {
  navy:'#0C1A2E', blue:'#1D4ED8', bg:'#ffffff', bg2:'#F8FAFF',
  border:'#E5E7EB', muted:'#6B7280', hint:'#9CA3AF',
  success:'#059669', warning:'#D97706', danger:'#DC2626',
  text:'#111827', textSub:'#4B5563',
};

export default function PsychologistLanding({ onBack, onGetStarted }) {
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
            <span style={{ fontSize:15, fontWeight:700, color:S.navy }}>PsycheFlow <span style={{ color:S.blue }}>for Psychologists</span></span>
          </div>
          {!isMobile && (
            <div style={{ display:'flex', gap:28 }}>
              {[['Features','features'],['Workflow','workflow'],['AI Tools','ai'],['Pricing','pricing']].map(([l,id])=>(
                <span key={id} onClick={()=>scrollTo(id)} style={{ fontSize:14, color:S.muted, cursor:'pointer', fontWeight:500 }}
                  onMouseEnter={e=>e.target.style.color=S.navy} onMouseLeave={e=>e.target.style.color=S.muted}>{l}</span>
              ))}
            </div>
          )}
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <span onClick={onBack} style={{ fontSize:13, color:S.muted, cursor:'pointer', marginRight:4 }}>← Back</span>
            <button onClick={onGetStarted} style={{ padding:'8px 20px', background:S.blue, color:'#fff', border:'none', borderRadius:7, fontSize:13, fontWeight:600, cursor:'pointer' }}>Start Free — 14 Days</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ paddingTop:120, paddingBottom:96, paddingLeft:isMobile?24:80, paddingRight:isMobile?24:80 }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'42fr 58fr', gap:isMobile?48:80, alignItems:'center' }}>
            <div>
              <h1 style={{ fontSize:isMobile?38:64, fontWeight:700, color:S.navy, letterSpacing:'-0.04em', lineHeight:1.05, margin:'0 0 24px' }}>
                Less paperwork.<br/>
                <span style={{ color:S.blue }}>More time with</span><br/>
                <span style={{ color:S.blue }}>patients.</span>
              </h1>
              <p style={{ fontSize:isMobile?16:19, color:S.textSub, lineHeight:1.65, margin:'0 0 40px', maxWidth:400 }}>
                AI-powered clinical tools that handle documentation, risk monitoring, and session preparation — so you focus on what matters: helping patients.
              </p>
              <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:56 }}>
                <button onClick={onGetStarted} style={{ padding:'13px 28px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:15, fontWeight:600, cursor:'pointer' }}>Start Free — 14 Days</button>
                <button onClick={()=>scrollTo('features')} style={{ padding:'13px 24px', background:'transparent', color:S.muted, border:`1px solid ${S.border}`, borderRadius:8, fontSize:15, cursor:'pointer' }}>See Features</button>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, maxWidth:380 }}>
                {[['7.5 hrs','Saved per week'],['14','Assessments'],['14-day','Free trial']].map(([num,label])=>(
                  <div key={label} style={{ padding:'16px', background:S.bg2, borderRadius:8, border:`1px solid ${S.border}` }}>
                    <div style={{ fontSize:20, fontWeight:700, color:S.navy, letterSpacing:'-0.02em' }}>{num}</div>
                    <div style={{ fontSize:12, color:S.muted, marginTop:3 }}>{label}</div>
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
                    <div style={{ background:'rgba(255,255,255,0.08)', borderRadius:5, padding:'3px 14px', fontSize:11, color:'rgba(255,255,255,0.4)' }}>Psychologist Clinical Portal — 8 patients today</div>
                  </div>
                </div>
                <div style={{ background:S.bg2, padding:20 }}>
                  {/* Priority alert */}
                  <div style={{ background:'#FEF2F2', border:`1px solid #FECACA`, borderRadius:8, padding:'10px 12px', marginBottom:14 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:S.danger, marginBottom:2 }}>Priority Alert</div>
                    <div style={{ fontSize:12, color:S.textSub }}>Rahul M. · PHQ-9 spiked +7 · Review before 2pm session</div>
                  </div>
                  {/* AI brief */}
                  <div style={{ background:'#EFF6FF', border:`1px solid #BFDBFE`, borderRadius:8, padding:'12px 14px', marginBottom:14 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:S.blue, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>AI Pre-Session Brief · Priya Singh</div>
                    <div style={{ fontSize:12, color:S.textSub, lineHeight:1.6 }}>PHQ-9: 11 → 8 (improving). Last journal: work stress reducing. Key theme this week: relationship conflict. Suggested focus: boundary-setting in ACT framework.</div>
                  </div>
                  {/* Stats */}
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10 }}>
                    {[['5','Patients Today',S.blue],['2','High Risk',S.danger],['3','Improving',S.success],['1','Unread Msgs',S.muted]].map(([v,l,c])=>(
                      <div key={l} style={{ background:'#fff', borderRadius:8, padding:'12px', border:`1px solid ${S.border}`, textAlign:'center' }}>
                        <div style={{ fontSize:22, fontWeight:700, color:c }}>{v}</div>
                        <div style={{ fontSize:10, color:S.muted, marginTop:2 }}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div id="features" style={{ background:S.bg2, padding:isMobile?'80px 24px':'96px 80px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ marginBottom:48 }}>
            <div style={{ fontSize:13, fontWeight:600, color:S.blue, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>Features</div>
            <h2 style={{ fontSize:isMobile?32:48, fontWeight:700, color:S.navy, letterSpacing:'-0.03em', margin:0 }}>Built for clinical practice.</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(3,1fr)', gap:24 }}>
            {[
              { title:'AI Pre-Session Brief', body:'Before every session, get a 3-sentence summary of the patient\'s mood trends, journal themes, and risk signals. No chart-diving required.' },
              { title:'SOAP Note Generation', body:'End-of-session notes written automatically from session transcription. Review, edit, sign. Reduces documentation from 20 minutes to 2.' },
              { title:'Treatment Planning', body:'Goal-based treatment plans with 6 clinical templates. Track progress across PHQ-9, GAD-7, and custom outcome measures over time.' },
              { title:'Risk Monitoring', body:'Real-time alerts when PHQ-9 Item 9, C-SSRS flags, or journal sentiment crosses clinical thresholds. Never miss a deterioration.' },
              { title:'ACT Therapy Engine', body:'6 ACT hexaflex exercises with patient instructions, homework assignments, and outcome tracking built in.' },
              { title:'Secure Messaging', body:'End-to-end encrypted messaging with patients. File attachments, read receipts, and automatic crisis escalation if risk keywords detected.' },
            ].map(f=>(
              <div key={f.title} style={{ background:'#fff', borderRadius:12, padding:28, border:`1px solid ${S.border}` }}>
                <div style={{ fontSize:17, fontWeight:700, color:S.navy, marginBottom:10, letterSpacing:'-0.01em' }}>{f.title}</div>
                <div style={{ fontSize:14, color:S.textSub, lineHeight:1.7 }}>{f.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* WORKFLOW */}
      <div id="workflow" style={{ background:S.bg, padding:isMobile?'80px 24px':'96px 80px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ marginBottom:48 }}>
            <div style={{ fontSize:13, fontWeight:600, color:S.blue, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>Workflow</div>
            <h2 style={{ fontSize:isMobile?32:48, fontWeight:700, color:S.navy, letterSpacing:'-0.03em', margin:0 }}>A session, reimagined.</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(4,1fr)', gap:40 }}>
            {[
              ['Before session','AI brief ready. Risk flags reviewed. Notes template open.'],
              ['During session','Timer running. Intervention library accessible. Homework templates.'],
              ['After session','SOAP note generated. Homework sent. Follow-up scheduled.'],
              ['Between sessions','Journal alerts. Mood trends. Crisis monitoring 24/7.'],
            ].map(([title,body],i)=>(
              <div key={title}>
                <div style={{ fontSize:13, fontWeight:700, color:S.blue, marginBottom:12 }}>0{i+1}</div>
                <div style={{ fontSize:17, fontWeight:700, color:S.navy, marginBottom:8, letterSpacing:'-0.01em' }}>{title}</div>
                <div style={{ fontSize:14, color:S.textSub, lineHeight:1.6 }}>{body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PRICING */}
      <div id="pricing" style={{ background:S.bg2, padding:isMobile?'80px 24px':'96px 80px' }}>
        <div style={{ maxWidth:800, margin:'0 auto', textAlign:'center' }}>
          <div style={{ fontSize:13, fontWeight:600, color:S.blue, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>Pricing</div>
          <h2 style={{ fontSize:isMobile?32:48, fontWeight:700, color:S.navy, letterSpacing:'-0.03em', margin:'0 0 16px' }}>Free to start.</h2>
          <p style={{ fontSize:18, color:S.textSub, marginBottom:48 }}>14-day free trial. No credit card required.</p>
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(3,1fr)', gap:16 }}>
            {[
              { plan:'Free', price:'₹0', period:'forever', features:['5 patients','All 16 instruments','AI pre-session brief','Basic SOAP notes'], cta:'Start Free', primary:false },
              { plan:'Professional', price:'₹1,999', period:'per month', features:['Unlimited patients','All AI features','Full SOAP generation','Treatment planning','Priority support'], cta:'Start 14-Day Trial', primary:true },
              { plan:'Hospital', price:'Custom', period:'per department', features:['Everything in Pro','NABH reporting','Population analytics','API access','Dedicated support'], cta:'Book Demo', primary:false },
            ].map(p=>(
              <div key={p.plan} style={{ background:p.primary?S.navy:'#fff', borderRadius:12, padding:28, border:`1px solid ${p.primary?S.navy:S.border}` }}>
                <div style={{ fontSize:13, fontWeight:700, color:p.primary?'rgba(255,255,255,0.5)':S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>{p.plan}</div>
                <div style={{ fontSize:32, fontWeight:700, color:p.primary?'#fff':S.navy, letterSpacing:'-0.03em', marginBottom:4 }}>{p.price}</div>
                <div style={{ fontSize:13, color:p.primary?'rgba(255,255,255,0.4)':S.muted, marginBottom:24 }}>{p.period}</div>
                {p.features.map(f=>(
                  <div key={f} style={{ display:'flex', gap:8, marginBottom:10 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink:0, marginTop:2 }}><path d="M5 12l5 5L20 7" stroke={p.primary?'#93c5fd':S.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span style={{ fontSize:13, color:p.primary?'rgba(255,255,255,0.7)':S.textSub }}>{f}</span>
                  </div>
                ))}
                <button onClick={onGetStarted} style={{ marginTop:20, width:'100%', padding:'11px', background:p.primary?S.blue:'transparent', color:p.primary?'#fff':S.blue, border:`1px solid ${p.primary?S.blue:S.blue}`, borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ background:S.navy, padding:isMobile?'80px 24px':'96px 80px' }}>
        <div style={{ maxWidth:720, margin:'0 auto', textAlign:'center' }}>
          <h2 style={{ fontSize:isMobile?32:52, fontWeight:700, color:'#fff', letterSpacing:'-0.03em', margin:'0 0 20px', lineHeight:1.1 }}>Start your free trial today.</h2>
          <p style={{ fontSize:17, color:'rgba(255,255,255,0.6)', marginBottom:40, lineHeight:1.6 }}>14 days free. No credit card. Cancel anytime.</p>
          <button onClick={onGetStarted} style={{ padding:'14px 40px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:15, fontWeight:600, cursor:'pointer' }}>
            Start Free — 14 Days
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background:S.navy, borderTop:'1px solid rgba(255,255,255,0.08)', padding:'32px 80px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
          <span style={{ fontSize:13, color:'rgba(255,255,255,0.4)' }}>© 2026 PsycheFlow. For mental health professionals.</span>
          <span onClick={onBack} style={{ fontSize:13, color:'rgba(255,255,255,0.4)', cursor:'pointer' }}>← Back to main site</span>
        </div>
      </footer>
    </div>
  );
}
