export interface Task {
  _id?: string;
  author: string;
  text: string;
  isCompleted: boolean;
  status: string;
  date: string;
  description: string;
  category: string;
  isImportant: boolean;
  priority: string;
  assignee?: string;
}
