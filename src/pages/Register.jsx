import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, Link } from 'react-router-dom';
import { Bot, Loader2 } from 'lucide-react';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register, googleLogin } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await register(email, password, name);
            navigate('/chat');
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setIsLoading(true);
        try {
            await googleLogin(credentialResponse.credential);
            navigate('/chat');
        } catch (err) {
            setError(err.response?.data?.detail || 'Google login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#343541] flex items-center justify-center p-4">
            <div className="bg-[#40414f] p-8 rounded-lg w-full max-w-md border border-[#4d4d4f]">
                <div className="text-center mb-8">
                    <Bot size={48} className="mx-auto text-[#10a37f] mb-4" />
                    <h1 className="text-2xl font-bold text-white">Create Account</h1>
                    <p className="text-gray-400 mt-2">Start your AI journey today</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-[#343541] border border-[#4d4d4f] rounded px-4 py-3 text-white focus:outline-none focus:border-[#10a37f]"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#343541] border border-[#4d4d4f] rounded px-4 py-3 text-white focus:outline-none focus:border-[#10a37f]"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#343541] border border-[#4d4d4f] rounded px-4 py-3 text-white focus:outline-none focus:border-[#10a37f]"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#10a37f] hover:bg-[#0d8c6d] text-white py-3 rounded font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Create Account'}
                    </button>
                </form>

                <div className="my-6 flex items-center">
                    <div className="flex-1 border-t border-[#4d4d4f]"></div>
                    <span className="mx-4 text-gray-400 text-sm">or</span>
                    <div className="flex-1 border-t border-[#4d4d4f]"></div>
                </div>

                <div className="flex justify-center">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError('Google login failed')}
                        theme="filled_black"
                        size="large"
                        width="100%"
                    />
                </div>

                <p className="mt-6 text-center text-gray-400 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-[#10a37f] hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}