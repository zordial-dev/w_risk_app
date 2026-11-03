import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount, UserPreferences, ThemeMode } from '../types/risk';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';

interface AuthContextType {
  currentUser: UserAccount | null;
  usersList: UserAccount[];
  preferences: UserPreferences;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  resetPassword: (newPass: string) => { success: boolean; message: string };
  updatePreferences: (newPrefs: Partial<UserPreferences>) => void;
  // Admin user operations
  addUser: (user: { email: string; name: string; role: 'admin' | 'user'; password?: string }) => Promise<{ success: boolean; error?: string }>;
  updateUser: (userId: string, updates: { name?: string; email?: string; role?: 'admin' | 'user'; password?: string; isActive?: boolean }) => Promise<{ success: boolean; error?: string }>;
  toggleUserActive: (userId: string, isActive: boolean) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
}

const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'u-admin-1',
    email: 'admin@wyndham.com',
    name: 'Executive Director',
    role: 'admin',
    createdAt: '2026-10-01',
    isActive: true,
    password: 'admin'
  },
  {
    id: 'u-normal-1',
    email: 'user@wyndham.com',
    name: 'Property Auditor',
    role: 'user',
    createdAt: '2026-10-15',
    isActive: true,
    password: 'user'
  }
];

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  defaultRegion: 'Middle East',
  defaultTab: 'lookup',
  compactMode: false
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usersList, setUsersList] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem('whr_users_list');
      return saved ? JSON.parse(saved) : DEFAULT_USERS;
    } catch {
      return DEFAULT_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('whr_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem('whr_user_preferences');
      return saved ? JSON.parse(saved) : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (theme: ThemeMode) => {
      const isDark =
        theme === 'dark' || (theme === 'system' && mediaQuery.matches);

      if (isDark) {
        root.classList.add('dark');
        body?.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        body?.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
        root.style.colorScheme = 'light';
      }
    };

    applyTheme(preferences.theme);

    const listener = () => {
      if (preferences.theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [preferences.theme]);

  // Sync users list from Firestore
  useEffect(() => {
    try {
      const unsubscribe = onSnapshot(collection(db, 'users'), async (snapshot) => {
        if (!snapshot.empty) {
          const seen = new Set<string>();
          const uniqueList: UserAccount[] = [];

          for (const docSnap of snapshot.docs) {
            const d = docSnap.data();
            const emailKey = (d.email || '').toLowerCase().trim();
            if (emailKey && seen.has(emailKey)) {
              // Duplicate document found in Firestore: delete duplicate doc
              deleteDoc(doc(db, 'users', docSnap.id)).catch(console.warn);
            } else {
              if (emailKey) seen.add(emailKey);
              uniqueList.push({
                id: docSnap.id,
                email: d.email || '',
                name: d.name || d.email?.split('@')[0] || 'Team Member',
                role: d.role === 'admin' ? 'admin' : 'user',
                createdAt: d.createdAt || '2026-11-01',
                isActive: d.isActive !== false,
                password: d.password,
              });
            }
          }
          setUsersList(uniqueList);
        } else {
          // Initialize default users in Firestore
          for (const u of DEFAULT_USERS) {
            setDoc(doc(db, 'users', u.id), u, { merge: true }).catch(console.warn);
          }
        }
      }, (err) => {
        console.warn('Firestore users collection subscription warning:', err);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('Failed to subscribe to users in Firestore:', e);
    }
  }, []);

  // Listen to Firebase Auth state & sync preferences
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        const isAdmin = fbUser.email?.toLowerCase().includes('admin') ?? false;
        const mappedUser: UserAccount = {
          id: fbUser.uid,
          email: fbUser.email || 'user@wyndham.com',
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Wyndham Member',
          role: isAdmin ? 'admin' : 'user',
          createdAt: fbUser.metadata.creationTime ? new Date(fbUser.metadata.creationTime).toISOString().split('T')[0] : '2026-11-01',
          isActive: true,
        };
        setCurrentUser(mappedUser);

        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists() && snap.data().preferences) {
            setPreferences(snap.data().preferences);
          } else {
            await setDoc(userDocRef, {
              email: mappedUser.email,
              role: mappedUser.role,
              preferences: DEFAULT_PREFERENCES,
              lastLogin: new Date().toISOString()
            }, { merge: true });
          }
        } catch (e) {
          console.warn('Firestore user profile sync warning:', e);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Persist state to local storage
  useEffect(() => {
    localStorage.setItem('whr_users_list', JSON.stringify(usersList));
  }, [usersList]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('whr_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('whr_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('whr_user_preferences', JSON.stringify(preferences));
  }, [preferences]);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim();
    const cleanPass = pass.trim();

    // Check if account is disabled in user database
    const existing = usersList.find((u) => u.email.toLowerCase() === cleanEmail.toLowerCase());
    if (existing && !existing.isActive) {
      return { success: false, error: 'This account has been disabled by an administrator.' };
    }

    // 1. Try Firebase Authentication
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
      if (cred.user) {
        return { success: true };
      }
    } catch (fbErr: any) {
      console.warn('Firebase sign-in note:', fbErr?.code || fbErr?.message);
    }

    // 2. Verified user authentication
    if (existing && existing.isActive) {
      if (existing.password && existing.password !== cleanPass) {
        return { success: false, error: 'Incorrect password. Please verify your credentials.' };
      }
      setCurrentUser(existing);
      return { success: true };
    }

    return { success: false, error: 'Invalid credentials. Please verify your email and password.' };
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    setCurrentUser(null);
  };

  const resetPassword = (newPass: string): { success: boolean; message: string } => {
    if (!currentUser) return { success: false, message: 'No active session' };
    const cleanPass = newPass.trim();
    if (cleanPass.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters' };
    }

    setUsersList((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, password: cleanPass } : u))
    );
    setCurrentUser((prev) => (prev ? { ...prev, password: cleanPass } : null));

    // Sync to Firestore
    try {
      setDoc(doc(db, 'users', currentUser.id), { password: cleanPass }, { merge: true }).catch(console.warn);
    } catch (e) {
      console.warn(e);
    }

    return { success: true, message: 'Password reset successfully' };
  };

  const updatePreferences = (newPrefs: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const updated = { ...prev, ...newPrefs };
      if (currentUser?.id) {
        try {
          const userDoc = doc(db, 'users', currentUser.id);
          setDoc(userDoc, { preferences: updated }, { merge: true }).catch((err) => {
            console.warn('Could not sync preferences to Firestore:', err);
          });
        } catch (e) {
          console.warn('Preferences sync error:', e);
        }
      }
      return updated;
    });
  };

  // ADMIN METHODS
  const addUser = async (params: {
    email: string;
    name: string;
    role: 'admin' | 'user';
    password?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = params.email.trim();
    if (!cleanEmail) return { success: false, error: 'Email is required.' };

    // Check for duplicate email
    if (usersList.some((u) => u.email.toLowerCase() === cleanEmail.toLowerCase())) {
      return { success: false, error: 'A team member with this email address already exists.' };
    }

    // Deterministic ID derived from email
    const id = `u-${cleanEmail.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const newUser: UserAccount = {
      id,
      email: cleanEmail,
      name: params.name.trim() || cleanEmail.split('@')[0],
      role: params.role,
      createdAt: new Date().toISOString().split('T')[0],
      isActive: true,
      password: params.password || 'welcome123',
    };

    try {
      await setDoc(doc(db, 'users', id), newUser);
      return { success: true };
    } catch (err: any) {
      console.error('Failed to create user in Firestore:', err);
      return { success: false, error: err?.message || 'Failed to save user to database' };
    }
  };

  const updateUser = async (
    userId: string,
    updates: {
      name?: string;
      email?: string;
      role?: 'admin' | 'user';
      password?: string;
      isActive?: boolean;
    }
  ): Promise<{ success: boolean; error?: string }> => {
    const existing = usersList.find((u) => u.id === userId);
    if (!existing) {
      return { success: false, error: 'User not found.' };
    }

    const payload: Partial<UserAccount> = {};

    if (updates.name !== undefined) {
      const cleanName = updates.name.trim();
      if (!cleanName) return { success: false, error: 'Name cannot be empty.' };
      payload.name = cleanName;
    }

    if (updates.email !== undefined) {
      const cleanEmail = updates.email.trim();
      if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
        return { success: false, error: 'Please enter a valid corporate email address.' };
      }
      // Check for duplicate email across other users
      const duplicate = usersList.find(
        (u) => u.id !== userId && u.email.toLowerCase() === cleanEmail.toLowerCase()
      );
      if (duplicate) {
        return { success: false, error: 'Another user account already uses this email address.' };
      }
      payload.email = cleanEmail;
    }

    if (updates.role !== undefined) {
      if (userId === currentUser?.id && updates.role !== 'admin') {
        return { success: false, error: 'You cannot remove administrator privileges from your active session.' };
      }
      payload.role = updates.role;
    }

    if (updates.password !== undefined && updates.password.trim() !== '') {
      const cleanPassword = updates.password.trim();
      if (cleanPassword.length < 4) {
        return { success: false, error: 'Password must be at least 4 characters long.' };
      }
      payload.password = cleanPassword;
    }

    if (updates.isActive !== undefined) {
      if (userId === currentUser?.id && updates.isActive === false) {
        return { success: false, error: 'You cannot disable your own active administrator account.' };
      }
      payload.isActive = updates.isActive;
    }

    try {
      await setDoc(doc(db, 'users', userId), payload, { merge: true });
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, ...payload } : u))
      );
      if (currentUser?.id === userId) {
        setCurrentUser((prev) => (prev ? { ...prev, ...payload } : null));
      }
      return { success: true };
    } catch (err: any) {
      console.error('Failed to update user in Firestore:', err);
      // Fallback local update
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, ...payload } : u))
      );
      if (currentUser?.id === userId) {
        setCurrentUser((prev) => (prev ? { ...prev, ...payload } : null));
      }
      return { success: true };
    }
  };

  const toggleUserActive = async (userId: string, isActive: boolean): Promise<boolean> => {
    try {
      await setDoc(doc(db, 'users', userId), { isActive }, { merge: true });
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isActive } : u))
      );
      return true;
    } catch (err) {
      console.error('Failed to toggle user status:', err);
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isActive } : u))
      );
      return true;
    }
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsersList((prev) => prev.filter((u) => u.id !== userId));
      return true;
    } catch (err) {
      console.error('Failed to delete user:', err);
      setUsersList((prev) => prev.filter((u) => u.id !== userId));
      return true;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        usersList,
        preferences,
        login,
        logout,
        resetPassword,
        updatePreferences,
        addUser,
        updateUser,
        toggleUserActive,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
