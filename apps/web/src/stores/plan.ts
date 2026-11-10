import { create } from 'zustand';

type PlanState = {
  /** The plan day last viewed or added to; the Plan tab and the day picker start on it. */
  dayId: number | null;
  setDay: (dayId: number) => void;
};

export const usePlanStore = create<PlanState>()((set) => ({
  dayId: null,
  setDay: (dayId) => set({ dayId }),
}));
