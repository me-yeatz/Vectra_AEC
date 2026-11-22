import React, { useState, useRef } from 'react';
import { Upload, FileText, Users, FolderKanban, Table, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { CsvUploadService } from '../services/CsvUploadService';
import { DatabaseService } from '../services/DatabaseServiceFactory';

interface CsvUploadComponentProps {
  dbService: DatabaseService;
}

const CsvUploadComponent: React.FC<CsvUploadComponentProps> = ({ dbService }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<{ success: number; errors: string[] } | null>(null);
  const [selectedImportType, setSelectedImportType] = useState<'projects' | 'tasks' | 'clients'>('projects');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvService = new CsvUploadService(dbService);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.name.endsWith('.csv')) {
      setResults({ success: 0, errors: ['Please upload a CSV file'] });
      return;
    }

    setUploading(true);
    setResults(null);

    try {
      const text = await file.text();
      let result;

      switch (selectedImportType) {
        case 'projects':
          result = await csvService.importProjectsFromCsv(text);
          break;
        case 'tasks':
          result = await csvService.importTasksFromCsv(text);
          break;
        case 'clients':
          result = await csvService.importClientsFromCsv(text);
          break;
        default:
          result = { success: 0, errors: ['Invalid import type'] };
      }

      setResults(result);
    } catch (error) {
      setResults({ 
        success: 0, 
        errors: [`Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}`] 
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    handleFiles(e.target.files);
    // Reset the input to allow selecting the same file again
    e.target.value = '';
  };

  const onButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="glass rounded-md p-6">
      <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
        <Upload size={24} />
        Import Data from CSV
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          className={`flex flex-col items-center justify-center p-4 rounded-md transition-all ${
            selectedImportType === 'projects'
              ? 'bg-[var(--accent-primary)]/20 border-2 border-2-[var(--accent-primary)]/30'
              : 'bg-[var(--bg-tertiary)] border-2 border-2-[var(--border-2)] hover:bg-[var(--bg-tertiary)]'
          }`}
          onClick={() => setSelectedImportType('projects')}
        >
          <FolderKanban size={24} className="mb-2" />
          <span>Projects</span>
        </button>
        <button
          className={`flex flex-col items-center justify-center p-4 rounded-md transition-all ${
            selectedImportType === 'tasks'
              ? 'bg-[var(--accent-primary)]/20 border-2 border-2-[var(--accent-primary)]/30'
              : 'bg-[var(--bg-tertiary)] border-2 border-2-[var(--border-2)] hover:bg-[var(--bg-tertiary)]'
          }`}
          onClick={() => setSelectedImportType('tasks')}
        >
          <Table size={24} className="mb-2" />
          <span>Tasks</span>
        </button>
        <button
          className={`flex flex-col items-center justify-center p-4 rounded-md transition-all ${
            selectedImportType === 'clients'
              ? 'bg-[var(--accent-primary)]/20 border-2 border-2-[var(--accent-primary)]/30'
              : 'bg-[var(--bg-tertiary)] border-2 border-2-[var(--border-2)] hover:bg-[var(--bg-tertiary)]'
          }`}
          onClick={() => setSelectedImportType('clients')}
        >
          <Users size={24} className="mb-2" />
          <span>Clients</span>
        </button>
      </div>

      <div
        className={`relative rounded-md border-2-2 border-2-dashed p-8 text-center transition-all ${
          dragActive ? 'border-2-[var(--accent-primary)] bg-red-500/10' : 'border-2-[var(--border-2)]'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".csv"
          onChange={handleChange}
        />
        
        <div className="flex flex-col items-center justify-center gap-4">
          <Upload size={48} className="text-[var(--text-muted)]" />
          <div>
            <p className="font-medium text-[var(--text-primary)]">
              Drag & drop your {selectedImportType}.csv file here
            </p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              or <button 
                type="button" 
                className="text-[var(--accent-primary)] hover:underline"
                onClick={onButtonClick}
              >
                browse files
              </button>
            </p>
          </div>
          <p className="text-xs text-[var(--text-muted)] max-w-md">
            Supported formats: CSV. The file should contain appropriate columns based on the selected import type.
          </p>
        </div>
      </div>

      {uploading && (
        <div className="mt-6 p-4 bg-blue-500/10 border-2 border-2-blue-500/20 rounded-md flex items-center gap-3">
          <div className="animate-spin rounded-md h-5 w-5 border-2-b-2 border-2-blue-400"></div>
          <span className="text-blue-400">Processing your file...</span>
        </div>
      )}

      {results && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <h4 className="font-semibold">Import Results:</h4>
            <span className={`px-2 py-1 rounded-md text-xs ${
              results.errors.length === 0 
                ? 'bg-green-500/20 text-green-400' 
                : results.success > 0 
                  ? 'bg-amber-500/20 text-amber-400' 
                  : 'bg-red-500/20 text-[var(--accent-primary)]'
            }`}>
              {results.success} Success, {results.errors.length} Error(s)
            </span>
          </div>
          
          {results.success > 0 && (
            <div className="p-3 bg-green-500/10 border-2 border-2-green-500/20 rounded-md mb-3 flex items-center gap-2">
              <CheckCircle size={18} className="text-green-400" />
              <span className="text-green-400">
                Successfully imported {results.success} {selectedImportType}
              </span>
            </div>
          )}
          
          {results.errors.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[var(--accent-primary)]">
                <XCircle size={18} />
                <span className="font-medium">Errors:</span>
              </div>
              <div className="max-h-40 overflow-y-auto bg-red-500/5 border-2 border-2-[var(--accent-primary)]/10 rounded-md p-3">
                <ul className="space-y-1 text-sm text-red-300">
                  {results.errors.map((error, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 text-sm text-[var(--text-secondary)]">
        <h5 className="font-semibold mb-2 flex items-center gap-2">
          <FileText size={16} />
          CSV Format Guide:
        </h5>
        {selectedImportType === 'projects' && (
          <ul className="space-y-1 pl-5 list-disc">
            <li>Required columns: title, clientName, location, description, status, startDate, color</li>
            <li>Optional columns: targetCompletionDate, actualCompletionDate, totalBudget</li>
            <li>Status values: concept, design-development, submission-prep, submitted, approved, on-hold, completed</li>
          </ul>
        )}
        {selectedImportType === 'tasks' && (
          <ul className="space-y-1 pl-5 list-disc">
            <li>Required columns: title, description</li>
            <li>Optional columns: projectId, assignedTo, status, priority, dueDate</li>
            <li>Status values: todo, in-progress, review, done</li>
            <li>Priority values: low, medium, high, critical</li>
          </ul>
        )}
        {selectedImportType === 'clients' && (
          <ul className="space-y-1 pl-5 list-disc">
            <li>Required columns: name</li>
            <li>Optional columns: email, phone, company</li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default CsvUploadComponent;