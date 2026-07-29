import type { ReactNode } from 'react';
import Navbar from './Navbar';
import ToastContainer from '../ui/Toast';
import PageFade from '../ui/PageFade';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-neutral-50 selection:bg-primary-100 selection:text-primary-900">
      <Navbar />
      <main className={className}>
        <PageFade>{children}</PageFade>
      </main>
      <ToastContainer />
    </div>
  );
}
