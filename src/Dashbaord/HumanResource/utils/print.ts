export const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const hrPrintStyles = `
  @page { margin: 0; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 16mm;
    color: #111827;
    background: #ffffff;
    font-family: Arial, sans-serif;
  }
  h1 { margin: 0 0 8px; font-size: 24px; line-height: 1.2; }
  h2 { margin: 22px 0 10px; font-size: 16px; }
  p { margin: 0 0 18px; color: #4b5563; }
  table { width: 100%; border-collapse: collapse; page-break-inside: auto; }
  tr { page-break-inside: avoid; page-break-after: auto; }
  th, td {
    border: 1px solid #e5e7eb;
    padding: 9px 10px;
    text-align: left;
    font-size: 12px;
    vertical-align: top;
  }
  th { background: #f9fafb; font-weight: 700; }
  tr:nth-child(even) { background: #fcfcfd; }
  .summary {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
    margin: 18px 0;
  }
  .summary-card {
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 12px;
  }
  .summary-card span {
    display: block;
    color: #6b7280;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: .04em;
  }
  .summary-card strong {
    display: block;
    margin-top: 6px;
    font-size: 20px;
  }
  .details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 18px;
    margin: 18px 0;
  }
  .detail-row {
    border-bottom: 1px solid #f3f4f6;
    padding: 8px 0;
  }
  .detail-row span {
    display: block;
    color: #6b7280;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: .04em;
  }
  .detail-row strong {
    display: block;
    margin-top: 3px;
    font-size: 13px;
  }
  .charts-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin: 18px 0;
  }
  .chart-block {
    margin: 18px 0;
  }
  .chart-block h2 {
    margin: 0 0 8px;
  }
`;

export function buildHrPrintDocument(title: string, body: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${escapeHtml(title)}</title>
        <style>${hrPrintStyles}</style>
      </head>
      <body>${body}</body>
    </html>
  `;
}

export function openHrPrintPreview(title: string, body: string) {
  const existingFrame = document.getElementById("hr-print-frame");
  if (existingFrame) existingFrame.remove();

  const iframe = document.createElement("iframe");
  iframe.id = "hr-print-frame";
  iframe.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;border:none;visibility:hidden;";

  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) {
    iframe.remove();
    return false;
  }

  doc.open();
  doc.write(buildHrPrintDocument(title, body));
  doc.close();

  let hasPrinted = false;
  const printOnce = () => {
    if (hasPrinted) return;
    hasPrinted = true;
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => iframe.remove(), 1500);
  };

  // requestAnimationFrame lets the browser paint once before the blocking
  // print dialog opens — zero artificial wait vs the old 100 ms timer.
  requestAnimationFrame(printOnce);

  return true;
}
