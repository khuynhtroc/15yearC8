import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Volume2, VolumeX, Maximize2, ExternalLink, Settings, Edit, Check, X, Film } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function MemoryVideo() {
  // Default video configurations
  const defaultVideoUrl = '/video.mp4';
  const defaultGooglePhotosUrl = 'https://photos.app.goo.gl/BKZ6hhx9bCFbujy8A';

  const [videoUrl, setVideoUrl] = useState(defaultVideoUrl);
  const [googlePhotosUrl, setGooglePhotosUrl] = useState(defaultGooglePhotosUrl);

  // Player controls state
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [hoverUnmuteSupported, setHoverUnmuteSupported] = useState(true);
  const [showUnmuteHint, setShowUnmuteHint] = useState(true);

  // Admin Config Panel states
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [tempVideoUrl, setTempVideoUrl] = useState('');
  const [tempGooglePhotosUrl, setTempGooglePhotosUrl] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 1. Fetch dynamic video settings from Firestore (to preserve user changes across devices)
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const docRef = doc(db, 'video_settings', 'main');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.videoUrl && !data.videoUrl.includes('mixkit.co') && !data.videoUrl.includes('googleusercontent.com')) {
            setVideoUrl(data.videoUrl);
          }
          if (data.googlePhotosUrl) setGooglePhotosUrl(data.googlePhotosUrl);
        }
      } catch (err) {
        console.error('Error fetching video settings from firestore:', err);
      }
    };
    fetchConfig();
  }, []);

  // Sync state for config panel
  useEffect(() => {
    setTempVideoUrl(videoUrl);
    setTempGooglePhotosUrl(googlePhotosUrl);
  }, [videoUrl, googlePhotosUrl, isConfigOpen]);

  // Sync fullscreen state
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    document.addEventListener('mozfullscreenchange', onFullscreenChange);
    document.addEventListener('MSFullscreenChange', onFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
      document.removeEventListener('mozfullscreenchange', onFullscreenChange);
      document.removeEventListener('MSFullscreenChange', onFullscreenChange);
    };
  }, []);

  // Auto-hide controls in fullscreen after 2s of mouse inactivity
  useEffect(() => {
    let timeoutId: any;

    const resetTimeout = () => {
      setShowControls(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setShowControls(false);
      }, 2000);
    };

    if (isFullscreen) {
      resetTimeout(); // Start immediately upon entering fullscreen

      const container = containerRef.current;
      if (container) {
        container.addEventListener('mousemove', resetTimeout);
        container.addEventListener('click', resetTimeout);
      }

      return () => {
        clearTimeout(timeoutId);
        if (container) {
          container.removeEventListener('mousemove', resetTimeout);
          container.removeEventListener('click', resetTimeout);
        }
      };
    } else {
      // If not in fullscreen, ensure controls are shown/hidden normally based on hover states
      setShowControls(false);
    }
  }, [isFullscreen]);

  // Listen to video-mute event from BackgroundMusic
  useEffect(() => {
    const handleVideoMute = () => {
      if (videoRef.current) {
        videoRef.current.muted = true;
        setIsMuted(true);
      }
    };
    window.addEventListener('video-mute', handleVideoMute);
    return () => {
      window.removeEventListener('video-mute', handleVideoMute);
    };
  }, []);

  // Unmute handling
  const unmuteVideo = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      setIsMuted(false);
      setShowUnmuteHint(false);
      // Notify background music to pause
      window.dispatchEvent(new CustomEvent('bg-music-mute'));
    }
  };

  const muteVideo = () => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      setIsMuted(true);
      // Notify background music to resume
      window.dispatchEvent(new CustomEvent('bg-music-unmute'));
    }
  };

  // Hover handlers (di chuột vào / ra)
  const handleMouseEnter = () => {
    setShowControls(true);
    // Unmute on hover
    try {
      if (videoRef.current) {
        unmuteVideo();
        
        // Ensure it is playing (browsers sometimes auto-pause when unmuted if not clicked)
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((e) => {
            console.log('Hover unmute play was blocked. Waiting for click.', e);
            setHoverUnmuteSupported(false);
          });
        }
      }
    } catch (err) {
      console.log('Failed to unmute on hover due to browser policy:', err);
      setHoverUnmuteSupported(false);
    }
  };

  const handleMouseLeave = () => {
    setShowControls(false);
    // Mute on hover exit only if not in fullscreen
    if (!isFullscreen) {
      muteVideo();
    }
  };

  // Click handler (Click to play/pause, unmute, and go Fullscreen)
  const handleVideoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    unmuteVideo();
    
    // Play if paused
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(err => console.log(err));
        setIsPlaying(true);
      }
    }

    // Toggle Fullscreen
    triggerFullscreen();
  };

  const triggerFullscreen = () => {
    if (!containerRef.current) return;
    const elem = containerRef.current;
    
    try {
      if (!document.fullscreenElement) {
        if (elem.requestFullscreen) {
          elem.requestFullscreen().catch(err => console.log(err));
        } else if ((elem as any).webkitRequestFullscreen) { /* Safari */
          (elem as any).webkitRequestFullscreen();
        } else if ((elem as any).mozRequestFullScreen) { /* Firefox */
          (elem as any).mozRequestFullScreen();
        } else if ((elem as any).msRequestFullscreen) { /* IE11 */
          (elem as any).msRequestFullscreen();
        }
        setIsFullscreen(true);
        unmuteVideo();
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Fullscreen request failed', err);
    }
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(err => console.log(err));
        setIsPlaying(true);
        unmuteVideo();
      }
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMuted) {
      unmuteVideo();
    } else {
      muteVideo();
    }
  };

  // Admin config save action
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword !== 'Abcd@1993') {
      setErrorMsg('Mật khẩu Ban cán sự không đúng!');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const docRef = doc(db, 'video_settings', 'main');
      await setDoc(docRef, {
        videoUrl: tempVideoUrl.trim() || defaultVideoUrl,
        googlePhotosUrl: tempGooglePhotosUrl.trim() || defaultGooglePhotosUrl,
        updatedAt: new Date()
      });

      setVideoUrl(tempVideoUrl.trim() || defaultVideoUrl);
      setGooglePhotosUrl(tempGooglePhotosUrl.trim() || defaultGooglePhotosUrl);
      setSuccessMsg('Đã cập nhật cấu hình video thành công rực rỡ!');
      
      setTimeout(() => {
        setIsConfigOpen(false);
        setSuccessMsg('');
        setAdminPassword('');
      }, 1500);
    } catch (err) {
      console.error(err);
      setErrorMsg('Lỗi khi lưu cấu hình lên cơ sở dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="video-memories"
      className="py-24 px-4 bg-[#fdfcf7] relative overflow-hidden"
    >
      {/* Decorative vector grid pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#b45309_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.03]" />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 font-sans text-[11px] tracking-widest text-amber-800 uppercase font-extrabold bg-amber-800/10 px-3 py-1 rounded-full">
            <Film className="w-3 h-3 text-amber-800 animate-pulse" /> Thước Phim Thanh Xuân
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900">
            Thước Phim Kỷ Niệm 15 Năm Ngày Trở Về
          </h2>
          <p className="font-sans text-stone-600 text-sm max-w-xl mx-auto leading-relaxed">
            Những khoảnh khắc quý giá tràn đầy tiếng cười dưới mái trường THPT Hàm Rồng được tái hiện qua những thước phim đong đầy xúc cảm.
          </p>
        </div>

        {/* Video Player Frame with Chalkboard / Wood Aesthetic */}
        <div className="relative group max-w-3xl mx-auto">
          {/* Wood chalkboard frame styling */}
          <div className="absolute -inset-3 bg-stone-800 rounded-3xl shadow-xl border-4 border-stone-700/60 -rotate-[0.5deg] scale-[1.01]" />
          
          <div
            ref={containerRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`relative aspect-video w-full h-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-stone-950 flex items-center justify-center select-none transition-all duration-300 ${isFullscreen && !showControls ? 'cursor-none' : ''}`}
          >
            {/* Main Video Element */}
            <video
              ref={videoRef}
              src={videoUrl}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              onClick={handleVideoClick}
              className="w-full h-full object-cover transition-all duration-300 rounded-2xl"
            />

            {/* Default overlay gradients */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`} />

            {/* Mute Indicator overlay */}
            <div className={`absolute top-4 right-4 z-20 flex gap-2 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <button
                onClick={toggleMute}
                className="p-2.5 bg-black/50 backdrop-blur-md rounded-full text-white border border-white/20 hover:bg-black/75 transition cursor-pointer"
                title={isMuted ? 'Mở âm thanh' : 'Tắt âm thanh'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>
              <button
                onClick={triggerFullscreen}
                className="p-2.5 bg-black/50 backdrop-blur-md rounded-full text-white border border-white/20 hover:bg-black/75 transition cursor-pointer"
                title="Toàn màn hình"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Play/Pause Button in the center (visible when paused or hovered) */}
            <div 
              onClick={handleVideoClick}
              className={`absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer transition-opacity duration-300 ${(!isPlaying || showControls) ? 'opacity-100' : 'opacity-0'}`}
            >
              <button
                onClick={togglePlay}
                className="p-5 bg-amber-800/90 text-white rounded-full hover:bg-amber-900 transition-all hover:scale-115 shadow-xl border border-amber-600/30 flex items-center justify-center cursor-pointer"
              >
                {!isPlaying ? <Play className="w-8 h-8 fill-current ml-1" /> : <Pause className="w-8 h-8 fill-current" />}
              </button>
            </div>

            {/* Bottom Status bar overlays */}
            <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between text-white text-xs transition-transform duration-300 ${showControls ? 'translate-y-0' : 'translate-y-full pointer-events-none'}`}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                <span className="font-mono text-stone-300 tracking-wider">LIVE REPLAY</span>
              </div>
              <div className="flex items-center gap-4 text-stone-200">
                <p className="font-sans text-[11px]">
                  {hoverUnmuteSupported ? '🔈 Rê chuột vào để nghe tiếng • Click để xem Fullscreen' : '👉 Click vào video để nghe và xem Fullscreen!'}
                </p>
              </div>
            </div>

            {/* Highlighted Overlay Hints */}
            {showUnmuteHint && isMuted && isPlaying && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-amber-900/90 border border-amber-600/40 text-[#fdfcf7] px-4 py-1.5 rounded-full text-xs font-sans font-bold flex items-center gap-2 shadow-lg backdrop-blur-xs pointer-events-none"
              >
                <VolumeX className="w-3.5 h-3.5 text-amber-200" /> Rê chuột vào hoặc Click để bật tiếng!
              </motion.div>
            )}
          </div>
        </div>

        {/* Action Buttons underneath video */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={googlePhotosUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-800 text-white rounded-xl font-sans text-xs sm:text-sm font-bold shadow-md hover:bg-amber-900 transition-all hover:translate-y-[-2px] hover:shadow-lg cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" /> Xem thước phim trực tiếp trên Google Photos
          </a>

          <button
            onClick={() => setIsConfigOpen(true)}
            className="inline-flex items-center gap-1.5 px-5 py-3 bg-stone-100 border border-stone-200 text-stone-600 rounded-xl font-sans text-xs sm:text-sm font-semibold hover:bg-stone-200/80 hover:text-stone-800 transition cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" /> Thay đổi link video / Cài đặt
          </button>
        </div>

        {/* Explain Google Photos restrictions text */}
        <p className="mt-4 text-center font-sans text-[11px] text-stone-400 italic">
          * Thước phim được phát trực tiếp chất lượng cao từ tệp lưu trữ cục bộ của lớp chúng mình. Bạn cũng có thể xem bản gốc đầy đủ trên Google Photos hoặc cấu hình trong mục Cài đặt.
        </p>

        {/* Admin config Modal */}
        <AnimatePresence>
          {isConfigOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#fdfcf7] border-2 border-stone-300 shadow-2xl rounded-2xl max-w-lg w-full p-6 relative font-sans"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                  <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-amber-800" /> Cấu hình Thước phim Kỷ niệm
                  </h3>
                  <button
                    onClick={() => setIsConfigOpen(false)}
                    className="text-stone-400 hover:text-stone-600 p-1 rounded-full hover:bg-stone-100 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveConfig} className="space-y-4 mt-4">
                  {/* Google Photos URL */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 block">
                      ĐƯỜNG DẪN CHIA SẺ GOOGLE PHOTOS *
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://photos.app.goo.gl/..."
                      value={tempGooglePhotosUrl}
                      onChange={(e) => setTempGooglePhotosUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-xs focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 outline-none"
                    />
                    <span className="text-[10px] text-stone-400 block leading-normal">
                      Nút liên kết "Xem trên Google Photos" sẽ mở đường dẫn này để cả lớp có thể xem bản độ phân giải cao đầy đủ trên Google.
                    </span>
                  </div>

                  {/* Direct MP4 Background Video URL */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 block">
                      LINK VIDEO NỀN TRỰC TIẾP (DIRECT .MP4 LINK) *
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://example.com/video.mp4"
                      value={tempVideoUrl}
                      onChange={(e) => setTempVideoUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-xs focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 outline-none font-mono"
                    />
                    <span className="text-[10px] text-stone-400 block leading-normal">
                      Để trình phát video trực tiếp trên web chạy đúng các hiệu ứng tự động phát, lặp lại và tắt tiếng, bạn cần cung cấp một link kết thúc bằng <code className="font-mono text-amber-800 font-bold">.mp4</code> (Đăng tải lên Discord, Dropbox, Drive trực tiếp hoặc hosting riêng).
                    </span>
                  </div>

                  {/* Admin Password verification */}
                  <div className="space-y-1.5 pt-2 border-t border-stone-200/60">
                    <label className="text-xs font-bold text-stone-700 block">
                      MẬT KHẨU BAN CÁN SỰ ĐỂ XÁC THỰC *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Nhập mật khẩu Ban cán sự"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-xs focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 outline-none"
                    />
                  </div>

                  {/* Error & Success indicators */}
                  {errorMsg && (
                    <div className="text-red-600 text-xs font-medium bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                      ⚠️ {errorMsg}
                    </div>
                  )}

                  {successMsg && (
                    <div className="text-emerald-700 text-xs font-medium bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg">
                      🎉 {successMsg}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setIsConfigOpen(false)}
                      className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Đóng
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer disabled:opacity-55"
                    >
                      {loading ? 'Đang cập nhật...' : 'Cập nhật cấu hình'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
