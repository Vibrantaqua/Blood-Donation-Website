import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

interface UserData {
  uid: string;
  role: 'donor' | 'organizer';
  name: string;
  email: string;
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: 'donor' | 'organizer') => Promise<void>;
  signInWithGoogle: (role: 'donor' | 'organizer') => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  async function signup(email: string, password: string, name: string, role: 'donor' | 'organizer') {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    
    const userDoc = {
      uid: user.uid,
      role,
      name,
      email
    };
    
    await setDoc(doc(db, 'users', user.uid), userDoc);
    setUserData(userDoc);
  }

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signInWithGoogle(role: 'donor' | 'organizer') {
    const provider = new GoogleAuthProvider();
    const { user } = await signInWithPopup(auth, provider);
    
    // Check if user already exists in Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      // Create new user document
      const userData = {
        uid: user.uid,
        role,
        name: user.displayName || 'Google User',
        email: user.email || ''
      };
      
      await setDoc(doc(db, 'users', user.uid), userData);
      setUserData(userData);
    } else {
      // User exists, use existing data
      setUserData(userDoc.data() as UserData);
    }
  }

  async function logout() {
    await signOut(auth);
    setUserData(null);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    loading,
    login,
    signup,
    signInWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}