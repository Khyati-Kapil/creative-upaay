const KEY = "taskboard:v1";

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

export function saveState(state: unknown) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
  }
}
