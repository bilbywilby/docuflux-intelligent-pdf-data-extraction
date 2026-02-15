import React, { useEffect } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Toaster } from '@/components/ui/sonner';
import { PdfUploader } from '@/components/pdf/pdf-uploader';
import { ExtractionViewer } from '@/components/pdf/extraction-viewer';
import { ExtractionHistory } from '@/components/pdf/extraction-history';
import { useExtractionStore } from '@/store/useExtractionStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, ShieldCheck, History, PlusCircle, AlertCircle } from 'lucide-react';
export function HomePage() {
  // ZUSTAND STORE LAW: One field per store call
  const status = useExtractionStore((s) => s.status);
  const result = useExtractionStore((s) => s.result);
  const loadHistory = useExtractionStore((s) => s.loadHistory);
  // Hook must be called after store selectors and remain stable
  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      try {
        if (isMounted) {
          await loadHistory();
        }
      } catch (err) {
        console.error('Failed to load history:', err);
      }
    };
    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, [loadHistory]);
  const isProcessing = status !== 'idle' && status !== 'success' && status !== 'error';
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      <ThemeToggle />
      <div className="bg-slate-900 text-white py-2 px-4 text-center text-xs font-medium flex items-center justify-center gap-2 border-b border-white/10">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        Browser-Only Processing: Your medical data never leaves this device.
      </div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <div className="max-w-3xl mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800 text-xs font-semibold mb-6">
              <Sparkles className="w-3 h-3" />
              DocuFlux Medical Audit v1.1
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-slate-900 dark:text-white leading-[1.1] mb-6">
              Audit Medical Bills <br />
              <span className="text-blue-600">Against PA Act 102.</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Scan your medical invoices and Explanation of Benefits (EOB) to detect overpriced
              services, identify Act 102 violations, and verify cost benchmarks in seconds.
            </p>
          </div>
          <Tabs defaultValue="new" className="space-y-8">
            <TabsList className="bg-slate-200/50 dark:bg-slate-800/50 p-1">
              <TabsTrigger value="new" className="gap-2" disabled={isProcessing}>
                <PlusCircle className="w-4 h-4" /> New Audit
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2" disabled={isProcessing}>
                <History className="w-4 h-4" /> History
              </TabsTrigger>
            </TabsList>
            <TabsContent value="new" className="space-y-8 focus-visible:outline-none">
              {!result ? (
                <div className="max-w-2xl">
                  <PdfUploader />
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
                      <div className="flex items-center gap-2 font-semibold mb-2">
                        <AlertCircle className="w-4 h-4 text-blue-600" /> Table Detection
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">Automatically identifies billing line items and reconstructs tabular data from scanned documents.</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
                      <div className="flex items-center gap-2 font-semibold mb-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" /> OCR Fallback
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">Our intelligent engine runs OCR fallback for scanned images or non-text-layer PDFs to ensure high accuracy.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <ExtractionViewer />
              )}
            </TabsContent>
            <TabsContent value="history" className="focus-visible:outline-none">
              <ExtractionHistory />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <footer className="border-t bg-white dark:bg-slate-950/50 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-lg">D</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">DocuFlux Medical</div>
            </div>
            <div className="flex gap-8 text-xs font-medium text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Local Encryption</span>
              <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> Act 102 Compliant</span>
            </div>
          </div>
        </div>
      </footer>
      <Toaster richColors position="bottom-right" />
    </div>
  );
}