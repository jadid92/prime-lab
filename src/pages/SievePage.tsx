import { useState, useMemo, useCallback } from 'react';
import { Grid3x3, RotateCcw, CheckCircle2, Lightbulb, Sparkles, ChevronLeft, ChevronRight, Award } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { SIEVE_PRIMES, sieveMultiplesOf, isPrime, toPersianDigits } from '@/lib/math';
import { setCompleted, useProgress } from '@/lib/progress';

type CellState = 'active' | 'crossed' | 'prime';

interface Props {
  onBack: () => void;
}

export default function SievePage({ onBack }: Props) {
  // stepIndex: -1 = not started, 0..3 = sieving with 2,3,5,7, 4 = done
  const [stepIndex, setStepIndex] = useState(-1);
  const [removedSet, setRemovedSet] = useState<Set<number>>(new Set());
  const [primeSet, setPrimeSet] = useState<Set<number>>(new Set());
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err' | 'info'; text: string } | null>(null);
  const progress = useProgress();

  const currentPrime = stepIndex >= 0 && stepIndex < SIEVE_PRIMES.length ? SIEVE_PRIMES[stepIndex] : null;
  const expectedMultiples = useMemo(
    () => (currentPrime ? sieveMultiplesOf(currentPrime) : []),
    [currentPrime]
  );

  const allDone = stepIndex >= SIEVE_PRIMES.length;

  const cellState = useCallback(
    (n: number): CellState => {
      if (primeSet.has(n)) return 'prime';
      if (removedSet.has(n)) return 'crossed';
      return 'active';
    },
    [removedSet, primeSet]
  );

  const handleCellClick = (n: number) => {
    if (allDone) return;
    if (n === 1) {
      setFeedback({ type: 'info', text: 'عدد ۱ را بعداً کنار می‌گذاریم؛ فعلاً روی مضرب‌ها تمرکز کن.' });
      return;
    }
    if (primeSet.has(n) || n === currentPrime) {
      setFeedback({ type: 'err', text: `عدد ${toPersianDigits(n)} خودش اول است؛ نباید حذف شود. مضرب‌های بزرگ‌تر از آن را حذف کن.` });
      return;
    }
    if (removedSet.has(n)) {
      // undo
      const next = new Set(removedSet);
      next.delete(n);
      setRemovedSet(next);
      setFeedback({ type: 'info', text: `حذف عدد ${toPersianDigits(n)} برگردانده شد.` });
      return;
    }
    if (!currentPrime) {
      setFeedback({ type: 'info', text: 'ابتدا روی «شروع مرحله» بزن تا بدانی کدام مضرب‌ها را باید حذف کنی.' });
      return;
    }
    // Is n a multiple of currentPrime and > currentPrime?
    if (n % currentPrime === 0 && n > currentPrime) {
      const next = new Set(removedSet);
      next.add(n);
      setRemovedSet(next);
      setFeedback({ type: 'ok', text: `درست! ${toPersianDigits(n)} مضرب ${toPersianDigits(currentPrime)} است؛ حذف شد.` });
      checkStepComplete(next);
    } else {
      setFeedback({
        type: 'err',
        text: `${toPersianDigits(n)} مضرب ${toPersianDigits(currentPrime)} نیست. مضرب‌های ${toPersianDigits(currentPrime)} را حذف کن: ${toPersianDigits(expectedMultiples.join('، '))}`,
      });
    }
  };

  const checkStepComplete = (removed: Set<number>) => {
    if (!currentPrime) return;
    const allRemoved = expectedMultiples.every((m) => removed.has(m));
    if (allRemoved) {
      // mark this prime, move to next
      setFeedback({
        type: 'ok',
        text: `آفرین! همه مضرب‌های ${toPersianDigits(currentPrime)} حذف شدند. حالا خود ${toPersianDigits(currentPrime)} را به‌عنوان عدد اول علامت بزن.`,
      });
      setShowHint(true);
    }
  };

  const confirmPrime = () => {
    if (!currentPrime) return;
    const nextPrimes = new Set(primeSet);
    nextPrimes.add(currentPrime);
    setPrimeSet(nextPrimes);
    setFeedback({ type: 'ok', text: `عدد ${toPersianDigits(currentPrime)} اول است و ثبت شد.` });
    setShowHint(false);
    // advance
    const nextStep = stepIndex + 1;
    if (nextStep >= SIEVE_PRIMES.length) {
      // finalize: remaining active numbers (not 1, not removed) are primes
      const remaining = new Set<number>();
      for (let n = 2; n <= 100; n++) {
        if (!removedSet.has(n) && !nextPrimes.has(n)) remaining.add(n);
      }
      const finalPrimes = new Set([...nextPrimes, ...remaining]);
      setPrimeSet(finalPrimes);
      setStepIndex(nextStep);
      setFeedback({ type: 'ok', text: 'غربال کامل شد! همه اعداد اول ۱ تا ۱۰۰ پیدا شدند.' });
    } else {
      setStepIndex(nextStep);
    }
  };

  const startStep = () => {
    if (stepIndex < 0) {
      setStepIndex(0);
      setFeedback({ type: 'info', text: `مرحله ۱: مضرب‌های عدد ۲ را حذف کن (به‌جز خود ۲).` });
    }
  };

  const reset = () => {
    setStepIndex(-1);
    setRemovedSet(new Set());
    setPrimeSet(new Set());
    setShowHint(false);
    setFeedback(null);
  };

  const handleFinish = () => {
    const score = 100;
    setCompleted('sieve', score);
    setFeedback({ type: 'ok', text: 'عملکردت ثبت شد و امتیاز کامل گرفتی!' });
  };

  const primesFound = Array.from(primeSet).sort((a, b) => a - b);
  const countPrimes = primesFound.length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PageHeader
        title="غربال اراتستن"
        subtitle="به‌صورت تعاملی مضرب‌های اعداد ۱ تا ۱۰۰ را حذف کن و اعداد اول را کشف کن."
        icon="Grid3x3"
        onBack={onBack}
        badge={progress.activities.sieve.completed ? `بهترین: ${toPersianDigits(progress.activities.sieve.best)}` : undefined}
      />

      {/* Instructions panel */}
      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-slate-800/50 p-4 lg:col-span-2">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-brand-200">
            <Lightbulb className="h-4 w-4" />
            راهنمای مرحله
          </div>
          {stepIndex < 0 ? (
            <p className="text-sm leading-relaxed text-slate-300">
              روش غربال اراتستن: از کوچک‌ترین عدد شروع می‌کنیم. اول عدد ۲ را به‌عنوان عدد اول نگه می‌داریم، سپس همه مضرب‌های ۲ را حذف می‌کنیم. بعد عدد بعدی که حذف نشده (یعنی ۳) اول است و مضرب‌هایش را حذف می‌کنیم. همین کار را برای ۵ و ۷ تکرار می‌کنیم. وقتی به عددی رسیدیم که توانش از ۱۰۰ بیشتر شد، همه اعداد باقی‌مانده اول هستند.
            </p>
          ) : currentPrime ? (
            <p className="text-sm leading-relaxed text-slate-300">
              مرحله {toPersianDigits(stepIndex + 1)} از {toPersianDigits(SIEVE_PRIMES.length)}: روی خانه‌های مضرب{' '}
              <span className="font-bold text-amber-300">{toPersianDigits(currentPrime)}</span> (بزرگ‌تر از خودش) کلیک کن تا حذف شوند. وقتی همه حذف شدند، دکمه «تأیید عدد اول» را بزن.
            </p>
          ) : (
            <p className="text-sm leading-relaxed text-accent-300">
              غربال کامل شد! اعداد سبزرنگ، اعداد اول هستند.
            </p>
          )}
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-800/50 p-4">
          <div className="mb-2 text-sm font-bold text-amber-200">وضعیت</div>
          <div className="space-y-2 text-sm text-slate-300">
            <div className="flex justify-between">
              <span>اعداد اول یافت‌شده:</span>
              <span className="font-bold text-accent-300">{toPersianDigits(countPrimes)}</span>
            </div>
            <div className="flex justify-between">
              <span>اعداد حذف‌شده:</span>
              <span className="font-bold text-rose-300">{toPersianDigits(removedSet.size)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {stepIndex < 0 && (
          <button
            onClick={startStep}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-l from-brand-500 to-accent-500 px-5 py-2.5 text-sm font-bold text-white shadow-glow transition hover:scale-[1.03]"
          >
            <Sparkles className="h-4 w-4" />
            شروع مرحله ۱
          </button>
        )}
        {currentPrime && (
          <>
            <button
              onClick={confirmPrime}
              disabled={!showHint && !expectedMultiples.every((m) => removedSet.has(m))}
              className="flex items-center gap-2 rounded-xl bg-accent-500 px-5 py-2.5 text-sm font-bold text-white transition enabled:hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <CheckCircle2 className="h-4 w-4" />
              تأیید عدد {toPersianDigits(currentPrime)} به‌عنوان اول
            </button>
            <span className="text-xs text-slate-400">
              مضرب‌های باقی‌مانده: {toPersianDigits(expectedMultiples.filter((m) => !removedSet.has(m)).join('، ') || 'هیچ')}
            </span>
          </>
        )}
        {allDone && (
          <button
            onClick={handleFinish}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-l from-accent-500 to-accent-700 px-5 py-2.5 text-sm font-bold text-white shadow-glowGreen transition hover:scale-[1.03]"
          >
            <Award className="h-4 w-4" />
            ثبت امتیاز کامل
          </button>
        )}
        <button
          onClick={reset}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10"
        >
          <RotateCcw className="h-4 w-4" />
          شروع دوباره
        </button>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`mb-4 animate-pop-in rounded-xl border px-4 py-3 text-sm font-medium ${
            feedback.type === 'ok'
              ? 'border-accent-500/30 bg-accent-500/10 text-accent-200'
              : feedback.type === 'err'
              ? 'border-rose-500/30 bg-rose-500/10 text-rose-200'
              : 'border-brand-500/30 bg-brand-500/10 text-brand-200'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Sieve grid */}
      <div className="overflow-x-auto pb-2">
        <div className="mx-auto grid min-w-max grid-cols-10 gap-1.5">
          {Array.from({ length: 100 }, (_, i) => i + 1).map((n) => {
            const st = cellState(n);
            const isCurrent = currentPrime === n;
            const isExpectedMultiple = currentPrime !== null && n % currentPrime === 0 && n > currentPrime;
            return (
              <button
                key={n}
                onClick={() => handleCellClick(n)}
                className={`relative flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold transition sm:h-11 sm:w-11 sm:text-sm ${
                  st === 'prime'
                    ? 'bg-accent-500 text-white shadow-glowGreen'
                    : st === 'crossed'
                    ? 'bg-rose-950/60 text-rose-400/60 line-through'
                    : n === 1
                    ? 'bg-slate-700/40 text-slate-500'
                    : isCurrent
                    ? 'bg-amber-500 text-white shadow-glow ring-2 ring-amber-300'
                    : isExpectedMultiple && stepIndex >= 0 && !allDone
                    ? 'bg-slate-700 text-slate-200 ring-1 ring-amber-500/30 hover:bg-amber-500/20 hover:text-amber-200'
                    : 'bg-slate-700/70 text-slate-200 hover:bg-slate-600'
                }`}
              >
                {st === 'crossed' ? (
                  <span className="line-through">{toPersianDigits(n)}</span>
                ) : (
                  toPersianDigits(n)
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">
        <Legend color="bg-accent-500" label="عدد اول" />
        <Legend color="bg-rose-950/60 ring-1 ring-rose-500/40" label="حذف‌شده (مضرب)" />
        <Legend color="bg-amber-500" label="عدد جاری" />
        <Legend color="bg-slate-700/40" label="۱ (نه اول نه مرکب)" />
      </div>

      {/* Primes found list */}
      {countPrimes > 0 && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-slate-800/50 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-accent-200">
            <CheckCircle2 className="h-4 w-4" />
            اعداد اول کشف‌شده ({toPersianDigits(countPrimes)} عدد)
          </div>
          <div className="flex flex-wrap gap-1.5">
            {primesFound.map((p) => (
              <span
                key={p}
                className="animate-pop-in rounded-lg bg-accent-500/15 px-2.5 py-1 text-sm font-bold text-accent-200"
              >
                {toPersianDigits(p)}
              </span>
            ))}
          </div>
          {countPrimes === 25 && (
            <p className="mt-3 text-sm text-accent-300">
              درست است! بین ۱ تا ۱۰۰ دقیقاً {toPersianDigits(25)} عدد اول وجود دارد.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`h-4 w-4 rounded ${color}`} />
      <span>{label}</span>
    </div>
  );
}
