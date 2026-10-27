import { useState } from 'react';
import Navbar from '@/components/Navbar';
import HomePage from '@/pages/HomePage';
import SievePage from '@/pages/SievePage';
import IdentifyPage from '@/pages/IdentifyPage';
import FactorizePage from '@/pages/FactorizePage';
import ChallengePage from '@/pages/ChallengePage';
import ProgressPage from '@/pages/ProgressPage';
import TeacherPage from '@/pages/TeacherPage';
import type { Page } from '@/lib/nav';

function App() {
  const [page, setPage] = useState<Page>('home');

  const goHome = () => setPage('home');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar current={page} onNavigate={setPage} />

      <main>
        {page === 'home' && <HomePage onNavigate={setPage} />}
        {page === 'sieve' && <SievePage onBack={goHome} />}
        {page === 'identify' && <IdentifyPage onBack={goHome} />}
        {page === 'factorize' && <FactorizePage onBack={goHome} />}
        {page === 'challenge' && <ChallengePage onBack={goHome} />}
        {page === 'progress' && <ProgressPage onBack={goHome} />}
        {page === 'teacher' && <TeacherPage onBack={goHome} />}
      </main>

      <footer className="mt-12 border-t border-white/10 bg-slate-900/50 py-6">
        <div className="mx-auto max-w-6xl px-4 text-center text-xs text-slate-500">
          آزمایشگاه تعاملی عددهای اول — فصل دوم ریاضی پایه هشتم
        </div>
      </footer>
    </div>
  );
}

export default App;
