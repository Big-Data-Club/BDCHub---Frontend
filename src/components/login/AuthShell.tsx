"use client";

import React from "react";
import Background from "@/components/layout/Background";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

interface AuthShellProps {
  children: React.ReactNode;
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="relative min-h-screen flex flex-col bg-transparent text-slate-900 dark:text-slate-200 font-sans selection:bg-blue-100 dark:selection:bg-blue-900/40 selection:text-blue-900 dark:selection:text-blue-100">
      {/* Cosmic star-field background */}
      <Background />

      {/* Orbital glow decorations — layered for depth */}
      <div className="fixed top-[15%] -left-40 w-80 h-80 rounded-full bg-blue-500/4 dark:bg-blue-500/8 blur-3xl animate-cosmic-drift pointer-events-none" />
      <div className="fixed bottom-[20%] -right-40 w-96 h-96 rounded-full bg-cyan-500/3 dark:bg-cyan-500/6 blur-3xl animate-cosmic-drift pointer-events-none" style={{ animationDelay: "-8s" }} />
      <div className="fixed top-[60%] left-[20%] w-64 h-64 rounded-full bg-violet-500/2 dark:bg-violet-500/4 blur-3xl animate-cosmic-drift pointer-events-none" style={{ animationDelay: "-14s" }} />

      {/* Theme toggle — top right corner */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {children}
    </div>
  );
}
