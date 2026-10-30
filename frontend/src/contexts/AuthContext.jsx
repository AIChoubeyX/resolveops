import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../config/firebase.js';
import { syncCurrentUser } from '../services/api.js';

const AuthContext = createContext(null);

const getAuthError = (error) => {
  const messages = {
    'auth/email-already-in-use': 'An account already exists for this email.',
    'auth/invalid-credential': 'The email or password is incorrect.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/weak-password': 'Use a password with at least six characters.',
    'auth/popup-closed-by-user': 'The Google sign-in window was closed.',
    'auth/popup-blocked': 'Your browser blocked the sign-in popup. Allow popups and try again.',
  };
  return messages[error.code] || 'Authentication failed. Please try again.';
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [activeOrganizationId, setActiveOrganizationId] = useState(() => localStorage.getItem('resolveops.organizationId') || '');

  const synchronize = async (firebaseUser) => {
    setSyncing(true);
    try {
      const syncedProfile = await syncCurrentUser(firebaseUser);
      setProfile(syncedProfile);
      const organizations = syncedProfile.organizations || [];
      setActiveOrganizationId((currentOrganizationId) => {
        const stillAuthorized = organizations.some(
          (organization) => String(organization.id) === String(currentOrganizationId)
        );
        const nextOrganizationId = stillAuthorized
          ? String(currentOrganizationId)
          : organizations[0]?.id ? String(organizations[0].id) : '';
        if (nextOrganizationId) localStorage.setItem('resolveops.organizationId', nextOrganizationId);
        else localStorage.removeItem('resolveops.organizationId');
        return nextOrganizationId;
      });
      return syncedProfile;
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setAuthError(null);
      if (!firebaseUser) {
        setProfile(null);
        setActiveOrganizationId('');
        localStorage.removeItem('resolveops.organizationId');
        setLoading(false);
        return;
      }
      try {
        await synchronize(firebaseUser);
      } catch (error) {
        setAuthError(error.message);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    if (activeOrganizationId) localStorage.setItem('resolveops.organizationId', activeOrganizationId);
  }, [activeOrganizationId]);

  const authenticate = async (operation) => {
    setAuthError(null);
    try {
      const result = await operation();
      await synchronize(result.user);
      return result.user;
    } catch (error) {
      const message = error.code ? getAuthError(error) : error.message;
      setAuthError(message);
      throw new Error(message);
    }
  };

  const value = useMemo(() => ({
    user,
    profile,
    organizations: profile?.organizations || [],
    activeOrganizationId,
    setActiveOrganizationId,
    loading: loading || syncing,
    authError,
    signIn: (email, password) => authenticate(() => signInWithEmailAndPassword(auth, email, password)),
    signUp: async (email, password, displayName) => authenticate(async () => {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName.trim()) await updateProfile(result.user, { displayName: displayName.trim() });
      return result;
    }),
    signInWithGoogle: () => authenticate(() => signInWithPopup(auth, new GoogleAuthProvider())),
    logout: () => signOut(auth),
  }), [activeOrganizationId, authError, loading, profile, syncing, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
