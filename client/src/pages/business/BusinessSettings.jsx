import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import businessApi from '../../services/businessApi';
import { Building2, Lock, Save, Globe, MapPin, MessageCircle, Phone, Mail, Bell, ShieldCheck, FileText, Upload, CheckCircle2, AlertCircle, Clock, User, ReceiptText as Receipt } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

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

    const [profileData, setProfileData] = useState({
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
                if (res.success) setBusinessInfo(res.business);
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

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = { ...profileData, notification_settings: notifSettings };
            const updated = await userService.updateProfile(payload);
            updateUser(updated.data);
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
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg flex flex-col md:flex-row overflow-hidden min-h-[600px]">
            {/* Sidebar */}
            <div className="w-full md:w-64 bg-gray-50 dark:bg-slate-900/50 p-4 border-r dark:border-slate-700">
                <h2 className="text-xl font-bold mb-6 px-4">Business Settings</h2>
                <div className="space-y-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === tab.id
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-8 overflow-y-auto">
                {activeTab === 'profile' && (
                    <div className="space-y-8 max-w-2xl">
                        <div>
                            <h3 className="text-lg font-bold border-b pb-2 mb-4">Identity</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Business Name</label>
                                    <input
                                        name="business_name"
                                        value={profileData.business_name}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-lg bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white"
                                        placeholder="Company Name Co., Ltd."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Tax ID</label>
                                    <input
                                        name="tax_id"
                                        value={profileData.tax_id}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-lg bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white"
                                        placeholder="1234567890123"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold border-b pb-2 mb-4">Contact Info</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Mail size={14} /> Business Email
                                    </label>
                                    <input
                                        name="business_email"
                                        value={profileData.business_email}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-lg bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white"
                                        placeholder="contact@company.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Phone size={14} /> Phone Number
                                    </label>
                                    <input
                                        name="business_phone"
                                        value={profileData.business_phone}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-lg bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white"
                                        placeholder="02-123-4567"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <MessageCircle size={14} /> Line ID
                                    </label>
                                    <input
                                        name="line_id"
                                        value={profileData.line_id}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-lg bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white"
                                        placeholder="@company"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Globe size={14} /> Website
                                    </label>
                                    <input
                                        name="website"
                                        value={profileData.website}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-lg bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white"
                                        placeholder="https://www.company.com"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold border-b pb-2 mb-4">Location</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <MapPin size={14} /> Office Address
                                    </label>
                                    <textarea
                                        name="address"
                                        value={profileData.address}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full p-2 border rounded-lg bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white"
                                        placeholder="123 Sukhumvit Road, Bangkok..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Receipt size={14} /> Tax Invoice Address
                                    </label>
                                    <p className="text-xs text-gray-500 mb-1">Leave blank if same as Office Address.</p>
                                    <textarea
                                        name="billing_address"
                                        value={profileData.billing_address}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full p-2 border rounded-lg bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white"
                                        placeholder="Full address for tax invoices..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                            >
                                <Save size={18} />
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="space-y-6 max-w-lg">
                        <h3 className="text-lg font-bold border-b pb-2">Notification Preferences</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Manage what you want to hear from us. We recommend keeping these on for critical updates.
                        </p>

                        <div className="flex items-center justify-between py-2">
                            <div>
                                <h4 className="font-medium">Low Balance Alert</h4>
                                <p className="text-xs text-gray-500">Get notified when wallet drops below 100 THB.</p>
                            </div>
                            <input
                                type="checkbox"
                                name="low_balance"
                                checked={notifSettings.low_balance}
                                onChange={handleNotifChange}
                                className="toggle"
                            />
                        </div>

                        <div className="flex items-center justify-between py-2">
                            <div>
                                <h4 className="font-medium">Ad Status Updates</h4>
                                <p className="text-xs text-gray-500">Get notified when ads are approved or rejected.</p>
                            </div>
                            <input
                                type="checkbox"
                                name="ad_approval"
                                checked={notifSettings.ad_approval}
                                onChange={handleNotifChange}
                                className="toggle"
                            />
                        </div>

                        <div className="flex items-center justify-between py-2">
                            <div>
                                <h4 className="font-medium">Weekly Performance</h4>
                                <p className="text-xs text-gray-500">Receive a weekly summary of your campaign stats.</p>
                            </div>
                            <input
                                type="checkbox"
                                name="weekly_report"
                                checked={notifSettings.weekly_report}
                                onChange={handleNotifChange}
                                className="toggle"
                            />
                        </div>

                        <div className="pt-6">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                            >
                                <Save size={18} />
                                {isSaving ? 'Saving...' : 'Save Preferences'}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'privacy' && (
                    <div className="space-y-6 max-w-lg">
                        <h3 className="text-lg font-bold border-b pb-2">Privacy & Security</h3>

                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-700">
                                        Your business profile is currently active and visible in ad campaigns.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {activeTab === 'verification' && (
                    <div className="space-y-6 max-w-2xl">
                        <div className="flex items-center justify-between border-b pb-4">
                            <div>
                                <h3 className="text-xl font-bold dark:text-white">Business Verification</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Verify your business to build trust with customers.</p>
                            </div>
                            <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase flex items-center gap-2 ${businessInfo?.verification_status === 'verified' ? 'bg-green-100 text-green-700' :
                                businessInfo?.verification_status === 'pending' ? 'bg-blue-100 text-blue-700' :
                                    businessInfo?.verification_status === 'rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-gray-100 text-gray-700'
                                }`}>
                                {businessInfo?.verification_status === 'verified' && <CheckCircle2 size={14} />}
                                {businessInfo?.verification_status === 'pending' && <Clock size={14} />}
                                {businessInfo?.verification_status === 'rejected' && <AlertCircle size={14} />}
                                {businessInfo?.verification_status || 'unverified'}
                            </div>
                        </div>

                        {businessInfo?.verification_status === 'verified' ? (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center space-y-4">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                    <ShieldCheck size={32} />
                                </div>
                                <h4 className="text-xl font-bold text-green-800">Your Business is Verified!</h4>
                                <p className="text-green-700 max-w-md mx-auto">
                                    Thank you for verifying your business. Your profile now features the verification badge, and you have full access to all platform features.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* VAT 20 */}
                                    <div className="bg-gray-50 dark:bg-slate-900/40 p-5 rounded-xl border border-gray-100 dark:border-slate-700">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><FileText size={20} /></div>
                                            <h4 className="font-bold dark:text-white">ภพ.20 (VAT 20)</h4>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-4">Upload your VAT registration certificate.</p>
                                        <label className="cursor-pointer block">
                                            <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg p-4 text-center hover:bg-gray-100 dark:hover:bg-slate-800 transition">
                                                <Upload size={20} className="mx-auto text-gray-400 mb-2" />
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {vFiles.vat20 ? vFiles.vat20.name : 'Choose File'}
                                                </span>
                                            </div>
                                            <input type="file" name="vat20" onChange={handleFileChange} className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                                        </label>
                                    </div>

                                    {/* Company Certificate */}
                                    <div className="bg-gray-50 dark:bg-slate-900/40 p-5 rounded-xl border border-gray-100 dark:border-slate-700">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Building2 size={20} /></div>
                                            <h4 className="font-bold dark:text-white">Certificate</h4>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-4">Company registration certificate.</p>
                                        <label className="cursor-pointer block">
                                            <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg p-4 text-center hover:bg-gray-100 dark:hover:bg-slate-800 transition">
                                                <Upload size={20} className="mx-auto text-gray-400 mb-2" />
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {vFiles.certificate ? vFiles.certificate.name : 'Choose File'}
                                                </span>
                                            </div>
                                            <input type="file" name="certificate" onChange={handleFileChange} className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                                        </label>
                                    </div>

                                    {/* ID Card */}
                                    <div className="bg-gray-50 dark:bg-slate-900/40 p-5 rounded-xl border border-gray-100 dark:border-slate-700">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-pink-100 text-pink-600 rounded-lg"><User size={20} /></div>
                                            <h4 className="font-bold dark:text-white">ID Card Copy</h4>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-4">Copy of ID card of the owner/authorized person.</p>
                                        <label className="cursor-pointer block">
                                            <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg p-4 text-center hover:bg-gray-100 dark:hover:bg-slate-800 transition">
                                                <Upload size={20} className="mx-auto text-gray-400 mb-2" />
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {vFiles.id_card ? vFiles.id_card.name : 'Choose File'}
                                                </span>
                                            </div>
                                            <input type="file" name="id_card" onChange={handleFileChange} className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                                        </label>
                                    </div>

                                    {/* Others */}
                                    <div className="bg-gray-50 dark:bg-slate-900/40 p-5 rounded-xl border border-gray-100 dark:border-slate-700">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><FileText size={20} /></div>
                                            <h4 className="font-bold dark:text-white">Others</h4>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-4">Any other supporting documents.</p>
                                        <label className="cursor-pointer block">
                                            <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg p-4 text-center hover:bg-gray-100 dark:hover:bg-slate-800 transition">
                                                <Upload size={20} className="mx-auto text-gray-400 mb-2" />
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {vFiles.others.length > 0 ? `${vFiles.others.length} files selected` : 'Choose Files'}
                                                </span>
                                            </div>
                                            <input type="file" name="others" onChange={handleFileChange} className="hidden" multiple accept=".pdf,.jpg,.jpeg,.png" />
                                        </label>
                                    </div>
                                </div>

                                {businessInfo?.verification_status === 'pending' && (
                                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                                        <div className="flex">
                                            <Clock className="text-blue-400" size={20} />
                                            <div className="ml-3">
                                                <p className="text-sm text-blue-700 uppercase font-bold">Verification Pending</p>
                                                <p className="text-sm text-blue-600">
                                                    We have received your documents. Our team will review them within 2-3 business days.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {businessInfo?.verification_status === 'rejected' && (
                                    <div className="bg-red-50 border-l-4 border-red-400 p-4">
                                        <div className="flex">
                                            <AlertCircle className="text-red-400" size={20} />
                                            <div className="ml-3">
                                                <p className="text-sm text-red-700 uppercase font-bold">Verification Rejected</p>
                                                <p className="text-sm text-red-600">
                                                    Your documents were not approved. Please review the requirements and re-submit.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-4 flex justify-center">
                                    <button
                                        onClick={handleVerificationSubmit}
                                        disabled={isSaving || businessInfo?.verification_status === 'pending' || businessInfo?.verification_status === 'verified'}
                                        className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
                                    >
                                        <ShieldCheck size={20} />
                                        {isSaving ? 'Submitting...' : 'Submit Documents'}
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
