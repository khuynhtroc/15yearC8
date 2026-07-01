import { AlbumItem, TimelineEvent, TriviaQuestion } from './types';

export const INITIAL_ALBUM: AlbumItem[] = [
  {
    id: 'a1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1000&auto=format&fit=crop',
    category: 'classroom',
    title: 'Góc lớp học 12C8 thân quen',
    description: 'Bảng đen, phấn trắng và những chiếc bàn gỗ sần sùi ghi dấu ấn của tập thể sĩ số 50 thành viên.',
    year: '2010',
    submittedBy: 'Ban Liên Lạc'
  },
  {
    id: 'a2',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1000&auto=format&fit=crop',
    category: 'prom-reunion',
    title: 'Lễ tốt nghiệp niên khóa 2008-2011',
    description: 'Ngày bế giảng đầy nước mắt tại trường THPT Hàm Rồng, những tà áo dài trắng viết kín chữ ký và lời chúc của các thành viên 12C8.',
    year: '2011',
    submittedBy: 'Ban Liên Lạc'
  },
  {
    id: 'a3',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1516414447565-b14be0adf13e?w=1000&auto=format&fit=crop',
    category: 'candids',
    title: 'Lưu bút viết vội ngày cuối cấp',
    description: 'Những trang giấy thơm mùi mực tím của học sinh Hàm Rồng, lưu giữ từng địa chỉ Yahoo, số điện thoại bàn và lời dặn dò của Thầy Nguyễn Thanh Hải.',
    year: '2011',
    submittedBy: 'Hoàng Lan (12C8)'
  },
  {
    id: 'a4',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1000&auto=format&fit=crop',
    category: 'extracurricular',
    title: 'Hội trại 26/03 rực lửa Hàm Rồng',
    description: 'Đêm lửa trại bùng cháy, 50 thành viên lớp 11B8 nắm tay nhau hát vang những khúc ca tuổi trẻ dưới bầu trời đầy sao.',
    year: '2010',
    submittedBy: 'Tuấn Anh (12C8)'
  },
  {
    id: 'a5',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1000&auto=format&fit=crop',
    category: 'teachers',
    title: 'Thầy Nguyễn Thanh Hải - Người lái đò thầm lặng',
    description: 'Thầy chủ nhiệm kính yêu của tập thể 10A8 - 11B8 - 12C8. Người đã nghiêm khắc uốn nắn nhưng cũng đầy bao dung nâng bước 50 học sinh trưởng thành.',
    year: '2011',
    submittedBy: 'Tập thể lớp'
  },
  {
    id: 'a6',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1000&auto=format&fit=crop',
    category: 'candids',
    title: 'Con đường phượng bay rực nắng Hàm Rồng',
    description: 'Góc sân trường Hàm Rồng ngày hè rực nắng phượng hồng, nơi lưu giữ tiếng cười tinh nghịch của thời áo trắng.',
    year: '2010',
    submittedBy: 'Minh Đức (12C8)'
  }
];

export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    period: 'Tháng 9 - 2008',
    title: 'Khởi đầu bỡ ngỡ bước vào lớp 10A8',
    description: 'Bước qua cánh cổng trường THPT Hàm Rồng với trái tim đập thình thịch. 50 học sinh xa lạ chính thức tụ hội thành tập thể 10A8 bỡ ngỡ ngơ ngác trước người thầy chủ nhiệm mới - Thầy Nguyễn Thanh Hải.',
    iconType: 'school',
    highlights: ['Lần đầu gặp gỡ bạn cùng bàn', 'Thầy Nguyễn Thanh Hải phân chia tổ học tập', 'Bắt đầu làm quen với trường mới']
  },
  {
    period: 'Năm học 2009 - 2010',
    title: 'Hành trình 11B8 & Những trò nghịch ngợm tinh quái',
    description: 'Lớp 11B8 rực rỡ mang theo trào lưu âm nhạc Teen Pop và những buổi cúp học ăn vặt cổng trường Hàm Rồng. Những trò nghịch ngợm dán giấy sau lưng, ăn vụng trong giờ học của Thầy Hải dần trở thành kỷ niệm khó phai.',
    iconType: 'music',
    highlights: ['Trào lưu nhạc Teen Pop (Wanbi Tuấn Anh, Đông Nhi)', 'Đoạt giải nhì Hội văn nghệ trường Hàm Rồng', 'Những dòng lưu bút giấu dưới ngăn bàn']
  },
  {
    period: 'Tháng 5 - 2011',
    title: 'Mùa chia tay 12C8 - Giọt nước mắt phượng vĩ',
    description: 'Buổi học cuối cùng của tập thể 12C8. Sĩ số 50 thành viên không thiếu một ai. Thầy Nguyễn Thanh Hải nghẹn ngào viết những lời dặn dò cuối cùng lên bảng đen. Những cái ôm siết chặt và những chiếc áo đồng phục viết kín chữ ký.',
    iconType: 'book',
    highlights: ['Ký tên lưu niệm lên áo trắng', 'Lễ tri ân xúc động dâng tặng Thầy Hải', 'Giọt nước mắt chia ly ngày bế giảng']
  },
  {
    period: 'Tháng 7 - 2011',
    title: 'Kỳ thi Đại học cam go & Khởi đầu mới',
    description: 'Mỗi người rẽ sang một hướng đi riêng, mang theo hoài bão của học sinh Hàm Rồng bay khắp mọi miền đất nước, lập nghiệp và dựng xây tương lai.',
    iconType: 'flag',
    highlights: ['Nhận giấy báo điểm thi hồi hộp', 'Họp lớp đầu tiên sau ngày tốt nghiệp', 'Bắt đầu hành trình sinh viên tự lập']
  },
  {
    period: 'Tháng 7 - 2026',
    title: 'Hội tụ 15 năm - Về Lại Mái Trường Hàm Rồng',
    description: 'Tròn một thập kỷ rưỡi xa cách, 50 thành viên lớp 10A8 - 11B8 - 12C8 tụ hội về lại mái trường xưa, gặp lại người thầy kính yêu Nguyễn Thanh Hải để cùng nhau ôn lại ký ức.',
    iconType: 'star',
    highlights: ['Gặp lại Thầy chủ nhiệm Nguyễn Thanh Hải', 'Báo cáo thành quả sự nghiệp, gia đình sau 15 năm', 'Tặng quà tri ân thầy cô và trường Hàm Rồng']
  }
];

export const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  {
    id: 1,
    question: 'Thầy chủ nhiệm kính yêu Nguyễn Thanh Hải của lớp tụi mình đã đồng hành cùng lớp qua những năm học nào?',
    options: ['Chỉ năm lớp 12', 'Suốt cả 3 năm cấp 3 (10A8 - 11B8 - 12C8)', 'Chỉ lớp 10 và 11', 'Chỉ năm lớp 11 và 12'],
    correctAnswerIndex: 1,
    explanation: 'Thầy Nguyễn Thanh Hải chính là người thầy chủ nhiệm tuyệt vời đã đồng hành, uốn nắn lớp suốt 3 năm học cấp ba từ 10A8, 11B8 đến 12C8!'
  },
  {
    id: 2,
    question: 'Sĩ số chính thức của lớp tụi mình (10A8 - 11B8 - 12C8) suốt những năm tháng ấy là bao nhiêu thành viên?',
    options: ['45 thành viên', '48 thành viên', '50 thành viên', '52 thành viên'],
    correctAnswerIndex: 2,
    explanation: 'Sĩ số vàng của tập thể lớp chúng ta là 50 thành viên, luôn đoàn kết và đầy ắp tiếng cười tinh nghịch.'
  },
  {
    id: 3,
    question: 'Tên ngôi trường cấp 3 thân yêu mà chúng ta đã theo học giai đoạn 2008-2011 là gì?',
    options: ['THPT Hàm Rồng', 'THPT Chuyên Lam Sơn', 'THPT Đào Duy Từ', 'THPT Nguyễn Trãi'],
    correctAnswerIndex: 0,
    explanation: 'Chúng ta tự hào là cựu học sinh trường THPT Hàm Rồng, một ngôi trường giàu truyền thống của xứ Thanh!'
  },
  {
    id: 4,
    question: 'Lớp chúng ta đã lần lượt mang những tên hiệu nào qua các năm học lớp 10, 11 và 12?',
    options: ['10A1 - 11A1 - 12A1', '10A8 - 11B8 - 12C8', '10B1 - 11B1 - 12B1', '10C8 - 11C8 - 12C8'],
    correctAnswerIndex: 1,
    explanation: 'Lộ trình định danh thân thương của tập thể lớp chúng ta là: Lớp 10A8 năm đầu cấp, lên lớp 11B8 và kết thúc rực rỡ với tên gọi 12C8!'
  },
  {
    id: 5,
    question: 'Trào lưu liên lạc trực tuyến phổ biến nhất của niên khóa 2008-2011 trường Hàm Rồng thời ấy là gì?',
    options: ['Facebook Messenger', 'Nick Yahoo! Messenger', 'Zalo', 'Viber'],
    correctAnswerIndex: 1,
    explanation: 'Nick Yahoo cùng những tiếng buzz thần thánh và avatar chớp nháy chính là cầu nối kết nối 50 thành viên ngày ấy!'
  }
];
