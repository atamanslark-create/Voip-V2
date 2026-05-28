import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { statisticsAPI } from '../api';
import { BarChart3, Phone, AlertCircle, CheckCircle } from 'lucide-react';

export function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await statisticsAPI.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

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
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Phone size={24} />}
            label="Active Lines"
            value={stats?.active_lines || 0}
            total={stats?.total_lines || 0}
            color="bg-blue-500"
          />
          <StatCard
            icon={<AlertCircle size={24} />}
            label="Total Tickets"
            value={stats?.total_tickets || 0}
            color="bg-orange-500"
          />
          <StatCard
            icon={<CheckCircle size={24} />}
            label="Completed"
            value={stats?.completed_tickets || 0}
            color="bg-green-500"
          />
          <StatCard
            icon={<BarChart3 size={24} />}
            label="Avg Resolution Time"
            value={`${Math.round((stats?.average_resolution_time || 0) / 3600)}h`}
            color="bg-purple-500"
          />
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--bg-secondary)] p-6 rounded-lg border border-[var(--border)]">
              <h2 className="text-lg font-semibold mb-4">Tickets by Status</h2>
              <div className="space-y-2">
                {Object.entries(stats.tickets_by_status).map(([status, count]: [string, any]) => (
                  <div key={status} className="flex justify-between items-center">
                    <span className="capitalize text-[var(--text-secondary)]">{status}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[var(--bg-secondary)] p-6 rounded-lg border border-[var(--border)]">
              <h2 className="text-lg font-semibold mb-4">Tickets by Priority</h2>
              <div className="space-y-2">
                {Object.entries(stats.tickets_by_priority).map(([priority, count]: [string, any]) => (
                  <div key={priority} className="flex justify-between items-center">
                    <span className="capitalize text-[var(--text-secondary)]">{priority}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

function StatCard({ icon, label, value, total, color }: any) {
  return (
    <div className="bg-[var(--bg-secondary)] p-6 rounded-lg border border-[var(--border)]">
      <div className="flex items-center justify-between mb-4">
        <div className={`${color} text-white p-3 rounded-lg`}>
          {icon}
        </div>
        {total && (
          <span className="text-xs text-[var(--text-secondary)]">of {total}</span>
        )}
      </div>
      <h3 className="text-[var(--text-secondary)] text-sm mb-1">{label}</h3>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
