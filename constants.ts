import { Priority, Status } from './types';
import { 
  Circle, 
  Clock, 
  PauseCircle, 
  Search, 
  Hourglass, 
  CheckCircle2,
  AlertOctagon,
  ArrowUpCircle,
  MinusCircle,
  ArrowDownCircle
} from 'lucide-react';
import React from 'react';

export const PRIORITY_COLORS: Record<Priority, string> = {
  [Priority.URGENT]: 'text-red-700 bg-red-100 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800/50',
  [Priority.HIGH]: 'text-orange-700 bg-orange-100 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800/50',
  [Priority.MEDIUM]: 'text-yellow-700 bg-yellow-100 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800/50',
  [Priority.LOW]: 'text-emerald-700 bg-emerald-100 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/50',
};

export const PRIORITY_ICONS: Record<Priority, React.FC<any>> = {
  [Priority.URGENT]: AlertOctagon,
  [Priority.HIGH]: ArrowUpCircle,
  [Priority.MEDIUM]: MinusCircle,
  [Priority.LOW]: ArrowDownCircle,
};

export const STATUS_CONFIG: Record<Status, { color: string, headerTheme: string, icon: React.FC<any> }> = {
  [Status.TODO]: { 
    color: 'text-zinc-500 dark:text-zinc-400', 
    headerTheme: 'bg-zinc-200 text-zinc-800 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
    icon: Circle 
  },
  [Status.ONGOING]: { 
    color: 'text-blue-600 dark:text-blue-400', 
    headerTheme: 'bg-blue-100 text-blue-900 border-blue-200 dark:bg-blue-900/40 dark:text-blue-100 dark:border-blue-800',
    icon: Clock 
  },
  [Status.ON_HOLD]: { 
    color: 'text-amber-600 dark:text-amber-400', 
    headerTheme: 'bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-900/40 dark:text-amber-100 dark:border-amber-800',
    icon: PauseCircle 
  },
  [Status.REVIEWING]: { 
    color: 'text-purple-600 dark:text-purple-400', 
    headerTheme: 'bg-purple-100 text-purple-900 border-purple-200 dark:bg-purple-900/40 dark:text-purple-100 dark:border-purple-800',
    icon: Search 
  },
  [Status.PENDING]: { 
    color: 'text-pink-600 dark:text-pink-400', 
    headerTheme: 'bg-pink-100 text-pink-900 border-pink-200 dark:bg-pink-900/40 dark:text-pink-100 dark:border-pink-800',
    icon: Hourglass 
  },
  [Status.DONE]: { 
    color: 'text-green-600 dark:text-green-400', 
    headerTheme: 'bg-green-100 text-green-900 border-green-200 dark:bg-green-900/40 dark:text-green-100 dark:border-green-800',
    icon: CheckCircle2 
  },
};
