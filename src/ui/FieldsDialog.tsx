import { useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { addPriorityOption, addTagOption, removePriorityOption, removeTagOption } from "../store/boardSlice";

export function FieldsDialog(props: { trigger: React.ReactNode }) {
  const dispatch = useDispatch();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const settings = useSelector((s: RootState) => s.board.settings);

  const [newPriority, setNewPriority] = useState("");
  const [newTag, setNewTag] = useState("");

  const canAddPriority = useMemo(() => newPriority.trim().length > 0, [newPriority]);
  const canAddTag = useMemo(() => newTag.trim().length > 0, [newTag]);

  function open() {
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  return (
    <>
      <span onClick={open} style={{ display: "inline-flex" }}>
        {props.trigger}
      </span>

      <dialog ref={dialogRef}>
        <div style={{ padding: 16, width: 520, maxWidth: "calc(100vw - 40px)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ fontWeight: 800 }}>Custom fields</div>
            <button className="ghostBtn" type="button" onClick={close}>
              Close
            </button>
          </div>

          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 12, background: "#fff" }}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Priorities</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  className="controlBtn"
                  style={{ flex: 1, textAlign: "left" }}
                  placeholder="Add priority"
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                />
                <button
                  className="viewBtn viewBtn--active"
                  style={{ width: "auto", padding: "10px 14px" }}
                  type="button"
                  disabled={!canAddPriority}
                  onClick={() => {
                    dispatch(addPriorityOption(newPriority));
                    setNewPriority("");
                  }}
                >
                  Add
                </button>
              </div>
              <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                {settings.priorities.map((p) => (
                  <div key={p} style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <div className="controlBtn" style={{ flex: 1, textAlign: "left" }}>
                      {p}
                    </div>
                    <button className="controlBtn" type="button" onClick={() => dispatch(removePriorityOption(p))}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 12, background: "#fff" }}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Tags</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  className="controlBtn"
                  style={{ flex: 1, textAlign: "left" }}
                  placeholder="Add tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                />
                <button
                  className="viewBtn viewBtn--active"
                  style={{ width: "auto", padding: "10px 14px" }}
                  type="button"
                  disabled={!canAddTag}
                  onClick={() => {
                    dispatch(addTagOption(newTag));
                    setNewTag("");
                  }}
                >
                  Add
                </button>
              </div>
              <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                {settings.tags.map((t) => (
                  <div key={t} style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <div className="controlBtn" style={{ flex: 1, textAlign: "left" }}>
                      {t}
                    </div>
                    <button className="controlBtn" type="button" onClick={() => dispatch(removeTagOption(t))}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}

