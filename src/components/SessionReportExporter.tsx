/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DiagnosticsReport } from '../types';
import { FileDown, Code, Clipboard, Share2, Printer, Check, QrCode, AlertCircle, Sparkles } from 'lucide-react';

interface SessionReportExporterProps {
  report: DiagnosticsReport | null;
}

export default function SessionReportExporter({ report }: SessionReportExporterProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const [showQr, setShowQr] = useState<boolean>(false);

  const handleCopyLink = () => {
    const fakeLink = `${window.location.origin}/share/report-${Date.now().toString().slice(-6)}`;
    navigator.clipboard.writeText(fakeLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJson = () => {
    if (!report) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `pulse-diagnostic-report-${Date.now()}.json`);
    dlAnchorElem.click();
  };

  const downloadCsv = () => {
    if (!report) return;
    let csvRows = [];
    csvRows.push("Metric,Value,Status");
    
    csvRows.push(`Overall Score,${report.overallScore}/100,N/A`);
    csvRows.push(`Platform,${report.system?.platform || 'Unknown'},N/A`);
    csvRows.push(`CPU Cores,${report.system?.cpuCores || 'Unknown'},N/A`);
    csvRows.push(`Memory,${report.system?.memoryGb || 'Unknown'} GB,N/A`);
    csvRows.push(`IP Address,${report.network?.ip || 'Unknown'},N/A`);
    csvRows.push(`ASN,${report.network?.asn || 'Unknown'},N/A`);
    csvRows.push(`Latency,${report.network?.latencyMs || 'Unknown'} ms,N/A`);
    csvRows.push(`Adblock,${report.privacy?.adblockDetected ? 'Detected' : 'Clean'},N/A`);
    csvRows.push(`HTTPS,${report.privacy?.isHttps ? 'Secured' : 'Insecure'},N/A`);

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.replace(/,/g, ";")).join("\n");
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", csvContent);
    dlAnchorElem.setAttribute("download", `pulse-diagnostic-report-${Date.now()}.csv`);
    dlAnchorElem.click();
  };

  const handlePrint = () => {
    window.print();
  };

  if (!report) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 text-center text-xs text-muted-foreground">
        Please complete a diagnostic scan first to unlock reporting exports.
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-2 text-left">
          <FileDown className="h-4 w-4 text-emerald-500" />
          Diagnostic Exporter & PDF Generator
        </h4>
        <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">EXPORT ENGINE</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-auto items-stretch text-left">
        {/* Left columns: Description */}
        <div className="md:col-span-7 flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Session Report details</span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Export your technical environment fingerprints as verified proofs. Send these diagnostic files to your remote HR, Upwork clients, ISP support team, or save them in your workspace archives.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-1">
            {/* Download JSON */}
            <button
              onClick={downloadJson}
              className="p-3 border border-border/60 hover:bg-muted/30 hover:border-emerald-500/50 rounded-xl flex items-center gap-2.5 transition text-xs font-semibold cursor-pointer"
            >
              <Code className="h-4 w-4 text-emerald-400" />
              <div className="text-left">
                <span className="block text-foreground">Download JSON</span>
                <span className="text-[9px] text-muted-foreground font-mono">Structured payload</span>
              </div>
            </button>

            {/* Download CSV */}
            <button
              onClick={downloadCsv}
              className="p-3 border border-border/60 hover:bg-muted/30 hover:border-emerald-500/50 rounded-xl flex items-center gap-2.5 transition text-xs font-semibold cursor-pointer"
            >
              <FileDown className="h-4 w-4 text-teal-400" />
              <div className="text-left">
                <span className="block text-foreground">Download CSV</span>
                <span className="text-[9px] text-muted-foreground font-mono">Flat spreadsheet</span>
              </div>
            </button>

            {/* Print Preview */}
            <button
              onClick={handlePrint}
              className="p-3 border border-border/60 hover:bg-muted/30 hover:border-emerald-500/50 rounded-xl flex items-center gap-2.5 transition text-xs font-semibold cursor-pointer"
            >
              <Printer className="h-4 w-4 text-blue-400" />
              <div className="text-left">
                <span className="block text-foreground">Print / PDF</span>
                <span className="text-[9px] text-muted-foreground font-mono">Standard layout print</span>
              </div>
            </button>

            {/* Share link */}
            <button
              onClick={handleCopyLink}
              className="p-3 border border-border/60 hover:bg-muted/30 hover:border-emerald-500/50 rounded-xl flex items-center gap-2.5 transition text-xs font-semibold cursor-pointer"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4 text-indigo-400" />}
              <div className="text-left">
                <span className="block text-foreground">{copied ? 'Copied Link!' : 'Share Proof'}</span>
                <span className="text-[9px] text-muted-foreground font-mono">Generate URL signature</span>
              </div>
            </button>
          </div>
        </div>

        {/* Right columns: interactive QR Code simulation */}
        <div className="md:col-span-5 flex flex-col justify-between border-l border-border/40 pl-0 md:pl-6 gap-4">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Mobile Verification</span>
            <p className="text-[11px] text-muted-foreground leading-normal">
              Scan this dynamic QR Code to instantly inspect this exact environment scan summary directly from your smartphone.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center bg-muted/20 border border-border/40 p-4 rounded-2xl gap-2 mt-1">
            {showQr ? (
              <div className="bg-white p-2 rounded-xl border border-border/30">
                {/* SVG QR Code Simulation */}
                <svg className="h-28 w-28 text-slate-900" viewBox="0 0 100 100">
                  <path fill="currentColor" d="M0,0h30v30h-30z M10,10v10h10v-10z M70,0h30v30h-30z M80,10v10h10v-10z M0,70h30v30h-30z M10,80v10h10v-10z" />
                  <path fill="currentColor" d="M40,5h10v10h-10z M55,15h10v10h-10z M45,45h10v10h-10z M70,40h10v10h-10z M40,80h10v10h-10z M85,75h10v10h-10z" />
                  <path fill="currentColor" d="M35,35h30v5h-30z M50,55h20v5h-20z M80,60h10v5h-10z M20,50h10v15h-10z M60,85h20v5h-20z" />
                </svg>
              </div>
            ) : (
              <button
                onClick={() => setShowQr(true)}
                className="py-6 px-10 border border-dashed border-border/60 hover:bg-muted/30 rounded-xl flex flex-col items-center gap-2 transition cursor-pointer"
              >
                <QrCode className="h-8 w-8 text-emerald-400" />
                <span className="text-[11px] font-semibold text-foreground">Render QR Code</span>
              </button>
            )}
            <span className="text-[9px] font-mono text-muted-foreground uppercase">ID: REPORT-{Date.now().toString().slice(-6)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
