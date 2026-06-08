import { getAccessToken } from "@/services/authToken";

export interface SendMailData {
  to: string;
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  signatureType: "bdc-1" | "none";
  templateType: "cosmic" | "plain";
}

async function authHeaders(extra?: Record<string, string>): Promise<HeadersInit> {
  const headers: Record<string, string> = { ...extra };
  const token = await getAccessToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function sendAdminMail(data: SendMailData): Promise<{ message: string }> {
  const res = await fetch(`/apiv1/api/admin/mail/send`, {
    method: "POST",
    headers: await authHeaders({ "Content-Type": "application/json" }),
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || "Failed to send email");
  }
  return res.json();
}
