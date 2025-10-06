

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Person, Status, Log, AgentModel, ApiSettings } from './types';
import Header from './components/Header';
import GlobalSettings from './components/GlobalSettings';
import PersonForm from './components/PersonForm';
import ExcelImport from './components/ExcelImport';
import TaskList from './components/TaskList';
import SettingsAndLogs from './components/SettingsAndLogs';
import { checkForAppointment, bookAppointment } from './services/apiService';
import { getPrioritizedPerson } from './services/geminiService';
import Login from './components/Login';

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        return sessionStorage.getItem('isAuthenticated') === 'true';
    });
    const [people, setPeople] = useState<Person[]>(() => {
        const savedPeople = localStorage.getItem('people');
        return savedPeople ? JSON.parse(savedPeople) : [];
    });
    const [editingPerson, setEditingPerson] = useState<Person | null>(null);
    const [logs, setLogs] = useState<Log[]>([]);
    const [globalStatus, setGlobalStatus] = useState<Status>(Status.Stopped);
    const [nextRun, setNextRun] = useState<number | null>(null);

    const [agentModel, setAgentModel] = useState<AgentModel>(AgentModel.Hybrid);
    const [pollInterval, setPollInterval] = useState(120);
    const [pollJitter, setPollJitter] = useState(30);

    const [apiSettings, setApiSettings] = useState<ApiSettings>(() => {
        const savedSettings = localStorage.getItem('apiSettings');
        return savedSettings ? JSON.parse(savedSettings) : { url: 'http://localhost:8000', token: '', enabled: false };
    });
    
    const timerRef = useRef<number | null>(null);
    const nextRunIntervalRef = useRef<number | null>(null);

    useEffect(() => {
        localStorage.setItem('people', JSON.stringify(people));
    }, [people]);

    useEffect(() => {
        localStorage.setItem('apiSettings', JSON.stringify(apiSettings));
    }, [apiSettings]);

    const addLog = useCallback((message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
        const newLog: Log = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            message,
            type,
        };
        setLogs(prevLogs => [newLog, ...prevLogs.slice(0, 99)]);
    }, []);

    const addOrUpdatePerson = (person: Omit<Person, 'id' | 'status' | 'appointmentDate'>) => {
        if (editingPerson) {
            setPeople(prev => prev.map(p => p.id === editingPerson.id ? { ...editingPerson, ...person } : p));
            addLog(`Kişi güncellendi: ${person.fullName}`, 'success');
            setEditingPerson(null);
        } else {
            const newPerson: Person = {
                ...person,
                id: Date.now(),
                status: Status.Stopped,
                appointmentDate: null
            };
            setPeople(prev => [...prev, newPerson]);
            addLog(`Kişi eklendi: ${person.fullName}`, 'success');
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
        if (window.confirm("Bu kişiyi silmek istediğinizden emin misiniz?")) {
            const personToDelete = people.find(p => p.id === id);
            setPeople(prev => prev.filter(p => p.id !== id));
            if(personToDelete) addLog(`Kişi silindi: ${personToDelete.fullName}`, 'warning');
        }
    };

    const handleSetStatus = (id: number, status: Status) => {
        setPeople(prev => prev.map(p => p.id === id ? { ...p, status } : p));
        const person = people.find(p => p.id === id);
        if (person) addLog(`${person.fullName} durumu güncellendi: ${status}`, 'info');
    };

    const handleSetAllStatus = (status: Status) => {
        setPeople(prev => prev.map(p => ({ ...p, status })));
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
                const prioritizedPerson = await getPrioritizedPerson(targets);
                if (prioritizedPerson) {
                    addLog(`AI önceliklendirmesi: ${prioritizedPerson.fullName}`, 'info');
                    // Place the prioritized person at the beginning of the list to be checked first
                    targets = [prioritizedPerson, ...targets.filter(p => p.id !== prioritizedPerson.id)];
                } else {
                    addLog('AI önceliklendirmesi için uygun kişi bulunamadı.', 'warning');
                }
            } catch (error) {
                addLog('AI önceliklendirme başarısız. Standart modda devam ediliyor.', 'error');
            }
        }
        
        for (const person of targets) {
            if (globalStatus !== Status.Running) break; // Stop if global status changes
            
            addLog(`${person.fullName} için randevu aranıyor...`, 'info');
            const result = await checkForAppointment(person);

            if (result.found) {
                addLog(result.message, 'success');
                if (apiSettings.enabled) {
                    addLog(`${person.fullName} için randevu alınıyor...`, 'info');
                    const bookingResult = await bookAppointment(person, result.appointmentDate!, apiSettings);
                    if (bookingResult.success) {
                        addLog(`${person.fullName} için randevu başarıyla alındı: ${result.appointmentDate}`, 'success');
                        setPeople(prev => prev.map(p => p.id === person.id ? { ...p, status: Status.Completed, appointmentDate: result.appointmentDate } : p));
                    } else {
                        addLog(`${person.fullName} için randevu alınamadı: ${bookingResult.error}`, 'error');
                    }
                } else {
                    addLog(`Simülasyon Modu: Randevu bulundu fakat API kapalı olduğu için alınmadı. Tarih: ${result.appointmentDate}`, 'warning');
                    setPeople(prev => prev.map(p => p.id === person.id ? { ...p, status: Status.Completed, appointmentDate: result.appointmentDate } : p));
                }
            } else {
                addLog(result.message, 'info');
            }
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay between checks
        }

       if (globalStatus === Status.Running) {
           scheduleNextRun();
       }

    }, [people, addLog, globalStatus, agentModel, apiSettings]);


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

    useEffect(() => {
        return () => { // Cleanup on unmount
            clearTimeout(timerRef.current!);
            clearInterval(nextRunIntervalRef.current!);
        };
    }, []);

    const handleLoginSuccess = () => {
        sessionStorage.setItem('isAuthenticated', 'true');
        setIsAuthenticated(true);
    };

    if (!isAuthenticated) {
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <div className="container mx-auto p-4 font-sans">
            <Header />
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
                        // FIX: Map over imported people to add missing properties (`id`, `status`, `appointmentDate`)
                        // to conform to the `Person` type before adding them to the state.
                        const peopleToAdd: Person[] = newPeople.map((person, index) => ({
                            ...person,
                            id: Date.now() + index, // Ensure unique ID for batch import
                            status: Status.Stopped,
                            appointmentDate: null,
                        }));
                        setPeople(prev => [...prev, ...peopleToAdd]);
                        addLog(`${newPeople.length} kişi Excel'den başarıyla eklendi.`, 'success');
                    }}
                />
                <TaskList
                    people={people}
                    onSetStatus={handleSetStatus}
                    onSetAllStatus={handleSetAllStatus}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
                <SettingsAndLogs 
                    logs={logs}
                    apiSettings={apiSettings}
                    setApiSettings={setApiSettings}
                    globalStatus={globalStatus}
                    nextRun={nextRun}
                />
            </div>
        </div>
    );
};

export default App;