import { Grid3x3, Search, Split, Trophy, Award, BookOpen, ArrowLeft, Sparkles, CheckCircle2, Circle } from 'lucide-react';
import type { Page } from '@/lib/nav';
import { useProgress, BADGES } from '@/lib/progress';
import { toPersianDigits as toFa } from '@/lib/math';
import type { IconType } from '@/lib/icons';

interface Props {
  onNavigate: (p: Page) => void;
}

const ACTIVITIES: {
  id: Page;
  title: string;
  description: string;
  icon: string;
  color: string;
  order: string;
}[] = [
  {
    id: 'sieve',
    title: 'غربال اراتستن',
    description: 'به‌صورت تعاملی مضرب‌های اعداد ۱ تا ۱۰۰ را حذف کن و اعداد اول را کشف کن.',
    icon: 'Grid3x3',
    color: 'from-brand-500 to-brand-700',
    order: '۱',
  },
  {
    id: 'identify',
    title: 'اول یا مرکب؟',
    description: 'در یک بازی سریع، اعداد اول و مرکب را تشخیص بده و توضیح پاسخ را بخوان.',
    icon: 'Search',
    color: 'from-accent-500 to-accent-700',
    order: '۲',
  },
  {
    id: 'factorize',
    title: 'تجزیه به عوامل اول',
    description: 'اعداد را به ضرب عوامل اول تجزیه کن و پاسخ خود را به‌صورت خودکار بررسی کن.',
    icon: 'Split',
    color: 'from-amber-500 to-amber-600',
    order: '۳',
  },
  {
    id: 'challenge',
    title: 'چالش ترکیبی پایانی',
    description: 'پرسش‌هایی درباره اعداد اول، مرکب، شمارنده‌ها و تجزیه؛ همه چیز در یک چالش.',
    icon: 'Trophy',
    color: 'from-rose-500 to-rose-700',
    order: '۴',
  },
];

const ICONS: Record<string, IconType> = {
  Grid3x3,
  Search,
  Split,
  Trophy,
  Award,
  BookOpen,
};

export default function HomePage({ onNavigate }: Props) {
  const progress = useProgress();
  const earnedCount = BADGES.filter((b) => b.condition(progress)).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-800/80 via-slate-900 to-slate-900 p-8 sm:p-12">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="absolute -left-6 top-1/2 h-2 w-2 animate-float-slow rounded-full bg-amber-400 shadow-glow" />

        <div className="relative">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            فصل دوم ریاضی پایه هشتم
          </div>
          <h1 className="max-w-2xl text-3xl font-extrabold leading-tight text-white sm:text-5xl">
            آزمایشگاه تعاملی <span className="bg-gradient-to-l from-brand-300 to-accent-300 bg-clip-text text-transparent">عددهای اول</span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
            یادگیری اکتشافی، تمرین تعاملی و ارزشیابی تکوینی؛ اعداد اول و مرکب را کشف کن، غربال اراتستن را با دست خودت بساز و مهارت‌هایت را در چالش پایانی محک بزن.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('sieve')}
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-l from-brand-500 to-accent-500 px-6 py-3 text-sm font-bold text-white shadow-glow transition hover:scale-[1.03] active:scale-95"
            >
              شروع یادگیری
              <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
            </button>
            <button
              onClick={() => onNavigate('progress')}
              className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              <Award className="h-4 w-4" />
              نمایش پیشرفت
            </button>
          </div>

          {/* Quick stats */}
          <div className="mt-10 grid grid-cols-3 gap-3 sm:max-w-md">
            <StatCard label="امتیاز کل" value={toFa(progress.totalPoints)} icon="Award" />
            <StatCard
              label="فعالیت‌های کامل‌شده"
              value={`${toFa(Object.values(progress.activities).filter((a) => a.completed).length)} از ${toFa(4)}`}
              icon="CheckCircle2"
            />
            <StatCard label="نشان‌ها" value={`${toFa(earnedCount)} از ${toFa(BADGES.length)}`} icon="Sparkles" />
          </div>
        </div>
      </section>

      {/* Learning path */}
      <section className="mt-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white sm:text-2xl">مسیر یادگیری</h2>
            <p className="mt-1 text-sm text-slate-400">چهار فعالیت متوالی؛ هر کدام روی قبلی بنا می‌شود.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {ACTIVITIES.map((a, i) => {
            const Icon = ICONS[a.icon];
            const activityKey = a.id as keyof typeof progress.activities;
            const act = progress.activities[activityKey];
            const done = act?.completed;
            return (
              <button
                key={a.id}
                onClick={() => onNavigate(a.id)}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-800/50 p-5 text-right transition hover:border-white/20 hover:bg-slate-800"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className={`absolute -left-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${a.color} opacity-20 blur-2xl transition group-hover:opacity-40`} />
                <div className="relative flex items-start gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${a.color} text-white shadow-lg`}>
                    <Icon className="h-6 w-6" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">فعالیت {a.order}</span>
                      {done ? (
                        <span className="flex items-center gap-1 rounded-full bg-accent-500/15 px-2 py-0.5 text-[10px] font-bold text-accent-300">
                          <CheckCircle2 className="h-3 w-3" />
                          کامل شد
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded-full bg-slate-700/50 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                          <Circle className="h-3 w-3" />
                          ادامه دارد
                        </span>
                      )}
                    </div>
                    <h3 className="mt-1 text-lg font-bold text-white">{a.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-400">{a.description}</p>
                  </div>
                  <ArrowLeft className="h-5 w-5 shrink-0 text-slate-500 transition group-hover:-translate-x-1 group-hover:text-white" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Teacher + about */}
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <button
          onClick={() => onNavigate('teacher')}
          className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-800/50 p-5 text-right transition hover:border-white/20 hover:bg-slate-800"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-lg">
            <BookOpen className="h-6 w-6" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">راهنمای معلم</h3>
            <p className="mt-1 text-sm text-slate-400">چگونگی استفاده از این فعالیت‌ها در کلاس درس ریاضی.</p>
          </div>
          <ArrowLeft className="h-5 w-5 text-slate-500 transition group-hover:-translate-x-1 group-hover:text-white" />
        </button>

        <button
          onClick={() => onNavigate('progress')}
          className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-800/50 p-5 text-right transition hover:border-white/20 hover:bg-slate-800"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg">
            <Award className="h-6 w-6" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">پیشرفت و نشان‌ها</h3>
            <p className="mt-1 text-sm text-slate-400">عملکرد، امتیازها و نشان‌های کسب‌شده را ببین و از نو شروع کن.</p>
          </div>
          <ArrowLeft className="h-5 w-5 text-slate-500 transition group-hover:-translate-x-1 group-hover:text-white" />
        </button>
      </section>

      {/* Note about 1 */}
      <section className="mt-8 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-300">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-200">نکته مهم ریاضی</h3>
            <p className="mt-1 text-sm leading-relaxed text-amber-100/80">
              عدد ۱ نه اول است و نه مرکب. فقط عدد ۱ یک شمارنده دارد (خودش)، اما عدد اول دقیقاً دو شمارنده دارد: ۱ و خودش.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  const Icon = ICONS[icon] ?? Award;
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
      <Icon className="mx-auto mb-1 h-4 w-4 text-slate-400" />
      <div className="text-lg font-extrabold text-white">{value}</div>
      <div className="text-[11px] text-slate-400">{label}</div>
    </div>
  );
}
