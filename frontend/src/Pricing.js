import React, { useState } from 'react';

const S = { navy:'#0C1A2E', blue:'#1D4ED8', bg:'#F8FAFF', border:'#E2EBF6', muted:'#3B5998', hint:'#94a3b8', success:'#059669', warning:'#D97706', purple:'#7C3AED' };

const PLANS = [
  {
    id: 'free', name: 'Free', price: 0, period: '', badge: null,
    desc: 'For individual patients getting started',
    color: S.hint,
    features: ['Patient dashboard', 'PHQ-9 & GAD-7 assessments', 'AI Clinical Interview (3/month)', 'Journal (5 entries/month)', 'ACT Therapy exercises', 'Crisis support'],
    missing: ['Psychologist portal', 'Hospital portal', 'Unlimited assessments', 'SMS alerts', 'Reports & analytics'],
    cta: 'Get Started Free', ctaStyle: { background: 'transparent', color: S.blue, border: `1px solid ${S.blue}` },
  },
  {
    id: 'psychologist', name: 'Psychologist', price: 999, period: '/month', badge: null,
    desc: 'For individual psychologists',
    color: S.blue,
    features: ['Everything in Free', 'Psychologist portal', 'Up to 30 patients', 'AI Clinical Copilot', 'Session workspace (SOAP/DAP/BIRP)', 'Treatment planning', 'Crisis alerts', 'Journal intelligence', 'Assessment analytics', 'Unlimited assessments'],
    missing: ['Hospital portal', 'Multi-doctor support', 'Hospital analytics', 'NABH module'],
    cta: 'Start 14-Day Trial', ctaStyle: { background: S.blue, color: '#fff', border: 'none' },
  },
  {
    id: 'hospital_starter', name: 'Hospital Starter', price: 4999, period: '/month', badge: 'Most Popular',
    desc: 'For small hospitals & clinics (up to 50 beds)',
    color: S.success,
    features: ['Everything in Psychologist', 'Hospital portal (full)', 'OPD management', 'IPD & bed tracking', 'Pharmacy module', 'Lab module', 'Billing & RCM', 'Up to 5 psychologists', 'Up to 1,000 patients', '500 SMS credits/month', 'Basic analytics', 'Email support'],
    missing: ['Advanced AI analytics', 'Insurance/TPA module', 'NABH module', 'Multi-branch'],
    cta: 'Start Free Trial', ctaStyle: { background: S.success, color: '#fff', border: 'none' },
  },
  {
    id: 'hospital_pro', name: 'Hospital Professional', price: 14999, period: '/month', badge: null,
    desc: 'For medium hospitals (up to 200 beds)',
    color: S.purple,
    features: ['Everything in Starter', 'Up to 100 psychologists', 'Up to 5,000 patients', 'Advanced analytics & BI', 'Insurance/TPA module', 'NABH compliance module', 'AI population analytics', 'Cross-referral network', '2,000 SMS credits/month', 'Priority support', 'Custom integrations'],
    missing: ['Unlimited scale', 'Dedicated CSM', 'Custom AI models'],
    cta: 'Contact Sales', ctaStyle: { background: S.purple, color: '#fff', border: 'none' },
  },
  {
    id: 'enterprise', name: 'Enterprise', price: null, period: '', badge: 'Custom',
    desc: 'For hospital chains & large healthcare systems',
    color: S.navy,
    features: ['Everything in Professional', 'Unlimited hospitals & beds', 'Unlimited patients & staff', 'Dedicated infrastructure', 'Custom AI model training', 'ABDM/ABHA integration', 'Custom compliance reporting', 'White-label option', 'Dedicated CSM', 'SLA guarantee (99.9%)', 'On-premise deployment option', '24/7 phone support'],
    missing: [],
    cta: 'Talk to Enterprise Team', ctaStyle: { background: S.navy, color: '#fff', border: 'none' },
  },
];

const FAQS = [
  { q: 'Is there a free trial?', a: 'Yes — Psychologist plan comes with a 14-day free trial. Hospital plans can be trialed for 30 days with a sales conversation.' },
  { q: 'Is patient data safe?', a: 'All data is encrypted at rest and in transit. We are DPDP Act 2023 compliant with RLS on all database tables. Patient data is never sold or shared.' },
  { q: 'Can I upgrade or downgrade?', a: 'Yes, you can change plans at any time. Upgrades are effective immediately; downgrades take effect at the next billing cycle.' },
  { q: 'Do you support NABH hospitals?', a: 'Yes — Hospital Professional and Enterprise plans include NABH compliance modules including audit trails, incident reporting, and quality dashboards.' },
  { q: 'What happens to data if I cancel?', a: 'You get a 30-day grace period to export all your data in JSON/CSV format. After 30 days, data is deleted per DPDP retention policies.' },
  { q: 'Is PsycheFlow available in Hindi?', a: 'English UI currently. Hindi language support is on the roadmap for Q3 2026.' },
];

export default function Pricing({ onBack, onGetStarted }) {
  const [billing, setBilling] = useState('monthly');
  const [openFAQ, setOpenFAQ] = useState(null);

  return (
    <div style={{ fontFamily: "'Satoshi',-apple-system,sans-serif", background: S.bg, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: S.navy, padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#1D4ED8,#0891B2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C9 1.5 4 5 4 10C4 12.8 6.2 15 9 15C11.8 15 14 12.8 14 10C14 5 9 1.5 9 1.5Z" fill="white" opacity="0.9"/><circle cx="9" cy="10" r="2.2" fill="#0C1A2E"/></svg>
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}><span style={{ color: '#93C5FD' }}>Psyche</span>Flow</span>
        </div>
        <button onClick={onBack} style={{ padding: '7px 16px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>← Back</button>
      </div>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '60px 24px 40px' }}>
        <div style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 100, background: '#EFF6FF', color: S.blue, fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 16 }}>Pricing</div>
        <h1 style={{ fontSize: 40, fontWeight: 700, color: S.navy, letterSpacing: '-0.03em', margin: '0 0 12px' }}>Simple, transparent pricing</h1>
        <p style={{ fontSize: 16, color: S.muted, maxWidth: 520, margin: '0 auto 32px', lineHeight: 1.6 }}>From individual patients to 500-bed hospitals. Start free, scale as you grow.</p>
        {/* Billing toggle */}
        <div style={{ display: 'inline-flex', background: '#E2EBF6', borderRadius: 100, padding: 3 }}>
          {['monthly', 'yearly'].map(b => (
            <button key={b} onClick={() => setBilling(b)} style={{ padding: '7px 20px', borderRadius: 100, border: 'none', fontSize: 13, fontWeight: billing === b ? 700 : 400, background: billing === b ? '#fff' : 'transparent', color: billing === b ? S.navy : S.muted, cursor: 'pointer', boxShadow: billing === b ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }}>
              {b === 'yearly' ? 'Yearly (save 20%)' : 'Monthly'}
            </button>
          ))}
        </div>
      </div>

      {/* Plans */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 60px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
        {PLANS.map(plan => (
          <div key={plan.id} style={{ background: '#fff', borderRadius: 16, border: `1px solid ${plan.id === 'hospital_starter' ? plan.color : S.border}`, boxShadow: plan.id === 'hospital_starter' ? `0 8px 32px ${plan.color}20` : '0 1px 4px rgba(0,0,0,0.06)', padding: 24, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
            {plan.badge && <div style={{ position: 'absolute', top: 12, right: 12, padding: '2px 10px', borderRadius: 100, background: plan.color, color: '#fff', fontSize: 11, fontWeight: 700 }}>{plan.badge}</div>}
            <div style={{ width: 36, height: 36, borderRadius: 10, background: plan.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: plan.color }}/>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: S.navy, marginBottom: 4 }}>{plan.name}</div>
            <div style={{ fontSize: 11, color: S.muted, marginBottom: 16, lineHeight: 1.5 }}>{plan.desc}</div>
            <div style={{ marginBottom: 20 }}>
              {plan.price !== null ? (
                <div>
                  <span style={{ fontSize: 32, fontWeight: 700, color: S.navy, letterSpacing: '-0.02em' }}>
                    {plan.price === 0 ? 'Free' : '₹' + (billing === 'yearly' ? Math.round(plan.price * 0.8).toLocaleString() : plan.price.toLocaleString())}
                  </span>
                  {plan.price > 0 && <span style={{ fontSize: 13, color: S.muted }}>{plan.period}</span>}
                  {billing === 'yearly' && plan.price > 0 && <div style={{ fontSize: 11, color: S.success, fontWeight: 600, marginTop: 2 }}>Save ₹{Math.round(plan.price * 0.2 * 12).toLocaleString()}/year</div>}
                </div>
              ) : (
                <div style={{ fontSize: 22, fontWeight: 700, color: S.navy }}>Custom</div>
              )}
            </div>
            <button onClick={onGetStarted} style={{ width: '100%', padding: '10px', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 20, ...plan.ctaStyle }}>{plan.cta}</button>
            <div style={{ flex: 1 }}>
              {plan.features.map(f => (
                <div key={f} style={{ display: 'flex', gap: 8, marginBottom: 7 }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="8" cy="8" r="7" fill={plan.color + '20'}/><path d="M5 8l2 2 4-4" stroke={plan.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span style={{ fontSize: 12, color: S.navy }}>{f}</span>
                </div>
              ))}
              {plan.missing.map(f => (
                <div key={f} style={{ display: 'flex', gap: 8, marginBottom: 7, opacity: 0.35 }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="8" cy="8" r="7" fill="#E2EBF6"/><path d="M5 8h6" stroke={S.hint} strokeWidth="1.5" strokeLinecap="round"/></svg>
                  <span style={{ fontSize: 12, color: S.muted }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Feature comparison table */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 60px' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: S.navy, textAlign: 'center', marginBottom: 32, letterSpacing: '-0.02em' }}>What's included</h2>
        <div style={{ background: '#fff', borderRadius: 16, border: `0.5px solid ${S.border}`, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: S.bg }}>
                <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 700, color: S.muted, textAlign: 'left', borderBottom: `0.5px solid ${S.border}` }}>Feature</th>
                {['Free', 'Psychologist', 'Starter', 'Professional', 'Enterprise'].map(p => (
                  <th key={p} style={{ padding: '14px 12px', fontSize: 11, fontWeight: 700, color: S.muted, textAlign: 'center', borderBottom: `0.5px solid ${S.border}` }}>{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Patient Dashboard', true, true, true, true, true],
                ['AI Assessments', '3/mo', 'Unlimited', 'Unlimited', 'Unlimited', 'Unlimited'],
                ['Psychologist Portal', false, true, true, true, true],
                ['Hospital Portal', false, false, true, true, true],
                ['AI Clinical Copilot', false, true, true, true, true],
                ['Crisis Detection', true, true, true, true, true],
                ['Session Workspace', false, true, true, true, true],
                ['SOAP/DAP/BIRP Notes', false, true, true, true, true],
                ['Pharmacy Module', false, false, true, true, true],
                ['Lab Module', false, false, true, true, true],
                ['Billing & RCM', false, false, true, true, true],
                ['Insurance/TPA', false, false, false, true, true],
                ['NABH Module', false, false, false, true, true],
                ['ABDM Integration', false, false, false, false, true],
                ['White Label', false, false, false, false, true],
                ['SLA (99.9%)', false, false, false, false, true],
              ].map(([feature, ...vals]) => (
                <tr key={feature} style={{ borderBottom: `0.5px solid ${S.border}` }}
                  onMouseEnter={e => e.currentTarget.style.background = S.bg}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '11px 20px', fontSize: 13, color: S.navy }}>{feature}</td>
                  {vals.map((val, i) => (
                    <td key={i} style={{ padding: '11px 12px', textAlign: 'center', fontSize: 12, fontWeight: val === true ? 600 : 400 }}>
                      {val === true ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" fill="#ECFDF5"/><path d="M5 8l2 2 4-4" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> :
                       val === false ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" fill="#F9FAFB"/><path d="M5.5 10.5l5-5M10.5 10.5l-5-5" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round"/></svg> :
                       <span style={{ color: S.blue, fontWeight: 600 }}>{val}</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQs */}
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: S.navy, textAlign: 'center', marginBottom: 32, letterSpacing: '-0.02em' }}>Frequently asked questions</h2>
        {FAQS.map((faq, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 12, border: `0.5px solid ${S.border}`, marginBottom: 10, overflow: 'hidden' }}>
            <div onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', cursor: 'pointer' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: S.navy }}>{faq.q}</div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ transform: openFAQ === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}><path d="M6 9l6 6 6-6" stroke={S.muted} strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
            {openFAQ === i && <div style={{ padding: '0 20px 16px', fontSize: 13, color: S.muted, lineHeight: 1.7 }}>{faq.a}</div>}
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ background: S.navy, padding: '60px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', marginBottom: 12 }}>Ready to transform mental healthcare?</h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', marginBottom: 28 }}>Join hospitals and psychologists already using PsycheFlow.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={onGetStarted} style={{ padding: '12px 28px', background: S.blue, color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Get Started Free</button>
          <a href="mailto:sales@psycheflow.in" style={{ padding: '12px 28px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }}>Talk to Sales</a>
        </div>
      </div>
    </div>
  );
}
