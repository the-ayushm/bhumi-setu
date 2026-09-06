import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function GovFooter() {
  return (
    <footer className="w-full bg-slate-900 text-slate-400 text-xs border-t-4 border-gov-saffron mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <h4 className="text-white font-bold text-sm mb-2">Ministry of Rural Development</h4>
          <p className="text-[11px] leading-relaxed">
            Department of Land Resources (DoLR), Government of India.
            National Land Acquisition, Rehabilitation and Resettlement Monitoring System.
          </p>
          <div className="mt-3 flex items-center space-x-2 text-gov-saffron font-medium text-[11px]">
            <ShieldCheck className="w-4 h-4" />
            <span>Compliant with RFCTLARR Act, 2013</span>
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold text-sm mb-2">Statutory References</h4>
          <ul className="space-y-1 text-[11px]">
            <li>Section 4: Social Impact Assessment (SIA)</li>
            <li>Section 11: Preliminary Gazette Notification</li>
            <li>Section 19: Declaration of Acquisition</li>
            <li>Section 26-30: Award & 100% Solatium</li>
            <li>Section 38: Possession upon 100% Payment</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold text-sm mb-2">Digital India Integration</h4>
          <ul className="space-y-1 text-[11px]">
            <li>PFMS (Public Financial Management System - DBT)</li>
            <li>DILRMP (Digital India Land Records Modernization)</li>
            <li>e-Gazette Repository of India</li>
            <li>State Land Revenue Cadastres (Bhulekh / Bhoomi)</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold text-sm mb-2">Smart India Hackathon</h4>
          <div className="bg-slate-800 p-2.5 rounded border border-slate-700 text-[11px]">
            <span className="text-gov-saffron font-semibold">Problem Statement ID:</span> 26016
            <div className="mt-1 text-slate-300">Enterprise High-Assurance Architecture</div>
            <div className="text-[10px] text-slate-400 mt-1">
              Developed for SIH Grand Finale 2024 by Lead Engineering Team.
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-950 py-3 px-4 text-center text-[11px] text-slate-500 border-t border-slate-800">
        © 2024 - 2026 Ministry of Rural Development, Government of India. Hosted on National Informatics Centre (NIC) Infrastructure Standard.
      </div>
    </footer>
  );
}
