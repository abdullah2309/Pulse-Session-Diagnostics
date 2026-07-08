/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';
import HealthIndexCard from './HealthIndexCard';
import VerificationPipelineCard from './VerificationPipelineCard';
import LiveMetricsCard from './LiveMetricsCard';
import KpiStrip from './KpiStrip';
import TabbedExplorer from './TabbedExplorer';
import MediaDiagnostic from './MediaDiagnostic';
import SpeedTester from './SpeedTester';
import TroubleWizard from './TroubleWizard';
import SupportCompanion from './SupportCompanion';
import Footer from './Footer';
import { runDiagnostics, measureLatency } from '../lib/diagnostics';
import { DiagnosticsReport, LiveMetric } from '../types';
import { Layers, Video, Gauge, HelpCircle, FileText } from 'lucide-react';

export default function Dashboard() {
  const [report, setReport] = useState<DiagnosticsReport | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(true);
  const [loadingStep, setLoadingStep] = useState<string>('Initializing Pulse framework...');
  const [uptimeSeconds, setUptimeSeconds] = useState<number>(0);
  const [metricsHistory, setMetricsHistory] = useState<LiveMetric[]>([]);
  const [isDark, setIsDark] = useState<boolean>(true);
  const [workspaceTab, setWorkspaceTab] = useState<'telemetry' | 'hardware' | 'speed' | 'remediation' | 'support'>('telemetry');

  const fpsRef = useRef<number>(60);
  const latestLatencyRef = useRef<number>(10);

  // 1. Theme Configuration
  useEffect(() => {
    // Read theme preference from storage or default to true (dark)
    const stored = localStorage.getItem('pulse-theme');
    const darkTheme = stored !== 'light'; // default dark
    setIsDark(darkTheme);
    if (darkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleToggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    localStorage.setItem('pulse-theme', nextDark ? 'dark' : 'light');
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // 2. Main Diagnostics Trigger
  const triggerDiagnostics = async () => {
    setIsRefreshing(true);
    try {
      const result = await runDiagnostics((step) => setLoadingStep(step));
      setReport(result);
      if (result.network.latencyMs !== null) {
        latestLatencyRef.current = result.network.latencyMs;
      }
    } catch (err) {
      console.error('Diagnostics failed:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    triggerDiagnostics();
  }, []);

  // 3. FPS Tracker loop (60fps requestAnimationFrame)
  useEffect(() => {
    let frameCount = 0;
    let lastFpsTime = performance.now();
    let animFrameId: number;

    const trackFps = () => {
      frameCount++;
      const now = performance.now();
      if (now >= lastFpsTime + 1000) {
        fpsRef.current = Math.round((frameCount * 1000) / (now - lastFpsTime));
        frameCount = 0;
        lastFpsTime = now;
      }
      animFrameId = requestAnimationFrame(trackFps);
    };

    animFrameId = requestAnimationFrame(trackFps);
    return () => cancelAnimationFrame(animFrameId);
  }, []);

  // 4. Uptime & Rolling Sparkline Metrics History (1s Interval)
  useEffect(() => {
    // Fill initial metrics history to make line smooth
    const initialHistory = Array.from({ length: 15 }).map((_, i) => ({
      timestamp: new Date(Date.now() - (15 - i) * 1000).toISOString(),
      latency: 12 + Math.floor(Math.random() * 5),
      fps: 60,
    }));
    setMetricsHistory(initialHistory);

    const interval = setInterval(() => {
      setUptimeSeconds((prev) => prev + 1);

      // Add a live data point to history
      const newPoint: LiveMetric = {
        timestamp: new Date().toISOString(),
        latency: latestLatencyRef.current,
        fps: fpsRef.current,
      };

      setMetricsHistory((prev) => {
        const next = [...prev, newPoint];
        if (next.length > 20) {
          next.shift();
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 5. Periodic Background Latency Pinger (every 4s)
  useEffect(() => {
    const pinger = setInterval(async () => {
      if (navigator.onLine) {
        const ping = await measureLatency();
        latestLatencyRef.current = ping;
      }
    }, 4000);
    return () => clearInterval(pinger);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Core Header Navigation */}
        <Header
          report={report}
          isDark={isDark}
          onToggleTheme={handleToggleTheme}
          onRefresh={triggerDiagnostics}
          isRefreshing={isRefreshing}
        />

        {/* Loading overlay for initial or full scan */}
        {isRefreshing && !report ? (
          <div className="flex flex-col items-center justify-center min-h-[500px] bg-card border border-border rounded-3xl p-8 shadow-xs">
            {/* Pulsing indicator */}
            <div className="relative flex items-center justify-center h-24 w-24">
              <div className="absolute inset-0 rounded-full border-4 border-teal-500/10 animate-pulse" />
              <div className="absolute h-16 w-16 rounded-full border-4 border-t-teal-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
              <div className="h-8 w-8 rounded-full bg-linear-to-tr from-teal-500 to-emerald-400 shadow-md animate-ping opacity-60" />
            </div>

            <h3 className="text-lg font-bold text-foreground mt-8 tracking-tight">Gathering Local Telemetry...</h3>
            <p className="text-xs text-muted-foreground font-mono mt-2 bg-muted px-3.5 py-1.5 rounded-xl border border-border/60 uppercase tracking-widest animate-pulse">
              {loadingStep}
            </p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
            
            {/* ROW 1: 3-Column Core Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              
              {/* Col 1: Health Index Card */}
              <div className="h-[340px] md:h-[380px] lg:h-[400px]">
                <HealthIndexCard report={report} />
              </div>

              {/* Col 2: Verification Pipeline Checklist */}
              <div className="h-[340px] md:h-[380px] lg:h-[400px]">
                <VerificationPipelineCard pipeline={report?.verificationPipeline || null} isRefreshing={isRefreshing} />
              </div>

              {/* Col 3: Real-time Sparklines & Core Stats */}
              <div className="h-[340px] md:h-[380px] lg:h-[400px]">
                <LiveMetricsCard metricsHistory={metricsHistory} uptimeSeconds={uptimeSeconds} />
              </div>

            </div>

            {/* ROW 2: KPI stat strip ribbon */}
            <KpiStrip report={report} />

            {/* SECONDARY UTILITY SELECTOR TABS */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-base font-bold text-foreground tracking-tight">Support & Troubleshooting Suite</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Test real-time bandwidth speeds, webcam/mic privileges, and compile diagnostic support logs</p>
                </div>

                {/* Workspace Navigation Pills */}
                <div className="flex flex-wrap gap-1.5 bg-muted/40 p-1 rounded-xl border border-border/60 w-full md:w-auto">
                  {[
                    { id: 'telemetry', label: 'Telemetry Logs', icon: Layers },
                    { id: 'hardware', label: 'Hardware Tests', icon: Video },
                    { id: 'speed', label: 'Bandwidth Speed', icon: Gauge },
                    { id: 'remediation', label: 'Fix Wizard', icon: HelpCircle },
                    { id: 'support', label: 'Support Sync', icon: FileText },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = workspaceTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setWorkspaceTab(tab.id as any)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex-1 md:flex-initial justify-center md:justify-start ${
                          isActive
                            ? 'bg-card text-teal-500 dark:text-teal-400 shadow-xs border border-border'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline md:inline">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic workspace view rendering */}
              <div className="transition-all duration-300">
                {workspaceTab === 'telemetry' && <TabbedExplorer report={report} />}
                {workspaceTab === 'hardware' && <MediaDiagnostic />}
                {workspaceTab === 'speed' && <SpeedTester />}
                {workspaceTab === 'remediation' && <TroubleWizard report={report} />}
                {workspaceTab === 'support' && <SupportCompanion report={report} />}
              </div>
            </div>

          </div>
        )}

        {/* Global Footer */}
        <Footer timestamp={report?.timestamp} />

      </div>
    </div>
  );
}
