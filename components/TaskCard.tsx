import React, { useState } from 'react';
import { Task } from '../types';
import { PRIORITY_COLORS, PRIORITY_ICONS, STATUS_CONFIG } from '../constants';
import { Calendar, ExternalLink, Timer } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
  showStatus?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, showStatus }) => {
  const PriorityIcon = PRIORITY_ICONS[task.priority];
  const priorityClass = PRIORITY_COLORS[task.priority];
  const StatusConfig = STATUS_CONFIG[task.status];
  const StatusIcon = StatusConfig.icon;
  const [isDragging, setIsDragging] = useState(false);

  const getCountdown = (dateString: string) => {
    if (!dateString) return null;
    const target = new Date(dateString);
    target.setHours(23, 59, 59, 999); // End of the deadline day
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: `${Math.abs(diffDays)}d overdue`, color: 'text-red-600 bg-red-50 border-red-100 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800' };
    if (diffDays === 0) return { text: 'Today', color: 'text-orange-600 bg-orange-50 border-orange-100 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-800' };
    if (diffDays === 1) return { text: 'Tmrw', color: 'text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800' };
    return { text: `${diffDays}d left`, color: 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800' };
  };

  const countdown = getCountdown(task.deadline);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.effectAllowed = 'move';
    e.stopPropagation(); // Prevent parent handlers from interfering
    
    // Create a custom drag image if needed, or rely on browser default.
    // Browser default usually works well if opacity is not 0 immediately.
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div 
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onClick?.(task)}
      className={`
        group relative border p-4 rounded-2xl transition-all duration-200 flex flex-col gap-3 cursor-grab active:cursor-grabbing select-none
        ${isDragging 
          ? 'bg-white/80 dark:bg-zinc-800/80 border-indigo-200 dark:border-indigo-700 shadow-lg scale-95 opacity-50 rotate-1' 
          : 'bg-white dark:bg-zinc-800 hover:bg-white/95 dark:hover:bg-zinc-800/95 border-zinc-200/80 dark:border-zinc-700/60 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] dark:shadow-none hover:shadow-[0_8px_16px_-4px_rgba(79,70,229,0.1)] dark:hover:shadow-[0_8px_16px_-4px_rgba(0,0,0,0.4)] hover:-translate-y-0.5'
        }
      `}
    >
      <div className="flex justify-between items-start gap-2">
        <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 line-clamp-2 leading-snug group-hover:text-indigo-900 dark:group-hover:text-indigo-400 transition-colors">
          {task.name}
        </h4>
        {task.clickUpLink && (
          <a 
            href={task.clickUpLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-zinc-400 dark:text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0 p-1 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg"
            title="Open ClickUp"
            onMouseDown={(e) => e.stopPropagation()} 
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={14} />
          </a>
        )}
      </div>

      <div className="flex items-center justify-between mt-auto pt-1">
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${priorityClass}`}>
            <PriorityIcon size={10} />
            <span>{task.priority}</span>
          </div>

          {showStatus && (
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${StatusConfig.color} bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700`}>
                <StatusIcon size={10} />
                <span>{task.status}</span>
            </div>
          )}
        </div>

        {countdown ? (
           <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-lg border ${countdown.color} transition-colors`}>
             <Timer size={10} />
             <span>{countdown.text}</span>
           </div>
        ) : task.deadline && (
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500 font-medium bg-zinc-50 dark:bg-zinc-800/50 px-2 py-1 rounded-lg border border-zinc-100 dark:border-zinc-700/50 group-hover:border-zinc-200 dark:group-hover:border-zinc-600 transition-colors">
            <Calendar size={10} />
            <span>{new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;