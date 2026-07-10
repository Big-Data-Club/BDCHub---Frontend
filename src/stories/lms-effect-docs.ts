export interface EffectDoc {
  title: string;
  subTitle: string;
  aesthetics: string;
  technical: {
    classes: string;
    parameters: string;
    code: string;
  };
}

export const LMS_EFFECT_DOCS: Record<string, EffectDoc> = {
  'hard-shadow-shift': {
    title: 'Hard Shadow Shift',
    subTitle: 'Hiệu ứng nhấn lún 3D cơ học cho Nút & Huy hiệu',
    aesthetics: 'Sử dụng triết lý thiết kế Retro/Comic với đường viền đậm kết hợp với bóng đổ phẳng (không blur) có độ lệch cố định. Khi tương tác, phần tử di chuyển tịnh tiến đè khít lên vị trí bóng đứng yên tạo cảm giác lún sâu cơ học chân thực, gia tăng đáng kể phản hồi tương tác (tactile feedback).',
    technical: {
      classes: 'Viền: border-2 border-slate-900 (dark:border-cyan-400)\nBóng: shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] (dark:shadow-[3px_3px_0px_0px_rgba(34,211,238,1)])\nDịch chuyển: active:translate-x-[3px] active:translate-y-[3px]\nThu bóng: active:shadow-[0px_0px_0px_0px_rgba(15,23,42,1)]',
      parameters: 'Độ lệch bóng: 3px (Badge dùng 2px)\nThời gian nén (active:duration): 75ms (snappy)\nThời gian đàn hồi nảy lên (duration): 250ms (mượt mà)',
      code: '<button className="px-6 py-3 border-2 border-slate-900 bg-blue-600 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] transition-all duration-250 hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_0px_...] active:duration-75 active:translate-x-[3px] active:translate-y-[3px] active:shadow-[0px_0px_0px_0px_...] rounded-xl font-bold">\n  Comic Click\n</button>'
    }
  },
  'accent-line-draw': {
    title: 'Accent Line Draw',
    subTitle: 'Đường viền vẽ động dưới chân tiêu đề',
    aesthetics: 'Tạo dòng kẻ trang trí chuyển động vẽ dài ra từ trái sang phải khi hover, và biến mất thu hồi dần sang phải khi rời chuột. Thiết kế bo tròn 2 đầu nét vẽ tạo cảm giác tinh tế, hiện đại nhưng giữ được nhịp điệu tương tác liền mạch.',
    technical: {
      classes: 'Nền nét vẽ: bg-blue-600 (dark:bg-cyan-400)\nBo góc: rounded-full\nChuyển cảnh: transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300\nĐiều khiển chiều: origin-right group-hover:origin-left',
      parameters: 'Độ dày đường kẻ: 2px (h-0.5)\nThời gian chuyển cảnh: 300ms\nTrục neo (Transform Origin): Đổi từ left (khi hover) sang right (khi nhả)',
      code: '<div className="group inline-block cursor-pointer">\n  <h2>Tiêu đề</h2>\n  <div className="h-0.5 w-full bg-blue-600 dark:bg-cyan-400 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-right group-hover:origin-left mt-1" />\n</div>'
    }
  },
  'left-accent-slide': {
    title: 'Left Accent Bar Slide',
    subTitle: 'Vạch đứng neo trái tự giãn rộng và đẩy chữ cho tiêu đề phân mục',
    aesthetics: 'Sử dụng một vạch chỉ định thẳng đứng bên cạnh tiêu đề (neo trái). Khi hover, vạch này tự động tăng chiều cao và đổi màu rực rỡ, đồng thời đẩy chữ tiêu đề dịch chuyển nhẹ sang phải, tạo cảm giác phân mục đó đang mở rộng để chào đón người dùng.',
    technical: {
      classes: 'Vạch trái: w-1.5 h-5 bg-blue-600/30 dark:bg-cyan-400/20 group-hover:h-7 group-hover:bg-blue-600 group-hover:dark:bg-cyan-400 rounded-full transition-all duration-300\nChữ tiêu đề: transform group-hover:translate-x-1.5 transition-transform duration-300',
      parameters: 'Độ giãn vạch đứng: h-5 (20px) tăng lên h-7 (28px)\nKhoảng cách đẩy chữ: translate-x-1.5 (6px)\nThời gian chuyển cảnh: 300ms',
      code: '<div className="group flex items-center gap-2.5 cursor-pointer">\n  <div className="w-1.5 h-5 bg-blue-600/30 dark:bg-cyan-400/20 rounded-full group-hover:h-7 group-hover:bg-blue-600 group-hover:dark:bg-cyan-400 transition-all duration-300 origin-center" />\n  <h2 className="transform group-hover:translate-x-1.5 transition-transform duration-300">Tiêu đề</h2>\n</div>'
    }
  },
  'comic-folder-tab': {
    title: 'Comic Folder Tab',
    subTitle: 'Thẻ phân tab dạng túi hồ sơ nhấc lên',
    aesthetics: 'Mang phong cách thẻ hồ sơ truyện tranh cổ điển nằm trong thanh dock bảo vệ gọn gàng. Tab đang chọn hiển thị dạng khối 3D cứng cáp. Các tab phụ phẳng gọn gàng nhưng khi hover sẽ được nhấc cao nhẹ lên và biến đổi nhanh thành khối 3D nổi bật.',
    technical: {
      classes: 'Thành phần Dock: bg-slate-100 dark:bg-[#0D192E] p-1.5 rounded-2xl border\nTab Active: border-2 border-slate-900 bg-blue-600 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]\nTab Inactive: border border-transparent hover:border-2 hover:border-slate-900 hover:shadow-[2px_2px_...] hover:-translate-x-[1px] hover:-translate-y-[1px]',
      parameters: 'Độ lệch 3D: 2px (shadow-[2px_2px_...])\nĐộ nâng khi hover: translate-y-[-1px]\nThời gian đàn hồi: 200ms',
      code: '<div className="bg-slate-100 p-1.5 rounded-2xl border flex gap-2 max-w-sm">\n  <button className="px-4 py-2 border-2 border-slate-900 bg-blue-600 text-white shadow-[2px_2px_...]">Bài học</button>\n  <button className="px-4 py-2 border border-transparent hover:border-2 hover:border-slate-900 hover:shadow-[2px_2px_...] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all duration-200">Bài tập</button>\n</div>'
    }
  },
  'halftone-dot': {
    title: 'Halftone Dot Texture',
    subTitle: 'Nền chấm hạt bán sắc phong cách truyện tranh',
    aesthetics: 'Sử dụng mẫu chấm hạt bán sắc có mật độ cao nghiêng một góc 10 độ, đặc trưng của công nghệ in ấn truyện tranh cổ điển. Tạo chiều sâu nhẹ nhàng cho thẻ card mà không gây nhiễu loạn nội dung văn bản.',
    technical: {
      classes: 'Nền: radial-gradient(circle, currentColor 2px, transparent 2px)\nKích thước họa tiết: backgroundSize: 20px 20px\nGóc xoay: rotate-[10deg]\nHiệu ứng trượt: animate-grid-slide',
      parameters: 'Kích cỡ điểm chấm: 2px\nMật độ điểm: 20px\nGóc nghiêng: 10 độ\nĐộ trong suốt (opacity): 30% ở chế độ sáng, 45% ở chế độ tối',
      code: '<div className="relative overflow-hidden bg-slate-900">\n  <div className="absolute -inset-10 opacity-45 rotate-[10deg] animate-grid-slide"\n    style={{\n      backgroundImage: \'radial-gradient(circle, currentColor 2px, transparent 2px)\',\n      backgroundSize: \'20px 20px\'\n    }} \n  />\n</div>'
    }
  },
  'moving-grid': {
    title: 'Moving Grid Texture',
    subTitle: 'Nền lưới chuyển động không gian',
    aesthetics: 'Tạo cảm giác không gian mạng và chuyển động khoa học viễn tưởng. Thích hợp cho các phần tử tiêu điểm như khung AI hoặc màn hình chọn vai trò. Lưới nghiêng 10 độ và dịch chuyển liên tục tạo chuyển động tinh tế.',
    technical: {
      classes: 'Lớp lưới: bg-grid-paper (css class toàn cục)\nGóc xoay: rotate-[10deg]\nHiệu ứng dịch chuyển: animate-grid-slide',
      parameters: 'Độ nghiêng: 10 độ\nTốc độ dịch chuyển: 20s (linear, infinite)\nĐộ trong suốt: 60% ở sáng, 50% ở tối',
      code: '<div className="relative overflow-hidden">\n  <div className="absolute -inset-10 opacity-50 bg-grid-paper animate-grid-slide transform rotate-[10deg]" />\n</div>'
    }
  },
  'elastic-spring': {
    title: 'Elastic Spring Back',
    subTitle: 'Biểu tượng nảy lò xo đàn hồi khi hover',
    aesthetics: 'Gia tăng cảm giác sống động và ngộ nghĩnh cho các biểu tượng hành động nhanh. Khi rê chuột, biểu tượng phóng to kèm xoay góc nhẹ rồi nảy lò xo ngược lại nhờ đường cong easing đặc thù (cubic-bezier có giá trị overshoot > 1).',
    technical: {
      classes: 'Scale & Rotate: group-hover:scale-125 group-hover:rotate-6\nĐường cong đàn hồi (Easing): group-hover:ease-[cubic-bezier(0.34,1.56,0.64,1)]\nThời gian: duration-300',
      parameters: 'Độ phóng đại: scale-125 (125% kích thước)\nGóc xoay: rotate-6 (6 độ)\nĐường cong Bezier: cubic-bezier(0.34, 1.56, 0.64, 1) - tạo lực nẩy đàn hồi (spring overshoot)',
      code: '<div className="group cursor-pointer">\n  <div className="transform transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6 group-hover:ease-[cubic-bezier(0.34,1.56,0.64,1)]">\n    <Zap />\n  </div>\n</div>'
    }
  },
  'double-border-ring': {
    title: 'Double Border / Ring Offset',
    subTitle: 'Vòng mục tiêu phát sáng kép khi focus',
    aesthetics: 'Hỗ trợ tập trung thị giác tối đa cho người học khi nhấp chọn nhập liệu. Tạo một viền kép thông qua sự kết hợp của viền trong sát ô nhập và một vòng hào quang phát sáng bên ngoài có khoảng cách đệm (ring offset), giúp trường nhập nổi bật hẳn lên.',
    technical: {
      classes: 'Viền trong: focus:border-blue-600 (dark:focus:border-cyan-400)\nVòng ngoài: focus:ring-4 focus:ring-blue-500/10 (dark:focus:ring-cyan-500/10)\nThời gian mượt: transition-all duration-200',
      parameters: 'Độ rộng vòng hào quang: ring-4 (16px phát sáng)\nĐộ lệch hào quang (offset): Tạo khoảng đệm khoảng 2px từ viền trong nhờ ring-offset',
      code: '<input className="w-full rounded-xl border border-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all duration-200" />'
    }
  }
};
