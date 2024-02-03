import type { Task, FilterStatus } from "@/lib/types";
import { getActiveItems, getCompletedItems } from "./itemsUtils";

function filterHasNoItems<T>(
  items: Array<T>,
  currentFilter: FilterStatus,
  filterCondition: FilterStatus,
) {
  return items.length === 0 && currentFilter === filterCondition;
}

export function updateFilter<T extends { completed: boolean }>(
  nextItems: Array<T>,
  currentFilter: FilterStatus,
) {
  const activeItems = getActiveItems(nextItems);
  const completedItems = getCompletedItems(nextItems);

  if (
    filterHasNoItems(activeItems, currentFilter, "active") ||
    filterHasNoItems(completedItems, currentFilter, "completed")
  ) {
    return "all";
  }

  return currentFilter;
}
