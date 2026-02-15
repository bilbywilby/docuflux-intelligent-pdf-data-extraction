export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  detail?: string;
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
export interface TableData {
  headers: string[];
  rows: string[][];
  confidence: number;
}
export interface CostAnalysis {
  id: string;
  cpt: string;
  label: string;
  charged: number;
  benchmark: number;
  variance: number;
  status: 'Normal' | 'Overpriced' | 'Severe';
  citation?: ACT_REFERENCE;
  financialNote?: string;
  verified?: boolean;
}
export interface ConfidenceInfo {
  score: number;
  flaggedReasons: string[];
  method: 'native' | 'ocr';
}
export interface ExtractionResult {
  id: string;
  fileName: string;
  rawText: string;
  redactedText: string;
  structuredData: any;
  costAnalysis: CostAnalysis[];
  extractedAt: string;
  fingerprint: string;
  confidence: ConfidenceInfo;
  tables: TableData[];
  pageCount: number;
  pageImages?: string[];
}
/**
 * Cloud Persistence Types
 */
export interface CloudDocument {
  id: string;
  fileName: string;
  currentVersionId: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
}
export interface DocumentVersion {
  id: string;
  documentId: string;
  label: string;
  result: ExtractionResult;
  createdAt: string;
}
export interface CloudPagination<T> {
  items: T[];
  next: string | null;
}