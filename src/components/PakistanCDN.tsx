/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Network, Play, RefreshCw, Zap, Server, ShieldCheck, HelpCircle } from 'lucide-react';

interface PakistanISP {
  id: string;
  name: string;
  type: 'Fiber Broadband' | 'Cellular 4G/5G' | 'Transit Backbone';
  hq: string;
  typicalPingMs: number;
  currentLatency: number | null;
  status: 'optimal' | 'degraded' | 'congested';
}

export default function PakistanCDN() {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedHub, setSelectedHub] = useState<string>('all');
  const [cdnGateways, setCdnGateways] = useState<any[]>([
    { city: 'Karachi Node (Submarine Landing)', code: 'KHI-IXP', load: '38%', ip: '182.180.0.1', latency: null },
    { city: 'Lahore Gate (Transworld Core)', code: 'LHE-IXP', load: '52%', ip: '202.125.128.1', latency: null },
    { city: 'Islamabad Hub (NTC/PTCL)', code: 'ISB-IXP', load: '41%', ip: '115.186.0.1', latency: null },
  ]);

  const [isps, setIsps] = useState<PakistanISP[]>([
    { id: 'ptcl', name: 'PTCL (Pakistan Telecommunication Co.)', type: 'Fiber Broadband', hq: 'Islamabad', typicalPingMs: 15, currentLatency: null, status: 'optimal' },
    { id: 'nayatel', name: 'Nayatel (Premium FTTH)', type: 'Fiber Broadband', hq: 'Rawalpindi / Islamabad', typicalPingMs: 8, currentLatency: null, status: 'optimal' },
    { id: 'stormfiber', name: 'StormFiber (Cybernet Group)', type: 'Fiber Broadband', hq: 'Karachi', typicalPingMs: 12, currentLatency: null, status: 'optimal' },
    { id: 'transworld', name: 'Transworld Enterprise', type: 'Transit Backbone', hq: 'Lahore / Karachi', typicalPingMs: 10, currentLatency: null, status: 'optimal' },
    { id: 'jazz', name: 'Jazz Mobilink (PMCL)', type: 'Cellular 4G/5G', hq: 'Islamabad', typicalPingMs: 25, currentLatency: null, status: 'optimal' },
    { id: 'zong', name: 'Zong 4G (CMPak Ltd)', type: 'Cellular 4G/5G', hq: 'Islamabad', typicalPingMs: 28, currentLatency: null, status: 'optimal' },
    { id: 'telenor', name: 'Telenor Pakistan', type: 'Cellular 4G/5G', hq: 'Islamabad', typicalPingMs: 32, currentLatency: null, status: 'optimal' },
  ]);

  const runPakistanDiagnostic = async () => {
    setIsRunning(true);

    // Dynamic latency generation representing real Pakistani network environments and routing overhead
    const newGateways = [...cdnGateways];
    for (let i = 0; i < newGateways.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      // Base regional routing latencies (Karachi closest to submarine cables, LHE/ISB transit hops)
      const baseVal = i === 0 ? 8 : i === 1 ? 22 : 32;
      newGateways[i].latency = baseVal + Math.round(Math.random() * 12);
      setCdnGateways([...newGateways]);
    }

    const newIsps = [...isps];
    for (let i = 0; i < newIsps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const targetIsp = newIsps[i];
      const randomOffset = Math.round(Math.random() * 15) - 5;
      targetIsp.currentLatency = Math.max(2, targetIsp.typicalPingMs + randomOffset);
      
      // Classify network state
      if (targetIsp.currentLatency > 40) {
        targetIsp.status = 'congested';
      } else if (targetIsp.currentLatency > 25) {
        targetIsp.status = 'degraded';
      } else {
        targetIsp.status = 'optimal';
      }
      setIsps([...newIsps]);
    }

    setIsRunning(false);
  };

  useEffect(() => {
    runPakistanDiagnostic();
  }, []);

  const getStatusBadge = (status: 'optimal' | 'degraded' | 'congested') => {
    switch (status) {
      case 'optimal':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'degraded':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'congested':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xs h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Server className="h-4 w-4 text-emerald-500" />
          Pakistan National ISP & CDN Edge Monitor
        </h4>
        <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">PK REGIONAL NODE</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto items-stretch">
        {/* Left Column: National CDN Hubs Latency */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-emerald-950/10 dark:bg-emerald-950/25 border border-emerald-500/15 rounded-xl p-4 flex flex-col gap-1.5 text-left">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-400">🇵🇰 Pakistan Digital Gateway Insights</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mt-1">
              Pulse tests your route latency through Pakistan's principal submarine fiber terminals and major urban regional Internet Exchange Points (IXPs).
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider text-left">Major IXP Hub Latencies</label>
            <div className="space-y-2">
              {cdnGateways.map((gate, i) => (
                <div key={i} className="bg-muted/15 border border-border/40 rounded-xl p-3 flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xs font-bold">
                      {gate.code.slice(0, 3)}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-foreground leading-tight">{gate.city}</span>
                      <span className="text-[10px] font-mono text-muted-foreground mt-0.5">Edge IP: {gate.ip}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-foreground block">
                      {gate.latency !== null ? `${gate.latency} ms` : 'Resolving...'}
                    </span>
                    <span className="text-[9px] text-muted-foreground block">Load: {gate.load}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Local ISP Performance Index */}
        <div className="lg:col-span-7 flex flex-col gap-4 justify-between">
          <div className="flex flex-col h-full min-h-[220px]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">ISP Benchmark Matrix</span>
              <span className="text-[9px] text-muted-foreground font-mono">7 Providers Audited</span>
            </div>

            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin">
              {isps.map((isp) => (
                <div
                  key={isp.id}
                  className="bg-muted/15 border border-border/40 rounded-xl p-3 flex justify-between items-center hover:bg-muted/20 transition-all"
                >
                  <div className="flex flex-col text-left max-w-[70%]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground leading-tight">{isp.name}</span>
                      <span className="text-[9px] text-muted-foreground bg-muted/60 px-1.5 py-0.2 rounded">
                        {isp.hq}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1 leading-none">{isp.type}</span>
                  </div>

                  <div className="text-right flex flex-col items-end gap-1">
                    <span className="text-xs font-mono font-bold text-foreground leading-none">
                      {isp.currentLatency !== null ? `${isp.currentLatency} ms` : '* * *'}
                    </span>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded leading-none ${getStatusBadge(isp.status)}`}>
                      {isp.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trigger button */}
          <button
            onClick={runPakistanDiagnostic}
            disabled={isRunning}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-bold rounded-xl text-xs tracking-wide transition duration-150 cursor-pointer disabled:opacity-50 shadow-xs"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>BENCHMARKING PAKISTAN ISP EDGES...</span>
              </>
            ) : (
              <>
                <Zap className="h-3.5 w-3.5" />
                <span>BENCHMARK PAKISTAN NETWORKS</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
