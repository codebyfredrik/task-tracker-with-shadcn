import type { FilterStatus } from "./types";

export function generateId() {
  return crypto.randomUUID();
}

export function getFilteredItems<T extends { completed: boolean }>(
  items: Array<T>,
  filter: FilterStatus,
) {
  return items.filter((item) => {
    switch (filter) {
      case "completed":
        return item.completed;
      case "active":
        return !item.completed;
      case "all":
      default:
        return item;
    }
  });
}

export function getCompletedItems<T extends { completed: boolean }>(
  items: Array<T>,
) {
  return items.filter((items) => items.completed);
}

export function getActiveItems<T extends { completed: boolean }>(
  items: Array<T>,
) {
  return items.filter((items) => !items.completed);
}
