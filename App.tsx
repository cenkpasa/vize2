
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Person, Status, Log, AgentModel, ApiSettings, NotificationSettings, ApiHealthStatus, ToastMessage } from './types';
import Header from './components/Header';
import GlobalSettings from './components/GlobalSettings';
import PersonForm from './components/PersonForm';
import ExcelImport from './components/ExcelImport';
import TaskList from './components/TaskList';
import SettingsAndLogs from './components/SettingsAndLogs';
import { checkForAppointment, bookAppointment, checkApiHealth } from './services/apiService';
import { getPrioritizedPerson } from './services/geminiService';
import Login from './components/Login';
import SmsModal from './components/SmsModal';
import { PORTALS_REQUIRING_AUTH } from './utils/data';
import ToastContainer from './components/ToastContainer';

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        // AIzaSyDQCm6Mg7xQeCXswWz5a7a17r9Yt1JcboA is part of a centralized system, not a user secret.
        return localStorage.getItem('isAuthenticated') === 'true';
    });
    const [people, setPeople] = useState<Person[]>(() => {
        const savedPeople = localStorage.getItem('people');
        return savedPeople ? JSON.parse(savedPeople) : [];
    });
    const [editingPerson, setEditingPerson] = useState<Person | null>(null);
    const [logs, setLogs] = useState<Log[]>([]);
    const [globalStatus, setGlobalStatus] = useState<Status>(Status.Stopped);
    const [nextRun, setNextRun] = useState<number | null>(null);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const [agentModel, setAgentModel] = useState<AgentModel>(AgentModel.Hybrid);
    const [pollInterval, setPollInterval] = useState(120);
    const [pollJitter, setPollJitter] = useState(30);

    const [apiSettings, setApiSettings] = useState<ApiSettings>(() => {
        const saved = localStorage.getItem('apiSettings');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
             url: 'https://api.example.com',
             token: '', // User needs to input this
             enabled: false,
        };
    });

    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
        const saved = localStorage.getItem('notificationSettings');
        return saved ? JSON.parse(saved) : { browserNotify: false, soundNotify: true };
    });
    
    const [apiHealthStatus, setApiHealthStatus] = useState<ApiHealthStatus>(ApiHealthStatus.Checking);
    
    // SMS Modal State
    const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
    const [personAwaitingSms, setPersonAwaitingSms] = useState<Person | null>(null);
    const [foundDateForSms, setFoundDateForSms] = useState<string | null>(null);

    const timerRef = useRef<number | null>(null);
    const nextRunIntervalRef = useRef<number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioRef.current = document.getElementById('notification-sound') as HTMLAudioElement;
    }, []);

    useEffect(() => {
        localStorage.setItem('people', JSON.stringify(people));
    }, [people]);
    
    useEffect(() => {
        localStorage.setItem('apiSettings', JSON.stringify(apiSettings));
    }, [apiSettings]);

    useEffect(() => {
        localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
    }, [notificationSettings]);

    const addLog = useCallback((message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
        const newLog: Log = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            message,
            type,
        };
        setLogs(prevLogs => [newLog, ...prevLogs.slice(0, 99)]);
    }, []);
    
    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const addToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    }, []);

    useEffect(() => {
        const checkStatus = async () => {
            if (!apiSettings.enabled) {
                setApiHealthStatus(ApiHealthStatus.Error);
                return;
            };
            setApiHealthStatus(ApiHealthStatus.Checking);
            const result = await checkApiHealth(apiSettings);
            setApiHealthStatus(result.ok ? ApiHealthStatus.OK : ApiHealthStatus.Error);
            if (!result.ok) {
                addLog(`API Sağlık Kontrolü Başarısız: ${result.message}`, 'error');
            }
        };

        checkStatus();
        const interval = setInterval(checkStatus, 30000); // Check every 30 seconds
        return () => clearInterval(interval);
    }, [apiSettings, addLog]);

    const addOrUpdatePerson = (personData: Omit<Person, 'id' | 'status' | 'appointmentDate'>) => {
        if (editingPerson) {
            setPeople(prev => prev.map(p => p.id === editingPerson.id ? { ...editingPerson, ...personData } : p));
            addToast(`Kişi güncellendi: ${personData.fullName}`, 'success');
            setEditingPerson(null);
        } else {
            const newPerson: Person = {
                ...personData,
                id: Date.now(),
                status: Status.Stopped,
                appointmentDate: null
            };
            setPeople(prev => [...prev, newPerson]);
            addToast(`Kişi eklendi: ${personData.fullName}`, 'success');
        }
    };
    
    const handleEdit = (id: number) => {
        const personToEdit = people.find(p => p.id === id);
        if (personToEdit) {
            setEditingPerson(personToEdit);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    
    const handleDelete = (id: number) => {
        const personToDelete = people.find(p => p.id === id);
        setPeople(prev => prev.filter(p => p.id !== id));
        if(personToDelete) addToast(`Kişi silindi: ${personToDelete.fullName}`, 'info');
    };

    const handleDeleteSelected = (ids: number[]) => {
        setPeople(prev => prev.filter(p => !ids.includes(p.id)));
        addToast(`${ids.length} kişi silindi.`, 'info');
    }

    const handleSetStatus = (id: number, status: Status) => {
        setPeople(prev => prev.map(p => p.id === id ? { ...p, status } : p));
        const person = people.find(p => p.id === id);
        if (person) addLog(`${person.fullName} durumu güncellendi: ${status}`, 'info');
    };

    const handleSetStatusForSelected = (ids: number[], status: Status) => {
        setPeople(prev => prev.map(p => ids.includes(p.id) ? { ...p, status } : p));
        addToast(`${ids.length} kişinin durumu ${status} olarak güncellendi.`, 'info');
    }

    const handleSetAllStatus = (status: Status) => {
        // Don't change status for people awaiting SMS
        setPeople(prev => prev.map(p => p.status === Status.AwaitingSms ? p : { ...p, status }));
        setGlobalStatus(status);
        if (status === Status.Running) {
            addLog('Tüm kişiler için izleme başlatıldı.', 'info');
            scheduleNextRun(5); // Start first run in 5 seconds
        } else if (status === Status.Paused) {
            addLog('Tüm kişiler için izleme duraklatıldı.', 'warning');
            clearTimeout(timerRef.current!);
            clearInterval(nextRunIntervalRef.current!);
            setNextRun(null);
        } else {
            addLog('Tüm kişiler için izleme durduruldu.', 'error');
            clearTimeout(timerRef.current!);
            clearInterval(nextRunIntervalRef.current!);
            setNextRun(null);
        }
    };

     const handleSetReminder = (id: number) => {
        setPeople(prev => prev.map(p => {
            if (p.id === id) {
                if (p.reminderSet) {
                    addToast(`${p.fullName} için hatırlatıcı kaldırıldı.`, 'info');
                    return { ...p, reminderSet: false, reminderSent: false };
                } else {
                    addToast(`${p.fullName} için randevu hatırlatıcısı kuruldu.`, 'success');
                    return { ...p, reminderSet: true, reminderSent: false };
                }
            }
            return p;
        }));
    };

     // Effect for checking and sending reminders
    useEffect(() => {
        const reminderInterval = setInterval(() => {
            const now = new Date();
            const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

            people.forEach(p => {
                if (p.appointmentDate && p.reminderSet && !p.reminderSent) {
                    const appointmentDate = new Date(p.appointmentDate);
                    // Check if the appointment is within the next 24 hours but not in the past
                    if (appointmentDate <= twentyFourHoursFromNow && appointmentDate > now) {
                        const message = `HATIRLATICI: ${p.fullName} kişisinin yarın (${appointmentDate.toLocaleDateString()}) randevusu var.`;
                        addToast(message, 'info');
                        if (notificationSettings.browserNotify && Notification.permission === "granted") {
                           new Notification('Randevu Hatırlatıcısı', { body: message });
                        }
                        
                        setPeople(prev => prev.map(person =>
                            person.id === p.id ? { ...person, reminderSent: true } : person
                        ));
                    }
                }
            });
        }, 60 * 1000); // Check every minute

        return () => clearInterval(reminderInterval);
    }, [people, addToast, notificationSettings.browserNotify]);
    
    const runChecks = useCallback(async () => {
        addLog('Randevu kontrolü başlıyor...', 'info');
        let targets = people.filter(p => p.status === Status.Running);
        
        if(targets.length === 0) {
            addLog('İzlenecek aktif kişi bulunamadı. İzleme duraklatılıyor.', 'warning');
            handleSetAllStatus(Status.Paused);
            return;
        }

        if (agentModel === 'ai_heuristic' || agentModel === 'hybrid') {
            try {
                const prioritizedPerson = await getPrioritizedPerson(targets, apiSettings);
                if (prioritizedPerson) {
                    addLog(`AI önceliklendirmesi: ${prioritizedPerson.fullName}`, 'info');
                    targets = [prioritizedPerson, ...targets.filter(p => p.id !== prioritizedPerson.id)];
                } else {
                    addLog('AI önceliklendirmesi için uygun kişi bulunamadı.', 'warning');
                }
            } catch (error) {
                addLog('AI önceliklendirme başarısız. Standart modda devam ediliyor.', 'error');
            }
        }
        
        for (const person of targets) {
            if (globalStatus !== Status.Running) break;
            
            addLog(`${person.fullName} için randevu aranıyor...`, 'info');
            const result = await checkForAppointment(person);

            // If retries failed and there's a final error message, show it
            if (result.message.startsWith('Hata:')) {
                addLog(result.message, 'error');
                addToast(result.message, 'error');
            } else if (result.found) {
                addLog(result.message, 'success');

                if (notificationSettings.soundNotify && audioRef.current) {
                    audioRef.current.play().catch(e => console.error("Audio play failed:", e));
                }
                if (notificationSettings.browserNotify && Notification.permission === "granted") {
                    new Notification('Randevu Bulundu!', {
                        body: `${person.fullName} için ${result.appointmentDate} tarihinde randevu bulundu.`,
                    });
                }
                
                const needsAuthentication = PORTALS_REQUIRING_AUTH.includes(person.portal);

                if (apiSettings.enabled && needsAuthentication) {
                    addLog(`${person.fullName} için SMS onayı bekleniyor...`, 'warning');
                    handleSetStatus(person.id, Status.AwaitingSms);
                    setPersonAwaitingSms(person);
                    setFoundDateForSms(result.appointmentDate!);
                    setIsSmsModalOpen(true);
                } else if (apiSettings.enabled) {
                    addLog(`${person.fullName} için randevu alınıyor...`, 'info');
                    const bookingResult = await bookAppointment(person, result.appointmentDate!, apiSettings);
                    if (bookingResult.success) {
                        addLog(`${person.fullName} için randevu başarıyla alındı: ${result.appointmentDate}`, 'success');
                        addToast(`Randevu alındı! Onay No: ${bookingResult.confirmationId}`, 'success');
                        setPeople(prev => prev.map(p => p.id === person.id ? { ...p, status: Status.Completed, appointmentDate: result.appointmentDate } : p));
                    } else {
                        addLog(`${person.fullName} için randevu alınamadı: ${bookingResult.error}`, 'error');
                        addToast(`Randevu alınamadı: ${bookingResult.error}`, 'error');
                    }
                } else {
                    addLog(`Simülasyon Modu: Randevu bulundu fakat API kapalı olduğu için alınmadı. Tarih: ${result.appointmentDate}`, 'warning');
                    addToast(`${person.fullName} için randevu bulundu (Simülasyon)`, 'info');
                    setPeople(prev => prev.map(p => p.id === person.id ? { ...p, status: Status.Completed, appointmentDate: result.appointmentDate } : p));
                }
            } else {
                addLog(result.message, 'info');
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

       if (globalStatus === Status.Running) {
           scheduleNextRun();
       }

    }, [people, addLog, globalStatus, agentModel, apiSettings, notificationSettings, handleSetAllStatus, addToast]);


    const scheduleNextRun = (initialDelay?: number) => {
        clearTimeout(timerRef.current!);
        clearInterval(nextRunIntervalRef.current!);

        const delay = initialDelay ? initialDelay * 1000 : (pollInterval + (Math.random() * pollJitter * 2 - pollJitter)) * 1000;
        
        setNextRun(Date.now() + delay);

        nextRunIntervalRef.current = window.setInterval(() => {
            setNextRun(prev => (prev ? prev - 1000 : null));
        }, 1000);

        timerRef.current = window.setTimeout(runChecks, delay);
    };

    const handleSmsSubmit = async (smsCode: string) => {
        if (!personAwaitingSms || !foundDateForSms) return;

        addLog(`${personAwaitingSms.fullName} için ${smsCode} kodu ile randevu alınıyor...`, 'info');
        const bookingResult = await bookAppointment(personAwaitingSms, foundDateForSms, apiSettings, smsCode);

        if (bookingResult.success) {
            addLog(`${personAwaitingSms.fullName} için randevu başarıyla alındı: ${foundDateForSms}`, 'success');
            addToast(`Randevu alındı! Onay No: ${bookingResult.confirmationId}`, 'success');
            setPeople(prev => prev.map(p => p.id === personAwaitingSms.id ? { ...p, status: Status.Completed, appointmentDate: foundDateForSms } : p));
        } else {
            addLog(`${personAwaitingSms.fullName} için randevu alınamadı: ${bookingResult.error}`, 'error');
            addToast(`Randevu alınamadı: ${bookingResult.error}`, 'error');
            // Revert status to Running to allow retries
            handleSetStatus(personAwaitingSms.id, Status.Running);
        }
        
        setIsSmsModalOpen(false);
        setPersonAwaitingSms(null);
        setFoundDateForSms(null);
    };
    
    const handleSmsCancel = () => {
        if(personAwaitingSms) {
            addLog(`${personAwaitingSms.fullName} için SMS işlemi iptal edildi. Kişi yeniden izlemeye alındı.`, 'warning');
            handleSetStatus(personAwaitingSms.id, Status.Running);
        }
        setIsSmsModalOpen(false);
        setPersonAwaitingSms(null);
        setFoundDateForSms(null);
    };

    useEffect(() => {
        return () => {
            clearTimeout(timerRef.current!);
            clearInterval(nextRunIntervalRef.current!);
        };
    }, []);

    const handleLoginSuccess = () => {
        localStorage.setItem('isAuthenticated', 'true');
        setIsAuthenticated(true);
    };
    
    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        setIsAuthenticated(false);
    };

    if (!isAuthenticated) {
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <>
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            <SmsModal 
                isOpen={isSmsModalOpen}
                onClose={handleSmsCancel}
                onConfirm={handleSmsSubmit}
                personName={personAwaitingSms?.fullName}
                appointmentDate={foundDateForSms}
            />
            <div className="container mx-auto p-2 sm:p-4 font-sans">
                <Header onLogout={handleLogout} />
                <p className="mb-4 p-3 bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 rounded-md text-sm">
                    Bu sistem, "tam otomatik" modda çalışır. Listeye eklenen ve takibe başlatılan her kişi için bulduğu ilk uygun randevuyu, API ayarları doğruysa, onaysız olarak almaya çalışır. 7/24 stabil çalışma için uygulamanın açık olduğu bilgisayarın sürekli açık kalması gerekmektedir.
                </p>
                <div className="space-y-6">
                    <GlobalSettings 
                        agentModel={agentModel}
                        setAgentModel={setAgentModel}
                        pollInterval={pollInterval}
                        setPollInterval={setPollInterval}
                        pollJitter={pollJitter}
                        setPollJitter={setPollJitter}
                    />
                    <PersonForm
                        addOrUpdatePerson={addOrUpdatePerson}
                        editingPerson={editingPerson}
                        clearEditing={() => setEditingPerson(null)}
                    />
                    <ExcelImport
                        onImport={(newPeople) => {
                             // Fix: Ensure imported data is correctly typed before adding to state
                            const peopleToAdd: Person[] = newPeople.map((person, index) => ({
                                fullName: person.fullName || '',
                                passportNo: person.passportNo || '',
                                birthDate: person.birthDate || '',
                                phone: person.phone || '',
                                email: person.email || '',
                                telegramId: person.telegramId || '',
                                country: person.country || '',
                                portal: person.portal || '',
                                city: person.city || '',
                                center: person.center || '',
                                visaType: person.visaType || '',
                                earliestDate: person.earliestDate || '',
                                latestDate: person.latestDate || '',
                                id: Date.now() + index,
                                status: Status.Stopped,
                                appointmentDate: null,
                                portalCredentials: person.portalCredentials || { username: '', password: '' }
                            }));
                            setPeople(prev => [...prev, ...peopleToAdd]);
                            addToast(`${newPeople.length} kişi Excel'den başarıyla eklendi.`, 'success');
                        }}
                    />
                    <TaskList
                        people={people}
                        onSetStatus={handleSetStatus}
                        onSetAllStatus={handleSetAllStatus}
                        onEdit={handleEdit}
                        onDelete={(id) => {
                            if (window.confirm("Bu kişiyi silmek istediğinizden emin misiniz?")) {
                                handleDelete(id);
                            }
                        }}
                        onSetStatusForSelected={handleSetStatusForSelected}
                        onDeleteSelected={handleDeleteSelected}
                        onSetReminder={handleSetReminder}
                    />
                    <SettingsAndLogs 
                        logs={logs}
                        apiSettings={apiSettings}
                        setApiSettings={setApiSettings}
                        globalStatus={globalStatus}
                        nextRun={nextRun}
                        notificationSettings={notificationSettings}
                        setNotificationSettings={setNotificationSettings}
                        apiHealthStatus={apiHealthStatus}
                    />
                </div>
            </div>
        </>
    );
};

export default App;