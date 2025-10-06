
import { Person, ApiSettings } from '../types';
import { PORTALS_REQUIRING_AUTH } from '../utils/data';

// --- Helper for retry mechanism ---
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const retryWithExponentialBackoff = async <T>(
    fn: () => Promise<T>,
    retries = 3,
    delayMs = 1000,
    onRetry?: (error: any, attempt: number) => void
): Promise<T> => {
    let lastError: any;
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;
            // Only retry for specific, transient errors
            if (error.isTransient) {
                if (onRetry) {
                    onRetry(error, i + 1);
                }
                await delay(delayMs * Math.pow(2, i)); // Exponential backoff
            } else {
                // Don't retry for permanent errors (e.g., bad credentials)
                throw lastError;
            }
        }
    }
    throw lastError;
};

// --- Custom Error Class for API ---
class ApiError extends Error {
    isTransient: boolean;
    constructor(message: string, isTransient: boolean = false) {
        super(message);
        this.name = 'ApiError';
        this.isTransient = isTransient;
    }
}


// --- API Functions ---
export interface CheckResult {
    found: boolean;
    appointmentDate?: string;
    message: string;
}

export const checkForAppointment = async (person: Person): Promise<CheckResult> => {
    
    const task = async (): Promise<CheckResult> => {
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

        // Simulate a transient 503 error
        if (Math.random() < 0.1) {
            throw new ApiError('Randevu kontrolü başarısız: Sunucu geçici olarak meşgul (503).', true);
        }

        const earliest = person.earliestDate ? new Date(person.earliestDate) : new Date();
        const latest = person.latestDate ? new Date(person.latestDate) : new Date(new Date().setMonth(new Date().getMonth() + 3));
        
        if (Math.random() < 0.15) {
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

    try {
        return await retryWithExponentialBackoff(task, 3, 1500, (err, attempt) => {
             console.warn(`Attempt ${attempt} failed for checkForAppointment: ${err.message}. Retrying...`);
        });
    } catch (error: any) {
         console.error(`Final attempt failed for checkForAppointment: ${error.message}`);
         return { found: false, message: `Hata: ${error.message}` };
    }
};

export interface BookingResult {
    success: boolean;
    confirmationId?: string;
    error?: string;
}

export const bookAppointment = async (person: Person, date: string, settings: ApiSettings, smsCode?: string): Promise<BookingResult> => {
    
    const task = async (): Promise<BookingResult> => {
        console.log(`Booking for ${person.fullName} on ${date} using API: ${settings.url}`);
        await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
        if (!settings.token) {
            throw new ApiError("API Token ayarlanmamış. Lütfen ayarlardan kontrol edin.");
        }
        
        const needsAuth = PORTALS_REQUIRING_AUTH.includes(person.portal);
        if (needsAuth) {
            if (!person.portalCredentials?.username || !person.portalCredentials?.password) {
                 throw new ApiError("Portal kullanıcı adı veya şifresi eksik. Lütfen kişi bilgilerini güncelleyin.");
            }
            if (!smsCode) {
                 throw new ApiError("SMS doğrulama kodu girilmedi.");
            }
            if (smsCode.length < 6) {
                 throw new ApiError("Girilen SMS kodu geçersiz veya eksik.");
            }
        }
        
        // Simulate transient API failure rate
        if (Math.random() < 0.15) {
            throw new ApiError("API sunucusundan beklenmedik bir hata alındı (500).", true);
        }
    
        return {
            success: true,
            confirmationId: `CONF-${Date.now()}`
        };
    };

    try {
        return await retryWithExponentialBackoff(task, 3, 2000, (err, attempt) => {
             console.warn(`Attempt ${attempt} failed for bookAppointment: ${err.message}. Retrying...`);
        });
    } catch (error: any) {
        console.error(`Final attempt failed for bookAppointment: ${error.message}`);
        return { success: false, error: error.message };
    }
};

export const checkApiHealth = async (settings: ApiSettings): Promise<{ ok: boolean; message: string }> => {
    // Simulate a network call to a health endpoint
    await new Promise(resolve => setTimeout(resolve, 500));

    if (!settings.url || !settings.enabled) {
        return { ok: false, message: 'API pasif veya URL ayarlanmamış.' };
    }

    // Simulate a failure if the token is short or URL is bad
    if (settings.token.length < 5 || !settings.url.startsWith('http')) {
        return { ok: false, message: 'API bağlantı hatası. Ayarları kontrol edin.' };
    }

    // Simulate random downtime
    if (Math.random() < 0.1) {
        return { ok: false, message: 'API sunucusu yanıt vermiyor (503 Service Unavailable).' };
    }

    return { ok: true, message: 'API bağlantısı başarılı.' };
};