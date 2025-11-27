import React, { useState, useEffect } from 'react';
import { Task, Priority, Status, TaskFormData } from './types';
import Sidebar from './components/Sidebar';
import StatusTable from './components/StatusTable';
import AddTaskModal from './components/AddTaskModal';
import { Plus, Sun, Moon } from 'lucide-react';

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

const App: React.FC = () => {
  // Theme management
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
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

  // Group definitions to split into the 2 right columns
  const leftStatuses = [Status.TODO, Status.ONGOING, Status.ON_HOLD];
  const rightStatuses = [Status.REVIEWING, Status.PENDING, Status.DONE];

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-4 lg:p-6 overflow-hidden flex flex-col font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900 selection:text-indigo-800 dark:selection:text-indigo-200 transition-colors duration-300">
      
      {/* Theme Toggle Button (Top Right) */}
      <button 
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 p-2.5 rounded-full bg-white dark:bg-zinc-800 shadow-md border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all hover:scale-105"
        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="flex-1 max-w-[1800px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
        
        {/* Column 1: Focus List (Span 3) */}
        <div className="lg:col-span-3 h-full min-h-[400px]">
          <Sidebar 
            tasks={tasks} 
            onTaskClick={handleEditTask}
            onTaskFocus={handleTaskFocus}
            onTaskUnfocus={handleTaskUnfocus}
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
                />
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => {
          setEditingTask(null);
          setModalDefaultPriority(undefined);
          setIsModalOpen(true);
        }}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-full shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/60 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center z-40 group border border-white/20"
      >
        <Plus size={32} className="group-hover:rotate-90 transition-transform duration-300" />
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