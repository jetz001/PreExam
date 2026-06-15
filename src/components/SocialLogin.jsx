import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';


const SocialLogin = () => {
    const navigate = useNavigate();
    const { googleLogin, facebookLogin } = useAuth();

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            await googleLogin(credentialResponse.credential);
            navigate('/profile');
        } catch (error) {
            console.error('Google Login Failed', error);
            alert('Google Login Failed');
        }
    };

    const handleFacebookResponse = async (response) => {
        if (response.accessToken) {
            try {
                await facebookLogin(response.accessToken, response.userID);
                navigate('/profile');
            } catch (error) {
                console.error('Facebook Login Failed', error);
                alert('Facebook Login Failed');
            }
        }
    };

    return (
        <div className="mt-2">
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm font-bold">
                    <span className="bg-white px-4 text-slate-400">หรือเข้าใช้ด้วย</span>
                </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex justify-center rounded-2xl border border-slate-200 bg-slate-50 p-2">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => {
                            console.log('Login Failed');
                        }}
                        useOneTap
                    />
                </div>

                <div>
                    <FacebookLogin
                        appId={process.env.NEXT_PUBLIC_VITE_FACEBOOK_APP_ID}
                        autoLoad={false}
                        fields="name,email,picture"
                        callback={handleFacebookResponse}
                        render={renderProps => (
                            <button
                                onClick={renderProps.onClick}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100"
                            >
                                <span className="sr-only">Sign in with Facebook</span>
                                <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                <span>Facebook</span>
                            </button>
                        )}
                    />
                </div>
            </div>
        </div>
    );
};

export default SocialLogin;
