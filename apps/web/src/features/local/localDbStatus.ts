export type LocalDbStatusType = 'checking' | 'ready' | 'degraded' | 'unavailable';

interface LocalDbState {
  status: LocalDbStatusType;
  error: string | null;
}

let state: LocalDbState = { status: 'checking', error: null };
const listeners = new Set<(s: LocalDbState) => void>();

export function getLocalDbStatus(): LocalDbStatusType {
  return state.status;
}

export function setLocalDbStatus(status: LocalDbStatusType, error: string | null = null) {
  state = { status, error };
  listeners.forEach((fn) => fn(state));
}

export function subscribeLocalDbStatus(fn: (s: LocalDbState) => void): () => void {
  listeners.add(fn);
  fn(state);
  return () => {
    listeners.delete(fn);
  };
}
