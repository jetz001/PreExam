import React, { useState, useEffect } from 'react';
import businessApi from '../../services/businessApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pin, Trash2, Edit, Image as ImageIcon, Camera, Upload } from 'lucide-react';
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
    }


    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${path.startsWith('/') ? '' : '/'}${path}`;
    };

    return (
        <div className="p-6">
            {/* Storefront Header Section */}
            <div className="bg-white rounded-xl shadow-sm border mb-8 overflow-hidden">
                {/* Cover Image */}
                <div className="h-48 md:h-64 bg-gray-100 relative group">
                    {business?.cover_image ? (
                        <img src={getImageUrl(business.cover_image)} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ImageIcon size={48} opacity={0.5} />
                            <span className="ml-2">Add Cover Image</span>
                        </div>
                    )}
                    <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <div className="bg-white/90 px-4 py-2 rounded-full flex items-center gap-2 font-medium text-gray-800 shadow-lg">
                            <Camera size={20} /> Change Cover
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'cover_image')} />
                    </label>
                </div>

                {/* Logo & Info */}
                <div className="px-6 pb-6 relative">
                    <div className="flex justify-between items-end -mt-12 mb-4">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-xl bg-white p-1 shadow-md overflow-hidden relative">
                                {business?.logo_image ? (
                                    <img src={getImageUrl(business.logo_image)} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                    <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300">
                                        <ImageIcon size={24} />
                                    </div>
                                )}
                                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                                    <Upload size={16} />
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'logo_image')} />
                                </label>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{business?.name || 'Your Business'}</h2>
                        <p className="text-gray-500">{business?.tagline || 'Add a tagline in Settings'}</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Content Manager</h1>
                <button
                    onClick={() => { resetForm(); setIsCreateModalOpen(true); }}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    <Plus size={18} className="mr-2" />
                    Create Post
                </button>
            </div>

            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <div className="space-y-4">
                    {postsData?.posts?.rows?.map(post => (
                        <div key={post.id} className="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${post.type === 'article' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                        {post.type.toUpperCase()}
                                    </span>
                                    {post.is_pinned && <span className="flex items-center text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded"><Pin size={12} className="mr-1" /> Pinned</span>}
                                    <span className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</span>
                                </div>
                                <h3 className="font-bold text-lg text-gray-800">{post.title}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2">{post.content.replace(/<[^>]*>?/gm, '')}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => updateMutation.mutate({
                                        id: post.id,
                                        data: { is_pinned: !post.is_pinned } // Toggle pin status
                                    })}
                                    className={`p-2 rounded-lg transition-colors ${post.is_pinned ? 'text-orange-500 bg-orange-50 hover:bg-orange-100' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
                                    title={post.is_pinned ? "Unpin" : "Pin to top"}
                                >
                                    <Pin size={18} fill={post.is_pinned ? "currentColor" : "none"} />
                                </button>
                                <button onClick={() => handleEditClick(post)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><Edit size={18} /></button>
                            </div>
                        </div>
                    ))}
                    {postsData?.posts?.count === 0 && (
                        <div className="text-center py-10 text-gray-500">
                            No posts yet. Start sharing knowledge!
                        </div>
                    )}
                </div>
            )}

            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">{editingPost ? 'Edit Post' : 'Create New Content'}</h2>
                            <button onClick={() => { setIsCreateModalOpen(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Type</label>
                                <div className="flex gap-4 mt-1">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="type" value="article" checked={newPost.type === 'article'} onChange={e => setNewPost({ ...newPost, type: e.target.value })} />
                                        Article
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="type" value="product" checked={newPost.type === 'product'} onChange={e => setNewPost({ ...newPost, type: e.target.value })} />
                                        Product / Course
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Title</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full border rounded-lg p-2 mt-1"
                                    value={newPost.title}
                                    onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Content</label>
                                <div className="bg-white">
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
                                        className="h-[500px] mb-12"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1 text-right">
                                    {newPost.content.replace(/<[^>]*>/g, '').length} / 5000 chars
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg p-2 mt-1"
                                    placeholder="math, exam67, tips"
                                    value={newPost.tags}
                                    onChange={e => setNewPost({ ...newPost, tags: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="pinned"
                                    checked={newPost.is_pinned}
                                    onChange={e => setNewPost({ ...newPost, is_pinned: e.target.checked })}
                                />
                                <label htmlFor="pinned" className="text-sm font-medium text-gray-700">Pin to top of page</label>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                                <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                    {createMutation.isPending ? 'Publishing...' : 'Publish Post'}
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
