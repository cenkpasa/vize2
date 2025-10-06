
import React, { useState } from 'react';
import useDarkMode from '../hooks/useDarkMode';
import EyeIcon from './icons/EyeIcon';
import EyeSlashIcon from './icons/EyeSlashIcon';

interface LoginProps {
    onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isDarkMode, toggleDarkMode] = useDarkMode();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); // Clear previous errors

        // Client-side validation
        if (!username.trim() || !password.trim()) {
            setError('Kullanıcı adı ve şifre boş bırakılamaz.');
            return;
        }

        // Hardcoded credentials
        if (username === 'admin' && password === '1234') {
            onLoginSuccess();
        } else {
            setError('Geçersiz kullanıcı adı veya şifre.');
        }
    };

    const handleForgotPassword = (e: React.MouseEvent) => {
        e.preventDefault();
        alert('Şifre sıfırlama özelliği henüz uygulanmadı.');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
            <div className="w-full max-w-md p-6 sm:p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Giriş Yap</h1>
                    <div className="flex items-center gap-2">
                        <label htmlFor="darkModeSwitchLogin" className="text-sm text-gray-600 dark:text-gray-400">Karanlık Mod</label>
                        <button
                            onClick={() => toggleDarkMode(!isDarkMode)}
                            className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors bg-gray-200 dark:bg-gray-700 focus:outline-none"
                            id="darkModeSwitchLogin"
                        >
                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Kullanıcı Adı
                        </label>
                        <div className="mt-1">
                            <input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="password"className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Şifre
                        </label>
                        <div className="mt-1 relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 dark:text-gray-400"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    )}

                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <a href="#" onClick={handleForgotPassword} className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                                Şifremi Unuttum?
                            </a>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Giriş Yap
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;