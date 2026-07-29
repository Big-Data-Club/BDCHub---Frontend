import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InstructionGuide, type InstructionRole } from "@/components/instructions/InstructionGuide";

const roles: InstructionRole[] = ["student", "teacher", "admin"];

const roleMeta: Record<InstructionRole, { title: string; description: string }> = {
  student: { title: "Hướng dẫn học viên", description: "Hướng dẫn chi tiết cho học viên sử dụng BDC Hub, học tập cùng AI và gợi ý ôn tập." },
  teacher: { title: "Hướng dẫn giảng viên", description: "Hướng dẫn chi tiết cho giảng viên xây dựng khóa học, đánh giá người học và sử dụng AI có kiểm duyệt trên BDC Hub." },
  admin: { title: "Hướng dẫn quản trị viên", description: "Hướng dẫn chi tiết cho quản trị viên về phân quyền, tổ chức, AI và recommender trên BDC Hub." },
};

export function generateStaticParams() {
  return roles.map((role) => ({ role }));
}

export async function generateMetadata({ params }: { params: Promise<{ role: string }> }): Promise<Metadata> {
  const { role } = await params;
  if (!roles.includes(role as InstructionRole)) return {};
  const meta = roleMeta[role as InstructionRole];
  return { title: meta.title, description: meta.description, alternates: { canonical: `/instructions/${role}` } };
}

export default async function InstructionRolePage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  if (!roles.includes(role as InstructionRole)) notFound();
  return <InstructionGuide role={role as InstructionRole} />;
}
