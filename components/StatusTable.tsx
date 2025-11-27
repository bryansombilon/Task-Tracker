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
    setIsDragOver(false);
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
        relative flex flex-col h-full rounded-3xl p-4 transition-all duration-300 group
        ${isDragOver 
          ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-2 border-dashed border-indigo-400 dark:border-indigo-500 shadow-xl scale-[1.01]' 
          : 'bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-indigo-300/50 dark:hover:border-indigo-700/50'
        }
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0 relative z-10">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 shadow-sm ${config.color}`}>
            <Icon size={18} />
          </div>
          <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 tracking-wide">{status}</h3>
        </div>
        <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border transition-colors ${isDragOver ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700' : 'bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'}`}>
          {count}
        </span>
      </div>

      {/* Task List */}
      <div className={`flex-1 overflow-y-auto pr-1 -mr-1 transition-opacity relative z-10 min-h-[100px] ${isDragOver ? 'opacity-40' : 'opacity-100'}`}>
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
      {isDragOver && (
        <div className="absolute inset-0 pointer-events-none rounded-3xl flex items-center justify-center z-20">
           <div className="bg-white/95 dark:bg-zinc-800/95 backdrop-blur-sm px-5 py-3 rounded-2xl shadow-xl border border-indigo-100 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 font-bold text-sm flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
             <Icon size={18} className="animate-bounce" />
             <span>Move to {status}</span>
           </div>
        </div>
      )}
    </div>
  );
};

export default StatusTable;