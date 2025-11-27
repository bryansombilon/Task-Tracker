
import React, { useState } from 'react';
import { Task } from '../types';
import { PRIORITY_COLORS, PRIORITY_ICONS, STATUS_CONFIG } from '../constants';
import { Calendar, ExternalLink, Timer, X, StickyNote } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
  showStatus?: boolean;
  onRemove?: () => void;
  onDropOver?: (draggedId: string, targetId: string, position: 'before' | 'after') => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, showStatus, onRemove, onDropOver }) => {
  const PriorityIcon = PRIORITY_ICONS[task.priority];
  const priorityClass = PRIORITY_COLORS[task.priority];
  const StatusConfig = STATUS_CONFIG[task.status];
  const StatusIcon = StatusConfig.icon;
  
  const [isDragging, setIsDragging] = useState(false);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | null>(null);

  const hasNotes = task.notes && task.notes.trim().length > 0;
  const hasLink = !!task.clickUpLink;

  const getCountdown = (dateString: string) => {
    if (!dateString) return null;
    
    // Parse manually to ensure local time consistency
    const parts = dateString.split('-');
    if (parts.length !== 3) return null;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    
    const target = new Date(year, month, day, 23, 59, 59, 999);
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    
    // Overdue check
    if (diffTime < 0) {
      const daysOverdue = Math.ceil(Math.abs(diffTime) / (1000 * 60 * 60 * 24));
      return { 
        text: `${daysOverdue}d overdue`, 
        color: 'text-red-600/90 bg-red-50/50 border-red-100/50 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/20 mixed:text-red-600/90 mixed:bg-red-50/50 mixed:border-red-100/50' 
      };
    }

    const hoursTotal = Math.floor(diffTime / (1000 * 60 * 60));

    // Less than 24 hours: Show Hours and Minutes
    if (hoursTotal < 24) {
      const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
      const timeText = hoursTotal > 0 ? `${hoursTotal}h ${minutes}m left` : `${minutes}m left`;
      
      return { 
        text: timeText, 
        color: 'text-orange-600/90 bg-orange-50/50 border-orange-100/50 dark:text-orange-400 dark:bg-orange-500/10 dark:border-orange-500/20 mixed:text-orange-600/90 mixed:bg-orange-50/50 mixed:border-orange-100/50' 
      };
    }

    // Check for "Tomorrow"
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = target.getDate() === tomorrow.getDate() && 
                       target.getMonth() === tomorrow.getMonth() && 
                       target.getFullYear() === tomorrow.getFullYear();

    if (isTomorrow) {
      return { 
        text: 'Tomorrow', 
        color: 'text-amber-600/90 bg-amber-50/50 border-amber-100/50 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20 mixed:text-amber-600/90 mixed:bg-amber-50/50 mixed:border-amber-100/50' 
      };
    }

    // Default Days calculation
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { 
      text: `${diffDays}d left`, 
      color: 'text-emerald-600/90 bg-emerald-50/50 border-emerald-100/50 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20 mixed:text-emerald-600/90 mixed:bg-emerald-50/50 mixed:border-emerald-100/50' 
    };
  };

  const countdown = getCountdown(task.deadline);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {}, 0);
    e.stopPropagation(); 
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDropPosition(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isDragging) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    
    if (e.clientY < midY) {
      setDropPosition('before');
    } else {
      setDropPosition('after');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const currentTarget = e.currentTarget;
    const relatedTarget = e.relatedTarget as Node;
    if (currentTarget.contains(relatedTarget)) return;
    
    setDropPosition(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDropPosition(null);
    const draggedId = e.dataTransfer.getData('taskId');
    
    if (draggedId && onDropOver) {
      onDropOver(draggedId, task.id, dropPosition || 'after');
      (e as any).bentoTaskHandled = true;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(task);
    }
  };

  return (
    <div className="relative mb-3 last:mb-0">
      {/* Drop Indicator - Before */}
      {dropPosition === 'before' && (
        <div className="absolute -top-2 left-0 right-0 h-1 bg-indigo-500 rounded-full z-20 animate-in fade-in zoom-in-95 duration-200 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
      )}

      <div 
        role="button"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label={`Task: ${task.name}, Priority: ${task.priority}, Status: ${task.status}. Click to edit.`}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => onClick?.(task)}
        className={`
          group relative border p-4 rounded-2xl transition-all duration-200 flex flex-col gap-3 cursor-grab active:cursor-grabbing select-none outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900
          ${isDragging 
            ? 'bg-zinc-100 dark:bg-zinc-800/50 mixed:bg-zinc-100 border-zinc-200 dark:border-zinc-700 mixed:border-zinc-200 opacity-30 grayscale scale-95' 
            : dropPosition
              ? 'bg-indigo-50/50 dark:bg-indigo-900/10 mixed:bg-indigo-50/50 border-indigo-300 dark:border-indigo-600 mixed:border-indigo-300 shadow-md'
              : 'bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-800 dark:to-zinc-900 mixed:from-white mixed:to-zinc-50 hover:to-white dark:hover:from-zinc-700 dark:hover:to-zinc-800 mixed:hover:to-white border-zinc-200/80 dark:border-zinc-700/60 mixed:border-zinc-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] dark:shadow-none mixed:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_16px_-4px_rgba(79,70,229,0.1)] dark:hover:shadow-[0_8px_16px_-4px_rgba(0,0,0,0.4)] mixed:hover:shadow-[0_8px_16px_-4px_rgba(79,70,229,0.1)] hover:-translate-y-0.5'
          }
        `}
      >
        <div className="flex justify-between items-start gap-2">
          {/* Force text color in mixed mode to be dark */}
          <h4 className={`text-sm font-semibold text-zinc-800 dark:text-zinc-100 mixed:text-zinc-800 line-clamp-2 leading-snug transition-colors pr-6 ${!isDragging && 'group-hover:text-indigo-900 dark:group-hover:text-indigo-400 mixed:group-hover:text-indigo-900'}`}>
            {task.name}
          </h4>
          
          <div className="flex items-center gap-1 shrink-0 absolute top-4 right-4">
            {task.clickUpLink && (
              <a 
                href={task.clickUpLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-zinc-400 dark:text-zinc-500 mixed:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 mixed:hover:text-indigo-600 transition-colors p-1 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 mixed:hover:bg-indigo-50 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                aria-label="Open ClickUp Link"
                title="Open ClickUp"
                onMouseDown={(e) => e.stopPropagation()} 
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <ExternalLink size={14} />
              </a>
            )}
            {onRemove && (
               <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation();
                    onRemove();
                  }
                }}
                className="text-zinc-400 dark:text-zinc-500 mixed:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 mixed:hover:text-red-600 transition-colors p-1 hover:bg-red-50 dark:hover:bg-red-900/30 mixed:hover:bg-red-50 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                aria-label="Remove task from focus list"
                title="Remove from High Priority"
               >
                 <X size={14} />
               </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex items-center gap-2">
            {/* Priority Chip - Colors handled via PRIORITY_COLORS constants */}
            <div 
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${priorityClass}`}
              aria-label={`Priority: ${task.priority}`}
            >
              <PriorityIcon size={10} aria-hidden="true" />
              <span>{task.priority}</span>
            </div>

            {/* Optional Status Chip */}
            {showStatus && (
              <div 
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${StatusConfig.color} bg-white dark:bg-zinc-900 mixed:bg-white border-zinc-200 dark:border-zinc-700 mixed:border-zinc-200`}
                aria-label={`Status: ${task.status}`}
              >
                  <StatusIcon size={10} aria-hidden="true" />
                  <span>{task.status}</span>
              </div>
            )}

            {/* Indicators for Notes and Link (Footer) */}
            {(hasNotes || hasLink) && (
              <div className="flex items-center gap-1.5 ml-1 pl-2 border-l border-zinc-200 dark:border-zinc-700 mixed:border-zinc-200">
                {hasNotes && (
                  <div className="text-zinc-400 dark:text-zinc-500 mixed:text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300" title="Has notes" aria-label="Has notes">
                    <StickyNote size={12} aria-hidden="true" />
                  </div>
                )}
                {hasLink && (
                  <div className="text-zinc-400 dark:text-zinc-500 mixed:text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400" title="Has ClickUp Link" aria-label="Has ClickUp Link">
                    <ExternalLink size={12} aria-hidden="true" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Date / Countdown */}
          {countdown ? (
             <div 
               className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-lg border ${countdown.color} transition-colors`}
               aria-label={`Deadline: ${countdown.text}`}
              >
               <Timer size={10} aria-hidden="true" />
               <span>{countdown.text}</span>
             </div>
          ) : task.deadline && (
            <div 
              className="flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500 mixed:text-zinc-400 font-medium bg-zinc-50 dark:bg-zinc-800/50 mixed:bg-zinc-50 px-2 py-1 rounded-lg border border-zinc-100 dark:border-zinc-700/50 mixed:border-zinc-100 group-hover:border-zinc-200 dark:group-hover:border-zinc-600 mixed:group-hover:border-zinc-200 transition-colors"
              aria-label={`Due date: ${new Date(task.deadline).toLocaleDateString()}`}
            >
              <Calendar size={10} aria-hidden="true" />
              <span>{new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Drop Indicator - After */}
      {dropPosition === 'after' && (
        <div className="absolute -bottom-2 left-0 right-0 h-1 bg-indigo-500 rounded-full z-20 animate-in fade-in zoom-in-95 duration-200 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
      )}
    </div>
  );
};

export default TaskCard;
