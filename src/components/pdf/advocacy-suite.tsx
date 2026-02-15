import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Gavel, 
  HandHelping, 
  Scale, 
  Copy, 
  Check, 
  Calculator, 
  FileText,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { useExtractionStore } from '@/store/useExtractionStore';
import { checkFapEligibility, generateDisputeLetter } from '@/lib/pdf/legal-logic';
import { toast } from 'sonner';
export function AdvocacySuite() {
  const result = useExtractionStore(s => s.result);
  const [householdSize, setHouseholdSize] = useState('1');
  const [annualIncome, setAnnualIncome] = useState('');
  const [copied, setCopied] = useState(false);
  if (!result) return null;
  const eligibility = annualIncome ? checkFapEligibility(Number(householdSize), Number(annualIncome)) : null;
  const letter = generateDisputeLetter(result);
  const handleCopyLetter = () => {
    navigator.clipboard.writeText(letter);
    setCopied(true);
    toast.success('Dispute letter copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Financial Assistance Calculator */}
      <Card className="p-6 space-y-6 flex flex-col border-blue-100 dark:border-blue-900 bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-950 dark:to-blue-950/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold">FAP Eligibility Calculator</h3>
            <p className="text-xs text-muted-foreground">PA Act 102 §1423 Mandatory Assistance Check</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hsize" className="text-xs font-bold uppercase tracking-wider">Household Size</Label>
            <Input 
              id="hsize" 
              type="number" 
              min="1" 
              value={householdSize} 
              onChange={(e) => setHouseholdSize(e.target.value)}
              className="bg-white dark:bg-slate-900"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="income" className="text-xs font-bold uppercase tracking-wider">Annual Income ($)</Label>
            <Input 
              id="income" 
              type="number" 
              placeholder="e.g. 45000" 
              value={annualIncome} 
              onChange={(e) => setAnnualIncome(e.target.value)}
              className="bg-white dark:bg-slate-900"
            />
          </div>
        </div>
        {eligibility && (
          <div className={`p-4 rounded-xl border-2 animate-in zoom-in-95 duration-300 ${
            eligibility.isEligible 
              ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900" 
              : "bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800"
          }`}>
            <div className="flex items-center justify-between mb-2">
              <Badge variant={eligibility.isEligible ? "default" : "secondary"} className={eligibility.isEligible ? "bg-emerald-600" : ""}>
                {eligibility.fplPercentage}% of Poverty Level
              </Badge>
              {eligibility.isEligible && <ShieldCheck className="w-5 h-5 text-emerald-600" />}
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              {eligibility.isEligible ? "Mandatory Assistance Qualified" : "Standard Review"}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {eligibility.recommendation}
            </p>
            <div className="mt-3 pt-3 border-t border-current/10 text-[10px] font-mono opacity-60">
              Source: {eligibility.citation}
            </div>
          </div>
        )}
        <div className="flex-1" />
        <div className="text-[10px] text-muted-foreground flex items-start gap-2 italic">
          <AlertCircle className="w-3 h-3 shrink-0" />
          Calculations based on 2024 HHS Poverty Guidelines for Pennsylvania.
        </div>
      </Card>
      {/* Dispute Letter Generator */}
      <Card className="p-6 flex flex-col border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-white">
              <Gavel className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Dispute Letter</h3>
              <p className="text-xs text-muted-foreground">Automated Advocacy Draft</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleCopyLetter} className="gap-2">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy Text'}
          </Button>
        </div>
        <ScrollArea className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-lg border p-4">
          <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300">
            {letter}
          </pre>
        </ScrollArea>
        <p className="mt-4 text-[10px] text-muted-foreground text-center">
          Review and edit this letter before sending. It is not legal advice.
        </p>
      </Card>
    </div>
  );
}