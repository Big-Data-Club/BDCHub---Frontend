"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function Mascot({ isBlindfolded }: { isBlindfolded: boolean }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  useEffect(() => {
    if (isBlindfolded) return; // Không cần theo dõi chuột khi đang nhắm mắt

    const handleMouseMove = (e: MouseEvent) => {
      // Tính toán tỷ lệ tọa độ chuột (-1 đến 1)
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      
      // Giới hạn bán kính di chuyển của tròng mắt (tối đa 6px)
      setMousePos({ x: x * 6, y: y * 6 });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isBlindfolded]);

  // Theme-aware colors
  const faceStroke = isDark ? "#1e3a5f" : "#e2e8f0";
  const faceFill = isDark ? "#0F1E35" : "#f8fafc";
  const antennaStroke = isDark ? "#1e3a5f" : "#cbd5e1";
  const antennaTipColor = isDark ? "#22d3ee" : "#3b82f6";
  const eyeRingStroke = isDark ? "#1e3a5f" : "#e2e8f0";
  const eyeFill = isDark ? "#0A1628" : "white";
  const pupilColor = isDark ? "#22d3ee" : "#1e40af";
  const closedEyeStroke = isDark ? "#64748b" : "#64748b";
  const blushColor = isDark ? "#1e3a5f" : "#fecaca";
  const blushOpacity = isDark ? 0.5 : 0.8;
  const mouthStroke = isDark ? "#475569" : "#94a3b8";

  return (
    <div className="relative w-32 h-32 mx-auto mb-8 flex justify-center items-center">
      <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-sm">
        {/* Glow effect behind mascot — dark mode only */}
        {isDark && (
          <circle cx="60" cy="60" r="55" fill="url(#mascotGlow)" opacity="0.4" />
        )}
        <defs>
          <radialGradient id="mascotGlow">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Khuôn mặt (Robot / Cú công nghệ) */}
        <rect x="10" y="20" width="100" height="80" rx="24" fill={faceFill} stroke={faceStroke} strokeWidth="4" />
        
        {/* Tai / Ăng-ten */}
        <path d="M 30 20 L 20 5" stroke={antennaStroke} strokeWidth="4" strokeLinecap="round" />
        <path d="M 90 20 L 100 5" stroke={antennaStroke} strokeWidth="4" strokeLinecap="round" />
        <circle cx="20" cy="5" r="4" fill={antennaTipColor}>
          {isDark && <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />}
        </circle>
        <circle cx="100" cy="5" r="4" fill={antennaTipColor}>
          {isDark && <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />}
        </circle>

        {isBlindfolded ? (
          /* Trạng thái nhắm mắt */
          <g>
            <path d="M 30 55 Q 40 45 50 55" fill="none" stroke={closedEyeStroke} strokeWidth="4" strokeLinecap="round" />
            <path d="M 70 55 Q 80 45 90 55" fill="none" stroke={closedEyeStroke} strokeWidth="4" strokeLinecap="round" />
            {/* Má hồng bối rối */}
            <ellipse cx="25" cy="70" rx="6" ry="4" fill={blushColor} opacity={blushOpacity} />
            <ellipse cx="95" cy="70" rx="6" ry="4" fill={blushColor} opacity={blushOpacity} />
          </g>
        ) : (
          /* Trạng thái mở mắt theo dõi chuột */
          <g>
            {/* Tròng trắng */}
            <circle cx="40" cy="55" r="14" fill={eyeFill} stroke={eyeRingStroke} strokeWidth="2" />
            <circle cx="80" cy="55" r="14" fill={eyeFill} stroke={eyeRingStroke} strokeWidth="2" />
            
            {/* Con ngươi (di chuyển theo state) */}
            <circle 
              cx={40 + mousePos.x} 
              cy={55 + mousePos.y} 
              r="6" 
              fill={pupilColor} 
              className="transition-all duration-75 ease-linear"
            />
            <circle 
              cx={80 + mousePos.x} 
              cy={55 + mousePos.y} 
              r="6" 
              fill={pupilColor} 
              className="transition-all duration-75 ease-linear"
            />
          </g>
        )}

        {/* Miệng */}
        <path d="M 50 80 Q 60 85 70 80" fill="none" stroke={mouthStroke} strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}