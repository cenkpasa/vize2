
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Person, Status } from '../types';
import { VISA_CENTERS } from '../utils/data';
import { generateCsvReport } from '../utils/reportHelper';
import { exportPeopleToJson } from '../utils/exportHelper';
import PlayIcon from './icons/PlayIcon';
import PauseIcon from './icons/PauseIcon';
import StopIcon from './icons/StopIcon';
import EditIcon from './icons/EditIcon';
import TrashIcon from './icons/TrashIcon';
import BellIcon from './icons/BellIcon';

interface TaskListProps {
    people: Person[];
    onSetStatus: (id: number, status: Status) => void;
    onSetAllStatus: (status: Status) => void;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    onSetStatusForSelected: (ids: number[], status: Status) => void;
    onDeleteSelected: (ids: number[]) => void;
    onSetReminder: (id: number) => void;
}

const statusConfig = {
    [Status.Running]: { text: 'Çalışıyor', color: 'bg-green-500', textColor: 'text-green-800 dark:text-green-300', bgColor: 'bg-green-100 dark:bg-green-900/50' },
    [Status.Paused]: { text: 'Duraklatıldı', color: 'bg-yellow-500', textColor: 'text-yellow-800 dark:text-yellow-300', bgColor: 'bg-yellow-100 dark:bg-yellow-900/50' },
    [Status.Stopped]: { text: 'Durduruldu', color: 'bg-red-500', textColor: 'text-red-800 dark:text-red-300', bgColor: 'bg-red-100 dark:bg-red-900/50' },
    [Status.Completed]: { text: 'Tamamlandı', color: 'bg-blue-500', textColor: 'text-blue-800 dark:text-blue-300', bgColor: 'bg-blue-100 dark:bg-blue-900/50' },
    [Status.AwaitingSms]: { text: 'SMS Bekliyor', color: 'bg-orange-500', textColor: 'text-orange-800 dark:text-orange-300', bgColor: 'bg-orange-100 dark:bg-orange-900/50' },
};

const TaskList: React.FC<TaskListProps> = ({ people, onSetStatus, onSetAllStatus, onEdit, onDelete, onSetStatusForSelected, onDeleteSelected, onSetReminder }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

    const filteredPeople = useMemo(() => people.filter(p => 
        p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.passportNo.toLowerCase().includes(searchTerm.toLowerCase())
    ), [people, searchTerm]);

    // Reset selection when filtered list or people list changes
    useEffect(() => {
        setSelectedIds([]);
    }, [searchTerm, people]);

    const handleSelect = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(filteredPeople.map(p => p.id));
        } else {
            setSelectedIds([]);
        }
    };
    
    const handleGenerateReport = () => {
        const completedPeople = people.filter(p => p.status === Status.Completed);
        if (completedPeople.length === 0) {
            alert('Rapor oluşturulacak tamamlanmış randevu bulunmuyor.');
            return;
        }
        generateCsvReport(completedPeople);
    }

    const handleExport = () => {
        exportPeopleToJson(people);
    };
    
    const handleDeleteSelectedClick = () => {
        if (window.confirm(`${selectedIds.length} kişiyi silmek istediğinizden emin misiniz?`)) {
            onDeleteSelected(selectedIds);
            setSelectedIds([]);
        }
    };

    const isAllSelected = useMemo(() => filteredPeople.length > 0 && selectedIds.length === filteredPeople.length, [selectedIds, filteredPeople]);
    const isIndeterminate = useMemo(() => selectedIds.length > 0 && !isAllSelected, [selectedIds, isAllSelected]);

    useEffect(() => {
        if (selectAllCheckboxRef.current) {
            selectAllCheckboxRef.current.indeterminate = isIndeterminate;
        }
    }, [isIndeterminate]);


    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                <h5 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Görev Listesi</h5>
                <input
                    type="text"
                    placeholder="Listede ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-1/3 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            {selectedIds.length > 0 && (
                <div className="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-md mb-4 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium pr-4">{selectedIds.length} kişi seçildi.</span>
                    <button onClick={() => {onSetStatusForSelected(selectedIds, Status.Running); setSelectedIds([])}} className="px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700">Seçilenleri Başlat</button>
                    <button onClick={() => {onSetStatusForSelected(selectedIds, Status.Paused); setSelectedIds([])}} className="px-3 py-1 text-xs bg-yellow-500 text-white rounded-md hover:bg-yellow-600">Seçilenleri Duraklat</button>
                    <button onClick={() => {onSetStatusForSelected(selectedIds, Status.Stopped); setSelectedIds([])}} className="px-3 py-1 text-xs bg-gray-500 text-white rounded-md hover:bg-gray-600">Seçilenleri Durdur</button>
                    <button onClick={handleDeleteSelectedClick} className="px-3 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700">Seçilenleri Sil</button>
                </div>
            )}
            
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="p-3 w-4">
                               <input 
                                    type="checkbox" 
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                    checked={isAllSelected}
                                    ref={selectAllCheckboxRef}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th scope="col" className="p-3">Ad Soyad</th>
                            <th scope="col" className="p-3">Pasaport</th>
                            <th scope="col" className="p-3">Ülke/Şehir</th>
                            <th scope="col" className="p-3">Alınan Randevu</th>
                            <th scope="col" className="p-3">Durum</th>
                            <th scope="col" className="p-3 text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="font-mono">
                        {filteredPeople.length > 0 ? filteredPeople.map(person => (
                            <tr key={person.id} className={`border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/50 ${selectedIds.includes(person.id) ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800'}`}>
                                <td className="p-3 w-4">
                                     <input 
                                        type="checkbox" 
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        checked={selectedIds.includes(person.id)}
                                        onChange={() => handleSelect(person.id)}
                                    />
                                </td>
                                <td className="p-3 font-sans font-medium text-gray-900 dark:text-white whitespace-nowrap">{person.fullName}</td>
                                <td className="p-3">{person.passportNo}</td>
                                <td className="p-3">{VISA_CENTERS[person.country]?.name || person.country}/{person.city}</td>
                                <td className="p-3">{person.appointmentDate || '-'}</td>
                                <td className="p-3">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[person.status].bgColor} ${statusConfig[person.status].textColor}`}>
                                        <span className={`w-2 h-2 mr-1.5 rounded-full ${statusConfig[person.status].color}`}></span>
                                        {statusConfig[person.status].text}
                                    </span>
                                </td>
                                <td className="p-3 text-right">
                                    <div className="flex justify-end items-center gap-2">
                                        {person.status === Status.Completed && person.appointmentDate && (
                                            <button 
                                                onClick={() => onSetReminder(person.id)} 
                                                title={person.reminderSet ? "Hatırlatıcıyı Kaldır" : "Hatırlatıcı Kur"}
                                                className={person.reminderSet ? "text-yellow-500 hover:text-yellow-600" : "text-gray-400 hover:text-gray-600"}
                                            >
                                                <BellIcon />
                                            </button>
                                        )}
                                        <button onClick={() => onSetStatus(person.id, Status.Running)} title="Başlat" className="text-green-500 hover:text-green-700"><PlayIcon /></button>
                                        <button onClick={() => onSetStatus(person.id, Status.Paused)} title="Duraklat" className="text-yellow-500 hover:text-yellow-700"><PauseIcon /></button>
                                        <button onClick={() => onSetStatus(person.id, Status.Stopped)} title="Durdur" className="text-gray-500 hover:text-gray-700"><StopIcon /></button>
                                        <button onClick={() => onEdit(person.id)} title="Düzenle" className="text-blue-500 hover:text-blue-700"><EditIcon /></button>
                                        <button onClick={() => onDelete(person.id)} title="Sil" className="text-red-500 hover:text-red-700"><TrashIcon /></button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={7} className="text-center p-4">Liste boş.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => onSetAllStatus(Status.Running)} className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700">İzlemeyi Başlat (Tümü)</button>
                <button onClick={() => onSetAllStatus(Status.Paused)} className="px-4 py-2 text-sm bg-yellow-500 text-white rounded-md hover:bg-yellow-600">Duraklat (Tümü)</button>
                <button onClick={() => onSetAllStatus(Status.Stopped)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">Durdur (Tümü)</button>
                <button onClick={handleGenerateReport} className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">Rapor Oluştur (Tamamlananlar)</button>
                <button onClick={handleExport} className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">Listeyi Dışa Aktar (JSON)</button>
            </div>
        </div>
    );
};

export default TaskList;