import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SessionProvider } from 'next-auth/react';
import React, { useEffect } from 'react';
import StudentCourseDetailLayout from '@/app/(learning)/lms/student/courses/[courseId]/layout';
import LearnPage from '@/app/(learning)/lms/student/courses/[courseId]/learn/page';
import StatsPage from '@/app/(learning)/lms/student/courses/[courseId]/stats/page';
import StudentQuizTakingPage from '@/app/(learning)/lms/student/courses/[courseId]/quiz/[quizId]/take/page';

import lmsService from '@/services/lmsService';
import progressService from '@/services/progressService';
import analyticsService from '@/services/analyticsService';
import quizService from '@/services/quizService';
import aiService from '@/services/aiService';

// ============================================================================
// RICH MOCK DATA
// ============================================================================

const MOCK_COURSE_ID = 105;
const MOCK_COURSE = {
  id: MOCK_COURSE_ID,
  title: "Lập trình React & Next.js v14 Chuyên Sâu (AI-Native)",
  description: "Lộ trình làm chủ Next.js 14 App Router, Server Components, Server Actions, Caching, Middleware và tối ưu hiệu năng Lighthouse 100 điểm với sự hỗ trợ của các công cụ Generative AI.",
  thumbnail_url: "",
  created_by: 1,
  teacher_name: "TS. Nguyễn Văn A",
  status: "PUBLISHED" as const,
  level: "ADVANCED",
  category: "Web Development",
  created_at: "2026-01-15T08:00:00Z"
};

const MOCK_SECTIONS = [
  {
    id: 1,
    course_id: MOCK_COURSE_ID,
    title: "Chương 1: Bắt đầu với Next.js 14 & App Router",
    order_index: 1,
    level: 1,
    chunk_count: 2,
    description: "Làm quen với cấu trúc thư mục mới và mô hình hoạt động của Server/Client Components.",
    is_published: true,
    created_at: "2026-01-15T08:00:00Z"
  },
  {
    id: 2,
    course_id: MOCK_COURSE_ID,
    title: "Chương 2: Data Fetching, Caching & Revalidation",
    order_index: 2,
    level: 1,
    chunk_count: 2,
    description: "Nắm vững cơ chế cache 4 lớp của Next.js và cách tối ưu hóa truy vấn dữ liệu.",
    is_published: true,
    created_at: "2026-01-15T08:00:00Z"
  },
  {
    id: 3,
    course_id: MOCK_COURSE_ID,
    title: "Chương 3: Đột phá với Server Actions & Security",
    order_index: 3,
    level: 1,
    chunk_count: 2,
    description: "Thao tác cơ sở dữ liệu trực tiếp từ client một cách an toàn thông qua Server Actions.",
    is_published: true,
    created_at: "2026-01-15T08:00:00Z"
  }
];

const MOCK_CONTENTS: Record<number, any[]> = {
  1: [
    {
      id: 101,
      section_id: 1,
      title: "Bài 1: Giới thiệu kiến trúc App Router & SSR thế hệ mới",
      type: "VIDEO",
      is_mandatory: true,
      order_index: 1,
      description: "Video dài 15 phút giải thích sự khác biệt giữa Pages Router và App Router.",
      is_published: true,
      metadata: {
        node_id: 10,
        video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: 900
      }
    },
    {
      id: 102,
      section_id: 1,
      title: "Bài 2: Hướng dẫn cài đặt môi trường & Khởi tạo dự án",
      type: "DOCUMENT",
      is_mandatory: true,
      order_index: 2,
      description: "Tài liệu hướng dẫn chi tiết từng bước cài đặt Node.js và template BDC Frontend.",
      is_published: true,
      metadata: {
        node_id: 11,
        content: `### 🛠 Hướng dẫn thiết lập môi trường phát triển

Để học tốt khóa học này, bạn cần cài đặt các công cụ sau:

1. **Node.js (v20 LTS trở lên)**:
   * Tải bản cài đặt từ trang chủ [nodejs.org](https://nodejs.org/).
   * Kiểm tra phiên bản bằng lệnh: \`node -v\`.

2. **Package Manager**:
   * Khóa học sử dụng \`npm\` làm trình quản lý thư viện mặc định.

3. **VS Code Extensions khuyên dùng**:
   * *ESLint* - Đảm bảo quy chuẩn code.
   * *Prettier* - Tự động định dạng code khi save.
   * *Tailwind CSS IntelliSense* - Gợi ý class Tailwind nhanh chóng.

\`\`\`bash
# Khởi tạo dự án Next.js mới
npx create-next-app@latest my-app --typescript --tailwind --app
\`\`\`
`
      }
    }
  ],
  2: [
    {
      id: 201,
      section_id: 2,
      title: "Bài 3: Tìm hiểu 4 lớp Caching của Next.js",
      type: "TEXT",
      is_mandatory: true,
      order_index: 1,
      description: "Bài đọc sâu về Request Memoization, Data Cache, Full Route Cache và Router Cache.",
      is_published: true,
      metadata: {
        node_id: 12,
        content: `### Next.js Caching Deep Dive

Next.js cải thiện hiệu năng ứng dụng bằng cách lưu cache dữ liệu ở nhiều cấp độ:

| Cấp độ Cache | Cơ chế lưu trữ | Thời gian sống (Lifetime) | Cách vô hiệu hóa (Revalidation) |
|---|---|---|---|
| **Request Memoization** | Bộ nhớ Server (React tree) | Vòng đời của 1 Request | Tự động |
| **Data Cache** | Server (Disk/Memory) | Vĩnh viễn (Persistent) | \`revalidatePath\` hoặc \`revalidateTag\` |
| **Full Route Cache** | Server (HTML/RSC Payload) | Vĩnh viễn | Tương tự Data Cache |
| **Router Cache** | Bộ nhớ Client (Browser) | 5 phút (hoặc 30s với dynamic) | Reload trang, \`router.refresh()\` |

#### Ví dụ về Fetching với Tag Revalidation:
\`\`\`ts
const res = await fetch('https://api.bdc.com/products', {
  next: { tags: ['products-list'] }
});
\`\`\`
`
      }
    },
    {
      id: 202,
      section_id: 2,
      title: "Bài 4: Trắc nghiệm kiến thức Data Fetching & Cache",
      type: "QUIZ",
      is_mandatory: true,
      order_index: 2,
      description: "Bài trắc nghiệm 10 câu hỏi để đánh giá mức độ hiểu bài về Caching.",
      is_published: true,
      metadata: {
        node_id: 13,
        quiz_id: 501
      }
    }
  ],
  3: [
    {
      id: 301,
      section_id: 3,
      title: "Bài 5: Hướng dẫn tích hợp Server Actions vào Form",
      type: "VIDEO",
      is_mandatory: false,
      order_index: 1,
      description: "Thực hành xây dựng Form đăng ký khóa học sử dụng Server Actions và useFormStatus.",
      is_published: true,
      metadata: {
        node_id: 14,
        video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: 1200
      }
    },
    {
      id: 302,
      section_id: 3,
      title: "Bài 6: Thực hành bảo mật Server Actions",
      type: "QUIZ",
      is_mandatory: true,
      order_index: 2,
      description: "Trắc nghiệm đánh giá kiến thức bảo mật Server Actions (Input Validation, Authorization check).",
      is_published: true,
      metadata: {
        node_id: 15,
        quiz_id: 502
      }
    }
  ]
};

const MOCK_QUIZ_501 = {
  id: 501,
  title: "Đánh giá kiến thức: Next.js Caching & Revalidation",
  description: "Trắc nghiệm kiến thức tổng hợp về cơ chế lưu trữ cache, revalidate path và router cache trong Next.js 14.",
  instructions: "Chọn câu trả lời đúng nhất cho các câu hỏi sau. Bạn cần đạt tối thiểu 80% điểm để vượt qua.",
  time_limit_minutes: 10,
  total_points: 30,
  passing_score: 24,
  shuffle_questions: false,
  shuffle_answers: false
};

const MOCK_QUIZ_QUESTIONS_501 = [
  {
    id: 1001,
    question_type: "SINGLE_CHOICE",
    question_text: "Cơ chế 'Request Memoization' của React hoạt động ở phạm vi nào?",
    points: 10,
    order_index: 1,
    is_required: true,
    answer_options: [
      { id: 1, option_text: "Phạm vi toàn bộ Server và tất cả người dùng (Global Cache)" },
      { id: 2, option_text: "Phạm vi một phiên làm việc của người dùng (Session Cache)" },
      { id: 3, option_text: "Phạm vi một lượt render Component Tree của một Request đơn lẻ (Per-request Cache)", is_correct: true },
      { id: 4, option_text: "Phạm vi trình duyệt Client (Browser Cache)" }
    ]
  },
  {
    id: 1002,
    question_type: "MULTIPLE_CHOICE",
    question_text: "Những cách nào sau đây giúp vô hiệu hóa (revalidate) dữ liệu đã được lưu trong Data Cache? (Chọn 2 đáp án)",
    points: 10,
    order_index: 2,
    is_required: true,
    answer_options: [
      { id: 5, option_text: "Sử dụng hàm revalidatePath()", is_correct: true },
      { id: 6, option_text: "Gọi router.refresh() ở phía client" },
      { id: 7, option_text: "Sử dụng hàm revalidateTag()", is_correct: true },
      { id: 8, option_text: "Clear bộ nhớ cache của trình duyệt" }
    ]
  },
  {
    id: 1003,
    question_type: "TEXT",
    question_text: "Hãy nêu tên 4 lớp cache chính được tích hợp sẵn trong cấu trúc Next.js App Router.",
    points: 10,
    order_index: 3,
    is_required: true,
    settings: { placeholder: "Gõ câu trả lời của bạn..." }
  }
];

// Helper to intercept and apply mocks
const setupGlobalMocks = () => {
  // 1. LMS Service Mocks
  lmsService.getMyRoles = async () => ["STUDENT"];
  lmsService.getCourse = async (id: number) => ({ data: MOCK_COURSE });
  lmsService.listSections = async (courseId: number) => ({ data: MOCK_SECTIONS });
  lmsService.getCoTeachers = async (courseId: number) => [];
  lmsService.listContent = async (sectionId: number) => {
    return { data: MOCK_CONTENTS[sectionId] || [] };
  };

  // 2. Progress Service Mocks
  progressService.getMyCourseProgress = async (courseId: number) => ({
    course_id: MOCK_COURSE_ID,
    completed_count: 2,
    total_mandatory: 5,
    progress_percent: 40,
    completed_content_ids: [101, 102]
  });

  progressService.getMyCourseProgressDetail = async (courseId: number) => [
    { content_id: 101, content_title: "Bài 1: Giới thiệu kiến trúc App Router & SSR thế hệ mới", content_type: "VIDEO", section_title: "Chương 1: Bắt đầu với Next.js 14 & App Router", is_mandatory: true, is_completed: true, completed_at: "2026-07-10T12:00:00Z" },
    { content_id: 102, content_title: "Bài 2: Hướng dẫn cài đặt môi trường & Khởi tạo dự án", content_type: "DOCUMENT", section_title: "Chương 1: Bắt đầu với Next.js 14 & App Router", is_mandatory: true, is_completed: true, completed_at: "2026-07-11T14:30:00Z" },
    { content_id: 201, content_title: "Bài 3: Tìm hiểu 4 lớp Caching của Next.js", content_type: "TEXT", section_title: "Chương 2: Data Fetching, Caching & Revalidation", is_mandatory: true, is_completed: false, completed_at: null },
    { content_id: 202, content_title: "Bài 4: Trắc nghiệm kiến thức Data Fetching & Cache", content_type: "QUIZ", section_title: "Chương 2: Data Fetching, Caching & Revalidation", is_mandatory: true, is_completed: false, completed_at: null },
    { content_id: 301, content_title: "Bài 5: Hướng dẫn tích hợp Server Actions vào Form", content_type: "VIDEO", section_title: "Chương 3: Đột phá với Server Actions & Security", is_mandatory: false, is_completed: false, completed_at: null },
    { content_id: 302, content_title: "Bài 6: Thực hành bảo mật Server Actions", content_type: "QUIZ", section_title: "Chương 3: Đột phá với Server Actions & Security", is_mandatory: true, is_completed: false, completed_at: null }
  ];

  progressService.markContentComplete = async (contentId: number) => ({ success: true });

  // 3. Analytics Service Mocks
  analyticsService.getMyQuizScores = async () => ({
    data: [
      {
        quiz_id: 501,
        quiz_title: "Đánh giá kiến thức: Next.js Caching & Revalidation",
        best_percentage: 90,
        best_points: 27,
        total_points: 30,
        attempts_count: 1,
        is_passed: true,
        passing_score: 80,
        last_attempt_at: "2026-07-12T10:00:00Z",
        status: "passed" as const
      },
      {
        quiz_id: 502,
        quiz_title: "Thực hành bảo mật Server Actions",
        best_percentage: 50,
        best_points: 5,
        total_points: 10,
        attempts_count: 2,
        is_passed: false,
        passing_score: 80,
        last_attempt_at: "2026-07-14T09:15:00Z",
        status: "failed" as const
      }
    ]
  });

  analyticsService.getMyWeaknesses = async () => ({
    data: {
      course_id: MOCK_COURSE_ID,
      total_wrong_percent: 28.4,
      weak_nodes: [
        {
          node_id: 12,
          node_name: "Next.js Data Cache Revalidation",
          total_attempt: 10,
          mastery_level: 35,
          status_level: "Yếu" as const,
          wrong_count: 6,
          flashcard_count: 4
        },
        {
          node_id: 15,
          node_name: "CSRF & Server Actions Security Guard",
          total_attempt: 8,
          mastery_level: 50,
          status_level: "Cần cải thiện" as const,
          wrong_count: 4,
          flashcard_count: 2
        }
      ]
    }
  });

  // 4. Quiz Service Mocks
  quizService.getQuiz = async (quizId: number) => ({ data: MOCK_QUIZ_501 });
  quizService.getMyQuizAttempts = async (quizId: number) => ({ data: [] });
  quizService.startQuizAttempt = async (quizId: number) => ({
    data: {
      id: 8801,
      quiz_id: quizId,
      started_at: new Date().toISOString(),
      time_spent_seconds: 0
    }
  });
  quizService.submitAnswer = async () => ({ success: true });
  quizService.submitQuiz = async () => ({
    data: {
      id: 8801,
      score_percentage: 90,
      points_obtained: 27,
      total_points: 30,
      is_passed: true,
      status: "COMPLETED"
    }
  });

  // 5. AI Service Mock
  aiService.listKnowledgeNodes = async (courseId: number) => [
    { id: 10, name: "Giới thiệu kiến trúc App Router & SSR thế hệ mới", source_content_id: 101, course_id: MOCK_COURSE_ID, level: 1, order_index: 1, chunk_count: 1 },
    { id: 11, name: "Hướng dẫn cài đặt môi trường & Khởi tạo dự án", source_content_id: 102, course_id: MOCK_COURSE_ID, level: 1, order_index: 2, chunk_count: 1 },
    { id: 12, name: "Tìm hiểu 4 lớp Caching của Next.js", source_content_id: 201, course_id: MOCK_COURSE_ID, level: 1, order_index: 3, chunk_count: 1 },
    { id: 13, name: "Trắc nghiệm kiến thức Data Fetching & Cache", source_content_id: 202, course_id: MOCK_COURSE_ID, level: 1, order_index: 4, chunk_count: 1 },
    { id: 14, name: "Hướng dẫn tích hợp Server Actions vào Form", source_content_id: 301, course_id: MOCK_COURSE_ID, level: 1, order_index: 5, chunk_count: 1 },
    { id: 15, name: "Thực hành bảo mật Server Actions", source_content_id: 302, course_id: MOCK_COURSE_ID, level: 1, order_index: 6, chunk_count: 1 }
  ];
};

// ============================================================================
// STORYBOOK META
// ============================================================================

const meta: Meta = {
  title: 'LMS/Pages/StudentCourseWorkspace',
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true
    }
  },
  decorators: [
    (Story) => {
      // Setup mocks on runtime mount
      setupGlobalMocks();
      return (
        <SessionProvider
          session={{
            user: {
              id: '99',
              name: 'Nguyễn Văn Học Viên',
              email: 'student@bdc.edu.vn',
              role: 'STUDENT'
            } as any,
            expires: '2026-12-31T23:59:59.999Z'
          }}
        >
          <div className="bg-slate-50 dark:bg-[#050B18] text-slate-900 dark:text-slate-100 min-h-screen">
            <Story />
          </div>
        </SessionProvider>
      );
    }
  ]
};

export default meta;

// ============================================================================
// STORIES
// ============================================================================

// Mock wrapper component to inject path properties correctly
function CourseLayoutMockWrapper({
  children,
  pathname,
  searchParams = {}
}: {
  children: React.ReactNode;
  pathname: string;
  searchParams?: Record<string, string>;
}) {
  return (
    <StudentCourseDetailLayout>
      {children}
    </StudentCourseDetailLayout>
  );
}

// 1. /learn (Video lesson selected)
export const LearnVideoLesson: StoryObj = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: `/lms/student/courses/${MOCK_COURSE_ID}/learn`,
        query: { courseId: String(MOCK_COURSE_ID), contentId: "101" }
      }
    }
  },
  render: () => {
    return (
      <CourseLayoutMockWrapper pathname={`/lms/student/courses/${MOCK_COURSE_ID}/learn`} searchParams={{ contentId: "101" }}>
        <LearnPage />
      </CourseLayoutMockWrapper>
    );
  }
};

// 2. /learn (Text lesson selected)
export const LearnTextLesson: StoryObj = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: `/lms/student/courses/${MOCK_COURSE_ID}/learn`,
        query: { courseId: String(MOCK_COURSE_ID), contentId: "201" }
      }
    }
  },
  render: () => {
    return (
      <CourseLayoutMockWrapper pathname={`/lms/student/courses/${MOCK_COURSE_ID}/learn`} searchParams={{ contentId: "201" }}>
        <LearnPage />
      </CourseLayoutMockWrapper>
    );
  }
};

// 3. /stats
export const StatsView: StoryObj = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: `/lms/student/courses/${MOCK_COURSE_ID}/stats`,
        query: { courseId: String(MOCK_COURSE_ID) }
      }
    }
  },
  render: () => {
    return (
      <CourseLayoutMockWrapper pathname={`/lms/student/courses/${MOCK_COURSE_ID}/stats`}>
        <StatsPage />
      </CourseLayoutMockWrapper>
    );
  }
};

// 4. /quiz/[quizId]/take (Quiz taking view)
export const QuizTakingView: StoryObj = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: `/lms/student/courses/${MOCK_COURSE_ID}/quiz/501/take`,
        query: { courseId: String(MOCK_COURSE_ID), quizId: "501", start: "true" }
      }
    }
  },
  render: () => {
    // Override getMyQuizAttempts specifically for this page to mock an IN_PROGRESS attempt
    quizService.getMyQuizAttempts = async () => ({
      data: [
        {
          id: 8801,
          quiz_id: 501,
          status: "IN_PROGRESS",
          started_at: new Date().toISOString(),
          time_spent_seconds: 45
        }
      ]
    });
    // Mock getQuizQuestions
    (quizService as any).getQuizQuestions = async () => ({
      data: MOCK_QUIZ_QUESTIONS_501
    });

    return (
      <div className="p-8 max-w-5xl mx-auto">
        <StudentQuizTakingPage />
      </div>
    );
  }
};
