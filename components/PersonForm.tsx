
import React, { useState, useEffect, useMemo } from 'react';
import { Person } from '../types';
import { VISA_CENTERS, PORTALS_REQUIRING_AUTH } from '../utils/data';

interface PersonFormProps {
    addOrUpdatePerson: (person: Omit<Person, 'id' | 'status' | 'appointmentDate'>) => void;
    editingPerson: Person | null;
    clearEditing: () => void;
}

const initialFormState = {
    fullName: '', passportNo: '', birthDate: '', phone: '', email: '', telegramId: '',
    country: '', portal: '', city: '', center: '', visaType: '', earliestDate: '', latestDate: '',
    portalUsername: '', portalPassword: ''
};

const PersonForm: React.FC<PersonFormProps> = ({ addOrUpdatePerson, editingPerson, clearEditing }) => {
    const [formState, setFormState] = useState(initialFormState);

    useEffect(() => {
        if (editingPerson) {
            setFormState({
                fullName: editingPerson.fullName,
                passportNo: editingPerson.passportNo,
                birthDate: editingPerson.birthDate,
                phone: editingPerson.phone,
                email: editingPerson.email,
                telegramId: editingPerson.telegramId,
                country: editingPerson.country,
                portal: editingPerson.portal,
                city: editingPerson.city,
                center: editingPerson.center,
                visaType: editingPerson.visaType,
                earliestDate: editingPerson.earliestDate,
                latestDate: editingPerson.latestDate,
                portalUsername: editingPerson.portalCredentials?.username || '',
                portalPassword: editingPerson.portalCredentials?.password || ''
            });
        } else {
            setFormState(initialFormState);
        }
    }, [editingPerson]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => {
            const newState = { ...prev, [name]: value };
            // Reset dependent fields on change
            if (name === 'country') {
                newState.portal = '';
                newState.city = '';
                newState.center = '';
            }
            if (name === 'portal') {
                newState.city = '';
                newState.center = '';
            }
            if (name === 'city') {
                newState.center = '';
            }
            return newState;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { portalUsername, portalPassword, ...personData } = formState;
        
        const submissionData: Omit<Person, 'id' | 'status' | 'appointmentDate'> = {
            ...personData,
            portalCredentials: {
                username: portalUsername,
                password: portalPassword
            }
        };

        addOrUpdatePerson(submissionData);
        setFormState(initialFormState);
        clearEditing();
    };

    const handleClearForm = () => {
        setFormState(initialFormState);
        clearEditing();
    };

    // Memoized options for dependent dropdowns
    const countryOptions = useMemo(() => Object.keys(VISA_CENTERS), []);
    const portalOptions = useMemo(() => formState.country ? Object.keys(VISA_CENTERS[formState.country] || {}).filter(k => k !== 'name') : [], [formState.country]);
    const cityOptions = useMemo(() => formState.portal ? Object.keys(VISA_CENTERS[formState.country]?.[formState.portal] || {}) : [], [formState.country, formState.portal]);
    const centerOptions = useMemo(() => VISA_CENTERS[formState.country]?.[formState.portal]?.[formState.city] || [], [formState.country, formState.portal, formState.city]);
    const needsAuth = useMemo(() => PORTALS_REQUIRING_AUTH.includes(formState.portal), [formState.portal]);

    const InputField = ({ id, label, required = false, ...props }: any) => (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                id={id}
                name={id}
                required={required}
                {...props}
                className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
        </div>
    );
    
    const SelectField = ({ id, label, required = false, children, ...props }: any) => (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
                id={id}
                name={id}
                required={required}
                {...props}
                className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
                {children}
            </select>
        </div>
    );


    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h5 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Kişi Ekleme ve Güncelleme</h5>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-6"><InputField id="fullName" label="Ad Soyad" required value={formState.fullName} onChange={handleInputChange} /></div>
                    <div className="md:col-span-3"><InputField id="passportNo" label="Pasaport No" required value={formState.passportNo} onChange={handleInputChange} /></div>
                    <div className="md:col-span-3"><InputField id="birthDate" label="Doğum Tarihi" type="date" required value={formState.birthDate} onChange={handleInputChange} /></div>
                    <div className="md:col-span-4"><InputField id="phone" label="Telefon" type="tel" value={formState.phone} onChange={handleInputChange} /></div>
                    <div className="md:col-span-4"><InputField id="email" label="E-posta" type="email" value={formState.email} onChange={handleInputChange} /></div>
                    <div className="md:col-span-4"><InputField id="telegramId" label="Telegram Chat ID" value={formState.telegramId} onChange={handleInputChange} /></div>
                </div>
                <hr className="border-gray-200 dark:border-gray-600"/>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-12">
                        <div className="p-3 bg-gray-100 dark:bg-gray-700/50 rounded-md text-center">
                            <span className="font-medium text-gray-800 dark:text-gray-200">Başvuru Yapılan Ülke: 🇹🇷 Türkiye</span>
                        </div>
                    </div>
                     <div className="md:col-span-3">
                        <SelectField id="country" label="Ülke" required value={formState.country} onChange={handleInputChange}>
                            <option value="">Seçin…</option>
                            {countryOptions.map(c => <option key={c} value={c}>{VISA_CENTERS[c].name}</option>)}
                        </SelectField>
                    </div>
                    <div className="md:col-span-3">
                        <SelectField id="portal" label="Portal" required value={formState.portal} onChange={handleInputChange} disabled={!formState.country}>
                            <option value="">Seçin…</option>
                            {portalOptions.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                        </SelectField>
                        {needsAuth && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Bu portal için giriş bilgileri gereklidir.
                            </p>
                        )}
                    </div>
                    <div className="md:col-span-3">
                        <SelectField id="city" label="Başvuru Şehri" required value={formState.city} onChange={handleInputChange} disabled={!formState.portal}>
                             <option value="">Seçin…</option>
                            {cityOptions.map(c => <option key={c} value={c}>{c}</option>)}
                        </SelectField>
                    </div>
                    <div className="md:col-span-3">
                        <SelectField id="center" label="Başvuru Merkezi" required value={formState.center} onChange={handleInputChange} disabled={!formState.city}>
                             <option value="">Seçin…</option>
                            {centerOptions.map(c => <option key={c} value={c}>{c}</option>)}
                        </SelectField>
                    </div>
                    <div className="md:col-span-4">
                        <SelectField id="visaType" label="Vize Tipi" required value={formState.visaType} onChange={handleInputChange}>
                            <option value="">Seçin…</option>
                            <option value="tourism">Turistik</option>
                            <option value="business">Ticari</option>
                            <option value="family">Aile/Arkadaş Ziyareti</option>
                            <option value="education">Eğitim</option>
                        </SelectField>
                    </div>
                    <div className="md:col-span-4"><InputField id="earliestDate" label="En Erken Tarih" type="date" value={formState.earliestDate} onChange={handleInputChange} /></div>
                    <div className="md:col-span-4"><InputField id="latestDate" label="En Geç Tarih" type="date" value={formState.latestDate} onChange={handleInputChange} /></div>
                </div>

                {needsAuth && (
                    <>
                        <hr className="border-gray-200 dark:border-gray-600"/>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <InputField id="portalUsername" label="Portal Kullanıcı Adı" value={formState.portalUsername} onChange={handleInputChange} />
                           <InputField id="portalPassword" label="Portal Şifresi" type="password" value={formState.portalPassword} onChange={handleInputChange} />
                        </div>
                    </>
                )}

                <div className="flex gap-2">
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                        {editingPerson ? 'Kişiyi Güncelle' : 'Kişi Ekle'}
                    </button>
                    <button type="button" onClick={handleClearForm} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                        Formu Temizle
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PersonForm;