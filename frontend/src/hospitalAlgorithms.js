// ═══════════════════════════════════════════════════════════
// PsycheFlow Hospital Intelligence Engine
// DSA-powered algorithms for clinical decision support
// ═══════════════════════════════════════════════════════════

// ── 1. PRIORITY QUEUE (Min-Heap) ─────────────────────────
// OPD triage: sorts patients by urgency score, not just FIFO
class MinHeap {
  constructor() { this.heap = []; }
  push(item) {
    this.heap.push(item);
    this._bubbleUp(this.heap.length - 1);
  }
  pop() {
    if (this.heap.length === 0) return null;
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) { this.heap[0] = last; this._sinkDown(0); }
    return top;
  }
  _bubbleUp(i) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[parent].score <= this.heap[i].score) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }
  _sinkDown(i) {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const l = 2*i+1, r = 2*i+2;
      if (l < n && this.heap[l].score < this.heap[smallest].score) smallest = l;
      if (r < n && this.heap[r].score < this.heap[smallest].score) smallest = r;
      if (smallest === i) break;
      [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
      i = smallest;
    }
  }
  toSortedArray() {
    const copy = new MinHeap();
    copy.heap = [...this.heap];
    const result = [];
    while (copy.heap.length > 0) result.push(copy.pop());
    return result;
  }
}

export function triageQueue(queue) {
  // Triage score = priority weight + wait time penalty
  const priorityWeight = { crisis: 0, urgent: 10, normal: 20 };
  const heap = new MinHeap();
  const now = Date.now();
  queue.filter(q => q.status === 'waiting').forEach(q => {
    const waitMins = Math.floor((now - new Date(q.created_at)) / 60000);
    const waitPenalty = Math.max(0, 30 - waitMins); // decreases as wait increases
    const score = (priorityWeight[q.priority] || 20) + waitPenalty;
    heap.push({ ...q, score, waitMins });
  });
  return heap.toSortedArray();
}

// ── 2. TRIAGE SCORING ALGORITHM ──────────────────────────
// Weighted multi-factor patient severity score
export function calculateTriageScore(patient) {
  let score = 0;
  const weights = {
    priority:    { crisis: 100, urgent: 60, normal: 20 },
    waitTime:    10,   // per 15 min over threshold
    age:         5,    // over 65 or under 5
    hasAllergy:  15,
  };

  score += weights.priority[patient.priority] || 20;

  const waitMins = patient.created_at
    ? Math.floor((Date.now() - new Date(patient.created_at)) / 60000) : 0;
  if (waitMins > 30) score += Math.floor((waitMins - 30) / 15) * weights.waitTime;

  const age = patient.patient_age;
  if (age && (age > 65 || age < 5)) score += weights.age;

  if (patient.patient_notes?.toLowerCase().includes('chest') ||
      patient.patient_notes?.toLowerCase().includes('breath') ||
      patient.patient_notes?.toLowerCase().includes('suicide')) score += 50;

  return { score, level: score >= 100 ? 'CRITICAL' : score >= 60 ? 'HIGH' : score >= 30 ? 'MEDIUM' : 'LOW',
    color: score >= 100 ? '#DC2626' : score >= 60 ? '#D97706' : score >= 30 ? '#2563EB' : '#059669' };
}

// ── 3. SLIDING WINDOW PHQ ANOMALY DETECTION ──────────────
// Detects spikes using z-score on rolling window
export function detectAnomalies(sessions, windowSize = 5) {
  if (!sessions || sessions.length < 2) return { anomalies: [], trend: 'insufficient_data' };

  const sorted = [...sessions].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  const phq = sorted.map(s => s.phq_score || 0);
  const gad = sorted.map(s => s.gad_score || 0);
  const anomalies = [];

  // Sliding window z-score
  for (let i = 1; i < phq.length; i++) {
    const window = phq.slice(Math.max(0, i - windowSize), i);
    const mean = window.reduce((a, b) => a + b, 0) / window.length;
    const std = Math.sqrt(window.reduce((a, b) => a + (b - mean) ** 2, 0) / window.length) || 1;
    const z = (phq[i] - mean) / std;
    const delta = phq[i] - phq[i - 1];

    if (Math.abs(z) >= 1.5 || Math.abs(delta) >= 5) {
      anomalies.push({
        session_index: i,
        date: sorted[i].created_at,
        phq_before: phq[i - 1],
        phq_after: phq[i],
        delta,
        z_score: Math.round(z * 100) / 100,
        severity: Math.abs(delta) >= 10 ? 'critical' : Math.abs(delta) >= 7 ? 'high' : 'moderate',
        type: delta > 0 ? 'spike' : 'drop',
        message: `PHQ-9 ${delta > 0 ? 'increased' : 'decreased'} by ${Math.abs(delta)} pts (z=${Math.round(z*100)/100})`
      });
    }
  }

  // Trend using linear regression slope
  const n = phq.length;
  const xMean = (n - 1) / 2;
  const yMean = phq.reduce((a, b) => a + b, 0) / n;
  const slope = phq.reduce((acc, y, x) => acc + (x - xMean) * (y - yMean), 0) /
    phq.reduce((acc, _, x) => acc + (x - xMean) ** 2, 0);

  const trend = slope > 0.5 ? 'worsening' : slope < -0.5 ? 'improving' : 'stable';

  return { anomalies, trend, slope: Math.round(slope * 100) / 100,
    latest_phq: phq[phq.length - 1], latest_gad: gad[gad.length - 1] };
}

// ── 4. REVENUE LEAKAGE DETECTION ─────────────────────────
// Set difference: services rendered vs charges billed
export function detectRevenueleakage(ipdAdmissions, labOrders, charges) {
  const leaks = [];

  ipdAdmissions.filter(a => a.status === 'admitted').forEach(adm => {
    const patientCharges = charges.filter(c => c.patient_id === adm.patient_id);
    const chargedDepts = new Set(patientCharges.map(c => c.department?.toLowerCase()));

    // Room charges
    if (!chargedDepts.has('room') && !chargedDepts.has('bed')) {
      const days = Math.floor((Date.now() - new Date(adm.admission_date)) / (24*60*60*1000));
      if (days > 0) leaks.push({ patient_id: adm.patient_id, patient_name: adm.hospital_patients?.full_name, type: 'room_charge', message: `Room charges missing (${days} day${days>1?'s':''})`, estimated_loss: days * 2000, severity: 'high' });
    }
    // Nursing charges
    if (!chargedDepts.has('nursing') && !chargedDepts.has('nurse')) {
      leaks.push({ patient_id: adm.patient_id, patient_name: adm.hospital_patients?.full_name, type: 'nursing_charge', message: 'Nursing charges not billed', estimated_loss: 500, severity: 'medium' });
    }
  });

  // Lab charges
  labOrders.filter(l => l.status === 'resulted').forEach(lab => {
    const billed = charges.some(c => c.patient_id === lab.patient_id && c.department?.toLowerCase() === 'lab' && c.item_name?.toLowerCase().includes(lab.test_name?.toLowerCase().slice(0,5)));
    if (!billed) leaks.push({ patient_id: lab.patient_id, patient_name: lab.hospital_patients?.full_name, type: 'lab_charge', message: `Lab test "${lab.test_name}" not billed`, estimated_loss: 800, severity: 'high' });
  });

  const totalLoss = leaks.reduce((s, l) => s + l.estimated_loss, 0);
  return { leaks, total_leakage: totalLoss, count: leaks.length };
}

// ── 5. BED ALLOCATION (BFS graph traversal) ──────────────
// Finds optimal available bed considering ward preferences
export function findOptimalBed(ipdList, preferences = {}) {
  // Build adjacency: ward → beds
  const wardGraph = {};
  const occupied = new Set(ipdList.filter(i => i.status === 'admitted').map(i => `${i.ward}-${i.bed_number}`));

  // Simulated ward structure
  const wards = ['ICU', 'General Ward A', 'General Ward B', 'Private', 'Semi-Private'];
  wards.forEach(ward => {
    wardGraph[ward] = Array.from({length: 10}, (_, i) => ({
      bed: `${ward.replace(/\s/g,'').slice(0,3).toUpperCase()}-${String(i+1).padStart(2,'0')}`,
      ward,
      occupied: occupied.has(`${ward}-${ward.replace(/\s/g,'').slice(0,3).toUpperCase()}-${String(i+1).padStart(2,'0')}`),
      type: ward.includes('ICU') ? 'icu' : ward.includes('Private') ? 'private' : 'general'
    }));
  });

  // BFS to find nearest available bed matching preference
  const preferredWard = preferences.ward || 'General Ward A';
  const queue = [preferredWard];
  const visited = new Set();

  while (queue.length > 0) {
    const ward = queue.shift();
    if (visited.has(ward)) continue;
    visited.add(ward);

    const available = (wardGraph[ward] || []).find(b => !b.occupied);
    if (available) return { found: true, ...available, alternatives: wards.filter(w => w !== ward) };

    // Add adjacent wards to queue
    wards.filter(w => !visited.has(w)).forEach(w => queue.push(w));
  }
  return { found: false, message: 'No beds available' };
}

// ── 6. DRUG INTERACTION CHECKER ──────────────────────────
// Graph adjacency list of known drug interactions
const DRUG_INTERACTIONS = {
  'warfarin':    ['aspirin', 'ibuprofen', 'naproxen', 'fluconazole'],
  'aspirin':     ['warfarin', 'ibuprofen', 'clopidogrel'],
  'metformin':   ['alcohol', 'contrast media'],
  'lithium':     ['ibuprofen', 'naproxen', 'diuretics'],
  'ssri':        ['tramadol', 'maoi', 'linezolid'],
  'maoi':        ['ssri', 'tramadol', 'tyramine'],
  'digoxin':     ['amiodarone', 'verapamil', 'quinidine'],
  'simvastatin': ['amiodarone', 'clarithromycin', 'erythromycin'],
};

export function checkDrugInteractions(medications) {
  const interactions = [];
  const drugs = medications.map(m => m.toLowerCase().trim());

  drugs.forEach((drug, i) => {
    const knownInteractions = DRUG_INTERACTIONS[drug] || [];
    drugs.forEach((other, j) => {
      if (i !== j && knownInteractions.includes(other)) {
        const existing = interactions.find(x =>
          (x.drug1 === drug && x.drug2 === other) ||
          (x.drug1 === other && x.drug2 === drug));
        if (!existing) interactions.push({ drug1: drug, drug2: other,
          severity: 'high', message: `${drug} + ${other}: potential interaction — monitor closely` });
      }
    });
  });
  return { interactions, safe: interactions.length === 0 };
}

// ── 7. STAFF SHIFT OPTIMIZER (Greedy) ────────────────────
// Greedy algorithm for minimum staff coverage
export function optimizeShifts(staff, minPerShift = 2) {
  const shifts = { morning: [], afternoon: [], night: [] };
  const roles = { psychologist: 0, nurse: 0, doctor: 0 };

  // Count by role
  staff.forEach(s => { if (roles[s.role] !== undefined) roles[s.role]++; });

  // Greedy assignment: prioritize critical shifts first
  const sortedStaff = [...staff].sort((a, b) => {
    const priority = { doctor: 0, psychologist: 1, nurse: 2 };
    return (priority[a.role] || 3) - (priority[b.role] || 3);
  });

  sortedStaff.forEach((s, i) => {
    const shiftKeys = Object.keys(shifts);
    const leastCovered = shiftKeys.reduce((min, k) => shifts[k].length < shifts[min].length ? k : min, shiftKeys[0]);
    shifts[leastCovered].push(s);
  });

  const coverage = Object.entries(shifts).map(([shift, staff]) => ({
    shift, staff_count: staff.length,
    adequate: staff.length >= minPerShift,
    roles: staff.reduce((acc, s) => { acc[s.role] = (acc[s.role]||0)+1; return acc; }, {})
  }));

  return { shifts, coverage, total_staff: staff.length,
    understaffed: coverage.filter(c => !c.adequate).map(c => c.shift) };
}

// ── 8. PREDICTIVE LENGTH OF STAY ─────────────────────────
// Simple regression-based LOS prediction
export function predictLOS(admission) {
  // Base LOS by diagnosis keywords (days)
  const diagnosisBase = {
    'pneumonia': 7, 'fracture': 5, 'surgery': 4, 'depression': 10,
    'anxiety': 5, 'psychosis': 14, 'cardiac': 6, 'diabetes': 4,
    'infection': 5, 'trauma': 7, 'default': 4
  };

  const diagnosis = (admission.diagnosis_on_admission || '').toLowerCase();
  let baseDays = diagnosisBase.default;
  Object.entries(diagnosisBase).forEach(([key, days]) => {
    if (diagnosis.includes(key)) baseDays = Math.max(baseDays, days);
  });

  const admissionDate = new Date(admission.admission_date);
  const daysAdmitted = Math.floor((Date.now() - admissionDate) / (24*60*60*1000));
  const remainingDays = Math.max(0, baseDays - daysAdmitted);
  const expectedDischarge = new Date(Date.now() + remainingDays * 24*60*60*1000);

  return { base_los: baseDays, days_admitted: daysAdmitted, remaining_days: remainingDays,
    expected_discharge: expectedDischarge.toLocaleDateString('en-IN', {day:'numeric', month:'short'}),
    status: remainingDays === 0 ? 'ready_for_discharge' : remainingDays <= 1 ? 'discharge_soon' : 'ongoing' };
}

// ── 9. HOSPITAL INTELLIGENCE SUMMARY ─────────────────────
// Aggregates all algorithms into one dashboard insight
export function getHospitalIntelligence({ queue, sessions, ipdList, labOrders, charges, staff, patients }) {
  const triaged = triageQueue(queue);
  const leakage = detectRevenueleakage(ipdList, labOrders, charges);
  const bedSuggestion = findOptimalBed(ipdList);
  const shiftOpt = optimizeShifts(staff || []);

  // Discharge candidates
  const dischargeCandidates = ipdList
    .filter(a => a.status === 'admitted')
    .map(a => ({ ...a, los: predictLOS(a) }))
    .filter(a => a.los.status === 'ready_for_discharge' || a.los.status === 'discharge_soon');

  // Critical patients in queue
  const criticalQueue = triaged.filter(p => p.score >= 100);

  return {
    triaged_queue: triaged,
    revenue_leakage: leakage,
    bed_suggestion: bedSuggestion,
    shift_optimization: shiftOpt,
    discharge_candidates: dischargeCandidates,
    critical_queue: criticalQueue,
    insights: [
      leakage.count > 0 && { type: 'warning', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#D97706" strokeWidth="1.8"/><path d="M12 6v6l4 2" stroke="#D97706" strokeWidth="1.8" strokeLinecap="round"/><path d="M8 14h1.5c0 1.1.9 2 2.5 2s2.5-.9 2.5-2-1-1.5-2.5-2-2.5-.9-2.5-2 .9-2 2.5-2 2.5.9 2.5 2H16" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round"/></svg>', title: `Revenue Leakage Detected`, body: `₹${leakage.total_leakage.toLocaleString()} potential loss across ${leakage.count} unbilled service(s)` },
      criticalQueue.length > 0 && { type: 'critical', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#DC2626" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="9" x2="12" y2="13" stroke="#DC2626" strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="17" r="0.5" fill="#DC2626" stroke="#DC2626" strokeWidth="1.5"/></svg>', title: `${criticalQueue.length} Critical Patient(s) in Queue`, body: `Immediate attention required` },
      dischargeCandidates.length > 0 && { type: 'info', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#1D4ED8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="8" x2="12" y2="14" stroke="#1D4ED8" strokeWidth="1.8" strokeLinecap="round"/><line x1="9" y1="11" x2="15" y2="11" stroke="#1D4ED8" strokeWidth="1.8" strokeLinecap="round"/></svg>', title: `${dischargeCandidates.length} Patient(s) Ready for Discharge`, body: dischargeCandidates.map(d => d.hospital_patients?.full_name || 'Unknown').join(', ') },
      shiftOpt.understaffed.length > 0 && { type: 'warning', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="7" r="3" stroke="#D97706" strokeWidth="1.8"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke="#D97706" strokeWidth="1.8" strokeLinecap="round"/><path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.85" stroke="#D97706" strokeWidth="1.8" strokeLinecap="round"/></svg>', title: `Understaffed Shifts`, body: `${shiftOpt.understaffed.join(', ')} shift(s) below minimum coverage` },
    ].filter(Boolean)
  };
}
