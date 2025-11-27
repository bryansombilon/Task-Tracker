
import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import TaskCard from './TaskCard';
import { Focus, Zap } from 'lucide-react';

interface SidebarProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onTaskFocus?: (taskId: string) => void;
  onTaskUnfocus?: (taskId: string) => void;
  onTaskReorder?: (draggedId: string, targetId: string, position: 'before' | 'after') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ tasks, onTaskClick, onTaskFocus, onTaskUnfocus, onTaskReorder }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter for tasks that are manually marked as "Focused"
  const focusTasks = tasks.filter(t => t.isFocused);

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

    // If child task handled reordering, don't execute focus logic
    if ((e as any).bentoTaskHandled) return;

    const taskId = e.dataTransfer.getData('taskId');
    if (taskId && onTaskFocus) {
      onTaskFocus(taskId);
    }
  };

  return (
    <aside className="h-full flex flex-col gap-6" aria-label="Sidebar with Focus Tasks">
      {/* Brand / Header */}
      <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-800 dark:to-zinc-900 border border-zinc-200/60 dark:border-zinc-700/60 rounded-3xl p-6 flex flex-col gap-4 shadow-sm relative overflow-hidden">
        {/* Abstract shape decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" aria-hidden="true" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white border border-white/20">
            <Focus size={24} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 leading-none mb-1">BentoTask</h1>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium bg-zinc-100/80 dark:bg-zinc-700/50 px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-600">
              Smart Queue
            </span>
          </div>
        </div>
        
        <div className="pt-5 border-t border-zinc-200/50 dark:border-zinc-700/50 relative z-10 grid grid-cols-2 gap-2">
           <div>
             <p className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-bold mb-1">Focus Items</p>
             <div className="flex items-baseline gap-1">
               <span className="text-4xl xl:text-5xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight" aria-label={`${focusTasks.length} active tasks`}>{focusTasks.length}</span>
               <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">active</span>
             </div>
           </div>
           
           <div className="text-right">
             <p className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-bold mb-1">Local Time</p>
             <div className="text-3xl xl:text-4xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight font-variant-numeric tabular-nums leading-none" aria-label={`Current time ${currentTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}`}>
               {currentTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
             </div>
           </div>
        </div>
      </div>

      {/* Focus List (High Priority Zone) */}
      <section 
        aria-label="High Priority Tasks Drop Zone"
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          bg-gradient-to-b from-white to-zinc-50/50 dark:from-zinc-800 dark:to-zinc-900/50 border rounded-3xl p-5 flex-1 flex flex-col gap-3 overflow-hidden shadow-sm relative transition-all duration-300 ease-out group
          ${isDragOver 
            ? 'border-amber-400 dark:border-amber-500 border-2 border-dashed bg-amber-50 dark:bg-amber-900/20 shadow-2xl scale-[1.02] ring-4 ring-amber-500/20 dark:ring-amber-500/30' 
            : 'border-zinc-200/60 dark:border-zinc-700/60'
          }
        `}
      >
        <header className="flex items-center justify-between mb-2 px-1 relative z-10">
          <div className="flex items-center gap-2">
            <div className={`p-1 bg-amber-200 dark:bg-amber-900 rounded-lg transition-transform duration-300 ${isDragOver ? 'scale-125 rotate-6' : ''}`}>
               <Zap size={14} className="text-amber-600 dark:text-amber-100" aria-hidden="true" />
            </div>
            <h2 className="text-xs text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider">
              High Priority
            </h2>
          </div>
        </header>
        
        <div className={`flex-1 overflow-y-auto pr-1 -mr-1 transition-all duration-300 relative z-10 ${isDragOver ? 'opacity-20 blur-[2px]' : 'opacity-100'}`}>
          {focusTasks.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 gap-3 opacity-60">
              <Zap size={24} className="text-zinc-300 dark:text-zinc-700" aria-hidden="true" />
              <div className="text-center">
                <span className="text-xs font-medium block">Drag tasks here</span>
                <span className="text-[10px] opacity-70">to prioritize them</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-0 pb-2" role="list">
              {focusTasks.map(task => (
                <div role="listitem" key={`focus-${task.id}`}>
                  <TaskCard 
                    task={task} 
                    onClick={onTaskClick}
                    showStatus={true}
                    onRemove={() => onTaskUnfocus && onTaskUnfocus(task.id)}
                    onDropOver={onTaskReorder}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drop Overlay for Sidebar */}
        <div className={`absolute inset-0 pointer-events-none flex items-center justify-center z-20 transition-opacity duration-200 ${isDragOver ? 'opacity-100' : 'opacity-0'}`} aria-hidden="true">
           <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-6 py-4 rounded-2xl shadow-xl border border-amber-200 dark:border-amber-700 text-amber-600 dark:text-amber-500 font-bold text-base flex flex-col items-center gap-3 transform transition-transform duration-300 scale-100">
             <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-full animate-bounce">
               <Zap size={24} className="fill-amber-600 dark:fill-amber-500" />
             </div>
             <span>Add to High Priority</span>
           </div>
        </div>

        {/* Decorative gradient at bottom */}
        <div className={`absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-zinc-50 to-transparent dark:from-zinc-900 dark:to-transparent pointer-events-none transition-opacity ${isDragOver ? 'opacity-0' : 'opacity-100'}`} aria-hidden="true" />
      </section>
    </aside>
  );
};

export default Sidebar;
