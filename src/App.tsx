import { useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "./store/store";
import {
  deleteTask,
  moveTask,
  moveTaskDnD,
  resetFilters,
  setFilterPriority,
  setFilterStatus,
  setSearch,
  type Status
} from "./store/boardSlice";
import { Layout } from "./ui/Layout";
import { Sidebar } from "./ui/Sidebar";
import { Topbar } from "./ui/Topbar";
import { AddTaskDialog } from "./ui/AddTaskDialog";
import { CommentIcon, LinkIcon, PaperclipIcon, PencilIcon, PlusIcon } from "./ui/Icons";
import { Toast } from "./ui/Toast";
import { FieldsDialog } from "./ui/FieldsDialog";
import { TaskDetailsDialog } from "./ui/TaskDetailsDialog";
import "./figma.css";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const COLUMNS: Array<{ id: Status; label: string; color: "purple" | "orange" | "green" }> = [
  { id: "todo", label: "To Do", color: "purple" },
  { id: "in_progress", label: "On Progress", color: "orange" },
  { id: "done", label: "Done", color: "green" }
];

function includesText(haystack: string, needle: string) {
  if (!needle.trim()) return true;
  return haystack.toLowerCase().includes(needle.trim().toLowerCase());
}

function Tag(p: { text: string; tone: "low" | "high" | "completed" }) {
  return <div className={"tag tag--" + p.tone}>{p.text}</div>;
}

function CardMenu(p: {
  id: string;
  current: Status;
  onMove: (s: Status) => void;
  onDelete: () => void;
  onDetails: () => void;
}) {
  function closeMenu(target: HTMLElement) {
    (target.closest("details") as HTMLDetailsElement | null)?.removeAttribute("open");
  }

  return (
    <details
      style={{ position: "relative" }}
      onPointerDown={(e) => {
        e.stopPropagation();
      }}
    >
      <summary
        className="ghostBtn"
        aria-label="Card menu"
        onPointerDown={(e) => {
          e.stopPropagation();
        }}
      >
        <span className="kebab" aria-hidden="true">
          ⋯
        </span>
      </summary>
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 26,
          background: "white",
          border: "1px solid var(--line)",
          borderRadius: 12,
          boxShadow: "0 18px 40px rgba(0,0,0,.12)",
          padding: 8,
          minWidth: 160,
          zIndex: 120
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
        }}
      >
        <button
          className="controlBtn"
          style={{ width: "100%", justifyContent: "flex-start", display: "flex", padding: "8px 10px" }}
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            closeMenu(e.currentTarget);
            p.onDetails();
          }}
        >
          Details
        </button>
        <div style={{ height: 1, background: "var(--line)", margin: "8px 0" }} />
        <div style={{ color: "var(--muted)", fontSize: 12, fontWeight: 700, padding: "6px 8px" }}>Move to</div>
        {(["todo", "in_progress", "done"] as Status[]).map((s) => (
          <button
            key={s}
            className="controlBtn"
            style={{ width: "100%", justifyContent: "flex-start", display: "flex", padding: "8px 10px" }}
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              closeMenu(e.currentTarget);
              p.onMove(s);
            }}
            disabled={s === p.current}
          >
            {s === "todo" ? "To Do" : s === "in_progress" ? "On Progress" : "Done"}
          </button>
        ))}
        <div style={{ height: 1, background: "var(--line)", margin: "8px 0" }} />
        <button
          className="controlBtn"
          style={{
            width: "100%",
            justifyContent: "flex-start",
            display: "flex",
            padding: "8px 10px",
            borderColor: "#FCA5A5",
            color: "#B91C1C"
          }}
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            closeMenu(e.currentTarget);
            p.onDelete();
          }}
        >
          Delete
        </button>
      </div>
    </details>
  );
}

function SortableCard(props: {
  id: string;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: props.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1
  };

  return (
    <div className="taskWrap" ref={setNodeRef} style={style}>
      <div className="taskCard" {...attributes} {...listeners}>
        {props.children}
      </div>
    </div>
  );
}

function DroppableList(props: { id: Status; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id: props.id });
  return (
    <div className="cardList" ref={setNodeRef}>
      {props.children}
    </div>
  );
}

export default function App() {
  const dispatch = useDispatch();
  const { tasks, filters } = useSelector((s: RootState) => s.board);
  const settings = useSelector((s: RootState) => s.board.settings);
  const [toast, setToast] = useState<string | null>(null);
  const [view, setView] = useState<"board" | "list">("board");
  const [dayFilter, setDayFilter] = useState<"Today" | "This week" | "This month">("Today");
  const [activeNav, setActiveNav] = useState("Tasks");
  const [activeProject, setActiveProject] = useState("Mobile App");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [detailsTaskId, setDetailsTaskId] = useState<string | null>(null);
  const inviteDialogRef = useRef<HTMLDialogElement | null>(null);

  function showToast(message: string) {
    setToast(message);
  }

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Link copied");
    } catch {
      showToast("Could not copy link");
    }
  }

  const visible = useMemo(() => {
    return tasks.filter((t) => {
      if (filters.status !== "all" && t.status !== filters.status) return false;
      if (filters.priority !== "all" && t.priority !== filters.priority) return false;
      if (!includesText(t.title, filters.search) && !includesText(t.description, filters.search)) return false;
      return true;
    });
  }, [tasks, filters]);

  const byStatus = useMemo(() => {
    const map: Record<Status, typeof visible> = { todo: [], in_progress: [], done: [] };
    for (const t of visible) map[t.status].push(t);
    return map;
  }, [visible]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor)
  );

  function statusForTaskId(id: string): Status | null {
    const t = tasks.find((x) => x.id === id);
    return t ? t.status : null;
  }

  function onDragEnd(event: DragEndEvent) {
    const activeId = String(event.active.id);
    const overId = event.over?.id ? String(event.over.id) : null;
    if (!overId) return;

    const fromStatus = statusForTaskId(activeId);
    if (!fromStatus) return;

    const toStatus = (["todo", "in_progress", "done"] as const).includes(overId as any)
      ? (overId as Status)
      : statusForTaskId(overId);

    if (!toStatus) return;

    dispatch(moveTaskDnD({ id: activeId, toStatus, overId: (["todo", "in_progress", "done"] as const).includes(overId as any) ? null : overId }));
  }

  const reminderSummary = useMemo(() => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const soonWindow = startOfToday + 2 * 24 * 60 * 60 * 1000;

    let overdue = 0;
    let soon = 0;
    for (const t of tasks) {
      if (!t.remind || !t.dueDate) continue;
      const due = new Date(`${t.dueDate}T00:00:00`).getTime();
      if (Number.isNaN(due)) continue;
      if (due < startOfToday) overdue++;
      else if (due <= soonWindow) soon++;
    }
    return { overdue, soon };
  }, [tasks]);

  return (
    <Layout
      sidebar={
        <Sidebar
          activeNav={activeNav}
          onNavSelect={(label) => {
            setActiveNav(label);
            showToast(label);
          }}
          activeProject={activeProject}
          onProjectSelect={(label) => {
            setActiveProject(label);
            showToast(label);
          }}
          onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        />
      }
      topbar={
        <Topbar
          search={filters.search}
          onSearchChange={(v) => dispatch(setSearch(v))}
          onCalendar={() => showToast("Calendar")}
          onHelp={() => showToast("Help")}
          onNotifications={() => showToast("Notifications")}
        />
      }
      sidebarCollapsed={sidebarCollapsed}
    >
      <div className="boardHeader">
        <div className="boardTitleRow">
          <div className="boardTitle">{activeProject}</div>
          <button className="iconBtnSm" type="button" aria-label="Edit" onClick={() => showToast("Edit")}>
            <PencilIcon />
          </button>
          <button className="iconBtnSm" type="button" aria-label="Link" onClick={copyShareLink}>
            <LinkIcon />
          </button>
        </div>

        <div className="inviteRow">
          <button
            className="inviteBtn"
            type="button"
            onClick={() => {
              inviteDialogRef.current?.showModal();
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span aria-hidden="true" style={{ width: 18, height: 18, display: "inline-flex" }}>
                <PlusIcon size={18} />
              </span>
              Invite
            </span>
          </button>
          <div className="inviteAvatars" aria-hidden="true">
            <span className="ia" />
            <span className="ia" />
            <span className="ia" />
            <span className="ia" />
            <span className="iaMore">+2</span>
          </div>
        </div>
      </div>

      <div className="boardControls">
        <div className="leftControls">
          <details style={{ position: "relative" }}>
            <summary className="controlBtn">Filter ▾</summary>
            <div
              style={{
                position: "absolute",
                top: 48,
                left: 0,
                background: "#fff",
                border: "1px solid var(--line)",
                borderRadius: 14,
                padding: 12,
                boxShadow: "0 18px 40px rgba(0,0,0,.12)",
                minWidth: 260,
                zIndex: 20
              }}
            >
              <div style={{ display: "grid", gap: 10 }}>
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ color: "var(--muted)", fontSize: 12, fontWeight: 700 }}>Status</span>
                  <select
                    className="controlBtn"
                    value={filters.status}
                    onChange={(e) => dispatch(setFilterStatus(e.target.value as any))}
                  >
                    <option value="all">All</option>
                    <option value="todo">To Do</option>
                    <option value="in_progress">On Progress</option>
                    <option value="done">Done</option>
                  </select>
                </label>
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ color: "var(--muted)", fontSize: 12, fontWeight: 700 }}>Priority</span>
                  <select
                    className="controlBtn"
                    value={filters.priority}
                    onChange={(e) => dispatch(setFilterPriority(e.target.value as any))}
                  >
                    <option value="all">All</option>
                    {settings.priorities.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </label>
                <button className="controlBtn" type="button" onClick={() => dispatch(resetFilters())}>
                  Reset
                </button>
              </div>
            </div>
          </details>

          <details style={{ position: "relative" }}>
            <summary className="controlBtn">{dayFilter} ▾</summary>
            <div
              style={{
                position: "absolute",
                top: 48,
                left: 0,
                background: "#fff",
                border: "1px solid var(--line)",
                borderRadius: 14,
                padding: 8,
                boxShadow: "0 18px 40px rgba(0,0,0,.12)",
                minWidth: 180,
                zIndex: 20
              }}
            >
              {(["Today", "This week", "This month"] as const).map((opt) => (
                <button
                  key={opt}
                  className="controlBtn"
                  style={{ width: "100%", justifyContent: "flex-start", display: "flex", padding: "8px 10px" }}
                  type="button"
                  onClick={() => {
                    setDayFilter(opt);
                    showToast(opt);
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </details>
        </div>

        <div className="rightControls">
          <FieldsDialog
            trigger={
              <button className="controlBtn" type="button">
                Fields
              </button>
            }
          />
          <button className="controlBtn" type="button" onClick={copyShareLink}>
            Share
          </button>
          <div className="vSep" />
          <button
            className={"viewBtn" + (view === "list" ? " viewBtn--active" : "")}
            type="button"
            aria-label="List view"
            onClick={() => setView("list")}
          >
            ≡
          </button>
          <button
            className={"viewBtn" + (view === "board" ? " viewBtn--active" : "")}
            type="button"
            aria-label="Board view"
            onClick={() => setView("board")}
          >
            ▦
          </button>
        </div>
      </div>

      {reminderSummary.overdue || reminderSummary.soon ? (
        <div
          className="panel"
          style={{
            padding: 12,
            marginBottom: 14,
            background:
              reminderSummary.overdue > 0
                ? "rgba(253, 232, 232, 0.85)"
                : "rgba(255, 251, 235, 0.85)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
            <div style={{ fontWeight: 900 }}>
              {reminderSummary.overdue > 0
                ? `${reminderSummary.overdue} overdue task reminder${reminderSummary.overdue === 1 ? "" : "s"}`
                : `${reminderSummary.soon} task reminder${reminderSummary.soon === 1 ? "" : "s"} due soon`}
            </div>
            <button className="controlBtn" type="button" onClick={() => showToast("Open task details from the card menu")}>
              View
            </button>
          </div>
        </div>
      ) : null}

      {view === "list" ? (
        <div className="panel" style={{ padding: 14 }}>
          <div style={{ display: "grid", gap: 10 }}>
            {visible.map((t) => (
              <div
                key={t.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: 12,
                  border: "1px solid var(--line)",
                  borderRadius: 14,
                  background: "#fff"
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {t.title}
                  </div>
                  <div style={{ color: "var(--muted)", fontSize: 13 }}>{t.description}</div>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span
                    className={
                      "tag tag--" +
                      (t.label === "completed"
                        ? "completed"
                        : String(t.priority).toLowerCase() === "high"
                          ? "high"
                          : "low")
                    }
                  >
                    {t.label === "completed" ? "Completed" : t.priority}
                  </span>
                  <select
                    className="controlBtn"
                    value={t.status}
                    onChange={(e) => dispatch(moveTask({ id: t.id, status: e.target.value as Status }))}
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">On Progress</option>
                    <option value="done">Done</option>
                  </select>
                  <button className="controlBtn" type="button" onClick={() => dispatch(deleteTask(t.id))}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <div className="kanban">
            {COLUMNS.map((c) => (
              <div key={c.id} className="kanbanCol">
                <div className="colHeader">
                  <div className="colHead">
                    <div className="colHeadLeft">
                      <span
                        className={
                          "dot dot--" + (c.color === "green" ? "green" : c.color === "orange" ? "orange" : "purple")
                        }
                        aria-hidden="true"
                      />
                      <span className="colTitle">{c.label}</span>
                      <span className="countPill">{byStatus[c.id].length}</span>
                    </div>
                    <AddTaskDialog
                      defaultStatus={c.id}
                      trigger={
                        <button className={"addCircle addCircle--" + c.color} type="button" aria-label="Add task">
                          <PlusIcon size={18} />
                        </button>
                      }
                    />
                  </div>
                  <div className={"colBar colBar--" + c.color} />
                </div>

                <SortableContext items={byStatus[c.id].map((t) => t.id)} strategy={verticalListSortingStrategy}>
                  <DroppableList id={c.id}>
                    {byStatus[c.id].map((t) => (
                      <SortableCard key={t.id} id={t.id}>
                        {t.label === "completed" ? (
                          <Tag text="Completed" tone="completed" />
                        ) : String(t.priority).toLowerCase() === "high" ? (
                          <Tag text={t.priority} tone="high" />
                        ) : (
                          <Tag text={t.priority} tone="low" />
                        )}

                        <div className="cardTitleRow">
                          <div className="cardTitle">{t.title}</div>
                          <CardMenu
                            id={t.id}
                            current={t.status}
                            onMove={(s) => dispatch(moveTask({ id: t.id, status: s }))}
                            onDelete={() => dispatch(deleteTask(t.id))}
                            onDetails={() => setDetailsTaskId(t.id)}
                          />
                        </div>

                        <div className="cardDesc">{t.description}</div>

                        <div className="cardMid">
                          <div className="subLabel">
                            {t.subtasks.length
                              ? `Subtasks • ${t.subtasks.filter((s) => s.done).length}/${t.subtasks.length} done`
                              : "Subtasks"}
                          </div>
                          <button className="chevBtn" type="button" onClick={() => setDetailsTaskId(t.id)} aria-label="Open details">
                            <span aria-hidden="true">▾</span>
                          </button>
                        </div>

                        <div className="cardFooter">
                          <div className="avatars" aria-hidden="true">
                            {Array.from({ length: Math.max(1, Math.min(4, t.assignees)) }).map((_, i) => (
                              <span key={i} className="a" />
                            ))}
                          </div>
                          <div className="meta">
                            {t.dueDate ? <span className="metaItem">Due {t.dueDate}</span> : null}
                            {t.subtasks.length ? (
                              <span className="metaItem">
                                {t.subtasks.filter((s) => s.done).length}/{t.subtasks.length} subtasks
                              </span>
                            ) : null}
                            <span className="metaItem">
                              <CommentIcon />
                              {t.comments} comments
                            </span>
                            <span className="metaItem">
                              <PaperclipIcon />
                              {t.files} files
                            </span>
                          </div>
                        </div>

                      </SortableCard>
                    ))}
                  </DroppableList>
                </SortableContext>
              </div>
            ))}
          </div>
        </DndContext>
      )}

      <dialog ref={inviteDialogRef}>
        <div style={{ padding: 16, width: 420, maxWidth: "calc(100vw - 40px)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ fontWeight: 800 }}>Invite</div>
            <button className="ghostBtn" type="button" onClick={() => inviteDialogRef.current?.close()}>
              Close
            </button>
          </div>
          <div style={{ marginTop: 12, color: "var(--muted)", fontSize: 13, lineHeight: 1.4 }}>
            Copy an invite link and share it with your team.
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
            <input className="controlBtn" style={{ flex: 1, textAlign: "left" }} readOnly value={window.location.href} />
            <button className="viewBtn viewBtn--active" style={{ width: "auto", padding: "10px 14px" }} type="button" onClick={copyShareLink}>
              Copy
            </button>
          </div>
        </div>
      </dialog>

      {toast ? <Toast message={toast} onDone={() => setToast(null)} /> : null}
      {detailsTaskId ? <TaskDetailsDialog taskId={detailsTaskId} onClose={() => setDetailsTaskId(null)} /> : null}
    </Layout>
  );
}
