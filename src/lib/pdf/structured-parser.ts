import { z } from 'zod';
import { CostAnalysis, ACT_REFERENCE } from '@shared/types';
/**
 * PA Medical Billing Audit Benchmarks & Legal References (Act 102)
 */
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
  }),
});
export type DocumentData = z.infer<typeof DocumentSchema>;
/**
 * Redacts PHI patterns to ensure privacy before display.
 */
export function redactPHI(text: string): string {
  let redacted = text;
  const patterns = [
    /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
    /\b\d{9}\b/g, // NPI/TaxID
    /\b\d{2}\/\d{2}\/\d{4}\b/g, // Birthdates/Dates
    /ACCOUNT:\s*\d+/gi,
    /PATIENT ID:\s*[\w-]+/gi,
    /MEMBER ID:\s*[\w-]+/gi,
    /\b\d{5}-\d{4}\b/g, // Zip+4
  ];
  patterns.forEach(p => {
    redacted = redacted.replace(p, '[REDACTED]');
  });
  return redacted;
}
/**
 * Extracts and analyzes medical costs against PA benchmarks.
 */
export function extractCostAnalysis(text: string): CostAnalysis[] {
  const results: CostAnalysis[] = [];
  const cptRegex = /\b(9\d{4}|[0-9]{4}[A-Z])\b/g;
  const matches = Array.from(new Set(text.match(cptRegex)));
  matches.forEach(cpt => {
    if (PA_COST_BENCHMARKS[cpt]) {
      const benchmark = PA_COST_BENCHMARKS[cpt];
      const pos = text.indexOf(cpt);
      const window = text.slice(Math.max(0, pos - 150), Math.min(text.length, pos + 300));
      const amountMatch = window.match(/(?:\$|USD)\s*([\d,]+\.\d{2})/i);
      if (amountMatch) {
        const charged = parseFloat(amountMatch[1].replace(/,/g, ''));
        if (charged > 0 && charged < 100000) {
          const variance = ((charged - benchmark.avg) / benchmark.avg) * 100;
          let status: CostAnalysis['status'] = 'Normal';
          if (variance > 50) status = 'Severe';
          else if (variance > 30) status = 'Overpriced';
          results.push({
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
  const invoicePattern = /(?:Invoice|Inv)\s*(?:#|No\.?|Num)?\s*:?\s*([A-Z0-9-]+)/i;
  const datePattern = /(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4})|(?:\w{3,9}\s\d{1,2},?\s\d{4})/i;
  const amountPattern = /(?:Total|Amount|Balance|Due)\s*:?\s*(?:\$|USD|EUR|£)?\s*([\d,]+\.\d{2})/i;
  const invMatch = text.match(invoicePattern);
  if (invMatch) data.invoiceNumber = invMatch[1];
  const dateMatch = text.match(datePattern);
  if (dateMatch) data.date = dateMatch[0];
  const amountMatch = text.match(amountPattern);
  if (amountMatch) data.totalAmount = amountMatch[1];
  let type = 'Generic Document';
  if (text.toLowerCase().includes('invoice')) type = 'Medical Invoice';
  else if (text.toLowerCase().includes('explanation of benefits') || text.includes('EOB')) type = 'EOB';
  return DocumentSchema.parse({
    documentType: type,
    confidence: 0.85,
    entities: data
  });
}