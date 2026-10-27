import { useState, useCallback } from 'react';
import { Split, RotateCcw, CheckCircle2, XCircle, Trophy, Sparkles, Lightbulb, Trash2, X } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { primeFactors, formatPrimeFactors, randomInt, toPersianDigits, isPrime, shuffle, FIRST_PRIMES_100 } from '@/lib/math';
import { recordPlay, useProgress } from '@/lib/progress';

const TOTAL_QUESTIONS = 8;

interface Props {
  onBack: () => void;
}

function getPrimeChoices(remaining: number): number[] {
  if (remaining <= 1) return [];
  const validPrimes = [...new Set(primeFactors(remaining))].sort((a, b) => a - b);
  const distractorPool = FIRST_PRIMES_100.filter((p) => !validPrimes.includes(p) && p < remaining);
  const distractors = shuffle(distractorPool).slice(0, 4);
  return shuffle([...validPrimes, ...distractors]);
}

export default function FactorizePage({ onBack }: Props) {
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [target, setTarget] = useState(0);
  const [picks, setPicks] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err' | 'info'; text: string } | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const progress = useProgress();

  const nextTarget = useCallback(() => {
    // pick a composite number between 12 and 120
    let n = randomInt(12, 120);
    while (isPrime(n)) n = randomInt(12, 120);
    return n;
  }, []);

  const startGame = useCallback(() => {
    setStarted(true);
    setCurrent(0);
    setScore(0);
    setFinished(false);
    setTarget(nextTarget());
    setPicks([]);
    setFeedback(null);
    setAnswered(false);
    setShowHint(false);
    setHintsUsed(0);
  }, [nextTarget]);

  const resetQuestion = () => {
    setPicks([]);
    setFeedback(null);
    setAnswered(false);
    setShowHint(false);
  };

  const currentProduct = picks.reduce((acc, p) => acc * p, 1);
  const remaining = target % currentProduct === 0 ? target / currentProduct : target;
  const choices = !answered ? getPrimeChoices(remaining) : [];

  const addFactor = (prime: number) => {
    if (answered) return;
    if (remaining % prime !== 0) {
      setFeedback({ type: 'err', text: `${toPersianDigits(prime)} عامل ${toPersianDigits(remaining)} نیست. عامل درست را انتخاب کن.` });
      return;
    }
    const newPicks = [...picks, prime];
    setPicks(newPicks);
    setFeedback(null);
    const product = newPicks.reduce((a, p) => a * p, 1);
    if (product === target) {
      const expected = primeFactors(target);
      const sortedPicks = [...newPicks].sort((a, b) => a - b);
      const sortedExpected = [...expected].sort((a, b) => a - b);
      const correct = sortedPicks.length === sortedExpected.length && sortedPicks.every((v, i) => v === sortedExpected[i]);
      if (correct) {
        const gained = 10 - hintsUsed * 2;
        const final = Math.max(gained, 4);
        setScore((s) => s + final);
        setFeedback({ type: 'ok', text: `درست! ${toPersianDigits(target)} = ${toPersianDigits(formatPrimeFactors(target))} (+${toPersianDigits(final)} امتیاز)` });
      } else {
        setFeedback({
          type: 'err',
          text: `حاصل ضرب درست است اما تجزیه کامل نیست. پاسخ صحیح: ${toPersianDigits(target)} = ${toPersianDigits(formatPrimeFactors(target))}.`,
        });
      }
      setAnswered(true);
    }
  };

  const removeFactor = (index: number) => {
    if (answered) return;
    setPicks((p) => p.filter((_, i) => i !== index));
  };

  const clearPicks = () => {
    if (answered) return;
    setPicks([]);
    setFeedback(null);
  };

  const giveHint = () => {
    if (answered) return;
    const expected = primeFactors(target);
    const productSoFar = picks.reduce((a, p) => a * p, 1);
    if (productSoFar === 0 || target % productSoFar !== 0) {
      setPicks([]);
      setFeedback({ type: 'info', text: `اولین عامل اول: ${toPersianDigits(expected[0])}. دکمه آن را انتخاب کن.` });
    } else {
      const remaining = target / productSoFar;
      if (remaining === 1) return;
      const nextFactor = primeFactors(remaining)[0];
      setFeedback({ type: 'info', text: `عامل اول بعدی: ${toPersianDigits(nextFactor)}` });
    }
    setHintsUsed((h) => h + 1);
    setShowHint(true);
  };

  const nextQuestion = () => {
    if (current + 1 >= TOTAL_QUESTIONS) {
      setFinished(true);
      recordPlay('factorize', score);
    } else {
      setCurrent((c) => c + 1);
      setTarget(nextTarget());
      setPicks([]);
      setFeedback(null);
      setAnswered(false);
      setShowHint(false);
      setHintsUsed(0);
    }
  };

  if (!started) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <PageHeader
          title="تجزیه به عوامل اول"
          subtitle="اعداد را به ضرب عوامل اول تجزیه کن و پاسخت را خودکار بررسی کن."
          icon="Split"
          onBack={onBack}
          badge={progress.activities.factorize.plays > 0 ? `بهترین: ${toPersianDigits(progress.activities.factorize.best)}` : undefined}
        />
        <div className="rounded-2xl border border-white/10 bg-slate-800/50 p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg">
            <Split className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">روش تجزیه به عوامل اول</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-400">
            هر عدد مرکب را می‌توان به‌صورت ضرب عدد‌های اول نوشت. مثلاً ۱۲ = ۲ × ۲ × ۳. در این بازی عددی به تو می‌دهیم و تو باید عوامل اولش را پشت سر هم انتخاب کنی تا حاصل ضرب مساوی همان عدد شود.
          </p>
          <div className="mx-auto mt-6 max-w-md rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-right text-sm text-amber-100">
            <div className="mb-1 flex items-center gap-2 font-bold text-amber-200"><Lightbulb className="h-4 w-4" /> مثال</div>
            ۳۶ = ۲ × ۲ × ۳ × ۳ = ۲^۲ × ۳^۲
          </div>
          <button onClick={startGame} className="mt-8 rounded-xl bg-gradient-to-l from-amber-500 to-amber-600 px-8 py-3 text-sm font-bold text-white transition hover:scale-[1.03]">
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
          <h2 className="text-2xl font-bold text-white">{passed ? 'عالی بود!' : 'ادامه بده'}</h2>
          <div className="mt-4 text-5xl font-extrabold text-white">{toPersianDigits(score)}</div>
          <p className="mt-2 text-sm text-slate-400">بهترین امتیاز شما: {toPersianDigits(Math.max(progress.activities.factorize.best, score))}</p>
          <div className="mt-8 flex justify-center gap-3">
            <button onClick={startGame} className="flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-white transition hover:scale-[1.03]">
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
      <PageHeader title="تجزیه به عوامل اول" subtitle="بازی تعاملی تجزیه عدد" icon="Split" onBack={onBack} />

      {/* Progress */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex-1">
          <div className="h-2 overflow-hidden rounded-full bg-slate-700">
            <div className="h-full rounded-full bg-gradient-to-l from-amber-400 to-amber-600 transition-all" style={{ width: `${(current / TOTAL_QUESTIONS) * 100}%` }} />
          </div>
        </div>
        <span className="text-sm font-bold text-slate-300">{toPersianDigits(current + 1)} / {toPersianDigits(TOTAL_QUESTIONS)}</span>
        <div className="flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-sm font-bold text-amber-300">
          <Trophy className="h-3.5 w-3.5" />
          {toPersianDigits(score)}
        </div>
      </div>

      {/* Target number */}
      <div className="animate-fade-in-up rounded-2xl border border-white/10 bg-slate-800/50 p-8 text-center">
        <p className="text-sm text-slate-400">عدد زیر را به عوامل اول تجزیه کن:</p>
        <div className="my-4 text-6xl font-extrabold text-white">{toPersianDigits(target)}</div>

        {/* Current expression */}
        <div className="mb-4 min-h-[3rem] rounded-xl border border-white/10 bg-slate-900/60 p-3">
          {picks.length === 0 ? (
            <span className="text-sm text-slate-500">عوامل اول را از پایین انتخاب کن…</span>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <span className="text-2xl font-bold text-white">{toPersianDigits(target)}</span>
              <span className="text-xl text-slate-400">=</span>
              {picks.map((p, i) => (
                <span key={i} className="inline-flex items-center gap-1">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-accent-500/15 px-2 py-1 text-lg font-bold text-accent-200">
                    {toPersianDigits(p)}
                    {!answered && (
                      <button onClick={() => removeFactor(i)} className="text-slate-400 hover:text-rose-400">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </span>
                  {i < picks.length - 1 && <span className="text-xl text-slate-500">×</span>}
                </span>
              ))}
              {currentProduct < target && !answered && (
                <span className="text-sm text-slate-500">
                  (حاصل: {toPersianDigits(currentProduct)}، باقی‌مانده: {toPersianDigits(target / currentProduct)})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Prime factor buttons */}
        {!answered && choices.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {choices.map((p) => (
              <button
                key={p}
                onClick={() => addFactor(p)}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-lg font-bold text-white transition hover:scale-105 hover:border-amber-400/50 hover:bg-amber-500/10"
              >
                {toPersianDigits(p)}
              </button>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {!answered && (
            <>
              <button onClick={clearPicks} className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10">
                <Trash2 className="h-4 w-4" /> پاک‌سازی
              </button>
              <button onClick={giveHint} className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-200 transition hover:bg-amber-500/20">
                <Lightbulb className="h-4 w-4" /> راهنمایی (−امتیاز)
              </button>
            </>
          )}
          {answered && (
            <button onClick={nextQuestion} className="rounded-xl bg-gradient-to-l from-brand-500 to-accent-500 px-8 py-3 text-sm font-bold text-white shadow-glow transition hover:scale-[1.03]">
              {current + 1 >= TOTAL_QUESTIONS ? 'پایان و مشاهده نتیجه' : 'سؤال بعدی'}
            </button>
          )}
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`mt-4 animate-pop-in rounded-xl border px-4 py-3 text-sm font-medium ${
          feedback.type === 'ok' ? 'border-accent-500/30 bg-accent-500/10 text-accent-200' :
          feedback.type === 'err' ? 'border-rose-500/30 bg-rose-500/10 text-rose-200' :
          'border-brand-500/30 bg-brand-500/10 text-brand-200'
        }`}>
          {feedback.text}
        </div>
      )}

      {/* Show full factorization when answered */}
      {answered && (
        <div className="mt-4 animate-fade-in rounded-2xl border border-white/10 bg-slate-800/50 p-4 text-center">
          <div className="mb-1 flex items-center justify-center gap-2 text-sm font-bold text-amber-200">
            <Sparkles className="h-4 w-4" /> تجزیه کامل
          </div>
          <div className="text-2xl font-bold text-white">
            {toPersianDigits(target)} = {toPersianDigits(formatPrimeFactors(target))}
          </div>
        </div>
      )}
    </div>
  );
}
