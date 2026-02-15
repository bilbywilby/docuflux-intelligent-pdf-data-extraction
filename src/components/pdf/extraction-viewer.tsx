import React from 'react';
import { useExtractionStore } from '@/store/useExtractionStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileCode, FileText, RotateCcw, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
export function ExtractionViewer() {
  const result = useExtractionStore((s) => s.result);
  const reset = useExtractionStore((s) => s.reset);
  const [copied, setCopied] = useState(false);
  if (!result) return null;
  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(result.structuredData, null, 2));
    setCopied(true);
    toast.success('JSON copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{result.fileName}</h2>
          <p className="text-sm text-slate-500">Extracted on {new Date(result.extractedAt).toLocaleString()}</p>
        </div>
        <Button variant="outline" onClick={reset} className="shrink-0 gap-2">
          <RotateCcw className="w-4 h-4" />
          Upload Another
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col h-[600px] overflow-hidden">
          <div className="p-4 border-b bg-slate-50/50 flex items-center gap-2 font-medium">
            <FileText className="w-4 h-4 text-primary" />
            Document Reconstruction
          </div>
          <div className="flex-1 overflow-auto p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap bg-white">
            {result.rawText}
          </div>
        </Card>
        <Card className="flex flex-col h-[600px] overflow-hidden">
          <div className="p-4 border-b bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium">
              <FileCode className="w-4 h-4 text-blue-600" />
              Structured Output (JSON)
            </div>
            <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 gap-2">
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <div className="flex-1 overflow-auto bg-slate-900 p-6">
            <pre className="text-blue-400 font-mono text-sm">
              {JSON.stringify(result.structuredData, null, 2)}
            </pre>
          </div>
        </Card>
      </div>
    </div>
  );
}