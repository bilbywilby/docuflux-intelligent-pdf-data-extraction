import React, { useEffect } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Toaster } from '@/components/ui/sonner';
import { PdfUploader } from '@/components/pdf/pdf-uploader';
import { ExtractionViewer } from '@/components/pdf/extraction-viewer';
import { ExtractionHistory } from '@/components/pdf/extraction-history';
import { useExtractionStore } from '@/store/useExtractionStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, ShieldCheck, History, PlusCircle, AlertCircle, Lock, Zap, FileSearch } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
export function HomePage() {
  const status = useExtractionStore((s) => s.status);
  const result = useExtractionStore((s) => s.result);
  const loadHistory = useExtractionStore((s) => s.loadHistory);
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-blue-100 selection:text-blue-900">
      <ThemeToggle />
      <div className="bg-slate-900 text-white py-2.5 px-4 text-center text-xs font-medium flex items-center justify-center gap-2 border-b border-white/10 relative z-50">
        <Lock className="w-3.5 h-3.5 text-emerald-400" />
        Zero-Knowledge Analysis: Your medical documents never leave this device.
      </div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-12 lg:py-16">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div 
                key="landing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="space-y-12"
              >
                <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800 text-[10px] uppercase tracking-widest font-bold mb-6">
                    <Zap className="w-3 h-3 fill-current" />
                    DocuFlux Professional Audit
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-7xl font-display font-black text-slate-900 dark:text-white leading-[1.05] mb-6">
                    Expose Hidden <br />
                    <span className="text-blue-600">Medical Overcharges.</span>
                  </h1>
                  <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                    Identify violations of PA Act 102 and verify hospital billing against fair market benchmarks using our local-first AI engine.
                  </p>
                </div>
                <Tabs defaultValue="new" className="space-y-8">
                  <TabsList className="bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-lg">
                    <TabsTrigger value="new" className="gap-2 px-6" disabled={isProcessing}>
                      <PlusCircle className="w-4 h-4" /> Start Audit
                    </TabsTrigger>
                    <TabsTrigger value="history" className="gap-2 px-6" disabled={isProcessing}>
                      <History className="w-4 h-4" /> My Records
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="new" className="space-y-12 focus-visible:outline-none">
                    <div className="max-w-2xl">
                      <PdfUploader />
                      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                          { icon: Gavel, title: "Act 102 Enforcement", desc: "Checks for compliance with PA medical pricing laws." },
                          { icon: FileSearch, title: "CPT Validation", desc: "Cross-references charges with national benchmarks." },
                          { icon: ShieldCheck, title: "Auto-Redaction", desc: "PHI is scrubbed automatically before any view." }
                        ].map((feature, i) => (
                          <div key={i} className="space-y-3">
                            <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-900 border shadow-sm flex items-center justify-center">
                              <feature.icon className="w-5 h-5 text-blue-600" />
                            </div>
                            <h4 className="font-bold text-sm">{feature.title}</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="history" className="focus-visible:outline-none">
                    <ExtractionHistory />
                  </TabsContent>
                </Tabs>
              </motion.div>
            ) : (
              <motion.div
                key="viewer"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <ExtractionViewer />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <footer className="border-t bg-white dark:bg-slate-950/50 py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-blue-500/20">D</div>
                <div className="text-lg font-black text-slate-900 dark:text-white tracking-tight">DocuFlux Medical</div>
              </div>
              <p className="text-sm text-slate-500 max-w-xs">
                Professional-grade medical billing audit platform. Local-first, private-by-design.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> HIPAA Compliant Local Pipeline</span>
              <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-yellow-500" /> PA Act 102 Integrated</span>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t text-center">
            <p className="text-xs text-slate-400">© 2024 DocuFlux. No medical advice intended. For auditing and informational purposes only.</p>
          </div>
        </div>
      </footer>
      <Toaster richColors position="bottom-right" />
    </div>
  );
}