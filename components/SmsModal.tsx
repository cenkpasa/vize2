
import React, { useState, useEffect } from 'react';

interface SmsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (smsCode: string) => void;
    personName?: string;
    appointmentDate?: string | null;
}

const SmsModal: React.FC<SmsModalProps> = ({ isOpen, onClose, onConfirm, personName, appointmentDate }) => {
    const [smsCode, setSmsCode] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setSmsCode('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (smsCode.trim()) {
            onConfirm(smsCode);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl transform transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 sm:mx-0 sm:h-10 sm:w-10">
                                <svg className="h-6 w-6 text-blue-600 dark:text-blue-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                                </svg>
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white" id="modal-title">SMS Doğrulama Kodu</h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        <span className="font-bold">{personName}</span> için <span className="font-bold">{appointmentDate}</span> tarihinde randevu bulundu.
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Randevuyu onaylamak için lütfen telefonunuza gelen SMS kodunu girin.
                                    </p>
                                </div>
                                <div className="mt-4">
                                     <input
                                        type="text"
                                        value={smsCode}
                                        onChange={(e) => setSmsCode(e.target.value)}
                                        placeholder="6 haneli kod"
                                        className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        <button
                            type="submit"
                            className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Randevuyu Onayla
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-800 px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                        >
                            İptal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SmsModal;