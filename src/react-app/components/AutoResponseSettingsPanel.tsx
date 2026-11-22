import { useState } from 'react';
import { Save, TestTube, CheckCircle2, XCircle, Bot, Clock, Calendar, Shield, Key, Cloud, UserPlus } from 'lucide-react';
import { AutoResponseSettings } from '../types';
import { ClaudeAIService } from '../services/claudeService';

interface AutoResponseSettingsPanelProps {
    settings: AutoResponseSettings;
    onSave: (settings: AutoResponseSettings) => void;
    onClose: () => void;
    onOpenCloud?: () => void;
    onOpenRegister?: () => void;
}

export default function AutoResponseSettingsPanel({
    settings: initialSettings,
    onSave,
    onClose,
    onOpenCloud,
    onOpenRegister
}: AutoResponseSettingsPanelProps) {
    const [settings, setSettings] = useState<AutoResponseSettings>(initialSettings);
    const [testingConnection, setTestingConnection] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [showApiKey, setShowApiKey] = useState(false);

    const handleTestConnection = async () => {
        if (!settings.claudeApiKey) {
            alert('Please enter your Claude API key first');
            return;
        }

        setTestingConnection(true);
        setConnectionStatus('idle');

        try {
            const service = new ClaudeAIService(settings.claudeApiKey);
            const isConnected = await service.testConnection();
            setConnectionStatus(isConnected ? 'success' : 'error');
        } catch (error) {
            setConnectionStatus('error');
        } finally {
            setTestingConnection(false);
        }
    };

    const handleSave = () => {
        onSave(settings);
        onClose();
    };

    const weekDays = [
        { value: 0, label: 'Sun' },
        { value: 1, label: 'Mon' },
        { value: 2, label: 'Tue' },
        { value: 3, label: 'Wed' },
        { value: 4, label: 'Thu' },
        { value: 5, label: 'Fri' },
        { value: 6, label: 'Sat' }
    ];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="glass rounded-none max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-display font-bold mb-2">AI Auto-Response Settings</h2>
                        <p className="text-[var(--text-secondary)]">Configure your intelligent client communication manager</p>
                    </div>
                    <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-2xl">
                        ✕
                    </button>
                </div>

                <div className="space-y-8">
                    {/* Enable/Disable */}
                    <div className="glass p-6 rounded-none">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-[var(--accent-primary)]/20 rounded-none flex items-center justify-center">
                                    <Bot size={24} className="text-[var(--accent-primary)]" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">AI Auto-Response</h3>
                                    <p className="text-sm text-[var(--text-secondary)]">Automatically respond to client messages using Claude AI</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.enabled}
                                    onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-14 h-7 bg-[var(--bg-tertiary)] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--accent-primary)]/20 rounded-none peer peer-checked:after:translate-x-full peer-checked:after:border-2-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-none after:h-6 after:w-6 after:transition-all peer-checked:bg-[var(--accent-primary)]"></div>
                            </label>
                        </div>
                    </div>

                    {/* Claude API Key */}
                    <div className="glass p-6 rounded-none">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-purple-600/20 rounded-none flex items-center justify-center">
                                <Key size={20} className="text-purple-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Claude API Key</h3>
                                <p className="text-sm text-[var(--text-secondary)]">Get your API key from console.anthropic.com</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="relative">
                                <input
                                    type={showApiKey ? 'text' : 'password'}
                                    value={settings.claudeApiKey || ''}
                                    onChange={(e) => setSettings({ ...settings, claudeApiKey: e.target.value })}
                                    placeholder="sk-ant-..."
                                    className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border-2 border-2-[var(--border-2)] rounded-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-mono text-sm"
                                />
                                <button
                                    onClick={() => setShowApiKey(!showApiKey)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm"
                                >
                                    {showApiKey ? 'Hide' : 'Show'}
                                </button>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleTestConnection}
                                    disabled={testingConnection || !settings.claudeApiKey}
                                    className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <TestTube size={16} />
                                    {testingConnection ? 'Testing...' : 'Test Connection'}
                                </button>
                                {connectionStatus === 'success' && (
                                    <span className="flex items-center gap-2 text-green-400 text-sm">
                                        <CheckCircle2 size={16} />
                                        Connected successfully!
                                    </span>
                                )}
                                {connectionStatus === 'error' && (
                                    <span className="flex items-center gap-2 text-[var(--accent-primary)] text-sm">
                                        <XCircle size={16} />
                                        Connection failed. Check your API key.
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Working Hours */}
                    <div className="glass p-6 rounded-none">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-600/20 rounded-none flex items-center justify-center">
                                <Clock size={20} className="text-blue-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Working Hours</h3>
                                <p className="text-sm text-[var(--text-secondary)]">Define your availability</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-[var(--text-secondary)] mb-2">Start Time</label>
                                <input
                                    type="time"
                                    value={settings.workingHours.start}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        workingHours: { ...settings.workingHours, start: e.target.value }
                                    })}
                                    className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border-2 border-2-[var(--border-2)] rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-[var(--text-secondary)] mb-2">End Time</label>
                                <input
                                    type="time"
                                    value={settings.workingHours.end}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        workingHours: { ...settings.workingHours, end: e.target.value }
                                    })}
                                    className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border-2 border-2-[var(--border-2)] rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Working Days */}
                    <div className="glass p-6 rounded-none">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-green-600/20 rounded-none flex items-center justify-center">
                                <Calendar size={20} className="text-green-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Working Days</h3>
                                <p className="text-sm text-[var(--text-secondary)]">Select your working days</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {weekDays.map(day => (
                                <button
                                    key={day.value}
                                    onClick={() => {
                                        const isSelected = settings.workingDays.includes(day.value);
                                        setSettings({
                                            ...settings,
                                            workingDays: isSelected
                                                ? settings.workingDays.filter(d => d !== day.value)
                                                : [...settings.workingDays, day.value].sort()
                                        });
                                    }}
                                    className={`flex-1 py-3 rounded-none font-medium transition-all ${settings.workingDays.includes(day.value)
                                            ? 'bg-green-600 text-[var(--text-primary)]'
                                            : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                                        }`}
                                >
                                    {day.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Auto-Response Options */}
                    <div className="glass p-6 rounded-none space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-amber-600/20 rounded-none flex items-center justify-center">
                                <Shield size={20} className="text-amber-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Boundary Protection</h3>
                                <p className="text-sm text-[var(--text-secondary)]">Protect your personal time</p>
                            </div>
                        </div>

                        <label className="flex items-center justify-between p-4 bg-[var(--bg-tertiary)] rounded-none cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors">
                            <span className="text-sm">Auto-respond outside working hours</span>
                            <input
                                type="checkbox"
                                checked={settings.autoRespondOutsideHours}
                                onChange={(e) => setSettings({ ...settings, autoRespondOutsideHours: e.target.checked })}
                                className="w-5 h-5 rounded-none bg-[var(--bg-tertiary)] border-2-[var(--border-2)] text-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/50"
                            />
                        </label>

                        <label className="flex items-center justify-between p-4 bg-[var(--bg-tertiary)] rounded-none cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors">
                            <span className="text-sm">Auto-respond on weekends</span>
                            <input
                                type="checkbox"
                                checked={settings.autoRespondOnWeekends}
                                onChange={(e) => setSettings({ ...settings, autoRespondOnWeekends: e.target.checked })}
                                className="w-5 h-5 rounded-none bg-[var(--bg-tertiary)] border-2-[var(--border-2)] text-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/50"
                            />
                        </label>
                    </div>

                    {/* Response Templates */}
                    <div className="glass p-6 rounded-none space-y-4">
                        <h3 className="font-semibold mb-4">Response Templates</h3>

                        <div>
                            <label className="block text-sm text-[var(--text-secondary)] mb-2">Weekend Message</label>
                            <textarea
                                value={settings.responseTemplates.weekendMessage}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    responseTemplates: { ...settings.responseTemplates, weekendMessage: e.target.value }
                                })}
                                rows={3}
                                className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border-2 border-2-[var(--border-2)] rounded-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50 transition-all resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-[var(--text-secondary)] mb-2">After Hours Message</label>
                            <textarea
                                value={settings.responseTemplates.afterHoursMessage}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    responseTemplates: { ...settings.responseTemplates, afterHoursMessage: e.target.value }
                                })}
                                rows={3}
                                className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border-2 border-2-[var(--border-2)] rounded-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50 transition-all resize-none"
                            />
                        </div>
                    </div>

                    {/* Escalation Keywords */}
                    <div className="glass p-6 rounded-none">
                        <h3 className="font-semibold mb-2">Escalation Keywords</h3>
                        <p className="text-sm text-[var(--text-secondary)] mb-4">Messages containing these keywords will be flagged for human review</p>
                        <input
                            type="text"
                            value={settings.escalationKeywords.join(', ')}
                            onChange={(e) => setSettings({
                                ...settings,
                                escalationKeywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean)
                            })}
                            placeholder="urgent, emergency, deadline, legal, safety"
                            className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border-2 border-2-[var(--border-2)] rounded-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50 transition-all"
                        />
                    </div>

                    {/* Storage & Sync */}
                    <div className="glass p-6 rounded-none">
                        <h3 className="font-semibold mb-4">Storage & Sync</h3>
                        <p className="text-sm text-[var(--text-secondary)] mb-4">Connect cloud storage or choose where data is saved</p>
                        <div className="flex gap-3 flex-wrap">
                            {onOpenCloud && (
                                <button
                                    onClick={() => { onClose(); onOpenCloud(); }}
                                    className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)] rounded-none transition-all"
                                >
                                    <Cloud size={16} />
                                    Cloud Sync
                                </button>
                            )}
                            {onOpenRegister && (
                                <button
                                    onClick={() => { onClose(); onOpenRegister(); }}
                                    className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)] rounded-none transition-all"
                                >
                                    <UserPlus size={16} />
                                    Register Storage
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4 pt-4 border-2-t border-2-[var(--border-2)]">
                        <button
                            onClick={handleSave}
                            className="flex-1 flex items-center justify-center gap-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white px-6 py-4 rounded-none font-medium transition-all shadow-lg shadow-[var(--accent-primary)]/20"
                        >
                            <Save size={20} />
                            Save Settings
                        </button>
                        <button
                            onClick={onClose}
                            className="px-6 py-4 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)] rounded-none font-medium transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
