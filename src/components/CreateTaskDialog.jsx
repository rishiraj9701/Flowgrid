import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { createTaskAsync } from "../features/workspaceSlice";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function CreateTaskDialog({
  showCreateTask,
  setShowCreateTask,
  projectId,
}) {
  const dispatch = useDispatch();
  const currentWorkspace = useSelector(
    (state) => state.workspace?.currentWorkspace || null
  );
  const project = currentWorkspace?.projects?.find((p) => p.id === projectId);
  const teamMembers = project?.members || [];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "TASK",
    status: "TODO",
    priority: "MEDIUM",
    assigneeId: "",
    due_date: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Task title is required");
      return;
    }

    if (!projectId) {
      toast.error("Project ID is missing");
      return;
    }

    setIsSubmitting(true);

    try {
      // Find assignee user object
      let assigneeUser = null;
      if (formData.assigneeId) {
        const member =
          teamMembers.find((m) => m.user?.id === formData.assigneeId) ||
          currentWorkspace?.members?.find((m) => m.user?.id === formData.assigneeId);
        assigneeUser = member ? member.user : null;
      }

      const newTaskId = `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const newTask = {
        id: newTaskId,
        projectId: projectId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        status: formData.status,
        priority: formData.priority,
        assigneeId: formData.assigneeId || (assigneeUser ? assigneeUser.id : ""),
        assignee: assigneeUser,
        due_date: formData.due_date
          ? new Date(formData.due_date).toISOString()
          : new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        comments: [],
      };

      await dispatch(createTaskAsync(newTask)).unwrap();
      toast.success("Task created successfully!");

      // Reset form
      setFormData({
        title: "",
        description: "",
        type: "TASK",
        status: "TODO",
        priority: "MEDIUM",
        assigneeId: "",
        due_date: "",
      });

      setShowCreateTask(false);
    } catch (error) {
      console.error("Failed to create task:", error);
      toast.error("Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={showCreateTask} onOpenChange={setShowCreateTask}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          {project && (
            <DialogDescription>
              In project:{" "}
              <span className="text-blue-600 dark:text-blue-400 font-semibold">
                {project.name}
              </span>
            </DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="task-title">Title *</Label>
            <Input
              id="task-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Task title"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="task-desc">Description</Label>
            <Textarea
              id="task-desc"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe the task scope and requirements"
            />
          </div>

          {/* Type & Priority */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="task-type">Type</Label>
              <select
                id="task-type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 shadow-2xs"
              >
                <option value="TASK">Task</option>
                <option value="BUG">Bug</option>
                <option value="FEATURE">Feature</option>
                <option value="IMPROVEMENT">Improvement</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="task-priority">Priority</Label>
              <select
                id="task-priority"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
                className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 shadow-2xs"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          {/* Assignee and Status */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="task-assignee">Assignee</Label>
              <select
                id="task-assignee"
                value={formData.assigneeId}
                onChange={(e) =>
                  setFormData({ ...formData, assigneeId: e.target.value })
                }
                className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 shadow-2xs"
              >
                <option value="">Unassigned</option>
                {(teamMembers.length > 0 ? teamMembers : currentWorkspace?.members || []).map(
                  (member) => (
                    <option key={member?.user?.id} value={member?.user?.id}>
                      {member?.user?.name || member?.user?.email}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="task-status">Status</Label>
              <select
                id="task-status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 shadow-2xs"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-1.5">
            <Label htmlFor="task-due-date">Due Date</Label>
            <div className="flex items-center gap-2">
              <CalendarIcon className="size-4 text-zinc-500 dark:text-zinc-400" />
              <Input
                id="task-due-date"
                type="date"
                value={formData.due_date}
                onChange={(e) =>
                  setFormData({ ...formData, due_date: e.target.value })
                }
              />
            </div>
            {formData.due_date && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {format(new Date(formData.due_date), "PPP")}
              </p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateTask(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
