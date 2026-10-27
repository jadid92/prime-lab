import { useState, useEffect, useCallback } from 'react';
import { Search, RotateCcw, CheckCircle2, XCircle, Trophy, Timer, Sparkles } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { numberType, divisors, randomInt, shuffle, toPersianDigits } from '@/lib/math';
import { recordPlay, useProgress } from '@/lib/progress';

interface Question {
  n: number;
  options: ('prime' | 'composite' | 'one')[];
}

const TOTAL_QUESTIONS = 10;
const TIME_PER_Q = 12;

function makeQuestion(): Question {
  // ensure variety including 1 sometimes
  const n = Math.random() < 0.1 ? 1 : randomInt(2, 99);
  const correct = numberType(n);
  const optionSet: ('prime' | 'composite' | 'one')[] = ['prime', 'composite', 'one'];
  return { n, options: shuffle(optionSet) };
}

const OPTION_LABELS: Record<string, string> = {
  prime: 'عدد اول',
  composite: 'عدد مرکب',
  one: 'نه اول نه مرکب',
};

interface Props {
  onBack: () => void;
}

export default function IdentifyPage({ onBack }: Props) {
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [answered, setAnswered] = useState<null | 'prime' | 'composite' | 'one'>(null);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);
  const progress = useProgress();

  const q = questions[current];

  const startGame = useCallback(() => {
    setQuestions(Array.from({ length: TOTAL_QUESTIONS }, makeQuestion));
    setCurrent(0);
    setScore(0);
    setStreak(0);
    setAnswered(null);
    setFeedback(null);
    setFinished(false);
    setTimeLeft(TIME_PER_Q);
    setStarted(true);
  }, []);

  const nextQuestion = useCallback(() => {
    if (current + 1 >= TOTAL_QUESTIONS) {
      setFinished(true);
      recordPlay('identify', score);
    } else {
      setCurrent((c) => c + 1);
      setAnswered(null);
      setFeedback(null);
      setTimeLeft(TIME_PER_Q);
    }
  }, [current, score]);

  const answer = (choice: 'prime' | 'composite' | 'one') => {
    if (answered) return;
    const correct = numberType(q.n);
    if (choice === correct) {
      const bonus = streak >= 2 ? 2 : 0;
      const gained = 10 + bonus;
      setScore((s) => s + gained);
      setStreak((s) => s + 1);
      setFeedback({ type: 'ok', text: `درست! +${toPersianDigits(gained)} امتیاز${bonus ? ' (پادش streak)' : ''}` });
    } else {
      setStreak(0);
      const divs = divisors(q.n);
      setFeedback({
        type: 'err',
        text:
          correct === 'one'
            ? `عدد ۱ فقط یک شمارنده دارد (خودش)؛ پس نه اول است نه مرکب.`
            : correct === 'prime'
            ? `درست نیست. ${toPersianDigits(q.n)} فقط دو شمارنده دارد: ${toPersianDigits(divs.join(' و '))}؛ پس اول است.`
            : `درست نیست. ${toPersianDigits(q.n)} شمارنده‌هایش عبارت‌اند از: ${toPersianDigits(divs.join('، '))}؛ پس مرکب است.`,
      });
    }
    setAnswered(choice);
  };

  // Timer
  useEffect(() => {
    if (!started || finished || answered) return;
    if (timeLeft <= 0) {
      setStreak(0);
      setFeedback({ type: 'err', text: 'زمان تمام شد! به سؤال بعد برو.' });
      setAnswered('one'); // neutral so next button shows
      return;
    }
    const t = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, started, finished, answered]);

  if (!started) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <PageHeader
          title="اول یا مرکب؟"
          subtitle="بازی تشخیص اعداد اول و مرکب همراه با توضیح پاسخ."
          icon="Search"
          onBack={onBack}
          badge={progress.activities.identify.plays > 0 ? `بهترین: ${toPersianDigits(progress.activities.identify.best)}` : undefined}
        />
        <div className="rounded-2xl border border-white/10 bg-slate-800/50 p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500 to-accent-700 shadow-glowGreen">
            <Search className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">آماده‌ای؟</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-400">
            {toPersianDigits(TOTAL_QUESTIONS)} پرسش، هر کدام {toPersianDigits(TIME_PER_Q)} ثانیه وقت. برای هر پاسخ درست {toPersianDigits(10)} امتیاز می‌گیری و با زنجیره پاسخ‌های درست، پادش می‌گیری.
          </p>
          <ul className="mx-auto mt-6 max-w-md space-y-2 text-right text-sm text-slate-300">
            <li className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-accent-400" /> عدد اول: فقط دو شمارنده (۱ و خودش)</li>
            <li className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-amber-400" /> عدد مرکب: بیش از دو شمارنده</li>
            <li className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-slate-400" /> عدد ۱: نه اول و نه مرکب</li>
          </ul>
          <button
            onClick={startGame}
            className="mt-8 rounded-xl bg-gradient-to-l from-accent-500 to-accent-700 px-8 py-3 text-sm font-bold text-white shadow-glowGreen transition hover:scale-[1.03]"
          >
            شروع بازی
          </button>
        </div>
      </div>
    );
  }

  if (finished) {
    const passed = score >= 60;
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="animate-pop-in rounded-2xl border border-white/10 bg-slate-800/50 p-8 text-center">
          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${passed ? 'bg-accent-500/20' : 'bg-amber-500/20'}`}>
            <Trophy className={`h-8 w-8 ${passed ? 'text-accent-300' : 'text-amber-300'}`} />
          </div>
          <h2 className="text-2xl font-bold text-white">{passed ? 'آفرین!' : 'تمرین بیشتری لازم است'}</h2>
          <p className="mt-2 text-sm text-slate-400">امتیاز این دور: {toPersianDigits(score)}</p>
          <div className="mt-4 text-5xl font-extrabold text-white">{toPersianDigits(score)}</div>
          <div className="mt-2 text-sm text-slate-400">بهترین امتیاز شما: {toPersianDigits(Math.max(progress.activities.identify.best, score))}</div>
          <div className="mt-8 flex justify-center gap-3">
            <button onClick={startGame} className="flex items-center gap-2 rounded-xl bg-accent-500 px-6 py-3 text-sm font-bold text-white transition hover:scale-[1.03]">
              <RotateCcw className="h-4 w-4" /> بازی دوباره
            </button>
            <button onClick={onBack} className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10">
              بازگشت به خانه
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <PageHeader title="اول یا مرکب؟" subtitle="بازی تشخیص اعداد اول و مرکب" icon="Search" onBack={onBack} />

      {/* Progress bar */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex-1">
          <div className="h-2 overflow-hidden rounded-full bg-slate-700">
            <div className="h-full rounded-full bg-gradient-to-l from-accent-400 to-accent-600 transition-all" style={{ width: `${((current) / TOTAL_QUESTIONS) * 100}%` }} />
          </div>
        </div>
        <span className="text-sm font-bold text-slate-300">
          {toPersianDigits(current + 1)} / {toPersianDigits(TOTAL_QUESTIONS)}
        </span>
        <div className="flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-sm font-bold text-amber-300">
          <Trophy className="h-3.5 w-3.5" />
          {toPersianDigits(score)}
        </div>
        {streak >= 2 && (
          <div className="flex items-center gap-1.5 rounded-full bg-orange-500/15 px-3 py-1 text-xs font-bold text-orange-300">
            <Sparkles className="h-3 w-3" />
            زنجیره {toPersianDigits(streak)}
          </div>
        )}
      </div>

      {/* Timer */}
      <div className="mb-4 flex items-center justify-center gap-2 text-sm">
        <Timer className={`h-4 w-4 ${timeLeft <= 5 ? 'text-rose-400' : 'text-slate-400'}`} />
        <span className={timeLeft <= 5 ? 'font-bold text-rose-400' : 'text-slate-400'}>
          {toPersianDigits(timeLeft)} ثانیه
        </span>
      </div>

      {/* Question card */}
      {q && (
        <div key={current} className="animate-fade-in-up rounded-2xl border border-white/10 bg-slate-800/50 p-8 text-center">
          <p className="text-sm text-slate-400">عدد زیر را بررسی کن:</p>
          <div className="my-4 text-7xl font-extrabold text-white">{toPersianDigits(q.n)}</div>
          <p className="mb-6 text-sm text-slate-400">این عدد چیست؟</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {q.options.map((opt) => {
              const correct = numberType(q.n) === opt;
              const isChosen = answered === opt;
              return (
                <button
                  key={opt}
                  onClick={() => answer(opt)}
                  disabled={!!answered}
                  className={`relative rounded-xl border px-4 py-4 text-sm font-bold transition ${
                    !answered
                      ? 'border-white/10 bg-white/5 text-white hover:scale-[1.02] hover:border-accent-400/50 hover:bg-accent-500/10'
                      : correct
                      ? 'border-accent-500 bg-accent-500/20 text-accent-200'
                      : isChosen
                      ? 'border-rose-500 bg-rose-500/20 text-rose-200'
                      : 'border-white/5 bg-white/5 text-slate-500'
                  }`}
                >
                  {answered && correct && <CheckCircle2 className="absolute -top-2 -left-2 h-5 w-5 text-accent-400" />}
                  {answered && isChosen && !correct && <XCircle className="absolute -top-2 -left-2 h-5 w-5 text-rose-400" />}
                  {OPTION_LABELS[opt]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div className={`mt-4 animate-pop-in rounded-xl border px-4 py-3 text-sm font-medium ${feedback.type === 'ok' ? 'border-accent-500/30 bg-accent-500/10 text-accent-200' : 'border-rose-500/30 bg-rose-500/10 text-rose-200'}`}>
          {feedback.text}
        </div>
      )}

      {/* Next button */}
      {answered && (
        <div className="mt-6 text-center">
          <button onClick={nextQuestion} className="rounded-xl bg-gradient-to-l from-brand-500 to-accent-500 px-8 py-3 text-sm font-bold text-white shadow-glow transition hover:scale-[1.03]">
            {current + 1 >= TOTAL_QUESTIONS ? 'پایان و مشاهده نتیجه' : 'سؤال بعدی'}
          </button>
        </div>
      )}
    </div>
  );
}
