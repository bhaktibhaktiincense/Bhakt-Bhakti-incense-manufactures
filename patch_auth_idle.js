import fs from 'fs';

let code = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

const target = `    // Initialize
    resetTimeout();

    // Event listeners for user activity
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    const handleActivity = () => resetTimeout();

    events.forEach(event => window.addEventListener(event, handleActivity));

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, handleActivity));
    };
  }, [user]);`;

const replacement = `    // Cross-tab synchronization for activity
    const syncActivity = () => {
      localStorage.setItem('last_activity', Date.now().toString());
    };

    const handleActivity = () => {
      resetTimeout();
      syncActivity();
    };

    // Listen to activity from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'last_activity') {
        resetTimeout();
      }
    };

    // Initialize
    resetTimeout();
    syncActivity();

    // Event listeners for user activity
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, handleActivity));
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, handleActivity));
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user]);`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/contexts/AuthContext.tsx', code);
  console.log("Patched AuthContext.tsx for cross-tab idle timeout");
} else {
  console.log("Could not find target in AuthContext.tsx");
}
