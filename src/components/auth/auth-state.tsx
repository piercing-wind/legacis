import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

const SIGNIN_PROGRESS_KEY = 'signInProgress';
const SIGNIN_TIMESTAMP_KEY = 'signInTimestamp';
const SIGNIN_TIMEOUT = 8 * 60 * 1000; // 8 minutes

export const useSignInProgress = () => {
  const [signInProgress, setSignInProgressState] = useState(false);
  const { status } = useSession();

  // Load from localStorage on mount and check if expired
  useEffect(() => {
    try {
      const persistedProgress = localStorage.getItem(SIGNIN_PROGRESS_KEY);
      const timestamp = localStorage.getItem(SIGNIN_TIMESTAMP_KEY);
      
      if (persistedProgress === 'true') {
        if (timestamp) {
          const elapsed = Date.now() - parseInt(timestamp);
          if (elapsed < SIGNIN_TIMEOUT) {
            // Still valid
            setSignInProgressState(true);
          } else {
            // Expired, clear it
            console.log('Sign-in progress expired on load, clearing...');
            localStorage.removeItem(SIGNIN_PROGRESS_KEY);
            localStorage.removeItem(SIGNIN_TIMESTAMP_KEY);
            setSignInProgressState(false);
          }
        } else {
          // No timestamp, assume expired
          localStorage.removeItem(SIGNIN_PROGRESS_KEY);
          setSignInProgressState(false);
        }
      }
    } catch (error) {
      console.error('Error loading sign-in progress from localStorage:', error);
    }
  }, []);

  // Function to set sign-in progress
  const setSignInProgress = useCallback((inProgress: boolean) => {
    try {
      setSignInProgressState(inProgress);
      
      if (inProgress) {
        localStorage.setItem(SIGNIN_PROGRESS_KEY, 'true');
        localStorage.setItem(SIGNIN_TIMESTAMP_KEY, Date.now().toString());
      } else {
        localStorage.removeItem(SIGNIN_PROGRESS_KEY);
        localStorage.removeItem(SIGNIN_TIMESTAMP_KEY);
      }
    } catch (error) {
      console.error('Error saving sign-in progress to localStorage:', error);
    }
  }, []);

  // Only reset signInProgress when user is actually authenticated
  useEffect(() => {
    if (status === 'authenticated' && signInProgress) {
      setSignInProgress(false);
    }
  }, [status, signInProgress, setSignInProgress]);

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SIGNIN_PROGRESS_KEY) {
        const newValue = e.newValue === 'true';
        if (newValue !== signInProgress) {
          setSignInProgressState(newValue);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [signInProgress]);

  // Function to manually check if user should be allowed to sign in
  const canSignIn = useCallback(() => {
    if (status === 'authenticated') return false;
    
    // Check if expired
    const timestamp = localStorage.getItem(SIGNIN_TIMESTAMP_KEY);
    if (signInProgress && timestamp) {
      const elapsed = Date.now() - parseInt(timestamp);
      if (elapsed >= SIGNIN_TIMEOUT) {
        // Expired, clear and allow
        setSignInProgress(false);
        return true;
      }
      return false; // Still active
    }
    
    return !signInProgress;
  }, [status, signInProgress, setSignInProgress]);

  return {
    signInProgress,
    setSignInProgress,
    canSignIn
  };
};