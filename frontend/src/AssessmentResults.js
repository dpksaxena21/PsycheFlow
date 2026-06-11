import React, { useState, useRef } from 'react';
import axios from 'axios';
const API = process.env.REACT_APP_API_URL || 'https://web-production-3887e.up.railway.app';

const S = {
  navy:'#0C1A2E', blue:'#1D4ED8', bg:'#F8FAFF', white:'#FFFFFF',
  border:'#E2EBF6', muted:'#3B5998', hint:'#94a3b8', lightBlue:'#EFF6FF',
  success:'#059669', warning:'#D97706', danger:'#DC2626', cyan:'#0891B2', purple:'#7C3AED',
};

// ── Severity helpers ──────────────────────────────────────
const phqLevel = (s) => s>=20?{label:'Severe',color:S.danger,bg:'#FEF2F2'}:s>=15?{label:'Mod-Severe',color:'#EF4444',bg:'#FEF2F2'}:s>=10?{label:'Moderate',color:S.warning,bg:'#FFFBEB'}:s>=5?{label:'Mild',color:'#F59E0B',bg:'#FFFBEB'}:{label:'Minimal',color:S.success,bg:'#ECFDF5'};
const gadLevel = (s) => s>=15?{label:'Severe',color:S.danger,bg:'#FEF2F2'}:s>=10?{label:'Moderate',color:S.warning,bg:'#FFFBEB'}:s>=5?{label:'Mild',color:'#F59E0B',bg:'#FFFBEB'}:{label:'Minimal',color:S.success,bg:'#ECFDF5'};
const scoreLevel = (s, max) => { const pct=s/max*100; return pct>=75?{label:'Severe',color:S.danger}:pct>=50?{label:'Moderate',color:S.warning}:pct>=25?{label:'Mild',color:'#F59E0B'}:{label:'Minimal',color:S.success}; };
const wellnessScore = (phq, gad, burnout, selfEsteem) => {
  const phqPenalty = Math.min(phq/27*40, 40);
  const gadPenalty = Math.min(gad/21*25, 25);
  const burnoutPenalty = Math.min(burnout/20*15, 15);
  const selfEsteemBonus = Math.min(selfEsteem/12*20, 20);
  return Math.round(Math.max(0, Math.min(100, 100 - phqPenalty - gadPenalty - burnoutPenalty + selfEsteemBonus - 20)));
};

// ── Radar chart (SVG) ─────────────────────────────────────
function RadarChart({ traits, size = 200 }) {
  const center = size / 2;
  const radius = size * 0.38;
  const n = traits.length;
  const angleStep = (2 * Math.PI) / n;
  const points = traits.map((t, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = radius * (t.value / 100);
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle), label: t.label, value: t.value, angle };
  });
  const gridPoints = (level) => traits.map((_, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = radius * level;
    return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
  }).join(' ');
  const polyPoints = points.map(p => `${p.x},${p.y}`).join(' ');
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[0.25,0.5,0.75,1].map(level => (
        <polygon key={level} points={gridPoints(level)} fill="none" stroke={S.border} strokeWidth="0.5"/>
      ))}
      {traits.map((_, i) => {
        const angle = i * angleStep - Math.PI / 2;
        return <line key={i} x1={center} y1={center} x2={center + radius * Math.cos(angle)} y2={center + radius * Math.sin(angle)} stroke={S.border} strokeWidth="0.5"/>;
      })}
      <polygon points={polyPoints} fill="rgba(29,78,216,0.15)" stroke={S.blue} strokeWidth="1.5"/>
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill={S.blue}/>
      ))}
      {points.map((p, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const labelR = radius * 1.22;
        const lx = center + labelR * Math.cos(angle);
        const ly = center + labelR * Math.sin(angle);
        return (
          <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill={S.muted} fontFamily="Satoshi,-apple-system,sans-serif">{p.label}</text>
        );
      })}
    </svg>
  );
}

// ── Progress ring ─────────────────────────────────────────
function ScoreRing({ score, size = 120, color }) {
  const r = size * 0.4;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={S.border} strokeWidth="8"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="8" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition:'stroke-dasharray 1s ease' }}/>
      <text x={size/2} y={size/2-6} textAnchor="middle" fontSize="22" fontWeight="700" fill={color} fontFamily="Satoshi,-apple-system,sans-serif">{score}</text>
      <text x={size/2} y={size/2+10} textAnchor="middle" fontSize="9" fill={S.hint} fontFamily="Satoshi,-apple-system,sans-serif">/100</text>
    </svg>
  );
}

export default function AssessmentResults({ results, fullReport, reportLoading, onDashboard, onRetake, onGenerateReport, user, isMobile }) {
  const [clinicianView, setClinicianView] = useState(false);
  const [expandDarkTriad, setExpandDarkTriad] = useState(false);
  const reportRef = useRef();

  const phq = phqLevel(results.phq);
  const gad = gadLevel(results.gad);
  const ws = wellnessScore(results.phq, results.gad, results.burnout||0, results.selfEsteem||6);
  const wsColor = ws >= 70 ? S.success : ws >= 50 ? S.warning : S.danger;

  // Primary vs secondary findings
  const allFindings = [
    { label:'Depression', sublabel:'PHQ-9', score:results.phq, max:27, level:phq },
    { label:'Anxiety', sublabel:'GAD-7', score:results.gad, max:21, level:gadLevel(results.gad) },
    { label:'Burnout', sublabel:'MBI', score:results.burnout||0, max:20, level:scoreLevel(results.burnout||0,20) },
    { label:'PTSD', sublabel:'PCL-5', score:results.ptsd||0, max:20, level:scoreLevel(results.ptsd||0,20) },
    { label:'OCD', sublabel:'OCI-R', score:results.ocd||0, max:20, level:scoreLevel(results.ocd||0,20) },
    { label:'ADHD', sublabel:'ASRS', score:results.adhd||0, max:20, level:scoreLevel(results.adhd||0,20) },
    { label:'Self-Esteem', sublabel:'RSE', score:results.selfEsteem||0, max:12, level:scoreLevel(12-(results.selfEsteem||6),12) },
    { label:'Bipolar', sublabel:'MDQ', score:results.bipolar||0, max:20, level:scoreLevel(results.bipolar||0,20) },
  ].filter(f => f.score > 0).sort((a,b) => (b.score/b.max) - (a.score/a.max));

  const primary = allFindings.slice(0, 3);
  const secondary = allFindings.slice(3);

  // Big Five traits
  const bigFiveTraits = ['Extraversion','Neuroticism','Agreeableness','Conscientiousness','Openness'].map(t => ({
    label: t.slice(0,5),
    fullLabel: t,
    value: results.predictions?.[t] ? Math.round(parseFloat(results.predictions[t].confidence)) : 50,
    levelLabel: results.predictions?.[t]?.label || '—',
  }));

  // Dark Triad — reframed labels
  const darkTriadReframed = {
    Machiavellianism: { label:'Strategic Thinking', desc:'How carefully you plan and navigate social situations' },
    Narcissism: { label:'Self-Confidence', desc:'Your belief in your own abilities and self-worth' },
    Psychopathy: { label:'Emotional Detachment', desc:'How much you separate emotions from decision-making' },
  };

  // AI narrative summary
  const narrativeSummary = () => {
    const findings = [];
    if (results.phq >= 10) findings.push(`moderate to severe depression symptoms (PHQ-9: ${results.phq})`);
    else if (results.phq >= 5) findings.push(`mild depression indicators (PHQ-9: ${results.phq})`);
    if (results.gad >= 10) findings.push(`moderate anxiety (GAD-7: ${results.gad})`);
    else if (results.gad >= 5) findings.push(`mild anxiety tendencies (GAD-7: ${results.gad})`);
    if (results.burnout >= 12) findings.push(`significant burnout`);
    if ((results.selfEsteem||6) <= 6) findings.push(`low self-esteem`);
    const neuroticism = results.predictions?.Neuroticism?.label;
    const riskFlag = results.phq >= 15 || results.gad >= 15;
    return {
      summary: findings.length === 0
        ? `Your mental health profile shows minimal clinical indicators. Your scores across depression, anxiety, and stress measures are within healthy ranges. Continue maintaining your current wellness practices.`
        : `Your profile shows ${findings.join(' and ')}. ${neuroticism === 'High' ? 'High neuroticism suggests emotional sensitivity which may amplify stress responses. ' : ''}The pattern in your results points toward ${results.burnout >= 10 ? 'work-related stress as a primary driver' : results.phq >= results.gad ? 'mood-related challenges as the primary area for attention' : 'anxiety as the primary area for attention'}.`,
      riskFlag,
      recommendation: results.phq >= 15 || results.gad >= 15 ? 'Speaking with a mental health professional is strongly recommended.' : results.phq >= 10 || results.gad >= 10 ? 'Consider speaking with a psychologist for further assessment.' : 'Self-care strategies and monitoring are appropriate at this time.',
      strengths: [
        results.predictions?.Agreeableness?.label === 'High' ? 'Strong interpersonal skills' : null,
        results.predictions?.Conscientiousness?.label === 'High' ? 'High self-discipline' : null,
        results.predictions?.Openness?.label === 'High' ? 'Creative and open to new experiences' : null,
        ws >= 60 ? 'Overall wellness in healthy range' : null,
      ].filter(Boolean),
    };
  };

  const narrative = narrativeSummary();

  const downloadPDF = () => {
    const win = window.open('', '_blank');
    const reportHTML = `<!DOCTYPE html><html><head><title>PsycheFlow Assessment Report</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box} body{font-family:Arial,sans-serif;color:#0C1A2E;padding:40px;max-width:760px;margin:0 auto;font-size:13px;line-height:1.6}
      .header{border-bottom:3px solid #1D4ED8;padding-bottom:16px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:flex-start}
      .logo{font-size:22px;font-weight:700;color:#1D4ED8} .date{font-size:12px;color:#94a3b8;margin-top:4px}
      .score-ring{width:100px;height:100px;border-radius:50%;background:conic-gradient(${wsColor} ${ws}%, #E2EBF6 0);display:flex;align-items:center;justify-content:center;position:relative}
      .section{background:#F8FAFF;border-radius:10px;padding:18px;margin-bottom:16px;border-left:4px solid #1D4ED8}
      .section h2{font-size:14px;font-weight:700;color:#1D4ED8;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.06em}
      .finding{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #E2EBF6}
      .finding-label{font-weight:600} .finding-score{font-weight:700}
      .badge{display:inline-block;padding:3px 10px;border-radius:100px;font-size:11px;font-weight:700}
      .narrative{background:#EFF6FF;border-radius:10px;padding:16px;margin-bottom:16px;font-size:13px;line-height:1.7;border-left:4px solid #1D4ED8}
      .report-section{margin-bottom:20px} .report-section h3{color:#1D4ED8;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #EFF6FF;padding-bottom:6px;margin-bottom:10px}
      .footer{margin-top:32px;border-top:1px solid #E2EBF6;padding-top:12px;font-size:11px;color:#94a3b8;display:flex;justify-content:space-between}
      @media print{body{padding:20px}}
    </style></head><body>
    <div class="header">
      <div><div class="logo">PsycheFlow</div><div style="font-size:13px;color:#3B5998;margin-top:2px">Mental Health Intelligence Report</div><div class="date">Generated: ${new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</div></div>
      <div style="text-align:right"><div style="font-size:28px;font-weight:700;color:${wsColor}">${ws}/100</div><div style="font-size:11px;color:#94a3b8">Wellness Score</div></div>
    </div>
    <div class="narrative"><strong>AI Clinical Summary:</strong><br/>${narrative.summary}<br/><br/><strong>Recommendation:</strong> ${narrative.recommendation}</div>
    <div class="section"><h2>Key Findings</h2>
      ${primary.map(f=>`<div class="finding"><span class="finding-label">${f.label} (${f.sublabel})</span><span class="finding-score" style="color:${f.level.color}">${f.score} — ${f.level.label}</span></div>`).join('')}
      ${secondary.map(f=>`<div class="finding"><span>${f.label} (${f.sublabel})</span><span style="color:${f.level.color}">${f.score} — ${f.level.label}</span></div>`).join('')}
    </div>
    <div class="section"><h2>Personality Profile (Big Five)</h2>
      ${bigFiveTraits.map(t=>`<div class="finding"><span>${t.fullLabel}</span><span style="color:#1D4ED8">${t.levelLabel} (${t.value}%)</span></div>`).join('')}
    </div>
    <div class="section" style="border-color:#7C3AED"><h2>Interpersonal Style</h2>
      ${['Machiavellianism','Narcissism','Psychopathy'].map(t=>{const r=darkTriadReframed[t];const d=results.predictions?.[t];return`<div class="finding"><span>${r.label}</span><span style="color:#7C3AED">${d?.label||'—'} (${d?.confidence||0}%)</span></div>`;}).join('')}
    </div>
    ${fullReport?.sections ? `<div class="report-section"><h2 style="color:#1D4ED8;font-size:16px;margin-bottom:16px">Full Psychological Report</h2>${Object.entries(fullReport.sections).map(([title,content])=>content?`<div class="report-section"><h3>${title}</h3><p style="font-size:13px;color:#374151;white-space:pre-wrap">${content}</p></div>`:'').join('')}</div>` : ''}
    <div class="footer"><span>PsycheFlow — psycheflow.in</span><span>Report ID: ${Date.now().toString(36).toUpperCase()}</span><span>Confidential — For personal use only</span></div>
    </body></html>`;
    win.document.write(reportHTML);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  return (
    <div style={{ fontFamily:"'Satoshi',-apple-system,sans-serif", background:S.bg, minHeight:'100vh' }}>
      {/* Sticky header */}
      <div style={{ position:'sticky', top:0, zIndex:10, background:'rgba(248,250,255,0.95)', backdropFilter:'blur(10px)', borderBottom:`0.5px solid ${S.border}`, padding: isMobile?'12px 16px':'12px 32px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:28, height:28, borderRadius:7, background:'linear-gradient(135deg,#1D4ED8,#0891B2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C9 1.5 4 5 4 10C4 12.8 6.2 15 9 15C11.8 15 14 12.8 14 10C14 5 9 1.5 9 1.5Z" fill="white" opacity="0.9"/><circle cx="9" cy="10" r="2.2" fill="#0C1A2E"/></svg>
          </div>
          <span style={{ fontSize:14, fontWeight:700, color:S.navy }}><span style={{ color:S.blue }}>Psyche</span>Flow Report</span>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => setClinicianView(v=>!v)} style={{ padding:'6px 12px', background:clinicianView?S.blue:'transparent', color:clinicianView?'#fff':S.muted, border:`0.5px solid ${S.border}`, borderRadius:7, fontSize:11, cursor:'pointer', fontWeight:600 }}>
            {clinicianView ? 'Patient View' : 'Clinician View'}
          </button>
          <button onClick={downloadPDF} style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 14px', background:'#ECFDF5', color:S.success, border:`0.5px solid #A7F3D0`, borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke={S.success} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Download PDF
          </button>
          <button onClick={onDashboard} style={{ padding:'7px 14px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer' }}>Dashboard</button>
          <button onClick={onRetake} style={{ padding:'7px 14px', background:'transparent', color:S.muted, border:`0.5px solid ${S.border}`, borderRadius:8, fontSize:12, cursor:'pointer' }}>Retake</button>
        </div>
      </div>

      <div ref={reportRef} style={{ maxWidth:780, margin:'0 auto', padding: isMobile?'20px 16px 60px':'32px 24px 60px' }}>

        {/* 1. WELLNESS SCORE HERO */}
        <div style={{ background:`linear-gradient(135deg,${S.navy},#1a3a6b)`, borderRadius:20, padding: isMobile?'24px 20px':'32px 36px', marginBottom:24, color:'#fff' }}>
          <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr':'1fr 1fr', gap:24, alignItems:'center' }}>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Mental Health Intelligence Report</div>
              <div style={{ fontSize: isMobile?28:38, fontWeight:700, letterSpacing:'-0.03em', marginBottom:8 }}>
                Your Wellness Score
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:16 }}>
                <ScoreRing score={ws} size={isMobile?90:110} color={wsColor}/>
                <div>
                  <div style={{ fontSize:16, fontWeight:700, color:wsColor }}>{ws >= 70 ? 'Good' : ws >= 50 ? 'Fair' : 'Needs Attention'}</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)', marginTop:3 }}>{new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</div>
                </div>
              </div>
              {narrative.riskFlag && (
                <div style={{ background:'rgba(220,38,38,0.2)', border:'1px solid rgba(220,38,38,0.4)', borderRadius:10, padding:'10px 14px', fontSize:12, color:'#FCA5A5', fontWeight:600 }}>
                  ⚠ Elevated symptoms detected — consider speaking with a mental health professional
                </div>
              )}
            </div>
            {/* Protective factors / strengths */}
            <div>
              {narrative.strengths.length > 0 && (
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Key Strengths</div>
                  {narrative.strengths.map(s=>(
                    <div key={s} style={{ display:'flex', gap:8, marginBottom:6 }}>
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ marginTop:1, flexShrink:0 }}><circle cx="8" cy="8" r="7" fill="rgba(34,197,94,0.2)"/><path d="M5 8l2 2 4-4" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span style={{ fontSize:13, color:'rgba(255,255,255,0.7)' }}>{s}</span>
                    </div>
                  ))}
                </div>
              )}
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Quick Stats</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                  {[['PHQ-9',results.phq,phq.color],['GAD-7',results.gad,gad.color],['Burnout',results.burnout||0,scoreLevel(results.burnout||0,20).color]].map(([label,val,color])=>(
                    <div key={label} style={{ background:'rgba(255,255,255,0.08)', borderRadius:9, padding:'10px 8px', textAlign:'center' }}>
                      <div style={{ fontSize:18, fontWeight:700, color }}>{val}</div>
                      <div style={{ fontSize:9, color:'rgba(255,255,255,0.4)', marginTop:2 }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. AI EXECUTIVE SUMMARY */}
        <div style={{ background:S.white, borderRadius:16, padding:24, marginBottom:20, border:`0.5px solid ${S.border}` }}>
          <div style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom:14 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:S.lightBlue, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="10" rx="2" stroke={S.blue} strokeWidth="1.5"/><path d="M9 11V7a3 3 0 016 0v4" stroke={S.blue} strokeWidth="1.5" strokeLinecap="round"/><circle cx="9" cy="16" r="1" fill={S.blue}/><circle cx="15" cy="16" r="1" fill={S.blue}/></svg>
            </div>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:S.navy }}>AI Clinical Summary</div>
              <div style={{ fontSize:11, color:S.hint }}>Generated by PsycheFlow AI · Not a clinical diagnosis</div>
            </div>
          </div>
          <p style={{ fontSize:14, color:S.navy, lineHeight:1.8, margin:'0 0 14px' }}>{narrative.summary}</p>
          <div style={{ display:'flex', gap:8, padding:'10px 14px', background: narrative.riskFlag?'#FEF2F2':S.lightBlue, borderRadius:9, border:`0.5px solid ${narrative.riskFlag?'#FECACA':S.border}` }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink:0, marginTop:1 }}><circle cx="12" cy="12" r="10" stroke={narrative.riskFlag?S.danger:S.blue} strokeWidth="1.5"/><path d="M12 8v4M12 16h.01" stroke={narrative.riskFlag?S.danger:S.blue} strokeWidth="1.5" strokeLinecap="round"/></svg>
            <span style={{ fontSize:13, color:narrative.riskFlag?S.danger:S.blue, fontWeight:500 }}>{narrative.recommendation}</span>
          </div>
        </div>

        {/* 3. KEY FINDINGS */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:13, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Key Findings</div>
          <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr':'repeat(3,1fr)', gap:12, marginBottom:12 }}>
            {primary.map((f,i) => (
              <div key={f.label} style={{ background:S.white, borderRadius:14, padding:20, border:`0.5px solid ${S.border}`, borderTop:`3px solid ${f.level.color}`, position:'relative' }}>
                {i===0 && <div style={{ position:'absolute', top:10, right:10, padding:'2px 8px', background:f.level.bg, borderRadius:100, fontSize:10, fontWeight:700, color:f.level.color }}>Primary Finding</div>}
                <div style={{ fontSize:11, color:S.hint, marginBottom:4, textTransform:'uppercase', letterSpacing:'0.04em' }}>{f.sublabel}</div>
                <div style={{ fontSize:16, fontWeight:700, color:S.navy, marginBottom:10 }}>{f.label}</div>
                <div style={{ display:'flex', alignItems:'flex-end', gap:8, marginBottom:10 }}>
                  <div style={{ fontSize:36, fontWeight:700, color:f.level.color, letterSpacing:'-0.02em' }}>{f.score}</div>
                  <div style={{ fontSize:13, color:S.hint, marginBottom:6 }}>/ {f.max}</div>
                </div>
                <div style={{ height:6, borderRadius:3, background:S.border, marginBottom:6 }}>
                  <div style={{ height:6, borderRadius:3, background:f.level.color, width:(f.score/f.max*100)+'%', transition:'width 0.8s ease' }}/>
                </div>
                <div style={{ fontSize:12, fontWeight:700, color:f.level.color }}>{f.level.label}</div>
              </div>
            ))}
          </div>
          {/* Secondary findings — compact */}
          {secondary.length > 0 && (
            <div style={{ background:S.white, borderRadius:14, padding:16, border:`0.5px solid ${S.border}` }}>
              <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>Additional Screening</div>
              <div style={{ display:'grid', gridTemplateColumns: isMobile?'repeat(2,1fr)':'repeat(4,1fr)', gap:10 }}>
                {secondary.map(f => (
                  <div key={f.label} style={{ background:S.bg, borderRadius:9, padding:'12px', textAlign:'center' }}>
                    <div style={{ fontSize:10, color:S.hint, marginBottom:3 }}>{f.label}</div>
                    <div style={{ fontSize:20, fontWeight:700, color:f.level.color }}>{f.score}</div>
                    <div style={{ fontSize:10, fontWeight:600, color:f.level.color }}>{f.level.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 4. RISK & PROTECTIVE FACTORS */}
        <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr':'1fr 1fr', gap:16, marginBottom:20 }}>
          <div style={{ background:'#FEF2F2', borderRadius:14, padding:20, border:'0.5px solid #FECACA' }}>
            <div style={{ fontSize:12, fontWeight:700, color:S.danger, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>Areas Needing Attention</div>
            {allFindings.filter(f=>f.score/f.max>0.4).length===0 ? <div style={{ fontSize:13, color:S.success }}>No significant risk factors detected.</div> :
              allFindings.filter(f=>f.score/f.max>0.4).map(f=>(
                <div key={f.label} style={{ display:'flex', gap:8, marginBottom:8 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:f.level.color, flexShrink:0, marginTop:4 }}/>
                  <div><div style={{ fontSize:13, fontWeight:600, color:S.navy }}>{f.label}</div><div style={{ fontSize:11, color:S.muted }}>{f.level.label} severity — score {f.score}/{f.max}</div></div>
                </div>
              ))
            }
          </div>
          <div style={{ background:'#ECFDF5', borderRadius:14, padding:20, border:'0.5px solid #A7F3D0' }}>
            <div style={{ fontSize:12, fontWeight:700, color:S.success, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>Protective Factors</div>
            {[
              results.predictions?.Agreeableness?.label==='High' && 'High agreeableness — strong social support ability',
              results.predictions?.Conscientiousness?.label==='High' && 'High conscientiousness — good self-regulation',
              results.predictions?.Openness?.label==='High' && 'High openness — resilience through new experiences',
              results.phq<10 && 'Depression within manageable range',
              results.gad<10 && 'Anxiety within manageable range',
              (results.selfEsteem||0)>=8 && 'Healthy self-esteem level',
              ws>=60 && 'Overall wellness in healthy range',
            ].filter(Boolean).slice(0,4).map((item,i)=>(
              <div key={i} style={{ display:'flex', gap:8, marginBottom:8 }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink:0, marginTop:1 }}><circle cx="8" cy="8" r="7" fill="rgba(5,150,105,0.15)"/><path d="M5 8l2 2 4-4" stroke={S.success} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span style={{ fontSize:13, color:S.navy }}>{item}</span>
              </div>
            ))}
            {[results.predictions?.Agreeableness?.label==='High',results.predictions?.Conscientiousness?.label==='High',results.predictions?.Openness?.label==='High',results.phq<10,results.gad<10,(results.selfEsteem||0)>=8,ws>=60].filter(Boolean).length===0 &&
              <div style={{ fontSize:13, color:S.muted }}>Continue building healthy habits and seeking support.</div>
            }
          </div>
        </div>

        {/* 5. PERSONALITY RADAR */}
        <div style={{ background:S.white, borderRadius:16, padding:24, marginBottom:20, border:`0.5px solid ${S.border}` }}>
          <div style={{ fontSize:13, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Personality Profile</div>
          <div style={{ fontSize:16, fontWeight:700, color:S.navy, marginBottom:20 }}>Big Five (OCEAN) Personality Traits</div>
          <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr':'1fr 1fr', gap:20, alignItems:'center' }}>
            <div style={{ display:'flex', justifyContent:'center' }}>
              <RadarChart traits={bigFiveTraits} size={isMobile?180:220}/>
            </div>
            <div>
              {bigFiveTraits.map(trait => (
                <div key={trait.fullLabel} style={{ marginBottom:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <span style={{ fontSize:13, fontWeight:600, color:S.navy }}>{trait.fullLabel}</span>
                    <span style={{ fontSize:12, color:S.blue, fontWeight:600 }}>{trait.levelLabel}</span>
                  </div>
                  <div style={{ height:7, borderRadius:4, background:S.border }}>
                    <div style={{ height:7, borderRadius:4, background:`linear-gradient(90deg,${S.blue},${S.cyan})`, width:trait.value+'%', transition:'width 0.8s ease' }}/>
                  </div>
                  <div style={{ fontSize:10, color:S.hint, marginTop:2 }}>{trait.value}% confidence</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 6. INTERPERSONAL STYLE (Dark Triad — reframed) */}
        <div style={{ background:S.white, borderRadius:16, padding:24, marginBottom:20, border:`0.5px solid ${S.border}` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em' }}>Interpersonal Style</div>
              <div style={{ fontSize:11, color:S.hint, marginTop:2 }}>How you navigate social and professional relationships</div>
            </div>
            <button onClick={()=>setExpandDarkTriad(d=>!d)} style={{ padding:'5px 12px', background:expandDarkTriad?S.lightBlue:'transparent', color:S.blue, border:`0.5px solid ${S.border}`, borderRadius:7, fontSize:11, cursor:'pointer' }}>
              {expandDarkTriad ? 'Simple View' : 'Advanced Analysis'}
            </button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr':'repeat(3,1fr)', gap:14 }}>
            {['Machiavellianism','Narcissism','Psychopathy'].map(trait => {
              const reframed = darkTriadReframed[trait];
              const data = results.predictions?.[trait];
              return (
                <div key={trait} style={{ background:S.bg, borderRadius:12, padding:16 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:S.navy, marginBottom:4 }}>{expandDarkTriad ? trait : reframed.label}</div>
                  <div style={{ fontSize:11, color:S.muted, marginBottom:10 }}>{reframed.desc}</div>
                  <div style={{ fontSize:20, fontWeight:700, color:S.purple, marginBottom:4 }}>{data?.label||'—'}</div>
                  <div style={{ height:6, borderRadius:3, background:S.border }}>
                    <div style={{ height:6, borderRadius:3, background:S.purple, width:(data?.confidence||0)+'%' }}/>
                  </div>
                  {expandDarkTriad && data?.explanation?.slice(0,2).map((e,i)=>(
                    <div key={i} style={{ fontSize:10, color:S.hint, marginTop:6 }}>{e.description}</div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* 7. RECOMMENDATIONS */}
        <div style={{ background:S.white, borderRadius:16, padding:24, marginBottom:20, border:`0.5px solid ${S.border}` }}>
          <div style={{ fontSize:13, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Personalized Recommendations</div>
          <div style={{ fontSize:16, fontWeight:700, color:S.navy, marginBottom:20 }}>Your next steps</div>
          <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr':'repeat(2,1fr)', gap:12 }}>
            {[
              { label:'Focus Area', value: results.phq>=results.gad ? 'Depression & Mood' : 'Anxiety Management', icon:'target', color:S.blue },
              { label:'Recommended Therapy', value: results.phq>=15||results.gad>=15 ? 'CBT + Professional Consultation' : results.burnout>=12 ? 'Mindfulness-Based Stress Reduction' : 'ACT (Acceptance & Commitment)', icon:'brain', color:S.purple },
              { label:'Daily Practice', value: results.gad>=10 ? 'Box breathing 4-4-4-4 twice daily' : 'Mindful journaling + mood logging', icon:'calendar', color:S.success },
              { label:'Journal Prompt', value: results.phq>=10 ? '"What\'s one small thing that brought me joy today?"' : '"What am I afraid will happen, and how likely is it?"', icon:'journal', color:S.warning },
            ].map(rec => (
              <div key={rec.label} style={{ display:'flex', gap:12, padding:'14px', background:S.bg, borderRadius:10 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:rec.color+'15', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {rec.icon==='target' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={rec.color} strokeWidth="1.5"/><circle cx="12" cy="12" r="6" stroke={rec.color} strokeWidth="1.5"/><circle cx="12" cy="12" r="2" fill={rec.color}/></svg>}
                  {rec.icon==='brain' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9.5 2A2.5 2.5 0 007 4.5v1A2.5 2.5 0 004.5 8v1A2.5 2.5 0 002 11.5C2 13 3 14.3 4.5 14.8V17a5 5 0 005 5h5a5 5 0 005-5v-2.2c1.5-.5 2.5-1.8 2.5-3.3A2.5 2.5 0 0019.5 9V8A2.5 2.5 0 0017 5.5v-1A2.5 2.5 0 0014.5 2h-5z" stroke={rec.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  {rec.icon==='calendar' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke={rec.color} strokeWidth="1.5"/><path d="M3 10h18M8 2v4M16 2v4" stroke={rec.color} strokeWidth="1.5" strokeLinecap="round"/></svg>}
                  {rec.icon==='journal' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke={rec.color} strokeWidth="1.5" strokeLinecap="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke={rec.color} strokeWidth="1.5"/><path d="M8 7h8M8 11h5" stroke={rec.color} strokeWidth="1.5" strokeLinecap="round"/></svg>}
                </div>
                <div>
                  <div style={{ fontSize:11, fontWeight:700, color:rec.color, textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:3 }}>{rec.label}</div>
                  <div style={{ fontSize:13, color:S.navy }}>{rec.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 8. FULL REPORT */}
        <div style={{ background:S.white, borderRadius:16, padding:24, marginBottom:20, border:`0.5px solid ${S.border}` }}>
          <div style={{ fontSize:13, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Full AI Report</div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div style={{ fontSize:16, fontWeight:700, color:S.navy }}>Comprehensive Psychological Profile</div>
            <div style={{ fontSize:12, color:S.hint }}>AI-generated · 2000+ words</div>
          </div>
          {!fullReport ? (
            <div style={{ textAlign:'center', padding:'32px 0' }}>
              <button onClick={onGenerateReport} disabled={reportLoading}
                style={{ padding:'12px 32px', background:S.blue, color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:`0 4px 20px rgba(29,78,216,0.2)` }}>
                {reportLoading ? 'Generating (~1 min)...' : 'Generate Full Report'}
              </button>
              <div style={{ fontSize:11, color:S.hint, marginTop:8 }}>2000+ word personalized psychological analysis</div>
            </div>
          ) : (
            <div>
              {Object.entries(fullReport.sections||{}).map(([title,content])=>content&&(
                <div key={title} style={{ marginBottom:20 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:S.blue, textTransform:'uppercase', letterSpacing:'0.5px', borderBottom:`2px solid ${S.lightBlue}`, paddingBottom:6, marginBottom:10 }}>{title}</div>
                  <p style={{ fontSize:14, color:'#374151', lineHeight:1.9, margin:0, whiteSpace:'pre-wrap' }}>{content}</p>
                </div>
              ))}
              <div style={{ background:S.bg, borderRadius:8, padding:10, fontSize:11, color:S.hint, display:'flex', justifyContent:'space-between' }}>
                <span>{fullReport.word_count} words · PsycheFlow AI</span>
                <button onClick={downloadPDF} style={{ background:'none', border:'none', color:S.blue, cursor:'pointer', fontSize:11, fontWeight:600 }}>Download Full PDF</button>
              </div>
            </div>
          )}
        </div>

        {/* 9. CLINICIAN VIEW — Raw clinical scores */}
        {clinicianView && (
          <div style={{ background:S.white, borderRadius:16, padding:24, border:`1px solid ${S.blue}` }}>
            <div style={{ fontSize:13, fontWeight:700, color:S.blue, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:16 }}>Clinician View — Raw Clinical Data</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10, marginBottom:16 }}>
              {[['PHQ-9',results.phq,27],['GAD-7',results.gad,21],['Bipolar MDQ',results.bipolar||0,20],['PCL-5 PTSD',results.ptsd||0,20],['OCD OCI-R',results.ocd||0,20],['ADHD ASRS',results.adhd||0,20],['MBI Burnout',results.burnout||0,20],['RSE Self-Esteem',results.selfEsteem||0,12]].map(([label,score,max])=>(
                <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'8px 12px', background:S.bg, borderRadius:7 }}>
                  <span style={{ fontSize:12, color:S.muted }}>{label}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:S.navy }}>{score}/{max}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize:12, fontWeight:700, color:S.muted, marginBottom:10 }}>Model Predictions & Confidence</div>
            {results.predictions && Object.entries(results.predictions).map(([trait,data])=>(
              <div key={trait} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:`0.5px solid ${S.border}` }}>
                <span style={{ fontSize:12, color:S.muted }}>{trait}</span>
                <span style={{ fontSize:12, color:S.navy }}>{data.label} <span style={{ color:S.hint }}>({data.confidence}%)</span></span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
