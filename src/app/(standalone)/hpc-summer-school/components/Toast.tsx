import React, { useState, useEffect } from "react";

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, isVisible, onClose, duration = 4000 }: ToastProps) {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setIsExiting(false);

      // Trigger exit animation 350ms before duration ends
      const exitTimer = setTimeout(() => {
        setIsExiting(true);
      }, duration - 350);

      // Trigger onClose after full duration
      const closeTimer = setTimeout(() => {
        onClose();
      }, duration);

      return () => {
        clearTimeout(exitTimer);
        clearTimeout(closeTimer);
      };
    } else {
      setIsExiting(true);
      const closeTimer = setTimeout(() => {
        setShouldRender(false);
      }, 350);
      return () => clearTimeout(closeTimer);
    }
  }, [isVisible, duration, onClose]);

  if (!shouldRender) return null;

  return (
    <>
      <style>{`
        @keyframes toastSlideIn {
          from {
            transform: translateX(120%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes toastSlideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(120%);
            opacity: 0;
          }
        }
        @keyframes toastProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-toast-in {
          animation: toastSlideIn 350ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-toast-out {
          animation: toastSlideOut 350ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-toast-progress {
          animation: toastProgress ${duration}ms linear forwards;
        }
      `}</style>

      <div
        className={`fixed bottom-5 right-5 z-50 max-w-[calc(100vw-40px)] w-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-4 pb-5 shadow-2xl shadow-cyan-900/10 dark:shadow-black/40 overflow-hidden ${
          isExiting ? "animate-toast-out" : "animate-toast-in"
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Info Icon */}
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center flex-shrink-0 text-blue-500 shadow-inner">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </div>
          
          {/* Text Content */}
          <div className="flex-1 min-w-0 pr-1">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight whitespace-nowrap">
              {message}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={() => {
              setIsExiting(true);
              setTimeout(onClose, 300);
            }}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 flex-shrink-0"
            aria-label="Close notification"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Dynamic Progress Bar running at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-slate-100 dark:bg-slate-800/80 pointer-events-none">
          <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 animate-toast-progress" />
        </div>
      </div>
    </>
  );
}
