/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldAlert, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { DiagnosticsReport } from '../types';

interface HealthIndexCardProps {
  report: DiagnosticsReport | null;
}

export default function HealthIndexCard({ report }: HealthIndexCardProps) {
  if (!report) {
    return (
      <div className="flex flex-col h-[340px] items-center justify-center bg-card border border-border rounded-2xl animate-pulse p-6">
        <div className="h-28 w-28 rounded-full bg-muted/40" />
        <div className="h-4 w-28 bg-muted/40 rounded mt-4" />
        <div className="h-3 w-40 bg-muted/40 rounded mt-2" />
      </div>
    );
  }

  const { overallScore, passCount, warnCount, failCount } = report;

  // Donut values (radius=40, circumference=251.3)
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  // Score color determinations
  let scoreColor = 'text-teal-500';
  let scoreBg = 'stroke-teal-500';
  let gradientId = 'tealGrad';
  let statusText = 'Excellent Environment';
  let statusDesc = 'Your connection and sandbox are highly reliable and privacy-compliant.';

  if (overallScore < 70) {
    scoreColor = 'text-rose-500';
    scoreBg = 'stroke-rose-500';
    gradientId = 'roseGrad';
    statusText = 'Security Vulnerabilities';
    statusDesc = 'Critical items are failing. Take suggested remediation steps.';
  } else if (overallScore < 90) {
    scoreColor = 'text-amber-500';
    scoreBg = 'stroke-amber-500';
    gradientId = 'amberGrad';
    statusText = 'Suboptimal Configuration';
    statusDesc = 'Some warnings found. System is mostly stable but could be optimized.';
  }

  return (
    <div className="flex flex-col justify-between bg-card border border-border rounded-2xl p-6 shadow-xs relative overflow-hidden h-full">
      {/* Background radial glow */}
      <div
        className="absolute -top-16 -left-16 w-48 h-48 rounded-full blur-3xl opacity-30 transition-all duration-500 pointer-events-none"
        style={{
          background: overallScore < 70 
            ? 'var(--accent-rose)' 
            : overallScore < 90 
              ? 'var(--accent-amber)' 
              : 'var(--accent-teal)'
        }}
      />

      <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-5">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-teal-500" />
          Health Index
        </h3>
        <span className="text-xs font-mono text-muted-foreground">ID: SEC-SCORE</span>
      </div>

      {/* Main Scoring donut */}
      <div className="flex flex-col items-center justify-center my-auto py-2">
        <div className="relative flex items-center justify-center h-32 w-32">
          {/* Custom SVG Donut */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle track */}
            <circle
              className="text-muted/10 stroke-muted/20"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="50"
              cy="50"
            />
            {/* Gradient definitions */}
            <defs>
              <linearGradient id="tealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="oklch(0.65 0.18 200)" />
                <stop offset="100%" stopColor="oklch(0.72 0.17 145)" />
              </linearGradient>
              <linearGradient id="amberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="oklch(0.78 0.16 75)" />
                <stop offset="100%" stopColor="oklch(0.85 0.14 85)" />
              </linearGradient>
              <linearGradient id="roseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="oklch(0.65 0.2 15)" />
                <stop offset="100%" stopColor="oklch(0.55 0.18 25)" />
              </linearGradient>
            </defs>
            {/* Main Progress Indicator */}
            <circle
              stroke={`url(#${gradientId})`}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              r={radius}
              cx="50"
              cy="50"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          {/* Centered overall numeric score */}
          <div className="absolute text-center">
            <span className="text-3xl font-bold font-mono tracking-tighter text-foreground">
              {overallScore}
            </span>
            <span className="text-muted-foreground block text-[10px] font-semibold tracking-widest uppercase">
              SCORE
            </span>
          </div>
        </div>

        {/* Verdict Details */}
        <div className="text-center mt-5 px-2">
          <h4 className="text-sm font-bold text-foreground tracking-tight">{statusText}</h4>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-[220px] mx-auto">{statusDesc}</p>
        </div>
      </div>

      {/* Counter badges */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border/60">
        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-teal-500/5 border border-teal-500/10">
          <div className="flex items-center gap-1 text-teal-500">
            <CheckCircle className="h-3 w-3" />
            <span className="text-xs font-bold font-mono">{passCount}</span>
          </div>
          <span className="text-[9px] text-muted-foreground mt-0.5 font-medium">Passed</span>
        </div>

        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-amber-500/5 border border-amber-500/10">
          <div className="flex items-center gap-1 text-amber-500">
            <AlertTriangle className="h-3 w-3" />
            <span className="text-xs font-bold font-mono">{warnCount}</span>
          </div>
          <span className="text-[9px] text-muted-foreground mt-0.5 font-medium">Warn</span>
        </div>

        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-rose-500/5 border border-rose-500/10">
          <div className="flex items-center gap-1 text-rose-500">
            <ShieldAlert className="h-3 w-3" />
            <span className="text-xs font-bold font-mono">{failCount}</span>
          </div>
          <span className="text-[9px] text-muted-foreground mt-0.5 font-medium">Fail</span>
        </div>
      </div>
    </div>
  );
}
