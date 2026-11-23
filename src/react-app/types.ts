export type ProjectStatus =
    | 'concept'
    | 'design-development'
    | 'submission-prep'
    | 'submitted'
    | 'approved'
    | 'on-hold'
    | 'completed';

export type SubmissionType =
    | 'planning-permission'
    | 'building-permit'
    | 'structural-approval'
    | 'fire-safety'
    | 'environmental-impact'
    | 'other';

export interface Submission {
    id: string;
    type: SubmissionType;
    authority: string;
    submittedDate?: string;
    expectedApprovalDate?: string;
    approvalDate?: string;
    status: 'pending' | 'approved' | 'rejected' | 'resubmission-required';
    consultantFee: number;
    notes?: string;
}

export interface Project {
    id: string;
    title: string;
    clientName: string;
    clientPhone?: string;
    clientEmail?: string;
    clientCompany?: string;
    location: string;
    description: string;
    status: ProjectStatus;
    startDate: string;
    targetCompletionDate?: string;
    actualCompletionDate?: string;
    totalBudget?: number;
    submissions: Submission[];
    color: string;
    notes?: string;
    sitePhotos?: string[];
    invoices?: Invoice[];
}

export interface Invoice {
    id: string;
    projectId: string;
    number: string;
    amount: number;
    description: string;
    issuedDate: string;
    dueDate?: string;
    status: 'draft' | 'sent' | 'paid';
    notes?: string;
}

export interface FinancialSummary {
    totalProjects: number;
    activeProjects: number;
    totalConsultantFees: number;
    pendingSubmissions: number;
    approvedSubmissions: number;
}

// AI Communication Manager Types
export type MessageSource = 'whatsapp' | 'email' | 'phone' | 'web-form';
export type MessageStatus = 'new' | 'ai-responded' | 'escalated' | 'resolved' | 'archived';
export type MessagePriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ClientMessage {
    id: string;
    clientName: string;
    clientPhone?: string;
    clientEmail?: string;
    source: MessageSource;
    content: string;
    timestamp: string;
    status: MessageStatus;
    priority: MessagePriority;
    aiResponse?: string;
    aiRespondedAt?: string;
    projectId?: string; // Link to existing project if applicable
    tags: string[];
    requiresHumanReview: boolean;
    isRead?: boolean;
}

export interface AppNotification {
    id: string;
    type: 'submission' | 'message' | 'system';
    title: string;
    description: string;
    timestamp: string;
    isRead: boolean;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    actionView?: 'dashboard' | 'projects' | 'submissions' | 'finances' | 'communications' | 'ai-chat' | 'database';
    actionTargetId?: string;
}

export interface AutoResponseSettings {
    enabled: boolean;
    workingHours: {
        start: string; // e.g., "09:00"
        end: string;   // e.g., "18:00"
    };
    workingDays: number[]; // 0-6, where 0 is Sunday
    autoRespondOutsideHours: boolean;
    autoRespondOnWeekends: boolean;
    responseTemplates: {
        weekendMessage: string;
        afterHoursMessage: string;
        generalInquiry: string;
        consultationRequest: string;
        urgentMatter: string;
    };
    escalationKeywords: string[]; // Keywords that trigger human review
    claudeApiKey?: string;
}

export interface UserProfile {
    username: string;
    fullName: string;
    email?: string;
    phone?: string;
    company?: string;
    role?: string;
    bio?: string;
    photo?: string;
}

export type CalendarEventCategory = 'meeting' | 'deadline' | 'reminder' | 'task' | 'other';

export interface CalendarEvent {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD
    startTime?: string; // HH:mm
    endTime?: string; // HH:mm
    allDay: boolean;
    category: CalendarEventCategory;
    color: string;
    description?: string;
}

export interface CalendarNote {
    id: string;
    date: string; // YYYY-MM-DD
    content: string;
    createdAt: string;
    updatedAt: string;
}

export interface CommunicationStats {
    totalMessages: number;
    newMessages: number;
    aiResponded: number;
    escalated: number;
    resolved: number;
    averageResponseTime: number; // in minutes
    weekendMessagesBlocked: number;
}
