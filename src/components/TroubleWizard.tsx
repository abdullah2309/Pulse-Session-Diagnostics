/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HelpCircle, ChevronRight, ChevronDown, CheckSquare, Square, CheckCircle2, ShieldAlert } from 'lucide-react';
import { DiagnosticsReport } from '../types';

interface TroubleWizardProps {
  report: DiagnosticsReport | null;
}

interface GuideItem {
  id: string;
  title: string;
  cause: string;
  severity: 'fail' | 'warn' | 'info';
  steps: string[];
}

export default function TroubleWizard({ report }: TroubleWizardProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  if (!report) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 shadow-xs animate-pulse">
        <div className="h-6 w-1/4 bg-muted/40 rounded mb-4" />
        <div className="h-32 bg-muted/40 rounded-xl" />
      </div>
    );
  }

  // Define static resolution guide structures
  const guides: GuideItem[] = [
    {
      id: 'webrtc-leak',
      title: 'Fix WebRTC Private IP Exposure',
      cause: 'WebRTC allows audio/video sharing, but often leaks local internal IP addresses to websites by default.',
      severity: 'warn',
      steps: [
        'Install a privacy extension like "uBlock Origin" or "WebRTC Control" in your browser store.',
        'If using uBlock, open settings and check "Prevent WebRTC from leaking local IP addresses".',
        'Alternatively, turn on a premium VPN with dedicated WebRTC Leak Shield settings.',
        'Refresh this dashboard to re-audit and verify the leak is plugged.',
      ],
    },
    {
      id: 'dnt-off',
      title: 'Enable Do Not Track (DNT) / GPC Security',
      cause: 'Your browser is currently not sending privacy signaling headers to block third-party analytics trackers.',
      severity: 'warn',
      steps: [
        'Open your Browser Settings (e.g. Chrome Settings -> Privacy & Security).',
        'Select "Third-Party Cookies" or "Tracking Protection".',
        'Toggle ON "Send a \'Do Not Track\' request with your browsing traffic" or install "Global Privacy Control (GPC)".',
        'Reload the Pulse scanner to verify the privacy header is transmitting.',
      ],
    },
    {
      id: 'cookies-blocked',
      title: 'Enable Persistent Cookies Vault',
      cause: 'Cookies are blocked. Standard sessions, authentication logins, and preferences cannot be retained.',
      severity: 'fail',
      steps: [
        'Navigate to Settings -> Privacy and Security -> Cookies and Other Site Data.',
        'Choose "Allow all cookies" or "Block third-party cookies in Incognito only" (Do not block all).',
        'If using Safari, go to Preferences -> Privacy and uncheck "Block all cookies".',
        'Refresh page to check if cookie writing capabilities are reinstated.',
      ],
    },
    {
      id: 'low-memory',
      title: 'Resolve Low Virtual RAM Warnings',
      cause: 'Available allocated browser memory is 4GB or less, which may cause tab crashes during intensive actions.',
      severity: 'warn',
      steps: [
        'Close inactive browser tabs currently running in the background.',
        'Stop heavy software applications like gaming engines, video editors, or docker container local builds.',
        'Clear browser cache & cookies to purge residual high-memory storage bloat.',
        'Restart the browser application to allow memory garbage collection to fire.',
      ],
    },
    {
      id: 'sw-unsupported',
      title: 'Restore Service Worker Capabilities',
      cause: 'Service workers are disabled, preventing offline support, push alerts, and network caching optimizations.',
      severity: 'warn',
      steps: [
        'Confirm you are not browsing in an extremely restricted Private or Incognito tab where workers are blocked.',
        'Ensure site cookies and storage permissions are enabled, as service workers require storage sandbox access.',
        'Verify your browser is fully updated to the latest standard version.',
      ],
    },
    {
      id: 'https-inactive',
      title: 'Upgrade Connection to Secure HTTPS',
      cause: 'You are using standard HTTP. Passwords, session tokens, and input forms can be intercepted by hackers.',
      severity: 'fail',
      steps: [
        'Manually replace the "http://" prefix with "https://" in your browser search address bar.',
        'Enable "Always use secure connections" in your browser settings to automatically force HTTPS routing.',
        'Install the "HTTPS Everywhere" extension to ensure automatic secure handshakes globally.',
      ],
    }
  ];

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const toggleStep = (stepKey: string) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepKey]: !prev[stepKey],
    }));
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xs h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-teal-500" />
          Interactive Remediation Wizard
        </h4>
        <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">GUIDED FIXER</span>
      </div>

      <div className="flex flex-col gap-4 my-auto">
        <div className="bg-muted/10 border border-border/50 rounded-xl p-3 flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Privacy & Security Solutions</span>
          <p className="text-xs text-muted-foreground/90 leading-relaxed">
            Expand any guide below to follow interactive troubleshooting checklists to patch and secure your current session environment.
          </p>
        </div>

        {/* Accordion guides list */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {guides.map((guide) => {
            const isExpanded = expandedId === guide.id;
            const completedCount = guide.steps.filter((_, idx) => completedSteps[`${guide.id}-${idx}`]).length;
            const isFullyCompleted = completedCount === guide.steps.length;

            return (
              <div
                key={guide.id}
                className={`border rounded-xl transition duration-150 overflow-hidden ${
                  isFullyCompleted
                    ? 'border-emerald-500/40 bg-emerald-500/5'
                    : isExpanded
                      ? 'border-teal-500/40 bg-muted/10'
                      : 'border-border/60 hover:border-border'
                }`}
              >
                {/* Header Toggle */}
                <button
                  onClick={() => toggleExpand(guide.id)}
                  className="w-full flex items-center justify-between p-3 cursor-pointer outline-hidden select-none"
                >
                  <div className="flex items-center gap-2.5 max-w-4/5 text-left">
                    {guide.severity === 'fail' ? (
                      <ShieldAlert className="h-4 w-4 text-rose-500 flex-shrink-0" />
                    ) : (
                      <HelpCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="text-xs font-bold text-foreground truncate">{guide.title}</span>
                      {completedCount > 0 && (
                        <span className={`text-[9px] font-bold font-mono px-1.5 py-0.2 rounded ${
                          isFullyCompleted ? 'bg-emerald-500/10 text-emerald-500' : 'bg-teal-500/10 text-teal-500'
                        }`}>
                          {completedCount}/{guide.steps.length} STEPS
                        </span>
                      )}
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 border-t border-border/30 animate-in fade-in slide-in-from-top-1 duration-200">
                    <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                      {guide.cause}
                    </p>

                    {/* Checkbox Steps */}
                    <div className="space-y-2 bg-muted/40 p-2.5 rounded-lg border border-border/30">
                      {guide.steps.map((step, idx) => {
                        const stepKey = `${guide.id}-${idx}`;
                        const isChecked = !!completedSteps[stepKey];

                        return (
                          <div
                            key={idx}
                            onClick={() => toggleStep(stepKey)}
                            className="flex gap-2.5 items-start cursor-pointer group select-none"
                          >
                            <div className="mt-0.5 flex-shrink-0">
                              {isChecked ? (
                                <CheckSquare className="h-3.5 w-3.5 text-emerald-500" />
                              ) : (
                                <Square className="h-3.5 w-3.5 text-muted-foreground group-hover:text-teal-500 transition-colors" />
                              )}
                            </div>
                            <span className={`text-xs ${isChecked ? 'text-muted-foreground line-through' : 'text-foreground font-medium'}`}>
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
