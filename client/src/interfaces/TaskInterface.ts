export interface Task {
  id: number;
  text: string;
  completed: boolean;
  status: string;
  date: string;
  description: string;
  category: string;
  isImportant: boolean;
  priority: string;
}

export interface Category {
  name: string;
  color: string;
}