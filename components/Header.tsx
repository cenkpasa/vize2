
import React from 'react';
import useDarkMode from '../hooks/useDarkMode';
import { generateSampleExcel } from '../utils/excelHelper';

const Header: React.FC = () => {
    const [isDarkMode, toggleDarkMode] = useDarkMode();

    const handleDownloadSample = () => {
        generateSampleExcel();
    };

    return (
        <header className="flex justify-between items-center mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200">
                Schengen Randevu Yönetim Sistemi <span className="text-base font-normal text-blue-600 dark:text-blue-400">v4.0</span>
            </h1>
            <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2">
                    <label htmlFor="darkModeSwitch" className="text-sm text-gray-600 dark:text-gray-400">Karanlık Mod</label>
                    <button
                        onClick={() => toggleDarkMode(!isDarkMode)}
                        className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors bg-gray-200 dark:bg-gray-700 focus:outline-none"
                        id="darkModeSwitch"
                    >
                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
                <button
                    onClick={handleDownloadSample}
                    className="px-3 py-1.5 text-sm border border-blue-500 text-blue-500 rounded-md hover:bg-blue-500 hover:text-white transition-colors"
                >
                    Örnek Excel Şablonu
                </button>
            </div>
        </header>
    );
};

export default Header;
