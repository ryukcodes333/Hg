import React, { createContext, useContext, useEffect, useState } from "react";
import { useGetMe, UserProfile, getGetMeQueryKey } from "@workspace/api-client-react";
import { useLocation } from "wouter";

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("sg_token"));
  const [user, setUser] = useState<UserProfile | null>(null);
  const [, setLocation] = useLocation();

  const { data: me, isLoading, error, refetch } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      enabled: !!token,
      retry: false,
    },
  });

  useEffect(() => {
    if (me) {
      setUser(me);
    }
  }, [me]);

  useEffect(() => {
    if (error) {
      logout();
    }
  }, [error]);

  const login = (newToken: string, newUser: UserProfile) => {
    localStorage.setItem("sg_token", newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("sg_token");
    setToken(null);
    setUser(null);
    setLocation("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading: !!token && isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
