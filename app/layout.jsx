import './globals.css';
import AuthProvider from '@/components/providers/AuthProvider';

export const metadata = {
  title: 'ZERIC — Owner & Staff Portal | Made Simpler And Much Faster',
  description: 'Manage queues, daily staff/doctor shifts, and terminal counters for saloons, parlours, clinics, and diagnostic centres.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
