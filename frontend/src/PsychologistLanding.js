import React, { useState, useRef, useEffect } from 'react';

const S = { navy:'#0C1A2E', blue:'#1D4ED8', bg:'#F8FAFF', white:'#FFFFFF', border:'#E2EBF6', muted:'#3B5998', hint:'#94a3b8', lightBlue:'#EFF6FF', success:'#059669', warning:'#D97706', danger:'#DC2626', cyan:'#0891B2', purple:'#7C3AED' };

const FAQS = [
  { q:'Will AI replace me as a psychologist?', a:'No. PsycheFlow is designed as a clinical co-pilot, not a replacement. You remain the clinician — all diagnoses, treatment decisions, and therapy are yours. PsycheFlow handles paperwork, summaries, and tracking so you have more time with patients.' },
  { q:'How many patients can I manage?', a:'The Psychologist plan supports up to 30 active patients. Need more? The Hospital plans support unlimited patients.' },
  { q:'Is patient data confidential?', a:'Absolutely. All data is encrypted with AES-256. Each patient\'s data is isolated via row-level security. Patients control what they share with you. You cannot see what patients have not consented to share.' },
  { q:'How does the share code system work?', a:'Patients generate a unique share code from their dashboard and give it to you. You enter it in your portal to link. Patients can revoke access at any time.' },
  { q:'Do I need to be RCI registered?', a:'We recommend RCI-registered psychologists use PsycheFlow for clinical practice. The platform is designed for licensed mental health professionals.' },
  { q:'Can I use PsycheFlow for teletherapy?', a:'Yes. The messaging system and session workspace support remote sessions. Full telemedicine (video) is on the roadmap for the Professional plan.' },
];

function useInView(ref) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold:0.1 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return inView;
}
function Section({ children, style }) {
  const ref = useRef();
  const inView = useInView(ref);
  return <div ref={ref} style={{ opacity:inView?1:0, transform:inView?'translateY(0)':'translateY(24px)', transition:'opacity 0.5s ease, transform 0.5s ease', ...style }}>{children}</div>;
}

export default function PsychologistLanding({ onBack, onGetStarted }) {
  const [openFAQ, setOpenFAQ] = useState(null);
  const [navScrolled, setNavScrolled] = useState(false);
  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    const h = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior:'smooth' });

  return (
    <div style={{ fontFamily:"'Satoshi',-apple-system,sans-serif", background:'#0C1A2E', overflowX:'hidden' }}>

      {/* NAV */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, background:navScrolled?'rgba(12,26,46,0.97)':'transparent', backdropFilter:'blur(12px)', borderBottom:navScrolled?'0.5px solid rgba(255,255,255,0.08)':'none', transition:'all 0.3s', height:64, display:'flex', alignItems:'center', padding:'0 40px' }}>
        <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:10, background:'none', border:'none', cursor:'pointer', marginRight:32 }}>
          <div style={{ width:30, height:30, borderRadius:7, background:'linear-gradient(135deg,#1D4ED8,#0891B2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C9 1.5 4 5 4 10C4 12.8 6.2 15 9 15C11.8 15 14 12.8 14 10C14 5 9 1.5 9 1.5Z" fill="white" opacity="0.9"/><circle cx="9" cy="10" r="2.2" fill="#0C1A2E"/></svg>
          </div>
          <span style={{ fontSize:15, fontWeight:700, color:'#fff' }}><span style={{ color:'#93C5FD' }}>Psyche</span>Flow</span>
        </button>
        {!isMobile && (
          <div style={{ display:'flex', gap:4, flex:1 }}>
            {[['Features','features'],['How It Works','howitworks'],['Pricing','pricing'],['Security','security']].map(([label,id]) => (
              <button key={label} onClick={() => scrollTo(id)} style={{ padding:'6px 12px', background:'none', border:'none', fontSize:13, color:'rgba(255,255,255,0.6)', cursor:'pointer', borderRadius:7 }}
                onMouseEnter={e => e.currentTarget.style.color='#fff'} onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.6)'}>{label}</button>
            ))}
          </div>
        )}
        <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
          <button onClick={onBack} style={{ padding:'7px 14px', background:'transparent', border:'1px solid rgba(255,255,255,0.2)', color:'rgba(255,255,255,0.8)', borderRadius:8, fontSize:13, cursor:'pointer' }}>← Back</button>
          <button onClick={onGetStarted} style={{ padding:'8px 18px', background:S.blue, color:'#fff', border:'none', borderRadius:9, fontSize:13, fontWeight:600, cursor:'pointer' }}>Create Free Account</button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', padding:'80px 40px 60px', background:`linear-gradient(135deg, #0C1A2E 0%, #1a3a6b 50%, #0d2847 100%)`, position:'relative' }}>
        <div style={{ position:'absolute', top:'15%', right:'8%', width:300, height:300, borderRadius:'50%', background:'rgba(124,58,237,0.08)', filter:'blur(50px)', pointerEvents:'none' }}/>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:60, alignItems:'center' }}>
          <div>
            <h1 style={{ fontSize:isMobile?34:52, fontWeight:700, color:'#fff', letterSpacing:'-0.03em', lineHeight:1.15, margin:'0 0 20px' }}>
              Less paperwork.<br/>
              <span style={{ color:'#A5B4FC' }}>More time with patients.</span>
            </h1>
            <p style={{ fontSize:17, color:'rgba(255,255,255,0.6)', lineHeight:1.7, marginBottom:32, maxWidth:460 }}>
              AI-powered clinical tools that handle documentation, risk monitoring, and session preparation — so you focus on what matters: helping patients.
            </p>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:40 }}>
              <button onClick={onGetStarted} style={{ padding:'13px 28px', background:S.purple, color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer' }}>Start Free — 14 Days</button>
              <button onClick={() => scrollTo('features')} style={{ padding:'13px 28px', background:'rgba(255,255,255,0.08)', color:'#fff', border:'1px solid rgba(255,255,255,0.15)', borderRadius:10, fontSize:14, cursor:'pointer' }}>See Features</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
              {[['7.5 hrs','Saved per week'],['14','Assessments'],['14-day','Free trial']].map(([val,label]) => (
                <div key={label} style={{ textAlign:'center', background:'rgba(255,255,255,0.04)', borderRadius:10, padding:'12px', border:'1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize:20, fontWeight:700, color:'#A5B4FC', marginBottom:2 }}>{val}</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
          {!isMobile && (
            <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:20, border:'1px solid rgba(255,255,255,0.07)', padding:20 }}>
              <div style={{ display:'flex', gap:6, marginBottom:14 }}>
                {['#ff5f57','#febc2e','#28c840'].map(c=><div key={c} style={{ width:9,height:9,borderRadius:'50%',background:c }}/>)}
              </div>
              <div style={{ fontSize:9, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>Psychologist Clinical Portal — 8 patients today</div>
              <div style={{ background:'rgba(220,38,38,0.12)', borderRadius:10, padding:'10px 12px', border:'1px solid rgba(220,38,38,0.25)', marginBottom:12 }}>
                <div style={{ fontSize:10, color:'#FCA5A5', fontWeight:700, marginBottom:2 }}>PRIORITY ALERT</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.7)' }}>Rahul M. · PHQ-9 spiked +7 · Review before 2pm session</div>
              </div>
              <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:10, padding:'12px', marginBottom:12 }}>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>AI Pre-Session Brief · Priya Singh</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.6)', lineHeight:1.6 }}>PHQ-9: 11 → 8 (improving). Last journal: work stress reducing. Key theme this week: relationship conflict. Suggested focus: boundary-setting in ACT framework.</div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {[['5','Patients Today'],['2','High Risk'],['3','Improving'],['1','Unread Msgs']].map(([val,label])=>(
                  <div key={label} style={{ background:'rgba(255,255,255,0.04)', borderRadius:8, padding:'10px', textAlign:'center' }}>
                    <div style={{ fontSize:16, fontWeight:700, color:'rgba(255,255,255,0.8)' }}>{val}</div>
                    <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', marginTop:2 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI DOES NOT REPLACE YOU */}
      <Section>
        <div style={{ background:S.purple, padding:'60px 40px', textAlign:'center' }}>
          <div style={{ maxWidth:720, margin:'0 auto' }}>
            <div style={{ fontSize:24, fontWeight:700, color:'#fff', marginBottom:16, letterSpacing:'-0.02em' }}>PsycheFlow does not replace therapists.</div>
            <p style={{ fontSize:16, color:'rgba(255,255,255,0.7)', lineHeight:1.7, marginBottom:0 }}>
              You remain the clinician. You diagnose. You decide. You heal.<br/>
              PsycheFlow handles the paperwork, summaries, and data tracking — so you can spend that time on what actually matters.
            </p>
          </div>
        </div>
      </Section>

      {/* BEFORE VS AFTER */}
      <Section>
        <div style={{ padding:'80px 40px', background:'#0F1F3D' }}>
          <div style={{ maxWidth:900, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:48 }}>
              <h2 style={{ fontSize:isMobile?26:36, fontWeight:700, color:'#fff', letterSpacing:'-0.02em', margin:0 }}>Before vs After PsycheFlow</h2>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:20 }}>
              <div style={{ background:'rgba(220,38,38,0.08)', borderRadius:16, padding:28, border:'1px solid rgba(220,38,38,0.2)' }}>
                <div style={{ fontSize:14, fontWeight:700, color:'#FCA5A5', marginBottom:20 }}>Without PsycheFlow</div>
                {['Paper or PDF assessments — scored manually','2 hours/day on SOAP note writing','No visibility between sessions','Excel spreadsheets for progress tracking','WhatsApp for patient communication','Missed follow-ups on high-risk patients','No early warning for deteriorating patients'].map(item => (
                  <div key={item} style={{ display:'flex', gap:8, marginBottom:10 }}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink:0, marginTop:2 }}><circle cx="8" cy="8" r="7" fill="rgba(220,38,38,0.2)"/><path d="M5.5 10.5l5-5M10.5 10.5l-5-5" stroke="#FCA5A5" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    <span style={{ fontSize:13, color:'rgba(255,255,255,0.55)' }}>{item}</span>
                  </div>
                ))}
              </div>
              <div style={{ background:'rgba(5,150,105,0.08)', borderRadius:16, padding:28, border:'1px solid rgba(5,150,105,0.2)' }}>
                <div style={{ fontSize:14, fontWeight:700, color:'#6EE7B7', marginBottom:20 }}>With PsycheFlow</div>
                {['Digital assessments — auto-scored in real time','AI SOAP notes generated in session','Full patient timeline always visible','PHQ-9 & GAD-7 trend charts automated','Secure in-platform messaging','Automated crisis alerts — catch risk early','AI flags patients who are deteriorating'].map(item => (
                  <div key={item} style={{ display:'flex', gap:8, marginBottom:10 }}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink:0, marginTop:2 }}><circle cx="8" cy="8" r="7" fill="rgba(5,150,105,0.2)"/><path d="M4 8l3 3 5-5" stroke="#6EE7B7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span style={{ fontSize:13, color:'rgba(255,255,255,0.7)' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* FEATURES */}
      <Section>
        <div id="features" style={{ padding:'80px 40px', background:'#0C1A2E' }}>
          <div style={{ maxWidth:1100, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:48 }}>
              <div style={{ display:'inline-block', padding:'4px 14px', borderRadius:100, background:'rgba(124,58,237,0.15)', color:'#A5B4FC', fontSize:12, fontWeight:600, letterSpacing:'0.04em', textTransform:'uppercase', marginBottom:14 }}>Features</div>
              <h2 style={{ fontSize:isMobile?26:36, fontWeight:700, color:'#fff', letterSpacing:'-0.02em', margin:0 }}>Everything a modern psychologist needs</h2>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(3,1fr)', gap:16 }}>
              {[
                { title:'Walk Into Every Session Prepared', desc:'AI generates a pre-session brief: latest scores, mood trends, risk flags, and journal themes — before you even open the door.', color:'#A5B4FC', items:['Latest PHQ-9 & GAD-7 scores','Mood trend over 2 weeks','Key journal themes','Risk level & change since last session'] },
                { title:'Finish Documentation in Seconds', desc:'AI generates SOAP, DAP, or BIRP notes during your session. Edit and save — no more 2-hour evenings on paperwork.', color:'#6EE7B7', items:['SOAP / DAP / BIRP templates','AI-generated drafts','Auto-save every 2 seconds','One-click finalize'] },
                { title:'Know Which Patients Need You Most', desc:'AI priority queue flags patients with rising PHQ-9, missed sessions, and declining journal sentiment — before they reach crisis.', color:'#FCD34D', items:['Risk level tracking','PHQ trajectory alerts','Session attendance tracking','Journal sentiment analysis'] },
                { title:'Full Patient Timeline', desc:'See every assessment, journal entry, mood log, and session note in chronological order — a complete picture of every patient.', color:'#F9A8D4', items:['All assessments in one view','Journal entries with AI analysis','Mood & sleep trends','Session history'] },
                { title:'Outcome Analytics', desc:'See which patients are improving, which are deteriorating, and how your practice is performing — with real clinical metrics.', color:'#93C5FD', items:['PHQ/GAD improvement rates','Recovery tracking','Practice performance stats','Comparison across patients'] },
                { title:'Secure Patient Messaging', desc:'HIPAA-aligned messaging that keeps all clinical communication inside PsycheFlow — not WhatsApp or email.', color:'#6EE7B7', items:['Encrypted messaging','Message history preserved','File sharing','Mobile-friendly'] },
              ].map(feature => (
                <div key={feature.title} style={{ background:'rgba(255,255,255,0.03)', borderRadius:16, padding:24, border:'1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ width:36, height:36, borderRadius:9, background:feature.color+'15', border:`1px solid ${feature.color}25`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
                    <div style={{ width:12, height:12, borderRadius:'50%', background:feature.color }}/>
                  </div>
                  <div style={{ fontSize:14, fontWeight:700, color:'#fff', marginBottom:8, lineHeight:1.4 }}>{feature.title}</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.45)', lineHeight:1.6, marginBottom:14 }}>{feature.desc}</div>
                  {feature.items.map(item => (
                    <div key={item} style={{ display:'flex', gap:6, marginBottom:6 }}>
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ flexShrink:0, marginTop:2 }}><path d="M3 8l4 4 6-7" stroke={feature.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span style={{ fontSize:12, color:'rgba(255,255,255,0.55)' }}>{item}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* HOW IT WORKS */}
      <Section>
        <div id="howitworks" style={{ padding:'80px 40px', background:'#0F1F3D' }}>
          <div style={{ maxWidth:900, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:60 }}>
              <h2 style={{ fontSize:isMobile?26:36, fontWeight:700, color:'#fff', letterSpacing:'-0.02em', margin:0 }}>Your daily workflow with PsycheFlow</h2>
            </div>
            <div style={{ display:'grid', gap:0 }}>
              {[
                { n:'01', title:'Patient Completes Assessment', desc:'Send a link. Patient completes PHQ-9, GAD-7, mood check-in, and journal entry from their phone.', color:'#93C5FD' },
                { n:'02', title:'Review AI Pre-Session Brief', desc:'Before the session: AI brief shows latest scores, risk flags, journal themes, and suggested focus areas.', color:'#A5B4FC' },
                { n:'03', title:'Conduct Session in Workspace', desc:'Split-screen workspace: patient summary left, your notes center, AI copilot right. Everything visible.', color:'#6EE7B7' },
                { n:'04', title:'AI Generates SOAP Note', desc:'Session ends. SOAP note is auto-drafted. Edit in 2 minutes. Saved automatically.', color:'#FCD34D' },
                { n:'05', title:'Assign Homework & Follow-up', desc:'Assign ACT exercises, journaling prompts, or custom tasks. Track completion before next session.', color:'#F9A8D4' },
              ].map((step, i) => (
                <div key={i} style={{ display:'flex', gap:20, paddingBottom:24, position:'relative' }}>
                  {i<4 && <div style={{ position:'absolute', left:19, top:40, bottom:0, width:2, background:'rgba(255,255,255,0.06)' }}/>}
                  <div style={{ width:40, height:40, borderRadius:'50%', background:step.color+'15', border:`2px solid ${step.color}40`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, zIndex:1 }}>
                    <span style={{ fontSize:11, fontWeight:700, color:step.color }}>{step.n}</span>
                  </div>
                  <div style={{ paddingTop:8 }}>
                    <div style={{ fontSize:15, fontWeight:700, color:'#fff', marginBottom:4 }}>{step.title}</div>
                    <div style={{ fontSize:13, color:'rgba(255,255,255,0.45)', lineHeight:1.6 }}>{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* COMPARISON TABLE */}
      <Section>
        <div style={{ padding:'80px 40px', background:'#0C1A2E' }}>
          <div style={{ maxWidth:800, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:48 }}>
              <h2 style={{ fontSize:isMobile?24:32, fontWeight:700, color:'#fff', letterSpacing:'-0.02em', margin:0 }}>Why PsycheFlow over your current workflow</h2>
            </div>
            <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:16, overflow:'hidden', border:'1px solid rgba(255,255,255,0.07)' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'rgba(29,78,216,0.15)' }}>
                    <th style={{ padding:'14px 20px', fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.5)', textAlign:'left', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>Feature</th>
                    <th style={{ padding:'14px 16px', fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.5)', textAlign:'center', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>Traditional</th>
                    <th style={{ padding:'14px 16px', fontSize:12, fontWeight:700, color:'#A5B4FC', textAlign:'center', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>PsycheFlow</th>
                  </tr>
                </thead>
                <tbody>
                  {[['Assessments','Manual PDFs','Digital, auto-scored'],['Session Notes','Hand-written / typed','AI-generated SOAP/DAP/BIRP'],['Patient Timeline','None','Automated, visual'],['Crisis Alerts','Manual review','Real-time AI detection'],['Progress Analytics','Excel spreadsheets','Automatic charts'],['Patient Communication','WhatsApp/Email','Secure in-platform'],['Pre-Session Prep','30 min manual review','2 min AI brief'],['Outcome Tracking','None','PHQ/GAD trend analytics']].map(([feature,before,after]) => (
                    <tr key={feature} style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding:'12px 20px', fontSize:13, color:'rgba(255,255,255,0.7)' }}>{feature}</td>
                      <td style={{ padding:'12px 16px', fontSize:12, color:'rgba(255,255,255,0.3)', textAlign:'center' }}>{before}</td>
                      <td style={{ padding:'12px 16px', fontSize:12, color:'#6EE7B7', fontWeight:600, textAlign:'center' }}>{after}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Section>

      {/* SECURITY */}
      <Section>
        <div id="security" style={{ padding:'80px 40px', background:'#0F1F3D' }}>
          <div style={{ maxWidth:800, margin:'0 auto', textAlign:'center' }}>
            <div style={{ display:'inline-block', padding:'4px 14px', borderRadius:100, background:'rgba(5,150,105,0.15)', color:'#6EE7B7', fontSize:12, fontWeight:600, letterSpacing:'0.04em', textTransform:'uppercase', marginBottom:20 }}>Security & Trust</div>
            <h2 style={{ fontSize:isMobile?24:32, fontWeight:700, color:'#fff', letterSpacing:'-0.02em', margin:'0 0 12px' }}>Your patients trust you. You can trust PsycheFlow.</h2>
            <p style={{ fontSize:15, color:'rgba(255,255,255,0.45)', maxWidth:480, margin:'0 auto 40px' }}>Mental health data requires the highest confidentiality standards. We built every layer with that in mind.</p>
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'repeat(2,1fr)':'repeat(3,1fr)', gap:14 }}>
              {[['DPDP 2023 Compliant','India data law — full consent, deletion rights'],['End-to-End Encryption','AES-256 at rest, TLS 1.3 in transit'],['Patient-Controlled Sharing','Patients choose what you can see'],['Isolated Data','Row-level security — no cross-patient access'],['Audit Logs','Every action recorded immutably'],['RCI Verified Users','Platform designed for licensed professionals']].map(([title,desc]) => (
                <div key={title} style={{ background:'rgba(255,255,255,0.03)', borderRadius:12, padding:20, border:'1px solid rgba(255,255,255,0.07)', textAlign:'left' }}>
                  <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#6EE7B7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span style={{ fontSize:13, fontWeight:700, color:'#fff' }}>{title}</span>
                  </div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', lineHeight:1.6 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* PRICING */}
      <Section>
        <div id="pricing" style={{ padding:'80px 40px', background:'#0C1A2E' }}>
          <div style={{ maxWidth:600, margin:'0 auto', textAlign:'center' }}>
            <h2 style={{ fontSize:isMobile?26:34, fontWeight:700, color:'#fff', letterSpacing:'-0.02em', margin:'0 0 12px' }}>Simple pricing for psychologists</h2>
            <p style={{ fontSize:15, color:'rgba(255,255,255,0.4)', marginBottom:40 }}>Start free for 14 days. No credit card required.</p>
            <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:20, padding:32, border:'1px solid rgba(255,255,255,0.08)', marginBottom:20 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'#A5B4FC', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Psychologist Plan</div>
              <div style={{ fontSize:40, fontWeight:700, color:'#fff', marginBottom:4 }}>₹999<span style={{ fontSize:16, fontWeight:400, color:'rgba(255,255,255,0.4)' }}>/month</span></div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginBottom:24 }}>₹9,999/year (save 17%)</div>
              {['Everything in Free plan','Up to 30 patients','AI Clinical Copilot','Session Workspace (SOAP/DAP/BIRP)','Treatment planning','Crisis alerts & timeline','Journal intelligence','Practice analytics','14-day free trial'].map(feature => (
                <div key={feature} style={{ display:'flex', gap:8, marginBottom:8, textAlign:'left' }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink:0, marginTop:2 }}><circle cx="8" cy="8" r="7" fill="rgba(165,180,252,0.15)"/><path d="M4 8l3 3 5-5" stroke="#A5B4FC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span style={{ fontSize:13, color:'rgba(255,255,255,0.7)' }}>{feature}</span>
                </div>
              ))}
              <button onClick={onGetStarted} style={{ width:'100%', marginTop:20, padding:'13px', background:S.purple, color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer' }}>Start Free Trial →</button>
            </div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.3)' }}>No credit card required · Cancel anytime · DPDP compliant</div>
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section>
        <div style={{ padding:'80px 40px', background:'#0F1F3D' }}>
          <div style={{ maxWidth:700, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:40 }}>
              <h2 style={{ fontSize:isMobile?24:32, fontWeight:700, color:'#fff', letterSpacing:'-0.02em', margin:0 }}>Common questions</h2>
            </div>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ background:'rgba(255,255,255,0.03)', borderRadius:12, border:'1px solid rgba(255,255,255,0.07)', marginBottom:10, overflow:'hidden' }}>
                <div onClick={() => setOpenFAQ(openFAQ===i?null:i)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px', cursor:'pointer' }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.04)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <div style={{ fontSize:14, fontWeight:600, color:'#fff' }}>{faq.q}</div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ transform:openFAQ===i?'rotate(180deg)':'none', transition:'transform 0.2s', flexShrink:0 }}><path d="M6 9l6 6 6-6" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
                {openFAQ===i && <div style={{ padding:'0 20px 16px', fontSize:13, color:'rgba(255,255,255,0.5)', lineHeight:1.8 }}>{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section>
        <div style={{ padding:'80px 40px', background:`linear-gradient(135deg, ${S.purple}, #1D4ED8)`, textAlign:'center' }}>
          <h2 style={{ fontSize:isMobile?28:40, fontWeight:700, color:'#fff', letterSpacing:'-0.02em', margin:'0 0 12px' }}>Help more patients. Do less paperwork.</h2>
          <p style={{ fontSize:16, color:'rgba(255,255,255,0.65)', maxWidth:400, margin:'0 auto 28px' }}>Join psychologists building better clinical outcomes with PsycheFlow.</p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={onGetStarted} style={{ padding:'13px 28px', background:'#fff', color:S.purple, border:'none', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer' }}>Start Free — 14 Days</button>
            <button onClick={onBack} style={{ padding:'13px 28px', background:'rgba(255,255,255,0.12)', color:'#fff', border:'none', borderRadius:10, fontSize:14, cursor:'pointer' }}>← Back to Home</button>
          </div>
        </div>
      </Section>
    </div>
  );
}
