import React, { useState, useEffect } from 'react';
import {
  Table,
  FolderKanban,
  User,
  FileText,
  Plus,
  Edit3,
  Trash2,
  Search,
  ChevronDown,
  ChevronRight,
  Download
} from 'lucide-react';
import { Task, Client, Document, ProjectNote } from '../services/simpleDatabaseService';
import { createDatabaseService, DatabaseService } from '../services/DatabaseServiceFactory';
import CsvUploadComponent from './CsvUploadComponent';

interface DatabaseManagerProps {
  projectId?: string;
}

const DatabaseManager: React.FC<DatabaseManagerProps> = ({ projectId }) => {
  const [dbService] = useState<DatabaseService>(() => createDatabaseService());
  const [activeTab, setActiveTab] = useState<'tasks' | 'clients' | 'documents' | 'notes' | 'csv'>('tasks');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [notes, setNotes] = useState<ProjectNote[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Form states
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);

  // Task form state
  const [newTask, setNewTask] = useState<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium'
  });

  // Client form state
  const [newClient, setNewClient] = useState<Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'projects'>>({
    name: '',
    email: '',
    phone: '',
    company: ''
  });

  // Document form state
  const [newDocument, setNewDocument] = useState<Omit<Document, 'id' | 'createdAt' | 'updatedAt'>>({
    projectId: projectId || '',
    fileName: '',
    fileType: '',
    fileSize: 0,
    downloadUrl: '',
    uploadedBy: 'Current User'
  });

  // Note form state
  const [newNote, setNewNote] = useState<Omit<ProjectNote, 'id' | 'createdAt' | 'updatedAt'>>({
    projectId: projectId || '',
    title: '',
    content: '',
    tags: []
  });

  // Load data based on active tab
  useEffect(() => {
    switch (activeTab) {
      case 'tasks':
        setTasks(dbService.getAllTasks());
        break;
      case 'clients':
        setClients(dbService.getAllClients());
        break;
      case 'documents':
        setDocuments(dbService.getAllDocuments());
        break;
      case 'notes':
        setNotes(dbService.getProjectNotesByProjectId(projectId || ''));
        break;
      case 'csv':
        // No data loading needed for CSV tab
        break;
    }
  }, [activeTab, projectId, dbService]);

  const toggleRowExpand = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleCreateTask = () => {
    if (!newTask.title.trim()) return;

    const task = dbService.createTask(
      newTask.title,
      newTask.description,
      projectId,
      undefined,
      newTask.status,
      newTask.priority
    );

    setTasks([...tasks, task]);
    setNewTask({ title: '', description: '', status: 'todo', priority: 'medium' });
    setShowTaskForm(false);
  };

  const handleCreateClient = () => {
    if (!newClient.name.trim()) return;

    const client = dbService.createClient(
      newClient.name,
      newClient.email,
      newClient.phone,
      newClient.company
    );

    setClients([...clients, client]);
    setNewClient({ name: '', email: '', phone: '', company: '' });
    setShowClientForm(false);
  };

  const handleCreateDocument = () => {
    if (!newDocument.fileName.trim()) return;

    const document = dbService.createDocument(
      newDocument.projectId,
      newDocument.fileName,
      newDocument.fileType,
      newDocument.fileSize,
      newDocument.downloadUrl,
      newDocument.uploadedBy
    );

    setDocuments([...documents, document]);
    setNewDocument({
      projectId: projectId || '',
      fileName: '',
      fileType: '',
      fileSize: 0,
      downloadUrl: '',
      uploadedBy: 'Current User'
    });
    setShowDocumentForm(false);
  };

  const handleCreateNote = () => {
    if (!newNote.title.trim()) return;

    const note = dbService.createProjectNote(
      newNote.projectId,
      newNote.title,
      newNote.content,
      newNote.tags
    );

    setNotes([...notes, note]);
    setNewNote({
      projectId: projectId || '',
      title: '',
      content: '',
      tags: []
    });
    setShowNoteForm(false);
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'todo': return 'bg-gray-500';
      case 'in-progress': return 'bg-blue-500';
      case 'review': return 'bg-yellow-500';
      case 'done': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-orange-400';
      case 'critical': return 'text-[var(--accent-primary)]';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="h-full flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-md overflow-hidden">
      {/* Tab Navigation - Mobile-friendly */}
      <div className="border-2-b border-2-[var(--border-2)] bg-[var(--bg-tertiary)] overflow-x-auto">
        <div className="flex min-w-max">
          <button
            className={`flex items-center gap-2 px-4 py-3 sm:px-6 sm:py-4 font-medium transition-colors whitespace-nowrap ${activeTab === 'tasks'
              ? 'text-[var(--accent-primary)] border-2-b-2 border-2-red-400'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            onClick={() => setActiveTab('tasks')}
          >
            <Table size={18} />
            <span className="hidden sm:inline">Tasks</span>
            <span className="sm:hidden">T</span>
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-3 sm:px-6 sm:py-4 font-medium transition-colors whitespace-nowrap ${activeTab === 'clients'
              ? 'text-[var(--accent-primary)] border-2-b-2 border-2-red-400'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            onClick={() => setActiveTab('clients')}
          >
            <User size={18} />
            <span className="hidden sm:inline">Clients</span>
            <span className="sm:hidden">C</span>
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-3 sm:px-6 sm:py-4 font-medium transition-colors whitespace-nowrap ${activeTab === 'documents'
              ? 'text-[var(--accent-primary)] border-2-b-2 border-2-red-400'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            onClick={() => setActiveTab('documents')}
          >
            <FileText size={18} />
            <span className="hidden sm:inline">Documents</span>
            <span className="sm:hidden">D</span>
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-3 sm:px-6 sm:py-4 font-medium transition-colors whitespace-nowrap ${activeTab === 'notes'
              ? 'text-[var(--accent-primary)] border-2-b-2 border-2-red-400'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            onClick={() => setActiveTab('notes')}
          >
            <FolderKanban size={18} />
            <span className="hidden sm:inline">Notes</span>
            <span className="sm:hidden">N</span>
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-3 sm:px-6 sm:py-4 font-medium transition-colors whitespace-nowrap ${activeTab === 'csv'
              ? 'text-[var(--accent-primary)] border-2-b-2 border-2-red-400'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            onClick={() => setActiveTab('csv')}
          >
            <Download size={18} />
            <span className="hidden sm:inline">CSV Import</span>
            <span className="sm:hidden">I</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative group w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent-primary)] transition-colors" size={18} />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              className="pl-12 pr-6 py-3 bg-[var(--bg-tertiary)] border-2 border-2-[var(--border-2)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50 transition-all w-full"
            />
          </div>

          <button
            onClick={() => {
              if (activeTab === 'tasks') setShowTaskForm(true);
              else if (activeTab === 'clients') setShowClientForm(true);
              else if (activeTab === 'documents') setShowDocumentForm(true);
              else if (activeTab === 'notes') setShowNoteForm(true);
            }}
            className="flex items-center justify-center gap-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white px-4 py-2 rounded-md transition-colors w-full sm:w-auto"
          >
            <Plus size={16} />
            <span>Add {activeTab.slice(0, -1).charAt(0).toUpperCase() + activeTab.slice(0, -1).slice(1)}</span>
          </button>
        </div>

        {/* Forms */}
        {showTaskForm && (
          <div className="glass p-6 rounded-md mb-6">
            <h3 className="text-lg font-semibold mb-4">Create New Task</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border-2 border-2-[var(--border-2)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
                  placeholder="Task title"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Status</label>
                <select
                  value={newTask.status}
                  onChange={(e) => setNewTask({ ...newTask, status: e.target.value as Task['status'] })}
                  className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border-2 border-2-[var(--border-2)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
                  className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border-2 border-2-[var(--border-2)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Project ID</label>
                <input
                  type="text"
                  value={projectId || newTask.projectId}
                  onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border-2 border-2-[var(--border-2)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
                  placeholder="Project ID"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border-2 border-2-[var(--border-2)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
                  placeholder="Task description"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCreateTask}
                className="bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white px-4 py-2 rounded-md transition-colors"
              >
                Create Task
              </button>
              <button
                onClick={() => setShowTaskForm(false)}
                className="bg-[var(--bg-tertiary)] hover:bg-white/20 px-4 py-2 rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {showClientForm && (
          <div className="glass p-6 rounded-md mb-6">
            <h3 className="text-lg font-semibold mb-4">Create New Client</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Name *</label>
                <input
                  type="text"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border-2 border-2-[var(--border-2)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
                  placeholder="Client name"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Company</label>
                <input
                  type="text"
                  value={newClient.company}
                  onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border-2 border-2-[var(--border-2)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
                  placeholder="Company name"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Email</label>
                <input
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border-2 border-2-[var(--border-2)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
                  placeholder="Email address"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Phone</label>
                <input
                  type="tel"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border-2 border-2-[var(--border-2)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
                  placeholder="Phone number"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCreateClient}
                className="bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white px-4 py-2 rounded-md transition-colors"
              >
                Create Client
              </button>
              <button
                onClick={() => setShowClientForm(false)}
                className="bg-[var(--bg-tertiary)] hover:bg-white/20 px-4 py-2 rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {showDocumentForm && (
          <div className="glass p-6 rounded-md mb-6">
            <h3 className="text-lg font-semibold mb-4">Upload Document</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">File Name *</label>
                <input
                  type="text"
                  value={newDocument.fileName}
                  onChange={(e) => setNewDocument({ ...newDocument, fileName: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border-2 border-2-[var(--border-2)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
                  placeholder="Document name"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">File Type</label>
                <input
                  type="text"
                  value={newDocument.fileType}
                  onChange={(e) => setNewDocument({ ...newDocument, fileType: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border-2 border-2-[var(--border-2)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
                  placeholder="PDF, DOC, etc."
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">File Size (bytes)</label>
                <input
                  type="number"
                  value={newDocument.fileSize}
                  onChange={(e) => setNewDocument({ ...newDocument, fileSize: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border-2 border-2-[var(--border-2)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
                  placeholder="File size in bytes"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Download URL</label>
                <input
                  type="text"
                  value={newDocument.downloadUrl}
                  onChange={(e) => setNewDocument({ ...newDocument, downloadUrl: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border-2 border-2-[var(--border-2)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
                  placeholder="Download URL"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Project ID</label>
                <input
                  type="text"
                  value={projectId || newDocument.projectId}
                  onChange={(e) => setNewDocument({ ...newDocument, projectId: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border-2 border-2-[var(--border-2)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
                  placeholder="Project ID"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCreateDocument}
                className="bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white px-4 py-2 rounded-md transition-colors"
              >
                Upload Document
              </button>
              <button
                onClick={() => setShowDocumentForm(false)}
                className="bg-[var(--bg-tertiary)] hover:bg-white/20 px-4 py-2 rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {showNoteForm && (
          <div className="glass p-6 rounded-md mb-6">
            <h3 className="text-lg font-semibold mb-4">Create Note</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Title *</label>
                <input
                  type="text"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border-2 border-2-[var(--border-2)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
                  placeholder="Note title"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Content</label>
                <textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border-2 border-2-[var(--border-2)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
                  placeholder="Note content"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newNote.tags.join(', ')}
                  onChange={(e) => setNewNote({ ...newNote, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) })}
                  className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border-2 border-2-[var(--border-2)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
                  placeholder="tag1, tag2, tag3"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Project ID</label>
                <input
                  type="text"
                  value={projectId || newNote.projectId}
                  onChange={(e) => setNewNote({ ...newNote, projectId: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border-2 border-2-[var(--border-2)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
                  placeholder="Project ID"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCreateNote}
                className="bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white px-4 py-2 rounded-md transition-colors"
              >
                Create Note
              </button>
              <button
                onClick={() => setShowNoteForm(false)}
                className="bg-[var(--bg-tertiary)] hover:bg-white/20 px-4 py-2 rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Data Tables */}
        {activeTab === 'tasks' && (
          <div className="glass rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-[var(--bg-tertiary)] border-2-b border-2-[var(--border-2)]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[var(--text-secondary)]">Task</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[var(--text-secondary)]">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[var(--text-secondary)]">Priority</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[var(--text-secondary)]">Created</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[var(--text-secondary)]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {tasks.map(task => (
                    <React.Fragment key={task.id}>
                      <tr
                        className="hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer"
                        onClick={() => toggleRowExpand(task.id)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {expandedRows.has(task.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            <div>
                              <p className="font-medium">{task.title}</p>
                              <p className="text-sm text-[var(--text-secondary)] line-clamp-1">{task.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-md text-xs font-medium ${getStatusColor(task.status)} bg-opacity-20`}>
                            {task.status.replace('-', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                          {new Date(task.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button className="p-2 hover:bg-[var(--bg-tertiary)] rounded-md transition-colors">
                              <Edit3 size={16} className="text-[var(--text-secondary)]" />
                            </button>
                            <button className="p-2 hover:bg-red-500/10 rounded-md transition-colors">
                              <Trash2 size={16} className="text-[var(--accent-primary)]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedRows.has(task.id) && (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 bg-[var(--bg-tertiary)]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-[var(--text-secondary)]">Description</p>
                                <p className="text-[var(--text-primary)]">{task.description}</p>
                              </div>
                              <div>
                                <p className="text-[var(--text-secondary)]">Project ID</p>
                                <p className="text-[var(--text-primary)]">{task.projectId || 'None'}</p>
                              </div>
                              <div>
                                <p className="text-[var(--text-secondary)]">Assigned To</p>
                                <p className="text-[var(--text-primary)]">{task.assignedTo || 'Unassigned'}</p>
                              </div>
                              <div>
                                <p className="text-[var(--text-secondary)]">Due Date</p>
                                <p className="text-[var(--text-primary)]">{task.dueDate || 'No due date'}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="glass rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-[var(--bg-tertiary)] border-2-b border-2-[var(--border-2)]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[var(--text-secondary)]">Client</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[var(--text-secondary)]">Contact</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[var(--text-secondary)]">Company</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[var(--text-secondary)]">Projects</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[var(--text-secondary)]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {clients.map(client => (
                    <tr key={client.id} className="hover:bg-[var(--bg-tertiary)] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-md bg-gradient-to-tr from-red-600 to-orange-400 flex items-center justify-center">
                            <User size={18} className="text-[var(--text-primary)]" />
                          </div>
                          <div>
                            <p className="font-medium">{client.name}</p>
                            <p className="text-sm text-[var(--text-secondary)]">ID: {client.id.substring(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {client.email && <p className="text-[var(--text-primary)]">{client.email}</p>}
                          {client.phone && <p className="text-[var(--text-secondary)]">{client.phone}</p>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[var(--text-primary)]">{client.company || '-'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[var(--text-primary)]">{client.projects.length} projects</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="p-2 hover:bg-[var(--bg-tertiary)] rounded-md transition-colors">
                            <Edit3 size={16} className="text-[var(--text-secondary)]" />
                          </button>
                          <button className="p-2 hover:bg-red-500/10 rounded-md transition-colors">
                            <Trash2 size={16} className="text-[var(--accent-primary)]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="glass rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-[var(--bg-tertiary)] border-2-b border-2-[var(--border-2)]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[var(--text-secondary)]">Document</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[var(--text-secondary)]">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[var(--text-secondary)]">Size</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[var(--text-secondary)]">Uploaded By</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[var(--text-secondary)]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {documents.map(doc => (
                    <tr key={doc.id} className="hover:bg-[var(--bg-tertiary)] transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{doc.fileName}</p>
                          <p className="text-sm text-[var(--text-secondary)]">Project: {doc.projectId.substring(0, 8)}...</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-md text-xs font-medium bg-blue-500 bg-opacity-20 text-blue-400">
                          {doc.fileType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[var(--text-primary)]">{(doc.fileSize / 1024).toFixed(2)} KB</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[var(--text-primary)]">{doc.uploadedBy}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="p-2 hover:bg-[var(--bg-tertiary)] rounded-md transition-colors">
                            <Edit3 size={16} className="text-[var(--text-secondary)]" />
                          </button>
                          <button className="p-2 hover:bg-red-500/10 rounded-md transition-colors">
                            <Trash2 size={16} className="text-[var(--accent-primary)]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="glass rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-[var(--bg-tertiary)] border-2-b border-2-[var(--border-2)]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[var(--text-secondary)]">Note</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[var(--text-secondary)]">Project</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[var(--text-secondary)]">Tags</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[var(--text-secondary)]">Created</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[var(--text-secondary)]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {notes.map(note => (
                    <tr key={note.id} className="hover:bg-[var(--bg-tertiary)] transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{note.title}</p>
                          <p className="text-sm text-[var(--text-secondary)] line-clamp-2">{note.content}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[var(--text-primary)]">{note.projectId.substring(0, 8)}...</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {note.tags.map((tag, idx) => (
                            <span key={idx} className="px-2 py-1 rounded-md text-xs bg-purple-500 bg-opacity-20 text-purple-400">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="p-2 hover:bg-[var(--bg-tertiary)] rounded-md transition-colors">
                            <Edit3 size={16} className="text-[var(--text-secondary)]" />
                          </button>
                          <button className="p-2 hover:bg-red-500/10 rounded-md transition-colors">
                            <Trash2 size={16} className="text-[var(--accent-primary)]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {((activeTab === 'tasks' && tasks.length === 0) ||
          (activeTab === 'clients' && clients.length === 0) ||
          (activeTab === 'documents' && documents.length === 0) ||
          (activeTab === 'notes' && notes.length === 0)) && (
            <div className="h-64 flex flex-col items-center justify-center text-[var(--text-muted)]">
              <Table size={48} className="mb-4 opacity-50" />
              <p>No {activeTab} found</p>
              <p className="text-sm mt-2">Click "Add" to create your first item</p>
            </div>
          )}

        {activeTab === 'csv' && (
          <div className="p-4">
            <CsvUploadComponent dbService={dbService} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseManager;