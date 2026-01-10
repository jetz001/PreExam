import { useNavigate, useLocation } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { Check, ChevronRight, Layout, Image as ImageIcon, DollarSign, Rocket, AlertCircle, Eye, Building2 } from 'lucide-react';
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
            navigate('/business/dashboard');
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
            <h2 className="text-xl font-bold text-gray-800">Where should your ad appear?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* In-Feed Option */}
                <div
                    onClick={() => setFormData({ ...formData, placement: 'in-feed' })}
                    className={`cursor-pointer border-2 rounded-xl p-6 transition-all ${formData.placement === 'in-feed' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                >
                    <div className="h-40 bg-gray-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden relative">
                        {/* Mock Feed UI */}
                        <div className="absolute inset-0 bg-white p-2">
                            <div className="flex items-center space-x-2 mb-2">
                                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                                <div className="h-3 w-20 bg-gray-300 rounded"></div>
                            </div>
                            <div className="h-20 bg-gray-100 rounded mb-2 w-full"></div>
                        </div>
                        <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center">
                            <Layout className="text-blue-600 w-12 h-12" />
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-gray-900">In-Feed (Native)</h3>
                            <p className="text-sm text-gray-500">Appears naturally within the news feed.</p>
                        </div>
                        {formData.placement === 'in-feed' && <Check className="text-blue-600" />}
                    </div>
                </div>

                {/* Result Page Option */}
                <div
                    onClick={() => setFormData({ ...formData, placement: 'result-page' })}
                    className={`cursor-pointer border-2 rounded-xl p-6 transition-all ${formData.placement === 'result-page' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                >
                    <div className="h-40 bg-gray-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden relative">
                        {/* Mock Result UI */}
                        <div className="absolute inset-0 bg-white p-2">
                            <div className="h-4 w-full bg-gray-100 mb-2"></div>
                            <div className="h-24 bg-blue-50 border-2 border-blue-100 border-dashed rounded flex items-center justify-center">
                                <span className="text-xs text-blue-400">Your Ad Here</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-gray-900">Exam Result Page</h3>
                            <p className="text-sm text-gray-500">High attention placement after exams.</p>
                        </div>
                        {formData.placement === 'result-page' && <Check className="text-blue-600" />}
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mt-6">
                <div className="flex items-center text-blue-800 font-semibold mb-2">
                    <Eye size={18} className="mr-2" /> Estimate Reach
                </div>
                <p className="text-gray-600 text-sm mb-4">
                    Based on generic CPM of ฿{CPM}, your budget will determine reach.
                </p>
            </div>
        </div>
    );

    // Step 2: Creative (The most important visual part)
    const renderStep2 = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
            {/* Form */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800">Design your Creative</h2>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                    <input
                        type="text"
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. Summer Sale 2025"
                        value={formData.campaignName}
                        onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name (Display Name)</label>
                    <input
                        type="text"
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="My Brand"
                        value={formData.brandName}
                        onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Destination URL (Link)</label>
                    <input
                        type="url"
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://example.com"
                        value={formData.linkUrl}
                        onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ad Caption / Text</label>
                    <textarea
                        rows={3}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Check out our new products..."
                        value={formData.caption}
                        onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Main Image (16:9)</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 transition-colors bg-gray-50">
                        <div className="space-y-1 text-center">
                            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                    <span>Upload a file</span>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => handleImageUpload(e, 'image')} accept="image/*" />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo (Square)</label>
                    <div className="flex items-center space-x-4">
                        {formData.logo && <img src={formData.logo} alt="Logo" className="w-12 h-12 rounded-full object-cover shadow-sm" />}
                        <input
                            type="file"
                            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            onChange={(e) => handleImageUpload(e, 'logo')}
                            accept="image/*"
                        />
                    </div>
                </div>
            </div>

            {/* Simulator Preview */}
            <div className="bg-gray-100 p-8 rounded-xl flex flex-col items-center justify-center sticky top-6">
                <h3 className="text-gray-500 font-medium mb-4 uppercase tracking-wider text-xs">Ad Preview ({formData.placement})</h3>

                {/* Mobile Preview Frame */}
                {/* Preview Frame */}
                <div className="w-[320px] bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
                    <div className={`flex ${formData.placement === 'result-page' ? 'flex-row h-32' : 'flex-col'}`}>
                        {/* Image Section */}
                        <div className={`${formData.placement === 'result-page' ? 'w-1/3 min-w-[100px]' : 'w-full h-48'} relative bg-gray-100 overflow-hidden group`}>
                            {formData.image ? (
                                <img src={formData.image} className="w-full h-full object-cover" alt="Main Ad" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                    <ImageIcon className="h-8 w-8 mb-1" />
                                    <span className="text-[10px]">Image</span>
                                </div>
                            )}
                            <div className={`absolute top-0 left-0 ${formData.placement === 'result-page' ? 'bg-yellow-400 text-yellow-900' : 'bg-indigo-600 text-white'} text-[10px] font-bold px-1.5 py-0.5 uppercase tracking-wider`}>
                                {formData.placement === 'result-page' ? 'Ad' : 'Promoted'}
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-3 flex-1 flex flex-col justify-center bg-white relative">
                            <div className="flex items-center mb-1">
                                {formData.logo ? (
                                    <img src={formData.logo} className="w-3.5 h-3.5 rounded-full mr-1.5 object-cover" alt="Logo" />
                                ) : (
                                    <div className="w-3.5 h-3.5 rounded-full mr-1.5 bg-gray-200"></div>
                                )}
                                <span className="text-[10px] text-gray-500 font-medium truncate max-w-[100px]">{formData.brandName || 'Brand'}</span>
                            </div>

                            <h4 className="font-bold text-gray-900 text-xs md:text-sm leading-tight mb-1">
                                {formData.campaignName || 'Campaign Title'}
                            </h4>

                            <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">
                                {formData.caption || 'Your ad description text will appear here.'}
                            </p>

                            {/* CTA Mock (only visible in result page usually, but adding for flair) */}
                            {formData.placement === 'result-page' && (
                                <div className="mt-2 text-right">
                                    <span className="inline-block bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                                        Open Link
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <p className="mt-4 text-xs text-gray-500 flex items-center">
                    <AlertCircle size={12} className="mr-1" /> Safety Check: Passed
                </p>
            </div>
        </div>
    );

    // Step 3: Budget
    const renderStep3 = () => (
        <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800">Budget & Launch</h2>
                <p className="text-gray-500">Control how much you spend.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border-2 border-blue-100 shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Campaign Budget (THB)</label>
                <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-2xl">฿</span>
                    </div>
                    <input
                        type="number"
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-8 sm:text-3xl font-bold border-gray-300 rounded-md py-4 text-gray-900"
                        placeholder="0.00"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                    />
                </div>
                <input
                    type="range"
                    min="500"
                    max="50000"
                    step="100"
                    className="w-full mt-4"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                />
            </div>

            <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="font-bold text-blue-900 mb-4 flex items-center">
                    <Rocket size={20} className="mr-2" /> Estimated Results
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-gray-500 text-sm">Estimated Impressions</p>
                        <p className="text-2xl font-bold text-gray-800">~{estimateViews(formData.budget).toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-gray-500 text-sm">Cost Per View (Avg)</p>
                        <p className="text-2xl font-bold text-gray-800">฿{(CPM / 1000).toFixed(3)}</p>
                    </div>
                </div>
                <p className="mt-4 text-sm text-blue-700 opacity-90">
                    *Actual results may vary based on competition and ad quality.
                </p>
            </div>
        </div>
    );

    return (
        <div>
            {/* Progress Bar */}
            <div className="mb-8">
                <nav aria-label="Progress">
                    <ol role="list" className="flex items-center">
                        {steps.map((step, stepIdx) => (
                            <li key={step.name} className={`${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''} relative`}>
                                <div className="flex items-center">
                                    <div className={`${step.id <= currentStep ? 'bg-blue-600' : 'bg-gray-200'} h-10 w-10 rounded-full flex items-center justify-center transition-colors duration-300`}>
                                        <step.icon className={`w-5 h-5 ${step.id <= currentStep ? 'text-white' : 'text-gray-500'}`} />
                                    </div>
                                    <div className="hidden sm:block ml-3">
                                        <p className="text-sm font-medium text-gray-900">{step.name}</p>
                                    </div>
                                    {stepIdx !== steps.length - 1 && (
                                        <div className="hidden sm:block absolute top-0 right-0 h-full w-5 transform translate-x-1/2">
                                            <ChevronRight className="h-full w-5 text-gray-300 ml-6" />
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ol>
                </nav>
            </div>

            {/* Content */}
            <div className="min-h-[500px]">
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
            </div>

            {/* Actions */}
            <div className="mt-8 flex justify-between border-t border-gray-200 pt-6">
                <button
                    type="button"
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    Back
                </button>
                <button
                    type="button"
                    onClick={handleNext}
                    disabled={loading}
                    className={`inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${currentStep === 3 ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50`}
                >
                    {loading ? (isEditMode ? 'Updating...' : 'Launching...') : (currentStep === 3 ? (isEditMode ? 'Update Campaign' : 'Launch Campaign') : 'Next Step')}
                </button>
            </div>
        </div>
    );
};

export default AdCreator;
