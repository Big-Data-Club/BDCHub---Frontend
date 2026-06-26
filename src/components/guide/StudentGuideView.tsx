"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  BookOpen, 
  Search, 
  Check, 
  Play, 
  FileText, 
  Sparkles, 
  Send, 
  RotateCw, 
  BrainCircuit,
  HelpCircle,
  Video,
  FileCheck,
  Award,
  ChevronRight,
  UserCheck,
  Upload
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
}

export function StudentGuideView() {
  const [activeTab, setActiveTab] = useState<number>(0);

  // 1. Discover State
  const [enrollStatus, setEnrollStatus] = useState<"idle" | "loading" | "enrolled">("idle");
  
  // 2. Lesson Viewer State
  const [lessonTab, setLessonTab] = useState<"pdf" | "video" | "markdown">("pdf");
  const [isPlaying, setIsPlaying] = useState(false);

  // 3. Quiz Taking State (Real Mock representing take page)
  const [mockCurrentQuestion, setMockCurrentQuestion] = useState<number>(0);
  const [mockAnswers, setMockAnswers] = useState<{ [key: number]: any }>({});
  const [mockTimeLeft, setMockTimeLeft] = useState<number>(900); // 15:00
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // 4. Chatbot State
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", sender: "ai", text: "Xin chào! Mình là trợ lý học tập AI Mentor. Mình có thể giải thích nội dung bài giảng, tóm tắt tài liệu PDF hoặc hỗ trợ bạn làm quiz. Bạn cần giúp gì nào?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 5. Flashcard State
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardLevel, setCardLevel] = useState<string | null>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Mock Timer countdown
  useEffect(() => {
    if (activeTab !== 2 || quizSubmitted) return;
    const interval = setInterval(() => {
      setMockTimeLeft(prev => {
        if (prev <= 0) {
          setQuizSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTab, quizSubmitted]);

  // Handle Enrollment simulation
  const handleEnroll = () => {
    setEnrollStatus("loading");
    setTimeout(() => {
      setEnrollStatus("enrolled");
    }, 1200);
  };

  const resetEnroll = () => {
    setEnrollStatus("idle");
  };

  // Handle Chatbot simulation
  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || chatInput;
    if (!text.trim()) return;

    const userMsgId = Date.now().toString();
    setMessages(prev => [...prev, { id: userMsgId, sender: "user", text }]);
    if (!textToSend) setChatInput("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      let aiText = "Xin lỗi, mình chưa có dữ liệu cho câu hỏi này. Bạn hãy thử chọn một chủ đề gợi ý ở dưới nhé!";
      const query = text.toLowerCase();
      
      if (query.includes("rdd") || query.includes("resilient")) {
        aiText = "RDD (Resilient Distributed Dataset) là cấu trúc dữ liệu cốt lõi của Spark. Nó đại diện cho tập hợp dữ liệu bất biến, phân tán, cho phép tính toán song song song và có khả năng phục hồi tự động khi xảy ra lỗi trên cluster.";
      } else if (query.includes("tóm tắt") || query.includes("pdf")) {
        aiText = "Tài liệu này hướng dẫn cách đọc dữ liệu vào Spark DataFrame thông qua SparkSession, thực hiện các biến đổi cơ bản như lọc dữ liệu (.filter), chiếu cột (.select), gom nhóm (.groupBy) và tối ưu truy vấn bằng Catalyst Optimizer.";
      } else if (query.includes("spark") && query.includes("mapreduce")) {
        aiText = "Khác biệt cốt lõi là tốc độ và lưu trữ: Spark xử lý in-memory (trong bộ nhớ RAM) nên nhanh gấp 10-100 lần MapReduce vốn phải đọc/ghi dữ liệu xuống đĩa cứng liên tục sau mỗi bước tính toán.";
      }

      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: "ai", text: aiText }]);
    }, 1000);
  };

  const handleSuggestClick = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const mockQuestions = [
    {
      id: 1,
      type: "SINGLE_CHOICE",
      text: "Trong Apache Spark, RDD viết tắt của cụm từ nào?",
      points: 10,
      options: [
        { id: "a", text: "Resilient Distributed Dataset" },
        { id: "b", text: "Relational Database Driver" },
        { id: "c", text: "Random Distributed Directory" }
      ]
    },
    {
      id: 2,
      type: "SHORT_ANSWER",
      text: "Điền tên ngôn ngữ lập trình chính được dùng để viết Apache Spark:",
      points: 5
    },
    {
      id: 3,
      type: "FILE_UPLOAD",
      text: "Nộp file báo cáo thực hành Spark Core (định dạng PDF hoặc ZIP):",
      points: 20
    }
  ];

  const handleMockAnswer = (questionId: number, answerData: any) => {
    setMockAnswers(prev => ({ ...prev, [questionId]: answerData }));
  };

  const isMockAnswered = (idx: number) => {
    const q = mockQuestions[idx];
    const ans = mockAnswers[q.id];
    if (!ans) return false;
    if (q.type === "SINGLE_CHOICE") return !!ans.selected_option_id;
    if (q.type === "SHORT_ANSWER") return ans.answer_text && ans.answer_text.trim().length > 0;
    if (q.type === "FILE_UPLOAD") return !!ans.file_name;
    return true;
  };

  const totalAnswered = mockQuestions.filter((_, idx) => isMockAnswered(idx)).length;

  const guideSteps = [
    {
      title: "1. Khám phá & Đăng ký Khóa học",
      icon: Search,
      desc: "Tìm kiếm và tham gia vào các khóa học chất lượng cao.",
      details: [
        { title: "Mở trang Khám phá", text: "Truy cập đường dẫn Khám phá Khóa học (/lms/student/discover) từ thanh menu trái 'Shared Knowledge' để xem tất cả các khóa học hiện có." },
        { title: "Bộ lọc & Tìm kiếm", text: "Nhập từ khóa tìm kiếm khóa học mong muốn, hoặc lọc khóa học theo danh mục lĩnh vực quan tâm để chọn khóa học chuẩn xác." },
        { title: "Ghi danh học tập", text: "Bấm nút 'Đăng ký học'. Khi hiển thị 'Đã đăng ký thành công', khóa học sẽ tự động được thêm vào Dashboard của bạn." }
      ]
    },
    {
      title: "2. Xem tài liệu & Học tập",
      icon: BookOpen,
      desc: "Học tập linh hoạt với nhiều loại tài liệu (PDF, Video, Ghi chú).",
      details: [
        { title: "Chọn khóa học tại Dashboard", text: "Truy cập `/lms/student` để thấy tất cả các khóa học bạn đã đăng ký và nhấp chọn để bắt đầu học (/lms/student/courses/[courseId]/learn)." },
        { title: "Outline bài giảng", text: "Bên trái là danh sách các bài giảng được cấu trúc phân cấp. Hãy nhấp chọn bài để học theo đúng lộ trình." },
        { title: "Trình duyệt thông minh", text: "Nội dung bài học tự động chuyển đổi tabs: Trình đọc tài liệu PDF (hỗ trợ toàn màn hình), Trình phát Video, hoặc soạn thảo Ghi chú cá nhân để lưu lại kiến thức." }
      ]
    },
    {
      title: "3. Làm bài Kiểm tra (Quiz)",
      icon: FileCheck,
      desc: "Làm bài kiểm tra tương tác với thời gian đếm ngược và thanh tiến độ.",
      details: [
        { title: "Thời gian đếm ngược & Tiến độ", text: "Trang làm quiz (/lms/student/courses/[courseId]/quiz/[quizId]/take) hiển thị đồng hồ ⏱️ đếm ngược. Thanh Progress Bar sẽ tự động cập nhật khi bạn trả lời câu hỏi." },
        { title: "Bảng điều hướng câu hỏi", text: "Sử dụng hàng nút số thứ tự câu hỏi ở dưới để chuyển nhanh: Câu màu xanh lá (Đã trả lời), màu xám (Chưa trả lời) và màu xanh dương (Câu hiện tại)." },
        { title: "Nộp bài & Phản hồi chi tiết", text: "Nhấp 'Nộp bài' ở câu cuối cùng. Sau khi hệ thống xác nhận và chấm điểm (Auto-grade), bạn sẽ được chuyển đến trang chi tiết kết quả để xem điểm, số câu đúng và giải thích." }
      ]
    },
    {
      title: "4. Trợ lý ảo AI Mentor",
      icon: Sparkles,
      desc: "Hỏi đáp thông minh 24/7 trực tiếp trên ngữ cảnh tài liệu học tập.",
      details: [
        { title: "Ask AI Drawer (Hỏi nhanh)", text: "Nhấp biểu tượng sấm sét AI bay lơ lửng khi đang xem PDF để mở ngăn hỏi nhanh trên đúng trang tài liệu đang đọc." },
        { title: "Hỏi đáp ngữ cảnh sâu", text: "Vào trang 'AI Mentor' của khóa học để thảo luận sâu, yêu cầu AI giải thích thuật ngữ khó, viết code ví dụ hoặc tóm tắt bài giảng." },
        { title: "Trích dẫn tài liệu", text: "AI sẽ trả lời kèm các nguồn trích dẫn từ bài giảng giúp bạn dễ dàng xem lại chi tiết nội dung gốc." }
      ]
    },
    {
      title: "5. Micro-learning & Ôn tập",
      icon: BrainCircuit,
      desc: "Ghi nhớ kiến thức dài hạn bằng Flashcard và thuật toán Lặp lại ngắt quãng.",
      details: [
        { title: "Học nhanh qua Flashcards", text: "Mở bộ Flashcard để học nhanh các khái niệm chính dạng hỏi-đáp. Click để lật thẻ và xem định nghĩa mặt sau." },
        { title: "Xếp lịch Lặp lại ngắt quãng", text: "Bấm nút tự đánh giá mức độ nhớ: 'Quên' (học lại ngày mai), 'Khó' (học lại sau 3 ngày), 'Dễ' (ôn lại sau 7 ngày)." },
        { title: "Weakness Tracker (Kiến thức yếu)", text: "Xem biểu đồ phân tích các phần kiến thức bạn thường làm sai trong quiz để chủ động xem lại bài giảng." }
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 p-3 rounded-2xl shadow-sm text-white">
          <BookOpen className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 leading-tight">
            Hướng dẫn Học viên từ A - Z
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Hướng dẫn chi tiết quy trình đăng ký, học bài giảng, làm bài thi quiz, trò chuyện cùng AI Mentor và ôn tập micro learning.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Steps Navigation */}
        <div className="lg:col-span-4 space-y-3">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-wider px-1">
            Mục lục hướng dẫn
          </p>
          <div className="space-y-1">
            {guideSteps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeTab === idx;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveTab(idx);
                    // Reset sub-states when switching tabs to make interaction fresh
                    if (idx === 0) resetEnroll();
                    if (idx === 2) { 
                      setMockAnswers({}); 
                      setMockCurrentQuestion(0); 
                      setMockTimeLeft(900); 
                      setQuizSubmitted(false); 
                    }
                    if (idx === 4) { setIsFlipped(false); setCardLevel(null); }
                  }}
                  className={cn(
                    "w-full text-left flex gap-3.5 p-4 rounded-2xl border transition-all duration-200 active:scale-98",
                    isActive
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  )}
                >
                  <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", isActive ? "text-white" : "text-blue-500")} />
                  <div className="min-w-0">
                    <p className="font-bold text-sm leading-snug">{step.title}</p>
                    <p className={cn("text-xs mt-1 truncate", isActive ? "text-blue-100" : "text-slate-500 dark:text-slate-500")}>
                      {step.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Step details & Mockup */}
        <div className="lg:col-span-8 space-y-6">
          {/* Instructions card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-4 flex items-center gap-2">
              <span className="bg-blue-50 dark:bg-slate-800 text-blue-600 px-3 py-1 rounded-lg text-sm">
                Chi tiết
              </span>
              {guideSteps[activeTab].title.substring(3)}
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Detailed Steps text */}
              <div className="space-y-4">
                {guideSteps[activeTab].details.map((detail, stepIdx) => (
                  <div key={stepIdx} className="flex gap-3 items-start">
                    <div className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-full h-5 w-5 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                      {stepIdx + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{detail.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{detail.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Alert Tips */}
              <div className="bg-blue-50/50 dark:bg-slate-800/40 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4 self-start">
                <div className="flex gap-2.5">
                  <Sparkles className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-blue-950 dark:text-blue-300">Mẹo của bạn</h5>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {activeTab === 0 && "Nếu gặp khó khăn trong việc tìm khóa học, bạn có thể chuyển danh mục lọc để hiển thị danh sách khóa học thuộc chủ đề cụ thể."}
                      {activeTab === 1 && "Khi viết ghi chú cá nhân, thông tin sẽ được lưu tức thì. Bạn có thể mở lại ghi chú này ở bất kỳ thiết bị nào."}
                      {activeTab === 2 && "Hãy để ý màu sắc của các câu hỏi dưới chân trang làm bài. Chúng sẽ giúp bạn tránh bỏ sót các câu hỏi chưa trả lời trước khi nộp bài."}
                      {activeTab === 3 && "Sử dụng AI Mentor thường xuyên giúp bạn hiểu bài nhanh hơn. Bạn cũng có thể yêu cầu AI tóm lược nội dung của 1 trang cụ thể bằng cách trích dẫn trang đó."}
                      {activeTab === 4 && "Đừng bỏ qua việc đánh giá mức độ nhớ của Flashcard. Thuật toán Lặp lại ngắt quãng sẽ chỉ nhắc bạn học lại khi bộ não sắp sửa quên đi."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Mockup container */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-wider">
                Giao diện học viên mô phỏng (Có thể tương tác)
              </p>
              {((activeTab === 0 && enrollStatus !== "idle") || (activeTab === 2 && quizSubmitted)) && (
                <button 
                  onClick={() => {
                    resetEnroll();
                    setMockAnswers({});
                    setMockCurrentQuestion(0);
                    setMockTimeLeft(900);
                    setQuizSubmitted(false);
                  }} 
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <RotateCw className="h-3 w-3" /> Reset Mockup
                </button>
              )}
            </div>

            <div className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 sm:p-6 shadow-inner min-h-[300px] flex items-center justify-center">
              
              {/* MOCKUP 1: DISCOVER */}
              {activeTab === 0 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 w-full max-w-sm shadow-md transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    <Search className="h-4 w-4 text-slate-400" />
                    <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex-1 flex items-center px-2 text-[11px] text-slate-400">
                      Tìm kiếm khóa học...
                    </div>
                  </div>
                  
                  {/* Course Card mockup */}
                  <div className="border border-slate-150 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-center p-3 relative">
                      <div className="absolute top-2 right-2 bg-blue-500/20 text-blue-200 text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">
                        Big Data
                      </div>
                      <span className="text-white text-xs font-black tracking-wider text-center">APACHE SPARK & SCALA</span>
                    </div>
                    <div className="p-3 space-y-2.5">
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100">Xử lý Dữ liệu lớn với Spark 3.x</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Giảng viên: TS. Nguyễn Văn A</p>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-500">
                        <span>📚 12 bài học</span>
                        <span>⏱️ 6 tiếng</span>
                      </div>
                      
                      {enrollStatus === "idle" && (
                        <button
                          onClick={handleEnroll}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-1.5 text-xs transition-all active:scale-95 shadow-sm"
                        >
                          Đăng ký học
                        </button>
                      )}
                      {enrollStatus === "loading" && (
                        <button
                          disabled
                          className="w-full bg-slate-200 dark:bg-slate-800 text-slate-500 font-semibold rounded-lg py-1.5 text-xs flex items-center justify-center gap-1.5"
                        >
                          <span className="h-3 w-3 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></span>
                          Đang đăng ký...
                        </button>
                      )}
                      {enrollStatus === "enrolled" && (
                        <div className="w-full bg-green-500/10 text-green-600 dark:text-green-400 font-bold rounded-lg py-1.5 text-xs text-center border border-green-500/20 flex items-center justify-center gap-1">
                          <Check className="h-3 w-3" /> Đã đăng ký thành công!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* MOCKUP 2: LESSON VIEWER */}
              {activeTab === 1 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-xl shadow-md overflow-hidden flex flex-col h-[280px]">
                  {/* Top bar */}
                  <div className="bg-slate-50 dark:bg-slate-850 px-3 py-2 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Khóa học: Lập trình Python</span>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => setLessonTab("pdf")}
                        className={cn("px-2 py-0.5 text-[9px] rounded font-semibold", lessonTab === "pdf" ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800")}
                      >
                        PDF
                      </button>
                      <button 
                        onClick={() => setLessonTab("video")}
                        className={cn("px-2 py-0.5 text-[9px] rounded font-semibold", lessonTab === "video" ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800")}
                      >
                        Video
                      </button>
                      <button 
                        onClick={() => setLessonTab("markdown")}
                        className={cn("px-2 py-0.5 text-[9px] rounded font-semibold", lessonTab === "markdown" ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800")}
                      >
                        Ghi chú
                      </button>
                    </div>
                  </div>
                  
                  {/* Content Body */}
                  <div className="flex-1 flex min-h-0">
                    {/* Sidebar Outlines */}
                    <div className="w-1/3 border-r border-slate-200 dark:border-slate-800 p-2 bg-slate-50/50 dark:bg-slate-900/30 overflow-y-auto space-y-1">
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider px-1">Outline bài học</p>
                      <div className="p-1 text-[9px] rounded bg-blue-50 dark:bg-slate-800/40 text-blue-600 font-bold flex items-center gap-1">
                        <FileText className="h-2.5 w-2.5" /> 1. Khái niệm Python
                      </div>
                      <div className="p-1 text-[9px] rounded text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <Video className="h-2.5 w-2.5" /> 2. Cú pháp cơ bản
                      </div>
                      <div className="p-1 text-[9px] rounded text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <HelpCircle className="h-2.5 w-2.5" /> 3. Quiz thực hành 1
                      </div>
                    </div>

                    {/* Viewer pane */}
                    <div className="w-2/3 p-3 overflow-y-auto flex flex-col justify-between">
                      {lessonTab === "pdf" && (
                        <div className="border border-slate-100 dark:border-slate-800 rounded p-2.5 flex-1 bg-slate-50/30 dark:bg-slate-900/10 flex flex-col justify-between">
                          <div>
                            <h5 className="text-[10px] font-extrabold text-slate-800 dark:text-slate-200">1. Giới thiệu ngôn ngữ Python</h5>
                            <p className="text-[8px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                              Python là một ngôn ngữ lập trình bậc cao, thông dịch, hướng đối tượng và đa mục đích do Guido van Rossum phát triển...
                            </p>
                          </div>
                          <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-850 pt-1 text-[8px] text-slate-400">
                            <span>Trang 1 / 4</span>
                            <span className="text-blue-500 font-semibold cursor-pointer">Xem toàn màn hình</span>
                          </div>
                        </div>
                      )}

                      {lessonTab === "video" && (
                        <div className="border border-slate-100 dark:border-slate-800 rounded flex-1 bg-slate-950 flex flex-col items-center justify-center relative group">
                          {isPlaying ? (
                            <div className="text-center space-y-1">
                              <div className="text-[9px] text-slate-400 animate-pulse">Đang phát bài giảng video...</div>
                              <button 
                                onClick={() => setIsPlaying(false)}
                                className="bg-white/20 hover:bg-white/30 text-white rounded-full p-1.5 transition-all text-[8px] font-bold"
                              >
                                Dừng
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => setIsPlaying(true)}
                              className="bg-blue-600 hover:bg-blue-700 hover:scale-105 text-white rounded-full p-2.5 shadow-md transition-all active:scale-95"
                            >
                              <Play className="h-4 w-4 fill-white" />
                            </button>
                          )}
                          <div className="absolute bottom-1 left-2 right-2 flex justify-between text-[7px] text-slate-400">
                            <span>{isPlaying ? "0:12" : "0:00"} / 15:45</span>
                            <div className="h-1 bg-slate-700 flex-1 mx-2 self-center rounded overflow-hidden">
                              <div className="h-full bg-blue-500" style={{ width: isPlaying ? "5%" : "0%" }}></div>
                            </div>
                          </div>
                        </div>
                      )}

                      {lessonTab === "markdown" && (
                        <div className="border border-slate-100 dark:border-slate-800 rounded p-2 flex-1 bg-amber-50/30 dark:bg-amber-950/10 text-slate-700 dark:text-slate-300">
                          <h5 className="text-[10px] font-extrabold text-amber-800 dark:text-amber-300">📝 Ghi chú cá nhân</h5>
                          <textarea 
                            placeholder="Gõ ghi chú bài học tại đây..." 
                            className="w-full bg-transparent border-0 outline-none text-[8px] mt-1 placeholder:text-slate-400 resize-none h-[120px]"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* MOCKUP 3: REAL QUIZ TAKE VIEW */}
              {activeTab === 2 && (
                <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-850 rounded-xl w-full max-w-md shadow-md p-4 space-y-4 text-left">
                  
                  {/* Top Progress bar and Timer */}
                  <div className="bg-slate-50 dark:bg-slate-850/50 p-2.5 rounded-lg border flex justify-between items-center">
                    <div className="flex-1 mr-4">
                      <div className="flex justify-between text-[8px] text-slate-500 mb-1">
                        <span>Tiến độ</span>
                        <span>{totalAnswered}/3 câu đã trả lời</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${(totalAnswered / 3) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    {!quizSubmitted && (
                      <div className="bg-blue-100 text-blue-700 px-2.5 py-1.5 rounded-lg font-mono font-bold text-[11px] flex-shrink-0">
                        ⏱️ {formatTime(mockTimeLeft)}
                      </div>
                    )}
                  </div>

                  {/* Active Question Render */}
                  {!quizSubmitted ? (
                    <div className="border border-slate-150 dark:border-slate-800 rounded-lg p-3 space-y-3 bg-slate-50/20">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded font-black border border-blue-200 dark:border-blue-900/20">
                          Câu {mockCurrentQuestion + 1}/3
                        </span>
                        <span className="text-[9px] bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded font-bold border border-purple-200 dark:border-purple-900/30">
                          {mockQuestions[mockCurrentQuestion].points} điểm
                        </span>
                        {mockCurrentQuestion === 2 && (
                          <span className="text-[8px] text-red-500 font-bold">* Bắt buộc</span>
                        )}
                      </div>

                      <p className="text-[10px] font-bold text-slate-900 dark:text-slate-100">
                        {mockQuestions[mockCurrentQuestion].text}
                      </p>

                      {/* Question Answer Inputs */}
                      <div className="pt-1">
                        {mockQuestions[mockCurrentQuestion].type === "SINGLE_CHOICE" && (
                          <div className="space-y-1.5">
                            {mockQuestions[mockCurrentQuestion].options?.map((opt) => {
                              const isSelected = mockAnswers[1]?.selected_option_id === opt.id;
                              return (
                                <label 
                                  key={opt.id}
                                  className={cn(
                                    "flex items-center gap-2 p-2 border rounded-lg cursor-pointer text-[9px] transition-all",
                                    isSelected 
                                      ? "border-blue-500 bg-blue-500/5 text-blue-600 font-bold" 
                                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800"
                                  )}
                                >
                                  <input 
                                    type="radio" 
                                    name="mock_q1"
                                    checked={isSelected}
                                    onChange={() => handleMockAnswer(1, { selected_option_id: opt.id })}
                                    className="w-3.5 h-3.5"
                                  />
                                  <span>{opt.text}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}

                        {mockQuestions[mockCurrentQuestion].type === "SHORT_ANSWER" && (
                          <input 
                            type="text"
                            value={mockAnswers[2]?.answer_text || ""}
                            onChange={(e) => handleMockAnswer(2, { answer_text: e.target.value })}
                            placeholder="Gõ đáp án của bạn..."
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-[9.5px] outline-none text-slate-800 dark:text-slate-250 focus:border-blue-500"
                          />
                        )}

                        {mockQuestions[mockCurrentQuestion].type === "FILE_UPLOAD" && (
                          <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-3 text-center bg-slate-50 dark:bg-slate-850/50 space-y-2">
                            {mockAnswers[3]?.file_name ? (
                              <div className="text-[9px] text-green-600 font-bold flex items-center justify-center gap-1">
                                <Check className="h-3.5 w-3.5" /> File: {mockAnswers[3].file_name}
                              </div>
                            ) : (
                              <>
                                <Upload className="h-5 w-5 text-slate-400 mx-auto" />
                                <button 
                                  onClick={() => handleMockAnswer(3, { file_name: "spark_core_report.pdf" })}
                                  className="bg-blue-600 hover:bg-blue-700 text-white rounded text-[8px] font-bold px-2.5 py-1 transition-all active:scale-95"
                                >
                                  Chọn file tải lên
                                </button>
                              </>
                            )}
                            <p className="text-[7.5px] text-slate-450">ZIP, PDF tối đa 50MB</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 space-y-3">
                      <div className="h-10 w-10 bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                        ✓
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Đã nộp bài thành công!</h4>
                        <p className="text-[8.5px] text-slate-500 mt-1">
                          Điểm số của bạn: <span className="font-bold text-blue-600">
                            {((mockAnswers[1]?.selected_option_id === "a" ? 10 : 0) + 
                              (mockAnswers[2]?.answer_text?.toLowerCase().includes("scala") ? 5 : 0))}/35 điểm
                          </span>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Navigation controls under question */}
                  {!quizSubmitted && (
                    <div className="flex justify-between items-center gap-3 pt-2">
                      <button 
                        onClick={() => setMockCurrentQuestion(p => Math.max(0, p - 1))}
                        disabled={mockCurrentQuestion === 0}
                        className="px-2.5 py-1 text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 rounded font-bold disabled:opacity-40"
                      >
                        ← Câu trước
                      </button>

                      {/* Numbered Index buttons */}
                      <div className="flex gap-1">
                        {mockQuestions.map((_, idx) => {
                          const isActive = mockCurrentQuestion === idx;
                          const isAnswered = isMockAnswered(idx);
                          return (
                            <button
                              key={idx}
                              onClick={() => setMockCurrentQuestion(idx)}
                              className={cn(
                                "w-6 h-6 rounded text-[9px] font-black transition-all",
                                isActive 
                                  ? "bg-blue-600 text-white" 
                                  : isAnswered 
                                    ? "bg-green-100 dark:bg-green-950/20 text-green-600 border border-green-300 dark:border-green-800" 
                                    : "bg-slate-100 dark:bg-slate-850 text-slate-500 border border-slate-200 dark:border-slate-800"
                              )}
                            >
                              {idx + 1}
                            </button>
                          );
                        })}
                      </div>

                      {mockCurrentQuestion === 2 ? (
                        <button 
                          onClick={() => setQuizSubmitted(true)}
                          className="px-2.5 py-1 text-[9px] bg-green-600 hover:bg-green-700 text-white rounded font-bold"
                        >
                          Nộp bài
                        </button>
                      ) : (
                        <button 
                          onClick={() => setMockCurrentQuestion(p => Math.min(2, p + 1))}
                          className="px-2.5 py-1 text-[9px] bg-blue-600 hover:bg-blue-700 text-white rounded font-bold"
                        >
                          Câu sau ->
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* MOCKUP 4: CHATBOT */}
              {activeTab === 3 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-sm shadow-md overflow-hidden flex flex-col h-[280px]">
                  {/* Chat Header */}
                  <div className="bg-blue-600 text-white px-3 py-2 flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3" />
                      <span className="text-[10px] font-bold">AI Mentor - Lập trình Spark</span>
                    </div>
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  </div>

                  {/* Messages list */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50/50 dark:bg-slate-950/20">
                    {messages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={cn("flex", msg.sender === "user" ? "justify-end" : "justify-start")}
                      >
                        <div className={cn(
                          "max-w-[80%] rounded-xl px-2.5 py-1.5 text-[9px] leading-normal shadow-sm",
                          msg.sender === "user" 
                            ? "bg-blue-600 text-white rounded-br-none" 
                            : "bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none"
                        )}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-[9px] rounded-bl-none text-slate-400 flex items-center gap-1">
                          <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                          <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                          <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Suggestions */}
                  <div className="px-2 py-1 bg-slate-50 dark:bg-slate-900 border-t border-slate-150 dark:border-slate-850 flex gap-1 overflow-x-auto no-scrollbar">
                    <button 
                      onClick={() => handleSuggestClick("Spark khác MapReduce thế nào?")}
                      className="px-2 py-0.5 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-[8px] flex-shrink-0 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      💡 So sánh Spark vs MapReduce
                    </button>
                    <button 
                      onClick={() => handleSuggestClick("Giải thích Spark RDD")}
                      className="px-2 py-0.5 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-[8px] flex-shrink-0 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      💡 RDD là gì?
                    </button>
                  </div>

                  {/* Input Form */}
                  <form 
                    onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                    className="p-2 border-t border-slate-200 dark:border-slate-850 flex gap-1.5 bg-white dark:bg-slate-900"
                  >
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Hỏi AI Mentor của bạn..."
                      className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-[9px] focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200"
                    />
                    <button 
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-1 transition-colors flex items-center justify-center"
                    >
                      <Send className="h-3 w-3" />
                    </button>
                  </form>
                </div>
              )}

              {/* MOCKUP 5: MICRO-LEARNING */}
              {activeTab === 4 && (
                <div className="w-full max-w-sm space-y-4">
                  {/* Flashcard container */}
                  <div 
                    onClick={() => setIsFlipped(!isFlipped)}
                    className={cn(
                      "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl h-36 flex flex-col justify-between p-4 shadow-md cursor-pointer transition-all duration-300 select-none hover:shadow-lg hover:scale-[1.02]",
                      isFlipped ? "border-amber-400 bg-amber-50/5 dark:bg-amber-950/5" : ""
                    )}
                  >
                    <div className="flex justify-between items-center text-[8px] text-slate-400 font-bold">
                      <span>🏷️ HỌC MÁY (MACHINE LEARNING)</span>
                      <span className="flex items-center gap-0.5 text-blue-500"><RotateCw className="h-2 w-2" /> Xoay</span>
                    </div>
                    
                    <div className="text-center py-2">
                      {!isFlipped ? (
                        <h4 className="text-sm font-black text-slate-900 dark:text-slate-50">Supervised Learning là gì?</h4>
                      ) : (
                        <p className="text-[10px] text-slate-600 dark:text-slate-350 leading-relaxed font-medium px-2">
                          Là phương pháp học máy sử dụng tập dữ liệu được dán nhãn (labeled data) để huấn luyện mô hình, giúp dự đoán đầu ra cho dữ liệu mới.
                        </p>
                      )}
                    </div>

                    <div className="text-center text-[7px] text-slate-400 uppercase tracking-widest font-semibold">
                      {!isFlipped ? "Click để xem mặt sau" : "Click để xem câu hỏi"}
                    </div>
                  </div>

                  {/* Action buttons shown on flip */}
                  {isFlipped && (
                    <div className="space-y-2">
                      <p className="text-center text-[8px] font-bold text-slate-400">ĐÁNH GIÁ MỨC ĐỘ GHI NHỚ</p>
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setCardLevel("forgot"); }}
                          className={cn("flex-1 text-[9px] font-bold py-1.5 px-2 rounded-lg border transition-all active:scale-95", cardLevel === "forgot" ? "bg-red-500 border-red-500 text-white" : "border-red-200 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20")}
                        >
                          Quên (1 ngày)
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setCardLevel("hard"); }}
                          className={cn("flex-1 text-[9px] font-bold py-1.5 px-2 rounded-lg border transition-all active:scale-95", cardLevel === "hard" ? "bg-amber-500 border-amber-500 text-white" : "border-amber-200 dark:border-amber-900/40 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20")}
                        >
                          Khó (3 ngày)
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setCardLevel("easy"); }}
                          className={cn("flex-1 text-[9px] font-bold py-1.5 px-2 rounded-lg border transition-all active:scale-95", cardLevel === "easy" ? "bg-green-500 border-green-500 text-white" : "border-green-200 dark:border-green-900/40 text-green-500 hover:bg-green-50 dark:hover:bg-green-950/20")}
                        >
                          Dễ (7 ngày)
                        </button>
                      </div>
                      {cardLevel && (
                        <p className="text-[8px] text-center text-slate-500 font-semibold animate-pulse">
                          🎉 Lên lịch ôn tập tiếp theo vào: {cardLevel === "forgot" ? "Ngày mai" : cardLevel === "hard" ? "3 ngày nữa" : "7 ngày nữa"}!
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
