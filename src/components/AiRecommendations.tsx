/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { DiagnosticsReport } from '../types';
import { Sparkles, RefreshCw, AlertTriangle, Play, HelpCircle, ArrowUpRight, TrendingUp, CheckCircle, Languages, Globe, Shield } from 'lucide-react';

interface AiRecommendationsProps {
  report: DiagnosticsReport | null;
}

interface DetectedProblem {
  problem: string;
  reason: string;
  impact: string;
  solution: string;
  severity: 'fail' | 'warn' | 'info';
  estimatedFixTime: string;
  oneClickGuide: string;
}

interface RecommendedUpgrade {
  category: string;
  title: string;
  impactGain: string;
  costEstimate: string;
}

interface AiReportData {
  overallInsight: string;
  detectedProblems: DetectedProblem[];
  meetingReadyScore: number;
  freelancerReadyScore: number;
  onlineInterviewReadyScore: number;
  recommendedUpgrades: RecommendedUpgrade[];
  estimatedGains: {
    performanceScore: string;
    internetSpeed: string;
    meetingQuality: string;
    productivity: string;
  };
}

export default function AiRecommendations({ report }: AiRecommendationsProps) {
  const [language, setLanguage] = useState<'english' | 'urdu' | 'roman-urdu'>('english');
  const [loading, setLoading] = useState<boolean>(false);
  const [aiData, setAiData] = useState<AiReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAiReport = async (lang = language) => {
    if (!report) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/gemini/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report, language: lang }),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch AI insights from Gemini API.');
      }
      const data = await response.json();
      setAiData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong while connecting with Gemini AI.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (report) {
      fetchAiReport();
    }
  }, [report]);

  const handleLanguageChange = (lang: 'english' | 'urdu' | 'roman-urdu') => {
    setLanguage(lang);
    fetchAiReport(lang);
  };

  const getSeverityBadge = (severity: 'fail' | 'warn' | 'info') => {
    switch (severity) {
      case 'fail':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      case 'warn':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'info':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    }
  };

  const renderCircularProgress = (score: number, label: string, colorClass: string) => {
    const strokeDashoffset = 251.2 - (251.2 * score) / 100;
    return (
      <div className="flex flex-col items-center gap-2 bg-muted/20 border border-border/40 p-4 rounded-2xl">
        <div className="relative w-20 h-20">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="32"
              className="stroke-muted fill-none"
              strokeWidth="6"
            />
            <circle
              cx="40"
              cy="40"
              r="32"
              className={`fill-none transition-all duration-1000 ease-out ${colorClass}`}
              strokeWidth="6"
              strokeDasharray="251.2"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-sm text-foreground">
            {score}%
          </div>
        </div>
        <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground text-center">
          {label}
        </span>
      </div>
    );
  };

  if (!report) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 shadow-xs animate-pulse">
        <div className="h-6 w-1/3 bg-muted/40 rounded mb-4" />
        <div className="h-48 bg-muted/40 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xs flex flex-col justify-between h-full">
      {/* Header & Language Select */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4 mb-5 gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-500 animate-pulse" />
          <div className="text-left">
            <h4 className="text-sm font-bold text-foreground">AI Intelligence & Optimization Engine</h4>
            <p className="text-xs text-muted-foreground">Premium diagnostic recommendations calibrated for Pakistan</p>
          </div>
        </div>

        {/* Multi-Language Selector */}
        <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-xl border border-border/60 self-start sm:self-auto">
          <Languages className="h-3.5 w-3.5 text-muted-foreground ml-1" />
          <button
            onClick={() => handleLanguageChange('english')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              language === 'english' ? 'bg-card text-emerald-400 border border-border' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            English
          </button>
          <button
            onClick={() => handleLanguageChange('urdu')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              language === 'urdu' ? 'bg-card text-emerald-400 border border-border' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            اردو
          </button>
          <button
            onClick={() => handleLanguageChange('roman-urdu')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              language === 'roman-urdu' ? 'bg-card text-emerald-400 border border-border' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Roman Urdu
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <RefreshCw className="h-8 w-8 text-emerald-500 animate-spin" />
          <span className="text-xs text-muted-foreground font-mono">GEMINI IS SYNTHESIZING RECOMMENDATIONS FOR {report.network?.ip}...</span>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-500/5 border border-rose-500/15 rounded-2xl text-center flex flex-col items-center gap-3">
          <AlertTriangle className="h-8 w-8 text-rose-400" />
          <p className="text-xs text-muted-foreground font-semibold">{error}</p>
          <button
            onClick={() => fetchAiReport()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
          >
            Retry Diagnostics Synthesis
          </button>
        </div>
      ) : aiData ? (
        <div className="space-y-6">
          {/* Top Score Bento Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {renderCircularProgress(report.overallScore, 'Overall Health', 'stroke-emerald-500')}
            {renderCircularProgress(aiData.meetingReadyScore || 85, 'Meeting Ready', 'stroke-teal-500')}
            {renderCircularProgress(aiData.freelancerReadyScore || 90, 'Freelancer Ready', 'stroke-blue-500')}
            {renderCircularProgress(aiData.onlineInterviewReadyScore || 80, 'Interview Ready', 'stroke-indigo-500')}
          </div>

          {/* AI Insights & Overall Overview */}
          <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-4 text-left">
            <h5 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Pulse AI Executive Assessment
            </h5>
            <p className="text-xs text-foreground/90 leading-relaxed font-sans">{aiData.overallInsight}</p>
          </div>

          {/* Detailed Problems & Fix Solutions Grid */}
          <div className="space-y-3">
            <h5 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider text-left">
              Detected System & Network Issues Audit
            </h5>
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
              {aiData.detectedProblems && aiData.detectedProblems.length > 0 ? (
                aiData.detectedProblems.map((prob, idx) => (
                  <div key={idx} className="bg-muted/15 border border-border/50 rounded-2xl p-4 flex flex-col gap-3 text-left">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${getSeverityBadge(prob.severity)}`}>
                          {prob.severity}
                        </span>
                        <h6 className="text-xs font-bold text-foreground">{prob.problem}</h6>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded">
                        Est. Fix: {prob.estimatedFixTime}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mt-1">
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-muted-foreground">Reason & Impact:</span>
                        <p className="text-muted-foreground leading-normal">{prob.reason}</p>
                        <p className="text-rose-400/90 font-medium leading-normal italic">{prob.impact}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-muted-foreground">Step-by-Step Solution:</span>
                        <p className="text-foreground/95 leading-normal font-sans">{prob.solution}</p>
                      </div>
                    </div>

                    {prob.oneClickGuide && (
                      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-2.5 flex items-center justify-between mt-1">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Solution Blueprint Guide</span>
                        <span className="text-[10px] text-muted-foreground italic">{prob.oneClickGuide}</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6 text-center flex flex-col items-center gap-2">
                  <CheckCircle className="h-8 w-8 text-emerald-400" />
                  <span className="text-xs font-bold text-foreground">Perfect National Performance Confirmed</span>
                  <p className="text-[11px] text-muted-foreground max-w-md">No bottlenecks detected. Your network routing is clean.</p>
                </div>
              )}
            </div>
          </div>

          {/* Recommended Upgrades & Estimated Performance Gains */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            {/* Recommended Upgrades */}
            <div className="bg-muted/10 border border-border/50 rounded-2xl p-4 flex flex-col gap-3">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Recommended Upgrades</span>
              <div className="space-y-2">
                {aiData.recommendedUpgrades && aiData.recommendedUpgrades.map((up, idx) => (
                  <div key={idx} className="bg-card border border-border/40 p-2.5 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <span className="text-[9px] font-bold uppercase text-emerald-400 block">{up.category}</span>
                      <span className="font-semibold text-foreground">{up.title}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-muted-foreground block text-[10px]">{up.impactGain}</span>
                      <span className="text-[9px] font-mono font-bold bg-muted/60 px-1.5 py-0.2 rounded mt-0.5 inline-block">{up.costEstimate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Estimated Gains */}
            <div className="bg-muted/10 border border-border/50 rounded-2xl p-4 flex flex-col gap-3 justify-between">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Estimated Quality Improvement</span>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-card border border-border/40 p-3 rounded-xl flex items-center gap-2.5">
                  <TrendingUp className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <div>
                    <span className="text-[9px] text-muted-foreground block">System Performance</span>
                    <span className="text-xs font-bold text-foreground">{aiData.estimatedGains?.performanceScore || '+15%'}</span>
                  </div>
                </div>
                <div className="bg-card border border-border/40 p-3 rounded-xl flex items-center gap-2.5">
                  <Globe className="h-4 w-4 text-teal-400 flex-shrink-0" />
                  <div>
                    <span className="text-[9px] text-muted-foreground block">ISP Latency</span>
                    <span className="text-xs font-bold text-foreground">{aiData.estimatedGains?.internetSpeed || '30% Less Ping'}</span>
                  </div>
                </div>
                <div className="bg-card border border-border/40 p-3 rounded-xl flex items-center gap-2.5">
                  <Shield className="h-4 w-4 text-blue-400 flex-shrink-0" />
                  <div>
                    <span className="text-[9px] text-muted-foreground block">Meeting Stability</span>
                    <span className="text-xs font-bold text-foreground">{aiData.estimatedGains?.meetingQuality || 'HD Video'}</span>
                  </div>
                </div>
                <div className="bg-card border border-border/40 p-3 rounded-xl flex items-center gap-2.5">
                  <ArrowUpRight className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                  <div>
                    <span className="text-[9px] text-muted-foreground block">Productivity Gain</span>
                    <span className="text-xs font-bold text-foreground">{aiData.estimatedGains?.productivity || 'Smoother Tasks'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Sparkles className="h-6 w-6 text-emerald-500" />
          <p className="text-xs text-muted-foreground">Click below to synthesize a custom AI report.</p>
          <button
            onClick={() => fetchAiReport()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Generate AI Report
          </button>
        </div>
      )}
    </div>
  );
}
