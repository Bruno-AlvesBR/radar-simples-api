import * as XLSX from 'xlsx';

export interface ParsedInvoiceRecord {
  issueDate: Date;
  amount: number;
  competenceMonth: string;
  sourceFileName: string | undefined;
}

const issueDateAliases = [
  'dataemissao',
  'dataemissão',
  'data da emissao',
  'data da emissão',
  'emissao',
  'emissão',
  'date',
];

const amountAliases = [
  'valor',
  'valor da nota',
  'valorbruto',
  'valor bruto',
  'amount',
  'total',
];

export function parseInvoiceRecords(fileBuffer: Buffer, fileName?: string) {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    return [];
  }

  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: '',
    raw: false,
  });

  return rows
    .map((row) => parseInvoiceRow(row, fileName))
    .filter((row): row is ParsedInvoiceRecord => row !== null);
}

function parseInvoiceRow(row: Record<string, unknown>, fileName?: string) {
  const issueDateValue = readCellValue(row, issueDateAliases);
  const amountValue = readCellValue(row, amountAliases);

  if (!issueDateValue || amountValue == null) {
    return null;
  }

  const issueDate = parseDate(issueDateValue);
  const amount = parseCurrency(amountValue);

  if (!issueDate || Number.isNaN(amount)) {
    return null;
  }

  return {
    issueDate,
    amount,
    competenceMonth: getCompetenceMonth(issueDate),
    sourceFileName: fileName,
  };
}

function readCellValue(row: Record<string, unknown>, aliases: string[]) {
  const normalizedAliases = aliases.map(normalizeText);

  for (const [key, value] of Object.entries(row)) {
    if (normalizedAliases.includes(normalizeText(key))) {
      return value;
    }
  }

  return null;
}

function parseDate(value: unknown) {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'number') {
    const parsedDate = XLSX.SSF.parse_date_code(value);
    if (!parsedDate) {
      return null;
    }

    return new Date(parsedDate.y, parsedDate.m - 1, parsedDate.d);
  }

  if (typeof value !== 'string') {
    return null;
  }

  const normalizedValue = value.trim();
  if (!normalizedValue) {
    return null;
  }

  const parts = normalizedValue.split(/[\/\-]/).map((part) => part.trim());
  if (parts.length === 3 && parts[0].length <= 2) {
    const day = Number(parts[0]);
    const month = Number(parts[1]);
    const year = Number(parts[2]);
    if (
      Number.isInteger(day) &&
      Number.isInteger(month) &&
      Number.isInteger(year)
    ) {
      const date = new Date(year, month - 1, day);
      return Number.isNaN(date.getTime()) ? null : date;
    }
  }

  const fallbackDate = new Date(normalizedValue);
  return Number.isNaN(fallbackDate.getTime()) ? null : fallbackDate;
}

function parseCurrency(value: unknown) {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value !== 'string') {
    return Number.NaN;
  }

  const normalizedValue = value
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^\d.-]/g, '');
  return Number(normalizedValue);
}

function getCompetenceMonth(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function normalizeText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}
