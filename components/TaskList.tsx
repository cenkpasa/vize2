
import React, { useState } from 'react';
import { Person, Status } from '../types';
import { VISA_CENTERS } from '../utils/data';
import PlayIcon from './icons/PlayIcon';
import PauseIcon from './icons/PauseIcon';
import StopIcon from './icons/StopIcon';
import EditIcon from './icons/EditIcon';
import TrashIcon from './icons/TrashIcon';

interface TaskListProps {
    people: Person[];
    onSetStatus: (id: number, status: Status) => void;
    onSetAllStatus: (status: Status) => void;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
}

const statusConfig = {
    [Status.Running]: { text: 'Çalışıyor', color: 'bg-green-500', textColor: 'text-green-800 dark:text-green-300', bgColor: 'bg-green-100 dark:bg-green-900/50' },
    [Status.Paused]: { text: 'Duraklatıldı', color: 'bg-yellow-500', textColor: 'text-yellow-800 dark:text-yellow-300', bgColor: 'bg-yellow-100 dark:bg-yellow-900/50' },
    [Status.Stopped]: { text: 'Durduruldu', color: 'bg-red-500', textColor: 'text-red-800 dark:text-red-300', bgColor: 'bg-red-100 dark:bg-red-900/50' },
    [Status.Completed]: { text: 'Tamamlandı', color: 'bg-blue-500', textColor: 'text-blue-800 dark:text-blue-300', bgColor: 'bg-blue-100 dark:bg-blue-900/50' },
};

const TaskList: React.FC<TaskListProps> = ({ people, onSetStatus, onSetAllStatus, onEdit, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPeople = people.filter(p => 
        p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.passportNo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-4">
                <h5 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Görev Listesi</h5>
                <input
                    type="text"
                    placeholder="Listede ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-1/3 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
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
                            <tr key={person.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/50">
                                <td className="p-3 font-sans font-medium text-gray-900 dark:text-white">{person.fullName}</td>
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
                                <td colSpan={6} className="text-center p-4">Liste boş.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => onSetAllStatus(Status.Running)} className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700">İzlemeyi Başlat (Tümü)</button>
                <button onClick={() => onSetAllStatus(Status.Paused)} className="px-4 py-2 text-sm bg-yellow-500 text-white rounded-md hover:bg-yellow-600">Duraklat (Tümü)</button>
                <button onClick={() => onSetAllStatus(Status.Stopped)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">Durdur (Tümü)</button>
                {/* <button className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">Rapor Oluştur</button> */}
            </div>
        </div>
    );
};

export default TaskList;
