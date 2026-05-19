export enum Priority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3
}

export interface Task {
  id: string;
  title: string;
  detail: string;
  priority: Priority;
  duration: number; // total duration in minutes
  remainingTime: number; // remaining time in seconds
  dueDate: string;
  dueTime: string;
  completed: boolean;
}
