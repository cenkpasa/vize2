
export enum Status {
    Running = 'RUNNING',
    Paused = 'PAUSED',
    Stopped = 'STOPPED',
    Completed = 'COMPLETED',
}

export enum AgentModel {
    Hybrid = 'hybrid',
    AIHeuristic = 'ai_heuristic',
    Rule = 'rule',
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
