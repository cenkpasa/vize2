
export enum Status {
    Running = 'RUNNING',
    Paused = 'PAUSED',
    Stopped = 'STOPPED',
    Completed = 'COMPLETED',
    AwaitingSms = 'AWAITING_SMS',
}

export enum AgentModel {
    Hybrid = 'hybrid',
    AIHeuristic = 'ai_heuristic',
    Rule = 'rule',
}

export enum ApiHealthStatus {
    OK = 'OK',
    Error = 'Error',
    Checking = 'Checking',
}

export interface PortalCredentials {
    username?: string;
    password?: string;
}

export interface Person {
    id: number;
    fullName: string;
    passportNo: string;
    birthDate: string;
    phone: string;
    email: string;
    telegramId: string;
    country: string;
    portal: string;
    city: string;
    center: string;
    visaType: string;
    earliestDate: string;
    latestDate: string;
    status: Status;
    appointmentDate: string | null;
    portalCredentials?: PortalCredentials;
    reminderSet?: boolean;
    reminderSent?: boolean;
}

export interface Log {
    id: number;
    timestamp: string;
    message: string;
    type: 'info' | 'success' | 'error' | 'warning';
}

export interface ApiSettings {
    url: string;
    token: string;
    enabled: boolean;
}

export interface NotificationSettings {
    browserNotify: boolean;
    soundNotify: boolean;
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}