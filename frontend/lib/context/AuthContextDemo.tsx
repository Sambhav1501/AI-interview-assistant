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
  createdAt: string;
  lastLogin: string;
  profileComplete: boolean;
  stats: {
    totalInterviews: number;
    averageScore: number;
    lastInterviewDate: string | null;
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
  const [user, setUser] = useState<DemoUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Demo authentication - simulates login/signup without Firebase
  const signup = async (email: string, password: string, displayName: string) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const demoUser: DemoUser = {
      uid: `demo-${Date.now()}`,
      email,
      displayName
    };

    const profile: UserProfile = {
      uid: demoUser.uid,
      email,
      displayName,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      profileComplete: false,
      stats: {
        totalInterviews: 0,
        averageScore: 0,
        lastInterviewDate: null
      }
    };

    // Store in localStorage for demo
    localStorage.setItem('demoUser', JSON.stringify(demoUser));
    localStorage.setItem('demoProfile', JSON.stringify(profile));

    setUser(demoUser);
    setUserProfile(profile);
    router.push('/dashboard');
  };

  const login = async (email: string, password: string) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For demo, accept any email/password combination
    const demoUser: DemoUser = {
      uid: `demo-${Date.now()}`,
      email,
      displayName: email.split('@')[0]
    };

    const profile: UserProfile = {
      uid: demoUser.uid,
      email,
      displayName: demoUser.displayName,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      profileComplete: false,
      stats: {
        totalInterviews: 0,
        averageScore: 0,
        lastInterviewDate: null
      }
    };

    // Store in localStorage for demo
    localStorage.setItem('demoUser', JSON.stringify(demoUser));
    localStorage.setItem('demoProfile', JSON.stringify(profile));

    setUser(demoUser);
    setUserProfile(profile);
    router.push('/dashboard');
  };

  const loginWithGoogle = async () => {
    // Simulate Google login
    await new Promise(resolve => setTimeout(resolve, 1000));

    const demoUser: DemoUser = {
      uid: `google-${Date.now()}`,
      email: 'demo@gmail.com',
      displayName: 'Demo User'
    };

    const profile: UserProfile = {
      uid: demoUser.uid,
      email: demoUser.email,
      displayName: demoUser.displayName,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      profileComplete: false,
      stats: {
        totalInterviews: 0,
        averageScore: 0,
        lastInterviewDate: null
      }
    };

    localStorage.setItem('demoUser', JSON.stringify(demoUser));
    localStorage.setItem('demoProfile', JSON.stringify(profile));

    setUser(demoUser);
    setUserProfile(profile);
    router.push('/dashboard');
  };

  const logout = async () => {
    localStorage.removeItem('demoUser');
    localStorage.removeItem('demoProfile');
    setUser(null);
    setUserProfile(null);
    router.push('/login');
  };

  const resetPassword = async (email: string) => {
    // Simulate password reset
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Password reset email sent to ${email}`);
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!userProfile) return;

    const updatedProfile = { ...userProfile, ...updates };
    localStorage.setItem('demoProfile', JSON.stringify(updatedProfile));
    setUserProfile(updatedProfile);
  };

  // Check for existing demo session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('demoUser');
    const storedProfile = localStorage.getItem('demoProfile');

    if (storedUser && storedProfile) {
      try {
        setUser(JSON.parse(storedUser));
        setUserProfile(JSON.parse(storedProfile));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('demoUser');
        localStorage.removeItem('demoProfile');
      }
    }

    setLoading(false);
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
