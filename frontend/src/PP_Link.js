import React, { useState } from 'react';
import { supabase } from './supabase';

export default function PP_Link({ patients, user, reload, S, card, Badge }) {
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [referrals, setReferrals] = useState([]);

  React.useEffect(() => {
    supabase.from('cross_referrals').select('*, hospital_patients(full_name, patient_uid), hospitals(name, city)').eq('psychologist_id', user.id).order('created_at', { ascending:false }).then(({ data }) => setReferrals(data||[]));
  }, [user.id]);

  const link = async () => {
    if (!code.trim()) return;
    setLoading(true); setMsg('');
    const { data: link } = await supabase.from('patient_psychologist').select('*').eq('share_code', code.trim().toUpperCase()).eq('active', true).maybeSingle();
    if (!link) { setMsg('Invalid share code. Ask patient to generate a new one.'); setLoading(false); return; }
    if (link.psychologist_id && link.psychologist_id !== user.id) { setMsg('This patient is already linked to another psychologist.'); setLoading(false); return; }
    const { error } = await supabase.from('patient_psychologist').update({ psychologist_id:user.id, updated_at:new Date().toISOString() }).eq('share_code', code.trim().toUpperCase());
    if (error) { setMsg('Failed to link: '+error.message); } else { setMsg('Patient linked successfully!'); setCode(''); reload?.(); }
    setLoading(false);
  };

  const updateReferral = async (id, status) => {
    await supabase.from('cross_referrals').update({ status }).eq('id', id);
    setReferrals(r => r.map(x => x.id===id?{...x,status}:x));
  };

  return (
    <div>
      <h2 style={{ margin:'0 0 20px', color:S.navy, fontSize:20, fontWeight:700 }}>Link Patient</h2>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
        <div style={{ ...card }}>
          <div style={{ fontSize:13, fontWeight:700, color:S.navy, marginBottom:14 }}>Link via Share Code</div>
          <div style={{ fontSize:12, color:S.muted, marginBottom:14, lineHeight:1.6 }}>Ask your patient to generate a share code from their PsycheFlow dashboard and enter it below.</div>
          <div style={{ display:'flex', gap:8 }}>
            <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} onKeyDown={e=>e.key==='Enter'&&link()} placeholder="Enter 8-digit share code" maxLength={8}
              style={{ flex:1, padding:'10px 12px', borderRadius:8, border:`0.5px solid ${S.border}`, fontSize:14, letterSpacing:'0.1em', fontWeight:600, outline:'none', background:S.bg, color:S.navy, fontFamily:'monospace' }}/>
            <button onClick={link} disabled={loading||code.length!==8} style={{ padding:'10px 18px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', opacity:code.length!==8?0.6:1 }}>
              {loading?'Linking...':'Link'}
            </button>
          </div>
          {msg && <div style={{ marginTop:10, fontSize:13, fontWeight:600, color:msg.includes('success')?S.success:S.danger, padding:'8px 12px', borderRadius:7, background:msg.includes('success')?'#ECFDF5':'#FEF2F2' }}>{msg}</div>}
        </div>
        <div style={{ ...card }}>
          <div style={{ fontSize:13, fontWeight:700, color:S.navy, marginBottom:14 }}>Active Patients ({patients.length})</div>
          {patients.length===0 ? <div style={{ fontSize:12, color:S.muted }}>No patients linked yet.</div> :
            patients.slice(0,5).map(p => (
              <div key={p.id} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:`0.5px solid ${S.border}` }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:S.navy }}>{p.display_name||p.full_name}</div>
                  <div style={{ fontSize:10, color:S.muted }}>Linked {new Date(p.link?.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div>
                </div>
                <Badge color={p.riskLevel==='critical'?'red':p.riskLevel==='high'?'yellow':'green'}>{p.riskLevel}</Badge>
              </div>
            ))
          }
        </div>
      </div>
      {referrals.length > 0 && (
        <div style={{ ...card }}>
          <div style={{ fontSize:13, fontWeight:700, color:S.navy, marginBottom:14 }}>Hospital Referrals ({referrals.length})</div>
          {referrals.map(r => (
            <div key={r.id} style={{ padding:'12px 0', borderBottom:`0.5px solid ${S.border}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:S.navy }}>{r.hospital_patients?.full_name}</div>
                  <div style={{ fontSize:11, color:S.muted }}>From: {r.hospitals?.name}, {r.hospitals?.city} · {r.reason||'No reason'}</div>
                </div>
                <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                  <Badge color={r.priority==='crisis'?'red':r.priority==='urgent'?'yellow':'blue'}>{r.priority}</Badge>
                  <Badge color={r.status==='accepted'?'green':r.status==='rejected'?'red':'yellow'}>{r.status}</Badge>
                </div>
              </div>
              {r.status==='pending' && (
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={()=>updateReferral(r.id,'accepted')} style={{ padding:'5px 12px', background:'#ECFDF5', color:S.success, border:'1px solid #A7F3D0', borderRadius:6, fontSize:11, fontWeight:600, cursor:'pointer' }}>Accept</button>
                  <button onClick={()=>updateReferral(r.id,'rejected')} style={{ padding:'5px 12px', background:'#FEF2F2', color:S.danger, border:'1px solid #FECACA', borderRadius:6, fontSize:11, fontWeight:600, cursor:'pointer' }}>Decline</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
