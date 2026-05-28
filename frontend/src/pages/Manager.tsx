import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { ticketsAPI, sipLinesAPI } from '../api';
import { Plus, AlertCircle } from 'lucide-react';

export function ManagerPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [lines, setLines] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    sip_line_id: '',
    error_template_id: '',
    title: '',
    description: '',
    priority: 'medium',
  });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [ticketsRes, linesRes] = await Promise.all([
        ticketsAPI.getAll(),
        sipLinesAPI.getAll(),
      ]);
      setTickets(ticketsRes.data);
      setLines(linesRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await ticketsAPI.create(formData);
      setTickets([data, ...tickets]);
      setShowCreateForm(false);
      setFormData({
        sip_line_id: '',
        error_template_id: '',
        title: '',
        description: '',
        priority: 'medium',
      });
      // Play notification sound
      playNotificationSound();
    } catch (error) {
      console.error('Failed to create ticket:', error);
    }
  };

  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQoGAAAAAA==');
    audio.play().catch(() => {});
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-[var(--text-secondary)]">Loading...</div>
        </div>
      </Layout>
    );
  }

  const activeTickets = tickets.filter(t => t.status !== 'closed');

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Manager Panel</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 bg-[var(--accent)] text-white px-4 py-2 rounded-lg hover:opacity-90"
          >
            <Plus size={18} />
            Create Error
          </button>
        </div>

        {showCreateForm && (
          <div className="bg-[var(--bg-secondary)] p-6 rounded-lg border border-[var(--border)]">
            <h2 className="text-lg font-semibold mb-4">Create New Error Ticket</h2>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">SIP Line</label>
                  <select
                    value={formData.sip_line_id}
                    onChange={(e) => setFormData({ ...formData, sip_line_id: e.target.value })}
                    className="w-full"
                    required
                  >
                    <option value="">Select a line...</option>
                    {lines.map((line) => (
                      <option key={line.id} value={line.id}>
                        {line.name} (+{line.number})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full"
                  placeholder="Brief description"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full h-24 resize-none"
                  placeholder="Detailed description of the issue"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-[var(--accent)] text-white px-4 py-2 rounded-lg hover:opacity-90"
                >
                  Create Ticket
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 rounded-lg hover:bg-[var(--border)]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid gap-4">
          <h2 className="text-xl font-semibold">Active Tickets ({activeTickets.length})</h2>
          {activeTickets.length === 0 ? (
            <div className="text-center py-8 text-[var(--text-secondary)]">
              No active tickets
            </div>
          ) : (
            activeTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-[var(--bg-secondary)] p-4 rounded-lg border border-[var(--border)]"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">{ticket.sip_line_name} - {ticket.title}</h3>
                    <p className="text-[var(--text-secondary)] text-sm">
                      {ticket.sip_line_number && `+${ticket.sip_line_number}`}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                    ticket.priority === 'critical'
                      ? 'bg-red-500'
                      : ticket.priority === 'high'
                      ? 'bg-orange-500'
                      : ticket.priority === 'medium'
                      ? 'bg-yellow-500'
                      : 'bg-blue-500'
                  }`}>
                    {ticket.priority.toUpperCase()}
                  </span>
                </div>

                <p className="text-[var(--text-secondary)] mb-3">{ticket.description}</p>

                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                    ticket.status === 'new'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    <AlertCircle size={14} />
                    {ticket.status.toUpperCase()}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)]">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
