import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { GuestbookPost } from '../types';
import { PenTool, MessageCircle, AlertCircle, Heart, Sparkles, BookOpen } from 'lucide-react';

export default function Guestbook() {
  const [posts, setPosts] = useState<GuestbookPost[]>([]);
  
  // Form State
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [classGroup, setClassGroup] = useState('12A1');
  const [selectedTag, setSelectedTag] = useState('Ghế đá hàng me');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Load guestbook posts
  useEffect(() => {
    const q = query(collection(db, 'guestbook'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: GuestbookPost[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as GuestbookPost);
      });
      setPosts(list);
    }, (err) => {
      console.error('Error fetching guestbook from firestore', err);
    });

    return () => unsubscribe();
  }, []);

  const nostalgiaTags = [
    'Ghế đá hàng me', 'Nhà xe phượng vĩ', 'Hộc bàn bí mật', 'Căng tin huyền thoại',
    'Trốn tiết tập thể', 'Sổ đầu bài quyền lực', 'Viết tên lên áo', 'Mực tím học trò',
    'Yêu thầm bàn bên', 'Trà đá cổng trường', 'Hội trại bùng nổ', 'Sao đỏ khó tính'
  ];

  const classGroups = [
    '10A8', '11B8', '12C8', 'Lớp Khác', 'Thầy Cô', 'Khách Quý'
  ];

  // Colorful combinations for random avatars
  const avatarColors = [
    'bg-red-100 text-red-800 border-red-200',
    'bg-amber-100 text-amber-800 border-amber-200',
    'bg-emerald-100 text-emerald-800 border-emerald-200',
    'bg-blue-100 text-blue-800 border-blue-200',
    'bg-purple-100 text-purple-800 border-purple-200',
    'bg-pink-100 text-pink-800 border-pink-200',
    'bg-cyan-100 text-cyan-800 border-cyan-200',
  ];

  const getAvatarStyle = (seed: string) => {
    const index = Math.abs(seed.split('').reduce((acc, curr) => acc + curr.charCodeAt(0), 0)) % avatarColors.length;
    return avatarColors[index];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      setError('Vui lòng nhập Họ tên và lời chúc/lưu bút của bạn!');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await addDoc(collection(db, 'guestbook'), {
        name: name.trim(),
        message: message.trim(),
        classGroup,
        nostalgiaTag: selectedTag,
        avatarSeed: name + classGroup,
        createdAt: serverTimestamp()
      });

      setSuccess(true);
      setMessage('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setError('Có lỗi xảy ra khi gửi lưu bút. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="guestbook"
      className="py-24 px-4 bg-gradient-to-b from-[#fdfcf7] via-[#f7f5ed] to-[#fdfcf7]"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-3 mb-16">
          <span className="font-sans text-[11px] tracking-widest text-amber-800 uppercase font-bold bg-amber-800/10 px-3 py-1 rounded-full inline-block">
            Lưu giữ nét chữ năm xưa
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900">
            Trang Lưu Bút Học Trò 10A8-11B8-12C8
          </h2>
          <p className="font-sans text-stone-600 text-sm max-w-xl mx-auto leading-relaxed">
            Nơi gửi gắm những lời chúc chân tình, những lời xin lỗi hay cảm ơn muộn màng, và những ký ức ngọt ngào từ thời học sinh tinh nghịch. Hãy viết vài dòng để cùng nhau ôn lại nhé!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left panel: Post flow message */}
          <div className="lg:col-span-5 bg-white border border-stone-200 rounded-3xl shadow-lg p-6 sm:p-8 self-start relative">
            {/* Journal style notebook top spiral look */}
            <div className="absolute top-0 left-6 right-6 h-3 bg-stone-200 rounded-t-lg flex justify-between px-4 -translate-y-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="w-2 h-4 bg-stone-400 rounded-full" />
              ))}
            </div>

            <h3 className="font-serif text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
              <PenTool className="w-5 h-5 text-amber-800" /> Viết Lưu Bút Của Bạn
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 font-sans">
              {error && (
                <div className="bg-red-50 text-red-700 p-2.5 rounded-xl border border-red-100 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="bg-emerald-50 text-emerald-800 p-3.5 rounded-xl border border-emerald-100 text-xs text-center font-bold">
                  Lời chúc của bạn đã được đính lên bảng vàng lưu bút!
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-600 uppercase tracking-wider">Họ tên của bạn *</label>
                  <input
                    id="input-guestbook-name"
                    type="text"
                    placeholder="Ví dụ: Hoàng Nam"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-800 text-xs bg-stone-50"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-600 uppercase tracking-wider">Lớp xưa / Danh xưng</label>
                  <select
                    id="select-guestbook-class"
                    value={classGroup}
                    onChange={(e) => setClassGroup(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-800 text-xs bg-stone-50"
                  >
                    {classGroups.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Nostalgia Tag selector */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider block">Gắn liền với từ khóa kỷ niệm</label>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1.5 border border-stone-200 rounded-xl bg-stone-50/50">
                  {nostalgiaTags.map((tag) => (
                    <button
                      id={`btn-tag-${tag}`}
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(tag)}
                      className={`text-left px-2 py-1.5 rounded-lg text-[10px] font-semibold transition ${
                        selectedTag === tag
                          ? 'bg-amber-800 text-[#fdfcf7] shadow-xs'
                          : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200'
                      }`}
                    >
                      # {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider">Nội dung lưu bút *</label>
                <textarea
                  id="input-guestbook-message"
                  rows={4}
                  placeholder="Gửi lời chúc, nhắn nhủ bạn cùng bàn xưa, tâm sự về kỷ niệm phượng vĩ rực trời năm ấy..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-800 text-xs bg-stone-50 resize-none"
                  required
                />
              </div>

              <button
                id="btn-guestbook-submit"
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-amber-800 hover:bg-amber-900 disabled:bg-amber-800/50 text-white font-sans font-bold text-xs uppercase py-3.5 rounded-xl shadow transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                {isSubmitting ? 'Đang gửi chữ viết...' : 'Đăng lên Bảng Lưu Bút'}
              </button>
            </form>
          </div>

          {/* Right panel: Sticky memory board */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="bg-[#f5f2eb]/40 border border-stone-200 rounded-3xl p-6 shadow-inner flex flex-col h-[520px]">
              <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h4 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-800" /> Bảng Gắn Lưu Bút Học Trò
                </h4>
                <span className="text-[10px] font-sans font-bold bg-amber-800/10 text-amber-800 px-2 py-0.5 rounded-full">
                  {posts.length} lời nhắn gửi
                </span>
              </div>

              {/* Scrollable Sticky Notes Board */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto flex-1 pr-1 pb-4">
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <div
                      id={`guestbook-post-${post.id}`}
                      key={post.id}
                      className="bg-[#fdfcf7] border border-stone-200 shadow-xs p-4 rounded-xl flex flex-col justify-between hover:shadow-md transition-all duration-200 relative group overflow-hidden min-h-[140px]"
                    >
                      {/* Top paper tape effect */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-3.5 bg-amber-800/10 border-b border-stone-100 rotate-[-1deg]" />

                      <div className="space-y-2 pt-2">
                        {/* Tag */}
                        {post.nostalgiaTag && (
                          <div className="inline-block text-[10px] font-bold text-amber-800 bg-amber-800/5 px-2 py-0.5 rounded border border-amber-800/10">
                            # {post.nostalgiaTag}
                          </div>
                        )}

                        {/* Content text */}
                        <p className="font-sans text-stone-700 text-xs italic leading-relaxed whitespace-pre-line">
                          "{post.message}"
                        </p>
                      </div>

                      {/* Author detail info */}
                      <div className="pt-3 border-t border-stone-150 mt-4 flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border uppercase flex-shrink-0 ${getAvatarStyle(post.avatarSeed || 'A')}`}>
                          {post.name ? post.name.charAt(0) : 'A'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-stone-800 text-[11px] truncate">{post.name || 'Ẩn danh'}</p>
                          <p className="text-[9px] text-stone-400 font-medium">Khóa 10A8-11B8-12C8 • Lớp: {post.classGroup || '12C8'}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-1 sm:col-span-2 text-center py-24 text-stone-400">
                    <MessageCircle className="w-10 h-10 mx-auto mb-2 text-stone-300 animate-pulse" />
                    <p className="font-sans text-xs font-semibold">Bảng lưu bút hiện đang trống</p>
                    <p className="font-sans text-[11px] text-stone-400 mt-1">Hãy viết lời chúc đầu tiên để thắp sáng ký ức lớp xưa!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
