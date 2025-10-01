import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const AdminLoginPage: React.FC = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
        } catch (err: any) {
            setError(err.message || 'Incorrect email or password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="bg-gray-50 flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md mx-auto p-8 space-y-6 bg-white rounded-lg shadow-xl">
                <div className="text-center">
                    <h1 className="text-3xl font-montserrat font-black text-black">Admin Access</h1>
                    <p className="text-gray-600 mt-2 font-roboto">Please enter your credentials to manage content.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="sr-only">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            className="w-full p-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black font-roboto"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="sr-only">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full p-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black font-roboto"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    {error && <p className="font-roboto text-sm text-red-600 text-center">{error}</p>}
                    <button 
                        type="submit" 
                        className="w-full bg-black text-white font-roboto font-bold py-3 px-6 rounded-md hover:bg-gray-800 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:bg-gray-400"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </section>
    );
};

export default AdminLoginPage;
