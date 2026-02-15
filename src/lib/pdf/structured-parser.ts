import { z } from 'zod';
import { CostAnalysis, ACT_REFERENCE, TableData } from '@shared/types';
export const PA_COST_BENCHMARKS: Record<string, { avg: number; label: string }> = {
  '99213': { avg: 75, label: 'Office Visit (Low-Moderate)' },
  '99214': { avg: 110, label: 'Office Visit (Moderate-High)' },
  '99283': { avg: 180, label: 'ER Visit (Moderate)' },
  '99284': { avg: 350, label: 'ER Visit (High)' },
  '99285': { avg: 520, label: 'ER Visit (Critical)' },
  '71045': { avg: 45, label: 'Chest X-Ray' },
  '70450': { avg: 220, label: 'CT Scan Head/Brain' },
  '74177': { avg: 450, label: 'CT Scan Abdomen/Pelvis' },
  '80053': { avg: 35, label: 'Comprehensive Metabolic Panel' },
  '85025': { avg: 25, label: 'CBC with Differential' },
  '36415': { avg: 15, label: 'Routine Venipuncture' },
};
export const ACT_102_REFERENCES: Record<string, ACT_REFERENCE> = {
  SEVERE_OVERCHARGE: {
    act: 'PA Act 102',
    citation: '§1421',
    violation: 'Unfair Trade Practices',
    remedy: 'Dispute via PA Office of Attorney General',
    complaintPath: 'attorneygeneral.gov/submit-a-complaint/',
  },
  FINANCIAL_ASSISTANCE: {
    act: 'PA Act 102',
    citation: '§1423',
    violation: 'FAP Non-Disclosure',
    remedy: 'Apply for Financial Assistance',
  },
};
export const DocumentSchema = z.object({
  documentType: z.string().default('Unknown'),
  confidence: z.number().min(0).max(1).default(0),
  entities: z.object({
    invoiceNumber: z.string().optional(),
    date: z.string().optional(),
    totalAmount: z.string().optional(),
    currency: z.string().optional(),
    vendor: z.string().optional(),
  }).default({}),
});
export type DocumentData = z.infer<typeof DocumentSchema>;
export function redactPHI(text: string): string {
  let redacted = text;
  const patterns = [
    /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
    /\b(?!(?:9\d{4}|[0-9]{4}[A-Z]))\d{9,12}\b/g, // General IDs (excluding CPT-like patterns)
    /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, // Dates (DOB/Service)
    /ACCOUNT[:\s]+[A-Z0-9-]+/gi,
    /PATIENT[:\s]+[A-Z\s,]+/gi,
    /MEMBER ID[:\s]+[A-Z0-9-]+/gi,
    /PHONE[:\s]+\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/gi,
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, // Emails
  ];
  patterns.forEach(p => {
    redacted = redacted.replace(p, '[REDACTED]');
  });
  return redacted;
}
export function normalizeCurrency(val: string): number {
  const clean = val.replace(/[^\d.-]/g, '');
  return parseFloat(clean) || 0;
}
export function detectTables(text: string): TableData[] {
  const lines = text.split('\n');
  const tables: TableData[] = [];
  let currentRows: string[][] = [];
  lines.forEach(line => {
    const parts = line.split(/\s{2,}/).map(p => p.trim()).filter(Boolean);
    if (parts.length >= 3) {
      currentRows.push(parts);
    } else if (currentRows.length > 0) {
      if (currentRows.length >= 2) {
        tables.push({
          headers: currentRows[0],
          rows: currentRows.slice(1),
          confidence: 0.8
        });
      }
      currentRows = [];
    }
  });
  return tables;
}
export function extractCostAnalysis(text: string): CostAnalysis[] {
  const results: CostAnalysis[] = [];
  const cptRegex = /\b(9\d{4}|[0-9]{4}[A-Z])\b/g;
  const matches = Array.from(new Set(text.match(cptRegex)));
  matches.forEach(cpt => {
    if (PA_COST_BENCHMARKS[cpt]) {
      const benchmark = PA_COST_BENCHMARKS[cpt];
      const pos = text.indexOf(cpt);
      const context = text.slice(Math.max(0, pos - 150), Math.min(text.length, pos + 250));
      const amountMatch = context.match(/(?:\$|USD)\s*([\d,]+\.\d{2})/i);
      if (amountMatch) {
        const charged = normalizeCurrency(amountMatch[1]);
        if (charged > 0 && charged < 100000) {
          const variance = ((charged - benchmark.avg) / benchmark.avg) * 100;
          let status: CostAnalysis['status'] = 'Normal';
          if (variance > 50) status = 'Severe';
          else if (variance > 30) status = 'Overpriced';
          results.push({
            id: crypto.randomUUID(),
            cpt,
            label: benchmark.label,
            charged,
            benchmark: benchmark.avg,
            variance: Math.round(variance),
            status,
            ...(status === 'Severe' ? {
              citation: ACT_102_REFERENCES.SEVERE_OVERCHARGE,
              financialNote: 'Patient may be eligible for Financial Assistance (FAP) if income ≤ 300% FPL under Act 102 §1423.'
            } : {})
          });
        }
      }
    }
  });
  return results;
}
export function parseStructuredData(text: string): DocumentData {
  const data: Partial<DocumentData['entities']> = {};
  const invoicePattern = /(?:Invoice|Inv|Claim|Account|Statement)\s*(?:#|No\.?|Num)?\s*:?\s*([A-Z0-9-]+)/i;
  const datePattern = /(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4})|(?:\w{3,9}\s\d{1,2},?\s\d{4})/i;
  const invMatch = text.match(invoicePattern);
  if (invMatch) data.invoiceNumber = invMatch[1];
  const dateMatch = text.match(datePattern);
  if (dateMatch) data.date = dateMatch[0];
  let type = 'Medical Document';
  const lowerText = text.toLowerCase();
  if (lowerText.includes('explanation of benefits')) type = 'EOB';
  else if (lowerText.includes('statement')) type = 'Medical Statement';
  else if (lowerText.includes('invoice')) type = 'Medical Invoice';
  const rawData = {
    documentType: type,
    confidence: 0.85,
    entities: data
  };
  const result = DocumentSchema.safeParse(rawData);
  if (!result.success) {
    console.warn('[Parser] Validation failed, returning partial data:', result.error);
    return {
      documentType: type,
      confidence: 0.5,
      entities: {}
    };
  }
  return result.data;
}