export type Priority = "low" | "medium" | "high";

export type Task = {
  id: string;
  name: string;
  completed: boolean;
  priority: Priority;
};

export type FilterStatus = "all" | "completed" | "active";
