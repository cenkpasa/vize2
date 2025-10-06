
import * as XLSX from 'xlsx';

export const generateSampleExcel = () => {
    const headers = [
        'fullName', 'passportNo', 'birthDate', 'phone', 'email', 'country', 'portal', 'city', 'center', 'visaType', 'earliestDate', 'latestDate'
    ];
    const data = [
        {
            fullName: 'Ahmet Yılmaz',
            passportNo: 'U12345678',
            birthDate: '1990-05-15',
            phone: '5551234567',
            email: 'ahmet@example.com',
            country: 'DE',
            portal: 'idata',
            city: 'Istanbul',
            center: 'Istanbul (Avrupa)',
            visaType: 'tourism',
            earliestDate: '2024-09-01',
            latestDate: '2024-09-30'
        },
        {
            fullName: 'Ayşe Kaya',
            passportNo: 'U87654321',
            birthDate: '1985-11-20',
            phone: '5557654321',
            email: 'ayse@example.com',
            country: 'IT',
            portal: 'idata',
            city: 'Ankara',
            center: 'Ankara',
            visaType: 'business',
            earliestDate: '2024-10-10',
            latestDate: '2024-10-20'
        }
    ];

    const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Başvurular');
    
    // Customize headers
    const headerRow = [
        'Ad Soyad', 'Pasaport No', 'Doğum Tarihi', 'Telefon', 'E-posta', 'Ülke Kodu (örn: DE)', 'Portal (idata/vfs)', 'Şehir', 'Merkez', 'Vize Tipi', 'En Erken Tarih', 'En Geç Tarih'
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [headerRow], { origin: 'A1' });

    XLSX.writeFile(workbook, 'Schengen_Randevu_Sablonu.xlsx');
};
