import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showNotice, setShowNotice] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // When user clicks the Enter/Notice button, play music immediately and close notice
  const handleEnter = () => {
    setShowNotice(false);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.log('Playback failed on notice button click:', err);
        });
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((err) => console.log('Playback error:', err));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  return (
    <>
      {/* Local uploaded background music from root folder */}
      <audio
        ref={audioRef}
        src="/Music_Relax_Memories.mp3"
        loop
        preload="auto"
      />

      {/* Welcome & Music Notice Modal */}
      <AnimatePresence>
        {showNotice && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="bg-[#fdfcf7] max-w-md w-full p-8 rounded-3xl shadow-2xl border border-stone-200 text-center font-sans relative overflow-hidden"
            >
              {/* Decorative design elements */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-600 via-rose-500 to-amber-800" />
              
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-100">
                <Music className="w-8 h-8 text-amber-800 animate-pulse" />
              </div>

              <h2 className="text-2xl font-serif font-bold text-stone-900 mb-3 tracking-tight">
                Hội Khóa 12C8 Kỷ Niệm
              </h2>
              
              <p className="text-stone-600 text-sm leading-relaxed mb-8 font-sans">
                Chào mừng bạn trở lại với những năm tháng học trò tươi đẹp nhất. 
                Để hành trình quay ngược thời gian thêm đong đầy cảm xúc, hãy cùng lắng nghe giai điệu nhạc nền thân thương nhé!
              </p>

              <button
                id="enter-and-play-music-btn"
                onClick={handleEnter}
                className="w-full bg-amber-800 hover:bg-amber-900 text-white font-medium py-3.5 px-6 rounded-xl shadow-lg shadow-amber-800/20 hover:shadow-amber-900/30 transition-all duration-300 font-sans cursor-pointer flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
              >
                <span>Bước vào & Nghe nhạc</span>
                <Heart className="w-4 h-4 fill-white" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mute/Play Floating Control Button (only visible when notice is closed) */}
      <AnimatePresence>
        {!showNotice && (
          <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3">
            <motion.button
              id="bg-music-toggle-btn"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={togglePlay}
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg cursor-pointer border relative overflow-hidden transition-all duration-300 ${
                isPlaying
                  ? 'bg-amber-800 text-white border-amber-700/50'
                  : 'bg-[#fdfcf7] text-stone-600 border-stone-300 hover:text-amber-800'
              }`}
              title={isPlaying ? "Tắt nhạc nền" : "Bật nhạc nền"}
            >
              {/* Rotating vintage line border when playing */}
              {isPlaying && (
                <motion.div
                  className="absolute inset-1 rounded-full border border-dashed border-amber-400/30"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                />
              )}

              <div className="relative z-10">
                {isPlaying ? (
                  <Volume2 className="w-5 h-5 animate-pulse" />
                ) : (
                  <VolumeX className="w-5 h-5" />
                )}
              </div>
            </motion.button>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
