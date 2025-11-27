export enum Priority {
  URGENT = 'Urgent',
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

export enum Status {
  TODO = 'TODO',
  ONGOING = 'ONGOING',
  ON_HOLD = 'ON HOLD',
  REVIEWING = 'REVIEWING',
  PENDING = 'PENDING',
  DONE = 'DONE'
}

export interface Task {
  id: string;
  name: string;
  clickUpLink?: string;
  deadline: string;
  priority: Priority;
  status: Status;
  createdAt: number;
  notes?: string;
  isFocused?: boolean;
}

export type TaskFormData = Omit<Task, 'id' | 'createdAt' | 'isFocused'>;