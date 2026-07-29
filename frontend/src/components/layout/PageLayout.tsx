import type { ReactNode } from 'react';
import Navbar from './Navbar';
import ToastContainer from '../ui/Toast';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className={className}>{children}</main>
      <ToastContainer />
    </div>
  );
}
