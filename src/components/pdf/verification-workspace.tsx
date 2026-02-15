import React, { useState, useEffect } from 'react';
import { useExtractionStore } from '@/store/useExtractionStore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, AlertCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { cn } from '@/lib/utils';
export function VerificationWorkspace() {
  const result = useExtractionStore((s) => s.result);
  const [verifiedIds, setVerifiedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  if (!result || !result.pageImages) return null;
  const toggleVerify = (id: string) => {
    const newSet = new Set(verifiedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setVerifiedIds(newSet);
  };
  const verifyAll = () => {
    setVerifiedIds(new Set(result.costAnalysis.map(i => i.id)));
  };
  return (
    <div className="h-[600px] lg:h-[800px] border rounded-xl overflow-hidden bg-white dark:bg-slate-950 shadow-inner">
      <ResizablePanelGroup direction={isMobile ? "vertical" : "horizontal"}>
        <ResizablePanel defaultSize={50} minSize={isMobile ? 30 : 40}>
          <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-900/50">
            <div className="p-3 border-b bg-white dark:bg-slate-950 flex items-center justify-between z-10">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Document Source</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-[10px] font-mono font-bold">PAGE {currentPage + 1} / {result.pageImages.length}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setCurrentPage(Math.min(result.pageImages!.length - 1, currentPage + 1))}
                  disabled={currentPage === result.pageImages.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <ScrollArea className="flex-1 p-4 bg-slate-200/30 dark:bg-slate-950/30">
              <div className="flex flex-col items-center gap-8 pb-12">
                <img
                  src={result.pageImages[currentPage]}
                  alt={`Document Page ${currentPage + 1}`}
                  className="max-w-full shadow-2xl rounded-sm border bg-white ring-1 ring-slate-900/5"
                />
              </div>
            </ScrollArea>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle className="bg-slate-200 dark:bg-slate-800" />
        <ResizablePanel defaultSize={50} minSize={isMobile ? 30 : 35}>
          <div className="flex flex-col h-full bg-white dark:bg-slate-950">
            <div className="p-3 border-b flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Audit Checkpoints</span>
                <Badge variant="secondary" className="text-[10px] px-2 py-0">
                  {verifiedIds.size} / {result.costAnalysis.length}
                </Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={verifyAll} className="text-[10px] h-7 font-bold uppercase tracking-tight">Verify All</Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-3">
                {result.costAnalysis.map((item) => {
                  const isVerified = verifiedIds.has(item.id);
                  const isSevere = item.status === 'Severe';
                  return (
                    <Card
                      key={item.id}
                      className={cn(
                        "p-4 transition-all duration-300 border-l-4",
                        isVerified 
                          ? "border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10 shadow-sm" 
                          : isSevere 
                            ? "border-l-red-500 bg-red-50/20 dark:bg-red-950/10 animate-pulse" 
                            : "border-l-slate-200 bg-white dark:bg-slate-900"
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5 flex-1 overflow-hidden">
                          <div className="flex items-center gap-2">
                            <span className="bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900 px-1.5 py-0.5 rounded text-[10px] font-black uppercase">CPT {item.cpt}</span>
                            <span className="text-sm font-bold truncate block">{item.label}</span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-black">${item.charged.toFixed(2)}</span>
                            <span className="text-xs text-slate-400 font-medium line-through decoration-slate-300">Avg ${item.benchmark.toFixed(2)}</span>
                          </div>
                          {item.status !== 'Normal' && (
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={isSevere ? 'destructive' : 'secondary'} className="text-[9px] h-4 uppercase tracking-tighter">
                                {item.variance}% Overcharge
                              </Badge>
                              {isSevere && <AlertCircle className="w-3 h-3 text-red-500" />}
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant={isVerified ? "default" : "outline"}
                          className={cn(
                            "h-9 px-4 shrink-0 font-bold text-xs uppercase transition-all",
                            isVerified ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "hover:border-slate-900"
                          )}
                          onClick={() => toggleVerify(item.id)}
                        >
                          {isVerified ? (
                            <><CheckCircle2 className="w-4 h-4 mr-2" /> Verified</>
                          ) : (
                            "Confirm"
                          )}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
                {result.costAnalysis.length === 0 && (
                  <div className="py-24 text-center space-y-3 opacity-40">
                    <Search className="w-10 h-10 mx-auto" />
                    <p className="text-xs font-bold uppercase tracking-widest">No Billing Data Extracted</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}