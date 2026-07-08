/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Video, Mic, VideoOff, RefreshCw, AlertCircle, CheckCircle2, Volume2, ShieldCheck } from 'lucide-react';

export default function MediaDiagnostic() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [hasPermission, setHasPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [selectedVideo, setSelectedVideo] = useState<string>('');
  const [selectedAudio, setSelectedAudio] = useState<string>('');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  // Enumerate active audio/video hardware
  const listDevices = async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      setDevices(allDevices);
      
      // Auto-select first devices if not selected
      const videoDevs = allDevices.filter((d) => d.kind === 'videoinput');
      const audioDevs = allDevices.filter((d) => d.kind === 'audioinput');
      
      if (videoDevs.length > 0 && !selectedVideo) setSelectedVideo(videoDevs[0].deviceId);
      if (audioDevs.length > 0 && !selectedAudio) setSelectedAudio(audioDevs[0].deviceId);
    } catch {
      // ignore
    }
  };

  // Start real webcam & microphone diagnostic streams
  const startDiagnostics = async () => {
    setIsInitializing(true);
    setErrorMsg('');
    stopDiagnostics(); // cleanup existing

    try {
      const constraints: MediaStreamConstraints = {
        video: selectedVideo ? { deviceId: { exact: selectedVideo } } : true,
        audio: selectedAudio ? { deviceId: { exact: selectedAudio } } : true,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      streamRef.current = mediaStream;
      setHasPermission('granted');

      // Bind stream to HTML5 Video Element
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Start Audio WebAPI level inspector
      setupAudioInspector(mediaStream);

      // Refresh list to see proper device hardware labels now that permission is allowed
      await listDevices();
    } catch (err: any) {
      console.error('Media stream initialization failed:', err);
      setHasPermission('denied');
      if (err.name === 'NotAllowedError') {
        setErrorMsg('Microphone/Webcam permission denied by browser. Reset site settings to test hardware.');
      } else if (err.name === 'NotFoundError') {
        setErrorMsg('No available microphone or webcam hardware found on this machine.');
      } else {
        setErrorMsg('Could not start media stream. Hardware might be active in another window.');
      }
    } finally {
      setIsInitializing(false);
    }
  };

  // Setup Web Audio API node to read microphone real-time levels
  const setupAudioInspector = (mediaStream: MediaStream) => {
    try {
      const audioTracks = mediaStream.getAudioTracks();
      if (audioTracks.length === 0) return;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const source = ctx.createMediaStreamSource(mediaStream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;

      source.connect(analyser);

      audioContextRef.current = ctx;
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        // Map average audio output value to a percentage (0-100)
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animationRef.current = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch {
      // ignored
    }
  };

  // Stop media stream tracks cleanly so webcam LED goes OFF immediately!
  const stopDiagnostics = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setStream(null);
    setAudioLevel(0);
  };

  // Track state transitions & cleanup on component unmount
  useEffect(() => {
    listDevices();
    return () => {
      stopDiagnostics();
    };
  }, []);

  // Hot switch devices on dropdown selections
  useEffect(() => {
    if (stream) {
      startDiagnostics(); // hot restart with new configuration
    }
  }, [selectedVideo, selectedAudio]);

  const videoDevices = devices.filter((d) => d.kind === 'videoinput');
  const audioDevices = devices.filter((d) => d.kind === 'audioinput');

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xs h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Video className="h-4 w-4 text-teal-500" />
          Camera & Audio Diagnostic Suite
        </h4>
        <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">W3C MEDIASTREAM</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto">
        {/* Left: Device Controls & Status indicators (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-muted/10 border border-border/50 rounded-xl p-3 flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Diagnostics Control</span>
            <p className="text-xs text-muted-foreground/90 leading-relaxed">
              Verify video feed, permissions, and audio signals prior to launching calls or screen shares.
            </p>
          </div>

          {/* Video Dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Select Video Source</label>
            <select
              value={selectedVideo}
              onChange={(e) => setSelectedVideo(e.target.value)}
              className="w-full bg-muted/30 border border-border/80 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl px-3 py-2 text-xs text-foreground outline-hidden"
            >
              {videoDevices.length === 0 ? (
                <option value="">No cameras detected</option>
              ) : (
                videoDevices.map((d, i) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `Webcam Hardware #${i + 1}`}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Audio Dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Select Microphone</label>
            <select
              value={selectedAudio}
              onChange={(e) => setSelectedAudio(e.target.value)}
              className="w-full bg-muted/30 border border-border/80 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl px-3 py-2 text-xs text-foreground outline-hidden"
            >
              {audioDevices.length === 0 ? (
                <option value="">No microphones detected</option>
              ) : (
                audioDevices.map((d, i) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `Microphone Hardware #${i + 1}`}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Trigger button actions */}
          <div className="flex gap-2">
            {!stream ? (
              <button
                onClick={startDiagnostics}
                disabled={isInitializing}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-500 text-slate-900 dark:text-white font-bold rounded-xl text-xs tracking-wide transition duration-150 cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {isInitializing ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>LAUNCHING MEDIA...</span>
                  </>
                ) : (
                  <>
                    <Video className="h-3.5 w-3.5" />
                    <span>START TESTING</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={stopDiagnostics}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs tracking-wide transition duration-150 cursor-pointer shadow-xs"
              >
                <VideoOff className="h-3.5 w-3.5" />
                <span>TERMINATE SHARING</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: Actual Stream canvas preview & Audio VU Meter (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="relative bg-black/95 rounded-xl border border-border overflow-hidden aspect-video w-full flex items-center justify-center">
            {stream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              <div className="text-center text-muted-foreground p-6">
                <VideoOff className="h-10 w-10 mx-auto mb-2 opacity-30 text-rose-500" />
                <h5 className="text-xs font-bold text-foreground">Media Stream Inactive</h5>
                <p className="text-[11px] text-muted-foreground mt-1 max-w-[200px] mx-auto">
                  Click 'Start Testing' to open local camera preview safely.
                </p>
              </div>
            )}

            {/* Permission badges over video */}
            <div className="absolute top-3 left-3 flex gap-1.5 z-10">
              {hasPermission === 'granted' && (
                <span className="flex items-center gap-1.5 text-[9px] font-bold tracking-wider uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/90 text-white shadow-xs">
                  <ShieldCheck className="h-3 w-3" />
                  PERMISSIONS OK
                </span>
              )}
              {hasPermission === 'denied' && (
                <span className="flex items-center gap-1.5 text-[9px] font-bold tracking-wider uppercase font-mono px-2 py-0.5 rounded-full bg-rose-500/90 text-white shadow-xs">
                  <AlertCircle className="h-3 w-3" />
                  BLOCKED
                </span>
              )}
            </div>
          </div>

          {/* Microphone VU DB level meter */}
          <div className="bg-muted/10 border border-border/40 rounded-xl p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <Mic className="h-3.5 w-3.5 text-teal-500" />
                Mic Input Level
              </span>
              <span className="font-mono">{audioLevel > 0 ? `${audioLevel}% Volume` : 'Silence'}</span>
            </div>
            
            {/* VU progress track */}
            <div className="w-full h-3 bg-muted/40 rounded-full overflow-hidden border border-border/30 relative">
              <div
                className={`h-full transition-all duration-75 rounded-full bg-linear-to-r from-teal-500 via-emerald-400 to-amber-400`}
                style={{ width: `${audioLevel}%` }}
              />
              {/* Scale Tick indicators */}
              <div className="absolute inset-y-0 left-1/4 w-[1px] bg-border/40" />
              <div className="absolute inset-y-0 left-2/4 w-[1px] bg-border/40" />
              <div className="absolute inset-y-0 left-3/4 w-[1px] bg-border/40" />
            </div>
          </div>

          {/* Failure Alert Messages */}
          {errorMsg && (
            <div className="flex gap-2.5 items-start p-3 bg-rose-500/5 border border-rose-500/15 rounded-xl text-xs text-rose-500">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p className="leading-relaxed font-semibold">{errorMsg}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
