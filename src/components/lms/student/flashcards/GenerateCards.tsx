"use client";
import { useState } from "react";
import { button, input, languages, panel, primary } from "./styles";
export function GenerateCards({ busy, onGenerate, onCancel }: { busy: boolean; onGenerate: (topic: string, count: number, language: string, answerLanguage: string) => void; onCancel: () => void }) {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(10);
  const [language, setLanguage] = useState("vi-VN");
  const [answerLanguage, setAnswerLanguage] = useState("vi-VN");
  return <form className={`${panel} space-y-5`} onSubmit={e => { e.preventDefault(); onGenerate(topic, count, language, answerLanguage); }}>
    <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold">Tạo thẻ bằng AI</h2><button type="button" className={button} onClick={onCancel} disabled={busy}>Đóng</button></div>
    <label className="block space-y-2 text-sm font-medium"><span>Bạn muốn học gì?</span><textarea className={input} rows={5} minLength={3} maxLength={12000} required value={topic} onChange={e => setTopic(e.target.value)} placeholder="Nhập chủ đề hoặc dán nội dung bạn đang học…" disabled={busy} /></label>
    <div className="grid gap-4 sm:grid-cols-3"><label className="space-y-2 text-sm"><span>Số thẻ</span><input type="number" min={1} max={20} required className={input} value={count} onChange={e => setCount(Number(e.target.value))} disabled={busy} /></label>
      {[[language, setLanguage, "Ngôn ngữ mặt trước"], [answerLanguage, setAnswerLanguage, "Ngôn ngữ đáp án"]].map(([value, setter, label], i) => <label key={i} className="space-y-2 text-sm"><span>{label as string}</span><select className={input} value={value as string} onChange={e => (setter as (v: string) => void)(e.target.value)} disabled={busy}>{languages.map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select></label>)}
    </div>
    <button className={primary} disabled={busy || topic.trim().length < 3}>{busy ? "Đang tạo thẻ…" : "Tạo thẻ"}</button>
  </form>;
}
