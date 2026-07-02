import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Header from './components/Header';
import Hero from './components/Hero';
import Timeline from './components/Timeline';
import MemoryAlbum from './components/MemoryAlbum';
import Guestbook from './components/Guestbook';
import MemoryQuiz from './components/MemoryQuiz';
import RSVPForm from './components/RSVPForm';
import DonationPortal from './components/DonationPortal';
import BackgroundMusic from './components/BackgroundMusic';
import { Mail, Phone, MapPin, Gift, Heart, BookOpen, GraduationCap, ChevronUp } from 'lucide-react';

// Falling red phượng flower petals effect component
function FallingPetalsCanvas({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const petals: any[] = [];
    const maxPetals = 45;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    class Petal {
      x = 0;
      y = 0;
      size = 0;
      speedY = 0;
      speedX = 0;
      rotation = 0;
      rotationSpeed = 0;

      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * -canvas.height - 20;
        this.size = Math.random() * 8 + 6;
        this.speedY = Math.random() * 1.5 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 2 - 1;
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;
        if (this.y > canvas.height) {
          this.reset();
        }
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        
        // Beautiful phượng đỏ gradient color
        ctx.fillStyle = 'rgba(185, 28, 28, 0.75)'; // Red phượng Hàm Rồng
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-this.size, -this.size, -this.size * 1.5, this.size / 2, 0, this.size * 1.5);
        ctx.bezierCurveTo(this.size * 1.5, this.size / 2, this.size, -this.size, 0, 0);
        ctx.fill();
        ctx.restore();
      }
    }

    for (let i = 0; i < maxPetals; i++) {
      petals.push(new Petal());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      petals.forEach((p) => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
}

export default function App() {
  const [activeSection, setActiveSection] = useState('hero');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [petalsActive, setPetalsActive] = useState(true); // default active to look stunning immediately!

  // Monitor scroll position to highlight nav links and show back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      // Show/hide scroll to top button
      setShowScrollTop(window.scrollY > 400);

      // Simple active link tracker
      const sections = ['hero', 'timeline', 'album', 'guestbook', 'quiz', 'rsvp', 'donation'];
      const scrollPosition = window.scrollY + 200; // offset for navbar

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div id="reunion-app" className="min-h-screen bg-[#fdfcf7] text-stone-800 flex flex-col justify-between selection:bg-amber-800/25 selection:text-amber-950">
      
      {/* Falling phượng petals canvas background */}
      <FallingPetalsCanvas active={petalsActive} />

      {/* Background Music Player */}
      <BackgroundMusic />

      {/* Navigation Header */}
      <Header activeSection={activeSection} setActiveSection={setActiveSection} />

      {/* Main Body sections */}
      <main className="flex-grow">
        <Hero 
          onRSVPClick={() => scrollToSection('rsvp')} 
          onDonationClick={() => scrollToSection('donation')} 
        />
        <Timeline />
        <MemoryAlbum />
        <Guestbook />
        <MemoryQuiz />
        
        <RSVPForm />
        <DonationPortal />
      </main>

      {/* Heartfelt Footer */}
      <footer id="app-footer" className="bg-stone-900 text-stone-300 py-16 px-4 font-sans border-t-4 border-amber-800 relative overflow-hidden">
        {/* Decorative backdrop graphics */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-white rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 items-start relative z-10">
          {/* Col 1: Anniversary Branding */}
          <div className="md:col-span-4 space-y-4">
            <span className="font-display font-black text-2xl tracking-tight text-[#fdfcf7] flex items-center gap-2">
              <span className="bg-amber-800 text-white w-9 h-9 rounded-full flex items-center justify-center font-serif text-lg">15</span>
              <span>2008 - 2011</span>
            </span>
            <p className="text-stone-400 text-sm leading-relaxed font-light">
              Nơi ngưng đọng dòng chảy thời gian của tập thể sĩ số 50 thành viên lớp 10A8 - 11B8 - 12C8 trường THPT Hàm Rồng, Thanh Hóa. Chủ nhiệm bởi Thầy Nguyễn Thanh Hải kính kính thương.
            </p>
            <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-wider text-amber-500 pt-2">
              <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> Ký Ức</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> Tình Bạn</span>
              <span>•</span>
              <span className="flex items-center gap-1"><GraduationCap className="w-4 h-4" /> Tri Ân</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="font-serif font-bold text-white text-base">Liên kết nhanh</h4>
            <ul className="space-y-2 text-sm">
              {[
                { id: 'hero', name: 'Trang Chủ' },
                { id: 'timeline', name: 'Dòng Ký Ức' },
                { id: 'album', name: 'Album Ảnh Xưa' },
                { id: 'guestbook', name: 'Trang Lưu Bút' },
                { id: 'quiz', name: 'Thử Thách Vui' },
                { id: 'rsvp', name: 'Đăng Ký & Quà Lưu Niệm' },
                { id: 'donation', name: 'Đóng Góp Quỹ' }
              ].map((item) => (
                <li key={item.id}>
                  <button
                    id={`footer-link-${item.id}`}
                    onClick={() => scrollToSection(item.id)}
                    className="hover:text-amber-500 transition text-stone-400 text-left font-medium"
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Contact Board (Ban Liên Lạc) */}
          <div className="md:col-span-5 space-y-4">
            <h4 className="font-serif font-bold text-white text-base">Ban Liên Lạc 12C8 THPT Hàm Rồng</h4>
            
            <div className="space-y-3.5 text-sm font-light text-stone-400">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>Trường THPT Hàm Rồng, Số 123 Chu Văn An, Tp. Thanh Hóa, Việt Nam</span>
              </div>
              
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p>Trưởng ban/Lớp trưởng: Trọng Huỳnh — <strong>097.3311.246</strong></p>
                  <p className="mt-1">Bí thư cá tính: Thanh Nguyễn — <strong>0359.864.815</strong></p>
                  <p className="mt-1">Lớp phó văn thể: Mạnh Thắng — <strong>0943.029.193</strong></p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p>Hỗ trợ kỹ thuật: <strong>huynhnt135@gmail.com</strong></p>
                  <span className="text-[10px] text-stone-500 font-normal">Liên hệ khi gặp trục trặc về tải ảnh/đăng ký nhận quà lưu niệm</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Closing copyright block */}
        <div className="border-t border-stone-800 mt-16 pt-8 text-center text-xs text-stone-500 font-light flex flex-col sm:flex-row sm:justify-between sm:items-center max-w-6xl mx-auto gap-4 relative z-10">
          <p>© 2026 Kỷ Niệm 15 Năm Ra Trường Niên Khóa 2008 - 2011. Tất cả quyền được bảo lưu.</p>
          <p className="flex items-center justify-center gap-1 font-serif italic text-stone-400">
            "Hàm Rồng rực rỡ nắng vàng, tình bạn của chúng ta là mãi mãi" <Heart className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
          </p>
        </div>
      </footer>

      {/* Floating back to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            id="floating-scroll-top-btn"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 z-40 bg-amber-800 hover:bg-amber-900 text-white p-3.5 rounded-full shadow-2xl transition cursor-pointer"
            aria-label="Scroll to top"
          >
            <ChevronUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
