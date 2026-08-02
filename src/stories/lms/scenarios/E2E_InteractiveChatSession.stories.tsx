import type { Meta } from '@storybook/nextjs-vite';
import React, { useState } from 'react';
import { AgentMessageBubble } from '@/components/lms/agent/AgentMessageBubble';
import { AgentInputBar } from '@/components/lms/agent/AgentInputBar';
import { AgentThinkingIndicator } from '@/components/lms/agent/AgentThinkingIndicator';
import type { AgentMessage } from '@/types';
import {
  MOCK_THINKING_STEPS,
  MOCK_TOOL_ACTIVITIES,
  RICH_MARKDOWN_SAMPLE
} from '../mocks/chatFixtures';

const meta: Meta = {
  title: 'LMS / AI Mentor / Scenarios / InteractiveChatSession',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

export const DynamicChatScenario = {
  render: () => {
    const [messages, setMessages] = useState<AgentMessage[]>([
      {
        id: '1',
        role: 'assistant',
        content: 'Xin chào! Mình là **AI Mentor** hỗ trợ môn *Cấu trúc dữ liệu & Giải thuật*. Bạn cần giải đáp thắc mắc gì hôm nay?',
        timestamp: Date.now(),
      },
    ]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isThinking, setIsThinking] = useState(false);

    const handleSend = (userText: string) => {
      const userMsg: AgentMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: userText,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsThinking(true);

      // Simulate Thinking stage -> then Streaming stage -> Complete
      setTimeout(() => {
        setIsThinking(false);
        setIsStreaming(true);

        const aiMsgId = (Date.now() + 1).toString();
        const fullContent = RICH_MARKDOWN_SAMPLE;
        let currentLen = 0;

        setMessages((prev) => [
          ...prev,
          {
            id: aiMsgId,
            role: 'assistant',
            content: '',
            timestamp: Date.now(),
            isStreaming: true,
          },
        ]);

        const interval = setInterval(() => {
          currentLen += 15;
          if (currentLen >= fullContent.length) {
            clearInterval(interval);
            setIsStreaming(false);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === aiMsgId
                  ? { ...m, content: fullContent, isStreaming: false, toolActivities: MOCK_TOOL_ACTIVITIES }
                  : m
              )
            );
          } else {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === aiMsgId
                  ? { ...m, content: fullContent.slice(0, currentLen) }
                  : m
              )
            );
          }
        }, 50);
      }, 1500);
    };

    return (
      <div className="h-screen w-full bg-slate-100 dark:bg-[#050B18] text-slate-900 dark:text-white flex flex-col justify-between p-4 sm:p-8">
        <div className="flex-1 overflow-y-auto space-y-4 max-w-4xl mx-auto w-full pr-2">
          <div className="text-center my-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-blue-500/20">
              Offline Storybook Session Simulation
            </span>
          </div>

          {messages.map((msg) => (
            <AgentMessageBubble key={msg.id} message={msg} />
          ))}

          {isThinking && (
            <div className="p-4 bg-white dark:bg-[#0F1E35] rounded-2xl border border-slate-200 dark:border-blue-500/10">
              <AgentThinkingIndicator steps={MOCK_THINKING_STEPS} />
            </div>
          )}
        </div>

        <div className="max-w-4xl mx-auto w-full mt-4">
          <AgentInputBar
            onSend={handleSend}
            isStreaming={isStreaming || isThinking}
            onStop={() => {
              setIsStreaming(false);
              setIsThinking(false);
            }}
            placeholder="Hỏi AI Mentor..."
          />
        </div>
      </div>
    );
  },
};
