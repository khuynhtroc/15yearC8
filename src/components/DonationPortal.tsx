import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { DonationData } from '../types';
import { Gift, Heart, QrCode, Check, TrendingUp, AlertCircle, Copy, Search, ShieldCheck, Trash2, X } from 'lucide-react';

export default function DonationPortal() {
  const [donations, setDonations] = useState<DonationData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [name, setName] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [classGroup, setClassGroup] = useState('12C8');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Deletion States for Admin
  const [deletingDonation, setDeletingDonation] = useState<DonationData | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Load donations from Firestore
  useEffect(() => {
    const q = query(collection(db, 'donations'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: DonationData[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as DonationData);
      });
      setDonations(list);
    }, (err) => {
      console.error('Error fetching donations from firestore', err);
    });

    return () => unsubscribe();
  }, []);

  // Bank Transfer Information
  const bankDetails = {
    bankName: 'CAKE by VP Bank (Ngân hàng số Cake)',
    accountNumber: '42328502',
    accountName: 'Quỹ chung C8 HàmRồng 2008-2011 của Nguyễn Trọng Huỳnh',
    branch: 'Trụ sở chính',
    syntax: 'Dong Gop Quy C8 [Ho Ten]',
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(bankDetails.accountNumber);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() && !isAnonymous) {
      setError('Vui lòng điền Họ tên hoặc tích chọn Ủng hộ ẩn danh!');
      return;
    }
    const donationAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10);
    if (isNaN(donationAmount) || donationAmount <= 0) {
      setError('Vui lòng nhập số tiền hợp lệ!');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await addDoc(collection(db, 'donations'), {
        name: isAnonymous ? 'Mạnh Thường Quân (Ẩn Danh)' : name,
        amount: donationAmount,
        classGroup: isAnonymous ? 'Ẩn danh' : classGroup,
        message,
        isAnonymous,
        createdAt: serverTimestamp()
      });

      setSuccess(true);
      setName('');
      setAmount('');
      setMessage('');
      setIsAnonymous(false);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      console.error(err);
      setError('Có lỗi xảy ra khi gửi báo cáo ủng hộ. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletingDonation) return;
    if (deletePassword !== "Abcd@1993") {
      setDeleteError("Mật khẩu xác thực Ban quản trị không chính xác!");
      return;
    }

    setIsDeleting(true);
    setDeleteError('');
    try {
      await deleteDoc(doc(db, 'donations', deletingDonation.id!));
      setDeletingDonation(null);
      setDeletePassword('');
    } catch (err) {
      console.error(err);
      setDeleteError("Có lỗi xảy ra khi xóa thông tin. Vui lòng thử lại!");
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculations
  const targetGoal = 50000000; // 50,000,000 VND
  const totalRaised = donations.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const percentage = Math.min(Math.round((totalRaised / targetGoal) * 100), 100);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const filteredDonations = donations.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(term) ||
      (item.classGroup && item.classGroup.toLowerCase().includes(term))
    );
  });

  const fundUsages = [
    { title: 'Quà tri ân Thầy Cô', desc: 'Thăm hỏi, chuẩn bị bó hoa tươi thắm và các phần quà gửi tặng toàn bộ Thầy Cô giáo chủ nhiệm và Thầy Cô bộ môn cũ.' },
    { title: 'Kỷ yếu & Quà lưu niệm', desc: 'In ấn kỷ yếu tập thể và làm bộ quà lưu niệm độc quyền kỷ niệm 15 năm (bình giữ nhiệt, huy hiệu khóa).' },
    { title: 'Quỹ Học Bổng Tri Ân', desc: 'Trích một phần đóng góp làm học bổng trao tặng các em học sinh có hoàn cảnh khó khăn đang học tại trường cũ.' },
    { title: 'Gia tăng trải nghiệm Gala', desc: 'Hỗ trợ chi phí âm thanh, ánh sáng nghệ thuật, trang trí sân khấu, tiệc buffet liên hoan trọn vẹn.' },
  ];

  return (
    <section
      id="donation"
      className="py-24 px-4 bg-gradient-to-b from-[#f5f2eb] to-[#fdfcf7]"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-3 mb-16">
          <span className="font-sans text-[11px] tracking-widest text-amber-800 uppercase font-bold bg-amber-800/10 px-3 py-1 rounded-full inline-block">
            Chung tay xây dựng tập thể vững mạnh
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900">
            Cổng Đóng Góp Quỹ Hội Khóa 2008 - 2011
          </h2>
          <p className="font-sans text-stone-600 text-sm max-w-xl mx-auto leading-relaxed">
            Quỹ hội khóa được thành lập với mục đích tri ân mái trường, giúp đỡ các mảnh đời khó khăn và tạo điều kiện tổ chức một đêm Gala ấm cúng, ý nghĩa nhất.
          </p>
        </div>

        {/* Campaign Progress tracker */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-md mb-12 max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-stone-400 text-xs font-sans uppercase font-bold tracking-wider">Tiến độ quyên góp quỹ lớp</p>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-amber-900 mt-1">
                {formatCurrency(totalRaised)}
              </h3>
            </div>
            <div className="sm:text-right">
              <p className="text-stone-400 text-xs font-sans uppercase font-bold tracking-wider">Mục tiêu hội khóa</p>
              <p className="font-display font-bold text-xl text-stone-700 mt-1">
                {formatCurrency(targetGoal)}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative w-full h-4 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${percentage}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-amber-700 to-amber-900"
            />
          </div>

          <div className="flex justify-between items-center mt-3">
            <span className="font-sans text-xs text-stone-500 font-semibold flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-emerald-600" /> Đạt {percentage}% mục tiêu đặt ra
            </span>
            <span className="font-sans text-xs text-amber-900 font-bold">
              {donations.length} lượt đóng góp vàng
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left panel: Fund Purpose & Bank Info */}
          <div className="lg:col-span-7 space-y-8">
            {/* Fund Usage Items */}
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold text-stone-800">Mục đích sử dụng nguồn quỹ đóng góp:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fundUsages.map((usage, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                    <h4 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2 mb-1.5">
                      <span className="w-5 h-5 bg-amber-800/10 text-amber-800 rounded-full flex items-center justify-center text-xs font-serif font-black">{idx + 1}</span>
                      {usage.title}
                    </h4>
                    <p className="font-sans text-stone-500 text-xs leading-relaxed">{usage.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bank Transfer QR Code box */}
            <div className="bg-[#FAF9F6] border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* QR Image */}
              <div className="md:col-span-4 flex flex-col items-center gap-2 bg-white p-4 rounded-2xl border border-stone-200 shadow-inner">
                <div className="w-32 h-32 bg-stone-50 flex items-center justify-center relative overflow-hidden rounded-lg border border-stone-200">
                  <img
                    src="https://img.vietqr.io/image/cake-42328502-compact2.jpg?accountName=Quy%20chung%20C8%20HamRong%202008-2011%20cua%20Nguyen%20Trong%20Huynh&addInfo=Dong%20Gop%20Quy%20C8"
                    alt="VietQR Chuyển Khoản"
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-[10px] font-sans font-bold text-stone-500 uppercase flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5 text-amber-800" /> Quét mã VietQR
                </span>
                <a
                  id="btn-qr-click"
                  href="https://link.vietqr.io/pay/cake/42328502?addInfo=Dong%20Gop%20Quy%20C8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 w-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-sans font-bold text-[10px] py-1.5 px-2 rounded-lg text-center flex items-center justify-center gap-1 transition border border-stone-200/60"
                >
                  <QrCode className="w-3 h-3" /> Click Chuyển Khoản
                </a>
              </div>

              {/* Bank Details Text */}
              <div className="md:col-span-8 space-y-3.5">
                <h4 className="font-serif font-bold text-stone-900 text-base">Thông Tin Chuyển Khoản</h4>
                
                <div className="space-y-2 text-xs font-sans">
                  <p className="text-stone-600"><strong>Ngân hàng:</strong> {bankDetails.bankName}</p>
                  
                  <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-stone-200">
                    <span className="text-stone-600"><strong>Số tài khoản:</strong> <code className="text-amber-950 font-mono font-bold text-sm bg-amber-550/10 px-1.5 py-0.5 rounded">{bankDetails.accountNumber}</code></span>
                    <button
                      id="btn-copy-account"
                      onClick={handleCopyAccount}
                      className="p-1.5 hover:bg-stone-100 rounded-lg text-amber-800 flex items-center gap-1 cursor-pointer transition"
                    >
                      {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="text-[10px] font-semibold">{copiedText ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                  </div>

                  <p className="text-stone-600"><strong>Chủ tài khoản:</strong> {bankDetails.accountName}</p>
                  <p className="text-stone-600"><strong>Cú pháp chuyển khoản:</strong> <span className="bg-amber-850/5 text-amber-900 font-mono font-bold px-1.5 py-0.5 rounded border border-amber-800/15">{bankDetails.syntax}</span></p>
                </div>

                <div className="pt-2">
                  <a
                    id="btn-direct-transfer"
                    href="https://link.vietqr.io/pay/cake/42328502?addInfo=Dong%20Gop%20Quy%20C8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-amber-800 hover:bg-amber-900 text-white font-sans font-bold text-xs uppercase py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-700/20 text-center"
                  >
                    <QrCode className="w-4 h-4" />
                    Chuyển Khoản Nhanh qua App Ngân Hàng
                  </a>
                </div>

                <div className="flex items-center gap-2 text-stone-500 text-[10px] bg-amber-800/5 p-2 rounded-lg border border-amber-800/10">
                  <ShieldCheck className="w-4 h-4 text-amber-800 flex-shrink-0" />
                  <span>Sự đóng góp sẽ được ban liên lạc đối soát, cập nhật trực tiếp lên bảng vàng hiển thị công khai.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: Report Form & Sponsor board */}
          <div className="lg:col-span-5 space-y-6">
            {/* Report Form */}
            <div className="bg-white border border-stone-200 rounded-3xl shadow-md p-6">
              <h3 className="font-serif text-base font-bold text-stone-900 mb-4 flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-800" /> Báo Cáo Gửi Đóng Góp
              </h3>

              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div
                    id="donation-success-box"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-emerald-50 text-emerald-800 p-5 rounded-2xl border border-emerald-100 text-center space-y-2"
                  >
                    <Check className="w-10 h-10 text-emerald-600 mx-auto bg-emerald-100 p-2.5 rounded-full" />
                    <h4 className="font-bold font-serif text-base">Gửi Báo Cáo Thành Công!</h4>
                    <p className="text-xs font-sans">Cảm ơn tấm lòng vàng của bạn. Ban liên lạc sẽ đối soát giao dịch và duyệt hiển thị lên bảng vàng ngay.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    {error && (
                      <div className="bg-red-50 text-red-700 p-2.5 rounded-xl border border-red-100 text-xs font-sans flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide">Tên nhà hảo tâm *</label>
                      <label className="flex items-center gap-1 text-xs text-stone-500 cursor-pointer">
                        <input
                          id="checkbox-donation-anon"
                          type="checkbox"
                          checked={isAnonymous}
                          onChange={(e) => setIsAnonymous(e.target.checked)}
                          className="rounded text-amber-800 focus:ring-amber-800 w-3.5 h-3.5"
                        />
                        <span>Đóng góp ẩn danh</span>
                      </label>
                    </div>

                    {!isAnonymous && (
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          id="input-donation-name"
                          type="text"
                          placeholder="Họ tên của bạn"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-800 font-sans text-xs bg-stone-50"
                        />
                        <select
                          id="select-donation-class"
                          value={classGroup}
                          onChange={(e) => setClassGroup(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-800 font-sans text-xs bg-stone-50"
                        >
                          <option value="12C8">Lớp 12C8</option>
                          <option value="Thầy Cô">Thầy Cô (Chủ nhiệm/Bộ môn)</option>
                          <option value="Khác">Cựu Học Sinh / Khác</option>
                        </select>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide">Số tiền ủng hộ (VND) *</label>
                      <input
                        id="input-donation-amount"
                        type="text"
                        placeholder="Ví dụ: 1,000,000"
                        value={amount}
                        onChange={(e) => {
                          // Clean non-numeric except commas
                          const clean = e.target.value.replace(/[^0-9]/g, '');
                          if (clean === '') {
                            setAmount('');
                            return;
                          }
                          setAmount(new Intl.NumberFormat('vi-VN').format(parseInt(clean)));
                        }}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-800 font-sans text-sm font-bold text-amber-900 bg-stone-50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide">Lời nhắn gửi vàng</label>
                      <textarea
                        id="input-donation-message"
                        rows={2}
                        placeholder="Để lại lời nhắn tri ân hoặc tâm nguyện..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-800 font-sans text-xs bg-stone-50 resize-none"
                      />
                    </div>

                    <button
                      id="btn-donation-submit"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-amber-800 hover:bg-amber-900 disabled:bg-amber-800/50 text-white font-sans font-bold text-xs uppercase py-3 rounded-xl shadow transition-all flex items-center justify-center gap-1 cursor-pointer animate-pulse"
                    >
                      {isSubmitting ? 'Đang gửi...' : 'Gửi thông tin đối soát'}
                    </button>
                  </form>
                )}
              </AnimatePresence>
            </div>

            {/* Donor board */}
            <div className="bg-white border border-stone-200 rounded-3xl shadow-sm p-6 max-h-[420px] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-red-500" /> Bảng Vàng Vinh Danh
                </h4>
                <span className="text-[10px] font-sans font-bold text-amber-800 bg-amber-800/10 px-2 py-0.5 rounded-full">
                  {donations.length} lượt
                </span>
              </div>

              {/* Search box */}
              <div className="relative mb-3 flex-shrink-0">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                <input
                  id="input-search-donors"
                  type="text"
                  placeholder="Tra cứu nhà hảo tâm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-4 py-1.5 rounded-lg border border-stone-300 focus:outline-none focus:border-amber-800 font-sans text-xs bg-stone-50"
                />
              </div>

              {/* Scrollable grid of sponsors */}
              <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                {filteredDonations.length > 0 ? (
                  filteredDonations.map((item) => (
                    <div
                      id={`donor-row-${item.id}`}
                      key={item.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50 border border-stone-150 text-xs font-sans hover:bg-white transition"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-bold text-stone-800 truncate">{item.name}</p>
                        <p className="text-[10px] text-stone-400 truncate">Lớp: {item.classGroup}</p>
                        {item.message && (
                          <p className="text-[10px] text-stone-500 italic truncate mt-0.5">"{item.message}"</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="font-display font-bold text-amber-800 whitespace-nowrap bg-amber-800/5 px-2 py-1 rounded-md">
                          {formatCurrency(item.amount)}
                        </span>
                        <button
                          onClick={() => {
                            setDeletingDonation(item);
                            setDeletePassword('');
                            setDeleteError('');
                          }}
                          className="p-1 hover:bg-red-50 text-stone-300 hover:text-red-600 rounded transition cursor-pointer"
                          title="Xóa đóng góp"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-stone-400">
                    <p className="font-sans text-xs">Chưa có thông tin vinh danh nào phù hợp</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deletion Dialog for Donation Entry */}
      <AnimatePresence>
        {deletingDonation && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-stone-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative text-left"
            >
              <button
                onClick={() => setDeletingDonation(null)}
                className="absolute right-4 top-4 text-stone-400 hover:text-stone-600 p-1 rounded-full hover:bg-stone-100 transition cursor-pointer flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-4 font-sans">
                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-100">
                  <Trash2 className="w-6 h-6" />
                </div>
                
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-stone-900 text-lg">Xóa Khoản Đóng Góp?</h4>
                  <p className="text-stone-500 text-xs leading-relaxed">
                    Bạn đang yêu cầu xóa thông tin đóng góp của <strong>{deletingDonation.name}</strong> ({formatCurrency(deletingDonation.amount)}).
                  </p>
                </div>

                {deleteError && (
                  <div className="bg-red-50 text-red-700 p-2.5 rounded-xl border border-red-100 text-[11px] text-center">
                    {deleteError}
                  </div>
                )}

                <form onSubmit={handleDeleteDonation} className="space-y-4">
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[10px] font-bold text-amber-950 uppercase tracking-wider">Mật khẩu xác thực Ban quản trị *</label>
                    <input
                      type="password"
                      placeholder="Nhập mật khẩu..."
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-800 text-xs bg-white"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={isDeleting}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white font-bold text-xs py-2.5 rounded-xl transition cursor-pointer shadow"
                    >
                      {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingDonation(null)}
                      className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold text-xs py-2.5 rounded-xl border border-stone-200 transition cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
