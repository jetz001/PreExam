import React, { useState, useEffect } from 'react';
import businessApi from '../../services/businessApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Plus,
    Pin,
    Edit,
    Image as ImageIcon,
    Camera,
    Upload,
    FileText,
    ShoppingBag,
    X,
    Sparkles,
    Tag,
    Calendar,
    Loader2
} from 'lucide-react';
import { compressImage } from '../../utils/imageUtils';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
// import ImageResize from 'quill-image-resize-module-react';
import toast from 'react-hot-toast';

// Quill.register('modules/imageResize', ImageResize);

const BusinessContentManager = () => {
    const queryClient = useQueryClient();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [business, setBusiness] = useState(null);

    // Fetch Business first to get ID
    // We should ideally have business info in context, but fetching here is safe fallback
    useEffect(() => {
        businessApi.getMyBusiness().then(res => {
            if (res.success) setBusiness(res.business);
        }).catch(() => { });
    }, []);

    const { data: postsData, isLoading } = useQuery({
        queryKey: ['businessPosts', business?.id],
        queryFn: () => businessApi.getPosts({ business_id: business?.id }),
        enabled: !!business?.id
    });

    const createMutation = useMutation({
        mutationFn: businessApi.createPost,
        onSuccess: () => {
            queryClient.invalidateQueries(['businessPosts']);
            setIsCreateModalOpen(false);
            toast.success('Post created successfully!');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to create post')
    });

    const [newPost, setNewPost] = useState({
        title: '',
        content: '',
        type: 'article',
        is_pinned: false,
        tags: '',
        images: [] // File objects
    });

    const [editingPost, setEditingPost] = useState(null);

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => businessApi.updatePost(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['businessPosts']);
            setIsCreateModalOpen(false);
            setEditingPost(null);
            toast.success('Post updated successfully!');
            resetForm();
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to update post')
    });

    const resetForm = () => {
        setNewPost({
            title: '',
            content: '',
            type: 'article',
            is_pinned: false,
            tags: '',
            images: []
        });
        setEditingPost(null);
    };

    const handleCreate = (e) => {
        e.preventDefault();
        if (!business) return;

        // Anti-Spam Validation
        const plainText = newPost.content.replace(/<[^>]*>/g, '');
        if (plainText.length > 5000) {
            toast.error('Content exceeds 5,000 characters limit.');
            return;
        }

        const lineCount = newPost.content.split('</p>').length;
        if (lineCount > 100) {
            toast.error('Content exceeds 100 lines limit.');
            return;
        }

        // Use JSON for now as image support requires proper file handling
        const tagsArray = newPost.tags.split(',').map(t => t.trim()).filter(Boolean);

        const postData = {
            ...newPost,
            business_id: business.id,
            tags: tagsArray
        };

        if (editingPost) {
            updateMutation.mutate({ id: editingPost.id, data: postData });
        } else {
            createMutation.mutate(postData);
        }
    };

    const handleEditClick = (post) => {
        setEditingPost(post);
        setNewPost({
            title: post.title,
            content: post.content,
            type: post.type,
            is_pinned: post.is_pinned,
            tags: Array.isArray(post.tags) ? post.tags.join(', ') : '',
            images: [] // Images handled separately or replaced
        });
        setIsCreateModalOpen(true);
    };

    const handleImageUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        const toastId = toast.loading('Processing image...');
        try {
            // Compress
            const maxWidth = type === 'cover_image' ? 1920 : 800;
            const compressedFile = await compressImage(file, maxWidth, 0.8);

            // Upload
            const formData = new FormData();
            formData.append(type, compressedFile);

            const res = await businessApi.updateBusiness(formData);
            if (res.success) {
                setBusiness(res.business);
                toast.success('Image updated!', { id: toastId });
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to upload image', { id: toastId });
        }
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const posts = postsData?.posts?.rows || [];
    const totalPosts = postsData?.posts?.count ?? posts.length;
    const isSaving = createMutation.isPending || updateMutation.isPending;
    const plainContentLength = newPost.content.replace(/<[^>]*>/g, '').length;

    return (
        <div className="space-y-6 pb-8">
            {/* Storefront Header Section */}
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
                {/* Cover Image */}
                <div className="h-44 sm:h-56 md:h-64 bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 relative group">
                    {business?.cover_image ? (
                        <img
                            src={getImageUrl(business.cover_image)}
                            alt="Cover"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-indigo-200 px-4 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center mb-2 backdrop-blur-md">
                                <ImageIcon size={24} className="text-indigo-200" />
                            </div>
                            <span className="text-sm font-semibold text-white">Add Storefront Cover Image</span>
                            <span className="text-xs text-slate-300 mt-0.5">Recommended 1920 × 480 px</span>
                        </div>
                    )}

                    <label className="absolute inset-0 bg-slate-950/45 flex items-center justify-center opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity cursor-pointer">
                        <span className="bg-white/95 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold text-slate-800 shadow-lg border border-slate-200/80">
                            <Camera size={16} className="text-indigo-600" />
                            <span>Change Cover</span>
                        </span>
                        <input
                            type="file"
                            aria-label="Upload cover image"
                            className="sr-only"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'cover_image')}
                        />
                    </label>

                    <label className="sm:hidden absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-xl bg-slate-950/75 text-white border border-white/20 px-3 py-1.5 text-xs font-semibold backdrop-blur-md cursor-pointer">
                        <Camera size={14} />
                        <span>Cover</span>
                        <input
                            type="file"
                            aria-label="Upload cover image mobile"
                            className="sr-only"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'cover_image')}
                        />
                    </label>
                </div>

                {/* Logo & Info */}
                <div className="px-5 sm:px-7 pb-6 relative">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-10 sm:-mt-12 mb-4">
                        <div className="relative group w-fit">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white p-1.5 shadow-lg border border-slate-200/80 overflow-hidden relative">
                                {business?.logo_image ? (
                                    <img
                                        src={getImageUrl(business.logo_image)}
                                        alt="Logo"
                                        className="w-full h-full object-cover rounded-xl"
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <ImageIcon size={24} />
                                    </div>
                                )}
                                <label className="absolute inset-0 bg-slate-950/55 flex items-center justify-center opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity cursor-pointer text-white rounded-2xl">
                                    <Upload size={18} />
                                    <input
                                        type="file"
                                        aria-label="Upload business logo"
                                        className="sr-only"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, 'logo_image')}
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {business?.category && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 px-3 py-1 text-xs font-semibold text-indigo-700">
                                    <Sparkles size={12} />
                                    <span>{business.category}</span>
                                </span>
                            )}
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200/80 px-3 py-1 text-xs font-semibold text-slate-700">
                                <FileText size={12} className="text-slate-600" />
                                <span>{totalPosts} Posts</span>
                            </span>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                            {business?.name || 'Your Business'}
                        </h2>
                        <p className="text-sm text-slate-600 mt-1">
                            {business?.tagline || 'Add a tagline in Settings'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Section Header & Create Action */}
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                        Sponsor Publishing
                    </p>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                        Content Manager
                    </h1>
                    <p className="text-sm text-slate-600 mt-0.5">
                        จัดการบทความ คอร์สเรียน และสินค้าบนหน้าเพจของคุณ
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => { resetForm(); setIsCreateModalOpen(true); }}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shrink-0"
                >
                    <Plus size={18} />
                    <span>Create Post</span>
                </button>
            </div>

            {/* Content List */}
            {isLoading ? (
                <div className="space-y-4" role="status" aria-label="Loading posts">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="h-28 rounded-2xl bg-white border border-slate-200/80 animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {posts.map(post => (
                        <div
                            key={post.id}
                            className="rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-200/80 p-5 transition-all flex flex-col sm:flex-row justify-between items-start gap-4"
                        >
                            <div className="min-w-0 flex-1 space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                                        post.type === 'article'
                                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200/80'
                                            : 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                                    }`}>
                                        {post.type === 'article' ? <FileText size={12} /> : <ShoppingBag size={12} />}
                                        <span>{post.type.toUpperCase()}</span>
                                    </span>

                                    {post.is_pinned && (
                                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full">
                                            <Pin size={12} />
                                            <span>Pinned</span>
                                        </span>
                                    )}

                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                                        <Calendar size={12} />
                                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                    </span>
                                </div>

                                <h3 className="font-bold text-lg text-slate-900 leading-snug">
                                    {post.title}
                                </h3>
                                <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                                    {post.content.replace(/<[^>]*>?/gm, '')}
                                </p>

                                {Array.isArray(post.tags) && post.tags.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                        {post.tags.map((tag, idx) => (
                                            <span
                                                key={idx}
                                                className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                                            >
                                                <Tag size={10} />
                                                <span>{tag}</span>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
                                <button
                                    type="button"
                                    onClick={() => updateMutation.mutate({
                                        id: post.id,
                                        data: { is_pinned: !post.is_pinned } // Toggle pin status
                                    })}
                                    className={`p-2.5 rounded-xl border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                                        post.is_pinned
                                            ? 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100'
                                            : 'text-slate-600 bg-white border-slate-200 hover:bg-slate-50 hover:text-indigo-600'
                                    }`}
                                    title={post.is_pinned ? 'Unpin' : 'Pin to top'}
                                    aria-label={post.is_pinned ? 'Unpin post' : 'Pin post to top'}
                                >
                                    <Pin size={18} fill={post.is_pinned ? 'currentColor' : 'none'} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleEditClick(post)}
                                    className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                    title="Edit Post"
                                    aria-label="Edit post"
                                >
                                    <Edit size={18} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {(postsData?.posts?.count === 0 || posts.length === 0) && (
                        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm p-10 text-center">
                            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
                                <FileText size={24} />
                            </div>
                            <h3 className="text-base font-bold text-slate-900">No posts yet</h3>
                            <p className="text-sm text-slate-600 mt-1">
                                Start sharing knowledge, exam guides, or featured courses!
                            </p>
                            <button
                                type="button"
                                onClick={() => { resetForm(); setIsCreateModalOpen(true); }}
                                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-sm font-semibold text-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                <Plus size={16} />
                                <span>Create First Post</span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Create / Edit Modal */}
            {isCreateModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-3 sm:p-6"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="content-modal-title"
                >
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
                        <div className="flex justify-between items-center px-5 sm:px-6 py-4 border-b border-slate-200/80 bg-slate-50/80">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                                    Content Editor
                                </p>
                                <h2 id="content-modal-title" className="text-lg sm:text-xl font-extrabold text-slate-900">
                                    {editingPost ? 'Edit Post' : 'Create New Content'}
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => { setIsCreateModalOpen(false); resetForm(); }}
                                aria-label="Close modal"
                                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
                            <div>
                                <span className="block text-sm font-semibold text-slate-700 mb-2">Type</span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <label className={`flex items-center gap-3 rounded-xl border p-3.5 cursor-pointer transition-all ${
                                        newPost.type === 'article'
                                            ? 'border-indigo-500 bg-indigo-50/70 text-indigo-900'
                                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                    }`}>
                                        <input
                                            type="radio"
                                            name="type"
                                            value="article"
                                            checked={newPost.type === 'article'}
                                            onChange={e => setNewPost({ ...newPost, type: e.target.value })}
                                            className="accent-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500"
                                        />
                                        <FileText size={18} className="text-indigo-600" />
                                        <span className="text-sm font-semibold">Article</span>
                                    </label>
                                    <label className={`flex items-center gap-3 rounded-xl border p-3.5 cursor-pointer transition-all ${
                                        newPost.type === 'product'
                                            ? 'border-indigo-500 bg-indigo-50/70 text-indigo-900'
                                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                    }`}>
                                        <input
                                            type="radio"
                                            name="type"
                                            value="product"
                                            checked={newPost.type === 'product'}
                                            onChange={e => setNewPost({ ...newPost, type: e.target.value })}
                                            className="accent-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500"
                                        />
                                        <ShoppingBag size={18} className="text-emerald-600" />
                                        <span className="text-sm font-semibold">Product / Course</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="post-title" className="block text-sm font-semibold text-slate-700 mb-1.5">
                                    Title
                                </label>
                                <input
                                    id="post-title"
                                    required
                                    type="text"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all"
                                    placeholder="Enter a clear, engaging headline..."
                                    value={newPost.title}
                                    onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                    Content
                                </label>
                                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                    <ReactQuill
                                        theme="snow"
                                        value={newPost.content}
                                        onChange={(content) => setNewPost({ ...newPost, content })}
                                        modules={{
                                            toolbar: [
                                                ['bold', 'italic', 'underline', 'strike'],
                                                [{ 'header': [1, 2, 3, false] }],
                                                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                [{ 'align': [] }],
                                                ['link', 'image'],
                                                ['clean']
                                            ]
                                            /*,
                                            imageResize: {
                                                parchment: Quill.import('parchment'),
                                                modules: ['Resize', 'DisplaySize']
                                            }
                                            */
                                        }}
                                        className="bg-white"
                                    />
                                </div>
                                <p className={`text-xs mt-1.5 text-right font-medium ${plainContentLength > 5000 ? 'text-rose-600' : 'text-slate-500'}`}>
                                    {plainContentLength} / 5000 chars
                                </p>
                            </div>

                            <div>
                                <label htmlFor="post-tags" className="block text-sm font-semibold text-slate-700 mb-1.5">
                                    Tags (comma separated)
                                </label>
                                <input
                                    id="post-tags"
                                    type="text"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all"
                                    placeholder="math, exam67, tips"
                                    value={newPost.tags}
                                    onChange={e => setNewPost({ ...newPost, tags: e.target.value })}
                                />
                            </div>

                            <label
                                htmlFor="pinned"
                                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    id="pinned"
                                    checked={newPost.is_pinned}
                                    onChange={e => setNewPost({ ...newPost, is_pinned: e.target.checked })}
                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 accent-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500"
                                />
                                <span className="text-sm font-semibold text-slate-700">Pin to top of page</span>
                            </label>

                            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-slate-200/80">
                                <button
                                    type="button"
                                    onClick={() => { setIsCreateModalOpen(false); resetForm(); }}
                                    className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all"
                                >
                                    {isSaving && <Loader2 size={16} className="animate-spin" />}
                                    <span>
                                        {isSaving
                                            ? (editingPost ? 'Saving...' : 'Publishing...')
                                            : (editingPost ? 'Save Changes' : 'Publish Post')}
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessContentManager;
