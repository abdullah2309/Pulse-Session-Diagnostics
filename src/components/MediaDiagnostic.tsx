/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Video, Mic, Volume2, ShieldCheck, Cpu } from 'lucide-react';
import CameraDiagnostics from './CameraDiagnostics';
import MicrophoneDiagnostics from './MicrophoneDiagnostics';
import SpeakerDiagnostics from './SpeakerDiagnostics';

export default function MediaDiagnostic() {
  const [subTab, setSubTab] = useState<'camera' | 'microphone' | 'speaker'>('camera');

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xs flex flex-col justify-between h-full">
      {/* Top Controller */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4 mb-5 gap-3">
        <div className="text-left">
          <h4 className="text-sm font-bold text-foreground">AV Hardware Diagnostic Center</h4>
          <p className="text-xs text-muted-foreground">Calibrate physical lens matrices, acoustical sample rates, and stereo panning channels</p>
        </div>

        {/* Sub-tab Pills */}
        <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-xl border border-border/60 self-start sm:self-auto">
          <button
            onClick={() => setSubTab('camera')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              subTab === 'camera' ? 'bg-card text-emerald-400 border border-border' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Video className="h-3.5 w-3.5" />
            Camera
          </button>
          <button
            onClick={() => setSubTab('microphone')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              subTab === 'microphone' ? 'bg-card text-emerald-400 border border-border' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Mic className="h-3.5 w-3.5" />
            Microphone
          </button>
          <button
            onClick={() => setSubTab('speaker')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              subTab === 'speaker' ? 'bg-card text-emerald-400 border border-border' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Volume2 className="h-3.5 w-3.5" />
            Speaker / Stereo
          </button>
        </div>
      </div>

      {/* Embedded Component */}
      <div className="flex-1 transition-all duration-300">
        {subTab === 'camera' && <CameraDiagnostics />}
        {subTab === 'microphone' && <MicrophoneDiagnostics />}
        {subTab === 'speaker' && <SpeakerDiagnostics />}
      </div>
    </div>
  );
}
