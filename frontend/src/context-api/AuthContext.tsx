'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getProfile } from '@/services/auth';
import Navigation from '@/components/Navigation';

interface User {
  id: string;
  username: string;
  // add more fields as needed
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const publicRoutes = ['/auth/login', '/auth/register', '/'];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      if (!publicRoutes.includes(pathname)) {
        router.replace('/auth/login');
      }
      setLoading(false);
      return;
    }

    getProfile(token)
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem('token');
        if (!publicRoutes.includes(pathname)) {
          router.replace('/auth/login');
        }
        setLoading(false);
      });
  }, [pathname]);

  if (loading) return <div>Loading...</div>;

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {user ? (
        <Navigation>
          {children}
        </Navigation>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
