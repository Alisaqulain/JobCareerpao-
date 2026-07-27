export function downloadReceiptHtml(receiptElement: HTMLElement, filename: string) {
  const styles = `
    body { font-family: Arial, sans-serif; margin: 24px; color: #0f172a; }
    table { width: 100%; border-collapse: collapse; margin-top: 24px; }
    th, td { padding: 8px 0; border-bottom: 1px solid #e2e8f0; text-align: left; }
    td:last-child, th:last-child { text-align: right; }
    header { display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 24px; }
    footer { margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }
  `;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${filename}</title>
  <style>${styles}</style>
</head>
<body>${receiptElement.outerHTML}</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printReceipt() {
  window.print();
}
