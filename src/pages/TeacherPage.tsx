import { BookOpen, GraduationCap, Clock, Users, Target, Lightbulb, CheckSquare } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { toPersianDigits } from '@/lib/math';
import type { IconType } from '@/lib/icons';

interface Props {
  onBack: () => void;
}

const ACTIVITY_GUIDES = [
  {
    title: 'غربال اراتستن',
    icon: 'Grid',
    duration: '۲۰ تا ۲۵ دقیقه',
    group: 'همه‌کلاس / گروهی ۲ نفره',
    goal: 'کشف اعداد اول ۱ تا ۱۰۰ به روش اکتشافی',
    steps: [
      'ابتدا مفهوم مضرب را مرور کنید و یادآوری کنید عدد ۱ استثناست.',
      'دانش‌آموزان مراحل را به ترتیب انجام می‌دهند: حذف مضرب‌های ۲، سپس ۳، ۵ و ۷.',
      'پس از هر مرحله توضیح دهید چرا عدد بعدی «اول» است.',
      'در پایان تعداد اعداد اول (۲۵ تا) را با کلاس تأیید کنید.',
    ],
    tip: 'از دانش‌آموزان بخواهید قبل از کلیک پیش‌بینی کنند کدام خانه‌ها باید حذف شوند.',
  },
  {
    title: 'بازی اول یا مرکب؟',
    icon: 'Search',
    duration: '۱۵ دقیقه',
    group: 'فردی',
    goal: 'تشخیص سریع اعداد اول و مرکب با استدلال درباره شمارنده‌ها',
    steps: [
      'هر دانش‌آموز مستقل بازی می‌کند و امتیاز خود را می‌بیند.',
      'بعد از هر پاسخ، توضیح شمارنده‌ها نمایش داده می‌شود؛ روی این بخش مکث کنید.',
      'از دانش‌آموزان بخواهید برای دو پاسخ نادرست، استدلال درست را روی تخته بنویسند.',
    ],
    tip: 'محدودیت زمانی ۱۲ ثانیه برای تمرین سرعت recall طراحی شده است؛ برای دانش‌آموزان ضعیف‌تر می‌توانید با هم کار گروهی انجام دهید.',
  },
  {
    title: 'تجزیه به عوامل اول',
    icon: 'Split',
    duration: '۲۰ دقیقه',
    group: 'فردی',
    goal: 'تجزیه عدد به ضرب عوامل اول و درک فرایند گام‌به‌گام',
    steps: [
      'روش تجزیه متوالی را روی تخته مرور کنید (تقسیم بر کوچک‌ترین عامل اول).',
      'دانش‌آموزان با انتخاب پشت‌سرهم عوامل اول، حاصل ضرب را به عدد هدف می‌رسانند.',
      'دکمه راهنمایی برای دانش‌آموزان ضعیف‌تر مناسب است (با کسر امتیاز).',
      'پس از پایان، فرم توان‌دار (۲^۲ × ۳) را روی تخته نشان دهید.',
    ],
    tip: 'از دانش‌آموزان بخواهید تجزیه یک عدد را روی کاغذ بنویسند و در بازی همان را وارد کنند تا پیوند بین روش دستی و دیجیتال برقرار شود.',
  },
  {
    title: 'چالش ترکیبی پایانی',
    icon: 'Trophy',
    duration: '۲۰ تا ۲۵ دقیقه',
    group: 'فردی (ارزشیابی)',
    goal: 'ارزشیابی تکوینی مجموع مباحث فصل',
    steps: [
      'این چالش شامل ۸ پرسش متنوع است: دسته‌بندی، شمارش شمارنده، تجزیه و مقایسه.',
      'هر پاسخ درست ۱۰ امتیاز دارد و امتیاز کل در سیستم ذخیره می‌شود.',
      'می‌توانید به‌عنوان ارزشیابی تشخیصی یا تکوینی استفاده کنید.',
      'پس از پایان، نتایج را در صفحه «پیشرفت من» ببینید.',
    ],
    tip: 'اگر امتیاز کم است، به دانش‌آموز پیشنهاد دهید به فعالیت‌های قبلی برگردد. نشان‌ها مسیر یادگیری را نشان می‌دهند.',
  },
];

const ICON_MAP: Record<string, IconType> = {
  Grid: BookOpen,
  Search: BookOpen,
  Split: BookOpen,
  Trophy: BookOpen,
};

export default function TeacherPage({ onBack }: Props) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <PageHeader title="راهنمای معلم" subtitle="چگونگی استفاده از آزمایشگاه عددهای اول در کلاس درس." icon="BookOpen" onBack={onBack} />

      {/* Overview */}
      <div className="mb-6 rounded-2xl border border-brand-500/20 bg-brand-500/5 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-500/15 text-brand-300">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-brand-100">درباره این آزمایشگاه</h2>
            <p className="mt-1 text-sm leading-relaxed text-brand-100/80">
              این آزمایشگاه برای فصل دوم ریاضی پایه هشتم (عددهای اول) طراحی شده و چهار فعالیت متوالی را شامل می‌شود: کشف اکتشافی، تمرین تعاملی، تمرین تجزیه و ارزشیابی. همه داده‌ها در مرورگر دانش‌آموز ذخیره می‌شوند و نیازی به ورود یا حساب کاربری نیست. می‌توانید از آن در حالت ارائه روی پروژکتور یا روی تبلت/لپ‌تاپ دانش‌آموزان استفاده کنید.
            </p>
          </div>
        </div>
      </div>

      {/* How to use */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <InfoCard icon="Clock" title="زمان‌بندی" text="کل آزمایشگاه حدود ۸۰ دقیقه. هر فعالیت مستقل است و می‌توانید جداگانه استفاده کنید." />
        <InfoCard icon="Users" title="گروه‌بندی" text="غربال گروهی، بازی‌ها فردی. چالش پایانی مناسب ارزشیابی فردی است." />
        <InfoCard icon="Target" title="هدف" text="یادگیری اکتشافی + تمرین تعاملی + ارزشیابی تکوینی در یک مسیر." />
      </div>

      {/* Activity guides */}
      <h2 className="mb-4 text-lg font-bold text-white">راهنمای هر فعالیت</h2>
      <div className="space-y-4">
        {ACTIVITY_GUIDES.map((g, i) => {
          const Icon = ICON_MAP[g.icon] ?? BookOpen;
          return (
            <div key={i} className="rounded-2xl border border-white/10 bg-slate-800/50 p-5">
              <div className="flex flex-wrap items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 text-white">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-white">{toPersianDigits(i + 1)}. {g.title}</h3>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {g.duration}</span>
                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {g.group}</span>
                    <span className="flex items-center gap-1"><Target className="h-3.5 w-3.5" /> {g.goal}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-accent-200">
                  <CheckSquare className="h-3.5 w-3.5" /> مراحل پیشنهادی
                </div>
                <ul className="space-y-2">
                  {g.steps.map((s, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                <div className="flex items-start gap-2">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                  <p className="text-sm text-amber-100/90">{g.tip}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Assessment note */}
      <div className="mt-8 rounded-2xl border border-white/10 bg-slate-800/50 p-5">
        <h2 className="mb-2 text-base font-bold text-white">ارزشیابی و پیگیری</h2>
        <p className="text-sm leading-relaxed text-slate-300">
          صفحه «پیشرفت من» بهترین امتیاز هر فعالیت، تعداد دفعات تلاش و نشان‌های کسب‌شده را نمایش می‌دهد. این داده‌ها در مرورگر ذخیره می‌شوند و می‌توانید برای ارزشیابی تکوینی از آن‌ها استفاده کنید. امتیاز کامل هر فعالیت: غربال {toPersianDigits(100)}، بازی‌ها بر اساس عملکرد، و چالش {toPersianDigits(80)} حداکثر.
        </p>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, text }: { icon: string; title: string; text: string }) {
  const I: Record<string, IconType> = { Clock, Users, Target };
  const Icon = I[icon] ?? Target;
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-800/50 p-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4 text-brand-300" />
        <span className="text-sm font-bold text-white">{title}</span>
      </div>
      <p className="text-xs leading-relaxed text-slate-400">{text}</p>
    </div>
  );
}
