import { create } from 'zustand';
import { Memorandum } from "./Memorandum.types";

export interface MemorandumState {
  memorandums: Memorandum[];
  initialized: boolean;
  setMemorandums: (memorandums: Memorandum[]) => void;
  reset: () => void;
}

export const useMemorandumStore = create<MemorandumState>((set) => ({
  memorandums: [],
  initialized: false,
  setMemorandums: (memorandums) => set({ memorandums, initialized: true }),
  reset: () => set({ memorandums: [], initialized: false }),
}));
