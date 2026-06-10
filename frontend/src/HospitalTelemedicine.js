import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabase';
import axios from 'axios';
const API = 'https://web-production-3887e.up.railway.app';

const TIMER_FMT = (s) => `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor((s%3600)/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

export default function HospitalTelemedicine({ hospital, patients, staff, user, S, card, Badge, isMobile }) {
  const [view, setView] = useState('list'); // list | pre | call | post
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [form, setForm] = useState({ patient_id:'', doctor_id:'', scheduled_at:'', notes:'' });
  const [showForm, setShowForm] = useState(false);

  // Call state
  const [callStatus, setCallStatus] = useState('idle');
  const [localStream, setLocalStream] = useState(null);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [duration, setDuration] = useState(0);
  const [activeTab, setActiveTab] = useState('brief');
  const [notes, setNotes] = useState('');
  const [chatMsg, setChatMsg] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [soapGenerated, setSoapGenerated] = useState('');
  const [generating, setGenerating] = useState(false);
  const [deviceCheck, setDeviceCheck] = useState({ camera:null, mic:null, speaker:null });
  const [consentGiven, setConsentGiven] = useState(false);

  // Post-session wizard
  const [postStep, setPostStep] = useState(0);
  const [postNotes, setPostNotes] = useState('');
  const [homework, setHomework] = useState([]);
  const [followUp, setFollowUp] = useState('14 days');

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const timerRef = useRef();
  const pcRef = useRef();

  useEffect(() => { loadSessions(); }, [hospital]);
  useEffect(() => {
    if (callStatus==='live') { timerRef.current = setInterval(()=>setDuration(d=>d+1),1000); }
    else clearInterval(timerRef.current);
    return ()=>clearInterval(timerRef.current);
  }, [callStatus]);

  const loadSessions = async () => {
    if (!hospital) return;
    const { data } = await supabase.from('telemedicine_sessions')
      .select('*, hospital_patients(full_name, patient_uid, date_of_birth), hospital_staff(name, designation)')
      .eq('hospital_id', hospital.id).order('scheduled_at', { ascending:false });
    setSessions(data||[]);
  };

  const scheduleSession = async () => {
    if (!form.patient_id||!form.scheduled_at) return;
    const roomId = Math.random().toString(36).substring(2,10).toUpperCase();
    await supabase.from('telemedicine_sessions').insert({ hospital_id:hospital.id, patient_id:form.patient_id, doctor_id:form.doctor_id||null, scheduled_at:form.scheduled_at, notes:form.notes, room_id:roomId, status:'scheduled' });
    setForm({ patient_id:'', doctor_id:'', scheduled_at:'', notes:'' });
    setShowForm(false);
    await loadSessions();
  };

  const checkDevices = async () => {
    try { await navigator.mediaDevices.getUserMedia({video:true,audio:true}); setDeviceCheck({camera:true,mic:true,speaker:true}); }
    catch { setDeviceCheck({camera:false,mic:false,speaker:false}); }
  };

  const startCall = async (session) => {
    setActiveSession(session);
    setDuration(0);
    setNotes(`Patient: ${session.hospital_patients?.full_name}\nSession Date: ${new Date().toLocaleDateString('en-IN')}\n\nSUBJECTIVE:\n\nOBJECTIVE:\nPHQ-9: \nGAD-7: \n\nASSESSMENT:\n\nPLAN:\n`);
    setCallStatus('connecting');
    setView('call');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video:true, audio:true });
      setLocalStream(stream);
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      const pc = new RTCPeerConnection({ iceServers:[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'}] });
      pcRef.current = pc;
      stream.getTracks().forEach(t=>pc.addTrack(t,stream));
      pc.ontrack = e=>{ if(remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0]; };
      await supabase.from('telemedicine_sessions').update({ status:'in_progress', started_at:new Date().toISOString() }).eq('id', session.id);
      setCallStatus('live');
    } catch { setCallStatus('error'); }
  };

  const endCall = async () => {
    localStream?.getTracks().forEach(t=>t.stop());
    pcRef.current?.close();
    setLocalStream(null);
    setCallStatus('ended');
    if (activeSession) {
      await supabase.from('telemedicine_sessions').update({ status:'completed', ended_at:new Date().toISOString(), duration_seconds:duration }).eq('id', activeSession.id);
    }
    setPostNotes(notes);
    setPostStep(0);
    setView('post');
  };

  const generateSOAP = async () => {
    if (!activeSession) return;
    setGenerating(true);
    try {
      const res = await axios.post(API+'/generate-soap', { patient_name:activeSession.hospital_patients?.full_name, session_notes:notes, psychologist_id:user?.id });
      setSoapGenerated(res.data.soap_note||notes);
      setPostNotes(res.data.soap_note||notes);
    } catch { setSoapGenerated(notes); setPostNotes(notes); }
    setGenerating(false);
  };

  const finishPost = async () => {
    if (activeSession) {
      await supabase.from('telemedicine_sessions').update({ soap_note:postNotes, homework, follow_up_days:followUp }).eq('id', activeSession.id);
    }
    setActiveSession(null);
    setView('list');
    setDuration(0);
    setNotes('');
    setSoapGenerated('');
    setHomework([]);
    await loadSessions();
  };

  const toggleMute = () => { localStream?.getAudioTracks().forEach(t=>{t.enabled=!t.enabled;}); setMuted(m=>!m); };
  const toggleVideo = () => { localStream?.getVideoTracks().forEach(t=>{t.enabled=!t.enabled;}); setVideoOff(v=>!v); };

  const sendChat = () => {
    if (!chatMsg.trim()) return;
    setChatHistory(h=>[...h,{role:'doctor',msg:chatMsg,time:new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}]);
    setChatMsg('');
  };

  const today = sessions.filter(s=>s.status==='scheduled'&&new Date(s.scheduled_at).toDateString()===new Date().toDateString());
  const upcoming = sessions.filter(s=>s.status==='scheduled'&&new Date(s.scheduled_at)>new Date());
  const selPatientData = activeSession ? patients.find(p=>p.id===activeSession.patient_id) : null;

  // ── PRE-SESSION LOBBY ──────────────────────────────────────
  if (view==='pre') return (
    <div style={{ maxWidth:640, margin:'0 auto' }}>
      <button onClick={()=>setView('list')} style={{ padding:'7px 14px', background:S.bg, border:`0.5px solid ${S.border}`, borderRadius:8, fontSize:12, cursor:'pointer', color:S.muted, marginBottom:20 }}>← Back</button>
      <div style={{ ...card, padding:32 }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ width:56, height:56, borderRadius:'50%', background:`linear-gradient(135deg,${S.blue},${S.cyan})`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px', fontSize:22, fontWeight:700, color:'#fff' }}>
            {(activeSession?.hospital_patients?.full_name||'P')[0]}
          </div>
          <div style={{ fontSize:18, fontWeight:700, color:S.navy }}>{activeSession?.hospital_patients?.full_name}</div>
          <div style={{ fontSize:12, color:S.muted }}>Session · {activeSession?.scheduled_at?new Date(activeSession.scheduled_at).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):''}</div>
        </div>

        {/* Device check */}
        <div style={{ background:S.bg, borderRadius:10, padding:16, marginBottom:20 }}>
          <div style={{ fontSize:12, fontWeight:700, color:S.navy, marginBottom:12 }}>System Check</div>
          {[['Camera',deviceCheck.camera],['Microphone',deviceCheck.mic],['Speaker',deviceCheck.speaker]].map(([label,status])=>(
            <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:`0.5px solid ${S.border}` }}>
              <span style={{ fontSize:13, color:S.navy }}>{label}</span>
              <span style={{ fontSize:12, fontWeight:600, color:status===null?S.hint:status?S.success:S.danger }}>{status===null?'Not checked':status?'✓ Ready':'✗ Not found'}</span>
            </div>
          ))}
          <button onClick={checkDevices} style={{ marginTop:10, width:'100%', padding:'8px', background:S.lightBlue, color:S.blue, border:'none', borderRadius:7, fontSize:12, fontWeight:600, cursor:'pointer' }}>Run Device Check</button>
        </div>

        {/* AI Brief */}
        {selPatientData && (
          <div style={{ background:S.lightBlue, borderRadius:10, padding:16, marginBottom:20 }}>
            <div style={{ fontSize:11, fontWeight:700, color:S.blue, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>AI Pre-Session Brief</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:10 }}>
              {[['PHQ-9',selPatientData.latest?.phq_score??'—'],['GAD-7',selPatientData.latest?.gad_score??'—'],['Risk',selPatientData.riskLevel||'—']].map(([label,val])=>(
                <div key={label} style={{ background:'#fff', borderRadius:7, padding:'8px 10px', textAlign:'center' }}>
                  <div style={{ fontSize:16, fontWeight:700, color:S.navy }}>{val}</div>
                  <div style={{ fontSize:10, color:S.muted }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Consent */}
        <div style={{ background:'#FFFBEB', border:`0.5px solid #FDE68A`, borderRadius:10, padding:14, marginBottom:20 }}>
          <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
            <input type="checkbox" id="consent" checked={consentGiven} onChange={e=>setConsentGiven(e.target.checked)} style={{ marginTop:2 }}/>
            <label htmlFor="consent" style={{ fontSize:12, color:S.navy, lineHeight:1.6, cursor:'pointer' }}>I confirm the patient has given verbal consent to proceed with this teleconsultation. This session may be documented for clinical records.</label>
          </div>
        </div>

        <button onClick={()=>startCall(activeSession)} disabled={!consentGiven}
          style={{ width:'100%', padding:'13px', background:consentGiven?S.success:'#e2e8f0', color:consentGiven?'#fff':S.hint, border:'none', borderRadius:10, fontSize:15, fontWeight:700, cursor:consentGiven?'pointer':'not-allowed' }}>
          Start Session
        </button>
      </div>
    </div>
  );

  // ── ACTIVE CALL ──────────────────────────────────────────────
  if (view==='call') return (
    <div style={{ background:S.navy, borderRadius:16, overflow:'hidden', height:'82vh', display:'grid', gridTemplateColumns:'1fr 360px' }}>
      {/* Video + controls */}
      <div style={{ position:'relative', background:'#0a0f1e', display:'flex', flexDirection:'column' }}>
        {/* Top bar */}
        <div style={{ padding:'10px 16px', background:'rgba(0,0,0,0.4)', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
          <div style={{ display:'flex', gap:12, alignItems:'center' }}>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:callStatus==='live'?'#22c55e':'#F59E0B', animation:'pulse 1.5s ease-in-out infinite' }}/>
              <span style={{ fontSize:12, color:'rgba(255,255,255,0.7)', fontWeight:600 }}>{callStatus==='live'?'Live':'Connecting...'}</span>
            </div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.8)', fontWeight:700 }}>{activeSession?.hospital_patients?.full_name}</div>
            <div style={{ padding:'2px 8px', borderRadius:100, background:'rgba(255,255,255,0.1)', fontSize:11, color:'rgba(255,255,255,0.6)' }}>Room: {activeSession?.room_id}</div>
          </div>
          <div style={{ fontSize:18, fontWeight:700, color:'#22c55e', fontFamily:'monospace' }}>{TIMER_FMT(duration)}</div>
        </div>

        {/* Remote video */}
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
          <video ref={remoteVideoRef} autoPlay playsInline style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
          {callStatus!=='live'&&(
            <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
              <div style={{ width:80, height:80, borderRadius:'50%', background:'rgba(29,78,216,0.3)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16, fontSize:32, fontWeight:700, color:'#93C5FD' }}>{(activeSession?.hospital_patients?.full_name||'P')[0]}</div>
              <div style={{ fontSize:14, color:'rgba(255,255,255,0.6)' }}>Waiting for patient to join...</div>
            </div>
          )}
          {/* Local pip */}
          <div style={{ position:'absolute', bottom:12, right:12, width:140, height:105, background:'#111', borderRadius:10, overflow:'hidden', border:'2px solid rgba(255,255,255,0.15)' }}>
            <video ref={localVideoRef} autoPlay playsInline muted style={{ width:'100%', height:'100%', objectFit:'cover', transform:'scaleX(-1)', display:videoOff?'none':'block' }}/>
            {videoOff&&<div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.3)', fontSize:12 }}>Camera off</div>}
          </div>
        </div>

        {/* Controls */}
        <div style={{ padding:'14px 20px', background:'rgba(0,0,0,0.5)', display:'flex', justifyContent:'center', gap:14, flexShrink:0 }}>
          {[
            { label:muted?'Unmute':'Mute', icon:muted?'🎤':'🎤', bg:muted?'#374151':'rgba(255,255,255,0.12)', onClick:toggleMute },
            { label:videoOff?'Start Video':'Stop Video', icon:'📹', bg:videoOff?'#374151':'rgba(255,255,255,0.12)', onClick:toggleVideo },
            { label:'Share Screen', icon:'🖥', bg:'rgba(255,255,255,0.12)', onClick:async()=>{ try{ const s=await navigator.mediaDevices.getDisplayMedia({video:true}); if(pcRef.current){const sender=pcRef.current.getSenders().find(s=>s.track?.kind==='video'); sender?.replaceTrack(s.getTracks()[0]);} }catch{} } },
            { label:'Generate SOAP', icon:'🤖', bg:'rgba(29,78,216,0.4)', onClick:generateSOAP },
            { label:'End Call', icon:'📵', bg:'#DC2626', onClick:endCall },
          ].map((btn,i)=>(
            <button key={i} onClick={btn.onClick} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, background:'none', border:'none', cursor:'pointer' }}>
              <div style={{ width:46, height:46, borderRadius:'50%', background:btn.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{btn.icon}</div>
              <span style={{ fontSize:9, color:'rgba(255,255,255,0.5)' }}>{btn.label}</span>
            </button>
          ))}
        </div>
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
      </div>

      {/* Clinical workspace */}
      <div style={{ display:'flex', flexDirection:'column', borderLeft:'1px solid rgba(255,255,255,0.07)', background:'rgba(255,255,255,0.02)' }}>
        {/* Workspace tabs */}
        <div style={{ display:'flex', borderBottom:'1px solid rgba(255,255,255,0.07)', flexShrink:0 }}>
          {[['brief','Brief'],['notes','Notes'],['rx','Rx'],['timeline','History'],['chat','Chat']].map(([id,label])=>(
            <button key={id} onClick={()=>setActiveTab(id)} style={{ flex:1, padding:'10px 4px', background:'none', border:'none', fontSize:11, fontWeight:activeTab===id?700:400, color:activeTab===id?'#93C5FD':'rgba(255,255,255,0.4)', cursor:'pointer', borderBottom:`2px solid ${activeTab===id?'#93C5FD':'transparent'}` }}>{label}</button>
          ))}
        </div>

        {/* AI Brief */}
        {activeTab==='brief'&&(
          <div style={{ flex:1, overflowY:'auto', padding:14 }}>
            {selPatientData ? (
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:'#fff', marginBottom:12 }}>{selPatientData.display_name||selPatientData.full_name}</div>
                {[['PHQ-9',selPatientData.latest?.phq_score,'—'],['GAD-7',selPatientData.latest?.gad_score,'—'],['Risk Level',selPatientData.riskLevel,'unknown'],['Sessions',selPatientData.sessions?.length||0,''],['Trend',selPatientData.phqTrend||'unknown','']].map(([label,val,fallback])=>(
                  <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize:12, color:'rgba(255,255,255,0.5)' }}>{label}</span>
                    <span style={{ fontSize:12, fontWeight:700, color: label==='Risk Level'&&val==='critical'?'#FCA5A5':label==='Risk Level'&&val==='high'?'#FDE68A':'rgba(255,255,255,0.85)', textTransform:'capitalize' }}>{val??fallback}</span>
                  </div>
                ))}
                {selPatientData.journals?.slice(0,2).map(j=>(
                  <div key={j.id} style={{ marginTop:10, background:'rgba(255,255,255,0.04)', borderRadius:8, padding:10 }}>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginBottom:4 }}>Latest Journal</div>
                    <div style={{ fontSize:12, color:'rgba(255,255,255,0.6)', lineHeight:1.5 }}>{j.text?.slice(0,120)}...</div>
                  </div>
                ))}
              </div>
            ) : <div style={{ color:'rgba(255,255,255,0.3)', fontSize:12, padding:20, textAlign:'center' }}>No patient data available</div>}
          </div>
        )}

        {/* Notes */}
        {activeTab==='notes'&&(
          <div style={{ flex:1, display:'flex', flexDirection:'column', padding:10 }}>
            <div style={{ display:'flex', gap:6, marginBottom:8 }}>
              {['SOAP','DAP','BIRP'].map(t=>(
                <button key={t} onClick={()=>setNotes(`${t}:\n`)} style={{ padding:'3px 8px', borderRadius:5, border:'none', fontSize:10, background:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.6)', cursor:'pointer' }}>{t}</button>
              ))}
              {generating&&<span style={{ fontSize:11, color:'#93C5FD' }}>Generating...</span>}
            </div>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} style={{ flex:1, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:10, fontSize:12, color:'rgba(255,255,255,0.85)', resize:'none', outline:'none', lineHeight:1.7, fontFamily:"'Satoshi',-apple-system,monospace" }}/>
            <div style={{ display:'flex', gap:6, marginTop:8 }}>
              <button onClick={generateSOAP} disabled={generating} style={{ flex:1, padding:'7px', background:'rgba(29,78,216,0.3)', color:'#93C5FD', border:'1px solid rgba(29,78,216,0.4)', borderRadius:7, fontSize:11, cursor:'pointer', fontWeight:600 }}>{generating?'Generating...':'AI Generate SOAP'}</button>
            </div>
          </div>
        )}

        {/* Quick Rx */}
        {activeTab==='rx'&&(
          <div style={{ flex:1, overflowY:'auto', padding:14 }}>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)', marginBottom:12 }}>Quick prescription builder — issue after session</div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:12 }}>
              {['Escitalopram 10mg OD','Clonazepam 0.5mg OD','Sertraline 50mg OD','Olanzapine 5mg OD'].map(drug=>(
                <div key={drug} onClick={()=>setChatHistory(h=>[...h,{role:'rx',msg:drug,time:new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}])} style={{ padding:'5px 10px', background:'rgba(29,78,216,0.2)', border:'1px solid rgba(29,78,216,0.3)', borderRadius:100, fontSize:11, color:'#93C5FD', cursor:'pointer' }}>{drug}</div>
              ))}
            </div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>Full prescription management available after session ends.</div>
          </div>
        )}

        {/* Timeline */}
        {activeTab==='timeline'&&(
          <div style={{ flex:1, overflowY:'auto', padding:14 }}>
            {selPatientData?.sessions?.slice(0,5).map((s,i)=>(
              <div key={i} style={{ padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>{new Date(s.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.7)' }}>PHQ-9: {s.phq_score} · GAD-7: {s.gad_score}</div>
              </div>
            ))||<div style={{ color:'rgba(255,255,255,0.3)', fontSize:12, padding:20, textAlign:'center' }}>No history</div>}
          </div>
        )}

        {/* Chat */}
        {activeTab==='chat'&&(
          <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
            <div style={{ flex:1, overflowY:'auto', padding:12, display:'flex', flexDirection:'column', gap:8 }}>
              {chatHistory.map((m,i)=>(
                <div key={i} style={{ background:m.role==='doctor'?'rgba(29,78,216,0.25)':'rgba(255,255,255,0.06)', borderRadius:8, padding:'7px 10px' }}>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginBottom:2 }}>{m.role==='doctor'?'You':activeSession?.hospital_patients?.full_name} · {m.time}</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.8)' }}>{m.msg}</div>
                </div>
              ))}
              {chatHistory.length===0&&<div style={{ textAlign:'center', fontSize:11, color:'rgba(255,255,255,0.2)', padding:20 }}>Send a message to the patient...</div>}
            </div>
            <div style={{ padding:8, borderTop:'1px solid rgba(255,255,255,0.07)', display:'flex', gap:6 }}>
              <input value={chatMsg} onChange={e=>setChatMsg(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendChat()} placeholder="Message..." style={{ flex:1, padding:'7px 10px', borderRadius:7, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', color:'#fff', fontSize:12, outline:'none' }}/>
              <button onClick={sendChat} style={{ padding:'7px 12px', background:S.blue, color:'#fff', border:'none', borderRadius:7, cursor:'pointer', fontSize:12 }}>→</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ── POST-SESSION WIZARD ──────────────────────────────────────
  if (view==='post') return (
    <div style={{ maxWidth:720, margin:'0 auto' }}>
      <div style={{ display:'flex', gap:8, marginBottom:24 }}>
        {['Review Notes','Prescription','Homework','Follow-up','Complete'].map((step,i)=>(
          <div key={i} style={{ flex:1, textAlign:'center' }}>
            <div style={{ height:4, borderRadius:2, background:i<=postStep?S.blue:S.border, marginBottom:6 }}/>
            <div style={{ fontSize:10, fontWeight:i===postStep?700:400, color:i<=postStep?S.blue:S.hint }}>{step}</div>
          </div>
        ))}
      </div>

      {postStep===0&&(
        <div style={{ ...card }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <div style={{ fontSize:15, fontWeight:700, color:S.navy }}>Session Notes</div>
            <button onClick={generateSOAP} disabled={generating} style={{ padding:'7px 14px', background:S.lightBlue, color:S.blue, border:'none', borderRadius:7, fontSize:12, cursor:'pointer', fontWeight:600 }}>{generating?'Generating...':'AI Generate SOAP'}</button>
          </div>
          <textarea value={postNotes} onChange={e=>setPostNotes(e.target.value)} rows={12} style={{ width:'100%', padding:'12px', borderRadius:8, border:`0.5px solid ${S.border}`, fontSize:13, background:S.bg, color:S.navy, outline:'none', resize:'vertical', fontFamily:"'Satoshi',-apple-system,monospace", lineHeight:1.8, boxSizing:'border-box' }}/>
          <button onClick={()=>setPostStep(1)} style={{ marginTop:14, padding:'10px 24px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer' }}>Approve Notes →</button>
        </div>
      )}

      {postStep===1&&(
        <div style={{ ...card }}>
          <div style={{ fontSize:15, fontWeight:700, color:S.navy, marginBottom:6 }}>Prescription</div>
          <div style={{ fontSize:13, color:S.muted, marginBottom:16 }}>Do you need to issue a prescription for this session?</div>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={()=>setPostStep(2)} style={{ flex:1, padding:'10px', background:S.bg, color:S.navy, border:`0.5px solid ${S.border}`, borderRadius:8, fontSize:13, cursor:'pointer' }}>Skip — No Prescription</button>
            <button onClick={()=>{ setPostStep(2); }} style={{ flex:1, padding:'10px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>Create Prescription →</button>
          </div>
        </div>
      )}

      {postStep===2&&(
        <div style={{ ...card }}>
          <div style={{ fontSize:15, fontWeight:700, color:S.navy, marginBottom:14 }}>Assign Homework</div>
          {[['Mindfulness Exercise','5 min daily breathing exercise — Box breathing: 4-4-4-4'],['Behavioural Activation','Schedule 1 enjoyable activity per day for the next week'],['CBT Thought Diary','Record 3 automatic negative thoughts and challenge them'],['Journaling Prompt','Write about a situation where you felt in control this week'],['Sleep Hygiene','Follow sleep schedule: no screens 1 hour before bed, wake at same time'],['Progressive Muscle Relaxation','10 min PMR exercise before sleep'],['Social Connection','Reach out to one friend or family member this week']].map(([title, desc])=>(
            <div key={title} onClick={()=>setHomework(h=>h.includes(title)?h.filter(x=>x!==title):[...h,title])}
              style={{ display:'flex', gap:10, padding:'10px 12px', borderRadius:8, cursor:'pointer', marginBottom:6, background:homework.includes(title)?S.lightBlue:'transparent', border:`0.5px solid ${homework.includes(title)?S.blue:S.border}` }}>
              <div style={{ width:18, height:18, borderRadius:'50%', background:homework.includes(title)?S.blue:S.border, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                {homework.includes(title)&&<svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <div><div style={{ fontSize:13, fontWeight:600, color:S.navy }}>{title}</div><div style={{ fontSize:11, color:S.muted }}>{desc}</div></div>
            </div>
          ))}
          <button onClick={()=>setPostStep(3)} style={{ marginTop:14, padding:'10px 24px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer' }}>Next →</button>
        </div>
      )}

      {postStep===3&&(
        <div style={{ ...card }}>
          <div style={{ fontSize:15, fontWeight:700, color:S.navy, marginBottom:14 }}>Schedule Follow-up</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:16 }}>
            {['7 days','14 days','1 month','2 months','3 months','As needed'].map(opt=>(
              <div key={opt} onClick={()=>setFollowUp(opt)} style={{ padding:'12px', textAlign:'center', borderRadius:9, cursor:'pointer', border:`1.5px solid ${followUp===opt?S.blue:S.border}`, background:followUp===opt?S.lightBlue:'transparent', fontWeight:followUp===opt?700:400, color:followUp===opt?S.blue:S.navy, fontSize:13 }}>{opt}</div>
            ))}
          </div>
          <button onClick={()=>setPostStep(4)} style={{ padding:'10px 24px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer' }}>Next →</button>
        </div>
      )}

      {postStep===4&&(
        <div style={{ ...card, textAlign:'center', padding:40 }}>
          <div style={{ width:64, height:64, borderRadius:'50%', background:'#ECFDF5', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke={S.success} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div style={{ fontSize:20, fontWeight:700, color:S.navy, marginBottom:8 }}>Session Complete</div>
          <div style={{ fontSize:13, color:S.muted, marginBottom:20 }}>
            Duration: {TIMER_FMT(duration)} · Notes saved · Follow-up in {followUp}
            {homework.length>0&&<div style={{ marginTop:6 }}>{homework.length} homework tasks assigned</div>}
          </div>
          <button onClick={finishPost} style={{ padding:'12px 32px', background:S.blue, color:'#fff', border:'none', borderRadius:9, fontSize:14, fontWeight:700, cursor:'pointer' }}>Save & Close Session</button>
        </div>
      )}
    </div>
  );

  // ── LIST VIEW ──────────────────────────────────────────────
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <h2 style={{ margin:0, color:S.navy, fontSize:20, fontWeight:700 }}>Telemedicine</h2>
        <button onClick={()=>setShowForm(f=>!f)} style={{ padding:'8px 20px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer' }}>+ Schedule Session</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:isMobile?'repeat(2,1fr)':'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        {[['Today',today.length,S.blue],['Upcoming',upcoming.length,S.success],['Completed',sessions.filter(s=>s.status==='completed').length,S.muted],['Total',sessions.length,S.navy]].map(([label,val,color])=>(
          <div key={label} style={{ ...card, padding:'14px 18px', borderLeft:`3px solid ${color}` }}>
            <div style={{ fontSize:26, fontWeight:700, color }}>{val}</div>
            <div style={{ fontSize:11, color:S.muted, marginTop:2 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ background:'#EFF6FF', border:'0.5px solid #BFDBFE', borderRadius:10, padding:'10px 16px', marginBottom:20, fontSize:12, color:S.blue }}>
        Telemedicine uses WebRTC. Works on Chrome and Firefox. Camera and microphone access required. For production NAT traversal, configure a TURN server.
      </div>

      {showForm&&(
        <div style={{ ...card, marginBottom:20, borderColor:S.blue }}>
          <div style={{ fontSize:13, fontWeight:700, color:S.navy, marginBottom:14 }}>Schedule Session</div>
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(2,1fr)', gap:12, marginBottom:14 }}>
            {[['Patient *','patient_id','select'],['Doctor','doctor_id','select'],['Date & Time *','scheduled_at','datetime-local'],['Notes','notes','text']].map(([label,key,type])=>(
              <div key={key}>
                <div style={{ fontSize:10, color:S.muted, marginBottom:4, textTransform:'uppercase', fontWeight:600 }}>{label}</div>
                {type==='select'?(
                  <select value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} style={{ width:'100%', padding:'9px 10px', borderRadius:8, border:`0.5px solid ${S.border}`, fontSize:13, background:S.bg, color:S.navy, outline:'none' }}>
                    <option value="">{key==='patient_id'?'Select patient':'Select doctor (optional)'}</option>
                    {key==='patient_id'?patients.map(p=><option key={p.id} value={p.id}>{p.full_name} ({p.patient_uid})</option>):(staff||[]).map(s=><option key={s.id} value={s.id}>{s.name} — {s.designation}</option>)}
                  </select>
                ):(
                  <input type={type} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={key==='notes'?'Consultation reason...':''} style={{ width:'100%', padding:'9px 10px', borderRadius:8, border:`0.5px solid ${S.border}`, fontSize:13, background:S.bg, color:S.navy, outline:'none', boxSizing:'border-box' }}/>
                )}
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={scheduleSession} disabled={!form.patient_id||!form.scheduled_at} style={{ padding:'9px 20px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', opacity:(!form.patient_id||!form.scheduled_at)?0.6:1 }}>Schedule</button>
            <button onClick={()=>setShowForm(false)} style={{ padding:'9px 16px', background:'transparent', color:S.muted, border:`0.5px solid ${S.border}`, borderRadius:8, fontSize:13, cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {sessions.length===0?<div style={{ ...card, textAlign:'center', padding:56, color:S.muted }}>No sessions yet.</div>:
        sessions.map(s=>(
          <div key={s.id} style={{ ...card, marginBottom:10, padding:'14px 20px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:S.navy, marginBottom:3 }}>{s.hospital_patients?.full_name}</div>
                <div style={{ fontSize:11, color:S.muted }}>{new Date(s.scheduled_at).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}{s.hospital_staff?` · Dr. ${s.hospital_staff.name}`:''}</div>
                {s.notes&&<div style={{ fontSize:11, color:S.hint, marginTop:2 }}>{s.notes}</div>}
                <div style={{ fontSize:10, color:S.hint, fontFamily:'monospace', marginTop:2 }}>Room: {s.room_id}</div>
                {s.duration_seconds&&<div style={{ fontSize:11, color:S.muted, marginTop:2 }}>Duration: {TIMER_FMT(s.duration_seconds)}</div>}
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <Badge color={s.status==='scheduled'?'blue':s.status==='completed'?'green':s.status==='in_progress'?'yellow':'red'}>{s.status}</Badge>
                {s.status==='scheduled'&&(
                  <button onClick={()=>{ setActiveSession(s); setView('pre'); checkDevices(); }} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', background:S.success, color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M23 7l-7 5 7 5V7z" fill="#fff"/><rect x="1" y="5" width="15" height="14" rx="2" fill="#fff"/></svg>
                    Join
                  </button>
                )}
              </div>
            </div>
          </div>
        ))
      }
    </div>
  );
}
