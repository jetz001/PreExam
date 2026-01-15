import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SocialLogin from '../components/SocialLogin';
import { GraduationCap, Building2, ArrowRight, User } from 'lucide-react';


const Login = () => {
    const { isAuthenticated, login, user } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();


    useEffect(() => {
        // Check if user is guest based on email pattern
        const isGuest = user?.email?.startsWith('guest_');

        if (isAuthenticated && !isGuest) {
            navigate('/profile');
        }
    }, [isAuthenticated, navigate, user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await login(formData);

            // Intelligence Redirect:
            // If user has a business role or last visited business page, we could redirect there.
            // But standard 'One ID' usually goes to Profile/Feed first.

            navigate('/profile');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-sans">
            {/* Left Side - Visual & Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-900 to-blue-900 overflow-hidden text-white items-center justify-center">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 transform scale-105 transition-transform duration-[20s] hover:scale-110"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900 via-transparent to-transparent opacity-90"></div>

                <div className="relative z-10 px-12 text-center max-w-xl">
                    <div className="mb-8 flex justify-center">
                        <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
                            <GraduationCap size={40} className="text-white" />
                        </div>
                    </div>
                    <h1 className="text-5xl font-extrabold tracking-tight mb-6 leading-tight">
                        PreExam <br /><span className="text-blue-300">Hub</span>
                    </h1>
                    <p className="text-lg text-blue-100 mb-8 font-light">
                        The ultimate ecosystem for learners and educators. Master essential skills or share your expertise with the world.
                    </p>

                    <div className="flex justify-center gap-4 text-sm font-medium opacity-80">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-400"></span> 100k+ Students
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-400"></span> Top Instructors
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 relative">
                {/* Background Decor for Mobile */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -z-10 transform translate-x-1/2 -translate-y-1/2"></div>

                <div className="max-w-md w-full space-y-10">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            One ID for everything. Expert or Student.
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email or Username</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    style={{ color: '#000000' }}
                                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow shadow-sm bg-gray-50 focus:bg-white"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    style={{ color: '#000000' }}
                                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow shadow-sm bg-gray-50 focus:bg-white"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <div className="flex justify-end mt-1">
                                    <Link to="/forgot-password" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">
                                        Forgot password?
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2 border border-red-100">
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Verifying...
                                </span>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                    </div>

                    <SocialLogin />

                    <div className="mt-8 flex items-center justify-center gap-6 text-sm">
                        <Link to="/register" className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium transition-colors group">
                            <User size={18} className="text-gray-400 group-hover:text-indigo-500" />
                            Create new account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
