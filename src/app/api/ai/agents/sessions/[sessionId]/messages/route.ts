import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await context.params;
    
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "100";

    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://ai-service:8000";
    let res: Response | null = null;
    try {
      res = await fetch(
          `${AI_SERVICE_URL}/ai/agents/sessions/${sessionId}/messages?limit=${limit}`, 
          {
              method: "GET",
              headers: {
                  "X-AI-Secret": process.env.AI_SERVICE_SECRET || "bdc-ai-secret-2026",
              },
              cache: "no-store",
          }
      );
    } catch (fetchErr) {
      if (process.env.MOCK_AI_SERVICE === "true") {
        console.warn("[ai-messages-proxy] MOCK_AI_SERVICE is true, returning mock messages for dev UI preview.");
        return NextResponse.json({
          messages: [
            {
              id: "msg-1",
              role: "user",
              content: "AI Mentor ơi, hãy giúp mình hiểu rõ thuật toán QuickSort và so sánh nó với MergeSort với!",
              created_at: new Date(Date.now() - 600000).toISOString(),
            },
            {
              id: "msg-2",
              role: "assistant",
              content: "# Phân tích Thuật toán QuickSort\n\nQuickSort là thuật toán sắp xếp dựa trên nguyên lý **Chia để trị (Divide and Conquer)**.\n\n### Độ phức tạp toán học (LaTeX):\n\n$$T(n) = 2T(n/2) + O(n) \\Rightarrow O(n \\log n)$$\n\n### Mã nguồn C++ minh họa:\n```cpp\n#include <iostream>\nusing namespace std;\n\nvoid quickSort(int arr[], int low, int high) {\n    if (low < high) {\n        // partition and sort recursively\n    }\n}\n```",
              created_at: new Date(Date.now() - 300000).toISOString(),
            },
          ],
        });
      }
      throw fetchErr;
    }

    if (!res.ok) {
      throw new Error(`AI service returned ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("AI Session Messages Proxy Error:", error);
    if (process.env.MOCK_AI_SERVICE === "true") {
      return NextResponse.json({
        messages: [
          {
            id: "msg-1",
            role: "assistant",
            content: "Xin chào! Mình là AI Mentor. Bạn cần hỗ trợ gì về môn học?",
            created_at: new Date().toISOString(),
          },
        ],
      });
    }
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
