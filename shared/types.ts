export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface User {
  id: string;
  name: string;
}
export interface Chat {
  id: string;
  title: string;
}
export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  text: string;
  ts: number;
}
/**
 * Medical Audit Types
 */
export interface ACT_REFERENCE {
  act: string;
  citation: string;
  violation: string;
  remedy: string;
  complaintPath?: string;
}
export interface CostAnalysis {
  cpt: string;
  label: string;
  charged: number;
  benchmark: number;
  variance: number;
  status: 'Normal' | 'Overpriced' | 'Severe';
  citation?: ACT_REFERENCE;
  financialNote?: string;
}
export interface ExtractionResult {
  id: string;
  fileName: string;
  rawText: string;
  redactedText: string;
  structuredData: Record<string, any>;
  costAnalysis: CostAnalysis[];
  extractedAt: string;
  fingerprint: string;
}