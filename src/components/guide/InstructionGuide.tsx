"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BellRing,
  BookOpen,
  Bot,
  BrainCircuit,
  Check,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Gauge,
  GraduationCap,
  LayoutDashboard,
  Lightbulb,
  MousePointer2,
  Route,
  Settings2,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type InstructionRole = "student" | "teacher" | "admin";

type StepVisual = "dashboard" | "course" | "ai" | "review" | "settings" | "analytics";

interface GuideStep {
  title: string;
  shortTitle: string;
  description: string;
  action: string[];
  outcome: string;
  caution?: string;
  visual: StepVisual;
  target: string;
}

interface RoleGuide {
  label: string;
  singular: string;
  intro: string;
  icon: LucideIcon;
  accent: string;
  entryHref: string;
  entryLabel: string;
  promise: string;
  steps: GuideStep[];
  aiTitle: string;
  aiDescription: string;
  aiItems: { title: string; body: string; icon: LucideIcon }[];
  recommendations: string[];
}

const roleGuides: Record<InstructionRole, RoleGuide> = {
  student: {
    label: "Học sinh",
    singular: "học viên",
    intro: "Biến mỗi buổi học thành một vòng lặp rõ ràng: chọn khóa học, học theo nội dung, kiểm tra hiểu bài, xem lại lỗi và ôn đúng lúc.",
    icon: GraduationCap,
    accent: "from-sky-500 to-blue-600",
    entryHref: "/lms/student",
    entryLabel: "Mở không gian học",
    promise: "Học có định hướng, không bỏ sót phần cần ôn.",
    steps: [
      {
        title: "Chọn đúng vai trò học viên",
        shortTitle: "Vào không gian học",
        description: "Sau khi đăng nhập, chọn vai trò Học viên để mở bảng điều khiển cá nhân. Nếu tài khoản có nhiều vai trò, bạn có thể đổi lại từ thanh điều hướng của LMS.",
        action: ["Đăng nhập tài khoản BDC Hub.", "Tại màn hình chọn vai trò, chọn Học viên.", "Mở mục Khóa học của tôi để xem các lớp đã được chấp nhận."],
        outcome: "Bạn vào đúng không gian học, nơi tiến độ và gợi ý được cá nhân hóa theo tài khoản.",
        caution: "Nếu không thấy khóa học, hãy kiểm tra trạng thái đăng ký hoặc liên hệ giảng viên quản lý lớp.",
        visual: "dashboard",
        target: "Khóa học của tôi",
      },
      {
        title: "Khám phá và đăng ký khóa học",
        shortTitle: "Tìm khóa học",
        description: "Trang Khám phá hiển thị các khóa học đã xuất bản mà bạn có thể truy cập. Một số lớp được duyệt thủ công, nên đăng ký chưa có nghĩa là được vào học ngay.",
        action: ["Mở Khám phá khóa học.", "Dùng ô tìm kiếm hoặc bộ lọc để tìm chủ đề phù hợp.", "Mở thẻ khóa học để đọc mô tả, sau đó chọn Đăng ký.", "Theo dõi trạng thái: chờ duyệt hoặc đã được chấp nhận."],
        outcome: "Khóa học được đưa vào danh sách của bạn khi giảng viên hoặc chính sách lớp chấp nhận yêu cầu.",
        caution: "Chỉ tham gia những lớp liên quan. Việc đăng ký tràn lan làm danh sách học và thông báo kém hữu ích.",
        visual: "course",
        target: "Đăng ký khóa học",
      },
      {
        title: "Học theo cấu trúc của khóa",
        shortTitle: "Học nội dung",
        description: "Trong mỗi khóa, nội dung được chia theo chương và thứ tự. Bạn có thể xem văn bản, video, tài liệu, diễn đàn hoặc bài kiểm tra tùy cách giảng viên thiết kế.",
        action: ["Mở một khóa học từ danh sách của bạn.", "Chọn chương ở thanh điều hướng học tập.", "Mở từng nội dung theo thứ tự được gợi ý.", "Đánh dấu hoàn thành khi đã học xong nội dung bắt buộc."],
        outcome: "Tiến độ nội dung được cập nhật để bạn biết phần nào đã hoàn tất và phần nào còn cần quay lại.",
        caution: "Đánh dấu hoàn thành chỉ nên dùng sau khi bạn thật sự đã học. Dữ liệu này giúp gợi ý và phân tích chính xác hơn.",
        visual: "course",
        target: "Đánh dấu hoàn thành",
      },
      {
        title: "Làm quiz và xem lại kết quả",
        shortTitle: "Kiểm tra hiểu bài",
        description: "Quiz giúp kiểm tra mức độ hiểu theo từng nội dung. Sau khi nộp bài, bạn có thể mở phần xem lại để đối chiếu đáp án, giải thích và các câu cần cải thiện.",
        action: ["Mở quiz trong bài học hoặc chương tương ứng.", "Đọc kỹ thời gian, số lần làm và yêu cầu trước khi bắt đầu.", "Lưu câu trả lời theo hướng dẫn trên màn hình rồi nộp bài.", "Mở lịch sử hoặc Xem lại chi tiết sau khi có kết quả."],
        outcome: "Bạn có điểm, trạng thái bài làm và cơ sở để nhận diện chủ đề cần ôn thêm.",
        caution: "Không thoát trang khi bài kiểm tra đang gửi dữ liệu. Với câu tự luận, điểm có thể chờ giảng viên chấm.",
        visual: "review",
        target: "Xem lại chi tiết",
      },
      {
        title: "Dùng AI để hiểu lỗi sai",
        shortTitle: "AI phân tích lỗi",
        description: "Ở những câu trả lời sai trong phần xem lại, nút AI Phân tích lỗi giúp diễn giải loại nhầm lẫn, gợi ý khái niệm cần xem lại và liên kết đến điểm học tập liên quan khi có sẵn.",
        action: ["Trong Xem lại chi tiết, chọn một câu có trạng thái sai.", "Chọn AI Phân tích lỗi này.", "Đọc phần nguyên nhân, khái niệm liên quan và đề xuất ôn tập.", "Quay lại bài học hoặc tạo flashcard ôn tập nếu được gợi ý."],
        outcome: "Bạn có hướng sửa lỗi cụ thể thay vì chỉ biết đáp án đúng.",
        caution: "AI là trợ lý học tập. Hãy đối chiếu với tài liệu môn học và hỏi giảng viên khi nội dung có tính quyết định.",
        visual: "ai",
        target: "AI Phân tích lỗi",
      },
      {
        title: "Ôn flashcard và ôn cách quãng",
        shortTitle: "Ôn đúng lúc",
        description: "Flashcard lưu các khái niệm cần nhớ. Hệ thống có thể đưa các thẻ hoặc câu hỏi đến hạn ôn để bạn củng cố kiến thức theo thời điểm thay vì dồn vào cuối kỳ.",
        action: ["Mở thống kê khóa học hoặc khu vực flashcard.", "Chọn bộ thẻ theo chủ đề cần ôn.", "Trả lời trung thực mức độ nhớ sau mỗi thẻ.", "Hoàn thành các mục đến hạn rồi quay lại vào lần nhắc tiếp theo."],
        outcome: "Lịch ôn và thống kê ghi nhận mức độ nắm bài, giúp bạn ưu tiên phần đang yếu.",
        caution: "Đừng luôn chọn mức nhớ cao để kết thúc nhanh. Đánh giá trung thực giúp lịch ôn hữu ích hơn.",
        visual: "review",
        target: "Ôn tập hôm nay",
      },
      {
        title: "Theo dõi tiến độ và gợi ý",
        shortTitle: "Cải thiện lộ trình",
        description: "Trang thống kê tổng hợp tiến độ bài học, kết quả quiz, mức độ thành thạo và những chủ đề có tỷ lệ sai cao. Đây là nơi nên xem trước khi lập kế hoạch học tuần tới.",
        action: ["Mở Thống kê trong khóa học.", "Xem các tab bài học, mức độ thành thạo và flashcard.", "Mở chủ đề có tỷ lệ sai hoặc số lần cần ôn cao.", "Đặt một phiên học ngắn: đọc lại, làm quiz và ôn flashcard."],
        outcome: "Bạn có một danh sách ưu tiên dựa trên hoạt động học thực tế, không phải cảm giác chủ quan.",
        visual: "analytics",
        target: "Mức độ thành thạo",
      },
    ],
    aiTitle: "AI hỗ trợ học, không làm thay việc học",
    aiDescription: "Các công cụ AI lấy ngữ cảnh từ khóa học và hoạt động của bạn để giúp đặt câu hỏi tốt hơn, nhận diện chỗ hổng kiến thức và biến nội dung thành việc ôn tập cụ thể.",
    aiItems: [
      { title: "AI Mentor", body: "Hỏi về khái niệm, xin giải thích theo ngữ cảnh khóa học và nhận gợi ý học tập. Nêu rõ bạn đang học bài nào và đã vướng ở đâu để nhận câu trả lời hữu ích hơn.", icon: Bot },
      { title: "Phân tích lỗi quiz", body: "Dùng sau khi xem lại đáp án sai để hiểu dạng nhầm lẫn và nội dung cần quay lại, không dùng như nguồn đáp án duy nhất.", icon: BrainCircuit },
      { title: "Flashcard theo điểm yếu", body: "Từ chủ đề có tỷ lệ sai cao, bạn có thể tạo hoặc mở thẻ ôn tập tập trung vào đúng nội dung đang yếu.", icon: Lightbulb },
    ],
    recommendations: [
      "Gợi ý được tạo từ tiến độ, kết quả quiz, tương tác học tập và lịch ôn. Dữ liệu đầy đủ và trung thực cho kết quả tốt hơn.",
      "Khi nhận thông báo gợi ý, hãy mở chi tiết để biết khóa học hoặc chủ đề liên quan trước khi hành động.",
      "Ưu tiên mục đến hạn ôn hoặc chủ đề yếu trước khi học thêm nội dung mới. Đây thường là cách ngắn nhất để củng cố nền tảng.",
    ],
  },
  teacher: {
    label: "Giảng viên",
    singular: "giảng viên",
    intro: "Thiết kế một trải nghiệm học có cấu trúc, theo dõi người học và dùng AI để tạo bản nháp có kiểm soát.",
    icon: BookOpen,
    accent: "from-violet-500 to-indigo-600",
    entryHref: "/lms/teacher",
    entryLabel: "Mở không gian giảng dạy",
    promise: "Từ cấu trúc môn học đến phản hồi dựa trên dữ liệu.",
    steps: [
      {
        title: "Tạo và thiết lập khóa học",
        shortTitle: "Khởi tạo khóa học",
        description: "Bắt đầu bằng thông tin mà học viên sẽ nhìn thấy: tên, mô tả, ảnh đại diện và phạm vi tổ chức nếu có. Giữ khóa ở trạng thái phù hợp cho đến khi nội dung đã sẵn sàng.",
        action: ["Vào Khóa học của tôi và chọn Tạo khóa học.", "Điền tên, mô tả rõ đối tượng và kết quả học tập.", "Chọn tổ chức nếu khóa chỉ dành cho một nhóm thành viên.", "Lưu, kiểm tra lại thông tin và xuất bản khi sẵn sàng."],
        outcome: "Bạn có một không gian môn học để tổ chức chương, nội dung, người học và hoạt động đánh giá.",
        caution: "Hãy kiểm tra phạm vi tổ chức và trạng thái xuất bản trước khi chia sẻ đường dẫn cho học viên.",
        visual: "settings",
        target: "Tạo khóa học",
      },
      {
        title: "Tổ chức chương và nội dung học",
        shortTitle: "Xây khung bài học",
        description: "Chia khóa học thành các chương có mục tiêu rõ ràng. Trong mỗi chương, thêm nội dung theo thứ tự học hợp lý như tài liệu, video, văn bản, diễn đàn hoặc quiz.",
        action: ["Mở khóa học và vào phần Nội dung.", "Chọn Thêm chương, đặt tên và thứ tự hiển thị.", "Trong từng chương, chọn Thêm nội dung và chọn đúng loại nội dung.", "Đặt nội dung bắt buộc khi đó là điều kiện cần cho tiến độ."],
        outcome: "Học viên có lộ trình rõ ràng, còn dữ liệu tiến độ phản ánh đúng cấu trúc bạn đã thiết kế.",
        visual: "course",
        target: "Thêm nội dung",
      },
      {
        title: "Tạo quiz và chấm bài",
        shortTitle: "Đánh giá học viên",
        description: "Quiz có thể được gắn vào nội dung học. Bạn quản lý câu hỏi, lựa chọn, đáp án, thứ tự và các thiết lập bài kiểm tra; các câu cần chấm thủ công xuất hiện trong khu vực chấm bài.",
        action: ["Tạo nội dung loại Quiz hoặc mở quiz hiện có để quản lý.", "Thêm câu hỏi, đáp án và giải thích cần thiết.", "Kiểm tra thiết lập thời gian, số lần làm và thời gian mở bài nếu áp dụng.", "Mở Chấm bài để xem các câu trả lời đang chờ và gửi điểm kèm nhận xét."],
        outcome: "Học viên nhận phản hồi nhất quán, còn bạn theo dõi được tình trạng bài cần chấm.",
        caution: "Luôn xem trước câu hỏi và đáp án trước khi công bố. Sau khi người học làm bài, thay đổi lớn có thể ảnh hưởng việc diễn giải điểm.",
        visual: "review",
        target: "Quản lý quiz",
      },
      {
        title: "Quản lý người học và đồng giảng viên",
        shortTitle: "Phối hợp lớp học",
        description: "Danh sách người học giúp theo dõi đăng ký và tiến độ. Chủ sở hữu khóa hoặc quản trị viên có thể thêm đồng giảng viên để phân chia công việc theo dõi, nội dung và hỗ trợ lớp.",
        action: ["Mở tab Người học để kiểm tra danh sách và trạng thái đăng ký.", "Duyệt hoặc xử lý yêu cầu tham gia theo quy trình lớp.", "Mở Đồng giảng viên, tìm người bằng tên hoặc email và thêm vào khóa.", "Rà soát danh sách định kỳ, đặc biệt sau khi kết thúc học phần."],
        outcome: "Nhóm giảng dạy có quyền truy cập phù hợp và người học được quản lý theo đúng khóa.",
        caution: "Chỉ thêm đồng giảng viên khi cần. Họ có thể tiếp cận nội dung và dữ liệu lớp theo quyền của khóa.",
        visual: "dashboard",
        target: "Người học",
      },
      {
        title: "Dùng AI tạo câu hỏi có kiểm duyệt",
        shortTitle: "AI tạo quiz nháp",
        description: "AI có thể dùng knowledge node và tài liệu đã lập chỉ mục của khóa để tạo câu hỏi nháp theo mức độ Bloom. Bản nháp không tự trở thành câu hỏi công bố.",
        action: ["Mở khu vực AI của khóa học.", "Kiểm tra knowledge node hoặc khởi tạo quá trình lập chỉ mục tài liệu khi cần.", "Chọn node, mức độ Bloom và yêu cầu tạo câu hỏi.", "Mở danh sách Chờ duyệt, đọc kỹ, chỉnh sửa nếu cần rồi Duyệt vào quiz hoặc từ chối."],
        outcome: "Bạn giảm thời gian soạn bản nháp mà vẫn giữ quyền kiểm duyệt học thuật trước khi học viên nhìn thấy nội dung.",
        caution: "Không công bố câu hỏi AI tạo mà chưa kiểm tra tính đúng đắn, độ khó, ngôn ngữ và độ phù hợp với mục tiêu học tập.",
        visual: "ai",
        target: "Chờ duyệt",
      },
      {
        title: "Tạo micro-lesson và micro-quiz",
        shortTitle: "Chia nhỏ việc học",
        description: "Từ tài liệu học phần, AI có thể chia thành bài học ngắn hoặc quiz ngắn theo knowledge node. Mỗi mục tạo ra đều có trạng thái để bạn xem, sửa, xuất bản vào chương hoặc xóa.",
        action: ["Từ khu vực nội dung AI, chọn tạo bài học micro hoặc micro quiz.", "Chọn nguồn tài liệu và các tùy chọn phù hợp.", "Theo dõi tiến trình phân tích AI trong ngăn kết quả hoặc lịch sử job.", "Xem lại từng mục, chỉnh sửa thứ tự và chỉ xuất bản các mục đạt yêu cầu."],
        outcome: "Nội dung dài được chuyển thành các đơn vị học và kiểm tra ngắn, dễ đưa vào lộ trình của khóa.",
        caution: "Nếu job thất bại, đọc thông báo lỗi và kiểm tra lại nguồn tài liệu. Đừng gửi lặp lại nhiều lần khi chưa thay đổi đầu vào.",
        visual: "ai",
        target: "Tạo micro quiz",
      },
      {
        title: "Đọc phân tích để điều chỉnh dạy học",
        shortTitle: "Theo dõi hiệu quả",
        description: "Bảng tổng quan khóa và danh sách người học giúp nhận diện mức độ tham gia, tiến độ và điểm nghẽn. Dùng dữ liệu này để điều chỉnh tài liệu, nhịp độ hoặc hoạt động ôn tập.",
        action: ["Mở Tổng quan khóa học và tab Người học.", "Xem nhóm nội dung hoặc quiz có dấu hiệu cần hỗ trợ.", "Đối chiếu với phản hồi diễn đàn và câu hỏi của lớp.", "Bổ sung tài liệu, flashcard hoặc một hoạt động ôn tập mục tiêu."],
        outcome: "Can thiệp giảng dạy bám theo tín hiệu học tập, thay vì chỉ chờ đến cuối kỳ.",
        visual: "analytics",
        target: "Tổng quan khóa học",
      },
    ],
    aiTitle: "AI là dây chuyền tạo bản nháp có kiểm duyệt",
    aiDescription: "AI phục vụ việc chuẩn bị và phân tích, còn giảng viên giữ quyền quyết định về nội dung, đánh giá và công bố. Luôn kiểm tra đầu ra trong bối cảnh học phần.",
    aiItems: [
      { title: "Knowledge node", body: "Dùng để tổ chức chủ đề và làm nền ngữ cảnh cho nội dung AI. Rà soát node trước khi yêu cầu AI tạo câu hỏi hoặc micro-content.", icon: Route },
      { title: "Quiz theo Bloom", body: "Chọn cấp độ tư duy phù hợp mục tiêu. Đọc lại đáp án, giải thích và độ khó trước khi duyệt vào quiz thật.", icon: ClipboardCheck },
      { title: "Micro-content", body: "AI phân tích tài liệu để tạo bài ngắn và quiz ngắn. Bạn kiểm tra, chỉnh sửa, sắp xếp rồi mới xuất bản vào chương.", icon: Sparkles },
    ],
    recommendations: [
      "Dữ liệu tiến độ và kết quả quiz cho thấy phần nào cần thêm ví dụ, bài tập hoặc ôn tập, không phải kết luận tuyệt đối về năng lực một cá nhân.",
      "Thiết kế nội dung có tiêu đề, thứ tự và mục tiêu rõ ràng để hệ thống và người học có đủ ngữ cảnh cho gợi ý.",
      "Khi thấy nhiều học viên vướng cùng một knowledge node, ưu tiên sửa bài học hoặc thêm bài thực hành trước khi tăng độ khó của quiz.",
    ],
  },
  admin: {
    label: "Quản trị viên",
    singular: "quản trị viên",
    intro: "Giữ hệ thống học tập an toàn, có cấu trúc và vận hành AI theo quyền hạn rõ ràng, từ tổ chức đến mô hình LLM.",
    icon: ShieldCheck,
    accent: "from-amber-500 to-orange-600",
    entryHref: "/lms/admin",
    entryLabel: "Mở bảng quản trị",
    promise: "Quản trị đúng phạm vi, bảo vệ dữ liệu học tập.",
    steps: [
      {
        title: "Vào đúng khu vực quản trị",
        shortTitle: "Mở bảng quản trị",
        description: "Vai trò Admin mở khu vực quản lý LMS riêng. Các thao tác ở đây tác động đến người dùng, tổ chức và cấu hình AI, vì vậy chỉ thực hiện khi bạn được cấp quyền phù hợp.",
        action: ["Đăng nhập bằng tài khoản đã có vai trò Admin.", "Tại màn hình chọn vai trò, chọn Admin.", "Mở Dashboard để kiểm tra các chỉ số và tác vụ quản trị."],
        outcome: "Bạn truy cập các công cụ quản trị thay vì không gian học hoặc giảng dạy.",
        caution: "Không dùng tài khoản Admin cho hoạt động thông thường. Chuyển sang vai trò phù hợp sau khi hoàn tất tác vụ quản trị.",
        visual: "dashboard",
        target: "Dashboard quản trị",
      },
      {
        title: "Quản lý vai trò người dùng",
        shortTitle: "Phân quyền",
        description: "Vai trò quyết định người dùng nhìn thấy và làm được gì trong LMS. Hãy cấp quyền theo nguyên tắc tối thiểu cần thiết và kiểm tra lại trước khi thay đổi.",
        action: ["Mở phần quản lý người dùng hoặc vai trò.", "Tìm đúng tài khoản bằng thông tin định danh.", "Xem các vai trò hiện có trước khi thêm hoặc gỡ.", "Lưu thay đổi và yêu cầu người dùng đăng nhập lại nếu hệ thống cần làm mới phiên."],
        outcome: "Người dùng nhận đúng quyền học viên, giảng viên hoặc quản trị theo trách nhiệm thực tế.",
        caution: "Gỡ hoặc thêm quyền sai có thể làm gián đoạn lớp học. Xác nhận danh tính và lý do thay đổi trước khi lưu.",
        visual: "settings",
        target: "Quản lý vai trò",
      },
      {
        title: "Tạo và quản lý tổ chức",
        shortTitle: "Thiết lập tổ chức",
        description: "Tổ chức giúp giới hạn phạm vi khóa học và thành viên. Bạn có thể tạo tổ chức, mô tả mục đích, lựa chọn chính sách hiển thị và quản lý thành viên trong từng tổ chức.",
        action: ["Mở Organizations và chọn Tạo tổ chức.", "Nhập tên, mô tả và cấu hình hiển thị phù hợp.", "Xác định chính sách tự đăng ký nếu được phép.", "Lưu rồi mở trang chi tiết tổ chức để quản lý thành viên."],
        outcome: "Khóa học và thành viên có một phạm vi quản lý rõ ràng theo đơn vị hoặc chương trình.",
        caution: "Nếu tổ chức ở chế độ riêng tư, thành viên chỉ thấy khóa học thuộc tổ chức của họ. Hãy công bố chính sách này cho giảng viên.",
        visual: "settings",
        target: "Tạo tổ chức",
      },
      {
        title: "Thêm thành viên và vai trò trong tổ chức",
        shortTitle: "Quản lý thành viên",
        description: "Trang chi tiết tổ chức hỗ trợ thêm từng người theo email hoặc mã người dùng, nhập hàng loạt danh sách email, cập nhật vai trò thành viên và gỡ người khỏi tổ chức.",
        action: ["Mở tổ chức cần quản lý, vào danh sách thành viên.", "Thêm một người bằng email hoặc mã người dùng, hoặc dán danh sách email để nhập hàng loạt.", "Kiểm tra các địa chỉ được hệ thống nhận diện trước khi xác nhận.", "Chọn vai trò phù hợp trong tổ chức và làm mới danh sách để kiểm tra."],
        outcome: "Thành viên được đưa vào đúng phạm vi nội dung và quyền của tổ chức.",
        caution: "Tệp email hoặc danh sách nhập hàng loạt là dữ liệu cá nhân. Chỉ dùng nguồn đã được phép và kiểm tra kỹ trước khi nhập.",
        visual: "dashboard",
        target: "Nhập thành viên",
      },
      {
        title: "Theo dõi hoạt động và xử lý ngoại lệ",
        shortTitle: "Giám sát hệ thống",
        description: "Dashboard quản trị và các danh sách liên quan giúp bạn phát hiện yêu cầu cần xử lý, phạm vi tổ chức bất thường hoặc vấn đề quyền truy cập. Ghi lại thay đổi quan trọng theo quy trình nội bộ.",
        action: ["Kiểm tra dashboard ở đầu mỗi phiên quản trị.", "Mở mục có cảnh báo hoặc số liệu bất thường để xác minh ngữ cảnh.", "Ưu tiên tác vụ ảnh hưởng trực tiếp đến khả năng học và dạy.", "Ghi nhận người thực hiện, thời điểm và lý do với các thay đổi nhạy cảm."],
        outcome: "Các vấn đề được xử lý có thứ tự và có thể truy vết khi cần hỗ trợ.",
        visual: "analytics",
        target: "Hoạt động cần xử lý",
      },
      {
        title: "Cấu hình nhà cung cấp và model LLM",
        shortTitle: "Thiết lập LLM",
        description: "Khu vực Cấu hình LLM quản lý nhà cung cấp, model, API key và trạng thái kích hoạt. Đây là cấu hình vận hành, không phải nơi thử prompt hoặc đưa dữ liệu học viên vào khóa bí mật.",
        action: ["Mở Cấu hình LLM và kiểm tra danh sách nhà cung cấp.", "Thêm hoặc cập nhật provider với adapter và base URL đúng môi trường.", "Thêm model, chỉ bật model đã được kiểm tra và cho phép sử dụng.", "Thêm API key với bí danh và giới hạn token hằng ngày khi chính sách yêu cầu."],
        outcome: "Các tác vụ AI có nguồn model được kiểm soát và có khả năng giới hạn mức sử dụng.",
        caution: "API key chỉ nhập tại trường bảo mật của giao diện quản trị. Không gửi key qua chat, tài liệu công khai, mã nguồn hay ảnh chụp màn hình.",
        visual: "ai",
        target: "Cấu hình LLM",
      },
      {
        title: "Thiết kế fallback và theo dõi sử dụng AI",
        shortTitle: "Vận hành AI an toàn",
        description: "Binding gắn model vào từng loại tác vụ theo thứ tự ưu tiên. Trang Usage cho biết lượt gọi, token, lỗi và fallback để bạn phát hiện cấu hình bất thường hoặc chi phí tăng cao.",
        action: ["Trong Binding, tạo chuỗi model theo task và thứ tự ưu tiên.", "Chỉ dùng Pin khi cần ép một task sử dụng đúng model đó.", "Mở Usage, lọc khoảng thời gian và so sánh calls, tokens, failures, fallbacks.", "Khi lỗi tăng, kiểm tra trạng thái provider/model trước khi thay đổi chuỗi fallback."],
        outcome: "Dịch vụ AI có phương án dự phòng, dấu vết vận hành và mức chi tiêu dễ kiểm soát hơn.",
        caution: "Không bật lại model hoặc thay đổi binding chỉ để giảm lỗi bề mặt. Hãy xác minh quyền truy cập, hạn mức, chất lượng và rủi ro dữ liệu trước.",
        visual: "ai",
        target: "Usage và Binding",
      },
    ],
    aiTitle: "Quản trị AI theo nguyên tắc an toàn và có thể truy vết",
    aiDescription: "Admin kiểm soát khả dụng, giới hạn và độ tin cậy của hạ tầng AI. Nội dung học, quyết định học thuật và quyền truy cập vẫn cần được xử lý theo chính sách của đơn vị.",
    aiItems: [
      { title: "Provider và model", body: "Kích hoạt đúng nhà cung cấp và model đã được chấp thuận. Adapter, base URL và trạng thái model phải khớp môi trường vận hành.", icon: Settings2 },
      { title: "API key và hạn mức", body: "Đặt bí danh và giới hạn token khi cần. Không hiển thị hoặc sao chép khóa sau khi nhập vào hệ thống.", icon: ShieldCheck },
      { title: "Binding và Usage", body: "Dùng chuỗi fallback để tăng khả dụng, rồi theo dõi calls, tokens, failures và fallbacks để phát hiện sớm vấn đề.", icon: Gauge },
    ],
    recommendations: [
      "Recommender dùng tín hiệu học tập để đưa nội dung, ôn tập hoặc thông báo phù hợp đến người học. Admin bảo vệ quyền truy cập và chất lượng dữ liệu đầu vào, không tự ý dùng dữ liệu này ngoài mục đích hỗ trợ học tập.",
      "Hãy kiểm tra thông báo gợi ý và quy tắc hiển thị theo chính sách của tổ chức. Tránh cấu hình gây gửi nhắc trùng lặp hoặc không liên quan.",
      "Khi xem số liệu AI hay gợi ý, ưu tiên xu hướng và dấu hiệu bất thường. Không dùng một tín hiệu đơn lẻ để đưa ra quyết định kỷ luật hoặc đánh giá con người.",
    ],
  },
};

const visualIcons: Record<StepVisual, LucideIcon> = {
  dashboard: LayoutDashboard,
  course: BookOpen,
  ai: Sparkles,
  review: ClipboardCheck,
  settings: Settings2,
  analytics: Gauge,
};

const previewNavigation: Record<InstructionRole, string[]> = {
  student: ["Khóa học", "Khám phá", "Thống kê", "AI Mentor"],
  teacher: ["Khóa học", "Nội dung", "Người học", "Công cụ AI"],
  admin: ["Dashboard", "Người dùng", "Organizations", "Cấu hình LLM"],
};

interface InstructionGuideProps {
  role: InstructionRole;
}

export function InstructionGuide({ role }: InstructionGuideProps) {
  const guide = roleGuides[role];
  const [activeStep, setActiveStep] = useState(0);
  const [isDemoClicked, setIsDemoClicked] = useState(false);
  const step = guide.steps[activeStep];
  const RoleIcon = guide.icon;
  const VisualIcon = visualIcons[step.visual];
  const previewItems = previewNavigation[role];

  const handleStepChange = (nextStep: number) => {
    setIsDemoClicked(false);
    setActiveStep(Math.max(0, Math.min(nextStep, guide.steps.length - 1)));
  };

  return (
    <div className="relative z-10 bg-slate-50 text-slate-800 dark:bg-[#050B18] dark:text-slate-200">
      <section className="border-b border-slate-200 bg-white dark:border-blue-500/10 dark:bg-[#070E1C]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <Link href="/" className="mb-8 inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-cyan-400">
              <ArrowLeft className="h-4 w-4" />
              Trang chủ BDC Hub
            </Link>
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-blue-700 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-300">
              <RoleIcon className="h-4 w-4" />
              Hướng dẫn dành cho {guide.label}
            </div>
            <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              Làm chủ BDC Hub theo từng thao tác.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">{guide.intro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={guide.entryHref} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition-all duration-200 hover:bg-blue-700 active:scale-95">
                {guide.entryLabel}
                <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#huong-dan" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-all duration-200 hover:bg-slate-50 active:scale-95 dark:border-blue-500/20 dark:bg-[#0F1E35] dark:text-slate-200 dark:hover:bg-[#162644]">
                Xem hướng dẫn tương tác
                <ChevronRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 p-5 shadow-sm dark:border-blue-500/15 dark:bg-[#0A1628] dark:shadow-none">
            <div className={`absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br ${guide.accent} opacity-15 blur-3xl`} />
            <div className="relative rounded-2xl border border-slate-200 bg-white p-5 dark:border-blue-500/15 dark:bg-[#0F1E35]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-blue-500/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white"><RoleIcon className="h-5 w-5" /></div>
                  <div><p className="font-bold text-slate-900 dark:text-white">Không gian {guide.singular}</p><p className="text-xs text-slate-500 dark:text-slate-400">{guide.promise}</p></div>
                </div>
                <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-label="Không gian được bảo vệ" />
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4 dark:bg-[#0D192E]"><p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Cách dùng</p><p className="mt-2 font-bold text-slate-800 dark:text-slate-100">{guide.steps.length} thao tác cốt lõi</p></div>
                <div className="rounded-xl bg-blue-50 p-4 dark:bg-cyan-400/10"><p className="text-xs font-bold uppercase tracking-wide text-blue-700 dark:text-cyan-300">Tương tác</p><p className="mt-2 font-bold text-slate-800 dark:text-slate-100">Bấm từng bước để xem</p></div>
              </div>
              <div className="mt-4 rounded-xl border border-slate-200 p-4 dark:border-blue-500/15"><p className="text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">Tài liệu này mô phỏng vị trí cần thao tác. Các nút có hiệu ứng click để bạn định hướng trực quan trước khi vào LMS.</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white dark:border-blue-500/10 dark:bg-[#070E1C]">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <nav aria-label="Chọn đối tượng hướng dẫn" className="flex flex-wrap gap-2">
            {(Object.keys(roleGuides) as InstructionRole[]).map((item) => {
              const ItemIcon = roleGuides[item].icon;
              const isCurrent = item === role;
              return <Link key={item} href={`/instructions/${item}`} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200 active:scale-95 ${isCurrent ? "bg-blue-600 text-white" : "border border-slate-300 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700 dark:border-blue-500/20 dark:bg-[#0F1E35] dark:text-slate-300 dark:hover:border-cyan-400/35 dark:hover:text-cyan-300"}`} aria-current={isCurrent ? "page" : undefined}><ItemIcon className="h-4 w-4" />{roleGuides[item].label}</Link>;
            })}
          </nav>
        </div>
      </section>

      <section id="huong-dan" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-bold text-blue-600 dark:text-cyan-400">Hướng dẫn tương tác</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Bấm vào một bước, xem vị trí thao tác và đọc hướng dẫn chi tiết.</h2>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-blue-500/10 dark:bg-[#0F1E35] dark:shadow-none">
              <p className="px-3 pb-3 pt-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Lộ trình thao tác</p>
              <div className="space-y-1" role="tablist" aria-label="Các bước hướng dẫn">
                {guide.steps.map((item, index) => <button key={item.title} type="button" role="tab" aria-selected={activeStep === index} onClick={() => handleStepChange(index)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200 active:scale-[.98] ${activeStep === index ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-[#162644]"}`}><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold ${activeStep === index ? "bg-white/20" : "bg-slate-100 text-slate-600 dark:bg-[#0A1628] dark:text-cyan-300"}`}>{index + 1}</span><span className="text-sm font-bold leading-5">{item.shortTitle}</span></button>)}
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            <motion.article key={step.title} initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-blue-500/10 dark:bg-[#0F1E35] dark:shadow-none">
                <div className="grid lg:grid-cols-[1.05fr_.95fr]">
                  <div className="border-b border-slate-200 p-6 sm:p-8 lg:border-b-0 lg:border-r dark:border-blue-500/10">
                    <div className="flex items-start gap-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-extrabold text-white">{activeStep + 1}</span>
                      <div><p className="text-sm font-bold text-blue-600 dark:text-cyan-400">Thao tác cần thực hiện</p><h3 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{step.title}</h3></div>
                    </div>
                    <p className="mt-6 text-base leading-7 text-slate-800 dark:text-slate-100">{step.description}</p>
                    <div className="mt-5 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-cyan-400/20 dark:bg-cyan-400/10">
                      <MousePointer2 className="h-5 w-5 shrink-0 text-blue-700 dark:text-cyan-300" />
                      <div><p className="text-xs font-bold uppercase tracking-wide text-blue-700 dark:text-cyan-300">Trên giao diện, chọn</p><p className="mt-1 text-sm font-extrabold text-slate-900 dark:text-white">{step.target}</p></div>
                    </div>
                    <ol className="mt-6 space-y-3">
                      {step.action.map((action, index) => <li key={action} className="flex gap-3 text-sm font-medium leading-6 text-slate-800 dark:text-slate-100"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[11px] font-extrabold text-blue-700 dark:bg-cyan-400/10 dark:text-cyan-300">{index + 1}</span>{action}</li>)}
                    </ol>
                    <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/20 dark:bg-emerald-950/30"><div className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" /><p className="text-sm leading-6 text-emerald-900 dark:text-emerald-100"><strong>Kết quả:</strong> {step.outcome}</p></div></div>
                    {step.caution && <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-950/30"><div className="flex gap-2"><CircleHelp className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400" /><p className="text-sm leading-6 text-amber-900 dark:text-amber-100"><strong>Lưu ý:</strong> {step.caution}</p></div></div>}
                  </div>
                  <div className="bg-slate-50 p-5 sm:p-8 dark:bg-[#0A1628]">
                    <p className="mb-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Mô phỏng thao tác</p>
                    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 dark:border-blue-500/15 dark:bg-[#070E1C]">
                      <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-blue-500/10"><div className="h-2.5 w-2.5 rounded-full bg-rose-400" /><div className="h-2.5 w-2.5 rounded-full bg-amber-400" /><div className="h-2.5 w-2.5 rounded-full bg-emerald-400" /><span className="ml-2 text-xs font-semibold text-slate-500 dark:text-slate-400">BDC Hub LMS</span></div>
                      <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-3">
                        <nav aria-label="Mô phỏng thanh điều hướng" className="space-y-2 rounded-xl bg-slate-50 p-2 dark:bg-[#0D192E]">
                          {previewItems.map((item, index) => <div key={item} className={`rounded-lg px-2 py-2 text-[10px] font-bold leading-4 ${index === 0 ? "bg-blue-600 text-white" : "text-slate-600 dark:text-slate-300"}`}>{item}</div>)}
                        </nav>
                        <div className="min-w-0"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Không gian {guide.singular}</p><p className="mt-1 font-bold text-slate-900 dark:text-white">{step.shortTitle}</p></div><VisualIcon className="h-5 w-5 shrink-0 text-blue-600 dark:text-cyan-400" /></div><div className="mt-4 rounded-xl border-2 border-blue-300 bg-blue-50 p-3 dark:border-cyan-400/35 dark:bg-cyan-400/10"><p className="text-xs font-bold text-blue-800 dark:text-cyan-200">VỊ TRÍ CẦN BẤM</p><button type="button" onClick={() => setIsDemoClicked(true)} className={`relative mt-2 w-full rounded-lg bg-blue-600 px-3 py-2 pr-11 text-left text-xs font-bold text-white transition-all duration-200 hover:bg-blue-700 active:scale-95 ${isDemoClicked ? "ring-4 ring-blue-500/20 dark:ring-cyan-400/20" : ""}`}><span className="block">{step.target}</span><motion.span key={`${step.title}-cursor`} initial={{ opacity: 0, x: 12, y: -10 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ delay: 0.15, type: "spring", stiffness: 280, damping: 18 }} className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2" aria-hidden="true"><MousePointer2 className="h-7 w-7 fill-white text-slate-900 drop-shadow-lg dark:fill-[#0F1E35] dark:text-white" /></motion.span></button>{isDemoClicked && <p className="mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300" aria-live="polite">Đã mô phỏng click. Nội dung vẫn được giữ nguyên.</p>}</div><div className="mt-3 grid grid-cols-2 gap-2"><div className="rounded-lg bg-slate-100 p-2 text-[10px] font-semibold text-slate-500 dark:bg-[#0D192E] dark:text-slate-400">Thông tin khóa học</div><div className="rounded-lg bg-slate-100 p-2 text-[10px] font-semibold text-slate-500 dark:bg-[#0D192E] dark:text-slate-400">Tác vụ cần xử lý</div></div></div>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">Con trỏ được gắn trực tiếp vào nút cần thao tác. Bấm thử chỉ tạo phản hồi mô phỏng, không làm mất phần chi tiết.</p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 dark:border-blue-500/10"><button type="button" onClick={() => handleStepChange(activeStep - 1)} disabled={activeStep === 0} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95 dark:text-slate-300 dark:hover:bg-[#162644]"><ArrowLeft className="h-4 w-4" />Bước trước</button><span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{activeStep + 1} / {guide.steps.length}</span><button type="button" onClick={() => handleStepChange(activeStep + 1)} disabled={activeStep === guide.steps.length - 1} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-bold text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95">Bước tiếp<ArrowRight className="h-4 w-4" /></button></div>
              </motion.article>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white dark:border-blue-500/10 dark:bg-[#070E1C]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-3xl"><p className="text-sm font-bold text-blue-600 dark:text-cyan-400">AI và recommender</p><h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{guide.aiTitle}</h2><p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">{guide.aiDescription}</p></div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {guide.aiItems.map(({ title, body, icon: Icon }) => <article key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-blue-500/10 dark:bg-[#0F1E35]"><Icon className="h-6 w-6 text-blue-600 dark:text-cyan-400" /><h3 className="mt-4 text-lg font-extrabold text-slate-900 dark:text-white">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{body}</p></article>)}
          </div>
          <div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-cyan-400/15 dark:bg-cyan-400/10"><div className="flex items-start gap-3"><BellRing className="mt-0.5 h-5 w-5 shrink-0 text-blue-700 dark:text-cyan-300" /><div><h3 className="font-extrabold text-slate-900 dark:text-white">Cách hiểu gợi ý học tập</h3><div className="mt-3 space-y-3">{guide.recommendations.map((item) => <p key={item} className="text-sm leading-6 text-slate-700 dark:text-slate-200">{item}</p>)}</div></div></div></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-blue-600 px-6 py-10 text-white sm:px-10"><div className="max-w-3xl"><p className="text-sm font-bold text-blue-100">Sẵn sàng bắt đầu</p><h2 className="mt-3 text-3xl font-extrabold tracking-tight">Mở BDC Hub và áp dụng từng bước ngay trong công việc của bạn.</h2><p className="mt-4 leading-7 text-blue-100">Nếu một mục không xuất hiện, trước tiên hãy kiểm tra vai trò tài khoản và quyền truy cập khóa học hoặc tổ chức.</p><a href={guide.entryHref} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 transition-all hover:bg-blue-50 active:scale-95">{guide.entryLabel}<ArrowRight className="h-4 w-4" /></a></div></div>
      </section>
    </div>
  );
}
