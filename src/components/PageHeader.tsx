import { Home, Grid3x3, Search, Split, Trophy, Award, BookOpen } from 'lucide-react';
import type { IconType } from '@/lib/icons';

const ICONS: Record<string, IconType> = {
  Home,
  Grid3x3,
  Search,
  Split,
  Trophy,
  Award,
  BookOpen,
};

interface Props {
  title: string;
  subtitle?: string;
  icon: string;
  onBack?: () => void;
  badge?: string;
}

export default function PageHeader({ title, subtitle, icon, onBack, badge }: Props) {
  const Icon = ICONS[icon] ?? Home;
  return (
    <div className="mb-8 animate-fade-in-up">
      {onBack && (
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-white"
        >
          <span className="text-base">›</span>
          بازگشت به خانه
        </button>
      )}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 shadow-glow">
          <Icon className="h-7 w-7 text-white" strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-400 sm:text-base">{subtitle}</p>}
        </div>
        {badge && (
          <div className="ms-auto hidden rounded-full bg-amber-500/15 px-4 py-2 text-sm font-bold text-amber-300 sm:block">
            {badge}
          </div>
        )}
      </div>
    </div>
  );
}
