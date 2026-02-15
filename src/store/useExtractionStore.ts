import { create } from 'zustand';
import { CostAnalysis } from '@/lib/pdf/structured-parser';
import { saveAudit, getAudits, deleteAudit as dbDeleteAudit } from '@/lib/db';
import { toast } from 'sonner';
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
type Status = 'idle' | 'processing' | 'success' | 'error';
interface ExtractionState {
  status: Status;
  error: string | null;
  result: ExtractionResult | null;
  history: ExtractionResult[];
  startExtraction: () => void;
  setSuccess: (result: Omit<ExtractionResult, 'id' | 'fingerprint'>) => Promise<void>;
  setError: (message: string) => void;
  reset: () => void;
  loadHistory: () => Promise<void>;
  deleteHistoryItem: (id: string) => Promise<void>;
  setResult: (result: ExtractionResult) => void;
}
async function generateFingerprint(text: string): Promise<string> {
  try {
    const msgUint8 = new TextEncoder().encode(text.slice(0, 10000));
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    return text.length.toString() + text.slice(0, 50);
  }
}
export const useExtractionStore = create<ExtractionState>((set, get) => ({
  status: 'idle',
  error: null,
  result: null,
  history: [],
  startExtraction: () => set({ status: 'processing', error: null, result: null }),
  setSuccess: async (partialResult) => {
    const fingerprint = await generateFingerprint(partialResult.rawText);
    const history = get().history;
    if (history.some(h => h.fingerprint === fingerprint)) {
      toast.warning('This document has already been analyzed. Check history.');
    }
    const fullResult: ExtractionResult = {
      ...partialResult,
      id: crypto.randomUUID(),
      fingerprint
    };
    await saveAudit(fullResult);
    set(state => ({
      status: 'success',
      error: null,
      result: fullResult,
      history: [fullResult, ...state.history]
    }));
  },
  setError: (message) => set({ status: 'error', error: message, result: null }),
  reset: () => set({ status: 'idle', error: null, result: null }),
  loadHistory: async () => {
    const data = await getAudits();
    set({ history: data.sort((a, b) => new Date(b.extractedAt).getTime() - new Date(a.extractedAt).getTime()) });
  },
  deleteHistoryItem: async (id) => {
    await dbDeleteAudit(id);
    set(state => ({
      history: state.history.filter(h => h.id !== id),
      result: state.result?.id === id ? null : state.result
    }));
    toast.success('Audit deleted from local history');
  },
  setResult: (result) => set({ result, status: 'success' })
}));