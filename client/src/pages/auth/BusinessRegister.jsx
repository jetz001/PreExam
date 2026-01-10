import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, User, Mail, Phone, Lock, FileText, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const BusinessRegister = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        businessName: '',
        taxId: '',
        businessHandle: '',
        contactName: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreedToTerms: false
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (!formData.agreedToTerms) {
            toast.error('คุณต้องยอมรับข้อตกลงในการสร้างเนื้อหาเพื่อดำเนินการต่อ');
            return;
        }

        setLoading(true);
        try {
            // Using the standard register endpoint with sponsor role
            await api.post('/auth/register', {
                display_name: formData.contactName, // Map contactName to display_name
                email: formData.email,
                password: formData.password,
                role: 'sponsor',
                business_name: formData.businessName,
                tax_id: formData.taxId
            });
            toast.success('Registration successful! Please login.');
            navigate('/auth/business/login');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-slate-800">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center text-blue-600 mb-4">
                    <Building2 size={48} />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Sign up for Business
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Create your ad account to reach thousands of students.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
                    <form className="space-y-6" onSubmit={handleSubmit}>

                        <div className="bg-blue-50 p-4 rounded-md mb-6">
                            <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center">
                                <Building2 size={16} className="mr-2" /> Business Information
                            </h3>
                            <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Business / Brand Name</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <input
                                            type="text"
                                            name="businessName"
                                            required
                                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-3 pr-3 sm:text-sm border-gray-300 rounded-md py-2"
                                            placeholder="My Awesome Brand"
                                            value={formData.businessName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Business Handle (ID)</label>
                                    <input
                                        type="text"
                                        name="businessHandle"
                                        required
                                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-3 pr-3 sm:text-sm border-gray-300 rounded-md py-2 mt-1"
                                        placeholder="@brand"
                                        value={formData.businessHandle}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tax ID (Optional)</label>
                                    <input
                                        type="text"
                                        name="taxId"
                                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-3 pr-3 sm:text-sm border-gray-300 rounded-md py-2 mt-1"
                                        placeholder="1234567890123"
                                        value={formData.taxId}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-md">
                            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                                <User size={16} className="mr-2" /> Contact Person
                            </h3>
                            <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                                    <input
                                        type="text"
                                        name="contactName"
                                        required
                                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-3 pr-3 sm:text-sm border-gray-300 rounded-md py-2 mt-1"
                                        value={formData.contactName}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-3 pr-3 sm:text-sm border-gray-300 rounded-md py-2 mt-1"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Email Address (Username)</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
                                            placeholder="you@company.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-3 pr-3 sm:text-sm border-gray-300 rounded-md py-2 mt-1"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        required
                                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-3 pr-3 sm:text-sm border-gray-300 rounded-md py-2 mt-1"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="agreedToTerms"
                                    name="agreedToTerms"
                                    type="checkbox"
                                    required
                                    checked={formData.agreedToTerms}
                                    onChange={handleChange}
                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded cursor-pointer"
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="agreedToTerms" className="font-medium text-gray-700 cursor-pointer">
                                    ข้าพเจ้ายอมรับข้อตกลงในการเป็นผู้สร้างเนื้อหา (Creator Agreement)
                                </label>
                                <p className="text-gray-500 text-xs mt-1">
                                    ข้าพเจ้ายอมรับว่าจะเป็นผู้ดูแลและรับผิดชอบต่อเนื้อหาทั้งหมดที่เกิดขึ้นในเพจแต่เพียงผู้เดียว และจะไม่นำเนื้อหาที่ละเมิดลิขสิทธิ์หรือผิดกฎหมายมาเผยแพร่
                                </p>
                            </div>
                        </div>


                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 transition-colors"
                            >
                                {loading ? 'Registering...' : 'Create Business Account'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    Already have an account?
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-3">
                            <Link
                                to="/auth/business/login"
                                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                            >
                                Sign in
                            </Link>
                        </div>
                        <div className="mt-4 text-center">
                            <Link to="/" className="text-sm text-blue-600 hover:text-blue-500">
                                Back to Platform Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessRegister;
