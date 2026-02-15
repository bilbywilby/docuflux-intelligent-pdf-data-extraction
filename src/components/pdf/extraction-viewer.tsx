import React, { useState } from 'react';
import { useExtractionStore } from '@/store/useExtractionStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  FileCode,
  FileText,
  RotateCcw,
  Copy,
  Check,
  Download,
  AlertTriangle,
  Scale,
  Table as TableIcon,
  ShieldAlert,
  Gavel,
  ExternalLink,
  Cloud,
  CloudOff,
  RefreshCw,
  History as HistoryIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { VerificationWorkspace } from './verification-workspace';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
export function ExtractionViewer() {
  const result = useExtractionStore((s) => s.result);
  const reset = useExtractionStore((s) => s.reset);
  const isSyncing = useExtractionStore((s) => s.isSyncing);
  const syncToCloud = useExtractionStore((s) => s.syncToCloud);
  const cloudHistory = useExtractionStore((s) => s.cloudHistory);
  const [copied, setCopied] = useState(false);
  if (!result) return null;
  const isSynced = cloudHistory.some(doc => doc.fileName === result.fileName);
  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    toast.success('Audit data copied');
    setTimeout(() => setCopied(false), 2000);
  };
  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_${result.fileName.replace(/\s+/g, '_')}.json`;
    a.click();
  };
  const handleSync = async () => {
    if (result) await syncToCloud(result);
  };
  const severeViolations = result.costAnalysis.filter(c => c.status === 'Severe');
  const isLowConfidence = result.confidence.score < 0.7;
  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{result.fileName}</h2>
            {isLowConfidence && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="w-3 h-3" /> Review Required
              </Badge>
            )}
            {isSynced ? (
              <Badge variant="secondary" className="gap-1 bg-emerald-50 text-emerald-700 border-emerald-100">
                <Cloud className="w-3 h-3" /> Cloud Synced
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1 text-slate-400">
                <CloudOff className="w-3 h-3" /> Local Only
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-500">
            {result.pageCount} Pages • {result.confidence.method === 'ocr' ? 'OCR Extraction' : 'Native Extraction'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isSynced && (
            <Button variant="outline" size="sm" onClick={handleSync} disabled={isSyncing} className="gap-2 text-blue-600 border-blue-100 hover:bg-blue-50">
              {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Cloud className="w-4 h-4" />}
              Sync to Vault
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={downloadJSON} className="gap-2">
            <FileCode className="w-4 h-4" /> JSON
          </Button>
          <Button variant="secondary" size="sm" onClick={reset} className="gap-2">
            <RotateCcw className="w-4 h-4" /> New Audit
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {severeViolations.length > 0 && (
          <Card className="lg:col-span-2 p-6 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900 overflow-hidden relative group">
            <div className="relative z-10 flex flex-col md:flex-row gap-6">
              <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center shrink-0 shadow-lg">
                <Gavel className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-4 flex-1">
                <div>
                  <h3 className="text-lg font-bold text-red-900 dark:text-red-200">Legal Action Recommended: PA Act 102 Violation</h3>
                  <p className="text-sm text-red-800 dark:text-red-300">
                    We detected {severeViolations.length} items with charges exceeding 50% above market benchmarks.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button size="sm" className="bg-red-700 hover:bg-red-800 gap-2 shadow-sm" asChild>
                    <a href="https://www.attorneygeneral.gov/submit-a-complaint/" target="_blank" rel="noopener noreferrer">
                      File AG Complaint <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
        <Card className={cn("p-6 flex flex-col justify-center", severeViolations.length === 0 && "lg:col-span-3")}>
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
               <ShieldAlert className="w-5 h-5 text-blue-600" />
             </div>
             <div>
               <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Security Audit</p>
               <p className="text-sm font-semibold">Cloud Persistence Ready</p>
             </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Data is redacted before viewing. Syncing to the Cloud Vault enables cross-device history using secure Durable Object storage.
          </p>
        </Card>
      </div>
      <Tabs defaultValue="verify" className="space-y-6">
        <TabsList className="bg-slate-100 dark:bg-slate-900">
          <TabsTrigger value="verify" className="gap-2"><Scale className="w-4 h-4" /> Verification Workspace</TabsTrigger>
          <TabsTrigger value="tables" className="gap-2"><TableIcon className="w-4 h-4" /> Tabular Data</TabsTrigger>
          <TabsTrigger value="raw" className="gap-2"><FileText className="w-4 h-4" /> Raw Output</TabsTrigger>
        </TabsList>
        <AnimatePresence mode="wait">
          <motion.div
            key="tab-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <TabsContent value="verify" className="m-0 focus-visible:outline-none">
              <VerificationWorkspace />
            </TabsContent>
            <TabsContent value="tables" className="m-0 focus-visible:outline-none">
              <div className="space-y-4">
                {result.tables.length === 0 ? (
                  <div className="py-20 text-center text-muted-foreground border-2 border-dashed rounded-xl">No tables detected.</div>
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
            <TabsContent value="raw" className="m-0 focus-visible:outline-none">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="flex flex-col h-[500px] overflow-hidden">
                  <div className="p-4 border-b bg-slate-50/50 flex items-center gap-2 font-medium">
                    <FileText className="w-4 h-4 text-primary" /> Redacted Text
                  </div>
                  <ScrollArea className="flex-1 p-6 font-mono text-xs whitespace-pre-wrap">
                    {result.redactedText}
                  </ScrollArea>
                </Card>
                <Card className="flex flex-col h-[500px] overflow-hidden">
                  <div className="p-4 border-b bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-medium">
                      <FileCode className="w-4 h-4 text-blue-600" /> JSON Export
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleCopy}>
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                  <ScrollArea className="flex-1 bg-slate-900 p-6">
                    <pre className="text-blue-400 font-mono text-xs">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </ScrollArea>
                </Card>
              </div>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}