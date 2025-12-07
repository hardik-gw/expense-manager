// src/contexts/AuthContexts.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  getAdditionalUserInfo,
} from 'firebase/auth';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const additionalInfo = getAdditionalUserInfo(userCredential);

    if (additionalInfo?.isNewUser) {
      localStorage.setItem('onboardingComplete', 'false');
      navigate('/onboarding');
    } else {
      localStorage.setItem('onboardingComplete', 'true');
      navigate('/dashboard');
    }

    return userCredential;
  };

  const googleLogin = async () => {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const additionalInfo = getAdditionalUserInfo(userCredential);

    if (additionalInfo?.isNewUser) {
      localStorage.setItem('onboardingComplete', 'false');
      navigate('/onboarding');
    } else {
      localStorage.setItem('onboardingComplete', 'true');
      navigate('/dashboard');
    }

    return userCredential;
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        signup,
        googleLogin,
        logout,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
