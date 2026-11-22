import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import businessApi from '../../services/businessApi';
import {
    Building2,
    Lock,
    Save,
    Globe,
    MapPin,
    MessageCircle,
    Phone,
    Mail,
    ShieldCheck,
    FileText,
    Upload,
    CheckCircle2,
    AlertCircle,
    Clock,
    User,
    ReceiptText as Receipt,
    Image as ImageIcon,
    Trash2,
    Loader2,
    Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const INPUT_CLASS =
    'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-500 shadow-xs focus:border-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all';

const BusinessSettings = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [isSaving, setIsSaving] = useState(false);
    const [businessInfo, setBusinessInfo] = useState(null);
    const [vFiles, setVFiles] = useState({
        vat20: null,
        certificate: null,
        id_card: null,
        others: []
    });

    const [logoFile, setLogoFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [profileData, setProfileData] = useState({
        page_name: '', // Added for Business Page Name
        page_tagline: '', // Added for Business Page Tagline
        business_name: user?.business_name || '',
        tax_id: user?.tax_id || '',
        website: user?.business_info?.website || '',
        address: user?.business_info?.address || '',
        billing_address: user?.business_info?.billing_address || '', // New
        line_id: user?.business_info?.line_id || '',
        business_email: user?.business_info?.email || '',
        business_phone: user?.business_info?.phone || ''
    });

    const [notifSettings, setNotifSettings] = useState({
        low_balance: user?.business_info?.notifications?.low_balance ?? true, // Default true
        ad_approval: user?.business_info?.notifications?.ad_approval ?? true,
        weekly_report: user?.business_info?.notifications?.weekly_report ?? true
    });

    React.useEffect(() => {
        const fetchBusiness = async () => {
            try {
                const res = await businessApi.getMyBusiness();
                if (res.success) {
                    setBusinessInfo(res.business);
                    setProfileData(prev => ({
                        ...prev,
                        page_name: res.business?.name || '',
                        page_tagline: res.business?.tagline || ''
                    }));
                }
            } catch (err) {
                console.error("Failed to fetch business info", err);
            }
        };
        fetchBusiness();
    }, []);

    const handleChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleNotifChange = (e) => {
        setNotifSettings({ ...notifSettings, [e.target.name]: e.target.checked });
    };

    const handleLogoChange = (e) => {
        if (e.target.files[0]) setLogoFile(e.target.files[0]);
    };
    const handleCoverChange = (e) => {
        if (e.target.files[0]) setCoverFile(e.target.files[0]);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Update User Profile
            const payload = { ...profileData, notification_settings: notifSettings };
            const updated = await userService.updateProfile(payload);
            updateUser(updated.data);

            // Update Business Page Info
            if (businessInfo && businessInfo.id) {
                let logoUrl = null;
                let coverUrl = null;

                if (logoFile) {
                    const res = await businessApi.uploadImage(logoFile);
                    if (res.success) logoUrl = res.url;
                }

                if (coverFile) {
                    const res = await businessApi.uploadImage(coverFile);
                    if (res.success) coverUrl = res.url;
                }

                const bizPayload = {
                    name: profileData.page_name,
                    tagline: profileData.page_tagline,
                };
                // Append only if changed
                if (logoUrl) bizPayload.logo_image = logoUrl;
                if (coverUrl) bizPayload.cover_image = coverUrl;

                await businessApi.updateBusiness(bizPayload);
                setLogoFile(null);
                setCoverFile(null);
            }

            toast.success('Business profile updated');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update business profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (name === 'others') {
            setVFiles(prev => ({ ...prev, others: [...prev.others, ...Array.from(files)] }));
        } else {
            setVFiles(prev => ({ ...prev, [name]: files[0] }));
        }
    };

    const handleVerificationSubmit = async () => {
        if (!vFiles.vat20 && !vFiles.certificate && !vFiles.id_card) {
            return toast.error("Please upload at least one document");
        }

        setIsSaving(true);
        try {
            const formData = new FormData();
            if (vFiles.vat20) formData.append('vat20', vFiles.vat20);
            if (vFiles.certificate) formData.append('certificate', vFiles.certificate);
            if (vFiles.id_card) formData.append('id_card', vFiles.id_card);
            vFiles.others.forEach(file => formData.append('others', file));

            const res = await businessApi.submitVerification(formData);
            if (res.success) {
                toast.success("Verification documents submitted!");
                setBusinessInfo(res.business);
                setActiveTab('verification');
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit verification");
        } finally {
            setIsSaving(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Business Profile', icon: Building2 },
        { id: 'privacy', label: 'Privacy', icon: Lock },
        { id: 'verification', label: 'Verification', icon: ShieldCheck },
    ];

    return (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col lg:flex-row overflow-hidden min-h-[600px]">
            {/* Sidebar */}
            <div className="w-full lg:w-64 bg-slate-50/90 p-4 sm:p-5 border-b lg:border-b-0 lg:border-r border-slate-200/80 shrink-0">
                <div className="mb-4 lg:mb-6 px-1">
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-indigo-600">
                        <Sparkles size={12} />
                        <span>Configuration</span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
                        Business Settings
                    </h2>
                </div>

                <div className="flex lg:flex-col gap-1.5 overflow-x-auto pb-1 lg:pb-0">
                    {tabs.map(tab => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap lg:w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                                    isActive
                                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-xs'
                                        : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent'
                                }`}
                            >
                                <tab.icon size={18} className={isActive ? 'text-indigo-600' : 'text-slate-500'} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-5 sm:p-8 overflow-y-auto">
                {activeTab === 'profile' && (
                    <div className="space-y-8 max-w-2xl">
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-200/80 pb-2.5 mb-4 flex items-center gap-2">
                                <ImageIcon size={18} className="text-indigo-600" />
                                <span>Page Media (R2)</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                                    <label htmlFor="settings-logo-upload" className="block text-sm font-semibold mb-2 text-slate-700">
                                        Logo Image
                                    </label>
                                    <input
                                        id="settings-logo-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoChange}
                                        className="w-full text-xs sm:text-sm text-slate-600 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                    />
                                    {logoFile && (
                                        <p className="text-xs font-semibold text-emerald-700 mt-2 flex items-center gap-1">
                                            <CheckCircle2 size={13} />
                                            <span>Logo selected ({logoFile.name})</span>
                                        </p>
                                    )}
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                                    <label htmlFor="settings-cover-upload" className="block text-sm font-semibold mb-2 text-slate-700">
                                        Cover Image
                                    </label>
                                    <input
                                        id="settings-cover-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleCoverChange}
                                        className="w-full text-xs sm:text-sm text-slate-600 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                    />
                                    {coverFile && (
                                        <p className="text-xs font-semibold text-emerald-700 mt-2 flex items-center gap-1">
                                            <CheckCircle2 size={13} />
                                            <span>Cover selected ({coverFile.name})</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-200/80 pb-2.5 mb-4">
                                Business Page Info
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="page_name" className="block text-sm font-semibold mb-1.5 text-slate-700">
                                        Page Name
                                    </label>
                                    <input
                                        id="page_name"
                                        name="page_name"
                                        value={profileData.page_name}
                                        onChange={handleChange}
                                        className={INPUT_CLASS}
                                        placeholder="Business Page Name"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="page_tagline" className="block text-sm font-semibold mb-1.5 text-slate-700">
                                        Tagline / Short Bio
                                    </label>
                                    <input
                                        id="page_tagline"
                                        name="page_tagline"
                                        value={profileData.page_tagline}
                                        onChange={handleChange}
                                        className={INPUT_CLASS}
                                        placeholder="E.g. The best tutoring center in town"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-200/80 pb-2.5 mb-4">
                                Billing Identity
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="business_name" className="block text-sm font-semibold mb-1.5 text-slate-700">
                                        Company Name (For Tax)
                                    </label>
                                    <input
                                        id="business_name"
                                        name="business_name"
                                        value={profileData.business_name}
                                        onChange={handleChange}
                                        className={INPUT_CLASS}
                                        placeholder="Company Name Co., Ltd."
                                    />
                                </div>
                                <div>
                                    <label htmlFor="tax_id" className="block text-sm font-semibold mb-1.5 text-slate-700">
                                        Tax ID
                                    </label>
                                    <input
                                        id="tax_id"
                                        name="tax_id"
                                        value={profileData.tax_id}
                                        onChange={handleChange}
                                        className={INPUT_CLASS}
                                        placeholder="1234567890123"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-200/80 pb-2.5 mb-4">
                                Contact Info
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="business_email" className="text-sm font-semibold mb-1.5 text-slate-700 flex items-center gap-2">
                                        <Mail size={14} className="text-indigo-600" />
                                        <span>Business Email</span>
                                    </label>
                                    <input
                                        id="business_email"
                                        name="business_email"
                                        value={profileData.business_email}
                                        onChange={handleChange}
                                        className={INPUT_CLASS}
                                        placeholder="contact@company.com"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="business_phone" className="text-sm font-semibold mb-1.5 text-slate-700 flex items-center gap-2">
                                        <Phone size={14} className="text-indigo-600" />
                                        <span>Phone Number</span>
                                    </label>
                                    <input
                                        id="business_phone"
                                        name="business_phone"
                                        value={profileData.business_phone}
                                        onChange={handleChange}
                                        className={INPUT_CLASS}
                                        placeholder="02-123-4567"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="line_id" className="text-sm font-semibold mb-1.5 text-slate-700 flex items-center gap-2">
                                        <MessageCircle size={14} className="text-indigo-600" />
                                        <span>Line ID</span>
                                    </label>
                                    <input
                                        id="line_id"
                                        name="line_id"
                                        value={profileData.line_id}
                                        onChange={handleChange}
                                        className={INPUT_CLASS}
                                        placeholder="@company"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="website" className="text-sm font-semibold mb-1.5 text-slate-700 flex items-center gap-2">
                                        <Globe size={14} className="text-indigo-600" />
                                        <span>Website</span>
                                    </label>
                                    <input
                                        id="website"
                                        name="website"
                                        value={profileData.website}
                                        onChange={handleChange}
                                        className={INPUT_CLASS}
                                        placeholder="https://www.company.com"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-200/80 pb-2.5 mb-4">
                                Location
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="address" className="text-sm font-semibold mb-1.5 text-slate-700 flex items-center gap-2">
                                        <MapPin size={14} className="text-indigo-600" />
                                        <span>Office Address</span>
                                    </label>
                                    <textarea
                                        id="address"
                                        name="address"
                                        value={profileData.address}
                                        onChange={handleChange}
                                        rows={3}
                                        className={INPUT_CLASS}
                                        placeholder="123 Sukhumvit Road, Bangkok..."
                                    />
                                </div>
                                <div>
                                    <label htmlFor="billing_address" className="text-sm font-semibold mb-1 text-slate-700 flex items-center gap-2">
                                        <Receipt size={14} className="text-indigo-600" />
                                        <span>Tax Invoice Address</span>
                                    </label>
                                    <p className="text-xs text-slate-500 mb-1.5">Leave blank if same as Office Address.</p>
                                    <textarea
                                        id="billing_address"
                                        name="billing_address"
                                        value={profileData.billing_address}
                                        onChange={handleChange}
                                        rows={3}
                                        className={INPUT_CLASS}
                                        placeholder="Full address for tax invoices..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={isSaving}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all"
                            >
                                {isSaving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
                                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="space-y-6 max-w-lg">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-200/80 pb-2.5">
                            Notification Preferences
                        </h3>
                        <p className="text-sm text-slate-600 mb-4">
                            Manage what you want to hear from us. We recommend keeping these on for critical updates.
                        </p>

                        <div className="flex items-center justify-between py-3 border-b border-slate-100">
                            <div>
                                <h4 className="font-semibold text-sm text-slate-900">Low Balance Alert</h4>
                                <p className="text-xs text-slate-500">Get notified when wallet drops below 100 THB.</p>
                            </div>
                            <input
                                type="checkbox"
                                name="low_balance"
                                aria-label="Low Balance Alert"
                                checked={notifSettings.low_balance}
                                onChange={handleNotifChange}
                                className="h-4 w-4 accent-indigo-600 rounded focus-visible:ring-2 focus-visible:ring-indigo-500"
                            />
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-slate-100">
                            <div>
                                <h4 className="font-semibold text-sm text-slate-900">Ad Status Updates</h4>
                                <p className="text-xs text-slate-500">Get notified when ads are approved or rejected.</p>
                            </div>
                            <input
                                type="checkbox"
                                name="ad_approval"
                                aria-label="Ad Status Updates"
                                checked={notifSettings.ad_approval}
                                onChange={handleNotifChange}
                                className="h-4 w-4 accent-indigo-600 rounded focus-visible:ring-2 focus-visible:ring-indigo-500"
                            />
                        </div>

                        <div className="flex items-center justify-between py-3">
                            <div>
                                <h4 className="font-semibold text-sm text-slate-900">Weekly Performance</h4>
                                <p className="text-xs text-slate-500">Receive a weekly summary of your campaign stats.</p>
                            </div>
                            <input
                                type="checkbox"
                                name="weekly_report"
                                aria-label="Weekly Performance"
                                checked={notifSettings.weekly_report}
                                onChange={handleNotifChange}
                                className="h-4 w-4 accent-indigo-600 rounded focus-visible:ring-2 focus-visible:ring-indigo-500"
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={isSaving}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all"
                            >
                                {isSaving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
                                <span>{isSaving ? 'Saving...' : 'Save Preferences'}</span>
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'privacy' && (
                    <div className="space-y-6 max-w-xl">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-200/80 pb-2.5">
                            Privacy & Security
                        </h3>

                        <div className="rounded-2xl bg-amber-50 border border-amber-200/80 p-4 flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                                <Lock size={18} />
                            </div>
                            <p className="text-sm font-medium text-amber-900 leading-relaxed">
                                Your business profile is currently active and visible in ad campaigns.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5 sm:p-6 space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                                    <AlertCircle size={20} />
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-rose-800">Danger Zone</h4>
                                    <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                                        Deleting your business page will remove your profile, posts, and ads permanently. This action cannot be undone.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={async () => {
                                    if (!window.confirm("Are you sure you want to delete your business page? This action cannot be undone.")) return;
                                    setIsSaving(true);
                                    try {
                                        const res = await businessApi.deleteBusiness();
                                        if (res.success) {
                                            toast.success('Business page deleted successfully');
                                            navigate('/business/welcome');
                                        } else {
                                            toast.error(res.message || 'Failed to delete business page');
                                        }
                                    } catch (error) {
                                        console.error(error);
                                        toast.error('An error occurred');
                                    } finally {
                                        setIsSaving(false);
                                    }
                                }}
                                disabled={isSaving}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-sm transition-all disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                <Trash2 size={16} />
                                <span>Delete Business Page</span>
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'verification' && (
                    <div className="space-y-6 max-w-2xl">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
                            <div>
                                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                                    Business Verification
                                </h3>
                                <p className="text-sm text-slate-600 mt-0.5">
                                    Verify your business to build trust with customers.
                                </p>
                            </div>
                            <div
                                className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase flex items-center gap-1.5 border ${
                                    businessInfo?.verification_status === 'verified'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                                        : businessInfo?.verification_status === 'pending'
                                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200/80'
                                            : businessInfo?.verification_status === 'rejected'
                                                ? 'bg-rose-50 text-rose-700 border-rose-200/80'
                                                : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                            >
                                {businessInfo?.verification_status === 'verified' && <CheckCircle2 size={14} />}
                                {businessInfo?.verification_status === 'pending' && <Clock size={14} />}
                                {businessInfo?.verification_status === 'rejected' && <AlertCircle size={14} />}
                                <span>{businessInfo?.verification_status || 'unverified'}</span>
                            </div>
                        </div>

                        {businessInfo?.verification_status === 'verified' ? (
                            <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-8 text-center space-y-3">
                                <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                                    <ShieldCheck size={32} />
                                </div>
                                <h4 className="text-xl font-bold text-emerald-900">Your Business is Verified!</h4>
                                <p className="text-sm text-emerald-800 max-w-md mx-auto leading-relaxed">
                                    Thank you for verifying your business. Your profile now features the verification badge, and you have full access to all platform features.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                                    {/* VAT 20 */}
                                    <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl">
                                                <FileText size={18} />
                                            </div>
                                            <h4 className="font-bold text-slate-900">ภพ.20 (VAT 20)</h4>
                                        </div>
                                        <p className="text-xs text-slate-600 mb-3.5">Upload your VAT registration certificate.</p>
                                        <label className="cursor-pointer block focus-within:ring-2 focus-within:ring-indigo-500 rounded-xl">
                                            <div className="border-2 border-dashed border-slate-300 bg-white rounded-xl p-4 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all">
                                                <Upload size={18} className="mx-auto text-indigo-600 mb-1.5" />
                                                <span className="text-xs sm:text-sm font-medium text-slate-700 break-all">
                                                    {vFiles.vat20 ? vFiles.vat20.name : 'Choose File'}
                                                </span>
                                            </div>
                                            <input type="file" name="vat20" onChange={handleFileChange} className="sr-only" accept=".pdf,.jpg,.jpeg,.png" />
                                        </label>
                                    </div>

                                    {/* Company Certificate */}
                                    <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2.5 bg-violet-100 text-violet-700 rounded-xl">
                                                <Building2 size={18} />
                                            </div>
                                            <h4 className="font-bold text-slate-900">Certificate</h4>
                                        </div>
                                        <p className="text-xs text-slate-600 mb-3.5">Company registration certificate.</p>
                                        <label className="cursor-pointer block focus-within:ring-2 focus-within:ring-indigo-500 rounded-xl">
                                            <div className="border-2 border-dashed border-slate-300 bg-white rounded-xl p-4 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all">
                                                <Upload size={18} className="mx-auto text-indigo-600 mb-1.5" />
                                                <span className="text-xs sm:text-sm font-medium text-slate-700 break-all">
                                                    {vFiles.certificate ? vFiles.certificate.name : 'Choose File'}
                                                </span>
                                            </div>
                                            <input type="file" name="certificate" onChange={handleFileChange} className="sr-only" accept=".pdf,.jpg,.jpeg,.png" />
                                        </label>
                                    </div>

                                    {/* ID Card */}
                                    <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2.5 bg-fuchsia-100 text-fuchsia-700 rounded-xl">
                                                <User size={18} />
                                            </div>
                                            <h4 className="font-bold text-slate-900">ID Card Copy</h4>
                                        </div>
                                        <p className="text-xs text-slate-600 mb-3.5">Copy of ID card of the owner/authorized person.</p>
                                        <label className="cursor-pointer block focus-within:ring-2 focus-within:ring-indigo-500 rounded-xl">
                                            <div className="border-2 border-dashed border-slate-300 bg-white rounded-xl p-4 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all">
                                                <Upload size={18} className="mx-auto text-indigo-600 mb-1.5" />
                                                <span className="text-xs sm:text-sm font-medium text-slate-700 break-all">
                                                    {vFiles.id_card ? vFiles.id_card.name : 'Choose File'}
                                                </span>
                                            </div>
                                            <input type="file" name="id_card" onChange={handleFileChange} className="sr-only" accept=".pdf,.jpg,.jpeg,.png" />
                                        </label>
                                    </div>

                                    {/* Others */}
                                    <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
                                                <FileText size={18} />
                                            </div>
                                            <h4 className="font-bold text-slate-900">Others</h4>
                                        </div>
                                        <p className="text-xs text-slate-600 mb-3.5">Any other supporting documents.</p>
                                        <label className="cursor-pointer block focus-within:ring-2 focus-within:ring-indigo-500 rounded-xl">
                                            <div className="border-2 border-dashed border-slate-300 bg-white rounded-xl p-4 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all">
                                                <Upload size={18} className="mx-auto text-indigo-600 mb-1.5" />
                                                <span className="text-xs sm:text-sm font-medium text-slate-700">
                                                    {vFiles.others.length > 0 ? `${vFiles.others.length} files selected` : 'Choose Files'}
                                                </span>
                                            </div>
                                            <input type="file" name="others" onChange={handleFileChange} className="sr-only" multiple accept=".pdf,.jpg,.jpeg,.png" />
                                        </label>
                                    </div>
                                </div>

                                {businessInfo?.verification_status === 'pending' && (
                                    <div className="bg-indigo-50 border border-indigo-200/80 rounded-2xl p-4 flex items-start gap-3">
                                        <Clock className="text-indigo-700 shrink-0 mt-0.5" size={18} />
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-indigo-800">Verification Pending</p>
                                            <p className="text-sm text-indigo-900 mt-0.5">
                                                We have received your documents. Our team will review them within 2-3 business days.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {businessInfo?.verification_status === 'rejected' && (
                                    <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-4 flex items-start gap-3">
                                        <AlertCircle className="text-rose-700 shrink-0 mt-0.5" size={18} />
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-rose-800">Verification Rejected</p>
                                            <p className="text-sm text-rose-900 mt-0.5">
                                                Your documents were not approved. Please review the requirements and re-submit.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-2 flex justify-center sm:justify-start">
                                    <button
                                        type="button"
                                        onClick={handleVerificationSubmit}
                                        disabled={isSaving || businessInfo?.verification_status === 'pending' || businessInfo?.verification_status === 'verified'}
                                        className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                    >
                                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                                        <span>{isSaving ? 'Submitting...' : 'Submit Documents'}</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BusinessSettings;
