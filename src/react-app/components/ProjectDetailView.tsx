import {
    ArrowLeft,
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
    Layers,
    CalendarCheck,
    Hash,
    TrendingUp,
    Upload,
    Image as ImageIcon,
    Printer,
    Send,
    PlusCircle,
    Receipt
} from 'lucide-react';
import { Project, Submission, Invoice } from '../types';
import { useRef, useState } from 'react';

interface ProjectDetailViewProps {
    project: Project;
    onBack: () => void;
    onEdit: (project: Project) => void;
    onDelete: (projectId: string) => void;
    onUpdate?: (project: Project) => void;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
    'concept':            { label: 'Concept',          color: '#6366f1', bg: '#6366f115', icon: Clock },
    'design-development': { label: 'Design Development', color: '#3b82f6', bg: '#3b82f615', icon: Clock },
    'submission-prep':    { label: 'Submission Prep',  color: '#f59e0b', bg: '#f59e0b15', icon: Clock },
    'submitted':          { label: 'Submitted',        color: '#f97316', bg: '#f9731615', icon: AlertCircle },
    'approved':           { label: 'Approved',         color: '#059669', bg: '#05966915', icon: CheckCircle2 },
    'on-hold':            { label: 'On Hold',          color: '#64748b', bg: '#64748b15', icon: XCircle },
    'completed':          { label: 'Completed',        color: '#10b981', bg: '#10b98115', icon: CheckCircle2 },
};

const submissionStatusConfig: Record<string, { label: string; color: string }> = {
    'pending':               { label: 'Pending',               color: '#f59e0b' },
    'approved':              { label: 'Approved',              color: '#059669' },
    'rejected':              { label: 'Rejected',              color: '#dc2626' },
    'resubmission-required': { label: 'Resubmission Required', color: '#f97316' },
};

const submissionTypeLabels: Record<string, string> = {
    'planning-permission':  'Planning Permission',
    'building-permit':      'Building Permit',
    'structural-approval':  'Structural Approval',
    'fire-safety':          'Fire Safety',
    'environmental-impact': 'Environmental Impact',
    'other':                'Other',
};

function SubmissionCard({ sub, index }: { sub: Submission; index: number }) {
    const sc = submissionStatusConfig[sub.status] ?? { label: sub.status, color: '#94a3b8' };
    return (
        <div className="bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-2xl p-6 hover:border-[var(--border)] transition-all">
            <div className="flex items-start justify-between mb-4 gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                    <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                        style={{ backgroundColor: `${sc.color}20`, color: sc.color }}
                    >
                        {index + 1}
                    </div>
                    <div>
                        <h4 className="font-semibold text-[var(--text-primary)]">
                            {submissionTypeLabels[sub.type] ?? sub.type}
                        </h4>
                        <p className="text-sm text-[var(--text-secondary)]">{sub.authority}</p>
                    </div>
                </div>
                <span
                    className="text-xs font-semibold px-3 py-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: `${sc.color}20`, color: sc.color }}
                >
                    {sc.label}
                </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                    <p className="text-xs text-[var(--text-muted)] mb-1">Consultant Fee</p>
                    <p className="text-base font-bold text-green-400">RM {sub.consultantFee.toLocaleString()}</p>
                </div>
                {sub.submittedDate && (
                    <div>
                        <p className="text-xs text-[var(--text-muted)] mb-1">Submitted</p>
                        <p className="text-sm text-[var(--text-primary)]">
                            {new Date(sub.submittedDate).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                    </div>
                )}
                {sub.expectedApprovalDate && (
                    <div>
                        <p className="text-xs text-[var(--text-muted)] mb-1">Expected Approval</p>
                        <p className="text-sm text-[var(--text-primary)]">
                            {new Date(sub.expectedApprovalDate).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                    </div>
                )}
                {sub.approvalDate && (
                    <div>
                        <p className="text-xs text-[var(--text-muted)] mb-1">Approved On</p>
                        <p className="text-sm text-green-400 font-medium">
                            {new Date(sub.approvalDate).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                    </div>
                )}
            </div>

            {sub.notes && (
                <div className="mt-2 p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl">
                    <p className="text-xs text-amber-400 font-medium mb-1">Notes</p>
                    <p className="text-sm text-[var(--text-secondary)]">{sub.notes}</p>
                </div>
            )}
        </div>
    );
}

export default function ProjectDetailView({ project, onBack, onEdit, onDelete, onUpdate }: ProjectDetailViewProps) {
    const cfg = statusConfig[project.status] ?? statusConfig['concept'];
    const StatusIcon = cfg.icon;

    const totalFees = project.submissions.reduce((s, sub) => s + sub.consultantFee, 0);
    const pendingCount  = project.submissions.filter(s => s.status === 'pending').length;
    const approvedCount = project.submissions.filter(s => s.status === 'approved').length;
    const rejectedCount = project.submissions.filter(s => s.status === 'rejected' || s.status === 'resubmission-required').length;

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this project? This cannot be undone.')) {
            onDelete(project.id);
            onBack();
        }
    };

    const fileInputRef = useRef<HTMLInputElement>(null);
    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        const readers: Promise<string>[] = Array.from(files)
            .filter(f => f.type.startsWith('image/'))
            .map(f => new Promise((resolve) => {
                const r = new FileReader();
                r.onload = () => resolve(r.result as string);
                r.readAsDataURL(f);
            }));
        Promise.all(readers).then(results => {
            if (results.length === 0) return;
            const updated: Project = {
                ...project,
                sitePhotos: [...(project.sitePhotos || []), ...results]
            };
            onUpdate?.(updated);
        });
        e.target.value = '';
    };

    const removePhoto = (index: number) => {
        const updated: Project = {
            ...project,
            sitePhotos: (project.sitePhotos || []).filter((_, i) => i !== index)
        };
        onUpdate?.(updated);
    };

    const [showInvoiceForm, setShowInvoiceForm] = useState(false);
    const [invoiceForm, setInvoiceForm] = useState({
        amount: '',
        description: '',
        issuedDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        status: 'draft' as 'draft' | 'sent' | 'paid',
        notes: ''
    });

    const resetInvoiceForm = () => setInvoiceForm({
        amount: '',
        description: '',
        issuedDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        status: 'draft',
        notes: ''
    });

    const saveInvoice = () => {
        const amount = parseFloat(invoiceForm.amount);
        if (isNaN(amount) || amount <= 0) return;
        if (!invoiceForm.description.trim()) return;
        const inv: Invoice = {
            id: `inv-${Date.now()}`,
            projectId: project.id,
            number: `INV-${(project.invoices?.length || 0) + 1}`.padStart(6, '0') ? `INV-${String((project.invoices?.length || 0) + 1).padStart(4, '0')}` : '',
            amount,
            description: invoiceForm.description.trim(),
            issuedDate: invoiceForm.issuedDate,
            dueDate: invoiceForm.dueDate || undefined,
            status: invoiceForm.status,
            notes: invoiceForm.notes.trim() || undefined
        };
        const updated: Project = {
            ...project,
            invoices: [...(project.invoices || []), inv]
        };
        onUpdate?.(updated);
        resetInvoiceForm();
        setShowInvoiceForm(false);
    };

    const deleteInvoice = (id: string) => {
        if (!window.confirm('Delete this invoice?')) return;
        const updated: Project = {
            ...project,
            invoices: (project.invoices || []).filter(i => i.id !== id)
        };
        onUpdate?.(updated);
    };

    const exportInvoice = (inv: Invoice) => {
        const html = `<!DOCTYPE html>
<html><head><title>Invoice ${inv.number}</title>
<style>
body{font-family:Arial,sans-serif;padding:40px;color:#111;}
h1{margin:0 0 4px;}
table{width:100%;border-collapse:collapse;margin-top:20px;}
th,td{padding:10px;border-bottom:1px solid #ddd;text-align:left;}
.total{font-weight:bold;font-size:18px;margin-top:20px;text-align:right;}
.meta{color:#555;font-size:13px;margin-bottom:20px;}
</style></head><body>
<h1>INVOICE</h1>
<p class="meta">Invoice No: ${inv.number}<br/>Issued: ${new Date(inv.issuedDate).toLocaleDateString('en-MY')}<br/>Due: ${inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-MY') : 'N/A'}<br/>Status: ${inv.status.toUpperCase()}</p>
<h3>Bill To: ${project.clientName}${project.clientCompany ? ' / ' + project.clientCompany : ''}</h3>
<p>${project.location}</p>
<table><thead><tr><th>Description</th><th>Amount (RM)</th></tr></thead>
<tbody><tr><td>${inv.description}</td><td>${inv.amount.toLocaleString()}</td></tr></tbody></table>
<div class="total">Total: RM ${inv.amount.toLocaleString()}</div>
${inv.notes ? `<p style="margin-top:20px;font-size:13px;color:#555;">Notes: ${inv.notes}</p>` : ''}
<script>window.onload=function(){window.print();}</script>
</body></html>`;
        const w = window.open('', '_blank');
        if (w) { w.document.write(html); w.document.close(); }
    };

    const emailInvoice = (inv: Invoice) => {
        const subject = encodeURIComponent(`Invoice ${inv.number} - ${project.title}`);
        const body = encodeURIComponent(`Dear ${project.clientName},\n\nPlease find invoice details below:\n\nInvoice No: ${inv.number}\nProject: ${project.title}\nDescription: ${inv.description}\nAmount: RM ${inv.amount.toLocaleString()}\nIssued Date: ${new Date(inv.issuedDate).toLocaleDateString('en-MY')}\nDue Date: ${inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-MY') : 'N/A'}\nStatus: ${inv.status}\n\nThank you.\n\nVECTRA`);
        const to = project.clientEmail || '';
        window.open(`mailto:${to}?subject=${subject}&body=${body}`, '_blank');
    };

    return (
        <div className="animate-fade-in max-w-6xl mx-auto px-4 sm:px-6">

            {/* ── Sticky top bar ── */}
            <div className="sticky top-0 z-30 px-2 py-4 mb-8 bg-[var(--bg-primary)]/90 backdrop-blur-xl border-b border-[var(--border)] flex items-center justify-between gap-4">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm font-medium"
                >
                    <ArrowLeft size={18} />
                    Back to Projects
                </button>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--accent-primary)] hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                        <Trash2 size={15} />
                        Delete
                    </button>
                    <button
                        onClick={() => onEdit(project)}
                        className="flex items-center gap-2 px-5 py-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white text-sm font-medium rounded-xl transition-all active:scale-95 shadow-lg shadow-[var(--accent-primary)]/20"
                    >
                        <Edit size={15} />
                        Edit Project
                    </button>
                </div>
            </div>

            {/* ── Hero header ── */}
            <div className="mb-10">
                <div className="flex items-start gap-5 mb-5">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${project.color}20`, color: project.color }}
                    >
                        <FileText size={30} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-3xl md:text-4xl font-display font-bold mb-3 leading-tight">
                            {project.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-3">
                            <span
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
                                style={{ backgroundColor: cfg.bg, color: cfg.color }}
                            >
                                <StatusIcon size={14} />
                                {cfg.label}
                            </span>
                            <span className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                                <MapPin size={14} />
                                {project.location}
                            </span>
                            <span className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                                <Hash size={14} />
                                {project.id}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Stats strip ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-10">
                {[
                    {
                        label: 'Total Budget',
                        value: project.totalBudget
                            ? `RM ${(project.totalBudget / 1_000_000).toFixed(2)}M`
                            : '—',
                        icon: <DollarSign size={18} />,
                        color: '#2563eb',
                    },
                    {
                        label: 'Consultant Fees',
                        value: `RM ${(totalFees / 1_000).toFixed(1)}K`,
                        icon: <TrendingUp size={18} />,
                        color: '#8b5cf6',
                    },
                    {
                        label: 'Total Submissions',
                        value: project.submissions.length.toString(),
                        icon: <Layers size={18} />,
                        color: '#3b82f6',
                    },
                    {
                        label: 'Approved',
                        value: approvedCount.toString(),
                        icon: <CheckCircle2 size={18} />,
                        color: '#059669',
                    },
                    {
                        label: 'Pending / Issues',
                        value: `${pendingCount + rejectedCount}`,
                        icon: <AlertCircle size={18} />,
                        color: '#f59e0b',
                    },
                ].map(stat => (
                    <div key={stat.label} className="glass rounded-2xl p-5">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                            style={{ backgroundColor: `${stat.color}20`, color: stat.color }}
                        >
                            {stat.icon}
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mb-1">{stat.label}</p>
                        <p className="text-2xl font-display font-bold text-[var(--text-primary)]">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* ── Main two-column layout ── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">

                {/* LEFT — narrow sidebar with client + dates */}
                <div className="xl:col-span-1 space-y-6">

                    {/* Client Contact */}
                    <section className="glass rounded-2xl p-6">
                        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-5 flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-[var(--accent-primary)]/15 flex items-center justify-center">
                                <User size={14} className="text-[var(--accent-primary)]" />
                            </div>
                            Client Contact
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-1">Full Name</p>
                                <p className="text-sm font-semibold text-[var(--text-primary)]">{project.clientName}</p>
                            </div>

                            {project.clientCompany && (
                                <div>
                                    <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-1">Company</p>
                                    <p className="text-sm text-[var(--text-primary)] flex items-center gap-2">
                                        <Building2 size={13} className="text-[var(--text-secondary)] shrink-0" />
                                        {project.clientCompany}
                                    </p>
                                </div>
                            )}

                            <div>
                                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-2">Phone</p>
                                {project.clientPhone ? (
                                    <a
                                        href={`tel:${project.clientPhone}`}
                                        className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors group"
                                    >
                                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                            <Phone size={13} />
                                        </div>
                                        {project.clientPhone}
                                    </a>
                                ) : (
                                    <p className="text-sm text-[var(--text-muted)] italic">Not provided</p>
                                )}
                            </div>

                            <div>
                                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-2">Email</p>
                                {project.clientEmail ? (
                                    <a
                                        href={`mailto:${project.clientEmail}`}
                                        className="flex items-start gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors group break-all"
                                    >
                                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors mt-0.5">
                                            <Mail size={13} />
                                        </div>
                                        {project.clientEmail}
                                    </a>
                                ) : (
                                    <p className="text-sm text-[var(--text-muted)] italic">Not provided</p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Project Dates */}
                    <section className="glass rounded-2xl p-6">
                        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-5 flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-[var(--accent-primary)]/15 flex items-center justify-center">
                                <Calendar size={14} className="text-[var(--accent-primary)]" />
                            </div>
                            Timeline
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-1">Start Date</p>
                                <p className="text-sm text-[var(--text-primary)] flex items-center gap-2">
                                    <Calendar size={13} className="text-[var(--text-secondary)] shrink-0" />
                                    {new Date(project.startDate).toLocaleDateString('en-MY', {
                                        day: 'numeric', month: 'long', year: 'numeric'
                                    })}
                                </p>
                            </div>
                            {project.targetCompletionDate && (
                                <div>
                                    <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-1">Target Completion</p>
                                    <p className="text-sm text-[var(--text-primary)] flex items-center gap-2">
                                        <CalendarCheck size={13} className="text-amber-400 shrink-0" />
                                        {new Date(project.targetCompletionDate).toLocaleDateString('en-MY', {
                                            day: 'numeric', month: 'long', year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            )}
                            {project.actualCompletionDate && (
                                <div>
                                    <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-1">Actual Completion</p>
                                    <p className="text-sm text-green-400 flex items-center gap-2 font-medium">
                                        <CheckCircle2 size={13} className="shrink-0" />
                                        {new Date(project.actualCompletionDate).toLocaleDateString('en-MY', {
                                            day: 'numeric', month: 'long', year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Financial summary */}
                    <section className="glass rounded-2xl p-6">
                        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-5 flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-[var(--accent-primary)]/15 flex items-center justify-center">
                                <DollarSign size={14} className="text-[var(--accent-primary)]" />
                            </div>
                            Financials
                        </h2>
                        <div className="space-y-3">
                            {project.totalBudget && (
                                <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
                                    <span className="text-sm text-[var(--text-secondary)]">Total Budget</span>
                                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                                        RM {project.totalBudget.toLocaleString()}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
                                <span className="text-sm text-[var(--text-secondary)]">Consultant Fees</span>
                                <span className="text-sm font-semibold text-green-400">
                                    RM {totalFees.toLocaleString()}
                                </span>
                            </div>
                            {project.totalBudget && (
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-sm text-[var(--text-secondary)]">Fee / Budget ratio</span>
                                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                                        {((totalFees / project.totalBudget) * 100).toFixed(1)}%
                                    </span>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* RIGHT — wide main content */}
                <div className="xl:col-span-2 space-y-8">

                    {/* Description */}
                    <section className="glass rounded-2xl p-6">
                        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-[var(--accent-primary)]/15 flex items-center justify-center">
                                <FileText size={14} className="text-[var(--accent-primary)]" />
                            </div>
                            Project Description
                        </h2>
                        <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{project.description}</p>
                    </section>

                    {/* Internal Notes */}
                    {project.notes && (
                        <section className="glass rounded-2xl p-6 border border-amber-500/20">
                            <h2 className="text-base font-semibold text-amber-400 mb-4 flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                    <StickyNote size={14} className="text-amber-400" />
                                </div>
                                Internal Notes
                            </h2>
                            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{project.notes}</p>
                        </section>
                    )}

                    {/* Site Photos */}
                    <section className="glass rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-[var(--accent-primary)]/15 flex items-center justify-center">
                                    <ImageIcon size={14} className="text-[var(--accent-primary)]" />
                                </div>
                                Site Photos
                                <span className="text-xs font-normal text-[var(--text-muted)] ml-1">
                                    ({(project.sitePhotos || []).length})
                                </span>
                            </h2>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-xl text-sm font-medium transition-all"
                            >
                                <Upload size={14} />
                                Upload
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handlePhotoUpload}
                                className="hidden"
                            />
                        </div>
                        {(project.sitePhotos || []).length === 0 ? (
                            <div className="p-8 text-center text-[var(--text-muted)] text-sm border border-dashed border-[var(--border)] rounded-xl">
                                No site photos uploaded yet
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {(project.sitePhotos || []).map((photo, idx) => (
                                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-[var(--border)] aspect-square bg-[var(--bg-tertiary)]">
                                        <img src={photo} alt={`Site photo ${idx + 1}`} className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => removePhoto(idx)}
                                            className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-[var(--accent-primary)] text-[var(--text-primary)] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Remove photo"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Invoices */}
                    <section className="glass rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-[var(--accent-primary)]/15 flex items-center justify-center">
                                    <Receipt size={14} className="text-[var(--accent-primary)]" />
                                </div>
                                Invoices
                                <span className="text-xs font-normal text-[var(--text-muted)] ml-1">
                                    ({(project.invoices || []).length})
                                </span>
                            </h2>
                            <button
                                onClick={() => setShowInvoiceForm(v => !v)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white rounded-xl text-sm font-medium transition-all"
                            >
                                <PlusCircle size={14} />
                                New Invoice
                            </button>
                        </div>

                        {showInvoiceForm && (
                            <div className="mb-5 p-4 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border)] space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-[var(--text-secondary)] mb-1 block">Amount (RM) *</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={invoiceForm.amount}
                                            onChange={e => setInvoiceForm(f => ({ ...f, amount: e.target.value }))}
                                            className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-[var(--text-secondary)] mb-1 block">Status</label>
                                        <select
                                            value={invoiceForm.status}
                                            onChange={e => setInvoiceForm(f => ({ ...f, status: e.target.value as 'draft' | 'sent' | 'paid' }))}
                                            className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
                                            style={{ colorScheme: 'dark' }}
                                        >
                                            <option value="draft" className="bg-[#FFFFFF]">Draft</option>
                                            <option value="sent" className="bg-[#FFFFFF]">Sent</option>
                                            <option value="paid" className="bg-[#FFFFFF]">Paid</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-[var(--text-secondary)] mb-1 block">Issued Date</label>
                                        <input
                                            type="date"
                                            value={invoiceForm.issuedDate}
                                            onChange={e => setInvoiceForm(f => ({ ...f, issuedDate: e.target.value }))}
                                            className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-[var(--text-secondary)] mb-1 block">Due Date</label>
                                        <input
                                            type="date"
                                            value={invoiceForm.dueDate}
                                            onChange={e => setInvoiceForm(f => ({ ...f, dueDate: e.target.value }))}
                                            className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-[var(--text-secondary)] mb-1 block">Description *</label>
                                    <textarea
                                        rows={2}
                                        value={invoiceForm.description}
                                        onChange={e => setInvoiceForm(f => ({ ...f, description: e.target.value }))}
                                        placeholder="e.g., Consultant fee for planning permission submission"
                                        className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-[var(--text-secondary)] mb-1 block">Notes</label>
                                    <textarea
                                        rows={2}
                                        value={invoiceForm.notes}
                                        onChange={e => setInvoiceForm(f => ({ ...f, notes: e.target.value }))}
                                        className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
                                    />
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <button
                                        onClick={() => { setShowInvoiceForm(false); resetInvoiceForm(); }}
                                        className="px-3 py-1.5 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)] rounded-lg text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={saveInvoice}
                                        className="px-3 py-1.5 bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white rounded-lg text-sm font-medium"
                                    >
                                        Save Invoice
                                    </button>
                                </div>
                            </div>
                        )}

                        {(project.invoices || []).length === 0 ? (
                            <div className="p-6 text-center text-[var(--text-muted)] text-sm border border-dashed border-[var(--border)] rounded-xl">
                                No invoices yet
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {(project.invoices || []).map(inv => (
                                    <div key={inv.id} className="p-4 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border)]">
                                        <div className="flex items-start justify-between gap-3 flex-wrap">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-[var(--text-primary)] text-sm">{inv.number}</span>
                                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                                        inv.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                                                        inv.status === 'sent' ? 'bg-blue-500/20 text-blue-400' :
                                                        'bg-slate-500/20 text-[var(--text-secondary)]'
                                                    }`}>{inv.status.toUpperCase()}</span>
                                                </div>
                                                <p className="text-xs text-[var(--text-secondary)] mb-1">{inv.description}</p>
                                                <p className="text-xs text-[var(--text-muted)]">
                                                    Issued {new Date(inv.issuedDate).toLocaleDateString('en-MY')}
                                                    {inv.dueDate ? ` · Due ${new Date(inv.dueDate).toLocaleDateString('en-MY')}` : ''}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-green-400">RM {inv.amount.toLocaleString()}</p>
                                                <div className="flex gap-2 mt-2 justify-end">
                                                    <button
                                                        onClick={() => exportInvoice(inv)}
                                                        className="flex items-center gap-1 px-2.5 py-1.5 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)] rounded-lg text-xs font-medium transition-all"
                                                        title="Export / Print"
                                                    >
                                                        <Printer size={12} /> Export
                                                    </button>
                                                    <button
                                                        onClick={() => emailInvoice(inv)}
                                                        className="flex items-center gap-1 px-2.5 py-1.5 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)] rounded-lg text-xs font-medium transition-all"
                                                        title="Email to client"
                                                    >
                                                        <Send size={12} /> Email
                                                    </button>
                                                    <button
                                                        onClick={() => deleteInvoice(inv.id)}
                                                        className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-[var(--accent-primary)] rounded-lg text-xs font-medium transition-all"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        {inv.notes && (
                                            <p className="mt-2 text-xs text-[var(--text-secondary)] italic">{inv.notes}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Submissions */}
                    <section>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-[var(--accent-primary)]/15 flex items-center justify-center">
                                    <Layers size={14} className="text-[var(--accent-primary)]" />
                                </div>
                                Regulatory Submissions
                                <span className="text-xs font-normal text-[var(--text-muted)] ml-1">
                                    ({project.submissions.length})
                                </span>
                            </h2>
                            {/* Submission mini legend */}
                            <div className="hidden sm:flex items-center gap-3 text-xs text-[var(--text-muted)]">
                                {[
                                    { color: '#f59e0b', label: 'Pending' },
                                    { color: '#059669', label: 'Approved' },
                                    { color: '#f97316', label: 'Resubmit' },
                                    { color: '#dc2626', label: 'Rejected' },
                                ].map(s => (
                                    <span key={s.label} className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                                        {s.label}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {project.submissions.length === 0 ? (
                            <div className="glass rounded-2xl p-12 text-center">
                                <Layers size={32} className="mx-auto mb-3 text-[#9a9a9a]" />
                                <p className="text-[var(--text-secondary)] font-medium">No submissions yet</p>
                                <p className="text-[#9a9a9a] text-sm mt-1">Submissions will appear here once added</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {project.submissions.map((sub, i) => (
                                    <SubmissionCard key={sub.id} sub={sub} index={i} />
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>

            {/* ── Bottom action bar ── */}
            <div className="sticky bottom-0 px-2 py-4 bg-[var(--bg-primary)]/90 backdrop-blur-xl border-t border-[var(--border)] flex items-center justify-between gap-4">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm font-medium"
                >
                    <ArrowLeft size={18} />
                    Back to Projects
                </button>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleDelete}
                        className="text-sm text-[var(--accent-primary)] hover:text-red-300 transition-colors flex items-center gap-1.5"
                    >
                        <Trash2 size={14} />
                        Delete project
                    </button>
                    <button
                        onClick={() => onEdit(project)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white text-sm font-medium rounded-xl transition-all active:scale-95 shadow-lg shadow-[var(--accent-primary)]/20"
                    >
                        <Edit size={15} />
                        Edit Project
                    </button>
                </div>
            </div>
        </div>
    );
}
