
import { Person } from '../types';

export const generateCsvReport = (people: Person[]) => {
    if (people.length === 0) {
        alert('Rapor oluşturulacak tamamlanmış randevu bulunmuyor.');
        return;
    }

    const headers = ['Ad Soyad', 'Pasaport No', 'Doğum Tarihi', 'Ülke', 'Portal', 'Şehir', 'Merkez', 'Vize Tipi', 'Alınan Randevu Tarihi'];
    
    const rows = people.map(p => [
        `"${p.fullName.replace(/"/g, '""')}"`,
        `"${p.passportNo}"`,
        `"${p.birthDate}"`,
        `"${p.country}"`,
        `"${p.portal}"`,
        `"${p.city}"`,
        `"${p.center}"`,
        `"${p.visaType}"`,
        `"${p.appointmentDate}"`
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    
    // BOM for Excel UTF-8 compatibility
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'randevu_raporu.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};