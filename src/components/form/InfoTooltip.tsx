"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Info } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

export interface InfoTooltipProps {
  /** Nội dung thông tin hoặc hướng dẫn nhập liệu dạng văn bản / JSX */
  text: React.ReactNode;
  /** Định danh độc nhất của trường nhập liệu (dùng cho trigger tự động mở lần đầu focus) */
  fieldKey?: string;
  /** Vị trí hiển thị popup (Mặc định: top) */
  side?: "top" | "bottom" | "left" | "right";
  /** Căn chỉnh vị trí popup (Mặc định: center) */
  align?: "center" | "start" | "end";
  /** Thời gian tự động đóng (ms). Mặc định 4000ms (4s). Đặt 0 để tắt tự đóng */
  autoDismissMs?: number;
  /** Custom className cho icon button */
  buttonClassName?: string;
  /** Custom className cho popup content */
  popupClassName?: string;
}

/**
 * Custom Event Name dùng cho việc tự động kích hoạt Tooltip từ bên ngoài (ví dụ onFocus ô input)
 */
export const FIELD_FIRST_FOCUS_EVENT = "field-first-focus";

/**
 * Helper phát tín hiệu kích hoạt Tooltip của một fieldKey cụ thể
 */
export const triggerFieldTooltip = (fieldKey: string) => {
  if (typeof window !== "undefined" && fieldKey) {
    window.dispatchEvent(
      new CustomEvent(FIELD_FIRST_FOCUS_EVENT, { detail: { fieldKey } })
    );
  }
};

/**
 * InfoTooltip - Component hiển thị thông tin bổ sung dạng Popup/Tooltip tương tác cao.
 * Tích hợp từ UI Primitives chuẩn (`Popover`, `PopoverTrigger`, `PopoverContent` dựa trên Radix UI Popover).
 *
 * Tiêu chuẩn UX/Feature được đảm bảo đầy đủ:
 * 1. Tự động hiển thị khi người dùng focus/nhập liệu lần đầu vào trường tương ứng.
 * 2. Tự động đóng sau khoảng thời gian tùy chỉnh (Mặc định 4s).
 * 3. Cho phép người dùng tương tác, bôi đen, chọn văn bản hay nhấp vào vùng background của Popup.
 * 4. Tạm dừng timer khi người dùng tương tác với Popup, tiếp tục đếm ngược khi kết thúc tương tác.
 * 5. Tự động đóng khi nhấp chuột ra ngoài (Radix Popover Dismiss Engine).
 */
export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  text,
  fieldKey,
  side = "top",
  align = "center",
  autoDismissMs = 4000,
  buttonClassName = "",
  popupClassName = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(
    (delay = autoDismissMs) => {
      if (delay <= 0) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setIsOpen(false);
        timerRef.current = null;
      }, delay);
    },
    [autoDismissMs]
  );

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const openWithAutoClose = useCallback(() => {
    setIsOpen(true);
    startTimer(autoDismissMs);
  }, [autoDismissMs, startTimer]);

  // Lắng nghe sự kiện tự động hiển thị từ trường nhập liệu tương ứng
  useEffect(() => {
    if (!fieldKey) return;

    const handleFieldFocus = (e: CustomEvent<{ fieldKey: string }>) => {
      if (e.detail?.fieldKey === fieldKey) {
        openWithAutoClose();
      }
    };

    window.addEventListener(FIELD_FIRST_FOCUS_EVENT as any, handleFieldFocus as any);
    return () => {
      window.removeEventListener(FIELD_FIRST_FOCUS_EVENT as any, handleFieldFocus as any);
      stopTimer();
    };
  }, [fieldKey, openWithAutoClose, stopTimer]);

  const handleOpenChange = (openState: boolean) => {
    setIsOpen(openState);
    if (openState) {
      openWithAutoClose();
    } else {
      stopTimer();
    }
  };

  const handleMouseEnterTooltip = () => {
    stopTimer();
  };

  const handleMouseLeaveTooltip = () => {
    if (isOpen) {
      startTimer(autoDismissMs);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange} modal={false}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Thông tin bổ sung"
          className={`transition-colors p-0.5 rounded-full focus:outline-none cursor-pointer inline-flex items-center justify-center ${
            isOpen
              ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50"
              : "text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"
          } ${buttonClassName}`}
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        side={side}
        align={align}
        sideOffset={6}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onMouseEnter={handleMouseEnterTooltip}
        onMouseLeave={handleMouseLeaveTooltip}
        onMouseDown={(e) => {
          e.stopPropagation();
          stopTimer();
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          stopTimer();
        }}
        className={`z-50 w-64 p-3 bg-slate-900/95 dark:bg-slate-800/95 text-slate-100 text-xs rounded-xl shadow-xl border border-slate-700/50 backdrop-blur-sm leading-relaxed tracking-normal font-normal text-left pointer-events-auto select-text cursor-auto ${popupClassName}`}
      >
        <div>{text}</div>
      </PopoverContent>
    </Popover>
  );
};
