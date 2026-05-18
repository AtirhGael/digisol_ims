export type EvaluationDownloadFormat = "pdf" | "word";

export type AnalyticsDownloadPayload = {
  departments: { name: string; score: number }[];
  ratingDistribution: { label: string; count: number }[];
  generatedAt?: string;
};

type EvaluationDownloadPayload = {
  name: string;
  department: string;
  position: string;
  evaluator: string;
  date: string;
  rating?: number;
  status?: string;
  period?: string;
  cycle?: string;
};

const buildReportHtml = (payload: EvaluationDownloadPayload) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Performance Evaluation Report</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 32px; color: #1f2937; }
      h1 { margin-bottom: 8px; }
      p { margin: 6px 0; }
      .section { margin-top: 24px; }
      .label { font-weight: 700; }
      .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin-top: 16px; }
    </style>
  </head>
  <body>
    <h1>Performance Evaluation Report</h1>
    <p>Generated for ${payload.name}</p>

    <div class="card">
      <p><span class="label">Employee:</span> ${payload.name}</p>
      <p><span class="label">Position:</span> ${payload.position}</p>
      <p><span class="label">Department:</span> ${payload.department}</p>
      <p><span class="label">Evaluator:</span> ${payload.evaluator}</p>
      <p><span class="label">Date:</span> ${payload.date}</p>
      ${payload.period ? `<p><span class="label">Period:</span> ${payload.period}</p>` : ""}
      ${payload.cycle ? `<p><span class="label">Cycle:</span> ${payload.cycle}</p>` : ""}
      ${payload.status ? `<p><span class="label">Status:</span> ${payload.status}</p>` : ""}
      ${payload.rating !== undefined ? `<p><span class="label">Overall Rating:</span> ${payload.rating}/5</p>` : ""}
    </div>

    <div class="section">
      <h2>Performance Categories</h2>
      <div class="card">
        <p>Task Completion Rate: 4.0/5</p>
        <p>Quality of Work: 4.5/5</p>
        <p>Punctuality & Attendance: 5.0/5</p>
        <p>Conduct & Behaviour: 4.0/5</p>
        <p>Productivity: 4.5/5</p>
      </div>
    </div>

    <div class="section">
      <h2>Strengths & Achievements</h2>
      <div class="card">
        <p>Consistently delivers high-quality work</p>
        <p>Strong team collaboration skills</p>
        <p>Excellent problem-solving abilities</p>
      </div>
    </div>

    <div class="section">
      <h2>Areas for Improvement</h2>
      <div class="card">
        <p>Time management on complex projects</p>
        <p>Documentation practices</p>
      </div>
    </div>
  </body>
</html>
`;

const buildReportLines = (payload: EvaluationDownloadPayload) => [
  "Performance Evaluation Report",
  `Generated for ${payload.name}`,
  "",
  `Employee: ${payload.name}`,
  `Position: ${payload.position}`,
  `Department: ${payload.department}`,
  `Evaluator: ${payload.evaluator}`,
  `Date: ${payload.date}`,
  ...(payload.period ? [`Period: ${payload.period}`] : []),
  ...(payload.cycle ? [`Cycle: ${payload.cycle}`] : []),
  ...(payload.status ? [`Status: ${payload.status}`] : []),
  ...(payload.rating !== undefined ? [`Overall Rating: ${payload.rating}/5`] : []),
  "",
  "Performance Categories",
  "Task Completion Rate: 4.0/5",
  "Quality of Work: 4.5/5",
  "Punctuality & Attendance: 5.0/5",
  "Conduct & Behaviour: 4.0/5",
  "Productivity: 4.5/5",
  "",
  "Strengths & Achievements",
  "Consistently delivers high-quality work",
  "Strong team collaboration skills",
  "Excellent problem-solving abilities",
  "",
  "Areas for Improvement",
  "Time management on complex projects",
  "Documentation practices",
];

const escapePdfText = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

const buildPdfContent = (payload: EvaluationDownloadPayload) => {
  const lines = buildReportLines(payload);
  const startY = 780;
  const lineHeight = 22;

  const textCommands = lines
    .map((line, index) => {
      const y = startY - index * lineHeight;
      return `BT /F1 12 Tf 50 ${y} Td (${escapePdfText(line)}) Tj ET`;
    })
    .join("\n");

  const stream = `${textCommands}\n`;
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${stream.length} >> stream\n${stream}endstream endobj`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];

  for (const object of objects) {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  }

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.forEach((offset) => {
    pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return pdf;
};

const triggerDownload = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export function downloadEvaluationReport(
  payload: EvaluationDownloadPayload,
  format: EvaluationDownloadFormat = "pdf"
) {
  const reportHtml = buildReportHtml(payload);
  const fileNameBase = `${payload.name.replace(/\s+/g, "-").toLowerCase()}-evaluation-report`;

  if (format === "pdf") {
    const pdfContent = buildPdfContent(payload);
    const blob = new Blob([pdfContent], { type: "application/pdf" });
    triggerDownload(blob, `${fileNameBase}.pdf`);
    return;
  }

  const blob = new Blob([reportHtml], { type: "application/msword" });
  triggerDownload(blob, `${fileNameBase}.doc`);
}

// ─── Analytics Report ────────────────────────────────────────────────────────

const buildAnalyticsHtml = (payload: AnalyticsDownloadPayload) => {
  const deptRows = payload.departments.map(
    (d) =>
      `<tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${d.name}</td>` +
      `<td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${d.score.toFixed(1)} / 5.0</td></tr>`
  ).join("");

  const distRows = payload.ratingDistribution.map(
    (r) =>
      `<tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${r.label}</td>` +
      `<td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${r.count}</td></tr>`
  ).join("");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8"/>
    <title>Performance Analytics Report</title>
    <style>
      body{font-family:Arial,sans-serif;padding:40px;color:#1f2937;max-width:800px;margin:0 auto;}
      h1{font-size:22px;margin-bottom:4px;}
      .sub{color:#6b7280;font-size:13px;margin-bottom:32px;}
      h2{font-size:15px;font-weight:700;margin:24px 0 8px;}
      table{width:100%;border-collapse:collapse;font-size:14px;}
      th{text-align:left;padding:8px 12px;background:#f9fafb;border-bottom:2px solid #e5e7eb;font-size:12px;color:#6b7280;text-transform:uppercase;}
      th:last-child{text-align:right;}
      td:last-child{font-weight:600;}
      .footer{margin-top:40px;font-size:11px;color:#9ca3af;}
    </style>
  </head>
  <body>
    <h1>Performance Analytics Report</h1>
    <div class="sub">Generated on ${payload.generatedAt ?? new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>

    <h2>Average Rating by Department</h2>
    ${payload.departments.length ? `<table><thead><tr><th>Department</th><th>Avg. Score</th></tr></thead><tbody>${deptRows}</tbody></table>` : "<p style='color:#6b7280;font-size:13px;'>No department data available.</p>"}

    <h2>Rating Distribution</h2>
    ${payload.ratingDistribution.length ? `<table><thead><tr><th>Band</th><th>Count</th></tr></thead><tbody>${distRows}</tbody></table>` : "<p style='color:#6b7280;font-size:13px;'>No distribution data available.</p>"}

    <div class="footer">Digisol IMS · Performance Analytics · Confidential</div>
  </body>
</html>`;
};

const buildAnalyticsPdfContent = (payload: AnalyticsDownloadPayload) => {
  const date = payload.generatedAt ?? new Date().toLocaleDateString("en-US");
  const lines: string[] = [
    "Performance Analytics Report",
    `Generated: ${date}`,
    "",
    "Average Rating by Department",
    ...(payload.departments.length
      ? payload.departments.map((d) => `  ${d.name}: ${d.score.toFixed(1)} / 5.0`)
      : ["  No data"]),
    "",
    "Rating Distribution",
    ...(payload.ratingDistribution.length
      ? payload.ratingDistribution.map((r) => `  ${r.label}: ${r.count}`)
      : ["  No data"]),
    "",
    "Digisol IMS - Performance Analytics - Confidential",
  ];

  const startY = 780;
  const lineHeight = 22;
  const textCommands = lines
    .map((line, i) => {
      const y = startY - i * lineHeight;
      const fontSize = i === 0 ? 16 : 12;
      return `BT /F1 ${fontSize} Tf 50 ${y} Td (${escapePdfText(line)}) Tj ET`;
    })
    .join("\n");

  const stream = `${textCommands}\n`;
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${stream.length} >> stream\n${stream}endstream endobj`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += `${obj}\n`;
  }
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.forEach((o) => { pdf += `${o.toString().padStart(10, "0")} 00000 n \n`; });
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return pdf;
};

export function downloadAnalyticsReport(
  payload: AnalyticsDownloadPayload,
  format: EvaluationDownloadFormat = "pdf"
) {
  const fileNameBase = `performance-analytics-report-${new Date().toISOString().slice(0, 10)}`;
  if (format === "pdf") {
    const blob = new Blob([buildAnalyticsPdfContent(payload)], { type: "application/pdf" });
    triggerDownload(blob, `${fileNameBase}.pdf`);
  } else {
    const blob = new Blob([buildAnalyticsHtml(payload)], { type: "application/msword" });
    triggerDownload(blob, `${fileNameBase}.doc`);
  }
}
