import React, { useState, useEffect, useRef } from 'react';
import {
    LayoutDashboard,
    FolderKanban,
    FileText,
    DollarSign,
    Settings,
    Plus,
    Search,
    Bell,
    BellOff,
    Check,
    CheckCheck,
    User,
    TrendingUp,
    CheckCircle2,
    Clock,
    MessageSquare,
    Bot,
    Table,
    Menu,
    X,
    Upload
} from 'lucide-react';
import { Project, FinancialSummary, ClientMessage, CommunicationStats, AutoResponseSettings, MessageStatus, AppNotification, UserProfile } from './types';
import { MOCK_PROJECTS } from './data/mockData';
import { MOCK_MESSAGES, DEFAULT_AUTO_RESPONSE_SETTINGS } from './data/mockCommunicationData';
import ProjectCard from './components/ProjectCard';
import SubmissionTimeline from './components/SubmissionTimeline';
import FinancialOverview from './components/FinancialOverview';
import CommunicationDashboard from './components/CommunicationDashboard';
import AutoResponseSettingsPanel from './components/AutoResponseSettingsPanel';
import NewProjectModal from './components/NewProjectModal';
import ProjectDetailView from './components/ProjectDetailView';
import GanttChart from './components/GanttChart';
import AIChatContainer from './components/AIChatContainer';
import DatabaseManager from './components/DatabaseManager';

type ViewMode = 'dashboard' | 'projects' | 'submissions' | 'finances' | 'communications' | 'ai-chat' | 'database' | 'profile';

const SUBMISSION_TYPE_NAMES: Record<string, string> = {
    'planning-permission': 'Planning Permission',
    'building-permit': 'Building Permit',
    'structural-approval': 'Structural Approval',
    'fire-safety': 'Fire Safety',
    'environmental-impact': 'Environmental Impact',
    'other': 'Submission'
};

function formatNotificationTime(timestamp: string) {
    try {
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return '';
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-MY', { month: 'short', day: 'numeric' });
    } catch {
        return '';
    }
}

export default function App() {
    const [projects, setProjects] = useState<Project[]>(() => {
        try {
            const saved = localStorage.getItem('ytz_projects');
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.error(e);
        }
        return MOCK_PROJECTS;
    });

    useEffect(() => {
        try {
            localStorage.setItem('ytz_projects', JSON.stringify(projects));
        } catch (e) {
            console.error(e);
        }
    }, [projects]);
    const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
    const [searchQuery, setSearchQuery] = useState('');
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [viewingProject, setViewingProject] = useState<Project | null>(null);
    // Communication Manager State
    const [messages, setMessages] = useState<ClientMessage[]>(() => {
        try {
            const saved = localStorage.getItem('ytz_messages');
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.error(e);
        }
        return MOCK_MESSAGES;
    });

    // Notification State
    const [readNotificationIds, setReadNotificationIds] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem('ytz_read_notification_ids');
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.error(e);
        }
        return [];
    });

    const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

    // Profile State
    const [profile, setProfile] = useState<UserProfile>(() => {
        try {
            const saved = localStorage.getItem('ytz_profile');
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.error(e);
        }
        return { username: 'yeatz', fullName: 'Yeatz', role: 'Architect', company: 'VECTRA' };
    });

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileDraft, setProfileDraft] = useState<UserProfile>(profile);

    useEffect(() => {
        try {
            localStorage.setItem('ytz_profile', JSON.stringify(profile));
        } catch (e) {
            console.error(e);
        }
    }, [profile]);

    const startEditProfile = () => {
        setProfileDraft(profile);
        setIsEditingProfile(true);
    };

    const saveProfile = () => {
        setActiveProfile(profileDraft);
        setIsEditingProfile(false);
    };

    const cancelEditProfile = () => {
        setProfileDraft(profile);
        setIsEditingProfile(false);
    };

    const activeProfile = isEditingProfile ? profileDraft : profile;
    const setActiveProfile = isEditingProfile ? setProfileDraft : setProfile;
    const notificationsRef = useRef<HTMLDivElement>(null);

    const [autoResponseSettings, setAutoResponseSettings] = useState<AutoResponseSettings>(DEFAULT_AUTO_RESPONSE_SETTINGS);
    const [showSettingsPanel, setShowSettingsPanel] = useState(false);

    useEffect(() => {
        try {
            localStorage.setItem('ytz_read_notification_ids', JSON.stringify(readNotificationIds));
        } catch (e) {
            console.error(e);
        }
    }, [readNotificationIds]);

    useEffect(() => {
        try {
            localStorage.setItem('ytz_messages', JSON.stringify(messages));
        } catch (e) {
            console.error(e);
        }
    }, [messages]);

    // Close notifications dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setShowNotificationsDropdown(false);
            }
        };

        if (showNotificationsDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }
    
    return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showNotificationsDropdown]);

    // AI Chat State
    const [hfApiKey, setHfApiKey] = useState<string>(() => {
        return localStorage.getItem('hf_api_key') || '';
    });

    const handleSaveHfApiKey = (apiKey: string) => {
        setHfApiKey(apiKey);
        localStorage.setItem('hf_api_key', apiKey);
    };

    // Mobile sidebar state
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        // Initially open on desktop (larger screens), closed on mobile
        return typeof window !== 'undefined' ? window.innerWidth >= 1024 : false;
    });
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            const isCurrentlyMobile = window.innerWidth < 1024; // Changed to lg breakpoint (1024px)
            setIsMobile(isCurrentlyMobile);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

    
    return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    const handleMessageStatusChange = (messageId: string, status: MessageStatus) => {
        setMessages(prev => prev.map(msg =>
            msg.id === messageId ? { ...msg, status, isRead: true } : msg
        ));
        const notifId = `msg-${messageId}`;
        setReadNotificationIds(prev => prev.includes(notifId) ? prev : [...prev, notifId]);
    };

    const handleMarkMessageAsRead = (messageId: string, isRead: boolean = true) => {
        setMessages(prev => prev.map(msg =>
            msg.id === messageId ? { ...msg, isRead } : msg
        ));
        const notifId = `msg-${messageId}`;
        setReadNotificationIds(prev => {
            if (isRead) {
                return prev.includes(notifId) ? prev : [...prev, notifId];
            } else {
                return prev.filter(id => id !== notifId);
            }
        });
    };

    const handleMarkAllMessagesAsRead = () => {
        setMessages(prev => prev.map(msg => ({ ...msg, isRead: true })));
        const msgNotifIds = messages.map(m => `msg-${m.id}`);
        setReadNotificationIds(prev => Array.from(new Set([...prev, ...msgNotifIds])));
    };

    const handleSaveSettings = (newSettings: AutoResponseSettings) => {
        setAutoResponseSettings(newSettings);
        // In production, this would save to backend/database
        localStorage.setItem('autoResponseSettings', JSON.stringify(newSettings));
    };

    const handleSaveProject = (projectData: Omit<Project, 'id'>) => {
        if (editingProject) {
            // Update existing
            const updated = { ...projectData, id: editingProject.id };
            setProjects(prev => prev.map(p =>
                p.id === editingProject.id ? updated : p
            ));
            setViewingProject(prev => (prev && prev.id === editingProject.id ? updated : prev));
            setEditingProject(null);
        } else {
            // Create new
            const newProject: Project = {
                ...projectData,
                id: `project-${Date.now()}`
            };
            setProjects(prev => [newProject, ...prev]);
            setViewMode('projects');
        }
    };

    const handleEditProject = (project: Project) => {
        setEditingProject(project);
        setShowNewProjectModal(true);
    };

    const handleViewProject = (project: Project) => {
        setViewingProject(project);
    };

    const handleDeleteProject = (projectId: string) => {
        if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            setProjects(prev => prev.filter(p => p.id !== projectId));
        }
    };


    // Calculate financial summary
    const financialSummary: FinancialSummary = {
        totalProjects: projects.length,
        activeProjects: projects.filter(p =>
            ['concept', 'design-development', 'submission-prep', 'submitted'].includes(p.status)
        ).length,
        totalConsultantFees: projects.reduce((sum, project) =>
            sum + project.submissions.reduce((subSum, sub) => subSum + sub.consultantFee, 0), 0
        ),
        pendingSubmissions: projects.reduce((sum, project) =>
            sum + project.submissions.filter(s => s.status === 'pending').length, 0
        ),
        approvedSubmissions: projects.reduce((sum, project) =>
            sum + project.submissions.filter(s => s.status === 'approved').length, 0
        )
    };

    // Calculate aggregated notifications (only unread ones are shown; read notifications disappear)
    const notifications: AppNotification[] = [
        // Submissions requiring attention
        ...projects.flatMap(p =>
            p.submissions
                .filter(s => s.status === 'pending' || s.status === 'resubmission-required')
                .map(s => {
                    const notifId = `sub-${p.id}-${s.id}`;
                    const typeName = SUBMISSION_TYPE_NAMES[s.type] || s.type;
                    return {
                        id: notifId,
                        type: 'submission' as const,
                        title: s.status === 'pending' ? `Pending: ${typeName}` : `Resubmission: ${typeName}`,
                        description: `${p.title} (${s.authority})`,
                        timestamp: s.submittedDate || p.startDate,
                        isRead: readNotificationIds.includes(notifId),
                        priority: s.status === 'resubmission-required' ? 'high' as const : 'medium' as const,
                        actionView: 'submissions' as const,
                        actionTargetId: s.id
                    };
                })
                .filter(n => !n.isRead)
        ),
        // Messages requiring attention
        ...messages
            .filter(m => (m.status === 'new' || (m.requiresHumanReview && m.status !== 'resolved' && m.status !== 'archived')) && !(readNotificationIds.includes(`msg-${m.id}`) || !!m.isRead))
            .map(m => {
                const notifId = `msg-${m.id}`;
                return {
                    id: notifId,
                    type: 'message' as const,
                    title: m.priority === 'urgent' ? 'Urgent Client Message' : m.status === 'new' ? 'New Message Received' : 'Message Requires Review',
                    description: `${m.clientName}: "${m.content.slice(0, 60)}${m.content.length > 60 ? '...' : ''}"`,
                    timestamp: m.timestamp,
                    isRead: false,
                    priority: m.priority,
                    actionView: 'communications' as const,
                    actionTargetId: m.id
                };
            })
    ];

    const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;
    const unreadSubmissionsCount = notifications.filter(n => n.type === 'submission' && !n.isRead).length;
    const unreadNewMessagesCount = messages.filter(m => m.status === 'new' && !m.isRead).length;

    const communicationStats: CommunicationStats = {
        totalMessages: messages.length,
        newMessages: unreadNewMessagesCount,
        aiResponded: messages.filter(m => m.status === 'ai-responded').length,
        escalated: messages.filter(m => m.status === 'escalated').length,
        resolved: messages.filter(m => m.status === 'resolved').length,
        averageResponseTime: 5,
        weekendMessagesBlocked: 8
    };

    const handleMarkNotificationAsRead = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setReadNotificationIds(prev => prev.includes(id) ? prev : [...prev, id]);
        if (id.startsWith('msg-')) {
            const msgId = id.replace('msg-', '');
            setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isRead: true } : m));
        }
    };

    const handleMarkAllNotificationsAsRead = () => {
        const allIds = notifications.map(n => n.id);
        setReadNotificationIds(prev => Array.from(new Set([...prev, ...allIds])));
        setMessages(prev => prev.map(m => ({ ...m, isRead: true })));
    };

    const handleClearAllNotifications = () => {
        handleMarkAllNotificationsAsRead();
        setShowNotificationsDropdown(false);
    };

    const handleNotificationClick = (notification: AppNotification) => {
        handleMarkNotificationAsRead(notification.id);
        if (notification.actionView) {
            setViewMode(notification.actionView);
            if (isMobile) setSidebarOpen(false);
        }
        setShowNotificationsDropdown(false);
    };

    const filteredProjects = projects.filter(project =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Full-window project details (in the same tab, not a pop-out modal)
    if (viewingProject) {
        const currentProject = projects.find(p => p.id === viewingProject.id) || viewingProject;
    
    return (
            <div className="min-h-screen bg-[#F6F4F1] text-[#222222]">
                <ProjectDetailView
                    project={currentProject}
                    onBack={() => setViewingProject(null)}
                    onEdit={(project) => {
                        setEditingProject(project);
                        setShowNewProjectModal(true);
                    }}
                    onDelete={(projectId) => {
                        setProjects(prev => prev.filter(p => p.id !== projectId));
                        setViewingProject(null);
                    }}
                    onUpdate={(updated) => {
                        setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
                        setViewingProject(updated);
                    }}
                />
                {showNewProjectModal && (
                    <NewProjectModal
                        onClose={() => {
                            setShowNewProjectModal(false);
                            setEditingProject(null);
                        }}
                        onSave={handleSaveProject}
                        initialData={editingProject || undefined}
                    />
                )}
            </div>
        );
    }


    // Full-page new project form in a dedicated tab
    const isNewProject = new URLSearchParams(window.location.search).get('newProject') === '1';
    if (isNewProject) {
        return (
            <div className="min-h-screen bg-[#F6F4F1] text-[#222222]">
                <NewProjectModal
                    fullPage
                    onClose={() => { window.location.href = `${window.location.origin}${window.location.pathname}`; }}
                    onSave={(data) => {
                        handleSaveProject(data);
                        window.location.href = `${window.location.origin}${window.location.pathname}`;
                    }}
                />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#F6F4F1] text-[#222222]">
            {/* Mobile menu button */}
            <button
                className={`fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#222222]/8 lg:hidden ${sidebarOpen ? 'hidden' : 'block'
                    }`}
                onClick={() => setSidebarOpen(true)}
            >
                <Menu size={24} />
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 h-full w-80 lg:w-64 shrink-0 glass border-r border-[#222222]/8 flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0`}
            >
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-red-600/20">
                        <img src="/vectra-logo.svg" alt="VECTRA Logo" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <span className="font-display font-bold text-xl tracking-tight block">VECTRA</span>
                        <span className="text-xs text-[#5a5a5a]">Built for Project Excellence</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
                    <NavItem
                        icon={<LayoutDashboard size={20} />}
                        label="Dashboard"
                        active={viewMode === 'dashboard'}
                        onClick={() => {
                            setViewMode('dashboard');
                            if (isMobile) setSidebarOpen(false);
                        }}
                    />
                    <NavItem
                        icon={<FolderKanban size={20} />}
                        label="Projects"
                        active={viewMode === 'projects'}
                        onClick={() => {
                            setViewMode('projects');
                            if (isMobile) setSidebarOpen(false);
                        }}
                    />
                    <NavItem
                        icon={<FileText size={20} />}
                        label="Submissions"
                        active={viewMode === 'submissions'}
                        onClick={() => {
                            setViewMode('submissions');
                            if (isMobile) setSidebarOpen(false);
                            // Mark submission notifications as read since user is viewing submissions
                            const subIds = notifications.filter(n => n.type === 'submission').map(n => n.id);
                            setReadNotificationIds(prev => Array.from(new Set([...prev, ...subIds])));
                        }}
                        badge={unreadSubmissionsCount}
                    />
                    <NavItem
                        icon={<DollarSign size={20} />}
                        label="Finances"
                        active={viewMode === 'finances'}
                        onClick={() => {
                            setViewMode('finances');
                            if (isMobile) setSidebarOpen(false);
                        }}
                    />
                    <NavItem
                        icon={<MessageSquare size={20} />}
                        label="Communications"
                        active={viewMode === 'communications'}
                        onClick={() => {
                            setViewMode('communications');
                            if (isMobile) setSidebarOpen(false);
                        }}
                        badge={communicationStats.newMessages}
                    />
                    <NavItem
                        icon={<Bot size={20} />}
                        label="AI Assistant"
                        active={viewMode === 'ai-chat'}
                        onClick={() => {
                            setViewMode('ai-chat');
                            if (isMobile) setSidebarOpen(false);
                        }}
                    />
                    <NavItem
                        icon={<Table size={20} />}
                        label="Database"
                        active={viewMode === 'database'}
                        onClick={() => {
                            setViewMode('database');
                            if (isMobile) setSidebarOpen(false);
                        }}
                    />
                    <NavItem
                        icon={<User size={20} />}
                        label="Profile"
                        active={viewMode === 'profile'}
                        onClick={() => {
                            setViewMode('profile');
                            if (isMobile) setSidebarOpen(false);
                        }}
                    />
                </nav>

                <div className="p-4 border-t border-[#222222]/8">
                    <NavItem
                        icon={<Settings size={20} />}
                        label="Settings"
                        onClick={() => {
                            setShowSettingsPanel(true);
                            if (isMobile) setSidebarOpen(false);
                        }}
                    />
                    <div className="mt-4 p-4 rounded-xl bg-[#222222]/5 flex items-center gap-3 cursor-pointer" onClick={() => { setViewMode('profile'); if (isMobile) setSidebarOpen(false); }}>
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-tr from-red-600 to-orange-400 flex items-center justify-center shrink-0">
                            {activeProfile.photo ? (
                                <img src={activeProfile.photo} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User size={20} />
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{activeProfile.fullName || activeProfile.username}</p>
                            <p className="text-xs text-[#5a5a5a] truncate">{activeProfile.role || 'User'}</p>
                        </div>
                    </div>
                </div>

                {/* Close button for mobile */}
                <button
                    className="absolute top-4 right-4 p-1 rounded-lg bg-[#222222]/8 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                >
                    <X size={20} />
                </button>
            </aside>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Main Content */}
            <main className={`flex-1 transition-all duration-300 ${isMobile ? 'p-4' : 'p-8'} grid-bg relative lg:ml-64 overflow-x-hidden`}>
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="relative group w-full md:w-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a8a8a] group-focus-within:text-red-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            className="pl-12 pr-6 py-3 bg-[#222222]/5 border border-[#222222]/8 rounded-2xl w-full md:w-96 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all focus:bg-[#222222]/8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4">
                        <div className="relative" ref={notificationsRef}>
                            <button
                                onClick={() => setShowNotificationsDropdown(prev => !prev)}
                                className={`p-3 bg-[#222222]/5 border rounded-xl hover:bg-[#222222]/8 transition-colors relative ${
                                    showNotificationsDropdown ? 'border-red-500/50 text-[#222222]' : 'border-[#222222]/8 text-[#5a5a5a]'
                                }`}
                                title="Notifications"
                                aria-label="Notifications"
                            >
                                <Bell size={20} className={unreadNotificationsCount > 0 ? "text-[#333333]" : "text-[#5a5a5a]"} />
                                {unreadNotificationsCount > 0 && (
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#F6F4F1]"></span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotificationsDropdown && (
                                <div className="absolute right-0 mt-3 w-80 sm:w-96 glass bg-[#E4DED2]/95 backdrop-blur-xl border border-[#222222]/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in">
                                    <div className="p-4 border-b border-[#222222]/8 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-[#222222]">Notifications</span>
                                            {unreadNotificationsCount > 0 ? (
                                                <span className="px-2 py-0.5 text-xs font-semibold bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
                                                    {unreadNotificationsCount} new
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 text-xs font-medium bg-green-500/10 text-green-400 rounded-full">
                                                    All read
                                                </span>
                                            )}
                                        </div>
                                        {unreadNotificationsCount > 0 ? (
                                            <button
                                                onClick={handleMarkAllNotificationsAsRead}
                                                className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors flex items-center gap-1"
                                                title="Mark all notifications as read"
                                            >
                                                <CheckCheck size={14} />
                                                Mark all read
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setReadNotificationIds([])}
                                                className="text-[11px] text-[#8a8a8a] hover:text-[#5a5a5a] transition-colors"
                                                title="Reset notifications demo"
                                            >
                                                Reset
                                            </button>
                                        )}
                                    </div>

                                    <div className="max-h-80 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center text-[#5a5a5a]">
                                                <BellOff size={28} className="mx-auto mb-2 opacity-40" />
                                                <p className="text-sm">No notifications</p>
                                            </div>
                                        ) : (
                                            notifications.map((notif) => (
                                                <div
                                                    key={notif.id}
                                                    onClick={() => handleNotificationClick(notif)}
                                                    className={`p-3.5 hover:bg-[#222222]/5 transition-colors cursor-pointer flex items-start gap-3 relative ${
                                                        notif.isRead ? 'opacity-60' : 'bg-[#222222]/[0.03]'
                                                    }`}
                                                >
                                                    {!notif.isRead && (
                                                        <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2 mb-1">
                                                            <h4 className={`text-xs font-semibold truncate ${notif.isRead ? 'text-[#444444]' : 'text-[#222222]'}`}>
                                                                {notif.title}
                                                            </h4>
                                                            <span className="text-[10px] text-[#8a8a8a] shrink-0">
                                                                {formatNotificationTime(notif.timestamp)}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-[#5a5a5a] line-clamp-2 leading-relaxed">
                                                            {notif.description}
                                                        </p>
                                                    </div>
                                                    {!notif.isRead && (
                                                        <button
                                                            onClick={(e) => handleMarkNotificationAsRead(notif.id, e)}
                                                            className="p-1 hover:bg-[#222222]/8 rounded text-[#5a5a5a] hover:text-green-400 transition-colors shrink-0"
                                                            title="Mark as read"
                                                        >
                                                            <Check size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {notifications.length > 0 && (
                                        <div className="p-2.5 bg-[#222222]/[0.03] border-t border-[#222222]/8 flex items-center justify-between gap-2">
                                            <button
                                                onClick={handleClearAllNotifications}
                                                className="text-xs text-[#5a5a5a] hover:text-[#222222] transition-colors py-1 px-2 font-medium"
                                                title="Mark all read and clear the red notification sign"
                                            >
                                                Remove notification sign
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setViewMode('submissions');
                                                    setShowNotificationsDropdown(false);
                                                }}
                                                className="text-xs text-red-400 hover:text-red-300 transition-colors py-1 px-2 font-medium"
                                            >
                                                View submissions →
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => {
                                const url = `${window.location.origin}${window.location.pathname}?newProject=1`;
                                window.open(url, '_blank');
                            }}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-red-600/20 active:scale-95 whitespace-nowrap"
                        >
                            <Plus size={20} />
                            <span>New Project</span>
                        </button>
                    </div>
                </header>

                {/* Dashboard View */}
                {viewMode === 'dashboard' && (
                    <>
                        {/* Hero Section */}
                        <section className="mb-12 animate-fade-in">
                            <h1 className="text-4xl font-display font-bold mb-4">Good morning, Yeatz!</h1>
                            <p className="text-[#5a5a5a] max-w-2xl">
                                You have <span className="text-red-500 font-semibold">{financialSummary.activeProjects} active projects</span> and{' '}
                                <span className="text-amber-500 font-semibold">{financialSummary.pendingSubmissions} pending submissions</span> requiring attention.
                            </p>
                        </section>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
                            <StatCard
                                title="Total Projects"
                                value={financialSummary.totalProjects.toString()}
                                sub={`${financialSummary.activeProjects} active`}
                                icon={<FolderKanban size={24} />}
                                color="#dc2626"
                            />
                            <StatCard
                                title="Pending Submissions"
                                value={financialSummary.pendingSubmissions.toString()}
                                sub="Awaiting approval"
                                icon={<Clock size={24} />}
                                color="#f59e0b"
                            />
                            <StatCard
                                title="Approved This Month"
                                value={financialSummary.approvedSubmissions.toString()}
                                sub="+2 from last month"
                                icon={<CheckCircle2 size={24} />}
                                color="#059669"
                            />
                            <StatCard
                                title="Consultant Fees"
                                value={`RM ${(financialSummary.totalConsultantFees / 1000).toFixed(0)}K`}
                                sub="Total tracked"
                                icon={<DollarSign size={24} />}
                                color="#2563eb"
                            />
                        </div>

                        {/* Gantt Chart Timeline */}
                        <section className="mb-12 overflow-x-auto custom-scrollbar">
                            <div className="flex items-center justify-between mb-8 min-w-[600px] md:min-w-0">
                                <h2 className="text-2xl font-display font-bold">Project Timeline</h2>
                                <p className="text-sm text-[#5a5a5a]">Visual overview of all project schedules</p>
                            </div>
                            <div className="min-w-[800px] lg:min-w-0">
                                <GanttChart projects={projects} />
                            </div>
                        </section>

                        {/* Recent Projects */}
                        <section className="mb-12">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-display font-bold">Active Projects</h2>
                                <button
                                    onClick={() => setViewMode('projects')}
                                    className="text-[#5a5a5a] hover:text-[#222222] flex items-center gap-2 text-sm font-medium transition-colors"
                                >
                                    View All <TrendingUp size={16} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProjects.slice(0, 6).map((project) => (
                                    <ProjectCard
                                        key={project.id}
                                        project={project}
                                        onView={handleViewProject}
                                        onEdit={handleEditProject}
                                        onDelete={handleDeleteProject}
                                    />
                                ))}
                            </div>
                        </section>

                        {/* Financial Overview */}
                        <FinancialOverview projects={projects} />
                    </>
                )}

                {/* Projects View */}
                {viewMode === 'projects' && (
                    <>
                        <section className="mb-8 animate-fade-in">
                            <h1 className="text-4xl font-display font-bold mb-4">All Projects</h1>
                            <p className="text-[#5a5a5a]">Manage your architecture projects and track their progress</p>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProjects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    onView={handleViewProject}
                                    onEdit={handleEditProject}
                                    onDelete={handleDeleteProject}
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* Submissions View */}
                {viewMode === 'submissions' && (
                    <>
                        <section className="mb-8 animate-fade-in">
                            <h1 className="text-4xl font-display font-bold mb-4">Submission Tracking</h1>
                            <p className="text-[#5a5a5a]">Monitor all submissions to local authorities</p>
                        </section>

                        <SubmissionTimeline projects={projects} />
                    </>
                )}

                {/* Finances View */}
                {viewMode === 'finances' && (
                    <>
                        <section className="mb-8 animate-fade-in">
                            <h1 className="text-4xl font-display font-bold mb-4">Financial Overview</h1>
                            <p className="text-[#5a5a5a]">Track consultant fees and project budgets</p>
                        </section>

                        <FinancialOverview projects={projects} detailed />
                    </>
                )}

                {/* Communications View */}
                {viewMode === 'communications' && (
                    <>
                        <section className="mb-8 animate-fade-in">
                            <h1 className="text-4xl font-display font-bold mb-4">AI Communication Manager</h1>
                            <p className="text-[#5a5a5a]">Intelligent client message handling with Claude AI auto-response</p>
                        </section>

                        <CommunicationDashboard
                            messages={messages}
                            stats={communicationStats}
                            onMessageStatusChange={handleMessageStatusChange}
                            onMarkAsRead={handleMarkMessageAsRead}
                            onMarkAllAsRead={handleMarkAllMessagesAsRead}
                            onOpenSettings={() => setShowSettingsPanel(true)}
                        />
                    </>
                )}

                {/* AI Chat View */}
                {viewMode === 'ai-chat' && (
                    <>
                        <section className="mb-8 animate-fade-in">
                            <h1 className="text-4xl font-display font-bold mb-4">AI Assistant</h1>
                            <p className="text-[#5a5a5a]">Chat with our AI assistant powered by Hugging Face models</p>
                        </section>

                        <div className="h-[calc(100vh-250px)]">
                            <AIChatContainer hfApiKey={hfApiKey} onSaveApiKey={handleSaveHfApiKey} />
                        </div>
                    </>
                )}

                {/* Database View */}
                {viewMode === 'database' && (
                    <>
                        <section className="mb-8 animate-fade-in">
                            <h1 className="text-4xl font-display font-bold mb-4">Database Manager</h1>
                            <p className="text-[#5a5a5a]">Manage your projects, tasks, clients and documents</p>
                        </section>

                        <div className="h-[calc(100vh-250px)]">
                            <DatabaseManager />
                        </div>
                    </>
                )}

                {/* Profile View */}
                {viewMode === 'profile' && (
                    <section className="max-w-3xl animate-fade-in">
                        <h1 className="text-4xl font-display font-bold mb-4">Profile</h1>
                        <p className="text-[#5a5a5a] mb-8">Manage your personal and company details</p>

                        <div className="glass rounded-2xl p-6 md:p-8 space-y-6">
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-full overflow-hidden bg-[#222222]/10 border border-[#222222]/10 flex items-center justify-center shrink-0">
                                    {activeProfile.photo ? (
                                        <img src={activeProfile.photo} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={40} className="text-[#8a8a8a]" />
                                    )}
                                </div>
                                <div className="space-y-2">
                                    {isEditingProfile && (
                                        <>
                                            <label className="flex items-center gap-2 px-4 py-2.5 bg-[#222222]/5 hover:bg-[#222222]/10 border border-[#222222]/10 rounded-xl cursor-pointer transition-all text-sm font-medium">
                                                <Upload size={16} />
                                                Upload photo
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file) return;
                                                        const reader = new FileReader();
                                                        reader.onload = () => setActiveProfile(p => ({ ...p, photo: reader.result as string }));
                                                        reader.readAsDataURL(file);
                                                        e.target.value = '';
                                                    }}
                                                />
                                            </label>
                                            {activeProfile.photo && (
                                                <button
                                                    onClick={() => setActiveProfile(p => ({ ...p, photo: undefined }))}
                                                    className="text-xs text-red-500 hover:text-red-600"
                                                >
                                                    Remove photo
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            <fieldset disabled={!isEditingProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6 border-0 p-0 m-0 min-w-0">
                                <div>
                                    <label className="text-sm font-medium text-[#5a5a5a] mb-2 block">Username</label>
                                    <input
                                        type="text"
                                        value={activeProfile.username}
                                        onChange={e => setActiveProfile(p => ({ ...p, username: e.target.value }))}
                                        className="w-full px-4 py-3 bg-white/60 border border-[#222222]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F95C4B]/50 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-[#5a5a5a] mb-2 block">Full Name</label>
                                    <input
                                        type="text"
                                        value={activeProfile.fullName}
                                        onChange={e => setActiveProfile(p => ({ ...p, fullName: e.target.value }))}
                                        className="w-full px-4 py-3 bg-white/60 border border-[#222222]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F95C4B]/50 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-[#5a5a5a] mb-2 block">Email</label>
                                    <input
                                        type="email"
                                        value={activeProfile.email || ''}
                                        onChange={e => setActiveProfile(p => ({ ...p, email: e.target.value }))}
                                        className="w-full px-4 py-3 bg-white/60 border border-[#222222]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F95C4B]/50 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-[#5a5a5a] mb-2 block">Phone</label>
                                    <input
                                        type="tel"
                                        value={activeProfile.phone || ''}
                                        onChange={e => setActiveProfile(p => ({ ...p, phone: e.target.value }))}
                                        className="w-full px-4 py-3 bg-white/60 border border-[#222222]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F95C4B]/50 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-[#5a5a5a] mb-2 block">Company</label>
                                    <input
                                        type="text"
                                        value={activeProfile.company || ''}
                                        onChange={e => setActiveProfile(p => ({ ...p, company: e.target.value }))}
                                        className="w-full px-4 py-3 bg-white/60 border border-[#222222]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F95C4B]/50 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-[#5a5a5a] mb-2 block">Role / Title</label>
                                    <input
                                        type="text"
                                        value={activeProfile.role || ''}
                                        onChange={e => setActiveProfile(p => ({ ...p, role: e.target.value }))}
                                        className="w-full px-4 py-3 bg-white/60 border border-[#222222]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F95C4B]/50 transition-all"
                                    />
                                </div>
                            </fieldset>
                            <div>
                                <label className="text-sm font-medium text-[#5a5a5a] mb-2 block">Bio</label>
                                <textarea
                                    rows={3}
                                    disabled={!isEditingProfile}
                                    value={activeProfile.bio || ''}
                                    onChange={e => setActiveProfile(p => ({ ...p, bio: e.target.value }))}
                                    className="w-full px-4 py-3 bg-white/60 border border-[#222222]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F95C4B]/50 transition-all resize-none disabled:opacity-60 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                                {!isEditingProfile ? (
                                    <button
                                        onClick={startEditProfile}
                                        className="px-5 py-2.5 bg-[#F95C4B] hover:bg-[#e04a3a] text-white rounded-xl text-sm font-medium transition-all"
                                    >
                                        Edit Profile
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={saveProfile}
                                            className="px-5 py-2.5 bg-[#F95C4B] hover:bg-[#e04a3a] text-white rounded-xl text-sm font-medium transition-all"
                                        >
                                            Save Changes
                                        </button>
                                        <button
                                            onClick={cancelEditProfile}
                                            className="px-5 py-2.5 bg-[#222222]/5 hover:bg-[#222222]/10 rounded-xl text-sm font-medium transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </section>
                )}
            </main>

            {/* New Project Modal */}
            {showNewProjectModal && (
                <NewProjectModal
                    onClose={() => {
                        setShowNewProjectModal(false);
                        setEditingProject(null);
                    }}
                    onSave={handleSaveProject}
                    initialData={editingProject || undefined}
                />
            )}

            {/* Project details now open in a dedicated tab (see above) */}

            {/* Settings Panel */}
            {showSettingsPanel && (
                <AutoResponseSettingsPanel
                    settings={autoResponseSettings}
                    onSave={handleSaveSettings}
                    onClose={() => setShowSettingsPanel(false)}
                />
            )}
        </div>
    );
}

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onClick: () => void;
    badge?: number;
}

function NavItem({ icon, label, active = false, onClick, badge }: NavItemProps) {

    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 relative ${active
                ? 'bg-red-600/10 text-red-500 border border-red-500/20'
                : 'text-[#5a5a5a] hover:bg-[#222222]/5 hover:text-[#222222]'
                }`}
        >
            {icon}
            <span className="font-medium">{label}</span>
            {badge !== undefined && badge > 0 && (
                <span className="ml-auto bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                    {badge}
                </span>
            )}
        </button>
    );
}

interface StatCardProps {
    title: string;
    value: string;
    sub: string;
    color: string;
    icon: React.ReactNode;
}

function StatCard({ title, value, sub, color, icon }: StatCardProps) {

    return (
        <div className="glass p-6 rounded-2xl relative overflow-hidden group hover:border-[#222222]/10 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/10 to-transparent rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>
            <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20`, color }}>
                    {icon}
                </div>
            </div>
            <p className="text-[#5a5a5a] text-sm font-medium mb-2">{title}</p>
            <h3 className="text-3xl font-display font-bold mb-2">{value}</h3>
            <p className="text-xs text-[#8a8a8a]">{sub}</p>
        </div>
    );
}
