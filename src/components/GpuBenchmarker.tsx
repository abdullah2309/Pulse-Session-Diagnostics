/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Play, Square, RefreshCw, BarChart2, Gauge, Zap } from 'lucide-react';

export default function GpuBenchmarker() {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [particleCount, setParticleCount] = useState<number>(1500);
  const [fps, setFps] = useState<number>(0);
  const [frameTimeMs, setFrameTimeMs] = useState<number>(0);
  const [gpuScore, setGpuScore] = useState<number | null>(null);
  const [gpuTier, setGpuTier] = useState<string>('Unrated');
  const [rendererName, setRendererName] = useState<string>('Detecting GL...');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const fpsHistoryRef = useRef<number[]>([]);

  // Detect GL Renderer details on mount
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          setRendererName(renderer || 'Standard WebGL Generic');
        } else {
          setRendererName('WebGL Generic (Information Blocked)');
        }
      } else {
        setRendererName('Software Render / WebGL Disabled');
      }
    } catch {
      setRendererName('Unavailable');
    }
  }, []);

  const startBenchmark = () => {
    if (isRunning) return;
    setIsRunning(true);
    setGpuScore(null);
    fpsHistoryRef.current = [];
    lastTimeRef.current = performance.now();
    runLoop();
  };

  const stopBenchmark = () => {
    setIsRunning(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    calculateFinalScore();
  };

  const calculateFinalScore = () => {
    if (fpsHistoryRef.current.length === 0) return;
    const avgFps = fpsHistoryRef.current.reduce((a, b) => a + b, 0) / fpsHistoryRef.current.length;
    // Score based on average FPS and particle complexity
    const score = Math.round(avgFps * (particleCount / 10));
    setGpuScore(score);

    // Classify GPU Tier
    if (score >= 9000) {
      setGpuTier('Tier 4 (High-End Discrete GPU / Apple Max)');
    } else if (score >= 4500) {
      setGpuTier('Tier 3 (Mid-Range Discrete / Premium Integrated)');
    } else if (score >= 1500) {
      setGpuTier('Tier 2 (Standard Integrated / Mobile APU)');
    } else {
      setGpuTier('Tier 1 (Legacy / Software-rasterized Engine)');
    }
  };

  const runLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset dimensions
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;

    // Build random particle arrays
    const particles: { x: number; y: number; vx: number; vy: number; color: string }[] = [];
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 2;
      particles.push({
        x: width / 2,
        y: height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: `hsla(${Math.random() * 360}, 80%, 65%, ${0.25 + Math.random() * 0.55})`
      });
    }

    let framesThisSecond = 0;
    let lastFpsUpdate = performance.now();

    const render = () => {
      const now = performance.now();
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;
      setFrameTimeMs(parseFloat(delta.toFixed(1)));

      // FPS Calculation
      framesThisSecond++;
      if (now >= lastFpsUpdate + 1000) {
        const calculatedFps = Math.round((framesThisSecond * 1000) / (now - lastFpsUpdate));
        setFps(calculatedFps);
        fpsHistoryRef.current.push(calculatedFps);
        framesThisSecond = 0;
        lastFpsUpdate = now;
      }

      // Draw particle galaxy
      ctx.fillStyle = 'rgba(10, 10, 15, 0.2)'; // trail fade
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Bounce borders
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Draw particle path
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }

      // Render overlay center vortex
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 20 + Math.sin(now / 200) * 8, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(20, 184, 166, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (isRunning) {
        animationRef.current = requestAnimationFrame(render);
      }
    };

    animationRef.current = requestAnimationFrame(render);
  };

  // Clean up on component destroy
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning]);

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xs h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Cpu className="h-4 w-4 text-teal-500" />
          WebGL / 2D Canvas Graphics Benchmark
        </h4>
        <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">STRESS TESTER</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto items-stretch">
        {/* Left Control Panel */}
        <div className="lg:col-span-5 flex flex-col gap-4 justify-between">
          <div className="bg-muted/10 border border-border/50 rounded-xl p-3 flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">GL Driver</span>
            <span className="text-xs font-mono font-bold text-foreground truncate block leading-tight">
              {rendererName}
            </span>
            <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
              Measures graphic processing capacity, rendering pipelines, frame draw efficiency, and browser canvas throttle values.
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">
              <span>Particle Density</span>
              <span className="text-teal-500 font-mono">{particleCount} Particles</span>
            </div>
            <input
              type="range"
              min={200}
              max={8000}
              step={100}
              value={particleCount}
              disabled={isRunning}
              onChange={(e) => setParticleCount(Number(e.target.value))}
              className="w-full accent-teal-500 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted/15 border border-border/30 rounded-xl p-2.5">
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider block font-semibold">Frame Rate</span>
              <span className="text-sm font-mono font-bold text-foreground mt-0.5 block">
                {isRunning ? `${fps} FPS` : '--'}
              </span>
            </div>

            <div className="bg-muted/15 border border-border/30 rounded-xl p-2.5">
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider block font-semibold">Draw Overhead</span>
              <span className="text-sm font-mono font-bold text-foreground mt-0.5 block">
                {isRunning ? `${frameTimeMs} ms` : '--'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {!isRunning ? (
              <button
                onClick={startBenchmark}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-500 text-slate-900 dark:text-white font-bold rounded-xl text-xs tracking-wide transition duration-150 cursor-pointer shadow-xs"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>START BENCHMARK</span>
              </button>
            ) : (
              <button
                onClick={stopBenchmark}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs tracking-wide transition duration-150 cursor-pointer shadow-xs"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
                <span>STOP & ANALYZE</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Rendering Canvas Stage */}
        <div className="lg:col-span-7 flex flex-col gap-4 justify-between">
          <div className="relative bg-slate-950/95 border border-border rounded-xl aspect-video w-full overflow-hidden flex items-center justify-center">
            <canvas ref={canvasRef} className="w-full h-full block absolute inset-0" />
            
            {!isRunning && !gpuScore && (
              <div className="z-10 text-center p-6 bg-slate-900/80 rounded-xl border border-border/50 max-w-[280px]">
                <BarChart2 className="h-8 w-8 text-teal-500 mx-auto mb-2 opacity-80" />
                <h5 className="text-xs font-bold text-white">Renderer Sandbox Idle</h5>
                <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                  Press 'Start Benchmark' to launch active rendering cycles and calculate processing indices.
                </p>
              </div>
            )}

            {/* Score overlay */}
            {!isRunning && gpuScore !== null && (
              <div className="z-10 text-center p-5 bg-slate-950/90 rounded-2xl border border-teal-500/30 max-w-[320px] shadow-lg animate-in zoom-in-95 duration-200">
                <Zap className="h-7 w-7 text-teal-400 mx-auto mb-1 animate-bounce" />
                <span className="text-[9px] text-teal-400 uppercase font-bold tracking-widest block font-mono">BENCHMARK RESULTS</span>
                <h4 className="text-3xl font-bold font-mono text-white tracking-tighter mt-1">{gpuScore}</h4>
                <span className="text-[11px] text-emerald-400 font-semibold block mt-1">{gpuTier}</span>
                <p className="text-[10px] text-muted-foreground mt-2 leading-normal">
                  Calculated from frame render overhead timings during peak particle physics calculations.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
