import React, { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import imageCompression from 'browser-image-compression';
import {
    X,
    Image as ImageIcon,
    Video,
    BarChart2,
    Plus,
    Trash2,
    Sparkles,
    Send,
} from 'lucide-react';
import toast from 'react-hot-toast';
import communityService from '../../services/communityService';
import api from '../../services/api';

const BACKGROUND_OPTIONS = [
    { id: 'none', class: 'bg-white', label: 'ปกติ' },
    { id: 'c1', class: 'bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500', label: 'ม่วง' },
    { id: 'c2', class: 'bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500', label: 'ส้ม' },
    { id: 'c3', class: 'bg-gradient-to-br from-blue-400 via-cyan-500 to-teal-400', label: 'ฟ้า' },
    { id: 'c4', class: 'bg-gradient-to-br from-green-400 to-emerald-600', label: 'เขียว' },
    { id: 'c5', class: 'bg-gradient-to-br from-slate-900 to-slate-700', label: 'ดำ' },
];

const CreatePostModal = ({ onClose, initialImage, ...props }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('general');
    const [media, setMedia] = useState(null);
    const [mediaType, setMediaType] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isPoll, setIsPoll] = useState(false);
    const [pollOptions, setPollOptions] = useState(['', '']);
    const [backgroundStyle, setBackgroundStyle] = useState(null);

    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose?.();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    useEffect(() => {
        if (backgroundStyle && textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [content, backgroundStyle]);

    useEffect(() => {
        if (initialImage) {
            setMedia(initialImage);
            setMediaType('image');
            setPreview(URL.createObjectURL(initialImage));
        }

        if (props.initialTitle) setTitle(props.initialTitle);
        if (props.initialContent) setContent(props.initialContent);
        if (props.initialCategory) setCategory(props.initialCategory);
    }, [initialImage, props.initialTitle, props.initialContent, props.initialCategory]);

    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (formData) => {
            return await communityService.createThread(formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['threads'] });
            toast.success('สร้างกระทู้เรียบร้อยแล้ว');
            onClose();
        },
        onError: (error) => {
            console.error('Create thread error:', error);
            toast.error(error.response?.data?.error || error.message || 'ไม่สามารถสร้างโพสต์ได้');
        },
    });

    const handleFileChange = (e, type) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 500 * 1024 * 1024) {
                toast.error('ไฟล์มีขนาดใหญ่เกิน 500MB');
                return;
            }
            setMedia(file);
            setPreview(URL.createObjectURL(file));
            setMediaType(type);
            setIsPoll(false);
            setBackgroundStyle(null);
        }
    };

    const handleAddOption = () => {
        if (pollOptions.length < 5) {
            setPollOptions([...pollOptions, '']);
        }
    };

    const handleRemoveOption = (index) => {
        if (pollOptions.length > 2) {
            const newOptions = [...pollOptions];
            newOptions.splice(index, 1);
            setPollOptions(newOptions);
        }
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...pollOptions];
        newOptions[index] = value;
        setPollOptions(newOptions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            toast.error('กรุณากรอกหัวข้อกระทู้');
            return;
        }
        if (!isPoll && !content.trim() && !media && !backgroundStyle) {
            toast.error('กรุณากรอกเนื้อหา หรือเลือกรูปภาพ/วิดีโอ');
            return;
        }

        const payload = {
            title,
            content,
            category,
            background_style: backgroundStyle,
            tags: [],
        };

        if (content.length > 5000) {
            toast.error('เนื้อหายาวเกิน 5,000 ตัวอักษร');
            return;
        }

        const lineCount = content.split('\n').length;
        if (lineCount > 100) {
            toast.error('เนื้อหามีจำนวนบรรทัดเกิน 100 บรรทัด');
            return;
        }

        if (media) {
            try {
                let fileToUpload = media;
                if (media.type.startsWith('image/')) {
                    const options = {
                        maxSizeMB: 0.5,
                        maxWidthOrHeight: 1024,
                        useWebWorker: true,
                    };
                    fileToUpload = await imageCompression(media, options);
                }

                const formData = new FormData();
                formData.append('file', fileToUpload);

                const { data } = await api.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                if (data && data.url) {
                    payload.image_url = data.url;
                } else {
                    throw new Error('Upload failed, no URL returned.');
                }
            } catch (err) {
                console.error('Media upload error', err);
                toast.error('ไม่สามารถอัปโหลดไฟล์สื่อได้');
                return;
            }
        }

        if (isPoll) {
            const validOptions = pollOptions.filter((opt) => opt.trim() !== '');
            if (validOptions.length < 2) {
                toast.error('โพลต้องมีอย่างน้อย 2 ตัวเลือก');
                return;
            }
            payload.poll = {
                question: title,
                options: validOptions,
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            };
        }

        try {
            mutation.mutate(payload);
        } catch (err) {
            console.error('Mutation failed synchronously:', err);
            toast.error('เกิดข้อผิดพลาด: ' + err.message);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-post-modal-title"
            onClick={onClose}
        >
            <div
                className="bg-gradient-to-b from-[#2b105c]/95 to-[#1b093e]/95 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col text-white"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 sm:px-5 border-b border-white/15 flex justify-between items-center flex-shrink-0">
                    <h2
                        id="create-post-modal-title"
                        className="text-lg sm:text-xl font-black text-white flex items-center gap-2.5"
                    >
                        <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-300/30 to-amber-500/30 border border-amber-300/45 text-[#fde047] inline-flex items-center justify-center">
                            <Sparkles size={18} />
                        </span>
                        <span>สร้างกระทู้ใหม่</span>
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="ปิดหน้าต่าง"
                        className="hover:bg-white/15 p-2 rounded-xl text-white/80 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcc00]"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto p-4 sm:p-5 flex-grow custom-scrollbar">
                    <form id="create-post-form" onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="text"
                            placeholder={isPoll ? 'หัวข้อคำถามโหวต...' : 'หัวข้อกระทู้...'}
                            className="w-full text-base sm:text-lg font-bold border-b border-white/20 focus:outline-none focus:border-[#fde047] py-2 bg-transparent text-white placeholder-white/55 transition-colors"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            maxLength={100}
                        />

                        {!isPoll && (
                            <div
                                className={`relative w-full transition-all duration-300 ${
                                    backgroundStyle
                                        ? `${BACKGROUND_OPTIONS.find((b) => b.id === backgroundStyle)?.class} p-6 sm:p-8 rounded-2xl min-h-[220px] flex items-center justify-center text-center border border-white/20`
                                        : 'bg-white/5 border border-white/15 rounded-2xl p-3.5'
                                }`}
                            >
                                <textarea
                                    ref={textareaRef}
                                    placeholder={backgroundStyle ? 'พิมพ์ข้อความของคุณ...' : 'มีเรื่องราวหรือแนวข้อสอบอยากแชร์ไหม?...'}
                                    className={`w-full resize-none border-none focus:outline-none bg-transparent ${
                                        backgroundStyle
                                            ? 'text-white text-xl sm:text-2xl font-bold placeholder-white/75 text-center h-auto overflow-hidden'
                                            : 'text-white placeholder-white/55 text-sm sm:text-base h-32'
                                    }`}
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    required={!isPoll}
                                    maxLength={5000}
                                    rows={backgroundStyle ? 1 : 4}
                                    onInput={(e) => {
                                        if (backgroundStyle) {
                                            e.target.style.height = 'auto';
                                            e.target.style.height = e.target.scrollHeight + 'px';
                                        }
                                    }}
                                />
                            </div>
                        )}

                        {!isPoll && !media && (
                            <div className="flex items-center gap-2 pb-1 overflow-x-auto">
                                <span className="text-xs font-bold text-white/70 flex-shrink-0">พื้นหลัง:</span>
                                {BACKGROUND_OPTIONS.map((bg) => (
                                    <button
                                        key={bg.id}
                                        type="button"
                                        onClick={() =>
                                            setBackgroundStyle(bg.id === 'none' || bg.id === backgroundStyle ? null : bg.id)
                                        }
                                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcc00] ${bg.class} ${
                                            backgroundStyle === bg.id
                                                ? 'border-[#fde047] scale-110 ring-2 ring-[#fde047]/50'
                                                : 'border-white/30'
                                        }`}
                                        title={bg.label}
                                        aria-label={`พื้นหลังสี${bg.label}`}
                                    />
                                ))}
                            </div>
                        )}

                        {preview && (
                            <div className="relative rounded-2xl overflow-hidden bg-black/50 border border-white/15">
                                {mediaType === 'video' ? (
                                    <video src={preview} controls className="w-full max-h-64 object-contain" />
                                ) : (
                                    <img src={preview} alt="ตัวอย่างสื่อที่แนบ" className="w-full max-h-64 object-contain" />
                                )}

                                <button
                                    type="button"
                                    aria-label="ลบสื่อที่แนบ"
                                    onClick={() => {
                                        setMedia(null);
                                        setMediaType(null);
                                        setPreview(null);
                                    }}
                                    className="absolute top-2.5 right-2.5 bg-slate-950/75 text-white p-1.5 rounded-full hover:bg-rose-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        {isPoll && (
                            <div className="space-y-3 bg-white/10 border border-white/15 p-4 rounded-2xl">
                                <label className="text-sm font-bold text-emerald-300 flex items-center gap-1.5">
                                    <BarChart2 size={16} />
                                    <span>ตัวเลือกโหวต</span>
                                </label>
                                {pollOptions.map((opt, index) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <input
                                            type="text"
                                            placeholder={`ตัวเลือก ${index + 1}`}
                                            className="flex-1 min-w-0 px-3.5 py-2 border border-white/20 rounded-xl bg-black/25 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none text-white placeholder-white/50 text-sm transition-all"
                                            value={opt}
                                            onChange={(e) => handleOptionChange(index, e.target.value)}
                                            required
                                        />
                                        {pollOptions.length > 2 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveOption(index)}
                                                aria-label={`ลบตัวเลือกที่ ${index + 1}`}
                                                className="p-2 rounded-xl text-white/70 hover:text-rose-300 hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                                            >
                                                <Trash2 size={17} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {pollOptions.length < 5 && (
                                    <button
                                        type="button"
                                        onClick={handleAddOption}
                                        className="text-sm text-emerald-300 font-bold inline-flex items-center gap-1 hover:text-[#fde047] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcc00] rounded-lg px-2 py-1"
                                    >
                                        <Plus size={16} />
                                        <span>เพิ่มตัวเลือก</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </form>
                </div>

                <div className="p-4 sm:px-5 border-t border-white/15 bg-black/25 flex-shrink-0 rounded-b-3xl">
                    <div className="flex flex-wrap justify-between items-center gap-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={imageInputRef}
                                onChange={(e) => handleFileChange(e, 'image')}
                                disabled={isPoll}
                            />
                            <input
                                type="file"
                                accept="video/mp4,video/webm"
                                className="hidden"
                                ref={videoInputRef}
                                onChange={(e) => handleFileChange(e, 'video')}
                                disabled={isPoll}
                            />

                            <button
                                type="button"
                                onClick={() => imageInputRef.current?.click()}
                                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcc00] ${
                                    mediaType === 'image'
                                        ? 'bg-[#ffcc00] text-[#1a0533] shadow-md'
                                        : 'bg-white/10 text-white/90 hover:bg-white/20 border border-white/15'
                                }`}
                                title="เพิ่มรูปภาพ"
                                aria-label="เพิ่มรูปภาพ"
                            >
                                <ImageIcon size={17} />
                                <span className="hidden sm:inline">รูปภาพ</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => videoInputRef.current?.click()}
                                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcc00] ${
                                    mediaType === 'video'
                                        ? 'bg-pink-500 text-white shadow-md'
                                        : 'bg-white/10 text-white/90 hover:bg-white/20 border border-white/15'
                                }`}
                                title="เพิ่มวิดีโอ"
                                aria-label="เพิ่มวิดีโอ"
                            >
                                <Video size={17} />
                                <span className="hidden sm:inline">วิดีโอ</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setIsPoll(!isPoll);
                                    setMedia(null);
                                    setMediaType(null);
                                    setPreview(null);
                                    setBackgroundStyle(null);
                                }}
                                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcc00] ${
                                    isPoll
                                        ? 'bg-emerald-400 text-[#1a0533] shadow-md'
                                        : 'bg-white/10 text-white/90 hover:bg-white/20 border border-white/15'
                                }`}
                                title="สร้างโพล"
                                aria-label="สร้างโพล"
                            >
                                <BarChart2 size={17} />
                                <span className="hidden sm:inline">โพล</span>
                            </button>

                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                aria-label="เลือกหมวดหมู่กระทู้"
                                className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-white outline-none focus:border-[#fde047] focus-visible:ring-2 focus-visible:ring-[#ffcc00] cursor-pointer"
                            >
                                <option value="general" className="text-slate-900">ทั่วไป</option>
                                <option value="exam_news" className="text-slate-900">ข่าวสอบ</option>
                                <option value="qa_help" className="text-slate-900">ถามตอบ</option>
                                <option value="relax" className="text-slate-900">ห้องนั่งเล่น</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            form="create-post-form"
                            disabled={mutation.isPending}
                            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#fde047] via-[#ffcc00] to-[#f59e0b] text-[#1a0533] px-5 py-2.5 rounded-xl font-black text-sm hover:brightness-105 disabled:opacity-50 transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ml-auto"
                        >
                            <Send size={15} />
                            <span>{mutation.isPending ? 'กำลังโพสต์...' : 'โพสต์เลย'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePostModal;
