import React, { useState } from 'react';
import { useExtractionStore } from '@/store/useExtractionStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileCode, FileText, RotateCcw, Copy, Check, Download, AlertTriangle, Scale, Table as TableIcon } from 'lucide-react';
import { toast } from 'sonner';
export function ExtractionViewer() {
  const result = useExtractionStore((s) => s.result);
  const reset = useExtractionStore((s) => s.reset);
  const [copied, setCopied] = useState(false);
  if (!result) return null;
  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    toast.success('Audit data copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };
  const exportToCSV = () => {
    const headers = ['Type', 'Label', 'Value', 'Benchmark', 'Variance', 'Status'];
    const rows = result.costAnalysis.map(c => [
      'CPT', c.label, c.charged, c.benchmark, `${c.variance}%`, c.status
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_${result.fileName.replace(/\s+/g, '_')}.csv`;
    a.click();
  };
  const isLowConfidence = result.confidence.score < 0.7;
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{result.fileName}</h2>
            {isLowConfidence && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="w-3 h-3" /> Review Required
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-500">
            {result.pageCount} Pages • {result.confidence.method === 'ocr' ? 'OCR Extraction' : 'Native Extraction'}
          </p>
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
      {isLowConfidence && (
        <Card className="p-4 bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="text-sm text-amber-800 dark:text-amber-200">
            <p className="font-semibold">Low Confidence Score ({Math.round(result.confidence.score * 100)}%)</p>
            <p>This document was processed via OCR or has complex formatting. Please manually verify the extracted amounts against the original document.</p>
          </div>
        </Card>
      )}
      <Tabs defaultValue="analysis" className="space-y-6">
        <TabsList>
          <TabsTrigger value="analysis" className="gap-2"><Scale className="w-4 h-4" /> Cost Analysis</TabsTrigger>
          <TabsTrigger value="tables" className="gap-2"><TableIcon className="w-4 h-4" /> Detected Tables</TabsTrigger>
          <TabsTrigger value="text" className="gap-2"><FileText className="w-4 h-4" /> Raw Data</TabsTrigger>
        </TabsList>
        <TabsContent value="analysis">
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>CPT Code</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead className="text-right">Charged</TableHead>
                  <TableHead className="text-right">Benchmark</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.costAnalysis.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-mono">{row.cpt}</TableCell>
                    <TableCell className="text-sm">{row.label}</TableCell>
                    <TableCell className="text-right">${row.charged.toFixed(2)}</TableCell>
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
          </Card>
        </TabsContent>
        <TabsContent value="tables">
          <div className="space-y-4">
            {result.tables.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">No clear tables detected in this document.</div>
            ) : (
              result.tables.map((table, i) => (
                <Card key={i} className="overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-900">
                      <TableRow>
                        {table.headers.map((h, j) => <TableHead key={j}>{h}</TableHead>)}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {table.rows.map((row, j) => (
                        <TableRow key={j}>
                          {row.map((cell, k) => <TableCell key={k}>{cell}</TableCell>)}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        <TabsContent value="text">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="flex flex-col h-[500px] overflow-hidden">
              <div className="p-4 border-b bg-slate-50/50 flex items-center gap-2 font-medium">
                <FileText className="w-4 h-4 text-primary" /> Redacted Text
              </div>
              <div className="flex-1 overflow-auto p-6 font-mono text-xs whitespace-pre-wrap bg-white dark:bg-slate-950">
                {result.redactedText}
              </div>
            </Card>
            <Card className="flex flex-col h-[500px] overflow-hidden">
              <div className="p-4 border-b bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2 font-medium">
                  <FileCode className="w-4 h-4 text-blue-600" /> JSON Export
                </div>
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
              <div className="flex-1 overflow-auto bg-slate-900 p-6">
                <pre className="text-blue-400 font-mono text-xs">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}