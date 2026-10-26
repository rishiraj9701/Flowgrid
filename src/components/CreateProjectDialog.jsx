import { useState } from "react";
import { XIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { createProjectAsync } from "../features/workspaceSlice";

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
import { Badge } from "@/components/ui/badge";

const CreateProjectDialog = ({ isDialogOpen, setIsDialogOpen }) => {
  const dispatch = useDispatch();
  const { currentWorkspace } = useSelector((state) => state.workspace);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "PLANNING",
    priority: "MEDIUM",
    start_date: "",
    end_date: "",
    team_members: [],
    team_lead: "",
    progress: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const removeTeamMember = (email) => {
    setFormData((prev) => ({
      ...prev,
      team_members: prev.team_members.filter((m) => m !== email),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Project name is required");
      return;
    }

    if (
      formData.start_date &&
      formData.end_date &&
      new Date(formData.end_date) < new Date(formData.start_date)
    ) {
      toast.error("End date cannot be earlier than start date");
      return;
    }

    if (!currentWorkspace) {
      toast.error("No active workspace selected");
      return;
    }

    setIsSubmitting(true);

    try {
      const newProjectId = `proj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

      // Determine team lead
      const leadMember = currentWorkspace.members?.find(
        (m) => m.user.email === formData.team_lead
      );
      const teamLeadId = leadMember
        ? leadMember.user.id
        : currentWorkspace.members?.[0]?.user?.id || "user_1";

      // Build project members list
      const projectMembersList = [];
      const emailsToInclude = new Set(formData.team_members);
      if (formData.team_lead) {
        emailsToInclude.add(formData.team_lead);
      }

      emailsToInclude.forEach((email) => {
        const member = currentWorkspace.members?.find((m) => m.user.email === email);
        if (member) {
          projectMembersList.push({
            id: `pm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            userId: member.user.id,
            projectId: newProjectId,
            user: member.user,
          });
        }
      });

      // If no members were matched, at least add the team lead
      if (projectMembersList.length === 0 && currentWorkspace.members?.length > 0) {
        const defaultMember = currentWorkspace.members[0];
        projectMembersList.push({
          id: `pm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          userId: defaultMember.user.id,
          projectId: newProjectId,
          user: defaultMember.user,
        });
      }

      const newProject = {
        id: newProjectId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status,
        priority: formData.priority,
        start_date: formData.start_date
          ? new Date(formData.start_date).toISOString()
          : new Date().toISOString(),
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        team_lead: teamLeadId,
        workspaceId: currentWorkspace.id,
        progress: Number(formData.progress) || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        members: projectMembersList,
        tasks: [],
      };

      await dispatch(createProjectAsync(newProject)).unwrap();
      toast.success("Project created successfully!");

      // Reset form
      setFormData({
        name: "",
        description: "",
        status: "PLANNING",
        priority: "MEDIUM",
        start_date: "",
        end_date: "",
        team_members: [],
        team_lead: "",
        progress: 0,
      });

      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to create project:", error);
      toast.error("Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          {currentWorkspace && (
            <DialogDescription>
              In workspace:{" "}
              <span className="text-blue-600 dark:text-blue-400 font-semibold">
                {currentWorkspace.name}
              </span>
            </DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Project Name */}
          <div className="space-y-1.5">
            <Label htmlFor="project-name">Project Name *</Label>
            <Input
              id="project-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter project name"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="project-desc">Description</Label>
            <Textarea
              id="project-desc"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe your project initiatives and scope"
            />
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="project-status">Status</Label>
              <select
                id="project-status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 shadow-2xs"
              >
                <option value="PLANNING">Planning</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="project-priority">Priority</Label>
              <select
                id="project-priority"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 shadow-2xs"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="project-start-date">Start Date</Label>
              <Input
                id="project-start-date"
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="project-end-date">End Date</Label>
              <Input
                id="project-end-date"
                type="date"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
                min={formData.start_date ? formData.start_date : undefined}
              />
            </div>
          </div>

          {/* Lead */}
          <div className="space-y-1.5">
            <Label htmlFor="project-lead">Project Lead</Label>
            <select
              id="project-lead"
              value={formData.team_lead}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  team_lead: e.target.value,
                  team_members: e.target.value
                    ? [...new Set([...formData.team_members, e.target.value])]
                    : formData.team_members,
                })
              }
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 shadow-2xs"
            >
              <option value="">Select project lead</option>
              {currentWorkspace?.members?.map((member) => (
                <option key={member.user.email} value={member.user.email}>
                  {member.user.name} ({member.user.email})
                </option>
              ))}
            </select>
          </div>

          {/* Team Members */}
          <div className="space-y-1.5">
            <Label htmlFor="project-members">Team Members</Label>
            <select
              id="project-members"
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 shadow-2xs"
              onChange={(e) => {
                if (
                  e.target.value &&
                  !formData.team_members.includes(e.target.value)
                ) {
                  setFormData((prev) => ({
                    ...prev,
                    team_members: [...prev.team_members, e.target.value],
                  }));
                }
              }}
              value=""
            >
              <option value="">Add team members</option>
              {currentWorkspace?.members
                ?.filter((m) => !formData.team_members.includes(m.user.email))
                .map((member) => (
                  <option key={member.user.email} value={member.user.email}>
                    {member.user.name} ({member.user.email})
                  </option>
                ))}
            </select>

            {formData.team_members.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.team_members.map((email) => (
                  <Badge
                    key={email}
                    variant="secondary"
                    className="flex items-center gap-1.5 px-2.5 py-1"
                  >
                    <span>{email}</span>
                    <button
                      type="button"
                      onClick={() => removeTeamMember(email)}
                      className="hover:text-rose-500 rounded p-0.5"
                    >
                      <XIcon className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !currentWorkspace}
            >
              {isSubmitting ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;