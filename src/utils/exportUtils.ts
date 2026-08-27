export interface ColumnDef {
  header: string;
  key: string;
  align?: 'left' | 'center' | 'right';
  format?: (val: any, row?: Record<string, any>) => string;
}

export interface KPIItem {
  label: string;
  value: string | number;
  change?: string;
}

function sanitizeText(text: any): string {
  if (text === null || text === undefined) return '';
  return String(text).replace(/₹/g, 'Rs. ').trim();
}

/**
 * Export report data to CSV format with UTF-8 BOM encoding.
 */
export function exportToCSV(
  reportTitle: string,
  columns: ColumnDef[],
  data: Record<string, any>[]
) {
  const headers = columns.map(c => `"${c.header.replace(/"/g, '""')}"`).join(',');
  const rows = data.map(row => {
    return columns.map(c => {
      let val = row[c.key];
      if (val === null || val === undefined) val = '';
      if (typeof val === 'object') val = JSON.stringify(val);
      const strVal = String(val).replace(/"/g, '""');
      return `"${strVal}"`;
    }).join(',');
  });

  const csvContent = '\uFEFF' + [headers, ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const filename = `${reportTitle.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export report data to Excel (.csv format with Excel MIME type).
 */
export function exportToExcel(
  reportTitle: string,
  columns: ColumnDef[],
  data: Record<string, any>[]
) {
  const headers = columns.map(c => `"${c.header.replace(/"/g, '""')}"`).join('\t');
  const rows = data.map(row => {
    return columns.map(c => {
      let val = row[c.key];
      if (val === null || val === undefined) val = '';
      if (typeof val === 'object') val = JSON.stringify(val);
      const strVal = String(val).replace(/"/g, '""');
      return `"${strVal}"`;
    }).join('\t');
  });

  const excelContent = '\uFEFF' + [headers, ...rows].join('\r\n');
  const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const filename = `${reportTitle.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xls`;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export report data to formatted printable view.
 */
export function exportToPDF(
  reportTitle: string,
  dateRangeText: string,
  kpis: KPIItem[],
  columns: ColumnDef[],
  data: Record<string, any>[]
) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    window.print();
    return;
  }

  const kpisHtml = kpis && kpis.length > 0 ? `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 20px;">
      ${kpis.map(k => `
        <div style="background: #f8f9fa; border: 1px solid #e2e8f0; padding: 10px; border-radius: 8px;">
          <div style="font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase;">${sanitizeText(k.label)}</div>
          <div style="font-size: 16px; color: #b08d4a; font-weight: bold; margin-top: 4px;">${sanitizeText(k.value)}</div>
        </div>
      `).join('')}
    </div>
  ` : '';

  const tableHeadersHtml = columns.map(c => `<th style="padding: 10px; text-align: left; background: #0f0f10; color: #c5a059; font-size: 12px;">${sanitizeText(c.header)}</th>`).join('');
  const tableRowsHtml = data.map((row, idx) => `
    <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
      ${columns.map(c => `<td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px;">${sanitizeText(row[c.key])}</td>`).join('')}
    </tr>
  `).join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${sanitizeText(reportTitle)}</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; margin: 20px; color: #0f0f10; }
          .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #c5a059; padding-bottom: 12px; margin-bottom: 20px; }
          .title { font-size: 20px; font-weight: bold; }
          .subtitle { font-size: 12px; color: #64748b; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">${sanitizeText(reportTitle)}</div>
            <div class="subtitle">Period: ${sanitizeText(dateRangeText)} | Generated: ${new Date().toLocaleString()}</div>
          </div>
          <div style="font-weight: bold; color: #c5a059; font-size: 16px;">Multi-Business Billing</div>
        </div>
        ${kpisHtml}
        <table>
          <thead><tr>${tableHeadersHtml}</tr></thead>
          <tbody>${tableRowsHtml}</tbody>
        </table>
        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
