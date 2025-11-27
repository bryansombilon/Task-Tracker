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

export const STATUS_CONFIG: Record<Status, { color: string, icon: React.FC<any> }> = {
  [Status.TODO]: { color: 'text-zinc-500 dark:text-zinc-400', icon: Circle },
  [Status.ONGOING]: { color: 'text-blue-600 dark:text-blue-400', icon: Clock },
  [Status.ON_HOLD]: { color: 'text-amber-600 dark:text-amber-400', icon: PauseCircle },
  [Status.REVIEWING]: { color: 'text-purple-600 dark:text-purple-400', icon: Search },
  [Status.PENDING]: { color: 'text-pink-600 dark:text-pink-400', icon: Hourglass },
  [Status.DONE]: { color: 'text-green-600 dark:text-green-400', icon: CheckCircle2 },
};