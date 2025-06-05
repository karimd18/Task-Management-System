import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Search,
  Calendar,
  User as UserIcon,
  Plus,
  X,
  Trash2,
  Settings,
  CircleDot,
  CheckCircle2,
  Circle,
  Edit,
  ArrowRightCircle,
} from "lucide-react";
import { Navbar } from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";
import { useTeam } from "../contexts/TeamContext";
import { useTasks } from "../contexts/TaskContext";
import { statusesApi, teamsApi } from "../lib/api";
import type {
  Task,
  Status,
  TaskCreateDTO,
  TaskUpdateDTO,
  MemberDTO_GET,
} from "../lib/api/types";

interface TaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onCreate: (task: TaskCreateDTO) => Promise<void>;
  onUpdate: (id: string, task: TaskUpdateDTO) => Promise<void>;
  onDelete?: () => void;
  teamMembers?: MemberDTO_GET[];
  mode: "create" | "edit";
  statuses: Status[];
}

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
  existingStatuses: Status[];
}

interface EditStatusModalProps {
  status: Status | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, newName: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  existingStatuses: Status[];
}

interface TasksBoardProps {
  selectedTeam: string | null;
  onBackToTeams: () => void;
}

const StatusModal: React.FC<StatusModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingStatuses,
}) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = name.trim();
    if (!normalized) return setError("Status name is required");
    if (
      existingStatuses.some(
        (s) => s.name.toLowerCase() === normalized.toLowerCase()
      )
    ) {
      return setError("A status with this name already exists");
    }
    try {
      await onSave(normalized);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create status");
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-500/75 dark:bg-gray-900/75 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Add New Status
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Status Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
          />
          {error && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          <div className="mt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-sm text-gray-700 dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
            >
              Add Status
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditStatusModal: React.FC<EditStatusModalProps> = ({
  status,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  existingStatuses,
}) => {
  const [name, setName] = useState(status?.name || "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status) setName(status.name);
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = name.trim();
    if (!normalized) return setError("Status name is required");
    if (
      existingStatuses.some(
        (s) =>
          s.id !== status?.id &&
          s.name.toLowerCase() === normalized.toLowerCase()
      )
    ) {
      return setError("A status with this name already exists");
    }
    if (status) {
      try {
        await onUpdate(status.id, normalized);
        onClose();
      } catch (err: any) {
        setError(err.message || "Failed to update status");
      }
    }
  };

  const handleDelete = async () => {
    if (!status) return;
    if (
      !window.confirm(
        "Delete this status? All tasks in this status will lose it."
      )
    )
      return;
    try {
      await onDelete(status.id);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to delete status");
    }
  };

  if (!isOpen || !status) return null;
  return (
    <div className="fixed inset-0 bg-gray-500/75 dark:bg-gray-900/75 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Edit Status
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Status Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
          />
          {error && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          <div className="mt-4 flex justify-between">
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 border border-red-300 dark:border-red-500 text-red-700 dark:text-red-400 rounded-md hover:bg-red-50"
            >
              <Trash2 className="h-5 w-5 inline mr-2" />
              Delete Status
            </button>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const TaskModal: React.FC<TaskModalProps> = ({
  task,
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
  teamMembers,
  mode,
  statuses,
}) => {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [assignedToUserId, setAssignedToUserId] = useState(
    task?.assignedToUserId || ""
  );
  const [dueDate, setDueDate] = useState(task?.dueDate?.split("T")[0] || "");
  const [statusId, setStatusId] = useState(task?.statusId || "");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setAssignedToUserId(task.assignedToUserId || "");
      setDueDate(task.dueDate?.split("T")[0] || "");
      const validStatus = statuses.find((s) => s.id === task.statusId);
      setStatusId(validStatus ? task.statusId : "");
    } else {
      setTitle("");
      setDescription("");
      setAssignedToUserId("");
      setDueDate("");
      setStatusId("");
    }
  }, [task, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: TaskCreateDTO | TaskUpdateDTO = {
      title,
      description: description || undefined,
      statusId,
      dueDate: dueDate ? `${dueDate}T00:00:00Z` : undefined,
      assignedToUserId: assignedToUserId || undefined,
    };
    if (mode === "create") onCreate(payload as TaskCreateDTO);
    else if (task) onUpdate(task.id, payload as TaskUpdateDTO);
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-500/75 dark:bg-gray-900/75 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {mode === "create" ? "Create New Task" : "Edit Task"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Title
            </label>
            <input
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              value={task?.statusId}
              onChange={(e) => setStatusId(e.target.value)}
              required
            >
              {(mode === "create" || mode === "edit") && (
                <option value="" disabled>
                  Choose a status...
                </option>
              )}
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Assigned To
            </label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              value={assignedToUserId}
              onChange={(e) => setAssignedToUserId(e.target.value)}
            >
              <option value="">Unassigned</option>
              {teamMembers?.map((m) => (
                <option key={m.userId} value={m.userId}>
                  @{m.userDetails.username}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Due Date
            </label>
            <input
              type="date"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="flex justify-between">
            {mode === "edit" && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Delete this task?")) {
                    onDelete();
                    onClose();
                  }
                }}
                className="px-4 py-2 border border-red-300 dark:border-red-500 text-red-700 dark:text-red-400 rounded-md hover:bg-red-50"
              >
                <Trash2 className="inline h-5 w-5 mr-2" /> Delete Task
              </button>
            )}
            <div className="flex space-x-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                {mode === "create" ? "Create Task" : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const getStatusIcon = (statusName: string) => {
  const lower = statusName.toLowerCase();
  if (lower.includes("done"))
    return (
      <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400" />
    );
  if (lower.includes("progress"))
    return (
      <ArrowRightCircle className="h-5 w-5 text-blue-500 dark:text-blue-400" />
    );
  if (lower.includes("todo"))
    return <Circle className="h-5 w-5 text-gray-500 dark:text-gray-400" />;
  return <CircleDot className="h-5 w-5 text-purple-500 dark:text-purple-400" />;
};

export default function TasksBoard({
  selectedTeam,
  onBackToTeams,
}: TasksBoardProps) {
  const { user } = useAuth();
  const { teams } = useTeam();
  const { tasks, createTask, updateTask, deleteTask, loadTasks } = useTasks();

  const [searchQuery, setSearchQuery] = useState("");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showEditStatusModal, setShowEditStatusModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskModalMode, setTaskModalMode] = useState<"create" | "edit">(
    "create"
  );
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [teamMembers, setTeamMembers] = useState<MemberDTO_GET[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [statusToEdit, setStatusToEdit] = useState<Status | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setGlobalError(null);
        if (!selectedTeam) {
          setIsAdmin(true);
          setIsMember(true);
          const { data: personalStatuses } = await statusesApi.list(undefined);
          setStatuses(personalStatuses);
          await loadTasks({ isPersonal: true });
        } else if (user?.id) {
          const { data: statList } = await statusesApi.list(
            selectedTeam || undefined
          );
          setStatuses(statList);
          if (selectedTeam) {
            const { data: members } = await teamsApi.getMembers(
              selectedTeam,
              1,
              100
            );
            setTeamMembers(members);
            const me = members.find((m) => m.userId === user?.id);
            const isCreator =
              teams.find((t) => t.id === selectedTeam)?.createdBy === user?.id;
            setIsAdmin(isCreator || me?.role === "admin");
            setIsMember(me?.role === "member");
          }
          await loadTasks({
            teamId: selectedTeam,
          });
        }
      } catch (err: any) {
        setGlobalError(err.message || "Failed to load data");
      }
    };
    if (user?.id) loadData();
  }, [selectedTeam, user?.id]);

  const handleCreateTask = async (d: TaskCreateDTO) => {
    try {
      await createTask({
        ...d,
        isPersonal: !selectedTeam,
        teamId: selectedTeam || undefined,
      });
      await loadTasks();
    } catch (err: any) {
      setGlobalError(err.message || "Failed to create task");
      throw err;
    } finally {
      setShowTaskModal(false);
    }
  };

  const handleUpdateTask = async (id: string, d: TaskUpdateDTO) => {
    try {
      await updateTask(id, d);
      await loadTasks();
    } catch (err: any) {
      setGlobalError(err.message || "Failed to update task");
      throw err;
    } finally {
      setShowTaskModal(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    try {
      await deleteTask(selectedTask.id);
      await loadTasks();
    } catch (err: any) {
      setGlobalError(err.message || "Failed to delete task");
      throw err;
    } finally {
      setShowTaskModal(false);
    }
  };

  const handleCreateStatus = async (name: string) => {
    try {
      await statusesApi.create({ name, teamId: selectedTeam || undefined });
      const { data } = await statusesApi.list(selectedTeam || undefined);
      setStatuses(data);
    } catch (err: any) {
      setGlobalError(err.message || "Failed to create status");
      throw err;
    }
  };

  const handleEditClick = (status: Status) => {
    setStatusToEdit(status);
    setShowEditStatusModal(true);
  };

  const handleUpdateStatus = async (id: string, newName: string) => {
    await statusesApi.update(id, {
      name: newName,
      teamId: selectedTeam || undefined,
    });
    const { data } = await statusesApi.list(selectedTeam || undefined);
    setStatuses(data);
  };

  const handleDeleteStatus = async (id: string) => {
    await statusesApi.delete(id);
    const { data } = await statusesApi.list(selectedTeam || undefined);
    setStatuses(data);
  };

  const filteredTasks = tasks
    .filter((t) => (selectedTeam ? t.teamId === selectedTeam : t.isPersonal))
    .filter((t) =>
      searchQuery
        ? t.title.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {globalError && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {globalError}
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBackToTeams}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" /> Back to Teams
          </button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {selectedTeam
              ? teams.find((t) => t.id === selectedTeam)?.name
              : "Personal"}{" "}
            Tasks
          </h2>
          <div className="flex space-x-4">
            {((isAdmin && !selectedTeam) || ((isAdmin || isMember) && selectedTeam)) && (
              <button
                onClick={() => setShowStatusModal(true)}
                className="flex items-center px-4 py-2 border rounded-md text-sm bg-white dark:bg-gray-700 hover:bg-gray-50"
              >
                <Settings className="h-5 w-5 mr-2" /> Add Status
              </button>
            )}
            <button
              onClick={() => {
                setSelectedTask(null);
                setTaskModalMode("create");
                setShowTaskModal(true);
              }}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <Plus className="h-5 w-5 mr-2" /> Add Task
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="relative mb-6 max-w-lg">
            <Search className="absolute inset-y-0 left-0 pl-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by title..."
              className="w-full pl-10 pr-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statuses.map((statusCol) => (
              <div
                key={statusCol.id}
                className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md"
              >
                <div className="flex items-center mb-4 space-x-2">
                  {getStatusIcon(statusCol.name)}
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {statusCol.name}
                  </h3>
                  {(isAdmin || isMember) && (
                    <button
                      onClick={() => handleEditClick(statusCol)}
                      className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {filteredTasks
                    .filter((t) => t.status?.id === statusCol.id)
                    .map((task) => (
                      <div
                        key={task.id}
                        onClick={() => {
                          setSelectedTask(task);
                          setTaskModalMode("edit");
                          setShowTaskModal(true);
                        }}
                        className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm hover:shadow-md cursor-pointer"
                      >
                        <p
                          className={`font-medium dark:text-white ${
                            statusCol.name.toLowerCase().includes("done")
                              ? "line-through"
                              : ""
                          }`}
                        >
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                          {task.dueDate && (
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                          <span className="flex items-center">
                            <UserIcon className="h-4 w-4 mr-1" />
                            {teamMembers.find(
                              (m) => m.userId === task.assignedToUserId
                            )?.userDetails?.username || "Unassigned"}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <TaskModal
          task={selectedTask}
          isOpen={showTaskModal}
          onClose={() => setShowTaskModal(false)}
          onCreate={handleCreateTask}
          onUpdate={handleUpdateTask}
          onDelete={taskModalMode === "edit" ? handleDeleteTask : undefined}
          mode={taskModalMode}
          statuses={statuses}
          teamMembers={teamMembers}
        />

        <StatusModal
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          onSave={handleCreateStatus}
          existingStatuses={statuses}
        />

        <EditStatusModal
          status={statusToEdit}
          isOpen={showEditStatusModal}
          onClose={() => setShowEditStatusModal(false)}
          onUpdate={handleUpdateStatus}
          onDelete={handleDeleteStatus}
          existingStatuses={statuses}
        />
      </main>
    </div>
  );
}
