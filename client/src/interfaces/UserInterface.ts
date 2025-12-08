export interface User {
  _id: string;
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
