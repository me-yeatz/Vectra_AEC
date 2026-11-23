import { useState } from 'react';
import {
    ArrowRight,
    CheckCircle2,
    FolderKanban,
    FileText,
    DollarSign,
    Calendar,
    Bug,
    Bot,
    Shield,
    Zap,
    Users,
    Building2
} from 'lucide-react';

interface LandingPageProps {
    onEnter: () => void;
}

export default function LandingPage({ onEnter }: LandingPageProps) {
    const [showDemo, setShowDemo] = useState(false);

    const features = [
        { icon: <FolderKanban size={24} />, title: 'Project Tracking', desc: 'Manage architecture projects from concept to completion with clear status and progress.' },
        { icon: <FileText size={24} />, title: 'Submission Management', desc: 'Track approvals to authorities like DBKL, JKR, Bomba and DOE in one place.' },
        { icon: <DollarSign size={24} />, title: 'Financial Overview', desc: 'Monitor consultant fees, budgets and project costs with live summaries.' },
        { icon: <Calendar size={24} />, title: 'Calendar & Deadlines', desc: 'Plan events, deadlines and notes so nothing slips through the cracks.' },
        { icon: <Bug size={24} />, title: 'Issue Tracking', desc: 'Capture RFIs, snags, defects and change requests with Kanban workflow.' },
        { icon: <Bot size={24} />, title: 'AI Assistant', desc: 'Get intelligent help for client messages, templates and project queries.' }
    ];

    const benefits = [
        'Centralize all project data in one workspace',
        'Never miss an authority submission deadline',
        'Track consultant fees and budgets clearly',
        'Collaborate with your team in real time',
        'Use AI to speed up client communication',
        'Works on desktop and mobile'
    ];

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
            {/* Hero */}
            <section className="relative overflow-hidden">
                <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1">
                            <span className="inline-block px-3 py-1 rounded-full bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] text-sm font-medium mb-4">
                                Built for AEC Professionals
                            </span>
                            <h1 className="text-5xl md:text-6xl font-display font-bold leading-tight mb-6">
                                Manage Architecture Projects with <span className="text-[var(--accent-primary)]">Clarity</span>
                            </h1>
                            <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-xl">
                                Vectra AEC is a modern project tracker for architecture and engineering teams.
                                Track projects, submissions, finances, issues and deadlines — all in one place.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={onEnter}
                                    className="flex items-center gap-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white px-6 py-3 rounded-md font-medium transition-all shadow-lg shadow-[var(--accent-primary)]/20"
                                >
                                    Launch App
                                    <ArrowRight size={18} />
                                </button>
                                <button
                                    onClick={() => setShowDemo(!showDemo)}
                                    className="px-6 py-3 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)] rounded-md font-medium transition-all"
                                >
                                    {showDemo ? 'Hide Preview' : 'View Preview'}
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 w-full">
                            <div className="glass rounded-md p-6 shadow-2xl">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-3 h-3 rounded-full bg-red-400" />
                                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                                    <div className="w-3 h-3 rounded-full bg-green-400" />
                                </div>
                                <div className="space-y-3">
                                    <div className="h-4 bg-[var(--bg-tertiary)] rounded-md w-3/4" />
                                    <div className="h-4 bg-[var(--bg-tertiary)] rounded-md w-1/2" />
                                    <div className="grid grid-cols-3 gap-3 mt-6">
                                        <div className="h-20 bg-[var(--accent-primary)]/20 rounded-md" />
                                        <div className="h-20 bg-[var(--bg-tertiary)] rounded-md" />
                                        <div className="h-20 bg-[var(--bg-tertiary)] rounded-md" />
                                    </div>
                                    <div className="h-4 bg-[var(--bg-tertiary)] rounded-md w-2/3 mt-4" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="max-w-6xl mx-auto px-6 py-16">
                <h2 className="text-3xl font-display font-bold text-center mb-4">Everything you need</h2>
                <p className="text-center text-[var(--text-secondary)] mb-12 max-w-2xl mx-auto">
                    From concept to completion, Vectra keeps your projects, submissions and team aligned.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((f, i) => (
                        <div key={i} className="glass rounded-md p-6 hover:border-[var(--border-hover)] transition-all">
                            <div className="w-12 h-12 rounded-md bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] flex items-center justify-center mb-4">
                                {f.icon}
                            </div>
                            <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                            <p className="text-sm text-[var(--text-secondary)]">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Benefits */}
            <section className="max-w-6xl mx-auto px-6 py-16">
                <div className="glass rounded-md p-8 md:p-12">
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="flex-1">
                            <h2 className="text-3xl font-display font-bold mb-4">Why teams choose Vectra</h2>
                            <p className="text-[var(--text-secondary)] mb-6">
                                Save hours every week by replacing scattered spreadsheets with one focused workspace.
                            </p>
                            <ul className="space-y-3">
                                {benefits.map((b, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <CheckCircle2 size={18} className="text-[var(--accent-primary)] shrink-0" />
                                        <span className="text-[var(--text-secondary)]">{b}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex-1 grid grid-cols-2 gap-4">
                            <div className="glass rounded-md p-4 text-center">
                                <Building2 size={24} className="mx-auto mb-2 text-[var(--accent-primary)]" />
                                <p className="text-2xl font-bold">100%</p>
                                <p className="text-xs text-[var(--text-muted)]">Project visibility</p>
                            </div>
                            <div className="glass rounded-md p-4 text-center">
                                <Users size={24} className="mx-auto mb-2 text-[var(--accent-primary)]" />
                                <p className="text-2xl font-bold">Team</p>
                                <p className="text-xs text-[var(--text-muted)]">Ready collaboration</p>
                            </div>
                            <div className="glass rounded-md p-4 text-center">
                                <Shield size={24} className="mx-auto mb-2 text-[var(--accent-primary)]" />
                                <p className="text-2xl font-bold">Secure</p>
                                <p className="text-xs text-[var(--text-muted)]">Local-first data</p>
                            </div>
                            <div className="glass rounded-md p-4 text-center">
                                <Zap size={24} className="mx-auto mb-2 text-[var(--accent-primary)]" />
                                <p className="text-2xl font-bold">Fast</p>
                                <p className="text-xs text-[var(--text-muted)]">Instant updates</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="max-w-6xl mx-auto px-6 py-16 text-center">
                <h2 className="text-3xl font-display font-bold mb-4">Ready to get started?</h2>
                <p className="text-[var(--text-secondary)] mb-8">Launch Vectra and take control of your projects today.</p>
                <button
                    onClick={onEnter}
                    className="inline-flex items-center gap-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white px-8 py-4 rounded-md font-medium transition-all shadow-lg shadow-[var(--accent-primary)]/20"
                >
                    Launch App
                    <ArrowRight size={18} />
                </button>
            </section>

            {/* Footer */}
            <footer className="border-t border-[var(--border)] py-8 text-center text-sm text-[var(--text-muted)]">
                © {new Date().getFullYear()} Vectra AEC. Built for project excellence.
            </footer>
        </div>
    );
}