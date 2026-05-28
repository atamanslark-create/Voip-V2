import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'manager' | 'telephonist';
  assigned_lines: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
  token: localStorage.getItem('token'),
  setUser: (user: User, token: string) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
}

export const useTheme = create<ThemeState>((set) => {
  const isDark = localStorage.getItem('theme') === 'dark' || false;
  if (isDark) document.documentElement.classList.add('dark');

  return {
    isDark,
    toggleTheme: () => {
      set((state) => {
        const newIsDark = !state.isDark;
        localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
        if (newIsDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { isDark: newIsDark };
      });
    },
  };
});
