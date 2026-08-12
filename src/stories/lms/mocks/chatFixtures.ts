import type { HITLRequestData } from "@/types";

export const MOCK_USER_PROFILE = {
  name: "Nguyễn Văn Học",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
  role: "Student",
  courseName: "Cấu trúc dữ liệu & Giải thuật nâng cao",
};

export const MOCK_HITL_REQUEST: HITLRequestData = {
  tool: "generate_practice_quiz",
  message: "Tạo bài kiểm tra trắc nghiệm 5 câu về chủ đề QuickSort & Cây Nhị Phân",
  data: { numQuestions: 5, difficulty: "medium", action: "confirm" },
};

export const MOCK_THINKING_STEPS = [
  { step: "Phân tích câu hỏi của người dùng về độ phức tạp QuickSort" },
  { step: "Truy xuất ngữ cảnh", detail: "Đã tìm thấy 2 tài liệu khớp" },
  { step: "Tổng hợp công thức toán LaTeX & viết code minh họa C++" }
];

export const MOCK_TOOL_ACTIVITIES = [
  {
    tool: "search_course_kb",
    status: "done" as const,
    args: { query: "QuickSort worst case complexity", courseId: 102 },
    message: "Found 2 matching documents: 'QuickSort.pdf' and 'DSA_Chapter_4.md'"
  },
  {
    tool: "run_python_interpreter",
    status: "done" as const,
    args: { code: "import time\nprint('Execution completed in 0.04s')" },
    message: "Execution completed in 0.04s"
  }
];

export const RICH_MARKDOWN_SAMPLE = `
# Phân tích Thuật toán Sắp xếp QuickSort

Chào bạn! Dưới đây là phân tích chi tiết về **QuickSort** kèm theo ví dụ minh họa và công thức toán học.

### 1. Nguyên lý hoạt động
QuickSort hoạt động dựa trên nguyên lý **Chia để trị (Divide and Conquer)**:
1. Chọn một phần tử làm *Pivot* (phần tử chốt).
2. Phân chia mảng: các phần tử nhỏ hơn Pivot nằm bên trái, lớn hơn nằm bên phải.
3. Đệ quy sắp xếp hai mảng con.

> **Lưu ý quan trọng**: Việc chọn Pivot đóng vai trò quyết định hiệu năng của thuật toán!

---

### 2. Công thức Độ phức tạp (LaTeX)
Độ phức tạp thời gian trung bình được tính theo công thức đệ quy:

$$T(n) = 2T(n/2) + O(n)$$

Khi giải phương trình đệ quy trên, ta có độ phức tạp trung bình là:
$$O(n \\log n)$$

Đối với trường hợp xấu nhất (*Worst-case*):
$$T(n) = T(n-1) + O(n) \\Rightarrow O(n^2)$$

---

### 3. Bảng so sánh các Thuật toán Sắp xếp

| Thuật toán | Best Case | Average Case | Worst Case | Memory |
| :--- | :---: | :---: | :---: | :---: |
| **QuickSort** | $O(n \\log n)$ | $O(n \\log n)$ | $O(n^2)$ | $O(\\log n)$ |
| **MergeSort** | $O(n \\log n)$ | $O(n \\log n)$ | $O(n \\log n)$ | $O(n)$ |
| **HeapSort** | $O(n \\log n)$ | $O(n \\log n)$ | $O(n \\log n)$ | $O(1)$ |

---

### 4. Mã nguồn C++ minh họa

\`\`\`cpp
#include <iostream>
#include <vector>

int partition(std::vector<int>& arr, int low, int high) {
    int pivot = arr[high];
    int i = (low - 1);
    for (int j = low; j <= high - 1; j++) {
        if (arr[j] < pivot) {
            i++;
            std::swap(arr[i], arr[j]);
        }
    }
    std::swap(arr[i + 1], arr[high]);
    return (i + 1);
}

void quickSort(std::vector<int>& arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}
\`\`\`
`;
