"use client";

/**
 * FlashcardWidget - flip-card UI for generated flashcards.
 */
import { useState } from "react";
import { cn } from "@/lib/utils";
import { RotateCw } from "lucide-react";

interface FlashcardItem {
  front: string;
  back: string;
  node_name?: string;
}

interface FlashcardWidgetProps {
  props: {
    cards?: FlashcardItem[];
    flashcards?: FlashcardItem[];
    title?: string;
  };
}

export function FlashcardWidget({ props }: FlashcardWidgetProps) {
  const cards = props.cards || props.flashcards || [];
  const title = props.title;
  const [currentIndex, setCurrentIndex] = useState(0);


  const [isFlipped, setIsFlipped] = useState(false);

  if (!cards || cards.length === 0) return null;

  const card = cards[currentIndex];

  function handleNext() {
    setIsFlipped(false);
    setCurrentIndex((i) => (i + 1) % cards.length);
  }

  function handlePrev() {
    setIsFlipped(false);
    setCurrentIndex((i) => (i - 1 + cards.length) % cards.length);
  }

  return (
    <div className="space-y-3 mt-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-wider">
          {title || "Flashcards Ôn tập"}
        </span>
        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
          {currentIndex + 1}/{cards.length}
        </span>
      </div>

      {/* Card */}
      <button
        onClick={() => setIsFlipped((f) => !f)}
        className={cn(
          "w-full min-h-[140px] p-5 rounded-xl",
          "border border-slate-200 dark:border-blue-500/20",
          "flex flex-col items-center justify-center text-center gap-2",
          "transition-all duration-300 active:scale-[0.98]",
          "cursor-pointer select-none shadow-xs dark:shadow-none",
          isFlipped
            ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-cyan-500/40"
            : "bg-white dark:bg-[#0F1E35] hover:border-slate-300 dark:hover:border-blue-500/35",
        )}
      >
        {card.node_name && !isFlipped && (
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
            {card.node_name}
          </span>
        )}
        <p
          className={cn(
            "text-sm leading-relaxed",
            isFlipped
              ? "text-blue-800 dark:text-cyan-300 font-semibold"
              : "text-slate-800 dark:text-slate-200 font-medium",
          )}
        >
          {isFlipped ? card.back : card.front}
        </p>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-450 mt-1 font-medium">
          <RotateCw className="w-3 h-3 text-blue-500 dark:text-cyan-400" />
          <span>{isFlipped ? "Mặt sau" : "Nhấn để lật mặt"}</span>
        </div>
      </button>

      {/* Navigation */}
      {cards.length > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={handlePrev}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/20 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#162644] active:scale-95 transition-all"
          >
            Trước
          </button>
          <button
            onClick={handleNext}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/20 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#162644] active:scale-95 transition-all"
          >
            Tiếp
          </button>
        </div>
      )}
    </div>
  );
}
