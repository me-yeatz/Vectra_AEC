import React, { useState, useMemo } from 'react';
import {
    Plus,
    X,
    Trash2,
    Edit3,
    MessageSquare,
    Filter,
    LayoutGrid,
    List
} from 'lucide-react';
import { Issue, IssueType, IssuePriority, IssueStatus, IssueComment, Project } from '../types';

interface IssuesViewProps {
    issues: Issue[];
    setIssues: React.Dispatch<React.SetStateAction<Issue[]>>;
    projects: Project[];
}

const TYPE_LABELS: Record<IssueType, string> = {
    rfi: 'RFI',
    snag: 'Snag',
    defect: 'Defect',
    'change-request': 'Change Request',
    task: 'Task',
    'approval-blocker': 'Approval Blocker'
};

const PRIORITY_LABELS: Record<IssuePriority, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical'
};

const STATUS_LABELS: Record<IssueStatus, string> = {
    open: 'Open',
    'in-progress': 'In Progress',
    blocked: 'Blocked',
    done: 'Done'
};

const PRIORITY_COLORS: Record<IssuePriority, string> = {
    low: '#6B7280',
    medium: '#3B82F6',
    high: '#F59E0B',
    critical: '#DC2626'
};

const STATUS_COLORS: Record<IssueStatus, string> = {
    open: '#DC2626',
    'in-progress': '#3B82F6',
    blocked: '#F59E0B',
    done: '#10B981'
};

const COLUMNS: IssueStatus[] = ['open', 'in-progress', 'blocked', 'done'];

function todayISO(): string {
    return new Date().toISOString().split('T')[0];
}

function isOverdue(issue: Issue): boolean {
    return !!issue.dueDate && issue.dueDate < todayISO() && issue.status !== 'done';
}

export default function IssuesView({ issues, setIssues, projects }: IssuesViewProps) {
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
    const [statusFilter, setStatusFilter] = useState<IssueStatus | 'all'>('all');
    const [priorityFilter, setPriorityFilter] = useState<IssuePriority | 'all'>('all');
    const [projectFilter, setProjectFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const [showForm, setShowForm] = useState(false);
    const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
    const [form, setForm] = useState<Omit<Issue, 'id' | 'comments' | 'createdAt' | 'updatedAt'>>({
        title: '',
        description: '',
        type: 'task',
        priority: 'medium',
        status: 'open',
        assignee: '',
        dueDate: '',
        projectId: ''
    });

    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
    const [commentText, setCommentText] = useState('');

    const filteredIssues = useMemo(() => {
        return issues.filter((issue) => {
            if (statusFilter !== 'all' && issue.status !== statusFilter) return false;
            if (priorityFilter !== 'all' && issue.priority !== priorityFilter) return false;
            if (projectFilter !== 'all' && issue.projectId !== projectFilter) return false;
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                if (!issue.title.toLowerCase().includes(q) && !(issue.description || '').toLowerCase().includes(q)) {
                    return false;
                }
            }
            return true;
        });
    }, [issues, statusFilter, priorityFilter, projectFilter, searchQuery]);

    const openNew = () => {
        setEditingIssue(null);
        setForm({
            title: '',
            description: '',
            type: 'task',
            priority: 'medium',
            status: 'open',
            assignee: '',
            dueDate: '',
            projectId: ''
        });
        setShowForm(true);
    };

    const openEdit = (issue: Issue) => {
        setEditingIssue(issue);
        setForm({
            title: issue.title,
            description: issue.description || '',
            type: issue.type,
            priority: issue.priority,
            status: issue.status,
            assignee: issue.assignee || '',
            dueDate: issue.dueDate || '',
            projectId: issue.projectId || ''
        });
        setShowForm(true);
    };

    const saveIssue = () => {
        if (!form.title.trim()) return;
        const now = new Date().toISOString();
        if (editingIssue) {
            setIssues((prev) =>
                prev.map((i) =>
                    i.id === editingIssue.id
                        ? { ...i, ...form, assignee: form.assignee || undefined, dueDate: form.dueDate || undefined, projectId: form.projectId || undefined, updatedAt: now }
                        : i
                )
            );
        } else {
            const newIssue: Issue = {
                id: `issue-${Date.now()}`,
                title: form.title.trim(),
                description: form.description?.trim() || undefined,
                type: form.type,
                priority: form.priority,
                status: form.status,
                assignee: form.assignee?.trim() || undefined,
                dueDate: form.dueDate || undefined,
                projectId: form.projectId || undefined,
                comments: [],
                createdAt: now,
                updatedAt: now
            };
            setIssues((prev) => [newIssue, ...prev]);
        }
        setShowForm(false);
        setEditingIssue(null);
    };

    const deleteIssue = (id: string) => {
        if (!window.confirm('Delete this issue?')) return;
        setIssues((prev) => prev.filter((i) => i.id !== id));
        if (selectedIssue?.id === id) setSelectedIssue(null);
    };

    const updateStatus = (id: string, status: IssueStatus) => {
        setIssues((prev) =>
            prev.map((i) => (i.id === id ? { ...i, status, updatedAt: new Date().toISOString() } : i))
        );
    };

    const addComment = () => {
        if (!commentText.trim() || !selectedIssue) return;
        const comment: IssueComment = {
            id: `c-${Date.now()}`,
            author: 'You',
            content: commentText.trim(),
            createdAt: new Date().toISOString()
        };
        setIssues((prev) =>
            prev.map((i) =>
                i.id === selectedIssue.id
                    ? { ...i, comments: [...i.comments, comment], updatedAt: new Date().toISOString() }
                    : i
            )
        );
        setSelectedIssue((prev) => (prev ? { ...prev, comments: [...prev.comments, comment] } : prev));
        setCommentText('');
    };

    const projectName = (id?: string) => projects.find((p) => p.id === id)?.title || '';

    const openCount = issues.filter((i) => i.status !== 'done').length;
    const overdueCount = issues.filter(isOverdue).length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-display font-bold mb-2">Issues</h1>
                    <p className="text-[var(--text-secondary)]">
                        Track RFIs, snags, defects, change requests and action items
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setViewMode(viewMode === 'list' ? 'kanban' : 'list')}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)] rounded-md text-sm font-medium transition-all"
                    >
                        {viewMode === 'list' ? <LayoutGrid size={16} /> : <List size={16} />}
                        {viewMode === 'list' ? 'Kanban' : 'List'}
                    </button>
                    <button
                        onClick={openNew}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white rounded-md text-sm font-medium transition-all"
                    >
                        <Plus size={16} />
                        New Issue
                    </button>
                </div>
            </div>

            <div className="glass rounded-md p-4 md:p-5 flex flex-col md:flex-row gap-3 md:items-center">
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <Filter size={16} />
                    <span className="text-sm font-medium">Filters</span>
                </div>
                <input
                    type="text"
                    placeholder="Search issues..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-3 py-2 bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50 md:w-64"
                />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as IssueStatus | 'all')}
                    className="px-3 py-2 bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-md text-sm"
                >
                    <option value="all">All Status</option>
                    {Object.keys(STATUS_LABELS).map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s as IssueStatus]}</option>
                    ))}
                </select>
                <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value as IssuePriority | 'all')}
                    className="px-3 py-2 bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-md text-sm"
                >
                    <option value="all">All Priority</option>
                    {Object.keys(PRIORITY_LABELS).map((p) => (
                        <option key={p} value={p}>{PRIORITY_LABELS[p as IssuePriority]}</option>
                    ))}
                </select>
                <select
                    value={projectFilter}
                    onChange={(e) => setProjectFilter(e.target.value)}
                    className="px-3 py-2 bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-md text-sm"
                >
                    <option value="all">All Projects</option>
                    {projects.map((p) => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                </select>
            </div>

            <div className="text-sm text-[var(--text-muted)]">
                {openCount} open issue{openCount !== 1 ? 's' : ''} · {overdueCount} overdue
            </div>

            {viewMode === 'list' ? (
                <div className="space-y-3">
                    {filteredIssues.length === 0 ? (
                        <div className="glass rounded-md p-8 text-center text-[var(--text-muted)]">
                            No issues found.
                        </div>
                    ) : (
                        filteredIssues.map((issue) => (
                            <div
                                key={issue.id}
                                className="glass rounded-md p-4 md:p-5 border border-[var(--border)] hover:border-[var(--border-hover)] transition-all cursor-pointer"
                                onClick={() => setSelectedIssue(issue)}
                            >
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span
                                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                                style={{ backgroundColor: PRIORITY_COLORS[issue.priority] }}
                                            />
                                            <h3 className="font-semibold text-[var(--text-primary)] truncate">{issue.title}</h3>
                                            <span
                                                className="text-[10px] px-2 py-0.5 rounded-full text-white"
                                                style={{ backgroundColor: STATUS_COLORS[issue.status] }}
                                            >
                                                {STATUS_LABELS[issue.status]}
                                            </span>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
                                                {TYPE_LABELS[issue.type]}
                                            </span>
                                        </div>
                                        {issue.description && (
                                            <p className="text-sm text-[var(--text-secondary)] line-clamp-2">{issue.description}</p>
                                        )}
                                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-[var(--text-muted)]">
                                            {issue.projectId && <span>Project: {projectName(issue.projectId)}</span>}
                                            {issue.assignee && <span>Assignee: {issue.assignee}</span>}
                                            {issue.dueDate && (
                                                <span className={isOverdue(issue) ? 'text-[var(--accent-primary)] font-medium' : ''}>
                                                    Due: {issue.dueDate}
                                                </span>
                                            )}
                                            <span>{issue.comments.length} comment{issue.comments.length !== 1 ? 's' : ''}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                                        <select
                                            value={issue.status}
                                            onChange={(e) => updateStatus(issue.id, e.target.value as IssueStatus)}
                                            className="px-2 py-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-xs"
                                        >
                                            {Object.keys(STATUS_LABELS).map((s) => (
                                                <option key={s} value={s}>{STATUS_LABELS[s as IssueStatus]}</option>
                                            ))}
                                        </select>
                                        <button onClick={() => openEdit(issue)} className="p-1.5 rounded-md hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
                                            <Edit3 size={14} />
                                        </button>
                                        <button onClick={() => deleteIssue(issue.id)} className="p-1.5 rounded-md hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )
                    }
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        {COLUMNS.map((col) => (
                            <div key={col} className="glass rounded-md p-3 min-h-[300px]">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-sm" style={{ color: STATUS_COLORS[col] }}>
                                        {STATUS_LABELS[col]}
                                    </h3>
                                    <span className="text-xs text-[var(--text-muted)]">
                                        {filteredIssues.filter((i) => i.status === col).length}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {filteredIssues
                                        .filter((i) => i.status === col)
                                        .map((issue) => (
                                            <div
                                                key={issue.id}
                                                className="p-3 rounded-md bg-[var(--bg-secondary)] border border-[var(--border)] cursor-pointer hover:border-[var(--border-hover)]"
                                                onClick={() => setSelectedIssue(issue)}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span
                                                        className="w-2 h-2 rounded-full shrink-0"
                                                        style={{ backgroundColor: PRIORITY_COLORS[issue.priority] }}
                                                    />
                                                    <p className="text-sm font-medium truncate">{issue.title}</p>
                                                </div>
                                                <div className="flex flex-wrap gap-2 text-[10px] text-[var(--text-muted)]">
                                                    <span>{TYPE_LABELS[issue.type]}</span>
                                                    {issue.dueDate && <span>Due {issue.dueDate}</span>}
                                                </div>
                                                <div className="mt-2">
                                                    <select
                                                        value={issue.status}
                                                        onChange={(e) => updateStatus(issue.id, e.target.value as IssueStatus)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="w-full px-2 py-1 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md text-xs"
                                                    >
                                                        {Object.keys(STATUS_LABELS).map((s) => (
                                                            <option key={s} value={s}>{STATUS_LABELS[s as IssueStatus]}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            {selectedIssue && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="glass rounded-md w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">{selectedIssue.title}</h3>
                            <button onClick={() => setSelectedIssue(null)} className="p-2 rounded-md hover:bg-[var(--bg-tertiary)]">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs">
                            <span className="px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: STATUS_COLORS[selectedIssue.status] }}>
                                {STATUS_LABELS[selectedIssue.status]}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: PRIORITY_COLORS[selectedIssue.priority] }}>
                                {PRIORITY_LABELS[selectedIssue.priority]}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
                                {TYPE_LABELS[selectedIssue.type]}
                            </span>
                        </div>
                        {selectedIssue.description && (
                            <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">{selectedIssue.description}</p>
                        )}
                        <div className="text-xs text-[var(--text-muted)] space-y-1">
                            {selectedIssue.projectId && <p>Project: {projectName(selectedIssue.projectId)}</p>}
                            {selectedIssue.assignee && <p>Assignee: {selectedIssue.assignee}</p>}
                            {selectedIssue.dueDate && <p>Due: {selectedIssue.dueDate}</p>}
                        </div>

                        <div className="border-t border-[var(--border)] pt-4">
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <MessageSquare size={16} />
                                Comments
                            </h4>
                            <div className="space-y-2 mb-3">
                                {selectedIssue.comments.length === 0 ? (
                                    <p className="text-sm text-[var(--text-muted)]">No comments yet.</p>
                                ) : (
                                    selectedIssue.comments.map((c) => (
                                        <div key={c.id} className="p-3 rounded-md bg-[var(--bg-tertiary)]/60 border border-[var(--border)]">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-medium">{c.author}</span>
                                                <span className="text-[10px] text-[var(--text-muted)]">
                                                    {new Date(c.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">{c.content}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Add a comment..."
                                    className="flex-1 px-3 py-2 bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') addComment();
                                    }}
                                />
                                <button
                                    onClick={addComment}
                                    className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-md text-sm font-medium"
                                >
                                    Send
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                onClick={() => {
                                    openEdit(selectedIssue);
                                    setSelectedIssue(null);
                                }}
                                className="px-4 py-2.5 bg-[var(--bg-tertiary)] rounded-md text-sm font-medium"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => {
                                    deleteIssue(selectedIssue.id);
                                }}
                                className="px-4 py-2.5 bg-[var(--bg-tertiary)] rounded-md text-sm font-medium text-[var(--accent-primary)]"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="glass rounded-md w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">{editingIssue ? 'Edit Issue' : 'New Issue'}</h3>
                            <button onClick={() => { setShowForm(false); setEditingIssue(null); }} className="p-2 rounded-md hover:bg-[var(--bg-tertiary)]">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-[var(--text-secondary)] mb-1 block">Title *</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
                                    placeholder="Issue title"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-[var(--text-secondary)] mb-1 block">Description</label>
                                <textarea
                                    rows={3}
                                    value={form.description || ''}
                                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50 resize-none"
                                    placeholder="Details"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-medium text-[var(--text-secondary)] mb-1 block">Type</label>
                                    <select
                                        value={form.type}
                                        onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as IssueType }))}
                                        className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-md"
                                    >
                                        {Object.keys(TYPE_LABELS).map((t) => (
                                            <option key={t} value={t}>{TYPE_LABELS[t as IssueType]}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-[var(--text-secondary)] mb-1 block">Priority</label>
                                    <select
                                        value={form.priority}
                                        onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as IssuePriority }))}
                                        className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-md"
                                    >
                                        {Object.keys(PRIORITY_LABELS).map((p) => (
                                            <option key={p} value={p}>{PRIORITY_LABELS[p as IssuePriority]}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-medium text-[var(--text-secondary)] mb-1 block">Status</label>
                                    <select
                                        value={form.status}
                                        onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as IssueStatus }))}
                                        className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-md"
                                    >
                                        {Object.keys(STATUS_LABELS).map((s) => (
                                            <option key={s} value={s}>{STATUS_LABELS[s as IssueStatus]}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-[var(--text-secondary)] mb-1 block">Due Date</label>
                                    <input
                                        type="date"
                                        value={form.dueDate || ''}
                                        onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                                        className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-md"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-medium text-[var(--text-secondary)] mb-1 block">Assignee</label>
                                    <input
                                        type="text"
                                        value={form.assignee || ''}
                                        onChange={(e) => setForm((f) => ({ ...f, assignee: e.target.value }))}
                                        className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-md"
                                        placeholder="Name"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-[var(--text-secondary)] mb-1 block">Project</label>
                                    <select
                                        value={form.projectId || ''}
                                        onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value }))}
                                        className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-md"
                                    >
                                        <option value="">None</option>
                                        {projects.map((p) => (
                                            <option key={p.id} value={p.id}>{p.title}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                onClick={() => { setShowForm(false); setEditingIssue(null); }}
                                className="px-4 py-2.5 bg-[var(--bg-tertiary)] rounded-md text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveIssue}
                                className="px-4 py-2.5 bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white rounded-md text-sm font-medium"
                            >
                                {editingIssue ? 'Save Changes' : 'Create Issue'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}