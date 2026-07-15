import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Card } from '@/components/lms/shared/Card';
import { CourseCard } from '@/components/lms/shared/CourseCard';
import { PrimaryBtn } from '@/components/lms/shared/Button';
import React from 'react';

const meta: Meta = {
  title: 'LMS/Components/Card',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

export const AccentCards: StoryObj = {
  render: () => {
    const colors: Array<"blue" | "green" | "purple" | "orange" | "red" | "cyan"> = [
      'blue', 'green', 'purple', 'orange', 'red', 'cyan'
    ];
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-[800px]">
        {colors.map((c) => (
          <Card key={c} accentColor={c} className="p-6">
            <h4 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider mb-2">{c} Card</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Card container với vạch đứng trái màu {c}.</p>
          </Card>
        ))}
      </div>
    );
  },
};

export const Courses: StoryObj = {
  render: () => {
    return (
      <div className="grid md:grid-cols-2 gap-6 w-[800px]">
        {/* Course Card 1: Beginner Level, Draft Status, In Progress */}
        <CourseCard
          id={1}
          title="Lập trình Python cơ bản cho Khoa học Dữ liệu"
          description="Khóa học cung cấp kiến thức nền tảng về ngôn ngữ Python, các thư viện phổ biến như NumPy, Pandas và ứng dụng thực tế."
          category="Python, Data Science"
          level="BEGINNER"
          status="DRAFT"
          teacherName="ThS. Nguyễn Văn A"
          enrollmentCount={142}
          progress={45}
          onClick={() => alert("Clicked Course 1")}
          actions={<PrimaryBtn size="sm">Tiếp tục học</PrimaryBtn>}
        />

        {/* Course Card 2: Advanced Level, Enrolled, Completed */}
        <CourseCard
          id={2}
          title="Xử lý dữ liệu lớn với Apache Spark & Kafka"
          description="Tìm hiểu sâu về xử lý dữ liệu dòng thời gian thực, tối ưu hóa Spark SQL, và cấu hình cluster dữ liệu lớn trong doanh nghiệp."
          category="Big Data, Spark"
          level="ADVANCED"
          teacherName="Dr. Lê Huy B"
          enrollmentCount={89}
          onClick={() => alert("Clicked Course 2")}
          actions={<PrimaryBtn size="sm">Chi tiết</PrimaryBtn>}
        />
      </div>
    );
  },
};
