import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import axios from 'axios';
const API = process.env.REACT_APP_API_URL || 'https://web-production-3887e.up.railway.app';

const SIDE_EFFECTS = ['Dizziness','Headache','Nausea','Drowsiness','Dry mouth','Insomnia','Weight gain','Tremors','Blurred vision','Fatigue','Anxiety','Palpitations'];
const SKIP_REASONS = ['Forgot','Side effects','Could not buy','Ran out','Didn\'t want to take','Felt better','Cost','Other'];

export default function MedicationAdherence({ user, prescriptions, t, isMobile }) {
  const [todayMeds, setTodayMeds] = useState([]);
  const [logs, setLogs] = useState([]);
  const [adherence, setAdherence] = useState(null);
  const [showSkipModal, setShowSkipModal] = useState(null);
  const [showSideEffectModal, setShowSideEffectModal] = useState(null);
  const [skipReason, setSkipReason] = useState('');
  const [selectedSideEffects, setSelectedSideEffects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('today'); // today | history | analytics
  const dark = t?.dark || false;
  const S = { navy: t?.navy||'#0C1A2E', blue: t?.blue||'#1D4ED8', bg: t?.bg||'#F8FAFF', bg2: t?.bg2||'#fff', border: t?.border||'#E2EBF6', muted: t?.muted||'#3B5998', hint: t?.hint||'#94a3b8', success: '#059669', warning: '#D97706', danger: '#DC2626', lightBlue: t?.lightBlue||'#EFF6FF' };

  const card = { background: S.bg2, borderRadius: 12, padding: 16, border: `0.5px solid ${S.border}` };

  useEffect(() => { buildTodaySchedule(); loadAdherence(); }, [prescriptions]);

  const buildTodaySchedule = () => {
    if (!prescriptions?.length) return;
    const now = new Date();
    const schedule = [];
    prescriptions.forEach(rx => {
      (rx.drugs || []).forEach(drug => {
        const times = getScheduledTimes(drug.frequency, drug.timing);
        times.forEach(time => {
          schedule.push({
            id: `${rx.id}-${drug.drugName}-${time}`,
            rxId: rx.id,
            name: drug.drugName,
            strength: drug.strength,
            dose: `${drug.drugName} ${drug.strength}`,
            frequency: drug.frequency,
            timing: drug.timing,
            scheduledTime: time,
            instructions: drug.instructions,
            controlled: drug.controlled,
            status: 'pending',
          });
        });
      });
    });
    // Sort by time
    schedule.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
    setTodayMeds(schedule);
  };

  const getScheduledTimes = (frequency, timing) => {
    const freq = frequency?.toLowerCase() || '';
    if (freq.includes('od') || freq.includes('once daily')) return [getTimingHour(timing)];
    if (freq.includes('bd') || freq.includes('twice')) return ['08:00', '20:00'];
    if (freq.includes('tds') || freq.includes('three')) return ['08:00', '14:00', '20:00'];
    if (freq.includes('qid') || freq.includes('four')) return ['07:00', '12:00', '17:00', '21:00'];
    if (freq.includes('bedtime') || freq.includes('night')) return ['21:00'];
    return ['08:00'];
  };

  const getTimingHour = (timing) => {
    const t = (timing || '').toLowerCase();
    if (t.includes('breakfast') || t.includes('morning')) return '08:00';
    if (t.includes('lunch') || t.includes('afternoon')) return '13:00';
    if (t.includes('dinner') || t.includes('evening')) return '18:00';
    if (t.includes('bedtime') || t.includes('night')) return '21:00';
    return '08:00';
  };

  const loadAdherence = async () => {
    if (!user?.id) return;
    try {
      const res = await axios.post(API + '/medication/adherence', { user_id: user.id, days: 30 });
      setAdherence(res.data);
      setLogs(res.data.logs || []);
    } catch {}
  };

  const logDose = async (med, status, reason = '', sideEffects = []) => {
    setLoading(true);
    // Update local state immediately
    setTodayMeds(m => m.map(x => x.id === med.id ? { ...x, status } : x));
    try {
      await axios.post(API + '/medication/log', {
        user_id: user.id,
        medication_name: med.name,
        dose: med.dose,
        scheduled_time: med.scheduledTime,
        status,
        skip_reason: reason,
        side_effects: sideEffects,
        taken_at: new Date().toISOString(),
      });
      // Save side effects alert to Supabase if present
      if (sideEffects.length > 0) {
        await supabase.from('medication_logs').insert({
          user_id: user.id, medication_name: med.name, status, side_effects: sideEffects,
          skip_reason: reason, taken_at: new Date().toISOString()
        });
      }
      await loadAdherence();
    } catch {}
    setLoading(false);
    setShowSkipModal(null);
    setShowSideEffectModal(null);
    setSkipReason('');
    setSelectedSideEffects([]);
  };

  const adherencePct = adherence?.adherence_percentage || 0;
  const streak = adherence?.current_streak || 0;
  const takenToday = todayMeds.filter(m => m.status === 'taken').length;
  const pendingToday = todayMeds.filter(m => m.status === 'pending').length;

  // Streak calendar — last 14 days
  const buildCalendar = () => {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayLogs = logs.filter(l => l.taken_at?.slice(0, 10) === dateStr);
      const takenCount = dayLogs.filter(l => l.status === 'taken').length;
      const totalCount = dayLogs.length;
      const status = totalCount === 0 ? 'none' : takenCount === totalCount ? 'full' : takenCount > 0 ? 'partial' : 'missed';
      days.push({ date: d, dateStr, status, takenCount, totalCount });
    }
    return days;
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ margin: 0, color: S.navy, fontSize: 20, fontWeight: 700 }}>Medications</h2>
        <div style={{ display: 'flex', gap: 6 }}>
          {['today', 'history', 'analytics'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{ padding: '6px 14px', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: view === v ? 700 : 400, background: view === v ? S.blue : 'transparent', color: view === v ? '#fff' : S.muted, cursor: 'pointer', textTransform: 'capitalize' }}>{v}</button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Adherence', value: adherencePct + '%', color: adherencePct >= 90 ? S.success : adherencePct >= 70 ? S.warning : S.danger, sub: '30-day average' },
          { label: 'Current Streak', value: streak + ' days', color: streak >= 7 ? S.success : S.warning, sub: streak >= 7 ? 'Keep it up!' : 'Build your streak' },
          { label: 'Taken Today', value: `${takenToday}/${todayMeds.length}`, color: S.blue, sub: 'doses' },
          { label: 'Trend', value: adherence?.adherence_trend || '—', color: adherence?.adherence_trend === 'improving' ? S.success : adherence?.adherence_trend === 'dropping' ? S.danger : S.muted, sub: adherence?.risk_flag ? '⚠ Review needed' : 'On track' },
        ].map((k, i) => (
          <div key={i} style={{ ...card, borderLeft: `3px solid ${k.color}` }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: k.color, textTransform: 'capitalize' }}>{k.value}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: S.navy, marginTop: 2 }}>{k.label}</div>
            <div style={{ fontSize: 10, color: S.hint, marginTop: 2 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* TODAY VIEW */}
      {view === 'today' && (
        <div>
          {todayMeds.length === 0 ? (
            <div style={{ ...card, textAlign: 'center', padding: 48 }}>
              <div style={{ fontSize: 14, color: S.muted }}>No medications prescribed yet.</div>
              <div style={{ fontSize: 12, color: S.hint, marginTop: 6 }}>Your doctor will add medications after your consultation.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {todayMeds.map(med => (
                <div key={med.id} style={{ ...card, borderLeft: `3px solid ${med.status === 'taken' ? S.success : med.status === 'skipped' ? S.danger : S.blue}`, opacity: med.status === 'taken' ? 0.8 : 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: S.navy }}>{med.name}</div>
                        <div style={{ fontSize: 12, color: S.muted }}>{med.strength}</div>
                        {med.controlled && <span style={{ fontSize: 10, fontWeight: 700, color: S.danger, background: '#FEF2F2', padding: '1px 6px', borderRadius: 3 }}>CONTROLLED</span>}
                      </div>
                      <div style={{ fontSize: 12, color: S.muted }}>{med.timing} · {med.frequency?.split(' ')[0]} · {med.scheduledTime}</div>
                      {med.instructions && <div style={{ fontSize: 11, color: S.hint, marginTop: 2 }}>{med.instructions}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {med.status === 'taken' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: S.success, fontSize: 13, fontWeight: 600 }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#ECFDF5"/><path d="M7 12l4 4 6-6" stroke={S.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          Taken
                        </div>
                      )}
                      {med.status === 'skipped' && <div style={{ color: S.danger, fontSize: 13, fontWeight: 600 }}>Skipped</div>}
                      {med.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => logDose(med, 'taken')} disabled={loading}
                            style={{ padding: '8px 16px', background: S.success, color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                            ✓ Taken
                          </button>
                          <button onClick={() => { setShowSkipModal(med); }}
                            style={{ padding: '8px 12px', background: '#FEF2F2', color: S.danger, border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                            Skip
                          </button>
                          <button onClick={() => setShowSideEffectModal(med)}
                            style={{ padding: '8px 12px', background: S.lightBlue, color: S.blue, border: 'none', borderRadius: 8, fontSize: 11, cursor: 'pointer' }}>
                            Side Effect
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Streak calendar */}
          <div style={{ ...card, marginTop: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: S.navy, marginBottom: 12 }}>Last 14 Days</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {buildCalendar().map((day, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <div style={{ width: isMobile ? 20 : 28, height: isMobile ? 20 : 28, borderRadius: 6, background: day.status === 'full' ? S.success : day.status === 'partial' ? S.warning : day.status === 'missed' ? S.danger : S.border, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {day.status === 'full' && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    {day.status === 'missed' && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M3 3l6 6M9 3l-6 6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                    {day.status === 'partial' && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }}/>}
                  </div>
                  <div style={{ fontSize: 9, color: S.hint }}>{day.date.toLocaleDateString('en-IN', { day: 'numeric' })}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
              {[['#059669', 'Taken'], ['#D97706', 'Partial'], ['#DC2626', 'Missed'], [S.border, 'No data']].map(([color, label]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: color }}/>
                  <span style={{ fontSize: 10, color: S.hint }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HISTORY VIEW */}
      {view === 'history' && (
        <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: S.bg }}>
                {['Time', 'Medication', 'Status', 'Reason/Side Effect'].map(h => (
                  <th key={h} style={{ padding: '9px 14px', fontSize: 10, fontWeight: 700, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left', borderBottom: `0.5px solid ${S.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: S.muted }}>No medication history yet.</td></tr>
              ) : logs.slice(0, 30).map((log, i) => (
                <tr key={i} style={{ borderBottom: `0.5px solid ${S.border}` }}
                  onMouseEnter={e => e.currentTarget.style.background = S.lightBlue}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '9px 14px', fontSize: 11, color: S.muted }}>{log.taken_at ? new Date(log.taken_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                  <td style={{ padding: '9px 14px', fontSize: 13, fontWeight: 600, color: S.navy }}>{log.medication_name} <span style={{ fontWeight: 400, color: S.muted }}>{log.dose}</span></td>
                  <td style={{ padding: '9px 14px' }}>
                    <span style={{ padding: '3px 8px', borderRadius: 100, fontSize: 11, fontWeight: 600, background: log.status === 'taken' ? '#ECFDF5' : log.status === 'skipped' ? '#FEF2F2' : '#FFFBEB', color: log.status === 'taken' ? S.success : log.status === 'skipped' ? S.danger : S.warning }}>
                      {log.status}
                    </span>
                  </td>
                  <td style={{ padding: '9px 14px', fontSize: 11, color: S.hint }}>
                    {log.skip_reason || (log.side_effects?.length > 0 ? log.side_effects.join(', ') : '—')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ANALYTICS VIEW */}
      {view === 'analytics' && adherence && (
        <div style={{ display: 'grid', gap: 16 }}>
          {/* Adherence gauge */}
          <div style={{ ...card }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: S.navy, marginBottom: 16 }}>30-Day Adherence Overview</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
              {[['Doses Taken', adherence.taken, S.success], ['Doses Skipped', adherence.skipped, S.danger], ['Snoozed', adherence.snoozed, S.warning]].map(([label, val, color]) => (
                <div key={label} style={{ background: S.bg, borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color }}>{val}</div>
                  <div style={{ fontSize: 11, color: S.muted, marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: S.muted }}>Overall adherence</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: adherencePct >= 90 ? S.success : adherencePct >= 70 ? S.warning : S.danger }}>{adherencePct}%</span>
            </div>
            <div style={{ height: 10, borderRadius: 5, background: S.border }}>
              <div style={{ height: 10, borderRadius: 5, background: adherencePct >= 90 ? S.success : adherencePct >= 70 ? S.warning : S.danger, width: adherencePct + '%', transition: 'width 0.5s' }}/>
            </div>
            {adherence.risk_flag && (
              <div style={{ marginTop: 12, padding: '8px 12px', background: '#FEF2F2', borderRadius: 8, fontSize: 12, color: S.danger, fontWeight: 600 }}>
                ⚠ Adherence dropping — your psychologist has been notified
              </div>
            )}
          </div>

          {/* Skip reasons */}
          {Object.keys(adherence.skip_reasons || {}).length > 0 && (
            <div style={{ ...card }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: S.navy, marginBottom: 12 }}>Why Doses Were Skipped</div>
              {Object.entries(adherence.skip_reasons).sort((a, b) => b[1] - a[1]).map(([reason, count]) => (
                <div key={reason} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `0.5px solid ${S.border}` }}>
                  <span style={{ fontSize: 12, color: S.navy }}>{reason}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: S.muted }}>{count}x</span>
                </div>
              ))}
            </div>
          )}

          {/* Side effects */}
          {Object.keys(adherence.side_effects || {}).length > 0 && (
            <div style={{ ...card }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: S.navy, marginBottom: 12 }}>Reported Side Effects</div>
              {Object.entries(adherence.side_effects).sort((a, b) => b[1] - a[1]).map(([effect, count]) => (
                <div key={effect} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `0.5px solid ${S.border}` }}>
                  <span style={{ fontSize: 12, color: S.navy }}>{effect}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: S.warning }}>{count}x</span>
                </div>
              ))}
              <div style={{ marginTop: 10, fontSize: 11, color: S.hint }}>Side effects are shared with your psychologist.</div>
            </div>
          )}
        </div>
      )}

      {/* Skip Modal */}
      {showSkipModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: S.bg2, borderRadius: 16, padding: 24, width: '100%', maxWidth: 360 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: S.navy, marginBottom: 6 }}>Why are you skipping?</div>
            <div style={{ fontSize: 12, color: S.muted, marginBottom: 16 }}>{showSkipModal.name} {showSkipModal.strength}</div>
            <div style={{ display: 'grid', gap: 6, marginBottom: 16 }}>
              {SKIP_REASONS.map(reason => (
                <div key={reason} onClick={() => setSkipReason(reason)}
                  style={{ padding: '10px 14px', borderRadius: 9, cursor: 'pointer', border: `0.5px solid ${skipReason === reason ? S.blue : S.border}`, background: skipReason === reason ? S.lightBlue : 'transparent', fontSize: 13, color: skipReason === reason ? S.blue : S.navy, fontWeight: skipReason === reason ? 600 : 400 }}>
                  {reason}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => logDose(showSkipModal, 'skipped', skipReason)} disabled={!skipReason}
                style={{ flex: 1, padding: '10px', background: S.danger, color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: !skipReason ? 0.6 : 1 }}>
                Confirm Skip
              </button>
              <button onClick={() => setShowSkipModal(null)} style={{ padding: '10px 16px', background: 'transparent', color: S.muted, border: `0.5px solid ${S.border}`, borderRadius: 9, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Side Effect Modal */}
      {showSideEffectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: S.bg2, borderRadius: 16, padding: 24, width: '100%', maxWidth: 400 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: S.navy, marginBottom: 6 }}>Report Side Effects</div>
            <div style={{ fontSize: 12, color: S.muted, marginBottom: 16 }}>{showSideEffectModal.name} {showSideEffectModal.strength}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {SIDE_EFFECTS.map(se => (
                <div key={se} onClick={() => setSelectedSideEffects(e => e.includes(se) ? e.filter(x => x !== se) : [...e, se])}
                  style={{ padding: '5px 12px', borderRadius: 100, cursor: 'pointer', fontSize: 12, fontWeight: selectedSideEffects.includes(se) ? 700 : 400, background: selectedSideEffects.includes(se) ? '#FEF2F2' : S.bg, color: selectedSideEffects.includes(se) ? S.danger : S.muted, border: `0.5px solid ${selectedSideEffects.includes(se) ? S.danger : S.border}` }}>
                  {se}
                </div>
              ))}
            </div>
            <div style={{ padding: '8px 12px', background: '#FFFBEB', borderRadius: 8, fontSize: 11, color: S.warning, marginBottom: 16 }}>
              Side effects will be reported to your psychologist.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => logDose(showSideEffectModal, 'taken', '', selectedSideEffects)} disabled={selectedSideEffects.length === 0}
                style={{ flex: 1, padding: '10px', background: S.warning, color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: selectedSideEffects.length === 0 ? 0.6 : 1 }}>
                Report & Mark Taken
              </button>
              <button onClick={() => setShowSideEffectModal(null)} style={{ padding: '10px 16px', background: 'transparent', color: S.muted, border: `0.5px solid ${S.border}`, borderRadius: 9, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
