/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Laptop,
  Compass,
  Lock,
  Database,
  Search,
  Clipboard,
  Check,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { DiagnosticsReport, Finding } from '../types';

interface TabbedExplorerProps {
  report: DiagnosticsReport | null;
}

type TabType = 'system' | 'browser' | 'network' | 'privacy' | 'findings';

export default function TabbedExplorer({ report }: TabbedExplorerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('system');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState<string>('');

  if (!report) {
    return (
      <div className="flex flex-col h-[380px] bg-card border border-border rounded-2xl animate-pulse p-6">
        <div className="h-10 w-full bg-muted/40 rounded-xl mb-6" />
        <div className="space-y-4">
          <div className="h-6 w-1/3 bg-muted/40 rounded" />
          <div className="h-6 w-1/2 bg-muted/40 rounded" />
          <div className="h-6 w-2/3 bg-muted/40 rounded" />
        </div>
      </div>
    );
  }

  const handleCopyRow = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch {
      // ignored
    }
  };

  // 1. Gather Rows based on Category
  const getTabRows = () => {
    switch (activeTab) {
      case 'system':
        return [
          { key: 'OS / Runtime Platform', val: String(report.system.platform) },
          { key: 'Logical CPU Cores', val: String(report.system.cpuCores) },
          { key: 'Virtual Device Memory', val: typeof report.system.memoryGb === 'number' ? `${report.system.memoryGb} GB` : String(report.system.memoryGb) },
          { key: 'Screen Width', val: `${report.system.screenWidth} px` },
          { key: 'Screen Height', val: `${report.system.screenHeight} px` },
          { key: 'Device Pixel Ratio (DPR)', val: String(report.system.devicePixelRatio) },
          { key: 'Display Color Depth', val: `${report.system.colorDepth} bit` },
          { key: 'Max Touch Points', val: String(report.system.touchPoints) },
          { key: 'Device Orientation', val: String(report.system.orientation) },
          { key: 'Full User Agent (UA)', val: String(report.system.userAgent) },
        ];
      case 'browser':
        return [
          { key: 'Browser Vendor', val: String(report.browser.vendor) },
          { key: 'Languages Preference', val: report.browser.languages.join(', ') },
          { key: 'Cookies Writing Allowed', val: report.browser.cookiesEnabled ? 'Yes / Enabled' : 'No / Disabled' },
          { key: 'Do Not Track (DNT) Header', val: report.browser.doNotTrack === '1' ? 'Enabled (Opt-Out Active)' : 'Disabled / Unrecognized' },
          { key: 'PDF Viewer Support', val: report.browser.pdfViewerEnabled ? 'Yes / Supported' : 'No / Unsupported' },
          { key: 'Storage Sandbox Quota', val: typeof report.browser.storageQuotaMb === 'number' ? `${report.browser.storageQuotaMb} MB` : String(report.browser.storageQuotaMb) },
          { key: 'Storage Sandbox Usage', val: typeof report.browser.storageUsageMb === 'number' ? `${report.browser.storageUsageMb} MB` : String(report.browser.storageUsageMb) },
          { key: 'Service Worker Availability', val: report.browser.serviceWorkerSupported ? 'Available' : 'Unavailable' },
        ];
      case 'network':
        return [
          { key: 'Resolved Public IP', val: String(report.network.ip) },
          { key: 'Network Provider (ASN)', val: String(report.network.asn) },
          { key: 'Gateway Country', val: String(report.network.country) },
          { key: 'Gateway Region / State', val: String(report.network.region) },
          { key: 'Gateway City', val: String(report.network.city) },
          { key: 'Resolved Timezone', val: String(report.network.timezone) },
          { key: 'Local System Locale', val: String(report.network.locale) },
          { key: 'Average Latency (RTT)', val: report.network.latencyMs !== null ? `${report.network.latencyMs} ms` : 'Offline / Failed' },
          { key: 'W3C Connection Type', val: String(report.network.connectionType) },
          { key: 'Max Downlink Bandwidth', val: String(report.network.downlink) },
          { key: 'Connection RTT Bound', val: String(report.network.rtt) },
          { key: 'Network Online Status', val: report.network.online ? 'Online' : 'Offline' },
        ];
      case 'privacy':
        return [
          { key: 'HTTPS Secure Layer', val: report.privacy.isHttps ? 'Active / Encrypted' : 'Inactive / Unencrypted!' },
          { key: 'WebRTC Local Network Leak', val: report.privacy.webRtcIps.length > 0 ? `Private IPs Leaked: ${report.privacy.webRtcIps.join(', ')}` : 'Secure (No IPs exposed)' },
          { key: 'Ad & Analytics Tracker Blocker', val: report.privacy.adblockDetected ? 'Active (Telemetry Blocks Found)' : 'Inactive (Tracker Scripts Allowed)' },
          { key: 'Storage Access Permission (3rd Party)', val: report.privacy.thirdPartyCookiesEnabled ? 'Allowed' : 'Blocked' },
          { key: 'Geolocation API Privilege', val: String(report.privacy.permissions.geolocation) },
          { key: 'Push Notifications Privilege', val: String(report.privacy.permissions.notifications) },
          { key: 'Camera Hardware Privilege', val: String(report.privacy.permissions.camera) },
        ];
      case 'findings':
      default:
        return [];
    }
  };

  const rows = getTabRows();

  // Filter rows based on search
  const filteredRows = rows.filter(
    (row) =>
      row.key.toLowerCase().includes(filterQuery.toLowerCase()) ||
      row.val.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const getFindingIcon = (severity: Finding['severity']) => {
    switch (severity) {
      case 'fail':
        return <ShieldAlert className="h-5 w-5 text-rose-500 flex-shrink-0" />;
      case 'warn':
        return <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-teal-500 flex-shrink-0" />;
    }
  };

  const getFindingSeverityBadge = (severity: Finding['severity']) => {
    switch (severity) {
      case 'fail':
        return (
          <span className="text-[9px] font-bold tracking-wider font-mono px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-500 border border-rose-500/20 uppercase">
            Critical
          </span>
        );
      case 'warn':
        return (
          <span className="text-[9px] font-bold tracking-wider font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase">
            Warning
          </span>
        );
      case 'info':
      default:
        return (
          <span className="text-[9px] font-bold tracking-wider font-mono px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-500 border border-teal-500/20 uppercase">
            Advice
          </span>
        );
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
      {/* Navigation and Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border/80 p-4 md:px-6 gap-4">
        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-1 bg-muted/40 p-1 rounded-xl border border-border/60 self-start md:self-auto">
          {[
            { id: 'system', label: 'System', icon: Laptop },
            { id: 'browser', label: 'Browser', icon: Database },
            { id: 'network', label: 'Network', icon: Compass },
            { id: 'privacy', label: 'Privacy', icon: Lock },
            { id: 'findings', label: `Findings (${report.findings.length})`, icon: ShieldAlert },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as TabType);
                  setFilterQuery('');
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-card text-teal-500 dark:text-teal-400 shadow-xs border border-border'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filter / Search Bar (only for metadata tables) */}
        {activeTab !== 'findings' && (
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter values..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-muted/30 border border-border/80 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-xs text-foreground outline-hidden transition"
            />
          </div>
        )}
      </div>

      {/* Explorer Content view */}
      <div className="p-4 md:p-6 min-h-[300px]">
        {activeTab === 'findings' ? (
          /* Findings view list */
          <div className="flex flex-col gap-4">
            {report.findings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-3" />
                <h4 className="text-sm font-bold text-foreground">Perfect Audit!</h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  No vulnerabilities or privacy warnings were flagged during this scan.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
                {report.findings.map((finding) => (
                  <div
                    key={finding.id}
                    className="flex gap-4 p-4 rounded-xl border border-border/80 bg-muted/10 hover:border-border transition duration-150"
                  >
                    {getFindingIcon(finding.severity)}
                    <div className="flex flex-col gap-1 w-full">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-foreground tracking-tight">
                          {finding.title}
                        </span>
                        {getFindingSeverityBadge(finding.severity)}
                      </div>
                      <p className="text-xs text-muted-foreground/90 mt-0.5 leading-relaxed">
                        {finding.description}
                      </p>
                      <div className="mt-3 pt-2 border-t border-border/40 flex flex-col gap-0.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-teal-500 dark:text-teal-400">
                          Remediation Hint:
                        </span>
                        <span className="text-xs text-foreground font-medium">
                          {finding.remediation}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Key-Value tabular metadata view */
          <div className="overflow-x-auto">
            {filteredRows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Search className="h-8 w-8 mb-2 opacity-50" />
                <span className="text-xs">No keys matching "{filterQuery}" found.</span>
              </div>
            ) : (
              <div className="grid gap-2">
                {filteredRows.map((row, idx) => (
                  <div
                    key={row.key}
                    onClick={() => handleCopyRow(row.key, row.val)}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-border/30 hover:border-border/100 bg-muted/10 hover:bg-muted/30 cursor-pointer transition duration-150 gap-2"
                  >
                    <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                      {row.key}
                    </span>
                    <div className="flex items-center gap-2.5 max-w-full sm:max-w-2/3">
                      <span className="text-xs font-mono font-bold text-foreground truncate select-all">
                        {row.val}
                      </span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        {copiedKey === row.key ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Clipboard className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
