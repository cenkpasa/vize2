
import { Person, ApiSettings } from '../types';

export interface CheckResult {
    found: boolean;
    appointmentDate?: string;
    message: string;
}

export const checkForAppointment = async (person: Person): Promise<CheckResult> => {
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    // Simulate a ~10% chance of finding an appointment within the requested date range
    const earliest = person.earliestDate ? new Date(person.earliestDate) : new Date();
    const latest = person.latestDate ? new Date(person.latestDate) : new Date(new Date().setMonth(new Date().getMonth() + 3));
    
    if (Math.random() < 0.1) {
        const timeDiff = latest.getTime() - earliest.getTime();
        const randomTime = Math.random() * timeDiff;
        const appointmentDate = new Date(earliest.getTime() + randomTime);
        
        return {
            found: true,
            appointmentDate: appointmentDate.toISOString().split('T')[0],
            message: `Randevu bulundu: ${person.fullName} - ${appointmentDate.toLocaleDateString()}`
        };
    }

    return {
        found: false,
        message: `Randevu bulunamadı: ${person.fullName} - ${person.city}/${person.center}`
    };
};

export interface BookingResult {
    success: boolean;
    confirmationId?: string;
    error?: string;
}

export const bookAppointment = async (person: Person, date: string, settings: ApiSettings): Promise<BookingResult> => {
    console.log(`Booking for ${person.fullName} on ${date} using API: ${settings.url}`);
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    if (!settings.token) {
        return { success: false, error: "API Token is missing." };
    }
    
    // Simulate API failure rate
    if (Math.random() < 0.15) {
        return { success: false, error: "API call failed (500 Internal Server Error)" };
    }

    return {
        success: true,
        confirmationId: `CONF-${Date.now()}`
    };
};
