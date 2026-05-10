import { redirect } from "next/navigation";

export default async function CourseDetailRoot({
  params,
}: {
  params: Promise<{ courseId: string }>; // Cập nhật type của params thành Promise
}) {
  // Dùng await để lấy dữ liệu từ params
  const { courseId } = await params; 

  redirect(`/lms/teacher/courses/${courseId}/overview`);
}