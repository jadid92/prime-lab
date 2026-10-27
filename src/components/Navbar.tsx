import { useState, useEffect, useCallback } from 'react';
import { Home, Grid3x3, Search, Split, Trophy, Award, BookOpen, Menu, X, Calculator } from 'lucide-react';
import { NAV_ITEMS, type Page } from '@/lib/nav';
import { useProgress } from '@/lib/progress';
import { toPersianDigits } from '@/lib/math';
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
  current: Page;
  onNavigate: (p: Page) => void;
}

export default function Navbar({ current, onNavigate }: Props) {
  const [open, setOpen] = useState(false);
  const progress = useProgress();

  const handleNav = useCallback(
    (p: Page) => {
      onNavigate(p);
      setOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [onNavigate]
  );

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-900/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <button
          onClick={() => handleNav('home')}
          className="flex items-center gap-2 transition hover:opacity-80"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 shadow-glow">
            <Calculator className="h-6 w-6 text-white" strokeWidth={2} />
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-white">آزمایشگاه</div>
            <div className="text-xs text-slate-400">عددهای اول</div>
          </div>
        </button>

        <div className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => {
            const Icon = ICONS[item.icon] ?? Home;
            const active = current === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? 'bg-brand-500/20 text-brand-200 shadow-[inset_0_0_0_1px] shadow-brand-400/40'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1.5 text-sm font-bold text-amber-300 sm:flex">
            <Award className="h-4 w-4" />
            {toPersianDigits(progress.totalPoints)} امتیاز
          </div>
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-slate-200 lg:hidden"
            aria-label="منو"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="animate-fade-in lg:hidden">
          <div className="border-t border-white/10 bg-slate-900/95 px-4 py-3">
            <div className="mb-3 flex items-center justify-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-2 text-sm font-bold text-amber-300">
              <Award className="h-4 w-4" />
              مجموع امتیاز: {toPersianDigits(progress.totalPoints)}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {NAV_ITEMS.map((item) => {
                const Icon = ICONS[item.icon] ?? Home;
                const active = current === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                      active
                        ? 'bg-brand-500/20 text-brand-200'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
