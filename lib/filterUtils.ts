import type { Task, FilterStatus } from "@/lib/types";
import { getActiveTasks, getCompletedTasks } from "./taskUtils";

export function updateFilter(
  nextTasks: Array<Task>,
  currentFilter: FilterStatus,
) {
  const activeTasks = getActiveTasks(nextTasks);
  const completedTasks = getCompletedTasks(nextTasks);

  if (
    (activeTasks.length === 0 && currentFilter === "active") ||
    (completedTasks.length === 0 && currentFilter === "completed")
  ) {
    return "all";
  }

  return currentFilter;
}
