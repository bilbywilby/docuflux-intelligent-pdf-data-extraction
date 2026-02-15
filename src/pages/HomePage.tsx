import React, { useEffect } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Toaster } from '@/components/ui/sonner';
import { PdfUploader } from '@/components/pdf/pdf-uploader';
import { ExtractionViewer } from '@/components/pdf/extraction-viewer';
import { ExtractionHistory } from '@/components/pdf/extraction-history';
import { useExtractionStore } from '@/store/useExtractionStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, ShieldCheck, History, PlusCircle } from 'lucide-react';
export function HomePage() {
  const status = useExtractionStore((s) => s.status);
  const result = useExtractionStore((s) => s.result);
  const loadHistory = useExtractionStore((s) => s.loadHistory);
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      <ThemeToggle />
      {/* Privacy Banner */}
      <div className="bg-blue-600 text-white py-2 px-4 text-center text-sm font-medium flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4" />
        All processing is local. PHI is redacted in-browser. No data is transmitted to our servers.
      </div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 md:py-16">
          <div className="max-w-3xl mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800 text-xs font-semibold mb-6">
              <Sparkles className="w-3 h-3" />
              PA Medical Billing Audit Engine
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-black text-slate-900 dark:text-white leading-[1.1] mb-6">
              Audit Medical Bills <br />
              <span className="text-blue-600">Against PA Standards.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
              Verify CPT costs, detect Act 102 violations, and identify financial assistance 
              eligibility directly in your browser.
            </p>
          </div>
          <Tabs defaultValue="new" className="space-y-8">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="new" className="gap-2">
                <PlusCircle className="w-4 h-4" /> New Analysis
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <History className="w-4 h-4" /> Local History
              </TabsTrigger>
            </TabsList>
            <TabsContent value="new" className="space-y-8">
              {!result && (
                <div className="max-w-2xl">
                  <PdfUploader />
                </div>
              )}
              {result && <ExtractionViewer />}
            </TabsContent>
            <TabsContent value="history">
              <ExtractionHistory />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <footer className="border-t bg-white dark:bg-slate-950/50 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-slate-500 font-medium">
            DocuFlux Medical <span className="text-slate-300 mx-2">|</span> Act 102 Compliance Engine
          </div>
          <div className="flex gap-6 text-sm text-slate-400">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> HIPAA-Safe</span>
            <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-600 transition-colors">v1.1.0</a>
          </div>
        </div>
      </footer>
      <Toaster richColors position="bottom-right" />
    </div>
  );
}