import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, activateUser, seedDefaultUser, updateUserPasscode } from '../utils/db';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // Seed default user (Evan Marsay / Michelle11.) if not already present
      await seedDefaultUser();
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (username, password) => {
    const res = await loginUser(username, password);
    if (res.success) {
      setCurrentUser(res.user);
      localStorage.setItem('currentUser', JSON.stringify(res.user));
    }
    return res;
  };

  const activate = async (name, otp, password, passcode) => {
    const res = await activateUser(name, otp, password, passcode);
    if (res.success) {
      // Automatically log in the user upon successful activation
      return await login(name, password);
    }
    return res;
  };

  const changePasscode = async (newPasscode) => {
    if (!currentUser) return { success: false, error: "Not logged in" };
    const res = await updateUserPasscode(currentUser.id, newPasscode);
    if (res.success) {
      const updatedUser = { ...currentUser, hasPasscode: true };
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
    return res;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, activate, changePasscode, logout }}>
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
