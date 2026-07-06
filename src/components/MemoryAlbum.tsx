import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { INITIAL_ALBUM } from '../data';
import { AlbumItem } from '../types';
import { Camera, Image, Plus, X, Upload, Check, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';

export default function MemoryAlbum() {
  const [albums, setAlbums] = useState<AlbumItem[]>(INITIAL_ALBUM);
  const [filter, setFilter] = useState<string>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<AlbumItem | null>(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<'classroom' | 'teachers' | 'extracurricular' | 'prom-reunion' | 'candids'>('candids');
  const [description, setDescription] = useState('');
  const [year, setYear] = useState('2011');
  const [submittedBy, setSubmittedBy] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Edit & Delete States for Contributed Photos
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editCategory, setEditCategory] = useState<'classroom' | 'teachers' | 'extracurricular' | 'prom-reunion' | 'candids'>('candids');
  const [editDescription, setEditDescription] = useState('');
  const [editYear, setEditYear] = useState('2011');
  const [editSubmittedBy, setEditSubmittedBy] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState(false);
  const [editPassword, setEditPassword] = useState('');

  // Sync edit state with selected photo
  useEffect(() => {
    if (selectedPhoto) {
      setEditTitle(selectedPhoto.title || '');
      setEditUrl(selectedPhoto.url || '');
      setEditCategory(selectedPhoto.category || 'candids');
      setEditDescription(selectedPhoto.description || '');
      setEditYear(selectedPhoto.year || '2011');
      setEditSubmittedBy(selectedPhoto.submittedBy || '');
      setIsEditing(false);
      setIsDeleting(false);
      setEditError('');
      setEditSuccess(false);
      setEditPassword('');
    } else {
      setIsEditing(false);
      setIsDeleting(false);
      setEditPassword('');
    }
  }, [selectedPhoto]);

  // Load submissions from Firestore
  useEffect(() => {
    const q = query(collection(db, 'album_memories'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbMemories: AlbumItem[] = [];
      snapshot.forEach((doc) => {
        dbMemories.push({ id: doc.id, ...doc.data() } as AlbumItem);
      });
      // Combine predefined albums with user submitted ones
      setAlbums([...INITIAL_ALBUM, ...dbMemories]);
    }, (err) => {
      console.error('Error fetching memories from firestore', err);
    });

    return () => unsubscribe();
  }, []);

  const categories = [
    { id: 'all', name: 'Tất cả' },
    { id: 'classroom', name: 'Lớp Học' },
    { id: 'teachers', name: 'Thầy Cô' },
    { id: 'extracurricular', name: 'Ngoại Khóa' },
    { id: 'prom-reunion', name: 'Kỷ Yếu' },
    { id: 'candids', name: 'Khoảnh Khắc Vui' },
  ];

  const filteredAlbums = filter === 'all'
    ? albums
    : albums.filter(item => item.category === filter);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url || !submittedBy) {
      setError('Vui lòng điền đầy đủ các thông tin chính (Tiêu đề, Link ảnh, Người gửi)!');
      return;
    }

    // Basic URL validation
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setError('Đường dẫn ảnh phải bắt đầu bằng http:// hoặc https:// (Hãy thử dùng Unsplash hoặc các trang up ảnh)');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await addDoc(collection(db, 'album_memories'), {
        type: 'image',
        url,
        category,
        title,
        description,
        year,
        submittedBy,
        createdAt: serverTimestamp()
      });

      setSuccess(true);
      setTitle('');
      setUrl('');
      setDescription('');
      setSubmittedBy('');
      setTimeout(() => {
        setSuccess(false);
        setIsSubmitOpen(false);
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError('Có lỗi xảy ra khi lưu kỷ niệm. Vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPhoto) return;
    if (!editTitle || !editUrl || !editSubmittedBy) {
      setEditError('Vui lòng điền đầy đủ các thông tin chính (Tiêu đề, Link ảnh, Người gửi)!');
      return;
    }

    if (editPassword !== "Abcd@1993") {
      setEditError('Mật khẩu xác thực Ban quản trị không chính xác!');
      return;
    }

    if (!editUrl.startsWith('http://') && !editUrl.startsWith('https://')) {
      setEditError('Đường dẫn ảnh phải bắt đầu bằng http:// hoặc https://');
      return;
    }

    setSubmitting(true);
    setEditError('');

    try {
      const docRef = doc(db, 'album_memories', selectedPhoto.id);
      const updatedData = {
        title: editTitle,
        url: editUrl,
        category: editCategory,
        description: editDescription,
        year: editYear,
        submittedBy: editSubmittedBy,
        updatedAt: serverTimestamp()
      };
      await updateDoc(docRef, updatedData);
      
      // Update local state for lightbox
      setSelectedPhoto({
        ...selectedPhoto,
        ...updatedData
      });
      
      setEditSuccess(true);
      setTimeout(() => {
        setEditSuccess(false);
        setIsEditing(false);
        setEditPassword('');
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setEditError('Có lỗi xảy ra khi cập nhật kỷ niệm. Vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!selectedPhoto) return;
    if (editPassword !== "Abcd@1993") {
      setEditError('Mật khẩu xác thực Ban quản trị không chính xác!');
      return;
    }
    setSubmitting(true);
    setEditError('');
    try {
      const docRef = doc(db, 'album_memories', selectedPhoto.id);
      await deleteDoc(docRef);
      setSelectedPhoto(null); // Close lightbox
    } catch (err: any) {
      console.error(err);
      setEditError('Có lỗi xảy ra khi xóa kỷ niệm. Vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextPhoto = () => {
    if (!selectedPhoto) return;
    const currentIndex = filteredAlbums.findIndex(item => item.id === selectedPhoto.id);
    const nextIndex = (currentIndex + 1) % filteredAlbums.length;
    setSelectedPhoto(filteredAlbums[nextIndex]);
  };

  const handlePrevPhoto = () => {
    if (!selectedPhoto) return;
    const currentIndex = filteredAlbums.findIndex(item => item.id === selectedPhoto.id);
    const prevIndex = (currentIndex - 1 + filteredAlbums.length) % filteredAlbums.length;
    setSelectedPhoto(filteredAlbums[prevIndex]);
  };

  return (
    <section
      id="album"
      className="py-24 px-4 bg-gradient-to-b from-[#fdfcf7] via-[#f9f7f0] to-[#fdfcf7]"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <span className="font-sans text-[11px] tracking-widest text-amber-800 uppercase font-bold bg-amber-800/10 px-3 py-1 rounded-full inline-block">
              Kho lưu trữ kỷ niệm xưa
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900">
              Album Ảnh & Ký Ức Học Đường
            </h2>
            <p className="font-sans text-stone-600 text-sm max-w-xl leading-relaxed">
              Nơi ngưng đọng những thước phim quý giá nhất của niên khóa 2008 - 2011. Bạn có ảnh/video cũ của lớp? Hãy chung tay đóng góp để lưu giữ mãi mãi!
            </p>
          </div>

          <button
            id="btn-contribute-memory"
            onClick={() => setIsSubmitOpen(true)}
            className="flex items-center gap-2 bg-amber-800 hover:bg-amber-900 text-white font-sans text-sm font-semibold px-5 py-3 rounded-full shadow-md transition-all duration-200 self-start md:self-auto transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" /> Đóng góp kỷ niệm
          </button>
        </div>

        {/* Filter Categories */}
        <div className="flex flex-wrap gap-2 mb-10 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              id={`album-filter-${cat.id}`}
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-4 py-2 rounded-full font-sans text-xs md:text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
                filter === cat.id
                  ? 'bg-amber-800 text-[#fdfcf7] shadow-sm'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Grid Photos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredAlbums.map((item, index) => (
              <motion.div
                id={`album-item-${item.id}`}
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                onClick={() => setSelectedPhoto(item)}
                className="group relative bg-[#fdfcf7] border border-stone-200 p-3 rounded-2xl shadow-sm hover:shadow-lg cursor-pointer transition-all duration-300"
              >
                {/* Paper polaroid effect */}
                <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-stone-100">
                  <img
                    src={item.url}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className="text-white text-xs font-medium bg-amber-800/85 px-2.5 py-1 rounded-full">
                      Phóng to ảnh
                    </span>
                  </div>
                </div>

                {/* Info block */}
                <div className="pt-3 pb-1 px-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-display font-bold text-[10px] text-amber-800 uppercase tracking-widest bg-amber-800/10 px-2 py-0.5 rounded-md">
                      {item.year || '2011'}
                    </span>
                    <span className="font-sans text-[11px] text-stone-400 italic">
                      Gửi bởi: {item.submittedBy || 'Ẩn danh'}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-stone-800 text-base line-clamp-1 group-hover:text-amber-800 transition-colors">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="font-sans text-stone-500 text-xs mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty state */}
        {filteredAlbums.length === 0 && (
          <div className="text-center py-16 bg-stone-50 rounded-2xl border border-dashed border-stone-300">
            <Camera className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="font-serif text-lg text-stone-600">Chưa có ảnh nào trong mục này</p>
            <p className="font-sans text-stone-400 text-sm mt-1">Hãy là người đầu tiên tải lên bức ảnh thanh xuân!</p>
          </div>
        )}

        {/* Contribution Modal */}
        <AnimatePresence>
          {isSubmitOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                id="modal-backdrop-memory"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSubmitOpen(false)}
                className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs"
              />

              <motion.div
                id="modal-content-memory"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-[#fdfcf7] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-stone-200 max-h-[90vh] flex flex-col z-10"
              >
                {/* Header */}
                <div className="p-6 border-b border-stone-200 flex justify-between items-center bg-stone-50">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                      <Image className="text-amber-800 w-5 h-5" /> Đóng Góp Kỷ Niệm Của Bạn
                    </h3>
                    <p className="text-stone-500 text-xs font-sans mt-0.5">Lưu bút trực tuyến niên khóa 2008 - 2011</p>
                  </div>
                  <button
                    id="btn-close-memory-modal"
                    onClick={() => setIsSubmitOpen(false)}
                    className="p-1 rounded-full text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                  {error && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-xl border border-red-100 text-xs font-sans">
                      {error}
                    </div>
                  )}

                  {success ? (
                    <div className="bg-emerald-50 text-emerald-800 p-8 rounded-xl border border-emerald-100 text-center space-y-2">
                      <Check className="w-12 h-12 text-emerald-600 mx-auto bg-emerald-100 p-2.5 rounded-full" />
                      <h4 className="font-bold font-serif text-lg">Đóng Góp Thành Công!</h4>
                      <p className="text-sm font-sans">Bức ảnh kỷ niệm quý báu của bạn đã được thêm vào Album chung.</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide">Tên của bạn *</label>
                          <input
                            id="input-memory-submittedBy"
                            type="text"
                            placeholder="Ví dụ: Quốc Khánh (12A1)"
                            value={submittedBy}
                            onChange={(e) => setSubmittedBy(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-800 focus:ring-1 focus:ring-amber-800 font-sans text-sm bg-white"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide">Năm chụp ảnh</label>
                          <select
                            id="select-memory-year"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-800 font-sans text-sm bg-white"
                          >
                            <option value="2008">2008 (Lớp 10)</option>
                            <option value="2009">2009 (Lớp 11)</option>
                            <option value="2010">2010 (Lớp 12)</option>
                            <option value="2011">2011 (Tốt nghiệp)</option>
                            <option value="2026">2026 (Họp lớp)</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide">Chủ đề album *</label>
                        <select
                          id="select-memory-category"
                          value={category}
                          onChange={(e) => setCategory(e.target.value as any)}
                          className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-800 font-sans text-sm bg-white"
                        >
                          <option value="classroom">Lớp Học xưa</option>
                          <option value="teachers">Thầy Cô giáo kính yêu</option>
                          <option value="extracurricular">Hoạt động ngoại khóa / Văn nghệ</option>
                          <option value="prom-reunion">Ảnh Kỷ Yếu tốt nghiệp</option>
                          <option value="candids">Khoảnh khắc ngộ nghĩnh / Vui nhộn</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide">Tiêu đề bức ảnh *</label>
                        <input
                          id="input-memory-title"
                          type="text"
                          placeholder="Ví dụ: Giờ hóa học của thầy Nam"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-800 focus:ring-1 focus:ring-amber-800 font-sans text-sm bg-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide">Đường dẫn hình ảnh (URL) *</label>
                        <input
                          id="input-memory-url"
                          type="text"
                          placeholder="Nhập link ảnh (ví dụ: Unsplash, Imgur, hoặc Facebook link)"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-800 focus:ring-1 focus:ring-amber-800 font-sans text-sm bg-white"
                        />
                        <span className="text-[10px] text-stone-500 block">
                          Mẹo: Bạn có thể sao chép địa chỉ hình ảnh từ Facebook lớp hoặc tải ảnh lên imgur.com và dán liên kết vào đây.
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide">Mô tả câu chuyện</label>
                        <textarea
                          id="input-memory-desc"
                          rows={3}
                          placeholder="Viết một vài dòng chia sẻ về kỷ niệm đáng nhớ trong bức ảnh này..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-800 focus:ring-1 focus:ring-amber-800 font-sans text-sm bg-white resize-none"
                        />
                      </div>

                      <button
                        id="btn-submit-memory"
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-amber-800 hover:bg-amber-900 disabled:bg-amber-800/50 text-white font-sans font-bold text-sm uppercase py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {submitting ? 'Đang tải kỷ niệm...' : 'Tải lên kỷ niệm ngay'}
                      </button>
                    </>
                  )}
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Lightbox / View Photo Details */}
        <AnimatePresence>
          {selectedPhoto && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                id="lightbox-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedPhoto(null)}
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
              />

              {/* Navigation buttons */}
              <button
                id="btn-lightbox-prev"
                onClick={handlePrevPhoto}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-md hidden sm:block transition cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                id="btn-lightbox-next"
                onClick={handleNextPhoto}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-md hidden sm:block transition cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <motion.div
                id="lightbox-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-[#fdfcf7] w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] z-10 border border-stone-800"
              >
                <button
                  id="btn-close-lightbox"
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute right-4 top-4 z-20 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Left: Image Canvas */}
                <div className="flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[300px] md:min-h-0 relative">
                  <img
                    src={selectedPhoto.url}
                    alt={selectedPhoto.title}
                    referrerPolicy="no-referrer"
                    className="max-w-full max-h-[50vh] md:max-h-[80vh] object-contain"
                  />
                </div>

                {/* Right: Metadata Panel */}
                <div className="w-full md:w-80 p-6 flex flex-col justify-between bg-[#fdfcf7] border-t md:border-t-0 md:border-l border-stone-200 overflow-y-auto">
                  {isEditing ? (
                    <form onSubmit={handleUpdatePhoto} className="space-y-4 font-sans text-left flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-serif font-bold text-stone-900 text-sm">Chỉnh Sửa Kỷ Niệm</h4>
                          <span className="text-[10px] font-sans font-bold bg-amber-800/10 text-amber-800 px-2 py-0.5 rounded-full">Sửa</span>
                        </div>
                        
                        {editError && (
                          <div className="bg-red-50 text-red-700 p-2 rounded-lg border border-red-100 text-[10px]">
                            {editError}
                          </div>
                        )}
                        {editSuccess && (
                          <div className="bg-emerald-50 text-emerald-800 p-2 rounded-lg border border-emerald-100 text-[10px] text-center font-semibold animate-pulse">
                            Cập nhật thành công!
                          </div>
                        )}

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wide">Người gửi *</label>
                          <input
                            type="text"
                            value={editSubmittedBy}
                            onChange={(e) => setEditSubmittedBy(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-800 text-xs bg-white"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wide">Tiêu đề *</label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-800 text-xs bg-white"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wide">Đường dẫn ảnh (URL) *</label>
                          <input
                            type="text"
                            value={editUrl}
                            onChange={(e) => setEditUrl(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-800 text-xs bg-white font-mono"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wide">Năm</label>
                            <select
                              value={editYear}
                              onChange={(e) => setEditYear(e.target.value)}
                              className="w-full px-2 py-1.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-800 text-xs bg-white"
                            >
                              <option value="2008">2008</option>
                              <option value="2009">2009</option>
                              <option value="2010">2010</option>
                              <option value="2011">2011</option>
                              <option value="2026">2026</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wide">Chủ đề</label>
                            <select
                              value={editCategory}
                              onChange={(e) => setEditCategory(e.target.value as any)}
                              className="w-full px-2 py-1.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-800 text-xs bg-white"
                            >
                              <option value="classroom">Lớp Học</option>
                              <option value="teachers">Thầy Cô</option>
                              <option value="extracurricular">Ngoại Khóa</option>
                              <option value="prom-reunion">Kỷ Yếu</option>
                              <option value="candids">Khoảnh Khắc</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wide">Mô tả câu chuyện</label>
                          <textarea
                            rows={3}
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-800 text-xs bg-white resize-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-amber-950 uppercase tracking-wide">Mật khẩu xác thực Ban quản trị *</label>
                          <input
                            type="password"
                            placeholder="Nhập mật khẩu..."
                            value={editPassword}
                            onChange={(e) => setEditPassword(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border border-amber-300 focus:outline-none focus:border-amber-800 text-xs bg-white placeholder-stone-400"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="flex-1 bg-amber-800 hover:bg-amber-900 disabled:bg-amber-800/50 text-white font-bold text-xs py-2.5 rounded-xl shadow cursor-pointer transition text-center"
                        >
                          Cập nhật
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold text-xs py-2.5 rounded-xl border border-stone-200 cursor-pointer transition text-center"
                        >
                          Hủy
                        </button>
                      </div>
                    </form>
                  ) : isDeleting ? (
                    <div className="space-y-4 font-sans text-center py-6 flex-1 flex flex-col justify-center">
                      <Trash2 className="w-12 h-12 text-red-600 mx-auto bg-red-50 p-2.5 rounded-full border border-red-100" />
                      <div>
                        <h4 className="font-serif font-bold text-stone-900 text-base">Xóa Kỷ Niệm Này?</h4>
                        <p className="text-stone-500 text-xs leading-relaxed mt-1">Hành động này sẽ xóa vĩnh viễn bức ảnh khỏi album lớp và không thể hoàn tác.</p>
                      </div>

                      {editError && (
                        <div className="bg-red-50 text-red-700 p-2 rounded-lg border border-red-100 text-[10px] text-left">
                          {editError}
                        </div>
                      )}

                      <div className="space-y-1 text-left">
                        <label className="block text-[10px] font-bold text-amber-950 uppercase tracking-wide">Mật khẩu xác thực Ban quản trị *</label>
                        <input
                          type="password"
                          placeholder="Nhập mật khẩu..."
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-amber-300 focus:outline-none focus:border-amber-800 text-xs bg-white placeholder-stone-400"
                          required
                        />
                      </div>
                      
                      <div className="flex gap-2 pt-4">
                        <button
                          onClick={handleDeletePhoto}
                          disabled={submitting}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 rounded-xl shadow cursor-pointer transition"
                        >
                          Đồng ý xóa
                        </button>
                        <button
                          onClick={() => {
                            setIsDeleting(false);
                            setEditError('');
                            setEditPassword('');
                          }}
                          className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold text-xs py-2.5 rounded-xl border border-stone-200 cursor-pointer transition"
                        >
                          Hủy bỏ
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="font-display font-bold text-xs text-[#fdfcf7] bg-amber-800 px-3 py-1 rounded-full">
                            Năm {selectedPhoto.year || '2011'}
                          </span>
                          <span className="font-sans text-xs text-stone-500 font-medium uppercase tracking-wide">
                            {selectedPhoto.category === 'classroom' && 'Lớp Học'}
                            {selectedPhoto.category === 'teachers' && 'Thầy Cô'}
                            {selectedPhoto.category === 'extracurricular' && 'Ngoại Khóa'}
                            {selectedPhoto.category === 'prom-reunion' && 'Kỷ Yếu'}
                            {selectedPhoto.category === 'candids' && 'Khoảnh Khắc Vui'}
                          </span>
                        </div>

                        <h3 className="font-serif text-xl font-bold text-stone-900 leading-tight">
                          {selectedPhoto.title}
                        </h3>

                        {selectedPhoto.description && (
                          <p className="font-sans text-stone-600 text-sm leading-relaxed">
                            {selectedPhoto.description}
                          </p>
                        )}
                      </div>

                      <div className="space-y-4 pt-6 border-t border-stone-200 mt-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-800/10 flex items-center justify-center font-serif text-amber-800 font-extrabold text-sm border border-amber-800/15">
                            {selectedPhoto.submittedBy ? selectedPhoto.submittedBy.charAt(0) : 'A'}
                          </div>
                          <div>
                            <p className="text-stone-400 text-[10px] uppercase tracking-wider font-semibold">Người gửi đóng góp</p>
                            <p className="text-stone-800 font-sans text-sm font-semibold">{selectedPhoto.submittedBy || 'Ẩn danh'}</p>
                          </div>
                        </div>

                        {/* Actions for User Submitted Photos */}
                        {!INITIAL_ALBUM.some(item => item.id === selectedPhoto.id) && (
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => setIsEditing(true)}
                              className="flex-1 flex items-center justify-center gap-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs py-2.5 rounded-xl transition border border-stone-200 cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5 text-stone-500" /> Sửa ảnh
                            </button>
                            <button
                              onClick={() => setIsDeleting(true)}
                              className="flex-1 flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs py-2.5 rounded-xl transition border border-red-100 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" /> Xóa ảnh
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
