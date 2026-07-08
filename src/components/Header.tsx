/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Activity, Sun, Moon, Download, Clipboard, RefreshCw, Check } from 'lucide-react';
import { DiagnosticsReport } from '../types';

interface HeaderProps {
  report: DiagnosticsReport | null;
  isDark: boolean;
  onToggleTheme: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function Header({
  report,
  isDark,
  onToggleTheme,
  onRefresh,
  isRefreshing,
}: HeaderProps) {
  const [time, setTime] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Live UTC/Local clock updating every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString(undefined, { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyReport = async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy report:', err);
    }
  };

  const handleExportJson = () => {
    if (!report) return;
    try {
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.href = url;
      link.download = `pulse-report-${stamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export report:', err);
    }
  };

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-6 mb-6">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-tr from-emerald-600 to-teal-400 text-slate-900 shadow-md shadow-emerald-500/15">
          <span className="text-lg font-bold text-slate-900 select-none">🇵🇰</span>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Pulse Session Diagnostics <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">🇵🇰 Pakistan Edition</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">National ISP Benchmarks, PTA DIRBS Diagnostics & Telemetry Scanner</p>
        </div>
      </div>

      {/* Control Actions & Clock */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Live Clock Indicator */}
        <div className="hidden md:flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded-xl font-mono text-xs text-muted-foreground">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span>SYS TIME:</span>
          <span className="text-foreground font-semibold">{time || '--:--:--'}</span>
        </div>

        {/* Refresh Diagnostics */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-card border border-border hover:bg-muted text-foreground font-medium rounded-xl text-xs transition duration-200 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Scanning...' : 'Rescan'}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 bg-card border border-border hover:bg-muted text-foreground rounded-xl transition duration-200 cursor-pointer"
          title="Toggle Dark/Light Mode"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Copy Report JSON */}
        <button
          onClick={handleCopyReport}
          disabled={!report}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-card border border-border hover:bg-muted text-foreground font-medium rounded-xl text-xs transition duration-200 cursor-pointer disabled:opacity-50"
          title="Copy JSON Diagnostics Report"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-emerald-500">Copied!</span>
            </>
          ) : (
            <>
              <Clipboard className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Copy JSON</span>
            </>
          )}
        </button>

        {/* Export Report JSON */}
        <button
          onClick={handleExportJson}
          disabled={!report}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-500 dark:bg-teal-600 hover:bg-teal-600 dark:hover:bg-teal-500 text-slate-900 dark:text-white font-medium rounded-xl text-xs transition duration-200 cursor-pointer shadow-sm shadow-teal-500/10 disabled:opacity-50"
          title="Export JSON Diagnostics Report"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export Report</span>
        </button>
      </div>
    </header>
  );
}
