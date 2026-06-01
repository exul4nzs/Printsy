'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package,
  DollarSign,
  Clock,
  Loader2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { fetchAdminStats } from '@/lib/api';
import { AdminStats, Order } from '@/types';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  paid: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  ready: 'bg-emerald-100 text-emerald-800',
  shipped: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize',
        STATUS_COLORS[status] || 'bg-warm-gray-100 text-warm-gray-800',
      )}
    >
      {status}
    </span>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchAdminStats();
        setStats(data);
      } catch (err: any) {
        console.error('Failed to fetch admin stats:', err);
        setError(err?.response?.data?.error || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-accent animate-spin mr-3" />
        <span className="text-warm-gray-600">Loading dashboard…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      label: 'Total Orders',
      value: stats.total_orders,
      icon: Package,
      color: 'bg-accent/10 text-accent',
      sub: 'All time',
    },
    {
      label: 'Total Revenue',
      value: formatPrice(stats.total_revenue),
      icon: DollarSign,
      color: 'bg-emerald-100 text-emerald-600',
      sub: 'Paid orders',
    },
    {
      label: 'Pending',
      value: stats.by_status['pending'] || 0,
      icon: Clock,
      color: 'bg-amber-100 text-amber-600',
      sub: 'Awaiting action',
    },
    {
      label: 'Processing',
      value: stats.by_status['processing'] || 0,
      icon: TrendingUp,
      color: 'bg-indigo-100 text-indigo-600',
      sub: 'In progress',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-warm-gray-900">Dashboard</h1>
        <p className="text-warm-gray-500 mt-1">Overview of your print shop</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-warm-gray-500 font-medium">{card.label}</p>
                  <p className="text-3xl font-bold text-warm-gray-900 mt-1">{card.value}</p>
                  <p className="text-xs text-warm-gray-400 mt-1">{card.sub}</p>
                </div>
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', card.color)}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Status breakdown */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-warm-gray-900 mb-4">Orders by Status</h2>
        <div className="flex flex-wrap gap-3">
          {Object.entries(stats.by_status).map(([status, count]) => (
            <div
              key={status}
              className="flex items-center gap-2 px-3 py-2 bg-warm-gray-50 rounded-xl"
            >
              <StatusBadge status={status} />
              <span className="font-bold text-warm-gray-900">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent orders */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-warm-gray-900">Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="text-sm text-accent hover:text-accent-600 font-medium flex items-center gap-1"
          >
            View all
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats.recent_orders.length === 0 ? (
          <p className="text-warm-gray-500 text-sm py-8 text-center">
            No orders yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-warm-gray-200">
                  <th className="text-left py-3 px-2 font-semibold text-warm-gray-600">Order</th>
                  <th className="text-left py-3 px-2 font-semibold text-warm-gray-600">Customer</th>
                  <th className="text-left py-3 px-2 font-semibold text-warm-gray-600">Total</th>
                  <th className="text-left py-3 px-2 font-semibold text-warm-gray-600">Status</th>
                  <th className="text-left py-3 px-2 font-semibold text-warm-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_orders.map((order: Order) => (
                  <tr key={order.id} className="border-b border-warm-gray-100 last:border-0">
                    <td className="py-3 px-2 font-mono text-xs text-warm-gray-900">
                      #{order.order_number || order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="py-3 px-2 text-warm-gray-900">{order.customer_name || '—'}</td>
                    <td className="py-3 px-2 font-medium text-warm-gray-900">
                      {formatPrice(Number(order.total_amount))}
                    </td>
                    <td className="py-3 px-2">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-3 px-2 text-warm-gray-500 text-xs whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString('en-PH', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
