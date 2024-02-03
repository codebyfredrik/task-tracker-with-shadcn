import type { Task, FilterStatus } from "./types";

export function generateId() {
  return crypto.randomUUID();
}

export const getFilteredTasks = (tasks: Array<Task>, filter: FilterStatus) => {
  return tasks.filter((task) => {
    if (filter === "all") return true;
    if (filter === "completed") return task.completed;
    if (filter === "active") return !task.completed;
  });
};

export const getCompletedTasks = (tasks: Array<Task>) => {
  return tasks.filter((task) => task.completed);
};

export const getActiveTasks = (tasks: Array<Task>) => {
  return tasks.filter((task) => !task.completed);
};
