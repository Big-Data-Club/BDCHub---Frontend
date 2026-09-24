export interface QRGenerateResponse {
  payload: string;
  expires_at: string;
}

export const dutylogService = {
  async generateQRToken(studentId: string, studentName: string): Promise<QRGenerateResponse> {
    const res = await fetch("/api/dutylog/qr/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        student_id: studentId.trim(),
        student_name: studentName.trim(),
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Lỗi tạo mã QR (HTTP ${res.status})`);
    }

    return res.json();
  },
};
