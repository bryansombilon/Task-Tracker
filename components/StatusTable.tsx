
import React, { useState } from 'react';
import { Task, Status } from '../types';
import { STATUS_CONFIG } from '../constants';
import TaskCard from './TaskCard';

interface StatusTableProps {
  status: Status;
  tasks: Task[];
  count: number;
  onTaskDrop?: (taskId: string, newStatus: Status) => void;
  onTaskClick?: (task: Task) => void;
  onTaskReorder?: (draggedId: string, targetId: string, position: 'before' | 'after') => void;
}

const StatusTable: React.FC<StatusTableProps> = ({ status, tasks, count, onTaskDrop, onTaskClick, onTaskReorder }) => {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Check if we are actually leaving the container or just entering a child
    const currentTarget = e.currentTarget;
    const relatedTarget = e.relatedTarget as Node;
    if (currentTarget.contains(relatedTarget)) return;
    
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    // Always reset visual state on drop
    setIsDragOver(false);

    // If the drop was already handled by a child TaskCard (reordering), stop here
    if ((e as any).bentoTaskHandled) {
      return;
    }

    const taskId = e.dataTransfer.getData('taskId');
    if (taskId && onTaskDrop) {
      onTaskDrop(taskId, status);
    }
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative flex flex-col h-full rounded-3xl p-3 transition-all duration-300 ease-out group
        ${isDragOver 
          ? 'bg-indigo-50 dark:bg-indigo-900/30 ring-4 ring-indigo-500/20 dark:ring-indigo-500/30 border-2 border-dashed border-indigo-500 dark:border-indigo-400 scale-[1.02] shadow-2xl z-10' 
          : 'bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-indigo-300/50 dark:hover:border-indigo-700/50'
        }
      `}
    >
      {/* Solid Header Block */}
      <div className={`
        flex items-center justify-between mb-3 shrink-0 relative z-10 p-3 rounded-2xl border transition-all duration-300
        ${config.headerTheme}
        ${isDragOver ? 'scale-[1.02] shadow-sm' : ''}
      `}>
        <div className="flex items-center gap-2.5">
          <div className="bg-white/50 dark:bg-black/40 p-1.5 rounded-lg backdrop-blur-sm">
            <Icon size={18} />
          </div>
          <h3 className="text-sm font-bold tracking-wide uppercase opacity-90">{status}</h3>
        </div>
        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-white/50 dark:bg-black/20 backdrop-blur-sm border border-white/10 dark:border-white/5 min-w-[24px] text-center">
          {count}
        </span>
      </div>

      {/* Task List */}
      <div className={`flex-1 overflow-y-auto px-1 -mx-1 transition-all duration-300 relative z-10 min-h-[100px] scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent ${isDragOver ? 'opacity-20 blur-[2px]' : 'opacity-100'}`}>
        {tasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 gap-2 opacity-50 min-h-[120px]">
            <div className={`w-12 h-12 rounded-full border-2 border-dashed ${isDragOver ? 'border-indigo-400 bg-indigo-100 text-indigo-500 dark:bg-indigo-900/30' : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50'} flex items-center justify-center transition-colors`}>
              <Icon size={20} />
            </div>
            <span className="text-xs font-medium">{isDragOver ? 'Drop here' : 'Empty'}</span>
          </div>
        ) : (
          <div className="flex flex-col gap-0 pb-2">
            {tasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onClick={onTaskClick}
                onDropOver={onTaskReorder}
              />
            ))}
          </div>
        )}
      </div>

      {/* Aesthetic Drop Overlay */}
      <div className={`absolute inset-0 pointer-events-none rounded-3xl flex items-center justify-center z-20 transition-opacity duration-200 ${isDragOver ? 'opacity-100' : 'opacity-0'}`}>
         <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-6 py-4 rounded-2xl shadow-2xl border border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-300 font-bold text-base flex flex-col items-center gap-3 transform transition-transform duration-300 scale-100">
           <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full animate-bounce">
             <Icon size={24} />
           </div>
           <span>Move to {status}</span>
         </div>
      </div>
    </div>
  );
};

export default StatusTable;
