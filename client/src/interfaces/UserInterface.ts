export interface User {
  email: string;
  name: string;
  picture: string;
  team: string;
  categories: string[];
  statuses: Status[];
  isUserQuestDone: boolean;
}

export interface Status {
  name: string;
  color: string;
}
