import { useNavigate } from 'react-router-dom';
import { useAuth, useTheme } from '../store';
import { Menu, Moon, Sun, LogOut } from 'lucide-react';
import { useState } from 'react';

export function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    if (!user) return [];

    const common = [{ label: 'Dashboard', href: '/dashboard' }];

    if (user.role === 'admin') {
      return [
        ...common,
        { label: 'Users', href: '/admin/users' },
        { label: 'SIP Lines', href: '/admin/lines' },
        { label: 'Error Templates', href: '/admin/templates' },
        { label: 'Tickets', href: '/admin/tickets' },
      ];
    }

    if (user.role === 'manager') {
      return [
        ...common,
        { label: 'Create Error', href: '/manager/create-error' },
        { label: 'Tickets', href: '/manager/tickets' },
        { label: 'Statistics', href: '/manager/stats' },
      ];
    }

    if (user.role === 'telephonist') {
      return [
        ...common,
        { label: 'My Lines', href: '/telephonist/lines' },
        { label: 'Tickets', href: '/telephonist/tickets' },
      ];
    }

    return common;
  };

  const navItems = getNavItems();

  return (
    <div className="flex h-screen bg-[var(--bg-primary)]">
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-[var(--bg-secondary)] border-r border-[var(--border)] transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center text-white font-bold">
            V
          </div>
          {sidebarOpen && <span className="font-bold">VoIP</span>}
        </div>

        <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block px-4 py-2 rounded-lg hover:bg-[var(--border)] transition-colors"
            >
              {sidebarOpen ? item.label : item.label.charAt(0)}
            </a>
          ))}
        </nav>

        <div className="p-4 border-t border-[var(--border)]">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg hover:bg-[var(--border)] transition-colors"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-[var(--bg-secondary)] border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-[var(--border)] rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-4">
            <span className="text-sm text-[var(--text-secondary)]">{user?.full_name}</span>
            <span className="text-xs px-2 py-1 rounded bg-[var(--accent)] text-white">
              {user?.role.toUpperCase()}
            </span>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-[var(--border)] rounded-lg transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
