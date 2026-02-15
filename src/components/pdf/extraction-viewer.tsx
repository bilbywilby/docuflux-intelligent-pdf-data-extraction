import React, { useState } from 'react';
import { useExtractionStore } from '@/store/useExtractionStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileCode, FileText, RotateCcw, Copy, Check, Download, AlertTriangle, Scale } from 'lucide-react';
import { toast } from 'sonner';
export function ExtractionViewer() {
  const result = useExtractionStore((s) => s.result);
  const reset = useExtractionStore((s) => s.reset);
  const [copied, setCopied] = useState(false);
  if (!result) return null;
  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(result.costAnalysis, null, 2));
    setCopied(true);
    toast.success('Analysis JSON copied');
    setTimeout(() => setCopied(false), 2000);
  };
  const exportToCSV = () => {
    if (!result.costAnalysis.length) return toast.error('No cost data to export');
    const headers = ['CPT', 'Label', 'Charged', 'Benchmark', 'Variance%', 'Status', 'Legal Citation'];
    const rows = result.costAnalysis.map(c => [
      c.cpt, c.label, c.charged, c.benchmark, `${c.variance}%`, c.status, c.citation?.act || ''
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_${result.fileName.replace(/\s+/g, '_')}.csv`;
    a.click();
  };
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{result.fileName}</h2>
          <p className="text-sm text-slate-500">PA Medical Billing Audit • {new Date(result.extractedAt).toLocaleString()}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportToCSV} className="gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={reset} className="gap-2">
            <RotateCcw className="w-4 h-4" /> New Audit
          </Button>
        </div>
      </div>
      {result.costAnalysis.length > 0 && (
        <Card className="overflow-hidden border-blue-100 dark:border-blue-900">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border-b border-blue-100 dark:border-blue-900 flex items-center gap-2 font-semibold text-blue-900 dark:text-blue-100">
            <Scale className="w-5 h-5" /> PA Medical Cost Analysis (Act 102)
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CPT Code</TableHead>
                <TableHead>Service Label</TableHead>
                <TableHead className="text-right">Charged</TableHead>
                <TableHead className="text-right">PA Benchmark</TableHead>
                <TableHead className="text-right">Variance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.costAnalysis.map((row, idx) => (
                <TableRow key={idx} className={row.status === 'Severe' ? "bg-red-50/50 dark:bg-red-950/10" : ""}>
                  <TableCell className="font-mono font-medium">{row.cpt}</TableCell>
                  <TableCell className="text-sm">{row.label}</TableCell>
                  <TableCell className="text-right font-medium">${row.charged.toFixed(2)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">${row.benchmark.toFixed(2)}</TableCell>
                  <TableCell className={`text-right font-bold ${row.variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {row.variance > 0 ? '+' : ''}{row.variance}%
                  </TableCell>
                  <TableCell>
                    <Badge variant={row.status === 'Severe' ? 'destructive' : row.status === 'Overpriced' ? 'outline' : 'secondary'}>
                      {row.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {result.costAnalysis.some(r => r.status === 'Severe') && (
            <div className="p-6 bg-red-50 dark:bg-red-950/20 border-t border-red-100 dark:border-red-900 space-y-4">
              <div className="flex items-start gap-3 text-red-900 dark:text-red-100">
                <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold">Severe Overcharge Detected</h4>
                  <p className="text-sm opacity-90">Charges exceed PA benchmarks by over 50%. Under <strong>PA Act 102 §1421</strong>, this may constitute an unfair billing practice.</p>
                </div>
              </div>
              {result.costAnalysis.map((r, i) => r.financialNote && (
                <div key={i} className="text-xs bg-white/50 dark:bg-black/20 p-3 rounded-md border border-red-200 dark:border-red-800">
                  <strong>Notice:</strong> {r.financialNote}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col h-[500px] overflow-hidden">
          <div className="p-4 border-b bg-slate-50/50 flex items-center gap-2 font-medium">
            <FileText className="w-4 h-4 text-primary" />
            Redacted Document Text
          </div>
          <div className="flex-1 overflow-auto p-6 font-mono text-xs leading-relaxed whitespace-pre-wrap bg-white dark:bg-slate-950 dark:text-slate-300">
            {result.redactedText}
          </div>
        </Card>
        <Card className="flex flex-col h-[500px] overflow-hidden">
          <div className="p-4 border-b bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium">
              <FileCode className="w-4 h-4 text-blue-600" />
              Audit Data (JSON)
            </div>
            <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 gap-2">
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <div className="flex-1 overflow-auto bg-slate-900 p-6">
            <pre className="text-blue-400 font-mono text-xs">
              {JSON.stringify({
                metadata: result.structuredData,
                analysis: result.costAnalysis,
                timestamp: result.extractedAt
              }, null, 2)}
            </pre>
          </div>
        </Card>
      </div>
    </div>
  );
}