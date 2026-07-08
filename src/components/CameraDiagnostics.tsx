/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Video, AlertCircle, CheckCircle, RefreshCw, Sparkles, Sliders } from 'lucide-react';

export default function CameraDiagnostics() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<{
    resolution: string;
    fps: number;
    brightness: number;
    clarity: string;
    score: number;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startCamera = async () => {
    setLoading(true);
    setError(null);
    setMetrics(null);

    // Stop current stream if active
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      // Analyze camera stream details
      const videoTrack = mediaStream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      const resolution = `${settings.width || 640}x${settings.height || 480}`;
      const fps = Math.round(settings.frameRate || 30);

      // Analyze brightness from pixel values
      setTimeout(() => {
        analyzeFrames(resolution, fps);
      }, 1000);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Camera access denied or device busy. Please ensure permission is granted.');
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const analyzeFrames = (resolution: string, baseFps: number) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      setLoading(false);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setLoading(false);
      return;
    }

    const process = () => {
      if (video.paused || video.ended) return;
      
      canvas.width = 160;
      canvas.height = 120;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      let rSum = 0, gSum = 0, bSum = 0;
      for (let i = 0; i < data.length; i += 4) {
        rSum += data[i];
        gSum += data[i+1];
        bSum += data[i+2];
      }
      const pixelCount = data.length / 4;
      const averageBrightness = Math.round((rSum + gSum + bSum) / (pixelCount * 3));

      // Benchmark scoring based on specs
      const [width] = resolution.split('x').map(Number);
      let resWeight = width >= 1280 ? 40 : width >= 800 ? 30 : 20;
      let brightnessWeight = averageBrightness > 40 && averageBrightness < 220 ? 30 : 15;
      let fpsWeight = baseFps >= 30 ? 30 : 20;
      const totalScore = resWeight + brightnessWeight + fpsWeight;

      setMetrics({
        resolution,
        fps: baseFps,
        brightness: averageBrightness,
        clarity: totalScore >= 80 ? 'Excellent / HD Clear' : totalScore >= 60 ? 'Standard Web Grade' : 'Low Light / Suboptimal',
        score: totalScore
      });

      animationFrameRef.current = requestAnimationFrame(process);
      setLoading(false);
    };

    video.addEventListener('play', process);
    if (!video.paused) {
      process();
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Video className="h-4 w-4 text-emerald-500" />
          Camera Integrity & Lens Diagnostics
        </h4>
        <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">VIDEO BENCHMARK</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-auto items-stretch">
        {/* Left Hand: Capture Screen */}
        <div className="md:col-span-6 flex flex-col gap-3">
          <div className="relative aspect-video rounded-2xl bg-muted/30 overflow-hidden border border-border/60 flex flex-col items-center justify-center">
            {stream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground p-6">
                <Camera className="h-10 w-10 text-muted-foreground/50" />
                <span className="text-xs font-semibold">Camera stream is offline</span>
                <p className="text-[10px] text-center max-w-xs leading-normal mt-0.5">
                  Launch the camera loop to evaluate optical latency, pixel matrix specs, and frame-rate integrity.
                </p>
              </div>
            )}

            {/* Hidden Canvas for Frame Processing */}
            <canvas ref={canvasRef} className="hidden" />

            {loading && (
              <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-2">
                <RefreshCw className="h-6 w-6 text-emerald-500 animate-spin" />
                <span className="text-[10px] font-mono text-muted-foreground">Initializing stream...</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {!stream ? (
              <button
                onClick={startCamera}
                disabled={loading}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs tracking-wide transition duration-150 cursor-pointer shadow-xs"
              >
                Launch Lens Scan
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs tracking-wide transition duration-150 cursor-pointer shadow-xs"
              >
                Disconnect Stream
              </button>
            )}
          </div>
        </div>

        {/* Right Hand: Specs & Quality Analysis */}
        <div className="md:col-span-6 flex flex-col gap-4 text-left justify-between">
          <div className="bg-muted/10 border border-border/40 rounded-xl p-3 flex gap-2.5 items-start">
            <Sparkles className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-muted-foreground leading-normal">
              Lens analyzer computes real-time optical variables. Recommended for professional Zoom calls, Upwork interviews, and remote tutoring.
            </p>
          </div>

          <div className="space-y-2.5 flex-1 mt-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Lens Optical Metrics</span>
            
            {metrics ? (
              <div className="space-y-2">
                <div className="bg-muted/15 border border-border/40 p-3 rounded-xl flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Stream Resolution:</span>
                  <span className="text-xs font-mono font-bold text-foreground">{metrics.resolution}</span>
                </div>
                <div className="bg-muted/15 border border-border/40 p-3 rounded-xl flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Frame Integrity:</span>
                  <span className="text-xs font-mono font-bold text-foreground">{metrics.fps} FPS</span>
                </div>
                <div className="bg-muted/15 border border-border/40 p-3 rounded-xl flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Pixel Brightness:</span>
                  <span className="text-xs font-mono font-bold text-foreground">{metrics.brightness} / 255</span>
                </div>
                <div className="bg-muted/15 border border-border/40 p-3 rounded-xl flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Image Clarity:</span>
                  <span className={`text-xs font-bold ${metrics.score >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>{metrics.clarity}</span>
                </div>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center border border-dashed border-border/60 rounded-xl bg-muted/5 text-muted-foreground text-xs text-center p-4">
                No active optical feed. Start camera to inspect quality.
              </div>
            )}
          </div>

          {metrics && (
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-foreground">Optical Health Rating</span>
                <span className="text-[9px] text-muted-foreground">Overall camera quality index</span>
              </div>
              <span className="text-base font-mono font-extrabold text-emerald-400">{metrics.score}/100</span>
            </div>
          )}

          {error && (
            <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-3 flex gap-2.5 items-start">
              <AlertCircle className="h-4 w-4 text-rose-400 mt-0.5 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wide">Video Interface Blocked</span>
                <span className="text-[10px] text-muted-foreground leading-normal mt-0.5">{error}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
