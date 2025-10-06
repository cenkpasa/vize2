
import React from 'react';
import { Log, ApiSettings, Status } from '../types';

interface SettingsAndLogsProps {
    logs: Log[];
    apiSettings: ApiSettings;
    setApiSettings: (settings: ApiSettings) => void;
    globalStatus: Status;
    nextRun: number | null;
}

const logTypeClasses = {
    info: 'text-gray-300',
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
};

const statusConfig = {
    [Status.Running]: { text: 'Çalışıyor', dotClass: 'bg-green-500' },
    [Status.Paused]: { text: 'Duraklatıldı', dotClass: 'bg-yellow-500' },
    [Status.Stopped]: { text: 'Durduruldu', dotClass: 'bg-red-500' },
    [Status.Completed]: { text: 'Tamamlandı', dotClass: 'bg-blue-500' },
};

const SettingsAndLogs: React.FC<SettingsAndLogsProps> = ({ logs, apiSettings, setApiSettings, globalStatus, nextRun }) => {
    
    const handleApiSettingsChange = (field: keyof ApiSettings, value: string | boolean) => {
        setApiSettings({ ...apiSettings, [field]: value });
    };

    const formatNextRun = () => {
        if (!nextRun || globalStatus !== Status.Running) return '-';
        const remaining = Math.max(0, Math.round((nextRun - Date.now()) / 1000));
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 flex-grow">
                    <h5 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Ayarlar</h5>
                    {/* Notification settings can be added here if needed */}
                    <h5 className="text-lg font-semibold mt-4 mb-2 text-gray-800 dark:text-gray-200">API (Zorunlu)</h5>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API URL</label>
                            <input type="text" value={apiSettings.url} onChange={(e) => handleApiSettingsChange('url', e.target.value)} className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">X-API-Token</label>
                            <input type="text" placeholder="Lütfen API anahtarınızı girin" value={apiSettings.token} onChange={(e) => handleApiSettingsChange('token', e.target.value)} className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Durumu</label>
                             <select
                                value={apiSettings.enabled ? 'yes' : 'no'}
                                onChange={(e) => handleApiSettingsChange('enabled', e.target.value === 'yes')}
                                className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="yes">Aktif (Gerçek Çağrı)</option>
                                <option value="no">Pasif (Simülasyon)</option>
                            </select>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Otomatik alım için API'nin 'Aktif' olması zorunludur.</p>
                </div>
                <div className="sticky bottom-0 bg-white dark:bg-gray-800 p-3 border-t border-gray-200 dark:border-gray-700 rounded-b-lg flex justify-between items-center text-sm">
                    <div className="flex items-center">
                         <span className={`w-3 h-3 rounded-full mr-2 ${statusConfig[globalStatus].dotClass}`}></span>
                         <span>Durum: {statusConfig[globalStatus].text}</span>
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">
                        Sonraki kontrol: {formatNextRun()}
                    </div>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
                <h5 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Log Kayıtları</h5>
                <div className="h-96 bg-gray-900 dark:bg-black rounded-md p-3 overflow-y-auto font-mono text-xs text-gray-300 space-y-1">
                    {logs.map(log => (
                        <div key={log.id}>
                            <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                            <span className={`ml-2 ${logTypeClasses[log.type]}`}>{log.message}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SettingsAndLogs;
