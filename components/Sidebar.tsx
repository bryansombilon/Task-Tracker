import React, { useState } from 'react';
import { Priority, Status, Task } from '../types';
import TaskCard from './TaskCard';
import { Focus, Zap, Plus } from 'lucide-react';

interface SidebarProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onTaskPriorityChange?: (taskId: string, newPriority: Priority) => void;
  onAddNewHighPriority?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ tasks, onTaskClick, onTaskPriorityChange, onAddNewHighPriority }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  // Filter for tasks that are Urgent/High priority OR Ongoing status
  // This serves as the "Focus List"
  const focusTasks = tasks.filter(t => 
    t.priority === Priority.URGENT || 
    t.priority === Priority.HIGH || 
    t.status === Status.ONGOING
  ).sort((a, b) => {
    // Sort logic: Urgent first, then High, then others
    const pScore = (p: Priority) => {
      if (p === Priority.URGENT) return 3;
      if (p === Priority.HIGH) return 2;
      return 1;
    };
    return pScore(b.priority) - pScore(a.priority);
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isDragOver) setIsDragOver(true);
  };
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
     const currentTarget = e.currentTarget;
    const relatedTarget = e.relatedTarget as Node;
    if (currentTarget.contains(relatedTarget)) return;
    setIsDragOver(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId && onTaskPriorityChange) {
      onTaskPriorityChange(taskId, Priority.HIGH);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Brand / Header */}
      <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-800 dark:to-zinc-900 border border-zinc-200/60 dark:border-zinc-700/60 rounded-3xl p-6 flex flex-col gap-4 shadow-sm relative overflow-hidden">
        {/* Abstract shape decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white border border-white/20">
            <Focus size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 leading-none mb-1">BentoTask</h1>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium bg-zinc-100/80 dark:bg-zinc-700/50 px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-600">
              Smart Queue
            </span>
          </div>
        </div>
        
        <div className="pt-4 border-t border-zinc-200/50 dark:border-zinc-700/50 relative z-10">
           <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mb-1 uppercase tracking-widest font-bold">Your Focus</p>
           <div className="flex items-baseline gap-2">
             <span className="text-5xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">{focusTasks.length}</span>
             <span className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">active items</span>
           </div>
        </div>
      </div>

      {/* Focus List (High Priority Zone) */}
      <div 
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          bg-gradient-to-b from-white to-zinc-50/50 dark:from-zinc-800 dark:to-zinc-900/50 border rounded-3xl p-5 flex-1 flex flex-col gap-3 overflow-hidden shadow-sm relative transition-all duration-200
          ${isDragOver 
            ? 'border-indigo-400 dark:border-indigo-500 bg-indigo-50/20 dark:bg-indigo-900/10 shadow-lg scale-[1.01] border-dashed' 
            : 'border-zinc-200/60 dark:border-zinc-700/60'
          }
        `}
      >
        <div className="flex items-center justify-between mb-2 px-1 relative z-10">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-amber-100/50 dark:bg-amber-900/30 rounded-lg">
               <Zap size={14} className="text-amber-500 fill-amber-500" />
            </div>
            <h2 className="text-xs text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider">
              High Priority
            </h2>
          </div>
          <button 
            onClick={onAddNewHighPriority}
            className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-600 dark:text-zinc-300 transition-colors"
            title="Add High Priority Task"
          >
            <Plus size={14} />
          </button>
        </div>
        
        <div className={`flex-1 overflow-y-auto pr-1 -mr-1 space-y-3 scrollbar-hide transition-opacity ${isDragOver ? 'opacity-40' : 'opacity-100'}`}>
          {focusTasks.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 gap-3 opacity-60">
              <Zap size={24} className="text-zinc-300 dark:text-zinc-700" />
              <span className="text-xs font-medium">All caught up!</span>
            </div>
          ) : (
            focusTasks.map(task => (
              <TaskCard 
                key={`focus-${task.id}`} 
                task={task} 
                onClick={onTaskClick}
                showStatus={true}
              />
            ))
          )}
        </div>

        {/* Drop Overlay for Sidebar */}
        {isDragOver && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
             <div className="bg-white/95 dark:bg-zinc-800/95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-500 font-bold text-xs flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
               <Zap size={14} className="fill-amber-600 dark:fill-amber-500" />
               <span>Set to High Priority</span>
             </div>
          </div>
        )}

        {/* Decorative gradient at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-zinc-50 to-transparent dark:from-zinc-900 dark:to-transparent pointer-events-none" />
      </div>
    </div>
  );
};

export default Sidebar;