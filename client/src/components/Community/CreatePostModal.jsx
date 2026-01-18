import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { X, Image as ImageIcon, Video, BarChart2, Plus, Trash2 } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

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
            const token = localStorage.getItem('token');
            const res = await axios.post('/api/community/threads', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            return res.data;
        },
        onSuccess: (newThread) => {
            queryClient.invalidateQueries(['threads']);
            onClose();
        },
        onError: (error) => {
            alert(error.response?.data?.error || "Failed to create post");
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
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('category', category);
        if (backgroundStyle) {
            formData.append('background_style', backgroundStyle);
        }

        // Anti-Spam Validation
        if (content.length > 5000) {
            toast.error('Content exceeds 5,000 characters limit.');
            return;
        }

        const lineCount = content.split('\n').length;
        if (lineCount > 100) {
            toast.error('Content exceeds 100 lines limit.');
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center bg-indigo-600 text-white flex-shrink-0">
                    <h2 className="text-lg font-bold">สร้างกระทู้ใหม่</h2>
                    <button onClick={onClose} className="hover:bg-indigo-700 p-1 rounded-full"><X size={20} /></button>
                </div>

                <div className="overflow-y-auto p-4 flex-grow">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="text"
                            placeholder={isPoll ? "คำถามโหวต..." : "หัวข้อกระทู้..."}
                            className="w-full text-lg font-bold border-b border-gray-200 focus:outline-none focus:border-indigo-500 py-2 text-gray-900 placeholder-gray-400"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            maxLength={100}
                        />

                        {!isPoll && (
                            <div className={`relative w-full transition-all duration-300 ${backgroundStyle ? `${BACKGROUND_OPTIONS.find(b => b.id === backgroundStyle)?.class} p-8 rounded-lg min-h-[250px] flex items-center justify-center text-center` : ''}`}>
                                <textarea
                                    placeholder={backgroundStyle ? "พิมพ์ข้อความของคุณ..." : "มีอะไรอยากแชร์ไหม?..."}
                                    className={`w-full resize-none border-none focus:ring-0 bg-transparent ${backgroundStyle
                                        ? 'text-white text-2xl font-bold placeholder-white/70 text-center h-auto overflow-hidden'
                                        : 'text-gray-900 placeholder-gray-400 h-32'
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
                            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                                <label className="text-sm font-semibold text-gray-700">ตัวเลือกโหวต</label>
                                {pollOptions.map((opt, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder={`ตัวเลือก ${index + 1}`}
                                            className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900 placeholder-gray-400"
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
                                        className="text-sm text-indigo-600 font-semibold flex items-center hover:text-indigo-800"
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

                <div className="p-4 border-t bg-gray-50 flex-shrink-0">
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
                                className={`p-2 rounded-full transition-colors ${mediaType === 'image' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-200 text-gray-600'}`}
                                title="เพิ่มรูปภาพ"
                            >
                                <ImageIcon size={24} />
                            </button>

                            <button
                                type="button"
                                onClick={() => videoInputRef.current.click()}
                                className={`p-2 rounded-full transition-colors ${mediaType === 'video' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-200 text-gray-600'}`}
                                title="เพิ่มวิดีโอ"
                            >
                                <Video size={24} />
                            </button>

                            <button
                                type="button"
                                onClick={() => { setIsPoll(!isPoll); setMedia(null); setMediaType(null); setPreview(null); setBackgroundStyle(null); }}
                                className={`p-2 rounded-full transition-colors ${isPoll ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-200 text-gray-600'}`}
                            >
                                <BarChart2 size={24} />
                            </button>

                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="bg-white border rounded-full px-3 py-1 text-sm text-gray-700 outline-none shadow-sm"
                            >
                                <option value="general">ทั่วไป</option>
                                <option value="exam_news">ข่าวสอบ</option>
                                <option value="qa_help">ถามตอบ</option>
                                <option value="relax">ห้องนั่งเล่น</option>
                            </select>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={mutation.isPending}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-200"
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
