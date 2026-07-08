/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { DiagnosticsReport } from '../types';
import { User, Mail, Shield, History, Bookmark, Settings, LogIn, LogOut, CheckCircle2, Star, Award, Trash2 } from 'lucide-react';

interface UserAccountHubProps {
  report: DiagnosticsReport | null;
}

interface HistoricalScan {
  id: string;
  timestamp: string;
  score: number;
  ip: string;
  failuresCount: number;
  bookmarked: boolean;
}

export default function UserAccountHub({ report }: UserAccountHubProps) {
  const [user, setUser] = useState<{ name: string; email: string; avatar: string; plan: string } | null>(null);
  const [emailInput, setEmailInput] = useState<string>('');
  const [nameInput, setNameInput] = useState<string>('');
  const [history, setHistory] = useState<HistoricalScan[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'preferences'>('profile');

  // Load simulated user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('pulse_sim_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Load simulated diagnostic history
    const savedHistory = localStorage.getItem('pulse_sim_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    } else {
      // Seed initial history
      const seedHistory: HistoricalScan[] = [
        { id: '1', timestamp: '2026-07-01 14:32', score: 92, ip: '182.180.12.35', failuresCount: 1, bookmarked: true },
        { id: '2', timestamp: '2026-07-04 09:15', score: 76, ip: '39.42.158.91', failuresCount: 3, bookmarked: false },
      ];
      setHistory(seedHistory);
      localStorage.setItem('pulse_sim_history', JSON.stringify(seedHistory));
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    const newUser = {
      name: nameInput.trim() || 'Pakistani Professional',
      email: emailInput.trim(),
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80`,
      plan: 'Professional Developer Plan'
    };

    setUser(newUser);
    localStorage.setItem('pulse_sim_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('pulse_sim_user');
  };

  const handleSaveCurrentScan = () => {
    if (!report) return;
    const newScan: HistoricalScan = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      score: report.overallScore,
      ip: report.network?.ip || '127.0.0.1',
      failuresCount: report.findings?.length || 0,
      bookmarked: false
    };

    const updated = [newScan, ...history];
    setHistory(updated);
    localStorage.setItem('pulse_sim_history', JSON.stringify(updated));
  };

  const toggleBookmark = (id: string) => {
    const updated = history.map(h => h.id === id ? { ...h, bookmarked: !h.bookmarked } : h);
    setHistory(updated);
    localStorage.setItem('pulse_sim_history', JSON.stringify(updated));
  };

  const deleteHistoryItem = (id: string) => {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem('pulse_sim_history', JSON.stringify(updated));
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Shield className="h-4 w-4 text-emerald-500" />
          User Account & Diagnostics Ledger
        </h4>
        <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">SECURE PROFILE</span>
      </div>

      {!user ? (
        /* LOGIN PORTAL SCREEN */
        <div className="max-w-sm mx-auto w-full my-auto text-left space-y-4">
          <div className="text-center space-y-1 mb-2">
            <h5 className="text-xs font-bold text-foreground">Sign In to Save Historical Scans</h5>
            <p className="text-[10px] text-muted-foreground leading-normal">
              Store your internet connection pings and system benchmark history securely to track network routing improvements.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Full Name</label>
              <input
                type="text"
                placeholder="Muhammad Ali"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full bg-muted/30 border border-border/80 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs outline-hidden placeholder:text-muted-foreground/60"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Email Address</label>
              <input
                type="email"
                required
                placeholder="ali@domain.pk"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full bg-muted/30 border border-border/80 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs outline-hidden placeholder:text-muted-foreground/60"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs tracking-wide transition duration-150 cursor-pointer flex items-center justify-center gap-2"
            >
              <LogIn className="h-3.5 w-3.5" />
              Sign In to Pulse Account
            </button>
          </form>
        </div>
      ) : (
        /* SECURE DASHBOARD PROFILE SCREEN */
        <div className="flex-1 flex flex-col justify-between text-left">
          {/* Tabs Menu */}
          <div className="flex gap-2 border-b border-border/40 pb-2 mb-4">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition ${
                activeTab === 'profile' ? 'bg-muted/60 text-emerald-400 border border-border' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              My Profile
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition ${
                activeTab === 'history' ? 'bg-muted/60 text-emerald-400 border border-border' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Scan History
            </button>
          </div>

          <div className="flex-1 my-auto">
            {activeTab === 'profile' && (
              <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                {/* Profile Pic placeholder */}
                <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl font-bold flex-shrink-0">
                  {user.name.charAt(0)}
                </div>

                <div className="space-y-1">
                  <h5 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    {user.name}
                    <span className="text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded uppercase tracking-wider">
                      PRO CERTIFIED
                    </span>
                  </h5>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  
                  <div className="flex gap-2 mt-2">
                    <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded">
                      Plan: {user.plan}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Historical Scans Logs</span>
                  {report && (
                    <button
                      onClick={handleSaveCurrentScan}
                      className="text-[10px] text-emerald-400 font-bold hover:underline cursor-pointer"
                    >
                      + Save Current Scan
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 scrollbar-thin">
                  {history.map((h) => (
                    <div key={h.id} className="bg-muted/15 border border-border/40 p-2.5 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold block text-foreground">Score: {h.score}/100</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{h.timestamp} | IP: {h.ip}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleBookmark(h.id)}
                          className="p-1 hover:bg-muted/60 rounded text-muted-foreground hover:text-amber-400 cursor-pointer"
                        >
                          <Star className={`h-3.5 w-3.5 ${h.bookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </button>
                        <button
                          onClick={() => deleteHistoryItem(h.id)}
                          className="p-1 hover:bg-muted/60 rounded text-muted-foreground hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border/40 pt-3 mt-4 flex justify-between items-center">
            <span className="text-[10px] font-mono text-muted-foreground uppercase">SECURED BY SSL</span>
            <button
              onClick={handleLogout}
              className="text-[10px] text-rose-400 font-bold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <LogOut className="h-3 w-3" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
