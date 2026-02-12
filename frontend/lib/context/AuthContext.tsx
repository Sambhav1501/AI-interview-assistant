// 'use client';

// import React, { createContext, useContext, useEffect, useState } from 'react';
// import {
//   User,
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   signOut,
//   onAuthStateChanged,
//   updateProfile,
//   sendPasswordResetEmail,
//   GoogleAuthProvider,
//   signInWithPopup
// } from 'firebase/auth';
// import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
// import { auth, db } from '../firebase/config';
// import { useRouter } from 'next/navigation';

// interface UserProfile {
//   uid: string;
//   email: string;
//   displayName: string;
//   createdAt: any;
//   lastLogin: any;
//   profileComplete: boolean;
//   stats: {
//     totalInterviews: number;
//     averageScore: number;
//     lastInterviewDate: any;
//   };
// }

// interface AuthContextType {
//   user: User | null;
//   userProfile: UserProfile | null;
//   loading: boolean;
//   signup: (email: string, password: string, displayName: string) => Promise<void>;
//   login: (email: string, password: string) => Promise<void>;
//   loginWithGoogle: () => Promise<void>;
//   logout: () => Promise<void>;
//   resetPassword: (email: string) => Promise<void>;
//   updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
// }

// const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   // Initialize user profile in Firestore
//   const createUserProfile = async (user: User, displayName: string) => {
//     const userRef = doc(db, 'users', user.uid);
//     const userSnap = await getDoc(userRef);

//     if (!userSnap.exists()) {
//       const profile: UserProfile = {
//         uid: user.uid,
//         email: user.email || '',
//         displayName: displayName || user.displayName || 'User',
//         createdAt: serverTimestamp(),
//         lastLogin: serverTimestamp(),
//         profileComplete: false,
//         stats: {
//           totalInterviews: 0,
//           averageScore: 0,
//           lastInterviewDate: null
//         }
//       };

//       await setDoc(userRef, profile);
//       return profile;
//     } else {
//       // Update last login
//       await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
//       return userSnap.data() as UserProfile;
//     }
//   };

//   // Fetch user profile
//   const fetchUserProfile = async (uid: string) => {
//     try {
//       const userRef = doc(db, 'users', uid);
//       const userSnap = await getDoc(userRef);
      
//       if (userSnap.exists()) {
//         setUserProfile(userSnap.data() as UserProfile);
//       }
//     } catch (error) {
//       console.error('Error fetching user profile:', error);
//     }
//   };

//   // Sign up
//   const signup = async (email: string, password: string, displayName: string) => {
//     try {
//       const result = await createUserWithEmailAndPassword(auth, email, password);
      
//       // Update display name
//       await updateProfile(result.user, { displayName });
      
//       // Create user profile in Firestore
//       const profile = await createUserProfile(result.user, displayName);
//       setUserProfile(profile);
      
//       router.push('/dashboard');
//     } catch (error: any) {
//       console.error('Signup error:', error);
//       throw new Error(error.message);
//     }
//   };

//   // Login
//   const login = async (email: string, password: string) => {
//     try {
//       const result = await signInWithEmailAndPassword(auth, email, password);
      
//       // Update last login
//       const userRef = doc(db, 'users', result.user.uid);
//       await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
      
//       // Fetch profile
//       await fetchUserProfile(result.user.uid);
      
//       router.push('/dashboard');
//     } catch (error: any) {
//       console.error('Login error:', error);
//       throw new Error(error.message);
//     }
//   };

//   // Google Sign In
//   const loginWithGoogle = async () => {
//     try {
//       const provider = new GoogleAuthProvider();
//       const result = await signInWithPopup(auth, provider);
      
//       // Create or update profile
//       const profile = await createUserProfile(
//         result.user, 
//         result.user.displayName || 'User'
//       );
//       setUserProfile(profile);
      
//       router.push('/dashboard');
//     } catch (error: any) {
//       console.error('Google login error:', error);
//       throw new Error(error.message);
//     }
//   };

//   // Logout
//   const logout = async () => {
//     try {
//       await signOut(auth);
//       setUser(null);
//       setUserProfile(null);
//       router.push('/login');
//     } catch (error: any) {
//       console.error('Logout error:', error);
//       throw new Error(error.message);
//     }
//   };

//   // Password reset
//   const resetPassword = async (email: string) => {
//     try {
//       await sendPasswordResetEmail(auth, email);
//     } catch (error: any) {
//       console.error('Password reset error:', error);
//       throw new Error(error.message);
//     }
//   };

//   // Update user profile
//   const updateUserProfile = async (updates: Partial<UserProfile>) => {
//     if (!user) return;
    
//     try {
//       const userRef = doc(db, 'users', user.uid);
//       await setDoc(userRef, updates, { merge: true });
      
//       // Refresh profile
//       await fetchUserProfile(user.uid);
//     } catch (error: any) {
//       console.error('Update profile error:', error);
//       throw new Error(error.message);
//     }
//   };

//   // Auth state listener
//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       setUser(user);
      
//       if (user) {
//         await fetchUserProfile(user.uid);
//       } else {
//         setUserProfile(null);
//       }
      
//       setLoading(false);
//     });

//     return unsubscribe;
//   }, []);

//   const value = {
//     user,
//     userProfile,
//     loading,
//     signup,
//     login,
//     loginWithGoogle,
//     logout,
//     resetPassword,
//     updateUserProfile
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// };



'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Demo user type for when Firebase is not available
interface DemoUser {
  uid: string;
  email: string;
  displayName: string;
}

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt: any;
  lastLogin: any;
  profileComplete: boolean;
  stats: {
    totalInterviews: number;
    averageScore: number;
    lastInterviewDate: any;
  };
}

interface AuthContextType {
  user: DemoUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const createUserProfile = async (user: User, displayName: string) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const profile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: displayName || user.displayName || 'User',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        profileComplete: false,
        stats: {
          totalInterviews: 0,
          averageScore: 0,
          lastInterviewDate: null
        }
      };

      await setDoc(userRef, profile);
      return profile;
    } else {
      await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
      return userSnap.data() as UserProfile;
    }
  };

  const fetchUserProfile = async (uid: string) => {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        setUserProfile(userSnap.data() as UserProfile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const signup = async (email: string, password: string, displayName: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
      const profile = await createUserProfile(result.user, displayName);
      setUserProfile(profile);
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.message);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userRef = doc(db, 'users', result.user.uid);
      await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
      await fetchUserProfile(result.user.uid);
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const profile = await createUserProfile(result.user, result.user.displayName || 'User');
      setUserProfile(profile);
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Google login error:', error);
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      router.push('/login');
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(error.message);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw new Error(error.message);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, updates, { merge: true });
      await fetchUserProfile(user.uid);
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error(error.message);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    userProfile,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};