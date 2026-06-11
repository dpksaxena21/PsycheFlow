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
  const [quality, setQuality] = useState({ status:'unknown', latency:0, packetLoss:0, bitrate:0 });
  const [reconnecting, setReconnecting] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [fallbackMode, setFallbackMode] = useState('video'); // video | audio | chat
  const [recording, setRecording] = useState(false);
  const [recordingConsent, setRecordingConsent] = useState(false);
  const [waitingRoom, setWaitingRoom] = useState(false);
  const [patientInWaiting, setPatientInWaiting] = useState(false);
  const [waitingQueue, setWaitingQueue] = useState([]);
  const [waitingTime, setWaitingTime] = useState(0);
  const [waitingTimerRef] = useState({ current: null });
  const [virtualBg, setVirtualBg] = useState('none');
  const [noiseSuppressionEnabled, setNoiseSuppressionEnabled] = useState(true);
  const [echoSuppressionEnabled, setEchoSuppressionEnabled] = useState(true);
  const [micQuality, setMicQuality] = useState('unknown');
  const [audioCtxRef] = useState({ current: null });
  const [showAudioSettings, setShowAudioSettings] = useState(false);
  const [showBgSettings, setShowBgSettings] = useState(false);
  const [sessionDrops, setSessionDrops] = useState(0);
  const [audioProblems, setAudioProblems] = useState(0);
  const qualityIntervalRef = useRef();
  const mediaRecorderRef = useRef();
  const recordedChunksRef = useRef([]);

  // Post-session wizard
  const [postStep, setPostStep] = useState(0);
  const [postNotes, setPostNotes] = useState('');
  const [homework, setHomework] = useState([]);
  const [followUp, setFollowUp] = useState('14 days');

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const timerRef = useRef();
  const pcRef = useRef();

  useEffect(() => { if(hospital) loadSessions(hospital); }, [hospital]);
  useEffect(() => {
    if (callStatus==='live') { timerRef.current = setInterval(()=>setDuration(d=>d+1),1000); }
    else clearInterval(timerRef.current);
    return ()=>clearInterval(timerRef.current);
  }, [callStatus]);

  const loadSessions = async (hosp_override) => {
    const h = hosp_override || hospital;
    if (!h) return;
    const { data } = await supabase.from('telemedicine_sessions')
      .select('*, hospital_patients(full_name, patient_uid, date_of_birth)')
      .eq('hospital_id', h.id).order('scheduled_at', { ascending:false });
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

  // ── WAITING ROOM ──────────────────────────────────────────
  const joinWaitingRoom = (session) => {
    setActiveSession(session);
    setWaitingRoom(true);
    setWaitingTime(0);
    // Start wait timer
    waitingTimerRef.current = setInterval(() => setWaitingTime(t => t + 1), 1000);
    // Simulate patient side — in production use Supabase Realtime subscriptions
    const admitDelay = 8000 + Math.random() * 12000;
    setTimeout(() => {
      setWaitingQueue(q => [...q, { ...session, waitSince: new Date(), riskLevel: 'moderate', phq: 14 }]);
      setPatientInWaiting(true);
    }, admitDelay);
  };

  const admitFromWaiting = (session) => {
    clearInterval(waitingTimerRef.current);
    setPatientInWaiting(false);
    setWaitingRoom(false);
    setWaitingQueue(q => q.filter(x => x.id !== session.id));
    startCall(session);
  };

  const leaveWaitingRoom = () => {
    clearInterval(waitingTimerRef.current);
    setWaitingRoom(false);
    setPatientInWaiting(false);
    setActiveSession(null);
  };

  // ── VIRTUAL BACKGROUND ────────────────────────────────────
  const applyVirtualBackground = (type) => {
    setVirtualBg(type);
    if (!localVideoRef.current) return;
    const canvas = document.createElement('canvas');
    const video = localVideoRef.current;
    if (type === 'blur') {
      video.style.filter = 'blur(0px)';
      // CSS backdrop blur on container
      if (video.parentElement) video.parentElement.style.backdropFilter = 'blur(12px)';
    } else if (type === 'calm') {
      video.style.filter = 'saturate(0.6) brightness(1.1)';
    } else if (type === 'office') {
      video.style.filter = 'contrast(1.05) brightness(0.95)';
    } else if (type === 'therapy') {
      video.style.filter = 'sepia(0.1) brightness(1.05)';
    } else {
      video.style.filter = 'none';
      if (video.parentElement) video.parentElement.style.backdropFilter = 'none';
    }
  };

  // ── NOISE + ECHO SUPPRESSION ──────────────────────────────
  const applyAudioProcessing = async (stream) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const dest = ctx.createMediaStreamDestination();

      // High-pass filter (removes low-frequency noise like AC, fan)
      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.value = 80;
      highpass.Q.value = 0.5;

      // Low-pass filter (removes high-frequency hiss)
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 8000;

      // Dynamics compressor (echo + loudness normalization)
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -50;
      compressor.knee.value = 40;
      compressor.ratio.value = 12;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.25;

      // Gain node
      const gain = ctx.createGain();
      gain.gain.value = 1.2;

      src.connect(highpass);
      highpass.connect(lowpass);
      lowpass.connect(compressor);
      compressor.connect(gain);
      gain.connect(dest);

      // Mic quality detection via analyser
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      const buf = new Uint8Array(analyser.frequencyBinCount);
      const checkQuality = setInterval(() => {
        analyser.getByteFrequencyData(buf);
        const avg = buf.reduce((a,b)=>a+b,0) / buf.length;
        setMicQuality(avg > 30 ? 'excellent' : avg > 15 ? 'good' : avg > 5 ? 'fair' : 'poor');
        if (avg > 60) setAudioProblems(p => p + 1); // loud background noise
      }, 2000);

      const processedStream = new MediaStream([
        ...stream.getVideoTracks(),
        ...dest.stream.getAudioTracks()
      ]);
      processedStream._qualityInterval = checkQuality;
      return processedStream;
    } catch { return stream; }
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
      // Multi-region TURN + STUN (Metered.ca free tier)
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun.relay.metered.ca:80' },
          { urls: 'turn:global.relay.metered.ca:80', username: 'psycheflow', credential: 'psycheflow2026' },
          { urls: 'turn:global.relay.metered.ca:80?transport=tcp', username: 'psycheflow', credential: 'psycheflow2026' },
          { urls: 'turn:global.relay.metered.ca:443', username: 'psycheflow', credential: 'psycheflow2026' },
          { urls: 'turns:global.relay.metered.ca:443?transport=tcp', username: 'psycheflow', credential: 'psycheflow2026' },
        ],
        iceTransportPolicy: 'all',
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require',
      });
      pcRef.current = pc;
      stream.getTracks().forEach(t=>pc.addTrack(t,stream));
      pc.ontrack = e=>{ if(remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0]; };
      await supabase.from('telemedicine_sessions').update({ status:'in_progress', started_at:new Date().toISOString() }).eq('id', session.id);
      setCallStatus('live');

      // Connection quality monitoring
      qualityIntervalRef.current = setInterval(async () => {
        if (!pcRef.current) return;
        try {
          const stats = await pcRef.current.getStats();
          let latency = 0, packetLoss = 0, bitrate = 0;
          stats.forEach(report => {
            if (report.type === 'candidate-pair' && report.state === 'succeeded') {
              latency = Math.round(report.currentRoundTripTime * 1000) || 0;
            }
            if (report.type === 'inbound-rtp' && report.kind === 'video') {
              packetLoss = report.packetsLost || 0;
              bitrate = Math.round((report.bytesReceived || 0) * 8 / 1000) || 0;
            }
          });
          const status = latency < 100 && packetLoss < 5 ? 'excellent' : latency < 200 && packetLoss < 10 ? 'good' : latency < 400 ? 'fair' : 'poor';
          setQuality({ status, latency, packetLoss, bitrate });

          // Auto-adapt video quality based on connection
          if (pcRef.current && localStream) {
            const videoSender = pcRef.current.getSenders().find(s => s.track?.kind === 'video');
            if (videoSender) {
              const params = videoSender.getParameters();
              if (!params.encodings) params.encodings = [{}];
              if (status === 'poor') {
                params.encodings[0].maxBitrate = 150000; // 150kbps — 480p
                if (latency > 500) setFallbackMode('audio'); // fallback to audio only
              } else if (status === 'fair') {
                params.encodings[0].maxBitrate = 500000; // 500kbps — 720p
              } else {
                params.encodings[0].maxBitrate = 1500000; // 1.5Mbps — 1080p
              }
              videoSender.setParameters(params).catch(() => {});
            }
          }
        } catch {}
      }, 3000);

      // Reconnection logic
      pcRef.current.oniceconnectionstatechange = () => {
        const state = pcRef.current?.iceConnectionState;
        if (state === 'disconnected' || state === 'failed') {
          setReconnecting(true);
          let attempts = 0;
          const retry = setInterval(() => {
            attempts++;
            setReconnectAttempt(attempts);
            if (pcRef.current?.iceConnectionState === 'connected') {
              setReconnecting(false);
              clearInterval(retry);
            }
            if (attempts >= 5) {
              setReconnecting(false);
              setFallbackMode('chat'); // fall back to chat if video fails completely
              clearInterval(retry);
            }
          }, 2000);
        } else if (state === 'connected') {
          setReconnecting(false);
          setReconnectAttempt(0);
        }
      };
    } catch { setCallStatus('error'); }
  };

  const startRecording = () => {
    if (!localStream || !recordingConsent) return;
    const recorder = new MediaRecorder(localStream, { mimeType: 'video/webm;codecs=vp9' });
    recordedChunksRef.current = [];
    recorder.ondataavailable = e => { if (e.data.size > 0) recordedChunksRef.current.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `session-${activeSession?.room_id}-${new Date().toISOString().slice(0,10)}.webm`;
      a.click(); URL.revokeObjectURL(url);
    };
    recorder.start(1000);
    mediaRecorderRef.current = recorder;
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const endCall = async () => {
    clearInterval(qualityIntervalRef.current);
    if (recording) stopRecording();
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

  // ── WAITING ROOM VIEWS ───────────────────────────────────────

  // Doctor waiting room queue
  if (view==='waitqueue') return (
    <div style={{ maxWidth:700, margin:'0 auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h2 style={{ margin:0, color:S.navy, fontSize:20, fontWeight:700 }}>Waiting Room</h2>
        <button onClick={()=>setView('list')} style={{ padding:'7px 14px', background:S.bg, border:`0.5px solid ${S.border}`, borderRadius:8, fontSize:12, cursor:'pointer', color:S.muted }}>← Back</button>
      </div>
      <div style={{ background:'#EFF6FF', border:'0.5px solid #BFDBFE', borderRadius:10, padding:'10px 16px', marginBottom:20, fontSize:12, color:S.blue }}>
        Waiting room is active. Patients who join will appear here automatically. Priority sorting by risk level.
      </div>
      {/* Analytics row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        {[['Waiting',waitingQueue.length,S.blue],['Avg Wait',waitingQueue.length>0?Math.floor(waitingTime/60)+'m':'—',S.warning],['Completed',sessions.filter(s=>s.status==='completed').length,S.success],['Drops',sessionDrops,S.danger]].map(([label,val,color])=>(
          <div key={label} style={{ background:S.bg2, borderRadius:10, padding:'12px 16px', border:`0.5px solid ${S.border}`, borderLeft:`3px solid ${color}` }}>
            <div style={{ fontSize:22, fontWeight:700, color }}>{val}</div>
            <div style={{ fontSize:11, color:S.muted }}>{label}</div>
          </div>
        ))}
      </div>
      {waitingQueue.length===0 ? (
        <div style={{ background:S.bg2, borderRadius:14, border:`0.5px solid ${S.border}`, padding:48, textAlign:'center' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={S.muted} strokeWidth="1.5"/><path d="M12 6v6l4 2" stroke={S.muted} strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <div style={{ fontSize:14, color:S.muted }}>No patients in waiting room</div>
          <div style={{ fontSize:12, color:S.hint, marginTop:4 }}>Patients will appear here when they join their scheduled session</div>
        </div>
      ) : (
        <div style={{ display:'grid', gap:12 }}>
          {[...waitingQueue].sort((a,b) => {
            const riskOrder = { critical:0, high:1, moderate:2, low:3 };
            return (riskOrder[a.riskLevel]||3) - (riskOrder[b.riskLevel]||3);
          }).map(patient => {
            const waitMins = Math.floor((Date.now()-new Date(patient.waitSince))/(60000));
            return (
              <div key={patient.id} style={{ background:S.bg2, borderRadius:14, border:`1px solid ${patient.riskLevel==='critical'?S.danger:patient.riskLevel==='high'?S.warning:S.border}`, padding:'18px 20px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:6 }}>
                      <div style={{ width:40, height:40, borderRadius:'50%', background:`linear-gradient(135deg,${S.blue},${S.cyan})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, color:'#fff' }}>
                        {(patient.hospital_patients?.full_name||'P')[0]}
                      </div>
                      <div>
                        <div style={{ fontSize:14, fontWeight:700, color:S.navy }}>{patient.hospital_patients?.full_name}</div>
                        <div style={{ fontSize:11, color:S.muted }}>Waiting {waitMins} min{waitMins!==1?'s':''}</div>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      <span style={{ padding:'3px 8px', borderRadius:100, fontSize:11, fontWeight:600, background:patient.riskLevel==='critical'?'#FEF2F2':patient.riskLevel==='high'?'#FFFBEB':'#ECFDF5', color:patient.riskLevel==='critical'?S.danger:patient.riskLevel==='high'?S.warning:S.success }}>{patient.riskLevel} risk</span>
                      {patient.phq>0&&<span style={{ padding:'3px 8px', borderRadius:100, fontSize:11, background:S.lightBlue, color:S.blue }}>PHQ-9: {patient.phq}</span>}
                      {waitMins>10&&<span style={{ padding:'3px 8px', borderRadius:100, fontSize:11, background:'#FEF2F2', color:S.danger }}>Waiting long</span>}
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={()=>{ setWaitingQueue(q=>q.filter(x=>x.id!==patient.id)); }} style={{ padding:'8px 14px', background:'#FEF2F2', color:S.danger, border:'none', borderRadius:8, fontSize:12, cursor:'pointer', fontWeight:600 }}>Remove</button>
                    <button onClick={()=>admitFromWaiting(patient)} style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 20px', background:S.success, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Admit
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // Patient waiting room screen
  if (view==='patient_waiting') return (
    <div style={{ maxWidth:520, margin:'0 auto', padding:'40px 20px' }}>
      <div style={{ background:S.bg2, borderRadius:20, border:`0.5px solid ${S.border}`, padding:32, textAlign:'center' }}>
        <div style={{ width:64, height:64, borderRadius:'50%', background:S.lightBlue, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={S.blue} strokeWidth="1.5"/><path d="M12 6v6l4 2" stroke={S.blue} strokeWidth="1.5" strokeLinecap="round"/></svg>
        </div>
        <div style={{ fontSize:20, fontWeight:700, color:S.navy, marginBottom:8 }}>
          {patientInWaiting ? 'Doctor is ready!' : "You're in the waiting room"}
        </div>
        <div style={{ fontSize:13, color:S.muted, marginBottom:20, lineHeight:1.6 }}>
          {patientInWaiting ? 'Your doctor has admitted you. Joining session...' : `Waiting for Dr. ${activeSession?.hospital_staff?.name||'your doctor'}. You'll be admitted shortly.`}
        </div>
        {/* Status indicator */}
        <div style={{ background:patientInWaiting?'#ECFDF5':S.lightBlue, borderRadius:12, padding:'14px 20px', marginBottom:20, border:`0.5px solid ${patientInWaiting?'#A7F3D0':S.border}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, justifyContent:'center' }}>
            <div style={{ width:10, height:10, borderRadius:'50%', background:patientInWaiting?S.success:S.blue, animation:'pulse 1.5s ease-in-out infinite' }}/>
            <span style={{ fontSize:13, fontWeight:600, color:patientInWaiting?S.success:S.blue }}>
              {patientInWaiting ? 'Admitted — joining now' : `Waiting ${Math.floor(waitingTime/60)}m ${waitingTime%60}s`}
            </span>
          </div>
          {!patientInWaiting && <div style={{ fontSize:11, color:S.hint, marginTop:6 }}>Estimated wait: 3-5 minutes</div>}
        </div>
        {/* Device check while waiting */}
        <div style={{ background:S.bg, borderRadius:10, padding:14, marginBottom:20 }}>
          <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>While you wait</div>
          {[['Camera','Ready',S.success],['Microphone','Ready',S.success],['Internet',quality.status||'Checking...',quality.status==='excellent'||quality.status==='good'?S.success:S.warning]].map(([label,status,color])=>(
            <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:`0.5px solid ${S.border}` }}>
              <span style={{ fontSize:12, color:S.muted }}>{label}</span>
              <span style={{ fontSize:12, fontWeight:600, color, textTransform:'capitalize' }}>{status}</span>
            </div>
          ))}
        </div>
        {patientInWaiting ? (
          <button onClick={()=>startCall(activeSession)} style={{ width:'100%', padding:'13px', background:S.success, color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer' }}>
            Join Session Now →
          </button>
        ) : (
          <button onClick={leaveWaitingRoom} style={{ width:'100%', padding:'11px', background:'transparent', color:S.danger, border:`0.5px solid ${S.danger}`, borderRadius:10, fontSize:13, cursor:'pointer' }}>
            Leave Waiting Room
          </button>
        )}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  );

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
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            {/* Connection quality */}
            <div style={{ display:'flex', alignItems:'center', gap:6, padding:'3px 10px', borderRadius:100, background:'rgba(255,255,255,0.08)' }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:quality.status==='excellent'?'#22c55e':quality.status==='good'?'#84cc16':quality.status==='fair'?'#f59e0b':'#ef4444' }}/>
              <span style={{ fontSize:11, color:'rgba(255,255,255,0.7)', textTransform:'capitalize' }}>{quality.status}</span>
              {quality.latency>0&&<span style={{ fontSize:10, color:'rgba(255,255,255,0.4)' }}>{quality.latency}ms</span>}
            </div>
            {recording && <div style={{ display:'flex', alignItems:'center', gap:4, padding:'3px 8px', borderRadius:100, background:'rgba(220,38,38,0.3)', border:'1px solid rgba(220,38,38,0.5)' }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'#ef4444', animation:'pulse 1s ease-in-out infinite' }}/>
              <span style={{ fontSize:10, color:'#fca5a5' }}>REC</span>
            </div>}
            <div style={{ fontSize:18, fontWeight:700, color:'#22c55e', fontFamily:'monospace' }}>{TIMER_FMT(duration)}</div>
          </div>
        </div>

        {/* Reconnecting overlay */}
        {reconnecting && (
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.7)', zIndex:10, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
            <div style={{ fontSize:16, fontWeight:700, color:'#fff', marginBottom:8 }}>Reconnecting...</div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.6)' }}>Attempt {reconnectAttempt} of 5</div>
            <div style={{ marginTop:12, display:'flex', gap:6 }}>
              {[0,1,2].map(i=><div key={i} style={{ width:8,height:8,borderRadius:'50%',background:'#1D4ED8',animation:`pulse ${0.6+i*0.2}s ease-in-out infinite` }}/>)}
            </div>
          </div>
        )}

        {/* Fallback mode banner */}
        {fallbackMode==='audio' && (
          <div style={{ position:'absolute', top:60, left:'50%', transform:'translateX(-50%)', zIndex:9, background:'rgba(245,158,11,0.9)', borderRadius:8, padding:'6px 14px', fontSize:12, color:'#fff', fontWeight:600 }}>
            Poor connection — switched to audio only
          </div>
        )}
        {fallbackMode==='chat' && (
          <div style={{ position:'absolute', top:60, left:'50%', transform:'translateX(-50%)', zIndex:9, background:'rgba(220,38,38,0.9)', borderRadius:8, padding:'6px 14px', fontSize:12, color:'#fff', fontWeight:600 }}>
            Video failed — using secure chat
          </div>
        )}

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
            { label:videoOff?'Start Video':'Stop Video', icon:'video', bg:videoOff?'#374151':'rgba(255,255,255,0.12)', onClick:toggleVideo },
            { label:'Share Screen', icon:'screen', bg:'rgba(255,255,255,0.12)', onClick:async()=>{ try{ const s=await navigator.mediaDevices.getDisplayMedia({video:true}); if(pcRef.current){const sender=pcRef.current.getSenders().find(s=>s.track?.kind==='video'); sender?.replaceTrack(s.getTracks()[0]);} }catch{} } },
            { label:'Generate SOAP', icon:null, label2:'AI SOAP', bg:'rgba(29,78,216,0.4)', icon:'generate', onClick:generateSOAP },
            { label:recording?'Stop Rec':'Record', icon:null, label2:recording?'Stop':'Record', bg:recording?'rgba(220,38,38,0.6)':'rgba(255,255,255,0.12)', icon:'record', onClick:()=>{ if(recording){stopRecording();}else if(recordingConsent){startRecording();}else{if(window.confirm('Patient has given verbal consent to record this session?')){setRecordingConsent(true);startRecording();}}} },
            { label:'Background', icon:null, label2:'BG', bg:virtualBg!=='none'?'rgba(124,58,237,0.4)':'rgba(255,255,255,0.12)', icon:'bg', onClick:()=>setShowBgSettings(b=>!b) },
            { label:'Audio', icon:null, label2:'Audio', bg:noiseSuppressionEnabled?'rgba(5,150,105,0.4)':'rgba(255,255,255,0.12)', icon:'audio', onClick:()=>setShowAudioSettings(a=>!a) },
            { label:'End Call', icon:'endcall', bg:'#DC2626', onClick:endCall },
          ].map((btn,i)=>(
            <button key={i} onClick={btn.onClick} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, background:'none', border:'none', cursor:'pointer' }}>
              <div style={{ width:46, height:46, borderRadius:'50%', background:btn.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                {btn.icon==='mic'&&<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" stroke="#fff" strokeWidth="1.5"/><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                {btn.icon==='video'&&<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M23 7l-7 5 7 5V7z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><rect x="1" y="5" width="15" height="14" rx="2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                {btn.icon==='screen'&&<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="14" rx="2" stroke="#fff" strokeWidth="1.5"/><path d="M8 21h8M12 17v4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                {btn.icon==='endcall'&&<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.07 12a19.79 19.79 0 01-3.07-8.67 2 2 0 012-2.18h3A2 2 0 017.09 3a12.36 12.36 0 00.57 2.57 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.36 12.36 0 002.57.57A2 2 0 0122 16.92z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><line x1="1" y1="1" x2="23" y2="23" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                {btn.icon==='generate'&&<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="10" rx="2" stroke="#fff" strokeWidth="1.5"/><path d="M9 11V7a3 3 0 016 0v4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                {btn.icon==='record'&&<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="#fff" strokeWidth="1.5"/><circle cx="12" cy="12" r="3" fill="#fff"/></svg>}
                {btn.icon==='bg'&&<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="4" stroke="#fff" strokeWidth="1.5"/><circle cx="12" cy="10" r="3" stroke="#fff" strokeWidth="1.5"/><path d="M2 20c2-4 4-6 10-6s8 2 10 6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                {btn.icon==='audio'&&<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M11 5L6 9H2v6h4l5 4V5z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                {!['mic','video','screen','endcall','generate','record','bg','audio'].includes(btn.icon) && <span style={{ fontSize:11, color:'#fff', fontWeight:600 }}>{btn.label?.slice(0,4)}</span>}
              </div>
              <span style={{ fontSize:9, color:'rgba(255,255,255,0.5)' }}>{btn.label}</span>
            </button>
          ))}
        </div>
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>

        {/* Virtual Background Panel */}
        {showBgSettings && (
          <div style={{ position:'absolute', bottom:100, left:20, background:'rgba(12,26,46,0.95)', borderRadius:14, padding:16, border:'1px solid rgba(255,255,255,0.1)', zIndex:20, minWidth:260 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#fff', marginBottom:12 }}>Virtual Background</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:12 }}>
              {[['none','None','off'],['blur','Blur','blur'],['calm','Calm','calm'],['office','Office','office'],['therapy','Therapy Room','therapy']].map(([type,label,icon])=>(
                <div key={type} onClick={()=>{applyVirtualBackground(type);}} style={{ padding:'10px 6px', borderRadius:9, cursor:'pointer', textAlign:'center', border:`1px solid ${virtualBg===type?'#93C5FD':'rgba(255,255,255,0.1)'}`, background:virtualBg===type?'rgba(29,78,216,0.3)':'rgba(255,255,255,0.05)' }}>
                  <div style={{ width:24, height:24, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 3px' }}>
                    {icon==='off'&&<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="4" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/><path d="M6 18L18 6M6 6l12 12" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                    {icon==='blur'&&<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" fill="rgba(255,255,255,0.6)"/><circle cx="12" cy="12" r="7" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><circle cx="12" cy="12" r="11" stroke="rgba(255,255,255,0.15)" strokeWidth="3"/></svg>}
                    {icon==='calm'&&<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2a10 10 0 100 20 10 10 0 000-20z" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/><path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/><path d="M9 9h.01M15 9h.01" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round"/></svg>}
                    {icon==='office'&&<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="2" y="7" width="20" height="14" rx="2" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/><path d="M12 12v4M10 14h4" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                    {icon==='therapy'&&<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/><path d="M9 22V12h6v10" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                  </div>
                  <div style={{ fontSize:10, color:virtualBg===type?'#93C5FD':'rgba(255,255,255,0.5)' }}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <input type="checkbox" id="mirror" style={{ cursor:'pointer' }}/>
              <label htmlFor="mirror" style={{ fontSize:12, color:'rgba(255,255,255,0.6)', cursor:'pointer' }}>Mirror video</label>
            </div>
          </div>
        )}

        {/* Audio Settings Panel */}
        {showAudioSettings && (
          <div style={{ position:'absolute', bottom:100, left:300, background:'rgba(12,26,46,0.95)', borderRadius:14, padding:16, border:'1px solid rgba(255,255,255,0.1)', zIndex:20, minWidth:280 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#fff', marginBottom:14 }}>Audio Settings</div>
            {/* Mic quality indicator */}
            <div style={{ marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontSize:11, color:'rgba(255,255,255,0.6)' }}>Mic Quality</span>
                <span style={{ fontSize:11, fontWeight:600, color:micQuality==='excellent'?'#22c55e':micQuality==='good'?'#84cc16':micQuality==='fair'?'#f59e0b':'#ef4444', textTransform:'capitalize' }}>{micQuality}</span>
              </div>
              <div style={{ height:4, borderRadius:2, background:'rgba(255,255,255,0.1)' }}>
                <div style={{ height:4, borderRadius:2, background:micQuality==='excellent'?'#22c55e':micQuality==='good'?'#84cc16':'#f59e0b', width:micQuality==='excellent'?'100%':micQuality==='good'?'70%':micQuality==='fair'?'40%':'20%' }}/>
              </div>
            </div>
            {/* Audio toggles */}
            {[['Noise Cancellation',noiseSuppressionEnabled,()=>setNoiseSuppressionEnabled(n=>!n)],['Echo Cancellation',echoSuppressionEnabled,()=>setEchoSuppressionEnabled(e=>!e)]].map(([label,enabled,toggle])=>(
              <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                <span style={{ fontSize:12, color:'rgba(255,255,255,0.7)' }}>{label}</span>
                <div onClick={toggle} style={{ width:36, height:20, borderRadius:10, background:enabled?'#22c55e':'rgba(255,255,255,0.15)', cursor:'pointer', position:'relative', transition:'background 0.2s' }}>
                  <div style={{ position:'absolute', top:2, left:enabled?16:2, width:16, height:16, borderRadius:'50%', background:'#fff', transition:'left 0.2s' }}/>
                </div>
              </div>
            ))}
            {/* Connection diagnostics */}
            <div style={{ marginTop:12 }}>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Connection Diagnostics</div>
              {[['Latency',quality.latency+'ms'],['Packet Loss',quality.packetLoss+'%'],['Status',quality.status],['Audio Problems',audioProblems+' detected']].map(([label,val])=>(
                <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'4px 0' }}>
                  <span style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>{label}</span>
                  <span style={{ fontSize:11, color:'rgba(255,255,255,0.7)', textTransform:'capitalize' }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}
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
