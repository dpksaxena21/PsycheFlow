import React, { useState } from 'react';

const S = { blue:'#1D4ED8', navy:'#0C1A2E', bg:'#F8FAFF', card:'#FFFFFF', border:'#E2EBF6', muted:'#3B5998', hint:'#94a3b8', lightBlue:'#EFF6FF', cyan:'#0891B2', dark:'#060D1A' };

const Stat = ({ value, label }) => (
  <div style={{ textAlign:'center' }}>
    <div style={{ fontSize:36, fontWeight:700, color:'#fff', letterSpacing:'-0.03em', marginBottom:4 }}>{value}</div>
    <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)', lineHeight:1.5 }}>{label}</div>
  </div>
);

const Feature = ({ title, desc, tag }) => (
  <div style={{ padding:28, borderRadius:12, border:'0.5px solid '+S.border, background:S.card, boxShadow:'0 1px 4px rgba(29,78,216,0.06)' }}>
    {tag && <div style={{ display:'inline-block', padding:'2px 10px', borderRadius:100, background:S.lightBlue, color:S.blue, fontSize:10, fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase', marginBottom:12 }}>{tag}</div>}
    <div style={{ fontSize:15, fontWeight:700, color:S.navy, marginBottom:8, letterSpacing:'-0.01em' }}>{title}</div>
    <div style={{ fontSize:13, color:S.muted, lineHeight:1.8 }}>{desc}</div>
  </div>
);

const NABHItem = ({ code, title, desc }) => (
  <div style={{ display:'flex', gap:16, padding:'16px 0', borderBottom:'0.5px solid '+S.border }}>
    <div style={{ flexShrink:0, width:60, height:24, borderRadius:6, background:S.lightBlue, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:S.blue, letterSpacing:'0.03em' }}>{code}</div>
    <div>
      <div style={{ fontSize:13, fontWeight:600, color:S.navy, marginBottom:2 }}>{title}</div>
      <div style={{ fontSize:12, color:S.muted, lineHeight:1.6 }}>{desc}</div>
    </div>
  </div>
);

export default function HospitalLanding({ onBack, onContact }) {
  const [formData, setFormData] = useState({ name:'', email:'', hospital:'', city:'', beds:'', psychologists:'', message:'' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.hospital) return;
    setSending(true);
    try {
      await fetch("https://formspree.io/f/xpwzgkqr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, _subject: "PsycheFlow Hospital Inquiry: " + formData.hospital })
      });
      setSubmitted(true);
    } catch(e) {
      setSubmitted(true);
    }
    setSending(false);
  };

  return (
    <div style={{ fontFamily:"'Satoshi',-apple-system,sans-serif", background:S.bg, minHeight:'100vh' }}>
      {/* Nav */}
      <nav style={{ padding:'18px 48px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'0.5px solid '+S.border, background:S.card, position:'sticky', top:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:S.blue, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="17" height="17" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C9 1.5 4 5 4 10C4 12.8 6.2 15 9 15C11.8 15 14 12.8 14 10C14 5 9 1.5 9 1.5Z" fill="white" opacity="0.9"/><circle cx="9" cy="10" r="2.2" fill="#0C1A2E"/></svg>
          </div>
          <span style={{ fontWeight:700, fontSize:15, color:S.navy, letterSpacing:'-0.02em' }}>PsycheFlow</span>
          <span style={{ fontSize:11, fontWeight:600, color:S.blue, background:S.lightBlue, padding:'2px 8px', borderRadius:100, marginLeft:4 }}>Enterprise</span>
        </div>
        <div style={{ display:'flex', gap:16, alignItems:'center' }}>
          <span onClick={onBack} style={{ fontSize:13, color:S.muted, cursor:'pointer' }}>← Main site</span>
          <button onClick={() => document.getElementById('contact-form').scrollIntoView({behavior:'smooth'})}
            style={{ padding:'8px 20px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
            Request Demo
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background:S.dark, padding:'80px 48px 60px', color:'#fff' }}>
        <div style={{ maxWidth:1000, margin:'0 auto' }}>
          <div style={{ fontSize:11, fontWeight:600, color:S.blue, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:16 }}>For Hospitals & Healthcare Institutions</div>
          <h1 style={{ fontSize:52, fontWeight:700, letterSpacing:'-0.03em', lineHeight:1.08, margin:'0 0 20px', maxWidth:700 }}>
            Clinical intelligence for<br/>
            <span style={{ color:S.blue }}>mental health at scale.</span>
          </h1>
          <p style={{ fontSize:16, color:'rgba(255,255,255,0.6)', lineHeight:1.7, maxWidth:560, marginBottom:40 }}>
            PsycheFlow gives hospital psychiatry departments and mental health units the tools to standardize intake, reduce documentation burden, monitor patient populations, and meet NABH accreditation requirements.
          </p>
          <div style={{ display:'flex', gap:12 }}>
            <button onClick={() => document.getElementById('contact-form').scrollIntoView({behavior:'smooth'})}
              style={{ padding:'13px 28px', background:S.blue, color:'#fff', border:'none', borderRadius:10, fontSize:15, fontWeight:600, cursor:'pointer' }}>
              Request a demo
            </button>
            <button onClick={() => document.getElementById('nabh').scrollIntoView({behavior:'smooth'})}
              style={{ padding:'13px 28px', background:'rgba(255,255,255,0.06)', color:'#fff', border:'0.5px solid rgba(255,255,255,0.15)', borderRadius:10, fontSize:15, fontWeight:600, cursor:'pointer' }}>
              View NABH compliance
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background:'#0F2444', padding:'40px 48px' }}>
        <div style={{ maxWidth:1000, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:32 }}>
          <Stat value="197M" label="Indians need mental health support" />
          <Stat value="19" label="Validated ML models for clinical assessment" />
          <Stat value="14" label="Clinical instruments in one assessment" />
          <Stat value="< 500ms" label="Crisis alert delivery to psychologist" />
        </div>
      </div>

      {/* Core problems */}
      <div style={{ padding:'80px 48px', background:S.bg }}>
        <div style={{ maxWidth:1000, margin:'0 auto' }}>
          <div style={{ fontSize:11, fontWeight:600, color:S.blue, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:12 }}>The Problem</div>
          <h2 style={{ fontSize:32, fontWeight:700, color:S.navy, letterSpacing:'-0.02em', margin:'0 0 40px', maxWidth:600, lineHeight:1.2 }}>Hospital psychiatry departments face three unsolved problems.</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
            {[
              { n:'01', title:'Intake bottleneck', desc:'OPD psychiatry queues average 2-3 hours. Consultations are 10 minutes. Doctors walk in knowing nothing about the patient. PsycheFlow completes a full 14-instrument digital assessment before the patient sits down.' },
              { n:'02', title:'Documentation burden', desc:'Psychologists spend 30-40% of their time on paperwork — session notes, care plans, referral letters. For NABH accreditation, this documentation must be structured and auditable. PsycheFlow automates it.' },
              { n:'03', title:'No population visibility', desc:'Hospitals cannot answer: what percentage of our depression patients improved in 6 months? Which wards have the highest anxiety burden? PsycheFlow’s population analytics answer these questions with real data.' },
            ].map((p,i) => (
              <div key={i} style={{ padding:28, borderRadius:12, border:'0.5px solid '+S.border, background:S.card, boxShadow:'0 1px 4px rgba(29,78,216,0.06)' }}>
                <div style={{ fontSize:28, fontWeight:700, color:S.border, marginBottom:16, letterSpacing:'-0.02em' }}>{p.n}</div>
                <div style={{ fontSize:15, fontWeight:700, color:S.navy, marginBottom:8 }}>{p.title}</div>
                <div style={{ fontSize:13, color:S.muted, lineHeight:1.8 }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{ padding:'0 48px 80px', background:S.bg }}>
        <div style={{ maxWidth:1000, margin:'0 auto' }}>
          <div style={{ fontSize:11, fontWeight:600, color:S.blue, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:12 }}>Capabilities</div>
          <h2 style={{ fontSize:32, fontWeight:700, color:S.navy, letterSpacing:'-0.02em', margin:'0 0 32px', lineHeight:1.2 }}>Built for hospital-grade clinical workflows.</h2>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <Feature tag="Intake" title="Digital pre-consultation assessment" desc="Patients complete PHQ-9, GAD-7, Big Five, PTSD, OCD, ADHD, and 8 other validated instruments on their phone before entering the consultation room. The consulting psychiatrist receives a structured report before the session begins. Average intake time reduction: 35-40%." />
            <Feature tag="Documentation" title="AI-generated SOAP notes" desc="Describe what happened in a session in plain language. PsycheFlow structures it into a clinical SOAP note compliant with standard medical documentation formats. Notes are stored, searchable, and exportable. Reduces documentation time by an estimated 60%." />
            <Feature tag="Safety" title="Automated crisis escalation" desc="When PHQ-9 exceeds 20, GAD-7 exceeds 15, or C-SSRS suicide risk language is detected, the responsible clinician receives an instant alert with the patient’s current scores and trigger type. Acknowledgment and response are logged for audit purposes." />
            <Feature tag="Analytics" title="Population health dashboard" desc="Department-level dashboards showing risk distribution across your patient population, PHQ-9 and GAD-7 trend cohorts, session adherence rates, and longitudinal outcome data. Exportable quarterly reports for hospital leadership and board presentations." />
            <Feature tag="Training" title="Supervisor-trainee oversight" desc="Supervisors can review the cases handled by interns and residents, flag clinical reasoning gaps, and generate case summaries for supervision sessions. Designed for teaching hospitals and departments running internship programs." />
            <Feature tag="Referral" title="Cross-department referral system" desc="Any department can flag a patient for psychiatric evaluation using a structured referral form. The referral appears in the psychiatry department’s queue with the referring doctor’s notes. Closes the loop with an automated update when the patient is seen." />
          </div>
        </div>
      </div>

      {/* NABH */}
      <div id="nabh" style={{ padding:'80px 48px', background:'#F1F5FF' }}>
        <div style={{ maxWidth:1000, margin:'0 auto' }}>
          <div style={{ fontSize:11, fontWeight:600, color:S.blue, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:12 }}>Compliance</div>
          <h2 style={{ fontSize:32, fontWeight:700, color:S.navy, letterSpacing:'-0.02em', margin:'0 0 8px', lineHeight:1.2 }}>Built around NABH standards.</h2>
          <p style={{ fontSize:14, color:S.muted, marginBottom:36, lineHeight:1.7 }}>PsycheFlow is designed to directly support hospitals pursuing or maintaining NABH accreditation under the Mental Health chapter of the NABH standards.</p>
          <div style={{ background:S.card, borderRadius:12, border:'0.5px solid '+S.border, padding:'0 28px', boxShadow:'0 1px 4px rgba(29,78,216,0.06)' }}>
            <NABHItem code="MHC 1" title="Assessment of patients with mental health needs" desc="PsycheFlow’s 14-instrument digital assessment provides standardized, documented intake evaluation. Results are stored with timestamps and are auditable — directly supporting NABH’s requirement for systematic mental health assessment." />
            <NABHItem code="MHC 2" title="Care planning for mental health patients" desc="AI-generated care summaries and SOAP notes provide the structured documentation NABH requires for care planning. Each plan is linked to the patient’s assessment scores and updated automatically as scores change." />
            <NABHItem code="MHC 3" title="High-risk patient identification and management" desc="Automated crisis detection with C-SSRS screening, PHQ-9 and GAD-7 threshold alerts, and real-time escalation to responsible clinicians. All alerts are logged with response timestamps for NABH audit purposes." />
            <NABHItem code="MHC 4" title="Patient rights and informed consent" desc="PsycheFlow’s consent module is built around DPDP Act 2023. Patients provide explicit informed consent before any assessment. Consent records are stored with timestamps and are exportable for NABH documentation." />
            <NABHItem code="QPS 1" title="Quality monitoring and outcome measurement" desc="Population health dashboards provide the outcome data NABH requires for quality monitoring — PHQ-9 improvement rates, risk level distribution, session adherence, and longitudinal trajectories. Exportable as quarterly reports." />
            <NABHItem code="HIC 1" title="Hospital infection control and data security" desc="All patient data encrypted at rest (AES-256) and in transit (TLS). Row-level security ensures clinicians can only access their own patients' data. Full audit logs maintained for all data access and modifications." />
          </div>
          <p style={{ fontSize:12, color:S.hint, marginTop:16 }}>NABH standards referenced: Mental Health Care Standards, 5th Edition. PsycheFlow is a decision-support tool — clinical judgment remains with the treating physician.</p>
        </div>
      </div>

      {/* Contact form */}
      <div id="contact-form" style={{ padding:'80px 48px', background:S.bg }}>
        <div style={{ maxWidth:600, margin:'0 auto' }}>
          <div style={{ fontSize:11, fontWeight:600, color:S.blue, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:12 }}>Get in touch</div>
          <h2 style={{ fontSize:32, fontWeight:700, color:S.navy, letterSpacing:'-0.02em', margin:'0 0 8px' }}>Request a demo.</h2>
          <p style={{ fontSize:14, color:S.muted, marginBottom:36 }}>We'll reach out within 24 hours to schedule a walkthrough tailored to your department’s workflow.</p>
          {submitted ? (
            <div style={{ background:S.lightBlue, border:'0.5px solid '+S.border, borderRadius:12, padding:32, textAlign:'center' }}>
              <div style={{ fontSize:18, fontWeight:700, color:S.navy, marginBottom:8 }}>Thank you</div>
              <div style={{ fontSize:14, color:S.muted }}>We'll be in touch within 24 hours at {formData.email}.</div>
            </div>
          ) : (
            <div style={{ background:S.card, borderRadius:12, border:'0.5px solid '+S.border, padding:32, boxShadow:'0 1px 4px rgba(29,78,216,0.06)' }}>
              {[['Your name','name','text','Dr. Sharma'],['Work email','email','email','you@hospital.com'],['Hospital / Institution name','hospital','text','Apollo Hospitals, Delhi'],['City','city','text','New Delhi']].map(([label,field,type,ph]) => (
                <div key={field} style={{ marginBottom:16 }}>
                  <label style={{ fontSize:12, fontWeight:600, color:S.muted, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</label>
                  <input type={type} value={formData[field]} onChange={e => setFormData({...formData,[field]:e.target.value})} placeholder={ph}
                    style={{ width:'100%', padding:'11px 14px', borderRadius:8, border:'0.5px solid '+S.border, fontSize:14, boxSizing:'border-box', outline:'none', fontFamily:"'Satoshi',-apple-system,sans-serif", color:S.navy, background:S.bg }}
                    onFocus={e=>e.target.style.borderColor=S.blue} onBlur={e=>e.target.style.borderColor=S.border}
                  />
                </div>
              ))}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
                <div>
                  <label style={{ fontSize:12, fontWeight:600, color:S.muted, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Hospital bed count</label>
                  <select value={formData.beds} onChange={e => setFormData({...formData,beds:e.target.value})}
                    style={{ width:'100%', padding:'11px 14px', borderRadius:8, border:'0.5px solid '+S.border, fontSize:14, boxSizing:'border-box', outline:'none', background:S.bg, color:S.navy, fontFamily:"'Satoshi',-apple-system,sans-serif" }}>
                    <option value="">Select</option>
                    {['Under 50','50-200','200-500','500-1000','1000+'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:600, color:S.muted, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Psychologists on staff</label>
                  <select value={formData.psychologists} onChange={e => setFormData({...formData,psychologists:e.target.value})}
                    style={{ width:'100%', padding:'11px 14px', borderRadius:8, border:'0.5px solid '+S.border, fontSize:14, boxSizing:'border-box', outline:'none', background:S.bg, color:S.navy, fontFamily:"'Satoshi',-apple-system,sans-serif" }}>
                    <option value="">Select</option>
                    {['1-2','3-5','6-10','11-20','20+'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom:24 }}>
                <label style={{ fontSize:12, fontWeight:600, color:S.muted, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Anything specific you want to see in the demo?</label>
                <textarea value={formData.message} onChange={e => setFormData({...formData,message:e.target.value})} placeholder="e.g. NABH documentation workflow, crisis escalation, population analytics..."
                  rows={3} style={{ width:'100%', padding:'11px 14px', borderRadius:8, border:'0.5px solid '+S.border, fontSize:14, boxSizing:'border-box', outline:'none', fontFamily:"'Satoshi',-apple-system,sans-serif", color:S.navy, background:S.bg, resize:'vertical' }}
                  onFocus={e=>e.target.style.borderColor=S.blue} onBlur={e=>e.target.style.borderColor=S.border}
                />
              </div>
              <button onClick={handleSubmit} disabled={sending || !formData.name || !formData.email || !formData.hospital}
                style={{ width:'100%', padding:'13px', background: (!formData.name||!formData.email||!formData.hospital) ? S.border : S.blue, color: (!formData.name||!formData.email||!formData.hospital) ? S.hint : '#fff', border:'none', borderRadius:8, fontSize:15, fontWeight:600, cursor: (!formData.name||!formData.email||!formData.hospital) ? 'not-allowed' : 'pointer' }}>
                {sending ? 'Sending...' : 'Request demo'}
              </button>
              <p style={{ fontSize:11, color:S.hint, textAlign:'center', marginTop:12 }}>We respond within 24 hours · dpksaxena21@gmail.com</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
