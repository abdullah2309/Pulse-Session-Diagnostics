/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { DiagnosticsReport } from '../types';
import { Sparkles, Send, User, Bot, RefreshCw, Languages, HelpCircle, ArrowRight } from 'lucide-react';

interface AiChatAssistantProps {
  report: DiagnosticsReport | null;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function AiChatAssistant({ report }: AiChatAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "As-salamu alaykum! I am Pulse AI, your advanced technical companion in Pakistan. I can explain your diagnostic results, help troubleshoot microsecond ping delays, resolve PTCL/StormFiber routing, fix camera/mic access permissions, or optimize your setup for online freelancing (Fiverr, Upwork) and meetings (Zoom, Google Meet). Ask me anything!",
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [language, setLanguage] = useState<'english' | 'urdu' | 'roman-urdu'>('english');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const suggestionPills = [
    { label: 'Why is my browser slow?', query: 'Why is my browser slow and how can I optimize hardware acceleration?' },
    { label: 'PTCL / StormFiber lag', query: 'My PTCL/StormFiber connection is unstable. How do I fix packet routing or change DNS for Zoom/gaming?' },
    { label: 'Microphone permission issue', query: 'Google Meet cannot access my microphone. Give me step-by-step Windows/Chrome fix.' },
    { label: 'Fiverr / Remote Work status', query: 'Is my system and network ready for high-paying remote freelance jobs on Upwork/Fiverr?' },
  ];

  const handleLanguageChange = (lang: 'english' | 'urdu' | 'roman-urdu') => {
    setLanguage(lang);
    let greeting = '';
    if (lang === 'urdu') {
      greeting = "السلام علیکم! میں پلس اے آئی ہوں، آپ کا پاکستانی ٹیکنیکل اسسٹنٹ۔ میں آپ کے انٹرنیٹ سپیڈ، پی ٹی سی ایل یا نیاٹیل راؤٹنگ، مائیکروفون اور کیمرہ سیٹنگز، اور اپ ورک یا فائور کے لیے آپ کے کمپیوٹر کی تیاری کے مسائل حل کر سکتا ہوں۔ کوئی بھی سوال پوچھیے!";
    } else if (lang === 'roman-urdu') {
      greeting = "As-salamu alaykum! Main Pulse AI hoon. Aapki system performance, internet speed (PTCL/StormFiber/Nayatel/Jazz/Zong), browser camera/microphone blockages, aur Fiverr/Upwork remote work readiness ki complete guidance de sakta hoon. Koi bhi sawaal puchiye!";
    } else {
      greeting = "As-salamu alaykum! I am Pulse AI, your advanced technical companion in Pakistan. I can explain your diagnostic results, help troubleshoot microsecond ping delays, resolve PTCL/StormFiber routing, fix camera/mic access permissions, or optimize your setup for online freelancing (Fiverr, Upwork) and meetings (Zoom, Google Meet). Ask me anything!";
    }
    setMessages([
      {
        id: 'welcome-' + lang,
        role: 'assistant',
        content: greeting
      }
    ]);
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend = input) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const chatHistory = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatHistory,
          report,
          language
        })
      });

      if (!res.ok) {
        throw new Error('Could not get a response from Pulse AI. Please check your network connection.');
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content || "I apologize, but I received an empty response. Please try asking again."
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `⚠️ Error: ${err.message || 'AI processing server-side failure. Please make sure GEMINI_API_KEY is configured in Settings > Secrets.'}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xs flex flex-col h-[520px] justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-3 mb-4 gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-500 animate-pulse" />
          <div className="text-left">
            <h4 className="text-sm font-bold text-foreground">Pulse AI Companion</h4>
            <p className="text-[10px] text-muted-foreground font-medium">Real-time troubleshooting based on your diagnostic signals</p>
          </div>
        </div>

        {/* Assistant Language */}
        <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-xl border border-border/60 self-start sm:self-auto">
          <Languages className="h-3 w-3 text-muted-foreground ml-1" />
          <button
            onClick={() => handleLanguageChange('english')}
            className={`px-2 py-0.5 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
              language === 'english' ? 'bg-card text-emerald-400 border border-border' : 'text-muted-foreground'
            }`}
          >
            English
          </button>
          <button
            onClick={() => handleLanguageChange('urdu')}
            className={`px-2 py-0.5 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
              language === 'urdu' ? 'bg-card text-emerald-400 border border-border' : 'text-muted-foreground'
            }`}
          >
            اردو
          </button>
          <button
            onClick={() => handleLanguageChange('roman-urdu')}
            className={`px-2 py-0.5 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
              language === 'roman-urdu' ? 'bg-card text-emerald-400 border border-border' : 'text-muted-foreground'
            }`}
          >
            Roman Urdu
          </button>
        </div>
      </div>

      {/* Message Screen */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scroll-smooth flex flex-col justify-start pb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[85%] text-left ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
          >
            {/* Avatar */}
            <div className={`h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-muted/60 border border-border'
            }`}>
              {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-emerald-500" />}
            </div>

            {/* Bubble */}
            <div className={`p-3 rounded-2xl text-xs leading-relaxed font-sans ${
              msg.role === 'user'
                ? 'bg-emerald-600 text-white rounded-tr-xs'
                : 'bg-muted/20 border border-border/50 text-foreground rounded-tl-xs'
            }`}>
              {msg.content.split('\n').map((line, i) => (
                <p key={i} className={i > 0 ? 'mt-1.5' : ''}>{line}</p>
              ))}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 self-start max-w-[85%] text-left">
            <div className="h-8 w-8 rounded-xl bg-muted/60 border border-border flex items-center justify-center">
              <Bot className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="bg-muted/20 border border-border/50 p-3 rounded-2xl rounded-tl-xs flex items-center gap-2">
              <RefreshCw className="h-3.5 w-3.5 text-emerald-500 animate-spin" />
              <span className="text-[10px] text-muted-foreground font-mono">Pulse AI is thinking...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggestion Pills */}
      {messages.length === 1 && !loading && (
        <div className="mb-3">
          <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider mb-1.5 block text-left">Troubleshooting suggestions</span>
          <div className="flex flex-wrap gap-1.5">
            {suggestionPills.map((pill, i) => (
              <button
                key={i}
                onClick={() => {
                  setInput(pill.query);
                  handleSend(pill.query);
                }}
                className="bg-muted/45 border border-border/60 hover:bg-muted/80 text-foreground transition-all px-2.5 py-1.5 rounded-xl text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
              >
                {pill.label}
                <ArrowRight className="h-2.5 w-2.5 text-emerald-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Input Field */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={loading}
          placeholder="Ask a question about your system health, internet latency..."
          className="flex-1 bg-muted/30 border border-border/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-hidden transition"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition duration-150 flex items-center justify-center cursor-pointer disabled:opacity-40 shadow-xs"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
