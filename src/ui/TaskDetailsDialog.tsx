import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { addSubtask, setDueDate, setReminder, setTag, toggleSubtask } from "../store/boardSlice";

export function TaskDetailsDialog(props: { taskId: string; onClose: () => void }) {
  const dispatch = useDispatch();
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  const task = useSelector((s: RootState) => s.board.tasks.find((t) => t.id === props.taskId));
  const settings = useSelector((s: RootState) => s.board.settings);

  const [newSubtask, setNewSubtask] = useState("");

  const dueDateValue = useMemo(() => task?.dueDate ?? "", [task?.dueDate]);

  useEffect(() => {
    if (!dialogRef.current?.open) dialogRef.current?.showModal();
  }, [props.taskId]);

  if (!task) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={() => {
        props.onClose();
      }}
    >
      <div style={{ padding: 16, width: 640, maxWidth: "calc(100vw - 40px)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "grid", gap: 4 }}>
            <div style={{ fontWeight: 900, fontSize: 18 }}>{task.title}</div>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>{task.description}</div>
          </div>
          <button
            className="ghostBtn"
            type="button"
            onClick={() => {
              dialogRef.current?.close();
            }}
          >
            Close
          </button>
        </div>

        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 12, background: "#fff" }}>
            <div style={{ fontWeight: 800, marginBottom: 10 }}>Due date and reminder</div>
            <div style={{ display: "grid", gap: 10 }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ color: "var(--muted)", fontSize: 12, fontWeight: 700 }}>Due date</span>
                <input
                  className="controlBtn"
                  style={{ textAlign: "left" }}
                  type="date"
                  value={dueDateValue}
                  onChange={(e) => dispatch(setDueDate({ id: task.id, dueDate: e.target.value || null }))}
                />
              </label>
              <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={task.remind}
                  onChange={(e) => dispatch(setReminder({ id: task.id, remind: e.target.checked }))}
                />
                <span style={{ color: "var(--muted)", fontSize: 13, fontWeight: 800 }}>Reminder</span>
              </label>
            </div>
          </div>

          <div style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 12, background: "#fff" }}>
            <div style={{ fontWeight: 800, marginBottom: 10 }}>Tag</div>
            <select
              className="controlBtn"
              value={task.tag ?? ""}
              onChange={(e) => dispatch(setTag({ id: task.id, tag: e.target.value ? e.target.value : null }))}
            >
              <option value="">None</option>
              {settings.tags.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 12, background: "#fff" }}>
            <div style={{ fontWeight: 800, marginBottom: 10 }}>Subtasks</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="controlBtn"
                style={{ flex: 1, textAlign: "left" }}
                placeholder="Add subtask"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
              />
              <button
                className="viewBtn viewBtn--active"
                style={{ width: "auto", padding: "10px 14px" }}
                type="button"
                disabled={!newSubtask.trim()}
                onClick={() => {
                  dispatch(addSubtask({ id: task.id, title: newSubtask }));
                  setNewSubtask("");
                }}
              >
                Add
              </button>
            </div>

            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
              {task.subtasks.map((s) => (
                <label
                  key={s.id}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    padding: "10px 12px",
                    border: "1px solid var(--line)",
                    borderRadius: 12
                  }}
                >
                  <input
                    type="checkbox"
                    checked={s.done}
                    onChange={() => dispatch(toggleSubtask({ id: task.id, subId: s.id }))}
                  />
                  <span style={{ fontWeight: 800, textDecoration: s.done ? "line-through" : "none" }}>{s.title}</span>
                </label>
              ))}
              {task.subtasks.length === 0 ? (
                <div style={{ color: "var(--muted)", fontSize: 13 }}>No subtasks yet</div>
              ) : null}
            </div>
          </div>

          <div style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 12, background: "#fff" }}>
            <div style={{ fontWeight: 800, marginBottom: 10 }}>Activity log</div>
            <div style={{ display: "grid", gap: 8, maxHeight: 280, overflow: "auto" }}>
              {task.activity.map((a) => (
                <div
                  key={a.id}
                  style={{
                    padding: "10px 12px",
                    border: "1px solid var(--line)",
                    borderRadius: 12,
                    background: "#fff"
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: 13 }}>{a.text}</div>
                  <div style={{ color: "var(--muted)", fontSize: 12 }}>{new Date(a.at).toLocaleString()}</div>
                </div>
              ))}
              {task.activity.length === 0 ? (
                <div style={{ color: "var(--muted)", fontSize: 13 }}>No activity yet</div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}
