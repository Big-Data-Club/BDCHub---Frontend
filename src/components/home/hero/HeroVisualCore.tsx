"use client";

import SafeImage from "../../common/SafeImage";
import { LogoIcon } from "@/constants";
import { Terminal, Cpu, Server, ShieldCheck } from "lucide-react";

export interface HeroVisualCoreProps {
  statsDuration?: number;
  statsYOffset?: number;
}

export function HeroVisualCore({
  statsDuration: _statsDuration,
  statsYOffset: _statsYOffset,
}: HeroVisualCoreProps = {}) {
  void _statsDuration;
  void _statsYOffset;

  return (
    <div className="lg:col-span-5 w-full hidden lg:flex flex-col select-none">
      {/* Clean Technical Container Window */}
      <div className="w-full rounded-2xl bg-white/80 dark:bg-[#0F1E35]/90 border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-none backdrop-blur-md overflow-hidden flex flex-col">
        
        {/* Terminal Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0B1526]/70">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            </div>
            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
            <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-400">
              <Terminal className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              <span>bdc-hub // hpc-cluster-node</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-600 dark:text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>OPERATIONAL</span>
          </div>
        </div>

        {/* Core Content Body */}
        <div className="p-6 space-y-5">
          
          {/* Logo & Node Info Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center p-2 shrink-0">
                <SafeImage
                  src={LogoIcon}
                  alt="Big Data Club Logo"
                  width={40}
                  height={48}
                  priority
                  className="w-9 h-9 object-contain"
                />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  Big Data Club HCMUT
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  Academic Research & Tech Development
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-slate-500 dark:text-slate-400">
              <Server className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              <span>HPC Lab Node</span>
            </div>
          </div>

          {/* Code / Workflow Preview Snippet */}
          <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs leading-relaxed space-y-2 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800 text-xs">
              <span>pipeline.py</span>
              <span className="text-blue-400">Python 3.11</span>
            </div>
            <div className="pt-1">
              <span className="text-purple-400">from</span> <span className="text-cyan-300">bdc.research</span> <span className="text-purple-400">import</span> BigData, AI, Quantum
            </div>
            <div>
              <span className="text-slate-500"># Learning by Doing & Academic Excellence</span>
            </div>
            <div>
              <span className="text-blue-400">cluster</span> = BigData.Cluster(name=<span className="text-amber-300">&quot;HCMUT-HPC&quot;</span>)
            </div>
            <div>
              <span className="text-blue-400">cluster</span>.deploy_model(AI.LLM, status=<span className="text-emerald-400">&quot;READY&quot;</span>)
            </div>
          </div>

          {/* Status Telemetry Strip */}
          <div className="flex items-center justify-between pt-1 text-xs font-mono text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              <span>Cluster Status:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Environment:</span>
              <span className="font-semibold text-slate-900 dark:text-white">Production</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}



