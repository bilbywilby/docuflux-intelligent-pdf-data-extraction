import { create } from 'zustand';
import { ExtractionResult } from '@shared/types';
import { saveAudit, getAudits, deleteAudit as dbDeleteAudit } from '@/lib/db';
import { toast } from 'sonner';
type ProcessingStep = 'idle' | 'reading' | 'ocr' | 'analyzing' | 'success' | 'error';
interface ExtractionState {
  status: ProcessingStep;
  error: string | null;
  result: ExtractionResult | null;
  history: ExtractionResult[];
  startExtraction: (step?: ProcessingStep) => void;
  setProcessingStep: (step: ProcessingStep) => void;
  setSuccess: (payload: ExtractionResult) => Promise<void>;
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
  startExtraction: (step = 'reading') => set({ status: step, error: null, result: null }),
  setProcessingStep: (step) => set({ status: step }),
  setSuccess: async (payload) => {
    const fingerprint = await generateFingerprint(payload.rawText);
    const history = get().history;
    if (history.some(h => h.fingerprint === fingerprint)) {
      toast.warning('Note: This document appears to be a duplicate of a previous analysis.');
    }
    await saveAudit(payload);
    set(state => ({
      status: 'success',
      error: null,
      result: payload,
      history: [payload, ...state.history]
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
    toast.success('Record removed from local history');
  },
  setResult: (result) => set({ result, status: 'success' })
}));