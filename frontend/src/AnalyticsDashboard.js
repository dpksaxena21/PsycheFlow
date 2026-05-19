import React, { useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function AnalyticsDashboard({ patients, alerts }) {
  const stats = useMemo(() => {
    const total = patients.length;
    const high = patients.filter(p => p.riskLevel === 'high').length;
    const medium = patients.filter(p => p.riskLevel === 'medium').length;
    const low = patients.filter(p => p.riskLevel === 'low').length;
    const totalSessions = patients.reduce((s, p) => s + (p.sessions?.length || 0), 0);
    const avgPHQ = patients.length ? Math.round(patients.reduce((s, p) => s + (p.sessions?.[0]?.phq_score || 0), 0) / patients.length) : 0;
    const avgGAD = patients.length ? Math.round(patients.reduce((s, p) => s + (p.sessions?.[0]?.gad_score || 0), 0) / patients.length) : 0;
    return { total, high, medium, low, totalSessions, avgPHQ, avgGAD };
  }, [patients]);

  const phqTrend = useMemo(() => {
    const allSessions = patients.flatMap(p => p.sessions || []);
    const byDate = {};
    allSessions.forEach(s => {
      const date = new Date(s.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short' });
      if (!byDate[date]) byDate[date] = { date, phq: [], gad: [] };
      byDate[date].phq.push(s.phq_score || 0);
      byDate[date].gad.push(s.gad_score || 0);
    });
    return Object.values(byDate).slice(-10).map(d => ({
      date: d.date,
      PHQ9: Math.round(d.phq.reduce((a,b)=>a+b,0)/d.phq.length),
      GAD7: Math.round(d.gad.reduce((a,b)=>a+b,0)/d.gad.length),
    }));
  }, [patients]);

  const riskPie = [
    { name: 'High Risk', value: stats.high, color: '#ef4444' },
    { name: 'Medium Risk', value: stats.medium, color: '#f59e0b' },
    { name: 'Low Risk', value: stats.low, color: '#10B981' },
  ].filter(d => d.value > 0);

  const sessionBar = useMemo(() => {
    return patients.map(p => ({
      name: (p.email || 'Patient').slice(0, 8),
      sessions: p.sessions?.length || 0,
      phq: p.sessions?.[0]?.phq_score || 0,
    }));
  }, [patients]);

  const card = (label, value, sub, color) => (
    <div style={{ background:'#fff', borderRadius:16, padding:24, border:'1px solid #e2e8f0' }}>
      <div style={{ fontSize:13, color:'#94a3b8', marginBottom:8 }}>{label}</div>
      <div style={{ fontSize:32, fontWeight:700, color }}>{value}</div>
      {sub && <div style={{ fontSize:12, color:'#94a3b8', marginTop:4 }}>{sub}</div>}
    </div>
  );

  return (
    <div>
      <h2 style={{ color:'#1e293b', margin:'0 0 24px' }}>Practice Analytics</h2>

      {/* KPI Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        {card('Total Patients', stats.total, 'Active in practice', '#6366f1')}
        {card('Total Sessions', stats.totalSessions, 'Across all patients', '#4F46E5')}
        {card('Avg PHQ-9', stats.avgPHQ, 'Practice average', stats.avgPHQ >= 15 ? '#ef4444' : stats.avgPHQ >= 10 ? '#f59e0b' : '#10B981')}
        {card('Avg GAD-7', stats.avgGAD, 'Practice average', stats.avgGAD >= 15 ? '#ef4444' : stats.avgGAD >= 10 ? '#f59e0b' : '#10B981')}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:16, marginBottom:24 }}>
        {/* PHQ/GAD Trend */}
        <div style={{ background:'#fff', borderRadius:16, padding:24, border:'1px solid #e2e8f0' }}>
          <h3 style={{ margin:'0 0 20px', color:'#1e293b', fontSize:15 }}>PHQ-9 & GAD-7 Trend</h3>
          {phqTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={phqTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize:11 }} />
                <YAxis domain={[0,27]} tick={{ fontSize:11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="PHQ9" stroke="#4F46E5" strokeWidth={2} dot={{ r:4 }} />
                <Line type="monotone" dataKey="GAD7" stroke="#10B981" strokeWidth={2} dot={{ r:4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height:220, display:'flex', alignItems:'center', justifyContent:'center', color:'#94a3b8' }}>No session data yet</div>
          )}
        </div>

        {/* Risk Distribution Pie */}
        <div style={{ background:'#fff', borderRadius:16, padding:24, border:'1px solid #e2e8f0' }}>
          <h3 style={{ margin:'0 0 20px', color:'#1e293b', fontSize:15 }}>Risk Distribution</h3>
          {riskPie.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={riskPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {riskPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height:220, display:'flex', alignItems:'center', justifyContent:'center', color:'#94a3b8' }}>No patients yet</div>
          )}
        </div>
      </div>

      {/* Sessions per Patient */}
      <div style={{ background:'#fff', borderRadius:16, padding:24, border:'1px solid #e2e8f0', marginBottom:24 }}>
        <h3 style={{ margin:'0 0 20px', color:'#1e293b', fontSize:15 }}>Sessions per Patient</h3>
        {sessionBar.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sessionBar}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize:11 }} />
              <YAxis tick={{ fontSize:11 }} />
              <Tooltip />
              <Bar dataKey="sessions" fill="#4F46E5" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height:200, display:'flex', alignItems:'center', justifyContent:'center', color:'#94a3b8' }}>No data yet</div>
        )}
      </div>

      {/* Power BI */}
      <div style={{ background:'#fff', borderRadius:16, padding:24, border:'1px solid #e2e8f0' }}>
        <h3 style={{ margin:'0 0 8px', color:'#1e293b' }}>Power BI Integration</h3>
        <p style={{ fontSize:13, color:'#94a3b8', margin:'0 0 16px' }}>Connect Supabase to Power BI for advanced analytics.</p>
        <div style={{ background:'#f8fafc', borderRadius:8, padding:12, fontSize:12, color:'#64748b', fontFamily:'monospace' }}>
          Host: db.uckgvukjdekoxfbxnqew.supabase.co | Port: 5432 | Database: postgres | Schema: public
        </div>
      </div>
    </div>
  );
}
