import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useExtractionStore } from '@/store/useExtractionStore';
import { extractPdfData } from '@/lib/pdf/pdf-service';
import { toast } from 'sonner';
export function PdfUploader() {
  const status = useExtractionStore((s) => s.status);
  const startExtraction = useExtractionStore((s) => s.startExtraction);
  const setSuccess = useExtractionStore((s) => s.setSuccess);
  const setError = useExtractionStore((s) => s.setError);
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    startExtraction();
    try {
      const { rawText, structuredData } = await extractPdfData(file);
      setSuccess({
        fileName: file.name,
        rawText,
        structuredData,
        extractedAt: new Date().toISOString(),
      });
      toast.success('Document processed successfully');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to parse PDF';
      setError(msg);
      toast.error(msg);
    }
  }, [startExtraction, setSuccess, setError]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    disabled: status === 'processing',
  });
  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative group cursor-pointer border-2 border-dashed rounded-2xl p-12 transition-all duration-300 ease-in-out text-center",
        isDragActive ? "border-primary bg-primary/5 scale-[1.02]" : "border-slate-200 hover:border-primary/50 hover:bg-slate-50",
        status === 'processing' && "cursor-not-allowed opacity-80"
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        <div className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
          isDragActive ? "bg-primary text-white" : "bg-slate-100 text-slate-500 group-hover:bg-primary group-hover:text-white"
        )}>
          {status === 'processing' ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : (
            <Upload className="w-8 h-8" />
          )}
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-slate-900">
            {status === 'processing' ? 'Analyzing Document...' : 'Upload PDF Document'}
          </h3>
          <p className="text-slate-500 max-w-xs mx-auto text-sm">
            Drag and drop your document here, or click to browse. Supports PDF only.
          </p>
        </div>
        {status !== 'processing' && (
          <div className="flex items-center gap-2 text-2xs font-medium text-slate-400 uppercase tracking-wider mt-2">
            <FileText className="w-3 h-3" />
            Max File Size: 10MB
          </div>
        )}
      </div>
    </div>
  );
}