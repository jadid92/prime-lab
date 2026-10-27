import { useEffect } from 'react';

export type Page = 'home' | 'sieve' | 'identify' | 'factorize' | 'challenge' | 'progress' | 'teacher';

export interface NavItem {
  id: Page;
  label: string;
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'خانه', icon: 'Home' },
  { id: 'sieve', label: 'غربال اعداد', icon: 'Grid3x3' },
  { id: 'identify', label: 'اول یا مرکب', icon: 'Search' },
  { id: 'factorize', label: 'تجزیه به عوامل اول', icon: 'Split' },
  { id: 'challenge', label: 'چالش پایانی', icon: 'Trophy' },
  { id: 'progress', label: 'پیشرفت من', icon: 'Award' },
  { id: 'teacher', label: 'راهنمای معلم', icon: 'BookOpen' },
];
