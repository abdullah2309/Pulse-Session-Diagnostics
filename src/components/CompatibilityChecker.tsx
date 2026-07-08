/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, HelpCircle, ArrowUpRight, Search } from 'lucide-react';

interface PlatformCompat {
  name: string;
  category: string;
  requirements: string[];
  isCompatible: boolean;
  statusText: string;
  remedy?: string;
}

export default function CompatibilityChecker() {
  const [platformList, setPlatformList] = useState<PlatformCompat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    // Perform browser inspection
    const supportWebRTC = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    const supportWasm = typeof WebAssembly === 'object' && typeof WebAssembly.instantiate === 'function';
    const supportWebGL = (() => {
      try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      } catch (e) {
        return false;
      }
    })();
    const supportSharedBuffer = typeof SharedArrayBuffer !== 'undefined';
    const isHttps = window.location.protocol === 'https:';

    const list: PlatformCompat[] = [
      {
        name: 'Google Meet',
        category: 'Meetings & Interviews',
        requirements: ['WebRTC Audio/Video', 'Secure Connection (HTTPS)'],
        isCompatible: supportWebRTC && isHttps,
        statusText: supportWebRTC && isHttps ? 'Fully Compatible' : 'Incompatible (Check micro/camera permissions or protocol)',
        remedy: 'Make sure your browser has granted microphone permissions and that you are loading this diagnostics platform over HTTPS.'
      },
      {
        name: 'Zoom Web Client',
        category: 'Meetings & Interviews',
        requirements: ['WebAssembly Engine', 'SharedArrayBuffer (for advanced backgrounds)'],
        isCompatible: supportWasm,
        statusText: supportWasm ? (supportSharedBuffer ? 'Fully Compatible with Virtual Background' : 'Compatible (Virtual background restricted)') : 'Unsupported',
        remedy: 'Enable WebAssembly execution in your browser security profiles. Update Google Chrome to version 95+.'
      },
      {
        name: 'Microsoft Teams Web',
        category: 'Meetings & Interviews',
        requirements: ['WebRTC Media Streaming', 'AudioContext drivers'],
        isCompatible: supportWebRTC,
        statusText: supportWebRTC ? 'Fully Compatible' : 'Incomplete Driver Support',
        remedy: 'Enable media feature packs if using Windows N editions, or update your local browser kernel.'
      },
      {
        name: 'Fiverr & Upwork Platforms',
        category: 'Freelancing',
        requirements: ['Secure Cookie session managers', 'Websockets', 'TLS 1.3 encryption'],
        isCompatible: isHttps,
        statusText: isHttps ? 'Secure Session Ready' : 'Insecure Link detected',
        remedy: 'Ensure there is no DNS hijacking on your connection. Clear cache and cookies regularly.'
      },
      {
        name: 'ChatGPT & Gemini Portal',
        category: 'AI Services',
        requirements: ['Modern ES Modules', 'WebSockets streaming', 'Hardware acceleration'],
        isCompatible: supportWebGL,
        statusText: supportWebGL ? 'Optimized for high-speed AI' : 'Lag likely (No WebGL acceleration)',
        remedy: 'Navigate to Chrome Settings -> System -> Toggle "Use graphics acceleration when available" on and restart browser.'
      },
      {
        name: 'DeepSeek / Claude Portal',
        category: 'AI Services',
        requirements: ['Secure WebSocket streams', 'Fetch API streams'],
        isCompatible: supportWasm && isHttps,
        statusText: supportWasm && isHttps ? 'Fast Stream Ready' : 'Incompatible stream engines',
        remedy: 'Disable aggressive adblockers that might be stripping Server-Sent Events (SSE).'
      }
    ];

    setPlatformList(list);
    setLoading(false);
  }, []);

  const filtered = platformList.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-3 mb-4 gap-3">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-2 text-left">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          Remote Work Browser Compatibility
        </h4>

        {/* Search */}
        <div className="relative w-full sm:w-48">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search platform..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-muted/40 border border-border/60 rounded-lg pl-8 pr-3 py-1.5 text-[11px] placeholder:text-muted-foreground focus:outline-hidden focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 max-h-[380px] pr-1 scrollbar-thin text-left">
        {filtered.length > 0 ? (
          filtered.map((plat, idx) => (
            <div key={idx} className="bg-muted/10 border border-border/40 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/10">
                    {plat.category}
                  </span>
                  <h5 className="text-xs font-bold text-foreground">{plat.name}</h5>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {plat.requirements.map((req, i) => (
                    <span key={i} className="text-[9px] font-mono text-muted-foreground bg-muted/50 px-1.5 rounded">
                      • {req}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-1 flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  {plat.isCompatible ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                  )}
                  <span className={`text-[11px] font-bold ${plat.isCompatible ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {plat.statusText}
                  </span>
                </div>
                
                {!plat.isCompatible && plat.remedy && (
                  <p className="text-[9px] text-muted-foreground max-w-xs leading-normal sm:text-right mt-1">
                    💡 {plat.remedy}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="h-32 flex items-center justify-center text-muted-foreground text-xs">
            No platform matches your query.
          </div>
        )}
      </div>
    </div>
  );
}
