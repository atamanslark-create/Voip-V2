import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { usersAPI, sipLinesAPI } from '../api';
import { Plus, Trash2, Edit2 } from 'lucide-react';

export function AdminPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState<any[]>([]);
  const [lines, setLines] = useState<any[]>([]);
  const [tab, setTab] = useState('users');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [tab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (tab === 'users') {
        const { data } = await usersAPI.getAll();
        setUsers(data);
      } else if (tab === 'lines') {
        const { data } = await sipLinesAPI.getAll();
        setLines(data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await usersAPI.delete(id);
        setUsers(users.filter(u => u.id !== id));
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const handleDeleteLine = async (id: string) => {
    if (confirm('Are you sure you want to delete this SIP line?')) {
      try {
        await sipLinesAPI.delete(id);
        setLines(lines.filter(l => l.id !== id));
      } catch (error) {
        console.error('Failed to delete line:', error);
      }
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <button
            onClick={() => navigate(tab === 'users' ? '/admin/users/new' : '/admin/lines/new')}
            className="flex items-center gap-2 bg-[var(--accent)] text-white px-4 py-2 rounded-lg hover:opacity-90"
          >
            <Plus size={18} />
            Add {tab === 'users' ? 'User' : 'Line'}
          </button>
        </div>

        <div className="flex gap-4 border-b border-[var(--border)]">
          <button
            onClick={() => setTab('users')}
            className={`px-4 py-2 font-medium ${
              tab === 'users'
                ? 'border-b-2 border-[var(--accent)]'
                : 'text-[var(--text-secondary)]'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setTab('lines')}
            className={`px-4 py-2 font-medium ${
              tab === 'lines'
                ? 'border-b-2 border-[var(--accent)]'
                : 'text-[var(--text-secondary)]'
            }`}
          >
            SIP Lines
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-[var(--text-secondary)]">Loading...</div>
        ) : tab === 'users' ? (
          <div className="bg-[var(--bg-secondary)] rounded-lg overflow-hidden border border-[var(--border)]">
            <table className="w-full">
              <thead className="bg-[var(--border)]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-[var(--border)] transition-colors">
                    <td className="px-6 py-4">{user.full_name}</td>
                    <td className="px-6 py-4 text-[var(--text-secondary)]">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-[var(--accent)] text-white rounded-full text-xs font-semibold">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.is_active ? (
                        <span className="text-green-600">Active</span>
                      ) : (
                        <span className="text-red-600">Inactive</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right flex gap-2 justify-end">
                      <button
                        onClick={() => navigate(`/admin/users/${user.id}`)}
                        className="p-2 hover:bg-[var(--border)] rounded-lg transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-4">
            {lines.map((line) => (
              <div
                key={line.id}
                className="bg-[var(--bg-secondary)] p-4 rounded-lg border border-[var(--border)] flex justify-between items-center"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: line.color }}
                  />
                  <div>
                    <h3 className="font-semibold">{line.name}</h3>
                    <p className="text-[var(--text-secondary)] text-sm">+{line.number}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/admin/lines/${line.id}`)}
                    className="p-2 hover:bg-[var(--border)] rounded-lg transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteLine(line.id)}
                    className="p-2 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
