/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Layers, CheckCircle2, AlertCircle, XCircle, Info, RefreshCw } from 'lucide-react';
import { VerificationItem } from '../types';

interface VerificationPipelineCardProps {
  pipeline: VerificationItem[] | null;
  isRefreshing: boolean;
}

export default function VerificationPipelineCard({
  pipeline,
  isRefreshing,
}: VerificationPipelineCardProps) {
  if (!pipeline) {
    return (
      <div className="flex flex-col h-[420px] justify-between bg-card border border-border rounded-2xl animate-pulse p-6">
        <div className="h-6 w-40 bg-muted/40 rounded mb-4" />
        <div className="space-y-4 my-auto">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="h-4 w-32 bg-muted/40 rounded" />
              <div className="h-4 w-12 bg-muted/40 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: VerificationItem['status']) => {
    switch (status) {
      case 'pass':
        return (
          <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" />
            PASS
          </span>
        );
      case 'warn':
        return (
          <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <AlertCircle className="h-3 w-3" />
            WARN
          </span>
        );
      case 'fail':
        return (
          <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <XCircle className="h-3 w-3" />
            FAIL
          </span>
        );
      case 'checking':
      default:
        return (
          <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase font-mono px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-500 border border-slate-500/20 animate-pulse">
            <RefreshCw className="h-3 w-3 animate-spin" />
            SCANNING
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col justify-between bg-card border border-border rounded-2xl p-6 shadow-xs relative overflow-hidden h-full">
      <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Layers className="h-4 w-4 text-teal-500" />
          Verification Pipeline
        </h3>
        <span className="text-xs font-mono text-muted-foreground">TASKS: 8/8 READY</span>
      </div>

      {/* Checklist stream */}
      <div className="flex flex-col gap-3 my-auto max-h-[310px] overflow-y-auto pr-1">
        {pipeline.map((item) => (
          <div
            key={item.id}
            className="group flex items-center justify-between p-2.5 rounded-xl border border-border/40 hover:border-border/100 hover:bg-muted/30 transition duration-150"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-foreground tracking-tight group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-colors">
                {item.name}
              </span>
              <span className="text-[10px] text-muted-foreground/80 line-clamp-1 max-w-[200px] md:max-w-[280px]">
                {item.details}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(isRefreshing ? 'checking' : item.status)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
