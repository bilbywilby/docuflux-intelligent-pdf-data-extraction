import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useExtractionStore } from '@/store/useExtractionStore';
import { extractPdfData } from '@/lib/pdf/pdf-service';
import { toast } from 'sonner';
export function PdfUploader() {
  const status = useExtractionStore((s) => s.status);
  const startExtraction = useExtractionStore((s) => s.startExtraction);
  const setProcessingStep = useExtractionStore((s) => s.setProcessingStep);
  const setSuccess = useExtractionStore((s) => s.setSuccess);
  const setError = useExtractionStore((s) => s.setError);
  const isProcessing = status !== 'idle' && status !== 'success' && status !== 'error';
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    startExtraction('reading');
    try {
      const data = await extractPdfData(file, (step) => {
        if (step.includes('OCR')) setProcessingStep('ocr');
        if (step.includes('Analyzing')) setProcessingStep('analyzing');
      });
      await setSuccess({
        ...data,
        id: crypto.randomUUID(),
        fileName: file.name,
        extractedAt: new Date().toISOString(),
        fingerprint: '' // Generated in store
      });
      toast.success('Analysis complete');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to analyze PDF';
      setError(msg);
      toast.error(msg);
    }
  }, [startExtraction, setProcessingStep, setSuccess, setError]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    disabled: isProcessing,
  });
  const getStatusText = () => {
    switch (status) {
      case 'reading': return 'Reading Document...';
      case 'ocr': return 'Running OCR Fallback...';
      case 'analyzing': return 'Auditing CPT Codes...';
      default: return 'Upload PDF Document';
    }
  };
  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative group cursor-pointer border-2 border-dashed rounded-2xl p-12 transition-all duration-300 ease-in-out text-center",
        isDragActive ? "border-primary bg-primary/5 scale-[1.02]" : "border-slate-200 hover:border-primary/50 hover:bg-slate-50",
        isProcessing && "cursor-not-allowed opacity-80"
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        <div className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center transition-colors shadow-sm",
          isDragActive || isProcessing ? "bg-primary text-white" : "bg-white border text-slate-500 group-hover:bg-primary group-hover:text-white"
        )}>
          {isProcessing ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : (
            <Upload className="w-8 h-8" />
          )}
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-slate-900 flex items-center justify-center gap-2">
            {getStatusText()}
            {isProcessing && <Sparkles className="w-4 h-4 animate-pulse text-yellow-500" />}
          </h3>
          <p className="text-slate-500 max-w-xs mx-auto text-sm">
            Drag and drop a medical bill or EOB. Processing is done 100% in your browser.
          </p>
        </div>
      </div>
    </div>
  );
}