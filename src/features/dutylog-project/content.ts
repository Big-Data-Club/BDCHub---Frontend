export const dutylogLinks = {
  figma: 'https://www.figma.com/make/edHYn86d06Uh95uwZJ1Wqm/DutyLog?fullscreen=1&t=mm4kpDhtha3xpPrq-1&code-node-id=0-6',
  github: 'https://github.com/Big-Data-Club/BDCHub---DutyLog',
  behance: null as string | null,
};

export const workflow = [
  { number: '01', title: 'Nhận ca, mở phòng', description: 'Người trực chọn phòng và ca được phân công. Một điểm bắt đầu rõ ràng cho cả buổi sinh hoạt.' },
  { number: '02', title: 'Một lần quét, đã ghi nhận', description: 'Đưa thẻ sinh viên hoặc QR cho người trực. Có phương án nhập MSSV khi không đọc được mã.' },
  { number: '03', title: 'Biết ai đang ở đó', description: 'Thành viên xem trạng thái phòng và người đang trực trước khi quyết định ghé qua.' },
  { number: '04', title: 'Kết thúc thật gọn', description: 'Ghi nhận ra về, đóng ca và đưa trạng thái phòng về đúng thực tế. Không để lượt vào bị bỏ quên.' },
];

export const audiences = [
  { number: '01', name: 'Thành viên', quote: '“Giờ lên phòng có ai không?”', description: 'Biết phòng mở hay đóng, ai đang trực và ca tiếp theo. Bớt một tin nhắn hỏi, thêm một lần gặp nhau.' },
  { number: '02', name: 'Người trực', quote: '“Mình chỉ muốn ghi nhận thật nhanh.”', description: 'Ca trực, quét thẻ và danh sách hiện diện trong cùng một nơi. Có phản hồi rõ ràng sau mỗi thao tác.' },
  { number: '03', name: 'Ban quản lý', quote: '“Làm sao theo dõi mà không hỏi từng người?”', description: 'Một góc nhìn chung về phòng và ca trực. Nhu cầu quản lý sẽ tiếp tục được xác nhận trong giai đoạn thử nghiệm.' },
];
