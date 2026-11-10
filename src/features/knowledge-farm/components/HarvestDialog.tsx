import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import MarkdownRenderer from "@/components/markdown/MarkdownRenderer";
import { cn } from "@/lib/utils";
import type { QuizImage, AnswerResult, Challenge } from "../types";
export function HarvestDialog({
  challenge,
  open,
  onClose,
  onAnswer,
  busy,
  error,
  result,
}: {
  challenge: Challenge;
  open: boolean;
  onClose: () => void;
  onAnswer: (answer: string) => void;
  busy: boolean;
  error: string;
  result: AnswerResult | null;
}) {
  const [zoomImage, setZoomImage] = useState<QuizImage | null>(null);
  const [answer, setAnswer] = useState("");
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const expired = Date.parse(challenge.expires_at) <= now;
  const locked = busy || expired || !!result;
  const images = challenge.question.images ?? [];
  const renderImage = (image: QuizImage, key: string) => (
    <figure key={key} className="my-3 min-w-0">
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          setZoomImage(image);
        }}
        className="block max-w-full overflow-hidden rounded-xl border border-slate-200 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-slate-700"
        aria-label={`Phóng to ảnh: ${image.alt_text || image.caption || "Ảnh câu hỏi"}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.url}
          alt={image.alt_text || image.caption || "Ảnh minh họa câu hỏi"}
          className="max-h-80 max-w-full object-contain"
          style={{ width: image.display_width || "auto" }}
          loading="lazy"
        />
      </button>
      {image.caption && (
        <figcaption className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {image.caption}
        </figcaption>
      )}
    </figure>
  );
  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!value && !busy) onClose();
        }}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Học một điều · Thu một mùa</DialogTitle>
            <DialogDescription>
              {challenge.question.kind === "quiz"
                ? "Chọn một đáp án đúng."
                : "Nhớ lại và nhập đáp án ngắn trên flashcard."}{" "}
              Trả lời đúng để hoàn tất thu hoạch.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!locked && answer.trim()) onAnswer(answer);
            }}
            className="space-y-4"
          >
            <fieldset className="min-w-0 space-y-3">
              <legend className="sr-only">
                {challenge.question.kind === "quiz"
                  ? "Câu hỏi trắc nghiệm · Chọn một đáp án"
                  : "Câu hỏi flashcard"}
              </legend>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                  {challenge.question.kind === "quiz"
                    ? "Trắc nghiệm · Một đáp án đúng"
                    : "Flashcard"}
                </p>
                {images
                  .filter(
                    (image) =>
                      !image.position || image.position === "above_question",
                  )
                  .map((image, i) => renderImage(image, `above-${i}`))}
                <MarkdownRenderer
                  content={challenge.question.prompt}
                  className="[&_p]:text-slate-900 dark:[&_p]:text-slate-100"
                />
                {images
                  .filter(
                    (image) =>
                      image.position && image.position !== "above_question",
                  )
                  .map((image, i) => renderImage(image, `below-${i}`))}
              </div>
              {challenge.question.kind === "quiz" ? (
                challenge.question.options?.map((option, index) => (
                  <label
                    key={index}
                    className={cn(
                      "flex min-w-0 cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors focus-within:ring-2 focus-within:ring-emerald-500",
                      answer === String(index)
                        ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950"
                        : "border-slate-200 dark:border-slate-700",
                      result?.correct_option_index === index &&
                        "border-emerald-600 bg-emerald-50 dark:bg-emerald-950",
                      result &&
                        !result.correct &&
                        answer === String(index) &&
                        "border-red-400 bg-red-50 dark:bg-red-950/30",
                      locked && "cursor-default",
                    )}
                  >
                    <input
                      type="radio"
                      name="answer"
                      value={index}
                      checked={answer === String(index)}
                      onChange={(e) => setAnswer(e.target.value)}
                      className="mt-1"
                      required
                      disabled={locked}
                    />
                    <span
                      aria-hidden="true"
                      className="mt-0.5 font-semibold text-slate-500"
                    >
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <div className="min-w-0 flex-1">
                      <MarkdownRenderer
                        content={option}
                        className="[&_p]:mb-0"
                      />
                      {challenge.question.option_images?.[index] &&
                        renderImage(
                          challenge.question.option_images[index]!,
                          `option-${index}`,
                        )}
                      {result?.correct_option_index === index && (
                        <p className="mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          Đáp án đúng
                        </p>
                      )}
                      {result &&
                        !result.correct &&
                        answer === String(index) && (
                          <p className="mt-2 text-xs font-semibold text-red-700 dark:text-red-300">
                            Bạn đã chọn
                          </p>
                        )}
                    </div>
                  </label>
                ))
              ) : (
                <label className="block text-sm">
                  Câu trả lời của bạn
                  <input
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    disabled={locked}
                    maxLength={512}
                    required
                    autoComplete="off"
                    className="mt-2 w-full rounded-lg border border-slate-300 bg-transparent p-3 dark:border-slate-600"
                    placeholder="Nhập đáp án…"
                  />
                </label>
              )}
            </fieldset>
            {error && (
              <p
                role="alert"
                className="text-sm text-red-600 dark:text-red-300"
              >
                {error}
              </p>
            )}
            {result && !result.correct && (
              <div
                role="status"
                className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100"
              >
                <strong>
                  Chưa đúng. Đáp án đúng
                  {result.correct_option_index !== undefined
                    ? `: ${String.fromCharCode(65 + result.correct_option_index)}`
                    : ":"}
                </strong>
                {result.correct_answer && (
                  <MarkdownRenderer
                    content={result.correct_answer}
                    className="mt-2"
                  />
                )}
                {result.explanation && (
                  <div className="mt-3 border-t border-amber-200 pt-3">
                    <p className="mb-2 font-semibold">Giải thích</p>
                    <MarkdownRenderer content={result.explanation} />
                  </div>
                )}
                <p className="mt-2">Bạn có thể thử câu mới sau 30 giây.</p>
              </div>
            )}
            {expired ? (
              <p role="status" className="text-sm">
                Câu hỏi đã hết hạn. Đóng và mở lại thu hoạch để nhận câu mới.
              </p>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Còn{" "}
                {Math.max(
                  0,
                  Math.ceil((Date.parse(challenge.expires_at) - now) / 60000),
                )}{" "}
                phút · Trả lời sai có thể học lại và thử câu mới sau 30 giây.
              </p>
            )}
            {result ? (
              <Button type="button" onClick={onClose} className="w-full">
                Đã hiểu
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={busy || expired || !answer.trim()}
                className="w-full"
              >
                {busy ? "Đang kiểm tra…" : "Trả lời để thu hoạch"}
              </Button>
            )}
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!zoomImage}
        onOpenChange={(value) => {
          if (!value) setZoomImage(null);
        }}
      >
        <DialogContent className="max-h-[95dvh] overflow-y-auto sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Xem ảnh câu hỏi</DialogTitle>
            <DialogDescription>
              {zoomImage?.caption || zoomImage?.alt_text || "Ảnh minh họa"}
            </DialogDescription>
          </DialogHeader>
          {zoomImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={zoomImage.url}
              alt={zoomImage.alt_text || "Ảnh minh họa câu hỏi"}
              className="mx-auto max-h-[75dvh] max-w-full object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
