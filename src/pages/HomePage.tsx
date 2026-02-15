import React from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Toaster } from '@/components/ui/sonner';
import { PdfUploader } from '@/components/pdf/pdf-uploader';
import { ExtractionViewer } from '@/components/pdf/extraction-viewer';
import { useExtractionStore } from '@/store/useExtractionStore';
import { Sparkles, ArrowRight } from 'lucide-react';
export function HomePage() {
  const status = useExtractionStore((s) => s.status);
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      <ThemeToggle />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 md:py-20 lg:py-24">
          {/* Hero Section */}
          <div className="max-w-3xl mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-xs font-semibold mb-6">
              <Sparkles className="w-3 h-3" />
              Next-Gen Extraction Engine
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-black text-slate-900 dark:text-white leading-[1.1] mb-6">
              Turn unstructured <br />
              <span className="text-blue-600">PDFs into Data.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
              DocuFlux analyzes spatial layouts in your documents to reconstruct 
              logical lines and extract business entities with high precision.
            </p>
          </div>
          {/* Core App Logic */}
          <div className="relative z-10">
            {status === 'idle' || status === 'processing' ? (
              <div className="max-w-2xl">
                <PdfUploader />
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {[
                    { title: "Spatial Analysis", desc: "Coordinates-based line grouping" },
                    { title: "Entity Mapping", desc: "Auto-detection of key fields" },
                    { title: "Client Side", desc: "100% in-browser processing" }
                  ].map((feat, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-1">
                        {feat.title} <ArrowRight className="w-3 h-3 text-slate-400" />
                      </div>
                      <p className="text-xs text-slate-500">{feat.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <ExtractionViewer />
            )}
          </div>
        </div>
      </main>
      <footer className="border-t bg-white dark:bg-slate-950/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-slate-500 font-medium">
            DocuFlux <span className="text-slate-300 mx-2">|</span> Built for Intelligent Data Automation
          </div>
          <div className="flex gap-6 text-sm text-slate-400">
            <a href="#" className="hover:text-slate-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Docs</a>
            <a href="#" className="hover:text-slate-600 transition-colors">v1.0.0</a>
          </div>
        </div>
      </footer>
      <Toaster richColors position="bottom-right" />
    </div>
  );
}