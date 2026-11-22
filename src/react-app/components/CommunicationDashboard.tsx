import { useState } from 'react';
import {
    MessageSquare,
    Phone,
    Mail,
    Globe,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Search,
    Settings,
    Bot,
    User,
    Check,
    CheckCheck
} from 'lucide-react';
import { ClientMessage, CommunicationStats, MessageStatus, MessagePriority } from '../types';

interface CommunicationDashboardProps {
    messages: ClientMessage[];
    stats: CommunicationStats;
    onMessageStatusChange: (messageId: string, status: MessageStatus) => void;
    onMarkAsRead?: (messageId: string, isRead?: boolean) => void;
    onMarkAllAsRead?: () => void;
    onOpenSettings: () => void;
}

export default function CommunicationDashboard({
    messages,
    stats,
    onMessageStatusChange,
    onMarkAsRead,
    onMarkAllAsRead,
    onOpenSettings
}: CommunicationDashboardProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<MessageStatus | 'all'>('all');
    const [filterPriority, setFilterPriority] = useState<MessagePriority | 'all'>('all');
    const [selectedMessage, setSelectedMessage] = useState<ClientMessage | null>(null);

    const filteredMessages = messages.filter(msg => {
        const matchesSearch =
            msg.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (msg.clientPhone && msg.clientPhone.includes(searchQuery));

        const matchesStatus = filterStatus === 'all' || msg.status === filterStatus;
        const matchesPriority = filterPriority === 'all' || msg.priority === filterPriority;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    const getSourceIcon = (source: string) => {
        switch (source) {
            case 'whatsapp': return <MessageSquare size={16} />;
            case 'phone': return <Phone size={16} />;
            case 'email': return <Mail size={16} />;
            case 'web-form': return <Globe size={16} />;
            default: return <MessageSquare size={16} />;
        }
    };

    const getStatusColor = (status: MessageStatus) => {
        switch (status) {
            case 'new': return 'text-blue-400 bg-blue-500/10';
            case 'ai-responded': return 'text-green-400 bg-green-500/10';
            case 'escalated': return 'text-amber-400 bg-amber-500/10';
            case 'resolved': return 'text-emerald-400 bg-emerald-500/10';
            case 'archived': return 'text-[#5a5a5a] bg-slate-500/10';
            default: return 'text-[#5a5a5a] bg-slate-500/10';
        }
    };

    const getPriorityColor = (priority: MessagePriority) => {
        switch (priority) {
            case 'urgent': return 'text-red-400 bg-red-500/20';
            case 'high': return 'text-orange-400 bg-orange-500/20';
            case 'medium': return 'text-yellow-400 bg-yellow-500/20';
            case 'low': return 'text-[#5a5a5a] bg-slate-500/20';
            default: return 'text-[#5a5a5a] bg-slate-500/20';
        }
    };

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    title="Total Messages"
                    value={stats.totalMessages.toString()}
                    sub={`${stats.newMessages} new`}
                    icon={<MessageSquare size={24} />}
                    color="#3b82f6"
                />
                <StatCard
                    title="AI Responded"
                    value={stats.aiResponded.toString()}
                    sub={`${Math.round((stats.aiResponded / stats.totalMessages) * 100)}% auto-handled`}
                    icon={<Bot size={24} />}
                    color="#10b981"
                />
                <StatCard
                    title="Needs Review"
                    value={stats.escalated.toString()}
                    sub="Requires attention"
                    icon={<AlertTriangle size={24} />}
                    color="#f59e0b"
                />
                <StatCard
                    title="Avg Response Time"
                    value={`${stats.averageResponseTime}m`}
                    sub="Minutes"
                    icon={<Clock size={24} />}
                    color="#8b5cf6"
                />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="relative group flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a8a8a] group-focus-within:text-red-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search messages, clients, phone numbers..."
                        className="pl-12 pr-6 py-3 bg-[#222222]/5 border border-[#222222]/8 rounded-2xl w-full focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all focus:bg-[#222222]/8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {onMarkAllAsRead && messages.some(m => !m.isRead && (m.status === 'new' || m.requiresHumanReview)) && (
                        <button
                            onClick={onMarkAllAsRead}
                            className="flex items-center gap-2 px-4 py-3 bg-[#222222]/5 border border-[#222222]/8 hover:bg-[#222222]/8 text-[#444444] hover:text-[#222222] rounded-xl text-sm font-medium transition-all"
                            title="Mark all messages as read"
                        >
                            <CheckCheck size={16} className="text-green-400" />
                            <span>Mark all as read</span>
                        </button>
                    )}

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as MessageStatus | 'all')}
                        className="px-4 py-3 bg-[#222222]/5 border border-[#222222]/8 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                    >
                        <option value="all">All Status</option>
                        <option value="new">New</option>
                        <option value="ai-responded">AI Responded</option>
                        <option value="escalated">Escalated</option>
                        <option value="resolved">Resolved</option>
                        <option value="archived">Archived</option>
                    </select>

                    <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value as MessagePriority | 'all')}
                        className="px-4 py-3 bg-[#222222]/5 border border-[#222222]/8 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                    >
                        <option value="all">All Priority</option>
                        <option value="urgent">Urgent</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>

                    <button
                        onClick={onOpenSettings}
                        className="p-3 bg-[#222222]/5 border border-[#222222]/8 rounded-xl hover:bg-[#222222]/8 transition-colors"
                        title="Settings"
                    >
                        <Settings size={20} className="text-[#5a5a5a]" />
                    </button>
                </div>
            </div>

            {/* Messages List */}
            <div className="glass rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#222222]/5 border-b border-[#222222]/8">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-medium text-[#5a5a5a]">Client</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-[#5a5a5a]">Message</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-[#5a5a5a]">Source</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-[#5a5a5a]">Priority</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-[#5a5a5a]">Status</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-[#5a5a5a]">Time</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-[#5a5a5a]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredMessages.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-[#5a5a5a]">
                                        No messages found
                                    </td>
                                </tr>
                            ) : (
                                filteredMessages.map((message) => (
                                    <tr
                                        key={message.id}
                                        className={`hover:bg-[#222222]/5 transition-colors cursor-pointer ${
                                            !message.isRead && (message.status === 'new' || message.requiresHumanReview)
                                                ? 'bg-[#222222]/[0.03]'
                                                : ''
                                        }`}
                                        onClick={() => {
                                            setSelectedMessage(message);
                                            if (!message.isRead && onMarkAsRead) {
                                                onMarkAsRead(message.id, true);
                                            }
                                        }}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2.5">
                                                {!message.isRead && (message.status === 'new' || message.requiresHumanReview) && (
                                                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" title="Unread notification"></span>
                                                )}
                                                <div>
                                                    <p className={`font-medium ${!message.isRead && message.status === 'new' ? 'text-[#222222] font-semibold' : 'text-[#333333]'}`}>
                                                        {message.clientName}
                                                    </p>
                                                    {message.clientPhone && (
                                                        <p className="text-sm text-[#5a5a5a]">{message.clientPhone}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-[#444444] line-clamp-2 max-w-md">
                                                {message.content}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-[#5a5a5a]">
                                                {getSourceIcon(message.source)}
                                                <span className="text-sm capitalize">{message.source}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(message.priority)}`}>
                                                {message.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                                                {message.status.replace('-', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-[#5a5a5a]">
                                                {new Date(message.timestamp).toLocaleString()}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {onMarkAsRead && !message.isRead && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onMarkAsRead(message.id, true);
                                                        }}
                                                        className="p-2 hover:bg-[#222222]/8 rounded-lg transition-colors text-[#5a5a5a] hover:text-green-400"
                                                        title="Mark as read"
                                                    >
                                                        <Check size={16} />
                                                    </button>
                                                )}
                                                {message.status === 'new' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onMessageStatusChange(message.id, 'resolved');
                                                        }}
                                                        className="p-2 hover:bg-green-500/20 rounded-lg transition-colors"
                                                        title="Mark as resolved"
                                                    >
                                                        <CheckCircle2 size={16} className="text-green-400" />
                                                    </button>
                                                )}
                                                {message.requiresHumanReview && (
                                                    <span className="p-2 bg-amber-500/20 rounded-lg" title="Requires review">
                                                        <User size={16} className="text-amber-400" />
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Message Detail Modal */}
            {selectedMessage && (
                <MessageDetailModal
                    message={selectedMessage}
                    onClose={() => setSelectedMessage(null)}
                    onStatusChange={(status) => {
                        onMessageStatusChange(selectedMessage.id, status);
                        setSelectedMessage(null);
                    }}
                    onToggleRead={(isRead) => {
                        if (onMarkAsRead) {
                            onMarkAsRead(selectedMessage.id, isRead);
                            setSelectedMessage(prev => prev ? { ...prev, isRead } : null);
                        }
                    }}
                />
            )}
        </div>
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

interface MessageDetailModalProps {
    message: ClientMessage;
    onClose: () => void;
    onStatusChange: (status: MessageStatus) => void;
    onToggleRead?: (isRead: boolean) => void;
}

function MessageDetailModal({ message, onClose, onStatusChange, onToggleRead }: MessageDetailModalProps) {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="glass rounded-2xl max-w-2xl w-full p-8 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl font-display font-bold">{message.clientName}</h2>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${message.isRead ? 'bg-[#222222]/8 text-[#5a5a5a]' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                                {message.isRead ? 'Read' : 'New / Unread'}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-[#5a5a5a]">
                            {message.clientPhone && <span>📱 {message.clientPhone}</span>}
                            {message.clientEmail && <span>✉️ {message.clientEmail}</span>}
                            <span className="capitalize">via {message.source}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-[#5a5a5a] hover:text-[#222222] transition-colors">
                        ✕
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-sm font-medium text-[#5a5a5a] mb-2">Original Message</h3>
                        <div className="bg-[#222222]/5 rounded-xl p-4 border border-[#222222]/8">
                            <p className="text-[#222222]">{message.content}</p>
                            <p className="text-xs text-[#8a8a8a] mt-2">{new Date(message.timestamp).toLocaleString()}</p>
                        </div>
                    </div>

                    {message.aiResponse && (
                        <div>
                            <h3 className="text-sm font-medium text-[#5a5a5a] mb-2 flex items-center gap-2">
                                <Bot size={16} className="text-green-400" />
                                AI Response
                            </h3>
                            <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                                <p className="text-[#222222]">{message.aiResponse}</p>
                                {message.aiRespondedAt && (
                                    <p className="text-xs text-green-400 mt-2">Sent: {new Date(message.aiRespondedAt).toLocaleString()}</p>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${message.priority === 'urgent' ? 'bg-red-500/20 text-red-400' : message.priority === 'high' ? 'bg-orange-500/20 text-orange-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {message.priority} priority
                        </span>
                        {message.requiresHumanReview && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">
                                Requires Review
                            </span>
                        )}
                        {message.tags.map(tag => (
                            <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                                {tag}
                            </span>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-[#222222]/8 flex-wrap">
                        {onToggleRead && (
                            <button
                                onClick={() => onToggleRead(!message.isRead)}
                                className="px-4 py-3 bg-[#222222]/5 hover:bg-[#222222]/8 text-[#444444] hover:text-[#222222] rounded-xl font-medium transition-all text-sm flex items-center justify-center gap-1.5"
                            >
                                <Check size={16} />
                                {message.isRead ? 'Mark as Unread' : 'Mark as Read'}
                            </button>
                        )}
                        <button
                            onClick={() => onStatusChange('resolved')}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-[#222222] px-6 py-3 rounded-xl font-medium transition-all"
                        >
                            Mark as Resolved
                        </button>
                        <button
                            onClick={() => onStatusChange('escalated')}
                            className="flex-1 bg-amber-600 hover:bg-amber-700 text-[#222222] px-6 py-3 rounded-xl font-medium transition-all"
                        >
                            Escalate
                        </button>
                        <button
                            onClick={() => onStatusChange('archived')}
                            className="px-6 py-3 bg-[#222222]/5 hover:bg-[#222222]/8 rounded-xl font-medium transition-all"
                        >
                            Archive
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
