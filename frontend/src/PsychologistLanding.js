import React from 'react';
const S = { blue:'#1D4ED8', navy:'#0C1A2E', bg:'#0C1A2E', card:'rgba(255,255,255,0.05)', border:'rgba(255,255,255,0.1)', muted:'rgba(255,255,255,0.6)', hint:'rgba(255,255,255,0.35)', lightBlue:'#EFF6FF', cyan:'#0891B2' };

const Feature = ({ title, desc }) => (
  <div style={{ padding:24, borderRadius:12, border:'0.5px solid '+S.border, background:S.card, marginBottom:12 }}>
    <div style={{ fontSize:14, fontWeight:600, color:'#fff', marginBottom:6 }}>{title}</div>
    <div style={{ fontSize:13, color:S.muted, lineHeight:1.7 }}>{desc}</div>
  </div>
);

export default function PsychologistLanding({ onGetStarted, onBack }) {
  return (
    <div style={{ fontFamily:"'Satoshi',-apple-system,sans-serif", background:S.bg, minHeight:'100vh', color:'#fff' }}>
      {/* Nav */}
      <nav style={{ padding:'20px 48px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'0.5px solid '+S.border }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:S.blue, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="17" height="17" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C9 1.5 4 5 4 10C4 12.8 6.2 15 9 15C11.8 15 14 12.8 14 10C14 5 9 1.5 9 1.5Z" fill="white" opacity="0.9"/><circle cx="9" cy="10" r="2.2" fill="#0C1A2E"/></svg>
          </div>
          <span style={{ fontWeight:700, fontSize:15, letterSpacing:'-0.02em' }}>PsycheFlow</span>
        </div>
        <div style={{ display:'flex', gap:16, alignItems:'center' }}>
          <span onClick={onBack} style={{ fontSize:13, color:S.muted, cursor:'pointer' }}>For Patients</span>
          <button onClick={onGetStarted} style={{ padding:'8px 20px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>Sign in as Psychologist</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth:900, margin:'0 auto', padding:'80px 48px 60px' }}>
        <div style={{ fontSize:11, fontWeight:600, color:S.blue, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:16 }}>For Psychologists</div>
        <h1 style={{ fontSize:52, fontWeight:700, letterSpacing:'-0.03em', lineHeight:1.08, marginBottom:20, margin:'0 0 20px' }}>
          Less paperwork.<br/>
          <span style={{ color:S.blue }}>More time with patients.</span>
        </h1>
        <p style={{ fontSize:16, color:S.muted, lineHeight:1.7, maxWidth:520, marginBottom:36 }}>
          PsycheFlow handles intake assessments, session briefs, SOAP notes, and crisis monitoring — so you can focus on what actually matters.
        </p>
        <div style={{ display:'flex', gap:12 }}>
          <button onClick={onGetStarted} style={{ padding:'12px 28px', background:S.blue, color:'#fff', border:'none', borderRadius:10, fontSize:15, fontWeight:600, cursor:'pointer' }}>Get started free</button>
          <button onClick={onBack} style={{ padding:'12px 28px', background:'transparent', color:'#fff', border:'0.5px solid '+S.border, borderRadius:10, fontSize:15, fontWeight:600, cursor:'pointer' }}>View patient platform</button>
        </div>
        <p style={{ fontSize:12, color:S.hint, marginTop:12 }}>14-day free trial · No credit card · RCI verification required</p>
      </div>

      {/* Features */}
      <div style={{ maxWidth:900, margin:'0 auto', padding:'0 48px 80px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <Feature title="AI Pre-Session Briefs" desc="Before every session, PsycheFlow generates a summary of the patient's latest assessment scores, mood trends, journal themes, and risk flags. Walk in prepared." />
        <Feature title="One-Click SOAP Notes" desc="Describe what happened in a session. PsycheFlow structures it into a clinical SOAP note automatically — ready to save or edit." />
        <Feature title="Crisis Auto-Escalation" desc="When a patient's PHQ-9 exceeds 20, GAD-7 exceeds 15, or suicide risk language is detected, you receive an instant alert. No manual monitoring needed." />
        <Feature title="Patient Timeline" desc="Every assessment, mood check-in, journal entry, and session note in a single chronological view. Understand your patient's trajectory at a glance." />
        <Feature title="Practice Analytics" desc="Outcome tracking, risk distribution across your caseload, session frequency trends, and population health metrics — for solo practitioners and clinics." />
        <Feature title="Secure Messaging" desc="End-to-end encrypted chat with patients. Real-time, with read receipts and full message history. DPDP Act 2023 compliant." />
      </div>

      {/* Trust bar */}
      <div style={{ borderTop:'0.5px solid '+S.border, padding:'32px 48px', display:'flex', justifyContent:'center', gap:48 }}>
        {['DPDP Act 2023 compliant','RCI credential verification','SaMD Class B ready','End-to-end encrypted'].map(t => (
          <div key={t} style={{ fontSize:12, color:S.muted, fontWeight:500 }}>{t}</div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ textAlign:'center', padding:'60px 48px', borderTop:'0.5px solid '+S.border }}>
        <h2 style={{ fontSize:32, fontWeight:700, letterSpacing:'-0.02em', marginBottom:12 }}>Ready to try it?</h2>
        <p style={{ fontSize:15, color:S.muted, marginBottom:28 }}>Free 14-day trial. No credit card. Cancel anytime.</p>
        <button onClick={onGetStarted} style={{ padding:'14px 36px', background:S.blue, color:'#fff', border:'none', borderRadius:10, fontSize:16, fontWeight:600, cursor:'pointer' }}>Create your psychologist account</button>
        <p style={{ fontSize:12, color:S.hint, marginTop:12 }}>Already have an account? <span onClick={onGetStarted} style={{ color:S.blue, cursor:'pointer' }}>Sign in</span></p>
      </div>
    </div>
  );
}
