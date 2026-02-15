import { ExtractionResult, ACT_REFERENCE } from '@shared/types';
/**
 * 2024 Federal Poverty Level (FPL) Guidelines for Pennsylvania (Annual)
 * Source: ASPE / HHS
 */
export const FPL_2024 = {
  1: 15060,
  2: 20440,
  3: 25820,
  4: 31200,
  5: 36580,
  6: 41960,
  7: 47340,
  8: 52720,
  extra: 5380
};
export interface FapEligibility {
  isEligible: boolean;
  fplPercentage: number;
  threshold: number;
  citation: string;
  recommendation: string;
}
/**
 * Checks if a household is eligible for Financial Assistance under PA Act 102 §1423.
 * Mandates assistance for families up to 300% of FPL.
 */
export function checkFapEligibility(householdSize: number, annualIncome: number): FapEligibility {
  const size = Math.max(1, Math.min(8, Math.floor(householdSize))) as keyof typeof FPL_2024;
  let baseFpl = FPL_2024[size as 1|2|3|4|5|6|7|8];
  if (householdSize > 8) {
    baseFpl += (householdSize - 8) * FPL_2024.extra;
  }
  const fplPercentage = (annualIncome / baseFpl) * 100;
  const threshold = 300; // PA Act 102 §1423
  const isEligible = fplPercentage <= threshold;
  return {
    isEligible,
    fplPercentage: Math.round(fplPercentage),
    threshold,
    citation: "PA Act 102 §1423 (Financial Assistance Disclosure)",
    recommendation: isEligible 
      ? "You qualify for mandatory financial assistance. The hospital must provide an application before seeking payment."
      : "You exceed the 300% FPL threshold for mandatory assistance, but may still qualify for hospital-specific sliding scales."
  };
}
/**
 * Generates a formal dispute letter based on Act 102 violations.
 */
export function generateDisputeLetter(result: ExtractionResult): string {
  const date = new Date().toLocaleDateString();
  const overchargedItems = result.costAnalysis.filter(c => c.status === 'Severe' || c.status === 'Overpriced');
  let itemsTable = overchargedItems.map(item => 
    `- CPT ${item.cpt} (${item.label}): Charged $${item.charged.toFixed(2)} (Benchmark: $${item.benchmark.toFixed(2)}, Variance: ${item.variance}%)`
  ).join('\n');
  return `
Date: ${date}
To: Billing Department / Patient Advocate
Reference: Invoice/Claim ${result.structuredData.entities?.invoiceNumber || '[INVOICE NUMBER]'}
Subject: FORMAL DISPUTE - FAIR PRICING VIOLATION (PA ACT 102)
To whom it may concern,
I am writing to formally dispute the charges on the above-referenced medical statement for ${result.fileName}. After auditing these charges against Pennsylvania fair market benchmarks, I have identified significant pricing variances that appear to violate standard consumer protection expectations and PA Act 102 guidelines.
The following line items were identified as significantly exceeding regional averages:
${itemsTable}
Under PA Act 102, patients are entitled to transparent pricing and access to Financial Assistance Policies (FAP). Furthermore, excessive markups on essential medical services may constitute unfair trade practices.
I request the following actions:
1. A formal review of the "Charged Amount" for the CPT codes listed above.
2. Adjustment of these charges to align with the regional fair market benchmarks ($${overchargedItems.reduce((acc, i) => acc + i.benchmark, 0).toFixed(2)} total for these items).
3. A written explanation for why these charges exceeded the benchmark by more than 30%.
4. Confirmation that my account will not be sent to collections while this dispute is active.
Please provide a response within 30 days.
Sincerely,
[YOUR NAME]
[YOUR PHONE NUMBER]
[YOUR ADDRESS]
`.trim();
}