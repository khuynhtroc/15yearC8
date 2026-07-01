import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TRIVIA_QUESTIONS } from '../data';
import { Trophy, ArrowRight, RotateCcw, Check, X, HelpCircle, GraduationCap } from 'lucide-react';

export default function MemoryQuiz() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const handleAnswerSelect = (optionIdx: number) => {
    if (selectedAns !== null) return; // Answer already selected
    setSelectedAns(optionIdx);
    const isCorrect = optionIdx === TRIVIA_QUESTIONS[currentIdx].correctAnswerIndex;
    if (isCorrect) {
      setScore(score + 1);
    }
    setShowExplanation(true);
  };

  const handleNext = () => {
    setSelectedAns(null);
    setShowExplanation(false);
    if (currentIdx + 1 < TRIVIA_QUESTIONS.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setSelectedAns(null);
    setScore(0);
    setShowExplanation(false);
    setIsFinished(false);
  };

  const getRank = (finalScore: number) => {
    if (finalScore === 5) return { title: 'Huyền thoại quậy phá K08-11', desc: 'Bạn chắc chắn là "trùm trường" hoặc thành viên đầu sỏ chuyên bày trò cúp học ăn vặt cổng trường rồi! Ký ức về trường cũ của bạn siêu đỉnh.' };
    if (finalScore >= 3) return { title: 'Học sinh tiên tiến xuất sắc', desc: 'Tuyệt vời! Bạn nhớ rất rõ những chi tiết thân thương thời đi học. Rất mong gặp lại một người bạn tuyệt vời như bạn ở buổi họp lớp sắp tới.' };
    return { title: 'Mọt sách ngoan hiền / Chuyên lo yêu thầm', desc: 'Có vẻ như ngày xưa bạn chỉ mải mê học tập, hoặc mải ngắm nhìn bạn học bàn bên nên quên mất các hoạt động ăn chơi quậy phá rồi! Hãy đến họp lớp để cùng "bù đắp" lại nhé.' };
  };

  const activeQuestion = TRIVIA_QUESTIONS[currentIdx];

  return (
    <section
      id="quiz"
      className="py-24 px-4 bg-gradient-to-b from-[#fdfcf7] to-[#f5f2eb]"
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-3 mb-12">
          <span className="font-sans text-[11px] tracking-widest text-amber-800 uppercase font-bold bg-amber-800/10 px-3 py-1 rounded-full inline-block">
            Kiểm tra mức độ hoài cổ
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900">
            Trắc Nghiệm Ký Ức Học Đường
          </h2>
          <p className="font-sans text-stone-600 text-sm max-w-xl mx-auto leading-relaxed">
            Bạn tự tin mình nhớ được bao nhiêu phần trăm kỷ niệm xưa thời 2008 - 2011? Hãy thử thách bản thân với bộ câu hỏi "nhất quỷ nhì ma" này nhé!
          </p>
        </div>

        {/* Quiz Body Card */}
        <div className="bg-[#FAF9F6] border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
          {/* Top colored decoration */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-700 to-amber-900" />

          <AnimatePresence mode="wait">
            {isFinished ? (
              <motion.div
                id="quiz-finished-panel"
                key="finished"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-8 space-y-6"
              >
                <div className="w-16 h-16 bg-amber-800/10 border border-amber-800/20 text-amber-800 rounded-full flex items-center justify-center mx-auto">
                  <Trophy className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <p className="font-sans text-xs uppercase tracking-wider text-stone-400 font-bold">Kết quả thử thách của bạn</p>
                  <h3 className="font-display font-black text-3xl sm:text-4xl text-amber-900">
                    {score} / {TRIVIA_QUESTIONS.length} Điểm
                  </h3>
                  <div className="border-t border-stone-200 my-4 max-w-sm mx-auto" />
                  <h4 className="font-serif text-lg font-bold text-stone-900">
                    Danh hiệu: {getRank(score).title}
                  </h4>
                  <p className="font-sans text-stone-600 text-sm max-w-md mx-auto leading-relaxed">
                    {getRank(score).desc}
                  </p>
                </div>

                <div className="flex justify-center gap-4 pt-4">
                  <button
                    id="btn-quiz-retry"
                    onClick={handleReset}
                    className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-sans text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-full border border-stone-350 shadow-xs transition"
                  >
                    <RotateCcw className="w-4 h-4" /> Thử lại lần nữa
                  </button>
                  <a
                    id="btn-quiz-rsvp-cta"
                    href="#rsvp"
                    className="flex items-center gap-2 bg-amber-800 hover:bg-amber-900 text-white font-sans text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-full shadow transition"
                  >
                    <GraduationCap className="w-4 h-4" /> Đăng ký đi họp lớp ngay
                  </a>
                </div>
              </motion.div>
            ) : (
              <motion.div
                id="quiz-active-panel"
                key={currentIdx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Progress bar info */}
                <div className="flex items-center justify-between text-xs font-semibold text-stone-500 font-sans uppercase">
                  <span>Câu hỏi {currentIdx + 1} / {TRIVIA_QUESTIONS.length}</span>
                  <span className="text-amber-800">Khóa K08-11</span>
                </div>

                {/* Question title */}
                <h3 className="font-serif text-lg md:text-xl font-bold text-stone-900 leading-snug">
                  {activeQuestion.question}
                </h3>

                {/* Options list */}
                <div className="space-y-3">
                  {activeQuestion.options.map((option, idx) => {
                    const isSelected = selectedAns === idx;
                    const isCorrect = idx === activeQuestion.correctAnswerIndex;
                    const isWrong = isSelected && !isCorrect;

                    let btnStyle = 'bg-white hover:bg-stone-100 border-stone-300 text-stone-800';
                    if (selectedAns !== null) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold';
                      } else if (isWrong) {
                        btnStyle = 'bg-red-50 border-red-400 text-red-800';
                      } else {
                        btnStyle = 'bg-white border-stone-200 text-stone-400 opacity-60';
                      }
                    }

                    return (
                      <button
                        id={`btn-quiz-ans-${idx}`}
                        key={idx}
                        onClick={() => handleAnswerSelect(idx)}
                        disabled={selectedAns !== null}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left font-sans text-sm transition-all ${btnStyle}`}
                      >
                        <div className="flex items-center gap-3 pr-4">
                          <span className="w-6 h-6 rounded-full border border-stone-300 flex items-center justify-center text-xs font-bold text-stone-500 uppercase bg-stone-50 shrink-0">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{option}</span>
                        </div>

                        {/* Result indicators */}
                        {selectedAns !== null && isCorrect && <Check className="w-5 h-5 text-emerald-600 shrink-0" />}
                        {selectedAns !== null && isWrong && <X className="w-5 h-5 text-red-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Block */}
                {showExplanation && (
                  <motion.div
                    id="quiz-explanation-box"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-amber-800/5 rounded-2xl border border-amber-800/10 text-xs text-stone-700 leading-relaxed font-sans space-y-1.5"
                  >
                    <p className="font-bold text-amber-900 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-amber-800" /> Giải thích chi tiết:
                    </p>
                    <p>{activeQuestion.explanation}</p>
                  </motion.div>
                )}

                {/* Next button */}
                {selectedAns !== null && (
                  <div className="flex justify-end pt-2">
                    <button
                      id="btn-quiz-next"
                      onClick={handleNext}
                      className="flex items-center gap-1.5 bg-amber-800 hover:bg-amber-900 text-white font-sans text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-full shadow transition"
                    >
                      {currentIdx + 1 === TRIVIA_QUESTIONS.length ? 'Xem kết quả' : 'Câu tiếp theo'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
