import type { Meta } from '@storybook/nextjs-vite';
import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import StudentLayout from '@/app/(learning)/lms/student/layout';
import AIMentorPage from '@/app/(learning)/lms/student/ai-mentor/page';
import type { AgentMessage } from '@/types';
import {
  MOCK_TOOL_ACTIVITIES,
  RICH_MARKDOWN_SAMPLE,
  MOCK_HITL_REQUEST
} from '../mocks/chatFixtures';

// Mock sessionStorage so StudentLayout doesn't trigger router redirect to /lms
if (typeof window !== 'undefined') {
  window.sessionStorage.setItem('lms_selected_role', 'STUDENT');
}

const MOCK_MESSAGES: AgentMessage[] = [
  // Variant 1: Initial User Prompt
  {
    id: '1',
    role: 'user',
    content: 'AI Mentor ơi, hãy giúp mình hiểu rõ thuật toán QuickSort và so sánh nó với MergeSort với!',
    timestamp: Date.now() - 1000 * 60 * 15,
  },

  // Variant 2: AI Response with Rich Markdown, LaTeX, Tables, C++ Code, and Tool Activities
  {
    id: '2',
    role: 'assistant',
    content: RICH_MARKDOWN_SAMPLE,
    timestamp: Date.now() - 1000 * 60 * 14,
    toolActivities: MOCK_TOOL_ACTIVITIES,
    multiAgentLogs: [
      {
        subagentId: 'sub-1',
        role: 'AlgoExpertAgent',
        task: 'Phân tích độ phức tạp thời gian & mã nguồn C++',
        status: 'completed',
        thinking: 'Đã trích xuất công thức đệ quy T(n) = 2T(n/2) + O(n). Đã hoàn thành code C++.',
        summary: 'Độ phức tạp O(N log N) trung bình.',
      },
      {
        subagentId: 'sub-2',
        role: 'PedagogyReviewer',
        task: 'Đánh giá tính dễ hiểu cho sinh viên',
        status: 'completed',
        thinking: 'Bổ sung thêm bảng so sánh giữa QuickSort, MergeSort và HeapSort.',
        summary: 'Bảng so sánh rõ ràng.',
      },
    ],
    spawningScore: 0.85,
    spawningBreakdown: { c_ratio: 0.9, d_intent: 0.8 },
  },

  // Variant 3: User short question
  {
    id: '3',
    role: 'user',
    content: 'Cho mình hỏi thêm: Tại sao QuickSort lại chạy chậm trong trường hợp xấu nhất (Worst-case)?',
    timestamp: Date.now() - 1000 * 60 * 10,
  },

  // Variant 4: AI Clarification Card
  {
    id: '4',
    role: 'assistant',
    content: 'Trường hợp xấu nhất của QuickSort xảy ra khi Pivot được chọn liên tục là phần tử nhỏ nhất hoặc lớn nhất mảng. Bạn có muốn mình minh họa bằng **Sơ đồ đồ thị cây đệ quy** hay tạo một **Bài tập trắc nghiệm ngắn** để củng cố?',
    timestamp: Date.now() - 1000 * 60 * 9,
    clarification: {
      question: 'Bạn muốn tiếp tục theo hướng nào?',
      options: [
        { label: 'Tạo bài tập trắc nghiệm', value: 'quiz' },
        { label: 'Xem ví dụ Python chạy thực tế', value: 'python_demo' },
        { label: 'Chuyển sang chủ đề Cây Nhị Phân', value: 'binary_tree' }
      ]
    }
  },

  // Variant 5: User selection
  {
    id: '5',
    role: 'user',
    content: 'Hãy tạo bài tập trắc nghiệm cho mình luyện tập thử!',
    timestamp: Date.now() - 1000 * 60 * 6,
  },

  // Variant 6: Interactive Embedded Quiz Widget (MiniChallengeWidget)
  {
    id: '6',
    role: 'assistant',
    content: 'Dưới đây là bài tập trắc nghiệm được thiết kế riêng cho bạn:',
    timestamp: Date.now() - 1000 * 60 * 5,
    uiComponent: {
      component: 'MiniChallengeWidget',
      props: {
        concept: 'QuickSort Complexity',
        question: 'Độ phức tạp thời gian xấu nhất (Worst-case) của thuật toán QuickSort là gì?',
        options: [
          { text: 'O(N log N)', is_correct: false, explanation: 'Đây là độ phức tạp trung bình (Average-case).' },
          { text: 'O(N^2)', is_correct: true, explanation: 'Chính xác! Khi mảng đã sắp xếp và chọn pivot không tốt, đệ quy suy hao thành O(N^2).' },
          { text: 'O(N)', is_correct: false, explanation: 'Sai, QuickSort cần chia để trị.' },
          { text: 'O(1)', is_correct: false, explanation: 'Sai, đây là độ phức tạp hằng số.' }
        ],
      }
    }
  },

  // Variant 7: Action Approval Card
  {
    id: '7',
    role: 'assistant',
    content: 'Mình vừa tạo một bản ghi chú tóm tắt kiến thức QuickSort vào Notebook học tập của bạn.',
    timestamp: Date.now() - 1000 * 60 * 2,
    hitlRequest: MOCK_HITL_REQUEST,
  },
];

const MOCK_SESSIONS = [
  { session_id: 'sess-1', title: 'Thuật toán QuickSort & Luyện tập', created_at: new Date().toISOString(), last_active_at: new Date().toISOString(), agent_type: 'mentor', user_id: 1 },
  { session_id: 'sess-2', title: 'Ôn tập Cấu trúc dữ liệu Cây AVL', created_at: new Date().toISOString(), last_active_at: new Date().toISOString(), agent_type: 'mentor', user_id: 1 },
  { session_id: 'sess-3', title: 'Thực hành Đồ thị Dijkstra', created_at: new Date().toISOString(), last_active_at: new Date().toISOString(), agent_type: 'mentor', user_id: 1 },
  { session_id: 'sess-4', title: 'Học máy nâng cao: Tìm hiểu chi tiết về thuật toán lan truyền ngược (Backpropagation) trong mạng Nơ-ron nhân tạo', created_at: new Date().toISOString(), last_active_at: new Date().toISOString(), agent_type: 'mentor', user_id: 1 },
  { session_id: 'sess-5', title: 'Thiết kế hệ thống phân tán siêu lớn có khả năng chịu lỗi cao và mở rộng tự động trên nền tảng Cloud Kubernetes', created_at: new Date().toISOString(), last_active_at: new Date().toISOString(), agent_type: 'mentor', user_id: 1 },
];

const meta: Meta = {
  title: 'LMS / Student / AIMentorPage',
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      navigation: {
        pathname: '/lms/student/ai-mentor',
        query: {
          sessionId: 'sess-1',
          courseId: '101',
        },
      },
    },
  },
};

export default meta;

export const FullStudentAIMentorPage = {
  render: () => {
    return (
      <div className="flex min-h-screen w-full bg-slate-50 dark:bg-[#050B18] text-slate-900 dark:text-white transition-colors duration-300">
        {/* Main App Navigation Sidebar */}
        <div className="sticky top-0 h-screen flex-shrink-0 hidden md:block z-30">
          <Sidebar />
        </div>

        {/* Right Content Column wrapping StudentLayout & AIMentor Page */}
        <div className="flex flex-1 flex-col min-w-0">
          <StudentLayout>
            <AIMentorPage
              initialMessages={MOCK_MESSAGES}
              initialSessions={MOCK_SESSIONS}
            />
          </StudentLayout>
        </div>
      </div>
    );
  },
};

export const ConsoleDebuggerOpen = {
  render: () => {
    return (
      <div className="flex min-h-screen w-full bg-slate-50 dark:bg-[#050B18] text-slate-900 dark:text-white transition-colors duration-300">
        <div className="sticky top-0 h-screen flex-shrink-0 hidden md:block z-30">
          <Sidebar />
        </div>
        <div className="flex flex-1 flex-col min-w-0">
          <StudentLayout>
            <AIMentorPage
              initialMessages={MOCK_MESSAGES}
              initialSessions={MOCK_SESSIONS}
              defaultConsoleOpen={true}
              initialSelectedMessageId="2"
            />
          </StudentLayout>
        </div>
      </div>
    );
  },
};

export const EmptyChatState = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/lms/student/ai-mentor',
        query: {},
      },
    },
  },
  render: () => {
    return (
      <div className="flex min-h-screen w-full bg-slate-50 dark:bg-[#050B18] text-slate-900 dark:text-white transition-colors duration-300">
        <div className="sticky top-0 h-screen flex-shrink-0 hidden md:block z-30">
          <Sidebar />
        </div>
        <div className="flex flex-1 flex-col min-w-0">
          <StudentLayout>
            <AIMentorPage />
          </StudentLayout>
        </div>
      </div>
    );
  },
};

export const InteractiveQuizState = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/lms/student/ai-mentor',
        query: {
          sessionId: 'sess-1',
          courseId: '101',
        },
      },
    },
  },
  render: () => {
    const quizOnlyMessages: AgentMessage[] = [
      MOCK_MESSAGES[0],
      MOCK_MESSAGES[4],
      MOCK_MESSAGES[5],
    ];
    return (
      <div className="flex min-h-screen w-full bg-slate-50 dark:bg-[#050B18] text-slate-900 dark:text-white transition-colors duration-300">
        <div className="sticky top-0 h-screen flex-shrink-0 hidden md:block z-30">
          <Sidebar />
        </div>
        <div className="flex flex-1 flex-col min-w-0">
          <StudentLayout>
            <AIMentorPage
              initialMessages={quizOnlyMessages}
              initialSessions={MOCK_SESSIONS}
            />
          </StudentLayout>
        </div>
      </div>
    );
  },
};


