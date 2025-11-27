
import React, { useState, useEffect } from 'react';
import { Task, Priority, Status, TaskFormData } from './types';
import Sidebar from './components/Sidebar';
import StatusTable from './components/StatusTable';
import AddTaskModal from './components/AddTaskModal';
import { Plus, Sun, Moon, Palette } from 'lucide-react';

const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    name: 'Integrate Gemini API for auto-prioritization',
    clickUpLink: 'https://clickup.com',
    deadline: '2024-05-20',
    priority: Priority.HIGH,
    status: Status.ONGOING,
    createdAt: Date.now(),
    notes: 'Use the gemini-2.5-flash model for faster response times.',
    isFocused: true
  },
  {
    id: '2',
    name: 'Refactor mobile layout for dashboard',
    clickUpLink: '',
    deadline: '2024-06-01',
    priority: Priority.MEDIUM,
    status: Status.TODO,
    createdAt: Date.now() - 1000,
    isFocused: false
  },
  {
    id: '3',
    name: 'Fix production crash in payment module',
    clickUpLink: '',
    deadline: '2024-05-15',
    priority: Priority.URGENT,
    status: Status.REVIEWING,
    createdAt: Date.now() - 2000,
    isFocused: true
  },
];

type ThemeMode = 'light' | 'dark' | 'mixed';

const App: React.FC = () => {
  // Theme management: 'light' | 'dark' | 'mixed'
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      if (document.documentElement.classList.contains('mixed')) return 'mixed';
      if (document.documentElement.classList.contains('dark')) return 'dark';
    }
    return 'light';
  });

  // Apply theme classes to html element
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'mixed');

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'mixed') {
      root.classList.add('dark', 'mixed');
    }
    // light mode has no classes
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'mixed';
      return 'light';
    });
  };

  // Initialize state from LocalStorage if available, otherwise use defaults
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('bento_tasks');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch (e) {
      console.error("Failed to load tasks from local storage", e);
      return INITIAL_TASKS;
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [modalDefaultPriority, setModalDefaultPriority] = useState<Priority | undefined>(undefined);

  // Save to LocalStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('bento_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleSaveTask = (data: TaskFormData) => {
    if (editingTask) {
      // Update existing task
      setTasks(prev => prev.map(t => 
        t.id === editingTask.id 
          ? { ...t, ...data } 
          : t
      ));
      setEditingTask(null);
    } else {
      // Create new task
      const newTask: Task = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: Date.now(),
        isFocused: false
      };
      setTasks(prev => [newTask, ...prev]);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setEditingTask(null);
    setIsModalOpen(false);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setModalDefaultPriority(undefined);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    setModalDefaultPriority(undefined);
  };

  const handleStatusChange = (taskId: string, newStatus: Status) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  // Handles adding task to the "Focus" sidebar
  const handleTaskFocus = (taskId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, isFocused: true } : task
    ));
  };

  // Handles removing task from the "Focus" sidebar
  const handleTaskUnfocus = (taskId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, isFocused: false } : task
    ));
  };

  // Handles moving task within list and optionally updating status (if moved between columns)
  const handleTaskReorder = (draggedId: string, targetId: string, position: 'before' | 'after', shouldSyncStatus: boolean) => {
    if (draggedId === targetId) return;

    setTasks(prev => {
      const cloned = [...prev];
      const draggedIndex = cloned.findIndex(t => t.id === draggedId);
      if (draggedIndex === -1) return prev;
      
      const draggedTask = cloned[draggedIndex];

      // Remove dragged task from its original position
      cloned.splice(draggedIndex, 1);
      
      // Find new target index (indices might have shifted)
      let targetIndex = cloned.findIndex(t => t.id === targetId);
      if (targetIndex === -1) {
          // Fallback: put it at the end if target lost (edge case)
          cloned.push(draggedTask);
          return cloned;
      }

      // If we want to drop 'after', we increment the insertion index
      if (position === 'after') {
        targetIndex++;
      }

      // Update status if required (e.g. dragging onto a card in a different column)
      // Note: We check the target task's status to determine the new status
      const targetTask = prev.find(t => t.id === targetId);
      
      if (shouldSyncStatus && targetTask && draggedTask.status !== targetTask.status) {
        draggedTask.status = targetTask.status;
      }

      // Insert at computed index
      cloned.splice(targetIndex, 0, draggedTask);

      return cloned;
    });
  };

  // Group definitions to split into the 2 right columns
  const leftStatuses = [Status.TODO, Status.ONGOING, Status.ON_HOLD];
  const rightStatuses = [Status.REVIEWING, Status.PENDING, Status.DONE];

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-4 lg:p-6 overflow-hidden flex flex-col font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900 selection:text-indigo-800 dark:selection:text-indigo-200 transition-colors duration-300">
      
      {/* Theme Toggle Button (Top Right) */}
      <button 
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 p-2.5 rounded-full bg-white dark:bg-zinc-800 shadow-md border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all hover:scale-105 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        title={`Current Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`}
        aria-label={`Switch theme. Current theme is ${theme}`}
      >
        {theme === 'light' && <Sun size={20} aria-hidden="true" />}
        {theme === 'dark' && <Moon size={20} aria-hidden="true" />}
        {theme === 'mixed' && <Palette size={20} aria-hidden="true" />}
      </button>

      <main className="flex-1 max-w-[1800px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
        
        {/* Column 1: Focus List (Span 3) */}
        <div className="lg:col-span-3 h-full min-h-[400px]">
          <Sidebar 
            tasks={tasks} 
            onTaskClick={handleEditTask}
            onTaskFocus={handleTaskFocus}
            onTaskUnfocus={handleTaskUnfocus}
            onTaskReorder={(d, t, p) => handleTaskReorder(d, t, p, false)}
          />
        </div>

        {/* Main Content Area (Span 9) - Contains Column 2 & 3 */}
        <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-6 h-full min-h-0">
          
          {/* Column 2: Status Group A */}
          <div className="flex flex-col gap-6 h-full min-h-0">
            {leftStatuses.map(status => (
              <div key={status} className="flex-1 min-h-0">
                <StatusTable 
                  status={status} 
                  tasks={tasks.filter(t => t.status === status)}
                  count={tasks.filter(t => t.status === status).length}
                  onTaskDrop={handleStatusChange}
                  onTaskClick={handleEditTask}
                  onTaskReorder={(d, t, p) => handleTaskReorder(d, t, p, true)}
                />
              </div>
            ))}
          </div>

          {/* Column 3: Status Group B */}
          <div className="flex flex-col gap-6 h-full min-h-0">
            {rightStatuses.map(status => (
              <div key={status} className="flex-1 min-h-0">
                <StatusTable 
                  status={status} 
                  tasks={tasks.filter(t => t.status === status)}
                  count={tasks.filter(t => t.status === status).length}
                  onTaskDrop={handleStatusChange}
                  onTaskClick={handleEditTask}
                  onTaskReorder={(d, t, p) => handleTaskReorder(d, t, p, true)}
                />
              </div>
            ))}
          </div>

        </div>
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => {
          setEditingTask(null);
          setModalDefaultPriority(undefined);
          setIsModalOpen(true);
        }}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-full shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/60 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center z-40 group border border-white/20 outline-none focus-visible:ring-4 focus-visible:ring-indigo-300"
        aria-label="Create a new task"
      >
        <Plus size={32} className="group-hover:rotate-90 transition-transform duration-300" aria-hidden="true" />
      </button>

      <AddTaskModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onSubmit={handleSaveTask}
        onDelete={handleDeleteTask}
        initialData={editingTask}
        defaultPriority={modalDefaultPriority}
      />
    </div>
  );
};

export default App;
