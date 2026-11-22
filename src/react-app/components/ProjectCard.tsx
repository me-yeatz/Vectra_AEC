import { useState, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    MapPin,
    User,
    Calendar,
    DollarSign,
    FileText,
    MoreHorizontal,
    CheckCircle2,
    Clock,
    AlertCircle,
    XCircle,
    Edit,
    Trash2
} from 'lucide-react';
import { Project } from '../types';

interface ProjectCardProps {
    project: Project;
    onView: (project: Project) => void;
    onEdit: (project: Project) => void;
    onDelete: (projectId: string) => void;
}

const statusConfig = {
    'concept':            { label: 'Concept',         color: '#6366f1', icon: Clock },
    'design-development': { label: 'Design Dev',      color: '#3b82f6', icon: Clock },
    'submission-prep':    { label: 'Prep Submit',     color: '#f59e0b', icon: Clock },
    'submitted':          { label: 'Submitted',       color: '#f97316', icon: AlertCircle },
    'approved':           { label: 'Approved',        color: '#059669', icon: CheckCircle2 },
    'on-hold':            { label: 'On Hold',         color: '#64748b', icon: XCircle },
    'completed':          { label: 'Completed',       color: '#10b981', icon: CheckCircle2 },
};

export default function ProjectCard({ project, onView, onEdit, onDelete }: ProjectCardProps) {
    const [showActions, setShowActions] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
    const buttonRef = useRef<HTMLButtonElement>(null);
    const config = statusConfig[project.status];
    const StatusIcon = config.icon;

    const totalFees = project.submissions.reduce((sum, sub) => sum + sub.consultantFee, 0);
    const pendingSubmissions = project.submissions.filter(s => s.status === 'pending').length;
    const approvedSubmissions = project.submissions.filter(s => s.status === 'approved').length;

    // Calculate dropdown position when menu opens (useLayoutEffect avoids flash)
    useLayoutEffect(() => {
        if (showActions && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const dropdownHeight = 88;
            const gap = 8;

            let right = window.innerWidth - rect.right;
            let top = rect.bottom + gap;

            if (top + dropdownHeight > window.innerHeight) {
                top = rect.top - dropdownHeight - gap;
            }

            setDropdownPosition({ top, right });
        }
    }, [showActions]);

    return (
        <div
            className="glass p-6 rounded-2xl hover:border-red-500/30 transition-all group cursor-pointer animate-fade-in relative"
            onClick={() => onView(project)}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${project.color}20`, color: project.color }}
                >
                    <FileText size={24} />
                </div>
                <div className="relative">
                    <button
                        ref={buttonRef}
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowActions((prev) => !prev);
                        }}
                        className={`transition-all p-2 rounded-xl flex items-center justify-center ${showActions
                            ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                            : 'text-[#8a8a8a] hover:text-[#222222] hover:bg-[#222222]/8'
                            }`}
                        aria-label="Project actions"
                        aria-expanded={showActions}
                    >
                        <MoreHorizontal size={20} />
                    </button>

                    {showActions &&
                        createPortal(
                            <>
                                <div
                                    className="fixed inset-0 z-[9998] bg-black/5 backdrop-blur-[1px]"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setShowActions(false);
                                    }}
                                />
                                <div
                                    role="menu"
                                    aria-label="Project actions"
                                    className="fixed w-44 bg-[#FFFFFF] border border-[#222222]/10 rounded-2xl shadow-2xl z-[9999] overflow-hidden animate-fade-in ring-1 ring-white/10"
                                    style={{
                                        top: `${dropdownPosition.top}px`,
                                        right: `${dropdownPosition.right}px`
                                    }}
                                >
                                    <div className="p-1.5 space-y-1">
                                        <button
                                            type="button"
                                            role="menuitem"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                onEdit(project);
                                                setShowActions(false);
                                            }}
                                            className="w-full text-left px-3 py-2.5 text-sm text-[#444444] hover:bg-[#222222]/5 hover:text-[#222222] rounded-xl flex items-center gap-3 transition-all group"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-[#222222]/5 flex items-center justify-center group-hover:bg-red-600/10 group-hover:text-red-500">
                                                <Edit size={16} />
                                            </div>
                                            <span className="font-medium">Edit Project</span>
                                        </button>
                                        <div className="h-px bg-[#222222]/5 mx-2" />
                                        <button
                                            type="button"
                                            role="menuitem"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                onDelete(project.id);
                                                setShowActions(false);
                                            }}
                                            className="w-full text-left px-3 py-2.5 text-sm text-red-500 hover:bg-red-500/10 rounded-xl flex items-center gap-3 transition-all group"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500 group-hover:text-[#222222]">
                                                <Trash2 size={16} />
                                            </div>
                                            <span className="font-medium">Delete Project</span>
                                        </button>
                                    </div>
                                </div>
                            </>,
                            document.body
                        )}
                </div>
            </div>

            {/* Project Title */}
            <h3 className="text-xl font-display font-bold mb-2 group-hover:text-red-500 transition-colors line-clamp-2">
                {project.title}
            </h3>

            {/* Client & Location */}
            <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-[#5a5a5a]">
                    <User size={14} />
                    <span className="line-clamp-1">{project.clientName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#5a5a5a]">
                    <MapPin size={14} />
                    <span className="line-clamp-1">{project.location}</span>
                </div>
            </div>

            {/* Status Badge */}
            <div className="mb-6">
                <div
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: `${config.color}20`, color: config.color }}
                >
                    <StatusIcon size={14} />
                    {config.label}
                </div>
            </div>

            {/* Submissions Summary */}
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-[#222222]/5 rounded-xl">
                <div>
                    <p className="text-xs text-[#8a8a8a] mb-1">Pending</p>
                    <p className="text-lg font-bold text-amber-500">{pendingSubmissions}</p>
                </div>
                <div>
                    <p className="text-xs text-[#8a8a8a] mb-1">Approved</p>
                    <p className="text-lg font-bold text-green-500">{approvedSubmissions}</p>
                </div>
            </div>

            {/* Footer */}
            <div className="pt-6 border-t border-[#222222]/8 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-[#8a8a8a]">
                    <Calendar size={14} />
                    <span>Due {new Date(project.targetCompletionDate || project.startDate).toLocaleDateString('en-MY', { month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-1 text-[#444444] font-semibold">
                    <DollarSign size={14} />
                    <span>RM {(totalFees / 1000).toFixed(1)}K</span>
                </div>
            </div>
        </div>
    );
}
