import React, { useState, useEffect } from 'react';
import { useExtractionStore } from '@/store/useExtractionStore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, AlertCircle, Eye, EyeOff, Search } from 'lucide-react';
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
    <div className="h-[600px] lg:h-[800px] border rounded-xl overflow-hidden bg-white dark:bg-slate-950">
      <ResizablePanelGroup direction={isMobile ? "vertical" : "horizontal"}>
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-900/50">
            <div className="p-3 border-b bg-white dark:bg-slate-950 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Document View</span>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-7 w-7" 
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  <Search className="h-3 w-3 rotate-180" />
                </Button>
                <span className="text-xs font-medium">Page {currentPage + 1} / {result.pageImages.length}</span>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-7 w-7" 
                  onClick={() => setCurrentPage(Math.min(result.pageImages!.length - 1, currentPage + 1))}
                  disabled={currentPage === result.pageImages.length - 1}
                >
                  <Search className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="flex flex-col items-center gap-8 pb-12">
                <img 
                  src={result.pageImages[currentPage]} 
                  alt={`Document Page ${currentPage + 1}`} 
                  className="max-w-full shadow-2xl rounded-sm border bg-white"
                />
              </div>
            </ScrollArea>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="flex flex-col h-full bg-white dark:bg-slate-950">
            <div className="p-3 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Extracted Audit Items</span>
                <Badge variant="outline" className="text-2xs">
                  {verifiedIds.size} / {result.costAnalysis.length} Verified
                </Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={verifyAll} className="text-2xs h-7">Verify All</Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-3">
                {result.costAnalysis.map((item) => (
                  <Card 
                    key={item.id} 
                    className={cn(
                      "p-4 transition-all duration-200 border-l-4",
                      verifiedIds.has(item.id) ? "border-l-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10" : "border-l-slate-200",
                      item.status === 'Severe' && !verifiedIds.has(item.id) && "border-l-red-500 animate-pulse"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs font-bold">{item.cpt}</code>
                          <span className="text-sm font-semibold truncate max-w-[200px]">{item.label}</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-black">${item.charged.toFixed(2)}</span>
                          <span className="text-xs text-muted-foreground line-through">${item.benchmark.toFixed(2)} (avg)</span>
                        </div>
                        {item.status !== 'Normal' && (
                          <Badge variant={item.status === 'Severe' ? 'destructive' : 'outline'} className="text-[10px] h-4">
                            {item.variance}% Variance
                          </Badge>
                        )}
                      </div>
                      <Button 
                        size="sm" 
                        variant={verifiedIds.has(item.id) ? "default" : "outline"}
                        className={cn("h-8 gap-2", verifiedIds.has(item.id) ? "bg-emerald-600 hover:bg-emerald-700" : "")}
                        onClick={() => toggleVerify(item.id)}
                      >
                        {verifiedIds.has(item.id) ? (
                          <><CheckCircle2 className="w-3.5 h-3.5" /> Verified</>
                        ) : (
                          <><AlertCircle className="w-3.5 h-3.5" /> Confirm</>
                        )}
                      </Button>
                    </div>
                  </Card>
                ))}
                {result.costAnalysis.length === 0 && (
                  <div className="py-20 text-center space-y-2">
                    <Search className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-sm text-muted-foreground">No billing line items detected for verification.</p>
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