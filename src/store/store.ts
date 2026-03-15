import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { boardReducer } from "./boardSlice";
import { loadState, saveState } from "./storage";

function normalizePreloadedState(raw: any) {
  const defaults = {
    filters: { search: "", status: "all", priority: "all" },
    settings: { priorities: ["low", "medium", "high"], tags: ["UI", "Backend", "Bug"] }
  };

  const board = raw?.board ?? {};
  const filters = board.filters ?? {};
  const settings = board.settings ?? {};

  const priorities = Array.isArray(settings.priorities)
    ? settings.priorities.filter((p: any) => typeof p === "string" && p.trim()).map((p: string) => p.trim())
    : defaults.settings.priorities;
  const tags = Array.isArray(settings.tags)
    ? settings.tags.filter((t: any) => typeof t === "string" && t.trim()).map((t: string) => t.trim())
    : defaults.settings.tags;

  const tasks = Array.isArray(board.tasks) ? board.tasks : [];
  const now = new Date().toISOString();

  const normalizedTasks = tasks.map((t: any, idx: number) => {
    const activity = Array.isArray(t?.activity)
      ? t.activity.filter((a: any) => a && typeof a.text === "string" && typeof a.at === "string")
      : [];
    const safeActivity =
      activity.length > 0
        ? activity
        : [{ id: `act_migr_${Date.now()}_${idx}`, at: now, text: "Migrated task" }];

    return {
      id: typeof t?.id === "string" ? t.id : `t_migr_${Date.now()}_${idx}`,
      title: typeof t?.title === "string" ? t.title : "Untitled",
      description: typeof t?.description === "string" ? t.description : "",
      status: t?.status === "todo" || t?.status === "in_progress" || t?.status === "done" ? t.status : "todo",
      priority: typeof t?.priority === "string" && t.priority.trim() ? t.priority : priorities[0] ?? "low",
      comments: typeof t?.comments === "number" ? t.comments : 0,
      files: typeof t?.files === "number" ? t.files : 0,
      assignees: typeof t?.assignees === "number" ? t.assignees : 2,
      label: t?.label === "completed" ? "completed" : undefined,
      tag: typeof t?.tag === "string" && t.tag.trim() ? t.tag.trim() : null,
      dueDate: typeof t?.dueDate === "string" && t.dueDate ? t.dueDate : null,
      remind: typeof t?.remind === "boolean" ? t.remind : false,
      subtasks: Array.isArray(t?.subtasks)
        ? t.subtasks
            .filter((s: any) => s && typeof s.title === "string")
            .map((s: any, sidx: number) => ({
              id: typeof s.id === "string" ? s.id : `sub_migr_${Date.now()}_${idx}_${sidx}`,
              title: String(s.title),
              done: Boolean(s.done)
            }))
        : [],
      activity: safeActivity
    };
  });

  return {
    board: {
      tasks: normalizedTasks,
      filters: {
        search: typeof filters.search === "string" ? filters.search : defaults.filters.search,
        status:
          filters.status === "all" || filters.status === "todo" || filters.status === "in_progress" || filters.status === "done"
            ? filters.status
            : defaults.filters.status,
        priority: typeof filters.priority === "string" ? filters.priority : defaults.filters.priority
      },
      settings: { priorities, tags }
    }
  };
}

const preloadedState = normalizePreloadedState(loadState());

const rootReducer = combineReducers({ board: boardReducer });

export const store = configureStore({
  reducer: rootReducer,
  preloadedState
});

store.subscribe(() => {
  saveState(store.getState());
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
