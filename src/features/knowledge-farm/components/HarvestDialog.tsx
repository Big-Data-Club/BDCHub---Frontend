import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { AnswerResult, Challenge } from "../types";
export function HarvestDialog({ challenge, open, onClose, onAnswer, busy, error, result, now }: {
  challenge: Challenge; open: boolean; onClose: () => void; onAnswer: (answer: string) => void;
  busy: boolean; error: string; result: AnswerResult | null; now: number;
}) {
  const [answer, setAnswer] = useState("");
  const expired = Date.parse(challenge.expires_at) <= now;
  return <Dialog open={open} onOpenChange={value => { if (!value && !busy) onClose(); }}>
    <DialogContent><DialogHeader><DialogTitle>Học một điều · Thu một mùa</DialogTitle>
      <DialogDescription>{challenge.question.kind === "quiz" ? "Chọn một đáp án đúng." : "Nhớ lại và nhập đáp án ngắn trên flashcard."} Trả lời đúng để hoàn tất thu hoạch.</DialogDescription>
    </DialogHeader>
      <form onSubmit={event => { event.preventDefault(); onAnswer(answer); }} className="space-y-4">
        <fieldset disabled={busy || expired || !!result} className="space-y-3"><legend className="mb-3 font-medium leading-relaxed">{challenge.question.prompt}</legend>
          {challenge.question.kind === "quiz" ? challenge.question.options?.map((option, index) =>
            <label key={index} className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50 dark:border-slate-700 dark:has-[:checked]:bg-emerald-950">
              <input type="radio" name="answer" value={index} checked={answer === String(index)} onChange={e => setAnswer(e.target.value)} className="mt-1" required />
              <span>{option}</span>
            </label>) : <label className="block text-sm">Câu trả lời của bạn
              <input value={answer} onChange={e => setAnswer(e.target.value)} maxLength={512} required autoComplete="off"
                className="mt-2 w-full rounded-lg border border-slate-300 bg-transparent p-3 dark:border-slate-600" placeholder="Nhập đáp án…" />
            </label>}
        </fieldset>
        {error && <p role="alert" className="text-sm text-red-600 dark:text-red-300">{error}</p>}
        {result && !result.correct && <div role="status" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
          <strong>Chưa đúng. Đáp án đúng: {result.correct_answer || "Xem phần giải thích bên dưới"}</strong>
          {result.explanation && <p className="mt-2">{result.explanation}</p>}
          <p className="mt-2">Bạn có thể thử câu mới sau 30 giây.</p>
        </div>}
        {expired ? <p role="status" className="text-sm">Câu hỏi đã hết hạn. Đóng và mở lại thu hoạch để nhận câu mới.</p> :
          <p className="text-xs text-slate-500 dark:text-slate-400">Còn {Math.max(0, Math.ceil((Date.parse(challenge.expires_at) - now) / 60000))} phút · Trả lời sai có thể học lại và thử câu mới sau 30 giây.</p>}
        {result ? <Button type="button" onClick={onClose} className="w-full">Đã hiểu</Button> :
          <Button type="submit" disabled={busy || expired || !answer.trim()} className="w-full">{busy ? "Đang kiểm tra…" : "Trả lời để thu hoạch"}</Button>}
      </form>
    </DialogContent>
  </Dialog>;
}
