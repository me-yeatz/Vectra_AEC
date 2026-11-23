import { useState, useEffect, useMemo } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Trash2,
    Edit3,
    X,
    Clock,
    StickyNote
} from 'lucide-react';
import { CalendarEvent, CalendarNote, CalendarEventCategory } from '../types';

const EVENTS_KEY = 'ytz_calendar_events';
const NOTES_KEY = 'ytz_calendar_notes';

const CATEGORY_COLORS: Record<CalendarEventCategory, string> = {
    meeting: '#9C7654',
    deadline: '#B85C38',
    reminder: '#C9A27E',
    task: '#7A8B6F',
    other: '#8F8276'
};

const CATEGORY_LABELS: Record<CalendarEventCategory, string> = {
    meeting: 'Meeting',
    deadline: 'Deadline',
    reminder: 'Reminder',
    task: 'Task',
    other: 'Other'
};

function toISODate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function parseISODate(value: string): Date {
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
}

function startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, amount: number): Date {
    return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function isSameDay(a: string, b: string): boolean {
    return a === b;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarView() {
    const [events, setEvents] = useState<CalendarEvent[]>(() => {
        try {
            const saved = localStorage.getItem(EVENTS_KEY);
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.error(e);
        }
        return [];
    });

    const [notes, setNotes] = useState<CalendarNote[]>(() => {
        try {
            const saved = localStorage.getItem(NOTES_KEY);
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.error(e);
        }
        return [];
    });

    const [currentMonth, setCurrentMonth] = useState<Date>(() => startOfMonth(new Date()));
    const [selectedDate, setSelectedDate] = useState<string>(() => toISODate(new Date()));
    const [categoryFilter, setCategoryFilter] = useState<CalendarEventCategory | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const [showEventForm, setShowEventForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
    const [eventForm, setEventForm] = useState<Omit<CalendarEvent, 'id'>>({
        title: '',
        date: toISODate(new Date()),
        allDay: true,
        category: 'meeting',
        color: CATEGORY_COLORS.meeting,
        description: ''
    });

    const [showNoteForm, setShowNoteForm] = useState(false);
    const [noteContent, setNoteContent] = useState('');

    useEffect(() => {
        try {
            localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
        } catch (e) {
            console.error(e);
        }
    }, [events]);

    useEffect(() => {
        try {
            localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
        } catch (e) {
            console.error(e);
        }
    }, [notes]);

    const filteredEvents = useMemo(() => {
        return events.filter((event) => {
            if (categoryFilter !== 'all' && event.category !== categoryFilter) return false;
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                if (!event.title.toLowerCase().includes(q) && !(event.description || '').toLowerCase().includes(q)) {
                    return false;
                }
            }
            return true;
        });
    }, [events, categoryFilter, searchQuery]);

    const eventsByDate = useMemo(() => {
        const map: Record<string, CalendarEvent[]> = {};
        filteredEvents.forEach((event) => {
            if (!map[event.date]) map[event.date] = [];
            map[event.date].push(event);
        });
        return map;
    }, [filteredEvents]);

    const gridDays = useMemo(() => {
        const first = startOfMonth(currentMonth);
        const start = new Date(first);
        start.setDate(first.getDate() - first.getDay());
        const days: Date[] = [];
        for (let i = 0; i < 42; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            days.push(d);
        }
        return days;
    }, [currentMonth]);

    const selectedDateEvents = useMemo(() => {
        return filteredEvents
            .filter((e) => isSameDay(e.date, selectedDate))
            .sort((a, b) => {
                if (a.allDay && !b.allDay) return -1;
                if (!a.allDay && b.allDay) return 1;
                return (a.startTime || '').localeCompare(b.startTime || '');
            });
    }, [filteredEvents, selectedDate]);

    const selectedDateNotes = useMemo(() => {
        return notes.filter((n) => isSameDay(n.date, selectedDate));
    }, [notes, selectedDate]);

    const upcomingEvents = useMemo(() => {
        const today = toISODate(new Date());
        return filteredEvents
            .filter((e) => e.date >= today)
            .sort((a, b) => a.date.localeCompare(b.date) || (a.startTime || '').localeCompare(b.startTime || ''))
            .slice(0, 8);
    }, [filteredEvents]);

    const openNewEvent = (date?: string) => {
        setEditingEvent(null);
        setEventForm({
            title: '',
            date: date || selectedDate,
            allDay: true,
            category: 'meeting',
            color: CATEGORY_COLORS.meeting,
            description: '',
            startTime: '',
            endTime: ''
        });
        setShowEventForm(true);
    };

    const openEditEvent = (event: CalendarEvent) => {
        setEditingEvent(event);
        setEventForm({
            title: event.title,
            date: event.date,
            startTime: event.startTime || '',
            endTime: event.endTime || '',
            allDay: event.allDay,
            category: event.category,
            color: event.color || CATEGORY_COLORS[event.category],
            description: event.description || ''
        });
        setShowEventForm(true);
    };

    const saveEvent = () => {
        if (!eventForm.title.trim()) return;
        if (editingEvent) {
            setEvents((prev) =>
                prev.map((e) =>
                    e.id === editingEvent.id
                        ? {
                              ...e,
                              ...eventForm,
                              color: eventForm.color || CATEGORY_COLORS[eventForm.category]
                          }
                        : e
                )
            );
        } else {
            const newEvent: CalendarEvent = {
                id: (crypto as any).randomUUID ? (crypto as any).randomUUID() : `evt_${Date.now()}`,
                ...eventForm,
                color: eventForm.color || CATEGORY_COLORS[eventForm.category]
            };
            setEvents((prev) => [...prev, newEvent]);
        }
        setShowEventForm(false);
        setEditingEvent(null);
    };

    const deleteEvent = (id: string) => {
        if (!window.confirm('Delete this event?')) return;
        setEvents((prev) => prev.filter((e) => e.id !== id));
    };

    const saveNote = () => {
        if (!noteContent.trim()) return;
        const now = new Date().toISOString();
        const newNote: CalendarNote = {
            id: (crypto as any).randomUUID ? (crypto as any).randomUUID() : `note_${Date.now()}`,
            date: selectedDate,
            content: noteContent.trim(),
            createdAt: now,
            updatedAt: now
        };
        setNotes((prev) => [...prev, newNote]);
        setNoteContent('');
        setShowNoteForm(false);
    };

    const deleteNote = (id: string) => {
        if (!window.confirm('Delete this note?')) return;
        setNotes((prev) => prev.filter((n) => n.id !== id));
    };

    const monthTitle = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-display font-bold mb-2">Calendar</h1>
                    <p className="text-[var(--text-secondary)]">Plan events, deadlines and notes</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => openNewEvent()}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white rounded-md text-sm font-medium transition-all"
                    >
                        <Plus size={16} />
                        Add Event
                    </button>
                    <button
                        onClick={() => {
                            setSelectedDate(selectedDate);
                            setShowNoteForm(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)] rounded-md text-sm font-medium transition-all"
                    >
                        <StickyNote size={16} />
                        Add Note
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass rounded-md p-4 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentMonth((m) => addMonths(m, -1))}
                                className="p-2 rounded-md bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)] transition-all"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                onClick={() => setCurrentMonth(startOfMonth(new Date()))}
                                className="px-3 py-2 rounded-md bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)] text-sm font-medium transition-all"
                            >
                                Today
                            </button>
                            <button
                                onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
                                className="p-2 rounded-md bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)] transition-all"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                        <h2 className="text-xl font-display font-semibold">{monthTitle}</h2>
                        <div className="hidden md:flex items-center gap-2">
                            <input
                                type="text"
                                placeholder="Search events..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="px-3 py-2 bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {WEEKDAYS.map((day) => (
                            <div key={day} className="text-center text-xs font-medium text-[var(--text-muted)] py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {gridDays.map((day) => {
                            const iso = toISODate(day);
                            const inMonth = day.getMonth() === currentMonth.getMonth();
                            const isSelected = iso === selectedDate;
                            const isToday = iso === toISODate(new Date());
                            const dayEvents = eventsByDate[iso] || [];
                            return (
                                <button
                                    key={iso}
                                    onClick={() => setSelectedDate(iso)}
                                    className={`min-h-[78px] md:min-h-[92px] p-1.5 rounded-md border text-left transition-all ${
                                        isSelected
                                            ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
                                            : 'border-[var(--border)] bg-[var(--bg-secondary)]/40 hover:bg-[var(--bg-tertiary)]'
                                    } ${inMonth ? '' : 'opacity-40'}`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span
                                            className={`text-xs font-medium ${
                                                isToday
                                                    ? 'w-5 h-5 flex items-center justify-center rounded-full bg-[var(--accent-primary)] text-white'
                                                    : 'text-[var(--text-primary)]'
                                            }`}
                                        >
                                            {day.getDate()}
                                        </span>
                                        {dayEvents.length > 0 && (
                                            <span className="text-[10px] text-[var(--text-muted)]">{dayEvents.length}</span>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        {dayEvents.slice(0, 2).map((event) => (
                                            <div
                                                key={event.id}
                                                className="text-[10px] px-1.5 py-0.5 rounded truncate text-white"
                                                style={{ backgroundColor: event.color || CATEGORY_COLORS[event.category] }}
                                                title={event.title}
                                            >
                                                {event.title}
                                            </div>
                                        ))}
                                        {dayEvents.length > 2 && (
                                            <div className="text-[10px] text-[var(--text-muted)]">+{dayEvents.length - 2} more</div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <button
                            onClick={() => setCategoryFilter('all')}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                categoryFilter === 'all'
                                    ? 'bg-[var(--accent-primary)] text-white'
                                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                            }`}
                        >
                            All
                        </button>
                        {(Object.keys(CATEGORY_LABELS) as CalendarEventCategory[]).map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setCategoryFilter(cat)}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                                    categoryFilter === cat
                                        ? 'bg-[var(--accent-primary)] text-white'
                                        : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                                }`}
                            >
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
                                {CATEGORY_LABELS[cat]}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="glass rounded-md p-4 md:p-5">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold">
                                {parseISODate(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </h3>
                            <button
                                onClick={() => openNewEvent(selectedDate)}
                                className="p-2 rounded-md bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)] transition-all"
                                title="Add event"
                            >
                                <Plus size={16} />
                            </button>
                        </div>

                        {selectedDateEvents.length === 0 ? (
                            <p className="text-sm text-[var(--text-muted)]">No events for this day.</p>
                        ) : (
                            <div className="space-y-2">
                                {selectedDateEvents.map((event) => (
                                    <div
                                        key={event.id}
                                        className="p-3 rounded-md border border-[var(--border)] bg-[var(--bg-secondary)]/60"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span
                                                        className="w-2.5 h-2.5 rounded-full shrink-0"
                                                        style={{ backgroundColor: event.color || CATEGORY_COLORS[event.category] }}
                                                    />
                                                    <p className="font-medium text-sm truncate">{event.title}</p>
                                                </div>
                                                <p className="text-xs text-[var(--text-muted)] mb-1">
                                                    {event.allDay
                                                        ? 'All day'
                                                        : `${event.startTime || '--:--'}${event.endTime ? ` - ${event.endTime}` : ''}`}
                                                    {' · '}
                                                    {CATEGORY_LABELS[event.category]}
                                                </p>
                                                {event.description && (
                                                    <p className="text-xs text-[var(--text-secondary)]">{event.description}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button
                                                    onClick={() => openEditEvent(event)}
                                                    className="p-1.5 rounded-md hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                                                >
                                                    <Edit3 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => deleteEvent(event.id)}
                                                    className="p-1.5 rounded-md hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-4 pt-4 border-t border-[var(--border)]">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-semibold flex items-center gap-2">
                                    <StickyNote size={14} />
                                    Notes
                                </h4>
                                <button
                                    onClick={() => setShowNoteForm(true)}
                                    className="text-xs text-[var(--accent-primary)] hover:underline"
                                >
                                    + Add
                                </button>
                            </div>
                            {selectedDateNotes.length === 0 ? (
                                <p className="text-sm text-[var(--text-muted)]">No notes for this day.</p>
                            ) : (
                                <div className="space-y-2">
                                    {selectedDateNotes.map((note) => (
                                        <div
                                            key={note.id}
                                            className="p-3 rounded-md bg-[var(--bg-tertiary)]/60 border border-[var(--border)]"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">{note.content}</p>
                                                <button
                                                    onClick={() => deleteNote(note.id)}
                                                    className="p-1 rounded-md hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] shrink-0"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="glass rounded-md p-4 md:p-5">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <Clock size={16} />
                            Upcoming
                        </h3>
                        {upcomingEvents.length === 0 ? (
                            <p className="text-sm text-[var(--text-muted)]">No upcoming events.</p>
                        ) : (
                            <div className="space-y-2">
                                {upcomingEvents.map((event) => (
                                    <button
                                        key={event.id}
                                        onClick={() => setSelectedDate(event.date)}
                                        className="w-full text-left p-2.5 rounded-md hover:bg-[var(--bg-tertiary)] transition-all border border-transparent hover:border-[var(--border)]"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="w-2 h-2 rounded-full shrink-0"
                                                style={{ backgroundColor: event.color || CATEGORY_COLORS[event.category] }}
                                            />
                                            <span className="text-sm font-medium truncate">{event.title}</span>
                                        </div>
                                        <p className="text-xs text-[var(--text-muted)] ml-4">
                                            {parseISODate(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            {event.startTime ? ` · ${event.startTime}` : ''}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showEventForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="glass rounded-md w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">{editingEvent ? 'Edit Event' : 'New Event'}</h3>
                            <button
                                onClick={() => {
                                    setShowEventForm(false);
                                    setEditingEvent(null);
                                }}
                                className="p-2 rounded-md hover:bg-[var(--bg-tertiary)]"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-[var(--text-secondary)] mb-1 block">Title</label>
                                <input
                                    type="text"
                                    value={eventForm.title}
                                    onChange={(e) => setEventForm((f) => ({ ...f, title: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
                                    placeholder="Event title"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-medium text-[var(--text-secondary)] mb-1 block">Date</label>
                                    <input
                                        type="date"
                                        value={eventForm.date}
                                        onChange={(e) => setEventForm((f) => ({ ...f, date: e.target.value }))}
                                        className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-[var(--text-secondary)] mb-1 block">Category</label>
                                    <select
                                        value={eventForm.category}
                                        onChange={(e) => {
                                            const cat = e.target.value as CalendarEventCategory;
                                            setEventForm((f) => ({ ...f, category: cat, color: CATEGORY_COLORS[cat] }));
                                        }}
                                        className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
                                    >
                                        {(Object.keys(CATEGORY_LABELS) as CalendarEventCategory[]).map((cat) => (
                                            <option key={cat} value={cat}>
                                                {CATEGORY_LABELS[cat]}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={eventForm.allDay}
                                    onChange={(e) => setEventForm((f) => ({ ...f, allDay: e.target.checked }))}
                                />
                                All day
                            </label>

                            {!eventForm.allDay && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-sm font-medium text-[var(--text-secondary)] mb-1 block">Start</label>
                                        <input
                                            type="time"
                                            value={eventForm.startTime || ''}
                                            onChange={(e) => setEventForm((f) => ({ ...f, startTime: e.target.value }))}
                                            className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-[var(--text-secondary)] mb-1 block">End</label>
                                        <input
                                            type="time"
                                            value={eventForm.endTime || ''}
                                            onChange={(e) => setEventForm((f) => ({ ...f, endTime: e.target.value }))}
                                            className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-medium text-[var(--text-secondary)] mb-1 block">Color</label>
                                <input
                                    type="color"
                                    value={eventForm.color || CATEGORY_COLORS[eventForm.category]}
                                    onChange={(e) => setEventForm((f) => ({ ...f, color: e.target.value }))}
                                    className="h-10 w-16 rounded-md border-2 border-[var(--border)] bg-[var(--bg-secondary)]"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-[var(--text-secondary)] mb-1 block">Description</label>
                                <textarea
                                    rows={3}
                                    value={eventForm.description || ''}
                                    onChange={(e) => setEventForm((f) => ({ ...f, description: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50 resize-none"
                                    placeholder="Optional details"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                onClick={() => {
                                    setShowEventForm(false);
                                    setEditingEvent(null);
                                }}
                                className="px-4 py-2.5 bg-[var(--bg-tertiary)] rounded-md text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveEvent}
                                className="px-4 py-2.5 bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white rounded-md text-sm font-medium"
                            >
                                {editingEvent ? 'Save Changes' : 'Create Event'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showNoteForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="glass rounded-md w-full max-w-md p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">New Note</h3>
                            <button
                                onClick={() => {
                                    setShowNoteForm(false);
                                    setNoteContent('');
                                }}
                                className="p-2 rounded-md hover:bg-[var(--bg-tertiary)]"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <p className="text-sm text-[var(--text-muted)]">
                            {parseISODate(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                        <textarea
                            rows={5}
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50 resize-none"
                            placeholder="Write a note..."
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setShowNoteForm(false);
                                    setNoteContent('');
                                }}
                                className="px-4 py-2.5 bg-[var(--bg-tertiary)] rounded-md text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveNote}
                                className="px-4 py-2.5 bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white rounded-md text-sm font-medium"
                            >
                                Save Note
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}