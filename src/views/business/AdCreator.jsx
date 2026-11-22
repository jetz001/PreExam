import { useNavigate, useLocation } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import {
    Check,
    ChevronRight,
    Layout,
    Image as ImageIcon,
    DollarSign,
    Rocket,
    AlertCircle,
    Eye,
    Megaphone,
    Upload,
    Sparkles,
    ArrowLeft,
    Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import adsApi from '../../services/adsApi';

const steps = [
    { id: 1, name: 'Select Placement', icon: Layout },
    { id: 2, name: 'Creative Design', icon: ImageIcon },
    { id: 3, name: 'Budget & Schedule', icon: DollarSign },
];

const AdCreator = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const editModeAd = location.state?.ad;
    const isEditMode = !!editModeAd;
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        placement: 'in-feed', // 'in-feed' | 'result-page'
        campaignName: '',
        caption: '',
        image: null, // preview url (base64)
        imageFile: null, // Actual file object for upload
        logo: null,  // preview url
        brandName: '',
        linkUrl: '',
        budget: 1000,
        startDate: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        if (editModeAd) {
            setFormData(prev => ({
                ...prev,
                placement: editModeAd.placement === 'result' ? 'result-page' : 'in-feed',
                campaignName: editModeAd.title,
                caption: editModeAd.description,
                image: editModeAd.image_url || editModeAd.image,
                linkUrl: editModeAd.link_url || editModeAd.url, // Handle both raw and mapped names
                budget: editModeAd.budget_total || editModeAd.budget,
                // Brand Name not in raw ad, leave as is or fetch?
            }));
        }
    }, [editModeAd]);

    // Constants
    const CPM = 45; // Cost Per Mille (1000 views)

    const estimateViews = (budget) => {
        return Math.floor((budget / CPM) * 1000);
    };

    const handleNext = () => {
        if (currentStep < 3) setCurrentStep(c => c + 1);
        else handleLaunch();
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(c => c - 1);
    };

    const handleLaunch = async () => {
        // Validation
        if (!formData.campaignName || !formData.linkUrl) {
            toast.error('Please fill in Campaign Name and Destination URL');
            return;
        }

        setLoading(true);
        try {
            let finalImageUrl = null;

            // 1. Upload Image if exists
            if (formData.imageFile) {
                const uploadRes = await adsApi.uploadImage(formData.imageFile);
                if (uploadRes.success) {
                    finalImageUrl = uploadRes.imageUrl;
                }
            }

            // 2. Map Frontend Fields to Backend Model (Ad.js)
            const payload = {
                title: formData.campaignName,
                description: formData.caption,
                link_url: formData.linkUrl,
                placement: formData.placement === 'result-page' ? 'result' : 'feed',
                budget_total: formData.budget,
                image_url: finalImageUrl,
                status: 'active'
            };

            if (isEditMode) {
                await adsApi.updateAd(editModeAd.id, payload);
                toast.success('Campaign Updated Successfully!');
            } else {
                await adsApi.createAd(payload);
                toast.success('Campaign Launched Successfully!');
            }
            navigate('/business/content');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to launch campaign');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            // Save file object for upload
            if (field === 'image') {
                setFormData(prev => ({ ...prev, imageFile: file }));
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, [field]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    // --- Render Steps ---

    // Step 1: Placement
    const renderStep1 = () => (
        <div className="space-y-6 animate-fadeIn">
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm p-5 sm:p-6">
                <div className="mb-5">
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                        Where should your ad appear?
                    </h2>
                    <p className="text-sm text-slate-600 mt-1">
                        Choose the placement that aligns best with your campaign objective.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* In-Feed Option */}
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, placement: 'in-feed' })}
                        className={`text-left cursor-pointer border-2 rounded-2xl p-5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                            formData.placement === 'in-feed'
                                ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                                : 'border-slate-200 bg-white hover:border-indigo-300'
                        }`}
                    >
                        <div className="h-40 bg-slate-100 rounded-xl mb-4 flex items-center justify-center overflow-hidden relative border border-slate-200/80">
                            {/* Mock Feed UI */}
                            <div className="absolute inset-0 bg-white p-3">
                                <div className="flex items-center space-x-2 mb-2.5">
                                    <div className="w-7 h-7 bg-slate-200 rounded-full" />
                                    <div className="h-2.5 w-24 bg-slate-200 rounded" />
                                </div>
                                <div className="h-20 bg-slate-100 rounded-lg mb-2 w-full" />
                                <div className="h-2.5 w-2/3 bg-slate-100 rounded" />
                            </div>
                            <div className="absolute inset-0 bg-indigo-600/10 flex items-center justify-center">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25">
                                    <Layout className="w-6 h-6" />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-start gap-3">
                            <div>
                                <h3 className="font-bold text-slate-900">In-Feed (Native)</h3>
                                <p className="text-sm text-slate-600 mt-0.5">
                                    Appears naturally within the community & learning feed.
                                </p>
                            </div>
                            <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-colors ${
                                    formData.placement === 'in-feed'
                                        ? 'bg-indigo-600 border-indigo-600 text-white'
                                        : 'border-slate-300 bg-white text-transparent'
                                }`}
                            >
                                <Check size={14} />
                            </span>
                        </div>
                    </button>

                    {/* Result Page Option */}
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, placement: 'result-page' })}
                        className={`text-left cursor-pointer border-2 rounded-2xl p-5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                            formData.placement === 'result-page'
                                ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                                : 'border-slate-200 bg-white hover:border-indigo-300'
                        }`}
                    >
                        <div className="h-40 bg-slate-100 rounded-xl mb-4 flex items-center justify-center overflow-hidden relative border border-slate-200/80">
                            {/* Mock Result UI */}
                            <div className="absolute inset-0 bg-white p-3">
                                <div className="h-4 w-full bg-slate-100 rounded mb-2.5" />
                                <div className="h-24 bg-indigo-50 border-2 border-indigo-200 border-dashed rounded-xl flex items-center justify-center">
                                    <span className="text-xs font-semibold text-indigo-700">Your Ad Here</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-start gap-3">
                            <div>
                                <h3 className="font-bold text-slate-900">Exam Result Page</h3>
                                <p className="text-sm text-slate-600 mt-0.5">
                                    High-attention placement right after exam completion.
                                </p>
                            </div>
                            <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-colors ${
                                    formData.placement === 'result-page'
                                        ? 'bg-indigo-600 border-indigo-600 text-white'
                                        : 'border-slate-300 bg-white text-transparent'
                                }`}
                            >
                                <Check size={14} />
                            </span>
                        </div>
                    </button>
                </div>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm p-5 sm:p-6 flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
                    <Eye size={20} />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-900">Estimate Reach</h3>
                    <p className="text-sm text-slate-600 mt-0.5">
                        Based on a standard CPM of <span className="font-semibold text-indigo-700">฿{CPM}</span> per 1,000 views, your budget directly scales your reach across PreExam learners.
                    </p>
                </div>
            </div>
        </div>
    );

    // Step 2: Creative (The most important visual part)
    const renderStep2 = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
            {/* Form */}
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm p-5 sm:p-6 space-y-5">
                <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                        Design your Creative
                    </h2>
                    <p className="text-sm text-slate-600 mt-0.5">
                        Craft clear messaging and visuals for your target audience.
                    </p>
                </div>

                <div>
                    <label htmlFor="ad-campaign-name" className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Campaign Name
                    </label>
                    <input
                        id="ad-campaign-name"
                        type="text"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 shadow-sm focus:border-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all"
                        placeholder="e.g. Summer Sale 2025"
                        value={formData.campaignName}
                        onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
                    />
                </div>

                <div>
                    <label htmlFor="ad-brand-name" className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Brand Name (Display Name)
                    </label>
                    <input
                        id="ad-brand-name"
                        type="text"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 shadow-sm focus:border-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all"
                        placeholder="My Brand"
                        value={formData.brandName}
                        onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                    />
                </div>

                <div>
                    <label htmlFor="ad-link-url" className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Destination URL (Link)
                    </label>
                    <input
                        id="ad-link-url"
                        type="url"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 shadow-sm focus:border-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all"
                        placeholder="https://example.com"
                        value={formData.linkUrl}
                        onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    />
                </div>

                <div>
                    <label htmlFor="ad-caption" className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Ad Caption / Text
                    </label>
                    <textarea
                        id="ad-caption"
                        rows={3}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 shadow-sm focus:border-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all"
                        placeholder="Check out our new products..."
                        value={formData.caption}
                        onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                    />
                </div>

                <div>
                    <span className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Main Image (16:9)
                    </span>
                    <label
                        htmlFor="file-upload"
                        className="mt-1 flex justify-center px-5 py-6 border-2 border-slate-200 border-dashed rounded-2xl hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors bg-slate-50 cursor-pointer focus-within:ring-2 focus-within:ring-indigo-500"
                    >
                        <div className="space-y-1.5 text-center">
                            <div className="mx-auto w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                                <Upload size={20} />
                            </div>
                            <div className="flex flex-wrap justify-center text-sm text-slate-600 gap-1">
                                <span className="font-semibold text-indigo-600">Upload a file</span>
                                <span>or drag and drop</span>
                            </div>
                            <p className="text-xs text-slate-500">PNG, JPG, GIF up to 5MB</p>
                            <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                className="sr-only"
                                onChange={(e) => handleImageUpload(e, 'image')}
                                accept="image/*"
                            />
                        </div>
                    </label>
                </div>

                <div>
                    <label htmlFor="ad-logo-upload" className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Logo (Square)
                    </label>
                    <div className="flex flex-wrap items-center gap-3">
                        {formData.logo && (
                            <img
                                src={formData.logo}
                                alt="Logo"
                                className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm"
                            />
                        )}
                        <input
                            id="ad-logo-upload"
                            type="file"
                            className="w-full sm:w-auto text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl"
                            onChange={(e) => handleImageUpload(e, 'logo')}
                            accept="image/*"
                        />
                    </div>
                </div>
            </div>

            {/* Simulator Preview */}
            <div className="rounded-2xl bg-slate-100/90 border border-slate-200/80 p-5 sm:p-8 flex flex-col items-center justify-center lg:sticky lg:top-6 h-fit">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600 mb-5 shadow-xs">
                    <Eye size={13} className="text-indigo-600" />
                    <span>Ad Preview ({formData.placement})</span>
                </div>

                {/* Preview Frame */}
                <div className="w-full max-w-[320px] bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200/90">
                    <div className={`flex ${formData.placement === 'result-page' ? 'flex-row h-32' : 'flex-col'}`}>
                        {/* Image Section */}
                        <div className={`${formData.placement === 'result-page' ? 'w-1/3 min-w-[96px]' : 'w-full h-44'} relative bg-slate-100 overflow-hidden group`}>
                            {formData.image ? (
                                <img src={formData.image} className="w-full h-full object-cover" alt="Main Ad" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                                    <ImageIcon className="h-7 w-7 mb-1" />
                                    <span className="text-[11px] font-medium">Image</span>
                                </div>
                            )}
                            <div
                                className={`absolute top-2 left-2 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                    formData.placement === 'result-page'
                                        ? 'bg-amber-400 text-slate-950'
                                        : 'bg-indigo-600 text-white'
                                }`}
                            >
                                {formData.placement === 'result-page' ? 'Ad' : 'Promoted'}
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-3.5 flex-1 flex flex-col justify-center bg-white relative min-w-0">
                            <div className="flex items-center mb-1.5">
                                {formData.logo ? (
                                    <img src={formData.logo} className="w-4 h-4 rounded-full mr-1.5 object-cover shrink-0" alt="Logo" />
                                ) : (
                                    <div className="w-4 h-4 rounded-full mr-1.5 bg-indigo-100 shrink-0" />
                                )}
                                <span className="text-[11px] text-slate-600 font-semibold truncate">
                                    {formData.brandName || 'Brand'}
                                </span>
                            </div>

                            <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight mb-1 truncate">
                                {formData.campaignName || 'Campaign Title'}
                            </h4>

                            <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                                {formData.caption || 'Your ad description text will appear here.'}
                            </p>

                            {/* CTA Mock (only visible in result page usually, but adding for flair) */}
                            {formData.placement === 'result-page' && (
                                <div className="mt-2 text-right">
                                    <span className="inline-block bg-indigo-600 text-white text-[10px] px-2.5 py-0.5 rounded-full font-semibold">
                                        Open Link
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <p className="mt-4 text-xs font-medium text-slate-600 flex items-center gap-1.5">
                    <AlertCircle size={14} className="text-emerald-600" />
                    <span>Safety Check: Passed</span>
                </p>
            </div>
        </div>
    );

    // Step 3: Budget
    const renderStep3 = () => (
        <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm p-6 sm:p-7">
                <div className="mb-6 text-center">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                        Budget & Launch
                    </h2>
                    <p className="text-sm text-slate-600 mt-1">
                        Set your total campaign budget and review estimated performance.
                    </p>
                </div>

                <label htmlFor="ad-budget-input" className="block text-sm font-semibold text-slate-700 mb-2">
                    Total Campaign Budget (THB)
                </label>
                <div className="relative rounded-xl">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-slate-600 text-xl sm:text-2xl font-bold">฿</span>
                    </div>
                    <input
                        id="ad-budget-input"
                        type="number"
                        className="block w-full pl-10 pr-4 py-3.5 text-2xl sm:text-3xl font-extrabold border border-slate-200 rounded-xl text-slate-900 bg-slate-50/70 focus:bg-white focus:border-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all"
                        placeholder="0.00"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                    />
                </div>

                <div className="mt-5">
                    <input
                        type="range"
                        aria-label="Campaign budget slider"
                        min="500"
                        max="50000"
                        step="100"
                        className="w-full accent-indigo-600 cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                    />
                    <div className="flex justify-between text-xs font-medium text-slate-500 mt-1.5">
                        <span>฿500</span>
                        <span>฿25,000</span>
                        <span>฿50,000</span>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 p-6 sm:p-7 text-white shadow-xl border border-indigo-500/20 relative overflow-hidden">
                <div className="pointer-events-none absolute -top-16 -right-12 h-44 w-44 rounded-full bg-indigo-500/25 blur-3xl" />
                <div className="relative z-10">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-base">
                        <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
                            <Rocket size={16} className="text-amber-300" />
                        </div>
                        <span>Estimated Results</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="rounded-xl bg-white/10 border border-white/15 backdrop-blur-md p-4">
                            <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider">
                                Estimated Impressions
                            </p>
                            <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                                ~{estimateViews(formData.budget).toLocaleString()}
                            </p>
                        </div>
                        <div className="rounded-xl bg-white/10 border border-white/15 backdrop-blur-md p-4">
                            <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider">
                                Cost Per View (Avg)
                            </p>
                            <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                                ฿{(CPM / 1000).toFixed(3)}
                            </p>
                        </div>
                    </div>

                    <p className="mt-4 text-xs text-slate-200">
                        *Actual results may vary based on competition and ad quality.
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 pb-8">
            {/* Executive Header */}
            <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 p-5 sm:p-7 text-white shadow-xl border border-indigo-500/20 relative overflow-hidden">
                <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-indigo-500/25 blur-3xl" />
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-white/20 shrink-0">
                            <Megaphone size={22} />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-indigo-200">
                                <Sparkles size={12} className="text-amber-300" />
                                <span>Sponsor Ads Studio</span>
                            </div>
                            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                                {isEditMode ? 'Edit Ad Campaign' : 'Create Ad Campaign'}
                            </h1>
                        </div>
                    </div>
                    <span className="self-start sm:self-center inline-flex items-center rounded-full bg-white/10 border border-white/15 px-3.5 py-1.5 text-xs font-semibold text-slate-100 backdrop-blur-md">
                        Step {currentStep} of {steps.length}
                    </span>
                </div>
            </div>

            {/* Progress Stepper */}
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm p-4 sm:p-5">
                <nav aria-label="Progress">
                    <ol role="list" className="grid grid-cols-3 gap-2 sm:gap-4">
                        {steps.map((step, stepIdx) => {
                            const isActive = step.id === currentStep;
                            const isComplete = step.id < currentStep;
                            return (
                                <li key={step.name} className="relative flex items-center">
                                    <div
                                        className={`w-full flex items-center gap-2.5 sm:gap-3 rounded-xl px-2.5 sm:px-3.5 py-2.5 border transition-all ${
                                            isActive
                                                ? 'border-indigo-200 bg-indigo-50/70'
                                                : isComplete
                                                    ? 'border-emerald-200/80 bg-emerald-50/50'
                                                    : 'border-slate-200/80 bg-slate-50/60'
                                        }`}
                                    >
                                        <div
                                            className={`h-8 w-8 sm:h-9 sm:w-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                                isActive
                                                    ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm'
                                                    : isComplete
                                                        ? 'bg-emerald-600 text-white'
                                                        : 'bg-slate-200 text-slate-600'
                                            }`}
                                        >
                                            {isComplete ? <Check size={16} /> : <step.icon className="w-4 h-4" />}
                                        </div>
                                        <div className="min-w-0 hidden sm:block">
                                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                                Step {step.id}
                                            </p>
                                            <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                                {step.name}
                                            </p>
                                        </div>
                                        <span className="sm:hidden text-[11px] font-bold text-slate-800 truncate">
                                            {step.name.split(' ')[0]}
                                        </span>
                                    </div>
                                    {stepIdx !== steps.length - 1 && (
                                        <ChevronRight className="hidden lg:block h-4 w-4 text-slate-500 ml-2 shrink-0" />
                                    )}
                                </li>
                            );
                        })}
                    </ol>
                </nav>
            </div>

            {/* Content */}
            <div className="min-h-[440px]">
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
            </div>

            {/* Actions */}
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm p-4 sm:p-5 flex justify-between items-center gap-3">
                <button
                    type="button"
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 shadow-xs text-sm font-semibold rounded-xl text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <ArrowLeft size={16} />
                    <span>Back</span>
                </button>
                <button
                    type="button"
                    onClick={handleNext}
                    disabled={loading}
                    className={`inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl shadow-md text-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50 ${
                        currentStep === 3
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/20'
                            : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-500/20'
                    }`}
                >
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    <span>
                        {loading
                            ? (isEditMode ? 'Updating...' : 'Launching...')
                            : (currentStep === 3 ? (isEditMode ? 'Update Campaign' : 'Launch Campaign') : 'Next Step')}
                    </span>
                </button>
            </div>
        </div>
    );
};

export default AdCreator;
