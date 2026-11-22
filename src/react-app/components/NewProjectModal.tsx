import React, { useState } from 'react';
import { X, Building2, MapPin, Calendar, DollarSign, FileText, Phone, Mail, StickyNote, Image as ImageIcon, Upload, Trash2 } from 'lucide-react';
import { Project, ProjectStatus } from '../types';

interface NewProjectModalProps {
    onClose: () => void;
    onSave: (project: Omit<Project, 'id'>) => void;
    initialData?: Project;
    fullPage?: boolean;
}

export default function NewProjectModal({ onClose, onSave, initialData, fullPage }: NewProjectModalProps) {
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        clientName: initialData?.clientName || '',
        clientPhone: initialData?.clientPhone || '',
        clientEmail: initialData?.clientEmail || '',
        clientCompany: initialData?.clientCompany || '',
        location: initialData?.location || '',
        description: initialData?.description || '',
        notes: initialData?.notes || '',
        status: initialData?.status || 'concept' as ProjectStatus,
        startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
        targetCompletionDate: initialData?.targetCompletionDate || '',
        totalBudget: initialData?.totalBudget?.toString() || '',
        color: initialData?.color || '#dc2626'
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [sitePhotos, setSitePhotos] = useState<string[]>(initialData?.sitePhotos || []);

    const isEditing = !!initialData;

    const statusOptions: { value: ProjectStatus; label: string; color: string }[] = [
        { value: 'concept', label: 'Concept', color: '#6366f1' },
        { value: 'design-development', label: 'Design Development', color: '#8b5cf6' },
        { value: 'submission-prep', label: 'Submission Prep', color: '#f59e0b' },
        { value: 'submitted', label: 'Submitted', color: '#3b82f6' },
        { value: 'approved', label: 'Approved', color: '#10b981' },
        { value: 'on-hold', label: 'On Hold', color: '#ef4444' },
        { value: 'completed', label: 'Completed', color: '#059669' }
    ];

    const colorOptions = [
        { value: '#dc2626', label: 'Red' },
        { value: '#ea580c', label: 'Orange' },
        { value: '#f59e0b', label: 'Amber' },
        { value: '#10b981', label: 'Green' },
        { value: '#3b82f6', label: 'Blue' },
        { value: '#8b5cf6', label: 'Purple' },
        { value: '#ec4899', label: 'Pink' }
    ];

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Project title is required';
        }
        if (!formData.clientName.trim()) {
            newErrors.clientName = 'Client name is required';
        }
        if (!formData.location.trim()) {
            newErrors.location = 'Location is required';
        }
        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }
        if (!isEditing && sitePhotos.length === 0) {
            newErrors.sitePhotos = 'At least one site photo is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const newProject: Omit<Project, 'id'> = {
            title: formData.title,
            clientName: formData.clientName,
            clientPhone: formData.clientPhone || undefined,
            clientEmail: formData.clientEmail || undefined,
            clientCompany: formData.clientCompany || undefined,
            location: formData.location,
            description: formData.description,
            notes: formData.notes || undefined,
            status: formData.status,
            startDate: formData.startDate,
            targetCompletionDate: formData.targetCompletionDate || undefined,
            totalBudget: formData.totalBudget ? parseFloat(formData.totalBudget) : undefined,
            submissions: initialData?.submissions || [],
            color: formData.color,
            sitePhotos: sitePhotos.length ? sitePhotos : undefined
        };

        try {
            console.log('Saving project:', newProject);
            onSave(newProject);
            console.log('Project saved successfully');
            onClose();
        } catch (error) {
            console.error('Error saving project:', error);
            // Still close modal to prevent stuck state? Or show error?
            // For now, let's assume valid data and just log.
            // If critical, maybe set a form level error.
            setErrors(prev => ({ ...prev, submit: 'Failed to create project. Please try again.' }));
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        Array.from(files).forEach(file => {
            if (!file.type.startsWith('image/')) return;
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                setSitePhotos(prev => [...prev, result]);
            };
            reader.readAsDataURL(file);
        });
        e.target.value = '';
        if (errors.sitePhotos) setErrors(prev => ({ ...prev, sitePhotos: '' }));
    };

    const removePhoto = (index: number) => {
        setSitePhotos(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div
            className={fullPage ? "min-h-screen bg-[var(--bg-primary)] p-6 md:p-10 flex items-start justify-center" : "fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"}
            onClick={fullPage ? undefined : onClose}
        >
            <div
                className="glass rounded-none max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 animate-fade-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-display font-bold mb-2">{isEditing ? 'Edit Project' : 'Create New Project'}</h2>
                        <p className="text-[var(--text-secondary)]">{isEditing ? 'Update project details' : 'Add a new architecture project to your tracker'}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-2xl"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Project Title */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] mb-2">
                            <Building2 size={16} />
                            Project Title *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            placeholder="e.g., Modern Residential Villa"
                            className={`w-full px-4 py-3 bg-[var(--bg-tertiary)] border-2 ${errors.title ? 'border-2-[var(--accent-primary)]' : 'border-2-[var(--border-2)]'} rounded-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50 transition-all`}
                        />
                        {errors.title && <p className="text-[var(--accent-primary)] text-sm mt-1">{errors.title}</p>}
                    </div>

                    {/* Client Name & Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] mb-2">
                                <Building2 size={16} />
                                Client Name *
                            </label>
                            <input
                                type="text"
                                value={formData.clientName}
                                onChange={(e) => handleChange('clientName', e.target.value)}
                                placeholder="e.g., Ahmad bin Hassan"
                                className={`w-full px-4 py-3 bg-[var(--bg-tertiary)] border-2 ${errors.clientName ? 'border-2-[var(--accent-primary)]' : 'border-2-[var(--border-2)]'} rounded-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50 transition-all`}
                            />
                            {errors.clientName && <p className="text-[var(--accent-primary)] text-sm mt-1">{errors.clientName}</p>}
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] mb-2">
                                <MapPin size={16} />
                                Location *
                            </label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => handleChange('location', e.target.value)}
                                placeholder="e.g., Kuala Lumpur"
                                className={`w-full px-4 py-3 bg-[var(--bg-tertiary)] border-2 ${errors.location ? 'border-2-[var(--accent-primary)]' : 'border-2-[var(--border-2)]'} rounded-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50 transition-all`}
                            />
                            {errors.location && <p className="text-[var(--accent-primary)] text-sm mt-1">{errors.location}</p>}
                        </div>
                    </div>

                    {/* Client Company */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] mb-2">
                            <Building2 size={16} />
                            Company / Organisation
                        </label>
                        <input
                            type="text"
                            value={formData.clientCompany}
                            onChange={(e) => handleChange('clientCompany', e.target.value)}
                            placeholder="e.g., Synergy Holdings Sdn Bhd"
                            className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border-2 border-2-[var(--border-2)] rounded-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50 transition-all"
                        />
                    </div>

                    {/* Client Phone & Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] mb-2">
                                <Phone size={16} />
                                Client Phone
                            </label>
                            <input
                                type="tel"
                                value={formData.clientPhone}
                                onChange={(e) => handleChange('clientPhone', e.target.value)}
                                placeholder="e.g., +60123456789"
                                className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border-2 border-2-[var(--border-2)] rounded-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50 transition-all"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] mb-2">
                                <Mail size={16} />
                                Client Email
                            </label>
                            <input
                                type="email"
                                value={formData.clientEmail}
                                onChange={(e) => handleChange('clientEmail', e.target.value)}
                                placeholder="e.g., client@example.com"
                                className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border-2 border-2-[var(--border-2)] rounded-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50 transition-all"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] mb-2">
                            <FileText size={16} />
                            Description *
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="Describe the project scope, requirements, and key features..."
                            rows={4}
                            className={`w-full px-4 py-3 bg-[var(--bg-tertiary)] border-2 ${errors.description ? 'border-2-[var(--accent-primary)]' : 'border-2-[var(--border-2)]'} rounded-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50 transition-all resize-none`}
                        />
                        {errors.description && <p className="text-[var(--accent-primary)] text-sm mt-1">{errors.description}</p>}
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] mb-2">
                            <StickyNote size={16} />
                            Internal Notes
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            placeholder="Any internal notes, client preferences, special requirements..."
                            rows={3}
                            className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border-2 border-2-[var(--border-2)] rounded-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50 transition-all resize-none"
                        />
                    </div>

                    {/* Status & Color */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
                                Project Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => handleChange('status', e.target.value)}
                                className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border-2 border-2-[var(--border-2)] rounded-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50 transition-all text-[var(--text-primary)]"
                                style={{ colorScheme: 'dark' }}
                            >
                                {statusOptions.map(option => (
                                    <option key={option.value} value={option.value} className="bg-[#FFFFFF] text-[var(--text-primary)]">
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
                                Project Color
                            </label>
                            <div className="flex gap-2">
                                {colorOptions.map(color => (
                                    <button
                                        key={color.value}
                                        type="button"
                                        onClick={() => handleChange('color', color.value)}
                                        className={`w-10 h-10 rounded-none transition-all ${formData.color === color.value
                                            ? 'ring-2 ring-white ring-offset-2 ring-offset-[#FFFFFF] scale-110'
                                            : 'hover:scale-105'
                                            }`}
                                        style={{ backgroundColor: color.value }}
                                        title={color.label}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] mb-2">
                                <Calendar size={16} />
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => handleChange('startDate', e.target.value)}
                                className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border-2 border-2-[var(--border-2)] rounded-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50 transition-all"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] mb-2">
                                <Calendar size={16} />
                                Target Completion Date
                            </label>
                            <input
                                type="date"
                                value={formData.targetCompletionDate}
                                onChange={(e) => handleChange('targetCompletionDate', e.target.value)}
                                className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border-2 border-2-[var(--border-2)] rounded-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50 transition-all"
                            />
                        </div>
                    </div>

                    {/* Budget */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] mb-2">
                            <DollarSign size={16} />
                            Total Budget (RM)
                        </label>
                        <input
                            type="number"
                            value={formData.totalBudget}
                            onChange={(e) => handleChange('totalBudget', e.target.value)}
                            placeholder="e.g., 500000"
                            min="0"
                            step="1000"
                            className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border-2 border-2-[var(--border-2)] rounded-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50 transition-all"
                        />
                    </div>

                    {/* Site Photos */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] mb-2">
                            <ImageIcon size={16} />
                            Site Photos {!isEditing && '*'}
                        </label>
                        <div className="flex items-center gap-3 mb-3">
                            <label className="flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)] border-2 border-2-[var(--border-2)] rounded-none cursor-pointer transition-all text-sm font-medium">
                                <Upload size={16} />
                                Upload photos
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handlePhotoUpload}
                                    className="hidden"
                                />
                            </label>
                            <span className="text-xs text-[var(--text-muted)]">{sitePhotos.length} photo{sitePhotos.length !== 1 ? 's' : ''} selected</span>
                        </div>
                        {errors.sitePhotos && <p className="text-[var(--accent-primary)] text-sm mb-2">{errors.sitePhotos}</p>}
                        {sitePhotos.length > 0 && (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                {sitePhotos.map((photo, idx) => (
                                    <div key={idx} className="relative group rounded-none overflow-hidden border-2 border-2-[var(--border-2)] aspect-square bg-[var(--bg-tertiary)]">
                                        <img src={photo} alt={`Site photo ${idx + 1}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removePhoto(idx)}
                                            className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-[var(--accent-primary)] text-[var(--text-primary)] rounded-none opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Remove photo"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    {errors.submit && (
                        <div className="p-3 bg-red-500/10 border-2 border-2-[var(--accent-primary)]/20 rounded-none text-[var(--accent-primary)] text-sm mb-4">
                            {errors.submit}
                        </div>
                    )}
                    <div className="flex items-center gap-4 pt-4 border-2-t border-2-[var(--border-2)]">
                        <button
                            type="submit"
                            className="flex-1 bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white px-6 py-4 rounded-none font-medium transition-all shadow-lg shadow-[var(--accent-primary)]/20 active:scale-95"
                        >
                            {isEditing ? 'Save Changes' : 'Create Project'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-4 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)] rounded-none font-medium transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
