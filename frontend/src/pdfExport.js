import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportPatientReport(patient, sessions, journals) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  const now = new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' });

  // Header
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, pageW, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('PsycheFlow', 14, 12);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Clinical Psychology Platform', 14, 20);
  doc.text(`Generated: ${now}`, pageW - 14, 20, { align: 'right' });

  // Patient Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Patient Clinical Report', 14, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Patient: ${patient.name || 'Anonymous'}`, 14, 52);
  doc.text(`Sessions: ${sessions.length}`, 14, 60);
  doc.text(`Report Date: ${now}`, 14, 68);

  // Disclaimer
  doc.setFillColor(255, 247, 237);
  doc.rect(14, 74, pageW - 28, 12, 'F');
  doc.setTextColor(146, 64, 14);
  doc.setFontSize(9);
  doc.text('DISCLAIMER: This report is AI-generated and does not constitute a medical diagnosis.', 18, 82);

  // PHQ/GAD Trend Table
  if (sessions.length > 0) {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Assessment History', 14, 96);

    const tableData = sessions.slice(0, 10).map((s, i) => [
      i + 1,
      new Date(s.created_at).toLocaleDateString('en-IN'),
      s.phq_score ?? '-',
      s.gad_score ?? '-',
      s.phq_score >= 20 ? 'Severe' : s.phq_score >= 15 ? 'Mod-Severe' : s.phq_score >= 10 ? 'Moderate' : s.phq_score >= 5 ? 'Mild' : 'Minimal'
    ]);

    autoTable(doc, {
      startY: 100,
      head: [['#', 'Date', 'PHQ-9', 'GAD-7', 'Severity']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229], textColor: 255 },
      styles: { fontSize: 10 },
    });
  }

  // Latest Session Details
  const latest = sessions[0];
  if (latest) {
    const y = (doc.lastAutoTable?.finalY || 160) + 14 || 160;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Latest Assessment Summary', 14, y);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);

    const phq = latest.phq_score || 0;
    const gad = latest.gad_score || 0;
    const severity = phq >= 20 ? 'Severe' : phq >= 15 ? 'Moderately Severe' : phq >= 10 ? 'Moderate' : phq >= 5 ? 'Mild' : 'Minimal';

    doc.text(`PHQ-9 Score: ${phq} — Depression: ${severity}`, 14, y + 10);
    doc.text(`GAD-7 Score: ${gad} — Anxiety: ${gad >= 15 ? 'Severe' : gad >= 10 ? 'Moderate' : gad >= 5 ? 'Mild' : 'Minimal'}`, 14, y + 18);
    doc.text(`Assessment Date: ${new Date(latest.created_at).toLocaleDateString('en-IN')}`, 14, y + 26);
  }

  // Journal Summary
  if (journals.length > 0) {
    const y = (doc.lastAutoTable?.finalY || 160) + 60 || 220;
    doc.addPage();
    doc.setTextColor(0,0,0);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Journal Entries Summary', 14, 20);

    const jData = journals.slice(0, 5).map((j, i) => [
      i + 1,
      new Date(j.created_at).toLocaleDateString('en-IN'),
      j.analysis?.dominant_emotion || '-',
      j.analysis?.risk_level || 'low',
      (j.text || '').slice(0, 60) + '...'
    ]);

    autoTable(doc, {
      startY: 26,
      head: [['#', 'Date', 'Emotion', 'Risk', 'Excerpt']],
      body: jData,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129], textColor: 255 },
      styles: { fontSize: 9 },
    });
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`PsycheFlow Clinical Report — Confidential — Page ${i} of ${pageCount}`, pageW / 2, doc.internal.pageSize.getHeight() - 8, { align: 'center' });
    doc.text('iCall: 9152987821 | Vandrevala: 1860-2662-345', pageW / 2, doc.internal.pageSize.getHeight() - 4, { align: 'center' });
  }

  doc.save(`PsycheFlow_Report_${patient.name || 'Patient'}_${now.replace(/ /g,'_')}.pdf`);
}
