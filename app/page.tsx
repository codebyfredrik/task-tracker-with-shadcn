"use client";

import * as React from "react";
import { useListData } from "react-stately";
import {
  useDragAndDrop,
  ListBox,
  ListBoxItem,
  DropIndicator,
  type Selection,
} from "react-aria-components";
import { stagger, useAnimate, motion } from "framer-motion";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Task, FilterStatus } from "@/lib/types";
import {
  generateId,
  getActiveItems,
  getCompletedItems,
  getFilteredItems,
} from "@/lib/itemsUtils";
import { updateFilter } from "@/lib/filterUtils";

export default function Home() {
  const [text, setText] = React.useState("");
  const [filter, setFilter] = React.useState<FilterStatus>("all");
  const list = useListData<Task>({
    initialItems: [],
    getKey: (item) => item.id,
  });
  const [deleteTaskId, setDeleteTaskId] = React.useState<string | null>(null);
  const [ref, animate] = useAnimate();
  let [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set());

  const handleSubmit: React.ComponentProps<"form">["onSubmit"] = (e) => {
    e.preventDefault();

    if (!text) return;

    const newTask: Task = {
      id: generateId(),
      name: text,
      completed: false,
      priority: "medium",
    };

    list.prepend(newTask);

    setText("");
    setFilter("all");

    toast.success("Task has been created");
  };

  const handleTextChange: React.ComponentProps<typeof Input>["onChange"] = (
    e,
  ) => {
    setText(e.target.value);
  };

  const handleTaskCompletedToggle = (taskId: string) => {
    const task = list.getItem(taskId);

    // Create a new task object with the completed property toggled
    const updatedTask = { ...task, completed: !task.completed };

    // Create a new array with the updated task
    const nextTasks = list.items.map((item) =>
      item.id === taskId ? updatedTask : item,
    );

    // Update the task in the list
    list.update(taskId, updatedTask);

    // 🟢 If every item has been checked...
    if (nextTasks.every((task) => task.completed)) {
      const lastCompletedTask = list.items.findIndex((task) => !task.completed);
      const random = Math.random();

      if (random < 1 / 3) {
        animate(
          ".testing",
          { scale: [1, 1.25, 1] },
          {
            duration: 0.35,
            delay: stagger(0.075, { from: lastCompletedTask }),
          },
        );
      } else if (random < 2 / 3) {
        animate(
          ".testing",
          { x: [0, 2, -2, 0] },
          {
            duration: 0.4,
            delay: stagger(0.1, { from: lastCompletedTask }),
          },
        );
      } else {
        animate(
          ".testing",
          { rotate: [0, 10, -10, 0] },
          {
            duration: 0.5,
            delay: stagger(0.1, { from: lastCompletedTask }),
          },
        );
      }
    }

    const nextFilter = updateFilter(nextTasks, filter);
    setFilter(nextFilter);
  };

  const handleTaskDelete = (taskId?: string) => {
    const idToDelete = taskId || deleteTaskId;

    if (!idToDelete) return;

    // Create a new array without the removed task
    const nextTasks = list.items.filter((item) => item.id !== idToDelete);

    // Remove the task from the list
    list.remove(idToDelete);

    setDeleteTaskId(null);

    const nextFilter = updateFilter(nextTasks, filter);
    setFilter(nextFilter);

    toast.success("Task has been deleted");
  };

  const handleFilterChange = (value: FilterStatus) => {
    setFilter(value);
  };

  const filteredTasks = getFilteredItems(list.items, filter);

  const completedTasks = getCompletedItems(list.items);
  const hasCompletedTasks = completedTasks.length > 0;

  const activeTasks = getActiveItems(list.items);
  const hasActiveTasks = activeTasks.length > 0;

  const taskCount = list.items.length;
  const completedTaskCountText = `${completedTasks.length} of ${taskCount} ${
    taskCount > 1 ? "tasks" : "task"
  } completed`;

  let { dragAndDropHooks } = useDragAndDrop({
    getItems: (keys) =>
      [...keys].map((key) => ({ "text/plain": list.getItem(key)?.name })),
    onReorder(e) {
      if (e.target.dropPosition === "before") {
        list.moveBefore(e.target.key, e.keys);
      } else if (e.target.dropPosition === "after") {
        list.moveAfter(e.target.key, e.keys);
      }

      setTimeout(() => {
        setSelectedKeys(new Set());
        toast.success("Tasks have been reordered");
      }, 2000);
    },
    renderDragPreview(items) {
      let displayText = items[0]["text/plain"];

      if (displayText.length > 50) {
        displayText = displayText.substring(0, 50) + "...";
      }

      return (
        <div className="flex min-w-min justify-between gap-5 rounded-md bg-indigo-600 px-3 py-2 text-white">
          {displayText}
          <span className="rounded-sm bg-white px-2 text-indigo-600">
            {items.length}
          </span>
        </div>
      );
    },
    renderDropIndicator(target) {
      return (
        <motion.div layout>
          <DropIndicator
            target={target}
            className={({ isDropTarget }) =>
              `${isDropTarget ? "my-2 border border-indigo-600" : ""}`
            }
          />
        </motion.div>
      );
    },
  });

  function renderEmptyState() {
    if (filter === "all") {
      return <div className="italic">{`You don't have any tasks...`}</div>;
    }

    if (filter === "completed") {
      return (
        <div className="italic">{`You don't have any completed tasks...`}</div>
      );
    }

    if (filter === "active") {
      return (
        <div className="italic">{`You don't have any active tasks...`}</div>
      );
    }
  }

  return (
    <div className="flex min-h-screen flex-col p-1">
      <div className="border-3 mx-auto mt-8 w-full max-w-2xl px-4 md:mt-24">
        <h1 className="mb-4 text-3xl font-bold">Task tracker</h1>
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {taskCount > 0 && completedTaskCountText}
          </span>
          <Select
            name="filter"
            onValueChange={handleFilterChange}
            value={filter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem value="all">
                  All {filteredTasks.length > 0 && `(${filteredTasks.length})`}
                </SelectItem>
                <SelectItem value="completed" disabled={!hasCompletedTasks}>
                  Completed {hasCompletedTasks && `(${completedTasks.length})`}
                </SelectItem>
                <SelectItem value="active" disabled={!hasActiveTasks}>
                  Active {hasActiveTasks && `(${activeTasks.length})`}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div>
          <form onSubmit={handleSubmit}>
            <div className="flex w-full items-center space-x-2">
              <Input
                name="task"
                placeholder="New task..."
                value={text}
                onChange={handleTextChange}
              />
              <Button
                type="submit"
                disabled={!text}
                className="whitespace-nowrap"
                color="zinc"
              >
                Add task
              </Button>
            </div>
          </form>
          <div className="mt-6" ref={ref}>
            <ListBox
              aria-label="Reorderable list"
              selectionMode="multiple"
              items={filteredTasks}
              dragAndDropHooks={dragAndDropHooks}
              className="space-y-3"
              renderEmptyState={renderEmptyState}
              selectedKeys={selectedKeys}
              onSelectionChange={setSelectedKeys}
            >
              {(item) => {
                return (
                  <ListBoxItem
                    key={item.id}
                    textValue={item.name}
                    className="selected:bg-indigo-100"
                  >
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ scale: 0.75, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.75, opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                      className={`flex justify-between rounded-lg border p-5 shadow-sm dragging:z-0 dragging:bg-indigo-50 dragging:outline-none`}
                    >
                      <div className="flex items-center space-x-6">
                        <Checkbox
                          id={item.id}
                          checked={item.completed}
                          onCheckedChange={() =>
                            handleTaskCompletedToggle(item.id)
                          }
                          className="testing"
                        />
                        <label
                          htmlFor={item.id}
                          className={`text-sm font-medium leading-none dragging:text-red-400 peer-disabled:cursor-not-allowed peer-disabled:opacity-70
                          ${item.completed ? "line-through" : ""}`}
                        >
                          {item.name}
                        </label>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                          >
                            <DotsHorizontalIcon className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteTaskId(item.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </motion.div>
                  </ListBoxItem>
                );
              }}
            </ListBox>
          </div>
          <AlertDialog
            open={Boolean(deleteTaskId)}
            onOpenChange={() => setDeleteTaskId(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your task.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleTaskDelete()}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
