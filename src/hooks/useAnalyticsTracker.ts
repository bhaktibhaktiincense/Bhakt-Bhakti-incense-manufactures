import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView, trackHeartbeat } from '../utils/analytics';

/**
 * Global analytics hook mounted in App or Layout to automate:
 * 1. Debounced page view tracking on route navigation
 * 2. Active visitor heartbeat ping every 60 seconds
 */
export function useAnalyticsTracker() {
  const location = useLocation();
  const lastPathRef = useRef<string>('');

  // 1. Page view tracking on location change
  useEffect(() => {
    const fullPath = location.pathname + (location.search || '');
    if (lastPathRef.current !== fullPath) {
      lastPathRef.current = fullPath;
      trackPageView(location.pathname);
    }
  }, [location.pathname, location.search]);

  // 2. Active visitor heartbeat (every 60s & on tab refocus)
  useEffect(() => {
    // Send initial heartbeat
    trackHeartbeat();

    const interval = setInterval(() => {
      trackHeartbeat();
    }, 60000); // every 60 seconds

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        trackHeartbeat();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
}
