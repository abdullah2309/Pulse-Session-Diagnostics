/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  SystemInfo,
  BrowserInfo,
  NetworkInfo,
  PrivacyInfo,
  Finding,
  VerificationItem,
  DiagnosticsReport,
} from '../types';

/**
 * Perform a head-request latency check.
 * We hit our own root path 3 times to compute average RTT latency.
 */
export const measureLatency = async (): Promise<number> => {
  const pings: number[] = [];
  const url = `/?t=${Date.now()}`;
  for (let i = 0; i < 3; i++) {
    const start = performance.now();
    try {
      await fetch(url, { method: 'HEAD', cache: 'no-store' });
      pings.push(performance.now() - start);
    } catch {
      // Offline or request failed
    }
  }
  if (pings.length === 0) return 0;
  const sum = pings.reduce((a, b) => a + b, 0);
  return Math.round(sum / pings.length);
};

/**
 * Detect WebRTC IP Leak.
 * Creates a mock peer connection to read ICE candidates.
 */
export const getWebRtcIps = (): Promise<string[]> => {
  return new Promise((resolve) => {
    const ips: string[] = [];
    const RTCPeerConnection =
      window.RTCPeerConnection ||
      (window as any).webkitRTCPeerConnection ||
      (window as any).mozRTCPeerConnection;

    if (!RTCPeerConnection) {
      resolve([]);
      return;
    }

    try {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });

      pc.createDataChannel('');
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch(() => {});

      pc.onicecandidate = (ice) => {
        if (!ice || !ice.candidate || !ice.candidate.candidate) {
          resolve(Array.from(new Set(ips)));
          pc.close();
          return;
        }
        const candidate = ice.candidate.candidate;
        // Match standard IPv4 and IPv6 patterns
        const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/i;
        const match = candidate.match(ipRegex);
        if (match) {
          ips.push(match[1]);
        }
      };

      // Guard fallback timeout
      setTimeout(() => {
        resolve(Array.from(new Set(ips)));
        try {
          pc.close();
        } catch {
          // ignore
        }
      }, 1500);
    } catch {
      resolve([]);
    }
  });
};

/**
 * Detect Adblock status.
 * Attempts to load a standard tracking script URL with HEAD.
 */
export const detectAdblock = async (): Promise<boolean> => {
  try {
    const url = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
    const response = await fetch(new Request(url), {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store',
    });
    return false; // Load worked, adblock not blocking Google Ad service
  } catch {
    return true; // Likely blocked by privacy extension
  }
};

/**
 * Check if 3rd party cookies are enabled.
 * Uses the modern storage access API or cookie fallback.
 */
export const checkThirdPartyCookies = async (): Promise<boolean> => {
  if (typeof (document as any).hasStorageAccess === 'function') {
    try {
      return await (document as any).hasStorageAccess();
    } catch {
      return false;
    }
  }
  try {
    document.cookie = 'pulse_third_party=1; SameSite=None; Secure';
    const enabled = document.cookie.indexOf('pulse_third_party=1') !== -1;
    document.cookie = 'pulse_third_party=; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=None; Secure';
    return enabled;
  } catch {
    return false;
  }
};

/**
 * Checks general permissions via the Navigator Permissions API.
 */
const checkPermission = async (name: PermissionName): Promise<string> => {
  if (!navigator.permissions) return 'unavailable';
  try {
    const result = await navigator.permissions.query({ name });
    return result.state; // 'granted', 'denied', 'prompt'
  } catch {
    return 'unavailable';
  }
};

/**
 * Main Diagnostics Runner.
 * Executes both synchronous reads and asynchronous fetches.
 */
export const runDiagnostics = async (
  onProgress?: (step: string) => void
): Promise<DiagnosticsReport> => {
  onProgress?.('Inspecting Device & OS specs...');
  
  // 1. System Info
  const system: SystemInfo = {
    userAgent: navigator.userAgent,
    platform: navigator.platform || (navigator as any).userAgentData?.platform || 'Unknown',
    cpuCores: navigator.hardwareConcurrency || 'Unavailable',
    memoryGb: (navigator as any).deviceMemory || 'Unavailable',
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    devicePixelRatio: parseFloat(window.devicePixelRatio.toFixed(2)),
    colorDepth: window.screen.colorDepth,
    touchPoints: navigator.maxTouchPoints || 0,
    orientation: window.screen.orientation?.type || 
      (window.innerHeight > window.innerWidth ? 'portrait-primary' : 'landscape-primary'),
  };

  onProgress?.('Retrieving Storage & Cache configurations...');

  // 2. Browser Info
  let quotaMb: number | string = 'Unavailable';
  let usageMb: number | string = 'Unavailable';
  if (navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      if (estimate.quota) quotaMb = Math.round(estimate.quota / (1024 * 1024));
      if (estimate.usage !== undefined) usageMb = parseFloat((estimate.usage / (1024 * 1024)).toFixed(2));
    } catch {
      // ignored
    }
  }

  const browser: BrowserInfo = {
    vendor: navigator.vendor || 'Unknown',
    languages: [...navigator.languages],
    cookiesEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack || (window as any).doNotTrack || null,
    pdfViewerEnabled: navigator.pdfViewerEnabled || false,
    storageQuotaMb: quotaMb,
    storageUsageMb: usageMb,
    serviceWorkerSupported: 'serviceWorker' in navigator,
  };

  onProgress?.('Fetching Network Location & Public IP...');

  // 3. Network Info
  let networkData = {
    ip: 'Offline / Failed',
    asn: 'Unavailable',
    country: 'Unavailable',
    city: 'Unavailable',
    region: 'Unavailable',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unavailable',
  };

  if (navigator.onLine) {
    try {
      const res = await fetch('https://ipapi.co/json/', {
        signal: AbortSignal.timeout(4000), // timeout after 4s to prevent hanging
      });
      if (res.ok) {
        const json = await res.json();
        networkData = {
          ip: json.ip || 'Unavailable',
          asn: json.asn || 'Unavailable',
          country: json.country_name || json.country || 'Unavailable',
          city: json.city || 'Unavailable',
          region: json.region || 'Unavailable',
          timezone: json.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unavailable',
        };
      }
    } catch {
      // Degrade gracefully if network blocks it or limit reached
    }
  }

  const conn = (navigator as any).connection;
  const network: NetworkInfo = {
    ...networkData,
    locale: navigator.language || 'en-US',
    connectionType: conn?.type || conn?.effectiveType || 'Unknown',
    downlink: conn?.downlink ? `${conn.downlink} Mbps` : 'Unknown',
    rtt: conn?.rtt ? `${conn.rtt} ms` : 'Unknown',
    online: navigator.onLine,
    latencyMs: null, // calculated below
  };

  onProgress?.('Measuring connection latency...');
  if (navigator.onLine) {
    network.latencyMs = await measureLatency();
  }

  onProgress?.('Running Security checks & WebRTC leakage audit...');

  // 4. Privacy & Security
  const isHttps = window.location.protocol === 'https:';
  const webRtcIps = await getWebRtcIps();
  const adblockDetected = await detectAdblock();
  const thirdPartyCookiesEnabled = await checkThirdPartyCookies();

  onProgress?.('Evaluating Browser permissions snapshot...');
  const geolocationPerm = await checkPermission('geolocation');
  const notificationsPerm = await checkPermission('notifications');
  const cameraPerm = await checkPermission('camera' as PermissionName);

  const privacy: PrivacyInfo = {
    isHttps,
    webRtcIps,
    adblockDetected,
    thirdPartyCookiesEnabled,
    permissions: {
      geolocation: geolocationPerm,
      notifications: notificationsPerm,
      camera: cameraPerm,
    },
  };

  onProgress?.('Synthesizing session metrics and findings...');

  // 5. Verification Pipeline Construction
  const pipeline: VerificationItem[] = [
    {
      id: 'https',
      name: 'HTTPS Encrypted Link',
      status: isHttps ? 'pass' : 'fail',
      details: isHttps ? 'Connection is secure and encrypted.' : 'Connection is unencrypted and insecure!',
    },
    {
      id: 'webrtc',
      name: 'WebRTC Leak Protection',
      status: webRtcIps.length === 0 ? 'pass' : 'warn',
      details: webRtcIps.length === 0
        ? 'No private IP addresses exposed via RTCPeerConnection.'
        : `Local network IP leaked: ${webRtcIps.join(', ')}`,
    },
    {
      id: 'adblock',
      name: 'Ad & Tracker Blocker',
      status: adblockDetected ? 'pass' : 'warn',
      details: adblockDetected
        ? 'Adblock is active. Telemetry and scripts are filtered.'
        : 'Adblocker was not detected. Advertising scripts load freely.',
    },
    {
      id: 'dnt',
      name: 'Do Not Track (DNT) Signal',
      status: browser.doNotTrack === '1' ? 'pass' : 'warn',
      details: browser.doNotTrack === '1'
        ? 'DNT signal is active and header sent.'
        : 'DNT signal is off or unhandled by browser.',
    },
    {
      id: 'cookies',
      name: 'Browser Cookie Vault',
      status: browser.cookiesEnabled ? 'pass' : 'fail',
      details: browser.cookiesEnabled ? 'Persistent cookie writing supported.' : 'Cookies are blocked!',
    },
    {
      id: 'online',
      name: 'Internet Link Status',
      status: network.online ? 'pass' : 'fail',
      details: network.online ? 'Online, network gateways resolved.' : 'Offline or router disconnected.',
    },
    {
      id: 'serviceworker',
      name: 'Service Worker Runtime',
      status: browser.serviceWorkerSupported ? 'pass' : 'warn',
      details: browser.serviceWorkerSupported
        ? 'Service Worker support is active. Offline PWA enabled.'
        : 'Service Workers are disabled or unsupported.',
    },
    {
      id: 'storage',
      name: 'Storage Sandbox Allocation',
      status: typeof browser.storageQuotaMb === 'number' && browser.storageQuotaMb > 0 ? 'pass' : 'warn',
      details: typeof browser.storageQuotaMb === 'number'
        ? `Allocated up to ${browser.storageQuotaMb} MB.`
        : 'Storage sandbox estimate is unavailable.',
    },
  ];

  // 6. Findings derivation
  const findings: Finding[] = [];

  if (!isHttps) {
    findings.push({
      id: 'f-https',
      category: 'Security',
      title: 'Unencrypted HTTP Protocol',
      severity: 'fail',
      description: 'Your connection is not encrypted. Data could be intercepted by third parties.',
      remediation: 'Access this app using the https:// protocol immediately.',
    });
  }

  if (webRtcIps.length > 0) {
    findings.push({
      id: 'f-webrtc',
      category: 'Privacy',
      title: 'WebRTC Local Network Leak',
      severity: 'warn',
      description: `Your internal IP address (${webRtcIps.join(', ')}) is exposed via WebRTC, allowing local network maps.`,
      remediation: 'Disable WebRTC in your browser, or use a VPN that blocks WebRTC leaks.',
    });
  }

  if (!browser.cookiesEnabled) {
    findings.push({
      id: 'f-cookies',
      category: 'Browser',
      title: 'Cookies are Blocked',
      severity: 'fail',
      description: 'The browser is rejecting cookies. You will lose persistent local session memory.',
      remediation: 'Go to your browser settings and allow third-party or standard cookies.',
    });
  }

  if (browser.doNotTrack !== '1') {
    findings.push({
      id: 'f-dnt',
      category: 'Privacy',
      title: 'Do Not Track (DNT) is Inactive',
      severity: 'warn',
      description: 'The standard Do Not Track header is missing or inactive.',
      remediation: "Enable 'Do Not Track' or install 'Global Privacy Control' (GPC) in settings.",
    });
  }

  if (!network.online) {
    findings.push({
      id: 'f-offline',
      category: 'Network',
      title: 'Offline Connection Status',
      severity: 'fail',
      description: 'Your browser reports no internet link connection.',
      remediation: 'Verify your Wi-Fi, Ethernet, or local modem connectivity.',
    });
  }

  if (network.latencyMs && network.latencyMs > 250) {
    findings.push({
      id: 'f-latency',
      category: 'Network',
      title: 'High Network Latency Detected',
      severity: 'warn',
      description: `Your server-side average latency is ${network.latencyMs}ms, which could slow down real-time actions.`,
      remediation: 'Close background torrents, stop heavy streaming, or switch networks.',
    });
  }

  if (!browser.serviceWorkerSupported) {
    findings.push({
      id: 'f-sw',
      category: 'Browser',
      title: 'Service Worker Support Blocked',
      severity: 'warn',
      description: 'Service workers are disabled. Dynamic caching and offline mode will not run.',
      remediation: 'Ensure your browser is not in an extremely restrictive private mode.',
    });
  }

  if (typeof system.memoryGb === 'number' && system.memoryGb <= 4) {
    findings.push({
      id: 'f-memory',
      category: 'System',
      title: 'Low Available Device RAM',
      severity: 'warn',
      description: `Your browser is running with ${system.memoryGb} GB of virtual memory allocation.`,
      remediation: 'Close idle tabs or heavy software tasks to clear physical memory.',
    });
  }

  if (typeof system.cpuCores === 'number' && system.cpuCores <= 2) {
    findings.push({
      id: 'f-cpu',
      category: 'System',
      title: 'Limited CPU Threads',
      severity: 'warn',
      description: `Only ${system.cpuCores} concurrent logical processing units are available.`,
      remediation: 'Limit complex multi-window applications or canvas renders.',
    });
  }

  // Add info finding if things look good
  if (findings.length === 0) {
    findings.push({
      id: 'f-excellent',
      category: 'Security',
      title: 'All Core Safeguards Passing',
      severity: 'info',
      description: 'Your browser environment meets all enterprise safety diagnostics guidelines.',
      remediation: 'No immediate action required. Your connection is perfectly healthy.',
    });
  }

  // Calculate scores
  const passCount = pipeline.filter((p) => p.status === 'pass').length;
  const warnCount = pipeline.filter((p) => p.status === 'warn').length;
  const failCount = pipeline.filter((p) => p.status === 'fail').length;

  // Let's use a nice formula for overall score out of 100
  // Each pass is +12.5 points, warn is +6.25 points, fail is +0.
  const totalWeight = pipeline.length; // 8 items
  const rawScore = (passCount * 12.5) + (warnCount * 6.25);
  const overallScore = Math.min(100, Math.max(10, Math.round(rawScore)));

  return {
    timestamp: new Date().toISOString(),
    overallScore,
    passCount,
    warnCount,
    failCount,
    system,
    browser,
    network,
    privacy,
    findings,
    verificationPipeline: pipeline,
  };
};
