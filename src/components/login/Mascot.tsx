"use client";

import React, { useEffect, useState } from "react";

export default function Mascot({ isBlindfolded }: { isBlindfolded: boolean }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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

  return (
    <div className="relative w-32 h-32 mx-auto mb-8 flex justify-center items-center">
      <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-sm">
        {/* Khuôn mặt (Robot / Cú công nghệ) */}
        <rect x="10" y="20" width="100" height="80" rx="24" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="4" />
        
        {/* Tai / Ăng-ten */}
        <path d="M 30 20 L 20 5" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
        <path d="M 90 20 L 100 5" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
        <circle cx="20" cy="5" r="4" fill="#3b82f6" />
        <circle cx="100" cy="5" r="4" fill="#3b82f6" />

        {isBlindfolded ? (
          /* Trạng thái nhắm mắt */
          <g>
            <path d="M 30 55 Q 40 45 50 55" fill="none" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
            <path d="M 70 55 Q 80 45 90 55" fill="none" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
            {/* Má hồng bối rối */}
            <ellipse cx="25" cy="70" rx="6" ry="4" fill="#fecaca" opacity="0.8" />
            <ellipse cx="95" cy="70" rx="6" ry="4" fill="#fecaca" opacity="0.8" />
          </g>
        ) : (
          /* Trạng thái mở mắt theo dõi chuột */
          <g>
            {/* Tròng trắng */}
            <circle cx="40" cy="55" r="14" fill="white" stroke="#e2e8f0" strokeWidth="2" />
            <circle cx="80" cy="55" r="14" fill="white" stroke="#e2e8f0" strokeWidth="2" />
            
            {/* Con ngươi (di chuyển theo state) */}
            <circle 
              cx={40 + mousePos.x} 
              cy={55 + mousePos.y} 
              r="6" 
              fill="#1e40af" 
              className="transition-all duration-75 ease-linear"
            />
            <circle 
              cx={80 + mousePos.x} 
              cy={55 + mousePos.y} 
              r="6" 
              fill="#1e40af" 
              className="transition-all duration-75 ease-linear"
            />
          </g>
        )}

        {/* Miệng */}
        <path d="M 50 80 Q 60 85 70 80" fill="none" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}