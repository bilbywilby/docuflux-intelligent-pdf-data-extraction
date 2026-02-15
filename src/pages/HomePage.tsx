import React, { useEffect } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Toaster } from '@/components/ui/sonner';
import { PdfUploader } from '@/components/pdf/pdf-uploader';
import { ExtractionViewer } from '@/components/pdf/extraction-viewer';
import { ExtractionHistory } from '@/components/pdf/extraction-history';
import { useExtractionStore } from '@/store/useExtractionStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Sparkles, ShieldCheck, History, PlusCircle, Lock, Zap, FileSearch, Gavel, Cloud } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
export function HomePage() {
  const result = useExtractionStore((s) => s.result);
  const status = useExtractionStore((s) => s.status);
  const loadHistory = useExtractionStore((s) => s.loadHistory);
  const fetchCloudHistory = useExtractionStore((s) => s.fetchCloudHistory);
  const cloudSyncEnabled = useExtractionStore((s) => s.cloudSyncEnabled);
  const toggleCloudSync = useExtractionStore((s) => s.toggleCloudSync);
  useEffect(() => {
    loadHistory();
    fetchCloudHistory();
  }, [loadHistory, fetchCloudHistory]);
  const isProcessing = status !== 'idle' && status !== 'success' && status !== 'error';
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-blue-100 selection:text-blue-900">
      <ThemeToggle />
      <div className="bg-slate-900 text-white py-2.5 px-4 text-center text-xs font-medium flex items-center justify-center gap-2 border-b border-white/10 relative z-50">
        <Lock className="w-3.5 h-3.5 text-emerald-400" />
        Zero-Knowledge local parsing. Optional Cloud Vault for persistence.
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
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                  <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800 text-[10px] uppercase tracking-widest font-bold mb-6">
                      <Zap className="w-3 h-3 fill-current" />
                      DocuFlux Professional Audit
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-display font-black text-slate-900 dark:text-white leading-[1.05] mb-6">
                      Expose Hidden <br />
                      <span className="text-blue-600">Medical Overcharges.</span>
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                      Audit medical bills against fair market benchmarks and identify PA Act 102 violations using our local-first AI engine.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border shadow-sm self-start md:self-auto">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Cloud className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="cloud-sync" className="text-xs font-bold uppercase tracking-wider text-slate-500">Cloud Sync</Label>
                        <Switch id="cloud-sync" checked={cloudSyncEnabled} onCheckedChange={toggleCloudSync} />
                      </div>
                      <p className="text-[10px] text-muted-foreground">Persist results to secure Cloud Vault</p>
                    </div>
                  </div>
                </div>
                <Tabs defaultValue="new" className="space-y-8">
                  <TabsList className="bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-lg">
                    <TabsTrigger value="new" className="gap-2 px-6" disabled={isProcessing}>
                      <PlusCircle className="w-4 h-4" /> Start Audit
                    </TabsTrigger>
                    <TabsTrigger value="history" className="gap-2 px-6" disabled={isProcessing}>
                      <History className="w-4 h-4" /> History
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="new" className="space-y-12 focus-visible:outline-none">
                    <div className="max-w-2xl">
                      <PdfUploader />
                      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                          { icon: Gavel, title: "Act 102 Laws", desc: "Checks compliance with PA medical pricing mandates." },
                          { icon: FileSearch, title: "CPT Benchmarks", desc: "Verifies charges against national fair market rates." },
                          { icon: Cloud, title: "Cloud Vault", desc: "Securely persist audit records across your devices." }
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
                Private-by-design medical audit platform. Powered by Cloudflare Workers and local-first AI.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> HIPAA Compliant Architecture</span>
              <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-yellow-500" /> PA Act 102 Integrated</span>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t text-center">
            <p className="text-xs text-slate-400">© 2024 DocuFlux. Informational only. Not medical or legal advice.</p>
          </div>
        </div>
      </footer>
      <Toaster richColors position="bottom-right" />
    </div>
  );
}