"use client";

import * as React from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
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
  getActiveTasks,
  getCompletedTasks,
  getFilteredTasks,
} from "@/lib/taskUtils";
import { updateFilter } from "@/lib/filterUtils";

export default function Home() {
  const [text, setText] = React.useState("");
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [filter, setFilter] = React.useState<FilterStatus>("all");
  const [deleteTaskId, setDeleteTaskId] = React.useState<string | null>(null);

  const handleSubmit: React.ComponentProps<"form">["onSubmit"] = (e) => {
    e.preventDefault();

    if (!text) return;

    const newTask: Task = {
      id: generateId(),
      name: text,
      completed: false,
      priority: "medium",
    };

    const nextTasks = [...tasks, newTask];

    setTasks(nextTasks);
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
    const nextTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task,
    );

    const task = nextTasks.find((task) => task.id === taskId);

    if (task?.completed) {
      toast.success("Task has been completed");
    } else {
      toast.info("Task has been marked as active");
    }

    setTasks(nextTasks);

    const newFilter = updateFilter(nextTasks, filter);
    setFilter(newFilter);
  };

  const handleTaskDelete = (taskId?: string) => {
    const idToDelete = taskId || deleteTaskId;

    if (!idToDelete) return;

    const nextTasks = [...tasks].filter((task) => task.id !== idToDelete);

    toast.success("Task has been deleted");

    setTasks(nextTasks);
    setDeleteTaskId(null);

    const newFilter = updateFilter(nextTasks, filter);
    setFilter(newFilter);
  };

  const handleFilterChange = (value: FilterStatus) => {
    setFilter(value);
  };

  const filteredAndReversedTasks = getFilteredTasks(tasks, filter).reverse();

  const completedTasks = getCompletedTasks(tasks);
  const hasCompletedTasks = completedTasks.length > 0;

  const activeTasks = getActiveTasks(tasks);
  const hasActiveTasks = activeTasks.length > 0;

  const taskCount = tasks.length;
  const completedTaskCountText = `${completedTasks.length} of ${taskCount} ${
    taskCount > 1 ? "tasks" : "task"
  } completed`;

  return (
    <div className="flex min-h-screen flex-col p-1">
      <div className="border-3 mx-auto mt-8 w-full max-w-2xl border-green-500 px-4 md:mt-24">
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
                  All{" "}
                  {filteredAndReversedTasks.length > 0 &&
                    `(${filteredAndReversedTasks.length})`}
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
          <div className="mt-6">
            {filteredAndReversedTasks.length ? (
              <ul className="space-y-4">
                {filteredAndReversedTasks.map((task) => (
                  <li key={task.id}>
                    <Card
                      className={`flex justify-between p-4 hover:bg-gray-50 ${
                        task.completed ? "bg-gray-100" : ""
                      }`}
                    >
                      <div className="flex items-center space-x-6 ">
                        <Checkbox
                          id={task.id}
                          checked={task.completed}
                          onCheckedChange={() =>
                            handleTaskCompletedToggle(task.id)
                          }
                        />
                        <label
                          htmlFor={task.id}
                          className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                            task.completed ? "line-through" : ""
                          }`}
                        >
                          {task.name}
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
                            onClick={() => setDeleteTaskId(task.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </Card>
                  </li>
                ))}
              </ul>
            ) : (
              <>
                {filter === "all" && (
                  <div className="italic">{`You don't have any tasks...`}</div>
                )}
                {filter === "completed" && (
                  <div className="italic">{`You don't have any completed tasks...`}</div>
                )}
                {filter === "active" && (
                  <div className="italic">{`You don't have any active tasks...`}</div>
                )}
              </>
            )}
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
