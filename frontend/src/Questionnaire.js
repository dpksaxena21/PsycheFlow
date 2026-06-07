import { IconBrain } from './icons';
import { IconBrain } from './icons';
import React, { useState } from 'react';

const questions = [
  // Big Five
  { id:'E1', trait:'Extraversion',      text:'I am the life of the party.',                    scale:5 },
  { id:'E2', trait:'Extraversion',      text:'I feel comfortable around people.',               scale:5 },
  { id:'N1', trait:'Neuroticism',       text:'I get stressed out easily.',                      scale:5 },
  { id:'N2', trait:'Neuroticism',       text:'I worry about things.',                           scale:5 },
  { id:'A1', trait:'Agreeableness',     text:'I am interested in people.',                      scale:5 },
  { id:'A2', trait:'Agreeableness',     text:'I sympathize with others\' feelings.',            scale:5 },
  { id:'C1', trait:'Conscientiousness', text:'I am always prepared.',                           scale:5 },
  { id:'C2', trait:'Conscientiousness', text:'I pay attention to details.',                     scale:5 },
  { id:'O1', trait:'Openness',          text:'I have a rich vocabulary.',                       scale:5 },
  { id:'O2', trait:'Openness',          text:'I have a vivid imagination.',                     scale:5 },

  // Dark Triad
  { id:'M1', trait:'Machiavellianism',  text:'I tend to manipulate others to get my way.',     scale:5 },
  { id:'M2', trait:'Machiavellianism',  text:'I have used deceit to get what I want.',         scale:5 },
  { id:'NA1', trait:'Narcissism',       text:'I like to be the center of attention.',           scale:5 },
  { id:'NA2', trait:'Narcissism',       text:'I feel I deserve more than others.',              scale:5 },
  { id:'P1', trait:'Psychopathy',       text:'I rarely feel guilt or remorse.',                 scale:5 },
  { id:'P2', trait:'Psychopathy',       text:'I can stay calm even in tense situations.',      scale:5 },

  // PHQ-9 (Depression)
  { id:'PHQ1', trait:'Depression',      text:'Little interest or pleasure in doing things.',   scale:4 },
  { id:'PHQ2', trait:'Depression',      text:'Feeling down, depressed, or hopeless.',          scale:4 },
  { id:'PHQ3', trait:'Depression',      text:'Trouble falling or staying asleep.',             scale:4 },
  { id:'PHQ4', trait:'Depression',      text:'Feeling tired or having little energy.',         scale:4 },
  { id:'PHQ5', trait:'Depression',      text:'Poor appetite or overeating.',                   scale:4 },
  { id:'PHQ6', trait:'Depression',      text:'Feeling bad about yourself.',                    scale:4 },
  { id:'PHQ7', trait:'Depression',      text:'Trouble concentrating on things.',               scale:4 },

  // GAD-7 (Anxiety)
  { id:'GAD1', trait:'Anxiety',         text:'Feeling nervous, anxious, or on edge.',          scale:4 },
  { id:'GAD2', trait:'Anxiety',         text:'Not being able to stop or control worrying.',    scale:4 },
  { id:'GAD3', trait:'Anxiety',         text:'Worrying too much about different things.',      scale:4 },
  { id:'GAD4', trait:'Anxiety',         text:'Trouble relaxing.',                              scale:4 },
  { id:'GAD5', trait:'Anxiety',         text:'Being so restless that it is hard to sit still.',scale:4 },
  { id:'GAD6', trait:'Anxiety',         text:'Becoming easily annoyed or irritable.',          scale:4 },
  { id:'GAD7', trait:'Anxiety',         text:'Feeling afraid, as if something awful might happen.', scale:4 },
];

const labels5 = ['Strongly Disagree','Disagree','Neutral','Agree','Strongly Agree'];
const labels4 = ['Not at all','Several days','More than half the days','Nearly every day'];

export default function Questionnaire({ onComplete }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers]  = useState({});
  const [age, setAge]          = useState('');
  const [gender, setGender]    = useState('');
  const [started, setStarted]  = useState(false);

  const q = questions[current];
  const progress = Math.round((current / questions.length) * 100);

  const handleAnswer = (val) => {
    const updated = { ...answers, [q.id]: val };
    setAnswers(updated);
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    } else {
      onComplete({ answers: updated, age: parseInt(age), gender: parseInt(gender) });
    }
  };

  if (!started) return (
    <div style={{ textAlign:'center', padding:40 }}>
      <h2 style={{ color:'#6366f1' }}><IconBrain size={20} color='#1D4ED8' style={{marginRight:8}}/> PsycheFlow Assessment</h2>
      <p style={{ color:'#64748b', maxWidth:400, margin:'0 auto 24px' }}>
        A 30-question clinical assessment covering personality, mental health, and behavioral patterns.
        Takes about 5 minutes.
      </p>
      <div style={{ marginBottom:16 }}>
        <input placeholder="Your Age" type="number" value={age}
          onChange={e => setAge(e.target.value)}
          style={{ padding:'10px 16px', borderRadius:8, border:'1px solid #cbd5e1',
            fontSize:15, width:200, marginBottom:12, display:'block', margin:'0 auto 12px' }} />
        <select value={gender} onChange={e => setGender(e.target.value)}
          style={{ padding:'10px 16px', borderRadius:8, border:'1px solid #cbd5e1',
            fontSize:15, width:220, display:'block', margin:'0 auto' }}>
          <option value="">Select Gender</option>
          <option value="1">Male</option>
          <option value="2">Female</option>
          <option value="3">Other</option>
        </select>
      </div>
      <button onClick={() => setStarted(true)}
        disabled={!age || !gender}
        style={{ marginTop:24, padding:'12px 40px', background:'#6366f1',
          color:'#fff', border:'none', borderRadius:10, fontSize:16, cursor:'pointer' }}>
        Begin Assessment
      </button>
    </div>
  );

  const labels = q.scale === 5 ? labels5 : labels4;

  return (
    <div style={{ maxWidth:600, margin:'0 auto', padding:24 }}>
      {/* Progress */}
      <div style={{ marginBottom:24 }}>
        <div style={{ display:'flex', justifyContent:'space-between',
          fontSize:13, color:'#64748b', marginBottom:6 }}>
          <span>Question {current + 1} of {questions.length}</span>
          <span>{progress}% complete</span>
        </div>
        <div style={{ background:'#e2e8f0', borderRadius:6, height:8 }}>
          <div style={{ width:`${progress}%`, background:'#6366f1',
            height:8, borderRadius:6, transition:'width 0.3s ease' }} />
        </div>
        <div style={{ marginTop:6, fontSize:12, color:'#94a3b8' }}>
          Category: {q.trait}
        </div>
      </div>

      {/* Question */}
      <div style={{ background:'#f8fafc', borderRadius:16, padding:32,
        border:'1px solid #e2e8f0', marginBottom:24, minHeight:160,
        display:'flex', alignItems:'center', justifyContent:'center' }}>
        <p style={{ fontSize:20, textAlign:'center', color:'#1e293b',
          margin:0, lineHeight:1.5 }}>
          {q.text}
        </p>
      </div>

      {/* Options */}
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {labels.map((label, i) => (
          <button key={i} onClick={() => handleAnswer(i + 1)}
            style={{ padding:'14px 20px', background:'#fff',
              border:'2px solid #e2e8f0', borderRadius:10, fontSize:15,
              cursor:'pointer', textAlign:'left', color:'#334155',
              transition:'all 0.15s ease' }}
            onMouseEnter={e => {
              e.target.style.borderColor = '#6366f1';
              e.target.style.background = '#eef2ff';
            }}
            onMouseLeave={e => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.background = '#fff';
            }}>
            <span style={{ color:'#6366f1', fontWeight:'bold', marginRight:10 }}>
              {i + 1}.
            </span>
            {label}
          </button>
        ))}
      </div>

      {/* Back button */}
      {current > 0 && (
        <button onClick={() => setCurrent(current - 1)}
          style={{ marginTop:16, padding:'8px 20px', background:'transparent',
            border:'1px solid #cbd5e1', borderRadius:8, color:'#64748b',
            cursor:'pointer', fontSize:13 }}>
          ← Back
        </button>
      )}
    </div>
  );
}