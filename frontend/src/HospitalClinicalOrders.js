import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

const LAB_TESTS = ['CBC (Complete Blood Count)','Blood Glucose (Fasting)','HbA1c','Liver Function Test','Kidney Function Test','Thyroid Profile (TSH)','Lipid Profile','Urine Routine','ECG','Chest X-Ray','MRI Brain','CT Scan Head','Vitamin D','Vitamin B12','Serum Cortisol','Drug Level Monitoring'];
const COMMON_MEDS = ['Sertraline 50mg','Escitalopram 10mg','Fluoxetine 20mg','Clonazepam 0.5mg','Alprazolam 0.25mg','Olanzapine 5mg','Risperidone 2mg','Quetiapine 25mg','Lithium 300mg','Sodium Valproate 500mg'];

export default function HospitalClinicalOrders({ hospital, patients, S, card, Badge, isMobile }) {
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({ patient_id:'', type:'lab', item:'', priority:'routine', notes:'', route:'', dose:'', frequency:'' });
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => { loadOrders(); }, [hospital]);

  const loadOrders = async () => {
    if (!hospital) return;
    const { data } = await supabase.from('clinical_orders')
      .select('*, hospital_patients(full_name, patient_uid)')
      .eq('hospital_id', hospital.id)
      .order('created_at', { ascending:false });
    setOrders(data || []);
  };

  const placeOrder = async () => {
    if (!form.patient_id || !form.item) return;
    const order = {
      hospital_id: hospital.id,
      patient_id: form.patient_id,
      order_type: form.type,
      item_name: form.item,
      priority: form.priority,
      notes: form.notes,
      dose: form.dose,
      route: form.route,
      frequency: form.frequency,
      status: 'pending',
      // Auto-route: lab orders → lab, medication → pharmacy
      routed_to: form.type==='lab' ? 'lab' : form.type==='medication' ? 'pharmacy' : 'nursing',
    };
    await supabase.from('clinical_orders').insert(order);
    // If lab order, also create lab_order
    if (form.type==='lab') {
      await supabase.from('lab_orders').insert({ hospital_id:hospital.id, patient_id:form.patient_id, test_name:form.item, priority:form.priority, status:'ordered', ordered_at:new Date().toISOString() });
    }
    setForm({ patient_id:'', type:'lab', item:'', priority:'routine', notes:'', route:'', dose:'', frequency:'' });
    setShowForm(false);
    await loadOrders();
  };

  const updateOrder = async (id, status) => {
    await supabase.from('clinical_orders').update({ status }).eq('id', id);
    setOrders(o => o.map(x => x.id===id?{...x,status}:x));
  };

  const filtered = filter==='all' ? orders : orders.filter(o=>o.order_type===filter||o.status===filter);
  const pendingCount = orders.filter(o=>o.status==='pending').length;
  const labCount = orders.filter(o=>o.order_type==='lab').length;
  const medCount = orders.filter(o=>o.order_type==='medication').length;

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <h2 style={{ margin:0, color:S.navy, fontSize:20, fontWeight:700 }}>Clinical Orders</h2>
        <button onClick={()=>setShowForm(f=>!f)} style={{ padding:'8px 18px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>+ New Order</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:isMobile?'repeat(2,1fr)':'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        {[['Total Orders',orders.length,S.blue],['Pending',pendingCount,S.warning],['Lab Orders',labCount,S.cyan],['Medication Orders',medCount,S.purple]].map(([label,val,color])=>(
          <div key={label} style={{ ...card, padding:'14px 18px', borderLeft:`3px solid ${color}` }}>
            <div style={{ fontSize:24, fontWeight:700, color }}>{val}</div>
            <div style={{ fontSize:11, color:S.muted, marginTop:2 }}>{label}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <div style={{ ...card, marginBottom:20, borderColor:S.blue }}>
          <div style={{ fontSize:12, fontWeight:700, color:S.navy, marginBottom:16 }}>New Clinical Order</div>
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(3,1fr)', gap:12, marginBottom:14 }}>
            <div>
              <div style={{ fontSize:10, color:S.muted, marginBottom:4, textTransform:'uppercase', fontWeight:600 }}>Patient *</div>
              <select value={form.patient_id} onChange={e=>setForm({...form,patient_id:e.target.value})} style={{ width:'100%', padding:'9px 10px', borderRadius:8, border:`0.5px solid ${S.border}`, fontSize:13, background:S.bg, color:S.navy, outline:'none' }}>
                <option value="">Select patient</option>
                {patients.map(p=><option key={p.id} value={p.id}>{p.full_name} ({p.patient_uid})</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize:10, color:S.muted, marginBottom:4, textTransform:'uppercase', fontWeight:600 }}>Order Type *</div>
              <select value={form.type} onChange={e=>setForm({...form,type:e.target.value,item:''})} style={{ width:'100%', padding:'9px 10px', borderRadius:8, border:`0.5px solid ${S.border}`, fontSize:13, background:S.bg, color:S.navy, outline:'none' }}>
                {['lab','medication','nursing','radiology','diet'].map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize:10, color:S.muted, marginBottom:4, textTransform:'uppercase', fontWeight:600 }}>Priority</div>
              <select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})} style={{ width:'100%', padding:'9px 10px', borderRadius:8, border:`0.5px solid ${S.border}`, fontSize:13, background:S.bg, color:S.navy, outline:'none' }}>
                {['routine','urgent','stat'].map(p=><option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:10, color:S.muted, marginBottom:6, textTransform:'uppercase', fontWeight:600 }}>
              {form.type==='lab'?'Test / Investigation':'Item / Medication'} *
            </div>
            {form.type==='lab' ? (
              <div>
                <select value={form.item} onChange={e=>setForm({...form,item:e.target.value})} style={{ width:'100%', padding:'9px 10px', borderRadius:8, border:`0.5px solid ${S.border}`, fontSize:13, background:S.bg, color:S.navy, outline:'none', marginBottom:8 }}>
                  <option value="">Select test</option>
                  {LAB_TESTS.map(t=><option key={t}>{t}</option>)}
                </select>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {LAB_TESTS.slice(0,6).map(t=>(
                    <button key={t} onClick={()=>setForm({...form,item:t})} style={{ padding:'4px 10px', borderRadius:100, fontSize:11, background:form.item===t?S.blue:S.bg, color:form.item===t?'#fff':S.muted, border:`0.5px solid ${form.item===t?S.blue:S.border}`, cursor:'pointer' }}>{t}</button>
                  ))}
                </div>
              </div>
            ) : form.type==='medication' ? (
              <div>
                <select value={form.item} onChange={e=>setForm({...form,item:e.target.value})} style={{ width:'100%', padding:'9px 10px', borderRadius:8, border:`0.5px solid ${S.border}`, fontSize:13, background:S.bg, color:S.navy, outline:'none', marginBottom:8 }}>
                  <option value="">Select medication</option>
                  {COMMON_MEDS.map(m=><option key={m}>{m}</option>)}
                </select>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                  {[['Dose','dose','10mg'],['Route','route','Oral'],['Frequency','frequency','Once daily']].map(([label,key,placeholder])=>(
                    <div key={key}>
                      <div style={{ fontSize:10, color:S.muted, marginBottom:3 }}>{label}</div>
                      <input value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={placeholder} style={{ width:'100%', padding:'8px 10px', borderRadius:7, border:`0.5px solid ${S.border}`, fontSize:12, background:S.bg, color:S.navy, outline:'none', boxSizing:'border-box' }}/>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <input value={form.item} onChange={e=>setForm({...form,item:e.target.value})} placeholder={`Describe ${form.type} order...`} style={{ width:'100%', padding:'9px 10px', borderRadius:8, border:`0.5px solid ${S.border}`, fontSize:13, background:S.bg, color:S.navy, outline:'none', boxSizing:'border-box' }}/>
            )}
          </div>
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:10, color:S.muted, marginBottom:4, textTransform:'uppercase', fontWeight:600 }}>Clinical Notes</div>
            <input value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Clinical indication, special instructions..." style={{ width:'100%', padding:'9px 10px', borderRadius:8, border:`0.5px solid ${S.border}`, fontSize:13, background:S.bg, color:S.navy, outline:'none', boxSizing:'border-box' }}/>
          </div>
          {form.type!=='lab' && (
            <div style={{ padding:'8px 12px', background:'#EFF6FF', borderRadius:8, marginBottom:12, fontSize:12, color:S.blue }}>
              → Auto-routed to: <strong>{form.type==='medication'?'Pharmacy':form.type==='radiology'?'Radiology':'Nursing Station'}</strong>
            </div>
          )}
          {form.type==='lab' && (
            <div style={{ padding:'8px 12px', background:'#EFF6FF', borderRadius:8, marginBottom:12, fontSize:12, color:S.blue }}>
              → Auto-routed to: <strong>Laboratory (Kanban: Ordered)</strong>
            </div>
          )}
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={placeOrder} disabled={!form.patient_id||!form.item} style={{ padding:'9px 20px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', opacity:(!form.patient_id||!form.item)?0.6:1 }}>Place Order</button>
            <button onClick={()=>setShowForm(false)} style={{ padding:'9px 16px', background:'transparent', color:S.muted, border:`0.5px solid ${S.border}`, borderRadius:8, fontSize:13, cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:6, marginBottom:14, flexWrap:'wrap' }}>
        {['all','lab','medication','nursing','pending','completed'].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{ padding:'4px 12px', border:'none', borderRadius:100, fontSize:11, fontWeight:filter===f?700:400, background:filter===f?S.blue:S.bg, color:filter===f?'#fff':S.muted, cursor:'pointer', textTransform:'capitalize' }}>{f}</button>
        ))}
      </div>

      {filtered.length===0 ? (
        <div style={{ ...card, textAlign:'center', padding:48, color:S.muted }}>No orders found.</div>
      ) : (
        <div style={{ display:'grid', gap:8 }}>
          {filtered.map(o => (
            <div key={o.id} style={{ ...card, padding:'12px 18px', borderLeft:`3px solid ${o.priority==='stat'?S.danger:o.priority==='urgent'?S.warning:S.border}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
                <div>
                  <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:4 }}>
                    <span style={{ fontSize:14, fontWeight:700, color:S.navy }}>{o.item_name}</span>
                    <Badge color={o.order_type==='lab'?'cyan':o.order_type==='medication'?'purple':'blue'}>{o.order_type}</Badge>
                    <Badge color={o.priority==='stat'?'red':o.priority==='urgent'?'yellow':'green'}>{o.priority}</Badge>
                  </div>
                  <div style={{ fontSize:11, color:S.muted }}>
                    {o.hospital_patients?.full_name} · {o.hospital_patients?.patient_uid}
                    {o.dose && ` · ${o.dose}`}{o.route && ` · ${o.route}`}{o.frequency && ` · ${o.frequency}`}
                  </div>
                  {o.notes && <div style={{ fontSize:11, color:S.hint, marginTop:2 }}>{o.notes}</div>}
                  <div style={{ fontSize:10, color:S.hint, marginTop:2 }}>→ Routed to: {o.routed_to} · {new Date(o.created_at).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
                </div>
                <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                  <Badge color={o.status==='pending'?'yellow':o.status==='completed'?'green':o.status==='cancelled'?'red':'blue'}>{o.status}</Badge>
                  {o.status==='pending' && <>
                    <button onClick={()=>updateOrder(o.id,'in_progress')} style={{ padding:'4px 8px', background:S.lightBlue, color:S.blue, border:'none', borderRadius:5, fontSize:10, cursor:'pointer', fontWeight:600 }}>Start</button>
                    <button onClick={()=>updateOrder(o.id,'completed')} style={{ padding:'4px 8px', background:'#ECFDF5', color:S.success, border:'none', borderRadius:5, fontSize:10, cursor:'pointer', fontWeight:600 }}>Complete</button>
                  </>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
