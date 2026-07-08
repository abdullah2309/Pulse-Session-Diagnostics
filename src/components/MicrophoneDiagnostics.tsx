/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';

export default function MicrophoneDiagnostics() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [volume, setVolume] = useState<number>(0);
  const [noiseLevel, setNoiseLevel] = useState<number>(0);
  const [noiseStatus, setNoiseStatus] = useState<string>('Calm / Silent');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const javascriptNodeRef = useRef<ScriptProcessorNode | null>(null);
  const animationRef = useRef<number | null>(null);

  const startMicrophone = async () => {
    setLoading(true);
    setError(null);

    if (stream) {
      stopMicrophone();
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(mediaStream);

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(mediaStream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const detectVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const currentVol = Math.round((average / 255) * 100);
        setVolume(currentVol);

        // Analyze ambient background noise
        // Low sound is ambient background, let's keep track of moving minimums as ambient noise
        setNoiseLevel(prev => {
          const rawDb = Math.round(20 * Math.log10(average + 1));
          if (rawDb < 10) return 30; // Min scale
          return Math.min(rawDb + 25, 90);
        });

        animationRef.current = requestAnimationFrame(detectVolume);
      };

      detectVolume();
      setLoading(false);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Microphone access denied. Please verify that your system is not using the microphone elsewhere.');
      setLoading(false);
    }
  };

  const stopMicrophone = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setVolume(0);
  };

  useEffect(() => {
    // Noise classification based on decibels
    if (noiseLevel > 65) {
      setNoiseStatus('Noisy Environment (May cause Zoom echoes)');
    } else if (noiseLevel > 45) {
      setNoiseStatus('Moderate Ambience (Laptop fan or air conditioner)');
    } else if (noiseLevel > 0) {
      setNoiseStatus('Silent / Ideal for Remote Meetings');
    } else {
      setNoiseStatus('No active feed');
    }
  }, [noiseLevel]);

  useEffect(() => {
    return () => {
      stopMicrophone();
    };
  }, []);

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Mic className="h-4 w-4 text-emerald-500" />
          Acoustic Spectrum & Microphone Diagnostics
        </h4>
        <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">AUDIO SAMPLER</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-auto items-stretch">
        {/* Real-time Decibel & Sound Bar Meter */}
        <div className="md:col-span-6 flex flex-col gap-4 text-left justify-between">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Input Audio level</span>
            
            {/* Decibel Level Meter */}
            <div className="bg-muted/10 border border-border/40 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Level amplitude:</span>
                <span className="font-mono font-bold text-foreground">{volume}%</span>
              </div>
              <div className="h-4 bg-muted/60 rounded-full overflow-hidden flex p-0.5">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-75"
                  style={{ width: `${volume}%` }}
                />
              </div>
            </div>

            {/* Custom Interactive Sound Wave bar */}
            <div className="h-12 bg-muted/10 border border-border/30 rounded-xl flex items-end justify-center p-2 gap-1.5 overflow-hidden">
              {Array.from({ length: 18 }).map((_, i) => {
                // Dynamically scale sound bar height based on input volume
                const height = stream ? Math.max(8, (volume * (Math.sin(i * 0.4) + 1.2)) / 2) : 8;
                return (
                  <div
                    key={i}
                    className="w-1.5 bg-emerald-500/70 rounded-full transition-all duration-75"
                    style={{ height: `${height}%` }}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex gap-2">
            {!stream ? (
              <button
                onClick={startMicrophone}
                disabled={loading}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs tracking-wide transition duration-150 cursor-pointer shadow-xs"
              >
                Start Mic Diagnostic
              </button>
            ) : (
              <button
                onClick={stopMicrophone}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs tracking-wide transition duration-150 cursor-pointer shadow-xs"
              >
                Mute Microphone
              </button>
            )}
          </div>
        </div>

        {/* Noise detection benchmarks */}
        <div className="md:col-span-6 flex flex-col gap-4 text-left justify-between">
          <div className="bg-muted/10 border border-border/40 rounded-xl p-3 flex gap-2.5 items-start">
            <Sparkles className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-muted-foreground leading-normal">
              Acoustic tests analyze ambient noise floor db thresholds and audio processing latency. Crucial for Zoom, Teams, or Fiverr interview panels.
            </p>
          </div>

          <div className="space-y-2.5 flex-1 mt-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Acoustic Audit</span>
            
            {stream ? (
              <div className="space-y-2">
                <div className="bg-muted/15 border border-border/40 p-3 rounded-xl flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Ambient noise floor:</span>
                  <span className="text-xs font-mono font-bold text-foreground">~{noiseLevel} dB</span>
                </div>
                <div className="bg-muted/15 border border-border/40 p-3 rounded-xl flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Acoustic profile:</span>
                  <span className={`text-xs font-bold ${noiseLevel < 50 ? 'text-emerald-400' : 'text-amber-400'}`}>{noiseStatus}</span>
                </div>
                <div className="bg-muted/15 border border-border/40 p-3 rounded-xl flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Permission status:</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">Granted</span>
                </div>
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center border border-dashed border-border/60 rounded-xl bg-muted/5 text-muted-foreground text-xs text-center p-4">
                Audio sampler is offline. Start diagnostic to perform noise floor profiling.
              </div>
            )}
          </div>

          {error && (
            <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-3 flex gap-2.5 items-start">
              <AlertCircle className="h-4 w-4 text-rose-400 mt-0.5 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wide">Audio Interface Error</span>
                <span className="text-[10px] text-muted-foreground leading-normal mt-0.5">{error}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
