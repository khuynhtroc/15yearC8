import { useState, useEffect } from 'react';
import { Menu, X, Calendar, Camera, Gift, Heart, HelpCircle, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export default function Header({ activeSection, setActiveSection }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'hero', label: 'Trang Chủ', icon: Calendar },
    { id: 'timeline', label: 'Hành Trình', icon: BookOpen },
    { id: 'album', label: 'Kỷ Niệm', icon: Camera },
    { id: 'guestbook', label: 'Lưu Bút', icon: Heart },
    { id: 'quiz', label: 'Thử Thách', icon: HelpCircle },
    { id: 'rsvp', label: 'Đăng Ký', icon: Calendar },
    { id: 'donation', label: 'Quỹ Lớp', icon: Gift },
  ];

  const handleNavClick = (id: string) => {
    setIsOpen(false);
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // height of fixed header
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
    <header
      id="app-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#fdfcf7]/95 backdrop-blur-md shadow-md border-b border-stone-200 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            onClick={() => handleNavClick('hero')} 
            className="cursor-pointer flex flex-col"
          >
            <span className="font-display font-bold text-xl tracking-tight text-amber-900 flex items-center gap-2">
              <span className="bg-amber-800 text-[#fdfcf7] w-8 h-8 rounded-full flex items-center justify-center font-serif text-base shadow-sm">
                15
              </span>
              <span>2008 - 2011</span>
            </span>
            <span className="font-sans text-[10px] tracking-widest text-stone-500 uppercase font-medium pl-10">
              Kỷ Niệm 15 Năm Ra Trường
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  id={`nav-item-${item.id}`}
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-sans text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-800/10 text-amber-900 font-semibold'
                      : 'text-stone-600 hover:text-amber-800 hover:bg-stone-100/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-800' : 'text-stone-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Action Button */}
          <div className="hidden lg:block">
            <button
              id="cta-rsvp-header"
              onClick={() => handleNavClick('rsvp')}
              className="bg-amber-800 hover:bg-amber-900 text-white font-sans text-xs font-semibold uppercase tracking-wider px-5 py-2.5 rounded-full shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
            >
              Đăng ký tham dự
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              id="mobile-menu-btn"
              onClick={() => setIsOpen(!isOpen)}
              className="text-stone-700 hover:text-amber-900 p-1 rounded-md focus:outline-none"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-nav-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-[#fdfcf7] border-b border-stone-200 shadow-inner"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    id={`mobile-nav-item-${item.id}`}
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-sans text-base font-medium transition-all ${
                      isActive
                        ? 'bg-amber-800 text-white font-semibold shadow-sm'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}
              <div className="pt-4 px-4">
                <button
                  id="mobile-cta-rsvp"
                  onClick={() => handleNavClick('rsvp')}
                  className="w-full bg-amber-800 hover:bg-amber-900 text-white font-sans text-center font-semibold uppercase tracking-wider py-3 rounded-xl shadow-md block"
                >
                  Đăng ký tham dự
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
