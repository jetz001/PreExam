import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { X, Image as ImageIcon, Video, BarChart2, Plus, Trash2 } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';
import communityService from '../../services/communityService';

const CreatePostModal = ({ onClose, initialImage, ...props }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('general');
    const [media, setMedia] = useState(null);
    const [mediaType, setMediaType] = useState(null); // 'image' or 'video'
    const [preview, setPreview] = useState(null);
    const [isPoll, setIsPoll] = useState(false);
    const [pollOptions, setPollOptions] = useState(['', '']);
    const [backgroundStyle, setBackgroundStyle] = useState(null);

    const BACKGROUND_OPTIONS = [
        { id: 'none', class: 'bg-white', label: 'ปกติ' },
        { id: 'c1', class: 'bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500', label: 'ม่วง' },
        { id: 'c2', class: 'bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500', label: 'ส้ม' },
        { id: 'c3', class: 'bg-gradient-to-br from-blue-400 via-cyan-500 to-teal-400', label: 'ฟ้า' },
        { id: 'c4', class: 'bg-gradient-to-br from-green-400 to-emerald-600', label: 'เขียว' },
        { id: 'c5', class: 'bg-gradient-to-br from-slate-900 to-slate-700', label: 'ดำ' },
    ];

    // Separate refs for separate file pickers
    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null);
    const textareaRef = useRef(null);

    // Auto-resize textarea when content or background style changes
    React.useEffect(() => {
        if (backgroundStyle && textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [content, backgroundStyle]);

    // Set initial data if provided
    React.useEffect(() => {
        if (initialImage) {
            setMedia(initialImage);
            setMediaType('image');
            setPreview(URL.createObjectURL(initialImage));
        }

        // Handle Shared Text/Question
        if (props.initialTitle) setTitle(props.initialTitle);
        if (props.initialContent) setContent(props.initialContent);
        if (props.initialCategory) setCategory(props.initialCategory);

    }, [initialImage, props.initialTitle, props.initialContent, props.initialCategory]);

    const queryClient = useQueryClient();
    const socket = useSocket();

    const mutation = useMutation({
        mutationFn: async (formData) => {
            return await communityService.createThread(formData);
        },
        onSuccess: (newThread) => {
            queryClient.invalidateQueries(['threads']);
            onClose();
        },
        onError: (error) => {
            alert(error.response?.data?.error || error.message || "Failed to create post");
        }
    });

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (500MB limit)
            if (file.size > 500 * 1024 * 1024) {
                alert("File is too large. Maximum size is 500MB.");
                return;
            }

            setMedia(file);
            setPreview(URL.createObjectURL(file));
            setMediaType(type);
            setIsPoll(false);
            setBackgroundStyle(null); // Clear background if media is added
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
            alert("กรุณากรอกหัวข้อกระทู้");
            return;
        }
        if (!isPoll && !content.trim() && !media && !backgroundStyle) {
            alert("กรุณากรอกเนื้อหา หรือเลือกรูปภาพ/วิดีโอ");
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('category', category);
        if (backgroundStyle) {
            formData.append('background_style', backgroundStyle);
        }

        // Anti-Spam Validation
        if (content.length > 5000) {
            alert('Content exceeds 5,000 characters limit.');
            return;
        }

        const lineCount = content.split('\n').length;
        if (lineCount > 100) {
            alert('Content exceeds 100 lines limit.');
            return;
        }

        if (media) {
            formData.append('image', media); // Backend expects 'image' field for file, reused for video
        }

        if (isPoll) {
            const validOptions = pollOptions.filter(opt => opt.trim() !== '');
            if (validOptions.length < 2) {
                alert("Poll must have at least 2 options");
                return;
            }
            const pollData = {
                question: title,
                options: validOptions,
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            };
            formData.append('poll', JSON.stringify(pollData));
        }

        mutation.mutate(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1c2438]/70 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] w-full max-w-lg overflow-hidden animate-fade-in max-h-[90vh] flex flex-col text-white">
                <div className="p-4 border-b border-white/10 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-[#ffcc00] flex items-center gap-2" style={{ fontFamily: '"Lilita One", cursive' }}>
                        ✨ สร้างกระทู้ใหม่
                    </h2>
                    <button onClick={onClose} className="hover:bg-white/10 p-1.5 rounded-full transition-colors"><X size={20} /></button>
                </div>

                <div className="overflow-y-auto p-4 flex-grow">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="text"
                            placeholder={isPoll ? "คำถามโหวต..." : "หัวข้อกระทู้..."}
                            className="w-full text-lg font-bold border-b border-white/10 focus:outline-none focus:border-[#06d6a0] py-2 bg-transparent text-white placeholder-white/40 transition-colors"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            maxLength={100}
                        />

                        {!isPoll && (
                            <div className={`relative w-full transition-all duration-300 ${backgroundStyle ? `${BACKGROUND_OPTIONS.find(b => b.id === backgroundStyle)?.class} p-8 rounded-lg min-h-[250px] flex items-center justify-center text-center` : ''}`}>
                                <textarea
                                    ref={textareaRef}
                                    placeholder={backgroundStyle ? "พิมพ์ข้อความของคุณ..." : "มีอะไรอยากแชร์ไหม?..."}
                                    className={`w-full resize-none border-none focus:ring-0 bg-transparent ${backgroundStyle
                                        ? 'text-white text-2xl font-bold placeholder-white/70 text-center h-auto overflow-hidden'
                                        : 'text-white placeholder-white/40 h-32'
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
                            <div className="flex space-x-2 pb-2 overflow-x-auto">
                                {BACKGROUND_OPTIONS.map(bg => (
                                    <button
                                        key={bg.id}
                                        type="button"
                                        onClick={() => setBackgroundStyle(bg.id === 'none' || bg.id === backgroundStyle ? null : bg.id)}
                                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${bg.class} ${backgroundStyle === bg.id ? 'border-gray-900 scale-110 shadow-md' : 'border-transparent'}`}
                                        title={bg.label}
                                    />
                                ))}
                            </div>
                        )}

                        {preview && (
                            <div className="relative">
                                {mediaType === 'video' ? (
                                    <video src={preview} controls className="w-full max-h-64 object-contain rounded-lg bg-black" />
                                ) : (
                                    <img src={preview} alt="Preview" className="w-full max-h-64 object-contain rounded-lg" />
                                )}

                                <button
                                    type="button"
                                    onClick={() => { setMedia(null); setMediaType(null); setPreview(null); }}
                                    className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        {isPoll && (
                            <div className="space-y-3 bg-white/5 border border-white/10 p-4 rounded-2xl">
                                <label className="text-sm font-semibold text-[#06d6a0]">ตัวเลือกโหวต</label>
                                {pollOptions.map((opt, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder={`ตัวเลือก ${index + 1}`}
                                            className="flex-1 px-3 py-2 border border-white/10 rounded-xl bg-black/20 focus:ring-2 focus:ring-[#06d6a0] focus:border-[#06d6a0] outline-none text-white placeholder-white/30 transition-all"
                                            value={opt}
                                            onChange={(e) => handleOptionChange(index, e.target.value)}
                                            required
                                        />
                                        {pollOptions.length > 2 && (
                                            <button type="button" onClick={() => handleRemoveOption(index)} className="text-gray-400 hover:text-red-500">
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {pollOptions.length < 5 && (
                                    <button
                                        type="button"
                                        onClick={handleAddOption}
                                        className="text-sm text-[#06d6a0] font-bold flex items-center hover:text-[#ffcc00] transition-colors"
                                    >
                                        <Plus size={16} className="mr-1" /> เพิ่มตัวเลือก
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="hidden">
                            {/* Hidden submit button to allow Enter key if needed */}
                            <button type="submit"></button>
                        </div>
                    </form>
                </div>

                <div className="p-4 border-t border-white/10 bg-black/20 flex-shrink-0 rounded-b-3xl">
                    <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                            {/* Inputs */}
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

                            {/* Buttons */}
                            <button
                                type="button"
                                onClick={() => imageInputRef.current.click()}
                                className={`flex items-center gap-2 px-3 py-2 rounded-2xl font-bold transition-all ${mediaType === 'image' ? 'bg-[#ffcc00] text-[#1a0533] shadow-[0_4px_0_#c9a000] -translate-y-1' : 'bg-white/5 text-white/80 hover:bg-white/15 hover:-translate-y-1 hover:shadow-[0_4px_0_rgba(255,255,255,0.1)]'}`}
                                title="เพิ่มรูปภาพ"
                            >
                                <span className="text-xl leading-none">🖼️</span> <span className="text-sm hidden sm:inline">รูปภาพ</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => videoInputRef.current.click()}
                                className={`flex items-center gap-2 px-3 py-2 rounded-2xl font-bold transition-all ${mediaType === 'video' ? 'bg-[#f72585] text-white shadow-[0_4px_0_#a80f54] -translate-y-1' : 'bg-white/5 text-white/80 hover:bg-white/15 hover:-translate-y-1 hover:shadow-[0_4px_0_rgba(255,255,255,0.1)]'}`}
                                title="เพิ่มวิดีโอ"
                            >
                                <span className="text-xl leading-none">🎬</span> <span className="text-sm hidden sm:inline">วิดีโอ</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => { setIsPoll(!isPoll); setMedia(null); setMediaType(null); setPreview(null); setBackgroundStyle(null); }}
                                className={`flex items-center gap-2 px-3 py-2 rounded-2xl font-bold transition-all ${isPoll ? 'bg-[#06d6a0] text-[#1a0533] shadow-[0_4px_0_#04966f] -translate-y-1' : 'bg-white/5 text-white/80 hover:bg-white/15 hover:-translate-y-1 hover:shadow-[0_4px_0_rgba(255,255,255,0.1)]'}`}
                                title="สร้างโพล"
                            >
                                <span className="text-xl leading-none">📊</span> <span className="text-sm hidden sm:inline">โพล</span>
                            </button>

                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="bg-black/30 border border-white/20 rounded-full px-3 py-1 text-sm text-white outline-none shadow-sm focus:border-[#ffcc00] appearance-none cursor-pointer"
                                style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                            >
                                <option value="general" className="text-black">ทั่วไป</option>
                                <option value="exam_news" className="text-black">ข่าวสอบ</option>
                                <option value="qa_help" className="text-black">ถามตอบ</option>
                                <option value="relax" className="text-black">ห้องนั่งเล่น</option>
                            </select>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={mutation.isPending}
                            className="bg-[#ffcc00] text-[#1a0533] px-6 py-2 rounded-full font-black hover:-translate-y-1 disabled:opacity-50 transition-all shadow-[0_4px_0_#c9a000] hover:shadow-[0_6px_0_#c9a000] active:translate-y-0 active:shadow-[0_0px_0_#c9a000]"
                            style={{ fontFamily: '"Nunito", sans-serif' }}
                        >
                            {mutation.isPending ? 'กำลังโพสต์...' : 'โพสต์เลย'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePostModal;
