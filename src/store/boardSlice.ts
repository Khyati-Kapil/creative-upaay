import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Status = "todo" | "in_progress" | "done";
export type Priority = string;

export type Task = {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  comments: number;
  files: number;
  assignees: number;
  label?: "completed";
  tag: string | null;
  dueDate: string | null;
  remind: boolean;
  subtasks: Array<{ id: string; title: string; done: boolean }>;
  activity: Array<{ id: string; at: string; text: string }>;
};

type BoardState = {
  tasks: Task[];
  filters: { search: string; status: "all" | Status; priority: "all" | Priority };
  settings: { priorities: string[]; tags: string[] };
};

function nowIso() {
  return new Date().toISOString();
}

function id(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function log(task: Task, text: string) {
  task.activity.unshift({ id: id("act"), at: nowIso(), text });
}

const initialState: BoardState = {
  tasks: [
    {
      id: "t_1",
      title: "Brainstorming",
      description: "Brainstorming brings team members' diverse experience into play.",
      status: "todo",
      priority: "low",
      comments: 12,
      files: 0,
      assignees: 3,
      tag: null,
      dueDate: null,
      remind: false,
      subtasks: [],
      activity: [{ id: "act_1", at: nowIso(), text: "Seeded task" }]
    },
    {
      id: "t_2",
      title: "Research",
      description: "User research helps you to create an optimal product for users.",
      status: "todo",
      priority: "high",
      comments: 10,
      files: 3,
      assignees: 2,
      tag: null,
      dueDate: null,
      remind: false,
      subtasks: [],
      activity: [{ id: "act_2", at: nowIso(), text: "Seeded task" }]
    },
    {
      id: "t_3",
      title: "Wireframes",
      description: "Low fidelity wireframes include the most basic content and visuals.",
      status: "todo",
      priority: "high",
      comments: 2,
      files: 1,
      assignees: 2,
      tag: null,
      dueDate: null,
      remind: false,
      subtasks: [],
      activity: [{ id: "act_3", at: nowIso(), text: "Seeded task" }]
    },
    {
      id: "t_4",
      title: "Design System",
      description: "It just needs to adapt the UI from what you did before.",
      status: "done",
      priority: "low",
      label: "completed",
      comments: 12,
      files: 15,
      assignees: 2,
      tag: null,
      dueDate: null,
      remind: false,
      subtasks: [],
      activity: [{ id: "act_4", at: nowIso(), text: "Seeded task" }]
    },
    {
      id: "t_5",
      title: "Brainstorming",
      description: "Brainstorming brings team members' diverse experience into play.",
      status: "in_progress",
      priority: "low",
      comments: 12,
      files: 0,
      assignees: 3,
      tag: null,
      dueDate: null,
      remind: false,
      subtasks: [],
      activity: [{ id: "act_5", at: nowIso(), text: "Seeded task" }]
    },
    {
      id: "t_6",
      title: "Brainstorming",
      description: "Brainstorming brings team members' diverse experience into play.",
      status: "in_progress",
      priority: "low",
      comments: 12,
      files: 0,
      assignees: 3,
      tag: null,
      dueDate: null,
      remind: false,
      subtasks: [],
      activity: [{ id: "act_6", at: nowIso(), text: "Seeded task" }]
    },
    {
      id: "t_7",
      title: "Brainstorming",
      description: "Brainstorming brings team members' diverse experience into play.",
      status: "in_progress",
      priority: "low",
      comments: 12,
      files: 0,
      assignees: 3,
      tag: null,
      dueDate: null,
      remind: false,
      subtasks: [],
      activity: [{ id: "act_7", at: nowIso(), text: "Seeded task" }]
    },
    {
      id: "t_8",
      title: "Brainstorming",
      description: "Brainstorming brings team members' diverse experience into play.",
      status: "done",
      priority: "low",
      comments: 12,
      files: 0,
      assignees: 3,
      tag: null,
      dueDate: null,
      remind: false,
      subtasks: [],
      activity: [{ id: "act_8", at: nowIso(), text: "Seeded task" }]
    },
    {
      id: "t_9",
      title: "Research",
      description: "User research helps you to create an optimal product for users.",
      status: "todo",
      priority: "low",
      comments: 1,
      files: 0,
      assignees: 2,
      tag: null,
      dueDate: null,
      remind: false,
      subtasks: [],
      activity: [{ id: "act_9", at: nowIso(), text: "Seeded task" }]
    }
  ],
  filters: { search: "", status: "all", priority: "all" },
  settings: { priorities: ["low", "medium", "high"], tags: ["UI", "Backend", "Bug"] }
};

export const boardSlice = createSlice({
  name: "board",
  initialState,
  reducers: {
    addTask(
      state,
      action: PayloadAction<{
        title: string;
        description?: string;
        priority: Priority;
        status?: Status;
        dueDate?: string | null;
        remind?: boolean;
        tag?: string | null;
      }>
    ) {
      const title = action.payload.title.trim();
      if (!title) return;

      const task: Task = {
        id: id("t"),
        title,
        description: (action.payload.description ?? "").trim(),
        status: action.payload.status ?? "todo",
        priority: action.payload.priority,
        comments: 0,
        files: 0,
        assignees: 2,
        label: undefined,
        tag: action.payload.tag ?? null,
        dueDate: action.payload.dueDate ?? null,
        remind: action.payload.remind ?? false,
        subtasks: [],
        activity: []
      };
      log(task, "Created task");
      state.tasks.unshift(task);
    },

    deleteTask(state, action: PayloadAction<string>) {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload);
    },

    moveTask(state, action: PayloadAction<{ id: string; status: Status }>) {
      const t = state.tasks.find((x) => x.id === action.payload.id);
      if (!t) return;
      if (t.status === action.payload.status) return;
      t.status = action.payload.status;
      log(t, `Moved to ${action.payload.status}`);
    },

    moveTaskDnD(state, action: PayloadAction<{ id: string; toStatus: Status; overId: string | null }>) {
      const fromIndex = state.tasks.findIndex((t) => t.id === action.payload.id);
      if (fromIndex < 0) return;

      const [moved] = state.tasks.splice(fromIndex, 1);
      if (!moved) return;
      if (moved.status !== action.payload.toStatus) {
        moved.status = action.payload.toStatus;
        log(moved, `Moved to ${action.payload.toStatus}`);
      } else {
        log(moved, "Reordered task");
      }

      const overId = action.payload.overId;
      if (!overId) {
        state.tasks.push(moved);
        return;
      }

      const toIndex = state.tasks.findIndex((t) => t.id === overId);
      if (toIndex < 0) {
        const lastIndex = (() => {
          for (let i = state.tasks.length - 1; i >= 0; i--) {
            if (state.tasks[i]?.status === action.payload.toStatus) return i;
          }
          return -1;
        })();
        state.tasks.splice(lastIndex + 1, 0, moved);
        return;
      }

      state.tasks.splice(toIndex, 0, moved);
    },

    setDueDate(state, action: PayloadAction<{ id: string; dueDate: string | null }>) {
      const t = state.tasks.find((x) => x.id === action.payload.id);
      if (!t) return;
      t.dueDate = action.payload.dueDate;
      log(t, action.payload.dueDate ? "Set due date" : "Cleared due date");
    },

    setReminder(state, action: PayloadAction<{ id: string; remind: boolean }>) {
      const t = state.tasks.find((x) => x.id === action.payload.id);
      if (!t) return;
      t.remind = action.payload.remind;
      log(t, action.payload.remind ? "Enabled reminder" : "Disabled reminder");
    },

    setTag(state, action: PayloadAction<{ id: string; tag: string | null }>) {
      const t = state.tasks.find((x) => x.id === action.payload.id);
      if (!t) return;
      t.tag = action.payload.tag;
      log(t, action.payload.tag ? `Set tag ${action.payload.tag}` : "Cleared tag");
    },

    addSubtask(state, action: PayloadAction<{ id: string; title: string }>) {
      const t = state.tasks.find((x) => x.id === action.payload.id);
      if (!t) return;
      const title = action.payload.title.trim();
      if (!title) return;
      t.subtasks.unshift({ id: id("sub"), title, done: false });
      log(t, "Added subtask");
    },

    toggleSubtask(state, action: PayloadAction<{ id: string; subId: string }>) {
      const t = state.tasks.find((x) => x.id === action.payload.id);
      if (!t) return;
      const s = t.subtasks.find((x) => x.id === action.payload.subId);
      if (!s) return;
      s.done = !s.done;
      log(t, s.done ? "Completed subtask" : "Reopened subtask");
    },

    addPriorityOption(state, action: PayloadAction<string>) {
      const v = action.payload.trim();
      if (!v) return;
      if (state.settings.priorities.includes(v)) return;
      state.settings.priorities.push(v);
    },

    removePriorityOption(state, action: PayloadAction<string>) {
      state.settings.priorities = state.settings.priorities.filter((p) => p !== action.payload);
      if (state.settings.priorities.length === 0) state.settings.priorities = ["low"];
      for (const t of state.tasks) {
        if (!state.settings.priorities.includes(t.priority)) t.priority = state.settings.priorities[0] ?? "low";
      }
    },

    addTagOption(state, action: PayloadAction<string>) {
      const v = action.payload.trim();
      if (!v) return;
      if (state.settings.tags.includes(v)) return;
      state.settings.tags.push(v);
    },

    removeTagOption(state, action: PayloadAction<string>) {
      state.settings.tags = state.settings.tags.filter((t) => t !== action.payload);
      for (const task of state.tasks) {
        if (task.tag === action.payload) task.tag = null;
      }
    },

    setSearch(state, action: PayloadAction<string>) {
      state.filters.search = action.payload;
    },
    setFilterStatus(state, action: PayloadAction<BoardState["filters"]["status"]>) {
      state.filters.status = action.payload;
    },
    setFilterPriority(state, action: PayloadAction<BoardState["filters"]["priority"]>) {
      state.filters.priority = action.payload;
    },
    resetFilters(state) {
      state.filters = initialState.filters;
    }
  }
});

export const {
  addTask,
  deleteTask,
  moveTask,
  moveTaskDnD,
  setDueDate,
  setReminder,
  setTag,
  addSubtask,
  toggleSubtask,
  addPriorityOption,
  removePriorityOption,
  addTagOption,
  removeTagOption,
  setSearch,
  setFilterStatus,
  setFilterPriority,
  resetFilters
} = boardSlice.actions;

export const boardReducer = boardSlice.reducer;
