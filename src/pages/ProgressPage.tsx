import { Award, RotateCcw, Trophy, Star, Medal, Target, Grid3x3, Split, Sparkles, CheckCircle2, Lock } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useProgress, BADGES, resetProgress, type ActivityId } from '@/lib/progress';
import { toPersianDigits } from '@/lib/math';
import type { IconType } from '@/lib/icons';

interface Props {
  onBack: () => void;
}

const ACTIVITY_META: Record<ActivityId, { title: string; icon: string }> = {
  sieve: { title: 'غربال اراتستن', icon: 'Grid3x3' },
  identify: { title: 'اول یا مرکب', icon: 'Target' },
  factorize: { title: 'تجزیه به عوامل اول', icon: 'Split' },
  challenge: { title: 'چالش پایانی', icon: 'Trophy' },
};

const BADGE_ICONS: Record<string, IconType> = {
  sparkles: Sparkles,
  grid: Grid3x3,
  target: Target,
  split: Split,
  trophy: Trophy,
  medal: Medal,
  star: Star,
};

export default function ProgressPage({ onBack }: Props) {
  const progress = useProgress();

  const handleReset = () => {
    if (window.confirm('آیا مطمئنی می‌خواهی همه پیشرفت و امتیازها را پاک کنی؟')) {
      resetProgress();
    }
  };

  const earned = BADGES.filter((b) => b.condition(progress));
  const locked = BADGES.filter((b) => !b.condition(progress));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <PageHeader title="پیشرفت من" subtitle="امتیاز، نشان‌ها و عملکرد در هر فعالیت." icon="Award" onBack={onBack} />

      {/* Total score */}
      <div className="mb-6 rounded-2xl border border-white/10 bg-gradient-to-br from-amber-500/10 to-slate-800/50 p-6 text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-300">
          <Trophy className="h-8 w-8" />
        </div>
        <div className="text-5xl font-extrabold text-white">{toPersianDigits(progress.totalPoints)}</div>
        <div className="mt-1 text-sm text-slate-400">مجموع امتیاز</div>
      </div>

      {/* Activity scores */}
      <h2 className="mb-4 text-lg font-bold text-white">عملکرد فعالیت‌ها</h2>
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        {(Object.keys(ACTIVITY_META) as ActivityId[]).map((id) => {
          const meta = ACTIVITY_META[id];
          const act = progress.activities[id];
          const Icon = meta.icon === 'Grid3x3' ? Grid3x3 : meta.icon === 'Target' ? Target : meta.icon === 'Split' ? Split : Trophy;
          return (
            <div key={id} className="rounded-2xl border border-white/10 bg-slate-800/50 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 text-white">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-white">{meta.title}</div>
                  <div className="text-xs text-slate-400">{toPersianDigits(act.plays)} بار انجام شده</div>
                </div>
                {act.completed && (
                  <div className="flex items-center gap-1 rounded-full bg-accent-500/15 px-2 py-1 text-[10px] font-bold text-accent-300">
                    <CheckCircle2 className="h-3 w-3" />
                    کامل شد
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-end justify-between">
                <span className="text-xs text-slate-400">بهترین امتیاز</span>
                <span className="text-2xl font-extrabold text-white">{toPersianDigits(act.best)}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-700">
                <div className="h-full rounded-full bg-gradient-to-l from-brand-400 to-accent-500 transition-all" style={{ width: `${Math.min(act.best, 100)}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Badges */}
      <h2 className="mb-4 text-lg font-bold text-white">نشان‌های پیشرفت</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {earned.map((b) => {
          const Icon = BADGE_ICONS[b.icon] ?? Sparkles;
          return (
            <div key={b.id} className="animate-pop-in rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/15 to-slate-800/50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">
                  <Icon className="h-6 w-6" strokeWidth={2} />
                </div>
                <div>
                  <div className="text-sm font-bold text-amber-100">{b.title}</div>
                  <div className="text-xs text-amber-100/70">{b.description}</div>
                </div>
              </div>
            </div>
          );
        })}
        {locked.map((b) => {
          const Icon = BADGE_ICONS[b.icon] ?? Sparkles;
          return (
            <div key={b.id} className="rounded-2xl border border-white/5 bg-slate-800/30 p-4 opacity-60">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-700/50 text-slate-500">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-400">{b.title}</div>
                  <div className="text-xs text-slate-500">{b.description}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {locked.length === 0 && (
        <div className="mt-4 rounded-2xl border border-accent-500/30 bg-accent-500/10 p-4 text-center text-sm font-bold text-accent-200">
          <Sparkles className="mx-auto mb-1 h-5 w-5" />
          تبریک! همه نشان‌ها را کسب کردی!
        </div>
      )}

      {/* Reset */}
      <div className="mt-8 text-center">
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 px-5 py-2.5 text-sm font-medium text-rose-300 transition hover:bg-rose-500/10"
        >
          <RotateCcw className="h-4 w-4" />
          شروع دوباره و پاک‌سازی پیشرفت
        </button>
      </div>
    </div>
  );
}
