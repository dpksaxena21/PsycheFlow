import React, { useState } from 'react';

// ── INSTRUMENT DEFINITIONS ────────────────────────────────
const instruments = {

  PHQ9: [
    { id:'PHQ1', text:'Little interest or pleasure in doing things', scale:4 },
    { id:'PHQ2', text:'Feeling down, depressed, or hopeless', scale:4 },
    { id:'PHQ3', text:'Trouble falling or staying asleep, or sleeping too much', scale:4 },
    { id:'PHQ4', text:'Feeling tired or having little energy', scale:4 },
    { id:'PHQ5', text:'Poor appetite or overeating', scale:4 },
    { id:'PHQ6', text:'Feeling bad about yourself — or that you are a failure', scale:4 },
    { id:'PHQ7', text:'Trouble concentrating on things', scale:4 },
    { id:'PHQ8', text:'Moving or speaking slowly, or being fidgety or restless', scale:4 },
    { id:'PHQ9', text:'Thoughts that you would be better off dead or hurting yourself', scale:4 },
  ],

  GAD7: [
    { id:'GAD1', text:'Feeling nervous, anxious, or on edge', scale:4 },
    { id:'GAD2', text:'Not being able to stop or control worrying', scale:4 },
    { id:'GAD3', text:'Worrying too much about different things', scale:4 },
    { id:'GAD4', text:'Trouble relaxing', scale:4 },
    { id:'GAD5', text:'Being so restless it is hard to sit still', scale:4 },
    { id:'GAD6', text:'Becoming easily annoyed or irritable', scale:4 },
    { id:'GAD7', text:'Feeling afraid as if something awful might happen', scale:4 },
  ],

  BIG5: [
    { id:'E1', text:'I am the life of the party', scale:5 },
    { id:'E2', text:'I feel comfortable around people', scale:5 },
    { id:'N1', text:'I get stressed out easily', scale:5 },
    { id:'N2', text:'I worry about things', scale:5 },
    { id:'A1', text:'I am interested in people and their feelings', scale:5 },
    { id:'A2', text:'I sympathize with others feelings', scale:5 },
    { id:'C1', text:'I am always prepared and organized', scale:5 },
    { id:'C2', text:'I pay attention to details', scale:5 },
    { id:'O1', text:'I have a vivid imagination', scale:5 },
    { id:'O2', text:'I have a rich vocabulary and love ideas', scale:5 },
  ],

  DEPRESSION_DEEP: [
    { id:'DD1', text:'How long have you been feeling depressed or low?', scale:5,
      labels:['Less than 2 weeks','2-4 weeks','1-3 months','3-6 months','More than 6 months'] },
    { id:'DD2', text:'Has your depression affected your work or daily activities?', scale:4 },
    { id:'DD3', text:'Do you have periods of feeling extremely happy or energetic?', scale:4 },
    { id:'DD4', text:'Have you had thoughts of ending your life?', scale:4 },
    { id:'DD5', text:'Do you have a history of depression in your family?', scale:4 },
  ],

  ANXIETY_DEEP: [
    { id:'AD1', text:'Do you experience sudden episodes of intense fear or panic?', scale:4 },
    { id:'AD2', text:'Do you avoid situations because of anxiety?', scale:4 },
    { id:'AD3', text:'Do you have repetitive thoughts or rituals you feel compelled to do?', scale:4 },
    { id:'AD4', text:'Have you experienced a traumatic event that still affects you?', scale:4 },
    { id:'AD5', text:'Does your anxiety cause physical symptoms like racing heart or sweating?', scale:4 },
  ],

  BIPOLAR_MDQ: [
    { id:'MDQ1', text:'Has there been a period when you felt so good or hyper that others thought you were not normal?', scale:4 },
    { id:'MDQ2', text:'Were you much more active than usual during that time?', scale:4 },
    { id:'MDQ3', text:'Did you need less sleep than usual during that time?', scale:4 },
    { id:'MDQ4', text:'Did you spend money getting yourself into trouble?', scale:4 },
    { id:'MDQ5', text:'Were you much more interested in sex than usual?', scale:4 },
  ],

  OCD_OCIR: [
    { id:'OCD1', text:'I have saved so many things that they get in the way', scale:5 },
    { id:'OCD2', text:'I check things more often than necessary', scale:5 },
    { id:'OCD3', text:'I get upset if objects are not arranged properly', scale:5 },
    { id:'OCD4', text:'I feel compelled to count while I am doing things', scale:5 },
    { id:'OCD5', text:'I wash my hands more than necessary', scale:5 },
  ],

  PTSD_PCL5: [
    { id:'PCL1', text:'Repeated disturbing memories or dreams of the traumatic event', scale:5 },
    { id:'PCL2', text:'Feeling very upset when reminded of the experience', scale:5 },
    { id:'PCL3', text:'Avoiding memories, thoughts or feelings related to it', scale:5 },
    { id:'PCL4', text:'Feeling distant from other people', scale:5 },
    { id:'PCL5', text:'Feeling irritable or having angry outbursts', scale:5 },
  ],

  ADHD_ASRS: [
    { id:'ADHD1', text:'How often do you have trouble wrapping up the final details of a project?', scale:5 },
    { id:'ADHD2', text:'How often do you have difficulty keeping attention when doing boring work?', scale:5 },
    { id:'ADHD3', text:'How often do you have difficulty concentrating on what people say?', scale:5 },
    { id:'ADHD4', text:'How often do you leave your seat in meetings or other situations?', scale:5 },
    { id:'ADHD5', text:'How often do you feel overly active and compelled to do things?', scale:5 },
  ],

  BURNOUT: [
    { id:'BRN1', text:'I feel emotionally drained from my work', scale:5 },
    { id:'BRN2', text:'I feel used up at the end of the workday', scale:5 },
    { id:'BRN3', text:'I feel fatigued when I get up to face another day', scale:5 },
    { id:'BRN4', text:'Working with people all day is really a strain for me', scale:5 },
    { id:'BRN5', text:'I feel burned out from my work', scale:5 },
  ],

  DARK_TRIAD: [
    { id:'M1', text:'I tend to manipulate others to get my way', scale:5 },
    { id:'M2', text:'I have used deceit or lied to get what I want', scale:5 },
    { id:'NA1', text:'I like to be the center of attention', scale:5 },
    { id:'NA2', text:'I feel I deserve more than others', scale:5 },
    { id:'P1', text:'I rarely feel guilt or remorse for my actions', scale:5 },
    { id:'P2', text:'I tend to be calm and unemotional even in tense situations', scale:5 },
  ],

  SLEEP_PSQI: [
    { id:'SLP1', text:'During the past month, how often have you had trouble sleeping?', scale:4,
      labels:['Not at all','Less than once a week','Once or twice a week','Three or more times a week'] },
    { id:'SLP2', text:'How would you rate your sleep quality overall?', scale:4,
      labels:['Very good','Fairly good','Fairly bad','Very bad'] },
    { id:'SLP3', text:'How many hours of actual sleep do you get at night?', scale:5,
      labels:['Less than 4 hours','4-5 hours','5-6 hours','6-7 hours','7+ hours'] },
    { id:'SLP4', text:'Do you take medication to help you sleep?', scale:4,
      labels:['Not at all','Less than once a week','Once or twice a week','Three or more times a week'] },
  ],
  RSE: [
    { id:'RSE1', text:'On the whole, I am satisfied with myself', scale:4 },
    { id:'RSE2', text:'I feel that I have a number of good qualities', scale:4 },
    { id:'RSE3', text:'I am able to do things as well as most other people', scale:4 },
    { id:'RSE4', text:'I feel I do not have much to be proud of', scale:4 },
  ],
};

// ── ADAPTIVE LOGIC ────────────────────────────────────────
function buildQuestionFlow(answers) {
  const phqScore = ['PHQ1','PHQ2','PHQ3','PHQ4','PHQ5','PHQ6','PHQ7','PHQ8','PHQ9']
    .reduce((s, id) => s + (answers[id] || 0), 0);
  const gadScore = ['GAD1','GAD2','GAD3','GAD4','GAD5','GAD6','GAD7']
    .reduce((s, id) => s + (answers[id] || 0), 0);

  let flow = [
    { name:'Depression Screening (PHQ-9)',  questions: instruments.PHQ9 },
    { name:'Anxiety Screening (GAD-7)',     questions: instruments.GAD7 },
    { name:'Personality Assessment',        questions: instruments.BIG5 },
    { name:'Self-Esteem Assessment',        questions: instruments.RSE },
    { name:'Dark Triad Assessment',         questions: instruments.DARK_TRIAD },
  ];

  if ((answers['PHQ3'] || 0) >= 2 || gadScore >= 8) {
    flow.push({ name:'Sleep Assessment', questions: instruments.SLEEP_PSQI });
  }
  if (phqScore > 10) {
    flow.push({ name:'Depression — Detailed Assessment', questions: instruments.DEPRESSION_DEEP });
  }
  if (gadScore > 10) {
    flow.push({ name:'Anxiety — Detailed Assessment', questions: instruments.ANXIETY_DEEP });
  }
  if ((answers['DD3'] || 0) >= 2) {
    flow.push({ name:'Bipolar Mood Screening (MDQ)', questions: instruments.BIPOLAR_MDQ });
  }
  if ((answers['AD3'] || 0) >= 2) {
    flow.push({ name:'OCD Screening (OCI-R)', questions: instruments.OCD_OCIR });
  }
  if ((answers['AD4'] || 0) >= 2) {
    flow.push({ name:'Trauma Screening (PCL-5)', questions: instruments.PTSD_PCL5 });
  }
  if ((answers['PHQ7'] || 0) >= 2) {
    flow.push({ name:'Attention Screening (ASRS)', questions: instruments.ADHD_ASRS });
  }
  if ((answers['GAD3'] || 0) >= 2 || (answers['PHQ4'] || 0) >= 2) {
    flow.push({ name:'Burnout Assessment (MBI)', questions: instruments.BURNOUT });
  }

  return flow;
}

const labels4 = ['Not at all','Several days','More than half the days','Nearly every day'];
const labels5 = ['Strongly Disagree','Disagree','Neutral','Agree','Strongly Agree'];

export default function AdaptiveQuestionnaire({ onComplete }) {
  const [phase, setPhase]           = useState('intake');
  const [answers, setAnswers]       = useState({});
  const [age, setAge]               = useState('');
  const [gender, setGender]         = useState('');
  const [occupation, setOccupation] = useState('');
  const [concern, setConcern]       = useState('');
  const [sectionIdx, setSectionIdx] = useState(0);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [flow, setFlow]             = useState(null);

  const handleIntakeSubmit = () => {
    const initialFlow = buildQuestionFlow({});
    setFlow(initialFlow);
    setPhase('questions');
  };

  const currentSection  = flow ? flow[sectionIdx] : null;
  const currentQuestion = currentSection ? currentSection.questions[questionIdx] : null;
  const totalQuestions  = flow ? flow.reduce((s, sec) => s + sec.questions.length, 0) : 0;
  const answeredSoFar   = flow ? flow.slice(0, sectionIdx).reduce((s, sec) => s + sec.questions.length, 0) + questionIdx : 0;
  const progress        = totalQuestions > 0 ? Math.round((answeredSoFar / totalQuestions) * 100) : 0;

  const handleAnswer = (val) => {
    const updated = { ...answers, [currentQuestion.id]: val };
    setAnswers(updated);

    const isLastQInSection = questionIdx + 1 >= currentSection.questions.length;
    const isLastSection    = sectionIdx + 1 >= flow.length;

    if (isLastQInSection) {
      const newFlow = buildQuestionFlow(updated);
      setFlow(newFlow);
      if (isLastSection || sectionIdx + 1 >= newFlow.length) {
        onComplete({ answers: updated, age: parseInt(age),
                     gender: parseInt(gender), occupation, concern });
      } else {
        setSectionIdx(sectionIdx + 1);
        setQuestionIdx(0);
      }
    } else {
      setQuestionIdx(questionIdx + 1);
    }
  };

  const handleBack = () => {
    if (questionIdx > 0) {
      setQuestionIdx(questionIdx - 1);
    } else if (sectionIdx > 0) {
      const prevSection = flow[sectionIdx - 1];
      setSectionIdx(sectionIdx - 1);
      setQuestionIdx(prevSection.questions.length - 1);
    }
  };

  // ── INTAKE ────────────────────────────────────────────────
  if (phase === 'intake') return (
    <div style={{ fontFamily:'sans-serif', maxWidth:580, margin:'0 auto' }}>
      <div style={{ background:'#fff', borderRadius:20, padding:36,
        border:'1px solid #e2e8f0', boxShadow:'0 4px 24px rgba(99,102,241,0.08)' }}>
        <h2 style={{ color:'#6366f1', margin:'0 0 8px' }}>🧠 PsycheFlow Assessment</h2>
        <p style={{ color:'#64748b', fontSize:14, marginBottom:28 }}>
          This adaptive assessment adjusts based on your responses — just like a real psychologist. Takes 10-20 minutes.
        </p>

        <label style={{ fontSize:13, color:'#475569', fontWeight:'bold' }}>Age</label>
        <input type="number" placeholder="Your age" value={age}
          onChange={e => setAge(e.target.value)}
          style={{ width:'100%', padding:'10px 14px', borderRadius:8,
            border:'1px solid #e2e8f0', fontSize:15, marginBottom:16,
            marginTop:4, boxSizing:'border-box' }} />

        <label style={{ fontSize:13, color:'#475569', fontWeight:'bold' }}>Gender</label>
        <select value={gender} onChange={e => setGender(e.target.value)}
          style={{ width:'100%', padding:'10px 14px', borderRadius:8,
            border:'1px solid #e2e8f0', fontSize:15, marginBottom:16,
            marginTop:4, boxSizing:'border-box' }}>
          <option value="">Select gender</option>
          <option value="1">Male</option>
          <option value="2">Female</option>
          <option value="3">Other / Prefer not to say</option>
        </select>

        <label style={{ fontSize:13, color:'#475569', fontWeight:'bold' }}>Occupation</label>
        <select value={occupation} onChange={e => setOccupation(e.target.value)}
          style={{ width:'100%', padding:'10px 14px', borderRadius:8,
            border:'1px solid #e2e8f0', fontSize:15, marginBottom:16,
            marginTop:4, boxSizing:'border-box' }}>
          <option value="">Select occupation</option>
          <option value="student">Student</option>
          <option value="employed">Employed (Corporate)</option>
          <option value="self_employed">Self-Employed</option>
          <option value="healthcare">Healthcare Worker</option>
          <option value="unemployed">Unemployed</option>
          <option value="homemaker">Homemaker</option>
          <option value="retired">Retired</option>
          <option value="other">Other</option>
        </select>

        <label style={{ fontSize:13, color:'#475569', fontWeight:'bold' }}>
          What brings you here today?
        </label>
        <textarea placeholder="Briefly describe what you are experiencing..."
          value={concern} onChange={e => setConcern(e.target.value)}
          style={{ width:'100%', padding:'10px 14px', borderRadius:8,
            border:'1px solid #e2e8f0', fontSize:14, marginBottom:24,
            marginTop:4, minHeight:80, boxSizing:'border-box',
            fontFamily:'sans-serif', resize:'vertical' }} />

        <div style={{ background:'#fef3c7', borderRadius:10, padding:12,
          marginBottom:20, fontSize:13, color:'#92400e' }}>
          🔒 Your responses are private and encrypted. This is a screening tool, not a diagnosis.
        </div>

        <button onClick={handleIntakeSubmit}
          disabled={!age || !gender || !occupation}
          style={{ width:'100%', padding:'14px', background:'#6366f1',
            color:'#fff', border:'none', borderRadius:12, fontSize:16,
            cursor:'pointer', fontWeight:'bold',
            opacity: (!age || !gender || !occupation) ? 0.5 : 1 }}>
          Begin Assessment →
        </button>
      </div>
    </div>
  );

  // ── QUESTIONS ─────────────────────────────────────────────
  if (phase === 'questions' && currentQuestion) {
    const labels = currentQuestion.labels ||
      (currentQuestion.scale === 4 ? labels4 : labels5);

    return (
      <div style={{ fontFamily:'sans-serif', maxWidth:580, margin:'0 auto' }}>
        <div style={{ marginBottom:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between',
            fontSize:13, color:'#64748b', marginBottom:6 }}>
            <span style={{ fontWeight:'bold', color:'#6366f1' }}>
              {currentSection.name}
            </span>
            <span>{progress}% complete</span>
          </div>
          <div style={{ background:'#e2e8f0', borderRadius:6, height:6 }}>
            <div style={{ width:`${progress}%`, background:'#6366f1',
              height:6, borderRadius:6, transition:'width 0.4s ease' }} />
          </div>
          <div style={{ fontSize:12, color:'#94a3b8', marginTop:4 }}>
            Adaptive — questions adjust based on your answers
          </div>
        </div>

        <div style={{ background:'#fff', borderRadius:20, padding:32,
          border:'1px solid #e2e8f0',
          boxShadow:'0 4px 24px rgba(99,102,241,0.08)', marginBottom:16 }}>
          <p style={{ fontSize:19, color:'#1e293b', lineHeight:1.6,
            margin:'0 0 28px', textAlign:'center', fontWeight:500 }}>
            {currentQuestion.text}
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {labels.map((label, i) => (
              <button key={i} onClick={() => handleAnswer(i)}
                style={{ padding:'14px 20px', background:'#f8fafc',
                  border:'2px solid #e2e8f0', borderRadius:12, fontSize:15,
                  cursor:'pointer', textAlign:'left', color:'#334155',
                  transition:'all 0.15s' }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#6366f1';
                  e.currentTarget.style.background  = '#eef2ff';
                  e.currentTarget.style.color       = '#6366f1';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.background  = '#f8fafc';
                  e.currentTarget.style.color       = '#334155';
                }}>
                <span style={{ color:'#6366f1', fontWeight:'bold',
                  marginRight:12 }}>{i}.</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {(sectionIdx > 0 || questionIdx > 0) && (
          <button onClick={handleBack}
            style={{ padding:'8px 20px', background:'transparent',
              border:'1px solid #e2e8f0', borderRadius:8,
              color:'#94a3b8', cursor:'pointer', fontSize:13 }}>
            ← Back
          </button>
        )}
      </div>
    );
  }

  return null;
}