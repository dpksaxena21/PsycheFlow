import React from 'react';
const S = { blue:'#1D4ED8', navy:'#0C1A2E', bg:'#F8FAFF', card:'#FFFFFF', border:'#E2EBF6', muted:'#3B5998', hint:'#94a3b8', lightBlue:'#EFF6FF' };
const Section = ({ title, children }) => (
  <div style={{ marginBottom:32 }}>
    <h2 style={{ fontSize:16, fontWeight:700, color:S.navy, letterSpacing:'-0.01em', marginBottom:12, paddingBottom:8, borderBottom:'0.5px solid '+S.border }}>{title}</h2>
    <div style={{ fontSize:14, color:S.muted, lineHeight:1.8 }}>{children}</div>
  </div>
);
export default function Privacy({ onBack }) {
  return (
    <div style={{ fontFamily:"'Satoshi',-apple-system,sans-serif", background:S.bg, minHeight:'100vh', padding:'40px 24px' }}>
      <div style={{ maxWidth:720, margin:'0 auto' }}>
        <button onClick={onBack} style={{ fontSize:13, color:S.blue, background:'none', border:'none', cursor:'pointer', marginBottom:32, fontWeight:600 }}>← Back</button>
        <div style={{ marginBottom:32 }}>
          <div style={{ fontSize:11, fontWeight:600, color:S.blue, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8 }}>Legal</div>
          <h1 style={{ fontSize:28, fontWeight:700, color:S.navy, letterSpacing:'-0.02em', margin:'0 0 8px' }}>Privacy Policy</h1>
          <p style={{ fontSize:13, color:S.hint, margin:0 }}>Last updated: June 2026 · Effective immediately</p>
        </div>
        <div style={{ background:S.card, borderRadius:12, padding:32, border:'0.5px solid '+S.border, boxShadow:'0 1px 4px rgba(29,78,216,0.06)' }}>
          <Section title="1. Who We Are">
            <p>PsycheFlow is an AI-powered psychological assessment and clinical support platform operated by Deepak Saxena, based in Vaishali, Ghaziabad, India. We can be reached at dpksaxena21@gmail.com.</p>
            <p>PsycheFlow is designed as a Class B Software as a Medical Device (SaMD) under India's Medical Device Rules 2017 and is built in compliance with the Digital Personal Data Protection (DPDP) Act 2023.</p>
          </Section>
          <Section title="2. What Data We Collect">
            <p><strong>Account data:</strong> Your email address, display name, role (patient or psychologist), and registration date.</p>
            <p><strong>Assessment data:</strong> Your responses to psychological instruments including PHQ-9, GAD-7, Big Five personality, Dark Triad, and other validated clinical tools. Your scores and AI-generated predictions.</p>
            <p><strong>Journal entries:</strong> The text you write in the journal feature, along with AI-generated emotion analysis of that text.</p>
            <p><strong>Mood check-ins:</strong> Your daily mood logs and any notes attached to them.</p>
            <p><strong>Appointment data:</strong> Scheduled sessions, statuses, and notes.</p>
            <p><strong>Usage data:</strong> Audit logs of actions taken within the platform, stored for DPDP Act 2023 compliance purposes.</p>
            <p><strong>Conversation data:</strong> Messages exchanged with Dr. PsycheFlow AI and with linked psychologists.</p>
          </Section>
          <Section title="3. How We Use Your Data">
            <p>We use your data solely to provide the PsycheFlow service. Specifically:</p>
            <p>• To generate your psychological assessment results using our trained ML models.</p>
            <p>• To personalize the AI chatbot and clinical interview with your context.</p>
            <p>• To enable your psychologist (if linked) to view your assessment history and provide clinical support.</p>
            <p>• To detect crisis situations and escalate to your linked psychologist when necessary.</p>
            <p>• To maintain audit logs as required under DPDP Act 2023.</p>
            <p>We do not use your data for advertising. We do not sell your data to any third party.</p>
          </Section>
          <Section title="4. Where Your Data Is Stored">
            <p>Your data is stored in a PostgreSQL database hosted by Supabase on servers located in the Singapore (ap-southeast-1) region. All data is encrypted in transit using TLS and at rest using AES-256 encryption.</p>
            <p>AI processing is handled via the Anthropic API. Assessment responses are sent to Anthropic's servers for language model inference. Anthropic's data handling is governed by their privacy policy.</p>
          </Section>
          <Section title="5. Data Sharing">
            <p><strong>With your psychologist:</strong> If you link to a psychologist using a share code, they will be able to view your assessment history, session data, and AI pre-session briefs. You control this link and can request it be removed.</p>
            <p><strong>With Anthropic:</strong> Conversation text is processed by Claude AI. We use strict system prompts to prevent unnecessary data retention.</p>
            <p><strong>With no one else:</strong> We do not share, sell, or license your personal or clinical data to any other party.</p>
          </Section>
          <Section title="6. Your Rights Under DPDP Act 2023">
            <p>Under India's Digital Personal Data Protection Act 2023, you have the right to:</p>
            <p>• <strong>Access</strong> your personal data held by us.</p>
            <p>• <strong>Correction</strong> of inaccurate or incomplete data.</p>
            <p>• <strong>Erasure</strong> of your data upon account deletion.</p>
            <p>• <strong>Withdraw consent</strong> at any time, which will result in account deactivation.</p>
            <p>• <strong>Grievance redressal</strong> by contacting us at dpksaxena21@gmail.com.</p>
            <p>To exercise any of these rights, email us with your registered email address. We will respond within 72 hours.</p>
          </Section>
          <Section title="7. Data Retention">
            <p>We retain your data for as long as your account is active. If you delete your account, your personal data and clinical records will be permanently deleted within 30 days. Anonymized aggregate data may be retained for research and model improvement purposes.</p>
          </Section>
          <Section title="8. Clinical Data Notice">
            <p>PsycheFlow is not a substitute for professional mental health diagnosis or treatment. Assessment results are screening tools, not clinical diagnoses. If you are experiencing a mental health crisis, please contact iCall at 9152987821 or Vandrevala Foundation at 1860-2662-345.</p>
          </Section>
          <Section title="9. Contact">
            <p>For any privacy-related questions or to exercise your rights: dpksaxena21@gmail.com</p>
            <p>Address: Vaishali, Ghaziabad, Uttar Pradesh, India</p>
          </Section>
        </div>
      </div>
    </div>
  );
}
