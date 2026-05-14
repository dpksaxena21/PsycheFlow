import React, { useState } from 'react';
import axios from 'axios';

const CRISIS_RESOURCES = [
  { name:'iCall', number:'9152987821', desc:'India\'s premier mental health helpline', available:'Mon-Sat 8AM-10PM' },
  { name:'Vandrevala Foundation', number:'1860-2662-345', desc:'24/7 mental health support', available:'24/7' },
  { name:'NIMHANS', number:'080-46110007', desc:'National Institute of Mental Health', available:'Mon-Fri 9AM-5PM' },
  { name:'Snehi', number:'044-24640050', desc:'Emotional support helpline', available:'24/7' },
  { name:'Emergency', number:'112', desc:'National emergency number', available:'24/7' },
];

const SAFETY_PLAN_STEPS = [
  { id:1, icon:'⚠️', title:'Warning Signs',       desc:'What thoughts, images, moods or situations tell me a crisis may be developing?' },
  { id:2, icon:'🧘', title:'Internal Coping',      desc:'Things I can do to take my mind off my problems without contacting another person' },
  { id:3, icon:'👥', title:'Social Distractions',  desc:'People and social settings that provide distraction' },
  { id:4, icon:'💙', title:'People I Can Ask',     desc:'People I can ask for help if a crisis develops' },
  { id:5, icon:'🏥', title:'Professionals',        desc:'Professionals or agencies I can contact during a crisis' },
  { id:6, icon:'🔒', title:'Safe Environment',     desc:'Making my environment safe — removing access to means' },
];

export default function CrisisManagement({ user, onBack }) {
  const [activeTab, setActiveTab]   = useState('immediate');
  const [safetyPlan, setSafetyPlan] = useState({
    warning_signs: '',
    internal_coping: '',
    social_distractions: '',
    people_to_ask: '',
    professionals: '',
    safe_environment: ''
  });
  const [saved, setSaved]           = useState(false);
  const [riskLevel, setRiskLevel]   = useState(null);
  const [assessment, setAssessment] = useState({
    thoughts: 0,
    plan: 0,
    intent: 0,
    means: 0
  });

  const computeRisk = () => {
    const score = assessment.thoughts + assessment.plan + assessment.intent + assessment.means;
    if (score >= 6) return { level:'HIGH',   color:'#ef4444', action:'Call emergency services or go to nearest hospital immediately' };
    if (score >= 3) return { level:'MEDIUM', color:'#f59e0b', action:'Contact a mental health professional today' };
    return                { level:'LOW',    color:'#22c55e', action:'Use coping strategies and monitor symptoms' };
  };

  const tabStyle = (tab) => ({
    padding:'10px 20px', border:'none', borderRadius:8, cursor:'pointer',
    fontSize:14, marginRight:8,
    background: activeTab === tab ? '#ef4444' : '#fff',
    color: activeTab === tab ? '#fff' : '#64748b',
    fontWeight: activeTab === tab ? 'bold' : 'normal'
  });

  return (
    <div style={{ fontFamily:'sans-serif', maxWidth:720, margin:'0 auto', padding:24 }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg, #fef2f2, #fff1f2)',
        borderRadius:16, padding:24, marginBottom:24,
        border:'2px solid #fecaca' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h2 style={{ color:'#dc2626', margin:'0 0 4px' }}>
              🚨 Crisis Support Center
            </h2>
            <p style={{ color:'#64748b', fontSize:13, margin:0 }}>
              You are not alone. Help is available right now.
            </p>
          </div>
          {onBack && (
            <button onClick={onBack}
              style={{ padding:'6px 14px', background:'transparent',
                border:'1px solid #e2e8f0', borderRadius:8,
                cursor:'pointer', fontSize:13, color:'#64748b' }}>
              ← Back
            </button>
          )}
        </div>

        {/* Emergency Banner */}
        <div style={{ background:'#dc2626', borderRadius:12, padding:16,
          marginTop:16, display:'flex', justifyContent:'space-between',
          alignItems:'center' }}>
          <div>
            <div style={{ color:'#fff', fontWeight:'bold', fontSize:16 }}>
              🆘 If you are in immediate danger
            </div>
            <div style={{ color:'rgba(255,255,255,0.8)', fontSize:13 }}>
              Call emergency services immediately
            </div>
          </div>
          <a href="tel:112"
            style={{ background:'#fff', color:'#dc2626', padding:'10px 20px',
              borderRadius:8, fontWeight:'bold', fontSize:16, textDecoration:'none' }}>
            📞 112
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom:24 }}>
        <button style={tabStyle('immediate')}  onClick={() => setActiveTab('immediate')}>
          🆘 Immediate Help
        </button>
        <button style={tabStyle('assessment')} onClick={() => setActiveTab('assessment')}>
          📊 Risk Assessment
        </button>
        <button style={tabStyle('safety')}     onClick={() => setActiveTab('safety')}>
          📋 Safety Plan
        </button>
        <button style={tabStyle('coping')}     onClick={() => setActiveTab('coping')}>
          🧘 Coping Tools
        </button>
      </div>

      {/* IMMEDIATE HELP */}
      {activeTab === 'immediate' && (
        <div>
          <h3 style={{ color:'#1e293b', margin:'0 0 16px' }}>
            Crisis Helplines — India
          </h3>
          <div style={{ display:'grid', gap:12 }}>
            {CRISIS_RESOURCES.map((r, i) => (
              <div key={i} style={{ background:'#fff', borderRadius:16, padding:20,
                border:'1px solid #e2e8f0',
                display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontWeight:'bold', color:'#1e293b', fontSize:15 }}>
                    {r.name}
                  </div>
                  <div style={{ fontSize:13, color:'#64748b', marginTop:2 }}>
                    {r.desc}
                  </div>
                  <div style={{ fontSize:12, color:'#94a3b8', marginTop:2 }}>
                    Available: {r.available}
                  </div>
                </div>
                <a href={`tel:${r.number}`}
                  style={{ background:'#6366f1', color:'#fff', padding:'10px 16px',
                    borderRadius:8, textDecoration:'none', fontWeight:'bold',
                    fontSize:14, whiteSpace:'nowrap' }}>
                  📞 {r.number}
                </a>
              </div>
            ))}
          </div>

          {/* Grounding Exercise */}
          <div style={{ background:'#f0fdf4', borderRadius:16, padding:24,
            border:'1px solid #86efac', marginTop:20 }}>
            <h3 style={{ color:'#16a34a', margin:'0 0 12px' }}>
              🌿 Immediate Grounding — Do This Now
            </h3>
            <div style={{ display:'grid', gap:8 }}>
              {[
                '👁️ Name 5 things you can SEE right now',
                '✋ Touch 4 things and notice their texture',
                '👂 Listen for 3 sounds around you',
                '👃 Find 2 things you can SMELL',
                '👅 Notice 1 thing you can TASTE',
                '💨 Take 3 slow, deep breaths',
              ].map((step, i) => (
                <div key={i} style={{ background:'#fff', borderRadius:8,
                  padding:'10px 14px', fontSize:14, color:'#374151' }}>
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RISK ASSESSMENT */}
      {activeTab === 'assessment' && (
        <div>
          <div style={{ background:'#fff7ed', borderRadius:12, padding:16,
            marginBottom:20, fontSize:13, color:'#92400e',
            border:'1px solid #fed7aa' }}>
            ⚠️ This is a screening tool only. If you are in crisis, call iCall: 9152987821
          </div>

          <h3 style={{ color:'#1e293b', margin:'0 0 20px' }}>
            Columbia Suicide Severity Rating Scale (C-SSRS) — Screening
          </h3>

          {[
            { key:'thoughts', label:'Have you had thoughts of killing yourself?',
              options:['No thoughts','Passive (wish to be dead)','Active ideation (no plan)'] },
            { key:'plan', label:'Have you thought about how you would do this?',
              options:['No plan','Vague plan','Specific plan'] },
            { key:'intent', label:'Do you have any intention of acting on these thoughts?',
              options:['No intention','Unsure','Yes, some intention'] },
            { key:'means', label:'Do you have access to means (medications, weapons, etc.)?',
              options:['No access','Limited access','Easy access'] },
          ].map((q, i) => (
            <div key={i} style={{ background:'#fff', borderRadius:16, padding:20,
              border:'1px solid #e2e8f0', marginBottom:12 }}>
              <p style={{ fontSize:15, color:'#1e293b', margin:'0 0 12px',
                fontWeight:500 }}>{q.label}</p>
              <div style={{ display:'flex', gap:8 }}>
                {q.options.map((opt, j) => (
                  <button key={j}
                    onClick={() => setAssessment({...assessment, [q.key]: j})}
                    style={{ flex:1, padding:'8px 12px', borderRadius:8, border:'none',
                      cursor:'pointer', fontSize:12,
                      background: assessment[q.key] === j
                        ? j === 0 ? '#22c55e' : j === 1 ? '#f59e0b' : '#ef4444'
                        : '#f1f5f9',
                      color: assessment[q.key] === j ? '#fff' : '#64748b' }}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button onClick={() => setRiskLevel(computeRisk())}
            style={{ width:'100%', padding:'14px', background:'#6366f1', color:'#fff',
              border:'none', borderRadius:10, cursor:'pointer',
              fontSize:15, fontWeight:'bold', marginBottom:16 }}>
            Assess Risk Level
          </button>

          {riskLevel && (
            <div style={{ background: riskLevel.color + '15', borderRadius:16,
              padding:24, border:`2px solid ${riskLevel.color}` }}>
              <div style={{ fontSize:24, fontWeight:'bold', color:riskLevel.color,
                marginBottom:8 }}>
                {riskLevel.level} RISK
              </div>
              <p style={{ fontSize:14, color:'#374151', margin:'0 0 16px' }}>
                {riskLevel.action}
              </p>
              {riskLevel.level === 'HIGH' && (
                <a href="tel:9152987821"
                  style={{ display:'block', background:'#dc2626', color:'#fff',
                    padding:'12px 24px', borderRadius:8, textDecoration:'none',
                    fontWeight:'bold', fontSize:15, textAlign:'center' }}>
                  📞 Call iCall Now: 9152987821
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* SAFETY PLAN */}
      {activeTab === 'safety' && (
        <div>
          <p style={{ color:'#64748b', fontSize:13, marginBottom:20 }}>
            A safety plan is a personalized list of coping strategies and resources.
            Fill it out when you are feeling okay — use it when you are in crisis.
          </p>

          {SAFETY_PLAN_STEPS.map((step, i) => {
            const keys = ['warning_signs','internal_coping','social_distractions',
                         'people_to_ask','professionals','safe_environment'];
            return (
              <div key={i} style={{ background:'#fff', borderRadius:16, padding:20,
                border:'1px solid #e2e8f0', marginBottom:12 }}>
                <div style={{ display:'flex', gap:12, alignItems:'flex-start',
                  marginBottom:10 }}>
                  <span style={{ fontSize:24 }}>{step.icon}</span>
                  <div>
                    <div style={{ fontWeight:'bold', color:'#1e293b' }}>
                      Step {step.id}: {step.title}
                    </div>
                    <div style={{ fontSize:13, color:'#64748b', marginTop:2 }}>
                      {step.desc}
                    </div>
                  </div>
                </div>
                <textarea
                  value={safetyPlan[keys[i]]}
                  onChange={e => setSafetyPlan({...safetyPlan, [keys[i]]: e.target.value})}
                  placeholder="Write your response here..."
                  style={{ width:'100%', padding:'10px 14px', borderRadius:8,
                    border:'1px solid #e2e8f0', fontSize:13, minHeight:80,
                    boxSizing:'border-box', fontFamily:'sans-serif',
                    resize:'vertical' }} />
              </div>
            );
          })}

          {saved ? (
            <div style={{ background:'#f0fdf4', borderRadius:10, padding:16,
              fontSize:14, color:'#16a34a', textAlign:'center' }}>
              ✅ Safety plan saved. Keep it somewhere accessible.
            </div>
          ) : (
            <button onClick={() => setSaved(true)}
              style={{ width:'100%', padding:'14px', background:'#6366f1', color:'#fff',
                border:'none', borderRadius:10, cursor:'pointer',
                fontSize:15, fontWeight:'bold' }}>
              Save My Safety Plan
            </button>
          )}
        </div>
      )}

      {/* COPING TOOLS */}
      {activeTab === 'coping' && (
        <div>
          <h3 style={{ color:'#1e293b', margin:'0 0 16px' }}>
            Immediate Coping Strategies
          </h3>
          <div style={{ display:'grid', gap:12 }}>
            {[
              { icon:'💨', title:'Box Breathing',
                steps:['Inhale for 4 counts','Hold for 4 counts','Exhale for 4 counts','Hold for 4 counts','Repeat 4 times'] },
              { icon:'🧊', title:'Cold Water Grounding',
                steps:['Splash cold water on your face','Hold ice cube in your hand','Take a cold shower','Focus on the physical sensation','This activates your dive reflex and calms the nervous system'] },
              { icon:'🚶', title:'Physical Movement',
                steps:['Stand up and shake your hands','Walk briskly for 5 minutes','Do 10 jumping jacks','Stretch your arms above your head','Movement releases endorphins'] },
              { icon:'✍️', title:'Write It Out',
                steps:['Grab a pen and paper','Write exactly what you are feeling','Don\'t edit or censor','Write what triggered this','Then write 3 things you are grateful for'] },
              { icon:'📞', title:'Reach Out',
                steps:['Text or call one safe person','You don\'t have to explain everything','Just say: I\'m having a hard time','Ask them to stay on the line with you','Connection is the antidote to pain'] },
            ].map((tool, i) => (
              <div key={i} style={{ background:'#fff', borderRadius:16, padding:20,
                border:'1px solid #e2e8f0' }}>
                <div style={{ display:'flex', gap:12, alignItems:'center',
                  marginBottom:12 }}>
                  <span style={{ fontSize:28 }}>{tool.icon}</span>
                  <h4 style={{ margin:0, color:'#1e293b' }}>{tool.title}</h4>
                </div>
                <div style={{ display:'grid', gap:6 }}>
                  {tool.steps.map((step, j) => (
                    <div key={j} style={{ display:'flex', gap:8, fontSize:13,
                      color:'#374151' }}>
                      <span style={{ color:'#6366f1', fontWeight:'bold',
                        minWidth:16 }}>{j+1}.</span>
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}