"use client";

import React, { useState } from "react";
import { 
  GraduationCap, 
  Plus, 
  FileText, 
  Sparkles, 
  Settings, 
  Cpu, 
  Database, 
  Network, 
  CheckCircle, 
  ChevronRight, 
  Info,
  Clock,
  RotateCw,
  FolderPlus,
  HelpCircle,
  Upload,
  AlignLeft,
  FileCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GeneratedQuestion {
  question: string;
  options: string[];
  answer: string;
}

export function InstructorGuideView() {
  const [activeTab, setActiveTab] = useState<number>(0);

  // 1. Create Course State
  const [courseName, setCourseName] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [createStep, setCreateStep] = useState<"idle" | "creating" | "success">("idle");

  // 2. Add Content State
  const [sections, setSections] = useState<string[]>([
    "Chương 1: Tổng quan Spark & MapReduce",
    "Chương 2: Kiến trúc Spark Cluster và RDD"
  ]);
  const [newSectionName, setNewSectionName] = useState("");

  // 3. Quiz Management State (Real Mock)
  const [mockQuizType, setMockQuizType] = useState<string>("SINGLE_CHOICE");
  const [mockPoints, setMockPoints] = useState<number>(10);
  const [mockRequired, setMockRequired] = useState<boolean>(true);
  const [mockOptions, setMockOptions] = useState<string[]>([
    "Resilient Distributed Dataset",
    "Relational Database Driver"
  ]);
  const [mockCorrectOption, setMockCorrectOption] = useState<number>(0);
  const [mockQuizSaved, setMockQuizSaved] = useState<boolean>(false);

  // 4. AI Indexing State
  const [indexState, setIndexState] = useState<Record<string, "idle" | "pending" | "chunking" | "vector" | "neo4j" | "success">>({
    "spark_core.pdf": "success",
    "dataframe_api.pdf": "idle"
  });

  // 5. AI Quiz Gen State
  const [selectedDoc, setSelectedDoc] = useState("spark_core.pdf");
  const [numQuestions, setNumQuestions] = useState(3);
  const [difficulty, setDifficulty] = useState("medium");
  const [quizGenStatus, setQuizGenStatus] = useState<"idle" | "generating" | "success">("idle");
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);

  // Simulation handlers
  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim()) return;
    setCreateStep("creating");
    setTimeout(() => {
      setCreateStep("success");
    }, 1200);
  };

  const handleAddSection = () => {
    if (!newSectionName.trim()) return;
    setSections(prev => [...prev, newSectionName]);
    setNewSectionName("");
  };

  const handleIndexAI = (fileName: string) => {
    setIndexState(prev => ({ ...prev, [fileName]: "pending" }));
    
    setTimeout(() => {
      setIndexState(prev => ({ ...prev, [fileName]: "chunking" }));
      setTimeout(() => {
        setIndexState(prev => ({ ...prev, [fileName]: "vector" }));
        setTimeout(() => {
          setIndexState(prev => ({ ...prev, [fileName]: "neo4j" }));
          setTimeout(() => {
            setIndexState(prev => ({ ...prev, [fileName]: "success" }));
          }, 800);
        }, 800);
      }, 800);
    }, 800);
  };

  const handleGenerateAIQuiz = () => {
    setQuizGenStatus("generating");
    setGeneratedQuestions([]);
    
    setTimeout(() => {
      setQuizGenStatus("success");
      setGeneratedQuestions([
        {
          question: "Thành phần tối ưu hóa truy vấn trong Spark SQL tên là gì?",
          options: ["YARN Coordinator", "Catalyst Optimizer", "MapReduce Scheduler", "GraphX Engine"],
          answer: "Catalyst Optimizer"
        },
        {
          question: "Trong chế độ cluster, thực thể nào chịu trách nhiệm điều phối tài nguyên?",
          options: ["Cluster Manager", "Driver Program", "Worker Node", "Executor process"],
          answer: "Cluster Manager"
        },
        {
          question: "Thao tác nào sau đây của Spark RDD là một Action?",
          options: ["map()", "filter()", "collect()", "flatMap()"],
          answer: "collect()"
        }
      ]);
    }, 2000);
  };

  const guideSteps = [
    {
      title: "1. Tạo Khóa học mới",
      icon: Plus,
      desc: "Cách khởi tạo khóa học và thiết lập thông tin cơ bản.",
      details: [
        { title: "Truy cập màn hình tạo mới", text: "Vào Dashboard Giảng viên (/lms/teacher), nhấp chọn menu 'Khóa học' rồi bấm nút '+ Tạo khóa học' để mở giao diện thêm mới (/lms/teacher/courses/create)." },
        { title: "Khai báo thông tin chi tiết", text: "Nhập Tên khóa học, viết mô tả nội dung chương trình học để thu hút học viên, tải lên hình ảnh đại diện (thumbnail) chất lượng." },
        { title: "Ghi danh khóa học", text: "Bấm nút 'Lưu & Tiếp tục'. Khóa học sẽ được tạo ở trạng thái nháp, cho phép bạn tiếp tục xây dựng cấu trúc bài giảng." }
      ]
    },
    {
      title: "2. Quản lý Tài liệu Học tập",
      icon: FolderPlus,
      desc: "Xây dựng khung bài giảng và tải tài liệu lên MinIO Object Storage.",
      details: [
        { title: "Tạo cấu trúc Section", text: "Bên trong tab 'Nội dung' của khóa học, chọn '+ Thêm Section' để chia nhỏ giáo trình thành các chương học (ví dụ: Chương 1, Chương 2)." },
        { title: "Đăng tải tài liệu học tập", text: "Nhấp 'Thêm nội dung' bên trong Section, chọn định dạng: PDF bài giảng, Video bài học (mp4/youtube), hoặc trang tài liệu ghi chú Markdown tự biên soạn." },
        { title: "Quản lý linh hoạt", text: "Bạn dễ dàng chỉnh sửa tên bài giảng, xóa bỏ, hoặc kéo thả (drag & drop) để sắp xếp lại lộ trình học tập tối ưu." }
      ]
    },
    {
      title: "3. Biên soạn Quiz & Quản lý Câu hỏi",
      icon: Settings,
      desc: "Cấu hình bài kiểm tra và quản lý ngân hàng câu hỏi đa dạng định dạng.",
      details: [
        { title: "Cấu hình cài đặt Quiz", text: "Nhấp 'Cài đặt Quiz' để thiết lập: thời gian giới hạn (phút), số lần thử tối đa, điểm đạt (%), tự động chấm điểm, hiển thị đáp án đúng sau khi nộp, và đảo câu hỏi/đáp án." },
        { title: "Mở Slide-over quản lý câu hỏi", text: "Nhấp '+ Thêm câu hỏi' để mở bảng slide-over. Chọn 1 trong 7 loại câu hỏi: Trắc nghiệm 1 đáp án (SINGLE_CHOICE), Nhiều đáp án (MULTIPLE_CHOICE), Điền từ (text), Điền từ (dropdown), Tự luận ngắn (SHORT_ANSWER), Tự luận dài, hoặc Nộp file." },
        { title: "Soạn nội dung & Thiết lập đáp án", text: "Nhập nội dung câu hỏi (hỗ trợ Markdown, chèn ảnh). Thêm các đáp án lựa chọn, tích chọn đáp án đúng, đặt số điểm (ví dụ: 10 điểm), chọn 'Bắt buộc trả lời' và viết giải thích chi tiết." }
      ]
    },
    {
      title: "4. Index tài liệu cho AI (RAG)",
      icon: Database,
      desc: "Nạp tài liệu của khóa học vào Vector DB và Graph DB phục vụ học tập cùng AI.",
      details: [
        { title: "Kích hoạt nút Index AI", text: "Đối với tài liệu học tập là PDF bài giảng, nhấp vào nút 'Index AI' (hình robot sấm sét) nằm bên phải tên tài liệu để bắt đầu nạp tri thức." },
        { title: "Asynchronous Pipeline (Kafka)", text: "Hệ thống sẽ gửi sự kiện qua Kafka và chạy ngầm: Tải tài liệu -> Chia nhỏ văn bản (Chunking) -> Trích xuất Vector lưu vào Qdrant DB -> Đồng bộ thực thể sơ đồ lưu vào Neo4j DB." },
        { title: "Kiểm tra trạng thái hoàn tất", text: "Theo dõi trạng thái ngay trên tài liệu. Khi hiển thị màu xanh lá 'Hoàn thành', AI Mentor của khóa học đã sẵn sàng trả lời các câu hỏi liên quan đến tài liệu đó." }
      ]
    },
    {
      title: "5. Các Tác vụ AI Hỗ trợ",
      icon: Sparkles,
      desc: "Sử dụng AI tự động tạo Quiz, quản lý Sơ đồ tri thức (Knowledge Graph) và Chat Assistant.",
      details: [
        { title: "Tự động sinh Quiz bằng AI", text: "Mở menu AI của khóa học, chọn tài liệu nguồn đã được index, chọn số câu, độ khó. AI sẽ phân tích tài liệu và tự động soạn thảo các câu hỏi trắc nghiệm kèm đáp án chính xác." },
        { title: "Quản lý Sơ đồ tri thức", text: "Mở sơ đồ khái niệm (Knowledge Graph View) để theo dõi các liên kết tri thức. Sử dụng chức năng hợp nhất/củng cố sơ đồ khái niệm do AI gợi ý." },
        { title: "Trợ lý học thuật Giảng viên", text: "Trò chuyện với Teacher AI Assistant để lên ý tưởng đề cương, viết gợi ý thảo luận diễn đàn, hoặc soạn câu hỏi ôn tập." }
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 p-3 rounded-2xl shadow-sm text-white">
          <GraduationCap className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 leading-tight">
            Hướng dẫn Giảng viên từ A - Z
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Cẩm nang hướng dẫn tạo bài giảng, thiết lập câu hỏi trắc nghiệm, index tài liệu AI và tự động sinh đề thi.
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
                    // Reset simulator states
                    if (idx === 0) setCreateStep("idle");
                    if (idx === 2) { setMockQuizSaved(false); setMockQuizType("SINGLE_CHOICE"); }
                    if (idx === 4) { setQuizGenStatus("idle"); setGeneratedQuestions([]); }
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
                  <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-blue-950 dark:text-blue-300">Lưu ý chuyên môn</h5>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {activeTab === 0 && "Bạn có thể chỉnh sửa mô tả khóa học bất kỳ lúc nào thông qua nút biểu tượng bút chì kế bên tiêu đề khóa học."}
                      {activeTab === 1 && "Hệ thống hỗ trợ nạp tài liệu qua API lms-service, sau đó đẩy sự kiện qua Kafka để lưu trữ vĩnh viễn trên MinIO Bucket."}
                      {activeTab === 2 && "Để kiểm tra chất lượng đề thi trắc nghiệm, bạn nên cấu hình Auto-grade (tự động chấm điểm) và điền phần giải thích đáp án chi tiết."}
                      {activeTab === 3 && "Quy trình index AI chạy bất đồng bộ. Nếu có lỗi, bạn có thể kiểm tra logs của docker container ai-worker hoặc topic Kafka lms.ai.command."}
                      {activeTab === 4 && "Đề thi sinh bởi AI sẽ tự động được lưu vào cơ sở dữ liệu nháp của bài Quiz đó. Bạn có thể sửa đổi điểm số, nội dung trước khi bấm xuất bản."}
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
                Giao diện giảng viên mô phỏng (Có thể tương tác)
              </p>
              {((activeTab === 0 && createStep !== "idle") || (activeTab === 2 && mockQuizSaved)) && (
                <button 
                  onClick={() => {
                    setCreateStep("idle");
                    setMockQuizSaved(false);
                    setMockQuizType("SINGLE_CHOICE");
                  }} 
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <RotateCw className="h-3 w-3" /> Reset Mockup
                </button>
              )}
            </div>

            <div className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 sm:p-6 shadow-inner min-h-[300px] flex items-center justify-center">
              
              {/* MOCKUP 1: CREATE COURSE */}
              {activeTab === 0 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 w-full max-w-sm shadow-md space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-850 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">
                    Tạo khóa học mới
                  </h4>

                  {createStep !== "success" ? (
                    <form onSubmit={handleCreateCourse} className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500">TÊN KHÓA HỌC *</label>
                        <input
                          type="text"
                          required
                          value={courseName}
                          onChange={(e) => setCourseName(e.target.value)}
                          placeholder="e.g. Phân tích Dữ liệu Lớn với Apache Spark"
                          className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-[10px] text-slate-900 dark:text-slate-150 outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500">MÔ TẢ KHÓA HỌC</label>
                        <textarea
                          rows={2}
                          value={courseDesc}
                          onChange={(e) => setCourseDesc(e.target.value)}
                          placeholder="Nhập giới thiệu ngắn về lộ trình đào tạo..."
                          className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-[10px] text-slate-900 dark:text-slate-150 outline-none focus:border-blue-500 resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={createStep === "creating"}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg py-1.5 text-xs transition-all active:scale-95 shadow-sm flex items-center justify-center gap-1.5"
                      >
                        {createStep === "creating" && <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                        {createStep === "creating" ? "Đang tạo..." : "Lưu & Tiếp tục"}
                      </button>
                    </form>
                  ) : (
                    <div className="text-center py-4 space-y-3">
                      <div className="h-10 w-10 bg-green-150 dark:bg-green-950 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto text-xl">
                        ✓
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-850 dark:text-slate-250">Đã khởi tạo khóa học!</p>
                        <p className="text-[9px] text-slate-450 mt-0.5">Bây giờ bạn đã có thể chuyển đến trang chi tiết để thêm tài liệu.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* MOCKUP 2: ADD CONTENT */}
              {activeTab === 1 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-sm shadow-md p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                    <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Đại cương môn học</h4>
                    <span className="text-[9px] text-blue-600 font-bold">{sections.length} Chương mục</span>
                  </div>

                  {/* Sections list */}
                  <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                    {sections.map((sec, idx) => (
                      <div key={idx} className="bg-slate-50 dark:bg-slate-850 border border-slate-150 dark:border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[8px] bg-blue-500/20 text-blue-600 dark:text-blue-400 font-black px-1.5 py-0.5 rounded">CHƯƠNG {idx+1}</span>
                          <span className="text-[9.5px] font-bold text-slate-800 dark:text-slate-200 truncate">{sec}</span>
                        </div>
                        <span className="text-[9px] text-slate-400 cursor-grab font-bold">⠿</span>
                      </div>
                    ))}
                  </div>

                  {/* Add section form */}
                  <div className="flex gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <input
                      type="text"
                      value={newSectionName}
                      onChange={(e) => setNewSectionName(e.target.value)}
                      placeholder="Thêm chương mới..."
                      className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-[9px] text-slate-800 dark:text-slate-200 outline-none"
                    />
                    <button
                      onClick={handleAddSection}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-1 text-[9px] font-bold transition-all active:scale-95 flex items-center gap-0.5"
                    >
                      <Plus className="h-3 w-3" /> Thêm
                    </button>
                  </div>
                </div>
              )}

              {/* MOCKUP 3: QUIZ EDITOR SLIDE-OVER */}
              {activeTab === 2 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-md shadow-md overflow-hidden flex flex-col h-[320px]">
                  {/* Mock Slide-over Header */}
                  <div className="bg-slate-50 dark:bg-slate-850 px-3 py-2.5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-800 dark:text-slate-150">
                        {mockQuizSaved ? "Danh sách Câu hỏi" : "Bảng soạn câu hỏi (Slide-over)"}
                      </h4>
                      <p className="text-[7.5px] text-slate-400">Thiết lập loại câu hỏi & đáp án chi tiết</p>
                    </div>
                    {mockQuizSaved && (
                      <span className="text-[8px] bg-green-500/10 text-green-600 dark:text-green-400 font-bold px-1.5 py-0.5 rounded border border-green-500/20">
                        Đã lưu ✓
                      </span>
                    )}
                  </div>

                  {!mockQuizSaved ? (
                    <div className="flex-1 p-3 overflow-y-auto space-y-3.5 text-left">
                      {/* Select Question Type */}
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold text-slate-500">LOẠI CÂU HỎI</label>
                        <select 
                          value={mockQuizType} 
                          onChange={(e) => {
                            setMockQuizType(e.target.value);
                            if (e.target.value === "SHORT_ANSWER") {
                              setMockOptions(["Resilient Distributed Dataset"]);
                            } else if (e.target.value === "FILE_UPLOAD") {
                              setMockOptions(["Định dạng cho phép: ZIP, PDF, Max size: 50MB"]);
                            } else {
                              setMockOptions(["Resilient Distributed Dataset", "Relational Database Driver"]);
                            }
                          }}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-[9px] outline-none font-bold text-slate-800 dark:text-slate-200"
                        >
                          <option value="SINGLE_CHOICE">⭕ Trắc nghiệm 1 đáp án (SINGLE_CHOICE)</option>
                          <option value="MULTIPLE_CHOICE">☑️ Trắc nghiệm nhiều đáp án (MULTIPLE_CHOICE)</option>
                          <option value="SHORT_ANSWER">✍️ Tự luận ngắn (SHORT_ANSWER)</option>
                          <option value="ESSAY">📝 Tự luận dài (ESSAY)</option>
                          <option value="FILE_UPLOAD">📎 Nộp tệp tin (FILE_UPLOAD)</option>
                          <option value="FILL_BLANK_TEXT">⬜ Điền từ dạng nhập text (FILL_BLANK)</option>
                        </select>
                      </div>

                      {/* Mock Question Text */}
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold text-slate-500">NỘI DUNG CÂU HỎI (HỖ TRỢ MARKDOWN)</label>
                        <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-[9px] text-slate-800 dark:text-slate-200 font-medium">
                          Trong Apache Spark, **RDD** viết tắt của cụm từ nào?
                        </div>
                      </div>

                      {/* Config Answers options based on type */}
                      <div className="space-y-2">
                        <label className="text-[8px] font-bold text-slate-500">THIẾT LẬP ĐÁP ÁN</label>
                        
                        {mockQuizType === "SINGLE_CHOICE" && (
                          <div className="space-y-1.5">
                            {mockOptions.map((opt, oIdx) => (
                              <div key={oIdx} className="flex gap-2 items-center">
                                <input 
                                  type="radio" 
                                  checked={mockCorrectOption === oIdx} 
                                  onChange={() => setMockCorrectOption(oIdx)}
                                  className="w-3 h-3 text-blue-600"
                                />
                                <span className={cn("text-[9px] p-1 border rounded flex-1 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300", mockCorrectOption === oIdx ? "border-green-500 bg-green-500/5 text-green-700 font-bold" : "border-slate-200 dark:border-slate-700")}>
                                  {opt}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {mockQuizType === "MULTIPLE_CHOICE" && (
                          <div className="space-y-1.5">
                            <div className="flex gap-2 items-center">
                              <input type="checkbox" defaultChecked={true} className="w-3 h-3 text-blue-600" />
                              <span className="text-[9px] p-1 border border-green-500 bg-green-500/5 text-green-700 dark:text-green-400 font-bold rounded flex-1">
                                RDD viết tắt của Resilient Distributed Dataset
                              </span>
                            </div>
                            <div className="flex gap-2 items-center">
                              <input type="checkbox" defaultChecked={true} className="w-3 h-3 text-blue-600" />
                              <span className="text-[9px] p-1 border border-green-500 bg-green-500/5 text-green-700 dark:text-green-400 font-bold rounded flex-1">
                                RDD là cấu trúc dữ liệu phân tán bất biến
                              </span>
                            </div>
                          </div>
                        )}

                        {mockQuizType === "SHORT_ANSWER" && (
                          <div className="space-y-1 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                            <div className="text-[9px] font-bold text-slate-700 dark:text-slate-200">Đáp án mong muốn chấp nhận:</div>
                            <div className="p-1 bg-white dark:bg-slate-900 border rounded text-[8.5px] font-mono text-slate-800 dark:text-slate-200 mt-1">
                              Resilient Distributed Dataset
                            </div>
                            <div className="flex gap-3 mt-1.5 text-[7.5px] text-slate-500">
                              <span>☑ Khớp chính xác</span>
                              <span>☐ Phân biệt Hoa/Thường</span>
                            </div>
                          </div>
                        )}

                        {mockQuizType === "FILE_UPLOAD" && (
                          <div className="p-2 border border-dashed rounded-lg text-center bg-slate-50 dark:bg-slate-850/50">
                            <Upload className="h-4 w-4 text-slate-400 mx-auto mb-1" />
                            <p className="text-[8px] text-slate-500">Mẫu nộp file tự luận được chấp nhận</p>
                            <p className="text-[7px] text-slate-400 mt-0.5">Cho phép tải lên tệp tin ZIP, PDF đến tối đa 50MB</p>
                          </div>
                        )}

                        {mockQuizType === "FILL_BLANK_TEXT" && (
                          <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
                            <p className="text-[7.5px] text-slate-400">Cách viết: dùng ngoặc nhọn {"{}"} bao quanh đáp án điền vào chỗ trống</p>
                            <div className="p-1.5 bg-white dark:bg-slate-900 border rounded text-[8.5px] leading-relaxed">
                              Apache Spark được lập trình chủ yếu bằng ngôn ngữ {"{Scala}"}.
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Points & Required */}
                      <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-850/40 p-2 rounded-lg border border-slate-200 dark:border-slate-750">
                        <div>
                          <label className="text-[8px] font-bold text-slate-400">ĐIỂM SỐ</label>
                          <input 
                            type="number" 
                            value={mockPoints}
                            onChange={(e) => setMockPoints(parseFloat(e.target.value) || 0)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-1 text-[9px] font-bold outline-none"
                          />
                        </div>
                        <div className="flex items-center gap-1.5 pt-4">
                          <input 
                            type="checkbox" 
                            checked={mockRequired} 
                            onChange={(e) => setMockRequired(e.target.checked)}
                            className="w-3.5 h-3.5 text-blue-600"
                          />
                          <span className="text-[9px] font-bold text-slate-600 dark:text-slate-350">Bắt buộc trả lời</span>
                        </div>
                      </div>

                      {/* Action save */}
                      <button
                        onClick={() => setMockQuizSaved(true)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg py-2 text-xs transition-all active:scale-95 shadow-sm"
                      >
                        ✓ Lưu câu hỏi
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 p-3 overflow-y-auto space-y-3.5">
                      <p className="text-[9px] font-bold text-slate-400">DANH SÁCH CÂU HỎI TRONG BÀI QUIZ (1 câu)</p>
                      
                      {/* Saved Question Card */}
                      <div className="border border-slate-200 dark:border-slate-850 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-900/10 space-y-2 text-left">
                        <div className="flex gap-1.5 items-center flex-wrap">
                          <span className="text-[8px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1 py-0.5 rounded font-black">CÂU 1</span>
                          <span className="text-[8px] bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-900/30">
                            {mockQuizType === "SINGLE_CHOICE" && "⭕ SINGLE_CHOICE"}
                            {mockQuizType === "MULTIPLE_CHOICE" && "☑️ MULTIPLE_CHOICE"}
                            {mockQuizType === "SHORT_ANSWER" && "✍️ SHORT_ANSWER"}
                            {mockQuizType === "FILE_UPLOAD" && "📎 FILE_UPLOAD"}
                            {mockQuizType === "FILL_BLANK_TEXT" && "⬜ FILL_BLANK"}
                          </span>
                          <span className="text-[8px] bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-900/30 font-bold">
                            {mockPoints} điểm
                          </span>
                          {mockRequired && (
                            <span className="text-[8px] bg-red-50 text-red-600 px-1 rounded font-bold">Bắt buộc</span>
                          )}
                        </div>

                        <p className="text-[10px] font-bold text-slate-800 dark:text-slate-100">
                          Trong Apache Spark, RDD viết tắt của cụm từ nào?
                        </p>

                        <div className="space-y-1">
                          {mockQuizType === "SINGLE_CHOICE" && mockOptions.map((opt, oIdx) => (
                            <div key={oIdx} className="text-[8.5px] flex items-center gap-1.5 text-slate-500">
                              <span>{oIdx === mockCorrectOption ? "✓" : "○"}</span>
                              <span className={oIdx === mockCorrectOption ? "text-green-600 font-bold" : ""}>{opt}</span>
                            </div>
                          ))}
                          {mockQuizType === "SHORT_ANSWER" && (
                            <p className="text-[8.5px] text-green-600 font-bold">Đáp án chấp nhận: Resilient Distributed Dataset</p>
                          )}
                          {mockQuizType === "FILE_UPLOAD" && (
                            <p className="text-[8.5px] text-slate-400">Yêu cầu học viên nộp tệp tin tự luận</p>
                          )}
                          {mockQuizType === "FILL_BLANK_TEXT" && (
                            <p className="text-[8.5px] text-green-600 font-bold">Điền từ: Scala</p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => setMockQuizSaved(false)}
                        className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-350 font-bold rounded-lg py-1.5 text-[10px] transition-all"
                      >
                        + Thêm câu hỏi tiếp theo
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* MOCKUP 4: AI INDEXING PIPELINE */}
              {activeTab === 3 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-sm shadow-md p-4 space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-850 dark:text-slate-200 border-b border-slate-100 dark:border-slate-850 pb-2">
                    Ingestion & Indexing Status
                  </h4>

                  {/* Documents with status */}
                  <div className="space-y-2">
                    {[
                      { name: "spark_core.pdf", size: "1.2 MB" },
                      { name: "dataframe_api.pdf", size: "2.4 MB" }
                    ].map((doc) => {
                      const state = indexState[doc.name];
                      return (
                        <div key={doc.name} className="border border-slate-100 dark:border-slate-800 rounded-lg p-2.5 bg-slate-50/50 dark:bg-slate-900/10 space-y-2">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-[9.5px] font-bold text-slate-800 dark:text-slate-200">{doc.name}</p>
                              <p className="text-[8px] text-slate-400 mt-0.5">{doc.size}</p>
                            </div>
                            
                            {state === "idle" && (
                              <button
                                onClick={() => handleIndexAI(doc.name)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded px-2.5 py-1 text-[8.5px] transition-all active:scale-95 flex items-center gap-0.5"
                              >
                                <Sparkles className="h-2.5 w-2.5" /> Index AI
                              </button>
                            )}

                            {state === "success" && (
                              <span className="bg-green-500/10 text-green-600 dark:text-green-400 text-[8.5px] font-bold border border-green-500/20 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                <CheckCircle className="h-2.5 w-2.5" /> Hoàn thành
                              </span>
                            )}

                            {state !== "idle" && state !== "success" && (
                              <span className="text-[8.5px] text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
                                <span className="h-2 w-2 border border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                                Đang index...
                              </span>
                            )}
                          </div>

                          {/* Indexing pipeline steps */}
                          {state !== "idle" && (
                            <div className="grid grid-cols-4 gap-1 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                              {[
                                { step: "pending", icon: Clock, label: "Kafka" },
                                { step: "chunking", icon: Cpu, label: "Chunk" },
                                { step: "vector", icon: Database, label: "Qdrant" },
                                { step: "neo4j", icon: Network, label: "Neo4j" }
                              ].map((item) => {
                                const stepOrder = ["pending", "chunking", "vector", "neo4j", "success"];
                                const isDone = stepOrder.indexOf(state) > stepOrder.indexOf(item.step);
                                const isCurrent = state === item.step;
                                const StepIcon = item.icon;
                                return (
                                  <div 
                                    key={item.step} 
                                    className={cn(
                                      "p-1 rounded flex flex-col items-center justify-center text-[7px] font-bold border transition-colors",
                                      isDone 
                                        ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30 text-green-600 dark:text-green-400"
                                        : isCurrent
                                          ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 animate-pulse"
                                          : "bg-slate-50 dark:bg-slate-850 border-slate-100 dark:border-slate-800 text-slate-400"
                                    )}
                                  >
                                    <StepIcon className="h-3 w-3 mb-0.5" />
                                    <span>{item.label}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* MOCKUP 5: AI TASKS */}
              {activeTab === 4 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-sm shadow-md p-4 space-y-3">
                  <div className="flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-850 pb-2">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    <h4 className="text-xs font-extrabold text-slate-850 dark:text-slate-200">AI Quiz Generator</h4>
                  </div>

                  {quizGenStatus !== "success" ? (
                    <div className="space-y-2.5">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-slate-400">CHỌN FILE ĐÃ INDEX</label>
                          <select 
                            value={selectedDoc} 
                            onChange={(e) => setSelectedDoc(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-[8.5px] outline-none"
                          >
                            <option value="spark_core.pdf">spark_core.pdf</option>
                            <option value="dataframe_api.pdf">dataframe_api.pdf</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-slate-400">ĐỘ KHÓ CỦA CÂU HỎI</label>
                          <div className="flex bg-slate-50 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-750">
                            {["easy", "medium", "hard"].map((diff) => (
                              <button 
                                key={diff}
                                onClick={() => setDifficulty(diff)}
                                className={cn("flex-1 py-1 rounded text-[7.5px] font-bold capitalize", difficulty === diff ? "bg-white dark:bg-slate-900 text-blue-600" : "text-slate-400")}
                              >
                                {diff === "easy" ? "Dễ" : diff === "medium" ? "TB" : "Khó"}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] font-bold text-slate-400">SỐ CÂU HỎI ĐỀ XUẤT: {numQuestions}</label>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={numQuestions}
                          onChange={(e) => setNumQuestions(Number(e.target.value))}
                          className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                      </div>

                      <button
                        onClick={handleGenerateAIQuiz}
                        disabled={quizGenStatus === "generating"}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg py-1.5 text-xs transition-all active:scale-95 shadow-sm flex items-center justify-center gap-1"
                      >
                        {quizGenStatus === "generating" ? (
                          <>
                            <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            AI Đang đọc hiểu & soạn đề...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3 w-3" /> Sinh câu hỏi trắc nghiệm tự động
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center text-[8.5px] text-green-600 font-bold bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
                        <span>✓ Đã sinh thành công {numQuestions} câu hỏi!</span>
                        <button 
                          onClick={() => setQuizGenStatus("idle")} 
                          className="text-[7.5px] text-slate-500 underline"
                        >
                          Làm lại
                        </button>
                      </div>

                      {/* Generated questions list */}
                      <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                        {generatedQuestions.map((q, idx) => (
                          <div key={idx} className="border border-slate-150 dark:border-slate-800 rounded p-2 bg-slate-50/50 dark:bg-slate-900/20 space-y-1 text-left">
                            <p className="text-[9px] font-bold text-slate-800 dark:text-slate-200">Câu {idx+1}: {q.question}</p>
                            <div className="grid grid-cols-2 gap-1 text-[7.5px]">
                              {q.options.map((opt) => (
                                <span 
                                  key={opt} 
                                  className={cn(
                                    "p-0.5 rounded border border-slate-100 dark:border-slate-800 pl-1",
                                    opt === q.answer ? "bg-green-500/10 text-green-600 border-green-200 dark:border-green-900/30 font-bold" : "text-slate-400"
                                  )}
                                >
                                  {opt}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
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
