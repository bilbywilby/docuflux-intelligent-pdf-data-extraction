import { create } from 'zustand';
export interface ExtractionResult {
  fileName: string;
  rawText: string;
  structuredData: Record<string, any>;
  extractedAt: string;
}
type Status = 'idle' | 'processing' | 'success' | 'error';
interface ExtractionState {
  status: Status;
  error: string | null;
  result: ExtractionResult | null;
  // Actions
  startExtraction: () => void;
  setSuccess: (result: ExtractionResult) => void;
  setError: (message: string) => void;
  reset: () => void;
}
export const useExtractionStore = create<ExtractionState>((set) => ({
  status: 'idle',
  error: null,
  result: null,
  startExtraction: () => set({ status: 'processing', error: null, result: null }),
  setSuccess: (result) => set({ status: 'success', error: null, result }),
  setError: (message) => set({ status: 'error', error: message, result: null }),
  reset: () => set({ status: 'idle', error: null, result: null }),
}));