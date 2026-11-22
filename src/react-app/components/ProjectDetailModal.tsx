import {
    X,
    MapPin,
    User,
    Calendar,
    DollarSign,
    FileText,
    Phone,
    Mail,
    Building2,
    Clock,
    CheckCircle2,
    AlertCircle,
    XCircle,
    Edit,
    Trash2,
    StickyNote,
    ChevronRight,
    Layers
} from 'lucide-react';
import { Project, Submission } from '../types';

interface ProjectDetailModalProps {
    project: Project;
    onClose: () => void;
    onEdit: (project: Project) => void;
    onDelete: (projectId: string) => void;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
    'concept':            { label: 'Concept',          color: '#6366f1', icon: Clock },
    'design-development': { label: 'Design Dev',       color: '#3b82f6', icon: Clock },
    'submission-prep':    { label: 'Submission Prep',  color: '#f59e0b', icon: Clock },
    'submitted':          { label: 'Submitted',        color: '#f97316', icon: AlertCircle },
    'approved':           { label: 'Approved',         color: '#059669', icon: CheckCircle2 },
    'on-hold':            { label: 'On Hold',          color: '#64748b', icon: XCircle },
    'completed':          { label: 'Completed',        color: '#10b981', icon: CheckCircle2 },
};

const submissionStatusConfig: Record<string, { label: string; color: string }> = {
    'pending':                { label: 'Pending',               color: '#f59e0b' },
    'approved':               { label: 'Approved',              color: '#059669' },
    'rejected':               { label: 'Rejected',              color: '#dc2626' },
    'resubmission-required':  { label: 'Resubmission Required', color: '#f97316' },
};

const submissionTypeLabels: Record<string, string> = {
    'planning-permission':  'Planning Permission',
    'building-permit':      'Building Permit',
    'structural-approval':  'Structural Approval',
    'fire-safety':          'Fire Safety',
    'environmental-impact': 'Environmental Impact',
    'other':                'Other',
};

function SubmissionRow({ sub }: { sub: Submission }) {
    const sc = submissionStatusConfig[sub.status] ?? { label: sub.status, color: '#94a3b8' };
    return (
        <div className="flex items-start gap-4 p-4 bg-[var(--bg-tertiary)] rounded-md border-2 border-[var(--border)]">
            <div
                className="w-2 h-2 rounded-md mt-2 shrink-0"
                style={{ backgroundColor: sc.color }}
            />
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                    <span className="font-medium text-sm text-[var(--text-primary)]">
                        {submissionTypeLabels[sub.type] ?? sub.type}
                    </span>
                    <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-md"
                        style={{ backgroundColor: `${sc.color}25`, color: sc.color }}
                    >
                        {sc.label}
                    </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mb-1">{sub.authority}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-muted)]">
                    {sub.submittedDate && (
                        <span>Submitted {new Date(sub.submittedDate).toLocaleDateString('en-MY')}</span>
                    )}
                    {sub.expectedApprovalDate && (
                        <span>Expected {new Date(sub.expectedApprovalDate).toLocaleDateString('en-MY')}</span>
                    )}
                    {sub.approvalDate && (
                        <span className="text-green-400">
                            Approved {new Date(sub.approvalDate).toLocaleDateString('en-MY')}
                        </span>
                    )}
                    <span className="text-green-300 font-semibold">
                        RM {sub.consultantFee.toLocaleString()}
                    </span>
                </div>
                {sub.notes && (
                    <p className="mt-2 text-xs text-[var(--text-secondary)] italic">{sub.notes}</p>
                )}
            </div>
        </div>
    );
}

export default function ProjectDetailModal({ project, onClose, onEdit, onDelete }: ProjectDetailModalProps) {
    const cfg = statusConfig[project.status] ?? statusConfig['concept'];
    const StatusIcon = cfg.icon;

    const totalFees = project.submissions.reduce((s, sub) => s + sub.consultantFee, 0);
    const pendingCount = project.submissions.filter(s => s.status === 'pending').length;
    const approvedCount = project.submissions.filter(s => s.status === 'approved').length;

    const handleEdit = () => {
        onClose();
        onEdit(project);
    };

    const handleDelete = () => {
        onClose();
        onDelete(project.id);
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="glass rounded-md w-full max-w-3xl max-h-[92vh] flex flex-col animate-fade-in"
                onClick={e => e.stopPropagation()}
            >
                {/* ── Header ── */}
                <div
                    className="flex items-start justify-between p-6 pb-4 border-b border-[var(--border)] shrink-0"
                >
                    <div className="flex items-center gap-4">
                        <div
                            className="w-14 h-14 rounded-md flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${project.color}22`, color: project.color }}
                        >
                            <FileText size={26} />
                        </div>
                        <div>
                            <h2 className="text-xl font-display font-bold leading-tight mb-1">
                                {project.title}
                            </h2>
                            <div
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold"
                                style={{ backgroundColor: `${cfg.color}22`, color: cfg.color }}
                            >
                                <StatusIcon size={12} />
                                {cfg.label}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={handleEdit}
                            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white rounded-md text-sm font-medium transition-all active:scale-95"
                        >
                            <Edit size={15} />
                            Edit
                        </button>
                        <button
                            onClick={handleDelete}
                            className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-red-500/10 rounded-md transition-all"
                            title="Delete project"
                        >
                            <Trash2 size={18} />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-md transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* ── Scrollable body ── */}
                <div className="overflow-y-auto flex-1 custom-scrollbar p-6 space-y-6">

                    {/* ── Stats row ── */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            {
                                label: 'Budget',
                                value: project.totalBudget
                                    ? `RM ${(project.totalBudget / 1_000_000).toFixed(2)}M`
                                    : '—',
                                sub: 'Total budget',
                                icon: <DollarSign size={16} />,
                                color: '#2563eb',
                            },
                            {
                                label: 'Consultant Fees',
                                value: `RM ${(totalFees / 1_000).toFixed(1)}K`,
                                sub: `${project.submissions.length} submissions`,
                                icon: <Layers size={16} />,
                                color: '#8b5cf6',
                            },
                            {
                                label: 'Pending',
                                value: pendingCount.toString(),
                                sub: 'Submissions pending',
                                icon: <Clock size={16} />,
                                color: '#f59e0b',
                            },
                            {
                                label: 'Approved',
                                value: approvedCount.toString(),
                                sub: 'Submissions approved',
                                icon: <CheckCircle2 size={16} />,
                                color: '#059669',
                            },
                        ].map(stat => (
                            <div
                                key={stat.label}
                                className="bg-[var(--bg-tertiary)] rounded-md p-4 border-2 border-[var(--border)]"
                            >
                                <div
                                    className="w-8 h-8 rounded-md flex items-center justify-center mb-2"
                                    style={{ backgroundColor: `${stat.color}22`, color: stat.color }}
                                >
                                    {stat.icon}
                                </div>
                                <p className="text-xs text-[var(--text-muted)] mb-0.5">{stat.label}</p>
                                <p className="text-lg font-bold text-[var(--text-primary)]">{stat.value}</p>
                                <p className="text-xs text-[var(--text-muted)]">{stat.sub}</p>
                            </div>
                        ))}
                    </div>

                    {/* ── Two-column layout ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Client Contact */}
                        <section className="bg-[var(--bg-tertiary)] rounded-md p-5 border-2 border-[var(--border)]">
                            <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-4 flex items-center gap-2">
                                <User size={15} className="text-[var(--accent-primary)]" />
                                Client Contact
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-[var(--text-muted)] mb-0.5">Name</p>
                                    <p className="text-sm font-medium text-[var(--text-primary)]">{project.clientName}</p>
                                </div>
                                {project.clientCompany && (
                                    <div>
                                        <p className="text-xs text-[var(--text-muted)] mb-0.5">Company</p>
                                        <p className="text-sm text-[var(--text-primary)] flex items-center gap-2">
                                            <Building2 size={13} className="text-[var(--text-secondary)] shrink-0" />
                                            {project.clientCompany}
                                        </p>
                                    </div>
                                )}
                                {project.clientPhone ? (
                                    <div>
                                        <p className="text-xs text-[var(--text-muted)] mb-0.5">Phone</p>
                                        <a
                                            href={`tel:${project.clientPhone}`}
                                            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-2 transition-colors"
                                        >
                                            <Phone size={13} className="shrink-0" />
                                            {project.clientPhone}
                                        </a>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-xs text-[var(--text-muted)] mb-0.5">Phone</p>
                                        <p className="text-sm text-[var(--text-muted)] italic">Not provided</p>
                                    </div>
                                )}
                                {project.clientEmail ? (
                                    <div>
                                        <p className="text-xs text-[var(--text-muted)] mb-0.5">Email</p>
                                        <a
                                            href={`mailto:${project.clientEmail}`}
                                            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-2 transition-colors break-all"
                                        >
                                            <Mail size={13} className="shrink-0" />
                                            {project.clientEmail}
                                        </a>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-xs text-[var(--text-muted)] mb-0.5">Email</p>
                                        <p className="text-sm text-[var(--text-muted)] italic">Not provided</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Project Details */}
                        <section className="bg-[var(--bg-tertiary)] rounded-md p-5 border-2 border-[var(--border)]">
                            <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-4 flex items-center gap-2">
                                <FileText size={15} className="text-[var(--accent-primary)]" />
                                Project Details
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-[var(--text-muted)] mb-0.5">Location</p>
                                    <p className="text-sm text-[var(--text-primary)] flex items-center gap-2">
                                        <MapPin size={13} className="text-[var(--text-secondary)] shrink-0" />
                                        {project.location}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-[var(--text-muted)] mb-0.5">Start Date</p>
                                    <p className="text-sm text-[var(--text-primary)] flex items-center gap-2">
                                        <Calendar size={13} className="text-[var(--text-secondary)] shrink-0" />
                                        {new Date(project.startDate).toLocaleDateString('en-MY', {
                                            day: 'numeric', month: 'long', year: 'numeric'
                                        })}
                                    </p>
                                </div>
                                {project.targetCompletionDate && (
                                    <div>
                                        <p className="text-xs text-[var(--text-muted)] mb-0.5">Target Completion</p>
                                        <p className="text-sm text-[var(--text-primary)] flex items-center gap-2">
                                            <Calendar size={13} className="text-[var(--text-secondary)] shrink-0" />
                                            {new Date(project.targetCompletionDate).toLocaleDateString('en-MY', {
                                                day: 'numeric', month: 'long', year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                )}
                                {project.actualCompletionDate && (
                                    <div>
                                        <p className="text-xs text-[var(--text-muted)] mb-0.5">Actual Completion</p>
                                        <p className="text-sm text-green-400 flex items-center gap-2">
                                            <CheckCircle2 size={13} className="shrink-0" />
                                            {new Date(project.actualCompletionDate).toLocaleDateString('en-MY', {
                                                day: 'numeric', month: 'long', year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Description */}
                    <section className="bg-[var(--bg-tertiary)] rounded-md p-5 border-2 border-[var(--border)]">
                        <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3 flex items-center gap-2">
                            <FileText size={15} className="text-[var(--accent-primary)]" />
                            Description
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{project.description}</p>
                    </section>

                    {/* Notes */}
                    {project.notes && (
                        <section className="bg-amber-500/5 rounded-md p-5 border-2 border-2-amber-500/20">
                            <h3 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
                                <StickyNote size={15} />
                                Notes
                            </h3>
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{project.notes}</p>
                        </section>
                    )}

                    {/* Submissions */}
                    <section>
                        <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3 flex items-center gap-2">
                            <ChevronRight size={15} className="text-[var(--accent-primary)]" />
                            Submissions ({project.submissions.length})
                        </h3>
                        {project.submissions.length === 0 ? (
                            <div className="p-6 bg-[var(--bg-tertiary)] rounded-md border-2 border-[var(--border)] text-center text-[var(--text-muted)] text-sm">
                                No submissions yet
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {project.submissions.map(sub => (
                                    <SubmissionRow key={sub.id} sub={sub} />
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* ── Footer ── */}
                <div className="shrink-0 px-6 py-4 border-t border-[var(--border)] flex items-center justify-between gap-4">
                    <button
                        onClick={handleDelete}
                        className="text-sm text-[var(--accent-primary)] hover:text-red-300 flex items-center gap-1.5 transition-colors"
                    >
                        <Trash2 size={14} />
                        Delete project
                    </button>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)] rounded-md text-sm font-medium transition-all"
                        >
                            Close
                        </button>
                        <button
                            onClick={handleEdit}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white rounded-md text-sm font-medium transition-all active:scale-95"
                        >
                            <Edit size={14} />
                            Edit Project
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
