/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Activity, Clock, Cpu, Gauge } from 'lucide-react';
import { LiveMetric } from '../types';

interface LiveMetricsCardProps {
  metricsHistory: LiveMetric[];
  uptimeSeconds: number;
}

export default function LiveMetricsCard({
  metricsHistory,
  uptimeSeconds,
}: LiveMetricsCardProps) {
  // Format uptime cleanly
  const formatUptime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Check heap memory support
  const getMemoryUsage = () => {
    const memory = (performance as any).memory;
    if (memory) {
      const used = Math.round(memory.usedJSHeapSize / (1024 * 1024));
      const total = Math.round(memory.totalJSHeapSize / (1024 * 1024));
      return { used, total, percent: Math.round((used / total) * 100) };
    }
    return null;
  };

  const mem = getMemoryUsage();

  // Helper to generate SVG points for sparkline
  const generateSparklineData = (
    data: number[],
    width: number,
    height: number,
    minVal: number,
    maxVal: number
  ) => {
    if (data.length < 2) return { path: '', fillPath: '' };
    
    const range = maxVal - minVal || 1;
    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      // invert Y since SVG (0,0) is top-left
      const y = height - ((val - minVal) / range) * height * 0.8 - height * 0.1;
      return { x, y };
    });

    const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const fillPath = `${path} L ${width} ${height} L 0 ${height} Z`;

    return { path, fillPath };
  };

  // FPS history extraction
  const fpsData = metricsHistory.map((m) => m.fps);
  const minFps = 0;
  const maxFps = 75; // Cap view scale at 75 fps for standard 60hz smooth view
  const currentFps = fpsData[fpsData.length - 1] || 60;

  const { path: fpsPath, fillPath: fpsFillPath } = generateSparklineData(
    fpsData,
    180,
    45,
    minFps,
    maxFps
  );

  // Latency history extraction
  const latencyData = metricsHistory.map((m) => m.latency || 0);
  const minLatency = 0;
  const maxLatency = Math.max(150, ...latencyData, 50); // scales dynamically
  const currentLatency = latencyData[latencyData.length - 1] || 0;

  const { path: latencyPath, fillPath: latencyFillPath } = generateSparklineData(
    latencyData,
    180,
    45,
    minLatency,
    maxLatency
  );

  return (
    <div className="flex flex-col justify-between bg-card border border-border rounded-2xl p-6 shadow-xs relative overflow-hidden h-full">
      <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Activity className="h-4 w-4 text-teal-500" />
          Live Metrics
        </h3>
        <span className="text-xs font-mono text-muted-foreground">POLL RATE: 1000ms</span>
      </div>

      {/* Grid of Sparklines */}
      <div className="grid grid-cols-2 gap-4 my-auto">
        {/* FPS Sparkline */}
        <div className="bg-muted/10 border border-border/50 rounded-xl p-3 flex flex-col justify-between h-28 relative overflow-hidden">
          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Frame Rate</span>
            <span className="text-xs font-mono font-bold text-emerald-500">{currentFps} FPS</span>
          </div>
          {/* Sparkline Canvas container */}
          <div className="absolute inset-x-0 bottom-0 h-[50px] w-full">
            {fpsData.length >= 2 && (
              <svg className="w-full h-full" viewBox="0 0 180 45" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="fpsGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.7 0.18 145)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="oklch(0.7 0.18 145)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d={fpsFillPath} fill="url(#fpsGlow)" />
                <path
                  d={fpsPath}
                  fill="none"
                  stroke="oklch(0.7 0.18 145)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        </div>

        {/* Latency Sparkline */}
        <div className="bg-muted/10 border border-border/50 rounded-xl p-3 flex flex-col justify-between h-28 relative overflow-hidden">
          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">RTT Ping</span>
            <span className="text-xs font-mono font-bold text-teal-500">{currentLatency ? `${currentLatency} ms` : 'Offline'}</span>
          </div>
          {/* Sparkline Canvas container */}
          <div className="absolute inset-x-0 bottom-0 h-[50px] w-full">
            {latencyData.length >= 2 && (
              <svg className="w-full h-full" viewBox="0 0 180 45" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="latencyGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.65 0.18 200)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="oklch(0.65 0.18 200)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d={latencyFillPath} fill="url(#latencyGlow)" />
                <path
                  d={latencyPath}
                  fill="none"
                  stroke="oklch(0.65 0.18 200)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* Grid of details: Heap Memory & Uptime */}
      <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/40 border border-border/50 text-muted-foreground">
            <Cpu className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Browser RAM</span>
            <span className="text-xs font-mono font-bold text-foreground">
              {mem ? `${mem.used} / ${mem.total} MB` : 'Unavailable'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/40 border border-border/50 text-muted-foreground">
            <Clock className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Pulse Uptime</span>
            <span className="text-xs font-mono font-bold text-foreground">
              {formatUptime(uptimeSeconds)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
