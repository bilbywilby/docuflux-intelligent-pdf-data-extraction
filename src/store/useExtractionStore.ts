import { create } from 'zustand';
import { ExtractionResult, CloudDocument, DocumentVersion, CloudPagination } from '@shared/types';
import { saveAudit, getAudits, deleteAudit as dbDeleteAudit } from '@/lib/db';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
type ProcessingStep = 'idle' | 'reading' | 'ocr' | 'analyzing' | 'success' | 'error';
interface ExtractionState {
  status: ProcessingStep;
  error: string | null;
  result: ExtractionResult | null;
  history: ExtractionResult[];
  cloudHistory: CloudDocument[];
  isSyncing: boolean;
  cloudSyncEnabled: boolean;
  startExtraction: (step?: ProcessingStep) => void;
  setProcessingStep: (step: ProcessingStep) => void;
  setSuccess: (payload: ExtractionResult) => Promise<void>;
  setError: (message: string) => void;
  reset: () => void;
  loadHistory: () => Promise<void>;
  deleteHistoryItem: (id: string) => Promise<void>;
  setResult: (result: ExtractionResult) => void;
  // Cloud Actions
  fetchCloudHistory: () => Promise<void>;
  syncToCloud: (result: ExtractionResult) => Promise<void>;
  toggleCloudSync: () => void;
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
  cloudHistory: [],
  isSyncing: false,
  cloudSyncEnabled: localStorage.getItem('cloudSyncEnabled') === 'true',
  startExtraction: (step = 'reading') => set({ status: step, error: null, result: null }),
  setProcessingStep: (step) => set({ status: step }),
  setSuccess: async (payload) => {
    const fingerprint = await generateFingerprint(payload.rawText);
    const currentHistory = get().history;
    if (currentHistory.some(h => h.fingerprint === fingerprint)) {
      toast.warning('Duplicate detected in local history');
    }
    const payloadWithFingerprint = { ...payload, fingerprint };
    await saveAudit(payloadWithFingerprint);
    set(state => ({
      status: 'success',
      error: null,
      result: payloadWithFingerprint,
      history: [payloadWithFingerprint, ...state.history]
    }));
    if (get().cloudSyncEnabled) {
      await get().syncToCloud(payloadWithFingerprint);
    }
  },
  setError: (message) => set({ status: 'error', error: message, result: null }),
  reset: () => set({ status: 'idle', error: null, result: null }),
  loadHistory: async () => {
    try {
      const data = await getAudits();
      set({ history: data.sort((a, b) => new Date(b.extractedAt).getTime() - new Date(a.extractedAt).getTime()) });
    } catch (err) {
      console.error('Failed to load local history:', err);
    }
  },
  deleteHistoryItem: async (id) => {
    try {
      await dbDeleteAudit(id);
      set(state => ({
        history: state.history.filter(h => h.id !== id),
        result: state.result?.id === id ? null : state.result
      }));
      toast.success('Record removed');
    } catch (err) {
      toast.error('Failed to delete record');
    }
  },
  setResult: (result) => set({ result, status: 'success' }),
  fetchCloudHistory: async () => {
    try {
      // Correct pagination structure from API response
      const response = await api<CloudPagination<CloudDocument>>('/api/documents');
      if (response && Array.isArray(response.items)) {
        set({ cloudHistory: response.items });
      } else {
        console.warn('Invalid cloud history format received:', response);
      }
    } catch (err) {
      // Silently fail if cloud is unreachable but log for debug
      console.warn('Failed to fetch cloud history:', err);
    }
  },
  syncToCloud: async (result) => {
    set({ isSyncing: true });
    try {
      // 1. Create or Find document record
      const doc = await api<CloudDocument>('/api/documents', {
        method: 'POST',
        body: JSON.stringify({ fileName: result.fileName })
      });
      // 2. Save document version
      await api<DocumentVersion>(`/api/documents/${doc.id}/versions`, {
        method: 'POST',
        body: JSON.stringify({ 
          label: `Audit ${new Date().toLocaleDateString()}`, 
          result 
        })
      });
      toast.success('Synced to Cloud Vault');
      await get().fetchCloudHistory();
    } catch (err) {
      console.error('Sync error:', err);
      toast.error('Cloud sync failed');
    } finally {
      set({ isSyncing: false });
    }
  },
  toggleCloudSync: () => {
    const newVal = !get().cloudSyncEnabled;
    set({ cloudSyncEnabled: newVal });
    localStorage.setItem('cloudSyncEnabled', String(newVal));
    toast.info(newVal ? 'Cloud Sync Enabled' : 'Cloud Sync Disabled');
    if (newVal) {
      get().fetchCloudHistory();
    }
  }
}));