import React, { useState } from 'react';
import { supabase } from './supabase';

const DIAGNOSES = ['Major Depressive Disorder','Generalized Anxiety Disorder','PTSD','OCD','ADHD','Bipolar Disorder','Adjustment Disorder','Burnout','Social Anxiety','Panic Disorder'];
const THERAPY_TYPES = ['CBT','ACT','DBT','Mindfulness-Based','Psychodynamic','Supportive','Behavioral Activation','EMDR'];
const GOAL_TEMPLATES = [['Reduce Anxiety','Reduce GAD-7 score by 5 points in 8 weeks'],['Improve Sleep','Achieve 7+ hours sleep consistency'],['Reduce Depression','Bring PHQ-9 below 10'],['Build Coping Skills','Complete 10 ACT exercises'],['Improve Relationships','Weekly interpersonal check-in'],['Manage Stress','Daily stress log + 3 coping strategies']];

export default function PP_TreatmentPlans({ patients, user, S, card, Badge }) {
  const [sel, setSel] = useState(null);
  const [form, setForm] = useState({ diagnosis:'', therapy:'', duration:12, goals:[], notes:'' });
  const [saved, setSaved] = useState(false);
  const [plans, setPlans] = useState({});

  const savePlan = async () => {
    if (!sel || !form.diagnosis) return;
    const plan = { ...form, patient_id: sel.id, psychologist_id: user.id, created_at: new Date().toISOString(), status: 'active' };
    await supabase.from('treatment_plans').upsert(plan);
    setPlans(p => ({ ...p, [sel.id]: plan }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleGoal = (goal) => setForm(f => ({ ...f, goals: f.goals.includes(goal) ? f.goals.filter(g => g !== goal) : [...f.goals, goal] }));

  return (
    <div>
      <h2 style={{ margin: '0 0 20px', color: S.navy, fontSize: 20, fontWeight: 700 }}>Treatment Plans</h2>
      <div style={{ display: 'grid', gridTemplateColumns: sel ? '280px 1fr' : '1fr', gap: 16 }}>
        {/* Patient list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {patients.length === 0 ? (
            <div style={{ ...card, textAlign: 'center', padding: 40, color: S.muted }}>No patients linked yet.</div>
          ) : patients.map(p => (
            <div key={p.id} onClick={() => { setSel(p); setForm(plans[p.id] || { diagnosis: '', therapy: '', duration: 12, goals: [], notes: '' }); }}
              style={{ ...card, cursor: 'pointer', borderLeft: `3px solid ${sel?.id === p.id ? S.blue : plans[p.id] ? S.success : S.border}`, padding: '14px 16px' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = ''}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: S.navy }}>{p.display_name || p.full_name}</div>
                  <div style={{ fontSize: 11, color: S.muted, marginTop: 2 }}>PHQ: {p.latest?.phq_score ?? '—'} · GAD: {p.latest?.gad_score ?? '—'}</div>
                </div>
                {plans[p.id] ? <Badge color="green">Plan Active</Badge> : <Badge color="yellow">No Plan</Badge>}
              </div>
              {plans[p.id] && <div style={{ fontSize: 11, color: S.blue, marginTop: 6 }}>{plans[p.id].diagnosis} · {plans[p.id].therapy}</div>}
            </div>
          ))}
        </div>

        {/* Plan editor */}
        {sel && (
          <div style={{ ...card }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: S.navy }}>{sel.display_name || sel.full_name}</div>
                <div style={{ fontSize: 11, color: S.muted }}>Treatment Plan</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {saved && <span style={{ fontSize: 12, color: S.success, fontWeight: 600 }}>✓ Saved</span>}
                <button onClick={savePlan} style={{ padding: '8px 18px', background: S.blue, color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Save Plan</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: S.muted, marginBottom: 6, textTransform: 'uppercase' }}>Diagnosis</div>
                <select value={form.diagnosis} onChange={e => setForm({ ...form, diagnosis: e.target.value })}
                  style={{ width: '100%', padding: '9px 10px', borderRadius: 8, border: `0.5px solid ${S.border}`, fontSize: 13, background: S.bg, color: S.navy, outline: 'none' }}>
                  <option value="">Select diagnosis</option>
                  {DIAGNOSES.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: S.muted, marginBottom: 6, textTransform: 'uppercase' }}>Therapy Type</div>
                <select value={form.therapy} onChange={e => setForm({ ...form, therapy: e.target.value })}
                  style={{ width: '100%', padding: '9px 10px', borderRadius: 8, border: `0.5px solid ${S.border}`, fontSize: 13, background: S.bg, color: S.navy, outline: 'none' }}>
                  <option value="">Select therapy</option>
                  {THERAPY_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: S.muted, marginBottom: 6, textTransform: 'uppercase' }}>Duration (weeks)</div>
                <input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} min={1} max={52}
                  style={{ width: '100%', padding: '9px 10px', borderRadius: 8, border: `0.5px solid ${S.border}`, fontSize: 13, background: S.bg, color: S.navy, outline: 'none', boxSizing: 'border-box' }}/>
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: S.muted, marginBottom: 10, textTransform: 'uppercase' }}>Treatment Goals</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {GOAL_TEMPLATES.map(([goal, desc]) => (
                  <div key={goal} onClick={() => toggleGoal(goal)}
                    style={{ display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', border: `0.5px solid ${form.goals.includes(goal) ? S.blue : S.border}`, background: form.goals.includes(goal) ? S.lightBlue : S.bg }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: form.goals.includes(goal) ? S.blue : S.border, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      {form.goals.includes(goal) && <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: S.navy }}>{goal}</div>
                      <div style={{ fontSize: 10, color: S.muted }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: S.muted, marginBottom: 6, textTransform: 'uppercase' }}>Clinical Notes</div>
              <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={4}
                style={{ width: '100%', padding: '10px', borderRadius: 8, border: `0.5px solid ${S.border}`, fontSize: 13, background: S.bg, color: S.navy, outline: 'none', resize: 'vertical', fontFamily: "'Satoshi',-apple-system,sans-serif", boxSizing: 'border-box' }}
                placeholder="Clinical rationale, contraindications, special considerations..."/>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
