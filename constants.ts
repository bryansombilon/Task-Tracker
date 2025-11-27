
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

// In mixed mode, we want the "Light" version of the colors to apply, 
// overriding the "Dark" mode defaults that would otherwise cascade.
// We use `mixed:class` to force light styling when the .mixed class is present.

export const PRIORITY_COLORS: Record<Priority, string> = {
  [Priority.URGENT]: 'text-red-700 bg-red-100 border-red-200 dark:bg-red-950/80 dark:text-red-100 dark:border-red-800 mixed:bg-red-100 mixed:text-red-700 mixed:border-red-200',
  [Priority.HIGH]: 'text-orange-700 bg-orange-100 border-orange-200 dark:bg-orange-950/80 dark:text-orange-100 dark:border-orange-800 mixed:bg-orange-100 mixed:text-orange-700 mixed:border-orange-200',
  [Priority.MEDIUM]: 'text-yellow-700 bg-yellow-100 border-yellow-200 dark:bg-yellow-950/80 dark:text-yellow-100 dark:border-yellow-800 mixed:bg-yellow-100 mixed:text-yellow-700 mixed:border-yellow-200',
  [Priority.LOW]: 'text-emerald-700 bg-emerald-100 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-100 dark:border-emerald-800 mixed:bg-emerald-100 mixed:text-emerald-700 mixed:border-emerald-200',
};

export const PRIORITY_ICONS: Record<Priority, React.FC<any>> = {
  [Priority.URGENT]: AlertOctagon,
  [Priority.HIGH]: ArrowUpCircle,
  [Priority.MEDIUM]: MinusCircle,
  [Priority.LOW]: ArrowDownCircle,
};

export const STATUS_CONFIG: Record<Status, { color: string, headerTheme: string, icon: React.FC<any> }> = {
  [Status.TODO]: { 
    // Status chips inside cards
    color: 'text-zinc-600 dark:text-zinc-200 mixed:text-zinc-600', 
    // Header styling - Solid opaque colors with high contrast text
    headerTheme: 'bg-zinc-200 text-zinc-900 border-zinc-300 dark:bg-zinc-800 dark:text-white dark:border-zinc-600',
    icon: Circle 
  },
  [Status.ONGOING]: { 
    color: 'text-blue-600 dark:text-blue-200 mixed:text-blue-600', 
    headerTheme: 'bg-blue-200 text-blue-900 border-blue-300 dark:bg-blue-900 dark:text-blue-50 dark:border-blue-700',
    icon: Clock 
  },
  [Status.ON_HOLD]: { 
    color: 'text-amber-600 dark:text-amber-200 mixed:text-amber-600', 
    headerTheme: 'bg-amber-200 text-amber-900 border-amber-300 dark:bg-amber-900 dark:text-amber-50 dark:border-amber-700',
    icon: PauseCircle 
  },
  [Status.REVIEWING]: { 
    color: 'text-purple-600 dark:text-purple-200 mixed:text-purple-600', 
    headerTheme: 'bg-purple-200 text-purple-900 border-purple-300 dark:bg-purple-900 dark:text-purple-50 dark:border-purple-700',
    icon: Search 
  },
  [Status.PENDING]: { 
    color: 'text-pink-600 dark:text-pink-200 mixed:text-pink-600', 
    headerTheme: 'bg-pink-200 text-pink-900 border-pink-300 dark:bg-pink-900 dark:text-pink-50 dark:border-pink-700',
    icon: Hourglass 
  },
  [Status.DONE]: { 
    color: 'text-green-600 dark:text-green-200 mixed:text-green-600', 
    headerTheme: 'bg-green-200 text-green-900 border-green-300 dark:bg-green-900 dark:text-green-50 dark:border-green-700',
    icon: CheckCircle2 
  },
};
