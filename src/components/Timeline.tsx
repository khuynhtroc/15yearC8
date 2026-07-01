import { motion } from 'motion/react';
import { TIMELINE_EVENTS } from '../data';
import { School, BookOpen, Star, Flag, Music, CheckCircle2 } from 'lucide-react';

export default function Timeline() {
  const getIcon = (type: string) => {
    switch (type) {
      case 'school':
        return <School className="w-5 h-5 text-amber-850" />;
      case 'book':
        return <BookOpen className="w-5 h-5 text-amber-850" />;
      case 'star':
        return <Star className="w-5 h-5 text-amber-850" />;
      case 'flag':
        return <Flag className="w-5 h-5 text-amber-850" />;
      case 'music':
        return <Music className="w-5 h-5 text-amber-850" />;
      default:
        return <BookOpen className="w-5 h-5 text-amber-850" />;
    }
  };

  return (
    <section
      id="timeline"
      className="py-24 px-4 bg-gradient-to-b from-[#f5f2eb] to-[#fdfcf7]"
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-3 mb-16">
          <span className="font-sans text-[11px] tracking-widest text-amber-800 uppercase font-bold bg-amber-800/10 px-3 py-1 rounded-full">
            Dòng thời gian ký ức
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900">
            Hành Trình Thanh Xuân Chúng Ta Đã Qua
          </h2>
          <p className="font-sans text-stone-600 text-sm max-w-xl mx-auto leading-relaxed">
            Nhìn lại những cột mốc thiêng liêng từ ngày đầu tiên bỡ ngỡ bước vào mái trường cấp 3 đến ngày hội ngộ đong đầy cảm xúc sau 15 năm dài đằng đẵng.
          </p>
        </div>

        {/* Timeline Path */}
        <div className="relative border-l-2 border-amber-800/20 md:border-l-0 md:grid md:grid-cols-1 md:gap-12 md:before:absolute md:before:left-1/2 md:before:top-0 md:before:bottom-0 md:before:w-0.5 md:before:bg-amber-800/20 max-w-4xl mx-auto">
          {TIMELINE_EVENTS.map((event, index) => {
            const isEven = index % 2 === 0;

            return (
              <div
                id={`timeline-event-${index}`}
                key={index}
                className="relative pl-8 md:pl-0 md:grid md:grid-cols-2 md:gap-16 items-center mb-12 md:mb-0"
              >
                {/* Dot / Icon */}
                <div className="absolute left-[-17px] md:left-1/2 md:transform md:-translate-x-1/2 z-10 bg-[#fdfcf7] border-2 border-amber-800 p-2 rounded-full shadow-md">
                  {getIcon(event.iconType)}
                </div>

                {/* Content Side */}
                <motion.div
                  initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6 }}
                  className={`relative bg-[#fdfcf7] hover:bg-white border border-stone-200 shadow-sm hover:shadow-md p-6 rounded-2xl transition-all ${
                    isEven ? 'md:col-start-1 md:text-right' : 'md:col-start-2'
                  }`}
                >
                  {/* Decorative paper tape */}
                  <div
                    className={`absolute -top-3 w-12 h-6 bg-amber-800/10 border border-amber-800/5 rotate-[-3deg] hidden sm:block ${
                      isEven ? 'left-4' : 'right-4'
                    }`}
                  />

                  {/* Period Time */}
                  <span className="inline-block font-display font-bold text-xs md:text-sm text-amber-800 bg-amber-800/5 px-2.5 py-1 rounded-md mb-3">
                    {event.period}
                  </span>

                  {/* Title */}
                  <h3 className="font-serif text-lg md:text-xl font-bold text-stone-900 mb-2">
                    {event.title}
                  </h3>

                  {/* Description */}
                  <p className="font-sans text-stone-600 text-xs md:text-sm leading-relaxed mb-4">
                    {event.description}
                  </p>

                  {/* Highlights List */}
                  {event.highlights && (
                    <div
                      className={`flex flex-col gap-1.5 pt-3 border-t border-stone-100 ${
                        isEven ? 'md:items-end' : 'md:items-start'
                      }`}
                    >
                      {event.highlights.map((highlight, hIdx) => (
                        <span
                          key={hIdx}
                          className="flex items-center gap-1.5 font-sans text-xs text-stone-500 font-medium"
                        >
                          {!isEven && <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />}
                          {highlight}
                          {isEven && <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>

                {/* Empty side on desktop */}
                <div className="hidden md:block" />
              </div>
            );
          })}
        </div>

        {/* Closing nostalgic quote */}
        <div className="text-center mt-16 pt-8 border-t border-stone-200">
          <p className="font-serif italic text-lg text-stone-700">
            "Chúng ta không đổi thay, chúng ta chỉ lớn lên."
          </p>
          <p className="font-sans text-[10px] text-stone-400 uppercase tracking-widest mt-2">
            — Hẹn gặp lại bạn vào ngày 18.07.2026
          </p>
        </div>
      </div>
    </section>
  );
}
