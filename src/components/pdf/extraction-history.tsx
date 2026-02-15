import React from 'react';
import { useExtractionStore } from '@/store/useExtractionStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Trash2, ExternalLink, Calendar, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
export function ExtractionHistory() {
  const history = useExtractionStore(s => s.history);
  const deleteHistoryItem = useExtractionStore(s => s.deleteHistoryItem);
  const setResult = useExtractionStore(s => s.setResult);
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Search className="w-8 h-8 text-slate-400" />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-lg">No audit history found</h3>
          <p className="text-sm text-muted-foreground">Previous analyses saved locally in your browser will appear here.</p>
        </div>
      </div>
    );
  }
  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {history.map((item) => {
          const severeCount = item.costAnalysis.filter(c => c.status === 'Severe').length;
          return (
            <Card key={item.id} className="p-4 hover:border-primary/50 transition-colors group relative">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-slate-500" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => deleteHistoryItem(item.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white truncate" title={item.fileName}>
                  {item.fileName}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {new Date(item.extractedAt).toLocaleDateString()}
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="outline" className="text-2xs">
                    {item.costAnalysis.length} Codes
                  </Badge>
                  {severeCount > 0 && (
                    <Badge variant="destructive" className="text-2xs">
                      {severeCount} Severe Overcharges
                    </Badge>
                  )}
                </div>
              </div>
              <Button 
                variant="secondary" 
                className="w-full mt-4 gap-2 text-sm"
                onClick={() => setResult(item)}
              >
                <ExternalLink className="w-4 h-4" /> View Audit
              </Button>
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  );
}