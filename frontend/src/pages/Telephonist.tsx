import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { ticketsAPI, sipLinesAPI } from '../api';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../store';

export function TelephonistPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [lines, setLines] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [ticketsRes, linesRes] = await Promise.all([
        ticketsAPI.getAll({ status: 'new,in_progress' }),
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

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      const { data } = await ticketsAPI.update(ticketId, {
        status: newStatus,
        assigned_to_id: user?.id,
      });

      setTickets(tickets.map(t => t.id === ticketId ? data : t));
      setSelectedTicket(null);

      // Play success notification
      playNotificationSound('success');
    } catch (error) {
      console.error('Failed to update ticket:', error);
      playNotificationSound('error');
    }
  };

  const playNotificationSound = (type: 'success' | 'error') => {
    const audioData = type === 'success'
      ? 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQoGAAAAAA=='
      : 'data:audio/wav;base64,UklGRiYGAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIGAAAA/v8=';
    const audio = new Audio(audioData);
    audio.play().catch(() => {});
  };

  const myLines = lines.filter(l => user?.assigned_lines?.includes(l.id));
  const assignedTickets = tickets.filter(t => myLines.some(l => l.id === t.sip_line_id));

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-[var(--text-secondary)]">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="grid grid-cols-3 gap-6 h-full">
        {/* Assigned Lines */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">📱 My Lines ({myLines.length})</h2>
          <div className="space-y-2">
            {myLines.map((line) => (
              <div
                key={line.id}
                className="bg-[var(--bg-secondary)] p-3 rounded-lg border-l-4 border-[var(--accent)]"
              >
                <h3 className="font-semibold">{line.name}</h3>
                <p className="text-xs text-[var(--text-secondary)]">+{line.number}</p>
                <div className="mt-2 w-8 h-2 rounded-full" style={{ backgroundColor: line.color }} />
              </div>
            ))}
          </div>
        </div>

        {/* Tickets List */}
        <div className="space-y-4 overflow-y-auto">
          <h2 className="text-lg font-semibold">🎫 Tickets ({assignedTickets.length})</h2>
          <div className="space-y-2">
            {assignedTickets.length === 0 ? (
              <div className="text-center py-8 text-[var(--text-secondary)]">
                No pending tickets
              </div>
            ) : (
              assignedTickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedTicket?.id === ticket.id
                      ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                      : 'bg-[var(--bg-secondary)] border-[var(--border)] hover:border-[var(--accent)]'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="mt-1" />
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{ticket.title}</p>
                      <p className="text-xs opacity-75">{ticket.sip_line_name}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Ticket Details */}
        <div className="space-y-4 overflow-y-auto">
          {selectedTicket ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">📋 Details</h2>

              <div className="bg-[var(--bg-secondary)] p-4 rounded-lg border border-[var(--border)] space-y-4">
                <div>
                  <label className="text-xs text-[var(--text-secondary)]">SIP Line</label>
                  <p className="font-semibold">{selectedTicket.sip_line_name}</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    +{selectedTicket.sip_line_number}
                  </p>
                </div>

                <div>
                  <label className="text-xs text-[var(--text-secondary)]">Error Type</label>
                  <p className="font-semibold">{selectedTicket.error_name}</p>
                </div>

                <div>
                  <label className="text-xs text-[var(--text-secondary)]">Title</label>
                  <p className="font-semibold">{selectedTicket.title}</p>
                </div>

                <div>
                  <label className="text-xs text-[var(--text-secondary)]">Description</label>
                  <p className="text-sm">{selectedTicket.description || 'No description'}</p>
                </div>

                <div className="flex gap-2">
                  <div>
                    <label className="text-xs text-[var(--text-secondary)]">Status</label>
                    <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-[var(--accent)] text-white">
                      {selectedTicket.status.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--text-secondary)]">Priority</label>
                    <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-orange-500 text-white">
                      {selectedTicket.priority.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--border)] space-y-2">
                  {selectedTicket.status === 'new' && (
                    <button
                      onClick={() => handleStatusChange(selectedTicket.id, 'in_progress')}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition-colors"
                    >
                      Start Working
                    </button>
                  )}

                  {selectedTicket.status === 'in_progress' && (
                    <button
                      onClick={() => handleStatusChange(selectedTicket.id, 'completed')}
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} />
                      Mark Completed
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="w-full bg-[var(--border)] hover:bg-[var(--border)] py-2 rounded-lg font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-[var(--text-secondary)]">
              Select a ticket to view details
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
