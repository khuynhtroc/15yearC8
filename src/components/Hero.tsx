import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Clock, Users, Flame, BookHeart } from 'lucide-react';

interface HeroProps {
  onRSVPClick: () => void;
  onDonationClick: () => void;
}

export default function Hero({ onRSVPClick, onDonationClick }: HeroProps) {
  const targetDate = new Date('2026-07-18T13:00:00').getTime();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOver: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isOver: false,
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <section
      id="hero"
      className="relative min-h-screen pt-28 pb-16 px-4 flex flex-col justify-center items-center overflow-hidden bg-gradient-to-b from-[#fbf9f3] via-[#fdfcf7] to-[#f5f2eb]"
    >
      {/* Decorative patterns */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute top-12 left-12 w-64 h-64 bg-amber-400 rounded-full blur-3xl" />
        <div className="absolute bottom-24 right-12 w-80 h-80 bg-stone-300 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto text-center z-10 space-y-8 px-2">
        {/* Anniversary badge */}
        <motion.div
          id="hero-badge"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-amber-800/10 border border-amber-800/20 text-amber-950 px-4 py-1.5 rounded-full font-sans text-xs md:text-sm font-semibold tracking-wide"
        >
          <BookHeart className="w-4 h-4 text-amber-800" />
          Hội Khóa Niên Khóa 2008 - 2011 • Lớp 10A8 - 11B8 - 12C8 THPT Hàm Rồng
        </motion.div>

        {/* Main Title */}
        <div className="space-y-4">
          <motion.h1
            id="hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-stone-900 leading-tight"
          >
            15 Năm Ngày Trở Về <br />
            <span className="text-amber-800 italic font-normal">"Về Lại Mái Trường Hàm Rồng"</span>
          </motion.h1>

          <motion.p
            id="hero-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-sans text-stone-600 text-base sm:text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed"
          >
            Tròn một thập kỷ rưỡi xa cách, tập thể 50 học sinh lớp 12C8 (niên khóa 2008-2011) cùng Thầy chủ nhiệm Nguyễn Thanh Hải và các Thầy Cô bộ môn hân hoan hướng về ngày hội ngộ 15 năm đầy ý nghĩa!
          </motion.p>
        </div>

        {/* Countdown Timer */}
        <motion.div
          id="countdown-container"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="bg-white/80 backdrop-blur-sm border border-stone-200 shadow-xl rounded-2xl p-6 max-w-2xl mx-auto"
        >
          <h3 className="font-display font-bold text-xs uppercase tracking-widest text-stone-500 mb-4 flex items-center justify-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-800 animate-pulse" />
            {timeLeft.isOver ? 'Sự Kiện Đang Diễn Ra / Đã Kết Thúc' : 'Đếm ngược đến ngày hội ngộ'}
          </h3>

          <div className="grid grid-cols-4 gap-3 sm:gap-6">
            {[
              { label: 'Ngày', value: timeLeft.days },
              { label: 'Giờ', value: timeLeft.hours },
              { label: 'Phút', value: timeLeft.minutes },
              { label: 'Giây', value: timeLeft.seconds },
            ].map((unit, idx) => (
              <div
                id={`countdown-${unit.label}`}
                key={idx}
                className="bg-gradient-to-b from-stone-50 to-stone-100 border border-stone-200 rounded-xl p-3 sm:p-4 shadow-sm flex flex-col items-center"
              >
                <span className="font-display font-extrabold text-2xl sm:text-4xl text-amber-900">
                  {String(unit.value).padStart(2, '0')}
                </span>
                <span className="font-sans text-[10px] sm:text-xs text-stone-500 font-medium uppercase mt-1">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Details Bar */}
        <motion.div
          id="hero-details-bar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-4 text-left"
        >
          <div className="flex items-start gap-3 bg-stone-50/50 p-4 rounded-xl border border-stone-200">
            <Calendar className="w-5 h-5 text-amber-800 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-stone-800 text-sm">Thời gian</p>
              <p className="text-stone-600 text-xs">13h00-22h00 • Thứ Bảy, 18/07/2026</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-stone-50/50 p-4 rounded-xl border border-stone-200">
            <MapPin className="w-5 h-5 text-amber-800 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-stone-800 text-sm">Địa điểm</p>
              <p className="text-stone-600 text-xs">Trường THPT Hàm Rồng & Nhà hàng Đại Việt Palace</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-stone-50/50 p-4 rounded-xl border border-stone-200">
            <Users className="w-5 h-5 text-amber-800 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-stone-800 text-sm">Thành phần tham dự</p>
              <p className="text-stone-600 text-xs">50 học sinh lớp, Thầy chủ nhiệm & các Thầy Cô bộ môn</p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          id="hero-actions"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
        >
          <button
            id="hero-rsvp-btn"
            onClick={onRSVPClick}
            className="w-full sm:w-auto bg-amber-800 hover:bg-amber-900 text-white font-sans text-sm font-semibold uppercase tracking-wider px-8 py-4 rounded-full shadow-lg transition-all transform hover:-translate-y-1"
          >
            Đăng ký tham gia ngay
          </button>
          <button
            id="hero-donation-btn"
            onClick={onDonationClick}
            className="w-full sm:w-auto bg-[#f5f2eb] hover:bg-stone-200 text-stone-800 border border-stone-300 font-sans text-sm font-semibold uppercase tracking-wider px-8 py-4 rounded-full shadow-sm transition-all transform hover:-translate-y-1"
          >
            Quyên góp quỹ lớp
          </button>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          id="hero-stats"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="pt-10 border-t border-stone-200 max-w-2xl mx-auto grid grid-cols-3 gap-4"
        >
          <div className="text-center">
            <p className="font-serif text-3xl md:text-4xl font-extrabold text-amber-800">15</p>
            <p className="font-sans text-[10px] md:text-xs text-stone-500 uppercase tracking-widest font-medium mt-1">Năm ra trường</p>
          </div>
          <div className="text-center border-x border-stone-200">
            <p className="font-serif text-3xl md:text-4xl font-extrabold text-amber-800">3</p>
            <p className="font-sans text-[10px] md:text-xs text-stone-500 uppercase tracking-widest font-medium mt-1">Năm gắn bó</p>
          </div>
          <div className="text-center">
            <p className="font-serif text-3xl md:text-4xl font-extrabold text-amber-800">100%</p>
            <p className="font-sans text-[10px] md:text-xs text-stone-500 uppercase tracking-widest font-medium mt-1">Trọn vẹn tình bạn</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
