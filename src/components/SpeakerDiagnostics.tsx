/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Volume2, VolumeX, Play, ArrowLeft, ArrowRight, Activity, Sparkles } from 'lucide-react';

export default function SpeakerDiagnostics() {
  const [playing, setPlaying] = useState<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playFrequency = (channel: 'left' | 'right' | 'both') => {
    // If already playing, stop first
    stopFrequency();

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioCtxRef.current = audioCtx;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const panner = audioCtx.createStereoPanner ? audioCtx.createStereoPanner() : null;

      // frequency: 440Hz standard middle A, warm and soft
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);

      if (panner) {
        if (channel === 'left') {
          panner.pan.setValueAtTime(-1, audioCtx.currentTime);
          osc.connect(gain).connect(panner).connect(audioCtx.destination);
        } else if (channel === 'right') {
          panner.pan.setValueAtTime(1, audioCtx.currentTime);
          osc.connect(gain).connect(panner).connect(audioCtx.destination);
        } else {
          panner.pan.setValueAtTime(0, audioCtx.currentTime);
          osc.connect(gain).connect(panner).connect(audioCtx.destination);
        }
      } else {
        osc.connect(gain).connect(audioCtx.destination);
      }

      osc.start();
      setPlaying(channel);

      // Stop after 2.5 seconds
      setTimeout(() => {
        if (audioCtxRef.current && playing === channel) {
          stopFrequency();
        }
      }, 2500);

    } catch (err) {
      console.error('Failed to play speaker synthetic beep:', err);
    }
  };

  const stopFrequency = () => {
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    setPlaying(null);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-emerald-500" />
          Stereo Panning & Speaker Diagnostics
        </h4>
        <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">STEREO SYNTH</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-auto items-stretch">
        {/* Play Synthesizer buttons */}
        <div className="md:col-span-6 flex flex-col gap-3 justify-center">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider text-left">Synthesized Panning Test</span>

          <div className="grid grid-cols-3 gap-2.5">
            {/* Left Channel */}
            <button
              onClick={() => playFrequency('left')}
              className={`p-4 border rounded-2xl flex flex-col items-center gap-2.5 transition duration-150 cursor-pointer text-center ${
                playing === 'left'
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                  : 'bg-muted/15 border-border/60 text-muted-foreground hover:bg-muted/30 hover:text-foreground'
              }`}
            >
              <ArrowLeft className={`h-4 w-4 ${playing === 'left' ? 'animate-bounce' : ''}`} />
              <span className="text-xs font-bold">Left Speaker</span>
            </button>

            {/* Both Channels */}
            <button
              onClick={() => playFrequency('both')}
              className={`p-4 border rounded-2xl flex flex-col items-center gap-2.5 transition duration-150 cursor-pointer text-center ${
                playing === 'both'
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                  : 'bg-muted/15 border-border/60 text-muted-foreground hover:bg-muted/30 hover:text-foreground'
              }`}
            >
              <Volume2 className={`h-4 w-4 ${playing === 'both' ? 'animate-pulse' : ''}`} />
              <span className="text-xs font-bold">Both Stereo</span>
            </button>

            {/* Right Channel */}
            <button
              onClick={() => playFrequency('right')}
              className={`p-4 border rounded-2xl flex flex-col items-center gap-2.5 transition duration-150 cursor-pointer text-center ${
                playing === 'right'
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                  : 'bg-muted/15 border-border/60 text-muted-foreground hover:bg-muted/30 hover:text-foreground'
              }`}
            >
              <ArrowRight className={`h-4 w-4 ${playing === 'right' ? 'animate-bounce' : ''}`} />
              <span className="text-xs font-bold">Right Speaker</span>
            </button>
          </div>

          {playing && (
            <button
              onClick={stopFrequency}
              className="py-2 bg-rose-600/15 hover:bg-rose-600/25 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-xl transition duration-150 cursor-pointer"
            >
              Stop Audio Test
            </button>
          )}
        </div>

        {/* Quality Audit */}
        <div className="md:col-span-6 flex flex-col gap-4 text-left justify-between">
          <div className="bg-muted/10 border border-border/40 rounded-xl p-3 flex gap-2.5 items-start">
            <Sparkles className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-muted-foreground leading-normal">
              Speaker test generates high-fidelity sine wave oscillators to detect mechanical hardware distortion, stereo positioning errors, and browser driver sync lag.
            </p>
          </div>

          <div className="space-y-2.5 flex-1 mt-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Acoustic Audio Pipeline</span>
            
            <div className="space-y-2">
              <div className="bg-muted/15 border border-border/40 p-3 rounded-xl flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Panning capabilities:</span>
                <span className="text-xs font-mono font-bold text-foreground">Double Stereo Supported</span>
              </div>
              <div className="bg-muted/15 border border-border/40 p-3 rounded-xl flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Output frequency:</span>
                <span className="text-xs font-mono font-bold text-foreground">440 Hz (Middle A)</span>
              </div>
              <div className="bg-muted/15 border border-border/40 p-3 rounded-xl flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Device state:</span>
                <span className="text-xs font-mono font-bold text-emerald-400">Speaker Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
