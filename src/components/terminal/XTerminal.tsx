"use client";

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import "@xterm/xterm/css/xterm.css";

// Dynamic import types — actual modules loaded in useEffect to avoid SSR issues
import type { Terminal as XTermTerminal } from "@xterm/xterm";
import type { FitAddon as XTermFitAddon } from "@xterm/addon-fit";

export interface XTerminalHandle {
  /** Write raw data (e.g. from WebSocket) into the terminal */
  write: (data: string | Uint8Array) => void;
  /** Focus the terminal */
  focus: () => void;
  /** Trigger a fit/resize recalculation */
  fit: () => void;
  /** Get current dimensions */
  getDimensions: () => { cols: number; rows: number } | null;
}

export interface XTerminalProps {
  /** Called when the user types into the terminal */
  onData?: (data: string) => void;
  /** Called when the terminal is resized */
  onResize?: (cols: number, rows: number) => void;
  /** Called when the terminal is ready */
  onReady?: () => void;
  /** Additional CSS class for the container */
  className?: string;
}

export const XTerminal = forwardRef<XTerminalHandle, XTerminalProps>(
  function XTerminal({ onData, onResize, onReady, className }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const termRef = useRef<XTermTerminal | null>(null);
    const fitAddonRef = useRef<XTermFitAddon | null>(null);
    const readyRef = useRef(false);

    useImperativeHandle(ref, () => ({
      write: (data: string | Uint8Array) => {
        termRef.current?.write(data);
      },
      focus: () => {
        termRef.current?.focus();
      },
      fit: () => {
        fitAddonRef.current?.fit();
      },
      getDimensions: () => {
        const term = termRef.current;
        if (!term) return null;
        return { cols: term.cols, rows: term.rows };
      },
    }));

    useEffect(() => {
      let disposed = false;
      let term: XTermTerminal | null = null;

      const init = async () => {
        // Dynamically import xterm modules (avoids SSR "window is not defined")
        const { Terminal } = await import("@xterm/xterm");
        const { FitAddon } = await import("@xterm/addon-fit");

        if (disposed || !containerRef.current) return;

        const fitAddon = new FitAddon();

        term = new Terminal({
          cursorBlink: true,
          cursorStyle: "block",
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', 'Monaco', 'Courier New', monospace",
          fontSize: 13,
          lineHeight: 1.35,
          scrollback: 5000,
          allowProposedApi: true,
          theme: {
            background: "#0a0e14",
            foreground: "#c5c8c6",
            cursor: "#528bff",
            cursorAccent: "#0a0e14",
            selectionBackground: "#3e4451",
            selectionForeground: "#c5c8c6",
            black: "#1d1f21",
            red: "#cc6666",
            green: "#b5bd68",
            yellow: "#f0c674",
            blue: "#81a2be",
            magenta: "#b294bb",
            cyan: "#8abeb7",
            white: "#c5c8c6",
            brightBlack: "#969896",
            brightRed: "#de935f",
            brightGreen: "#b5bd68",
            brightYellow: "#f0c674",
            brightBlue: "#81a2be",
            brightMagenta: "#b294bb",
            brightCyan: "#8abeb7",
            brightWhite: "#ffffff",
          },
        });

        term.loadAddon(fitAddon);
        term.open(containerRef.current);

        termRef.current = term;
        fitAddonRef.current = fitAddon;

        // Initial fit
        requestAnimationFrame(() => {
          if (!disposed) {
            fitAddon.fit();
          }
        });

        // Listen for user keystrokes → forward to WebSocket
        term.onData((data) => {
          onData?.(data);
        });

        // Listen for terminal resize events → notify parent
        term.onResize(({ cols, rows }) => {
          onResize?.(cols, rows);
        });

        // Handle browser window resize
        const resizeObserver = new ResizeObserver(() => {
          if (!disposed) {
            requestAnimationFrame(() => {
              fitAddon.fit();
            });
          }
        });
        resizeObserver.observe(containerRef.current);

        readyRef.current = true;
        onReady?.();

        // Cleanup on unmount
        return () => {
          resizeObserver.disconnect();
        };
      };

      let cleanupResize: (() => void) | undefined;
      init().then((cleanup) => {
        cleanupResize = cleanup;
      });

      return () => {
        disposed = true;
        cleanupResize?.();
        if (term) {
          term.dispose();
          termRef.current = null;
          fitAddonRef.current = null;
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <div
        ref={containerRef}
        className={className}
        style={{
          width: "100%",
          height: "100%",
          padding: "4px",
          backgroundColor: "#0a0e14",
        }}
      />
    );
  }
);
