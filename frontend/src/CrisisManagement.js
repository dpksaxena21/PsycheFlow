import React, { useState } from 'react';
import { theme as t } from './theme';

const HELPLINES = [
  { name:'iCall', number:'9152987821', desc:'Mon-Sat, 8AM-10PM', tag:'Recommended' },
  { name:'Vandrevala Foundation', number:'1860-2662-345', desc:'24/7 helpline', tag:'24/7' },
  { name:'NIMHANS', number:'080-46110007', desc:'National Institute of Mental Health', tag:'Government' },
  { name:'Snehi', number:'044-24640050', desc:'Emotional support helpline', tag:'Support' },
  { name:'Aasra', number:'9820466627', desc:'Crisis intervention, 24/7', tag:'24/7' },
];

const TECHNIQUES = [
  { title:'5-4-3-2-1 Grounding', desc:'Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.', duration:'3 min' },
  { title:'Box breathing', desc:'Breathe in 4 counts, hold 4, out 4, hold 4. Repeat 4 times.', duration:'2 min' },
  { title:'Cold water technique', desc:'Splash cold water on your face or hold an ice cube to activate the dive reflex.', duration:'1 min' },
  { title:'Safe place visualisation', desc:'Close your eyes and imagine a place where you feel completely safe and calm.', duration:'5 min' },
];

export default function CrisisManagement({ onBack }) {
  const [activeTab, setActiveTab] = useState('help');

  return (
    <div style={{ minHeight:'100vh', background:t.bg, fontFamily:t.font }}>

      {/* Header */}
      <div style={{ background:t.danger, padding:'16px 24px', display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={onBack} style={{ background:'rgba(255,255,255,0.2)', border:'none', color:'#fff', width:32, height:32, borderRadius:8, cursor:'pointer', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center' }}>←</button>
        <div>
          <div style={{ fontSize:16, fontWeight:700, color:'#fff' }}>Crisis Support</div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.7)' }}>You are not alone. Help is available right now.</div>
        </div>
      </div>

      <div style={{ maxWidth:600, margin:'0 auto', padding:24 }}>

        {/* Emergency banner */}
        <div style={{ background:t.dangerBg, borderRadius:12, padding:16, border:`0.5px solid ${t.danger}`, marginBottom:20, textAlign:'center' }}>
          <div style={{ fontSize:13, fontWeight:600, color:t.danger, marginBottom:4 }}>If you are in immediate danger</div>
          <div style={{ fontSize:24, fontWeight:700, color:t.danger }}>Call 112</div>
          <div style={{ fontSize:12, color:'#991B1B', marginTop:4 }}>National Emergency Number — Police, Ambulance, Fire</div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:8, marginBottom:20 }}>
          {[{id:'help',label:'Helplines'},{id:'techniques',label:'Coping techniques'},{id:'safety',label:'Safety plan'}].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex:1, padding:'9px', borderRadius:8, border:`0.5px solid ${activeTab===tab.id?t.blue:t.border}`, background:activeTab===tab.id?t.blue2:t.white, color:activeTab===tab.id?t.blue:t.text2, fontSize:12, fontWeight:activeTab===tab.id?600:400, cursor:'pointer', fontFamily:t.font }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Helplines */}
        {activeTab === 'help' && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {HELPLINES.map((h, i) => (
              <div key={i} style={{ background:t.white, borderRadius:12, border:`0.5px solid ${t.border}`, padding:16, display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:t.blue2, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 3C3 3 5 2 6.5 4L7.5 6C7.5 6 8 7 7 7.5C6 8 5.5 8.5 6 9.5C6.5 10.5 8.5 12.5 9.5 13C10.5 13.5 11 13 11.5 12C12 11 13 11.5 13 11.5L15 12.5C17 14 16 16 16 16C16 16 14 18 10 15C6 12 2 8 3 3Z" stroke={t.blue} strokeWidth="1.3" strokeLinejoin="round"/></svg>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
                    <span style={{ fontSize:13, fontWeight:600, color:t.navy }}>{h.name}</span>
                    <span style={{ fontSize:9, fontWeight:600, padding:'2px 7px', borderRadius:100, background:t.blue2, color:t.blue }}>{h.tag}</span>
                  </div>
                  <div style={{ fontSize:11, color:t.text3 }}>{h.desc}</div>
                </div>
                <a href={`tel:${h.number}`} style={{ background:t.blue, color:'#fff', borderRadius:8, padding:'8px 14px', fontSize:13, fontWeight:600, textDecoration:'none', flexShrink:0 }}>{h.number}</a>
              </div>
            ))}
          </div>
        )}

        {/* Techniques */}
        {activeTab === 'techniques' && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {TECHNIQUES.map((t2, i) => (
              <div key={i} style={{ background:t.white, borderRadius:12, border:`0.5px solid ${t.border}`, padding:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:t.navy }}>{t2.title}</div>
                  <div style={{ fontSize:11, color:t.text3 }}>{t2.duration}</div>
                </div>
                <div style={{ fontSize:12, color:t.text2, lineHeight:1.7 }}>{t2.desc}</div>
              </div>
            ))}
          </div>
        )}

        {/* Safety plan */}
        {activeTab === 'safety' && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[
              { step:'1', title:'Warning signs', desc:'Notice when you start feeling overwhelmed — irritability, isolation, hopelessness.' },
              { step:'2', title:'Internal coping', desc:'Things I can do alone: deep breathing, walking, journaling, listening to music.' },
              { step:'3', title:'People to contact', desc:'Call someone you trust before reaching a crisis point.' },
              { step:'4', title:'Professional support', desc:'Contact your psychologist, therapist, or a helpline above.' },
              { step:'5', title:'Safe environment', desc:'Remove or secure anything that could be used for self-harm.' },
            ].map((s, i) => (
              <div key={i} style={{ background:t.white, borderRadius:12, border:`0.5px solid ${t.border}`, padding:16, display:'flex', gap:14 }}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:t.blue2, color:t.blue, fontSize:13, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{s.step}</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:t.navy, marginBottom:4 }}>{s.title}</div>
                  <div style={{ fontSize:12, color:t.text2, lineHeight:1.6 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
