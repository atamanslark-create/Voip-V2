import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useTheme } from '../store';
import { authAPI } from '../api';
import { Moon, Sun } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await authAPI.login(email, password);
      setUser(data.user, data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 hover:bg-[var(--bg-secondary)] rounded-lg"
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-lg bg-[var(--accent)] flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
            V
          </div>
          <h1 className="text-3xl font-bold mb-2">VoIP Management</h1>
          <p className="text-[var(--text-secondary)]">Управление ошибками телефонных линий</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)]"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)]"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--accent)] text-white py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-6 text-[var(--text-secondary)]">
          Demo credentials: admin@example.com / password
        </p>
      </div>
    </div>
  );
}
