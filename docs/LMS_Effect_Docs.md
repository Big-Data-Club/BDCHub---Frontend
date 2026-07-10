# LMS Comic Effects Documentation

Tài liệu về các hiệu ứng tương tác phong cách Comic/Retro được thiết kế cho hệ thống LMS. 
Tài liệu này được đồng bộ và phản ánh trực tiếp cấu trúc của hằng số `LMS_EFFECT_DOCS` sử dụng trong Storybook.

---

## 1. Hard Shadow Shift
* **Phân loại:** Nút bấm & Huy hiệu (Buttons & Badges)
* **Ý tưởng thẩm mỹ:** Sử dụng triết lý thiết kế Retro/Comic với đường viền đậm kết hợp với bóng đổ phẳng (không blur) có độ lệch cố định. Khi tương tác, phần tử di chuyển tịnh tiến đè khít lên vị trí bóng đứng yên tạo cảm giác lún sâu cơ học chân thực, gia tăng đáng kể phản hồi tương tác (tactile feedback).
* **Các class Tailwind:**
  * Viền: `border-2 border-slate-900` (dark: `dark:border-cyan-400`)
  * Bóng: `shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]` (dark: `dark:shadow-[3px_3px_0px_0px_rgba(34,211,238,1)]`)
  * Dịch chuyển: `active:translate-x-[3px] active:translate-y-[3px]`
  * Thu bóng: `active:shadow-[0px_0px_0px_0px_rgba(15,23,42,1)]`
* **Thông số tối ưu:**
  * Độ lệch bóng: 3px (Badge dùng 2px)
  * Thời gian nhấn lún (active:duration): 75ms (snappy)
  * Thời gian đàn hồi nảy lên (duration): 250ms (mượt mà)
* **Mẫu code JSX:**
```tsx
<button className="px-6 py-3 border-2 border-slate-900 dark:border-cyan-400 bg-blue-600 dark:bg-lms-input text-white dark:text-cyan-400 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(34,211,238,1)] transition-all duration-250 hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_0px_...] active:duration-75 active:translate-x-[3px] active:translate-y-[3px] active:shadow-[0px_0px_0px_0px_...] rounded-xl font-bold">
  Comic Click
</button>
```

---

## 2. Accent Line Draw
* **Phân loại:** Tiêu đề & Thanh chọn (Headers & Tab Bars)
* **Ý tưởng thẩm mỹ:** Tạo dòng kẻ trang trí chuyển động vẽ dài ra từ trái sang phải khi hover, và biến mất thu hồi dần sang phải khi rời chuột. Thiết kế bo tròn 2 đầu nét vẽ tạo cảm giác tinh tế, hiện đại nhưng giữ được nhịp điệu tương tác liền mạch.
* **Các class Tailwind:**
  * Nền nét vẽ: `bg-blue-600` (dark: `dark:bg-cyan-400`)
  * Bo góc: `rounded-full`
  * Chuyển cảnh: `transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`
  * Điều khiển chiều: `origin-right group-hover:origin-left`
* **Thông số tối ưu:**
  * Độ dày đường kẻ: 2px (h-0.5)
  * Thời gian chuyển cảnh: 300ms
  * Trục neo (Transform Origin): Đổi từ left (khi hover) sang right (khi nhả)
* **Mẫu code JSX:**
```tsx
<div className="group inline-block cursor-pointer">
  <h2>Tiêu đề</h2>
  <div className="h-0.5 w-full bg-blue-600 dark:bg-cyan-400 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-right group-hover:origin-left mt-1" />
</div>
```

---

## 3. Left Accent Bar Slide
* **Phân loại:** Tiêu đề & Thanh chọn (Headers & Tab Bars)
* **Ý tưởng thẩm mỹ:** Sử dụng một vạch chỉ định thẳng đứng bên cạnh tiêu đề (neo trái). Khi hover, vạch này tự động tăng chiều cao và đổi màu rực rỡ, đồng thời đẩy chữ tiêu đề dịch chuyển nhẹ sang phải, tạo cảm giác phân mục đó đang mở rộng để chào đón người dùng.
* **Các class Tailwind:**
  * Vạch đứng trái: `w-1.5 h-5 bg-blue-600/30 dark:bg-cyan-400/20 group-hover:h-7 group-hover:bg-blue-600 group-hover:dark:bg-cyan-400 rounded-full transition-all duration-300`
  * Chữ tiêu đề: `transform group-hover:translate-x-1.5 transition-transform duration-300`
* **Thông số tối ưu:**
  * Độ giãn vạch đứng: h-5 (20px) tăng lên h-7 (28px)
  * Khoảng cách đẩy chữ: translate-x-1.5 (6px)
  * Thời gian chuyển cảnh: 300ms
* **Mẫu code JSX:**
```tsx
<div className="group flex items-center gap-2.5 cursor-pointer">
  <div className="w-1.5 h-5 bg-blue-600/30 dark:bg-cyan-400/20 rounded-full group-hover:h-7 group-hover:bg-blue-600 group-hover:dark:bg-cyan-400 transition-all duration-300 origin-center" />
  <h2 className="transform group-hover:translate-x-1.5 transition-transform duration-300">Tiêu đề</h2>
</div>
```

---

## 4. Comic Folder Tab
* **Phân loại:** Tiêu đề & Thanh chọn (Headers & Tab Bars)
* **Ý tưởng thẩm mỹ:** Mang phong cách thẻ hồ sơ truyện tranh cổ điển nằm trong thanh dock bảo vệ gọn gàng. Tab đang chọn hiển thị dạng khối 3D cứng cáp. Các tab phụ phẳng gọn gàng nhưng khi hover sẽ được nhấc cao nhẹ lên và biến đổi nhanh thành khối 3D nổi bật.
* **Các class Tailwind:**
  * Thành phần Dock: `bg-slate-100 dark:bg-[#0D192E] p-1.5 rounded-2xl border`
  * Tab Active: `border-2 border-slate-900 bg-blue-600 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]`
  * Tab Inactive: `border border-transparent hover:border-2 hover:border-slate-900 hover:shadow-[2px_2px_...] hover:-translate-x-[1px] hover:-translate-y-[1px]`
* **Thông số tối ưu:**
  * Độ lệch 3D: 2px (shadow-[2px_2px_...])
  * Độ nâng khi hover: translate-y-[-1px]
  * Thời gian đàn hồi: 200ms
* **Mẫu code JSX:**
```tsx
<div className="bg-slate-100 p-1.5 rounded-2xl border flex gap-2 max-w-sm">
  <button className="px-4 py-2 border-2 border-slate-900 bg-blue-600 text-white shadow-[2px_2px_...]">Bài học</button>
  <button className="px-4 py-2 border border-transparent hover:border-2 hover:border-slate-900 hover:shadow-[2px_2px_...] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all duration-200">Bài tập</button>
</div>
```

---

## 5. Halftone Dot Texture
* **Phân loại:** Cấu trúc họa tiết nền (Background Textures)
* **Ý tưởng thẩm mỹ:** Sử dụng mẫu chấm hạt bán sắc có mật độ cao nghiêng một góc 10 độ, đặc trưng của công nghệ in ấn truyện tranh cổ điển. Tạo chiều sâu nhẹ nhàng cho thẻ card mà không gây nhiễu loạn nội dung văn bản.
* **Các class Tailwind:**
  * Nền: `radial-gradient(circle, currentColor 2px, transparent 2px)`
  * Kích thước họa tiết: `backgroundSize: 20px 20px`
  * Góc xoay: `rotate-[10deg]`
  * Hiệu ứng trượt: `animate-grid-slide`
* **Thông số tối ưu:**
  * Kích cỡ điểm chấm: 2px
  * Mật độ điểm: 20px
  * Góc nghiêng: 10 độ
  * Độ trong suốt (opacity): 30% ở chế độ sáng, 45% ở chế độ tối
* **Mẫu code JSX:**
```tsx
<div className="relative overflow-hidden bg-slate-900">
  <div className="absolute -inset-10 opacity-45 rotate-[10deg] animate-grid-slide"
    style={{
      backgroundImage: 'radial-gradient(circle, currentColor 2px, transparent 2px)',
      backgroundSize: '20px 20px'
    }} 
  />
</div>
```

---

## 6. Moving Grid Texture
* **Phân loại:** Cấu trúc họa tiết nền (Background Textures)
* **Ý tưởng thẩm mỹ:** Tạo cảm giác không gian mạng và chuyển động khoa học viễn tưởng. Thích hợp cho các phần tử tiêu điểm như khung AI hoặc màn hình chọn vai trò. Lưới nghiêng 10 độ và dịch chuyển liên tục tạo chuyển động tinh tế.
* **Các class Tailwind:**
  * Lớp lưới: `bg-grid-paper` (css class toàn cục)
  * Góc xoay: `rotate-[10deg]`
  * Hiệu ứng dịch chuyển: `animate-grid-slide`
* **Thông số tối ưu:**
  * Độ nghiêng: 10 độ
  * Tốc độ dịch chuyển: 20s (linear, infinite)
  * Độ trong suốt: 60% ở sáng, 50% ở tối
* **Mẫu code JSX:**
```tsx
<div className="relative overflow-hidden">
  <div className="absolute -inset-10 opacity-50 bg-grid-paper animate-grid-slide transform rotate-[10deg]" />
</div>
```

---

## 7. Elastic Spring Back
* **Phân loại:** Các thành phần tương tác động (Interactive Elements)
* **Ý tưởng thẩm mỹ:** Gia tăng cảm giác sống động và ngộ nghĩnh cho các biểu tượng hành động nhanh. Khi rê chuột, biểu tượng phóng to kèm xoay góc nhẹ rồi nảy lò xo ngược lại nhờ đường cong easing đặc thù (cubic-bezier có giá trị overshoot > 1).
* **Các class Tailwind:**
  * Scale & Rotate: `group-hover:scale-125 group-hover:rotate-6`
  * Đường cong đàn hồi (Easing): `group-hover:ease-[cubic-bezier(0.34,1.56,0.64,1)]`
  * Thời gian: `duration-300`
* **Thông số tối ưu:**
  * Độ phóng đại: scale-125 (125% kích thước)
  * Góc xoay: rotate-6 (6 độ)
  * Đường cong Bezier: `cubic-bezier(0.34, 1.56, 0.64, 1)` - tạo lực nẩy đàn hồi (spring overshoot)
* **Mẫu code JSX:**
```tsx
<div className="group cursor-pointer">
  <div className="transform transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6 group-hover:ease-[cubic-bezier(0.34,1.56,0.64,1)]">
    <Zap />
  </div>
</div>
```

---

## 8. Double Border / Ring Offset
* **Phân loại:** Ô nhập liệu (Input Fields)
* **Ý tưởng thẩm mỹ:** Hỗ trợ tập trung thị giác tối đa cho người học khi nhấp chọn nhập liệu. Tạo một viền kép thông qua sự kết hợp của viền trong sát ô nhập và một vòng hào quang phát sáng bên ngoài có khoảng cách đệm (ring offset), giúp trường nhập nổi bật hẳn lên.
* **Các class Tailwind:**
  * Viền trong: `focus:border-blue-600` (dark: `focus:border-cyan-400`)
  * Vòng ngoài: `focus:ring-4 focus:ring-blue-500/10` (dark: `focus:ring-cyan-500/10`)
  * Thời gian mượt: `transition-all duration-200`
* **Thông số tối ưu:**
  * Độ rộng vòng hào quang: ring-4 (16px phát sáng)
  * Độ lệch hào quang (offset): Tạo khoảng đệm khoảng 2px từ viền trong nhờ ring-offset
* **Mẫu code JSX:**
```tsx
<input className="w-full rounded-xl border border-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all duration-200" />
```
