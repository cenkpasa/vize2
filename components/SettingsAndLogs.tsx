
import React from 'react';
import { Log, ApiSettings, Status, NotificationSettings, ApiHealthStatus } from '../types';

interface SettingsAndLogsProps {
    logs: Log[];
    apiSettings: ApiSettings;
    setApiSettings: (settings: ApiSettings) => void;
    globalStatus: Status;
    nextRun: number | null;
    notificationSettings: NotificationSettings;
    setNotificationSettings: (settings: NotificationSettings) => void;
    apiHealthStatus: ApiHealthStatus;
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
    [Status.AwaitingSms]: { text: 'SMS Bekliyor', dotClass: 'bg-orange-500' },
};

const apiHealthConfig = {
    [ApiHealthStatus.OK]: { text: 'Bağlandı', dotColor: 'bg-green-500', bgColor: 'bg-green-100 dark:bg-green-900/50', textColor: 'text-green-800 dark:text-green-200' },
    [ApiHealthStatus.Error]: { text: 'Bağlantı Hatası', dotColor: 'bg-red-500', bgColor: 'bg-red-100 dark:bg-red-900/50', textColor: 'text-red-800 dark:text-red-200' },
    [ApiHealthStatus.Checking]: { text: 'Kontrol Ediliyor...', dotColor: 'bg-yellow-500', bgColor: 'bg-yellow-100 dark:bg-yellow-900/50', textColor: 'text-yellow-800 dark:text-yellow-200' },
};

const SettingsAndLogs: React.FC<SettingsAndLogsProps> = ({ logs, apiSettings, setApiSettings, globalStatus, nextRun, notificationSettings, setNotificationSettings, apiHealthStatus }) => {
    
    const handleBrowserNotifyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        if (isChecked && Notification.permission !== 'granted') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    setNotificationSettings({ ...notificationSettings, browserNotify: true });
                    new Notification('Bildirimler Etkinleştirildi!', {
                       body: 'Randevu bulunduğunda artık bildirim alacaksınız.'
                    });
                }
            });
        } else {
             setNotificationSettings({ ...notificationSettings, browserNotify: isChecked });
        }
    };

    const handleApiSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        // For the select, we need to convert the string 'true'/'false' to boolean
        const finalValue = name === 'enabled' ? value === 'true' : (isCheckbox ? (e.target as HTMLInputElement).checked : value);
        setApiSettings({
            ...apiSettings,
            [name]: finalValue
        });
    };

    const formatNextRun = () => {
        if (!nextRun || globalStatus !== Status.Running) return '-';
        const remaining = Math.max(0, Math.round((nextRun - Date.now()) / 1000));
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const ToggleSwitch = ({ id, checked, onChange, label }: {id: string, checked: boolean, onChange: (e:any)=>void, label:string}) => (
        <div className="flex items-center justify-between">
            <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
            <button
                onClick={() => onChange({ target: { checked: !checked }})}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                id={id}
            >
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 flex-grow">
                    <h5 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Ayarlar</h5>
                     <h5 className="text-lg font-semibold mt-4 mb-2 text-gray-800 dark:text-gray-200">Bildirimler</h5>
                    <div className="space-y-3">
                       <ToggleSwitch id="browserNotify" label="Tarayıcı Bildirimleri" checked={notificationSettings.browserNotify} onChange={handleBrowserNotifyChange} />
                       <ToggleSwitch id="soundNotify" label="Sesli Uyarı" checked={notificationSettings.soundNotify} onChange={(e) => setNotificationSettings({ ...notificationSettings, soundNotify: e.target.checked })} />
                    </div>
                    <hr className="my-4 border-gray-200 dark:border-gray-600" />
                    <h5 className="text-lg font-semibold mt-4 mb-2 text-gray-800 dark:text-gray-200">API (Zorunlu)</h5>
                    <div className="space-y-3">
                         <div>
                            <label htmlFor="apiUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API URL</label>
                            <input
                                id="apiUrl"
                                name="url"
                                type="text"
                                value={apiSettings.url}
                                onChange={handleApiSettingsChange}
                                className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="apiToken" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">X-API-Token</label>
                             <input
                                id="apiToken"
                                name="token"
                                type="password"
                                placeholder="Lütfen API anahtarınızı girin"
                                value={apiSettings.token}
                                onChange={handleApiSettingsChange}
                                className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                             <label htmlFor="apiEnabled" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Durumu</label>
                             <select
                                id="apiEnabled"
                                name="enabled"
                                value={String(apiSettings.enabled)}
                                onChange={handleApiSettingsChange}
                                className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                             >
                                <option value="true">Aktif (Gerçek Çağrı)</option>
                                <option value="false">Pasif (Simülasyon)</option>
                             </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Sağlık Durumu</label>
                            <div className={`flex items-center p-2 rounded-md text-sm h-[38px] ${apiHealthConfig[apiHealthStatus].bgColor} ${apiHealthConfig[apiHealthStatus].textColor}`}>
                                <span className={`w-3 h-3 rounded-full mr-2 ${apiHealthConfig[apiHealthStatus].dotColor}`}></span>
                                {apiHealthConfig[apiHealthStatus].text}
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Otomatik alım için API'nin 'Aktif' olması zorunludur.</p>
                    </div>
                </div>
                <div className="sticky bottom-0 bg-white dark:bg-gray-800 p-3 border-t border-gray-200 dark:border-gray-700 rounded-b-lg flex justify-between items-center text-sm">
                    <div className="flex items-center">
                         <span className={`w-3 h-3 rounded-full mr-2 ${statusConfig[globalStatus]?.dotClass ?? 'bg-gray-400'}`}></span>
                         <span>Durum: {statusConfig[globalStatus]?.text ?? 'Bilinmiyor'}</span>
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