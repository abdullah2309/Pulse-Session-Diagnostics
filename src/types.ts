/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SystemInfo {
  userAgent: string;
  platform: string;
  cpuCores: number | string;
  memoryGb: number | string;
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
  colorDepth: number;
  touchPoints: number;
  orientation: string;
}

export interface BrowserInfo {
  vendor: string;
  languages: string[];
  cookiesEnabled: boolean;
  doNotTrack: string | null;
  pdfViewerEnabled: boolean;
  storageQuotaMb: number | string;
  storageUsageMb: number | string;
  serviceWorkerSupported: boolean;
}

export interface NetworkInfo {
  ip: string;
  asn: string;
  country: string;
  city: string;
  region: string;
  timezone: string;
  locale: string;
  connectionType: string;
  downlink: number | string;
  rtt: number | string;
  online: boolean;
  latencyMs: number | null;
}

export interface PrivacyInfo {
  isHttps: boolean;
  webRtcIps: string[];
  adblockDetected: boolean | null;
  thirdPartyCookiesEnabled: boolean | null;
  permissions: {
    geolocation: string;
    notifications: string;
    camera: string;
  };
}

export interface Finding {
  id: string;
  category: 'System' | 'Browser' | 'Network' | 'Privacy' | 'Security';
  title: string;
  severity: 'info' | 'warn' | 'fail';
  description: string;
  remediation: string;
}

export interface VerificationItem {
  id: string;
  name: string;
  status: 'pass' | 'warn' | 'fail' | 'checking';
  details: string;
}

export interface LiveMetric {
  timestamp: string;
  latency: number | null;
  fps: number;
}

export interface DiagnosticsReport {
  timestamp: string;
  overallScore: number;
  passCount: number;
  warnCount: number;
  failCount: number;
  system: SystemInfo;
  browser: BrowserInfo;
  network: NetworkInfo;
  privacy: PrivacyInfo;
  findings: Finding[];
  verificationPipeline: VerificationItem[];
}
