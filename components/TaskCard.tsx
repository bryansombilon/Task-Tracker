import React, { useState } from 'react';
import { Task } from '../types';
import { PRIORITY_COLORS, PRIORITY_ICONS, STATUS_CONFIG } from '../constants';
import { Calendar, ExternalLink, Timer, X, StickyNote, Link as LinkIcon } from 'lucide-react';

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
        color: 'text-red-600 bg-red-50 border-red-100 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800' 
      };
    }

    const hoursTotal = Math.floor(diffTime / (1000 * 60 * 60));

    // Less than 24 hours: Show Hours and Minutes
    if (hoursTotal < 24) {
      const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
      const timeText = hoursTotal > 0 ? `${hoursTotal}h ${minutes}m left` : `${minutes}m left`;
      
      return { 
        text: timeText, 
        color: 'text-orange-600 bg-orange-50 border-orange-100 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-800' 
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
        color: 'text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800' 
      };
    }

    // Default Days calculation
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { 
      text: `${diffDays}d left`, 
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800' 
    };
  };

  const countdown = getCountdown(task.deadline);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.effectAllowed = 'move';
    // Small delay to allow the ghost image to be created from the full opacity element
    setTimeout(() => {
        // We rely on component re-render for visual update, but we can enforce style here if needed
    }, 0);
    e.stopPropagation(); 
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDropPosition(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isDragging) return; // Don't highlight self

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
    // We do NOT stop propagation here so the parent (StatusTable/Sidebar) can receive the drop 
    // event to reset its isDragOver state.
    // e.stopPropagation(); 
    
    setDropPosition(null);
    const draggedId = e.dataTransfer.getData('taskId');
    
    if (draggedId && onDropOver) {
      onDropOver(draggedId, task.id, dropPosition || 'after');
      // Mark event as handled by the task reordering logic
      (e as any).bentoTaskHandled = true;
    }
  };

  return (
    <div className="relative mb-3 last:mb-0">
      {/* Drop Indicator - Before */}
      {dropPosition === 'before' && (
        <div className="absolute -top-2 left-0 right-0 h-1 bg-indigo-500 rounded-full z-20 animate-in fade-in zoom-in-95 duration-200 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
      )}

      <div 
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => onClick?.(task)}
        className={`
          group relative border p-4 rounded-2xl transition-all duration-200 flex flex-col gap-3 cursor-grab active:cursor-grabbing select-none
          ${isDragging 
            ? 'bg-zinc-100 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 opacity-30 grayscale scale-95' 
            : dropPosition
              ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-300 dark:border-indigo-600 shadow-md'
              : 'bg-white dark:bg-zinc-800 hover:bg-white/95 dark:hover:bg-zinc-800/95 border-zinc-200/80 dark:border-zinc-700/60 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] dark:shadow-none hover:shadow-[0_8px_16px_-4px_rgba(79,70,229,0.1)] dark:hover:shadow-[0_8px_16px_-4px_rgba(0,0,0,0.4)] hover:-translate-y-0.5'
          }
        `}
      >
        <div className="flex justify-between items-start gap-2">
          <h4 className={`text-sm font-semibold text-zinc-800 dark:text-zinc-100 line-clamp-2 leading-snug transition-colors pr-6 ${!isDragging && 'group-hover:text-indigo-900 dark:group-hover:text-indigo-400'}`}>
            {task.name}
          </h4>
          
          <div className="flex items-center gap-1 shrink-0 absolute top-4 right-4">
            {task.clickUpLink && (
              <a 
                href={task.clickUpLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-zinc-400 dark:text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-1 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg"
                title="Open ClickUp"
                onMouseDown={(e) => e.stopPropagation()} 
                onClick={(e) => e.stopPropagation()}
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
                className="text-zinc-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                title="Remove from High Priority"
               >
                 <X size={14} />
               </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex items-center gap-2">
            {/* Priority Chip */}
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${priorityClass}`}>
              <PriorityIcon size={10} />
              <span>{task.priority}</span>
            </div>

            {/* Optional Status Chip */}
            {showStatus && (
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${StatusConfig.color} bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700`}>
                  <StatusIcon size={10} />
                  <span>{task.status}</span>
              </div>
            )}

            {/* Indicators for Notes and Link (Footer) */}
            {(hasNotes || hasLink) && (
              <div className="flex items-center gap-1.5 ml-1 pl-2 border-l border-zinc-200 dark:border-zinc-700">
                {hasNotes && (
                  <div className="text-zinc-400 dark:text-zinc-500" title="Has notes">
                    <StickyNote size={12} />
                  </div>
                )}
                {hasLink && (
                  <div className="text-zinc-400 dark:text-zinc-500" title="Has ClickUp Link">
                    <LinkIcon size={12} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Date / Countdown */}
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
      
      {/* Drop Indicator - After */}
      {dropPosition === 'after' && (
        <div className="absolute -bottom-2 left-0 right-0 h-1 bg-indigo-500 rounded-full z-20 animate-in fade-in zoom-in-95 duration-200 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
      )}
    </div>
  );
};

export default TaskCard;