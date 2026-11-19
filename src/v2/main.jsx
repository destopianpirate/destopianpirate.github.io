import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import 'lenis/dist/lenis.css';
import './styles/base.css';
import Shell from './components/Shell';

// Each /<page>2/ folder boots this same bundle; the folder name picks the page.
const PAGES = {
  home2: lazy(() => import('./pages/Home2')),
  projects2: lazy(() => import('./pages/Projects2')),
  skills2: lazy(() => import('./pages/Skills2')),
  github2: lazy(() => import('./pages/Github2')),
  blog2: lazy(() => import('./pages/Blog2')),
};

const seg = window.location.pathname.split('/').filter(Boolean).find((s) => s in PAGES);
const key = seg || 'home2';
const Page = PAGES[key];

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Shell page={key}>
      <Suspense fallback={<div className="v2-suspense" />}>
        <Page />
      </Suspense>
    </Shell>
  </StrictMode>,
);
