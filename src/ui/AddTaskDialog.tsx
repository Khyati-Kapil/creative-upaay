import { useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addTask, type Priority, type Status } from "../store/boardSlice";
import type { RootState } from "../store/store";

export function AddTaskDialog(props: {
  onCreated?: () => void;
  trigger?: React.ReactNode;
  defaultStatus?: Status;
}) {
  const dispatch = useDispatch();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const settings = useSelector((s: RootState) => s.board.settings);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>(settings.priorities[0] ?? "low");
  const [tag, setTag] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [remind, setRemind] = useState(false);

  const canCreate = useMemo(() => title.trim().length > 0, [title]);

  function open() {
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  function create() {
    if (!canCreate) return;
    dispatch(
      addTask({
        title,
        description,
        priority,
        status: props.defaultStatus,
        tag: tag ? tag : null,
        dueDate: dueDate ? dueDate : null,
        remind
      })
    );
    setTitle("");
    setDescription("");
    setPriority(settings.priorities[0] ?? "low");
    setTag("");
    setDueDate("");
    setRemind(false);
    close();
    props.onCreated?.();
  }

  return (
    <>
      <span onClick={open} style={{ display: "inline-flex" }}>
        {props.trigger ?? (
          <button className="controlBtn" type="button">
            + Add Task
          </button>
        )}
      </span>

      <dialog ref={dialogRef}>
        <div style={{ padding: 16, width: 420, maxWidth: "calc(100vw - 40px)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ fontWeight: 800 }}>New task</div>
            <button className="ghostBtn" type="button" onClick={close}>
              ✕
            </button>
          </div>

          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ color: "var(--muted)", fontSize: 12, fontWeight: 600 }}>Title</span>
              <input
                className="controlBtn"
                style={{ textAlign: "left" }}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Brainstorming"
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ color: "var(--muted)", fontSize: 12, fontWeight: 600 }}>Priority</span>
              <select
                className="controlBtn"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                {settings.priorities.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ color: "var(--muted)", fontSize: 12, fontWeight: 600 }}>Tag</span>
              <select className="controlBtn" value={tag} onChange={(e) => setTag(e.target.value)}>
                <option value="">None</option>
                {settings.tags.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ color: "var(--muted)", fontSize: 12, fontWeight: 600 }}>Due date</span>
                <input
                  className="controlBtn"
                  style={{ textAlign: "left" }}
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </label>

              <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 24 }}>
                <input type="checkbox" checked={remind} onChange={(e) => setRemind(e.target.checked)} />
                <span style={{ color: "var(--muted)", fontSize: 13, fontWeight: 700 }}>Reminder</span>
              </label>
            </div>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ color: "var(--muted)", fontSize: 12, fontWeight: 600 }}>Description</span>
              <textarea
                className="controlBtn"
                style={{ textAlign: "left", minHeight: 90, resize: "vertical" }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional"
              />
            </label>
          </div>

          <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button className="controlBtn" type="button" onClick={close}>
              Cancel
            </button>
            <button
              className="viewBtn viewBtn--active"
              style={{ width: "auto", padding: "10px 14px", height: 42 }}
              type="button"
              onClick={create}
              disabled={!canCreate}
            >
              Create
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
