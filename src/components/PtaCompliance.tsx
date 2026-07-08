/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Smartphone, Check, HelpCircle, ShieldCheck, ShieldAlert, FileText, Info } from 'lucide-react';

export default function PtaCompliance() {
  const [deviceValueUsd, setDeviceValueUsd] = useState<number>(350);
  const [regType, setRegType] = useState<'passport' | 'cnic'>('cnic');
  const [imeiInput, setImeiInput] = useState<string>('');
  const [imeiResult, setImeiResult] = useState<{ status: 'valid' | 'invalid' | 'unchecked'; error?: string }>({ status: 'unchecked' });

  // PTA DIRBS duty estimation slab formulas
  // Under Pakistan DIRBS regulation, taxes correspond roughly to device value bracket in USD:
  const getEstimatedTax = () => {
    let baseTaxPKR = 0;
    let salesTaxPKR = 0;
    
    if (deviceValueUsd <= 30) {
      baseTaxPKR = 150;
      salesTaxPKR = 430;
    } else if (deviceValueUsd <= 100) {
      baseTaxPKR = 1470;
      salesTaxPKR = 1150;
    } else if (deviceValueUsd <= 200) {
      baseTaxPKR = 4510;
      salesTaxPKR = 2300;
    } else if (deviceValueUsd <= 350) {
      baseTaxPKR = 11000;
      salesTaxPKR = 6000;
    } else if (deviceValueUsd <= 500) {
      baseTaxPKR = 18500;
      salesTaxPKR = 10500;
    } else {
      // High-end (e.g. iPhone, Samsung Ultra)
      baseTaxPKR = 31500;
      salesTaxPKR = 22500;
    }

    // Passport registrations get approx 20-30% rebate discount on mobile taxes
    const adjustmentFactor = regType === 'passport' ? 0.8 : 1.0;
    const totalEstimated = Math.round((baseTaxPKR + salesTaxPKR) * adjustmentFactor);

    return {
      base: Math.round(baseTaxPKR * adjustmentFactor),
      sales: Math.round(salesTaxPKR * adjustmentFactor),
      total: totalEstimated,
    };
  };

  const validateImei = () => {
    const cleaned = imeiInput.replace(/\s+/g, '');
    if (!cleaned) {
      setImeiResult({ status: 'unchecked' });
      return;
    }

    // IMEI must be 15 digits
    if (!/^\d{15}$/.test(cleaned)) {
      setImeiResult({
        status: 'invalid',
        error: 'IMEI must contain exactly 15 numeric digits (excluding spaces/hyphens).',
      });
      return;
    }

    // Luhn algorithm check to see if IMEI is checksum-compliant
    let sum = 0;
    for (let i = 0; i < 15; i++) {
      let digit = parseInt(cleaned.charAt(i));
      // Double every second digit
      if (i % 2 === 1) {
        digit *= 2;
        if (digit > 9) {
          digit = (digit % 10) + 1;
        }
      }
      sum += digit;
    }

    if (sum % 10 === 0) {
      setImeiResult({ status: 'valid' });
    } else {
      setImeiResult({
        status: 'invalid',
        error: 'Invalid Luhn checksum. This IMEI format is corrupted or counterfeit.',
      });
    }
  };

  const taxDetails = getEstimatedTax();

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xs h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-emerald-500" />
          PTA DIRBS Device Registration & Tax Duty Diagnostics
        </h4>
        <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">DIRBS CALCULATOR</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-auto items-stretch">
        {/* Left Hand: Tax Calculator */}
        <div className="flex flex-col gap-4 text-left">
          <div className="bg-emerald-950/10 dark:bg-emerald-950/25 border border-emerald-500/15 rounded-xl p-3 flex gap-2.5 items-start">
            <Info className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Under DIRBS rules, imported cellular mobile devices must register with the FBR/PTA within 60 days to avoid blocklisting on local SIM cellular networks.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {/* Device Value Input */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Device Price Slab (USD)</label>
                <span className="text-xs font-mono font-bold text-emerald-400">${deviceValueUsd} USD</span>
              </div>
              <input
                type="range"
                min={20}
                max={1500}
                step={10}
                value={deviceValueUsd}
                onChange={(e) => setDeviceValueUsd(Number(e.target.value))}
                className="w-full accent-emerald-500 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Registration Type Select */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Registration Account Type</label>
              <div className="grid grid-cols-2 gap-2 bg-muted/30 p-1 rounded-xl border border-border/80">
                <button
                  onClick={() => setRegType('cnic')}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    regType === 'cnic' ? 'bg-card text-emerald-400 shadow-xs border border-border' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Local CNIC
                </button>
                <button
                  onClick={() => setRegType('passport')}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    regType === 'passport' ? 'bg-card text-emerald-400 shadow-xs border border-border' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Passport (Rebate)
                </button>
              </div>
            </div>

            {/* Tax Duty Breakdown Result Card */}
            <div className="bg-muted/15 border border-border/40 rounded-xl p-3 flex flex-col gap-2">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Estimated FBR/PTA Surcharges</span>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Base Customs Duty:</span>
                <span className="font-mono text-foreground font-semibold">Rs. {taxDetails.base.toLocaleString()} PKR</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Sales Tax / Regulatory Levy:</span>
                <span className="font-mono text-foreground font-semibold">Rs. {taxDetails.sales.toLocaleString()} PKR</span>
              </div>
              <div className="h-[1px] bg-border/40 my-1" />
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-foreground">Total Registration Tax:</span>
                <span className="font-mono text-emerald-400 font-bold text-sm">Rs. {taxDetails.total.toLocaleString()} PKR</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Hand: IMEI Integrity Validator */}
        <div className="flex flex-col gap-4 justify-between">
          <div className="flex flex-col gap-1 text-left">
            <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">
              IMEI Format & Checksum Audit
            </label>
            <p className="text-[11px] text-muted-foreground leading-normal mb-3">
              Validate your phone's IMEI. This utility checks if the digit pattern complies with international GSM GSMA Luhn integrity rules before registration.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                maxLength={15}
                placeholder="Enter 15-digit IMEI number"
                value={imeiInput}
                onChange={(e) => setImeiInput(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-muted/30 border border-border/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground outline-hidden transition-all"
              />
              <button
                onClick={validateImei}
                className="px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition duration-150 cursor-pointer shadow-xs"
              >
                Validate
              </button>
            </div>
          </div>

          {/* Validation Verdict Display */}
          <div className="h-full min-h-[100px] flex items-center justify-center">
            {imeiResult.status === 'unchecked' && (
              <div className="text-center p-3 text-muted-foreground border border-dashed border-border/60 rounded-xl w-full">
                <p className="text-xs">No IMEI checked yet</p>
              </div>
            )}

            {imeiResult.status === 'valid' && (
              <div className="w-full bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex gap-3 items-start text-left">
                <ShieldCheck className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-emerald-400">IMEI GSMA Format Confirmed</span>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                    This IMEI checksum is structured perfectly under GSMA standards. It is safe for PTA DIRBS submission.
                  </p>
                </div>
              </div>
            )}

            {imeiResult.status === 'invalid' && (
              <div className="w-full bg-rose-500/5 border border-rose-500/20 rounded-xl p-4 flex gap-3 items-start text-left">
                <ShieldAlert className="h-5 w-5 text-rose-400 mt-0.5 flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-rose-400">Malformed IMEI Signature</span>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                    {imeiResult.error} Please confirm digits via dialing *#06# on your device.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Extra Pakistan Utility Tip */}
          <div className="bg-muted/10 border border-border/40 rounded-xl p-3 flex gap-2.5 items-start text-left">
            <FileText className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-foreground">Official Verification Method</span>
              <span className="text-[9px] text-muted-foreground leading-normal mt-0.5">
                SMS your 15-digit IMEI to **8484** or download the official PTA DIRBS mobile application to verify active carrier block status in Pakistan.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
