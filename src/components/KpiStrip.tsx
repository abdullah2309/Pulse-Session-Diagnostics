/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Globe, Database, Compass, Clock, Languages, Laptop, Clipboard, Check } from 'lucide-react';
import { DiagnosticsReport } from '../types';

interface KpiStripProps {
  report: DiagnosticsReport | null;
}

export default function KpiStrip({ report }: KpiStripProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (id: string, text: string) => {
    if (!text || text.includes('Offline') || text.includes('Unavailable')) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // ignored
    }
  };

  const parseDeviceOs = (ua: string) => {
    if (/windows/i.test(ua)) return 'Windows';
    if (/macintosh|mac os x/i.test(ua)) return 'macOS';
    if (/linux/i.test(ua)) return 'Linux';
    if (/android/i.test(ua)) return 'Android';
    if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
    return 'Unknown OS';
  };

  const kpis = [
    {
      id: 'ip',
      label: 'Public IP',
      value: report?.network.ip || 'Resolving...',
      icon: Globe,
      color: 'text-teal-500',
    },
    {
      id: 'asn',
      label: 'Network ASN',
      value: report?.network.asn || 'Resolving...',
      icon: Database,
      color: 'text-sky-500',
    },
    {
      id: 'country',
      label: 'Geo Location',
      value: report ? `${report.network.city}, ${report.network.country}` : 'Resolving...',
      icon: Compass,
      color: 'text-emerald-500',
    },
    {
      id: 'timezone',
      label: 'Local Timezone',
      value: report?.network.timezone || 'Resolving...',
      icon: Clock,
      color: 'text-amber-500',
    },
    {
      id: 'locale',
      label: 'Locale / Language',
      value: report?.network.locale || 'Resolving...',
      icon: Languages,
      color: 'text-violet-500',
    },
    {
      id: 'device',
      label: 'Device OS',
      value: report ? parseDeviceOs(report.system.userAgent) : 'Resolving...',
      icon: Laptop,
      color: 'text-rose-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        const isResolving = kpi.value === 'Resolving...';
        const isClickable = !isResolving && !kpi.value.includes('Offline') && !kpi.value.includes('Unavailable');

        return (
          <div
            key={kpi.id}
            onClick={() => isClickable && handleCopy(kpi.id, kpi.value)}
            className={`group relative flex flex-col justify-between p-4 bg-card border border-border rounded-2xl shadow-xs transition duration-200 overflow-hidden ${
              isClickable ? 'hover:border-teal-500/50 hover:bg-muted/10 cursor-pointer select-none' : ''
            }`}
          >
            {/* Header / Meta */}
            <div className="flex items-center justify-between gap-1.5 mb-2">
              <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                {kpi.label}
              </span>
              <Icon className={`h-4 w-4 ${kpi.color} opacity-80 group-hover:scale-110 transition-transform`} />
            </div>

            {/* Value Display */}
            <div className="flex items-end justify-between gap-1">
              <span className="text-xs font-mono font-bold text-foreground truncate max-w-full">
                {kpi.value}
              </span>

              {/* Hover indicator to show copy option */}
              {isClickable && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 flex-shrink-0">
                  {copiedId === kpi.id ? (
                    <Check className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <Clipboard className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
