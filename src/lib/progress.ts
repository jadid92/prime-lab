import { useSyncExternalStore } from 'react';

// Progress stored in localStorage — no backend / no auth for v1

const STORAGE_KEY = 'prime-lab-progress-v1';

export type ActivityId = 'sieve' | 'identify' | 'factorize' | 'challenge';

export interface ActivityScore {
  best: number;
  plays: number;
  completed: boolean;
}

export interface ProgressState {
  totalPoints: number;
  activities: Record<ActivityId, ActivityScore>;
  badges: string[];
}

const DEFAULT_STATE: ProgressState = {
  totalPoints: 0,
  activities: {
    sieve: { best: 0, plays: 0, completed: false },
    identify: { best: 0, plays: 0, completed: false },
    factorize: { best: 0, plays: 0, completed: false },
    challenge: { best: 0, plays: 0, completed: false },
  },
  badges: [],
};

// Badge definitions
export interface BadgeDef {
  id: string;
  title: string;
  description: string;
  icon: string; // emoji-free; we map in UI
  condition: (s: ProgressState) => boolean;
}

export const BADGES: BadgeDef[] = [
  {
    id: 'first-steps',
    title: 'اولین گام‌ها',
    description: 'اولین امتیاز خود را کسب کن',
    icon: 'sparkles',
    condition: (s) => s.totalPoints >= 1,
  },
  {
    id: 'sieve-master',
    title: 'استاد غربال',
    description: 'غربال اراتستن را کامل کن',
    icon: 'grid',
    condition: (s) => s.activities.sieve.completed,
  },
  {
    id: 'prime-hunter',
    title: 'شکارچی اعداد اول',
    description: 'بازی تشخیص اعداد اول را با امتیاز بالا تمام کن',
    icon: 'target',
    condition: (s) => s.activities.identify.best >= 80,
  },
  {
    id: 'factor-pro',
    title: 'استاد تجزیه',
    description: 'در بازی تجزیه به عوامل اول امتیاز ۸۰ به بالا بگیر',
    icon: 'split',
    condition: (s) => s.activities.factorize.best >= 80,
  },
  {
    id: 'challenger',
    title: 'قهرمان چالش',
    description: 'چالش ترکیبی پایانی را با امتیاز کامل تمام کن',
    icon: 'trophy',
    condition: (s) => s.activities.challenge.best >= 90,
  },
  {
    id: 'all-complete',
    title: 'فصل به پایان!',
    description: 'همه فعالیت‌ها را کامل کن',
    icon: 'medal',
    condition: (s) =>
      s.activities.sieve.completed &&
      s.activities.identify.completed &&
      s.activities.factorize.completed &&
      s.activities.challenge.completed,
  },
  {
    id: 'points-500',
    title: 'پنج‌صد امتیاز',
    description: 'در مجموع ۵۰۰ امتیاز کسب کن',
    icon: 'star',
    condition: (s) => s.totalPoints >= 500,
  },
];

// Simple external store
let state: ProgressState = loadState();
const listeners = new Set<() => void>();

function loadState(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_STATE,
        ...parsed,
        activities: {
          ...DEFAULT_STATE.activities,
          ...(parsed.activities ?? {}),
        },
        badges: Array.isArray(parsed.badges) ? parsed.badges : [],
      };
    }
  } catch {
    // ignore
  }
  return structuredClone(DEFAULT_STATE);
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return state;
}

export function useProgress(): ProgressState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function recordPlay(activity: ActivityId, score: number) {
  state = { ...state };
  const prev = state.activities[activity];
  const newBest = Math.max(prev.best, score);
  state.activities = {
    ...state.activities,
    [activity]: {
      best: newBest,
      plays: prev.plays + 1,
      completed: prev.completed || score >= 60,
    },
  };
  state.totalPoints = state.totalPoints + score;
  state.badges = recomputeBadges(state);
  save();
  emit();
}

export function setCompleted(activity: ActivityId, score: number) {
  state = { ...state };
  const prev = state.activities[activity];
  state.activities = {
    ...state.activities,
    [activity]: {
      best: Math.max(prev.best, score),
      plays: prev.plays + 1,
      completed: true,
    },
  };
  state.totalPoints = state.totalPoints + score;
  state.badges = recomputeBadges(state);
  save();
  emit();
}

export function resetProgress() {
  state = structuredClone(DEFAULT_STATE);
  save();
  emit();
}

function recomputeBadges(s: ProgressState): string[] {
  return BADGES.filter((b) => b.condition(s)).map((b) => b.id);
}

export function earnedBadges(s: ProgressState): BadgeDef[] {
  return BADGES.filter((b) => b.condition(s));
}
