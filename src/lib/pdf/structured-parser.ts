import { z } from 'zod';
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
 * Heuristic-based parser to extract common fields from document text.
 */
export function parseStructuredData(text: string): DocumentData {
  const data: Partial<DocumentData['entities']> = {};
  // Basic Regex Patterns
  const invoicePattern = /(?:Invoice|Inv)\s*(?:#|No\.?|Num)?\s*:?\s*([A-Z0-9-]+)/i;
  const datePattern = /(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4})|(?:\w{3,9}\s\d{1,2},?\s\d{4})/i;
  const amountPattern = /(?:Total|Amount|Balance|Due)\s*:?\s*(?:\$|USD|EUR|£)?\s*([\d,]+\.\d{2})/i;
  const currencyPattern = /(USD|EUR|GBP|CAD|AUD|\$|€|£)/i;
  const invMatch = text.match(invoicePattern);
  if (invMatch) data.invoiceNumber = invMatch[1];
  const dateMatch = text.match(datePattern);
  if (dateMatch) data.date = dateMatch[0];
  const amountMatch = text.match(amountPattern);
  if (amountMatch) data.totalAmount = amountMatch[1];
  const currMatch = text.match(currencyPattern);
  if (currMatch) data.currency = currMatch[1];
  // Try to identify document type
  let type = 'Generic Document';
  if (text.toLowerCase().includes('invoice')) type = 'Invoice';
  else if (text.toLowerCase().includes('receipt')) type = 'Receipt';
  else if (text.toLowerCase().includes('contract')) type = 'Contract';
  return DocumentSchema.parse({
    documentType: type,
    confidence: 0.75, // Mock confidence
    entities: data
  });
}