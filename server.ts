/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

// Since we compile this file using esbuild to CJS in production,
// let's define __dirname gracefully for both ESM and CJS environments.
let currentDirname = '';
try {
  currentDirname = path.dirname(fileURLToPath(import.meta.url));
} catch {
  currentDirname = __dirname;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON payload parser
  app.use(express.json());

  // API Routes (e.g. general diagnostic endpoint for network/backend sanity)
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      platform: process.platform,
      nodeVersion: process.version
    });
  });

  // AI-powered diagnostic recommendations endpoint using @google/genai
  app.post('/api/gemini/diagnose', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: 'Gemini API key is not configured. Please add GEMINI_API_KEY to your settings/secrets.'
        });
      }

      const { report, language } = req.body;
      if (!report) {
        return res.status(400).json({ error: 'Diagnostics report is required' });
      }

      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const langContext = language === 'urdu' 
        ? 'Reply in formal Urdu script (using beautiful descriptions)' 
        : language === 'roman-urdu' 
        ? 'Reply in Roman Urdu (Urdu written in English alphabets like: "Aapka internet slow hai")' 
        : 'Reply in English';

      const prompt = `Analyze this browser diagnostics report and generate a highly detailed, premium-grade Pakistan-optimized AI Recommendation Report.
      Focus on typical Pakistani network providers (PTCL, StormFiber, Nayatel, Jazz, Zong, Telenor), system challenges (load shedding, older laptops, thermal throttling, outdated browsers), and common remote work use cases (online interviews, Upwork/Fiverr freelancing, zoom, google meet).

      Diagnostic Data:
      - Overall Health Score: ${report.overallScore}/100
      - Platform: ${report.system?.platform || 'Unknown'}
      - Memory: ${report.system?.memoryGb || 'Unknown'} GB
      - CPU Logical Cores: ${report.system?.cpuCores || 'Unknown'}
      - Active ISP IP: ${report.network?.ip || 'Unknown'}
      - ISP/ASN: ${report.network?.asn || 'Unknown'}
      - Connection Details: ${report.network?.connectionType || 'Unknown'} (${report.network?.downlink || 'Unknown'})
      - Network RTT Latency: ${report.network?.latencyMs || 'Unknown'} ms
      - HTTPS Secured: ${report.privacy?.isHttps ? 'Yes' : 'No'}
      - WebRTC Leak: ${report.privacy?.webRtcIps?.length > 0 ? report.privacy.webRtcIps.join(', ') : 'No Leaks Detected'}
      - Findings/Issues: ${JSON.stringify(report.findings || [])}

      Generate a JSON response matching the following schema exactly (return ONLY valid JSON):
      {
        "overallInsight": "A high-level SaaS-style professional summary of the user's setup status, specifically mentioning their ISP if identifiable, and remote readiness.",
        "detectedProblems": [
          {
            "problem": "Name of the issue",
            "reason": "Why is this happening in Pakistan context?",
            "impact": "How it affects their Zoom/Fiverr/Upwork meetings or local experience",
            "solution": "Clear step-by-step resolution guide",
            "severity": "fail" | "warn" | "info",
            "estimatedFixTime": "e.g., 5 mins, 1 hour",
            "oneClickGuide": "Actionable prompt/tip"
          }
        ],
        "meetingReadyScore": 0-100 score,
        "freelancerReadyScore": 0-100 score,
        "onlineInterviewReadyScore": 0-100 score,
        "recommendedUpgrades": [
          {
            "category": "e.g., Hardware, Network, Software",
            "title": "Upgrade recommendation",
            "impactGain": "Estimated performance or connectivity improvement",
            "costEstimate": "Free, Low-cost, or Premium"
          }
        ],
        "estimatedGains": {
          "performanceScore": "+15% speed",
          "internetSpeed": "2x better ping",
          "meetingQuality": "No audio lag",
          "productivity": "Seamless multitasking"
        }
      }

      Language instruction: ${langContext}. Ensure the output JSON keys are strictly in English, but values are written in the target language (${language}). Return ONLY valid parsable JSON. No markdown codeblocks (\`\`\`json) or trailing text.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      });

      const responseText = response.text || '{}';
      try {
        const parsed = JSON.parse(responseText.trim());
        res.json(parsed);
      } catch (parseError) {
        console.error('Failed to parse Gemini JSON output. Raw output was:', responseText);
        res.status(500).json({ error: 'AI failed to generate a structured report. Please try again.', raw: responseText });
      }
    } catch (err: any) {
      console.error('Error in /api/gemini/diagnose:', err);
      res.status(500).json({ error: err.message || 'Server error' });
    }
  });

  // AI chat assistant endpoint
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: 'Gemini API key is not configured. Please add GEMINI_API_KEY to your settings/secrets.'
        });
      }

      const { messages, report, language } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Messages array is required' });
      }

      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const langContext = language === 'urdu' 
        ? 'Reply exclusively in Urdu using the formal Urdu script. Keep answers elegant and polite.' 
        : language === 'roman-urdu' 
        ? 'Reply exclusively in Roman Urdu (using English letters, e.g., "Aapka microphone blocks hai, setting check karein"). Keep it natural, conversational, and helpful.' 
        : 'Reply in professional, helpful English with friendly tones.';

      const formattedHistory = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      // Injects system context about the user's diagnostic report so the AI is extremely context-aware
      const systemInstruction = `You are "Pulse AI", an advanced diagnostics assistant optimized for Pakistan.
      A user is chatting with you about their system performance, network, and security diagnostics.

      Current User Diagnostic Profile:
      - Health Score: ${report?.overallScore || 'Not Scanned Yet'}/100
      - OS Platform: ${report?.system?.platform || 'Unknown'}
      - CPU logical threads: ${report?.system?.cpuCores || 'Unknown'}
      - Memory RAM: ${report?.system?.memoryGb || 'Unknown'} GB
      - Screen size: ${report?.system?.screenWidth || 'Unknown'}x${report?.system?.screenHeight || 'Unknown'} px
      - User ISP / Public IP: ${report?.network?.ip || 'Unknown'} (ASN: ${report?.network?.asn || 'Unknown'})
      - Local Connection quality: Type ${report?.network?.connectionType || 'Unknown'} with ${report?.network?.downlink || 'Unknown'} downlink and ${report?.network?.latencyMs || 'Unknown'} ms ping latency.
      - Adblock detected: ${report?.privacy?.adblockDetected ? 'Yes' : 'No'}
      - Secured Link (HTTPS): ${report?.privacy?.isHttps ? 'Yes' : 'No'}
      - WebRTC Leaked IP: ${report?.privacy?.webRtcIps?.join(', ') || 'None'}
      - Failed check points list: ${JSON.stringify(report?.findings || [])}

      Focus advice on typical Pakistani ISPs: PTCL (Broadband/GPON), StormFiber, Nayatel, Transworld, Jazz/Zong LTE. Include tips for load shedding (uninterruptible power supplies, router powerbanks), older laptops, thermal throttling, chrome hardware acceleration settings, microphone/camera permission resets in Windows/macOS/Chrome settings.

      Respond to the user's latest query under these instructions:
      1. ${langContext}
      2. Keep replies structured, concise, and professional. Use bullet points for steps.
      3. Always refer to their actual diagnostic stats from the profile when explaining why they are experiencing errors.
      4. Avoid engineering slang, keep it friendly and solution-focused.`;

      const chat = ai.chats.create({
        model: 'gemini-3.5-flash',
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7
        },
        // We can pass the history except the very last user message which is sent in the next chat.sendMessage call
        history: formattedHistory.slice(0, -1)
      });

      const lastMessageText = messages[messages.length - 1]?.content || '';
      const response = await chat.sendMessage({
        message: lastMessageText
      });

      res.json({ content: response.text });
    } catch (err: any) {
      console.error('Error in /api/gemini/chat:', err);
      res.status(500).json({ error: err.message || 'Server error' });
    }
  });

  // Serve static assets/Vite app depending on target environment
  if (process.env.NODE_ENV !== 'production') {
    console.log('Running Express server in development mode with Vite middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Running Express server in production mode serving static dist files...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Pulse Diagnostics backend server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
