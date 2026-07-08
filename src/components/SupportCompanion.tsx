/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Clipboard, Check, FileText, Send, CheckCircle2, ShieldAlert } from 'lucide-react';
import { DiagnosticsReport } from '../types';

interface SupportCompanionProps {
  report: DiagnosticsReport | null;
}

export default function SupportCompanion({ report }: SupportCompanionProps) {
  const [userNotes, setUserNotes] = useState<string>('');
  const [ticketMarkdown, setTicketMarkdown] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isGenerated, setIsGenerated] = useState<boolean>(false);

  // Auto compile markdown when user notes or report changes
  useEffect(() => {
    if (!report) return;

    const pipelineList = report.verificationPipeline
      .map((p) => `- [${p.status === 'pass' ? 'x' : ' '}] ${p.name}: ${p.status.toUpperCase()} (${p.details})`)
      .join('\n');

    const findingsList = report.findings
      .map((f) => `- **[${f.severity.toUpperCase()}]** ${f.title}: ${f.description} *(Hint: ${f.remediation})*`)
      .join('\n');

    const md = `### 📋 Pulse Diagnostic Session Report
**Timestamp:** ${new Date(report.timestamp).toLocaleString()}
**Overall Health Index:** ${report.overallScore}/100

#### 💬 User-Provided Context:
${userNotes.trim() ? userNotes.trim() : '*No additional context provided by user.*'}

#### 🚨 Critical Findings:
${findingsList || '*No warnings or system flaws identified.*'}

#### ⚙️ Verification Pipeline:
${pipelineList}

#### 🖥️ Environment & System Blueprint:
| Category | Metric | Value |
| :--- | :--- | :--- |
| **System** | Platform Runtime | \`${report.system.platform}\` |
| **System** | CPU logical Cores | \`${report.system.cpuCores}\` |
| **System** | RAM Allocation | \`${report.system.memoryGb} GB\` |
| **System** | Screen Resolution | \`${report.system.screenWidth}x${report.system.screenHeight} px\` |
| **Browser** | Browser Vendor | \`${report.browser.vendor}\` |
| **Browser** | Lang Preference | \`${report.browser.languages.join(', ')}\` |
| **Browser** | Sandbox Storage | \`${report.browser.storageQuotaMb} MB\` |
| **Network** | Geo Location | \`${report.network.city}, ${report.network.country}\` |
| **Network** | Resolved ISP IP | \`${report.network.ip}\` |
| **Network** | Jitter & Ping (RTT) | \`${report.network.latencyMs || 'Offline'} ms\` |
| **Privacy** | HTTPS Secured | \`${report.privacy.isHttps ? 'Yes' : 'No'}\` |
| **Privacy** | WebRTC private leak | \`${report.privacy.webRtcIps.length > 0 ? report.privacy.webRtcIps.join(', ') : 'Protected'}\` |
| **Privacy** | Tracking Filtered | \`${report.privacy.adblockDetected ? 'Yes (Adblock active)' : 'No'}\` |

*Report generated securely entirely client-side via Pulse Session Diagnostics.*`;

    setTicketMarkdown(md);
  }, [userNotes, report]);

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(ticketMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy markdown ticket:', err);
    }
  };

  if (!report) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 shadow-xs animate-pulse">
        <div className="h-6 w-1/3 bg-muted/40 rounded mb-4" />
        <div className="h-32 bg-muted/40 rounded-xl mb-4" />
        <div className="h-10 bg-muted/40 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xs h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
          <FileText className="h-4 w-4 text-teal-500" />
          Support Ticket Companion
        </h4>
        <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">MARKDOWN EXPORTER</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-auto items-stretch">
        {/* Left: Input context notes */}
        <div className="flex flex-col gap-4 justify-between">
          <div className="bg-muted/10 border border-border/50 rounded-xl p-3 flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Real Problem Solver</span>
            <p className="text-xs text-muted-foreground/90 leading-relaxed">
              If an application feature is crashing (e.g. login, calling, uploads), describe the issue below. We'll bake your details directly into an anonymous markdown report to copy-paste for engineers.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">
              Describe the problem you're facing:
            </label>
            <textarea
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder="e.g., I'm unable to join video calls. The application keeps asking for microphone permission even after I granted it..."
              rows={5}
              className="w-full bg-muted/30 border border-border/80 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl px-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-hidden resize-none transition-all"
            />
          </div>

          {/* Indicator stats */}
          <div className="flex gap-2 items-center bg-teal-500/5 border border-teal-500/10 rounded-xl p-3">
            <CheckCircle2 className="h-4 w-4 text-teal-500 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-foreground tracking-tight">Support Package Prepared</span>
              <span className="text-[9px] text-muted-foreground">Markdown tables, findings checklist, and specs loaded.</span>
            </div>
          </div>
        </div>

        {/* Right: Markdown template preview */}
        <div className="flex flex-col gap-3 justify-between">
          <div className="flex flex-col h-full min-h-[180px]">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">GFM Markdown Preview</span>
            <div className="bg-muted/20 border border-border/80 rounded-xl p-3 h-full overflow-y-auto max-h-[220px] scrollbar-thin">
              <pre className="text-[10px] font-mono text-muted-foreground/95 whitespace-pre-wrap leading-relaxed select-all">
                {ticketMarkdown}
              </pre>
            </div>
          </div>

          {/* Action trigger button */}
          <button
            onClick={handleCopyMarkdown}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-500 text-slate-900 dark:text-white font-bold rounded-xl text-xs tracking-wide transition duration-150 cursor-pointer shadow-xs"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-300" />
                <span>COPY SUCCESSFUL! Ready to paste</span>
              </>
            ) : (
              <>
                <Clipboard className="h-4 w-4" />
                <span>COPY SUPPORT REPORT (MARKDOWN)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
