export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  tags: string[];
  columnId: string;
  createdAt: number;
  order: number;
}

export interface Column {
  id: string;
  name: string;
  color: string;
  order: number;
}

export interface KanbanState {
  tasks: Task[];
  columns: Column[];
}
