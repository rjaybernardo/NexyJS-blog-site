// One CSV cell: quoted when needed, and guarded against spreadsheet formula
// injection (cells starting with = + - @ run as formulas in Excel)
export function csvCell(value: unknown) {
  let text = value instanceof Date ? value.toISOString() : String(value ?? "");

  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;

  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(rows: unknown[][]) {
  return rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}
