import { AlbumItem, TimelineEvent, TriviaQuestion } from './types';

export const INITIAL_ALBUM: AlbumItem[] = [
  {
    id: 'a1',
    type: 'image',
    url: 'https://lh3.googleusercontent.com/rd-d/ALs6j_H4Y1wWWIrKiuM49FHAlhZ77Ubype5GPB98_8fawoAiu9pj3193jIuQKM2ZOTDIo_JYy3Jz9N6EWIirPnzXLnm42XJqAMJicfmptN65qPKGQRNluy3XynQ-0_OwZsFf-WyfmHDJwkHh2LctMxReM1vebXVRLd6AxqomgdxfNNETYdiomD9FAz_xrXObAM3p0Mt4OAWtqV1Uu10fYYis2SEBrhNTll8lSyCVVp8Chtf77aYtC3gWV2ozfpgEbPxK5rM3vxPl5FW5l0X_79PX1J1D-x-lJKf01ylNoX54osaiDfjNrnZonmzpA_cjJQIRC64VZRIa44lL-Q60LjE75SC4vTuvVzgyhrk-Zjo5zqwUQZS18xXd_PQ9uudKYLmPDaRKF1fd_MVENOGuSwzza5gwomIVARbHb6zSxeLUcUesJGrE0f8nr7Go7vKS3fGb4Zz4oeAxxgf-QJjWW0i95Tn1a8dXfWPJsQr93pLj5CtXZqceJqOnd7D43omM7m0ADNa6Max3ycNA3oTyjp7mDdHRmfjVwZ6_QeJouu0ubr6i_eh7gw5xkwsY07DFOu9EEeWk0eS1PWRGivMF518BAEklyU5fvwN8rYPbFlxDVKs7SfrlVS5tK0-Xo3F1sCAC6Oisu5Y2iRNxFJf96Hgf8Q3KhpPeGr4apccjcIgqwYW7_N4A_rUI7z7126e0-C1CNtXblYvkVXhwmAb5_bE4dwElsVOd3TR6ZeNnCH19yRL4pXeCaISs5-QCqfMzP6r6XH866DPWSuDkLn9WgW9htTg3CT0JQFXt4g0AEMf14k5QhoTFwwIcUc9Jmpt7YpBXf0HWRl3TaFIh89YY-sCCDSUtwcpAECvaur8Mroq0ZV5LxG0mEuO2ckqLZakn9hszthH5R0mZyJlUp8cZuvpLkXduvNJaaT2u2hUvI0ojC9mT78rrPp4fgL-mtsnoeQ1t3oeTFgGhWPOeDbay3FUrlIxqem213_VnoP20RBXVgr3z5IXgVeeWa-Zauj4JlGNRxUxoZJTD7VD5g_tMbJH1tgGE6qvjWuOxwUvi7RhnVAvvhvXciYQ3wkzqFXX57oiHHLGzQueZY1pdMkydryW-fgwNeBF2t6gUpa2_dPxuXV1GdOLkD4hMd8PyTT6FtLgWIZDWOCbgF8T63irB5gKB46KfyUkmlZZpfuggCL1CKrngWcQina8yjLpix_o7R-I915d3dNirIdPOEuEAFuMcIOQzV_hMsXRLaCY2fRTaBY1Ol_MS0rO0IVgJ5pMVbWZfHkV3briQR6frK9f9pboHEycgqklR2yeDM-Zl2Kkm295uh03OFQ=w1875-h927?auditContext=prefetch',
    category: 'classroom',
    title: 'Góc lớp học 12C8 thân quen',
    description: 'Bảng đen, phấn trắng và những chiếc bàn gỗ sần sùi ghi dấu ấn của tập thể sĩ số 50 thành viên.',
    year: '2010',
    submittedBy: 'Ban Liên Lạc'
  },
  {
    id: 'a2',
    type: 'image',
    url: 'https://img.lightshot.app/D605uAaGS8OBdbf7xsp8TA.png',
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
    submittedBy: 'Ban Liên Lạc'
  },
  {
    id: 'a4',
    type: 'image',
    url: 'https://img.lightshot.app/ogxOQMqNTk2FBzY9gO_2sA.png',
    category: 'extracurricular',
    title: 'Du xuân quê hương Yên Định',
    description: 'Trên thùng xe công nông nơi đồng quê, thành viên lớp 11B8 nắm tay nhau hát vang những khúc ca tuổi trẻ dưới bầu trời đầy nắng và gió.',
    year: '2011',
    submittedBy: 'Ban Liên Lạc'
  },
  {
    id: 'a5',
    type: 'image',
    url: 'https://lh3.googleusercontent.com/rd-d/ALs6j_Hu6ewq5_O93kq-xGSAB_AjU4ZQPEytQBag6rZw59KoXDDxUmvcQRyPNymVdqTa7-AEXxxuX5e_l7mqGtWCDUOEEX5WirSlyF9eWVMq6iRfZ3CUaFSwVe6ts59OYEHnXbXnGJ0ZzCzSXujzbG0ieQEHeRIUkH5UHmmXWFIDtuRd-TwRZ8TeYxjxySr9l7r7_jvfhY8Z1X8X5DCQa3ha27ogHujZoHR1mqtGs7Aw8e79ex7U7NaRkHQGjRXferd8qHIucwfF9cKopWx-b1C9LxPPzOMrQWn9DmeIJSSh8-hRzLseiQw27R4JM7CGxHFtdMHxAXbt_xmAYbUBiPNXtq2wUcvGTlEkxiIbBrILYdTQB0gqMpqnerZ7A8ig4hnN4y9cLBwlnN3qGr1PJiTGJw5h21cVKfBZmMk6i5ukzYRlt88-KL_L7vQ6TSNTMGvVJemEawxzoCLLRS0BysbGmeQYo-KYZEG6fPU8B6RhqAoSJ2Rj83yibs-_vqO1yaD9RubSwXPOcGNEMWzSPNPXnl63Yvw0R0cdOnd43nRmfMEdOK3iRGmUCp-3UMRFyS6HYywznaaidtflTkOlAGfmtS-oS_gkH1B2fMl-I85si0riznuBPMoEcd72D7F6widJbDvQ1qgoPAQfYOVqIliG49EvEYVT9Ch8x8nYD-OqTnjDGsQh85O4TjmiCY6LpIDP2VKgmJpYhqT_4llEOVzyeKY7dhY5rcjmJ2rua3mGPLBXH5oj20uM16AJ5uFXLyNgb0htoWCut545FafxMlkuAlgIJzci6_PwQRev8cpbaeUSLvanr_Qpdbh46588eTdYcOwMue3Bjv3F5lWd9lF1vp3ZrWftKFOEBNJ7CZVNpEs3C4PdKS86HcUwsIa0tfpvizqGoFo6MPLU15VPV9ZWcYfI_wWO09bm_v3imulVosWGqyk6ZG4INfpjGx8IFNbV4rX5C2JDqA6jKt6b0RzCujXrWKdctSkf2P7RqSg8bjQveJ0Zk3HwLAAayVfJjU4107_s_YWQMnaq6Au6vV_H5hNJczrW5-wENKU4XwCQ6IV7btJQSnzP05nomNHLezHQkJuuJxTGH_ZLQPwuu5mzF3Q-AhsCdtvB7FuP7185tx_PS6Wx02-2XsyoOcuwh2Q-3eZTfVbOBLG36_yJXulDOvDUHJI_yH0e2cKURM38BlJp6o_d-R9I6YFDidDFJ0mLDkRhwdjyCSbUYkNctMOjjsz1_I0d9VyESTPnuy9-mJYEbK2v6Y78mWLkGJvoJKAYMdrewPCwrGuHw9yJr9pCPyZOm5hJjlVjMgJ0tZTH-QDio_CGKTmC=w1875-h927?auditContext=prefetch',
    category: 'teachers',
    title: 'Thầy Nguyễn Thanh Hải - Người lái đò thầm lặng',
    description: 'Thầy chủ nhiệm kính yêu của tập thể 10A8 - 11B8 - 12C8. Người đã nghiêm khắc uốn nắn nhưng cũng đầy bao dung nâng bước 50 học sinh trưởng thành.',
    year: '2011',
    submittedBy: 'Tập thể lớp'
  },
  {
    id: 'a6',
    type: 'image',
    url: 'https://lh3.googleusercontent.com/rd-d/ALs6j_EKqMNT3_tQHzzIn2LKW6YVlvhDpOrhbEwIhA8iABDJrXkeMQZ72SXRc0pvZs7x9c1XR3b0EWJj4sDzPAx-axk_bapickC9rr9T-q6ezQvZlQRIQdznRJ7FIfzdQO_EhBHtjjnpe0FjbaEIGkHOP1iLv6PYyDeGOlecFUq5eU11dPuJZFescvjC0CjSGpbpCA62-yAlKHaT3H-RTuRUGWa5DIhwNGAKSLoDmSNLG7E2gh9R_6vdD-bqlWjGEkwH2mQYLYFwdINvpP2HrUKwRnccc3gQz0pKijwMouRbwNqLjDK8zX4VuiHk5tMFWuychaudlVy9zyI3jt8nRZs8a0p87goQdUvcxxqeYHwHOS4Q-nRfjZf7uRLnOjMjVfIcNQHCV583Uct4iU3OARSRyVUhMfNKVQ3IHt2c2cRT5EEhjRfux5m4D9kx_IywznX7Z1QcovI_8ZPbp9DAdZuzvHbA6-l7A1K_SPNtk0EUgzcqe2Wgp4DdyFYJSxd06mAR2xuY6uFPwXSwPZBS7a1v0jIhkWBuKZZFM84GSX1MvpKILSPLO6JLr04RHi4uKL5EQ5t5Q2Ayv2DYX_Hz4QfRWB1pg_opJ_ysDqcucG12LvrQjAcBbrBDekvEOZJwg1fyUBz9ARloHa87YdY6TofU9MhUdAm3o63I8-2RCljxrifK9NRwEJTZeR-x_HQ2GUc-JhD2yb2fj_F1RP1iuIzsMU8W2_vcbbPSINLjD4KLx5Qxlv7ieuOF1y-KQQMssOWK1DuMuh_1tOGXcvUY3W9Kn3JJrYUCpVcUqh9BBipqsC3bg2BH40olaVqX0TADxkYTHehbxU7hliOQTeKXXi7Eu-Ggyka7gzFQ1yiQsKU8b--XzdqP6oetbJFqn-3T_VYrqhdg67qa8BBkp2wzLp5o18YllrrlDgJaU6G2izMmnE21aDJyztDIJurkewq0AVdsJzHAYDY6BYx7-DLty5qQtVVbdl31yG5zCOHgJAeWws7T3OS2DSJaMuk9zsAInoe8oc7JXs3vIM4VKeabGBtgu80oqcr-bvEiAKkjAag6KSxbGpRfH5S8NtI1GT0Q9L75BVxX2_e4ynRtvQHvR_XOLLPEeYNI-Fo3y42QJxaOFqhZ3XxdFS4fMoUtgw9XHo9NruPmyFQIB7hVLr9YPAUR8OvlXFsF93n5b8DbeoefnujhDFD9Rdv0-FcfL2ZQ3QpI-7HEhyYn9dEW6PkLJrB6WpVGtWY-GA2B8zw9iwDjmFuyteV8OKHjlIhpZafKi7N-DY73EuVyGWnyuY6o5oV1q4FLexTPLweIPuRkgsfzOWCJWnW8uidi=w1875-h927?auditContext=prefetch',
    category: 'candids',
    title: 'Con đường phượng bay rực nắng Hàm Rồng',
    description: 'Góc sân trường Hàm Rồng ngày hè rực nắng phượng hồng, nơi lưu giữ tiếng cười tinh nghịch của thời áo trắng.',
    year: '2010',
    submittedBy: 'Ban Liên Lạc'
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
