import React, { useState } from 'react';
import { useExtractionStore } from '@/store/useExtractionStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileText, Trash2, ExternalLink, Calendar, Search, Cloud, HardDrive, ShieldCheck, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api-client';
import { DocumentVersion } from '@shared/types';
import { toast } from 'sonner';
export function ExtractionHistory() {
  const history = useExtractionStore(s => s.history);
  const cloudHistory = useExtractionStore(s => s.cloudHistory);
  const deleteHistoryItem = useExtractionStore(s => s.deleteHistoryItem);
  const setResult = useExtractionStore(s => s.setResult);
  const [loadingCloudId, setLoadingCloudId] = useState<string | null>(null);
  const handleViewCloudDoc = async (docId: string) => {
    setLoadingCloudId(docId);
    try {
      const versions = await api<DocumentVersion[]>(`/api/documents/${docId}/versions`);
      if (versions.length > 0) {
        setResult(versions[0].result);
        toast.success('Retrieved audit from Cloud Vault');
      } else {
        toast.error('No versions found for this document');
      }
    } catch (err) {
      toast.error('Failed to retrieve cloud document');
    } finally {
      setLoadingCloudId(null);
    }
  };
  if (history.length === 0 && cloudHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Search className="w-8 h-8 text-slate-400" />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-lg">Empty Audit History</h3>
          <p className="text-sm text-muted-foreground">Analyses saved locally or in the Cloud Vault will appear here.</p>
        </div>
      </div>
    );
  }
  return (
    <Tabs defaultValue="local" className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <TabsList className="bg-slate-200/50 dark:bg-slate-800/50">
          <TabsTrigger value="local" className="gap-2">
            <HardDrive className="w-4 h-4" /> Local Workspace
          </TabsTrigger>
          <TabsTrigger value="cloud" className="gap-2">
            <Cloud className="w-4 h-4" /> Cloud Vault
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="local" className="m-0 focus-visible:outline-none">
        <ScrollArea className="h-[500px] pr-4">
          {history.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">No local records.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map((item) => (
                <Card key={item.id} className="p-4 hover:border-primary/50 transition-colors group relative">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-slate-500" />
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteHistoryItem(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900 dark:text-white truncate">{item.fileName}</h4>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.extractedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Button variant="secondary" className="w-full mt-4 gap-2 text-sm" onClick={() => setResult(item)}>
                    <ExternalLink className="w-4 h-4" /> View Local
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </TabsContent>
      <TabsContent value="cloud" className="m-0 focus-visible:outline-none">
        <ScrollArea className="h-[500px] pr-4">
          {cloudHistory.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <Cloud className="w-12 h-12 mx-auto text-slate-200" />
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                No documents in the cloud vault. Enable "Cloud Sync" during analysis to persist audits across devices.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cloudHistory.map((doc) => (
                <Card key={doc.id} className="p-4 hover:border-blue-500/50 transition-colors relative">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                      <Cloud className="w-5 h-5 text-blue-600" />
                    </div>
                    <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-100 bg-emerald-50">Secure</Badge>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900 dark:text-white truncate">{doc.fileName}</h4>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {new Date(doc.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Button 
                    variant="secondary" 
                    className="w-full mt-4 gap-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-100" 
                    onClick={() => handleViewCloudDoc(doc.id)}
                    disabled={loadingCloudId === doc.id}
                  >
                    {loadingCloudId === doc.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                    Retrieve from Vault
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
}