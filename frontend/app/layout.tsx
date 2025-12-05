import '../styles/globals.css';
import Header from '../components/Header';
import { AuthProvider } from '../contexts/AuthContext';
import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased selection:bg-green-200 selection:text-green-900">
        <AuthProvider>
          <Header />
          <main className="min-h-screen px-4 md:px-8 lg:px-16 py-6">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
