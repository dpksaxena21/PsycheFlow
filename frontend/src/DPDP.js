import React from 'react';
const S = { blue:'#1D4ED8', navy:'#0C1A2E', bg:'#F8FAFF', card:'#FFFFFF', border:'#E2EBF6', muted:'#3B5998', hint:'#94a3b8', lightBlue:'#EFF6FF' };
const Section = ({ title, children }) => (
  <div style={{ marginBottom:32 }}>
    <h2 style={{ fontSize:16, fontWeight:700, color:S.navy, letterSpacing:'-0.01em', marginBottom:12, paddingBottom:8, borderBottom:'0.5px solid '+S.border }}>{title}</h2>
    <div style={{ fontSize:14, color:S.muted, lineHeight:1.8 }}>{children}</div>
  </div>
);
export default function DPDP({ onBack }) {
  return (
    <div style={{ fontFamily:"'Satoshi',-apple-system,sans-serif", background:S.bg, minHeight:'100vh', padding:'40px 24px' }}>
      <div style={{ maxWidth:720, margin:'0 auto' }}>
        <button onClick={onBack} style={{ fontSize:13, color:S.blue, background:'none', border:'none', cursor:'pointer', marginBottom:32, fontWeight:600 }}>← Back</button>
        <div style={{ marginBottom:32 }}>
          <div style={{ fontSize:11, fontWeight:600, color:S.blue, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8 }}>Compliance</div>
          <h1 style={{ fontSize:28, fontWeight:700, color:S.navy, letterSpacing:'-0.02em', margin:'0 0 8px' }}>DPDP Act 2023 Compliance</h1>
          <p style={{ fontSize:13, color:S.hint, margin:0 }}>How PsycheFlow complies with India's Digital Personal Data Protection Act 2023</p>
        </div>
        <div style={{ background:S.card, borderRadius:12, padding:32, border:'0.5px solid '+S.border, boxShadow:'0 1px 4px rgba(29,78,216,0.06)' }}>
          <Section title="Overview">
            <p>The Digital Personal Data Protection (DPDP) Act 2023 is India's primary data protection legislation. PsycheFlow, as a platform that processes sensitive personal data including psychological assessments and clinical records, takes compliance seriously.</p>
          </Section>
          <Section title="Lawful Basis for Processing">
            <p>We process your personal data on the basis of <strong>explicit consent</strong>. When you register on PsycheFlow, you are presented with a consent screen that clearly explains what data we collect, how we use it, and your rights. You must actively consent before accessing any features.</p>
            <p>You can withdraw this consent at any time by deleting your account or contacting us at dpksaxena21@gmail.com.</p>
          </Section>
          <Section title="Sensitive Personal Data">
            <p>Psychological assessment data, mental health records, and clinical notes are classified as <strong>sensitive personal data</strong> under the DPDP Act. We apply additional protections to this data:</p>
            <p>• Stored in encrypted form at rest (AES-256) and in transit (TLS).</p>
            <p>• Access controlled via Row Level Security — each user can only access their own records.</p>
            <p>• Psychologist access to patient data requires explicit patient consent via share code.</p>
            <p>• Full audit logs of all data access and modifications are maintained.</p>
          </Section>
          <Section title="Data Fiduciary Obligations">
            <p>As a Data Fiduciary under the DPDP Act, PsycheFlow:</p>
            <p>• Collects only the minimum data necessary for the service (data minimization).</p>
            <p>• Specifies the purpose of data collection clearly before collection.</p>
            <p>• Does not retain data beyond the period necessary for the stated purpose.</p>
            <p>• Implements reasonable security safeguards to prevent data breaches.</p>
            <p>• Notifies affected users in the event of a data breach.</p>
          </Section>
          <Section title="Data Principal Rights">
            <p>As a Data Principal (user), you have the following rights under the DPDP Act:</p>
            <p>• <strong>Right to access:</strong> Request a copy of all personal data we hold about you.</p>
            <p>• <strong>Right to correction:</strong> Request correction of inaccurate data.</p>
            <p>• <strong>Right to erasure:</strong> Request deletion of your data. We will comply within 30 days.</p>
            <p>• <strong>Right to grievance redressal:</strong> Contact our grievance officer at dpksaxena21@gmail.com. We respond within 72 hours.</p>
            <p>• <strong>Right to nominate:</strong> You may nominate another person to exercise these rights on your behalf in the event of your death or incapacity.</p>
          </Section>
          <Section title="Children's Data">
            <p>PsycheFlow does not knowingly collect data from individuals under 18 years of age. If you believe a minor has registered, please contact us immediately at dpksaxena21@gmail.com.</p>
          </Section>
          <Section title="Cross-Border Data Transfer">
            <p>Your data is stored on Supabase servers in Singapore (ap-southeast-1). AI processing is performed via Anthropic's API servers. Both transfers occur under appropriate data processing agreements and security standards consistent with DPDP Act requirements for cross-border transfers.</p>
          </Section>
          <Section title="Grievance Officer">
            <p>Name: Deepak Saxena</p>
            <p>Email: dpksaxena21@gmail.com</p>
            <p>Address: Vaishali, Ghaziabad, Uttar Pradesh, India</p>
            <p>Response time: Within 72 hours</p>
          </Section>
        </div>
      </div>
    </div>
  );
}
