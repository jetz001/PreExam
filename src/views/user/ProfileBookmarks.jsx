import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bookmark,
  FolderOpen,
  MessageSquare,
  FileText,
  ArrowRight,
  Trash2,
  X,
} from 'lucide-react';
import bookmarkService from '../../services/bookmarkService';
import examService from '../../services/examService';
import DOMPurify from 'dompurify';

const ProfileBookmarks = () => {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [loadingQuestion, setLoadingQuestion] = useState(false);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const fetchFn = bookmarkService.getUserBookmarks || bookmarkService.getBookmarks;
      const res = await fetchFn();

      if (res.success && res.data) {
        setBookmarks(res.data);
      } else if (Array.isArray(res)) {
        setBookmarks(res);
      } else if (res.data) {
        setBookmarks(res.data || res);
      }
    } catch (error) {
      console.error('Failed to load bookmarks', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewQuestion = async (questionId) => {
    setLoadingQuestion(true);
    setIsQuestionModalOpen(true);
    try {
      const data = await examService.getQuestionById(questionId);
      setSelectedQuestion(data.data || data);
    } catch (error) {
      console.error('Failed to load question', error);
    } finally {
      setLoadingQuestion(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  useEffect(() => {
    if (!isQuestionModalOpen) return undefined;
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setIsQuestionModalOpen(false);
        setSelectedQuestion(null);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isQuestionModalOpen]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) return;
    try {
      await bookmarkService.removeBookmark(id);
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error('Failed to delete bookmark', err);
      alert('ไม่สามารถลบได้');
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-white/75 font-bold">กำลังโหลดรายการที่บันทึกไว้...</div>
    );
  }

  return (
    <div id="sec-bookmarks">
      <div className="section-title" style={{ marginBottom: '20px', fontSize: '20px' }}>
        <div className="dot" />
        <Bookmark size={20} className="text-amber-300" />
        <span>รายการที่บันทึกไว้</span>
      </div>

      {bookmarks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/25 bg-white/10 p-8 text-center text-white/80 backdrop-blur-md">
          <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-amber-300">
            <FolderOpen size={24} />
          </div>
          <div className="font-black text-white">ยังไม่มีรายการโปรด</div>
          <div className="mt-1 text-sm text-white/70">
            คุณสามารถกดบันทึกกระทู้หรือข้อสอบที่สนใจเก็บไว้ดูภายหลังได้
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3" style={{ animation: 'fadeSlideIn 0.4s both' }}>
          {bookmarks.map((bm, index) => {
            const isThread = bm.target_type === 'thread';
            return (
              <div
                key={bm.id || bm._id || index}
                className="activity-card relative transition-transform duration-200 hover:-translate-y-0.5"
                style={{ padding: '16px' }}
              >
                <div className="flex items-start gap-3">
                  <div className={`act-icon ${isThread ? 'b' : 'y'} mt-0.5`}>
                    {isThread ? <MessageSquare size={18} /> : <FileText size={18} />}
                  </div>

                  <div className="min-w-0 flex-1 pr-10">
                    <div
                      className="font-extrabold text-base text-white mb-1.5"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(bm.title || 'Bookmarked Item'),
                      }}
                    />
                    <div className="flex flex-wrap items-center gap-2.5 text-xs text-white/75">
                      <span
                        className={`rounded-md px-2 py-0.5 font-extrabold ${
                          isThread
                            ? 'bg-indigo-400/20 text-indigo-200 border border-indigo-400/30'
                            : 'bg-amber-400/20 text-amber-200 border border-amber-400/30'
                        }`}
                      >
                        {isThread ? 'กระทู้' : 'ข้อสอบ'}
                      </span>
                      <span>ID: {bm.target_id}</span>
                      {bm.created_at && (
                        <span>บันทึกเมื่อ: {new Date(bm.created_at).toLocaleDateString('th-TH')}</span>
                      )}
                    </div>

                    {isThread && (
                      <button
                        type="button"
                        onClick={() => navigate(`/community?threadId=${bm.target_id}`)}
                        className="btn-outline mt-3"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        <span>ดูโพสต์</span>
                        <ArrowRight size={14} />
                      </button>
                    )}
                    {bm.target_type === 'question' && (
                      <button
                        type="button"
                        onClick={() => handleViewQuestion(bm.target_id)}
                        className="btn-outline mt-3"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        <span>ดูข้อสอบ</span>
                        <ArrowRight size={14} />
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, bm.id)}
                    aria-label="ลบรายการที่บันทึก"
                    title="ลบรายการ"
                    className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-rose-500/15 text-rose-300 transition-colors hover:bg-rose-500/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isQuestionModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bookmark-question-title"
        >
          <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-white/20 bg-[#1d0a42]/95 text-white shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-white/15 px-5 py-4">
              <h3 id="bookmark-question-title" className="text-base font-black">
                รายละเอียดข้อสอบ{' '}
                {selectedQuestion && (
                  <span className="ml-2 text-xs font-semibold text-white/70">
                    (ID: {selectedQuestion.id})
                  </span>
                )}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsQuestionModalOpen(false);
                  setSelectedQuestion(null);
                }}
                aria-label="ปิดหน้าต่างรายละเอียดข้อสอบ"
                className="rounded-xl p-1.5 text-white/75 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              >
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto p-5">
              {loadingQuestion ? (
                <div className="py-10 text-center text-white/75 font-semibold">กำลังโหลดข้อสอบ...</div>
              ) : selectedQuestion ? (
                <div>
                  <div
                    className="mb-5 text-base leading-relaxed text-white"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(selectedQuestion.question_text),
                    }}
                  />
                  <div className="flex flex-col gap-2.5">
                    {[
                      { text: selectedQuestion.choice_a, key: 'A' },
                      { text: selectedQuestion.choice_b, key: 'B' },
                      { text: selectedQuestion.choice_c, key: 'C' },
                      { text: selectedQuestion.choice_d, key: 'D' },
                    ]
                      .filter((c) => c.text)
                      .map((c, i) => {
                        const isCorrect = c.key === selectedQuestion.correct_answer;
                        return (
                          <div
                            key={i}
                            className={`flex gap-3 rounded-xl border px-4 py-3 text-sm ${
                              isCorrect
                                ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-200'
                                : 'border-white/15 bg-white/5 text-white/90'
                            }`}
                          >
                            <span className="font-black">{c.key}.</span>
                            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(c.text) }} />
                          </div>
                        );
                      })}
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center text-white/75 font-semibold">
                  ไม่พบข้อสอบนี้ อาจถูกลบไปแล้ว
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileBookmarks;
