/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Lock } from 'lucide-react';

interface FooterProps {
  timestamp: string | undefined;
}

export default function Footer({ timestamp }: FooterProps) {
  const formattedDate = timestamp
    ? new Date(timestamp).toLocaleString()
    : new Date().toLocaleString();

  return (
    <footer className="mt-12 border-t border-border/80 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-muted-foreground">
      {/* Privacy Guarantee Note */}
      <div className="flex items-center gap-2 text-xs">
        <Lock className="h-3.5 w-3.5 text-teal-500/80" />
        <span>Pulse operates entirely client-side. No session data is transmitted or saved outside your sandbox.</span>
      </div>

      {/* Timestamp & Version info */}
      <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono">
        <span>LAST DISPATCH: <span className="text-foreground font-semibold">{formattedDate}</span></span>
        <span className="text-border">|</span>
        <span>PULSE PROTOCOL v1.2.0</span>
      </div>
    </footer>
  );
}
