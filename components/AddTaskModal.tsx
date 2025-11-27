
import React, { useState, useEffect, useRef } from 'react';
import { Priority, Status, TaskFormData, Task } from '../types';
import { analyzeTaskPriority } from '../services/geminiService';
import { X, Sparkles, Loader2, Link as LinkIcon, Calendar, Activity, Save, Plus, Trash2, StickyNote, Timer } from 'lucide-react';
import { PRIORITY_ICONS } from '../constants';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: TaskFormData) => void;
  onDelete?: (taskId: string) => void;
  initialData?: Task | null;
  defaultPriority?: Priority;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onSubmit, onDelete, initialData, defaultPriority }) => {
  const [formData, setFormData] = useState<TaskFormData>({
    name: '',
    clickUpLink: '',
    deadline: '',
    priority: Priority.MEDIUM,
    status: Status.TODO,
    notes: ''
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        clickUpLink: initialData.clickUpLink || '',
        deadline: initialData.deadline,
        priority: initialData.priority,
        status: initialData.status,
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        name: '',
        clickUpLink: '',
        deadline: '',
        priority: defaultPriority || Priority.MEDIUM,
        status: Status.TODO,
        notes: '',
      });
    }
    setShowDeleteConfirm(false); 
  }, [initialData, isOpen, defaultPriority]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Small timeout to allow render
      const timer = setTimeout(() => {
        nameInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSmartAnalyze = async () => {
    if (!formData.name) return;
    setIsAnalyzing(true);
    const suggestedPriority = await analyzeTaskPriority(formData.name);
    if (suggestedPriority) {
      setFormData(prev => ({ ...prev, priority: suggestedPriority }));
    }
    setIsAnalyzing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const executeDelete = () => {
    if (initialData && onDelete) {
      onDelete(initialData.id);
      onClose();
    }
  };

  const getCountdown = (dateString: string) => {
    if (!dateString) return null;
    const target = new Date(dateString);
    target.setHours(23, 59, 59, 999); 
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: `${Math.abs(diffDays)}d overdue`, color: 'text-red-600 bg-red-50 border-red-100 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800 mixed:bg-red-50 mixed:text-red-600 mixed:border-red-100' };
    if (diffDays === 0) return { text: 'Due today', color: 'text-orange-600 bg-orange-50 border-orange-100 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-800 mixed:bg-orange-50 mixed:text-orange-600 mixed:border-orange-100' };
    if (diffDays === 1) return { text: 'Tomorrow', color: 'text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800 mixed:bg-amber-50 mixed:text-amber-600 mixed:border-amber-100' };
    return { text: `${diffDays} days left`, color: 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800 mixed:bg-emerald-50 mixed:text-emerald-600 mixed:border-emerald-100' };
  };

  const countdown = getCountdown(formData.deadline);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/30 dark:bg-black/50 backdrop-blur-md p-4 transition-all"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-white/90 dark:bg-zinc-900/90 mixed:bg-white/90 backdrop-blur-2xl border border-zinc-200/50 dark:border-zinc-800/50 mixed:border-zinc-200/50 w-full max-w-lg rounded-3xl shadow-2xl shadow-zinc-200/50 dark:shadow-black/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Delete Confirmation Overlay */}
        {showDeleteConfirm && (
          <div 
            className="absolute inset-0 z-50 bg-white/95 dark:bg-zinc-900/95 mixed:bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-200"
            role="alertdialog"
            aria-labelledby="delete-confirm-title"
            aria-describedby="delete-confirm-desc"
          >
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 mixed:bg-red-100 text-red-600 dark:text-red-400 mixed:text-red-600 rounded-full flex items-center justify-center mb-4 shadow-sm animate-in zoom-in-50 duration-300">
              <Trash2 size={32} aria-hidden="true" />
            </div>
            <h3 id="delete-confirm-title" className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mixed:text-zinc-900 mb-2">Delete Task?</h3>
            <p id="delete-confirm-desc" className="text-zinc-500 dark:text-zinc-400 mixed:text-zinc-500 mb-8 max-w-xs leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-zinc-700 dark:text-zinc-200 mixed:text-zinc-700">"{formData.name || 'this task'}"</span>? <br/>This action cannot be undone.
            </p>
            <div className="flex gap-3 w-full max-w-xs">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 mixed:border-zinc-200 text-zinc-600 dark:text-zinc-300 mixed:text-zinc-600 font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 mixed:hover:bg-zinc-50 transition-colors focus-visible:ring-2 focus-visible:ring-zinc-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-500/30 transition-all hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 mixed:border-zinc-100 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/50 mixed:bg-zinc-50/50 shrink-0">
          <h2 id="modal-title" className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mixed:text-zinc-900 flex items-center gap-2">
            {initialData ? (
              <>
                <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 mixed:bg-indigo-100 rounded-lg text-indigo-600 dark:text-indigo-400 mixed:text-indigo-600"><Save size={18} aria-hidden="true" /></div>
                Edit Task
              </>
            ) : (
              <>
                 <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 mixed:bg-indigo-100 rounded-lg text-indigo-600 dark:text-indigo-400 mixed:text-indigo-600"><Plus size={18} aria-hidden="true" /></div>
                 New Task
              </>
            )}
          </h2>
          <button 
            onClick={onClose} 
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 mixed:hover:text-zinc-600 transition-colors p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 mixed:hover:bg-zinc-100 rounded-full focus-visible:ring-2 focus-visible:ring-zinc-500"
            aria-label="Close modal"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto scrollbar-hide">
          
          {/* Task Name */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="task-name" className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mixed:text-zinc-500 uppercase tracking-wide">Task Name</label>
              <button 
                type="button" 
                onClick={handleSmartAnalyze}
                disabled={!formData.name || isAnalyzing}
                className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 mixed:text-indigo-600 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 mixed:bg-indigo-50 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 mixed:hover:bg-indigo-100 px-2 py-1 rounded-full flex items-center gap-1 transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-indigo-500"
                aria-label="Analyze task priority with AI"
              >
                {isAnalyzing ? <Loader2 size={10} className="animate-spin" aria-hidden="true" /> : <Sparkles size={10} aria-hidden="true" />}
                AI Priority
              </button>
            </div>
            <input
              ref={nameInputRef}
              id="task-name"
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Fix critical bug in payment flow"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 mixed:border-zinc-200 bg-zinc-50/50 dark:bg-zinc-800/50 mixed:bg-zinc-50/50 focus:bg-white dark:focus:bg-zinc-900 mixed:focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 mixed:focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none text-sm font-medium text-zinc-900 dark:text-zinc-100 mixed:text-zinc-900"
            />
          </div>

          {/* ClickUp Link */}
          <div className="space-y-2">
            <label htmlFor="task-link" className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mixed:text-zinc-500 uppercase tracking-wide flex items-center gap-1.5">
              <LinkIcon size={12} aria-hidden="true" /> ClickUp URL
            </label>
            <input
              id="task-link"
              type="url"
              value={formData.clickUpLink}
              onChange={(e) => setFormData(prev => ({ ...prev, clickUpLink: e.target.value }))}
              placeholder="https://app.clickup.com/..."
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 mixed:border-zinc-200 bg-zinc-50/50 dark:bg-zinc-800/50 mixed:bg-zinc-50/50 focus:bg-white dark:focus:bg-zinc-900 mixed:focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 mixed:focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none text-sm font-mono text-zinc-600 dark:text-zinc-300 mixed:text-zinc-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Deadline */}
            <div className="space-y-2">
              <div className="flex justify-between items-center h-4">
                <label htmlFor="task-deadline" className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mixed:text-zinc-500 uppercase tracking-wide flex items-center gap-1.5">
                  <Calendar size={12} aria-hidden="true" /> Deadline
                </label>
                {countdown && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 ${countdown.color}`} aria-label={`Due in ${countdown.text}`}>
                    <Timer size={8} aria-hidden="true" /> {countdown.text}
                  </span>
                )}
              </div>
              <input
                id="task-deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 mixed:border-zinc-200 bg-zinc-50/50 dark:bg-zinc-800/50 mixed:bg-zinc-50/50 focus:bg-white dark:focus:bg-zinc-900 mixed:focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 mixed:focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none text-sm text-zinc-600 dark:text-zinc-300 mixed:text-zinc-600"
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <div className="flex items-center h-4">
                <label htmlFor="task-status" className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mixed:text-zinc-500 uppercase tracking-wide flex items-center gap-1.5">
                  <Activity size={12} aria-hidden="true" /> Status
                </label>
              </div>
              <select
                id="task-status"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Status }))}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 mixed:border-zinc-200 bg-zinc-50/50 dark:bg-zinc-800/50 mixed:bg-zinc-50/50 focus:bg-white dark:focus:bg-zinc-900 mixed:focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 mixed:focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none text-sm text-zinc-600 dark:text-zinc-300 mixed:text-zinc-600 appearance-none"
              >
                {Object.values(Status).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority Selection */}
          <div className="space-y-2" role="group" aria-labelledby="priority-label">
            <span id="priority-label" className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mixed:text-zinc-500 uppercase tracking-wide block">Priority Level</span>
            <div className="grid grid-cols-4 gap-2">
              {Object.values(Priority).map((p) => {
                const Icon = PRIORITY_ICONS[p];
                const isSelected = formData.priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, priority: p }))}
                    aria-pressed={isSelected}
                    className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      isSelected 
                        ? 'bg-zinc-900 dark:bg-indigo-600 mixed:bg-zinc-900 border-zinc-900 dark:border-indigo-500 mixed:border-zinc-900 text-white shadow-md scale-105' 
                        : 'bg-white dark:bg-zinc-800 mixed:bg-white border-zinc-200 dark:border-zinc-700 mixed:border-zinc-200 text-zinc-500 dark:text-zinc-400 mixed:text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-700 mixed:hover:bg-zinc-50 hover:border-zinc-300 dark:hover:border-zinc-600 mixed:hover:border-zinc-300'
                    }`}
                  >
                    <Icon size={16} aria-hidden="true" />
                    <span className="text-[10px] font-bold">{p}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-2">
            <label htmlFor="task-notes" className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mixed:text-zinc-500 uppercase tracking-wide flex items-center gap-1.5">
              <StickyNote size={12} aria-hidden="true" /> Notes
            </label>
            <textarea
              id="task-notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add details, subtasks, or random thoughts..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 mixed:border-zinc-200 bg-zinc-50/50 dark:bg-zinc-800/50 mixed:bg-zinc-50/50 focus:bg-white dark:focus:bg-zinc-900 mixed:focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 mixed:focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none text-sm text-zinc-700 dark:text-zinc-200 mixed:text-zinc-700 resize-none scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-600 scrollbar-track-transparent"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex gap-3">
            {initialData && onDelete && (
              <button
                type="button"
                onClick={handleDeleteClick}
                className="p-3 rounded-xl border border-red-200 dark:border-red-800 mixed:border-red-200 text-red-600 dark:text-red-400 mixed:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 mixed:hover:bg-red-50 hover:border-red-300 dark:hover:border-red-700 mixed:hover:border-red-300 transition-colors focus-visible:ring-2 focus-visible:ring-red-500"
                aria-label="Delete Task"
                title="Delete Task"
              >
                <Trash2 size={20} aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 mixed:border-zinc-200 text-zinc-600 dark:text-zinc-300 mixed:text-zinc-600 font-semibold text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 mixed:hover:bg-zinc-50 transition-colors focus-visible:ring-2 focus-visible:ring-zinc-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              {initialData ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;
