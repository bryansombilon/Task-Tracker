import React, { useState, useEffect } from 'react';
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
    setShowDeleteConfirm(false); // Reset confirmation state on open/change
  }, [initialData, isOpen, defaultPriority]);

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
    target.setHours(23, 59, 59, 999); // End of the deadline day
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: `${Math.abs(diffDays)}d overdue`, color: 'text-red-600 bg-red-50 border-red-100 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800' };
    if (diffDays === 0) return { text: 'Due today', color: 'text-orange-600 bg-orange-50 border-orange-100 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-800' };
    if (diffDays === 1) return { text: 'Tomorrow', color: 'text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800' };
    return { text: `${diffDays} days left`, color: 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800' };
  };

  const countdown = getCountdown(formData.deadline);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm p-4 transition-all">
      <div 
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-lg rounded-3xl shadow-2xl shadow-zinc-200/50 dark:shadow-black/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Delete Confirmation Overlay */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-200">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4 shadow-sm animate-in zoom-in-50 duration-300">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Delete Task?</h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-xs leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-zinc-700 dark:text-zinc-200">"{formData.name || 'this task'}"</span>? <br/>This action cannot be undone.
            </p>
            <div className="flex gap-3 w-full max-w-xs">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-500/30 transition-all hover:-translate-y-0.5"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/50 shrink-0">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            {initialData ? (
              <>
                <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400"><Save size={18} /></div>
                Edit Task
              </>
            ) : (
              <>
                 <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400"><Plus size={18} /></div>
                 New Task
              </>
            )}
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto scrollbar-hide">
          
          {/* Task Name */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Task Name</label>
              <button 
                type="button" 
                onClick={handleSmartAnalyze}
                disabled={!formData.name || isAnalyzing}
                className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 px-2 py-1 rounded-full flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                {isAnalyzing ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                AI Priority
              </button>
            </div>
            <input
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Fix critical bug in payment flow"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 focus:border-indigo-500 transition-all outline-none text-sm font-medium text-zinc-900 dark:text-zinc-100"
            />
          </div>

          {/* ClickUp Link */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide flex items-center gap-1.5">
              <LinkIcon size={12} /> ClickUp URL
            </label>
            <input
              type="url"
              value={formData.clickUpLink}
              onChange={(e) => setFormData(prev => ({ ...prev, clickUpLink: e.target.value }))}
              placeholder="https://app.clickup.com/..."
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 focus:border-indigo-500 transition-all outline-none text-sm font-mono text-zinc-600 dark:text-zinc-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Deadline */}
            <div className="space-y-2">
              <div className="flex justify-between items-center h-4">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Calendar size={12} /> Deadline
                </label>
                {countdown && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 ${countdown.color}`}>
                    <Timer size={8} /> {countdown.text}
                  </span>
                )}
              </div>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 focus:border-indigo-500 transition-all outline-none text-sm text-zinc-600 dark:text-zinc-300"
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <div className="flex items-center h-4">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Activity size={12} /> Status
                </label>
              </div>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Status }))}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 focus:border-indigo-500 transition-all outline-none text-sm text-zinc-600 dark:text-zinc-300 appearance-none"
              >
                {Object.values(Status).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Priority Level</label>
            <div className="grid grid-cols-4 gap-2">
              {Object.values(Priority).map((p) => {
                const Icon = PRIORITY_ICONS[p];
                const isSelected = formData.priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, priority: p }))}
                    className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border transition-all ${
                      isSelected 
                        ? 'bg-zinc-900 dark:bg-indigo-600 border-zinc-900 dark:border-indigo-500 text-white shadow-md scale-105' 
                        : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="text-[10px] font-bold">{p}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide flex items-center gap-1.5">
              <StickyNote size={12} /> Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add details, subtasks, or random thoughts..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 focus:border-indigo-500 transition-all outline-none text-sm text-zinc-700 dark:text-zinc-200 resize-none scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-600 scrollbar-track-transparent"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex gap-3">
            {initialData && onDelete && (
              <button
                type="button"
                onClick={handleDeleteClick}
                className="p-3 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 transition-colors"
                title="Delete Task"
              >
                <Trash2 size={20} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-semibold text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all"
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