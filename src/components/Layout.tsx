import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAnalyticsTracker } from '../hooks/useAnalyticsTracker';

export default function Layout() {
  // Automatically tracks page views and active visitor heartbeats without PII
  useAnalyticsTracker();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

