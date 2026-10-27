import { useState, useCallback } from 'react';
import { Trophy, RotateCcw, CheckCircle2, XCircle, Sparkles, ListOrdered } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { isPrime, isComposite, numberType, divisors, countDivisors, primeFactors, formatPrimeFactors, randomInt, shuffle, toPersianDigits } from '@/lib/math';
import { recordPlay, useProgress } from '@/lib/progress';

type QType = 'classify' | 'count-divisors' | 'factorize' | 'pick-prime-between' | 'which-has-more-divisors';

interface MCQuestion {
  type: 'mc';
  qtype: QType;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface TextInputQuestion {
  type: 'text';
  qtype: QType;
  prompt: string;
  answer: string; // normalized answer string
  acceptable: string[]; // alternative accepted answers
  explanation: string;
}

type Question = MCQuestion | TextInputQuestion;

function toNorm(s: string): string {
  return s.replace(/\s/g, '').replace(/[×*]/g, '×').replace(/[xX]/g, '×');
}

function makeQuestions(): Question[] {
  const qs: Question[] = [];

  // 1. classify (mc)
  {
    const n = randomInt(2, 99);
    const t = numberType(n);
    const label = t === 'prime' ? 'عدد اول' : t === 'composite' ? 'عدد مرکب' : 'نه اول نه مرکب';
    const opts = shuffle([
      'عدد اول',
      'عدد مرکب',
      'نه اول نه مرکب',
    ]);
    qs.push({
      type: 'mc',
      qtype: 'classify',
      prompt: `عدد ${toPersianDigits(n)} را دسته‌بندی کن.`,
      options: opts,
      correctIndex: opts.indexOf(label),
      explanation: t === 'prime'
        ? `${toPersianDigits(n)} فقط دو شمارنده دارد (۱ و خودش)؛ پس اول است.`
        : t === 'composite'
        ? `${toPersianDigits(n)} بیش از دو شمارنده دارد؛ پس مرکب است.`
        : `عدد ۱ فقط یک شمارنده دارد؛ پس نه اول و نه مرکب است.`,
    });
  }

  // 2. classify mc again with 1
  {
    qs.push({
      type: 'mc',
      qtype: 'classify',
      prompt: `عدد ۱ چه نوع عددی است؟`,
      options: ['عدد اول', 'عدد مرکب', 'نه اول نه مرکب'],
      correctIndex: 2,
      explanation: 'عدد ۱ فقط یک شمارنده دارد (خودش)؛ پس نه اول است و نه مرکب. عدد اول باید دقیقاً دو شمارنده داشته باشد.',
    });
  }

  // 3. count divisors (text)
  {
    const n = randomInt(6, 60);
    qs.push({
      type: 'text',
      qtype: 'count-divisors',
      prompt: `عدد شمارنده‌های ${toPersianDigits(n)} چندتاست؟`,
      answer: String(countDivisors(n)),
      acceptable: [toPersianDigits(countDivisors(n))],
      explanation: `شمارنده‌های ${toPersianDigits(n)} عبارت‌اند از: ${toPersianDigits(divisors(n).join('، '))}؛ یعنی ${toPersianDigits(countDivisors(n))} شمارنده.`,
    });
  }

  // 4. factorize (text) — answer in form 2×2×3
  {
    let n = randomInt(12, 90);
    while (isPrime(n)) n = randomInt(12, 90);
    const factors = primeFactors(n);
    const plain = factors.join('×');
    qs.push({
      type: 'text',
      qtype: 'factorize',
      prompt: `عدد ${toPersianDigits(n)} را به‌صورت ضرب عوامل اول بنویس (مثلاً ۲×۲×۳).`,
      answer: plain,
      acceptable: [
        plain,
        factors.join('×'),
        factors.join('*'),
        factors.join(' '),
        formatPrimeFactors(n),
        toPersianDigits(plain),
        toPersianDigits(factors.join('×')),
        toPersianDigits(formatPrimeFactors(n)),
      ],
      explanation: `${toPersianDigits(n)} = ${toPersianDigits(formatPrimeFactors(n))}`,
    });
  }

  // 5. pick prime between (mc)
  {
    const lo = randomInt(20, 50);
    const hi = lo + randomInt(3, 8);
    const primesInRange: number[] = [];
    for (let i = lo + 1; i < hi; i++) if (isPrime(i)) primesInRange.push(i);
    const correct = primesInRange[0] ?? (hi + 1);
    // Build distractors from a wide pool of composites (not limited to the
    // narrow lo–hi range, which may contain fewer than 3 composites and would
    // otherwise cause an infinite loop).
    const distractorPool: number[] = [];
    for (let i = 2; i <= 99; i++) {
      if (isComposite(i) && i !== correct) distractorPool.push(i);
    }
    const distractors = shuffle(distractorPool).slice(0, 3);
    const opts = shuffle([correct, ...distractors].map(String));
    qs.push({
      type: 'mc',
      qtype: 'pick-prime-between',
      prompt: `کدام عدد بین ${toPersianDigits(lo)} و ${toPersianDigits(hi)} اول است؟`,
      options: opts.map((o) => toPersianDigits(o)),
      correctIndex: opts.indexOf(String(correct)),
      explanation: `${toPersianDigits(correct)} فقط دو شمارنده دارد؛ پس عدد اول است.`,
    });
  }

  // 6. which has more divisors (mc)
  {
    const a = randomInt(4, 40);
    let b = randomInt(4, 40);
    while (b === a) b = randomInt(4, 40);
    const ca = countDivisors(a);
    const cb = countDivisors(b);
    const label = ca > cb ? toPersianDigits(a) : ca < cb ? toPersianDigits(b) : 'برابرند';
    const opts = shuffle([toPersianDigits(a), toPersianDigits(b), 'برابرند']);
    qs.push({
      type: 'mc',
      qtype: 'which-has-more-divisors',
      prompt: `کدام عدد شمارنده بیشتری دارد؟ ${toPersianDigits(a)} یا ${toPersianDigits(b)}؟`,
      options: opts,
      correctIndex: opts.indexOf(label),
      explanation: `${toPersianDigits(a)} دارای ${toPersianDigits(ca)} شمارنده و ${toPersianDigits(b)} دارای ${toPersianDigits(cb)} شمارنده است. ${
        ca > cb ? `پس ${toPersianDigits(a)} بیشتر است.` : ca < cb ? `پس ${toPersianDigits(b)} بیشتر است.` : 'پس برابرند.'
      }`,
    });
  }

  // 7. Is it prime? true/false style as mc
  {
    const n = randomInt(2, 50);
    const p = isPrime(n);
    const opts = ['بله، اول است', 'خیر، اول نیست'];
    qs.push({
      type: 'mc',
      qtype: 'classify',
      prompt: `آیا ${toPersianDigits(n)} عدد اول است؟`,
      options: opts,
      correctIndex: p ? 0 : 1,
      explanation: p
        ? `${toPersianDigits(n)} فقط دو شمارنده دارد؛ پس اول است.`
        : `${toPersianDigits(n)} شمارنده‌هایش: ${toPersianDigits(divisors(n).join('، '))}؛ پس اول نیست.`,
    });
  }

  // 8. factorize text second
  {
    let n = randomInt(20, 120);
    while (isPrime(n)) n = randomInt(20, 120);
    const factors = primeFactors(n);
    const plain = factors.join('×');
    qs.push({
      type: 'text',
      qtype: 'factorize',
      prompt: `تجزیه ${toPersianDigits(n)} به عوامل اول را بنویس.`,
      answer: plain,
      acceptable: [
        plain,
        factors.join('×'),
        formatPrimeFactors(n),
        toPersianDigits(plain),
        toPersianDigits(factors.join('×')),
        toPersianDigits(formatPrimeFactors(n)),
      ],
      explanation: `${toPersianDigits(n)} = ${toPersianDigits(formatPrimeFactors(n))}`,
    });
  }

  return shuffle(qs);
}

interface Props {
  onBack: () => void;
}

export default function ChallengePage({ onBack }: Props) {
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [chosen, setChosen] = useState<number | null>(null);
  const [textValue, setTextValue] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [finished, setFinished] = useState(false);
  const progress = useProgress();

  const q = questions[current];

  const startGame = useCallback(() => {
    setQuestions(makeQuestions());
    setCurrent(0);
    setScore(0);
    setAnswered(false);
    setChosen(null);
    setTextValue('');
    setFeedback(null);
    setFinished(false);
    setStarted(true);
  }, []);

  const submitMC = (idx: number) => {
    if (answered || q.type !== 'mc') return;
    setChosen(idx);
    const correct = idx === q.correctIndex;
    if (correct) {
      setScore((s) => s + 10);
      setFeedback({ type: 'ok', text: `درست! +${toPersianDigits(10)} امتیاز. ${q.explanation}` });
    } else {
      setFeedback({ type: 'err', text: `نادرست. پاسخ صحیح: ${q.options[q.correctIndex]}. ${q.explanation}` });
    }
    setAnswered(true);
  };

  const submitText = () => {
    if (answered || q.type !== 'text' || !textValue.trim()) return;
    const norm = toNorm(textValue.trim());
    const accepted = q.acceptable.map((a: string) => toNorm(a));
    const correct = accepted.includes(norm);
    if (correct) {
      setScore((s) => s + 10);
      setFeedback({ type: 'ok', text: `درست! +${toPersianDigits(10)} امتیاز. ${q.explanation}` });
    } else {
      setFeedback({ type: 'err', text: `نادرست. ${q.explanation}` });
    }
    setAnswered(true);
  };

  const nextQuestion = () => {
    if (current + 1 >= questions.length) {
      setFinished(true);
      recordPlay('challenge', score);
    } else {
      setCurrent((c) => c + 1);
      setAnswered(false);
      setChosen(null);
      setTextValue('');
      setFeedback(null);
    }
  };

  if (!started) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <PageHeader
          title="چالش ترکیبی پایانی"
          subtitle="پرسش‌های متنوع درباره اعداد اول، مرکب، شمارنده‌ها و تجزیه."
          icon="Trophy"
          onBack={onBack}
          badge={progress.activities.challenge.plays > 0 ? `بهترین: ${toPersianDigits(progress.activities.challenge.best)}` : undefined}
        />
        <div className="rounded-2xl border border-white/10 bg-slate-800/50 p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 shadow-lg">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">چالش نهایی</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-400">
            {toPersianDigits(8)} پرسش ترکیبی از همه مباحث این فصل. هر پاسخ درست {toPersianDigits(10)} امتیاز دارد. برای پاسخ به پرسش‌های تجزیه، عوامل را با علامت × جدا کن (مثلاً ۲×۲×۳).
          </p>
          <button onClick={startGame} className="mt-8 rounded-xl bg-gradient-to-l from-rose-500 to-rose-700 px-8 py-3 text-sm font-bold text-white transition hover:scale-[1.03]">
            شروع چالش
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
          <h2 className="text-2xl font-bold text-white">{passed ? 'تبریک! چالش را کامل کردی' : 'نزدیک بود!'}</h2>
          <div className="mt-4 text-5xl font-extrabold text-white">{toPersianDigits(score)}</div>
          <p className="mt-2 text-sm text-slate-400">بهترین امتیاز شما: {toPersianDigits(Math.max(progress.activities.challenge.best, score))}</p>
          <div className="mt-8 flex justify-center gap-3">
            <button onClick={startGame} className="flex items-center gap-2 rounded-xl bg-rose-500 px-6 py-3 text-sm font-bold text-white transition hover:scale-[1.03]">
              <RotateCcw className="h-4 w-4" /> چالش دوباره
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
    <div className="mx-auto max-w-3xl px-4 py-8">
      <PageHeader title="چالش ترکیبی پایانی" subtitle="آزمون تکوینی فصل" icon="Trophy" onBack={onBack} />

      {/* Progress */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex-1">
          <div className="h-2 overflow-hidden rounded-full bg-slate-700">
            <div className="h-full rounded-full bg-gradient-to-l from-rose-400 to-rose-600 transition-all" style={{ width: `${(current / questions.length) * 100}%` }} />
          </div>
        </div>
        <span className="text-sm font-bold text-slate-300">{toPersianDigits(current + 1)} / {toPersianDigits(questions.length)}</span>
        <div className="flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-sm font-bold text-amber-300">
          <Trophy className="h-3.5 w-3.5" />
          {toPersianDigits(score)}
        </div>
      </div>

      {q && (
        <div key={current} className="animate-fade-in-up rounded-2xl border border-white/10 bg-slate-800/50 p-6">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold text-rose-200">
            <ListOrdered className="h-4 w-4" />
            پرسش {toPersianDigits(current + 1)}
          </div>
          <p className="mb-6 text-lg font-bold leading-relaxed text-white">{q.prompt}</p>

          {q.type === 'mc' ? (
            <div className="grid gap-3 sm:grid-cols-1">
              {q.options.map((opt, idx) => {
                const correct = idx === q.correctIndex;
                const isChosen = chosen === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => submitMC(idx)}
                    disabled={answered}
                    className={`relative rounded-xl border px-4 py-3.5 text-right text-sm font-bold transition ${
                      !answered
                        ? 'border-white/10 bg-white/5 text-white hover:scale-[1.01] hover:border-rose-400/50 hover:bg-rose-500/10'
                        : correct
                        ? 'border-accent-500 bg-accent-500/20 text-accent-200'
                        : isChosen
                        ? 'border-rose-500 bg-rose-500/20 text-rose-200'
                        : 'border-white/5 bg-white/5 text-slate-500'
                    }`}
                  >
                    <span className="ms-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs">{toPersianDigits(idx + 1)}</span>
                    <span className="ms-2">{opt}</span>
                    {answered && correct && <CheckCircle2 className="absolute -top-2 -left-2 h-5 w-5 text-accent-400" />}
                    {answered && isChosen && !correct && <XCircle className="absolute -top-2 -left-2 h-5 w-5 text-rose-400" />}
                  </button>
                );
              })}
            </div>
          ) : (
            <div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') submitText(); }}
                  disabled={answered}
                  placeholder="مثلاً: ۲×۲×۳"
                  className="flex-1 rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-base text-white outline-none transition focus:border-rose-400/50 placeholder:text-slate-600 disabled:opacity-60"
                  dir="ltr"
                  style={{ textAlign: 'right' }}
                />
                <button
                  onClick={submitText}
                  disabled={answered || !textValue.trim()}
                  className="rounded-xl bg-rose-500 px-6 py-3 text-sm font-bold text-white transition enabled:hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  بررسی پاسخ
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div className={`mt-4 animate-pop-in rounded-xl border px-4 py-3 text-sm font-medium ${feedback.type === 'ok' ? 'border-accent-500/30 bg-accent-500/10 text-accent-200' : 'border-rose-500/30 bg-rose-500/10 text-rose-200'}`}>
          {feedback.text}
        </div>
      )}

      {/* Next */}
      {answered && (
        <div className="mt-6 text-center">
          <button onClick={nextQuestion} className="rounded-xl bg-gradient-to-l from-brand-500 to-accent-500 px-8 py-3 text-sm font-bold text-white shadow-glow transition hover:scale-[1.03]">
            {current + 1 >= questions.length ? 'پایان و مشاهده نتیجه' : 'پرسش بعدی'}
          </button>
        </div>
      )}
    </div>
  );
}
