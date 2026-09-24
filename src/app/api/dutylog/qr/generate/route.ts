import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { NextResponse } from "next/server";

const DUTYLOG_URL = process.env.DUTYLOG_SERVICE_URL || (process.env.NODE_ENV === "production" ? "http://dutylog-service:8086" : "http://localhost:8086");

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Vui lòng đăng nhập để tạo mã QR điểm danh" }, { status: 401 });
  }

  let body: { student_id?: string; student_name?: string } = {};
  try {
    body = await request.json();
  } catch {
    // Body is optional if client relies on server session
  }

  const studentId = (body.student_id || (session.user as any).code || "").trim();
  const studentName = (body.student_name || session.user.name || "Student").trim();

  if (!studentId) {
    return NextResponse.json(
      { error: "Không tìm thấy Mã số sinh viên (MSSV). Vui lòng cập nhật MSSV trong hồ sơ trước khi tạo mã QR." },
      { status: 400 }
    );
  }

  // Determine potential hosts to attempt connection with graceful fallback
  const urlsToTry = [
    DUTYLOG_URL,
    ...(DUTYLOG_URL.includes("dutylog-service")
      ? ["http://localhost:8086", "http://127.0.0.1:8086"]
      : ["http://dutylog-service:8086"]),
  ];

  // Remove duplicates while preserving order
  const uniqueUrls = Array.from(new Set(urlsToTry));
  let lastError: any = null;

  for (const baseUrl of uniqueUrls) {
    try {
      const res = await fetch(`${baseUrl}/api/v1/qr/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
        },
        body: JSON.stringify({
          student_id: studentId,
          student_name: studentName,
        }),
        signal: AbortSignal.timeout(4000),
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      } else {
        const errorData = await res.json().catch(() => ({}));
        return NextResponse.json(
          { error: errorData.error || `DutyLog trả về mã lỗi HTTP ${res.status}` },
          { status: res.status }
        );
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  console.error("[DUTYLOG_QR_GENERATE_ERROR] Could not connect to DutyLog backend:", lastError);
  return NextResponse.json(
    {
      error:
        "Không thể kết nối đến máy chủ DutyLog. Vui lòng kiểm tra lại dịch vụ dutylog-service hoặc liên hệ Ban Kỹ thuật.",
    },
    { status: 503 }
  );
}
