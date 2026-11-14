import type { Metadata } from 'next';
import { DutyLogLanding } from '@/features/dutylog-project/DutyLogLanding';

export const metadata: Metadata = {
  title: 'DutyLog — Không gian chung. Thông tin rõ ràng.',
  description: 'DutyLog kết nối ca trực, ghi nhận ra vào và trạng thái phòng cho CLB sinh viên. Khám phá dự án và trải nghiệm demo tương tác từ ứng dụng.',
  alternates: { canonical: '/projects/dutylog' },
  openGraph: {
    title: 'DutyLog — Phòng có mở? Ai đang ở đó?',
    description: 'Một dự án của Big Data Club. Trải nghiệm demo tương tác, khám phá workflow và thiết kế DutyLog.',
    url: '/projects/dutylog',
    locale: 'vi_VN',
    type: 'website',
  },
};

export default function DutyLogProjectPage() {
  return <DutyLogLanding />;
}
