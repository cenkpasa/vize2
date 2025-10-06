
import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Person, Status } from '../types';

interface ExcelImportProps {
    onImport: (people: Omit<Person, 'id' | 'status' | 'appointmentDate'>[]) => void;
}

const ExcelImport: React.FC<ExcelImportProps> = ({ onImport }) => {
    const [headers, setHeaders] = useState<string[]>([]);
    const [data, setData] = useState<any[]>([]);
    const [mapping, setMapping] = useState<Record<string, string>>({});
    const [fileName, setFileName] = useState<string>('');

    const MAPPING_FIELDS = {
        fullName: 'Ad Soyad', passportNo: 'Pasaport No', birthDate: 'Doğum Tarihi',
        phone: 'Telefon', email: 'E-posta', country: 'Ülke (DE,IT..)',
        portal: 'Portal (idata/vfs)', city: 'Şehir', center: 'Merkez',
        visaType: 'Vize Tipi', earliestDate: 'En Erken Tarih', latestDate: 'En Geç Tarih',
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (event) => {
            const binaryStr = event.target?.result;
            const workbook = XLSX.read(binaryStr, { type: 'binary', cellDates: true });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            if (jsonData.length > 0) {
                const fileHeaders = jsonData[0] as string[];
                setHeaders(fileHeaders);
                
                const fileData = jsonData.slice(1).map(row => {
                    let rowData: any = {};
                    fileHeaders.forEach((header, index) => {
                        rowData[header] = row[index];
                    });
                    return rowData;
                });
                setData(fileData);
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleMappingChange = (field: string, header: string) => {
        setMapping(prev => ({ ...prev, [field]: header }));
    };
    
    const handleImport = () => {
        const newPeople: Omit<Person, 'id' | 'status' | 'appointmentDate'>[] = data.map(row => {
            const person: any = {};
            for (const field in MAPPING_FIELDS) {
                const header = mapping[field];
                let value = header ? row[header] : '';
                if (value instanceof Date) {
                    value = value.toISOString().split('T')[0];
                }
                person[field] = value || '';
            }
            return person;
        });
        onImport(newPeople);
        clearMapping();
    };

    const clearMapping = useCallback(() => {
        setHeaders([]);
        setData([]);
        setMapping({});
        setFileName('');
        const fileInput = document.getElementById('excelFile') as HTMLInputElement;
        if(fileInput) fileInput.value = '';
    }, []);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h5 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Excel’den Toplu Kişi Ekleme</h5>
            <div className="flex items-center gap-4">
                <label className="cursor-pointer px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Excel Yükle (.xlsx)
                    <input type="file" id="excelFile" accept=".xlsx, .xls" className="hidden" onChange={handleFileChange} />
                </label>
                {fileName && <span className="text-sm text-gray-500">{fileName}</span>}
            </div>
            {headers.length > 0 && (
                <>
                    <hr className="my-4 border-gray-200 dark:border-gray-600" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(MAPPING_FIELDS).map(([field, label]) => (
                            <div key={field}>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                                <select
                                    value={mapping[field] || ''}
                                    onChange={(e) => handleMappingChange(field, e.target.value)}
                                    className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Eşleştirme Seçin...</option>
                                    {headers.map(header => (
                                        <option key={header} value={header}>{header}</option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 flex gap-2">
                        <button onClick={handleImport} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                            Eşlemeyi Kullan ve Ekle
                        </button>
                        <button onClick={clearMapping} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                            Temizle
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ExcelImport;
