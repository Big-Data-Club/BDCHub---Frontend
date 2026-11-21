"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquare } from "lucide-react";
import { AgentInputBar } from "@/components/lms/agent/AgentInputBar";
import { AgentMessageItem } from "@/components/lms/agent/AgentMessageItem";
import type { AgentMessage, ChatMode } from "@/types";
import {
  demoAnswer,
  learningTopics,
  suggestedQuestions,
  type TopicId,
} from "./content";
import styles from "./bdchub.module.css";

export function ChatPreview({
  topic,
  compact = false,
}: {
  topic: TopicId;
  compact?: boolean;
}) {
  const selected = learningTopics.find((item) => item.id === topic)!;
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [mode, setMode] = useState<ChatMode>("standard");
  const log = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [messages]);
  function send(question: string) {
    const text = question.trim().slice(0, 5000);
    if (!text) return;
    const answer = demoAnswer(text, topic);
    const now = Date.now();
    const exchange: AgentMessage[] = [
      { id: crypto.randomUUID(), role: "user", content: text, timestamp: now },
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `${answer.text} [1]`,
        timestamp: now,
        references: [
          {
            citation_number: 1,
            title: answer.source,
            content: answer.text,
            relevance_score: 1,
            source_type: "material",
          },
        ],
      },
    ];
    setMessages((current) => [...current, ...exchange].slice(-8));
  }
  return (
    <div className={compact ? styles.compactChat : styles.chatLayout}>
      <div className={styles.lessonExcerpt} hidden={compact}>
        <span className={styles.badge}>REINFORCEMENT LEARNING</span>
        <h3>{selected.title}</h3>
        <p>{selected.summary}</p>
        <div className={styles.callout}>
          <strong>Hiểu sâu hơn, ngay trong bài học.</strong>
          <p>
            Kết nối nội dung, câu hỏi và những khái niệm liên quan trong cùng
            một không gian.
          </p>
        </div>
      </div>
      <div className={`${styles.chatCard} ${styles.productSurface}`}>
        <div className={styles.cardHeading}>
          <strong>
            <MessageSquare size={17} /> AI Cowork
          </strong>
          <span className={styles.badge}>DEMO</span>
        </div>
        <div
          className={styles.messages}
          ref={log}
          role="log"
          aria-label="Hội thoại AI"
          aria-live="polite"
        >
          {!messages.length && (
            <div className={styles.chatWelcome}>
              <span className={styles.aiMark}>AI</span>
              <h3>Hôm nay bạn muốn hiểu điều gì?</h3>
            </div>
          )}
          {messages.map((message) => (
            <AgentMessageItem key={message.id} message={message} readOnly />
          ))}
        </div>
        <div className={styles.suggestions}>
          {suggestedQuestions.map((question) => (
            <button key={question} onClick={() => send(question)}>
              {question}
            </button>
          ))}
        </div>
        <AgentInputBar
          onSend={send}
          isStreaming={false}
          onStop={() => {}}
          chatMode={mode}
          onChatModeChange={setMode}
          placeholder="Hỏi AI về bài học…"
        />
      </div>
    </div>
  );
}
